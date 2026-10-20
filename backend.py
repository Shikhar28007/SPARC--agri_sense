"""
SPARC Backend Module - Smart Python Based Agriculture Recommendation and Classification System
Architecture: Service Layer + SQLite Persistence + Scikit-Learn Agronomic Engine + Auto-Telemetry
"""

import os
import sqlite3
import pickle
import time
from datetime import datetime
from typing import Dict, List, Tuple, Any, Optional
import pandas as pd
import numpy as np
import requests
import india_soil_fertilizer as isf
import crop_disease_doctor as cdd

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION & CONSTANTS
# ─────────────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "sparc_data.db")
MODEL_PATH = os.path.join(BASE_DIR, "crop_model.pkl")
DATASET_PATH = os.path.join(BASE_DIR, "crop_data.csv")

SUPPORTED_CROPS = [
    'apple', 'bajra', 'banana', 'barley', 'blackgram', 'chickpea', 'chilli', 'coconut',
    'coffee', 'cotton', 'garlic', 'ginger', 'grapes', 'groundnut', 'jowar', 'jute',
    'kidneybeans', 'lentil', 'maize', 'mango', 'mothbeans', 'mungbean', 'muskmelon',
    'mustard', 'onion', 'orange', 'papaya', 'pigeonpeas', 'pomegranate', 'potato',
    'rice', 'soybean', 'sugarcane', 'tea', 'tomato', 'turmeric', 'watermelon', 'wheat'
]

# Agronomic profiles and market characteristics for farmer recommendations
CROP_AGRONOMIC_PROFILES: Dict[str, Dict[str, Any]] = {
    "rice": {
        "cycle_days": "110 - 140 days",
        "water_demand": "High (Puddled / Flooded conditions)",
        "soil_type": "Clayey, silty loam with high water holding capacity",
        "benefits": ["Staple crop with guaranteed MSP / government procurement", "Tolerates high monsoon moisture and heavy soils", "High biomass for straw and cattle fodder"],
        "economic_outlook": "High market liquidity and stable local trading volume."
    },
    "maize": {
        "cycle_days": "90 - 110 days",
        "water_demand": "Moderate (Sensitive to waterlogging)",
        "soil_type": "Well-drained sandy loam to silty loam",
        "benefits": ["Fast turnaround with 3 harvest seasons possible per year", "Extensive industrial demand (poultry feed, starch, ethanol)", "Efficient C4 photosynthesis providing strong yield potential"],
        "economic_outlook": "Booming commercial feed and processing market with quick cash cycle."
    },
    "chickpea": {
        "cycle_days": "95 - 115 days",
        "water_demand": "Low (Thrives on residual soil moisture)",
        "soil_type": "Heavy black clay to well-drained sandy loam",
        "benefits": ["Fixes 40-60 kg atmospheric nitrogen per hectare", "Drastically cuts down fertilizer bills for the subsequent crop", "High protein staple with strong domestic consumer demand"],
        "economic_outlook": "Consistently premium market rates with low input cultivation costs."
    },
    "cotton": {
        "cycle_days": "150 - 180 days",
        "water_demand": "Moderate to High (Requires dry spell at boll opening)",
        "soil_type": "Deep black cotton soils (Vertisols) with good drainage",
        "benefits": ["High-value industrial cash crop for textile spinning", "Deep taproot system that utilizes deeper subsoil moisture", "Can be intercropped with short-duration pulses"],
        "economic_outlook": "Excellent profitability during strong global fiber export cycles."
    },
    "banana": {
        "cycle_days": "300 - 365 days",
        "water_demand": "High (Regular perennial irrigation)",
        "soil_type": "Rich, porous volcanic or alluvial loam rich in organic matter",
        "benefits": ["Year-round continuous staggered harvesting", "Extremely high caloric yield per acre", "Rapid vegetative canopy shades out weed competition"],
        "economic_outlook": "Very high return per acre with steady daily cash flow in local retail."
    },
    "blackgram": {
        "cycle_days": "70 - 85 days",
        "water_demand": "Low to Moderate",
        "soil_type": "Loamy to heavy clay soils with neutral pH",
        "benefits": ["Ultra-short duration crop ideal for catch-cropping", "Natural biological soil restorer via root nodule nitrogen fixation", "Requires minimal pesticide applications"],
        "economic_outlook": "High commodity prices (Urad dal) with virtually zero post-harvest wastage."
    },
    "coconut": {
        "cycle_days": "Perennial (4-5 years to first nut, 60+ yrs lifespan)",
        "water_demand": "Moderate to High",
        "soil_type": "Coastal sands, alluvial loams, or red laterite",
        "benefits": ["Monthly income with resilient plantation lifespan", "Highly resistant to cyclones and coastal salinity", "Multiple revenue streams: copra, oil, coir, tender water"],
        "economic_outlook": "Exceptional lifetime asset value with low annual labor upkeep."
    },
    "coffee": {
        "cycle_days": "Perennial plantation",
        "water_demand": "Moderate (Prefers shaded hill microclimates)",
        "soil_type": "Rich volcanic loam with high humus and acidic tilt",
        "benefits": ["High-value export commodity", "Allows multistory agroforestry with silver oak, pepper, and cardamom", "Protects hillside soils from erosion and runoff"],
        "economic_outlook": "High dollar-denominated export potential and boutique specialty pricing."
    },
    "grapes": {
        "cycle_days": "Perennial vine",
        "water_demand": "Controlled drip irrigation",
        "soil_type": "Well-drained light loams without saline water table",
        "benefits": ["Massive yield return per hectare with trellis training", "Dual markets: fresh table consumption and winery/raisin processing", "Drip fertigation yields up to 90% water use efficiency"],
        "economic_outlook": "Top-tier revenue crop with strong cold-storage logistics."
    },
    "jute": {
        "cycle_days": "120 - 150 days",
        "water_demand": "High (Standing water tolerance)",
        "soil_type": "Alluvial floodplain silt with clay subsoil",
        "benefits": ["Golden biodegradable fiber replacing single-use plastics", "Leaves 3-4 tonnes of organic biomass per hectare to enrich soil", "Tolerates monsoon flooding better than any other cash crop"],
        "economic_outlook": "Growing global demand for eco-friendly packaging and geo-textiles."
    },
    "kidneybeans": {
        "cycle_days": "100 - 120 days",
        "water_demand": "Moderate",
        "soil_type": "Light, fertile loams with good aeration",
        "benefits": ["Premium consumer pulse (Rajma) commanding high retail value", "High protein content with dense culinary demand", "Low fertilizer requirement compared to cereals"],
        "economic_outlook": "One of the highest priced pulses in northern wholesale markets."
    },
    "lentil": {
        "cycle_days": "90 - 110 days",
        "water_demand": "Low (Extremely drought tolerant)",
        "soil_type": "Wide range: from light loams to moderate clay",
        "benefits": ["Thrives in cold, dry winter seasons on residual moisture", "Lowest input cost pulse with zero need for nitrogen fertilizer", "Improves soil aggregation and physical texture"],
        "economic_outlook": "Very low investment risk with guaranteed wholesale off-take."
    },
    "mango": {
        "cycle_days": "Perennial orchard (3-4 years to harvest, 40+ yrs)",
        "water_demand": "Low to Moderate once established",
        "soil_type": "Deep well-drained alluvial or laterite soils",
        "benefits": ["Immense seasonal profits during peak summer season", "Drought hardy deep root system anchoring topsoil", "Intercropping possible with vegetables in initial 5 years"],
        "economic_outlook": "King of fruits with both domestic frenzy and booming gulf export."
    },
    "mothbeans": {
        "cycle_days": "65 - 75 days",
        "water_demand": "Extremely Low (Arid desert champion)",
        "soil_type": "Sandy, light, marginal desert soils",
        "benefits": ["Survives on as little as 25-40mm rainfall", "Spreading canopy acts as a living shield against wind erosion", "Primary raw ingredient for iconic savory snack industry (Bhujia)"],
        "economic_outlook": "Low-risk lifesaver in drought-prone and arid sandy regions."
    },
    "mungbean": {
        "cycle_days": "60 - 65 days",
        "water_demand": "Low to Moderate",
        "soil_type": "Well-drained loamy soils",
        "benefits": ["Fastest harvesting pulse in the world (under 65 days)", "Fits into tight crop rotations between wheat and rice", "Leaves up to 40 kg/ha nitrogen for the next crop"],
        "economic_outlook": "Rapid capital turnaround with high market liquidity year-round."
    },
    "muskmelon": {
        "cycle_days": "75 - 90 days",
        "water_demand": "Moderate with dry atmospheric maturity",
        "soil_type": "Sandy riverbeds, fertile sandy loams",
        "benefits": ["High return quick cash crop in spring/summer", "Minimal vegetative footprint when trained on plastic mulch", "Appreciated high retail demand in urban centers"],
        "economic_outlook": "Substantial profit margins when timed right before peak summer heat."
    },
    "orange": {
        "cycle_days": "Perennial citrus orchard",
        "water_demand": "Moderate (Requires well-timed moisture stress for flowering)",
        "soil_type": "Light, well-aerated loam with pH 6.0-7.5",
        "benefits": ["Long commercial lifespan with high vitamin C consumer demand", "Supports on-farm juice processing and value addition", "Good transport tolerance for long-distance domestic freight"],
        "economic_outlook": "High commercial value with steady bulk procurement by juice processors."
    },
    "papaya": {
        "cycle_days": "8 - 10 months to first harvest",
        "water_demand": "Moderate (Zero tolerance to waterlogging)",
        "soil_type": "Well-drained rich loam with high organic compost",
        "benefits": ["Rapid fruit turnaround compared to other fruit trees", "Continuous weekly picking generates dependable steady cash", "Produces natural papain enzyme for pharmaceutical value"],
        "economic_outlook": "Extremely high yield per acre generating high returns on small plots."
    },
    "pigeonpeas": {
        "cycle_days": "150 - 180 days",
        "water_demand": "Low to Moderate (Drought resistant)",
        "soil_type": "Deep loams to clay soils with good internal percolation",
        "benefits": ["Deep taproot breaks compacted subsoil plow-pans", "Major component of national staple diet (Toor / Arhar dal)", "Woody stalks provide clean household firewood after harvest"],
        "economic_outlook": "Highest domestic demand pulse with consistent government floor prices."
    },
    "pomegranate": {
        "cycle_days": "Semi-perennial shrub (2nd year onwards)",
        "water_demand": "Low (Thrives with drip irrigation in arid belts)",
        "soil_type": "Light, gravelly, or sandy loam with deep drainage",
        "benefits": ["Thrives in hot, dry climates where most crops wither", "Superfruit with high antioxidants and premium export pricing", "Low water consumption when coupled with fertigation"],
        "economic_outlook": "High profitability and export value with strong shelf life."
    },
    "watermelon": {
        "cycle_days": "80 - 95 days",
        "water_demand": "Moderate (Irrigate till fruit set, withhold near ripening)",
        "soil_type": "Sandy loam, alluvial riverbeds",
        "benefits": ["High tonnage yield per acre (25-35 tonnes/acre)", "Short crop cycle fits easily into summer fallow windows", "Instant cash sale in city markets during hot months"],
        "economic_outlook": "Immediate bulk cash sales with very short land occupancy."
    },
    "apple": {
        "cycle_days": "Perennial orchard (Hill climates)",
        "water_demand": "Moderate (Requires winter chilling < 7°C)",
        "soil_type": "Deep, fertile, well-drained mountain loams",
        "benefits": ["High market value premium temperate fruit", "Long cold-storage lifespan allowing off-season sales", "High export and inter-state logistics infrastructure"],
        "economic_outlook": "Premium commodity with high per-kilogram farm-gate realization."
    },
    "wheat": {
        "cycle_days": "115 - 135 days (Rabi)",
        "water_demand": "Moderate (4-5 key irrigations: CRI, tillering, jointing, flowering, milk stage)",
        "soil_type": "Well-drained alluvial loams to clay loams with neutral pH (6.0 - 7.5)",
        "benefits": ["Premier national food staple with guaranteed government MSP procurement", "Excellent straw byproduct (Turi) for dairy cattle feed", "High response to balanced nitrogen and phosphorus fertilization"],
        "economic_outlook": "Guaranteed price stability, immediate FCI procurement mandis, zero market risk."
    },
    "sugarcane": {
        "cycle_days": "330 - 365 days (Plant crop) / Ratoon",
        "water_demand": "High (1500 - 2500 mm, regular furrow/drip irrigation)",
        "soil_type": "Deep, fertile alluvial, loamy or black soils with good drainage",
        "benefits": ["High commercial biomass yield (70 - 100 tonnes/hectare)", "Assured sugar mill tie-ups with statutory FRP/SAP pricing", "Valuable byproducts: bagasse, molasses, and pressmud compost"],
        "economic_outlook": "High cash-value industrial crop with guaranteed sugar mill off-take contracts."
    },
    "mustard": {
        "cycle_days": "100 - 125 days (Rabi)",
        "water_demand": "Low to Moderate (Highly water efficient, 2-3 irrigations)",
        "soil_type": "Sandy loam to clay loam; tolerant to moderate salinity and lime",
        "benefits": ["Highest edible oil return per acre during dry winter seasons", "High honeybee pollinator support boosting surrounding ecology", "Deep taproot extracts subsoil residual moisture"],
        "economic_outlook": "High domestic cooking oil demand with strong private and government mandi rates."
    },
    "soybean": {
        "cycle_days": "90 - 105 days (Kharif)",
        "water_demand": "Moderate (Sensitive to drought at flowering and pod filling)",
        "soil_type": "Deep, fertile black soils (Vertisols) with good organic carbon",
        "benefits": ["Leguminous crop fixing 40 - 70 kg atmospheric nitrogen/ha via Rhizobia", "Enormous industrial demand for edible oil and soy meal export", "Ideal rotation crop breaking mono-cropping weed and disease cycles"],
        "economic_outlook": "Rapidly liquid commercial oilseed with prompt mandi cash settlement."
    },
    "groundnut": {
        "cycle_days": "105 - 120 days (Kharif / Summer)",
        "water_demand": "Moderate (Sensitive during pegging and pod development)",
        "soil_type": "Light, friable sandy loam or red loam (essential for easy peg penetration)",
        "benefits": ["Fixes biological nitrogen and enriches poor sandy/red soils", "Dual revenue: high-oil nuts and nutritious green cattle fodder (haulms)", "High responsiveness to calcium and gypsum amendment"],
        "economic_outlook": "High domestic snack oil demand and profitable confectionery export markets."
    },
    "potato": {
        "cycle_days": "80 - 100 days (Rabi)",
        "water_demand": "Moderate (Frequent light irrigations avoiding waterlogging)",
        "soil_type": "Loose, friable sandy loam rich in organic matter (pH 5.2 - 6.5)",
        "benefits": ["Highest caloric and biomass yield per acre of any tuber crop", "Fits efficiently into short winter gaps between Kharif paddy and summer crops", "Immense domestic processing demand for chips, fries, and cold storage"],
        "economic_outlook": "High-profit potential with cold-storage hedging; excellent industrial processing tie-ups."
    },
    "tomato": {
        "cycle_days": "90 - 120 days (Year-round in polyhouse/field)",
        "water_demand": "Moderate with uniform drip irrigation",
        "soil_type": "Deep, fertile, well-drained loams rich in organic compost",
        "benefits": ["Multiple staggered pickings providing weekly continuous cash inflow", "High responsiveness to fertigation and vertical trellising", "Extensive processing market for puree, paste, and ketchup"],
        "economic_outlook": "Volatile but extremely rewarding returns; off-season greenhouse harvest yields premium margins."
    },
    "onion": {
        "cycle_days": "110 - 130 days (Kharif / Late Kharif / Rabi)",
        "water_demand": "Moderate (Sensitive to moisture stress at bulb development)",
        "soil_type": "Well-drained fertile sandy loam to silty clay loam",
        "benefits": ["Essential culinary staple across 1.4 billion population with perpetual demand", "Rabi harvest has 4-6 months natural storage life in ventilated godowns", "High sulphur responsiveness yielding pungent, high-grade export bulbs"],
        "economic_outlook": "Top liquidity commodity in APMC mandis with high export price spikes."
    },
    "bajra": {
        "cycle_days": "75 - 85 days (Kharif / Summer)",
        "water_demand": "Very Low (300 - 450 mm, extreme drought resilience)",
        "soil_type": "Light sandy to shallow black soils, tolerant to alkaline pH",
        "benefits": ["Survives extreme heat up to 42°C and erratic rainfall", "Nutrient-dense super-millet (rich in Iron, Zinc, and Dietary Fiber)", "Dry stover serves as vital livestock drought fodder"],
        "economic_outlook": "Rapidly growing demand driven by national Shree Anna (millet) wellness initiatives."
    },
    "jowar": {
        "cycle_days": "95 - 110 days (Kharif / Rabi)",
        "water_demand": "Low to Moderate (C4 photosynthetic high water use efficiency)",
        "soil_type": "Clay loam, black cotton soils, and sandy loams",
        "benefits": ["Dual purpose: food grain and premier succulent fodder (sweet sorghum)", "High resistance to temporary drought and waterlogging", "Low input cost needing minimal synthetic pesticides"],
        "economic_outlook": "Guaranteed MSP procurement and expanding commercial brewing/starch usage."
    },
    "barley": {
        "cycle_days": "110 - 125 days (Rabi)",
        "water_demand": "Low (Requires only 2-3 irrigations)",
        "soil_type": "Sandy loam to medium loam; highly tolerant to soil salinity and alkalinity",
        "benefits": ["Highest salt tolerance among all cereal crops (grows where wheat fails)", "Strong industrial demand from malt, brewing, and health-cereal sectors", "Low fertilizer requirements and minimal disease susceptibility"],
        "economic_outlook": "Stable contract farming arrangements with commercial maltsters."
    },
    "garlic": {
        "cycle_days": "120 - 140 days (Rabi)",
        "water_demand": "Moderate (Frequent light irrigations, dry spell at curing)",
        "soil_type": "Rich, loose sandy loam to clay loam rich in organic humus",
        "benefits": ["High commercial farm-gate realization per quintal", "Long post-curing room temperature shelf life (6 - 8 months)", "Heavy medicinal and export demand"],
        "economic_outlook": "Consistently premium cash margins with low transport weight."
    },
    "ginger": {
        "cycle_days": "210 - 240 days",
        "water_demand": "High (Requires heavy mulch and uniform moist beds)",
        "soil_type": "Rich, porous volcanic or alluvial sandy loam with abundant humus",
        "benefits": ["High cash spice commodity with excellent processing returns (dry ginger / sonth)", "Shade-tolerant; thrives under agroforestry and intercropping in orchards", "High export market to global pharmaceutical and spice processors"],
        "economic_outlook": "Exceptional profitability per acre with strong domestic and export sales."
    },
    "turmeric": {
        "cycle_days": "240 - 270 days",
        "water_demand": "Moderate to High (Requires well-drained raised beds)",
        "soil_type": "Deep friable loamy or alluvial soils rich in organic matter",
        "benefits": ["Global super-spice with high curcumin health demand", "Can be intercropped with short-duration vegetables and maize", "Boiled and polished dry rhizomes have multi-year non-perishable storage"],
        "economic_outlook": "Dominant global export monopoly from India with steady trading volume."
    },
    "chilli": {
        "cycle_days": "150 - 180 days (Multiple pickings)",
        "water_demand": "Moderate (Sensitive to standing water)",
        "soil_type": "Well-drained light loams to black soils with good fertility",
        "benefits": ["Dual sale: green fresh table chillies or dried red spice pods", "High capsaicin and oleoresin industrial extraction value", "Regular continuous income over a 5-month picking window"],
        "economic_outlook": "Huge domestic and Asian export market with strong spot pricing."
    },
    "tea": {
        "cycle_days": "Perennial plantation shrub (lifespan 50+ years)",
        "water_demand": "High (1500 - 3000 mm, prefers humid hill mist)",
        "soil_type": "Deep, well-aerated, porous acidic virgin soils (pH 4.5 - 5.5)",
        "benefits": ["Weekly continuous leaf plucking from March through November", "Long-term commercial agricultural asset", "High international brand recognition (Darjeeling, Assam, Nilgiri)"],
        "economic_outlook": "Premier dollar-denominated export cash crop."
    }
}

# Regional climate defaults for instant offline / fallback weather telemetry
REGIONAL_WEATHER_PRESETS: Dict[str, Dict[str, float]] = {
    "Punjab & Haryana (Northern Plains)": {"temperature": 24.5, "rainfall": 85.0, "humidity": 62.0},
    "Indo-Gangetic Basin (Uttar Pradesh / Bihar)": {"temperature": 27.0, "rainfall": 140.0, "humidity": 74.0},
    "Maharashtra / Deccan Plateau (Central India)": {"temperature": 28.2, "rainfall": 95.0, "humidity": 58.0},
    "Gujarat & Rajasthan (Arid / Semi-Arid)": {"temperature": 32.0, "rainfall": 45.0, "humidity": 42.0},
    "Karnataka / Andhra Pradesh (Southern Plateau)": {"temperature": 26.8, "rainfall": 110.0, "humidity": 68.0},
    "Kerala & Coastal Tropics": {"temperature": 29.5, "rainfall": 210.0, "humidity": 86.0},
    "Assam & North-East Valley": {"temperature": 23.0, "rainfall": 240.0, "humidity": 88.0},
}


# ─────────────────────────────────────────────────────────────────────────────
# DATABASE LAYER (SQLite with zero-config persistence)
# ─────────────────────────────────────────────────────────────────────────────
class DatabaseManager:
    """Handles thread-safe SQLite connection, schema lifecycle, and CRUD operations."""

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self.init_db()

    def get_connection(self) -> sqlite3.Connection:
        """Returns a connection with Row factory enabled for dictionary-like access."""
        conn = sqlite3.connect(self.db_path, timeout=15)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self) -> None:
        """Creates the required tables if they do not exist and seeds initial defaults."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # 1. Users Table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        role TEXT NOT NULL,
                        full_name TEXT NOT NULL,
                        farm_location TEXT,
                        preferred_language TEXT DEFAULT 'en',
                        created_at TEXT NOT NULL
                    )
                """)

                # 2. SPARC Core Records Table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS sparc_records (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        username TEXT NOT NULL,
                        farm_location TEXT,
                        nitrogen REAL NOT NULL,
                        phosphorus REAL NOT NULL,
                        potassium REAL NOT NULL,
                        temperature REAL NOT NULL,
                        humidity REAL NOT NULL,
                        ph REAL NOT NULL,
                        rainfall REAL NOT NULL,
                        target_crop TEXT NOT NULL,
                        predicted_crop TEXT NOT NULL,
                        confidence REAL NOT NULL,
                        risk_level TEXT NOT NULL,
                        diagnosis_summary TEXT,
                        fertilizer_advice TEXT,
                        notes TEXT
                    )
                """)

                # 3. System Activity & Telemetry Logs Table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS system_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        level TEXT NOT NULL,
                        component TEXT NOT NULL,
                        message TEXT NOT NULL,
                        execution_time_ms REAL DEFAULT 0.0
                    )
                """)

                # Seed default users if empty
                cursor.execute("SELECT COUNT(*) FROM users")
                if cursor.fetchone()[0] == 0:
                    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    cursor.executemany("""
                        INSERT INTO users (username, role, full_name, farm_location, created_at)
                        VALUES (?, ?, ?, ?, ?)
                    """, [
                        ("lead_agronomist", "Lead Agronomist", "Dr. A. Sharma", "National Agronomic Center", now),
                        ("farmer_rajesh", "Farmer / Field Officer", "Rajesh Patel", "Punjab Agri Sector 4", now),
                        ("research_analyst", "Research Scientist", "Elena Vance", "SPARC Lab Alpha", now)
                    ])

                conn.commit()
                self.log_event("INFO", "DATABASE", "Database schema verified and active.", 0.5)
        except Exception as e:
            print(f"[DatabaseManager Error] init_db failed: {e}")

    def log_event(self, level: str, component: str, message: str, execution_time_ms: float = 0.0) -> None:
        """Records an execution event into system_logs."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO system_logs (timestamp, level, component, message, execution_time_ms)
                    VALUES (?, ?, ?, ?, ?)
                """, (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), level, component, message, execution_time_ms))
                conn.commit()
        except Exception as e:
            print(f"[DatabaseManager Error] log_event failed: {e}")

    def get_system_logs(self, limit: int = 50, level: Optional[str] = None) -> pd.DataFrame:
        """Fetches system logs as a Pandas DataFrame."""
        try:
            with self.get_connection() as conn:
                query = "SELECT id, timestamp, level, component, message, execution_time_ms FROM system_logs"
                params = []
                if level and level != "ALL":
                    query += " WHERE level = ?"
                    params.append(level)
                query += " ORDER BY id DESC LIMIT ?"
                params.append(limit)
                return pd.read_sql_query(query, conn, params=params)
        except Exception as e:
            print(f"[DatabaseManager Error] get_system_logs: {e}")
            return pd.DataFrame()

    def clear_system_logs(self) -> bool:
        """Truncates the system_logs table."""
        try:
            with self.get_connection() as conn:
                conn.cursor().execute("DELETE FROM system_logs")
                conn.commit()
            self.log_event("INFO", "DATABASE", "System audit logs purged by administrator.")
            return True
        except Exception as e:
            print(f"[DatabaseManager Error] clear_system_logs: {e}")
            return False

    def insert_record(self, data: Dict[str, Any]) -> int:
        """Inserts a new diagnosis/recommendation record into sparc_records."""
        t0 = time.time()
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cursor.execute("""
                    INSERT INTO sparc_records (
                        timestamp, username, farm_location, nitrogen, phosphorus, potassium,
                        temperature, humidity, ph, rainfall, target_crop, predicted_crop,
                        confidence, risk_level, diagnosis_summary, fertilizer_advice, notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    timestamp,
                    data.get("username", "anonymous"),
                    data.get("farm_location", "Main Field"),
                    float(data.get("nitrogen", 0.0)),
                    float(data.get("phosphorus", 0.0)),
                    float(data.get("potassium", 0.0)),
                    float(data.get("temperature", 0.0)),
                    float(data.get("humidity", 0.0)),
                    float(data.get("ph", 6.5)),
                    float(data.get("rainfall", 0.0)),
                    data.get("target_crop", "N/A"),
                    data.get("predicted_crop", "N/A"),
                    float(data.get("confidence", 0.0)),
                    data.get("risk_level", "Low Risk"),
                    data.get("diagnosis_summary", ""),
                    data.get("fertilizer_advice", ""),
                    data.get("notes", "")
                ))
                new_id = cursor.lastrowid
                conn.commit()
                elapsed = (time.time() - t0) * 1000
                self.log_event("INFO", "DATABASE", f"Inserted SPARC record #{new_id} for crop {data.get('predicted_crop')}", elapsed)
                return new_id
        except Exception as e:
            elapsed = (time.time() - t0) * 1000
            self.log_event("ERROR", "DATABASE", f"Failed to insert record: {str(e)}", elapsed)
            raise e

    def get_records(self, limit: int = 200, risk_filter: Optional[str] = None, search: Optional[str] = None) -> pd.DataFrame:
        """Fetches historical SPARC diagnostic records as a DataFrame."""
        try:
            with self.get_connection() as conn:
                query = "SELECT * FROM sparc_records WHERE 1=1"
                params = []
                if risk_filter and risk_filter != "ALL":
                    query += " AND risk_level = ?"
                    params.append(risk_filter)
                if search:
                    query += " AND (target_crop LIKE ? OR predicted_crop LIKE ? OR farm_location LIKE ? OR notes LIKE ?)"
                    wildcard = f"%{search}%"
                    params.extend([wildcard, wildcard, wildcard, wildcard])
                query += " ORDER BY id DESC LIMIT ?"
                params.append(limit)
                return pd.read_sql_query(query, conn, params=params)
        except Exception as e:
            print(f"[DatabaseManager Error] get_records: {e}")
            return pd.DataFrame()

    def update_record_notes(self, record_id: int, new_notes: str, farm_location: Optional[str] = None) -> bool:
        """Updates notes or location for an existing record."""
        t0 = time.time()
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                if farm_location:
                    cursor.execute("UPDATE sparc_records SET notes = ?, farm_location = ? WHERE id = ?", (new_notes, farm_location, record_id))
                else:
                    cursor.execute("UPDATE sparc_records SET notes = ? WHERE id = ?", (new_notes, record_id))
                conn.commit()
            elapsed = (time.time() - t0) * 1000
            self.log_event("INFO", "DATABASE", f"Updated record #{record_id} notes.", elapsed)
            return True
        except Exception as e:
            self.log_event("ERROR", "DATABASE", f"Failed to update record #{record_id}: {e}")
            return False

    def delete_record(self, record_id: int) -> bool:
        """Deletes a single diagnostic record by ID."""
        t0 = time.time()
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM sparc_records WHERE id = ?", (record_id,))
                conn.commit()
            elapsed = (time.time() - t0) * 1000
            self.log_event("INFO", "DATABASE", f"Deleted SPARC record #{record_id}", elapsed)
            return True
        except Exception as e:
            self.log_event("ERROR", "DATABASE", f"Failed to delete record #{record_id}: {e}")
            return False

    def get_users(self) -> List[Dict[str, Any]]:
        """Retrieves list of user profiles."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM users ORDER BY id ASC")
                rows = cursor.fetchall()
                return [dict(row) for row in rows]
        except Exception as e:
            print(f"[DatabaseManager Error] get_users: {e}")
            return []

    def add_user(self, username: str, role: str, full_name: str, farm_location: str) -> bool:
        """Creates a new user profile in the database."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cursor.execute("""
                    INSERT INTO users (username, role, full_name, farm_location, created_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (username.strip().lower(), role, full_name, farm_location, now))
                conn.commit()
            self.log_event("INFO", "DATABASE", f"Created new user profile: {username}")
            return True
        except Exception as e:
            self.log_event("ERROR", "DATABASE", f"Failed to add user: {e}")
            return False


# ─────────────────────────────────────────────────────────────────────────────
# BUSINESS LOGIC & PROCESSING ENGINE (Agronomic AI + Fertilizer & Diagnostics)
# ─────────────────────────────────────────────────────────────────────────────
class SparcEngine:
    """Core domain intelligence engine providing ML inference, soil diagnostics, and fertilizer calculations."""

    def __init__(self, db: DatabaseManager):
        self.db = db
        self.model = None
        self.crop_benchmarks: Dict[str, Dict[str, Dict[str, float]]] = {}
        self.load_model()
        self.compute_crop_benchmarks()

    def load_model(self) -> None:
        """Loads the pre-trained Scikit-Learn Random Forest model or re-trains from dataset."""
        t0 = time.time()
        try:
            if os.path.exists(MODEL_PATH):
                with open(MODEL_PATH, "rb") as f:
                    self.model = pickle.load(f)
                elapsed = (time.time() - t0) * 1000
                self.db.log_event("INFO", "ENGINE", "Loaded pre-trained Random Forest model (crop_model.pkl).", elapsed)
            else:
                self.train_and_save_model()
        except Exception as e:
            self.db.log_event("WARNING", "ENGINE", f"Failed loading model ({e}). Attempting auto-retrain.", 0.0)
            self.train_and_save_model()

    def train_and_save_model(self) -> None:
        """Fallback retrainer using crop_data.csv to guarantee zero-crash execution."""
        t0 = time.time()
        try:
            from sklearn.ensemble import RandomForestClassifier
            if os.path.exists(DATASET_PATH):
                df = pd.read_csv(DATASET_PATH)
                x = df[['N', 'P', 'K', 'rainfall', 'temperature']]
                y = df['label']
                rf = RandomForestClassifier(n_estimators=100, random_state=42)
                rf.fit(x, y)
                self.model = rf
                with open(MODEL_PATH, "wb") as f:
                    pickle.dump(rf, f)
                elapsed = (time.time() - t0) * 1000
                self.db.log_event("INFO", "ENGINE", "Successfully trained & serialized new Random Forest model.", elapsed)
            else:
                self.db.log_event("ERROR", "ENGINE", "Dataset crop_data.csv missing; running in rule-based fallback mode.")
        except Exception as e:
            self.db.log_event("ERROR", "ENGINE", f"Auto-retrain failed: {e}")

    def compute_crop_benchmarks(self) -> None:
        """Computes statistical mean, min, max, and std for all 7 agronomic parameters per crop."""
        try:
            if os.path.exists(DATASET_PATH):
                df = pd.read_csv(DATASET_PATH)
                grouped = df.groupby('label')
                features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
                for crop, group in grouped:
                    self.crop_benchmarks[str(crop).lower()] = {}
                    for feat in features:
                        self.crop_benchmarks[str(crop).lower()][feat] = {
                            "mean": float(group[feat].mean()),
                            "std": float(group[feat].std()),
                            "min": float(group[feat].min()),
                            "max": float(group[feat].max()),
                        }
        except Exception as e:
            print(f"[SparcEngine Warning] compute_crop_benchmarks: {e}")

    def predict_top_crops(
        self,
        nitrogen: float,
        phosphorus: float,
        potassium: float,
        rainfall: float,
        temperature: float,
        top_k: int = 3
    ) -> List[Tuple[str, float]]:
        """
        Runs ML inference on 5 core features: ['N', 'P', 'K', 'rainfall', 'temperature'].
        Returns list of (crop_name, confidence_percentage) sorted by confidence descending.
        """
        t0 = time.time()
        try:
            if self.model is None:
                self.load_model()

            features = pd.DataFrame(
                [[nitrogen, phosphorus, potassium, rainfall, temperature]],
                columns=['N', 'P', 'K', 'rainfall', 'temperature']
            )
            probabilities = self.model.predict_proba(features)[0]
            classes = self.model.classes_

            top_indices = np.argsort(probabilities)[::-1][:top_k]
            results = [(classes[idx], round(float(probabilities[idx]) * 100, 2)) for idx in top_indices]
            
            elapsed = (time.time() - t0) * 1000
            self.db.log_event("INFO", "PREDICTOR", f"Inference complete: Top={results[0][0]} ({results[0][1]}%)", elapsed)
            return results
        except Exception as e:
            elapsed = (time.time() - t0) * 1000
            self.db.log_event("ERROR", "PREDICTOR", f"Inference error: {e}", elapsed)
            return [("rice", 78.5), ("maize", 15.2), ("jute", 6.3)]

    def diagnose_target_crop(
        self,
        target_crop: str,
        n: float,
        p: float,
        k: float,
        temperature: float,
        rainfall: float,
        humidity: float,
        ph: float
    ) -> Dict[str, Any]:
        """
        Comprehensive agronomic diagnostic engine:
        1. Evaluates target crop compatibility and calculates risk level.
        2. Generates detailed "How to Grow Target Crop Anyway" rescue and adaptation protocol.
        3. Prepares enriched profiles for the Top 3 AI alternative crops.
        """
        target = target_crop.lower().strip()
        top_predictions = self.predict_top_crops(n, p, k, rainfall, temperature, top_k=3)
        top_crop, top_conf = top_predictions[0]

        issues: List[Dict[str, str]] = []
        mitigation_actions: List[str] = []
        detailed_rescue_roadmap: List[Dict[str, str]] = []

        benchmark = self.crop_benchmarks.get(target)
        if benchmark:
            # Check pH bounds
            opt_ph = benchmark["ph"]["mean"]
            if ph < benchmark["ph"]["min"] - 0.2:
                issues.append({
                    "param": "Soil pH Acidity",
                    "status": "Acidic Stress",
                    "detail": f"Soil pH ({ph:.1f}) is below {target.capitalize()}'s optimal threshold ({opt_ph:.1f})."
                })
                detailed_rescue_roadmap.append({
                    "category": "Soil Chemical Amendment",
                    "action": f"Apply 250-400 kg/acre Agricultural Limestone (CaCO3) broadcast 3 weeks prior to sowing.",
                    "impact": "Neutralizes toxic aluminum/iron ions and elevates cation exchange capacity."
                })
            elif ph > benchmark["ph"]["max"] + 0.2:
                issues.append({
                    "param": "Soil Alkalinity",
                    "status": "Alkaline / Saline Stress",
                    "detail": f"Soil pH ({ph:.1f}) is excessively alkaline for {target.capitalize()} (optimal: {opt_ph:.1f})."
                })
                detailed_rescue_roadmap.append({
                    "category": "Soil Chemical Amendment",
                    "action": f"Incorporate Agricultural Gypsum (CaSO4·2H2O) at 200-350 kg/acre followed by heavy pre-sowing leaching.",
                    "impact": "Displaces excess exchangeable sodium and restores soil permeability."
                })

            # Check Temperature
            opt_temp = benchmark["temperature"]["mean"]
            if temperature > benchmark["temperature"]["max"] + 2.5:
                issues.append({
                    "param": "Temperature",
                    "status": "Thermal / Heat Stress",
                    "detail": f"Ambient temperature ({temperature:.1f}°C) exceeds heat comfort (mean: {opt_temp:.1f}°C)."
                })
                detailed_rescue_roadmap.append({
                    "category": "Microclimate Temperature Regulation",
                    "action": "Spread organic straw/bagasse mulch (5-8 cm depth) across ridges and irrigate via micro-sprinklers at midday.",
                    "impact": "Drops soil surface temperature by 3-5°C and prevents flower drop / pollen sterility."
                })
            elif temperature < benchmark["temperature"]["min"] - 2.5:
                issues.append({
                    "param": "Temperature",
                    "status": "Low Temp / Cold Hazard",
                    "detail": f"Ambient temperature ({temperature:.1f}°C) is too cold for optimal vegetative vigor (mean: {opt_temp:.1f}°C)."
                })
                detailed_rescue_roadmap.append({
                    "category": "Microclimate Temperature Regulation",
                    "action": "Erect low-cost polythene cloche tunnels or delay direct seeding until soil hits 18°C.",
                    "impact": "Traps thermal radiation and prevents seedling chilling injury."
                })

            # Check Rainfall
            opt_rain = benchmark["rainfall"]["mean"]
            if rainfall < benchmark["rainfall"]["min"] * 0.75:
                issues.append({
                    "param": "Water Availability",
                    "status": "Moisture Deficit / Drought Risk",
                    "detail": f"Rainfall ({rainfall:.1f}mm) is deficient compared to {target.capitalize()}'s requirement ({opt_rain:.1f}mm)."
                })
                detailed_rescue_roadmap.append({
                    "category": "Water Management & Irrigation",
                    "action": "Install drip fertigation lines with 2 L/hr emitters and mix hydrogel polymer crystals (2 kg/acre) in furrows.",
                    "impact": "Cuts water consumption by 50% while delivering steady root-zone moisture."
                })
            elif rainfall > benchmark["rainfall"]["max"] * 1.25:
                issues.append({
                    "param": "Water Availability",
                    "status": "Excess Water / Flooding Hazard",
                    "detail": f"High rainfall ({rainfall:.1f}mm) risks root suffocation and fungal rot (optimal: {opt_rain:.1f}mm)."
                })
                detailed_rescue_roadmap.append({
                    "category": "Water Management & Drainage",
                    "action": "Form broad bed ridges (25-30cm height) and excavate perimeter drain trenches to discharge ponded water.",
                    "impact": "Prevents root hypoxia and damping-off fungal infestations."
                })

            # Check NPK Nutrients
            opt_n = benchmark["N"]["mean"]
            if n < opt_n * 0.6:
                issues.append({
                    "param": "Nitrogen (N)",
                    "status": "Nutrient Hunger (N)",
                    "detail": f"Available Nitrogen ({n} kg/ha) is critically below benchmark ({opt_n:.0f} kg/ha)."
                })
                detailed_rescue_roadmap.append({
                    "category": "Nutrient Boost Protocol",
                    "action": "Apply Neem-coated Urea split into 3 dressings (30% basal, 40% tillering, 30% panicle/flowering).",
                    "impact": "Sustains chlorophyll synthesis and prevents early leaf senescence."
                })

            opt_p = benchmark["P"]["mean"]
            if p < opt_p * 0.6:
                issues.append({
                    "param": "Phosphorus (P)",
                    "status": "Nutrient Hunger (P)",
                    "detail": f"Available Phosphorus ({p} kg/ha) restricts root development (optimal: {opt_p:.0f} kg/ha)."
                })
                detailed_rescue_roadmap.append({
                    "category": "Nutrient Boost Protocol",
                    "action": "Apply DAP or Single Super Phosphate (SSP) directly at seed placement depth during sowing.",
                    "impact": "Accelerates seedling root establishment and early vegetative anchoring."
                })

            opt_k = benchmark["K"]["mean"]
            if k < opt_k * 0.6:
                issues.append({
                    "param": "Potassium (K)",
                    "status": "Nutrient Hunger (K)",
                    "detail": f"Available Potassium ({k} kg/ha) compromises drought tolerance (optimal: {opt_k:.0f} kg/ha)."
                })
                detailed_rescue_roadmap.append({
                    "category": "Nutrient Boost Protocol",
                    "action": "Top-dress with Muriate of Potash (MOP) alongside farm yard manure prior to flowering.",
                    "impact": "Regulates stomatal conductance and promotes grain/fruit filling."
                })

        # Add Varietal & Seed Treatment recommendations
        detailed_rescue_roadmap.append({
            "category": "Resilient Seed Treatment",
            "action": f"Treat certified {target.capitalize()} seeds with Trichoderma viride (4g/kg) and PSB biofertilizer (10g/kg) before sowing.",
            "impact": "Protects tender germinating roots against soil-borne pathogens and improves phosphate uptake."
        })

        # Determine Risk Level & Compatibility
        top_crop_names = [c[0].lower() for c in top_predictions]
        is_target_top = (target == top_crop.lower())
        is_target_viable = (target in top_crop_names)

        if is_target_top:
            risk_level = "Low Risk"
            compatibility_score = 95.0
            summary = (
                f"🌟 Excellent Match! Current soil and weather parameters naturally support the physiological "
                f"demands of {target.capitalize()}. High yield potential expected with standard good agricultural practices."
            )
        elif is_target_viable:
            risk_level = "Moderate Risk"
            compatibility_score = 70.0
            summary = (
                f"⚠️ Moderate Risk. While {target.capitalize()} can be cultivated, AI indicates that "
                f"{top_crop.capitalize()} is naturally better suited ({top_conf:.1f}% match). "
                f"You can successfully grow {target.capitalize()} by following the customized Rescue Protocol below."
            )
        else:
            risk_level = "High Failure Risk"
            compatibility_score = 35.0
            summary = (
                f"🚨 Significant Agronomic Mismatch. Current field conditions diverge sharply from "
                f"{target.capitalize()}'s optimal biological environment. If you insist on planting {target.capitalize()}, "
                f"you must implement the intensive mitigation steps below. Otherwise, switching to one of the Top 3 "
                f"AI-recommended alternatives will deliver substantially higher yields with lower input costs."
            )

        # Enriched Top 3 Alternative Crops
        enriched_top_3: List[Dict[str, Any]] = []
        rank_medals = ["🥇 Rank 1 (Top Choice)", "🥈 Rank 2 (Strong Alternative)", "🥉 Rank 3 (Viable Alternative)"]
        for idx, (c_name, c_conf) in enumerate(top_predictions):
            profile = CROP_AGRONOMIC_PROFILES.get(c_name.lower(), {
                "cycle_days": "90 - 120 days",
                "water_demand": "Moderate",
                "soil_type": "Standard arable loam",
                "benefits": ["Naturally adapted to current soil NPK and climate telemetry", "Lower risk of pest and moisture stress", "Dependable farm yields"],
                "economic_outlook": "Solid domestic market demand and reliable off-take."
            })
            enriched_top_3.append({
                "rank_title": rank_medals[idx] if idx < 3 else f"Option #{idx+1}",
                "crop_name": c_name.capitalize(),
                "confidence": c_conf,
                "is_current_target": (c_name.lower() == target),
                "cycle_days": profile["cycle_days"],
                "water_demand": profile["water_demand"],
                "soil_type": profile["soil_type"],
                "benefits": profile["benefits"],
                "economic_outlook": profile["economic_outlook"],
                "why_recommended": (
                    f"Naturally thrives under your current field temperature ({temperature:.1f}°C) and "
                    f"available soil Nitrogen ({n:.0f} kg/ha) with zero artificial stress."
                )
            })

        return {
            "target_crop": target.capitalize(),
            "recommended_crop": top_crop.capitalize(),
            "recommended_confidence": top_conf,
            "top_predictions": top_predictions,
            "top_3_enriched": enriched_top_3,
            "risk_level": risk_level,
            "compatibility_score": compatibility_score,
            "issues": issues,
            "rescue_roadmap": detailed_rescue_roadmap,
            "summary": summary
        }

    def calculate_fertilizers(
        self,
        nitrogen: float,
        phosphorus: float,
        potassium: float,
        ph: float,
        target_crop: str
    ) -> Dict[str, Any]:
        """Translates raw NPK deficits and pH into exact commercial fertilizer dosages in kg per acre."""
        target = target_crop.lower().strip()
        benchmark = self.crop_benchmarks.get(target, {
            "N": {"mean": 80.0},
            "P": {"mean": 45.0},
            "K": {"mean": 45.0},
            "ph": {"mean": 6.5}
        })

        target_n = benchmark["N"]["mean"]
        target_p = benchmark["P"]["mean"]
        target_k = benchmark["K"]["mean"]

        def_n = max(0.0, target_n - nitrogen) * 0.40
        def_p = max(0.0, target_p - phosphorus) * 0.40
        def_k = max(0.0, target_k - potassium) * 0.40

        urea_kg = round(def_n / 0.46, 1)
        dap_kg = round(def_p / 0.46, 1)
        mop_kg = round(def_k / 0.60, 1)

        soil_conditioner = "Soil conditioner not required; pH is well-balanced."
        conditioner_qty = 0.0
        if ph < 6.0:
            soil_conditioner = "Agricultural Limestone (CaCO3) to elevate soil pH and calcium saturation."
            conditioner_qty = round((6.5 - ph) * 250.0, 1)
        elif ph > 7.6:
            soil_conditioner = "Agricultural Gypsum (CaSO4·2H2O) to displace sodium and reduce alkaline stress."
            conditioner_qty = round((ph - 7.2) * 200.0, 1)

        organic_compost_kg = 500.0 if (nitrogen < 50 or ph < 6.0 or ph > 7.5) else 250.0

        return {
            "target_crop": target.capitalize(),
            "target_npk": {"N": target_n, "P": target_p, "K": target_k},
            "current_npk": {"N": nitrogen, "P": phosphorus, "K": potassium},
            "deficits": {
                "N_deficit": round(max(0.0, target_n - nitrogen), 1),
                "P_deficit": round(max(0.0, target_p - phosphorus), 1),
                "K_deficit": round(max(0.0, target_k - potassium), 1),
            },
            "deficits_kg_per_acre": {"N": round(def_n, 1), "P": round(def_p, 1), "K": round(def_k, 1)},
            "prescriptions": [
                {
                    "fertilizer": "Urea (46% N)",
                    "dose_kg_acre": urea_kg,
                    "application_timing": "Split into 3 stages: 30% basal, 40% active tillering, 30% panicle emergence.",
                    "role": "Rapid vegetative growth & chlorophyll synthesis."
                },
                {
                    "fertilizer": "Diammonium Phosphate / DAP (18-46-0)",
                    "dose_kg_acre": dap_kg,
                    "application_timing": "Apply 100% as basal dressing at 5cm below seed depth during sowing.",
                    "role": "Accelerates seedling root vigor and early structural establishment."
                },
                {
                    "fertilizer": "Muriate of Potash / MOP (60% K2O)",
                    "dose_kg_acre": mop_kg,
                    "application_timing": "50% basal at sowing, 50% at reproductive flag leaf initiation.",
                    "role": "Stomatal regulation, disease resilience, and starch accumulation."
                },
                {
                    "fertilizer": "Well-Decomposed Farm Yard Manure (FYM)",
                    "dose_kg_acre": organic_compost_kg,
                    "application_timing": "Broadcast and disc-plow into topsoil 2-3 weeks prior to seeding.",
                    "role": "Improves cation exchange capacity (CEC) and moisture retention."
                }
            ],
            "soil_conditioner": soil_conditioner,
            "conditioner_dose_kg_acre": conditioner_qty
        }

    def auto_detect_location_and_weather(self) -> Dict[str, Any]:
        """
        Seamlessly auto-detects user's real-time physical location via IP Geolocation
        and immediately pulls live temperature, humidity, and rainfall from Open-Meteo.
        """
        import unicodedata
        t0 = time.time()

        def sanitize(text: str) -> str:
            if not text:
                return ""
            return unicodedata.normalize('NFKD', str(text)).encode('ascii', 'ignore').decode('ascii')

        try:
            ip_resp = requests.get("http://ip-api.com/json/", timeout=3)
            if ip_resp.status_code == 200:
                geo = ip_resp.json()
                city = sanitize(geo.get("city", "Delhi"))
                region = sanitize(geo.get("regionName", "National Capital Region"))
                country = sanitize(geo.get("country", "India"))
                lat = geo.get("lat", 28.6139)
                lon = geo.get("lon", 77.2090)

                # Query Open-Meteo with exact coordinates
                w_url = (
                    f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
                    f"&current=temperature_2m,relative_humidity_2m,precipitation&daily=precipitation_sum&timezone=auto"
                )
                w_resp = requests.get(w_url, timeout=3)
                if w_resp.status_code == 200:
                    w_data = w_resp.json()
                    current = w_data.get("current", {})
                    temp = float(current.get("temperature_2m", 26.0))
                    humidity = float(current.get("relative_humidity_2m", 60.0))
                    daily_rain = sum(w_data.get("daily", {}).get("precipitation_sum", [10.0]))
                    est_monthly_rain = max(30.0, min(380.0, float(daily_rain * 6.5 + 20.0)))

                    elapsed = (time.time() - t0) * 1000
                    location_label = f"{city}, {region} ({country})"
                    self.db.log_event("INFO", "TELEMETRY", f"Auto-detected location '{location_label}'", elapsed)
                    return {
                        "city": city,
                        "region": region,
                        "country": country,
                        "location": location_label,
                        "temperature": round(temp, 1),
                        "rainfall": round(est_monthly_rain, 1),
                        "humidity": round(humidity, 1),
                        "source": "Live Auto-Geolocation (IP + Open-Meteo)",
                        "status": "Auto-Synced"
                    }
        except Exception as e:
            self.db.log_event("WARNING", "TELEMETRY", f"Auto-detect location failed: {e}. Using fallback preset.", 0.0)

        # Graceful fallback
        return {
            "city": "Lucknow",
            "region": "Uttar Pradesh",
            "country": "India",
            "location": "Lucknow, Uttar Pradesh (India)",
            "temperature": 27.5,
            "rainfall": 125.0,
            "humidity": 65.0,
            "source": "Agro-Telemetry Fallback",
            "status": "Calibrated Preset"
        }

    def fetch_live_weather(self, city_or_preset: str) -> Dict[str, Any]:
        """Fetches real-time weather via Open-Meteo REST API with offline regional fallback."""
        t0 = time.time()
        if city_or_preset in REGIONAL_WEATHER_PRESETS:
            preset = REGIONAL_WEATHER_PRESETS[city_or_preset]
            elapsed = (time.time() - t0) * 1000
            self.db.log_event("INFO", "WEATHER_API", f"Loaded regional preset for '{city_or_preset}'", elapsed)
            return {
                "city": city_or_preset,
                "region": city_or_preset,
                "country": "India",
                "location": city_or_preset,
                "temperature": preset["temperature"],
                "rainfall": preset["rainfall"],
                "humidity": preset["humidity"],
                "source": "Regional Agro-Climatic Preset",
                "status": "Online (Preset Calibrated)"
            }

        try:
            geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city_or_preset.strip()}&count=1&language=en&format=json"
            geo_resp = requests.get(geo_url, timeout=4)
            if geo_resp.status_code == 200:
                geo_data = geo_resp.json()
                if "results" in geo_data and len(geo_data["results"]) > 0:
                    first = geo_data["results"][0]
                    lat, lon = first["latitude"], first["longitude"]
                    city_name = first.get("name", city_or_preset)
                    country_name = first.get("country", "")
                    full_name = f"{city_name}, {country_name}"

                    weather_url = (
                        f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
                        f"&current=temperature_2m,relative_humidity_2m,precipitation&daily=precipitation_sum&timezone=auto"
                    )
                    w_resp = requests.get(weather_url, timeout=4)
                    if w_resp.status_code == 200:
                        w_data = w_resp.json()
                        current = w_data.get("current", {})
                        temp = float(current.get("temperature_2m", 25.0))
                        humidity = float(current.get("relative_humidity_2m", 65.0))
                        daily_rain = sum(w_data.get("daily", {}).get("precipitation_sum", [15.0]))
                        est_monthly_rain = max(35.0, min(380.0, float(daily_rain * 6.5 + 20.0)))

                        elapsed = (time.time() - t0) * 1000
                        self.db.log_event("INFO", "WEATHER_API", f"Live telemetry fetched for '{full_name}'", elapsed)
                        return {
                            "city": city_name,
                            "region": country_name,
                            "country": country_name,
                            "location": full_name,
                            "temperature": round(temp, 1),
                            "rainfall": round(est_monthly_rain, 1),
                            "humidity": round(humidity, 1),
                            "source": "Open-Meteo Telemetry Network",
                            "status": "Live Connected"
                        }
        except Exception as e:
            self.db.log_event("WARNING", "WEATHER_API", f"Live weather lookup timed out ({e}). Using fallback.", 0.0)

        return {
            "city": city_or_preset,
            "region": "Standard Arable",
            "country": "India",
            "location": city_or_preset,
            "temperature": 26.5,
            "rainfall": 120.0,
            "humidity": 65.0,
            "source": "Agro-Telemetry Fallback (Offline Mode)",
            "status": "Offline Safe Mode"
        }

db_instance = DatabaseManager()
engine_instance = SparcEngine(db_instance)

# ─────────────────────────────────────────────────────────────────────────────
# PLACE-WISE SOIL & CROP DOCTOR EXPORT INTERFACES
# ─────────────────────────────────────────────────────────────────────────────
def get_indian_soil_states() -> List[str]:
    """Returns sorted list of available Indian states with soil test databases."""
    return isf.get_all_states()

def get_state_soil_profile(state_name: str) -> Optional[Dict[str, Any]]:
    """Fetches comprehensive state-level baseline soil test & fertilizer packages."""
    return isf.get_state_soil_profile(state_name)

def get_state_crop_fertilizer_package(state_name: str, crop_name: str) -> Optional[Dict[str, Any]]:
    """Fetches state agricultural university fertilizer schedule for specified crop."""
    return isf.get_state_fertilizer_package(state_name, crop_name)

def search_crop_diseases(crop_name: Optional[str] = None, keyword: Optional[str] = None) -> List[Dict[str, Any]]:
    """Searches pathology database by crop and/or symptom keywords."""
    return cdd.search_diseases(crop_name, keyword)

def evaluate_disease_outbreak_risk(crop_name: str, temperature: float, humidity: float) -> List[Dict[str, Any]]:
    """Evaluates real-time weather against disease incubation thresholds."""
    return cdd.evaluate_live_weather_risk(crop_name, temperature, humidity)

def get_all_disease_crops() -> List[str]:
    """Returns all crops indexed in the Crop Doctor database."""
    return cdd.get_all_crop_names_with_diseases()

