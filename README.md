<!-- markdownlint-disable MD013 -->

# SPARC AgriSense AI

## *Smart Python-based Agriculture Recommendation, Classification & Precision Agronomy System*

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_Web_App-black?style=for-the-badge&logo=vercel&logoColor=white)](https://sparc-agri-sense-omega.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Serverless_API-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.30%2B-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)](https://streamlit.io/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-99.3%25_Accuracy-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Supported Crops](https://img.shields.io/badge/Supported_Crops-38_Species-2E7D32?style=for-the-badge&logo=leaf&logoColor=white)](#supported-crops-index-38-crops)
[![Languages](https://img.shields.io/badge/Languages-9_Indian_Languages-E59B2E?style=for-the-badge)](#6-multilingual-localization-9-languages)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **An enterprise-grade, luxury-styled AI agronomy and crop intelligence platform for Indian and global agriculture.**  
> Powered by Machine Learning, real-time agro-climatic telemetry, precision fertilizer deficit modeling, integrated plant pathology diagnostics, ICAR-IISS benchmark soil profiles, and past-season cultivation price benchmarks.

---

[🌐 **Live Web Application**](https://sparc-agri-sense-omega.vercel.app) • [✨ Key Modules](#flagship-modules) • [🌱 38 Supported Crops](#supported-crops-index-38-crops) • [📡 REST API Endpoints](#rest-api-documentation) • [🚀 Quickstart](#quickstart--installation) • [🔄 Auto-Sync](#real-time-github--website-auto-sync)

---

## Architectural Overview

SPARC AgriSense AI combines a high-speed **FastAPI REST API**, a modern **responsive web client**, a rich **Streamlit 3D WebGL dashboard**, and a **Scikit-Learn Random Forest Classifier** into a single unified precision agriculture ecosystem:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SPARC AGRISENSE AI                                     │
├──────────────────┬──────────────────┬──────────────────┬───────────────────────────────┤
│   🌾 CROP AI     │  🧪 COMMERCIAL   │   🩺 CROP        │   📊 PAST SEASON              │
│   RECOMMENDER    │   FERTILIZER     │    DOCTOR        │    BENCHMARKS                 │
│  (38 Crops,      │ (Urea/DAP/MOP    │ (68+ Pathogens,  │ (Top 5 Crops, Mandi Realized  │
│  99.3% Acc.)     │  Commercial Bags)│  All 38 Crops)   │  Prices, MSP & Net Profit)    │
├──────────────────┴──────────────────┴──────────────────┴───────────────────────────────┤
│       🌐 9 INDIAN LANGUAGES: English • हिन्दी • मराठी • ਪੰਜਾਬੀ • ગુજરાતી • తెలుగు ...   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│   🚀 FASTAPI REST API (Vercel Serverless) + MODERN RESPONSIVE SPA (HTML5/CSS3/JS)      │
│   📈 STREAMLIT 3D WebGL DASHBOARD (Plotly Bivariate Response & Spatial Nutrients)      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│   🛰️ LIVE TELEMETRY: Open-Meteo REST API • IMD Agromet • Geolocation Sensing          │
│   💾 PERSISTENCE: SQLite (sparc_data.db & sparc_history.db) Transaction Databases      │
│   🔄 AUTO-SYNC: One-Click Git Watcher (sync.bat & auto_sync_watcher.py)                │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Flagship Modules

### 1. AI Multi-Crop Recommendation Engine

- **38 Crop Species:** Spans cereals, pulses, cash crops, oilseeds, spices, horticulture, and commercial plantations.
- **Trained Scikit-Learn Model:** 3,800-row agro-climatic dataset with **99.3% cross-validated classification accuracy** using Random Forest and Gradient Boosting.
- **Physiological Stress Diagnostics:** Multi-parameter evaluation assessing soil pH acidity/alkalinity, heat stress, drought/flood hazards, and nutrient hunger.
- **Actionable Rescue Protocols:** "How to Grow Anyway" mitigation recommendations even for suboptimal or secondary crop matches.

### 2. Precision Soil Health & Commercial Fertilizer Prescriber

- **Elemental Deficit Mapping:** Translates macronutrient deficits ($\Delta N, \Delta P, \Delta K$ in kg/ha) into exact field requirements.
- **Direct Commercial Mandi Bag Conversions:** Instantly computes the exact number of bags farmers need to buy:
  - **Urea** ($46\% \text{ N}$ - 45 kg standard bags)
  - **DAP - Di-Ammonium Phosphate** ($18\% \text{ N}, 46\% \text{ P}_2\text{O}_5$ - 50 kg bags)
  - **MOP - Muriate of Potash** ($60\% \text{ K}_2\text{O}$ - 50 kg bags)
- **Flexible Land Area Units:** Supports conversions across **Acre**, **Bigha** (0.62 Acre), **Hectare** (2.47 Acre), and **Guntha** (0.025 Acre).
- **Soil pH Conditioners:** Calculates agricultural lime or gypsum applications (kg/acre) to correct soil acidity or alkalinity.

### 3. Official Past Season Cultivation & Realized Benchmark Records

- **Top 5 Benchmark Crops:** **Paddy / Rice** (*PR-126*), **Wheat** (*HD-2967*), **Cotton** (*RCH-659*), **Maize** (*DKC-9108*), and **Sugarcane** (*Co-0238*).
- **Mandi Realized Prices vs. MSP:** Displays actual harvest prices received in Mandis per quintal alongside government Minimum Support Prices (MSP).
- **Financial Realization:** Clear breakdown of gross revenue per hectare and net profit per acre.
- **Problem Faced During Cultivation:** Documented real-world agronomic challenges (e.g., leaf blast, terminal heat waves, pink bollworm rosette attacks, fall armyworm, shoot borer).
- **ICAR/SAU Mitigation Packages:** Proven foliar sprays, split nutrition applications, and IPM packages applied to recover yield.
- **Interactive Multi-Crop Filtering:** Filter chips to instantly switch between benchmark crops.

### 4. Crop Doctor (Plant Pathology & Integrated Pest Management)

- **100% Crop Coverage (All 38 Crops):** Comprehensive disease diagnosis and management protocols for every supported crop.
- **68+ Pathogen Clinical Knowledgebase:** Deep coverage of fungal blights, rusts, smuts, bacterial wilts, tospoviruses, geminiviruses, and destructive insect borers.
- **Dual-Track Treatment Roadmaps:**
  - 🌿 **Biological Bio-Controls:** *Trichoderma harzianum*, *Bacillus subtilis*, *Pseudomonas fluorescens*, and Neem-based biopesticides.
  - ⚡ **Targeted Chemical Treatments:** Approved fungicide/insecticide formulations (e.g., Hexaconazole, Validamycin, Chlorantraniliprole) with exact dosage and spray guidance.

### 5. Search & Diagnostic History Manager

- **Complete Activity Tracking:** Automatically saves every crop recommendation, fertilizer calculation, and disease diagnosis to SQLite and local storage.
- **One-Click Restoration:** Re-populates all form sliders and inputs with a single click to compare or re-run historical tests.
- **Category Filtering & Cleanup:** Filter history by *All*, *Crop Advisory*, *Fertilizer*, or *Pest Doctor*, with individual delete or full history clearing.

### 6. Multilingual Localization (9 Languages)

SPARC AgriSense AI natively supports 9 Indian languages with dynamic real-time language switching:

- **English** (`en`)
- **हिन्दी - Hindi** (`hi`)
- **मराठी - Marathi** (`mr`)
- **ਪੰਜਾਬੀ - Punjabi** (`pa`)
- **ગુજરાતી - Gujarati** (`gu`)
- **తెలుగు - Telugu** (`te`)
- **தமிழ் - Tamil** (`ta`)
- **বাংলা - Bengali** (`bn`)
- **ಕನ್ನಡ - Kannada** (`kn`)

Translates all interface elements, input labels, diagnostics, disease symptoms, treatments, and past-season benchmark descriptions.

### 7. Interactive Launch Preloader

- A modern, high-tech preloader simulating real-time telemetry connections to **ISRO Bhuvan satellites**, **IMD Agromet radar**, and **ICAR soil health registries**.
- 5-second automatic launch with an instant **"Skip to App →"** override button.

---

## Supported Crops Index (38 Crops)

| Category | Crops Included |
| :--- | :--- |
| **Cereals & Grains** | Rice (Paddy), Wheat, Maize, Barley, Bajra (Pearl Millet), Jowar (Sorghum) |
| **Pulses & Legumes** | Chickpea, Kidney Beans, Pigeon Peas, Moth Beans, Mung Bean, Black Gram, Lentil |
| **Cash & Commercial** | Cotton, Jute, Sugarcane, Coffee, Tea |
| **Oilseeds** | Mustard, Soybean, Groundnut |
| **Spices & Condiments** | Onion, Garlic, Ginger, Turmeric, Chilli |
| **Vegetables & Greens** | Potato, Tomato |
| **Fruits & Plantation** | Pomegranate, Banana, Mango, Grapes, Watermelon, Muskmelon, Apple, Orange, Papaya, Coconut |

---

## REST API Documentation

SPARC AgriSense AI provides a full set of JSON REST API endpoints powered by FastAPI:

### 1. Crop Recommendation

```http
POST /api/predict
Content-Type: application/json

{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 26.5,
  "humidity": 80.0,
  "ph": 6.5,
  "rainfall": 202.0
}
```

### 2. Fertilizer Prescription & Commercial Bags

```http
POST /api/fertilizer-calc
Content-Type: application/json

{
  "crop": "rice",
  "current_n": 80,
  "current_p": 35,
  "current_k": 30,
  "current_ph": 6.2,
  "land_area": 2.5,
  "land_unit": "acre"
}
```

### 3. Past Season Benchmark Records

```http
GET /api/past-season-records
```

*Returns official benchmark records for the top 5 crops including realized Mandi prices, MSP, gross revenue, net profit per acre, problems faced, and mitigation packages.*

### 4. Disease Diagnostics (Crop Doctor)

```http
GET /api/diseases?crop=rice
```

### 5. State Soil Baseline Profiles

```http
GET /api/soil-states
GET /api/soil-profile?state=punjab
```

---

## Quickstart & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Shikhar28007/SPARC--agri_sense.git
cd SPARC--agri_sense
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Launch the Application

#### Option A: Modern Web App (FastAPI Backend + Responsive Client)

```bash
python -m uvicorn api.index:app --reload --port 8000
```

Open your browser to `http://localhost:8000`.

#### Option B: Streamlit 3D WebGL Dashboard

```bash
streamlit run app.py
```

*(or `streamlit run agrisense.py`)*  
Open your browser to `http://localhost:8501`.

---

## Real-Time GitHub & Website Auto-Sync

This repository includes synchronization scripts to push local edits automatically:

### One-Click Sync (`sync.bat`)

Double-click **[`sync.bat`](sync.bat)** in Windows:

- **Option [1]:** Stage, commit, and push changes immediately.
- **Option [2]:** Start the real-time background file watcher.

### Hands-Free Background Watcher (`auto_sync_watcher.py`)

```bash
python auto_sync_watcher.py
```

Monitors project files and automatically commits and pushes changes directly to `origin main`.

---

## Live Web Deployments

- **Production Web Application (Vercel):** [https://sparc-agri-sense-omega.vercel.app](https://sparc-agri-sense-omega.vercel.app)
- **Streamlit Community Cloud:** Configure `agrisense.py` as the entrypoint for continuous deployment on [share.streamlit.io](https://share.streamlit.io).

---

## Repository File Structure

```text
SPARC--agri_sense/
├── index.html               # Flagship Modern Responsive Single Page Web Application
├── style.css                # Enterprise design system, responsive grids & themes
├── app.js                   # Client-side state manager, 9-language i18n & telemetry
├── backend.py               # ML Engine, Scikit-Learn pipelines & SQLite persistence
├── vercel.json              # Vercel serverless routing & API rewrite rules
├── api/
│   └── index.py             # FastAPI REST API endpoints & serverless handler
├── public/                  # Vercel deployment assets (mirrors web frontend)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── app.py                   # Streamlit 3D WebGL UI & interactive dashboards
├── agrisense.py             # Streamlit dual-entrypoint bridge
├── india_soil_fertilizer.py # 18-State Indian soil registry & SAU fertilizer benchmarks
├── crop_disease_doctor.py   # 68+ pathogen diagnostic & IPM treatment engine
├── crop_data.csv            # 3,800-row expanded agronomic dataset across 38 crops
├── crop_model.pkl           # Trained Random Forest Model (99.3% accuracy)
├── sparc_data.db            # SQLite persistence database (soil baselines & past records)
├── sparc_history.db         # SQLite farmer search & calculation history store
├── auto_sync_watcher.py     # Real-time file system watcher & GitHub auto-push
├── sync.bat                 # One-click Windows sync utility script
├── requirements.txt         # Production Python dependencies
└── README.md                # System documentation
```

---

## Author & Maintainer

**Shikhar** ([@Shikhar28007](https://github.com/Shikhar28007))  
*Developer & Lead Architect of Project SPARC*  
GitHub: [https://github.com/Shikhar28007/SPARC--agri_sense](https://github.com/Shikhar28007/SPARC--agri_sense)

---

*Built with ❤️ for Indian Farmers, Agronomists, and the Future of Sustainable Precision Agriculture.*
