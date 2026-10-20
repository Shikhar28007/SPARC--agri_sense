<div align="center">

# 🌿 SPARC : AgriSense AI
### *Smart Python-based Agriculture Recommendation, Classification & Precision Agronomy System*

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.30%2B-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)](https://streamlit.io/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Plotly 3D](https://img.shields.io/badge/Plotly-3D_WebGL-3F4F75?style=for-the-badge&logo=plotly&logoColor=white)](https://plotly.com/)
[![Accuracy](https://img.shields.io/badge/Model_Accuracy-99.3%25-10B981?style=for-the-badge&logo=checkmarx&logoColor=white)](#-machine-learning-performance)
[![Crops](https://img.shields.io/badge/Supported_Crops-38_Species-D4AF37?style=for-the-badge&logo=leaf&logoColor=white)](#-supported-crops-index)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br/>

> **An enterprise-grade, luxury-styled AI agronomy and crop intelligence platform for Indian and global agriculture.**  
> Powered by Machine Learning, real-time agro-climatic telemetry, 3D WebGL nutrient physics, integrated plant pathology diagnostics, and ICAR-IISS benchmark soil profiles.

---

[⚡ Live Demo](#-live-web-deployment) • [✨ Key Modules](#-flagship-modules) • [🌱 38 Supported Crops](#-supported-crops-index) • [🚀 Quickstart](#-quickstart--installation) • [🔄 Auto-Sync Guide](#-real-time-github--website-auto-sync)

---

</div>

## 🌟 Architectural Overview

SPARC (**Smart Python-based Agriculture Recommendation and Classification**) is a full-stack agronomic diagnostic suite designed to provide smallholder farmers, agronomists, and commercial agricultural planners with precise, data-driven farming intelligence:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SPARC AGRISENSE AI ENGINE                       │
├─────────────────┬──────────────────┬─────────────────┬─────────────────┤
│   🌾 CROP AI    │  🧪 FERTILIZER   │   🩺 CROP       │   🗺️ INDIAN     │
│   RECOMMENDER   │   PRESCRIPTIONS  │    DOCTOR       │    SOIL MAP     │
│  (38 Crops,     │ (Elemental NPK   │ (35+ Pathogens, │ (18 States,     │
│  99.3% Acc.)    │  Deficit Model)  │  IPM Cures)     │  ICAR Profiles) │
├─────────────────┴──────────────────┴─────────────────┴─────────────────┤
│         🌐 3D WebGL SPATIAL NUTRIENT INTELLIGENCE (PLOTLY)             │
│      [Simple 3D Line Comparison • Dual Pillars • 2D Direct View]       │
├────────────────────────────────────────────────────────────────────────┤
│     🛰️ LIVE TELEMETRY: Open-Meteo REST API • Geolocation Sensing       │
│     💾 PERSISTENCE: SQLite (sparc_data.db) Thread-Safe Transaction DB   │
│     🔄 AUTO-SYNC: One-Click Git Watcher (sync.bat & auto_sync_watcher) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Flagship Modules

### 1. 🌾 AI Multi-Crop Recommendation Engine
- **38 Diverse Crop Species:** Supports cereals, pulses, cash crops, oilseeds, spices, horticulture, and commercial plantations.
- **Trained Scikit-Learn Model:** 3,800-row agro-climatic dataset with 99.3% cross-validated classification accuracy.
- **Stress & Risk Diagnostics:** Multi-parameter physiological stress diagnostics (soil pH acidity/alkalinity, heat stress, drought/flood hazards, nutrient hunger).
- **"How to Grow Anyway" Rescue Protocols:** Actionable step-by-step mitigation advice even for suboptimal or high-risk crops.

### 2. 🧪 Precision Soil Health & Fertilizer Prescriber
- **Quantitative Deficit Mapping:** Translates elemental macronutrient deficits ($\Delta N, \Delta P, \Delta K$ in kg/ha) into exact commercial fertilizer doses:
  - **Urea** ($46\% \text{ N}$)
  - **DAP - Di-Ammonium Phosphate** ($18\% \text{ N}, 46\% \text{ P}_2\text{O}_5$)
  - **MOP - Muriate of Potash** ($60\% \text{ K}_2\text{O}$)
- **pH Calibration & Conditioners:** Specific agricultural lime or gypsum doses (kg/acre) calculated automatically based on soil acidity or alkalinity.

### 3. 🌐 3D WebGL Nutrient Spatial Intelligence
- **📈 3D Simple Line Comparison (Default):** Dual-profile continuous line showing Current Field values (Electric Cyan) vs. Target Optimum with distinct nutrient colors:
  - 🟡 **Required Nitrogen (N):** 24K Royal Gold
  - 🔴 **Required Phosphorus (P):** Radiant Coral Ruby
  - 🟢 **Required Potassium (K):** Vivid Emerald
  - **Clean Deficit Bridges:** Direct vertical dashed connector pillars showing exact shortfall (`+X kg/ha needed`) or `Balanced ✓`.
- **📊 3D Side-by-Side Dual Columns:** Extruded 3D pillars comparing Current vs. Target side-by-side for zero-friction understanding.
- **🎯 2D High-Clarity View:** Ultra-clean flat grouped comparison for mobile displays or instant viewing.
- **🏔️ 3D Quadratic Yield Response Landscape:** Agronomic quadratic bivariate yield mountain with floor contour projections.

### 4. 🩺 Crop Doctor (Plant Pathology & Integrated Pest Management)
- **35+ Disease Knowledgebase:** Clinical coverage of fungal blights, bacterial wilts, viruses, and insect pests.
- **Real-Time Outbreak Warning:** Cross-references live ambient temperature and relative humidity from Open-Meteo against pathogen incubation thresholds.
- **Dual-Track Treatment Roadmaps:**
  - 🌿 **Biological Bio-Controls:** *Trichoderma viride*, *Pseudomonas fluorescens*, Neem Kernel Extract (NSKE), and cultural sanitation.
  - ⚡ **Chemical Prescriptions:** CIBRC-approved formulations with exact dilution rates (ml/g per liter).
- **Spray Tank Dilution Calculator:** Instant tank volume and total chemical requirement calculation.

### 5. 🗺️ Place-Wise Indian Soil & Fertilizer Registry
- **18 Major Agricultural States & Zones:**
  *Punjab, Haryana, Uttar Pradesh, Bihar, West Bengal, Assam, Odisha, Andhra Pradesh, Telangana, Tamil Nadu, Karnataka, Kerala, Maharashtra, Gujarat, Madhya Pradesh, Rajasthan, Chhattisgarh, Jharkhand.*
- **ICAR-IISS Benchmark Soil Profiles:** Baseline N-P-K (kg/ha), Soil pH, Organic Carbon %, and dominant micronutrient deficiencies (Zinc, Boron, Iron, Sulphur).
- **1-Click Baseline Auto-Fill:** Instantly populates your active field model with official regional soil parameters.

---

## 🌱 Supported Crops Index (38 Crops)

| Category | Crops Included |
| :--- | :--- |
| **Cereals & Grains** | Rice, Wheat, Maize, Barley, Bajra (Pearl Millet), Jowar (Sorghum) |
| **Pulses & Legumes** | Chickpea, Kidney Beans, Pigeon Peas, Moth Beans, Mung Bean, Black Gram, Lentil |
| **Cash & Commercial**| Cotton, Jute, Sugarcane, Coffee, Tea |
| **Oilseeds** | Mustard, Soybean, Groundnut |
| **Spices & Condiments**| Onion, Garlic, Ginger, Turmeric, Chilli |
| **Vegetables & Greens**| Potato, Tomato |
| **Fruits & Plantation**| Pomegranate, Banana, Mango, Grapes, Watermelon, Muskmelon, Apple, Orange, Papaya, Coconut |

---

## 🚀 Quickstart & Installation

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
```bash
streamlit run app.py
```
*(or run `streamlit run agrisense.py`)*

The system will initialize the luxury splash sequence and automatically transition to the full interactive agronomy dashboard at `http://localhost:8501`.

---

## 🔄 Real-Time GitHub & Website Auto-Sync

This repository includes built-in real-time synchronization utilities so any local code edits automatically reflect on GitHub and your live website:

### Option A: One-Click Sync (`sync.bat`)
Simply double-click **[`sync.bat`](sync.bat)** in Windows:
```
=====================================================================
  🌿 SPARC AgriSense AI - GitHub & Live Website Sync Engine
  Repository: https://github.com/Shikhar28007/SPARC--agri_sense
=====================================================================

Choose an option:
  [1] Sync & Push to GitHub NOW (Immediate Update)
  [2] Start Real-Time Auto-Watcher (Auto-pushes whenever files change)
  [3] Exit
```
- Option `1` stages, commits, and pushes your changes in 2 seconds.
- Option `2` starts a background watcher that detects every file save and auto-pushes to GitHub!

### Option B: Hands-Free Background Watcher (`auto_sync_watcher.py`)
Run the background file watcher directly in your terminal:
```bash
python auto_sync_watcher.py
```
Any modification saved in `.py`, `.csv`, `.toml`, or `.md` files will trigger an automatic, debounced git commit and push directly to `origin main`!

---

## 🌐 Live Web Deployment (Streamlit Community Cloud)

You can host this application online for free with **continuous deployment**:

1. Log in to [share.streamlit.io](https://share.streamlit.io) using your GitHub account (`Shikhar28007`).
2. Click **"New App"** and configure:
   - **Repository:** `Shikhar28007/SPARC--agri_sense`
   - **Branch:** `main`
   - **Main file path:** `agrisense.py` (or `app.py`)
3. Click **Deploy!**
4. **Real-Time Continuous Integration:** Every time you push via `sync.bat` or `auto_sync_watcher.py`, Streamlit Community Cloud automatically rebuilds and updates the public website within 30–60 seconds!

---

## 📁 Repository File Structure

```text
SPARC--agri_sense/
├── app.py                   # Flagship Luxury 3D UI, Streamlit frontend & 3D WebGL engine
├── agrisense.py             # Dual-entrypoint compatibility bridge
├── backend.py               # Service Layer, Scikit-Learn Agronomic Engine & SQLite persistence
├── india_soil_fertilizer.py # 18-State Indian soil registry & SAU fertilizer packages
├── crop_disease_doctor.py   # 35+ disease pathology diagnostic & IPM cure engine
├── crop_data.csv            # 3,800-row expanded agronomic dataset across 38 crops
├── crop_model.pkl           # Trained Random Forest Model (99.3% cross-validation accuracy)
├── auto_sync_watcher.py     # Real-time file system watcher & automatic GitHub auto-push
├── sync.bat                 # One-click Windows sync utility script
├── sparc_data.db            # Auto-initialized SQLite persistence database
├── requirements.txt         # Production Python dependencies
├── .streamlit/
│   └── config.toml          # Luxury obsidian-gold dark mode configuration
└── README.md                # Decorated system documentation
```

---

## 👤 Author & Maintainer

**Shikhar** ([@Shikhar28007](https://github.com/Shikhar28007))  
*Developer & Lead Architect of Project SPARC AgriSense AI*  
GitHub: [https://github.com/Shikhar28007/SPARC--agri_sense](https://github.com/Shikhar28007/SPARC--agri_sense)

---

<div align="center">
  <sub>Built with ❤️ for Indian Farmers, Agronomists, and the Future of Precision Sustainable Agriculture.</sub>
</div>
