# Project SPARC: Smart Python Based Agriculture Recommendation and Classification System

> **Enterprise-grade, Pure-Python Full-Stack Smart Agriculture & Crop Diagnostics Platform**  
> Built with Streamlit, Scikit-Learn, SQLite, and Open-Meteo Telemetry.

---

## 🌟 Key Architecture & Highlights

- **Thematic Opening Animated Logo & Splash Screen:**
  - Obsidian dark-mode canvas (`#0B0F19`) with pulsing emerald (`#10B981`) and electric cyan (`#06B6D4`) cyber-agri SVG emblem.
  - Smooth keyframe animations, dynamic initialization progress tracking, and session-managed state transitions (`st.session_state`).
- **Agronomic Artificial Intelligence Engine:**
  - Multi-class Random Forest Classifier trained on soil macronutrients (N-P-K), rainfall, and temperature across **38 diverse crops** (including Wheat, Sugarcane, Mustard, Potato, Soybean, Groundnut, Tomato, Bajra, Jowar, Barley, Onion, Garlic, Ginger, Turmeric, Chilli, Tea).
  - Multi-parameter physiological stress diagnostics (soil pH acidity/alkalinity, heat stress, drought/flood hazards, nutrient hunger).
  - Target crop compatibility rating (Low Risk, Moderate Risk, High Failure Risk) with actionable "How to Grow Anyway" rescue roadmaps.
- **Place-Wise Indian Soil & Fertilizer Database:**
  - 18-state comprehensive registry covering Alluvial, Black Vertisol, Red Loam, Laterite, Desert Sand, and Mountain soils across India.
  - Baseline available N-P-K (kg/ha), Soil pH, Organic Carbon %, and dominant micronutrient deficiencies (Zinc, Iron, Boron, Sulphur).
  - State Agricultural University / KVK recommended fertilizer packages (Urea, DAP, SSP, MOP, Zinc Sulphate, Gypsum).
  - 1-click "Auto-Fill State Soil Baseline" into the predictive model.
- **Crop Doctor (Plant Pathology & Integrated Pest Management):**
  - Clinical diagnostic database covering 35+ major fungal, bacterial, viral diseases, and insect pests.
  - Real-time weather outbreak risk warning cross-referencing live Open-Meteo temperature and humidity against pathogen incubation thresholds.
  - Integrated cures: Biological biocontrols (*Trichoderma*, *Pseudomonas*, NSKE neem) and CIBRC chemical prescriptions with exact dilution ratios.
  - Interactive Spray Tank Dosage & Dilution Calculator.
- **Precision Fertilizer Prescription Calculator:**
  - Automated translation of soil deficits into commercial fertilizers (Urea, DAP, MOP, Farm Yard Manure).
  - Specific soil conditioners (Agricultural Limestone vs. Gypsum) calculated per acre based on soil pH balance.
- **Robust SQLite Persistence & Full CRUD Pipeline:**
  - Zero-config thread-safe database (`sparc_data.db`).
  - Schema tables: `users`, `sparc_records`, and `system_logs`.
  - In-app historical record filtering, search, update notes, delete, and single-click CSV/JSON export.
- **Live Agro-Climatic Telemetry & Fallbacks:**
  - Real-time physical geolocation via IP matching and Open-Meteo REST API (zero API key required).
  - Pre-calibrated regional climate presets (Indo-Gangetic Basin, Punjab Plains, Deccan Plateau, Semi-Arid Gujarat, Coastal Tropics).

---

## 📂 Project Directory Structure

```text
AgrisenseAI/
├── app.py                   # Main flagship application & animated splash frontend
├── agrisense.py             # Entrypoint compatibility bridge
├── backend.py               # Unified Python Service Layer, SQLite DB & ML Engine
├── india_soil_fertilizer.py # 18-State Indian soil baseline & fertilizer registry
├── crop_disease_doctor.py   # 35+ disease diagnostic & IPM cure knowledgebase
├── crop_data.csv            # Expanded 3,800-row dataset across 38 crops
├── crop_model.pkl           # Pre-trained Scikit-Learn Random Forest model (92.6% acc)
├── sparc_data.db            # Auto-generated SQLite local database
├── requirements.txt         # Minimal, pure-Python dependencies
└── README.md                # System documentation & usage guide
```

---

## 🚀 Quickstart & Installation

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Launch SPARC

Run either:

```bash
streamlit run app.py
```

*(or `streamlit run agrisense.py`)*

The system will display the animated splash screen and transition directly into the operational dashboard.
