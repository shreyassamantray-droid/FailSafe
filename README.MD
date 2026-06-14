# Failsafe — Student Risk Detection System

Failsafe is a web-based tool that helps faculty identify at-risk students early using machine learning. Upload a student dataset, get instant predictions on who is at risk of failing, understand why through SHAP explanations, and generate personalised intervention plans powered by AI.

## Tech Stack

- **ML:** Python, XGBoost, SHAP, scikit-learn, Pandas
- **Backend:** FastAPI, Uvicorn
- **Frontend:** React, Vite, Recharts
- **AI:** Sarvam AI (sarvam-105b)

## How to Run

### Prerequisites
- Python 3.11+
- Node.js
- A Sarvam AI API key

### 1. Clone the repo
```bash
git clone https://github.com/shreyassamantray-droid/FailSafe.git
cd FailSafe
```

### 2. Set up environment
Create a `.env` file in the root folder:
SARVAM_API_KEY=your_key_here

### 3. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 4. Train the model
```bash
python model.py
```

### 5. Start the backend
```bash
uvicorn app:app --reload
```

### 6. Start the frontend
```bash
cd frontend
npm install
npm run dev
```

### 7. Open the app
Go to the localhost link shown by `npm run dev`.
Upload `student-mat.csv` to get started.