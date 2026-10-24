"""
SPARC AI - Vercel Serverless API Interface
Exposes FastAPI REST endpoints connecting to the Scikit-Learn Agronomic Engine.
"""

import os
import sys
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# Ensure root directory is in sys.path for Vercel Serverless environment
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import backend
from backend import (
    engine_instance,
    SUPPORTED_CROPS,
    CROP_AGRONOMIC_PROFILES,
    get_indian_soil_states,
    get_state_soil_profile,
    get_state_crop_fertilizer_package,
    search_crop_diseases,
    evaluate_disease_outbreak_risk,
    get_all_disease_crops,
    calculate_fertilizers
)

app = FastAPI(
    title="SPARC AgrisenseAI API",
    description="Precision AI Crop Intelligence & Agronomic Recommendation Engine",
    version="2.0.0"
)

# Enable CORS for public frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Export ASGI handler for Vercel
handler = app

# ─────────────────────────────────────────────────────────────────────────────
# PYDANTIC SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────
class CropPredictionRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, le=300, description="Soil Nitrogen (N) in kg/ha")
    phosphorus: float = Field(..., ge=0, le=250, description="Soil Phosphorus (P) in kg/ha")
    potassium: float = Field(..., ge=0, le=400, description="Soil Potassium (K) in kg/ha")
    temperature: float = Field(..., ge=-10, le=60, description="Ambient Temperature in °C")
    humidity: float = Field(..., ge=0, le=100, description="Relative Humidity %")
    ph: float = Field(..., ge=1, le=14, description="Soil pH Level")
    rainfall: float = Field(..., ge=0, le=2500, description="Annual/Seasonal Rainfall in mm")
    top_k: int = Field(3, ge=1, le=10)

class FertilizerRequest(BaseModel):
    nitrogen: float = Field(..., ge=0)
    phosphorus: float = Field(..., ge=0)
    potassium: float = Field(..., ge=0)
    ph: float = Field(7.0, ge=1, le=14)
    target_crop: str
    state: Optional[str] = None

# ─────────────────────────────────────────────────────────────────────────────
# API ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "engine": "SPARC Precision AI Agronomy System",
        "supported_crops_count": len(SUPPORTED_CROPS),
        "model_loaded": engine_instance.model is not None
    }

@app.get("/api/crops")
def list_crops():
    return {
        "count": len(SUPPORTED_CROPS),
        "crops": sorted(SUPPORTED_CROPS),
        "disease_crops": sorted(get_all_disease_crops())
    }

@app.post("/api/predict")
def predict_crop(req: CropPredictionRequest):
    try:
        raw_predictions = engine_instance.predict_top_crops(
            nitrogen=req.nitrogen,
            phosphorus=req.phosphorus,
            potassium=req.potassium,
            rainfall=req.rainfall,
            temperature=req.temperature,
            top_k=req.top_k
        )

        detailed_results = []
        for rank, (crop_name, confidence) in enumerate(raw_predictions, start=1):
            crop_key = crop_name.lower().strip()
            profile = CROP_AGRONOMIC_PROFILES.get(crop_key, {
                "cycle_days": "100 - 130 days",
                "water_demand": "Moderate",
                "soil_type": "Loamy to sandy loam",
                "benefits": ["Highly adaptable regional commercial crop"],
                "economic_outlook": "Stable regional market demand"
            })

            # Run target diagnostic on this crop
            diag = engine_instance.diagnose_target_crop(
                target_crop=crop_key,
                n=req.nitrogen,
                p=req.phosphorus,
                k=req.potassium,
                temperature=req.temperature,
                rainfall=req.rainfall,
                humidity=req.humidity,
                ph=req.ph
            )

            # Outbreak risk for this crop under provided temp/humidity
            disease_risks = evaluate_disease_outbreak_risk(crop_key, req.temperature, req.humidity)

            detailed_results.append({
                "rank": rank,
                "crop": crop_name,
                "confidence": round(confidence, 1),
                "profile": profile,
                "risk_level": diag.get("risk_level", "LOW RISK"),
                "compatibility_score": diag.get("compatibility_score", 95),
                "issues": diag.get("issues", []),
                "rescue_roadmap": diag.get("rescue_roadmap", []),
                "summary": diag.get("summary", ""),
                "disease_risks": disease_risks
            })

        return {
            "success": True,
            "inputs": req.dict(),
            "recommendations": detailed_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.post("/api/fertilizer")
def get_fertilizer_prescription(req: FertilizerRequest):
    try:
        crop_clean = req.target_crop.lower().strip()
        calc = calculate_fertilizers(
            nitrogen=req.nitrogen,
            phosphorus=req.phosphorus,
            potassium=req.potassium,
            ph=req.ph,
            target_crop=crop_clean
        )

        # Parse commercial doses in kg/ha
        # 1 acre = 0.4047 hectare => dose_kg_ha = dose_kg_acre * 2.471
        urea_kg = 0.0
        dap_kg = 0.0
        mop_kg = 0.0
        app_schedule = []

        for p in calc.get("prescriptions", []):
            fert = p.get("fertilizer", "")
            dose_acre = p.get("dose_kg_acre", 0.0)
            dose_ha = dose_acre * 2.47105
            timing = p.get("application_timing", "")

            if "Urea" in fert:
                urea_kg = dose_ha
            elif "DAP" in fert or "Diammonium" in fert:
                dap_kg = dose_ha
            elif "MOP" in fert or "Potash" in fert:
                mop_kg = dose_ha

            app_schedule.append({
                "stage": fert,
                "dose_kg_ha": round(dose_ha, 1),
                "dose_kg_acre": round(dose_acre, 1),
                "timing": timing,
                "role": p.get("role", "")
            })

        commercial_doses = {
            "urea_kg": round(urea_kg, 1),
            "dap_kg": round(dap_kg, 1),
            "mop_kg": round(mop_kg, 1)
        }

        calc["commercial_doses"] = commercial_doses
        calc["application_schedule"] = app_schedule

        state_package = None
        if req.state:
            state_package = get_state_crop_fertilizer_package(req.state, crop_clean)

        return {
            "success": True,
            "target_crop": req.target_crop,
            "inputs": req.dict(),
            "prescription": calc,
            "state_package": state_package
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fertilizer calculation error: {str(e)}")

@app.get("/api/diseases")
def search_diseases(
    crop: Optional[str] = Query(None, description="Crop name"),
    keyword: Optional[str] = Query(None, description="Symptom keyword"),
    temperature: Optional[float] = Query(None),
    humidity: Optional[float] = Query(None)
):
    try:
        results = search_crop_diseases(crop_name=crop, keyword=keyword)
        outbreak_risk = []
        if crop and temperature is not None and humidity is not None:
            outbreak_risk = evaluate_disease_outbreak_risk(crop.lower().strip(), temperature, humidity)

        return {
            "success": True,
            "crop": crop,
            "count": len(results),
            "diseases": results,
            "outbreak_risk": outbreak_risk
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Disease doctor error: {str(e)}")

@app.get("/api/soil-states")
def list_soil_states():
    states = get_indian_soil_states()
    return {"states": states}

@app.get("/api/soil-profile")
def state_soil_profile(state: str = Query(..., description="Indian State name")):
    profile = get_state_soil_profile(state)
    if not profile:
        raise HTTPException(status_code=404, detail="State soil profile not found")
    return {"success": True, "state": state, "profile": profile}

@app.get("/api/weather")
def get_weather(query: str = Query("New Delhi", description="City name or query")):
    telemetry = engine_instance.fetch_live_weather(query)
    return {"success": True, "telemetry": telemetry}

# Mount static frontend for local development
public_dir = os.path.join(ROOT_DIR, "public")
if os.path.exists(public_dir):
    app.mount("/", StaticFiles(directory=public_dir, html=True), name="static")
