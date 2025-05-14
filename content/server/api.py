"""
API server to:
- Provide a prediction endpoint for flight delay chance and confidence, given day of week and airport ID.
- Provide an endpoint to return all airport names and IDs, sorted alphabetically.
All responses are JSON.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and airport data at startup
model = joblib.load("../flight_delay_model.joblib")
airports_df = pd.read_csv("../airport_ids.csv")
airport_list = airports_df.sort_values("OriginAirportName")[["OriginAirportID", "OriginAirportName"]].to_dict(orient="records")

class PredictionRequest(BaseModel):
    day_of_week: int
    origin_airport_id: int

@app.get("/airports")
def get_airports():
    """Return sorted list of airport names and IDs."""
    return {"airports": airport_list}

@app.post("/predict")
def predict_delay(request: PredictionRequest):
    """Return delay chance and confidence for given day and airport."""
    # Prepare input for model (one-hot encoding)
    input_df = pd.DataFrame([{
        "DayOfWeek": request.day_of_week,
        "OriginAirportID": request.origin_airport_id
    }])
    input_encoded = pd.get_dummies(input_df, columns=["OriginAirportID"])
    # Align columns with model input
    for col in model.feature_names_in_:
        if col not in input_encoded.columns:
            input_encoded[col] = 0
    input_encoded = input_encoded[model.feature_names_in_]
    proba = model.predict_proba(input_encoded)[0]
    prediction = int(proba[1] >= 0.5)
    confidence = float(proba[1]) if prediction == 1 else float(proba[0])
    return {
        "delayed": bool(prediction),
        "chance_percent": round(100 * proba[1], 2),
        "confidence_percent": round(100 * confidence, 2)
    }