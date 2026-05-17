import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import shap
import pickle

df = pd.read_csv("student-mat.csv", sep=",")

df["at_risk"] = (df["G3"] < 10).astype(int)

features = ["age", "studytime", "failures", "absences", "G1", "G2", "famrel", "freetime", "goout", "Dalc", "Walc", "health"]

X = df[features]
y = df["at_risk"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = XGBClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

preds = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, preds) * 100:.1f}%")

# SHAP - explain why each student is flagged
explainer = shap.Explainer(model)
shap_values = explainer(X_test)

# Save everything
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("explainer.pkl", "wb") as f:
    pickle.dump(explainer, f)

print("Model and explainer saved!")

# Show a summary chart of what factors matter most
shap.summary_plot(shap_values, X_test)