from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import pandas as pd
import pickle
import io
import os
import json
import jwt
from datetime import datetime, timedelta
from sarvamai import SarvamAI
from dotenv import load_dotenv
from database import SessionLocal, Student, Upload, Intervention, User, init_db, seed_users
from passlib.hash import bcrypt

load_dotenv()

client = SarvamAI(api_subscription_key=os.getenv("SARVAM_API_KEY"))
SECRET_KEY = "failsafe-secret-key"
security = HTTPBearer()

init_db()
seed_users()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_token(email: str, role: str):
    payload = {
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=8)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/login")
def login(data: dict):
    db = SessionLocal()
    user = db.query(User).filter(User.email == data.get("email")).first()
    db.close()
    if not user or not bcrypt.verify(data.get("password"), user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user.email, user.role)
    return {"token": token, "role": user.role}

with open("model.pkl", "rb") as f:
    model = pickle.load(f)

with open("explainer.pkl", "rb") as f:
    explainer = pickle.load(f)

REQUIRED_FEATURES = ["age", "studytime", "failures", "absences", "G1", "famrel", "freetime", "goout", "Dalc", "Walc", "health"]

def map_columns(uploaded_columns):
    prompt = f"""
    I have a student dataset with these columns:
    {uploaded_columns}

    I need to map them to these required column names:
    {REQUIRED_FEATURES}

    Return ONLY a valid JSON object where keys are the required column names and values are the matching uploaded column names.
    If a required column has no match, set its value to null.
    No explanation, no markdown, just the JSON object.
    """
    response = client.chat.completions(
        messages=[{"role": "user", "content": prompt}],
        model="sarvam-105b",
        max_tokens=500
    )
    text = response.choices[0].message.content
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())

def generate_intervention(student_data, risk_factors):
    factors_text = "\n".join([f"- {f}: impact score {round(v, 3)}" for f, v in risk_factors])
    prompt = f"""
    You are an academic counsellor. A student has been flagged as at-risk of failing.

    Their profile:
    - Age: {student_data.get('age')}
    - Study time per week: {student_data.get('studytime')} (1=<2hrs, 4=>10hrs)
    - Past failures: {student_data.get('failures')}
    - Absences: {student_data.get('absences')}
    - First term grade: {student_data.get('G1')}/20
    - Family relationship quality: {student_data.get('famrel')}/5
    - Weekend alcohol use: {student_data.get('Walc')}/5
    - Daily alcohol use: {student_data.get('Dalc')}/5
    - Health status: {student_data.get('health')}/5

    Top risk factors driving this prediction:
    {factors_text}

    Write a personalised intervention plan in exactly 2-3 sentences. 
    Do not exceed 3 sentences under any circumstances. 
    Be specific and actionable. Address the actual risk factors. 
    Do not use bullet points. Do not start with "This student".
    """
    response = client.chat.completions(
        messages=[{"role": "user", "content": prompt}],
        model="sarvam-105b"
    )
    print("Full response:", response)
    print("Content:", response.choices[0].message.content)

    text = response.choices[0].message.content
    if not text:
        reasoning = response.choices[0].message.reasoning_content
        lines = [l.strip() for l in reasoning.split('\n') if len(l.strip()) > 100]
        text = lines[-1] if lines else None
        
    if "<tool_call>" in text:
        text = text.split("<tool_call>")[-1]
    return text.strip()


@app.post("/predict")
async def predict(file: UploadFile = File(...), user=Depends(verify_token)):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    uploaded_columns = df.columns.tolist()
    missing = [f for f in REQUIRED_FEATURES if f not in uploaded_columns]
    if missing:
        return {"error": f"Could not find these required columns: {missing}"}

    X = df[REQUIRED_FEATURES]
    predictions = model.predict(X)
    shap_values = explainer(X)

    db = SessionLocal()

    # Wipe previous data
    db.query(Intervention).delete()
    db.query(Student).delete()
    db.query(Upload).delete()
    db.commit()

    at_risk_count = sum(1 for p in predictions if p)
    upload = Upload(total_students=len(df), at_risk_count=at_risk_count)
    db.add(upload)
    db.commit()
    db.refresh(upload)

    results = []
    for i in range(len(df)):
        at_risk = bool(predictions[i])
        student_shap = shap_values[i].values
        all_factors = sorted(zip(REQUIRED_FEATURES, student_shap), key=lambda x: x[1], reverse=True)
        risk_factors = [(f, v) for f, v in all_factors if v > 0]
        top_factors = risk_factors[:3]

        top_factors_json = [{"factor": f, "impact": round(float(v), 3)} for f, v in top_factors]
        row_data = df.iloc[i][REQUIRED_FEATURES].to_dict()

        student = Student(
            upload_id=upload.id,
            student_index=i + 1,
            at_risk=at_risk,
            top_factors=top_factors_json,
            row_data=row_data
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        results.append({
            "student_index": i + 1,
            "at_risk": at_risk,
            "top_factors": top_factors_json,
            "intervention": None,
            "row_data": row_data,
            "student_id": student.id
        })

    db.close()
    return {"results": results}

@app.post("/intervene")
async def intervene(data: dict, user=Depends(verify_token)):
    student_id = data.get("student_id")
    student_data = data.get("student_data")
    risk_factors = data.get("risk_factors")

    db = SessionLocal()

    # Check if intervention already exists
    existing = db.query(Intervention).filter(Intervention.student_id == student_id).first()
    if existing:
        db.close()
        return {"intervention": existing.content}

    # Generate new intervention
    risk_factors_tuples = [(f["factor"], f["impact"]) for f in risk_factors]
    intervention_text = generate_intervention(student_data, risk_factors_tuples)

    # Save to database
    intervention = Intervention(student_id=student_id, content=intervention_text)
    db.add(intervention)
    db.commit()
    db.close()

    return {"intervention": intervention_text}

@app.get("/results")
def get_results(user=Depends(verify_token)):
    if user["role"] != "hod":
        raise HTTPException(status_code=403, detail="HODs only")
    
    db = SessionLocal()
    upload = db.query(Upload).order_by(Upload.uploaded_at.desc()).first()
    if not upload:
        db.close()
        return {"results": []}

    students = db.query(Student).filter(Student.upload_id == upload.id).all()
    results = []
    for s in students:
        intervention = db.query(Intervention).filter(Intervention.student_id == s.id).first()
        results.append({
            "student_index": s.student_index,
            "at_risk": s.at_risk,
            "top_factors": s.top_factors,
            "row_data": s.row_data,
            "student_id": s.id,
            "intervention": intervention.content if intervention else None
        })

    db.close()
    return {"results": results}