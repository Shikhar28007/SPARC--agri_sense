"""
SPARC AI - Vercel Serverless API Interface
Exposes FastAPI REST endpoints connecting to the Scikit-Learn Agronomic Engine.
Supports dual-prefix routing (both with and without '/api') for 100% Vercel compatibility.
"""

import os
import sys
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# Ensure root directory is in sys.path for Vercel Serverless environment
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi import FastAPI, APIRouter, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

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
    calculate_fertilizers,
    get_past_season_crop_records
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

# Normalize Vercel internal function paths
@app.middleware("http")
async def vercel_path_normalizer(request: Request, call_next):
    # 1. Check if Vercel rewrite passed __path__ parameter
    path_param = request.query_params.get("__path__")
    if path_param:
        clean_path = "/" + path_param.lstrip("/")
        if "?" in clean_path:
            clean_path = clean_path.split("?")[0]
        request.scope["path"] = clean_path
        return await call_next(request)

    # 2. Check Vercel routing headers
    orig_path = request.headers.get("x-matched-path") or request.headers.get("x-invoke-path") or ""
    if orig_path:
        for prefix in ["/api/index.py", "/api/index", "/api", "/index.py"]:
            if orig_path.startswith(prefix):
                orig_path = orig_path[len(prefix):]
                break
        if orig_path and orig_path != "/":
            request.scope["path"] = orig_path if orig_path.startswith("/") else "/" + orig_path
            return await call_next(request)

    raw_path = request.scope.get("path", "")
    for prefix in ["/api/index.py", "/api/index", "/index.py"]:
        if raw_path.startswith(prefix):
            new_path = raw_path[len(prefix):]
            if new_path:
                request.scope["path"] = new_path if new_path.startswith("/") else "/" + new_path
                break
    return await call_next(request)

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
    target_crop: Optional[str] = Field(None, description="The crop the farmer wants to cultivate")

class FertilizerRequest(BaseModel):
    nitrogen: float = Field(..., ge=0)
    phosphorus: float = Field(..., ge=0)
    potassium: float = Field(..., ge=0)
    ph: float = Field(7.0, ge=1, le=14)
    target_crop: str
    state: Optional[str] = None

# ─────────────────────────────────────────────────────────────────────────────
# ROUTER DEFINITION (Dual-mounted at '' and '/api')
# ─────────────────────────────────────────────────────────────────────────────
router = APIRouter()

@router.get("/")
def api_root():
    return {
        "status": "online",
        "engine": "SPARC Precision AI Agronomy System",
        "version": "2.0.0",
        "supported_crops_count": len(SUPPORTED_CROPS)
    }

@router.get("/health")
def health_check():
    return {
        "status": "online",
        "engine": "SPARC Precision AI Agronomy System",
        "supported_crops_count": len(SUPPORTED_CROPS),
        "model_loaded": engine_instance.model is not None
    }

@router.get("/crops")
def list_crops():
    return {
        "count": len(SUPPORTED_CROPS),
        "crops": sorted(SUPPORTED_CROPS),
        "disease_crops": sorted(get_all_disease_crops())
    }

@router.post("/predict")
def predict_crop(req: CropPredictionRequest):
    try:
        raw_predictions = engine_instance.predict_top_crops(
            nitrogen=req.nitrogen,
            phosphorus=req.phosphorus,
            potassium=req.potassium,
            rainfall=req.rainfall,
            temperature=req.temperature,
            top_k=req.top_k,
            humidity=req.humidity,
            ph=req.ph
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

        # Evaluate target crop if farmer selected a crop they plan to cultivate
        target_diag_result = None
        target_crop_key = (req.target_crop or "").lower().strip()
        if target_crop_key:
            target_diag = engine_instance.diagnose_target_crop(
                target_crop=target_crop_key,
                n=req.nitrogen,
                p=req.phosphorus,
                k=req.potassium,
                temperature=req.temperature,
                rainfall=req.rainfall,
                humidity=req.humidity,
                ph=req.ph
            )
            target_disease_risks = evaluate_disease_outbreak_risk(target_crop_key, req.temperature, req.humidity)
            target_profile = CROP_AGRONOMIC_PROFILES.get(target_crop_key, {
                "cycle_days": "100 - 130 days",
                "water_demand": "Moderate",
                "soil_type": "Loamy to sandy loam",
                "benefits": ["Key commercial and regional crop"],
                "economic_outlook": "Stable regional market demand"
            })
            target_diag_result = {
                "crop": target_crop_key.capitalize(),
                "profile": target_profile,
                "risk_level": target_diag.get("risk_level", "LOW RISK"),
                "compatibility_score": target_diag.get("compatibility_score", 95),
                "issues": target_diag.get("issues", []),
                "rescue_roadmap": target_diag.get("rescue_roadmap", []),
                "summary": target_diag.get("summary", ""),
                "disease_risks": target_disease_risks
            }

        return {
            "success": True,
            "inputs": req.dict(),
            "target_diagnosis": target_diag_result,
            "recommendations": detailed_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@router.post("/fertilizer")
@router.post("/fertilizer-calc")
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

        commercial_kg_ha = calc.get("commercial_fertilizers_kg_ha", {})
        urea_kg = float(commercial_kg_ha.get("urea", 0.0))
        dap_kg = float(commercial_kg_ha.get("dap", 0.0))
        mop_kg = float(commercial_kg_ha.get("mop", 0.0))
        app_schedule = []

        for p in calc.get("prescriptions", []):
            fert = p.get("fertilizer", "")
            dose_ha = p.get("dose_kg_ha")
            if dose_ha is None:
                dose_acre = p.get("dose_kg_acre", 0.0)
                dose_ha = dose_acre * 2.47105
            else:
                dose_acre = p.get("dose_kg_acre", round(dose_ha * 0.404686, 1))
            timing = p.get("application_timing", "")

            if "Urea" in fert and urea_kg == 0.0:
                urea_kg = dose_ha
            elif ("DAP" in fert or "Diammonium" in fert) and dap_kg == 0.0:
                dap_kg = dose_ha
            elif ("MOP" in fert or "Potash" in fert) and mop_kg == 0.0:
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

        target_npk = calc.get("target_npk", {})
        deficits = {
            "target_n": round(float(target_npk.get("N", 120.0)), 1),
            "target_p": round(float(target_npk.get("P", 60.0)), 1),
            "target_k": round(float(target_npk.get("K", 40.0)), 1),
            "current_n": req.nitrogen,
            "current_p": req.phosphorus,
            "current_k": req.potassium,
            "n_deficit": float(calc.get("deficits", {}).get("N_deficit", 0.0)),
            "p_deficit": float(calc.get("deficits", {}).get("P_deficit", 0.0)),
            "k_deficit": float(calc.get("deficits", {}).get("K_deficit", 0.0))
        }

        fertilizers_summary = {
            "urea_kg_ha": round(urea_kg, 1),
            "dap_kg_ha": round(dap_kg, 1),
            "mop_kg_ha": round(mop_kg, 1)
        }

        state_package = None
        if req.state:
            state_package = get_state_crop_fertilizer_package(req.state, crop_clean)

        return {
            "success": True,
            "target_crop": req.target_crop,
            "inputs": req.dict(),
            "fertilizers": fertilizers_summary,
            "deficits": deficits,
            "prescription": calc,
            "state_package": state_package
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fertilizer calculation error: {str(e)}")

@router.get("/diseases")
def search_diseases(
    crop: Optional[str] = Query(None, description="Crop name"),
    keyword: Optional[str] = Query(None, description="Symptom keyword"),
    symptom: Optional[str] = Query(None, description="Alternate symptom keyword"),
    q: Optional[str] = Query(None, description="General search query"),
    temperature: Optional[float] = Query(None),
    humidity: Optional[float] = Query(None)
):
    try:
        search_kw = keyword or symptom or q
        if search_kw:
            search_kw = search_kw.strip()
        crop_clean = crop.strip() if crop else None
        results = search_crop_diseases(crop_name=crop_clean, keyword=search_kw)
        outbreak_risk = []
        if crop_clean and temperature is not None and humidity is not None:
            outbreak_risk = evaluate_disease_outbreak_risk(crop_clean.lower(), temperature, humidity)

        return {
            "success": True,
            "crop": crop_clean,
            "count": len(results),
            "diseases": results,
            "outbreak_risk": outbreak_risk
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Disease doctor error: {str(e)}")

@router.get("/soil-states")
def list_soil_states():
    states = get_indian_soil_states()
    return {"states": states}

@router.get("/soil-profile")
def state_soil_profile(state: str = Query(..., description="Indian State name")):
    profile = get_state_soil_profile(state)
    if not profile:
        raise HTTPException(status_code=404, detail="State soil profile not found")
    return {"success": True, "state": state, "profile": profile}

@router.get("/weather")
def get_weather(query: str = Query("New Delhi", description="City name or query")):
    telemetry = engine_instance.fetch_live_weather(query)
    return {"success": True, "telemetry": telemetry}

@router.get("/tts")
def get_tts(text: str = Query(..., description="Text to synthesize"), lang: str = Query("hi", description="ISO language code")):
    try:
        import urllib.request
        import urllib.parse
        clean = text.strip()[:200]
        q = urllib.parse.quote(clean)
        l = (lang or "hi").strip().lower()
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl={l}&q={q}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=8) as resp:
            audio_bytes = resp.read()
            return Response(content=audio_bytes, media_type="audio/mpeg", headers={"Cache-Control": "public, max-age=86400"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")

@router.get("/past-season-records")
def list_past_season_records(crop: Optional[str] = Query(None, description="Optional crop filter")):
    records = get_past_season_crop_records(crop=crop, limit=5)
    return {"success": True, "count": len(records), "records": records}

# Mount router with BOTH prefix="" and prefix="/api"
# This guarantees that whether Vercel preserves or strips '/api', the endpoint matches!
app.include_router(router, prefix="")
app.include_router(router, prefix="/api")
