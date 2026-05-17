# FailSafe

FailSafe is a student risk-detection tool that identifies at-risk students using an XGBoost model and SHAP explanations. It provides a simple faculty upload interface, a separate HOD dashboard, and AI-generated intervention suggestions based on top risk factors.

## Features

- Predicts whether each student is at risk of failing
- Uses SHAP to explain the top features driving each prediction
- Generates targeted intervention suggestions via SarvamAI
- Includes a faculty-facing upload interface and a dashboard for HOD review

## Repository structure

- `app.py` — FastAPI backend serving prediction and intervention endpoints
- `model.py` — training script for building `model.pkl` and `explainer.pkl`
- `index.html` — faculty view for uploading student CSVs and reviewing results
- `dashboard.html` — HOD dashboard summarizing at-risk students and factor counts
- `README.md` — this file

## Requirements

- Python 3.x
- `fastapi`
- `uvicorn`
- `pandas`
- `scikit-learn`
- `xgboost`
- `shap`
- `python-dotenv`
- `sarvamai`

## Setup

1. Install dependencies:

```bash
pip install fastapi uvicorn pandas scikit-learn xgboost shap python-dotenv sarvamai
```

2. Create a `.env` file in the project folder with your SarvamAI key:

```env
SARVAM_API_KEY=your_api_key_here
```

3. Train the model and build runtime artifacts:

```bash
python model.py
```

This creates `model.pkl` and `explainer.pkl` from the student dataset.

## Running the app

1. Start the backend:

```bash
uvicorn app:app --reload
```

2. Open `index.html` in your browser.
3. Upload a CSV with the required student feature columns.

## Required CSV columns

The uploaded file must include the following columns exactly:

- `age`
- `studytime`
- `failures`
- `absences`
- `G1`
- `G2`
- `famrel`
- `freetime`
- `goout`
- `Dalc`
- `Walc`
- `health`

## How it works

- `model.py` trains an `XGBClassifier` to predict whether a student is at risk of failing.
- `app.py` loads the saved model and a SHAP explainer.
- `index.html` uploads a CSV to `POST /predict`, then displays student risk and top factors.
- The HOD dashboard in `dashboard.html` reads the results from browser `localStorage` and shows summary metrics.
- `POST /intervene` uses SarvamAI to generate a short intervention plan for at-risk students.

## API endpoints

- `POST /predict` — accepts a CSV file upload and returns risk predictions, top factors, and student row data.
- `POST /intervene` — accepts JSON with `student_data` and `risk_factors`, returns a generated intervention message.

## Notes

- The current backend verifies exact required column names before predicting.
- Dashboard data is stored locally in the browser, so the HOD view works after a faculty upload.
- The column mapping logic in `app.py` is present but not currently used by the `predict` endpoint.

## Improvements

Possible next steps:

- add a sample CSV dataset
- improve column mapping and upload validation
- serve the HTML pages from the backend instead of opening them directly
- add authentication for HOD and faculty access
