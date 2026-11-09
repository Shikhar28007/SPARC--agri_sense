/**
 * SPARC AI — Precision Agronomic Client Controller
 * Connects Vercel Web UI to FastAPI Agronomic Intelligence Endpoints & Plotly Visualizations
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Global State ──
  const state = {
    currentCity: 'Pune',
    currentZone: 'Western Maharashtra (Zone IX)',
    currentWeather: {
      temperature: 26.5,
      humidity: 76.0,
      rainfall: 210.0,
    },
    soilTexture: 'black',
    crops: [],
    diseaseCrops: [],
    indianStates: [],
    lastFertData: null,
    activeChartMode: 'bar',
    language: localStorage.getItem('agrisense_lang') || 'hi',
    lastRecommendationsData: null
  };

  // ── DOM References ──
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Sliders & Value Displays
  const sliders = {
    n: document.getElementById('slider-n'),
    p: document.getElementById('slider-p'),
    k: document.getElementById('slider-k'),
    temp: document.getElementById('slider-temp'),
    hum: document.getElementById('slider-hum'),
    ph: document.getElementById('slider-ph'),
    rain: document.getElementById('slider-rain'),
  };

  const displays = {
    n: document.getElementById('val-n'),
    p: document.getElementById('val-p'),
    k: document.getElementById('val-k'),
    temp: document.getElementById('val-temp'),
    hum: document.getElementById('val-hum'),
    ph: document.getElementById('val-ph'),
    rain: document.getElementById('val-rain'),
  };

  // Inputs for Steppers
  const inputs = {
    n: document.getElementById('input-n'),
    p: document.getElementById('input-p'),
    k: document.getElementById('input-k'),
  };

  // Fertilizer Inputs
  const fertSliders = {
    n: document.getElementById('slider-fert-n'),
    p: document.getElementById('slider-fert-p'),
    k: document.getElementById('slider-fert-k'),
    ph: document.getElementById('slider-fert-ph'),
  };

  const fertDisplays = {
    n: document.getElementById('val-fert-n'),
    p: document.getElementById('val-fert-p'),
    k: document.getElementById('val-fert-k'),
    ph: document.getElementById('val-fert-ph'),
  };

  // Telemetry DOM
  const telemetryTemp = document.getElementById('telemetry-temp');
  const telemetryHumidity = document.getElementById('telemetry-humidity');
  const telemetryRain = document.getElementById('telemetry-rain');
  const zoneLabel = document.getElementById('zone-label');
  const zoneMonsoonText = document.getElementById('zone-monsoon-text');
  const zoneConditionPill = document.getElementById('zone-condition-pill');
  const btnDetectGps = document.getElementById('btn-detect-gps');
  const btnChangeCity = document.getElementById('btn-change-city');
  const btnSyncWeather = document.getElementById('btn-sync-weather');
  const btnResetDefaults = document.getElementById('btn-reset-defaults');

  // City Modal DOM
  const cityModal = document.getElementById('city-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const citySearchInput = document.getElementById('city-search-input');
  const citySearchBtn = document.getElementById('city-search-btn');
  const cityPresetChips = document.querySelectorAll('.preset-chip');

  // District Quick Chips
  const districtChips = document.querySelectorAll('.dist-chip');

  // Forms & Actions
  const cropForm = document.getElementById('crop-form');
  const selectTargetCrop = document.getElementById('select-target-crop');
  const predictSpinner = document.getElementById('predict-spinner');
  const cropPlaceholder = document.getElementById('crop-placeholder');
  const recommendationsList = document.getElementById('recommendations-list');
  const resultsStatus = document.getElementById('results-status');

  const fertForm = document.getElementById('fert-form');
  const fertSpinner = document.getElementById('fert-spinner');
  const fertPlaceholder = document.getElementById('fert-placeholder');
  const fertContent = document.getElementById('fert-content');
  const fertCropSelect = document.getElementById('fert-crop-select');
  const fertStateSelect = document.getElementById('fert-state-select');

  // Disease Doctor DOM
  const doctorCropSelect = document.getElementById('doctor-crop-select');
  const doctorSearchInput = document.getElementById('doctor-search-input');
  const btnSearchDisease = document.getElementById('btn-search-disease');
  const diseaseResultsContainer = document.getElementById('disease-results-container');
  const doctorRiskBanner = document.getElementById('doctor-risk-banner');
  const riskItemsList = document.getElementById('risk-items-list');
  const riskCropName = document.getElementById('risk-crop-name');

  // Soil Registry DOM
  const stateDropdown = document.getElementById('state-dropdown');
  const statePlaceholder = document.getElementById('state-placeholder');
  const stateContent = document.getElementById('state-content');

// ─────────────────────────────────────────────────────────────────────────
  // OPENING SEQUENCE LOADING SPLASH SCREEN (5-SECOND INTRO CALIBRATION)
  // ─────────────────────────────────────────────────────────────────────────
  const splashScreen = document.getElementById('opening-splash-screen');
  const splashProgressFill = document.getElementById('splash-progress-fill');
  const splashStatusText = document.getElementById('splash-status-text');
  const splashPctText = document.getElementById('splash-pct-text');
  const splashCountdown = document.getElementById('splash-seconds-countdown');
  const btnSplashSkip = document.getElementById('btn-splash-skip');

  const calibSteps = [
    document.getElementById('calib-step-1'),
    document.getElementById('calib-step-2'),
    document.getElementById('calib-step-3'),
    document.getElementById('calib-step-4')
  ];

  const splashMessages = [
    { atPct: 0, text: '🛰️ Connecting to ISRO Bhuvan & IMD Meteorological Satellites...', step: 0 },
    { atPct: 22, text: '🌱 Calibrating ICAR-IISS Soil Health & Regional NPK Matrices...', step: 1 },
    { atPct: 52, text: '🔬 Loading 68+ Crop Pathology Diagnostic Doctor Models...', step: 2 },
    { atPct: 78, text: '🌾 Synchronizing State Agricultural University Fertilizer Packages...', step: 3 },
    { atPct: 96, text: '✅ Calibration Complete: Launching SPARC AgriSense Workspace...', step: 3 }
  ];

  let splashStartTime = null;
  const SPLASH_DURATION = 5000; // Exact 5-second delay rate
  let splashAnimId = null;

  function dismissSplashScreen() {
    if (!splashScreen || splashScreen.classList.contains('is-dismissed')) return;
    if (splashAnimId) cancelAnimationFrame(splashAnimId);
    splashScreen.classList.add('is-dismissed');
    splashScreen.style.pointerEvents = 'none';
    setTimeout(() => {
      splashScreen.style.display = 'none';
    }, 650);
  }

  let splashStarted = false;
  function initOpeningSequence() {
    if (!splashScreen || splashStarted) return;
    splashStarted = true;

    // Attach skip button listener immediately
    if (btnSplashSkip) {
      btnSplashSkip.onclick = (e) => {
        if (e) e.preventDefault();
        dismissSplashScreen();
      };
    }

    // Safety fallback timer: guarantee dismissal after 5.3s even if rAF stalls
    setTimeout(dismissSplashScreen, 5300);

    // Escape key shortcut to skip
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') dismissSplashScreen();
    }, { once: true });

    function updateSplashProgress(timestamp) {
      if (!splashStartTime) splashStartTime = timestamp;
      const elapsed = timestamp - splashStartTime;
      const progress = Math.min(1, elapsed / SPLASH_DURATION);
      const pct = Math.round(progress * 100);

      if (splashProgressFill) {
        splashProgressFill.style.width = `${pct}%`;
      }
      if (splashPctText) {
        splashPctText.textContent = `${pct}%`;
      }

      const remainingSecs = Math.max(1, Math.ceil((SPLASH_DURATION - elapsed) / 1000));
      if (splashCountdown) {
        splashCountdown.textContent = remainingSecs;
      }

      for (let i = splashMessages.length - 1; i >= 0; i--) {
        if (pct >= splashMessages[i].atPct) {
          if (splashStatusText) splashStatusText.textContent = splashMessages[i].text;
          const activeIdx = splashMessages[i].step;
          calibSteps.forEach((st, sIdx) => {
            if (st) {
              if (sIdx <= activeIdx) st.classList.add('active');
              else st.classList.remove('active');
            }
          });
          break;
        }
      }

      if (progress < 1) {
        splashAnimId = requestAnimationFrame(updateSplashProgress);
      } else {
        setTimeout(dismissSplashScreen, 300);
      }
    }

    splashAnimId = requestAnimationFrame(updateSplashProgress);
  }

  // Start Opening Sequence immediately
  initOpeningSequence();


  // ─────────────────────────────────────────────────────────────────────────
  // 1. TAB NAVIGATION
  // ─────────────────────────────────────────────────────────────────────────
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      if (targetTab === 'weather-alerts') {
        if (cityModal) cityModal.classList.add('open');
        return;
      }

      navTabs.forEach(t => t.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPanel = document.getElementById(targetTab);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      if (targetTab === 'fertilizer-prescriber' && state.lastFertData && window.Plotly) {
        setTimeout(() => window.Plotly.Plots.resize('fert-plotly-chart'), 100);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. SLIDERS & STEPPERS SYNC
  // ─────────────────────────────────────────────────────────────────────────
  // Stepper [+] and [-] buttons
  document.querySelectorAll('.stepper-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const isInc = btn.classList.contains('btn-inc');
      const inputEl = inputs[target];
      const sliderEl = sliders[target];
      if (!inputEl) return;

      let val = parseInt(inputEl.value, 10) || 0;
      val = isInc ? val + 2 : val - 2;
      if (val < 0) val = 0;
      if (val > 300) val = 300;

      inputEl.value = val;
      if (sliderEl) sliderEl.value = val;
      if (displays[target]) displays[target].textContent = val;
      updateNutrientStatusPill(target, val);
    });
  });

  // Direct typing into stepper input
  Object.keys(inputs).forEach(key => {
    const inputEl = inputs[key];
    if (inputEl) {
      inputEl.addEventListener('input', (e) => {
        let val = parseInt(e.target.value, 10) || 0;
        if (sliders[key]) sliders[key].value = val;
        if (displays[key]) displays[key].textContent = val;
        updateNutrientStatusPill(key, val);
      });
    }
  });

  // Range Sliders (Temperature & Rainfall)
  if (sliders.temp) {
    sliders.temp.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value).toFixed(1);
      if (displays.temp) displays.temp.textContent = val;
      if (telemetryTemp) telemetryTemp.textContent = `${val}°C`;
      updateConditionPill(val);
    });
  }

  if (sliders.rain) {
    sliders.rain.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (displays.rain) displays.rain.textContent = val;
      if (zoneMonsoonText) zoneMonsoonText.textContent = `${val} mm`;
    });
  }

  // Fertilizer sliders
  Object.keys(fertSliders).forEach(key => {
    if (fertSliders[key] && fertDisplays[key]) {
      fertSliders[key].addEventListener('input', (e) => {
        fertDisplays[key].textContent = e.target.value;
      });
    }
  });

  function updateConditionPill(temp) {
    if (!zoneConditionPill) return;
    const t = parseFloat(temp);
    zoneConditionPill.classList.remove('zone-pill-humid', 'zone-pill-warm', 'zone-pill-cool');
    if (t > 32) {
      zoneConditionPill.textContent = 'Hot / Semi-Arid';
      zoneConditionPill.classList.add('zone-pill-warm');
    } else if (t < 20) {
      zoneConditionPill.textContent = 'Cool / Temperate';
      zoneConditionPill.classList.add('zone-pill-cool');
    } else {
      zoneConditionPill.textContent = 'Humid';
      zoneConditionPill.classList.add('zone-pill-humid');
    }
  }

  function updateNutrientStatusPill(nutrient, val) {
    const row = inputs[nutrient]?.closest('.nutrient-row-item');
    if (!row) return;
    const markers = row.querySelectorAll('.nut-marker');
    if (markers.length < 3) return;

    markers.forEach(m => m.classList.remove('active-pill'));
    if (nutrient === 'n') {
      if (val < 50) markers[0].classList.add('active-pill');
      else if (val <= 140) markers[1].classList.add('active-pill');
      else markers[2].classList.add('active-pill');
    } else if (nutrient === 'p') {
      if (val < 20) markers[0].classList.add('active-pill');
      else if (val <= 80) markers[1].classList.add('active-pill');
      else markers[2].classList.add('active-pill');
    } else if (nutrient === 'k') {
      if (val < 25) markers[0].classList.add('active-pill');
      else if (val <= 90) markers[1].classList.add('active-pill');
      else markers[2].classList.add('active-pill');
    }
    updateSoilSpectrum(
      parseInt(inputs.n?.value || 92, 10),
      parseInt(inputs.p?.value || 46, 10),
      parseInt(inputs.k?.value || 44, 10),
      parseFloat(sliders.ph?.value || 6.8)
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. DISTRICT PRESETS & DEFAULTS
  // ─────────────────────────────────────────────────────────────────────────
  const KNOWN_DISTRICTS = {
    pune: {
      city: 'Pune',
      state: 'Maharashtra',
      specificLocation: 'Haveli, Pune (411001), Maharashtra',
      zone: 'Western Plateau and Hills (Zone 9)',
      lat: 18.52,
      lon: 73.85,
      temp: 26.5,
      rain: 210,
      humidity: 72,
      n: 92, p: 46, k: 44
    },
    nashik: {
      city: 'Nashik',
      state: 'Maharashtra',
      specificLocation: 'Nashik Road, Nashik (422001), Maharashtra',
      zone: 'Western Plateau and Hills (Zone 9)',
      lat: 19.99,
      lon: 73.78,
      temp: 25.0,
      rain: 185,
      humidity: 68,
      n: 85, p: 42, k: 50
    },
    nagpur: {
      city: 'Nagpur',
      state: 'Maharashtra',
      specificLocation: 'Sitabuldi, Nagpur (440001), Maharashtra',
      zone: 'Eastern Plateau and Hills (Zone 7)',
      lat: 21.14,
      lon: 79.08,
      temp: 29.0,
      rain: 240,
      humidity: 65,
      n: 78, p: 38, k: 62
    },
    indore: {
      city: 'Indore',
      state: 'Madhya Pradesh',
      specificLocation: 'Palasia, Indore (452001), Madhya Pradesh',
      zone: 'Central Plateau and Hills (Zone 8)',
      lat: 22.71,
      lon: 75.85,
      temp: 27.5,
      rain: 195,
      humidity: 60,
      n: 82, p: 40, k: 48
    },
    kolhapur: {
      city: 'Kolhapur',
      state: 'Maharashtra',
      specificLocation: 'Shahupuri, Kolhapur (416001), Maharashtra',
      zone: 'Western Plateau and Hills (Zone 9)',
      lat: 16.70,
      lon: 74.24,
      temp: 26.0,
      rain: 310,
      humidity: 78,
      n: 95, p: 50, k: 54
    },
    ludhiana: {
      city: 'Ludhiana',
      state: 'Punjab',
      specificLocation: 'Civil Lines, Ludhiana (141001), Punjab',
      zone: 'Trans-Gangetic Plain (Zone 6)',
      lat: 30.90,
      lon: 75.85,
      temp: 28.0,
      rain: 160,
      humidity: 66,
      n: 110, p: 48, k: 40
    },
    varanasi: {
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      specificLocation: 'Cantonment, Varanasi (221002), Uttar Pradesh',
      zone: 'Middle Gangetic Plain (Zone 4)',
      lat: 25.31,
      lon: 82.97,
      temp: 29.5,
      rain: 225,
      humidity: 74,
      n: 88, p: 44, k: 42
    },
    prayagraj: {
      city: 'Prayagraj',
      state: 'Uttar Pradesh',
      specificLocation: 'Civil Lines, Prayagraj (211001), Uttar Pradesh',
      zone: 'Middle Gangetic Plain (Zone 4)',
      lat: 25.45,
      lon: 81.84,
      temp: 29.0,
      rain: 215,
      humidity: 70,
      n: 90, p: 45, k: 42
    },
    lucknow: {
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      specificLocation: 'Hazratganj, Lucknow (226001), Uttar Pradesh',
      zone: 'Middle Gangetic Plain (Zone 4)',
      lat: 26.84,
      lon: 80.94,
      temp: 28.5,
      rain: 210,
      humidity: 72,
      n: 88, p: 46, k: 44
    },
    patna: {
      city: 'Patna',
      state: 'Bihar',
      specificLocation: 'Kankarbagh, Patna (800020), Bihar',
      zone: 'Middle Gangetic Plain (Zone 4)',
      lat: 25.59,
      lon: 85.13,
      temp: 29.0,
      rain: 230,
      humidity: 75,
      n: 86, p: 42, k: 40
    },
    jaipur: {
      city: 'Jaipur',
      state: 'Rajasthan',
      specificLocation: 'Malviya Nagar, Jaipur (302017), Rajasthan',
      zone: 'Central Plateau and Hills (Zone 8)',
      lat: 26.91,
      lon: 75.78,
      temp: 30.5,
      rain: 145,
      humidity: 50,
      n: 74, p: 38, k: 55
    },
    bhopal: {
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      specificLocation: 'MP Nagar, Bhopal (462011), Madhya Pradesh',
      zone: 'Central Plateau and Hills (Zone 8)',
      lat: 23.25,
      lon: 77.41,
      temp: 28.0,
      rain: 210,
      humidity: 64,
      n: 80, p: 42, k: 46
    },
    chandigarh: {
      city: 'Chandigarh',
      state: 'Punjab',
      specificLocation: 'Sector 17, Chandigarh (160017), Punjab',
      zone: 'Trans-Gangetic Plain (Zone 6)',
      lat: 30.73,
      lon: 76.77,
      temp: 27.0,
      rain: 180,
      humidity: 65,
      n: 105, p: 46, k: 42
    }
  };

  function applyDistrictData(btn) {
    districtChips.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');

    const city = btn.dataset.city;
    const temp = parseFloat(btn.dataset.temp);
    const rain = parseInt(btn.dataset.rain, 10);
    const n = parseInt(btn.dataset.n, 10);
    const p = parseInt(btn.dataset.p, 10);
    const k = parseInt(btn.dataset.k, 10);
    const zone = btn.dataset.zone;

    const cityKey = (city || '').toLowerCase().trim();
    const known = KNOWN_DISTRICTS[cityKey] || {};

    const specificLoc = known.specificLocation || `${city}, ${known.state || 'India'}`;
    const lat = known.lat || 18.52;
    const lon = known.lon || 73.85;
    const agroZone = known.zone || (known.state ? getAgroClimaticZone(known.state, city) : zone) || zone;

    state.currentCity = city;
    state.currentZone = agroZone;
    state.currentWeather = { temperature: temp, humidity: known.humidity || 70, rainfall: rain };

    // Update Floating Agro-Climatic Telemetry Box
    const specificLocEl = document.getElementById('specific-location-val');
    if (specificLocEl) {
      specificLocEl.textContent = specificLoc;
    }
    if (zoneLabel) {
      const coordsText = (lat && lon) ? ` • Lat ${lat.toFixed(2)}° N, Lon ${lon.toFixed(2)}° E` : '';
      zoneLabel.textContent = `Agro-Climatic Region: ${agroZone}${coordsText}`;
    }
    if (telemetryTemp) telemetryTemp.textContent = `${temp.toFixed(1)}°C`;
    if (zoneMonsoonText) zoneMonsoonText.textContent = `${Math.round(rain)} mm`;

    if (sliders.temp) {
      sliders.temp.value = temp;
      if (displays.temp) displays.temp.textContent = temp.toFixed(1);
    }

    if (sliders.rain) {
      sliders.rain.value = rain;
      if (displays.rain) displays.rain.textContent = Math.round(rain);
    }

    if (sliders.hum) {
      const humVal = known.humidity || 70;
      sliders.hum.value = humVal;
      const valHum = document.getElementById('val-hum');
      if (valHum) valHum.textContent = Math.round(humVal);
    }

    if (inputs.n && sliders.n && !isNaN(n)) {
      inputs.n.value = n;
      sliders.n.value = n;
      if (displays.n) displays.n.textContent = n;
      updateNutrientStatusPill('n', n);
    }

    if (inputs.p && sliders.p && !isNaN(p)) {
      inputs.p.value = p;
      sliders.p.value = p;
      if (displays.p) displays.p.textContent = p;
      updateNutrientStatusPill('p', p);
    }

    if (inputs.k && sliders.k && !isNaN(k)) {
      inputs.k.value = k;
      sliders.k.value = k;
      if (displays.k) displays.k.textContent = k;
      updateNutrientStatusPill('k', k);
    }

    updateConditionPill(temp);

    // Auto-sync soil state dropdown
    const stateName = known.state;
    if (stateDropdown && stateName) {
      for (let i = 0; i < stateDropdown.options.length; i++) {
        if (stateDropdown.options[i].value.toLowerCase().includes(stateName.toLowerCase())) {
          stateDropdown.selectedIndex = i;
          loadSoilStateProfile(stateDropdown.options[i].value);
          break;
        }
      }
    }

    // Auto-refresh recommendations for the new location
    if (typeof predictCrops === 'function') {
      predictCrops();
    }
  }

  districtChips.forEach(btn => {
    btn.addEventListener('click', () => applyDistrictData(btn));
  });

  if (btnResetDefaults) {
    btnResetDefaults.addEventListener('click', () => {
      const puneBtn = document.querySelector('.dist-chip[data-city="Pune"]');
      if (puneBtn) applyDistrictData(puneBtn);
    });
  }

  // Soil Texture Radios
  document.querySelectorAll('.texture-radio-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.texture-radio-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        state.soilTexture = radio.value;
      }
    });
  });


  // ─────────────────────────────────────────────────────────────────────────
  // LOCAL ICAR AGRONOMIC & FERTILIZER CALCULATION ENGINES (OFFLINE RESILIENCE)
  // ─────────────────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────────────────
  // EMBEDDED ICAR OFFLINE DATASETS (GUARANTEED VISIBILITY & ZERO DOWNTIME)
  // ─────────────────────────────────────────────────────────────────────────
  const EMBEDDED_CROPS = ["apple", "bajra", "banana", "barley", "blackgram", "chickpea", "chilli", "coconut", "coffee", "cotton", "garlic", "ginger", "grapes", "groundnut", "jowar", "jute", "kidneybeans", "lentil", "maize", "mango", "mothbeans", "mungbean", "muskmelon", "mustard", "onion", "orange", "papaya", "pigeonpeas", "pomegranate", "potato", "rice", "soybean", "sugarcane", "tea", "tomato", "turmeric", "watermelon", "wheat"];
  const INDIAN_SOIL_STATES = ["Andhra Pradesh", "Assam & North East", "Bihar", "Gujarat", "Haryana", "Himachal Pradesh & Uttarakhand", "Jammu & Kashmir", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"];
  const INDIAN_SOIL_PROFILES = {"Andhra Pradesh": {"zone_name": "Krishna-Godavari Coastal Belt & Rayalaseema", "districts_sample": ["Guntur", "Krishna", "Kurnool", "East Godavari", "Anantapur", "Kadapa"], "soil_type": "Coastal Alluvial, Black Cotton, Red Sandy (Rayalaseema)", "soil_description": "Highly fertile delta alluvium along the coast; semi-arid drought-prone red/black soils in Rayalaseema.", "baseline_soil": {"nitrogen": 110.0, "phosphorus": 48.0, "potassium": 190.0, "ph": 7.6, "organic_carbon_pct": 0.44, "salinity_ec": 0.42}, "micronutrient_deficiencies": ["Zinc (Zn) - Intensive paddy-chilli systems", "Sulphur (S) - In groundnut belt of Rayalaseema", "Boron (B) - In sunflower and horticulture"], "primary_crops": ["chilli", "rice", "cotton", "groundnut", "maize", "tobacco", "sugarcane"], "fertilizer_package": {"chilli": {"npk_ratio": "150:60:80 kg/ha", "urea_bags": "3.0 bags/acre (split across 5 fertigation/topdress intervals)", "dap_bags": "1.2 bags/acre", "mop_bags": "1.2 bags/acre (potash enhances fruit capsanthin red color and firmness)", "micronutrient": "Spray Formula-4 micronutrient cocktail every 20 days during flowering"}}, "management_tips": ["Excessive nitrogen in chilli causes massive flower drop; balance with potassium and calcium nitrate.", "Farm pond rainwater harvesting is crucial for supplemental lifesaving irrigation in Rayalaseema."]}, "Assam & North East": {"zone_name": "Brahmaputra Valley & Himalayan Acidic Hills", "districts_sample": ["Kamrup", "Jorhat", "Dibrugarh", "Nagaon", "Sonitpur", "Cachar"], "soil_type": "Acidic Alluvial (Brahmaputra Plain) & Hill Red Loam", "soil_description": "Heavy monsoon rainfall has leached bases, causing acidity (pH 4.5 - 5.5). High organic matter in hill soils but high phosphorus fixation.", "baseline_soil": {"nitrogen": 140.0, "phosphorus": 26.0, "potassium": 120.0, "ph": 5.1, "organic_carbon_pct": 0.9, "salinity_ec": 0.2}, "micronutrient_deficiencies": ["Boron (B) - Severe deficiency across tea and vegetable crops", "Zinc (Zn) - In acidic alluvial plains", "Molybdenum (Mo) - Critical for cauliflower and crucifers"], "primary_crops": ["tea", "rice", "jute", "mustard", "ginger", "turmeric", "banana"], "fertilizer_package": {"tea": {"npk_ratio": "120:40:90 kg/ha", "urea_bags": "Applied in 3 flushes (March, June, September)", "mop_bags": "Applied post-monsoon", "micronutrient": "Foliar Zinc Sulphate (1%) + Magnesium Sulphate (1%)"}, "ginger": {"npk_ratio": "75:50:50 kg/ha", "urea_bags": "1.5 bags/acre in 3 splits", "dap_bags": "1.0 bag/acre", "mop_bags": "0.7 bag/acre", "micronutrient": "Rock Phosphate applied at bed formation"}}, "management_tips": ["Apply 200-400 kg/ha Agricultural Lime once every 3 years to mobilize soil phosphorus.", "Use Rock Phosphate rather than DAP to prevent rapid chemical fixation in acid soils."]}, "Bihar": {"zone_name": "Middle Gangetic Alluvial Plains", "districts_sample": ["Patna", "Muzaffarpur", "Bhagalpur", "Gaya", "Samastipur", "Purnea"], "soil_type": "Alluvial Silt Loam & Calcareous Clay (Tal and Diara tracts)", "soil_description": "Rich floodplain soils deposited by Ganga, Gandak, and Kosi rivers. Calcareous soils in north-west with high free CaCO3.", "baseline_soil": {"nitrogen": 118.0, "phosphorus": 40.0, "potassium": 165.0, "ph": 7.6, "organic_carbon_pct": 0.46, "salinity_ec": 0.36}, "micronutrient_deficiencies": ["Zinc (Zn) - 48% deficiency", "Boron (B) - Causes internal browning in cauliflower and empty earheads in wheat", "Iron (Fe) - In high CaCO3 calcareous soils"], "primary_crops": ["rice", "wheat", "maize", "potato", "sugarcane", "lentil", "chickpea"], "fertilizer_package": {"maize": {"npk_ratio": "120:60:40 kg/ha (Rabi / Winter Maize)", "urea_bags": "2.5 bags/acre (in 3 splits: knee-high, tasseling, and grain filling)", "dap_bags": "1.2 bags/acre basal", "mop_bags": "0.6 bag/acre", "micronutrient": "Zinc Sulphate 25 kg/ha applied basal"}}, "management_tips": ["Rabi maize has the highest yield potential (60-80 quintals/ha) in India; ensure timely knee-high fertilization.", "Diara lands benefit from early rabi pulse sowing on receding flood moisture."]}, "Gujarat": {"zone_name": "Saurashtra & North Gujarat Semi-Arid Belt", "districts_sample": ["Rajkot", "Junagadh", "Mehsana", "Banaskantha", "Surat", "Vadodara", "Jamnagar"], "soil_type": "Medium Black (Saurashtra), Sandy Loam / Goradu (North), Coastal Alluvial", "soil_description": "Medium black in Saurashtra with good calcium carbonate; coarse sandy loam in north with high permeability.", "baseline_soil": {"nitrogen": 95.0, "phosphorus": 38.0, "potassium": 210.0, "ph": 8.1, "organic_carbon_pct": 0.38, "salinity_ec": 0.65}, "micronutrient_deficiencies": ["Iron (Fe) - Severe lime-induced iron deficiency in groundnut (yellowing of young leaves)", "Zinc (Zn) - Widespread", "Sulphur (S) - In groundnut and castor belts"], "primary_crops": ["groundnut", "cotton", "mustard", "potato", "bajra", "wheat", "onion"], "fertilizer_package": {"groundnut": {"npk_ratio": "25:50:30 kg/ha + 400 kg Gypsum/ha", "urea_bags": "0.5 bag/acre basal", "dap_bags": "1.0 bag/acre", "gypsum": "Apply 200 kg/acre Gypsum at 35-45 DAS (flowering/pegging) for pod pod-filling and calcium delivery", "micronutrient": "Spray 0.5% FeSO4 + 0.1% Citric acid if young leaves show chlorosis"}, "cotton": {"npk_ratio": "160:60:60 kg/ha", "urea_bags": "3.2 bags/acre (split 4 times under drip fertigation)", "dap_bags": "1.2 bags/acre", "mop_bags": "0.8 bag/acre"}}, "management_tips": ["Gypsum is indispensable for groundnut peg penetration and preventing 'pops' (empty pods).", "Drip irrigation with mulching saves up to 50% water in drought-prone Saurashtra."]}, "Haryana": {"zone_name": "Semi-Arid Alluvial & Western Sandy Tracts", "districts_sample": ["Karnal", "Hisar", "Sirsa", "Kurukshetra", "Rohtak", "Bhiwani"], "soil_type": "Alluvial Loam to Arid Brown Soils", "soil_description": "Loamy sand in south-west to fertile clay loam in eastern canal tracts. Moderate to high lime concentration.", "baseline_soil": {"nitrogen": 110.0, "phosphorus": 42.0, "potassium": 180.0, "ph": 8.0, "organic_carbon_pct": 0.4, "salinity_ec": 0.55}, "micronutrient_deficiencies": ["Zinc (Zn) - Highly widespread across canal and tubewell commands", "Sulphur (S) - Widespread deficiency in mustard and pulse tracts"], "primary_crops": ["wheat", "mustard", "bajra", "cotton", "rice", "sugarcane", "barley"], "fertilizer_package": {"mustard": {"npk_ratio": "80:40:20 kg/ha + 20 kg S", "urea_bags": "1.5 bags/acre (1/2 basal, 1/2 at first irrigation)", "dap_bags": "0.8 bag/acre basal", "ssp_bags": "Prefer Single Super Phosphate (SSP) over DAP to provide essential Sulphur (12% S)", "micronutrient": "Apply 200 kg/ha Gypsum for oil percentage boost"}, "bajra": {"npk_ratio": "60:30:20 kg/ha", "urea_bags": "1.2 bags/acre (split: 1/2 at sowing, 1/2 at 30 days)", "dap_bags": "0.6 bag/acre", "micronutrient": "Seed inoculation with Azospirillum / Azotobacter biofertilizer"}}, "management_tips": ["Use laser land leveling to prevent localized salt accumulation.", "Rotate wheat with summer moong (mungbean) to replenish nitrogen reserves."]}, "Himachal Pradesh & Uttarakhand": {"zone_name": "Mid to High Western Himalayan Valleys", "districts_sample": ["Shimla", "Kullu", "Mandi", "Dehradun", "Nainital", "Haridwar"], "soil_type": "Brown Forest Soils & Mountain Podzols", "soil_description": "Rich in organic humus, coarse textured on slopes with high permeability. Acidic to neutral reaction.", "baseline_soil": {"nitrogen": 125.0, "phosphorus": 35.0, "potassium": 160.0, "ph": 6.4, "organic_carbon_pct": 0.78, "salinity_ec": 0.25}, "micronutrient_deficiencies": ["Boron (B) - High deficiency in stone fruits and apples", "Zinc (Zn) - Little leaf disorder in orchards", "Calcium (Ca) - Fruit cracking in apples and cherries"], "primary_crops": ["apple", "potato", "maize", "wheat", "ginger", "garlic", "rice"], "fertilizer_package": {"potato": {"npk_ratio": "120:80:100 kg/ha", "urea_bags": "2.4 bags/acre", "dap_bags": "1.6 bags/acre", "mop_bags": "1.2 bags/acre", "micronutrient": "FYM (15 t/ha) incorporated into hill terraces"}}, "management_tips": ["Terrace farming with vegetative contour barriers (Vetiver / Napier) arrests mountain soil erosion.", "Incorporate compost heavily to insulate root zones from winter freezing."]}, "Jammu & Kashmir": {"zone_name": "Temperate Western Himalayas & Subtropical Jammu", "districts_sample": ["Srinagar", "Baramulla", "Anantnag", "Pulwama", "Jammu", "Kathua"], "soil_type": "Karewa Lacustrine Soils (Kashmir) & Alluvial Loam (Jammu)", "soil_description": "Karewas are deep silty loams with high lime and organic content, ideal for saffron and temperate fruit orchards.", "baseline_soil": {"nitrogen": 130.0, "phosphorus": 38.0, "potassium": 185.0, "ph": 7.2, "organic_carbon_pct": 0.85, "salinity_ec": 0.3}, "micronutrient_deficiencies": ["Zinc (Zn) - In apple and paddy crops", "Boron (B) - Essential for apple fruit set and cork prevention", "Iron (Fe) - In high pH Karewa deposits"], "primary_crops": ["apple", "saffron", "walnut", "rice", "maize", "wheat", "mustard"], "fertilizer_package": {"apple": {"npk_ratio": "700:350:700 g/tree/year for mature bearing tree", "urea_bags": "Applied in 2 splits: bud break and fruit set", "dap_bags": "Applied in late autumn with FYM", "mop_bags": "Applied at fruit development for coloration", "micronutrient": "Foliar Boric Acid (0.1%) at pink bud stage; Calcium Chloride (0.3%) sprays for bitter pit prevention"}}, "management_tips": ["Mulch tree basins with dry straw or black poly sheets to conserve melting snow moisture.", "Avoid excessive late-season nitrogen on apple trees to prevent fire blight and winter frost injury."]}, "Karnataka": {"zone_name": "Deccan Southern Plateau & Western Ghats / Coastal Zone", "districts_sample": ["Belagavi", "Dharwad", "Raichur", "Mysuru", "Hassan", "Coorg", "Shimoga"], "soil_type": "Red Sandy Loam, Deep Black (North), Laterite (Coastal/Malnad)", "soil_description": "Highly varied: North has rich black soils; South has porous red loams; Western Ghats have acidic laterites rich in humus.", "baseline_soil": {"nitrogen": 115.0, "phosphorus": 40.0, "potassium": 150.0, "ph": 6.6, "organic_carbon_pct": 0.58, "salinity_ec": 0.32}, "micronutrient_deficiencies": ["Zinc (Zn) - In black soils and rice belts", "Boron (B) - In sunflower and coffee belts", "Magnesium (Mg) - Interveinal chlorosis in acidic plantation soils"], "primary_crops": ["coffee", "maize", "sugarcane", "cotton", "rice", "ginger", "turmeric", "jowar"], "fertilizer_package": {"coffee": {"npk_ratio": "140:90:140 kg/ha (Split pre-monsoon and post-monsoon)", "urea_bags": "Custom plantation blends with Rock Phosphate", "mop_bags": "Muriate of Potash applied post-monsoon for bean filling", "micronutrient": "Dolomite liming (1-2 t/ha) once every 3 years to correct acidity (target pH 6.0-6.5)"}, "ginger": {"npk_ratio": "100:60:100 kg/ha", "urea_bags": "2.0 bags/acre in 4 splits", "dap_bags": "1.2 bags/acre basal", "mop_bags": "1.2 bags/acre", "micronutrient": "Heavy organic mulching with green leaves (10-12 t/ha)"}}, "management_tips": ["Apply agricultural lime or dolomite in Malnad/Coorg acidic tracts to unlock phosphorus.", "Use contour bunding in red sloping soils to arrest topsoil runoff."]}, "Kerala": {"zone_name": "Coastal Humid Tropics & Highland Laterite Belt", "districts_sample": ["Palakkad", "Wayanad", "Idukki", "Alappuzha", "Kottayam", "Thrissur"], "soil_type": "Laterite (Acidic), Coastal Alluvium, and Acid Saline (Kuttanad Kari soils)", "soil_description": "Strongly acidic (pH 4.8 - 5.8), heavily leached of bases due to 3000 mm annual rainfall. Rich in iron and aluminum oxides.", "baseline_soil": {"nitrogen": 130.0, "phosphorus": 28.0, "potassium": 110.0, "ph": 5.2, "organic_carbon_pct": 0.95, "salinity_ec": 0.28}, "micronutrient_deficiencies": ["Calcium (Ca) & Magnesium (Mg) - Extremely low", "Boron (B) - Severe in coconut, pepper, and rubber", "Molybdenum (Mo) - Low availability in acidic soils"], "primary_crops": ["coconut", "coffee", "tea", "banana", "rice", "ginger", "turmeric"], "fertilizer_package": {"tea": {"npk_ratio": "130:40:80 kg/ha", "urea_bags": "Applied in 4-5 splits following rainfall flushes", "mop_bags": "Muriate of Potash split pre-monsoon and post-monsoon", "micronutrient": "Zinc Sulphate (1%) + Urea (2%) foliar spray after every major plucking"}, "rubber_plantation": {"npk_ratio": "12:12:12 or 10:10:10 plantation mixtures", "liming": "Agricultural lime application (500 kg/ha) is mandatory before monsoon"}}, "management_tips": ["Liming with Agricultural Lime or Dolomite is non-negotiable to bring pH above 5.8 and release fixed phosphorus.", "Use Rock Phosphate (Mussoorie Rock Phosphate) instead of water-soluble DAP/SSP for slow acid dissolution."]}, "Madhya Pradesh": {"zone_name": "Central Black Soil Plateau (Soybean & Wheat Capital)", "districts_sample": ["Indore", "Ujjain", "Bhopal", "Dewas", "Hoshangabad", "Jabalpur", "Gwalior"], "soil_type": "Medium to Deep Black Vertisols", "soil_description": "Heavy clay with high CEC (Cation Exchange Capacity). Inherent richness in potassium, medium in phosphorus, low in nitrogen.", "baseline_soil": {"nitrogen": 108.0, "phosphorus": 36.0, "potassium": 240.0, "ph": 7.7, "organic_carbon_pct": 0.48, "salinity_ec": 0.35}, "micronutrient_deficiencies": ["Zinc (Zn) - 52% soils deficient", "Sulphur (S) - Extremely critical for soybean, mustard, and garlic", "Boron (B) - Deficient in Malwa region"], "primary_crops": ["soybean", "wheat", "chickpea", "garlic", "mustard", "cotton", "maize"], "fertilizer_package": {"garlic": {"npk_ratio": "100:50:70 kg/ha + 25 kg S", "urea_bags": "2.0 bags/acre (split 50% basal, 50% at 30-45 DAS)", "dap_bags": "1.0 bag/acre basal", "mop_bags": "0.8 bag/acre", "micronutrient": "Apply 100 kg/ha Agricultural Gypsum as sulphur source"}, "chickpea": {"npk_ratio": "20:50:20 kg/ha", "urea_bags": "0.4 bag/acre starter nitrogen", "dap_bags": "1.0 bag/acre basal", "micronutrient": "Seed inoculation with Rhizobium + PSB (Phosphate Solubilizing Bacteria)"}}, "management_tips": ["Do not over-irrigate Vertisols as poor aeration chokes legume nodulation.", "Deep summer plowing destroys resting pupae of Helicoverpa (gram pod borer)."]}, "Maharashtra": {"zone_name": "Deccan Trap (Black Cotton / Vertisol Plateau)", "districts_sample": ["Nashik", "Pune", "Nagpur", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Jalgaon"], "soil_type": "Deep Black Soils (Regur / Vertisols) & Red Lateritic in Konkan", "soil_description": "High clay content (40-60% montmorillonite), swell-shrink properties, high moisture holding capacity. High in potash and lime.", "baseline_soil": {"nitrogen": 105.0, "phosphorus": 35.0, "potassium": 260.0, "ph": 7.9, "organic_carbon_pct": 0.52, "salinity_ec": 0.45}, "micronutrient_deficiencies": ["Zinc (Zn) - Severe in deep black soils", "Iron (Fe) - Lime-induced chlorosis in sugarcane, soybean, and citrus", "Boron (B) - Deficient in fruit-growing tracts (Grapes, Pomegranate)"], "primary_crops": ["cotton", "soybean", "sugarcane", "onion", "grapes", "pomegranate", "jowar", "turmeric"], "fertilizer_package": {"soybean": {"npk_ratio": "30:75:30 kg/ha + 20 kg S", "urea_bags": "0.6 bag/acre (Rhizobium seed coating supplies majority of N)", "dap_bags": "1.3 bags/acre basal", "micronutrient": "Apply 25 kg/ha Zinc Sulphate once every 2 years"}, "onion": {"npk_ratio": "100:50:80 kg/ha + 30 kg S", "urea_bags": "2.0 bags/acre (in 3 splits: transplanting, 30 DAT, 45 DAT)", "dap_bags": "1.0 bag/acre", "mop_bags": "1.0 bag/acre (crucial for bulb firmness and storage shelf life)", "micronutrient": "Sulphur application (SSP or elemental S) is mandatory for pungency and skin color"}, "grapes": {"npk_ratio": "120:80:160 kg/ha (Precision Drip Fertigation)", "urea_bags": "Water-soluble Urea / 19:19:19 via venturi drip", "mop_bags": "Potassium Nitrate (13:0:45) and Potassium Schoenite for berry sizing", "micronutrient": "Chelated Zinc (Zn-EDTA) and Boron (Solubor) foliar sprays"}}, "management_tips": ["Broad Bed and Furrow (BBF) cultivation prevents waterlogging during heavy monsoon spells.", "Subsurface drainage tiles reduce salt crust formation in sugarcane-heavy irrigated belts."]}, "Odisha": {"zone_name": "Eastern Coastal Plains & Central Highlands", "districts_sample": ["Cuttack", "Balasore", "Sambalpur", "Ganjam", "Kalahandi", "Koraput"], "soil_type": "Red & Yellow Soils, Coastal Alluvial, Lateritic Soils", "soil_description": "Coastal alluvium in Mahanadi delta; red and yellow soils in interior highlands have acidic to neutral reaction and low organic carbon.", "baseline_soil": {"nitrogen": 115.0, "phosphorus": 32.0, "potassium": 140.0, "ph": 6.2, "organic_carbon_pct": 0.5, "salinity_ec": 0.35}, "micronutrient_deficiencies": ["Zinc (Zn) - In coastal waterlogged rice", "Boron (B) - In groundnut and pulses", "Molybdenum (Mo) - In acidic upland soils"], "primary_crops": ["rice", "pulses", "groundnut", "mustard", "sugarcane", "jute", "tea"], "fertilizer_package": {"rice": {"npk_ratio": "80:40:40 kg/ha (Kharif upland) / 120:60:60 (Irrigated command)", "urea_bags": "1.8 bags/acre in 3 splits", "dap_bags": "0.8 bag/acre", "mop_bags": "0.6 bag/acre"}}, "management_tips": ["Apply Paper Mill Sludge or Basic Slag (1-2 t/ha) to reclaim acidic upland red soils economically.", "Promote non-paddy crops (pulses, oilseeds) in uplands to reduce water risk."]}, "Punjab": {"zone_name": "Indo-Gangetic Trans-Plains (Rice-Wheat-Cotton Belt)", "districts_sample": ["Ludhiana", "Amritsar", "Bathinda", "Jalandhar", "Patiala", "Ferozepur"], "soil_type": "Indo-Gangetic Alluvial (Sandy Loam to Silt Loam)", "soil_description": "Deep, fertile loam formed by Himalayan river deposits. Well-drained but intensive cropping has depleted subsoil moisture and micronutrients.", "baseline_soil": {"nitrogen": 115.0, "phosphorus": 48.0, "potassium": 190.0, "ph": 7.8, "organic_carbon_pct": 0.45, "salinity_ec": 0.42}, "micronutrient_deficiencies": ["Zinc (Zn) - 45% soil samples deficient due to intensive rice-wheat rotation", "Iron (Fe) - Chlorosis frequent in coarse-textured soils under paddy", "Manganese (Mn) - Common in sandy soils under wheat"], "primary_crops": ["wheat", "rice", "cotton", "mustard", "maize", "potato", "sugarcane", "barley"], "fertilizer_package": {"wheat": {"npk_ratio": "120:60:30 kg/ha", "urea_bags": "2.5 bags/acre (split into basal, CRI, and tillering)", "dap_bags": "1.0 bag/acre (drilled at sowing)", "mop_bags": "0.3 bag/acre (applied on light soils)", "micronutrient": "Apply 25 kg/ha Zinc Sulphate (21%) at final plowing"}, "rice": {"npk_ratio": "120:30:30 kg/ha", "urea_bags": "2.5 bags/acre (in 3 equal splits at transplanting, 21 DAT, and 42 DAT)", "dap_bags": "0.6 bag/acre basal", "mop_bags": "0.3 bag/acre", "micronutrient": "Foliar spray of 0.5% Ferrous Sulphate if leaves turn ivory-white"}, "cotton": {"npk_ratio": "150:60:60 kg/ha", "urea_bags": "3.0 bags/acre (split: 1/2 at thinning, 1/2 at flowering)", "dap_bags": "1.0 bag/acre basal", "mop_bags": "0.6 bag/acre", "micronutrient": "Spray 2% Potassium Nitrate (13:0:45) at boll development"}}, "management_tips": ["Incorporate green manure (Dhaincha / Sesbania) before paddy puddling to raise organic carbon.", "Avoid excessive urea usage which promotes vegetative lodging and insect susceptibility.", "Apply gypsum (500 kg/ha) if tubewell irrigation water has high residual sodium carbonate (RSC > 2.5 meq/L)."]}, "Rajasthan": {"zone_name": "Arid Thar Desert & Eastern Semi-Arid Plains", "districts_sample": ["Jodhpur", "Bikaner", "Barmer", "Jaipur", "Kota", "Alwar", "Nagaur", "Sri Ganganagar"], "soil_type": "Desert Sandy Soil (Thar) to Mixed Red & Black / Alluvial (East)", "soil_description": "Wind-blown coarse sand with very low organic carbon (<0.3%) and rapid infiltration. High potassium but poor water holding capacity.", "baseline_soil": {"nitrogen": 80.0, "phosphorus": 30.0, "potassium": 195.0, "ph": 8.3, "organic_carbon_pct": 0.28, "salinity_ec": 0.72}, "micronutrient_deficiencies": ["Zinc (Zn) - 60% deficiency", "Iron (Fe) - High calcium carbonate fixes iron", "Nitrogen (N) - Acute deficiency due to low organic matter"], "primary_crops": ["bajra", "mustard", "mothbeans", "wheat", "barley", "chickpea", "garlic", "coriander"], "fertilizer_package": {"bajra": {"npk_ratio": "60:30:20 kg/ha", "urea_bags": "1.2 bags/acre (1/2 at sowing, 1/2 after rainfall shower at tillering)", "dap_bags": "0.6 bag/acre", "micronutrient": "Mix 25 kg/ha Zinc Sulphate with FYM before broadcast"}, "mustard": {"npk_ratio": "80:40:20 kg/ha + 250 kg Gypsum/ha", "urea_bags": "1.6 bags/acre (split at sowing and first irrigation)", "dap_bags": "0.8 bag/acre", "micronutrient": "Foliar spray of 0.2% Borax at flowering"}}, "management_tips": ["Apply FYM or Vermicompost (5-8 t/ha) to create moisture-sponges in sandy soils.", "Use sprinkler and micro-drip systems; furrow flood irrigation causes 70% percolation losses."]}, "Tamil Nadu": {"zone_name": "Cauvery Delta & Southern Plains", "districts_sample": ["Thanjavur", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Erode"], "soil_type": "Cauvery Delta Alluvial, Red Loam & Black Soil Tracts", "soil_description": "Rich deltaic alluvium in the east; fertile red and black loams in the western kongu belt.", "baseline_soil": {"nitrogen": 120.0, "phosphorus": 45.0, "potassium": 165.0, "ph": 7.3, "organic_carbon_pct": 0.52, "salinity_ec": 0.4}, "micronutrient_deficiencies": ["Zinc (Zn) - Common in Kuruvai/Thaladi paddy crops", "Iron (Fe) - In calcareous black soil pockets", "Boron (B) - In coconut and banana tracts"], "primary_crops": ["rice", "banana", "coconut", "sugarcane", "groundnut", "turmeric", "cotton", "tea"], "fertilizer_package": {"banana": {"npk_ratio": "200:50:300 g/plant (Annual Schedule)", "urea_bags": "Split monthly from 2nd to 7th month after planting", "mop_bags": "Heavy potash needed for bunch weight and finger length", "micronutrient": "Banana special micronutrient mixture spray @ 5 g/L"}, "coconut": {"npk_ratio": "500:320:1200 g/palm/year", "urea_bags": "1.1 kg Urea/palm in two splits (June-July and Dec-Jan)", "dap_bags": "0.7 kg DAP/palm", "mop_bags": "2.0 kg MOP/palm (crucial for button shedding prevention)", "micronutrient": "Apply 50 kg FYM + 1 kg Magnesium Sulphate + 50 g Borax per palm annually"}}, "management_tips": ["Use Azolla bio-fertilizer in rice wetlands to contribute 20-30 kg N/ha naturally.", "Apply neem cake blended urea (5:1) to retard nitrification and leaching."]}, "Telangana": {"zone_name": "Deccan Semi-Arid Plateau (Northern Black & Southern Red Soils)", "districts_sample": ["Warangal", "Karimnagar", "Nizamabad", "Khammam", "Nalgonda", "Mahabubnagar"], "soil_type": "Red Sandy Loams (Dubba / Chalkas) & Deep Black (Regur)", "soil_description": "Chalka soils are shallow, highly porous with rapid percolation; Regur soils in Nizamabad and Adilabad retain deep moisture.", "baseline_soil": {"nitrogen": 105.0, "phosphorus": 42.0, "potassium": 170.0, "ph": 7.2, "organic_carbon_pct": 0.42, "salinity_ec": 0.35}, "micronutrient_deficiencies": ["Zinc (Zn) - In canal command rice", "Iron (Fe) - Calcareous black soils", "Boron (B) - In cotton and turmeric"], "primary_crops": ["cotton", "rice", "maize", "turmeric", "soybean", "chilli", "pigeonpeas"], "fertilizer_package": {"turmeric": {"npk_ratio": "150:60:100 kg/ha", "urea_bags": "3.0 bags/acre in 4 equal splits at 30, 60, 90, 120 days", "dap_bags": "1.2 bags/acre basal", "mop_bags": "1.5 bags/acre (potash is key for rhizome size and curcumin development)", "micronutrient": "Apply 25 kg Zinc Sulphate + 10 kg Ferrous Sulphate basal"}}, "management_tips": ["In Red Chalka soils, split nitrogen into 4-5 small doses to prevent deep leaching below root zone.", "Ridge and furrow planting in cotton reduces root rot and improves soil drainage."]}, "Uttar Pradesh": {"zone_name": "Gangetic Plains (Western Doab, Central & Eastern Terai)", "districts_sample": ["Meerut", "Muzaffarnagar", "Varanasi", "Gorakhpur", "Bareilly", "Kanpur", "Prayagraj"], "soil_type": "Gangetic Alluvium (Khadar new alluvium & Bangar old alluvium)", "soil_description": "Deep silty to clayey alluvial plains with high native moisture retention. Excellent productivity potential.", "baseline_soil": {"nitrogen": 125.0, "phosphorus": 44.0, "potassium": 175.0, "ph": 7.4, "organic_carbon_pct": 0.5, "salinity_ec": 0.38}, "micronutrient_deficiencies": ["Zinc (Zn) - 40% soils deficient", "Boron (B) - Deficient in Eastern UP Terai soils (affects wheat grain filling)", "Sulphur (S) - In oilseed & sugarcane belts"], "primary_crops": ["sugarcane", "wheat", "rice", "potato", "mustard", "maize", "chickpea", "mango"], "fertilizer_package": {"sugarcane": {"npk_ratio": "180:60:60 kg/ha", "urea_bags": "3.5 bags/acre (split across 3 earthing-up intervals)", "dap_bags": "1.2 bags/acre basal in furrows", "mop_bags": "0.8 bag/acre for juice sucrose accumulation", "micronutrient": "Trash mulching + 25 kg Zinc Sulphate + 10 kg Ferrous Sulphate"}, "potato": {"npk_ratio": "150:100:120 kg/ha", "urea_bags": "3.0 bags/acre (1/3 basal, 2/3 at earthing up)", "dap_bags": "2.0 bags/acre basal", "mop_bags": "1.5 bags/acre (Sulphate of Potash preferred for tuber starch quality)", "micronutrient": "Foliar spray of 0.2% Borax at tuber initiation"}}, "management_tips": ["In sugarcane ratoon, apply 20% extra nitrogen to decompose stubbles.", "Apply Pressmud (sugar mill byproduct) @ 10 t/ha to enrich organic matter."]}, "West Bengal": {"zone_name": "Lower Gangetic Delta & Terai Belt", "districts_sample": ["Burdwan", "Hooghly", "Murshidabad", "Nadia", "24 Parganas", "Jalpaiguri"], "soil_type": "Gangetic Alluvial, Coastal Saline (Sundarbans), Terai Acidic Loam", "soil_description": "Deep silty alluvium with high natural fertility; deltaic areas prone to seasonal inundation and salinity.", "baseline_soil": {"nitrogen": 135.0, "phosphorus": 46.0, "potassium": 160.0, "ph": 6.8, "organic_carbon_pct": 0.65, "salinity_ec": 0.48}, "micronutrient_deficiencies": ["Zinc (Zn) - In Boro (winter) rice ecosystems", "Boron (B) - In mustard and cauliflower belts", "Molybdenum (Mo) - In acidic Terai soils"], "primary_crops": ["rice", "jute", "potato", "mustard", "tea", "maize", "banana"], "fertilizer_package": {"jute": {"npk_ratio": "60:30:30 kg/ha", "urea_bags": "1.2 bags/acre (1/2 basal, 1/2 top dressed after first weeding at 3 weeks)", "dap_bags": "0.6 bag/acre", "mop_bags": "0.4 bag/acre (improves fiber tensile strength)"}, "rice": {"npk_ratio": "100:50:50 kg/ha (Aman) / 120:60:60 (Boro)", "urea_bags": "2.2 bags/acre in 3 equal splits", "dap_bags": "1.0 bag/acre", "mop_bags": "0.7 bag/acre"}}, "management_tips": ["Jute leaves add 3-4 tons of organic biomass per hectare; incorporate stubble for next paddy crop.", "In coastal saline soils, maintain fresh water ponding and grow salt-tolerant varieties (e.g., Gosaba-6, Luna Sankhi)."]}};
  const ICAR_DISEASES_DB = [{"id": "rice_blast", "crop": "rice", "name": "Rice Blast (Paddy Blast / Jhonka Rog)", "pathogen_type": "Fungal", "pathogen_name": "Magnaporthe oryzae (Pyricularia oryzae)", "symptoms": "Spindle-shaped, eye-like spots on leaves with grey/whitish centers and dark reddish-brown margins. Severe infection causes 'Neck Blast' where panicle base turns blackish and breaks, resulting in completely chaffy, empty grains.", "weather_risk_triggers": {"min_temp": 18.0, "max_temp": 28.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Seed treatment with Trichoderma viride or Pseudomonas fluorescens @ 10 g/kg seed.", "Foliar spray of Pseudomonas fluorescens (0.2% - 2 g/L) at nursery and tillering stage.", "Spray 5% Neem Seed Kernel Extract (NSKE) or neem oil (3 ml/L) at first symptom notice."], "chemical_remedies": [{"active_ingredient": "Tricyclazole 75% WP (Baan / Beam)", "dosage": "0.6 g / liter water (120 g in 200 L water/acre)", "application": "Spray immediately at early leaf blast stage or 5% neck emergence to prevent neck blast."}, {"active_ingredient": "Isoprothiolane 40% EC (Fuji-One)", "dosage": "1.5 ml / liter water", "application": "Effective curative and preventative systemic fungicide."}, {"active_ingredient": "Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top)", "dosage": "1.0 ml / liter water", "application": "Broad-spectrum systemic protection against both blast and sheath blight."}], "preventative_measures": ["Avoid excessive split applications of Urea/nitrogen fertilizers which produce lush, tender tissues susceptible to blast.", "Plant blast-resistant varieties recommended by ICAR (e.g. Swarna Sub-1, Pusa 44, IR 64).", "Burn or deeply plow infected stubble post-harvest to destroy overwintering mycelium."]}, {"id": "rice_sheath_blight", "crop": "rice", "name": "Sheath Blight of Rice (Khol Galan)", "pathogen_type": "Fungal", "pathogen_name": "Rhizoctonia solani", "symptoms": "Oval or elliptical greenish-grey water-soaked spots on leaf sheaths near water line. Spots coalesce with irregular dark brown borders resembling snake-skin patterns. Plants lodge in patches.", "weather_risk_triggers": {"min_temp": 26.0, "max_temp": 34.0, "min_humidity": 80.0, "cloudy_rain": false}, "biological_cures": ["Apply Trichoderma harzianum enriched Farmyard Manure (50 kg FYM + 2 kg Trichoderma/acre) in soil.", "Foliar spray of Bacillus subtilis or Pseudomonas fluorescens @ 2.5 g/L."], "chemical_remedies": [{"active_ingredient": "Hexaconazole 5% EC (Contaf)", "dosage": "2.0 ml / liter water (400 ml/acre)", "application": "Direct the spray nozzle towards the lower base/sheaths of the plants where moisture is trapped."}, {"active_ingredient": "Validamycin 3% L (Sheathmar)", "dosage": "2.5 ml / liter water", "application": "Antibiotic fungicide derived from Streptomyces; extremely safe and target-specific."}, {"active_ingredient": "Thifluzamide 24% SC (Pulsor)", "dosage": "0.75 ml / liter water (150 ml/acre)", "application": "New-generation systemic SDHI fungicide providing 25-day residual control."}], "preventative_measures": ["Maintain wider plant spacing (20 x 15 cm) to allow sunlight and air circulation at ground level.", "Drain standing water intermittently for 2-3 days to lower relative humidity inside the crop canopy.", "Avoid excessive nitrogen; ensure balanced potash (MOP) application to strengthen cell walls."]}, {"id": "rice_bacterial_leaf_blight", "crop": "rice", "name": "Bacterial Leaf Blight (BLB / Jivaanu Jhulsa)", "pathogen_type": "Bacterial", "pathogen_name": "Xanthomonas oryzae pv. oryzae", "symptoms": "Water-soaked translucent lesions starting from leaf tips and margins, progressing into wavy, undulating yellow to bleached-white stripes along the veins. In morning, milky bacterial ooze droplets form on leaves and dry into crusts.", "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 32.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Spray fresh cow dung slurry supernatant (20 kg fresh cow dung soaked in 100 L water, strained) + 5 g/L wood ash.", "Seed soak in Pseudomonas fluorescens suspension (10 g/L) for 12 hours before nursery seeding."], "chemical_remedies": [{"active_ingredient": "Streptocycline (Streptomycin sulphate 90% + Tetracycline hydrochloride 10%)", "dosage": "6 g per 60 liters water (combined with Copper Oxychloride 50% WP @ 2.5 g/L)", "application": "Spray twice at 10-day intervals upon first appearance of leaf blight symptoms."}, {"active_ingredient": "Copper Hydroxide 53.8% DF (Kocide)", "dosage": "2.0 g / liter water", "application": "Broad-spectrum contact bactericide; avoid spraying during hottest midday sun."}], "preventative_measures": ["Immediately stop top-dressing Urea if BLB appears; excess nitrogen drastically accelerates bacterial multiplication.", "Drain flooded field and allow soil to aerate for 48 hours.", "Avoid clipping nursery seedling leaf tips during transplanting, which creates entry wounds for bacteria."]}, {"id": "wheat_yellow_rust", "crop": "wheat", "name": "Yellow Rust / Stripe Rust (Peela Ratawa)", "pathogen_type": "Fungal", "pathogen_name": "Puccinia striiformis f. sp. tritici", "symptoms": "Bright yellow to golden-orange powdery pustules arranged in parallel, continuous linear stripes on the upper leaf surface, leaf sheaths, and glumes. Yellow powder rubs off easily on fingers. Severe infection leads to shriveled grains.", "weather_risk_triggers": {"min_temp": 8.0, "max_temp": 18.0, "min_humidity": 80.0, "cloudy_rain": true}, "biological_cures": ["Bio-seed priming with Trichoderma harzianum @ 10 g/kg seed to boost plant systemic acquired resistance (SAR).", "Foliar spray of fermented butter milk (Chhachh 5 L + 150 L water/acre) containing lactic acid bacteria."], "chemical_remedies": [{"active_ingredient": "Propiconazole 25% EC (Tilt / Bumper)", "dosage": "1.0 ml / liter water (200 ml in 200 L water/acre)", "application": "Spray immediately upon first observation of yellow spots; spray within 48 hours to stop stripe epidemic."}, {"active_ingredient": "Tebuconazole 250 EC (Folicur)", "dosage": "1.0 ml / liter water", "application": "Highly effective systemic triazole curative spray."}], "preventative_measures": ["Grow yellow-rust resistant ICAR varieties (e.g. DBW 187, DBW 222, HD 3086, PBW 725).", "Survey fields weekly in December-February, especially in sub-mountainous foothills and canal tracts.", "Avoid late sowing; plant wheat between October 25 and November 15."]}, {"id": "wheat_loose_smut", "crop": "wheat", "name": "Loose Smut of Wheat (Kangiari)", "pathogen_type": "Fungal", "pathogen_name": "Ustilago tritici", "symptoms": "Every spikelet of the infected wheat earhead is transformed into a loose, black, powdery mass of fungal spores. Initially covered by a delicate silvery membrane which ruptures during emergence, blowing away spores and leaving a bare rachis.", "weather_risk_triggers": {"min_temp": 15.0, "max_temp": 25.0, "min_humidity": 60.0, "cloudy_rain": false}, "biological_cures": ["Solar Heat Treatment of seed: Soak seeds in water for 4 hours in May-June, then spread in thin layer under hot scorching sun for 4 hours.", "Seed treatment with Trichoderma viride @ 8 g/kg seed."], "chemical_remedies": [{"active_ingredient": "Carboxin 37.5% + Thiram 37.5% DS (Vitavax Power)", "dosage": "2.5 g / kg seed", "application": "Mandatory dry seed treatment prior to sowing; penetrates seed coat to kill internally seed-borne dormant mycelium."}, {"active_ingredient": "Tebuconazole 2% DS (Raxil)", "dosage": "1.0 g / kg seed", "application": "Systemic seed dressing providing 100% loose smut eradication."}], "preventative_measures": ["Never harvest seed from fields that showed loose smut heads.", "Rogue out and destroy infected earheads inside plastic bags before spores disperse into adjacent healthy flowering heads."]}, {"id": "potato_late_blight", "crop": "potato", "name": "Late Blight of Potato (Aloo Ka Pachheta Jhulsa)", "pathogen_type": "Fungal", "pathogen_name": "Phytophthora infestans", "symptoms": "Water-soaked, dark green to purplish-black lesions appearing on leaf tips and margins. Under high humidity, white downy fungal cottony growth develops on the underside of leaves. Entire foliage collapses into a rotten, foul-smelling black mush in 48-72 hours. Tubers develop dry, sunken reddish-brown rot.", "weather_risk_triggers": {"min_temp": 10.0, "max_temp": 22.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Prophylactic spray of Trichoderma harzianum (4 g/L) + neem oil (3 ml/L) before weather turns foggy/drizzling.", "Foliar application of garlic extract (5%) + copper sulphate (0.05%) organic spray."], "chemical_remedies": [{"active_ingredient": "Mancozeb 75% WP (Dithane M-45 / Indofil M-45)", "dosage": "2.5 g / liter water (Prophylactic / Preventative spray)", "application": "Spray prior to rain/fog when canopy touches rows to create a chemical protective barrier."}, {"active_ingredient": "Cymoxanil 8% + Mancozeb 64% WP (Curzate)", "dosage": "2.5 g / liter water (Curative / Eradicant)", "application": "Spray within 24-48 hours of detecting initial water-soaked leaf spots."}, {"active_ingredient": "Dimethomorph 50% WP (Acrobat) OR Mandipropamid 23.4% SC (Revus)", "dosage": "1.0 g / liter water OR 0.8 ml / liter water", "application": "Advanced anti-oomycete systemic spray during severe disease outbreak."}], "preventative_measures": ["Use certified disease-free potato seed tubers from trusted ICAR-CPRI / State seed corporations.", "High earthing-up (at least 15 cm soil cover over tubers) to prevent zoospores from washing down from infected leaves into tubers.", "De-haulm (cut and destroy haulms/vines) 10 days prior to harvest if late blight occurs in late season."]}, {"id": "potato_early_blight", "crop": "potato", "name": "Early Blight of Potato (Aloo Ka Ageta Jhulsa)", "pathogen_type": "Fungal", "pathogen_name": "Alternaria solani", "symptoms": "Dark brown to black angular spots on older lower leaves displaying characteristic concentric ridges resembling a 'target board' or tree ring. Yellow halo surrounds spots, followed by leaf drying and drop.", "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 30.0, "min_humidity": 70.0, "cloudy_rain": false}, "biological_cures": ["Spray Pseudomonas fluorescens (0.2%) combined with 0.1% jaggery solution as sticker.", "Soil application of Trichoderma viride enriched compost."], "chemical_remedies": [{"active_ingredient": "Chlorothalonil 75% WP (Kavach)", "dosage": "2.0 g / liter water", "application": "Outstanding multi-site contact fungicide with strong rain-fastness."}, {"active_ingredient": "Difenoconazole 25% EC (Score)", "dosage": "0.5 ml / liter water", "application": "Potent curative triazole spray halting Alternaria mycelial expansion."}], "preventative_measures": ["Maintain optimal crop nutrition; plants stressed for nitrogen or potassium suffer severely from early blight.", "Practice minimum 2-year crop rotation avoiding solanaceous crops (tomato, brinjal)."]}, {"id": "tomato_leaf_curl", "crop": "tomato", "name": "Tomato Leaf Curl Virus (ToLCV / Parna Kunchan)", "pathogen_type": "Viral (Transmitted by Whitefly Bemisia tabaci)", "pathogen_name": "Tomato leaf curl New Delhi virus (ToLCNDV)", "symptoms": "Severe upward and inward curling, puckering, and crinkling of leaves. Veins thicken and leaves become leathery, pale yellow, and reduced in size. Plants severely stunted, forming a bushy rosette; flowers drop without setting fruit.", "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 36.0, "min_humidity": 40.0, "cloudy_rain": false}, "biological_cures": ["Install Yellow Sticky Traps @ 25-30 traps/acre to mass-trap whitefly vectors.", "Spray 5% Neem Seed Kernel Extract (NSKE) or Azadirachtin 10000 ppm @ 2 ml/L at nursery stage.", "Spray entomopathogenic fungus Beauveria bassiana @ 5 g/L to parasitise whitefly nymphs."], "chemical_remedies": [{"active_ingredient": "Diafenthiuron 50% WP (Pegasus)", "dosage": "1.2 g / liter water", "application": "Knocks down both adult whiteflies and nymphs on the undersides of leaves."}, {"active_ingredient": "Spiromesifen 22.9% SC (Oberon)", "dosage": "1.0 ml / liter water", "application": "Lipid biosynthesis inhibitor targeting whitefly eggs and nymphs."}, {"active_ingredient": "Thiamethoxam 25% WG (Actara) OR Acetamiprid 20% SP", "dosage": "0.4 g / liter water", "application": "Systemic neonicotinoid spray for rapid vector suppression."}], "preventative_measures": ["Grow nursery seedlings under 40-mesh insect-proof nylon net tunnels.", "Plant 2-3 border rows of tall barrier crops like Maize, Sorghum, or Bajra around tomato plots.", "Uproot and bury rogue virus-infected plants immediately to prevent whiteflies spreading virus to neighbors."]}, {"id": "tomato_bacterial_wilt", "crop": "tomato", "name": "Bacterial Wilt of Tomato (Ukhata Rog)", "pathogen_type": "Bacterial", "pathogen_name": "Ralstonia solanacearum", "symptoms": "Rapid, sudden, and irreversible wilting of the whole plant while foliage remains completely green (no prior yellowing). In diagnostic stem-ooze test, a cut stem dipped in a clear glass of water releases thick, white cloudy bacterial threads streaming downward.", "weather_risk_triggers": {"min_temp": 28.0, "max_temp": 38.0, "min_humidity": 80.0, "cloudy_rain": true}, "biological_cures": ["Seedling root dip in Pseudomonas fluorescens suspension (20 g/L) for 30 minutes before transplanting.", "Soil application of Trichoderma viride enriched neem cake (250 kg/acre).", "Crop rotation with marigold (Tagetes erecta) which exudes bactericidal and nematicidal root secretions."], "chemical_remedies": [{"active_ingredient": "Copper Oxychloride 50% WP (Blitox) + Streptocycline", "dosage": "3.0 g / L Blitox + 0.1 g / L Streptocycline", "application": "Soil drenching around plant root zone (150-200 ml solution per plant)."}], "preventative_measures": ["Raise soil pH with agricultural lime if soil is acidic; Ralstonia thrives in acidic wet soils.", "Plant on raised beds to ensure rapid root zone drainage.", "Avoid root injury during hoeing and intercultural operations."]}, {"id": "sugarcane_red_rot", "crop": "sugarcane", "name": "Red Rot of Sugarcane (Ganne Ka Lal Sadand)", "pathogen_type": "Fungal", "pathogen_name": "Colletotrichum falcatum", "symptoms": "Upper leaves (3rd and 4th) turn yellow, wither, and dry from tip downwards. When the cane stalk is split longitudinally, the internal pith tissue shows bright red discoloration interspersed with diagnostic white transverse patches across the stalk, accompanied by a sour, alcoholic fermentation odor.", "weather_risk_triggers": {"min_temp": 28.0, "max_temp": 36.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Sett treatment by dipping seed cane in Trichoderma harzianum suspension (10 g/L) for 20 minutes before planting.", "Apply Trichoderma-enriched pressmud (sugar mill organic cake @ 5 t/ha) in planting furrows."], "chemical_remedies": [{"active_ingredient": "Carbendazim 50% WP (Bavistin)", "dosage": "1.0 g / liter water (0.1% solution)", "application": "Dip cane setts for 15 minutes prior to planting in furrows."}, {"active_ingredient": "Hot Water Treatment (HWT)", "dosage": "Physical heat treatment at 50°C for 2 hours or moist hot air (54°C for 2.5 hrs)", "application": "Standard sugar mill nursery practice for foundation seed cane."}], "preventative_measures": ["Strictly avoid ratooning an infected sugarcane crop; plow out roots and burn crop residues.", "Plant red-rot resistant varieties recommended by ICAR-SBI (e.g. Co 0238 substitutes: Co 15023, Co 0118, CoLK 14201).", "Ensure field does not suffer from waterlogging during monsoon."]}, {"id": "cotton_pink_bollworm", "crop": "cotton", "name": "Pink Bollworm of Cotton (Gulabi Sundi)", "pathogen_type": "Insect Pest", "pathogen_name": "Pectinophora gossypiella", "symptoms": "Larvae bore into flower buds, causing 'rosetted flowers' that fail to open properly. Young larvae bore into developing green bolls, closing entry holes behind them. Inside bolls, larvae eat developing seeds, stain lint brown, and cause bolls to rot or open prematurely.", "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 34.0, "min_humidity": 65.0, "cloudy_rain": false}, "biological_cures": ["Install Pheromone Traps (Pectino-lure) @ 8-10 traps/acre for pest monitoring and mating disruption.", "Release egg parasitoid Trichogramma bactrae @ 60,000 parasitoids/acre at weekly intervals from 45 DAS.", "Spray Neem formulation (Azadirachtin 5% @ 1.5 ml/L) at early square formation."], "chemical_remedies": [{"active_ingredient": "Profenofos 50% EC (Curacron)", "dosage": "2.0 ml / liter water (400 ml/acre)", "application": "Ovicidal and larvicidal spray during evening hours when adult moths are active."}, {"active_ingredient": "Chlorantraniliprole 18.5% SC (Coragen)", "dosage": "0.35 ml / liter water (70 ml in 200 L water/acre)", "application": "Highly effective ryanodine receptor activator providing long-lasting boll protection."}, {"active_ingredient": "Emamectin Benzoate 5% SG (Proclaim)", "dosage": "0.5 g / liter water (100 g/acre)", "application": "Translaminar micro-dosed spray targeting bollworm larvae."}], "preventative_measures": ["Do not extend cotton crop beyond December (terminate crop after 150-160 days); avoiding ratoon prevents carry-over of diapausing larvae.", "Deep summer plowing exposes diapausing larvae to predatory birds and summer solar heat."]}, {"id": "mustard_white_rust", "crop": "mustard", "name": "White Rust / Blister of Mustard (Safed Ratawa)", "pathogen_type": "Fungal", "pathogen_name": "Albugo candida", "symptoms": "Prominent creamy white or light yellow raised blisters/pustules on the lower surface of leaves. Hypertrophy and malformation of floral inflorescence forming swollen, twisted, sterile structures called 'Staghead' which produce zero seeds.", "weather_risk_triggers": {"min_temp": 12.0, "max_temp": 20.0, "min_humidity": 80.0, "cloudy_rain": true}, "biological_cures": ["Seed treatment with Trichoderma viride @ 10 g/kg seed.", "Spray 10% aqueous bulb extract of Garlic (Allium sativum) which has powerful antifungal allicin."], "chemical_remedies": [{"active_ingredient": "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)", "dosage": "2.0 g / liter water", "application": "Spray at initial appearance of leaf blisters and repeat at flowering if foggy weather persists."}, {"active_ingredient": "Mancozeb 75% WP", "dosage": "2.5 g / liter water", "application": "Contact preventative spray on leaves and floral racemes."}], "preventative_measures": ["Sow mustard early (between October 10 and October 25) to escape white rust and aphid peaks in December-January.", "Collect and burn floral stagheads to arrest primary oospore return to the soil."]}, {"id": "mustard_aphids", "crop": "mustard", "name": "Mustard Aphids (Mahu / Chepa)", "pathogen_type": "Insect Pest", "pathogen_name": "Lipaphis erysimi", "symptoms": "Hundreds of tiny greenish-yellow soft-bodied insects congregate on tender shoots, inflorescences, and pods. Sucking cell sap leads to curled leaves, stunted plants, and blighted pods. Aphids excrete sticky honeydew attracting black sooty mold.", "weather_risk_triggers": {"min_temp": 12.0, "max_temp": 22.0, "min_humidity": 70.0, "cloudy_rain": true}, "biological_cures": ["Conserve natural predators: Ladybird beetles (Coccinella septempunctata) and Syrphid fly larvae.", "Spray Neem oil (3000 ppm) @ 5 ml/L water or 5% NSKE.", "Install Yellow Sticky Traps @ 20 traps/acre."], "chemical_remedies": [{"active_ingredient": "Dimethoate 30% EC (Rogor) OR Oxydemeton-methyl 25% EC (Metasystox)", "dosage": "1.5 ml / liter water (300 ml/acre)", "application": "Spray when Economic Threshold Level (ETL) exceeds 25-30 aphids per 10 cm central twig."}, {"active_ingredient": "Thiamethoxam 25% WG", "dosage": "0.4 g / liter water", "application": "Systemic neonicotinoid providing rapid knockdown."}], "preventative_measures": ["Spray in afternoon/evening hours (after 3 PM) to prevent harming foraging honeybees pollinating mustard.", "Avoid excessive nitrogen fertilization which creates succulent vegetative growth attractive to aphids."]}, {"id": "groundnut_tikka", "crop": "groundnut", "name": "Tikka Disease / Leaf Spot of Groundnut (Tikka Rog)", "pathogen_type": "Fungal", "pathogen_name": "Cercospora arachidicola (Early) & Phaeoisariopsis personata (Late)", "symptoms": "Early leaf spot produces circular reddish-brown spots with prominent bright yellow halos. Late leaf spot produces smaller, dark brown to black spots mostly on lower leaf surface without prominent yellow halos. Causes premature defoliation, leaving bare stalks with underdeveloped pods.", "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 32.0, "min_humidity": 80.0, "cloudy_rain": true}, "biological_cures": ["Seed treatment with Trichoderma harzianum @ 10 g/kg seed.", "Foliar spray of fermented neem seed leaf extract (5%) + raw cow milk (10%) as a natural spore germination inhibitor."], "chemical_remedies": [{"active_ingredient": "Hexaconazole 5% EC (Contaf)", "dosage": "2.0 ml / liter water", "application": "Foliar spray at 35 and 50 DAS (days after sowing) controls both Tikka and groundnut rust."}, {"active_ingredient": "Carbendazim 12% + Mancozeb 63% WP (Saaf)", "dosage": "2.0 g / liter water", "application": "Dual systemic and contact protection."}, {"active_ingredient": "Tebuconazole 25.9% EC (Folicur)", "dosage": "1.0 ml / liter water", "application": "Excellent curative eradication of Cercospora mycelium."}], "preventative_measures": ["Incorporate crop residues deeply into soil using moldboard plow to bury fungal perennating bodies.", "Practice intercropping with Bajra or Redgram (6:1 ratio) to physically break fungal spore transit."]}, {"id": "soybean_yellow_mosaic", "crop": "soybean", "name": "Yellow Mosaic Virus of Soybean (Peela Mojek Rog)", "pathogen_type": "Viral (Transmitted by Whitefly Bemisia tabaci)", "pathogen_name": "Mungbean yellow mosaic India virus (MYMIV)", "symptoms": "Alternate bright yellow and dark green patches scattered across the trifoliate leaves. Leaves become blistered, crinkled, and leathery. Pods on infected plants are small, distorted, and produce shriveled, discolored seeds.", "weather_risk_triggers": {"min_temp": 26.0, "max_temp": 35.0, "min_humidity": 60.0, "cloudy_rain": false}, "biological_cures": ["Seed treatment with bio-agent Trichoderma viride @ 8 g/kg seed.", "Install Yellow Sticky Traps @ 20-25 traps/acre.", "Spray Neem oil 1500 ppm @ 4 ml/L water to repel vector whiteflies."], "chemical_remedies": [{"active_ingredient": "Thiamethoxam 30% FS (Cruiser)", "dosage": "10 ml / kg seed", "application": "Seed treatment prior to sowing gives 25-30 days systemic immunity against whitefly vector."}, {"active_ingredient": "Beta-cyfluthrin + Imidacloprid (Solomon)", "dosage": "1.0 ml / liter water (140 ml/acre)", "application": "Combined systemic and contact insecticide spray upon first sighting of whiteflies."}], "preventative_measures": ["Grow YMV-resistant soybean varieties (e.g. JS 20-34, JS 20-69, JS 20-98, NRC 37).", "Uproot and destroy stray infected plants within first 3 weeks of germination."]}, {"id": "maize_fall_armyworm", "crop": "maize", "name": "Fall Armyworm (FAW / Sainik Keet)", "pathogen_type": "Insect Pest", "pathogen_name": "Spodoptera frugiperda", "symptoms": "Young larvae scrape leaf epidermis creating 'window panes'. Older larvae bore deep into the central plant whorl, producing massive ragged holes and large amounts of sawdust-like fecal frass (droppings). Feeding destroys the central growing shoot (dead heart).", "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 34.0, "min_humidity": 60.0, "cloudy_rain": false}, "biological_cures": ["Whorl application of dry sand mixed with neem cake (9:1 ratio) or wood ash into central whorls.", "Foliar spray of entomopathogenic fungus Metarhizium anisopliae or Nomuraea rileyi @ 5 g/L.", "Release egg parasitoid Trichogramma chilonis @ 50,000/acre."], "chemical_remedies": [{"active_ingredient": "Chlorantraniliprole 18.5% SC (Coragen)", "dosage": "0.4 ml / liter water (directed strictly into the central leaf whorls)", "application": "Spray early at 8-15 days stage before larvae penetrate deep inside."}, {"active_ingredient": "Spinetoram 11.7% SC (Delegate)", "dosage": "0.5 ml / liter water", "application": "Broad-spectrum neurotoxin of biological origin with stellar efficacy against caterpillars."}, {"active_ingredient": "Emamectin Benzoate 5% SG", "dosage": "0.5 g / liter water", "application": "Direct nozzle right into the funnel of each maize plant."}], "preventative_measures": ["Erect pheromone traps @ 5 traps/acre right from seedling emergence.", "Intercrop maize with cowpea, pigeonpea, or desmodium which naturally repels armyworm moths."]}, {"id": "onion_purple_blotch", "crop": "onion", "name": "Purple Blotch of Onion & Garlic (Baingani Dhabba)", "pathogen_type": "Fungal", "pathogen_name": "Alternaria porri", "symptoms": "Small, water-soaked lesions that quickly develop into sunken, purplish-brown elliptical spots surrounded by a pale yellow halo. Leaves turn yellow, collapse, and break at the lesion point. In seed crops, flower stalks girdled and snap easily.", "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 30.0, "min_humidity": 80.0, "cloudy_rain": true}, "biological_cures": ["Seed treatment and bulb dip in Trichoderma viride suspension (10 g/L).", "Spray with crude neem seed extract (5%) mixed with agricultural surfactant sticker."], "chemical_remedies": [{"active_ingredient": "Difenoconazole 25% EC (Score)", "dosage": "0.6 ml / liter water (always add 0.5 ml non-ionic wetting sticker like Sandovit per liter)", "application": "Sticker is mandatory because onion leaves are waxy and chemical rolls off."}, {"active_ingredient": "Mancozeb 75% WP", "dosage": "2.5 g / liter water + sticker", "application": "Prophylactic spray prior to bulb initiation."}, {"active_ingredient": "Tebuconazole 50% + Trifloxystrobin 25% WG (Nativo)", "dosage": "0.7 g / liter water", "application": "Exceptional systemic cure on both foliage and floral scapes."}], "preventative_measures": ["Do not exceed nitrogen doses after 45 days after transplanting (softens neck tissues).", "Stop irrigation 10-15 days before harvesting to allow necks to dry and seal properly."]}, {"id": "chilli_anthracnose", "crop": "chilli", "name": "Anthracnose / Fruit Rot / Die-Back of Chilli (Phal Sadand)", "pathogen_type": "Fungal", "pathogen_name": "Colletotrichum capsici", "symptoms": "Die-back appears as drying of twigs from tip downwards; twigs turn bleached greyish-white. On ripe red fruits, circular sunken lesions develop with concentric rings of black fungal acervuli (dots), causing pods to rot, turn straw-colored, and fall off.", "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 32.0, "min_humidity": 80.0, "cloudy_rain": true}, "biological_cures": ["Seed treatment with Trichoderma viride @ 10 g/kg seed.", "Foliar spray of Pseudomonas fluorescens @ 2 g/L during fruit set."], "chemical_remedies": [{"active_ingredient": "Azoxystrobin 23% SC (Amistar)", "dosage": "1.0 ml / liter water", "application": "Strobilurin fungicide spray when red fruit development begins."}, {"active_ingredient": "Copper Oxychloride 50% WP (Blitox)", "dosage": "3.0 g / liter water", "application": "Contact copper spray protecting twigs from die-back infection."}, {"active_ingredient": "Propiconazole 25% EC", "dosage": "1.0 ml / liter water", "application": "Curative spray arresting mycelial advance."}], "preventative_measures": ["Never collect seeds from fruits showing sunken black rot lesions.", "Maintain wide ridge spacing and prune lower ground-touching foliage to improve aeration."]}, {"id": "ginger_rhizome_rot", "crop": "ginger", "name": "Soft Rot / Rhizome Rot of Ginger & Turmeric (Gath Sadand)", "pathogen_type": "Oomycete / Fungal", "pathogen_name": "Pythium aphanidermatum / Pythium myriotylum", "symptoms": "Water-soaked lesions appear on the collar region of pseudostems at ground level. Lower leaves turn pale yellow, progressing to upper leaves. Pseudostems easily pull out from rhizomes with a foul rotting smell. Infected rhizomes become soft, water-soaked, and rot into a pulpy mush.", "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 34.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Seed rhizome treatment: Soak seed rhizomes in Trichoderma harzianum suspension (10 g/L) for 30 minutes before planting.", "Apply Trichoderma-enriched neem cake (100 kg/acre) in raised beds.", "Mulch heavily with green forest leaves (10 tons/ha) to suppress soil-borne oospores."], "chemical_remedies": [{"active_ingredient": "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)", "dosage": "2.5 g / liter water", "application": "Soil drenching around beds and clumps (300-500 ml per plant cluster) at first sign of yellowing."}, {"active_ingredient": "Copper Oxychloride 50% WP", "dosage": "3.0 g / liter water", "application": "Drenching beds to arrest secondary bacterial soft rot."}], "preventative_measures": ["Plant strictly on raised beds (15-20 cm high, 1 meter wide) with deep drainage channels between beds.", "Provide zero standing water; Pythium zoospores swim in standing water to infect healthy rhizomes in hours."]}, {"id": "banana_sigatoka", "crop": "banana", "name": "Sigatoka Leaf Spot of Banana (Patti Dhabba Rog)", "pathogen_type": "Fungal", "pathogen_name": "Pseudocercospora musae (Mycosphaerella musicola)", "symptoms": "Tiny yellowish-green streaks on leaves, enlarging into linear spindle-shaped spots with dark brown to black borders and light greyish centers. Spots coalesce, causing extensive premature leaf scorch and drying. Reduces bunch weight and causes premature uneven fruit ripening.", "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 32.0, "min_humidity": 80.0, "cloudy_rain": true}, "biological_cures": ["Foliar spray of mineral oil (Banana spray oil @ 10 ml/L) which inhibits fungal ascospore penetration.", "Spray Pseudomonas fluorescens (0.2%) + neem oil (3 ml/L)."], "chemical_remedies": [{"active_ingredient": "Propiconazole 25% EC (Tilt)", "dosage": "1.0 ml / liter water + 10 ml mineral oil/L", "application": "Spray on both upper and lower leaf surfaces."}, {"active_ingredient": "Trifloxystrobin 25% + Tebuconazole 50% WG (Nativo)", "dosage": "0.6 g / liter water", "application": "High-potency systemic cure preserving green leaf canopy."}], "preventative_measures": ["De-leafing: Regularly cut and burn severely infected, dead leaf tissue.", "Maintain optimal drainage to prevent humid microclimates inside the plantation canopy."]}, {"id": "apple_scab", "crop": "apple", "name": "Apple Scab (Seb Ka Scab Rog)", "pathogen_type": "Fungal", "pathogen_name": "Venturia inaequalis", "symptoms": "Olive-green, velvety, circular spots on leaves that turn dark brown to black and leathery. On developing fruits, rough, corky, scabby black lesions appear. Fruit cracks, becomes distorted, and drops prematurely.", "weather_risk_triggers": {"min_temp": 12.0, "max_temp": 24.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Spray 5% Urea solution on fallen orchard leaves in late autumn to accelerate leaf decomposition and destroy overwintering pseudothecia.", "Spray Trichoderma viride (0.5%) before bud break."], "chemical_remedies": [{"active_ingredient": "Mancozeb 75% WP (Silver tip / Green tip stage)", "dosage": "3.0 g / liter water", "application": "Early spring protective spray."}, {"active_ingredient": "Difenoconazole 25% EC (Score) OR Hexaconazole 5% EC", "dosage": "0.5 ml / liter water (Pink bud to petal fall stage)", "application": "Curative systemic triazole spray."}, {"active_ingredient": "Dodine 65% WP", "dosage": "1.0 g / liter water", "application": "Specialist anti-scab fungicide."}], "preventative_measures": ["Prune tree canopy annually to allow sunlight and wind penetration for quick leaf drying.", "Follow the state horticulture university spray schedule strictly based on ascospore maturity."]}, {"id": "bajra_downy_mildew", "crop": "bajra", "name": "Downy Mildew / Green Ear Disease (Harit Bali)", "pathogen_type": "Fungal", "pathogen_name": "Sclerospora graminicola", "symptoms": "Leaves show chlorotic pale-yellow streaks with white downy fungal growth on underside during humid mornings. Most diagnostic symptom is transformation of floral spikelets into twisted leafy green structures ('green ear') instead of grain.", "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 30.0, "min_humidity": 80.0, "cloudy_rain": true}, "biological_cures": ["Seed biopriming with Trichoderma harzianum or Pseudomonas fluorescens @ 10 g/kg seed.", "Soil application of Trichoderma enriched FYM (50 kg FYM + 2.5 kg bio-agent/acre) at field prep.", "Foliar spray of 5% Neem Seed Kernel Extract (NSKE) at early tillering."], "chemical_remedies": [{"active_ingredient": "Metalaxyl-M 31.8% ES (Apron XL)", "dosage": "2.0 ml / kg seed", "application": "Mandatory systemic seed dress before sowing for absolute early downy mildew prevention."}, {"active_ingredient": "Mancozeb 75% WP (Dithane M-45)", "dosage": "2.0 g / liter water (400 g in 200 L water/acre)", "application": "Foliar protective spray at 20 and 35 days after sowing if chlorotic streaks appear."}, {"active_ingredient": "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)", "dosage": "2.0 g / liter water", "application": "Systemic + contact curative spray upon first observation of downy growth."}], "preventative_measures": ["Grow downy-mildew resistant ICAR hybrids (e.g. HHB 67 Improved, MPMH 17, GHB 744, RHB 173).", "Rogue out and burn infected green-ear plants immediately before secondary sporangia disperse.", "Practice minimum 2-year crop rotation with non-cereal crops like moong or cluster bean."]}, {"id": "bajra_ergot", "crop": "bajra", "name": "Ergot of Bajra (Gondia / Chep Rog)", "pathogen_type": "Fungal", "pathogen_name": "Claviceps fusiformis", "symptoms": "Droplets of sticky, amber-to-pinkish honeydew fluid ooze from spikelets during early protogynous flowering. Later, honeydew hardens into dark brown to black elongated sclerotia (fungal ergots) that replace healthy grains.", "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 30.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Spray baking soda (sodium bicarbonate 5 g/L) + fermented buttermilk (20 ml/L) at boot leaf stage.", "Foliar spray of Trichoderma viride culture filtrate (5 ml/L) during panicle emergence."], "chemical_remedies": [{"active_ingredient": "Carbendazim 50% WP (Bavistin)", "dosage": "1.0 g / liter water (200 g in 200 L water/acre)", "application": "First prophylactic spray at 5% panicle flowering; repeat 7 days later if overcast rain persists."}, {"active_ingredient": "Ziram 27% SC", "dosage": "2.5 ml / liter water", "application": "Broad-spectrum foliar dithiocarbamate protecting florets from ascospore germination."}], "preventative_measures": ["Salt water flotation: Immerse seed in 20% common salt solution (2 kg salt in 10 L water); discard floating ergot sclerotia.", "Synchronize sowing dates across the village to minimize prolonged flowering windows.", "Deep summer plowing to bury sclerotia deeper than 7 cm to inhibit perithecial germination."]}, {"id": "barley_covered_smut", "crop": "barley", "name": "Covered Smut of Barley (Band Kangiari)", "pathogen_type": "Fungal", "pathogen_name": "Ustilago hordei", "symptoms": "Spikelets in infected earheads are converted into compact, hard black masses of smut chlamydospores encased in a silvery-grey membrane that remains intact until mechanical threshing.", "weather_risk_triggers": {"min_temp": 14.0, "max_temp": 22.0, "min_humidity": 60.0, "cloudy_rain": false}, "biological_cures": ["Seed treatment with Trichoderma viride @ 8 g/kg seed before sowing.", "Bio-priming seeds with Pseudomonas fluorescens (10 g/kg) for 6 hours."], "chemical_remedies": [{"active_ingredient": "Carboxin 37.5% + Thiram 37.5% DS (Vitavax Power)", "dosage": "2.5 g / kg seed", "application": "Dry seed dressing kills externally and internally seed-borne teleutospores."}, {"active_ingredient": "Tebuconazole 2% DS (Raxil)", "dosage": "1.0 g / kg seed", "application": "Modern triazole dry powder seed treatment offering 100% control of smuts."}], "preventative_measures": ["Use certified smut-free seed lots from accredited university or national seed agencies.", "Hot water treatment (soak in cold water 4 hours, then dip in 52°C water for 10 minutes) for organic farms."]}, {"id": "barley_stripe_disease", "crop": "barley", "name": "Barley Leaf Stripe (Patti Dhaari Rog)", "pathogen_type": "Fungal", "pathogen_name": "Drechslera graminea (Pyrenophora graminea)", "symptoms": "Long, continuous yellow-to-brown necrotic stripes running parallel to leaf veins from tillering stage onwards. Leaves fray, split, and shred longitudinally into ribbons; infected earheads remain sterile.", "weather_risk_triggers": {"min_temp": 14.0, "max_temp": 24.0, "min_humidity": 75.0, "cloudy_rain": true}, "biological_cures": ["Seed coating with Trichoderma harzianum @ 10 g/kg seed.", "Foliar spray of cow urine extract (10% v/v) at tillering stage."], "chemical_remedies": [{"active_ingredient": "Propiconazole 25% EC (Tilt)", "dosage": "1.0 ml / liter water (200 ml/acre)", "application": "Systemic foliar spray upon observing first leaf stripe symptoms."}, {"active_ingredient": "Azoxystrobin 23% SC", "dosage": "1.0 ml / liter water", "application": "Strobilurin broad-spectrum fungicide with strong greening effect."}], "preventative_measures": ["Sow barley between Oct 25 and Nov 15; avoid late sowings in cold soil which enhance infection.", "Grow resistant cultivars like RD 2552, BH 902, PL 426, or DWRB 123."]}, {"id": "blackgram_mymv", "crop": "blackgram", "name": "Yellow Mosaic Virus (MYMV - Peeli Patti)", "pathogen_type": "Viral", "pathogen_name": "Mungbean Yellow Mosaic Virus (Vector: Bemisia tabaci)", "symptoms": "Bright yellow chlorotic specks along small veins on young trifoliate leaves, quickly merging into full golden-yellow patches. Plants become severely stunted; pods are small, curled upward with shriveled seeds.", "weather_risk_triggers": {"min_temp": 26.0, "max_temp": 37.0, "min_humidity": 55.0, "cloudy_rain": false}, "biological_cures": ["Install yellow sticky traps @ 15-20 traps/acre to trap and monitor whitefly vector populations.", "Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or 10,000 ppm Neem Oil @ 2 ml/L at 15 DAS.", "Foliar spray of entomopathogenic fungus Beauveria bassiana @ 5 g/L to parasitise whitefly nymphs."], "chemical_remedies": [{"active_ingredient": "Thiamethoxam 25% WG (Actara)", "dosage": "0.3 g / liter water (40-50 g/acre)", "application": "Target underside of leaves at 15 and 30 DAS to eliminate sap-sucking whitefly vectors."}, {"active_ingredient": "Diafenthiuron 50% WP (Pegasus)", "dosage": "1.25 g / liter water", "application": "Excellent translaminar insecticide against resistant whitefly nymph populations."}, {"active_ingredient": "Imidacloprid 17.8% SL (Confidor)", "dosage": "0.4 ml / liter water", "application": "Systemic protection restricting viral vector transmission."}], "preventative_measures": ["Grow MYMV-resistant ICAR varieties (e.g. Pant U-31, Shekhar 2, Uttara, VBN 8, Mash 114).", "Mandatory seed dress with Imidacloprid 600 FS (5 ml/kg seed) to guarantee 30-day early vector immunity.", "Rogue out and bury early infected virus-reservoir plants within the first 25 days."]}, {"id": "blackgram_powdery_mildew", "crop": "blackgram", "name": "Powdery Mildew of Blackgram (Chhachhia)", "pathogen_type": "Fungal", "pathogen_name": "Erysiphe polygoni", "symptoms": "White flour-like powdery patches on upper leaf surfaces, petioles, and developing pods. Leaves turn dull brownish, curl, dry, and fall prematurely, causing substantial yield reduction.", "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 28.0, "min_humidity": 75.0, "cloudy_rain": false}, "biological_cures": ["Foliar spray of Ampelomyces quisqualis (hyper-parasitic bio-agent) @ 5 g/L.", "Foliar spray of sulfur-rich wood ash suspension (50 g/L) or diluted buttermilk (50 ml/L)."], "chemical_remedies": [{"active_ingredient": "Wettable Sulfur 80% WP (Sulfex)", "dosage": "2.5 g / liter water (500 g in 200 L water/acre)", "application": "Spray thoroughly at first appearance of white powdery flecks; repeat after 10 days."}, {"active_ingredient": "Hexaconazole 5% EC (Contaf)", "dosage": "1.5 ml / liter water", "application": "Systemic triazole providing complete eradication of established powdery mycelium."}], "preventative_measures": ["Avoid dense planting; maintain proper line spacing (30 x 10 cm) for air flow.", "Destroy weed hosts like Trianthema portulacastrum that harbor overwintering cleistothecia."]}, {"id": "chickpea_fusarium_wilt", "crop": "chickpea", "name": "Fusarium Wilt of Chickpea (Chana Ukhta Rog)", "pathogen_type": "Fungal", "pathogen_name": "Fusarium oxysporum f. sp. ciceris", "symptoms": "Sudden drooping of petioles, leaves, and rachis without conspicuous yellowing. Lower leaves turn dull grey-green and dry. Vertical splitting of the root shows pronounced dark brown to black xylem vascular pith discoloration.", "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 30.0, "min_humidity": 60.0, "cloudy_rain": false}, "biological_cures": ["Seed treatment with Trichoderma asperellum @ 10 g/kg seed + Pseudomonas fluorescens @ 10 g/kg.", "Soil application of Trichoderma enriched compost (100 kg FYM + 4 kg Trichoderma/acre) at sowing."], "chemical_remedies": [{"active_ingredient": "Carbendazim 12% + Mancozeb 63% WP (SAAF)", "dosage": "2.5 g / kg seed", "application": "Seed treatment prior to sowing to establish protective fungicidal barrier around root zone."}, {"active_ingredient": "Thiophanate Methyl 70% WP (Roko)", "dosage": "1.5 g / liter water", "application": "Drench root zone of plants surrounding wilted patches to restrict fungal spreading."}], "preventative_measures": ["Sow chickpea varieties genetically resistant to Fusarium wilt (e.g. JG 11, JAKI 9218, Digvijay, Pusa 372).", "Avoid early sowing when soil temperatures exceed 28°C; sow in late October/early November.", "Adopt 3-year crop rotation with non-host cereals like sorghum, pearl millet, or wheat."]}, {"id": "chickpea_pod_borer", "crop": "chickpea", "name": "Gram Pod Borer (Chana Sundi / Caterpillar)", "pathogen_type": "Insect Pest", "pathogen_name": "Helicoverpa armigera", "symptoms": "Larvae feed on tender leaves during early growth, then bore neat circular holes into developing chickpea pods and devour inner developing seeds while thrusting the front half of their body inside.", "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 32.0, "min_humidity": 50.0, "cloudy_rain": false}, "biological_cures": ["Install Helicoverpa pheromone traps (Helilure) @ 5 traps/acre for pest monitoring and mating disruption.", "Set up 'T'-shaped bird perches @ 20/acre to encourage predatory birds (black drongos, mynas).", "Foliar spray of HaNPV (Helicoverpa Nuclear Polyhedrosis Virus) @ 250 LE/acre (1.5 ml/L).", "Spray Bacillus thuringiensis (Bt) @ 2.0 g/L or 5% NSKE at flowering."], "chemical_remedies": [{"active_ingredient": "Chlorantraniliprole 18.5% SC (Coragen)", "dosage": "0.3 ml / liter water (60 ml in 200 L water/acre)", "application": "Spray when 1 larva per meter row length (ETL) is spotted; offers 21-day residual pod protection."}, {"active_ingredient": "Emamectin Benzoate 5% SG (Proclaim)", "dosage": "0.5 g / liter water (100 g/acre)", "application": "Rapid translaminar action causing immediate feeding cessation of active larvae."}, {"active_ingredient": "Indoxacarb 14.5% SC", "dosage": "1.0 ml / liter water", "application": "Target early instar larvae at podding stage."}], "preventative_measures": ["Intercrop chickpea with coriander or mustard (4:1 ratio) to augment natural parasitoids (Campoletis chlorideae).", "Deep summer plowing to expose resting pupae to predatory birds and solar heat."]}, {"id": "coconut_bud_rot", "crop": "coconut", "name": "Bud Rot of Coconut (Kavathu Rog)", "pathogen_type": "Fungal", "pathogen_name": "Phytophthora palmivora", "symptoms": "Youngest central spindle leaf loses turgidity, turns pale yellow, and bends over. Base of tender central fronds rots into a foul-smelling soft slime, easily pulling out by hand. Fatal if untreated.", "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 30.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Trichoderma harzianum cake placement in the leaf axils of the crown before monsoon onset.", "Apply Pseudomonas fluorescens (50 g in 500 ml water) into the palm crown once a month."], "chemical_remedies": [{"active_ingredient": "Bordeaux Paste (1%) or Copper Oxychloride 50% WP", "dosage": "10 g per liter water", "application": "Clean all rotted tissues from the crown; apply thick paste to the exposed bud tissue."}, {"active_ingredient": "Potassium Phosphonate (Akomin / Phyto-Fos)", "dosage": "3.0 ml / liter water (or trunk injection 10 ml/palm)", "application": "Systemic systemic protection inducing host plant systemic resistance."}], "preventative_measures": ["Prophylactic crown cleaning and placement of 2 perforated Mancozeb sachet packets (5 g each) in leaf axils before Southwest monsoon.", "Ensure good plantation drainage to prevent waterlogging around palm roots."]}, {"id": "coconut_rhinoceros_beetle", "crop": "coconut", "name": "Rhinoceros Beetle (Kombu Chelli)", "pathogen_type": "Insect Pest", "pathogen_name": "Oryctes rhinoceros", "symptoms": "Adult beetle bores into unopened central spindle leaves, resulting in geometric V-shaped or fan-shaped scissor-cut notches on expanded fronds. Chewed fiber mass pushed out of crown bore holes.", "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 35.0, "min_humidity": 70.0, "cloudy_rain": false}, "biological_cures": ["Release Oryctes baculovirus infected beetles @ 10-15 beetles/hectare for biological pathogen transmission.", "Treat farmyard manure pits with Metarhizium anisopliae (green muscardine fungus) @ 50 g/m³ manure.", "Install Rhinolure pheromone traps @ 2 traps per acre."], "chemical_remedies": [{"active_ingredient": "Chlorantraniliprole 0.4% G or Naphthalene Balls", "dosage": "Apply 3-4 naphthalene balls (approx 10.5 g) mixed with equal volume sand in topmost 3 leaf axils.", "application": "Acts as powerful repellent preventing adult beetles from boring into bud tissues."}], "preventative_measures": ["Clean palm crowns twice a year; extract beetles from crown holes using an iron hook.", "Avoid keeping open rotting compost or manure heaps near the coconut plantation without bio-treatment."]}, {"id": "coffee_leaf_rust", "crop": "coffee", "name": "Coffee Leaf Rust (Roya / Gerua)", "pathogen_type": "Fungal", "pathogen_name": "Hemileia vastatrix", "symptoms": "Yellow-orange powdery circular spots on the lower leaf surface, releasing powdery urediniospores. Corresponding upper leaf surface shows pale yellow chlorotic spots. Premature leaf defoliation leads to dieback of bearing wood.", "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 28.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Foliar spray of Lecanicillium lecanii (hyper-parasite of rust fungi) @ 5 g/L during monsoon.", "Bio-spray with Bacillus subtilis (2.5 g/L) before monsoon showers."], "chemical_remedies": [{"active_ingredient": "Bordeaux Mixture 0.5%", "dosage": "5 kg Copper Sulphate + 5 kg Lime in 1000 L water/ha", "application": "Mandatory pre-monsoon spray (May-June) followed by post-monsoon spray (September-October)."}, {"active_ingredient": "Hexaconazole 5% EC (Contaf)", "dosage": "2.0 ml / liter water", "application": "Curative systemic spray for severe post-monsoon rust breakout."}, {"active_ingredient": "Pyraclostrobin 20% WG", "dosage": "1.0 g / liter water", "application": "High-efficiency strobilurin fungicide preventing spore germination."}], "preventative_measures": ["Maintain optimal shade canopy (40-50% filtered sunlight) by two-tier shade tree lopping (Dhadhap / Silver Oak).", "Grow rust-resistant Arabica selections (e.g. S.795, Chandragiri, Selection 9, SLN 5B)."]}, {"id": "coffee_berry_borer", "crop": "coffee", "name": "Coffee Berry Borer (CBB)", "pathogen_type": "Insect Pest", "pathogen_name": "Hypothenemus hampei", "symptoms": "Tiny pinholes (approx 1 mm) bored into the navel/apical disc of developing green and ripe coffee berries. Female beetles bore tunnels inside the coffee seed, causing bean powdering and berry drop.", "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 30.0, "min_humidity": 75.0, "cloudy_rain": false}, "biological_cures": ["Foliar spray of white muscardine fungus Beauveria bassiana @ 5 g/L during berry development.", "Install Brocap / ethanol-methanol (1:1) attractant traps @ 20 traps/acre."], "chemical_remedies": [{"active_ingredient": "Cyantraniliprole 10.26% OD", "dosage": "1.2 ml / liter water", "application": "Spray berries thoroughly when beetle flight activity peaks."}], "preventative_measures": ["Maintain clean harvest (gleaning): pick every dropped berry from the plantation floor ('strip picking').", "Boil or destroy infested gleanings to eradicate overwintering beetle brood reservoirs."]}, {"id": "garlic_purple_blotch", "crop": "garlic", "name": "Purple Blotch of Garlic (Baingani Dhabba)", "pathogen_type": "Fungal", "pathogen_name": "Alternaria porri", "symptoms": "Small sunken water-soaked lesions that rapidly turn purple to purplish-brown with yellow borders on flat leaves and seed scapes. Lesions coalesce causing leaf tips to wither, snap, and dry up.", "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 30.0, "min_humidity": 80.0, "cloudy_rain": true}, "biological_cures": ["Seed bulb clove dip in Trichoderma viride suspension @ 10 g/L for 30 minutes.", "Foliar spray of Pseudomonas fluorescens (2 g/L) + 5% NSKE at 30 and 45 days after planting."], "chemical_remedies": [{"active_ingredient": "Difenoconazole 25% EC (Score)", "dosage": "1.0 ml / liter water (200 ml in 200 L water/acre)", "application": "Spray at first appearance of purple flecks; repeat after 12 days."}, {"active_ingredient": "Mancozeb 75% WP + sticker (Triton / Sandovit)", "dosage": "2.5 g / liter water + 0.5 ml sticker/L", "application": "Crucial to mix agricultural sticker because waxy garlic leaves shed plain spray droplets."}, {"active_ingredient": "Tebuconazole 50% + Trifloxystrobin 25% WG (Nativo)", "dosage": "0.7 g / liter water", "application": "Superior systemic curative control halting lesion expansion."}], "preventative_measures": ["Ensure proper raised-bed planting with furrow drainage; avoid standing irrigation water.", "Space cloves 15 x 10 cm to permit rapid canopy drying between irrigations."]}, {"id": "garlic_thrips", "crop": "garlic", "name": "Garlic Thrips (Joon / Churda Murda)", "pathogen_type": "Insect Pest", "pathogen_name": "Thrips tabaci", "symptoms": "Minute yellowish-brown nymphs rasp leaf epidermal tissue, sucking cellular sap. Leaves display silvery-white speckles, patches, and crinkled curled leaf tips that dry up from top to bottom.", "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 34.0, "min_humidity": 50.0, "cloudy_rain": false}, "biological_cures": ["Install blue sticky traps @ 20-25 traps/acre (thrips are intensely attracted to blue).", "Foliar spray of Lecanicillium lecanii @ 5 g/L during evening hours.", "Spray 10,000 ppm Neem Oil @ 2.5 ml/L mixed with soap nut solution."], "chemical_remedies": [{"active_ingredient": "Fipronil 5% SC (Regent)", "dosage": "2.0 ml / liter water", "application": "Translaminar and contact insecticide targeting thrips tucked inside leaf sheaths."}, {"active_ingredient": "Spinetoram 11.7% SC (Delegate)", "dosage": "0.9 ml / liter water", "application": "Highly effective new-generation spinosyn insecticide with rapid knockdown."}], "preventative_measures": ["Use sprinkler or micro-jet irrigation; overhead water droplets knock thrips off the plants.", "Destroy alternative weed hosts like parthenium and wild grasses surrounding field borders."]}, {"id": "grapes_downy_mildew", "crop": "grapes", "name": "Downy Mildew of Grapes (Kewda Rog)", "pathogen_type": "Fungal", "pathogen_name": "Plasmopara viticola", "symptoms": "Translucent yellowish 'oil spots' on upper leaf surface, with dense white cottony down of sporangiophores on the lower leaf surface. Berries turn dull greyish-brown, shrivel, and dry into 'leather berries'.", "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 28.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Foliar spray of Trichoderma harzianum or Bacillus subtilis @ 3 g/L.", "Prophylactic foliar spray of seaweed extract and fermented whey to thicken cuticle."], "chemical_remedies": [{"active_ingredient": "Dimethomorph 50% WP (Acrobat)", "dosage": "1.0 g / liter water (200 g in 200 L water/acre)", "application": "Target canopy immediately during rainy cloudy spells; powerful antisporulant."}, {"active_ingredient": "Famoxadone 16.6% + Cymoxanil 22.1% SC (Equation Pro)", "dosage": "1.0 ml / liter water", "application": "Kick-back curative action curing sub-cuticular mycelium within 48 hours of infection."}, {"active_ingredient": "Mandipropamid 23.4% SC (Revus)", "dosage": "0.8 ml / liter water", "application": "Binds tightly to epicuticular wax layer providing waterproof protection."}], "preventative_measures": ["Canopy management: prompt shoot thinning, leaf removal around fruit zones, and shoot positioning on trellises.", "Apply prophylactic 1% Bordeaux mixture post-pruning before bud break."]}, {"id": "grapes_powdery_mildew", "crop": "grapes", "name": "Powdery Mildew of Grapes (Bhoori Rog)", "pathogen_type": "Fungal", "pathogen_name": "Uncinula necator (Erysiphe necator)", "symptoms": "Powdery grey-white patches on both leaf surfaces, green shoots, and young berries. Infected young berries become hardened, fail to expand, and crack open exposing inner seeds, inviting secondary rots.", "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 32.0, "min_humidity": 70.0, "cloudy_rain": false}, "biological_cures": ["Foliar spray of Ampelomyces quisqualis (hyperparasite) @ 5 g/L.", "Potassium silicate (2.5 g/L) foliar spray to strengthen berry epidermal thickness."], "chemical_remedies": [{"active_ingredient": "Penconazole 10% EC (Topas)", "dosage": "0.5 ml / liter water", "application": "Highly effective systemic triazole curative spray."}, {"active_ingredient": "Azoxystrobin 11% + Tebuconazole 18.3% SC (Custodia)", "dosage": "1.5 ml / liter water", "application": "Dual active ingredient formulation eliminating powdery mildew and anthracnose simultaneously."}, {"active_ingredient": "Wettable Sulfur 80% WDG", "dosage": "2.0 g / liter water", "application": "Preventative multi-site contact action; avoid spraying if temperature exceeds 35°C."}], "preventative_measures": ["Maintain open canopy on Y-trellis or Bower system to ensure maximum light interception.", "Begin sulfur sprays right from 3-5 leaf stage up to berry softening."]}, {"id": "jowar_grain_mold", "crop": "jowar", "name": "Grain Mold of Sorghum (Dana Faphund)", "pathogen_type": "Fungal", "pathogen_name": "Curvularia lunata / Fusarium thapsinum", "symptoms": "Pink, grey, or black fluffy fungal colonization on maturing sorghum grains during wet, humid weather at flowering or physiological maturity. Seeds become chalky, discolored, lose viability, and carry mycotoxins.", "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 32.0, "min_humidity": 80.0, "cloudy_rain": true}, "biological_cures": ["Bio-seed priming with Trichoderma harzianum @ 10 g/kg seed.", "Spray Pseudomonas fluorescens (2 g/L) at 50% flowering stage."], "chemical_remedies": [{"active_ingredient": "Propiconazole 25% EC (Tilt)", "dosage": "1.0 ml / liter water (200 ml/acre)", "application": "First prophylactic spray at flowering; second spray 10 days later if rainfall continues."}, {"active_ingredient": "Mancozeb 75% WP", "dosage": "2.5 g / liter water", "application": "Contact protective cover preventing fungal conidial spore penetration."}], "preventative_measures": ["Adjust sowing time so that flowering and grain-filling do not coincide with heavy monsoon rains.", "Grow grain-mold tolerant Sorghum hybrids (e.g. CSH 16, CSH 25, CSV 20)."]}, {"id": "jowar_shoot_fly", "crop": "jowar", "name": "Sorghum Shoot Fly (Tana Makkhi)", "pathogen_type": "Insect Pest", "pathogen_name": "Atherigona soccata", "symptoms": "Maggot cuts the growing tip of 1-4 week old seedlings. Central leaf whorl withers, dries up, and creates a foul-smelling 'dead heart' that easily pulls out. Plant produces excessive sterile tillers.", "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 35.0, "min_humidity": 60.0, "cloudy_rain": false}, "biological_cures": ["Install fishmeal attractant bait traps @ 10-12 traps/acre to trap adult shoot flies.", "Seed treatment with Trichoderma viride + neem oil cake in furrow."], "chemical_remedies": [{"active_ingredient": "Thiamethoxam 30% FS", "dosage": "10 ml / kg seed", "application": "Seed treatment prior to sowing gives full seedling immunity against shoot fly for 30 days."}, {"active_ingredient": "Cypermethrin 10% EC", "dosage": "1.5 ml / liter water", "application": "Spray seedlings at 7 and 14 days after emergence if untreated seed was sown."}], "preventative_measures": ["Complete sowing within 10-15 days of monsoon onset; late-sown crops face severe shoot fly devastations.", "Increase seed rate by 20% and rogue out dead-heart seedlings during thinning at 2 weeks."]}, {"id": "jute_stem_rot", "crop": "jute", "name": "Stem Rot of Jute (Kand Galan)", "pathogen_type": "Fungal", "pathogen_name": "Macrophomina phaseolina", "symptoms": "Depressed, brown-to-black necrotic lesions at leaf petiole nodes on the stem. Lesions expand rapidly, girdling the stem and turning the bark shredded and black. Fiber bundles decay and snap in wind.", "weather_risk_triggers": {"min_temp": 28.0, "max_temp": 36.0, "min_humidity": 80.0, "cloudy_rain": true}, "biological_cures": ["Seed treatment with Trichoderma viride @ 10 g/kg seed.", "Soil application of Trichoderma enriched neem cake (100 kg/acre) during land prep."], "chemical_remedies": [{"active_ingredient": "Carbendazim 50% WP (Bavistin)", "dosage": "1.5 g / liter water", "application": "Spray foliage and stems at 45 and 60 days after sowing."}, {"active_ingredient": "Copper Oxychloride 50% WP", "dosage": "3.0 g / liter water", "application": "Protective contact bactericidal-fungicidal drench."}], "preventative_measures": ["Apply agricultural lime @ 1-2 tonnes/ha in acidic soils to raise pH above 6.5.", "Ensure balanced potash (MOP) fertilization to strengthen bast fiber cell wall resistance."]}, {"id": "rajma_anthracnose", "crop": "kidneybeans", "name": "Anthracnose of Kidneybeans (Kala Dhabba)", "pathogen_type": "Fungal", "pathogen_name": "Colletotrichum lindemuthianum", "symptoms": "Dark brick-red to purplish-brown sunken lesions along leaf veins on undersides. Pods develop circular sunken brown spots with raised reddish-brown margins and pink spore slime in moist weather.", "weather_risk_triggers": {"min_temp": 18.0, "max_temp": 26.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Seed treatment with Trichoderma harzianum @ 10 g/kg seed.", "Foliar spray of Pseudomonas fluorescens (2 g/L) at vegetative and early flowering."], "chemical_remedies": [{"active_ingredient": "Carbendazim 12% + Mancozeb 63% WP (SAAF)", "dosage": "2.0 g / liter water (400 g in 200 L water/acre)", "application": "Spray at first sign of vein lesions; repeat after 10 days."}, {"active_ingredient": "Pyraclostrobin 20% WG", "dosage": "1.0 g / liter water", "application": "Systemic strobilurin preventing pod lesion colonization."}], "preventative_measures": ["Use disease-free certified seeds produced in dry semi-arid regions.", "Avoid working in or harvesting rajma fields when leaves are wet to prevent spreading conidia."]}, {"id": "rajma_rust", "crop": "kidneybeans", "name": "Common Bean Rust of Rajma (Gerua Rog)", "pathogen_type": "Fungal", "pathogen_name": "Uromyces appendiculatus", "symptoms": "Small circular reddish-brown powdery pustules on both upper and lower leaf surfaces, surrounded by chlorotic yellow halos. Severe infection causes early yellowing, foliage scorch, and defoliation.", "weather_risk_triggers": {"min_temp": 18.0, "max_temp": 25.0, "min_humidity": 80.0, "cloudy_rain": true}, "biological_cures": ["Bio-seed priming with Trichoderma viride @ 8 g/kg seed.", "Spray diluted fermented sour buttermilk (50 ml/L) on foliage."], "chemical_remedies": [{"active_ingredient": "Propiconazole 25% EC (Tilt)", "dosage": "1.0 ml / liter water", "application": "Systemic triazole halting rust pustule eruption."}, {"active_ingredient": "Wettable Sulfur 80% WP", "dosage": "2.5 g / liter water", "application": "Multi-site contact preventative fungicide."}], "preventative_measures": ["Grow rust-tolerant rajma cultivars recommended for northern hills/plains (e.g. Shalimar Rajmash-1, HUR 15).", "Burn or deeply bury post-harvest bean residues."]}, {"id": "lentil_wilt", "crop": "lentil", "name": "Fusarium Wilt of Lentil (Masoor Ukhta)", "pathogen_type": "Fungal", "pathogen_name": "Fusarium oxysporum f. sp. lentis", "symptoms": "Leaves turn dull yellow and curl upward starting from bottom leaflets, followed by wilting, drooping, and sudden drying of whole plants in patches. Dark brown vascular streaking inside taproot.", "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 28.0, "min_humidity": 65.0, "cloudy_rain": false}, "biological_cures": ["Seed treatment with Trichoderma viride @ 10 g/kg seed before sowing.", "Soil enrichment with Trichoderma harzianum (2 kg/acre mixed with 100 kg vermicompost)."], "chemical_remedies": [{"active_ingredient": "Carboxin 37.5% + Thiram 37.5% DS", "dosage": "2.5 g / kg seed", "application": "Mandatory seed dress prior to sowing."}, {"active_ingredient": "Carbendazim 50% WP (Bavistin)", "dosage": "2.0 g / kg seed (or drench @ 1.5 g/L)", "application": "Protects juvenile roots against soil fungal invasion."}], "preventative_measures": ["Plant wilt-resistant ICAR varieties (e.g. DPL 62, Pant L-4, Pant L-8, KLS 218).", "Avoid planting in fields with known high wilt history without at least 3-year pulse rotation."]}, {"id": "lentil_rust", "crop": "lentil", "name": "Lentil Rust (Masoor Gerua)", "pathogen_type": "Fungal", "pathogen_name": "Uromyces viciae-fabae", "symptoms": "Yellowish-brown aecial pustules followed by dark brown to black telial pustules on leaves, petioles, and stems. Severely infected leaves curl, dry up, and plants present a scorched brown appearance.", "weather_risk_triggers": {"min_temp": 16.0, "max_temp": 24.0, "min_humidity": 80.0, "cloudy_rain": true}, "biological_cures": ["Foliar spray of neem seed extract (NSKE 5%) at pre-flowering.", "Bio-spray with Trichoderma viride @ 5 g/L."], "chemical_remedies": [{"active_ingredient": "Hexaconazole 5% EC (Contaf)", "dosage": "1.5 ml / liter water (300 ml/acre)", "application": "Spray immediately upon first observation of orange-brown rust pustules."}, {"active_ingredient": "Mancozeb 75% WP", "dosage": "2.0 g / liter water", "application": "Protective contact fungicide applied before anticipated rain spells."}], "preventative_measures": ["Sow lentil early (late October to first week of November) to mature before February rust onset.", "Use rust-tolerant varieties like Pant L-639, DPL 15, or Narendra Masoor 1."]}, {"id": "mango_powdery_mildew", "crop": "mango", "name": "Powdery Mildew of Mango (Bhoori Rog / Chhachhia)", "pathogen_type": "Fungal", "pathogen_name": "Oidium mangiferae", "symptoms": "White talcum-powder-like coating over panicles, blossom clusters, tender fruitlets, and young leaves. Infected blossoms drop off completely, leading to massive floral blast and zero fruit set.", "weather_risk_triggers": {"min_temp": 18.0, "max_temp": 28.0, "min_humidity": 70.0, "cloudy_rain": false}, "biological_cures": ["Foliar spray of Ampelomyces quisqualis @ 5 g/L on floral panicles.", "Foliar spray of Potassium Bicarbonate (4 g/L) + Neem Oil (2 ml/L) at bud swell."], "chemical_remedies": [{"active_ingredient": "Hexaconazole 5% SC or Difenoconazole 25% EC", "dosage": "1.0 ml / liter water", "application": "First spray at panicle emergence (before flowers open); second spray after fruit set."}, {"active_ingredient": "Wettable Sulfur 80% WP", "dosage": "2.5 g / liter water", "application": "Standard pre-bloom protective spray."}, {"active_ingredient": "Tebuconazole 50% + Trifloxystrobin 25% WG (Nativo)", "dosage": "0.6 g / liter water", "application": "Dual-action systemic control of powdery mildew and anthracnose."}], "preventative_measures": ["Prune inner criss-cross branches after harvest to allow direct sunlight penetration throughout the canopy.", "Avoid excessive winter irrigations that stimulate untimely vegetative flushes instead of flowering."]}, {"id": "mango_anthracnose", "crop": "mango", "name": "Anthracnose of Mango (Shyama Rog)", "pathogen_type": "Fungal", "pathogen_name": "Colletotrichum gloeosporioides", "symptoms": "Dark brown to black circular spots and tear-drop stains on leaves and panicles. On ripe fruits, black sunken rotten spots appear that rapidly expand, exuding pink spore masses.", "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 32.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Post-harvest hot water treatment of fruits at 52°C for 5 minutes.", "Bio-spray with Pseudomonas fluorescens (2 g/L) on developing fruits."], "chemical_remedies": [{"active_ingredient": "Copper Oxychloride 50% WP (Blitox)", "dosage": "3.0 g / liter water", "application": "Post-pruning protective wash and pre-monsoon canopy cover."}, {"active_ingredient": "Azoxystrobin 23% SC", "dosage": "1.0 ml / liter water", "application": "Systemic fruit surface protector applied 3 weeks before harvest."}], "preventative_measures": ["Prune dead twigs showing 'dieback' 10 cm below infected zone; paint cut ends with Bordeaux paste.", "Harvest mangoes with 1 cm stalk intact to prevent sap burn which provides entry wounds for fungi."]}, {"id": "mango_hopper", "crop": "mango", "name": "Mango Hopper (Fudka / Chepa)", "pathogen_type": "Insect Pest", "pathogen_name": "Amritodus atkinsoni / Idioscopus clypealis", "symptoms": "Wedge-shaped nymphs and adults suck sap from tender floral panicles and young leaves. Panicles dry up into brown twigs. Hoppers excrete honeydew, causing black sooty mold (Capnodium) to cover entire tree.", "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 32.0, "min_humidity": 65.0, "cloudy_rain": false}, "biological_cures": ["Spray entomopathogenic fungus Metarhizium anisopliae or Beauveria bassiana @ 5 g/L.", "Spray 10,000 ppm Neem Oil @ 2.5 ml/L at early panicle emergence."], "chemical_remedies": [{"active_ingredient": "Imidacloprid 17.8% SL (Confidor)", "dosage": "0.4 ml / liter water", "application": "Spray when hopper nymphs emerge at floral bud burst; avoid spraying during full bee pollination."}, {"active_ingredient": "Thiamethoxam 25% WG", "dosage": "0.3 g / liter water", "application": "Fast systemic translocation protecting panicle branches."}], "preventative_measures": ["Keep orchard ventilated by annual canopy thinning; avoid excessively dense tree canopies.", "Do not spray systemic insecticides during peak honeybee foraging hours (8 AM - 12 PM)."]}, {"id": "mothbeans_bacterial_blight", "crop": "mothbeans", "name": "Bacterial Leaf Blight of Mothbean", "pathogen_type": "Bacterial", "pathogen_name": "Xanthomonas axonopodis pv. phaseoli", "symptoms": "Small, water-soaked brown angular spots with translucent yellow halos on leaf blades. Stems and pods show elongated greasy brown streaks that crack under dry winds.", "weather_risk_triggers": {"min_temp": 26.0, "max_temp": 34.0, "min_humidity": 80.0, "cloudy_rain": true}, "biological_cures": ["Seed soaking in 2% cow urine + Trichoderma viride (10 g/kg) for 30 minutes.", "Foliar spray of fresh cow dung supernatant (10% w/v) + 2 g/L wood ash."], "chemical_remedies": [{"active_ingredient": "Streptocycline (Streptomycin 90% + Tetracycline 10%)", "dosage": "6 g per 60 liters water (combined with Copper Oxychloride 50% WP @ 2.5 g/L)", "application": "Foliar spray at 30 and 45 days after sowing upon seeing water-soaked spots."}], "preventative_measures": ["Use certified seed free from bacterial infection; mothbean is highly susceptible in humid micro-climates.", "Grow blight-tolerant varieties like RMO 40, RMO 225, or RMO 435."]}, {"id": "mothbeans_yellow_mosaic", "crop": "mothbeans", "name": "Yellow Mosaic of Mothbean", "pathogen_type": "Viral", "pathogen_name": "Mungbean Yellow Mosaic Virus (Vector: Bemisia tabaci)", "symptoms": "Scattered yellow specks expanding into complete bright golden-yellow mosaic pattern across leaflets. Plants become stunted with negligible pod formation.", "weather_risk_triggers": {"min_temp": 26.0, "max_temp": 36.0, "min_humidity": 55.0, "cloudy_rain": false}, "biological_cures": ["Install yellow sticky traps @ 15 traps/acre.", "Foliar spray of 5% Neem Seed Kernel Extract (NSKE) at 15 DAS."], "chemical_remedies": [{"active_ingredient": "Thiamethoxam 25% WG", "dosage": "0.3 g / liter water", "application": "Target whitefly vector immediately upon noticing first yellow flecks."}], "preventative_measures": ["Mandatory seed dress with Imidacloprid 600 FS (5 ml/kg seed) before sowing.", "Rogue out and bury virus-infected plants within the first 3 weeks."]}, {"id": "mungbean_yellow_mosaic", "crop": "mungbean", "name": "Mungbean Yellow Mosaic Disease (MYMD - Peela Rog)", "pathogen_type": "Viral", "pathogen_name": "Mungbean Yellow Mosaic Virus (Vector: Whitefly)", "symptoms": "Bright yellow patches along leaf veins, coalescing until entire leaf turns golden yellow. Infected plants produce small upright pods containing few, shriveled, discolored seeds.", "weather_risk_triggers": {"min_temp": 27.0, "max_temp": 36.0, "min_humidity": 60.0, "cloudy_rain": false}, "biological_cures": ["Install yellow sticky traps @ 20 traps/acre.", "Spray Neem oil (3 ml/L) or 5% NSKE at 15 and 30 days after sowing.", "Foliar spray of Lecanicillium lecanii @ 5 g/L to control whiteflies."], "chemical_remedies": [{"active_ingredient": "Thiamethoxam 25% WG (Actara)", "dosage": "0.35 g / liter water (50 g in 150 L water/acre)", "application": "Spray early morning targeting leaf undersides."}, {"active_ingredient": "Spiromesifen 22.9% SC (Oberon)", "dosage": "1.0 ml / liter water", "application": "Lipid synthesis inhibitor targeting whitefly eggs and nymphs."}], "preventative_measures": ["Grow MYMV-resistant cultivars (e.g. SML 668, IPM 02-3, Pusa Vishal, Samrat, MH 421).", "Seed treatment with Imidacloprid 17.8% SL (5 ml/kg seed)."]}, {"id": "mungbean_cercospora", "crop": "mungbean", "name": "Cercospora Leaf Spot of Moong (Tikka)", "pathogen_type": "Fungal", "pathogen_name": "Cercospora canescens", "symptoms": "Circular to irregular spots with greyish-white necrotic center and dark purplish-red margins. Dead center tissue often falls out giving a shot-hole appearance; leaves drop prematurely.", "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 32.0, "min_humidity": 80.0, "cloudy_rain": true}, "biological_cures": ["Bio-seed priming with Trichoderma viride @ 10 g/kg seed.", "Foliar spray of Pseudomonas fluorescens (2 g/L) at vegetative stage."], "chemical_remedies": [{"active_ingredient": "Carbendazim 12% + Mancozeb 63% WP (SAAF)", "dosage": "2.0 g / liter water", "application": "Foliar spray at first appearance of spots; repeat after 10-12 days."}, {"active_ingredient": "Tebuconazole 25.9% EC", "dosage": "1.0 ml / liter water", "application": "Systemic triazole stopping fungal lesion expansion."}], "preventative_measures": ["Maintain optimal row spacing (30 x 10 cm) to avoid leaf dampness.", "Destroy crop residues post-harvest through deep plowing."]}, {"id": "muskmelon_downy_mildew", "crop": "muskmelon", "name": "Downy Mildew of Muskmelon (Kharbooja Kewda)", "pathogen_type": "Fungal", "pathogen_name": "Pseudoperonospora cubensis", "symptoms": "Angular, vein-delimited bright yellow spots on upper leaf surface, with purplish-grey velvety fungal down on undersides in moist mornings. Foliage rapidly scorches and dies as if scorched by fire.", "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 28.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Foliar spray of Trichoderma harzianum @ 3 g/L + seaweed extract.", "Foliar spray of Potassium Phosphite (3 ml/L) to stimulate vine phytoalexins."], "chemical_remedies": [{"active_ingredient": "Cymoxanil 8% + Mancozeb 64% WP (Curzate)", "dosage": "2.0 g / liter water (400 g in 200 L water/acre)", "application": "Spray immediately upon seeing angular yellow lesions; penetrant and contact action."}, {"active_ingredient": "Dimethomorph 50% WP (Acrobat)", "dosage": "1.0 g / liter water", "application": "Potent antisporulant preventing secondary epidemic spread."}, {"active_ingredient": "Ametoctradin 27% + Dimethomorph 20.27% SC (Zampro)", "dosage": "1.0 ml / liter water", "application": "State-of-the-art oomycete fungicide for complete vine rescue."}], "preventative_measures": ["Grow melons on raised beds with drip irrigation; avoid overhead sprinkler or furrow flooding.", "Destroy diseased vine residues after harvest."]}, {"id": "muskmelon_fruit_fly", "crop": "muskmelon", "name": "Melon Fruit Fly (Phal Makkhi)", "pathogen_type": "Insect Pest", "pathogen_name": "Bactrocera cucurbitae", "symptoms": "Female flies puncture young fruits with ovipositors causing amber gummy resin drops. Maggots hatch inside, feeding on pulp and introducing bacterial soft rot; fruits rot and drop prematurely.", "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 35.0, "min_humidity": 60.0, "cloudy_rain": false}, "biological_cures": ["Install Cue-lure pheromone traps @ 10-12 traps/acre.", "Bait spray: Jaggery (50 g) + Malathion (10 ml) in 10 L water, sprayed in coarse droplets on border foliage."], "chemical_remedies": [{"active_ingredient": "Spinosad 45% SC", "dosage": "0.3 ml / liter water", "application": "Safe, naturally derived bio-insecticide for fruiting stage."}], "preventative_measures": ["Collect and deeply bury (at least 60 cm) all fallen and infested fruits.", "Cover developing melons with paper bags or dry straw in small-scale plantings."]}, {"id": "orange_citrus_canker", "crop": "orange", "name": "Citrus Canker of Orange (Khajua Rog)", "pathogen_type": "Bacterial", "pathogen_name": "Xanthomonas axonopodis pv. citri", "symptoms": "Raised, rough, corky brownish lesions on leaves, twigs, and fruit rinds, surrounded by an oily translucent yellow halo. Crater-like center on fruits causes aesthetic degradation and market rejections.", "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 32.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Spray neem cake extract (5%) + copper solution.", "Foliar spray of Bacillus subtilis (3 g/L) to competitively exclude bacteria."], "chemical_remedies": [{"active_ingredient": "Streptocycline + Copper Oxychloride 50% WP", "dosage": "1 g Streptocycline + 25 g COC in 10 liters water", "application": "First spray at spring flush; second after fruit set; third during monsoon flush."}, {"active_ingredient": "Copper Hydroxide 53.8% DF (Kocide)", "dosage": "2.0 g / liter water", "application": "Superior fine-particle copper barrier against bacterial stomatal entry."}], "preventative_measures": ["Prune infected twigs before monsoon; paint cuts with Bordeaux paste.", "Control citrus leaf miner (Phyllocnistis citrella) whose serpentine feeding mines create direct bacterial infection entry points."]}, {"id": "orange_gummosis", "crop": "orange", "name": "Phytophthora Gummosis / Foot Rot of Citrus", "pathogen_type": "Fungal", "pathogen_name": "Phytophthora nicotianae / citrophthora", "symptoms": "Bark at the base of the trunk near the bud union cracks, turns dark, and exudes copious golden-brown sticky gum. Bark dries, cracks, and sloughs off, completely girdling the tree trunk.", "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 30.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Apply Trichoderma harzianum enriched compost around the root zone (5 kg/tree).", "Paste Trichoderma culture paste over scraped trunk lesions."], "chemical_remedies": [{"active_ingredient": "Bordeaux Paste (2%)", "dosage": "2 kg Copper Sulphate + 2 kg Lime + 20 L water", "application": "Scrape dead bark with curved knife; paint thick paste onto exposed wood up to 50 cm."}, {"active_ingredient": "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)", "dosage": "2.5 g / liter water (soil drench 5-10 L/tree)", "application": "Drench basin soil around tree trunk to kill Phytophthora zoospores."}, {"active_ingredient": "Potassium Phosphonate (Akomin / Phyto-Fos)", "dosage": "3.0 ml / liter water (foliar spray or trunk injection)", "application": "Systemic upward and downward translocation."}], "preventative_measures": ["Bud trees high (at least 30 cm above ground level) on resistant rootstocks like Rough Lemon or Rangpur Lime.", "Use ring-and-basin irrigation; ensure irrigation water never directly touches the tree trunk."]}, {"id": "papaya_ringspot", "crop": "papaya", "name": "Papaya Ring Spot Virus (PRSV - Chhalla Rog)", "pathogen_type": "Viral", "pathogen_name": "Papaya Ringspot Virus (Vector: Aphids)", "symptoms": "Severe yellow-green mosaic and chlorosis on leaves with extreme shoe-stringing (narrowing) of leaf blades. Oily dark green water-soaked concentric rings and streaks on stems, petioles, and green fruits.", "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 32.0, "min_humidity": 65.0, "cloudy_rain": false}, "biological_cures": ["Plant 2-3 border rows of tall non-host barrier crops (corn, sorghum, or sesbania) around papaya.", "Install yellow sticky traps @ 20 traps/acre.", "Spray mineral oil or 10,000 ppm Neem Oil @ 2.5 ml/L to inhibit stylet transmission by aphids."], "chemical_remedies": [{"active_ingredient": "Thiamethoxam 25% WG", "dosage": "0.3 g / liter water", "application": "Target aphid vectors on barrier crops and young papaya trees."}, {"active_ingredient": "Dimethoate 30% EC (Rogor)", "dosage": "1.5 ml / liter water", "application": "Systemic vector control."}], "preventative_measures": ["Rogue out and destroy infected trees immediately upon spotting ring spots; do not allow infected trees to remain as viral reservoirs.", "Grow papaya under 40-mesh insect-proof net for first 60 days after transplanting."]}, {"id": "papaya_foot_rot", "crop": "papaya", "name": "Foot Rot / Stem Rot of Papaya", "pathogen_type": "Fungal", "pathogen_name": "Pythium aphanidermatum", "symptoms": "Water-soaked patches at the collar region of the trunk at ground level. Tissues soften, rot, and turn spongy black with foul smell; leaves turn yellow and entire heavy fruiting tree topples over under light wind.", "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 32.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Soil drench with Trichoderma harzianum (10 g/L) at planting hole.", "Apply neem cake @ 1 kg/plant in planting basin."], "chemical_remedies": [{"active_ingredient": "Copper Oxychloride 50% WP (Blitox)", "dosage": "3.0 g / liter water", "application": "Drench soil basin around tree trunk thoroughly (2-3 L per plant)."}, {"active_ingredient": "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)", "dosage": "2.0 g / liter water", "application": "Curative drench upon first sign of water-soaking on lower trunk."}], "preventative_measures": ["Always plant papaya on raised mounds or ridges (15-20 cm high) to prevent water stagnating at trunk base.", "Ensure excellent sub-surface field drainage during heavy monsoon rains."]}, {"id": "pigeonpea_smd", "crop": "pigeonpeas", "name": "Sterility Mosaic Disease of Arhar (SMD - Baanjh Rog)", "pathogen_type": "Viral", "pathogen_name": "Pigeonpea Sterility Mosaic Virus (Vector: Aceria cajani mite)", "symptoms": "Bushy, stunted vegetative growth with severe leaf size reduction and pale green mosaic mottling. Most diagnostic symptom is complete absence of flowering ('sterility') with zero pod formation.", "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 32.0, "min_humidity": 70.0, "cloudy_rain": false}, "biological_cures": ["Foliar spray of Wettable Sulfur @ 3 g/L to eliminate vector eriophyid mites.", "Spray neem oil (3 ml/L) at 20 and 35 days after sowing."], "chemical_remedies": [{"active_ingredient": "Fenazaquin 10% EC (Magister)", "dosage": "2.0 ml / liter water", "application": "Specialist acaricide eradicating eriophyid vector mites."}, {"active_ingredient": "Propargite 57% EC (Omite)", "dosage": "2.0 ml / liter water", "application": "Contact miticide controlling mite colonies on leaf undersides."}], "preventative_measures": ["Plant SMD-resistant ICAR cultivars (e.g. BDN 711, BSMR 736, BSMR 853, Asha / ICPL 87119).", "Rogue out and destroy infected bushy plants in the first 45 days before mites multiply."]}, {"id": "pigeonpea_fusarium_wilt", "crop": "pigeonpeas", "name": "Fusarium Wilt of Pigeonpea (Tur Ukhta)", "pathogen_type": "Fungal", "pathogen_name": "Fusarium udum", "symptoms": "Gradual wilting and yellowing of foliage starting on one branch or one side of the plant. A prominent dark brown or purple vertical band runs up the main stem from the collar region; vascular xylem exhibits deep black discoloration.", "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 32.0, "min_humidity": 65.0, "cloudy_rain": false}, "biological_cures": ["Seed treatment with Trichoderma viride @ 10 g/kg seed before sowing.", "Soil application of Trichoderma enriched FYM (5 kg Trichoderma in 200 kg FYM/acre)."], "chemical_remedies": [{"active_ingredient": "Carbendazim 50% WP (Bavistin)", "dosage": "2.0 g / kg seed", "application": "Seed dressing prior to sowing."}, {"active_ingredient": "Thiophanate Methyl 70% WP (Roko)", "dosage": "1.5 g / liter water", "application": "Spot drenching of soil around adjacent plants."}], "preventative_measures": ["Grow wilt-resistant varieties (e.g. Maruti / ICP 8863, Asha / ICPL 87119, WRG 65).", "Intercrop pigeonpea with sorghum or pearl millet (which exude antifungal root exudates suppressing F. udum)."]}, {"id": "pomegranate_bacterial_blight", "crop": "pomegranate", "name": "Bacterial Blight / Oily Spot (Telya Rog)", "pathogen_type": "Bacterial", "pathogen_name": "Xanthomonas axonopodis pv. punicae", "symptoms": "Dark brown to black angular water-soaked oily spots on leaves. On fruits, characteristic dark brown 'L' or 'Y' shaped cracking lesions with oily water-soaked borders. Fruits crack open and rot.", "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 35.0, "min_humidity": 80.0, "cloudy_rain": true}, "biological_cures": ["Foliar spray of Pseudomonas fluorescens (2 g/L) + Bacillus subtilis (2 g/L).", "Paste Bordeaux paste (10%) on stem wounds after pruning."], "chemical_remedies": [{"active_ingredient": "Streptocycline + Copper Oxychloride 50% WP", "dosage": "0.5 g Streptocycline + 2.5 g COC per liter water", "application": "Mandatory spray schedule at 10-day intervals during monsoon flush (Mrig bahar)."}, {"active_ingredient": "Bordeaux Mixture 1%", "dosage": "10 kg Copper Sulphate + 10 kg Lime in 1000 L water/ha", "application": "Defoliation and pre-monsoon sanitary canopy cover."}, {"active_ingredient": "Bronopol 99% (Bactronol)", "dosage": "0.5 g / liter water", "application": "Specialist bactericide halting active bacterial slime exudation."}], "preventative_measures": ["Prune out infected twigs 5 cm below lesion; dip pruning shears in 2% sodium hypochlorite between cuts.", "Take Hasta bahar (September-October flowering) instead of Mrig bahar in blight-endemic zones to avoid monsoon disease peaks."]}, {"id": "pomegranate_fruit_borer", "crop": "pomegranate", "name": "Pomegranate Butterfly / Fruit Borer (Suran)", "pathogen_type": "Insect Pest", "pathogen_name": "Deudorix (Virachola) isocrates", "symptoms": "Caterpillar bores a single entry hole into developing fruit, around which offensive-smelling dark excreta / frass pellets accumulate. Secondary fungal and bacterial rot causes fruit to turn black and drop.", "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 35.0, "min_humidity": 60.0, "cloudy_rain": false}, "biological_cures": ["Bagging developing fruits with butter paper or non-woven polypropylene bags @ 30-40 days after fruit set.", "Release egg parasitoid Trichogramma chilonis @ 1,00,000 / acre at flowering."], "chemical_remedies": [{"active_ingredient": "Chlorantraniliprole 18.5% SC (Coragen)", "dosage": "0.3 ml / liter water", "application": "Target eggs and newly hatched caterpillars before they bore into the rind."}, {"active_ingredient": "Spinosad 45% SC", "dosage": "0.4 ml / liter water", "application": "Bio-derived insecticide with excellent fruit safety."}], "preventative_measures": ["Collect and deeply bury all dropped or bored fruits to prevent caterpillar pupation.", "Clip calyx cup thorns during early fruit development."]}, {"id": "tea_blister_blight", "crop": "tea", "name": "Blister Blight of Tea (Chhala Rog)", "pathogen_type": "Fungal", "pathogen_name": "Exobasidium vexans", "symptoms": "Circular translucent pale yellow spots on tender young flush leaves (two leaves and a bud). Upper surface becomes depressed into a cup, while underside swells into a chalky-white blister shedding basidiospores.", "weather_risk_triggers": {"min_temp": 18.0, "max_temp": 25.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Foliar spray of Trichoderma harzianum or Pseudomonas fluorescens @ 3 g/L.", "Shade tree regulation to allow maximum diffused sunlight onto tea bushes."], "chemical_remedies": [{"active_ingredient": "Copper Oxychloride 50% WP + Hexaconazole 5% EC", "dosage": "210 g COC + 200 ml Hexaconazole in 200 L water/ha", "application": "Standard tea industry cocktail spray at 5-7 day intervals during monsoonal mist."}, {"active_ingredient": "Propiconazole 25% EC (Tilt)", "dosage": "1.0 ml / liter water", "application": "Systemic eradicant stopping blister maturation."}], "preventative_measures": ["Strict regular plucking: harvest tender flush on strict 7-day rounds before blisters mature and sporulate.", "Thin shade tree branches before monsoon to lower micro-climate humidity inside the tea canopy."]}, {"id": "tea_mosquito_bug", "crop": "tea", "name": "Tea Mosquito Bug", "pathogen_type": "Insect Pest", "pathogen_name": "Helopeltis theivora", "symptoms": "Adults and nymphs insert piercing stylets into succulent tender buds and young leaves. Circular brownish-black water-soaked necrotic puncture spots appear. Leaves curl, dry up, and young shoots die back.", "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 30.0, "min_humidity": 80.0, "cloudy_rain": false}, "biological_cures": ["Foliar spray of Beauveria bassiana @ 5 g/L during evening hours.", "Spray 5% Neem Seed Kernel Extract (NSKE) at early infestation notice."], "chemical_remedies": [{"active_ingredient": "Thiamethoxam 25% WG", "dosage": "0.25 g / liter water", "application": "Spray immediately after plucking round to respect mandatory tea pre-harvest intervals (PHI)."}, {"active_ingredient": "Clothianidin 50% WDG", "dosage": "0.15 g / liter water", "application": "Target bush frame and lower canopy where bugs shelter during midday."}], "preventative_measures": ["Remove weeds like Mikania micrantha which act as alternative breeding hosts around tea sections.", "Follow strict harvest intervals to avoid pesticide residues in manufactured made tea."]}, {"id": "turmeric_rhizome_rot", "crop": "turmeric", "name": "Rhizome Rot / Soft Rot of Turmeric (Haldi Ganth Galan)", "pathogen_type": "Fungal", "pathogen_name": "Pythium aphanidermatum / graminicola", "symptoms": "Collar region of the pseudo-stem becomes water-soaked, soft, and dark. Leaves turn yellow from margins inward and wilt. Rhizomes rot into a foul-smelling soft watery pulp leaving only the fibrous outer skin.", "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 32.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Rhizome seed treatment with Trichoderma harzianum @ 10 g/kg seed before planting.", "Soil application of Trichoderma enriched neem cake (200 kg/acre) at planting and earthing-up."], "chemical_remedies": [{"active_ingredient": "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)", "dosage": "2.5 g / liter water (soil drench 250 ml/plant)", "application": "Drench planting beds immediately upon seeing yellowing pseudo-stems."}, {"active_ingredient": "Copper Oxychloride 50% WP (Blitox)", "dosage": "3.0 g / liter water", "application": "Prophylactic soil bed drench at 45 and 90 days after planting."}], "preventative_measures": ["Select healthy, plump, rot-free mother rhizomes for planting.", "Plant on raised beds (120 cm wide, 30 cm high) with deep drainage furrows to prevent waterlogging."]}, {"id": "turmeric_leaf_spot", "crop": "turmeric", "name": "Leaf Spot of Turmeric (Patti Dhabba)", "pathogen_type": "Fungal", "pathogen_name": "Colletotrichum curcumae", "symptoms": "Elliptical to oblong brown spots with greyish-white center and yellowish-brown margin on upper leaf surfaces. Spots coalesce into large necrotic blighted areas, severely diminishing rhizome bulking.", "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 32.0, "min_humidity": 80.0, "cloudy_rain": true}, "biological_cures": ["Bio-seed rhizome dip in Pseudomonas fluorescens (10 g/L) for 30 minutes.", "Foliar spray of Trichoderma viride @ 5 g/L."], "chemical_remedies": [{"active_ingredient": "Carbendazim 12% + Mancozeb 63% WP (SAAF)", "dosage": "2.0 g / liter water (400 g in 200 L water/acre)", "application": "Spray foliage at 60 and 90 days after planting."}, {"active_ingredient": "Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top)", "dosage": "1.0 ml / liter water", "application": "Broad-spectrum systemic protection."}], "preventative_measures": ["Ensure balanced fertilization with adequate potash to improve leaf cuticle resistance.", "Burn infected leaves after harvest to destroy dormant fungal perithecia."]}, {"id": "watermelon_gummy_stem_blight", "crop": "watermelon", "name": "Gummy Stem Blight of Watermelon", "pathogen_type": "Fungal", "pathogen_name": "Stagonosporopsis cucurbitacearum (Didymella bryoniae)", "symptoms": "Circular to irregular water-soaked spots on leaves. Crown stems develop bleached, water-soaked lesions that crack and exude an amber to dark brown gummy sap, studded with tiny black pycnidia dots.", "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 30.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Seed treatment with Trichoderma viride @ 10 g/kg seed.", "Foliar spray of Bacillus subtilis (2.5 g/L) at runner initiation."], "chemical_remedies": [{"active_ingredient": "Fluopyram 17.7% + Tebuconazole 17.7% SC (Luna Experience)", "dosage": "1.0 ml / liter water (200 ml/acre)", "application": "Potent translaminar and systemic fungicide controlling both gummy stem blight and powdery mildew."}, {"active_ingredient": "Chlorothalonil 75% WP (Kavach)", "dosage": "2.0 g / liter water", "application": "Broad-spectrum contact protectant; spray thoroughly before anticipated rain."}], "preventative_measures": ["Practice 3-year crop rotation with non-cucurbit crops.", "Water strictly via drip irrigation; keep runner foliage and fruit crowns dry."]}, {"id": "watermelon_anthracnose", "crop": "watermelon", "name": "Anthracnose of Watermelon", "pathogen_type": "Fungal", "pathogen_name": "Colletotrichum orbiculare", "symptoms": "Circular black spots on leaves resembling grease spots that dry and shatter. Developing fruits develop circular sunken water-soaked pits with raised black margins, producing salmon-pink gelatinous spore masses in humid weather.", "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 30.0, "min_humidity": 85.0, "cloudy_rain": true}, "biological_cures": ["Seed soaking in Pseudomonas fluorescens (10 g/L) for 2 hours.", "Foliar spray of 5% Neem Seed Kernel Extract (NSKE) at early fruit set."], "chemical_remedies": [{"active_ingredient": "Carbendazim 12% + Mancozeb 63% WP (SAAF)", "dosage": "2.0 g / liter water", "application": "Spray foliage and developing fruits at 10-14 day intervals."}, {"active_ingredient": "Azoxystrobin 23% SC", "dosage": "1.0 ml / liter water", "application": "Preventative systemic coverage."}], "preventative_measures": ["Use certified anthracnose-free seed.", "Mulch beds with silver-black plastic mulch to prevent soil-splashing of fungal spores onto vines."]}, {"id": "watermelon_bud_necrosis", "crop": "watermelon", "name": "Watermelon Bud Necrosis Virus (WBNV - ToSpo Virus)", "pathogen_type": "Viral", "pathogen_name": "Watermelon Bud Necrosis Orthotospovirus (Vector: Thrips tabaci)", "symptoms": "Terminal growing buds turn necrotic, black, and die back. Internodes become severely shortened giving an erect, crowded 'bunchy' appearance. Leaves show chlorotic rings and mottling; fruits develop yellow necrotic rings.", "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 35.0, "min_humidity": 55.0, "cloudy_rain": false}, "biological_cures": ["Install blue sticky traps @ 20-25 traps/acre for thrips monitoring and mass-trapping.", "Foliar spray of Lecanicillium lecanii @ 5 g/L during evening hours.", "Spray 10,000 ppm Neem Oil @ 2.5 ml/L mixed with mild surfactant."], "chemical_remedies": [{"active_ingredient": "Fipronil 5% SC (Regent)", "dosage": "2.0 ml / liter water", "application": "Target vector thrips nymphs hiding in growing terminal buds."}, {"active_ingredient": "Spinetoram 11.7% SC (Delegate)", "dosage": "0.9 ml / liter water", "application": "Rapid knockdown preventing further tospovirus transmission."}], "preventative_measures": ["Use silver reflective plastic mulch which disorients and deters vector thrips from landing.", "Rogue out and destroy infected vines showing terminal bud necrosis immediately."]}];

  function searchDiseasesLocal(crop, q) {
    let results = ICAR_DISEASES_DB || [];
    const cropClean = (crop || '').toLowerCase().trim();
    const queryClean = (q || '').toLowerCase().trim();

    if (cropClean) {
      results = results.filter(d => (d.crop || '').toLowerCase() === cropClean);
    }

    if (queryClean) {
      results = results.filter(d => {
        const name = (d.name || d.disease || '').toLowerCase();
        const sym = (d.symptoms || '').toLowerCase();
        const bio = typeof d.biological_cures === 'string' 
          ? d.biological_cures.toLowerCase() 
          : JSON.stringify(d.biological_cures || d.biological_control || '').toLowerCase();
        const chem = typeof d.chemical_remedies === 'string' 
          ? d.chemical_remedies.toLowerCase() 
          : JSON.stringify(d.chemical_remedies || d.chemical_fungicides || '').toLowerCase();
        const pathType = (d.pathogen_type || '').toLowerCase();
        const pathName = (d.pathogen_name || '').toLowerCase();
        return name.includes(queryClean) || sym.includes(queryClean) || bio.includes(queryClean) || chem.includes(queryClean) || pathType.includes(queryClean) || pathName.includes(queryClean);
      });
    }

    return {
      success: true,
      crop: cropClean,
      count: results.length,
      diseases: results,
      outbreak_risk: []
    };
  }

  const ICAR_CROP_BENCHMARKS = {
    rice: { N: 120, P: 60, K: 60, ph: 6.5, staple: 'Paddy / Rice' },
    wheat: { N: 120, P: 60, K: 40, ph: 6.8, staple: 'Wheat' },
    maize: { N: 120, P: 60, K: 50, ph: 6.5, staple: 'Maize' },
    cotton: { N: 120, P: 60, K: 60, ph: 7.2, staple: 'Cotton' },
    sugarcane: { N: 250, P: 100, K: 120, ph: 6.8, staple: 'Sugarcane' },
    jute: { N: 80, P: 40, K: 40, ph: 6.5, staple: 'Jute' },
    chickpea: { N: 25, P: 50, K: 25, ph: 7.0, staple: 'Chickpea (Gram)' },
    kidneybeans: { N: 30, P: 60, K: 40, ph: 6.5, staple: 'Kidney Beans (Rajma)' },
    pigeonpeas: { N: 25, P: 50, K: 25, ph: 7.0, staple: 'Pigeonpeas (Arhar/Tur)' },
    mothbeans: { N: 20, P: 40, K: 20, ph: 7.2, staple: 'Mothbeans' },
    mungbean: { N: 20, P: 40, K: 20, ph: 7.0, staple: 'Mungbean (Moong)' },
    blackgram: { N: 20, P: 40, K: 20, ph: 7.0, staple: 'Blackgram (Urad)' },
    lentil: { N: 25, P: 50, K: 25, ph: 6.8, staple: 'Lentil (Masoor)' },
    pomegranate: { N: 150, P: 75, K: 100, ph: 6.8, staple: 'Pomegranate' },
    banana: { N: 200, P: 60, K: 200, ph: 6.5, staple: 'Banana' },
    mango: { N: 120, P: 50, K: 100, ph: 6.5, staple: 'Mango' },
    grapes: { N: 150, P: 80, K: 160, ph: 6.8, staple: 'Grapes' },
    watermelon: { N: 100, P: 60, K: 60, ph: 6.5, staple: 'Watermelon' },
    muskmelon: { N: 100, P: 60, K: 60, ph: 6.5, staple: 'Muskmelon' },
    apple: { N: 100, P: 50, K: 100, ph: 6.2, staple: 'Apple' },
    orange: { N: 120, P: 60, K: 80, ph: 6.5, staple: 'Orange / Citrus' },
    papaya: { N: 150, P: 60, K: 150, ph: 6.5, staple: 'Papaya' },
    coconut: { N: 100, P: 50, K: 140, ph: 6.5, staple: 'Coconut' },
    coffee: { N: 140, P: 90, K: 120, ph: 6.0, staple: 'Coffee' },
    tea: { N: 140, P: 60, K: 90, ph: 5.5, staple: 'Tea' },
    potato: { N: 150, P: 100, K: 120, ph: 6.2, staple: 'Potato' },
    soybean: { N: 30, P: 60, K: 40, ph: 6.5, staple: 'Soybean' },
    mustard: { N: 80, P: 40, K: 40, ph: 6.5, staple: 'Mustard (Sarson)' },
    groundnut: { N: 25, P: 50, K: 50, ph: 6.5, staple: 'Groundnut (Peanut)' },
    jowar: { N: 80, P: 40, K: 40, ph: 6.8, staple: 'Sorghum (Jowar)' },
    sorghum: { N: 80, P: 40, K: 40, ph: 6.8, staple: 'Sorghum (Jowar)' },
    bajra: { N: 80, P: 40, K: 40, ph: 7.0, staple: 'Pearl Millet (Bajra)' },
    pearl_millet: { N: 80, P: 40, K: 40, ph: 7.0, staple: 'Pearl Millet (Bajra)' },
    barley: { N: 60, P: 30, K: 30, ph: 7.0, staple: 'Barley' },
    ragi: { N: 60, P: 30, K: 30, ph: 6.5, staple: 'Finger Millet (Ragi)' },
    onion: { N: 100, P: 50, K: 60, ph: 6.8, staple: 'Onion' },
    garlic: { N: 100, P: 50, K: 60, ph: 6.8, staple: 'Garlic' },
    tomato: { N: 120, P: 60, K: 60, ph: 6.5, staple: 'Tomato' },
    brinjal: { N: 100, P: 50, K: 50, ph: 6.5, staple: 'Brinjal (Eggplant)' },
    chilli: { N: 120, P: 60, K: 60, ph: 6.5, staple: 'Chilli' },
    ginger: { N: 100, P: 50, K: 100, ph: 6.0, staple: 'Ginger' },
    turmeric: { N: 120, P: 60, K: 120, ph: 6.5, staple: 'Turmeric' }
  };

  function calculateFertilizersLocal(payload) {
    const cropKey = (payload.target_crop || 'rice').toLowerCase().trim();
    const bm = ICAR_CROP_BENCHMARKS[cropKey] || { N: 120, P: 60, K: 50, ph: 6.5 };
    
    const curN = Number(payload.nitrogen) || 0;
    const curP = Number(payload.phosphorus) || 0;
    const curK = Number(payload.potassium) || 0;
    const curPh = Number(payload.ph) || 6.8;

    const targetN = bm.N;
    const targetP = bm.P;
    const targetK = bm.K;

    // ICAR-IISS STCR formula:
    // Accounts for soil test contribution while preserving a minimum maintenance threshold (30-40% of RDF)
    const netN = Math.round(Math.max(targetN * 0.40, targetN - (0.35 * curN)) * 10) / 10;
    const netP = Math.round(Math.max(targetP * 0.35, targetP - (0.45 * curP)) * 10) / 10;
    const netK = Math.round(Math.max(targetK * 0.30, targetK - (0.35 * curK)) * 10) / 10;

    // DAP (18% N, 46% P2O5), Urea (46% N), MOP (60% K2O)
    const dap_kg_ha = Math.round((netP / 0.46) * 10) / 10;
    const n_from_dap = dap_kg_ha * 0.18;
    const net_n_needed = Math.max(0, netN - n_from_dap);
    const urea_kg_ha = Math.round((net_n_needed / 0.46) * 10) / 10;
    const mop_kg_ha = Math.round((netK / 0.60) * 10) / 10;

    return {
      success: true,
      target_crop: cropKey.toUpperCase(),
      inputs: {
        nitrogen: curN,
        phosphorus: curP,
        potassium: curK,
        ph: curPh
      },
      fertilizers: {
        urea_kg_ha: urea_kg_ha,
        dap_kg_ha: dap_kg_ha,
        mop_kg_ha: mop_kg_ha
      },
      deficits: {
        target_n: targetN,
        target_p: targetP,
        target_k: targetK,
        current_n: curN,
        current_p: curP,
        current_k: curK,
        n_deficit: Math.max(0, Math.round((targetN - curN) * 10) / 10),
        p_deficit: Math.max(0, Math.round((targetP - curP) * 10) / 10),
        k_deficit: Math.max(0, Math.round((targetK - curK) * 10) / 10)
      },
      prescription: {
        target_npk: { N: targetN, P: targetP, K: targetK },
        current_npk: { N: curN, P: curP, K: curK },
        commercial_doses: {
          urea_kg: urea_kg_ha,
          dap_kg: dap_kg_ha,
          mop_kg: mop_kg_ha
        },
        deficits: {
          N_deficit: Math.max(0, Math.round((targetN - curN) * 10) / 10),
          P_deficit: Math.max(0, Math.round((targetP - curP) * 10) / 10),
          K_deficit: Math.max(0, Math.round((targetK - curK) * 10) / 10)
        }
      }
    };
  }

  function calculateCropPredictionLocal(payload) {
    const n = Number(payload.nitrogen) || 90;
    const p = Number(payload.phosphorus) || 45;
    const k = Number(payload.potassium) || 45;
    const ph = Number(payload.ph) || 6.5;

    const scores = [];
    for (const [cName, bm] of Object.entries(ICAR_CROP_BENCHMARKS)) {
      const dN = Math.abs(n - bm.N) / (bm.N || 1);
      const dP = Math.abs(p - bm.P) / (bm.P || 1);
      const dK = Math.abs(k - bm.K) / (bm.K || 1);
      const dPh = Math.abs(ph - bm.ph) / (bm.ph || 1);
      const dist = (dN * 1.2 + dP * 1.0 + dK * 1.0 + dPh * 0.8) / 4.0;
      const confidence = Math.max(45, Math.min(98.5, Math.round((1 - dist * 0.5) * 1000) / 10));
      scores.push({ crop: cName, confidence });
    }

    scores.sort((a, b) => b.confidence - a.confidence);
    const topRecs = scores.slice(0, 3).map((s, idx) => ({
      rank: idx + 1,
      crop: s.crop,
      confidence: s.confidence,
      profile: {
        cycle_days: '110 – 140 Days',
        water_demand: 'Normal Seasonal',
        economic_outlook: 'Strong regional APMC Mandi demand',
        benefits: ['High NPK efficiency', 'Regional climate resilience']
      }
    }));

    let targetDiag = null;
    const tgt = (payload.target_crop || '').toLowerCase().trim();
    if (tgt) {
      const tgtScore = scores.find(s => s.crop === tgt);
      const conf = tgtScore ? tgtScore.confidence : 75;
      const isViable = conf >= 80;
      targetDiag = {
        crop: tgt.toUpperCase(),
        risk_level: isViable ? 'Low Risk' : 'High Risk',
        compatibility_score: conf,
        profile: {
          cycle_days: '110 – 135 Days',
          water_demand: 'Moderate',
          economic_outlook: 'Stable market demand'
        },
        issues: isViable ? [] : ['Sub-optimal nitrogen-phosphorus balance for root initiation'],
        rescue_roadmap: isViable ? [] : ['Apply 25 kg/ha additional DAP at basal dressing', 'Enhance organic matter with 2 tons/acre compost']
      };
    }

    return {
      success: true,
      inputs: payload,
      target_diagnosis: targetDiag,
      recommendations: topRecs
    };
  }

  function renderFertSvgFallback(chartDiv, targetN, targetP, targetK, currentN, currentP, currentK) {
    const maxY = Math.max(targetN, targetP, targetK, currentN, currentP, currentK, 50);
    const h = 260;
    const w = chartDiv.clientWidth || 600;
    const scale = (val) => Math.round((val / maxY) * (h - 60));

    const items = [
      { name: 'Nitrogen (N)', target: targetN, current: currentN },
      { name: 'Phosphorus (P)', target: targetP, current: currentP },
      { name: 'Potassium (K)', target: targetK, current: currentK }
    ];

    const groupWidth = Math.floor(w / 3.5);
    const barWidth = Math.min(36, Math.floor(groupWidth * 0.32));

    const barsHtml = items.map((item, idx) => {
      const xGroup = Math.floor((idx + 0.5) * (w / 3));
      const tH = scale(item.target);
      const cH = scale(item.current);
      const tY = h - 35 - tH;
      const cY = h - 35 - cH;
      const tX = xGroup - barWidth - 4;
      const cX = xGroup + 4;

      return `
        <rect x="${tX}" y="${tY}" width="${barWidth}" height="${tH}" rx="4" fill="#1C4A32"></rect>
        <text x="${tX + barWidth/2}" y="${Math.max(16, tY - 6)}" text-anchor="middle" font-size="11" font-weight="700" fill="#1C4A32">${item.target}</text>

        <rect x="${cX}" y="${cY}" width="${barWidth}" height="${cH}" rx="4" fill="#E59B2E"></rect>
        <text x="${cX + barWidth/2}" y="${Math.max(16, cY - 6)}" text-anchor="middle" font-size="11" font-weight="700" fill="#B87514">${item.current}</text>

        <text x="${xGroup}" y="${h - 10}" text-anchor="middle" font-size="12" font-weight="600" fill="#1A2C22">${item.name}</text>
      `;
    }).join('');

    chartDiv.innerHTML = `
      <div style="width:100%; height:320px; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#FBF9F4; border-radius:12px; padding:12px; box-sizing:border-box;">
        <svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" style="overflow:visible;">
          <line x1="20" y1="${h-35}" x2="${w-20}" y2="${h-35}" stroke="#D4CBBF" stroke-width="1.5"></line>
          ${barsHtml}
        </svg>
        <div style="display:flex; justify-content:center; gap:24px; margin-top:8px; font-size:12px; font-weight:600; color:#1A2C22;">
          <div style="display:flex; align-items:center; gap:6px;"><span style="width:14px; height:14px; background:#1C4A32; border-radius:3px; display:inline-block;"></span> Crop Optimum Target</div>
          <div style="display:flex; align-items:center; gap:6px;"><span style="width:14px; height:14px; background:#E59B2E; border-radius:3px; display:inline-block;"></span> Current Field Soil Test</div>
        </div>
      </div>
    `;
  }

  function getAgroClimaticZone(state, district) {
    const s = (state || '').toLowerCase();
    const d = (district || '').toLowerCase();

    if (s.includes('uttar pradesh') || s.includes('up')) {
      if (d.includes('prayagraj') || d.includes('varanasi') || d.includes('gorakhpur') || d.includes('ayodhya') || d.includes('jaunpur') || d.includes('mirzapur') || d.includes('lucknow')) {
        return 'Middle Gangetic Plain (Zone 4)';
      }
      return 'Upper Gangetic Plain (Zone 5)';
    }
    if (s.includes('bihar')) return 'Middle Gangetic Plain (Zone 4)';
    if (s.includes('west bengal') || s.includes('bengal')) return 'Lower Gangetic Plain (Zone 3)';
    if (s.includes('punjab') || s.includes('haryana') || s.includes('delhi')) return 'Trans-Gangetic Plain (Zone 6)';
    if (s.includes('maharashtra')) return 'Western Plateau and Hills (Zone 9)';
    if (s.includes('madhya pradesh') || s.includes('mp')) return 'Central Plateau and Hills (Zone 8)';
    if (s.includes('gujarat')) return 'Gujarat Plains and Hills (Zone 13)';
    if (s.includes('rajasthan')) return d.includes('jodhpur') || d.includes('bikaner') || d.includes('jaisalmer') ? 'Western Dry Region (Zone 14)' : 'Central Plateau and Hills (Zone 8)';
    if (s.includes('andhra') || s.includes('telangana')) return 'Southern Plateau and Hills (Zone 10)';
    if (s.includes('karnataka')) return 'Southern Plateau & Coastal Zone (Zone 10/12)';
    if (s.includes('tamil nadu')) return 'East Coast Plains and Hills (Zone 11)';
    if (s.includes('kerala')) return 'West Coast Plains and Ghats (Zone 12)';
    if (s.includes('odisha') || s.includes('orissa') || s.includes('chhattisgarh') || s.includes('jharkhand')) return 'Eastern Plateau and Hills (Zone 7)';
    if (s.includes('assam') || s.includes('sikkim') || s.includes('meghalaya') || s.includes('tripura') || s.includes('manipur')) return 'Eastern Himalayan Region (Zone 2)';
    if (s.includes('himachal') || s.includes('uttarakhand') || s.includes('kashmir') || s.includes('jammu')) return 'Western Himalayan Region (Zone 1)';
    
    return 'Agro-Ecological Region (ICAR Sub-zone)';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. RESILIENT API FETCH & TELEMETRY
  // ─────────────────────────────────────────────────────────────────────────
  async function apiFetch(url, options = {}) {
    try {
      let res = await fetch(url, options);
      if (res.status === 404 || res.status === 405) {
        const altUrl = url.startsWith('/api/') ? url.replace('/api/', '/') : (url.startsWith('/') ? '/api' + url : '/api/' + url);
        const altRes = await fetch(altUrl, options);
        if (altRes.ok || (altRes.status !== 404 && altRes.status !== 405)) {
          return altRes;
        }
      }
      return res;
    } catch (e) {
      const altUrl = url.startsWith('/api/') ? url.replace('/api/', '/') : (url.startsWith('/') ? '/api' + url : '/api/' + url);
      return await fetch(altUrl, options);
    }
  }

  async function fetchLiveTelemetry(query) {
    if (!query) return;
    const qClean = query.trim();
    const cityKey = qClean.toLowerCase();
    const known = KNOWN_DISTRICTS[cityKey];

    const specificLocEl = document.getElementById('specific-location-val');
    if (specificLocEl) specificLocEl.textContent = `📍 Locating ${qClean}...`;

    try {
      let lat = known?.lat;
      let lon = known?.lon;
      let cityName = known?.city || qClean;
      let stateName = known?.state || '';
      let specificLoc = known?.specificLocation || '';
      let agroZone = known?.zone || '';

      // 1. If not in known presets, resolve via Open-Meteo Geocoding
      if (!lat || !lon || !stateName) {
        try {
          const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(qClean)}&count=1&language=en&format=json`;
          const geoRes = await fetch(geoUrl);
          const geoJson = await geoRes.json();
          if (geoJson && Array.isArray(geoJson.results) && geoJson.results.length > 0) {
            const r = geoJson.results[0];
            lat = r.latitude;
            lon = r.longitude;
            cityName = r.name || qClean;
            stateName = r.admin1 || '';
            const locality = r.admin3 || r.admin2 || '';
            specificLoc = locality ? `${locality}, ${cityName}, ${stateName}` : `${cityName}, ${stateName}`;
            agroZone = getAgroClimaticZone(stateName, cityName);
          }
        } catch (geoErr) {
          console.warn('Geocoding error:', geoErr);
        }
      }

      if (!specificLoc) {
        specificLoc = stateName ? `${cityName}, ${stateName}` : `${cityName}, India`;
      }
      if (!agroZone) {
        agroZone = getAgroClimaticZone(stateName, cityName);
      }

      // 2. Fetch live high-resolution weather telemetry from Open-Meteo
      let temp = known?.temp || 27.0;
      let humidity = known?.humidity || 68;
      let rainfall = known?.rain || 200;
      let conditionIcon = '☀️';

      if (lat && lon) {
        try {
          const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=precipitation_sum&timezone=auto`;
          const omRes = await fetch(omUrl);
          const omData = await omRes.json();
          if (omData && omData.current) {
            temp = omData.current.temperature_2m;
            humidity = omData.current.relative_humidity_2m || 70;
            const wCode = omData.current.weather_code || 0;
            const dailySum = (omData.daily && omData.daily.precipitation_sum) ? omData.daily.precipitation_sum.reduce((a, b) => a + (b || 0), 0) : 12;
            rainfall = Math.max(70, Math.min(380, Math.round(dailySum * 6.5 + 40)));
            conditionIcon = (wCode >= 51 && wCode <= 67) ? '🌧️' : (wCode >= 1 && wCode <= 3 ? '⛅' : (wCode >= 95 ? '⛈️' : '☀️'));
          }
        } catch (omErr) {
          console.warn('Open-Meteo forecast error:', omErr);
        }
      } else {
        try {
          const res = await apiFetch(`/weather?query=${encodeURIComponent(qClean)}`);
          const data = await res.json();
          if (data && data.success && data.telemetry) {
            const t = data.telemetry;
            temp = t.temperature || temp;
            humidity = t.humidity || humidity;
            rainfall = t.rainfall || rainfall;
            cityName = t.city || cityName;
            stateName = t.region || stateName;
          }
        } catch (e) {}
      }

      // Update state and UI
      state.currentCity = cityName;
      state.currentZone = agroZone;
      state.currentWeather = { temperature: temp, humidity, rainfall };

      if (specificLocEl) {
        specificLocEl.textContent = specificLoc;
      }
      if (zoneLabel) {
        const coordsText = (lat && lon) ? ` • Lat ${lat.toFixed(2)}° N, Lon ${lon.toFixed(2)}° E` : '';
        zoneLabel.textContent = `Agro-Climatic Region: ${agroZone}${coordsText}`;
      }
      if (telemetryTemp) telemetryTemp.textContent = `${temp.toFixed(1)}°C`;
      if (zoneMonsoonText) zoneMonsoonText.textContent = `${Math.round(rainfall)} mm`;
      const wIconEl = document.querySelector('.zone-weather-icon');
      if (wIconEl) wIconEl.textContent = conditionIcon;

      // Update Form Sliders
      if (sliders.temp) {
        sliders.temp.value = temp;
        if (displays.temp) displays.temp.textContent = temp.toFixed(1);
      }
      if (sliders.rain) {
        sliders.rain.value = rainfall;
        if (displays.rain) displays.rain.textContent = Math.round(rainfall);
      }
      if (sliders.hum) {
        sliders.hum.value = humidity;
        const valHum = document.getElementById('val-hum');
        if (valHum) valHum.textContent = Math.round(humidity);
      }

      // If known preset has NPK, calibrate inputs
      if (known && known.n && known.p && known.k) {
        if (inputs.n && sliders.n) {
          inputs.n.value = known.n;
          sliders.n.value = known.n;
          if (displays.n) displays.n.textContent = known.n;
          updateNutrientStatusPill('n', known.n);
        }
        if (inputs.p && sliders.p) {
          inputs.p.value = known.p;
          sliders.p.value = known.p;
          if (displays.p) displays.p.textContent = known.p;
          updateNutrientStatusPill('p', known.p);
        }
        if (inputs.k && sliders.k) {
          inputs.k.value = known.k;
          sliders.k.value = known.k;
          if (displays.k) displays.k.textContent = known.k;
          updateNutrientStatusPill('k', known.k);
        }
      }

      updateConditionPill(temp);

      // Auto-sync soil dropdown if state matches
      if (stateDropdown && stateName) {
        for (let i = 0; i < stateDropdown.options.length; i++) {
          if (stateDropdown.options[i].value.toLowerCase().includes(stateName.toLowerCase()) || stateName.toLowerCase().includes(stateDropdown.options[i].value.toLowerCase())) {
            stateDropdown.selectedIndex = i;
            loadSoilStateProfile(stateDropdown.options[i].value);
            break;
          }
        }
      }

      // Add or update Auto chip in district row
      const districtChipsContainer = document.getElementById('district-chips');
      if (districtChipsContainer && cityName) {
        let existingAutoChip = document.getElementById('auto-district-chip');
        if (!existingAutoChip) {
          existingAutoChip = document.createElement('button');
          existingAutoChip.type = 'button';
          existingAutoChip.id = 'auto-district-chip';
          existingAutoChip.className = 'dist-chip active';
          districtChipsContainer.insertBefore(existingAutoChip, districtChipsContainer.firstChild);
        }
        existingAutoChip.textContent = `📍 ${cityName}`;
        existingAutoChip.dataset.city = cityName;
        existingAutoChip.dataset.temp = temp;
        existingAutoChip.dataset.rain = rainfall;
        existingAutoChip.dataset.zone = agroZone;

        districtChips.forEach(c => {
          if (c !== existingAutoChip) c.classList.remove('active');
        });
      }

      // Re-run prediction with the updated weather parameters
      if (typeof predictCrops === 'function') {
        predictCrops();
      }
    } catch (err) {
      console.warn('Telemetry fetch error:', err);
    }
  }

  // Modal Controls
  if (btnChangeCity) {
    btnChangeCity.addEventListener('click', () => {
      cityModal.classList.add('open');
      citySearchInput.focus();
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => cityModal.classList.remove('open'));
  }

  if (cityModal) {
    cityModal.addEventListener('click', (e) => {
      if (e.target === cityModal) cityModal.classList.remove('open');
    });
  }

  if (citySearchBtn) {
    citySearchBtn.addEventListener('click', () => {
      const val = citySearchInput.value.trim();
      if (val) {
        fetchLiveTelemetry(val);
        cityModal.classList.remove('open');
      }
    });
  }

  if (citySearchInput) {
    citySearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') citySearchBtn.click();
    });
  }

  cityPresetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const city = chip.dataset.city;
      fetchLiveTelemetry(city);
      cityModal.classList.remove('open');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // AUTOMATIC LIVE WEATHER & GPS RESOLUTION ENGINE
  // ─────────────────────────────────────────────────────────────────────────
  async function reverseGeocodeCoords(lat, lon) {
    // 1. Try OpenStreetMap Nominatim for exact specific locality / neighborhood / suburb
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
      const res = await fetch(nomUrl, { headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const a = data.address;
          const specific = a.suburb || a.neighbourhood || a.village || a.town || a.hamlet || a.road || '';
          const city = a.city || a.town || a.state_district || a.county || '';
          const state = a.state || '';
          const post = a.postcode ? `(${a.postcode})` : '';

          const parts = [];
          if (specific && specific !== city) parts.push(specific);
          if (city) parts.push(city);
          if (post) parts.push(post);
          if (state) parts.push(state);

          const fullName = parts.join(', ');
          if (fullName) {
            return {
              specificLocation: fullName,
              city: city || specific || 'Local District',
              state: state,
              district: city
            };
          }
        }
      }
    } catch (e) {
      console.warn('Nominatim reverse geocode error:', e);
    }

    // 2. Fallback to BigDataCloud reverse geocode client API
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      const res2 = await fetch(bdcUrl);
      if (res2.ok) {
        const bdc = await res2.json();
        const loc = bdc.locality || '';
        const city = bdc.city || bdc.principalSubdivision || '';
        const state = bdc.principalSubdivision || '';
        const post = bdc.postcode ? `(${bdc.postcode})` : '';

        const parts = [];
        if (loc && loc !== city) parts.push(loc);
        if (city) parts.push(city);
        if (post) parts.push(post);
        if (state) parts.push(state);

        return {
          specificLocation: parts.join(', ') || `${city}, ${state}`,
          city: city || loc || 'Local District',
          state: state,
          district: city
        };
      }
    } catch (e2) {
      console.warn('BigDataCloud reverse geocode error:', e2);
    }

    return {
      specificLocation: `Lat ${lat.toFixed(2)}°, Lon ${lon.toFixed(2)}°`,
      city: 'Local District',
      state: '',
      district: ''
    };
  }

  async function autoDetectWeather(isUserAction = false) {
    if (isUserAction && btnDetectGps) {
      btnDetectGps.innerHTML = '<span class="gps-dot is-pulsing"></span> 📡 Locating...';
    }

    const setWeatherData = (specificLoc, city, region, lat, lon, temp, humidity, rainfall, conditionIcon = '☀️', conditionText = 'Normal') => {
      state.currentCity = city;
      state.currentWeather = { temperature: temp, humidity, rainfall };

      // Update Specific Location display & Zone Label
      const specificLocEl = document.getElementById('specific-location-val');
      if (specificLocEl) {
        specificLocEl.textContent = specificLoc || (region ? `${city}, ${region}` : city);
      }
      const agroZone = getAgroClimaticZone(region, city);
      if (zoneLabel) {
        const coordsText = (lat && lon) ? ` • Lat ${lat.toFixed(2)}° N, Lon ${lon.toFixed(2)}° E` : '';
        zoneLabel.textContent = `Agro-Climatic Region: ${agroZone}${coordsText}`;
      }
      if (telemetryTemp) telemetryTemp.textContent = `${temp.toFixed(1)}°C`;
      if (zoneMonsoonText) zoneMonsoonText.textContent = `${Math.round(rainfall)} mm`;
      
      const weatherIconEl = document.querySelector('.zone-weather-icon');
      if (weatherIconEl) weatherIconEl.textContent = conditionIcon;

      // Update Form Sliders & Badges
      if (sliders.temp) {
        sliders.temp.value = temp;
        if (displays.temp) displays.temp.textContent = temp.toFixed(1);
      }
      if (sliders.rain) {
        sliders.rain.value = rainfall;
        if (displays.rain) displays.rain.textContent = Math.round(rainfall);
      }
      if (sliders.hum) {
        sliders.hum.value = humidity;
        const valHum = document.getElementById('val-hum');
        if (valHum) valHum.textContent = Math.round(humidity);
      }

      updateConditionPill(temp);

      // Auto-sync soil dropdown if state matches
      if (stateDropdown && region) {
        for (let i = 0; i < stateDropdown.options.length; i++) {
          if (stateDropdown.options[i].value.toLowerCase().includes(region.toLowerCase()) || region.toLowerCase().includes(stateDropdown.options[i].value.toLowerCase())) {
            stateDropdown.selectedIndex = i;
            loadSoilStateProfile(stateDropdown.options[i].value);
            break;
          }
        }
      }

      // Add or update Auto chip in district row
      const districtChipsContainer = document.getElementById('district-chips');
      if (districtChipsContainer && city) {
        let existingAutoChip = document.getElementById('auto-district-chip');
        if (!existingAutoChip) {
          existingAutoChip = document.createElement('button');
          existingAutoChip.type = 'button';
          existingAutoChip.id = 'auto-district-chip';
          existingAutoChip.className = 'dist-chip active';
          districtChipsContainer.insertBefore(existingAutoChip, districtChipsContainer.firstChild);
        }
        existingAutoChip.textContent = `📍 ${city}`;
        existingAutoChip.dataset.city = city;
        existingAutoChip.dataset.temp = temp;
        existingAutoChip.dataset.rain = rainfall;
        existingAutoChip.dataset.zone = region ? `${city}, ${region}` : city;

        districtChips.forEach(c => {
          if (c !== existingAutoChip) c.classList.remove('active');
        });
      }

      if (btnDetectGps) {
        btnDetectGps.innerHTML = '<span class="gps-dot"></span> 📡 Auto GPS';
      }
    };

    // 1. Try Browser HTML5 Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            // High-resolution forecast from Open-Meteo
            const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=precipitation_sum&timezone=auto`;
            const omPromise = fetch(omUrl).then(r => r.json());
            
            // Reverse geocode for exact specific neighborhood/locality
            const geoPromise = reverseGeocodeCoords(latitude, longitude);

            const [omData, geoResult] = await Promise.all([omPromise, geoPromise]);

            let specificName = geoResult.specificLocation;
            let cityName = geoResult.city || 'Local District';
            let regionName = geoResult.state || '';

            if (omData && omData.current) {
              const temp = omData.current.temperature_2m;
              const hum = omData.current.relative_humidity_2m || 70;
              const wCode = omData.current.weather_code || 0;
              
              const dailyRainSum = (omData.daily && omData.daily.precipitation_sum) ? omData.daily.precipitation_sum.reduce((a, b) => a + (b || 0), 0) : 10;
              const seasonalRain = Math.max(75, Math.min(380, Math.round(dailyRainSum * 6.5 + 40)));

              const icon = (wCode >= 51 && wCode <= 67) ? '🌧️' : (wCode >= 1 && wCode <= 3 ? '⛅' : (wCode >= 95 ? '⛈️' : '☀️'));

              setWeatherData(specificName, cityName, regionName, latitude, longitude, temp, hum, seasonalRain, icon, 'Live GPS');
              return;
            }
          } catch (e) {
            console.warn('GPS weather resolution error:', e);
          }
        },
        async (err) => {
          // 2. Geolocation denied or unavailable -> Fall back to IP-based Geolocation
          try {
            const ipRes = await fetch('https://ipapi.co/json/');
            const ipData = await ipRes.json();
            if (ipData && ipData.city) {
              const lat = ipData.latitude;
              const lon = ipData.longitude;
              const city = ipData.city;
              const region = ipData.region;
              const specific = `${city}, ${region} (${ipData.postal || ''})`.trim();
              
              const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=precipitation_sum&timezone=auto`;
              const omRes = await fetch(omUrl);
              const omData = await omRes.json();

              if (omData && omData.current) {
                const temp = omData.current.temperature_2m;
                const hum = omData.current.relative_humidity_2m || 65;
                const dailySum = (omData.daily && omData.daily.precipitation_sum) ? omData.daily.precipitation_sum.reduce((a, b) => a + (b || 0), 0) : 12;
                const rain = Math.max(70, Math.min(380, Math.round(dailySum * 6.5 + 40)));
                setWeatherData(specific, city, region, lat, lon, temp, hum, rain, '⛅', 'IP Auto');
                return;
              }
            }
          } catch (e2) {
            // Default fallback
          }
          if (btnDetectGps) btnDetectGps.innerHTML = '<span class="gps-dot"></span> 📡 Auto GPS';
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }
  }

  if (btnDetectGps) {
    btnDetectGps.addEventListener('click', () => autoDetectWeather(true));
  }
  
  // ─────────────────────────────────────────────────────────────────────────
      // 5. MULTI-LANGUAGE TRANSLATIONS & CROPS METADATA ENGINE
  // ─────────────────────────────────────────────────────────────────────────
  const TRANSLATIONS = {
    en: {
      navAdvisory: 'Crop Advisory',
      navWeather: 'Weather Alerts',
      navSoil: 'Fertilizer Prescriber',
      navDoctor: 'Pest Doctor',
      navMandi: 'Soil Health Registry',
      advisorBadge: 'Kharif 2025 Advisory Cycle • ICAR-KVK Validated Algorithm',
      advisorTitle: 'Farmer’s Crop Advisor <span class="hindi-sub">| Precision Soil Intelligence</span>',
      advisorSubtitle: 'Tailored agronomic guidance rooted in real-time district weather baselines, rainfall patterns, and lab-tested N-P-K soil health indicators.',
      fieldDiagnosticsTitle: 'Field Climate & Soil Diagnostics',
      fieldDiagnosticsSubtitle: 'Field Climate & Soil Diagnostics',
      btnDefaults: 'Defaults',
      btnRecommend: 'Get Best Crop Recommendations',
      btnRecommendSub: 'Recommended under National Mission for Sustainable Agriculture (NMSA) parameters.',
      recCropsTitle: 'Recommended Crops',
      recCropsSub: 'Ranked based on Soil N-P-K match, thermal safety, and moisture indices.',
      tabOverview: 'Overview',
      tabMatrix: 'Agronomic Matrix',
      helplineBannerTitle: 'Need Help Reading Your Soil Card or Sowing Calendar?',
      helplineBannerDesc: 'Talk directly with a government agronomist in your native language (English, Hindi, Marathi). Free Toll-Free Service.',
      locateKvkBtn: 'Locate Nearest KVK Centre',
      btnFertCalc: '🧪 Compute Fertilizer Prescription',
      searchPathologyBtn: 'Search Pathology',
      diseaseFilterCrop: 'Filter by Crop:',
      subtabAdvisory: 'Agro-Expert Advisory',
      subtabSpectrum: 'NPK Soil Health Spectrum',
      subtabRecords: 'Past Season Records',
      lblTargetCrop: '🎯 Planned Crop to Cultivate (Optional)',
      badgeTargetCropOpt: 'Optional / AI Check',
      hintTargetCrop: 'Have a specific crop in mind? Select it above. SPARC AI will verify if your land can cultivate it or suggest the preferred high-yield alternative.',
      optAutoRecommend: '✨ AI Auto-Recommend (Best Crop for Field)',
      targetViableTitle: '✅ Feasibility Verified: Your field naturally supports cultivating {crop}!',
      targetRiskyTitle: '⚠️ Cultivation Alert: {crop} has High Agronomic Risk on this land',
      preferredHeader: '🌟 Recommended Preferred Crop for Your Land:',
      preferredWhyLabel: '💡 Why this preferred crop is better:',
      rescueToggleLabel: '🛠️ If you still want to cultivate {crop}: View Rescue Roadmap ▼',
      // Recommended Card Elements
      heroChoiceBadge: '⭐ #1 Best Choice for Your Field',
      heroConfidenceChip: 'High Confidence',
      recVarietiesPrefix: 'Recommended Varieties: ',
      gaugeMatch: 'Suitability Match',
      gaugeFit: 'Ideal Field Fit',
      whyFitsTitle: 'Why this crop fits your land:',
      lblYield: '🌾 Expected Yield',
      lblWater: '💧 Water Need',
      lblPrice: '₹ Mandi Price Outlook',
      lblDuration: '⏱️ Growth Duration',
      lblBasalDose: 'Basal fertilizer dose:',
      calendarLink: 'View Sowing & Fertilizer Calendar →',
      altTag1: 'Alternative #1',
      altTag2: 'Alternative #2',
      altMatchText: 'Match',
      altLblWater: '💧 Water Need:',
      altLblYield: '🌾 Est. Yield:',
      altLblRisk: '📈 Market Risk:',
      altFertLink: 'Fertilizer Package >',
      // Disease Doctor Elements
      pestDoctorTitle: '🩺 Plant Pathology & Crop Disease Doctor',
      pestDoctorSub: '68+ Crop Pathogens with Biological Controls, Chemical Fungicides, and Live Telemetry Outbreak Alerts',
      symptomTapLabel: '👀 Tap What You See on the Plant (लक्षण चुनिए):',
      diagSymptoms: 'Diagnostic Symptoms',
      bioControl: 'Biological & Organic Control',
      chemControl: 'Chemical Fungicide / Treatment',
      noPathogensTitle: 'No Pathogens Found',
      noPathogensDesc: 'No diseases matched your search criteria. Try a different crop or broader symptom keyword.',
      listenBtnText: '🔊 Listen',
      shareBtnText: '📲 WhatsApp Share',
      fertPrescriptionTitle: 'Prescription & Commercial Doses',
      kisanBagTitle: '🎒 Total Commercial Bags to Buy From Mandi / Shop',
      bagUreaLabel: 'Bags Urea (45 kg)',
      bagDapLabel: 'Bags DAP (50 kg)',
      bagMopLabel: 'Bags MOP (50 kg)',
      histTitle: '📜 Search & Calculation History',
      histSub: 'Access and restore your previous soil tests, recommendations, and fertilizer doses',
      histFilterAll: 'All',
      histFilterCrop: '🌾 Crop Advisory',
      histFilterFert: '🧪 Fertilizer',
      histFilterDoctor: '🩺 Pest Doctor',
      histClearBtn: '🗑️ Clear All',
      histRestoreBtn: '🔄 Restore & View Results',
      histDeleteBtn: 'Delete',
      histEmptyTitle: 'No Search Records Found',
      histEmptyDesc: 'Run a crop recommendation, calculate fertilizer doses, or search plant pathology to build your farm history.'
    },    hi: {
      navAdvisory: 'फसल सलाह',
      navWeather: 'मौसम अलर्ट',
      navSoil: 'उर्वरक पर्चा',
      navDoctor: 'कीट एवं रोग डॉक्टर',
      navMandi: 'मृदा स्वास्थ्य रजिस्ट्री',
      advisorBadge: 'खरीफ 2025 कृषि सलाह चक्र • ICAR-KVK मान्य एल्गोरिथम',
      advisorTitle: 'Farmer’s Crop Advisor <span class="hindi-sub">| फसल और मिट्टी सलाहकार</span>',
      advisorSubtitle: 'वास्तविक समय जिला मौसम, वर्षा पैटर्न और प्रयोगशाला-परीक्षणित N-P-K मिट्टी संकेतकों पर आधारित सटीक मार्गदर्शन।',
      fieldDiagnosticsTitle: 'खेती और मिट्टी की जानकारी',
      fieldDiagnosticsSubtitle: 'फील्ड जलवायु और मिट्टी निदान',
      btnDefaults: 'डिफ़ॉल्ट',
      btnRecommend: 'सर्वोत्तम फसल सिफारिशें प्राप्त करें',
      btnRecommendSub: 'राष्ट्रीय सतत कृषि मिशन (NMSA) मानकों के तहत अनुशंसित।',
      recCropsTitle: 'अनुशंसित फसलें (Recommended Crops)',
      recCropsSub: 'मिट्टी N-P-K मिलान, तापीय सुरक्षा और नमी सूचकांकों के आधार पर रैंक किया गया।',
      tabOverview: 'अवलोकन',
      tabMatrix: 'कृषि मैट्रिक्स',
      helplineBannerTitle: 'क्या आपको मृदा स्वास्थ्य कार्ड या बुवाई कैलेंडर समझने में मदद चाहिए?',
      helplineBannerDesc: 'अपनी मातृभाषा (हिंदी, मराठी, अंग्रेजी) में सीधे सरकारी कृषि विशेषज्ञ से बात करें। निःशुल्क सेवा।',
      locateKvkBtn: 'निकटतम KVK केंद्र खोजें',
      btnFertCalc: '🧪 उर्वरक गणना करें',
      searchPathologyBtn: 'रोग का निदान खोजें',
      diseaseFilterCrop: 'फसल अनुसार चुनें:',
      subtabAdvisory: 'कृषि विशेषज्ञ सलाह',
      subtabSpectrum: 'NPK मृदा स्वास्थ्य स्पेक्ट्रम',
      subtabRecords: 'पिछले मौसम के रिकॉर्ड',
      lblTargetCrop: '🎯 आप कौन सी फसल उगाना चाहते हैं? (इच्छित फसल)',
      badgeTargetCropOpt: 'वैकल्पिक / AI सत्यापन',
      hintTargetCrop: 'यदि आपके मन में कोई विशिष्ट फसल है तो उसे चुनें। SPARC AI जांचेगा कि आपकी भूमि इसके अनुकूल है या नहीं, और आवश्यक होने पर बेहतर फसल सुझाएगा।',
      optAutoRecommend: '✨ सर्वोत्तम AI अनुशंसा (खेत के लिए सबसे उपयुक्त)',
      targetViableTitle: '✅ खेती के अनुकूल: आपकी भूमि और मौसम {crop} की खेती के सर्वथा उपयुक्त है!',
      targetRiskyTitle: '⚠️ फसल जोखिम चेतावनी: इस खेत में {crop} की खेती में विफलता का उच्च जोखिम है',
      preferredHeader: '🌟 सुझाई गई पसंदीदा बेहतर फसल:',
      preferredWhyLabel: '💡 यह फसल क्यों बेहतर विकल्प है:',
      rescueToggleLabel: '🛠️ यदि आप फिर भी {crop} उगाना चाहते हैं: आवश्यक मिट्टी सुधार व बचाव उपाय देखें ▼',
      // Recommended Card Elements
      heroChoiceBadge: '⭐ #1 आपके खेत के लिए सर्वश्रेष्ठ पसंद',
      heroConfidenceChip: 'उच्च सटीकता',
      recVarietiesPrefix: 'अनुशंसित उन्नत किस्में: ',
      gaugeMatch: 'अनुकूलता मिलान',
      gaugeFit: 'खेत के सर्वथा अनुकूल',
      whyFitsTitle: 'यह फसल आपकी भूमि के अनुकूल क्यों है:',
      lblYield: '🌾 अपेक्षित उपज',
      lblWater: '💧 पानी की आवश्यकता',
      lblPrice: '₹ मंडी भाव दृष्टिकोण',
      lblDuration: '⏱️ फसल अवधि',
      lblBasalDose: 'बुवाई के समय मूल खाद:',
      calendarLink: 'बुवाई व उर्वरक कैलेंडर देखें →',
      altTag1: 'वैकल्पिक फसल #1',
      altTag2: 'वैकल्पिक फसल #2',
      altMatchText: 'मैच',
      altLblWater: '💧 पानी की जरूरत:',
      altLblYield: '🌾 अनुमानित उपज:',
      altLblRisk: '📈 बाजार दृष्टिकोण:',
      altFertLink: 'उर्वरक पैकेज >',
      // Disease Doctor Elements
      pestDoctorTitle: '🩺 पादप रोग विज्ञान एवं फसल डॉक्टर (Pest Doctor)',
      pestDoctorSub: 'जैविक नियंत्रण, रासायनिक फफूंदनाशक और लाइव मौसम अलर्ट सहित 68+ फसल रोग',
      symptomTapLabel: '👀 पौधे पर क्या लक्षण दिखाई दे रहे हैं? (लक्षण चुनें):',
      diagSymptoms: 'रोग के लक्षण (Diagnostic Symptoms)',
      bioControl: 'जैविक व प्राकृतिक नियंत्रण (Biological Control)',
      chemControl: 'रासायनिक फफूंदनाशक व उपचार (Chemical Treatment)',
      noPathogensTitle: 'कोई रोग या कीट नहीं मिला',
      noPathogensDesc: 'आपके खोज मानदंडों से कोई बीमारी मेल नहीं खाती। कृपया अन्य फसल या सामान्य लक्षण खोजें।',
      listenBtnText: '🔊 सुनिए / Listen',
      shareBtnText: '📲 WhatsApp शेयर',
      fertPrescriptionTitle: 'उर्वरक नुस्खा एवं वाणिज्यिक मात्रा',
      kisanBagTitle: '🎒 मंडी/दुकान से खरीदने के लिए कुल खाद की बोरियां',
      bagUreaLabel: 'यूरिया बोरी (45 किग्रा)',
      bagDapLabel: 'डीएपी बोरी (50 किग्रा)',
      bagMopLabel: 'एमओपी (पोटाश) बोरी (50 किग्रा)',
      histTitle: '📜 खोज एवं गणना इतिहास',
      histSub: 'अपनी पिछली मिट्टी जांच, फसल अनुशंसा और उर्वरक मात्रा को देखें और पुनः लोड करें',
      histFilterAll: 'सभी',
      histFilterCrop: '🌾 फसल परामर्श',
      histFilterFert: '🧪 उर्वरक मात्रा',
      histFilterDoctor: '🩺 कीट डॉक्टर',
      histClearBtn: '🗑️ सभी हटाएं',
      histRestoreBtn: '🔄 परिणाम देखें एवं लोड करें',
      histDeleteBtn: 'हटाएं',
      histEmptyTitle: 'कोई पुराना रिकॉर्ड नहीं मिला',
      histEmptyDesc: 'फसल अनुशंसा चलाएं, उर्वरक खुराक की गणना करें या इतिहास बनाने के लिए रोग खोजें।'
    },
    mr: {
      navAdvisory: 'पीक सल्ला',
      navWeather: 'हवामान अंदाज',
      navSoil: 'खत शिफारस',
      navDoctor: 'कीड व रोग डॉक्टर',
      navMandi: 'माती आरोग्य नोंदणी',
      advisorBadge: 'खरीप २०२५ कृषी सल्ला चक्र • ICAR-KVK प्रमाणित प्रणाली',
      advisorTitle: 'शेतकरी पीक सल्लागार <span class="hindi-sub">| माती व हवामान आधारित मार्गदर्शन</span>',
      advisorSubtitle: 'रिअल-टाइम जिल्हा हवामान, पावसाचे प्रमाण आणि लॅब-चाचणी N-P-K माती घटकांवर आधारित परिपूर्ण कृषी सल्ला.',
      fieldDiagnosticsTitle: 'शेती आणि मातीची माहिती',
      fieldDiagnosticsSubtitle: 'स्थानिक हवामान आणि माती परीक्षण',
      btnDefaults: 'मूळ स्थिती',
      btnRecommend: 'योग्य पीक शिफारसी मिळवा',
      btnRecommendSub: 'राष्ट्रीय शाश्वत शेती अभियान (NMSA) मानकांनुसार शिफारस केलेले.',
      recCropsTitle: 'शिफारस केलेली पिके (Recommended Crops)',
      recCropsSub: 'मातीतील N-P-K घटक, उष्णता सुरक्षा आणि ओलावा निर्देशांकाच्या आधारे क्रमवारी.',
      tabOverview: 'आढावा',
      tabMatrix: 'कृषी मॅट्रिक्स',
      helplineBannerTitle: 'मृदा आरोग्य पत्रिका किंवा पेरणी दिनदर्शिका समजून घेण्यासाठी मदत हवी आहे का?',
      helplineBannerDesc: 'आपल्या स्वतःच्या भाषेत (मराठी, हिंदी, इंग्रजी) थेट सरकारी कृषी तज्ज्ञांशी बोला. मोफत टोल-फ्री सेवा.',
      locateKvkBtn: 'जवळचे KVK केंद्र शोधा',
      btnFertCalc: '🧪 अचूक खत मात्रा तपासा',
      searchPathologyBtn: 'रोगाचे निदान शोधा',
      diseaseFilterCrop: 'पिकानुसार फिल्टर करा:',
      subtabAdvisory: 'कृषी तज्ज्ञ सल्ला',
      subtabSpectrum: 'NPK माती आरोग्य स्पेक्ट्रम',
      subtabRecords: 'मागील हंगामातील नोंदी',
      lblTargetCrop: '🎯 आपण कोणते पीक घेऊ इच्छिता? (इच्छित पीक)',
      badgeTargetCropOpt: 'पर्यायी / AI पडताळणी',
      hintTargetCrop: 'आपल्या मनात विशिष्ट पीक असल्यास ते निवडा. SPARC AI आपली जमीन त्यासाठी योग्य आहे का ते तपासेल किंवा जास्त फायदेशीर पर्यायी पीक सुचवेल.',
      optAutoRecommend: '✨ सर्वोत्तम AI शिफारस (शेतीसाठी सर्वात योग्य)',
      targetViableTitle: '✅ लागवडीसाठी योग्य: आपली जमीन आणि हवामान {crop} च्या लागवडीसाठी अत्यंत अनुकूल आहे!',
      targetRiskyTitle: '⚠️ पीक जोखीम इशारा: या शेतात {crop} लागवडीमध्ये अपयशाची मोठी जोखीम आहे',
      preferredHeader: '🌟 सुचवलेले पर्यायी उत्तम पीक:',
      preferredWhyLabel: '💡 हे पर्यायी पीक का जास्त फायदेशीर आहे:',
      rescueToggleLabel: '🛠️ तरीही {crop} घ्यायचे असल्यास: आवश्यक जमीन सुधारणा व बचाव नियोजन पहा ▼',
      // Recommended Card Elements
      heroChoiceBadge: '⭐ #1 आपल्या शेतासाठी सर्वोत्तम निवड',
      heroConfidenceChip: 'उच्च अचूकता',
      recVarietiesPrefix: 'शिफारस केलेले सुधारित वाण: ',
      gaugeMatch: 'योग्यतेचे प्रमाण',
      gaugeFit: 'शेतीसाठी सर्वोत्तम अनुकूल',
      whyFitsTitle: 'हे पीक आपल्या शेतीसाठी का योग्य आहे:',
      lblYield: '🌾 अपेक्षित उत्पादन',
      lblWater: '💧 पाण्याची गरज',
      lblPrice: '₹ बाजार भाव अंदाज',
      lblDuration: '⏱️ पिकाचा कालावधी',
      lblBasalDose: 'पेरणीच्या वेळचा खताचा डोस:',
      calendarLink: 'पेरणी व खत दिनदर्शिका पहा →',
      altTag1: 'पर्यायी पीक #1',
      altTag2: 'पर्यायी पीक #2',
      altMatchText: 'जुळणी',
      altLblWater: '💧 पाण्याची गरज:',
      altLblYield: '🌾 अंदाजित उत्पादन:',
      altLblRisk: '📈 बाजार जोखीम अंदाज:',
      altFertLink: 'खत नियोजन >',
      // Disease Doctor Elements
      pestDoctorTitle: '🩺 वनस्पती रोग निदान आणि पीक डॉक्टर (Pest Doctor)',
      pestDoctorSub: 'जैविक नियंत्रण, रासायनिक बुरशीनाशक आणि थेट हवामान अलर्टसह ६८+ पीक रोग',
      symptomTapLabel: '👀 पिकावर कोणती लक्षणे दिसत आहेत? (लक्षण निवडा):',
      diagSymptoms: 'रोगाची लक्षणे (Diagnostic Symptoms)',
      bioControl: 'जैविक व सेंद्रिय नियंत्रण (Biological Control)',
      chemControl: 'रासायनिक बुरशीनाशक व उपचार (Chemical Treatment)',
      noPathogensTitle: 'कोणताही रोग आढळला नाही',
      noPathogensDesc: 'आपल्या शोधाशी जुळणारा कोणताही रोग आढळला नाही. कृपया इतर पीक निवडा किंवा वेगळे लक्षण शोधा.',
      listenBtnText: '🔊 ऐका / Listen',
      shareBtnText: '📲 WhatsApp शेअर',
      fertPrescriptionTitle: 'खत मात्रा व व्यापारी डोस',
      kisanBagTitle: '🎒 कृषी केंद्रातून खरेदी करावयाच्या एकूण खतांच्या गोण्या',
      bagUreaLabel: 'युरिया गोणी (४५ किलो)',
      bagDapLabel: 'डीएपी गोणी (५० किलो)',
      bagMopLabel: 'एमओपी (पोटॅश) गोणी (५० किलो)',
      histTitle: '📜 शोध आणि गणना इतिहास',
      histSub: 'तुमची मागील माती परीक्षणे, शिफारसी आणि खतांचे प्रमाण पहा आणि पुनर्संचयित करा',
      histFilterAll: 'सर्व',
      histFilterCrop: '🌾 पीक सल्ला',
      histFilterFert: '🧪 खत मात्रा',
      histFilterDoctor: '🩺 कीड डॉक्टर',
      histClearBtn: '🗑️ सर्व हटवा',
      histRestoreBtn: '🔄 निकाल पहा आणि पुनर्संचयित करा',
      histDeleteBtn: 'हटवा',
      histEmptyTitle: 'कोणतेही जुने रेकॉर्ड आढळले नाहीत',
      histEmptyDesc: 'पीक शिफारस चालवा, खतांची गणना करा किंवा इतिहास तयार करण्यासाठी रोग शोधा.'
    },
    pa: {
      navAdvisory: 'ਫਸਲ ਸਲਾਹ (Advisory)',
      navWeather: 'ਮੌਸਮ ਚੇਤਾਵਨੀ',
      navSoil: 'ਖਾਦ ਸਿਫਾਰਸ਼ (Fertilizer)',
      navDoctor: 'ਕੀਟ ਡਾਕਟਰ (Pest Doctor)',
      navMandi: 'ਮਿੱਟੀ ਸਿਹਤ ਰਜਿਸਟਰੀ',
      advisorBadge: 'ਖਰੀਫ਼ 2025 ਖੇਤੀ ਸਲਾਹ • ICAR-KVK ਪ੍ਰਮਾਣਿਤ',
      advisorTitle: 'ਕਿਸਾਨ ਫਸਲ ਸਲਾਹਕਾਰ <span class="hindi-sub">| ਮਿੱਟੀ ਅਤੇ ਮੌਸਮ ਆਧਾਰਿਤ ਖੇਤੀ</span>',
      advisorSubtitle: 'ਤੁਹਾਡੇ ਖੇਤ ਦੀ ਮਿੱਟੀ ਦੇ N-P-K ਟੈਸਟ, ਤਾਪਮਾਨ ਅਤੇ ਮੀਂਹ ਦੇ ਆਧਾਰ ਤੇ ਸਭ ਤੋਂ ਵਧੀਆ ਫਸਲ ਸਲਾਹ।',
      fieldDiagnosticsTitle: 'ਖੇਤ ਅਤੇ ਮਿੱਟੀ ਦੀ ਜਾਣਕਾਰੀ',
      fieldDiagnosticsSubtitle: 'ਜ਼ਮੀਨ ਦੀ ਜਾਂਚ ਅਤੇ ਮੌਸਮ ਨਿਦਾਨ',
      btnDefaults: 'ਮੂਲ ਸਥਿਤੀ',
      btnRecommend: 'ਸਰਵੋਤਮ ਫਸਲ ਸਿਫਾਰਸ਼ਾਂ ਪ੍ਰਾਪਤ ਕਰੋ',
      btnRecommendSub: 'ਨੈਸ਼ਨਲ ਮਿਸ਼ਨ ਫਾਰ ਸਸਟੇਨੇਬਲ ਐਗਰੀਕਲਚਰ (NMSA) ਅਨੁਸਾਰ।',
      recCropsTitle: 'ਸਿਫਾਰਸ਼ ਕੀਤੀਆਂ ਫਸਲਾਂ (Recommended Crops)',
      recCropsSub: 'ਮਿੱਟੀ N-P-K ਮੇਲ ਅਤੇ ਮੌਸਮ ਅਨੁਸਾਰ ਦਰਜਾਬੰਦੀ।',
      tabOverview: 'ਸੰਖੇਪ',
      tabMatrix: 'ਖੇਤੀ ਮੈਟ੍ਰਿਕਸ',
      helplineBannerTitle: 'ਕੀ ਤੁਹਾਨੂੰ ਮਿੱਟੀ ਕਾਰਡ ਜਾਂ ਬਿਜਾਈ ਕੈਲੰਡਰ ਸਮਝਣ ਵਿੱਚ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?',
      helplineBannerDesc: 'ਸਰਕਾਰੀ ਖੇਤੀਬਾੜੀ ਮਾਹਿਰ ਨਾਲ ਆਪਣੀ ਮਾਤ ਭਾਸ਼ਾ (ਪੰਜਾਬੀ, ਹਿੰਦੀ, ਅੰਗਰੇਜ਼ੀ) ਵਿੱਚ ਗੱਲ ਕਰੋ। ਮੁਫ਼ਤ ਟੋਲ-ਫ੍ਰੀ ਸੇਵਾ।',
      locateKvkBtn: 'ਨੇੜਲਾ KVK ਕੇਂਦਰ ਲੱਭੋ',
      btnFertCalc: '🧪 ਖਾਦ ਦੀ ਮਾਤਰਾ ਗਿਣੋ',
      searchPathologyBtn: 'ਬਿਮਾਰੀ ਦਾ ਹੱਲ ਲੱਭੋ',
      diseaseFilterCrop: 'ਫਸਲ ਅਨੁਸਾਰ ਚੁਣੋ:',
      subtabAdvisory: 'ਖੇਤੀਬਾੜੀ ਮਾਹਿਰ ਸਲਾਹ',
      subtabSpectrum: 'NPK ਮਿੱਟੀ ਸਿਹਤ ਸਪੈਕਟ੍ਰਮ',
      subtabRecords: 'ਪਿਛਲੇ ਸੀਜ਼ਨ ਦੇ ਰਿਕਾਰਡ',
      lblTargetCrop: '🎯 ਤੁਸੀਂ ਕਿਹੜੀ ਫਸਲ ਉਗਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ? (ਇੱਛਤ ਫਸਲ)',
      badgeTargetCropOpt: 'ਵਿਕਲਪਿਕ / AI ਜਾਂਚ',
      hintTargetCrop: 'ਜੇ ਤੁਹਾਡੇ ਮਨ ਵਿੱਚ ਕੋਈ ਖਾਸ ਫਸਲ ਹੈ ਤਾਂ ਚੁਣੋ। SPARC AI ਜਾਂਚੇਗਾ ਕਿ ਤੁਹਾਡੀ ਜ਼ਮੀਨ ਇਸਦੇ ਅਨੁਕੂਲ ਹੈ ਜਾਂ ਨਹੀਂ।',
      optAutoRecommend: '✨ ਸਭ ਤੋਂ ਵਧੀਆ AI ਸਿਫਾਰਸ਼ (Auto-Recommend)',
      targetViableTitle: '✅ ਖੇਤੀ ਲਈ ਢੁਕਵਾਂ: ਤੁਹਾਡੀ ਜ਼ਮੀਨ {crop} ਦੀ ਖੇਤੀ ਲਈ ਬਿਲਕੁਲ ਸਹੀ ਹੈ!',
      targetRiskyTitle: '⚠️ ਖੇਤੀ ਜੋਖਮ ਚੇਤਾਵਨੀ: ਇਸ ਖੇਤ ਵਿੱਚ {crop} ਦੀ ਕਾਸ਼ਤ ਵਿੱਚ ਵੱਡਾ ਜੋਖਮ ਹੈ',
      preferredHeader: '🌟 ਸਿਫਾਰਸ਼ ਕੀਤੀ ਬਿਹਤਰ ਫਸਲ (Recommended Preferred Crop):',
      preferredWhyLabel: '💡 ਇਹ ਫਸਲ ਕਿਉਂ ਬਿਹਤਰ ਹੈ:',
      rescueToggleLabel: '🛠️ ਜੇਕਰ ਤੁਸੀਂ ਫਿਰ ਵੀ {crop} ਲਗਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ: ਬਚਾਅ ਉਪਾਅ ਦੇਖੋ ▼',
      heroChoiceBadge: '⭐ #1 ਤੁਹਾਡੇ ਖੇਤ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਚੋਣ (Best Choice)',
      heroConfidenceChip: 'ਉੱਚ ਸ਼ੁੱਧਤਾ (High Confidence)',
      recVarietiesPrefix: 'ਸਿਫਾਰਸ਼ ਕੀਤੀਆਂ ਉੱਨਤ ਕਿਸਮਾਂ: ',
      gaugeMatch: 'ਮੇਲ ਪ੍ਰਤੀਸ਼ਤ',
      gaugeFit: 'ਖੇਤ ਲਈ ਬਿਲਕੁਲ ਢੁਕਵਾਂ',
      whyFitsTitle: 'ਇਹ ਫਸਲ ਤੁਹਾਡੀ ਜ਼ਮੀਨ ਲਈ ਕਿਉਂ ਸਹੀ ਹੈ:',
      lblYield: '🌾 ਅਨੁਮਾਨਿਤ ਝਾੜ',
      lblWater: '💧 ਪਾਣੀ ਦੀ ਲੋੜ',
      lblPrice: '₹ ਮੰਡੀ ਭਾਅ ਅੰਦਾਜ਼ਾ',
      lblDuration: '⏱️ ਪੱਕਣ ਦਾ ਸਮਾਂ',
      lblBasalDose: 'ਬਿਜਾਈ ਵੇਲੇ ਖਾਦ:',
      calendarLink: 'ਬਿਜਾਈ ਅਤੇ ਖਾਦ ਕੈਲੰਡਰ ਦੇਖੋ →',
      altTag1: 'ਬਦਲਵੀਂ ਫਸਲ #1',
      altTag2: 'ਬਦਲਵੀਂ ਫਸਲ #2',
      altMatchText: 'ਮੇਲ',
      altLblWater: '💧 ਪਾਣੀ ਦੀ ਲੋੜ:',
      altLblYield: '🌾 ਅਨੁਮਾਨਿਤ ਝਾੜ:',
      altLblRisk: '📈 ਮੰਡੀ ਜੋਖਮ:',
      altFertLink: 'ਖਾਦ ਪੈਕੇਜ >',
      pestDoctorTitle: '🩺 ਪੌਦਿਆਂ ਦੀਆਂ ਬਿਮਾਰੀਆਂ ਦਾ ਡਾਕਟਰ (Pest Doctor)',
      pestDoctorSub: 'ਜੈਵਿਕ ਕੰਟਰੋਲ, ਕੀਟਨਾਸ਼ਕ ਅਤੇ ਲਾਈਵ ਮੌਸਮ ਚੇਤਾਵਨੀਆਂ ਸਹਿਤ 68+ ਬਿਮਾਰੀਆਂ ਦਾ ਹੱਲ',
      symptomTapLabel: '👀 ਪੌਦੇ ਤੇ ਕੀ ਲੱਛਣ ਦਿਖ ਰਹੇ ਹਨ? (ਚੁਣੋ):',
      diagSymptoms: 'ਬਿਮਾਰੀ ਦੇ ਲੱਛਣ (Diagnostic Symptoms)',
      bioControl: 'ਜੈਵਿਕ ਅਤੇ ਕੁਦਰਤੀ ਕੰਟਰੋਲ (Biological Control)',
      chemControl: 'ਰਸਾਇਣਕ ਉਪਚਾਰ (Chemical Treatment)',
      noPathogensTitle: 'ਕੋਈ ਬਿਮਾਰੀ ਨਹੀਂ ਮਿਲੀ',
      noPathogensDesc: 'ਤੁਹਾਡੀ ਖੋਜ ਨਾਲ ਕੋਈ ਬਿਮਾਰੀ ਮੇਲ ਨਹੀਂ ਖਾਂਦੀ।',
      listenBtnText: '🔊 ਸੁਣੋ / Listen',
      shareBtnText: '📲 WhatsApp ਸ਼ੇਅਰ',
      fertPrescriptionTitle: 'ਖਾਦ ਨੁਸਖਾ ਅਤੇ ਵਪਾਰਕ ਖੁਰਾਕਾਂ',
      kisanBagTitle: '🎒 ਮੰਡੀ/ਦੁਕਾਨ ਤੋਂ ਖਰੀਦਣ ਲਈ ਕੁੱਲ ਖਾਦ ਦੀਆਂ ਬੋਰੀਆਂ',
      bagUreaLabel: 'ਯੂਰੀਆ ਬੋਰੀ (45 ਕਿਲੋ)',
      bagDapLabel: 'ਡੀਏਪੀ ਬੋਰੀ (50 ਕਿਲੋ)',
      bagMopLabel: 'ਐਮਓਪੀ (ਪੋਟਾਸ਼) ਬੋਰੀ (50 ਕਿਲੋ)',
      histTitle: '📜 ਖੋਜ ਅਤੇ ਗਣਨਾ ਇਤਿਹਾਸ',
      histSub: 'ਆਪਣੇ ਪਿਛਲੇ ਮਿੱਟੀ ਟੈਸਟ, ਸਿਫਾਰਸ਼ਾਂ ਅਤੇ ਖਾਦ ਦੀਆਂ ਖੁਰਾਕਾਂ ਵੇਖੋ ਅਤੇ ਮੁੜ ਪ੍ਰਾਪਤ ਕਰੋ',
      histFilterAll: 'ਸਾਰੇ',
      histFilterCrop: '🌾 ਫਸਲ ਸਲਾਹ',
      histFilterFert: '🧪 ਖਾਦ',
      histFilterDoctor: '🩺 ਕੀਟ ਡਾਕਟਰ',
      histClearBtn: '🗑️ ਸਾਰੇ ਹਟਾਓ',
      histRestoreBtn: '🔄 ਨਤੀਜੇ ਦੇਖੋ ਅਤੇ ਲੋਡ ਕਰੋ',
      histDeleteBtn: 'ਹਟਾਓ',
      histEmptyTitle: 'ਕੋਈ ਪੁਰਾਣਾ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ',
      histEmptyDesc: 'ਇਤਿਹਾਸ ਬਣਾਉਣ ਲਈ ਫਸਲ ਦੀ ਸਿਫਾਰਸ਼ ਚਲਾਓ, ਖਾਦ ਦੀ ਗਣਨਾ ਕਰੋ ਜਾਂ ਰੋਗ ਖੋਜੋ।'
    },
    gu: {
      navAdvisory: 'પાક સલાહ',
      navWeather: 'હવામાન ચેતવણી',
      navSoil: 'ખાતર માર્ગદર્શિકા',
      navDoctor: 'જીવાત-રોગ ડોક્ટર (Pest Doctor)',
      navMandi: 'જમીન આરોગ્ય રજિસ્ટ્રી',
      advisorBadge: 'ખરીફ 2025 કૃષિ સલાહ • ICAR-KVK માન્ય',
      advisorTitle: 'ખેડૂત પાક સલાહકાર <span class="hindi-sub">| જમીન અને હવામાન આધારિત માર્ગદર્શન</span>',
      advisorSubtitle: 'રીઅલ-ટાઇમ હવામાન અને N-P-K જમીન ચકાસણી પર આધારિત ચોક્કસ કૃષિ માર્ગદર્શન.',
      fieldDiagnosticsTitle: 'ખેતર અને જમીનની વિગતો',
      fieldDiagnosticsSubtitle: 'જમીન ચકાસણી અને હવામાન નિદાન',
      btnDefaults: 'મૂળ સ્થિતિ',
      btnRecommend: 'શ્રેષ્ઠ પાક ભલામણો મેળવો',
      btnRecommendSub: 'રાષ્ટ્રીય ટકાઉ કૃષિ મિશન (NMSA) ધોરણો મુજબ ભલામણ.',
      recCropsTitle: 'ભલામણ કરેલ પાકો (Recommended Crops)',
      recCropsSub: 'જમીન N-P-K ઘટકો અને ભેજના આધારે ક્રમ.',
      tabOverview: 'વિહંગાવલોકન',
      tabMatrix: 'કૃષિ મેટ્રિક્સ',
      helplineBannerTitle: 'સોઇલ હેલ્થ કાર્ડ અથવા વાવણી કેલેન્ડરમાં મદદ જોઈએ છે?',
      helplineBannerDesc: 'તમારી પોતાની ભાષામાં સરકારી કૃષિ નિષ્ણાત સાથે સીધી વાત કરો. મફત ટોલ-ફ્રી સેવા.',
      locateKvkBtn: 'નજીકનું KVK કેન્દ્ર શોધો',
      btnFertCalc: '🧪 ખાતર માત્રા ગણતરી કરો',
      searchPathologyBtn: 'રોગ નિદાન શોધો',
      diseaseFilterCrop: 'પાક અનુસાર પસંદ કરો:',
      subtabAdvisory: 'કૃષિ નિષ્ણાત સલાહ',
      subtabSpectrum: 'NPK જમીન આરોગ્ય સ્પેક્ટ્રમ',
      subtabRecords: 'પાછલી સિઝનના રેકોર્ડ્સ',
      lblTargetCrop: '🎯 તમે કયો પાક વાવવા માંગો છો? (ઇચ્છિત પાક)',
      badgeTargetCropOpt: 'વૈકલ્પિક / AI ચકાસણી',
      hintTargetCrop: 'જો તમારા મનમાં કોઈ ચોક્કસ પાક હોય તો તે પસંદ કરો. SPARC AI તપાસશે કે જમીન તેના માટે યોગ્ય છે કે નહીં.',
      optAutoRecommend: '✨ શ્રેષ્ઠ AI ભલામણ (Auto-Recommend)',
      targetViableTitle: '✅ ખેતી માટે યોગ્ય: આપની જમીન {crop} ની ખેતી માટે એકદમ અનુકૂળ છે!',
      targetRiskyTitle: '⚠️ પાક જોખમ ચેતવણી: આ ખેતરમાં {crop} ના વાવેતરમાં મોટો જોખમ રહેલો છે',
      preferredHeader: '🌟 ભલામણ કરેલ પસંદગીનો ઉત્તમ પાક (Preferred Choice):',
      preferredWhyLabel: '💡 આ પાક કેમ વધુ સારો વિકલ્પ છે:',
      rescueToggleLabel: '🛠️ જો આપ છતાં પણ {crop} વાવવા માંગો છો: બચાવ ઉપાયો જુઓ ▼',
      heroChoiceBadge: '⭐ #1 આપના ખેતર માટે શ્રેષ્ઠ પસંદગી (Best Choice)',
      heroConfidenceChip: 'ઉચ્ચ ચોકસાઈ (High Confidence)',
      recVarietiesPrefix: 'ભલામણ કરેલ સુધારેલી જાતો: ',
      gaugeMatch: 'મેળ ખાવાની ટકાવારી',
      gaugeFit: 'ખેતર માટે સંપૂર્ણ અનુકૂળ',
      whyFitsTitle: 'આ પાક તમારી જમીન માટે કેમ યોગ્ય છે:',
      lblYield: '🌾 અપેક્ષિત ઉત્પાદન',
      lblWater: '💧 પાણીની જરૂરિયાત',
      lblPrice: '₹ બજાર ભાવ અંદાજ',
      lblDuration: '⏱️ પાકનો સમયગાળો',
      lblBasalDose: 'વાવણી વખતે ખાતર:',
      calendarLink: 'વાવણી અને ખાતર કેલેન્ડર જુઓ →',
      altTag1: 'વૈકલ્પિક પાક #1',
      altTag2: 'વૈકલ્પિક પાક #2',
      altMatchText: 'મેચ',
      altLblWater: '💧 પાણીની જરૂરિયાત:',
      altLblYield: '🌾 અંદાજિત ઉત્પાદન:',
      altLblRisk: '📈 બજાર જોખમ:',
      altFertLink: 'ખાતર પેકેજ >',
      pestDoctorTitle: '🩺 જીવાત-રોગ ડોક્ટર (Pest Doctor)',
      pestDoctorSub: 'જૈવિક નિયંત્રણ અને ફૂગનાશક સહિત 68+ પાક રોગોનું નિદાન',
      symptomTapLabel: '👀 છોડ પર કયા લક્ષણો દેખાય છે? (પસંદ કરો):',
      diagSymptoms: 'રોગના લક્ષણો (Diagnostic Symptoms)',
      bioControl: 'જૈવિક અને કુદરતી નિયંત્રણ (Biological Control)',
      chemControl: 'રાસાયણિક દવા અને ઉપચાર (Chemical Treatment)',
      noPathogensTitle: 'કોઈ રોગ મળ્યો નથી',
      noPathogensDesc: 'આપના શોધ માપદંડ સાથે કોઈ રોગ મળ્યો નથી.',
      listenBtnText: '🔊 સાંભળો / Listen',
      shareBtnText: '📲 WhatsApp શેર',
      fertPrescriptionTitle: 'ખાતર પ્રિસ્ક્રિપ્શન અને વ્યાપારી માત્રા',
      kisanBagTitle: '🎒 મંડી/દુકાનમાંથી ખરીદવા માટેની કુલ ખાતરની ગુણીઓ (બેગ)',
      bagUreaLabel: 'યુરિયા ગુણી (૪૫ કિગ્રા)',
      bagDapLabel: 'ડીએપી ગુણી (૫૦ કિગ્રા)',
      bagMopLabel: 'એમઓપી (પોટાશ) ગુણી (૫૦ કિગ્રા)',
      histTitle: '📜 શોધ અને ગણતરી ઇતિહાસ',
      histSub: 'તમારા અગાઉના જમીન પરીક્ષણ, ભલામણો અને ખાતરના ડોઝ જુઓ અને પુનઃસ્થાપિત કરો',
      histFilterAll: 'બધા',
      histFilterCrop: '🌾 પાક માર્ગદર્શન',
      histFilterFert: '🧪 ખાતર માત્રા',
      histFilterDoctor: '🩺 જીવાત ડોક્ટર',
      histClearBtn: '🗑️ બધું કાઢી નાખો',
      histRestoreBtn: '🔄 પરિણામો જુઓ અને પુનઃસ્થાપિત કરો',
      histDeleteBtn: 'કાઢી નાખો',
      histEmptyTitle: 'કોઈ જૂનો રેકોર્ડ મળ્યો નથી',
      histEmptyDesc: 'ઇતિહાસ બનાવવા માટે પાકની ભલામણ મેળવો, ખાતરની ગણતરી કરો અથવા રોગ શોધો.'
    },
    te: {
      navAdvisory: 'పంట సలహా',
      navWeather: 'వాతావరణ హెచ్చరికలు',
      navSoil: 'ఎరువుల ప్రిస్క్రిప్షన్ (Fertilizer)',
      navDoctor: 'తెగుళ్ల డాక్టర్ (Pest Doctor)',
      navMandi: 'నేల ఆరోగ్య రిజిస్ట్రీ',
      advisorBadge: 'ఖరీఫ్ 2025 వ్యవసాయ చక్రం • ICAR-KVK ప్రామాణికం',
      advisorTitle: 'రైతు పంట సలహాదారు <span class="hindi-sub">| నేల & వాతావరణ మార్గదర్శి</span>',
      advisorSubtitle: 'నిజ-సమయ వాతావరణం మరియు N-P-K నేల పరీక్ష ఫలితాల ఆధారంగా శాస్త్రీయ మార్గదర్శకత్వం.',
      fieldDiagnosticsTitle: 'పొలం మరియు నేల సమాచారం',
      fieldDiagnosticsSubtitle: 'భూమి పరీక్ష & వాతావరణ విశ్లేషణ',
      btnDefaults: 'డిఫాల్ట్',
      btnRecommend: 'ఉత్తమ పంట సిఫార్సులను పొందండి',
      btnRecommendSub: 'జాతీయ స్థిరమైన వ్యవసాయ మిషన్ (NMSA) ప్రమాణాల ప్రకారం.',
      recCropsTitle: 'సిఫార్సు చేయబడిన పంటలు (Recommended Crops)',
      recCropsSub: 'నేల N-P-K పోషకాలు & తేమ సూచికల ఆధారంగా ర్యాంకింగ్.',
      tabOverview: 'సమీక్ష',
      tabMatrix: 'వ్యవసాయ మాత్రిక',
      helplineBannerTitle: 'మట్టి కార్డు లేదా విత్తన క్యాలెండర్‌లో సహాయం కావాలా?',
      helplineBannerDesc: 'మీ మాతృభాషలో ప్రభుత్వ వ్యవసాయ నిపుణులతో నేరుగా మాట్లాడండి. ఉచిత టోల్-ఫ్రీ సేవ.',
      locateKvkBtn: 'సమీప KVK కేంద్రాన్ని కనుగొనండి',
      btnFertCalc: '🧪 ఎరువుల లెక్కించండి',
      searchPathologyBtn: 'వ్యాధి నివారణ శోధించండి',
      diseaseFilterCrop: 'పంట ప్రకారం ఎంచుకోండి:',
      subtabAdvisory: 'వ్యవసాయ నిపుణుల సలహా',
      subtabSpectrum: 'NPK నేల ఆరోగ్య స్పెక్ట్రమ్',
      subtabRecords: 'గత సీజన్ రికార్డులు',
      lblTargetCrop: '🎯 మీరు ఏ పంట సాగు చేయాలనుకుంటున్నారు? (ఇష్టపడే పంట)',
      badgeTargetCropOpt: 'ఐచ్ఛికం / AI తనిఖీ',
      hintTargetCrop: 'మీ మనస్సులో ఏదైనా నిర్దిష్ట పంట ఉంటే ఎంచుకోండి. SPARC AI మీ భూమి సరిపోతుందో లేదో తనిఖీ చేస్తుంది.',
      optAutoRecommend: '✨ ఉత్తమ AI సిఫార్సు (Auto-Recommend)',
      targetViableTitle: '✅ సాగుకు అనుకూలం: మీ భూమి {crop} సాగుకు సంపూర్ణంగా అనుకూలంగా ఉంది!',
      targetRiskyTitle: '⚠️ పంట ప్రమాద హెచ్చరిక: ఈ పొలంలో {crop} సాగు చేయడం చాలా ప్రమాదకరం',
      preferredHeader: '🌟 సిఫార్సు చేయబడిన ఉత్తమ ప్రత్యామ్నాయ పంట (Preferred Choice):',
      preferredWhyLabel: '💡 ఈ పంట ఎందుకు మంచి ఎంపిక:',
      rescueToggleLabel: '🛠️ మీరు ఇప్పటికీ {crop} సాగు చేయాలనుకుంటే: రక్షణ చర్యలను చూడండి ▼',
      heroChoiceBadge: '⭐ #1 మీ పొలానికి ఉత్తమ ఎంపిక (Best Choice)',
      heroConfidenceChip: 'అధిక ఖచ్చితత్వం (High Confidence)',
      recVarietiesPrefix: 'సిఫార్సు చేసిన రకాలు: ',
      gaugeMatch: 'సరిపోలిక శాతం',
      gaugeFit: 'పొలానికి అత్యంత అనుకూలం',
      whyFitsTitle: 'ఈ పంట మీ నేలకు ఎందుకు సరిపోతుంది:',
      lblYield: '🌾 ఆశించిన దిగుబడి',
      lblWater: '💧 నీటి అవసరం',
      lblPrice: '₹ మార్కెట్ ధర అంచనా',
      lblDuration: '⏱️ పంట కాలం',
      lblBasalDose: 'విత్తే సమయంలో ఎరువులు:',
      calendarLink: 'విత్తన & ఎరువుల క్యాలెండర్ చూడండి →',
      altTag1: 'ప్రత్యామ్నాయ పంట #1',
      altTag2: 'ప్రత్యామ్నాయ పంట #2',
      altMatchText: 'మ్యాచ్',
      altLblWater: '💧 నీటి అవసరం:',
      altLblYield: '🌾 అంచనా దిగుబడి:',
      altLblRisk: '📈 మార్కెట్ రిస్క్:',
      altFertLink: 'ఎరువుల ప్యాకేజీ >',
      pestDoctorTitle: '🩺 తెగుళ్ల & పంట వ్యాధుల డాక్టర్ (Pest Doctor)',
      pestDoctorSub: 'జీవ నియంత్రణ మరియు శిలీంద్రనాశకాలతో 68+ పంట వ్యాధుల నివారణ',
      symptomTapLabel: '👀 మొక్కపై ఏ లక్షణాలు కనిపిస్తున్నాయి? (ఎంచుకోండి):',
      diagSymptoms: 'వ్యాధి లక్షణాలు (Diagnostic Symptoms)',
      bioControl: 'జీవ మరియు సేంద్రీయ నియంత్రణ (Biological Control)',
      chemControl: 'రసాయన మందులు & నివారణ (Chemical Treatment)',
      noPathogensTitle: 'ఎలాంటి వ్యాధి కనుగొనబడలేదు',
      noPathogensDesc: 'మీ శోధన ప్రమాణాలకు సరిపోలే వ్యాధులు ఏవీ లేవు.',
      listenBtnText: '🔊 వినండి / Listen',
      shareBtnText: '📲 WhatsApp షేర్'
    },
    ta: {
      navAdvisory: 'பயிர் ஆலோசனை',
      navWeather: 'வானிலை எச்சரிக்கை',
      navSoil: 'உர பரிந்துரை (Fertilizer)',
      navDoctor: 'பூச்சி & நோய் மருத்துவர் (Pest Doctor)',
      navMandi: 'மண் வளப் பதிவேடு',
      advisorBadge: 'கரீப் 2025 வேளாண் வழிகாட்டுதல் • ICAR-KVK அங்கீகாரம்',
      advisorTitle: 'விவசாயி பயிர் ஆலோசகர் <span class="hindi-sub">| மண் & வானிலை நுண்ணறிவு</span>',
      advisorSubtitle: 'மண் N-P-K சத்துக்கள் மற்றும் நேரலை வானிலை அடிப்படையிலான விவசாய வழிகாட்டுதல்.',
      fieldDiagnosticsTitle: 'வயல் மற்றும் மண் தகவல்',
      fieldDiagnosticsSubtitle: 'மண் பரிசோதனை & காலநிலை பகுப்பாய்வு',
      btnDefaults: 'இயல்புநிலை',
      btnRecommend: 'சிறந்த பயிர் பரிந்துரைகளைப் பெறுங்கள்',
      btnRecommendSub: 'தேசிய நிலையான விவசாய இயக்கத்தின் (NMSA) வழிகாட்டுதல்படி.',
      recCropsTitle: 'பரிந்துரைக்கப்பட்ட பயிர்கள் (Recommended Crops)',
      recCropsSub: 'மண் N-P-K பொருத்தம் மற்றும் ஈரப்பதம் அடிப்படையில் தரவரிசை.',
      tabOverview: 'கண்ணோட்டம்',
      tabMatrix: 'விவசாய மேட்ரிக்ஸ்',
      helplineBannerTitle: 'மண் அட்டை அல்லது விதைப்பு காலண்டரில் உதவி தேவையா?',
      helplineBannerDesc: 'உங்கள் தாய்மொழியில் அரசு வேளாண் வல்லுநர்களுடன் நேரடியாகப் பேசுங்கள். இலவச சேவை.',
      locateKvkBtn: 'அருகிலுள்ள KVK மையம் கண்டறியவும்',
      btnFertCalc: '🧪 உர அளவைக் கணக்கிடுங்கள்',
      searchPathologyBtn: 'நோய் தீர்வு தேடுங்கள்',
      diseaseFilterCrop: 'பயிர் வாரியாக தேர்ந்தெடுக்கவும்:',
      subtabAdvisory: 'வேளாண் நிபுணர் ஆலோசனை',
      subtabSpectrum: 'NPK மண் ஆரோக்கிய ஸ்பெக்ட்ரம்',
      subtabRecords: 'கடந்த பருவ பதிவுகள்',
      lblTargetCrop: '🎯 நீங்கள் பயிரிட விரும்பும் பயிர் எது? (விருப்பப் பயிர்)',
      badgeTargetCropOpt: 'விருப்பமானது / AI சரிபார்ப்பு',
      hintTargetCrop: 'உங்கள் மனதில் குறிப்பிட்ட பயிர் இருந்தால் தேர்ந்தெடுக்கவும். உங்கள் நிலத்திற்கு உகந்ததா என SPARC AI சரிபார்க்கும்.',
      optAutoRecommend: '✨ சிறந்த AI பரிந்துரை (Auto-Recommend)',
      targetViableTitle: '✅ பயிரிட உகந்தது: உங்கள் நிலம் {crop} சாகுபடிக்கு மிகவும் பொருத்தமானது!',
      targetRiskyTitle: '⚠️ பயிர் ஆபத்து எச்சரிக்கை: இந்த நிலத்தில் {crop} பயிரிடுவதில் அதிக ஆபத்து உள்ளது',
      preferredHeader: '🌟 பரிந்துரைக்கப்படும் சிறந்த மாற்றுப் பயிர் (Preferred Choice):',
      preferredWhyLabel: '💡 இந்த பயிர் ஏன் சிறந்த தேர்வு:',
      rescueToggleLabel: '🛠️ நீங்கள் இன்னும் {crop} பயிரிட விரும்பினால்: மீட்பு வழிமுறைகளைக் காண்க ▼',
      heroChoiceBadge: '⭐ #1 உங்கள் நிலத்திற்கு சிறந்த தேர்வு (Best Choice)',
      heroConfidenceChip: 'அதிக துல்லியம் (High Confidence)',
      recVarietiesPrefix: 'பரிந்துரைக்கப்பட்ட ரகங்கள்: ',
      gaugeMatch: 'பொருத்தம் சதவீதம்',
      gaugeFit: 'வயலுக்கு மிகவும் உகந்தது',
      whyFitsTitle: 'இந்த பயிர் உங்கள் நிலத்திற்கு ஏன் ஏற்றது:',
      lblYield: '🌾 எதிர்பார்க்கப்படும் மகசூல்',
      lblWater: '💧 நீர் தேவை',
      lblPrice: '₹ சந்தை விலை எதிர்பார்ப்பு',
      lblDuration: '⏱️ பயிர் காலம்',
      lblBasalDose: 'விதைப்பு உர அளவு:',
      calendarLink: 'விதைப்பு மற்றும் உர காலண்டர் பார்க்க →',
      altTag1: 'மாற்றுப் பயிர் #1',
      altTag2: 'மாற்றுப் பயிர் #2',
      altMatchText: 'பொருத்தம்',
      altLblWater: '💧 நீர் தேவை:',
      altLblYield: '🌾 எதிர்பார்க்கப்படும் மகசூல்:',
      altLblRisk: '📈 சந்தை ஆபத்து:',
      altFertLink: 'உரத் திட்டம் >',
      pestDoctorTitle: '🩺 பயிர் நோய் மருத்துவர் (Pest Doctor)',
      pestDoctorSub: 'உயிரியல் கட்டுப்பாடு மற்றும் பூஞ்சாணக்கொல்லிகளுடன் 68+ பயிர் நோய்கள் தீர்வு',
      symptomTapLabel: '👀 பயிரில் என்ன அறிகுறிகள் தெரிகின்றன? (தேர்ந்தெடுக்கவும்):',
      diagSymptoms: 'நோய் அறிகுறிகள் (Diagnostic Symptoms)',
      bioControl: 'உயிரியல் & இயற்கை கட்டுப்பாடு (Biological Control)',
      chemControl: 'ரசாயன பூஞ்சாணக்கொல்லி & சிகிச்சை',
      noPathogensTitle: 'எந்த நோயும் கண்டறியப்படவில்லை',
      noPathogensDesc: 'உங்கள் தேடலுக்குரிய நோய்கள் எதுவும் கண்டறியப்படவில்லை.',
      listenBtnText: '🔊 கேளுங்கள் / Listen',
      shareBtnText: '📲 WhatsApp பகிர்',
      fertPrescriptionTitle: 'உர பரிந்துரை & வணிக அளவுகள்',
      kisanBagTitle: '🎒 கடையில் வாங்க வேண்டிய மொத்த உர மூட்டைகள்',
      bagUreaLabel: 'யூரியா மூட்டை (45 கிகி)',
      bagDapLabel: 'டிஏபி மூட்டை (50 கிகி)',
      bagMopLabel: 'எம்ஓபி (பொட்டாஷ்) மூட்டை (50 கிகி)',
      histTitle: '📜 தேடல் & கணக்கீடு வரலாறு',
      histSub: 'உங்கள் முந்தைய மண் பரிசோதனைகள், பரிந்துரைகள் மற்றும் உர அளவுகளை மீட்டெடுக்கவும்',
      histFilterAll: 'அனைத்தும்',
      histFilterCrop: '🌾 பயிர் ஆலோசனை',
      histFilterFert: '🧪 உரம்',
      histFilterDoctor: '🩺 பூச்சி மருத்துவர்',
      histClearBtn: '🗑️ அனைத்தையும் அழி',
      histRestoreBtn: '🔄 முடிவுகளைப் பார்த்து மீட்டமைக்கவும்',
      histDeleteBtn: 'நீக்கு',
      histEmptyTitle: 'பதிவுகள் எதுவும் கிடைக்கவில்லை',
      histEmptyDesc: 'வரலாற்றை உருவாக்க பயிர் பரிந்துரையை இயக்கவும் அல்லது உர அளவை கணக்கிடவும்.'
    },
    bn: {
      navAdvisory: 'ফসল পরামর্শ',
      navWeather: 'আবহাওয়া সতর্কতা',
      navSoil: 'সার নির্দেশিকা (Fertilizer)',
      navDoctor: 'কীটপতঙ্গ ও রোগ ডাক্তার (Pest Doctor)',
      navMandi: 'মাটি স্বাস্থ্য রেজিস্ট্রি',
      advisorBadge: 'খরিফ ২০২৫ কৃষি চক্র • ICAR-KVK অনুমোদিত',
      advisorTitle: 'কৃষক ফসল উপদেষ্টা <span class="hindi-sub">| মৃত্তিকা ও আবহাওয়া বিশ্লেষণ</span>',
      advisorSubtitle: 'রিয়েল-টাইম আবহাওয়া এবং N-P-K মাটির পুষ্টি উপাদানের উপর ভিত্তি করে নিখুঁত কৃষি পরামর্শ।',
      fieldDiagnosticsTitle: 'জমি ও মাটির বিবরণ',
      fieldDiagnosticsSubtitle: 'মাটি পরীক্ষা ও আবহাওয়া নির্ণয়',
      btnDefaults: 'মূল অবস্থা',
      btnRecommend: 'সেরা ফসলের সুপারিশ পান',
      btnRecommendSub: 'জাতীয় টেকসই কৃষি মিশন (NMSA) মান অনুযায়ী প্রস্তাবিত।',
      recCropsTitle: 'সুপারিশকৃত ফসল (Recommended Crops)',
      recCropsSub: 'মাটির N-P-K উপাদান ও আদ্রতার ভিত্তিতে ক্রমবিন্যাস।',
      tabOverview: 'সারসংক্ষেপ',
      tabMatrix: 'কৃষি মেট্রিক্স',
      helplineBannerTitle: 'মাটি স্বাস্থ্য কার্ড বা বপন ক্যালেন্ডার বুঝতে সাহায্য চান?',
      helplineBannerDesc: 'আপনার মাতৃভাষায় সরকারি কৃষি বিশেষজ্ঞদের সাথে সরাসরি কথা বলুন। সম্পূর্ণ বিনামূল্যে।',
      locateKvkBtn: 'নিকটতম KVK কেন্দ্র খুঁজুন',
      btnFertCalc: '🧪 সারের পরিমাণ গণনা করুন',
      searchPathologyBtn: 'রোগের প্রতিকার খুঁজুন',
      diseaseFilterCrop: 'ফসল অনুযায়ী বেছে নিন:',
      subtabAdvisory: 'কৃষি বিশেষজ্ঞ পরামর্শ',
      subtabSpectrum: 'NPK মাটি স্বাস্থ্য বর্ণালী',
      subtabRecords: 'গত মরশুমের রেকর্ড',
      lblTargetCrop: '🎯 আপনি কোন ফসল চাষ করতে চান? (কাঙ্ক্ষিত ফসল)',
      badgeTargetCropOpt: 'ঐচ্ছিক / AI যাচাই',
      hintTargetCrop: 'আপনার কোনো নির্দিষ্ট ফসলের পরিকল্পনা থাকলে বেছে নিন। SPARC AI পরীক্ষা করে সঠিক বিকল্প জানাবে।',
      optAutoRecommend: '✨ সেরা AI সুপারিশ (Auto-Recommend)',
      targetViableTitle: '✅ চাষের জন্য উপযোগী: আপনার জমি {crop} চাষের জন্য সম্পূর্ণ অনুকূল!',
      targetRiskyTitle: '⚠️ ফসল ঝুঁকি সতর্কতা: এই জমিতে {crop} চাষে ব্যর্থতার ঝুঁকি রয়েছে',
      preferredHeader: '🌟 সুপারিশকৃত বিকল্প উত্তম ফসল (Preferred Choice):',
      preferredWhyLabel: '💡 এই ফসলটি কেন বেশি লাভজনক:',
      rescueToggleLabel: '🛠️ তবুও যদি {crop} চাষ করতে চান: জমি শোধন ও সুরক্ষা ব্যবস্থা দেখুন ▼',
      heroChoiceBadge: '⭐ #১ আপনার জমির জন্য সেরা পছন্দ (Best Choice)',
      heroConfidenceChip: 'উচ্চ নির্ভুলতা (High Confidence)',
      recVarietiesPrefix: 'প্রস্তাবিত উন্নত জাত: ',
      gaugeMatch: 'উপযোগিতা শতাংশ',
      gaugeFit: 'জমির জন্য সম্পূর্ণ মানানসই',
      whyFitsTitle: 'এই ফসলটি আপনার জমির জন্য কেন উপযুক্ত:',
      lblYield: '🌾 প্রত্যাশিত ফলন',
      lblWater: '💧 জলের প্রয়োজনীয়তা',
      lblPrice: '₹ বাজার দর পূর্বাভাস',
      lblDuration: '⏱️ ফসলের সময়কাল',
      lblBasalDose: 'বপনকালীন সার প্রয়োগ:',
      calendarLink: 'বপন ও সার প্রয়োগ ক্যালেন্ডার দেখুন →',
      altTag1: 'বিকল্প ফসল #১',
      altTag2: 'বিকল্প ফসল #২',
      altMatchText: 'ম্যাচ',
      altLblWater: '💧 জলের প্রয়োজন:',
      altLblYield: '🌾 সম্ভাব্য ফলন:',
      altLblRisk: '📈 বাজার ঝুঁকি:',
      altFertLink: 'সার প্যাকেজ >',
      pestDoctorTitle: '🩺 উদ্ভিদ রোগ ও পোকা ডাক্তার (Pest Doctor)',
      pestDoctorSub: 'জৈব নিয়ন্ত্রণ এবং ছত্রাকনাশক সহ ৬৮+ ফসলের রোগ নির্ণয়',
      symptomTapLabel: '👀 গাছে কী লক্ষণ দেখা যাচ্ছে? (বেছে নিন):',
      diagSymptoms: 'রোগের লক্ষণ (Diagnostic Symptoms)',
      bioControl: 'জৈব ও প্রাকৃতিক নিয়ন্ত্রণ (Biological Control)',
      chemControl: 'রাসায়নিক ছত্রাকনাশক ও প্রতিকার',
      noPathogensTitle: 'কোনো রোগ পাওয়া যায়নি',
      noPathogensDesc: 'আপনার অনুসন্ধানের সাথে মেলে এমন কোনো রোগ মেলেনি।',
      listenBtnText: '🔊 শুনুন / Listen',
      shareBtnText: '📲 WhatsApp শেয়ার',
      fertPrescriptionTitle: 'সার নির্ধারণ ও বাণিজ্যিক মাত্রা',
      kisanBagTitle: '🎒 বাজার থেকে কেনার জন্য মোট সারের বস্তা',
      bagUreaLabel: 'ইউরিয়া বস্তা (৪৫ কেজি)',
      bagDapLabel: 'ডিএপি বস্তা (৫০ কেজি)',
      bagMopLabel: 'এমওপি (পটাশ) বস্তা (৫০ কেজি)',
      histTitle: '📜 অনুসন্ধান ও গণনার ইতিহাস',
      histSub: 'আপনার পূর্ববর্তী মাটি পরীক্ষা, সুপারিশ এবং সারের মাত্রা পুনরুদ্ধার করুন',
      histFilterAll: 'সব',
      histFilterCrop: '🌾 ফসল পরামর্শ',
      histFilterFert: '🧪 সার',
      histFilterDoctor: '🩺 পোকা ডাক্তার',
      histClearBtn: '🗑️ সব মুছুন',
      histRestoreBtn: '🔄 ফলাফল দেখুন ও পুনরুদ্ধার করুন',
      histDeleteBtn: 'মুছুন',
      histEmptyTitle: 'কোনো অনুসন্ধানের রেকর্ড পাওয়া যায়নি',
      histEmptyDesc: 'ফার্ম ইতিহাস তৈরি করতে ফসলের সুপারিশ চালান বা সার গণনা করুন।'
    },
    kn: {
      navAdvisory: 'ಬೆಳೆ ಸಲಹೆ',
      navWeather: 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
      navSoil: 'ಗೊಬ್ಬರ ಶಿಫಾರಸು (Fertilizer)',
      navDoctor: 'ಕೀಟ & ರೋಗ ಡಾಕ್ಟರ್ (Pest Doctor)',
      navMandi: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ನೋಂದಣಿ',
      advisorBadge: 'ಖಾರೀಫ್ 2025 ಕೃಷಿ ಸಲಹೆ • ICAR-KVK ಪ್ರಮಾಣೀಕೃತ',
      advisorTitle: 'ರೈತ ಬೆಳೆ ಸಲಹೆಗಾರ <span class="hindi-sub">| ಮಣ್ಣು & ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ</span>',
      advisorSubtitle: 'ನಿಜಾವಧಿಯ ಹವಾಮಾನ ಮತ್ತು N-P-K ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಯ ಆಧಾರದ ಮೇಲೆ ನಿಖರವಾದ ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ.',
      fieldDiagnosticsTitle: 'ಹೊಲ ಮತ್ತು ಮಣ್ಣಿನ ಮಾಹಿತಿ',
      fieldDiagnosticsSubtitle: 'ಮಣ್ಣು ಪರೀಕ್ಷೆ & ಹವಾಮಾನ ವಿಶ್ಲೇಷಣೆ',
      btnDefaults: 'ಮೂಲ ಸ್ಥಿತಿ',
      btnRecommend: 'ಉತ್ತಮ ಬೆಳೆ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ',
      btnRecommendSub: 'ರಾಷ್ಟ್ರೀಯ ಸುಸ್ಥಿರ ಕೃಷಿ ಅಭಿಯಾನದ (NMSA) ಮಾನದಂಡಗಳ ಪ್ರಕಾರ.',
      recCropsTitle: 'ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು (Recommended Crops)',
      recCropsSub: 'ಮಣ್ಣಿನ N-P-K ಪೋಷಕಾಂಶಗಳು ಮತ್ತು ತೇವಾಂಶದ ಆಧಾರದ ಮೇಲೆ ಶ್ರೇಯಾಂಕ.',
      tabOverview: 'ಅವಲೋಕನ',
      tabMatrix: 'ಕೃಷಿ ಮ್ಯಾಟ್ರಿಕ್ಸ್',
      helplineBannerTitle: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಅಥವಾ ಬಿತ್ತನೆ ಕ್ಯಾಲೆಂಡರ್‌ನಲ್ಲಿ ಸಹಾಯ ಬೇಕೇ?',
      helplineBannerDesc: 'ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಸರ್ಕಾರಿ ಕೃಷಿ ತಜ್ಞರೊಂದಿಗೆ ನೇರವಾಗಿ ಮಾತನಾಡಿ. ಉಚಿತ ಟೋಲ್-ಫ್ರೀ ಸೇವೆ.',
      locateKvkBtn: 'ಹತ್ತಿರದ KVK ಕೇಂದ್ರ ಹುಡುಕಿ',
      btnFertCalc: '🧪 ಗೊಬ್ಬರದ ಪ್ರಮಾಣ ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ',
      searchPathologyBtn: 'ರೋಗ ಪರಿಹಾರ ಹುಡುಕಿ',
      diseaseFilterCrop: 'ಬೆಳೆ ಪ್ರಕಾರ ಆಯ್ಕೆಮಾಡಿ:',
      subtabAdvisory: 'ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆ',
      subtabSpectrum: 'NPK ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಸ್ಪೆಕ್ಟ್ರಮ್',
      subtabRecords: 'ಹಿಂದಿನ ಋತುವಿನ ದಾಖಲೆಗಳು',
      lblTargetCrop: '🎯 ನೀವು ಯಾವ ಬೆಳೆ ಬೆಳೆಯಲು ಬಯಸುತ್ತೀರಿ? (ಉದ್ದೇಶಿತ ಬೆಳೆ)',
      badgeTargetCropOpt: 'ಐಚ್ಛಿಕ / AI ತಪಾಸಣೆ',
      hintTargetCrop: 'ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ನಿರ್ದಿಷ್ಟ ಬೆಳೆಯ ಯೋಜನೆ ಇದ್ದರೆ ಆಯ್ಕೆಮಾಡಿ. SPARC AI ನಿಮ್ಮ ಮಣ್ಣು ಸೂಕ್ತವೇ ಎಂದು ಪರೀಕ್ಷಿಸುತ್ತದೆ.',
      optAutoRecommend: '✨ ಅತ್ಯುತ್ತಮ AI ಶಿಫಾರಸು (Auto-Recommend)',
      targetViableTitle: '✅ ಕೃಷಿಗೆ ಸೂಕ್ತ: ನಿಮ್ಮ ಭೂಮಿಯು {crop} ಬೆಳೆಯಲು ಸಂಪೂರ್ಣವಾಗಿ ಅನುಕೂಲಕರವಾಗಿದೆ!',
      targetRiskyTitle: '⚠️ ಬೆಳೆ ಅಪಾಯದ ಎಚ್ಚರಿಕೆ: ಈ ಹೊಲದಲ್ಲಿ {crop} ಬೆಳೆಯುವುದರಿಂದ ನಷ್ಟದ ಅಪಾಯವಿದೆ',
      preferredHeader: '🌟 ಶಿಫಾರಸು ಮಾಡಿದ ಪರ್ಯಾಯ ಉತ್ತಮ ಬೆಳೆ (Preferred Choice):',
      preferredWhyLabel: '💡 ಈ ಬೆಳೆ ಏಕೆ ಉತ್ತಮ ಆಯ್ಕೆ:',
      rescueToggleLabel: '🛠️ ನೀವು ಇನ್ನೂ {crop} ಬೆಳೆಯಲು ಬಯಸಿದರೆ: ರಕ್ಷಣಾ ಕ್ರಮಗಳನ್ನು ನೋಡಿ ▼',
      heroChoiceBadge: '⭐ #1 ನಿಮ್ಮ ಜಮೀನಿಗೆ ಅತ್ಯುತ್ತಮ ಆಯ್ಕೆ (Best Choice)',
      heroConfidenceChip: 'ಹೆಚ್ಚಿನ ನಿಖರತೆ (High Confidence)',
      recVarietiesPrefix: 'ಶಿಫಾರಸು ಮಾಡಿದ ಸುಧಾರಿತ ತಳಿಗಳು: ',
      gaugeMatch: 'ಹೊಂದಾಣಿಕೆ ಶೇಕಡಾವಾರು',
      gaugeFit: 'ಹೊಲಕ್ಕೆ ಅತ್ಯಂತ ಸೂಕ್ತ',
      whyFitsTitle: 'ಈ ಬೆಳೆ ನಿಮ್ಮ ಜಮೀನಿಗೆ ಏಕೆ ಸೂಕ್ತವಾಗಿದೆ:',
      lblYield: '🌾 ನಿರೀಕ್ಷಿತ ಇಳುವರಿ',
      lblWater: '💧 ನೀರಿನ ಅವಶ್ಯಕತೆ',
      lblPrice: '₹ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಅಂದಾಜು',
      lblDuration: '⏱️ ಬೆಳೆಯ ಅವಧಿ',
      lblBasalDose: 'ಬಿತ್ತನೆ ಕಾಲದ ರಸಗೊಬ್ಬರ:',
      calendarLink: 'ಬಿತ್ತನೆ ಮತ್ತು ರಸಗೊಬ್ಬರ ಕ್ಯಾಲೆಂಡರ್ ನೋಡಿ →',
      altTag1: 'ಪರ್ಯಾಯ ಬೆಳೆ #1',
      altTag2: 'ಪರ್ಯಾಯ ಬೆಳೆ #2',
      altMatchText: 'ಹೊಂದಾಣಿಕೆ',
      altLblWater: '💧 ನೀರಿನ ಅವಶ್ಯಕತೆ:',
      altLblYield: '🌾 ಅಂದಾಜು ಇಳುವರಿ:',
      altLblRisk: '📈 ಮಾರುಕಟ್ಟೆ ಅಪಾಯ:',
      altFertLink: 'ಗೊಬ್ಬರ ಯೋಜನೆ >',
      pestDoctorTitle: '🩺 ಸಸ್ಯ ರೋಗ & ಕೀಟ ಡಾಕ್ಟರ್ (Pest Doctor)',
      pestDoctorSub: 'ಜೈವಿಕ ನಿಯಂತ್ರಣ ಮತ್ತು ಶಿಲೀಂಧ್ರನಾಶಕಗಳೊಂದಿಗೆ 68+ ಬೆಳೆ ರೋಗಗಳ ನಿವಾರಣೆ',
      symptomTapLabel: '👀 ಸಸ್ಯದ ಮೇಲೆ ಯಾವ ಲಕ್ಷಣಗಳು ಕಾಣಿಸುತ್ತಿವೆ? (ಆಯ್ಕೆಮಾಡಿ):',
      diagSymptoms: 'ರೋಗದ ಲಕ್ಷಣಗಳು (Diagnostic Symptoms)',
      bioControl: 'ಜೈವಿಕ & ನೈಸರ್ಗಿಕ ನಿಯಂತ್ರಣ (Biological Control)',
      chemControl: 'ರಾಸಾಯನಿಕ ಶಿಲೀಂಧ್ರನಾಶಕ & ಚಿಕಿತ್ಸೆ',
      noPathogensTitle: 'ಯಾವುದೇ ರೋಗ ಕಂಡುಬಂದಿಲ್ಲ',
      noPathogensDesc: 'ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ರೋಗಗಳು ಹೊಂದಿಕೆಯಾಗಿಲ್ಲ.',
      listenBtnText: '🔊 ಆಲಿಸಿ / Listen',
      shareBtnText: '📲 WhatsApp ಹಂಚಿಕೊಳ್ಳಿ',
      fertPrescriptionTitle: 'ಗೊಬ್ಬರ ಶಿಫಾರಸು ಮತ್ತು ವಾಣಿಜ್ಯ ಪ್ರಮಾಣ',
      kisanBagTitle: '🎒 ಅಂಗಡಿಯಿಂದ ಖರೀದಿಸಬೇಕಾದ ಒಟ್ಟು ರಸಗೊಬ್ಬರ ಚೀಲಗಳು',
      bagUreaLabel: 'ಯೂರಿಯಾ ಚೀಲ (45 ಕೆಜಿ)',
      bagDapLabel: 'ಡಿಎಪಿ ಚೀಲ (50 ಕೆಜಿ)',
      bagMopLabel: 'ಎಂಒಪಿ (ಪೊಟ್ಯಾಶ್) ಚೀಲ (50 ಕೆಜಿ)',
      histTitle: '📜 ಹುಡುಕಾಟ ಮತ್ತು ಲೆಕ್ಕಾಚಾರದ ಇತಿಹಾಸ',
      histSub: 'ನಿಮ್ಮ ಹಿಂದಿನ ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಗಳು, ಶಿಫಾರಸುಗಳು ಮತ್ತು ಗೊಬ್ಬರದ ಪ್ರಮಾಣವನ್ನು ಮರುಪಡೆಯಿರಿ',
      histFilterAll: 'ಎಲ್ಲಾ',
      histFilterCrop: '🌾 ಬೆಳೆ ಸಲಹೆ',
      histFilterFert: '🧪 ರಸಗೊಬ್ಬರ',
      histFilterDoctor: '🩺 ಕೀಟ ಡಾಕ್ಟರ್',
      histClearBtn: '🗑️ ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ',
      histRestoreBtn: '🔄 ಫಲಿತಾಂಶಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ಮರುಪಡೆಯಿರಿ',
      histDeleteBtn: 'ಅಳಿಸಿ',
      histEmptyTitle: 'ಯಾವುದೇ ಹಳೆಯ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
      histEmptyDesc: 'ಇತಿಹಾಸವನ್ನು ನಿರ್ಮಿಸಲು ಬೆಳೆ ಶಿಫಾರಸು ಚಲಾಯಿಸಿ ಅಥವಾ ರಸಗೊಬ್ಬರವನ್ನು ಲೆಕ್ಕಹಾಕಿ.'
    }
  };

  const AGRONOMIC_METADATA = {
    rice: {
      fullName: {
        en: 'Paddy / Rice (Indica Wet)',
        hi: 'धान / Paddy (Indica Wet)',
        mr: 'भात / धान (Indica Wet)'
      },
      seasonBadge: {
        en: 'Kharif Prime',
        hi: 'प्रमुख खरीफ फसल',
        mr: 'प्रमुख खरीप पीक'
      },
      varieties: {
        en: 'MTU-1010, Indrayani, or PKV-HMT',
        hi: 'MTU-1010, इंद्रायणी, या PKV-HMT',
        mr: 'MTU-1010, इंद्रायणी, किंवा PKV-HMT'
      },
      yield: {
        en: '44 – 48 Q/Ha',
        hi: '44 – 48 क्विंटल/हेक्टेयर',
        mr: '४४ – ४८ क्विंटल/हे.'
      },
      yieldSub: {
        en: 'Top Tier Harvest',
        hi: 'उच्च श्रेणी उत्पादन',
        mr: 'भरघोस पीक उत्पादन'
      },
      water: {
        en: 'High',
        hi: 'अधिक (High)',
        mr: 'जास्त (High)'
      },
      waterSub: {
        en: 'Canal / Submerged',
        hi: 'नहर / जलमग्न सिंचाई',
        mr: 'कालवा / पाणी साचलेली शेती'
      },
      price: {
        en: '₹2,300 – ₹2,550',
        hi: '₹2,300 – ₹2,550',
        mr: '₹२,३०० – ₹२,५५०'
      },
      priceSub: {
        en: 'MSP Protected',
        hi: 'न्यूनतम समर्थन मूल्य (MSP)',
        mr: 'हमीभाव (MSP) सुरक्षित'
      },
      duration: {
        en: '120 – 135 Days',
        hi: '120 – 135 दिन',
        mr: '१२० – १३५ दिवस'
      },
      durationSub: {
        en: 'Mid-duration crop',
        hi: 'मध्यम अवधि की फसल',
        mr: 'मध्यम कालावधीचे पीक'
      },
      basalDose: {
        en: '50% N + 100% P + 100% K at transplanting.',
        hi: 'रोपाई के समय 50% N + 100% P + 100% K बेसल खुराक दें।',
        mr: 'लावणीच्या वेळी ५०% नत्र + १००% स्फुरद + १००% पालाश बेसल डोस द्या.'
      },
      rationale: {
        en: (n, rain) => `Your high soil Nitrogen levels (${n} kg/ha) combined with regular monsoon rainfall (${rain} mm) provide exceptional conditions for rapid tillering and robust grain formation.`,
        hi: (n, rain) => `आपका उच्च मिट्टी नाइट्रोजन स्तर (${n} kg/ha) और नियमित मानसूनी वर्षा (${rain} mm) धान के कल्ले फूटने और दाना भराव के लिए सर्वोत्तम परिस्थितियाँ प्रदान करते हैं।`,
        mr: (n, rain) => `आपल्या शेतातील नत्राचे प्रमाण (${n} kg/ha) आणि मान्सून पाऊस (${rain} mm) भाताच्या फुटवे वाढीसाठी आणि दाणे भरण्यासाठी अत्यंत अनुकूल आहे.`
      }
    },
    cotton: {
      fullName: {
        en: 'Cotton (Bt Hybrid)',
        hi: 'कपास / Cotton (Bt Hybrid)',
        mr: 'कापूस / Cotton (Bt Hybrid)'
      },
      seasonBadge: {
        en: 'Kharif Cash',
        hi: 'नकदी खरीफ फसल',
        mr: 'महत्त्वाचे खरीप नगदी पीक'
      },
      varieties: {
        en: 'RCH-659, Ankur-3028, or Ajit-155',
        hi: 'RCH-659, अंकुर-3028, या अजीत-155',
        mr: 'RCH-659, अंकुर-3028, किंवा अजित-155'
      },
      yield: {
        en: '22 – 28 Quintals/Ha',
        hi: '22 – 28 क्विंटल/हेक्टेयर',
        mr: '२२ – २८ क्विंटल/हे.'
      },
      yieldSub: {
        en: 'High Boll Load',
        hi: 'अधिक गूलर भार व वजन',
        mr: 'भरघोस बोंडांचे प्रमाण'
      },
      water: {
        en: 'Moderate (500–700mm)',
        hi: 'मध्यम (500–700mm)',
        mr: 'मध्यम (५००–७०० मिमी)'
      },
      waterSub: {
        en: 'Deep Root Tap',
        hi: 'गहरी जड़ों से जल अवशोषण',
        mr: 'खोल मुळांद्वारे पाणी शोषण'
      },
      price: {
        en: '₹7,120 – ₹7,520',
        hi: '₹7,120 – ₹7,520',
        mr: '₹७,१२० – ₹७,५२०'
      },
      priceSub: {
        en: 'MSP Grade-A',
        hi: 'ग्रेड-ए समर्थन मूल्य',
        mr: 'ग्रेड-ए हमीभाव'
      },
      duration: {
        en: '150 – 165 Days',
        hi: '150 – 165 दिन',
        mr: '१५० – १६५ दिवस'
      },
      durationSub: {
        en: 'Extended Picking',
        hi: 'दीर्घ तुड़ाई अवधि',
        mr: 'दीर्घ तोडणी कालावधी'
      },
      basalDose: {
        en: '20% N + 100% P + 100% K at planting, split N at 30 & 60 DAS.',
        hi: 'बुवाई पर 20% N + 100% P + 100% K दें, शेष N को 30 व 60 दिन पर दें।',
        mr: 'लागवडीच्या वेळी २०% नत्र + १००% स्फुरद + १००% पालाश, उरलेले नत्र ३० व ६० दिवसांनी द्या.'
      },
      rationale: {
        en: (n, rain) => `Ideal for well-drained Black Cotton soil. Highly responsive to available potassium for fiber strength and superior boll weight.`,
        hi: (n, rain) => `अच्छी जल निकासी वाली काली कपास मिट्टी के लिए आदर्श। रेशे की मजबूती और गूलर के वजन के लिए पोटाश के प्रति अत्यधिक उत्तरदायी।`,
        mr: (n, rain) => `चांगला निचरा होणाऱ्या काळ्या कसदार मातीसाठी आदर्श. धाग्याची मजबुती आणि बोंडाचे वजन वाढवण्यासाठी पोटॅशियम अत्यंत फायदेशीर ठरते.`
      }
    },
    maize: {
      fullName: {
        en: 'Maize (Hybrid Feed)',
        hi: 'मक्का / Maize (Hybrid Feed)',
        mr: 'मका / Maize (Hybrid Feed)'
      },
      seasonBadge: {
        en: 'Kharif Fast',
        hi: 'शीघ्र खरीफ फसल',
        mr: 'कमी कालावधीचे खरीप पीक'
      },
      varieties: {
        en: 'DKC-9108, Pioneer-P3501, or Bio-9681',
        hi: 'DKC-9108, पायनियर-P3501, या बायो-9681',
        mr: 'DKC-9108, पायोनियर-P3501, किंवा बायो-9681'
      },
      yield: {
        en: '55 – 65 Quintals/Ha',
        hi: '55 – 65 क्विंटल/हेक्टेयर',
        mr: '५५ – ६५ क्विंटल/हे.'
      },
      yieldSub: {
        en: 'Heavy Cob Biomass',
        hi: 'भारी भुट्टा व दाना वजन',
        mr: 'भरघोस कणसे व दाणे'
      },
      water: {
        en: 'Low to Moderate',
        hi: 'कम से मध्यम',
        mr: 'कमी ते मध्यम'
      },
      waterSub: {
        en: 'Tolerant to breaks',
        hi: 'मानसून अंतराल सहनशील',
        mr: 'पावसातील खंड सहन करणारे'
      },
      price: {
        en: '₹2,090 – ₹2,225',
        hi: '₹2,090 – ₹2,225',
        mr: '₹२,०९० – ₹२,२२५'
      },
      priceSub: {
        en: 'Steady Poultry Demand',
        hi: 'मुर्गी दाना व मंडी में भारी मांग',
        mr: 'बाजार व कुक्कुटपालनात सतत मागणी'
      },
      duration: {
        en: '90 – 105 Days',
        hi: '90 – 105 दिन',
        mr: '९० – १०५ दिवस'
      },
      durationSub: {
        en: 'Fast Turnaround',
        hi: 'शीघ्र पकने वाली फसल',
        mr: 'लवकर निघणारे पीक'
      },
      basalDose: {
        en: '25% N + 100% P + 100% K basal, remainder N at knee-high and tasseling.',
        hi: '25% N + 100% P + 100% K बुवाई पर, शेष N घुटने की ऊंचाई और नर मंजरी पर दें।',
        mr: 'पेरणीच्या वेळी २५% नत्र + १००% स्फुरद + १००% पालाश, उर्वरित नत्र नंतर दोन हप्त्यांत द्या.'
      },
      rationale: {
        en: (n, rain) => `Resilient crop choice with fast turnaround (90–105 days). Lower overall water risk if monsoon weakens midway.`,
        hi: (n, rain) => `कम अवधि (90-105 दिन) वाली लचीली फसल। यदि मानसून बीच में कमजोर भी पड़ता है, तो भी फसल सुरक्षित रहती है।`,
        mr: (n, rain) => `कमी कालावधीत (९०-१०५ दिवस) येणारे लवचिक पीक. मान्सूनमध्ये खंड पडला तरी पाण्याचा ताण सहज सहन करू शकते.`
      }
    },
    wheat: {
      fullName: {
        en: 'Wheat (HD-2967)',
        hi: 'गेहूं / Wheat (HD-2967)',
        mr: 'गहू / Wheat (HD-2967)'
      },
      seasonBadge: {
        en: 'Rabi Sovereign',
        hi: 'प्रमुख रबी फसल',
        mr: 'प्रमुख रब्बी पीक'
      },
      varieties: {
        en: 'HD-2967, PBW-343, or GW-322',
        hi: 'HD-2967, PBW-343, या GW-322',
        mr: 'HD-2967, PBW-343, किंवा GW-322'
      },
      yield: {
        en: '48 – 54 Q/Ha',
        hi: '48 – 54 क्विंटल/हेक्टेयर',
        mr: '४८ – ५४ क्विंटल/हे.'
      },
      yieldSub: {
        en: 'Prime Milling Grade',
        hi: 'उत्कृष्ट आटा व दाना गुणवत्ता',
        mr: 'उत्कृष्ट दाण्याची प्रत'
      },
      water: {
        en: 'Moderate',
        hi: 'मध्यम (Moderate)',
        mr: 'मध्यम (Moderate)'
      },
      waterSub: {
        en: '4–5 Critical Irrigations',
        hi: '4-5 आवश्यक क्रांतिकालीन सिंचाई',
        mr: '४-५ आवश्यक पाणी पाळ्या'
      },
      price: {
        en: '₹2,275 – ₹2,450',
        hi: '₹2,275 – ₹2,450',
        mr: '₹२,२७५ – ₹२,४५०'
      },
      priceSub: {
        en: 'MSP Guaranteed',
        hi: 'सरकारी खरीद व MSP सुरक्षित',
        mr: 'हमीभाव (MSP) हमी'
      },
      duration: {
        en: '115 – 125 Days',
        hi: '115 – 125 दिन',
        mr: '११५ – १२५ दिवस'
      },
      durationSub: {
        en: 'Timely Sown',
        hi: 'समय पर बुवाई योग्य',
        mr: 'वेळेवर पेरणीयोग्य'
      },
      basalDose: {
        en: '50% N + 100% P + 100% K at crown root initiation.',
        hi: 'बुवाई के समय 50% N + 100% P + 100% K बेसल उर्वरक डालें।',
        mr: 'पेरणीच्या वेळी ५०% नत्र + १००% स्फुरद + १००% पालाश खत द्या.'
      },
      rationale: {
        en: (n, rain) => `Thrives in balanced loam soils with moderate soil fertility and structured irrigation schedules.`,
        hi: (n, rain) => `मध्यम उर्वरता और व्यवस्थित सिंचाई व्यवस्था वाली दोमट मिट्टी में उत्कृष्ट पैदावार देने वाली फसल।`,
        mr: (n, rain) => `चांगल्या निचऱ्याच्या पोयटा जमिनीत आणि वेळेवर पाणी व्यवस्थापनासह भरघोस उत्पन्न देणारे मुख्य रब्बी पीक.`
      }
    },
    sugarcane: {
      fullName: {
        en: 'Sugarcane (Co-86032)',
        hi: 'गन्ना / Sugarcane (Co-86032)',
        mr: 'ऊस / Sugarcane (Co-86032)'
      },
      seasonBadge: {
        en: 'Perennial Cash',
        hi: 'वार्षिक नकदी फसल',
        mr: 'वार्षिक महत्त्वाचे नगदी पीक'
      },
      varieties: {
        en: 'Co-86032 (Nira), Co-0265 (Phule 265)',
        hi: 'Co-86032 (नीरा), Co-0265 (फुले 265)',
        mr: 'Co-86032 (निरा), Co-0265 (फुले २६५)'
      },
      yield: {
        en: '110 – 130 Tons/Ha',
        hi: '110 – 130 टन/हेक्टेयर',
        mr: '११० – १३० टन/हे.'
      },
      yieldSub: {
        en: 'High Cane Recovery',
        hi: 'उच्च चीनी व रस रिकवरी',
        mr: 'उच्च साखर उतारा व वजन'
      },
      water: {
        en: 'High (1500–2500mm)',
        hi: 'अधिक (1500–2500mm)',
        mr: 'भरपूर (१५००–२५०० मिमी)'
      },
      waterSub: {
        en: 'Assured Furrow/Drip',
        hi: 'सुनिश्चित नाली या ड्रिप सिंचाई',
        mr: 'ठिबक किंवा पाटपाणी सिंचन'
      },
      price: {
        en: '₹3,150 / Ton',
        hi: '₹3,150 / टन',
        mr: '₹३,१५० / टन'
      },
      priceSub: {
        en: 'FRP Mandated',
        hi: 'FRP वैधानिक मूल्य सुरक्षित',
        mr: 'एफआरपी (FRP) दर सुरक्षित'
      },
      duration: {
        en: '12 – 14 Months',
        hi: '12 – 14 माह',
        mr: '१२ – १४ महिने'
      },
      durationSub: {
        en: 'Full Agronomic Cycle',
        hi: 'पूर्ण फसल चक्र',
        mr: 'संपूर्ण पीक चक्र'
      },
      basalDose: {
        en: '10% N + 100% P + 50% K at furrow planting.',
        hi: 'नाली में बुवाई के समय 10% N + 100% P + 50% K दें।',
        mr: 'सरीमध्ये लागवडीच्या वेळी १०% नत्र + १००% स्फुरद + ५०% पालाश द्या.'
      },
      rationale: {
        en: (n, rain) => `Exceptional biomass potential under heavy clay soils with assured drainage and balanced NPK nourishment.`,
        hi: (n, rain) => `उचित जल निकासी और संतुलित NPK पोषण के साथ भारी मिट्टी में असाधारण बायोमास और उच्च मिठास क्षमता।`,
        mr: (n, rain) => `योग्य निचरा आणि संतुलित खत व्यवस्थापनासह भारी काळ्या जमिनीत भरघोस उत्पादन व उच्च साखर उतारा देणारे पीक.`
      }
    }
  };

  // ── DISEASE PATHOLOGY LOCALIZATION ENGINE ──
  const CROP_NAME_I18N = {
    rice: { en: 'Paddy / Rice', hi: 'धान / चावल', mr: 'भात / धान', pa: 'ਝੋਨਾ / ਚਾਵਲ', gu: 'ડાંગર / ચોખા', te: 'వరి / బియ్యం', ta: 'நெல்', bn: 'ধান / চাল', kn: 'ಭತ್ತ / ಅಕ್ಕಿ' },
    wheat: { en: 'Wheat', hi: 'गेहूं', mr: 'गहू', pa: 'ਕਣਕ', gu: 'ઘઉં', te: 'గోధుమ', ta: 'கோதுமை', bn: 'গম', kn: 'ಗೋಧಿ' },
    cotton: { en: 'Cotton', hi: 'कपास', mr: 'कापूस', pa: 'ਕਪਾਹ', gu: 'ਕપાસ', te: 'ప్రత్తి', ta: 'பருத்தி', bn: 'তুলা', kn: 'ಹತ್ತಿ' },
    maize: { en: 'Maize / Corn', hi: 'मक्का', mr: 'मका', pa: 'ਮੱਕੀ', gu: 'મકાઈ', te: 'మొక్కజొన్న', ta: 'மக்காச்சோளம்', bn: 'ভুট্টা', kn: 'ಮೆಕ್ಕೆಜೋಳ' },
    sugarcane: { en: 'Sugarcane', hi: 'गन्ना', mr: 'ऊस', pa: 'ਗੰਨਾ', gu: 'શેરડી', te: 'చెరకు', ta: 'கரும்பு', bn: 'আখ', kn: 'ಕಬ್ಬು' },
    jute: { en: 'Jute', hi: 'पटसन / जूट', mr: 'ताग / ज्यूट', pa: 'ਪਟਸਨ', gu: 'શણ', te: 'జనపనార', ta: 'சணல்', bn: 'পাট', kn: 'ಸೆಣಬು' },
    chickpea: { en: 'Chickpea / Gram', hi: 'चना', mr: 'हरभरा', pa: 'ਛੋਲੇ', gu: 'ચણા', te: 'శనగలు', ta: 'கொண்டைக்கடலை', bn: 'ছোলা', kn: 'ಕಡಲೆ' },
    kidneybeans: { en: 'Kidney Beans / Rajma', hi: 'राजमा', mr: 'राजमा', pa: 'ਰਾਜਮਾਂਹ', gu: 'રાજમા', te: 'రాజ్మా', ta: 'ராஜ்மா', bn: 'রাজমা', kn: 'ರಾಜ್ಮಾ' },
    pigeonpeas: { en: 'Pigeonpeas / Arhar', hi: 'अरहर / तूर', mr: 'तूर', pa: 'ਅਰਹਰ', gu: 'તુવેਰ', te: 'కందులు', ta: 'துவரம் பருப்பு', bn: 'অড়হর', kn: 'ತೊಗರಿ' },
    mothbeans: { en: 'Moth Beans', hi: 'मोठ दाल', mr: 'मटकी', pa: 'ਮੋਠ', gu: 'મઠ', te: 'బొబ్బర్లు', ta: 'தட்டப்பயறு', bn: 'মঠ কলাই', kn: 'ಮಡಿಕೆ' },
    mungbean: { en: 'Green Gram / Moong', hi: 'मूंग दाल', mr: 'मूग', pa: 'ਮੂੰਗੀ', gu: 'ਮਗ', te: 'పెసలు', ta: 'பாசிப்பயறு', bn: 'মুগ ডাল', kn: 'ಹೆಸರು ಕಾಳು' },
    blackgram: { en: 'Black Gram / Urad', hi: 'उड़द दाल', mr: 'उडीद', pa: 'ਮਾਂਹ', gu: 'અડદ', te: 'మినుములు', ta: 'உளுந்து', bn: 'মাষকলাই', kn: 'ಉದ್ದು' },
    lentil: { en: 'Lentil / Masoor', hi: 'मसूर दाल', mr: 'मसूर', pa: 'ਮਸਰ', gu: 'ਮਸૂર', te: 'మైసూర్ పప్పు', ta: 'மைசூர் பருப்பு', bn: 'মসুর ডাল', kn: 'ಮಸೂರ' },
    pomegranate: { en: 'Pomegranate', hi: 'अनार', mr: 'डाळिंब', pa: 'ਅਨਾਰ', gu: 'દાડમ', te: 'దానిమ్మ', ta: 'மாதுளை', bn: 'বেদানা / ডালিম', kn: 'ದಾಳಿಂಬೆ' },
    banana: { en: 'Banana', hi: 'केला', mr: 'केळी', pa: 'ਕੇਲਾ', gu: 'કેળા', te: 'అరటి', ta: 'வாழைப்பழம்', bn: 'কলা', kn: 'ಬಾಳೆಹಣ್ಣು' },
    mango: { en: 'Mango', hi: 'आम', mr: 'आंबा', pa: 'ਅੰਬ', gu: 'ਕੇਰੀ', te: 'మామిడి', ta: 'மாம்பழம்', bn: 'আম', kn: 'ಮಾವು' },
    grapes: { en: 'Grapes', hi: 'अंगूर', mr: 'द्राक्षे', pa: 'ਅੰਗੂਰ', gu: 'દ્રાક્ષ', te: 'ద్రాక్ష', ta: 'திராட்சை', bn: 'আঙুর', kn: 'ದ್ರಾಕ್ಷಿ' },
    watermelon: { en: 'Watermelon', hi: 'तरबूज', mr: 'कलिंगड', pa: 'ਤਰਬੂਜ਼', gu: 'તરਬૂચ', te: 'పుచ్చకాయ', ta: 'தர்பூசணி', bn: 'তরমুজ', kn: 'ಕಲ್ಲಂಗಡಿ' },
    muskmelon: { en: 'Muskmelon', hi: 'खरबूजा', mr: 'खरबूज', pa: 'ਖਰਬੂਜਾ', gu: 'ટેટી / શક્કરટેટી', te: 'ఖర్బూజ', ta: 'முலாம் பழம்', bn: 'খরমুজ', kn: 'ಕರಬೂಜ' },
    apple: { en: 'Apple', hi: 'सेब', mr: 'सफरचंद', pa: 'ਸੇਬ', gu: 'સફરજન', te: 'యాపిల్', ta: 'ஆப்பிள்', bn: 'আপেল', kn: 'ಸೇಬು' },
    orange: { en: 'Orange / Citrus', hi: 'संतरा', mr: 'संत्री', pa: 'ਸੰਤਰਾ', gu: 'સંતરા', te: 'నారింజ', ta: 'ஆரஞ்சு', bn: 'কমলালেবু', kn: 'ಕಿತ್ತಳೆ' },
    papaya: { en: 'Papaya', hi: 'पपीता', mr: 'पपई', pa: 'ਪਪੀਤਾ', gu: 'પપૈયું', te: 'బొప్పాయి', ta: 'பப்பாளி', bn: 'পেঁপে', kn: 'ಪಪ್ಪಾಯಿ' },
    coconut: { en: 'Coconut', hi: 'नारियल', mr: 'नारळ', pa: 'ਨਾਰੀਅਲ', gu: 'નાળિયેર', te: 'కొబ్బరికాయ', ta: 'தேங்காய்', bn: 'নারকেল', kn: 'ತೆಂಗಿನಕಾಯಿ' },
    coffee: { en: 'Coffee', hi: 'कॉफी', mr: 'कॉफी', pa: 'ਕੌਫੀ', gu: 'કોફી', te: 'కాఫీ', ta: 'காபி', bn: 'কফি', kn: 'ಕಾಫಿ' },
    tea: { en: 'Tea', hi: 'चाय', mr: 'चहा', pa: 'ਚਾਹ', gu: 'ચા', te: 'టీ', ta: 'தேயிலை', bn: 'চা', kn: 'ಚಹಾ' },
    soybean: { en: 'Soybean', hi: 'सोयाबीन', mr: 'सोयाबीन', pa: 'ਸੋਇਆਬੀਨ', gu: 'સોયાબીન', te: 'సోయాబీన్', ta: 'சோயாபீன்', bn: 'সয়াবিন', kn: 'ಸೋಯಾಬೀನ್' },
    groundnut: { en: 'Groundnut / Peanut', hi: 'मूंगफली', mr: 'भुईमूग', pa: 'ਮੂੰਗਫਲੀ', gu: 'મગફળી', te: 'వేరుశనగ', ta: 'வேர்க்கடலை', bn: 'চিনাবাদাম', kn: 'ಕಡಲೆಕಾಯಿ' },
    onion: { en: 'Onion', hi: 'प्याज', mr: 'कांदा', pa: 'ਪਿਆਜ਼', gu: 'ડુંગળી', te: 'ఉల్లిపాయ', ta: 'வெங்காயம்', bn: 'পেঁয়াজ', kn: 'ಈರುಳ್ಳಿ' },
    potato: { en: 'Potato', hi: 'आलू', mr: 'बटाटा', pa: 'ਆਲੂ', gu: 'ਬટાકા', te: 'బంగాళాదుంప', ta: 'உருளைக்கிழங்கு', bn: 'আলু', kn: 'ಆಲೂಗಡ್ಡೆ' },
    tomato: { en: 'Tomato', hi: 'टमाटर', mr: 'टोमॅटो', pa: 'ਟਮਾਟਰ', gu: 'ટામેટા', te: 'టమోటా', ta: 'தக்காளி', bn: 'টমেটো', kn: 'ಟೊಮೆಟೊ' },
    chilli: { en: 'Chilli', hi: 'मिर्च', mr: 'मिरची', pa: 'ਮਿਰਚ', gu: 'મરચું', te: 'మిరపకాయ', ta: 'மிளகாய்', bn: 'লঙ্কা', kn: 'ಮೆಣಸಿನಕಾಯಿ' },
    ginger: { en: 'Ginger', hi: 'अदरक', mr: 'आले', pa: 'ਅਦਰਕ', gu: 'આદું', te: 'అల్లం', ta: 'இஞ்சி', bn: 'আদা', kn: 'ಶುಂಠಿ' },
    garlic: { en: 'Garlic', hi: 'लहसुन', mr: 'लसूण', pa: 'ਲਸਣ', gu: 'લસਣ', te: 'వెల్లుల్లి', ta: 'பூண்டு', bn: 'রসুন', kn: 'ಬೆಳ್ಳುಳ್ಳಿ' },
    turmeric: { en: 'Turmeric', hi: 'हल्दी', mr: 'हळद', pa: 'ਹਲਦੀ', gu: 'હળદર', te: 'పసుపు', ta: 'மஞ்சள்', bn: 'হলুদ', kn: 'ಅರಿಶಿನ' },
    mustard: { en: 'Mustard', hi: 'सरसों', mr: 'मोहरी', pa: 'ਸਰ੍ਹੋਂ', gu: 'રાઈ', te: 'ఆవాలు', ta: 'கடுகு', bn: 'সর্ষে', kn: 'ಸಾಸಿವೆ' },
    jowar: { en: 'Sorghum / Jowar', hi: 'ज्वार', mr: 'ज्वारी', pa: 'ਜਵਾਰ', gu: 'જુવાર', te: 'జొన్నలు', ta: 'சோளம்', bn: 'জোয়ার', kn: 'ಜೋಳ' },
    bajra: { en: 'Pearl Millet / Bajra', hi: 'बाजरा', mr: 'बाजरी', pa: 'ਬਾਜਰਾ', gu: 'ਬਾਜਰੀ', te: 'సజ్జలు', ta: 'கம்பு', bn: 'বাজরা', kn: 'ಸಜ್ಜೆ' },
    barley: { en: 'Barley / Jau', hi: 'जौ', mr: 'जव', pa: 'ਜੌਂ', gu: 'ਜਵ', te: 'బార్లీ', ta: 'பார்லி', bn: 'যব', kn: 'ಬಾರ್ಲಿ' }
  };

  const PATHOGEN_TYPE_I18N = {
    'fungal': {
      en: 'Fungal Pathogen',
      hi: 'फफूंद जनित (Fungal)',
      mr: 'बुरशीजन्य (Fungal)',
      pa: 'ਉੱਲੀ ਰੋਗ (Fungal)',
      gu: 'ફૂગજન્ય રોગ (Fungal)',
      te: 'శిలీంద్ర తెగులు (Fungal)',
      ta: 'பூஞ்சை நோய் (Fungal)',
      bn: 'ছত্রাকজনিত রোগ (Fungal)',
      kn: 'ಶಿಲೀಂಧ್ರ ರೋಗ (Fungal)'
    },
    'bacterial': {
      en: 'Bacterial Pathogen',
      hi: 'जीवाणु जनित (Bacterial)',
      mr: 'जिवाणूजन्य (Bacterial)',
      pa: 'ਜੀਵਾਣੂ ਰੋਗ (Bacterial)',
      gu: 'જીવાણુજન્ય રોગ (Bacterial)',
      te: 'బాక్టీరియా తెగులు (Bacterial)',
      ta: 'பாக்டீரியா நோய் (Bacterial)',
      bn: 'ব্যাকটেরিয়াজনিত রোগ (Bacterial)',
      kn: 'ಬ್ಯಾಕ್ಟೀರಿಯಾ ರೋಗ (Bacterial)'
    },
    'viral': {
      en: 'Viral Pathogen',
      hi: 'विषाणु जनित (Viral)',
      mr: 'विषाणूजन्य (Viral)',
      pa: 'ਵਿਸ਼ਾਣੂ ਰੋਗ (Viral)',
      gu: 'વિષાણુજન્ય રોગ (Viral)',
      te: 'వైరస్ తెగులు (Viral)',
      ta: 'வைரஸ் நோய் (Viral)',
      bn: 'ভাইরাসজনিত রোগ (Viral)',
      kn: 'ವೈರಸ್ ರೋಗ (Viral)'
    },
    'insect pest': {
      en: 'Insect Pest Infestation',
      hi: 'कीट प्रकोप (Insect Pest)',
      mr: 'कीटक प्रादुर्भाव (Insect Pest)',
      pa: 'ਕੀੜੇ-ਮਕੌੜੇ (Insect Pest)',
      gu: 'જીવાત ઉપદ્રવ (Insect Pest)',
      te: 'పురుగు తెగులు (Insect Pest)',
      ta: 'பூச்சி தாக்குதல் (Insect Pest)',
      bn: 'কীটপতঙ্গের আক্রমণ (Insect Pest)',
      kn: 'ಕೀಟ ಬಾಧೆ (Insect Pest)'
    }
  };

  const DISEASE_I18N_DB = {
    rice_blast: {
      hi: {
        name: 'धान का झोंका रोग (Rice Blast / Jhonka Rog)',
        symptoms: 'पत्तियों पर आँख या नाव के आकार के धब्बे जिनके बीच का भाग राख/सफेद और किनारे गहरे कत्थई होते हैं। गंभीर प्रकोप में "गर्दन तोड़" (Neck Blast) रोग होता है जिससे बाली की जड़ काली होकर टूट जाती है और दाने पूरी तरह थोथे (खाली) रह जाते हैं।',
        bio: [
          'ट्राइकोडर्मा विरिडी या स्यूडोमोनास फ्लोरेसेंस 10 ग्राम प्रति किलो बीज की दर से बीज उपचार करें।',
          'नर्सरी और कल्ले फूटने की अवस्था में स्यूडोमोनास फ्लोरेसेंस (2 ग्राम/लीटर) का पर्णीय छिड़काव करें।',
          'रोग के शुरुआती लक्षण दिखते ही 5% नीम बीज अर्क (NSKE) या नीम का तेल (3 मिली/लीटर) छिड़कें।'
        ],
        chem: [
          'ट्राइसाइक्लाजोल 75% WP (बाण / बीम) @ 0.6 ग्राम/लीटर पानी: पत्ती पर लक्षण दिखते ही या 5% बाली निकलते समय तुरंत छिड़कें।',
          'आइसोप्रोपिलियोलेन 40% EC (फूजी-वन) @ 1.5 मिली/लीटर पानी: प्रभावी उपचारात्मक और निवारक प्रणालीगत फफूंदनाशक।',
          'एज़ोक्सीस्ट्रोबिन 18.2% + डिफेनोकोनाज़ोल 11.4% SC (एमिस्टार टॉप) @ 1.0 मिली/लीटर पानी: ब्लास्ट और शीथ ब्लाइट दोनों के लिए व्यापक सुरक्षा।'
        ]
      },
      mr: {
        name: 'भातावरील करपा व मानमोड रोग (Rice Blast)',
        symptoms: 'पानांवर डोळ्यासारखे किंवा बोट-आकाराचे ठिपके ज्यांचे केंद्र करडे/पांढरट आणि कडा गडद तपकिरी असतात. तीव्र प्रादुर्भावात "मानमोड" (Neck Blast) रोग होतो, ज्यामुळे ओंबीचा तळ काळा पडून तुटतो आणि दाणे पूर्णपणे पोचट राहतात.',
        bio: [
          'ट्रायकोडर्मा व्हिरिडी किंवा स्यूडोमोनस फ्लोरेसेन्स १० ग्रॅम प्रति किलो बियाण्यावर बीजप्रक्रिया करा.',
          'रोपवाटिका आणि फुटवे फुटण्याच्या अवस्थेत स्यूडोमोनस फ्लोरेसेन्स (२ ग्रॅम/लिटर) फवारा.',
          'लक्षणे दिसताच ५% निंबोळी अर्क (NSKE) किंवा कडुलिंब तेल (३ मिली/लिटर) फवारा.'
        ],
        chem: [
          'ट्रायसायक्लॅझोल ७५% WP (बाण / बीम) @ ०.६ ग्रॅम/लिटर पाणी: पानांवर लक्षणे दिसताच किंवा ५% ओंब्या बाहेर पडताना फवारा.',
          'आयसोप्रोथिओलेन ४०% EC (फुजी-वन) @ १.५ मिली/लिटर पाणी: अत्यंत प्रभावी आंतरप्रवाही बुरशीनाशक.',
          'अझॉक्सीस्ट्रॉबिन १८.२% + डायफेनोकोनॅझोल ११.४% SC (अमिस्टार टॉप) @ १.० मिली/लिटर पाणी: करपा व पर्णकोष करपा या दोन्हीवर उत्कृष्ट नियंत्रण.'
        ]
      },
      gu: {
        name: 'ડાંગરનો ગળાકાપ / બ્લાસ્ટ રોગ (Rice Blast)',
        symptoms: 'પાન પર આંખ કે હોડી જેવા આકારના ડાઘ પડે છે જેના કેન્દ્રમાં રાખોડી અને કિનારી કથ્થઈ રંગની હોય છે. તીવ્ર ઉપદ્રવમાં ગળાકાપ થવાથી ડૂંડી તૂટી જાય છે અને દાણા પોચા રહે છે.',
        bio: ["ટ્રાઇકોડર્મા વિરીડી અથવા સ્યુડોમોનાસ ફ્લોરેસન્સ ૧૦ ગ્રામ પ્રતિ કિલો બીજ પ્રમાણે બીજ માવજત આપો.", "ધરૂવાડીયામાં અને ફૂટવાના સમયે સ્યુડોમોનાસ ફ્લોરેસન્સ (૨ ગ્રામ/લિટર) નો છંટકાવ કરો.", "પ્રારંભિક લક્ષણો દેખાતા જ ૫% લીંબોળીનું અર્ક અથવા લીમડાનું તેલ (૩ મિલી/લિટર) છાંટો."],
        chem: ["ટ્રાઇસાયક્લાઝોલ ૭૫% WP @ ૦.૬ ગ્રામ/લિટર પાણી: પાન પર ડાઘ દેખાય ત્યારે તરત જ છંટકાવ કરો.", "આઇસોપ્રોથિઓલેન ૪૦% EC @ ૧.૫ મિલી/લિટર પાણી: ઉત્તમ આંતરપ્રવાહી ફૂગનાશક.", "એઝોક્સીસ્ટ્રોબિન + ડાઇફેનોકોનાઝોલ @ ૧.૦ મિલી/લિટર પાણી: બ્લાસ્ટ અને સુકારા બંને પર શ્રેષ્ઠ નિયંત્રણ."]
      },
      pa: {
        name: 'ਝੋਨੇ ਦਾ ਬਲਾਸਟ / ਝੁਲਸ ਰੋਗ (Rice Blast)',
        symptoms: 'ਪੱਤਿਆਂ \'ਤੇ ਕਿਸ਼ਤੀ ਵਰਗੇ ਧੱਬੇ ਜਿਨ੍ਹਾਂ ਦੇ ਵਿਚਕਾਰਲਾ ਹਿੱਸਾ ਸਲੇਟੀ ਤੇ ਕਿਨਾਰੇ ਭੂਰੇ ਹੁੰਦੇ ਹਨ। ਸਿੱਟੇ ਦੇ ਮੁੱਢ \'ਤੇ ਕਾਲਾਪਣ ਆਉਣ ਨਾਲ ਮੁੰਜਰ ਟੁੱਟ ਜਾਂਦੀ ਹੈ ਅਤੇ ਦਾਣੇ ਖਾਲੀ ਰਹਿ ਜਾਂਦੇ ਹਨ।',
        bio: ["ਟ੍ਰਾਈਕੋਡਰਮਾ 10 ਗ੍ਰਾਮ ਪ੍ਰਤੀ ਕਿਲੋ ਬੀਜ ਦੇ ਹਿਸਾਬ ਨਾਲ ਬੀਜ ਸੋਧ ਕਰੋ।", "ਸਿਊਡੋਮੋਨਾਸ ਫਲੋਰੋਸੈਂਸ 2 ਗ੍ਰਾਮ/ਲਿਟਰ ਦਾ ਪੱਤਿਆਂ 'ਤੇ ਛਿੜਕਾਅ ਕਰੋ।", "ਨੀਮ ਦਾ ਤੇਲ 3 ਮਿਲੀ/ਲਿਟਰ ਪਾਣੀ ਵਿੱਚ ਮਿਲਾ ਕੇ ਛਿੜਕੋ।"],
        chem: ["ਟ੍ਰਾਈਸਾਈਕਲਾਜ਼ੋਲ 75% WP @ 0.6 ਗ੍ਰਾਮ/ਲਿਟਰ ਪਾਣੀ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।", "ਆਈਸੋਪ੍ਰੋਥਿਓਲੇਨ 40% EC @ 1.5 ਮਿਲੀ/ਲਿਟਰ ਪਾਣੀ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।"]
      },
      te: {
        name: 'వరి అగ్గితెగులు (Rice Blast)',
        symptoms: 'ఆకులపై కంటి ఆకారపు లేదా పడవ ఆకారపు బూడిద రంగు మచ్చలు. ముదిరిన దశలో మెడవిరుపు తెగులుగా మారి కంకి విరిగిపోతుంది, గింజలు తాలుగా మిగులుతాయి.',
        bio: ["ట్రైకోడెర్మా లేదా సూడోమోనాస్‌తో కిలో విత్తనానికి 10 గ్రాములు కలిపి విత్తన శుద్ధి చేయండి.", "లక్షణాలు కనిపించిన వెంటనే వేపనూనె 3 మి.లీ./లీటరు నీటికి పిచికారీ చేయండి."],
        chem: ["ట్రైసైక్లాజోల్ 75% WP @ 0.6 గ్రాములు/లీటరు నీటికి పిచికారీ చేయాలి.", "ఐసోప్రోథియోలేన్ 40% EC @ 1.5 మి.లీ./లీటరు నీటికి పిచికారీ చేయాలి."]
      },
      ta: {
        name: 'நெல் குலை நோய் (Rice Blast)',
        symptoms: 'இலைகளில் கண் போன்ற சாம்பல் நிறப் புள்ளிகள் மற்றும் பழுப்பு நிற ஓரங்கள் தோன்றும். கதிர் கழுத்துப் பகுதியில் கருகல் ஏற்பட்டு கதிர் உடைந்து மணிகள் பதறாகும்.',
        bio: ["சூடோமோனாஸ் புளோரசன்స్ 10 கிராம்/கிலோ விதைக்கு என்ற அளவில் விதை நேர்த்தி செய்யவும்.", "வேப்ப எண்ணெய் 3 மி.லி./லிட்டர் தண்ணீரில் கலந்து தெளிக்கவும்."],
        chem: ["டிரைசைக்ளசோல் 75% WP @ 0.6 கிராம்/லிட்டர் தண்ணீரில் கலந்து தெளிக்கவும்.", "அசோக்சிஸ்ட்ரோபின் 1.0 மி.லி./லிட்டர் தண்ணீரில் கலந்து தெளிக்கவும்."]
      },
      bn: {
        name: 'ধানের ব্লাস্ট বা ঝলসানো রোগ (Rice Blast)',
        symptoms: 'পাতায় চোখের মতো ডিম্বাকার দাগ যার কেন্দ্র ধূসর এবং কিনারা বাদামী। শীষের গোড়ায় আক্রমণ হলে শীষ ভেঙে যায় ও ধান চিটা হয়ে যায়।',
        bio: ["ট্রাইকোডার্মা দিয়ে বীজ শোধন করুন (১০ গ্রাম/কেজি বীজ)।", "নিম তেল ৩ মিলি/লিটার জলে গুলে স্প্রে করুন।"],
        chem: ["ট্রাইসাইক্লাজোল ৭৫% WP @ ০.৬ গ্রাম/লিটার জল স্প্রে করুন।", "আইসোপ্রোথিওলেন ৪০% EC @ ১.৫ মিলি/লিটার জল স্প্রে করুন।"]
      },
      kn: {
        name: 'ಭತ್ತದ ಬೆಂಕಿ ರೋಗ / ಬ್ಲಾಸ್ಟ್ (Rice Blast)',
        symptoms: 'ಎಲೆಗಳ ಮೇಲೆ ಕಣ್ಣಿನ ಆಕಾರದ ಬೂದು-ಬಿಳಿ ಮಚ್ಚೆಗಳು ಮತ್ತು ಕಂದು ಅಂಚುಗಳು. ತೆನೆ ಕುತ್ತಿಗೆ ಭಾಗ ಕೊಳೆತು ಕಾಳುಗಳು ಜೊಳ್ಳಾಗುತ್ತವೆ.',
        bio: ["ಟ್ರೈಕೋಡರ್ಮ 10 ಗ್ರಾಂ ಪ್ರತಿ ಕೆಜಿ ಬೀಜಕ್ಕೆ ಉಪಚರಿಸಿ.", "ಬೇವಿನ ಎಣ್ಣೆ 3 ಮಿಲಿ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಸಿಂಪಡಿಸಿ."],
        chem: ["ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್ 75% WP @ 0.6 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.", "ಐಸೋಪ್ರೋಥಿಯೋಲೇನ್ 40% EC @ 1.5 ಮಿಲಿ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ."]
      }
    },
    rice_sheath_blight: {
      hi: {
        name: 'धान का शीथ ब्लाइट / खोल गलन (Sheath Blight of Rice)',
        symptoms: 'पानी की सतह के पास पत्ती के आवरण (खोल) पर अंडाकार या अनियमित हरे-भूरे धब्बे। धब्बे आपस में मिलकर साँप की केंचुली जैसे पैटर्न बनाते हैं और पौधे खेतों में टुकड़ों में गिर जाते हैं।',
        bio: [
          'गोबर की खाद में संवर्धित ट्राइकोडर्मा हरजिएनम (50 किग्रा खाद + 2 किग्रा ट्राइकोडर्मा प्रति एकड़) मिट्टी में डालें।',
          'बैसिलस सबटिलिस या स्यूडोमोनास फ्लोरेसेंस 2.5 ग्राम/लीटर का पर्णीय छिड़काव करें।'
        ],
        chem: [
          'वैलिडामाइसिन 3% L @ 2.0 मिली/लीटर पानी का छिड़काव करें।',
          'हेक्साकोनाजोल 5% SC (कॉन्टाफ) @ 2.0 मिली/लीटर पानी का छिड़काव करें।'
        ]
      },
      mr: {
        name: 'भाताचा पर्णकोष करपा (Sheath Blight of Rice)',
        symptoms: 'पाण्याच्या पातळीजवळ पानांच्या आच्छादनावर लंबगोलाकार हिरवट-करडे ठिपके पडतात. हे ठिपके एकमेकांत मिसळून सापाच्या कातडीसारखे नक्षीदार दिसतात व रोपे शेतात लोळतात.',
        bio: [
          'शेणखतात मिसळलेले ट्रायकोडर्मा (५० किलो शेणखत + २ किलो ट्रायकोडर्मा प्रति एकर) जमिनीत टाका.',
          'बॅसिलस सबटिलिस किंवा स्यूडोमोनस फ्लोरेसेन्स २.५ ग्रॅम/लिटर फवारा.'
        ],
        chem: [
          'व्हॅलिडामायसिन ३% L @ २.० मिली/लिटर पाण्यात मिसळून फवारा.',
          'हेक्झाकोनॅझोल ५% SC (कॉन्टाफ) @ २.० मिली/लिटर पाण्यात मिसळून फवारा.'
        ]
      },
      gu: {
        name: 'ડાંગરનો પર્ણઆચ્છાદન સુકારો / શીથ બ્લાઇટ (Sheath Blight of Rice)',
        symptoms: 'પાણીની સપાટી નજીક પાનના આવરણ પર લંબગોળાકાર લીલાશ પડતા રાખોડી પાણીપોચા ડાઘ. આ ડાઘ મોટા થઈને સાપની કાંચળી જેવા અનિયમિત કથ્થઈ કિનારીવાળા બને છે. છોડ ખેતરમાં ઢળી પડે છે.',
        bio: ["છાણીયા ખાતરમાં સંવર્ધિત ટ્રાઇકોડર્મા હાર્ઝિયાનમ (૫૦ કિગ્રા ખાતર + ૨ કિગ્રા ટ્રાઇકોડર્મા/એકર) જમીનમાં આપો.", "બેસિલસ સબટીલીસ અથવા સ્યુડોમોનાસ ફ્લોરેસન્સ ૨.૫ ગ્રામ/લિટર પાણીમાં ભેળવી છંટકાવ કરો."],
        chem: ["હેક્સાકોનાઝોલ ૫% EC (કોન્ટાફ) @ ૨.૦ મિલી/લિટર પાણી (૪૦૦ મિલી/એકર): છોડના થડ અને પર્ણઆચ્છાદન તરફ ખાસ છંટકાવ કરો.", "વેલિડામિસિન ૩% L (શીથમાર) @ ૨.૫ મિલી/લિટર પાણી: અત્યંત સુરક્ષિત અને અસરકારક એન્ટિબાયોટિક ફૂગનાશક.", "થિફ્લુઝામાઇડ ૨૪% SC (પલ્સર) @ ૦.૭૫ મિલી/લિટર પાણી (૧૫૦ મિલી/એકર): નવી પેઢીનું આંતરપ્રવાહી ફૂગનાશક."]
      },
      pa: {
        name: 'ਝੋਨੇ ਦਾ ਸ਼ੀਥ ਬਲਾਈਟ / ਤਣਾ ਗਲਣਾ (Sheath Blight of Rice)',
        symptoms: 'ਪਾਣੀ ਦੀ ਸਤ੍ਹਾ ਕੋਲ ਪੱਤਿਆਂ ਦੇ ਖੋਲ ਉੱਤੇ ਅੰਡਾਕਾਰ ਹਰੇ-ਭੂਰੇ ਧੱਬੇ ਬਣਦੇ ਹਨ। ਧੱਬੇ ਮਿਲ ਕੇ ਸੱਪ ਦੀ ਕੁੰਜ ਵਰਗੇ ਬਣ ਜਾਂਦੇ ਹਨ ਅਤੇ ਫ਼ਸਲ ਡਿੱਗ ਜਾਂਦੀ ਹੈ।',
        bio: ["ਰੂੜੀ ਖਾਦ ਵਿੱਚ ਮਿਲਾ ਕੇ ਟ੍ਰਾਈਕੋਡਰਮਾ (50 ਕਿਲੋ ਰੂੜੀ + 2 ਕਿਲੋ ਟ੍ਰਾਈਕੋਡਰਮਾ ਪ੍ਰਤੀ ਏਕੜ) ਮਿੱਟੀ ਵਿੱਚ ਪਾਓ।", "ਸਿਊਡੋਮੋਨਾਸ ਫਲੋਰੋਸੈਂਸ 2.5 ਗ੍ਰਾਮ/ਲਿਟਰ ਪਾਣੀ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।"],
        chem: ["ਹੈਕਸਾਕੋਨਾਜ਼ੋਲ 5% EC @ 2.0 ਮਿਲੀ/ਲਿਟਰ ਪਾਣੀ ਬੂਟਿਆਂ ਦੇ ਮੁੱਢਾਂ ਵੱਲ ਛਿੜਕੋ।", "ਵੈਲੀਡਾਮਾਈਸਿਨ 3% L @ 2.5 ਮਿਲੀ/ਲਿਟਰ ਪਾਣੀ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।"]
      },
      te: {
        name: 'వరి పాముపొడ తెగులు / షీత్ బ్లైట్ (Sheath Blight of Rice)',
        symptoms: 'నీటి మట్టానికి దగ్గరగా ఉన్న ఆకు తొడుగులపై కోడిగుడ్డు ఆకారంలో ఆకుపచ్చ-బూడిద రంగు మచ్చలు. మచ్చలు కలిసి పాము చర్మం వంటి గీతలను ఏర్పరుస్తాయి.',
        bio: ["ట్రైకోడెర్మా కలిపిన పశువుల ఎరువు (ఎకరాకు 50 కిలోల ఎరువు + 2 కిలోల ట్రైకోడెర్మా) భూమిలో వేయాలి.", "సూడోమోనాస్ ఫ్లోరోసెన్స్ లీటరు నీటికి 2.5 గ్రాములు కలిపి పిచికారీ చేయాలి."],
        chem: ["హెక్సాకోనాజోల్ 5% EC @ 2.0 మి.లీ./లీటరు నీటికి పిచికారీ చేయాలి.", "వాలిడామైసిన్ 3% L @ 2.5 మి.లీ./లీటరు నీటికి ఆకు తొడుగుల వద్ద పిచికారీ చేయాలి."]
      },
      ta: {
        name: 'நெல் உறை கருகல் நோய் (Sheath Blight of Rice)',
        symptoms: 'நீர் மட்டத்திற்கு அருகில் உள்ள இலை உறைகளில் நீள்வட்ட பச்சை-சாம்பல் நிற புள்ளிகள். புள்ளிகள் ஒன்று சேர்ந்து பாம்பின் தோல் போன்ற வடிவத்தை உருவாக்கும்.',
        bio: ["டிரைக்கோடெர்மா விரிடி கலந்த தொழுவுரம் (ஏக்கருக்கு 50 கிலோ உரம் + 2 கிலோ டிரைக்கோடெர்மா) மண்ணில் இடவும்.", "சூடோமோனாஸ் புளோரசன்ஸ் 2.5 கிராம்/லிட்டர் வீதம் தெளிக்கவும்."],
        chem: ["ஹெக்சாகோனசோல் 5% EC @ 2.0 மி.லி./லிட்டர் தண்ணீரில் கலந்து தெளிக்கவும்.", "வேலிடமைசின் 3% L @ 2.5 மி.லி./லிட்டர் தண்ணீரில் கலந்து தூர்களில் படுமாறு தெளிக்கவும்."]
      },
      bn: {
        name: 'ধানের খোল পোড়া রোগ (Sheath Blight of Rice)',
        symptoms: 'জলের রেখার কাছে পাতার খোলে ডিম্বাকার জলভেজা দাগ। দাগগুলি মিলে সাপের খোলসের মতো অনিয়মিত বাদামী কিনারা তৈরি করে। গাছ হেলে পড়ে।',
        bio: ["গোবর সারের সাথে ট্রাইকোডার্মা (৫০ কেজি গোবর + ২ কেজি ট্রাইকোডার্মা প্রতি একর) মাটিতে প্রয়োগ করুন।", "সিউডোমোনাস ফ্লুরোসেন্স ২.৫ গ্রাম/লিটার জলে গুলে স্প্রে করুন।"],
        chem: ["ভ্যালিডামাইসিন ৩% L @ ২.৫ মিলি/লিটার জল স্প্রে করুন।", "হেক্সাকোনাজোল ৫% EC @ ২.০ মিলি/লিটার জল গাছের গোড়ার দিকে স্প্রে করুন।"]
      },
      kn: {
        name: 'ಭತ್ತದ ಹಾಳೆ ಕವಚ ಕೊಳೆ ರೋಗ (Sheath Blight of Rice)',
        symptoms: 'ನೀರಿನ ಮಟ್ಟದ ಸಮೀಪದ ಎಲೆಯ ಹಾಳೆಯ ಮೇಲೆ ಅಂಡಾಕಾರದ ಹಸಿರು-ಬೂದು ಬಣ್ಣದ ಮಚ್ಚೆಗಳು. ಮಚ್ಚೆಗಳು ಒಂದಾಗಿ ಹಾವಿನ ಚರ್ಮದಂತಹ ಮಾದರಿಯನ್ನು ರೂಪಿಸುತ್ತವೆ.',
        bio: ["ಟ್ರೈಕೋಡರ್ಮ ಮಿಶ್ರಿತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರವನ್ನು (ಎಕರೆಗೆ 50 ಕೆಜಿ ಗೊಬ್ಬರ + 2 ಕೆಜಿ ಟ್ರೈಕೋಡರ್ಮ) ಮಣ್ಣಿಗೆ ಹಾಕಿ.", "ಸ್ಯೂಡೋಮೊನಾಸ್ ಫ್ಲೋರೊಸೆನ್ಸ್ 2.5 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಸಿಂಪಡಿಸಿ."],
        chem: ["ಹೆಕ್ಸಾಕೋನಾಜೋಲ್ 5% EC @ 2.0 ಮಿಲಿ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.", "ವ್ಯಾಲಿಡಾಮೈಸಿನ್ 3% L @ 2.5 ಮಿಲಿ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಸಿಂಪಡಿಸಿ."]
      }
    },
    rice_bacterial_leaf_blight: {
      hi: {
        name: 'जीवाणु पत्ती झुलसा / BLB (Bacterial Leaf Blight)',
        symptoms: 'पत्तियों के किनारों से शुरू होकर अंदर की ओर बढ़ती हुई पीली से सफेद लहरदार धारियां। पत्तियों पर सुबह के समय बैक्टीरिया के चिपचिपे पीले बूंद दिखाई देते हैं।',
        bio: ['नीम का तेल (3000 ppm) @ 3 मिली/लीटर और स्यूडोमोनास फ्लोरेसेंस @ 5 ग्राम/लीटर का छिड़काव करें।'],
        chem: ['कॉपर ऑक्सीक्लोराइड 50% WP @ 2.5 ग्राम + स्ट्रेप्टोसाइक्लिन @ 0.1 ग्राम प्रति लीटर पानी का छिड़काव करें।']
      },
      mr: {
        name: 'भातावरील जिवाणूजन्य करपा / BLB',
        symptoms: 'पानांच्या कडांपासून आत पसरत जाणाऱ्या पिवळसर ते पांढऱ्या लाटांसारख्या पट्ट्या. पानांवर सकाळी चिकट जिवाणूचे पिवळे थेंब आढळतात.',
        bio: ['कडुलिंब अर्क (३००० ppm) @ ३ मिली/लिटर आणि स्यूडोमोनस @ ५ ग्रॅम/लिटर फवारा.'],
        chem: ['कॉपर ऑक्सिक्लोराईड ५०% WP @ २.५ ग्रॅम + स्ट्रेप्टोसायक्लीन @ ०.१ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारा.']
      },
      gu: {
        name: 'ડાંગરનો બેક્ટેરિયલ પાન સુકારો / બીએલબી (Bacterial Leaf Blight)',
        symptoms: 'પાનની કિનારીઓ પરથી પીળા-સફેદ પટ્ટા શરૂ થઈ નીચે તરફ વધે છે. સવારના સમયે પાન પર બેક્ટેરિયાના અમ્બર જેવા બિંદુઓ જોવા મળે છે. છોડ સુકાઈને ભૂખરા બને છે.',
        bio: ["તાજા છાણનું ૧૦% દ્રાવણ ગાળીને છંટકાવ કરો.", "નાઇટ્રોજન ખાતરનો વધુ પડતો ઉપયોગ ટાળો અને પોટાશ ખાતરનું પ્રમાણ વધારો."],
        chem: ["સ્ટ્રેપ્ટોસાઇક્લીન (૧૦૦ પીપીએમ) @ ૧.૦ ગ્રામ પ્રતિ ૧૦ લિટર પાણી + કોપર ઓક્સિક્લોરાઇડ @ ૨૫ ગ્રામ પ્રતિ ૧૦ લિટર પાણીમાં ભેળવી છાંટો."]
      },
      pa: {
        name: 'ਝੋਨੇ ਦਾ ਜੀਵਾਣੂ ਝੁਲਸ ਰੋਗ (Bacterial Leaf Blight)',
        symptoms: 'ਪੱਤਿਆਂ ਦੇ ਕਿਨਾਰਿਆਂ ਤੋਂ ਪੀਲੀਆਂ-ਚਿੱਟੀਆਂ ਧਾਰੀਆਂ ਸ਼ੁਰੂ ਹੋ ਕੇ ਪੱਤੇ ਸੁਕਾ ਦਿੰਦੀਆਂ ਹਨ। ਸਵੇਰ ਵੇਲੇ ਪੱਤਿਆਂ \'ਤੇ ਬੈਕਟੀਰੀਆ ਦੇ ਤੁਪਕੇ ਦਿਖਾਈ ਦਿੰਦੇ ਹਨ।',
        bio: ["ਯੂਰੀਆ ਦੀ ਵਰਤੋਂ ਘਟਾਓ ਅਤੇ ਪੋਟਾਸ਼ ਦੀ ਮਾਤਰਾ ਵਧਾਓ।"],
        chem: ["ਸਟ੍ਰੈਪਟੋਸਾਈਕਲੀਨ 1 ਗ੍ਰਾਮ + ਕਾਪਰ ਆਕਸੀਕਲੋਰਾਈਡ 25 ਗ੍ਰਾਮ ਪ੍ਰਤੀ 10 ਲਿਟਰ ਪਾਣੀ ਵਿੱਚ ਮਿਲਾ ਕੇ ਛਿੜਕੋ।"]
      },
      te: {
        name: 'వరి బాక్టీరియా ఆకు ఎండు తెగులు (BLB)',
        symptoms: 'ఆకుల అంచుల నుండి పసుపు-తెలుపు రంగు చారలు మొదలై కిందికి వ్యాపిస్తాయి. ఉదయం వేళల్లో ఆకులపై జిగురు బిందువులు కనిపిస్తాయి.',
        bio: ["నత్రజని వాడకం తగ్గించి, పొటాష్ ఎరువును తగినంతగా వాడండి."],
        chem: ["స్ట్రెప్టోసైక్లిన్ 1 గ్రాము + కాపర్ ఆక్సిక్లోరైడ్ 25 గ్రాములు 10 లీటర్ల నీటికి కలిపి పిచికారీ చేయాలి."]
      },
      ta: {
        name: 'நெல் பாக்டீரியா இலை கருகல் நோய் (BLB)',
        symptoms: 'இலைகளின் ஓரங்களிலிருந்து மஞ்சள்-வெள்ளை நிற கோடுகள் தோன்றி இலைகள் கருகும்.',
        bio: ["தழைச்சத்து உரத்தைக் குறைத்து, சாம்பல் சத்து உரத்தை அதிகரிக்கவும்."],
        chem: ["ஸ்ட்ரெப்டோமைசின் 1 கிராம் + காப்பர் ஆக்சிகுளோரைடு 25 கிராம் 10 லிட்டர் நீரில் கலந்து தெளிக்கவும்."]
      },
      bn: {
        name: 'ধানের ব্যাকটেরিয়াজনিত পাতা পোড়া রোগ (BLB)',
        symptoms: 'পাতার প্রান্ত থেকে ঢেউ খেলানো হলুদ দাগ নিচের দিকে ছড়ায় এবং পাতা শুকিয়ে খড়ের মতো হয়।',
        bio: ["ইউরিয়া সারের মাত্রা কমান এবং পটাশ সারের পরিমাণ বাড়ান।"],
        chem: ["স্ট্রেপ্টোসাইক্লিন ১ গ্রাম + কপার অক্সিক্লোরাইড ২৫ গ্রাম প্রতি ১০ লিটার জলে মিশিয়ে স্প্রে করুন।"]
      },
      kn: {
        name: 'ಭತ್ತದ ಬ್ಯಾಕ್ಟೀರಿಯಲ್ ಎಲೆ ಕರಕಲು ರೋಗ (BLB)',
        symptoms: 'ಎಲೆಗಳ ಅಂಚುಗಳಿಂದ ಹಳದಿ-ಬಿಳಿ ಗೆರೆಗಳು ಪ್ರಾರಂಭವಾಗಿ ಎಲೆ ಒಣಗುತ್ತದೆ.',
        bio: ["ಸಾರಜನಕ ಗೊಬ್ಬರ ಕಡಿಮೆ ಮಾಡಿ, ಪೊಟ್ಯಾಶ್ ಗೊಬ್ಬರ ಹೆಚ್ಚು ಬಳಸಿ."],
        chem: ["ಸ್ಟ್ರೆಪ್ಟೋಸೈಕ್ಲಿನ್ 1 ಗ್ರಾಂ + ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ 25 ಗ್ರಾಂ 10 ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ."]
      }
    },
    wheat_yellow_rust: {
      hi: {
        name: 'गेहूं का पीला रतुआ (Yellow Rust / Stripe Rust)',
        symptoms: 'पत्तियों पर समानांतर कतारों में चमकीले पीले रंग के पाउडर वाले फफोले बनते हैं। छूने पर अंगुलियों पर हल्दी जैसा पीला पाउडर लग जाता है।',
        bio: ['प्रतिरोधी किस्मों (जैसे HD-2967, PBW-550) की बुवाई करें और संतुलित उर्वरक प्रयोग करें।'],
        chem: ['प्रोपिकोनाजोल 25% EC (टिल्ट) @ 1 मिली/लीटर पानी का छिड़काव लक्षण दिखते ही करें।']
      },
      mr: {
        name: 'गव्हाचा पिवळा तांबेरा (Yellow Rust)',
        symptoms: 'पानांवर समांतर ओळींमध्ये चमकदार पिवळ्या पावडरसारखे फोड येतात. बोटाने स्पर्श केल्यास हळदीसारखा पिवळा रंग हाताला लागतो.',
        bio: ['तांबेरा प्रतिकारक वाण पेरा आणि नत्राचा अतिवापर टाळा.'],
        chem: ['प्रोपिकोनेझोल २५% EC (टिल्ट) @ १ मिली/लिटर पाण्यात मिसळून तातडीने फवारा.']
      },
      gu: {
        name: 'ઘઉંનો પીળો ગેરુ / પટ્ટી ગેરુ (Yellow Rust of Wheat)',
        symptoms: 'પાનની ઉપરની સપાટી પર પીળા રંગના પાવડર જેવા પટ્ટા બને છે જે હળદર જેવા દેખાય છે. હાથ લગાડતા પીળો પાવડર હાથમાં ચોંટે છે. પાન સુકાઈ જાય છે અને દાણા પાતળા રહે છે.',
        bio: ["રોગપ્રતિકારક જાતો (જેમ કે HD-2967, PBW-550) વાવો.", "શરૂઆતના તબક્કે લીમડાનું તેલ ૫ મિલી/લિટર છાંટો."],
        chem: ["પ્રોપિકોનાઝોલ ૨૫% EC (ટિલ્ટ) @ ૧.૦ મિલી/લિટર પાણીમાં ભેળવીને પીળા પટ્ટા દેખાતા જ તાત્કાલિક છંટકાવ કરો.", "ટેબુકોનાઝોલ ૨૫.૯% EC @ ૧.૦ મિલી/લિટર પાણી."]
      },
      pa: {
        name: 'ਕਣਕ ਦਾ ਪੀਲਾ ਰਤੂਆ (Yellow Rust of Wheat)',
        symptoms: 'ਪੱਤਿਆਂ ਉੱਤੇ ਹਲਦੀ ਰੰਗ ਦੀਆਂ ਪੀਲੀਆਂ ਧਾਰੀਆਂ ਬਣਦੀਆਂ ਹਨ। ਹੱਥ ਲਾਉਣ \'ਤੇ ਪੀਲਾ ਪਾਊਡਰ ਉਂਗਲਾਂ ਨੂੰ ਲੱਗਦਾ ਹੈ। ਦਾਣੇ ਬਾਰੀਕ ਰਹਿ ਜਾਂਦੇ ਹਨ।',
        bio: ["ਰਤੂਆ ਰੋਧਕ ਕਿਸਮਾਂ (ਜਿਵੇਂ PBW-550, HD-2967) ਬੀਜੋ।"],
        chem: ["ਪ੍ਰੋਪੀਕੋਨਾਜ਼ੋਲ 25% EC (ਟਿਲਟ) @ 1.0 ਮਿਲੀ/ਲਿਟਰ ਪਾਣੀ (200 ਮਿਲੀ/ਏਕੜ) ਤੁਰੰਤ ਛਿੜਕੋ।"]
      },
      te: {
        name: 'గోధుమ పసుపు కుంకుమ తెగులు (Yellow Rust)',
        symptoms: 'ఆకులపై పసుపు రంగు చారలు ఏర్పడతాయి. ముట్టుకుంటే పసుపు పొడి చేతికి అంటుకుంటుంది.',
        bio: ["తెగులు తట్టుకునే గోధుమ రకాలను సాగు చేయండి."],
        chem: ["ప్రొపికొనజోల్ 25% EC @ 1.0 మి.లీ./లీటరు నీటికి పిచికారీ చేయాలి."]
      },
      ta: {
        name: 'கோதுமை மஞ்சள் துரு நோய் (Yellow Rust)',
        symptoms: 'இலைகளில் மஞ்சள் நிற வரிகள் தோன்றும். தொட்டால் மஞ்சள் தூள் ஒட்டும்.',
        bio: ["நோய் எதிர்ப்புத் திறன் கொண்ட ரகங்களைப் பயிரிடவும்."],
        chem: ["புரோபிகோனசோல் 25% EC @ 1.0 மி.லி./லிட்டர் தண்ணீரில் கலந்து தெளிக்கவும்."]
      },
      bn: {
        name: 'গমের হলুদ মরিচা রোগ (Yellow Rust)',
        symptoms: 'পাতায় হলুদের গুঁড়োর মতো লম্বা দাগ দেখা যায়। হাত দিলে আঙুলে হলুদ গুঁড়ো লেগে যায়।',
        bio: ["রোগ প্রতিরোধী জাত নির্বাচন করুন।"],
        chem: ["প্রোপিকোনাজোল ২৫% EC @ ১.০ মিলি/লিটার জলে স্প্রে করুন।"]
      },
      kn: {
        name: 'ಗೋಧಿ ಹಳದಿ ತುಕ್ಕು ರೋಗ (Yellow Rust)',
        symptoms: 'ಎಲೆಗಳ ಮೇಲೆ ಹಳದಿ ಬಣ್ಣದ ಗೆರೆಗಳು ಮೂಡುತ್ತವೆ. ಮುಟ್ಟಿದರೆ ಅರಿಶಿನ ಪುಡಿ ಕೈಗೆ ಅಂಟುತ್ತದೆ.',
        bio: ["ರೋಗ ನಿರೋಧಕ ತಳಿಗಳನ್ನು ಬಿತ್ತನೆ ಮಾಡಿ."],
        chem: ["ಪ್ರೊಪಿಕೊನಜೋಲ್ 25% EC @ 1.0 ಮಿಲಿ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಸಿಂಪಡಿಸಿ."]
      }
    },
    cotton_pink_bollworm: {
      hi: {
        name: 'कपास की गुलाबी सूंडी (Pink Bollworm of Cotton)',
        symptoms: 'फूल "गुलाब" के रूप में बंद रहते हैं (रोसेटेड फूल)। गूलर/बोंड के अंदर गुलाबी सूंडी बीज और रेशे को खा जाती है, जिससे कपास की गुणवत्ता और उत्पादन घट जाता है।',
        bio: ['फेरोमोन ट्रैप (8 ट्रैप प्रति एकड़) लगाएं और ट्राइकोग्रामा परजीवी ततैया 1.5 लाख प्रति हेक्टेयर छोड़ें।'],
        chem: ['इमामेक्टिन बेंजोएट 5% SG @ 0.4 ग्राम/लीटर या स्पाइनोटेोरम 11.7% SC @ 0.8 मिली/लीटर का छिड़काव करें।']
      },
      mr: {
        name: 'कापसावरील गुलाबी बोंडअळी (Pink Bollworm)',
        symptoms: 'फुले गुलाबासारखी बंद राहतात (रोझेट फुले). बोंडाच्या आत गुलाबी अळी सरकी आणि कापूस कुरतडून खाते, त्यामुळे बोंडे सडतात व प्रत खराब होते.',
        bio: ['कामगंध सापळे (८ सापळे प्रति एकर) लावा आणि ट्रायकोकार्ड्स चा वापर करा.'],
        chem: ['इमामेक्टिन बेन्झोएट ५% SG @ ०.४ ग्रॅम/लिटर किंवा स्पिनोटोरम ११.७% SC @ ०.८ मिली/लिटर फवारा.']
      },
      gu: {
        name: 'કપાસની ગુલાબી ઇયળ (Pink Bollworm of Cotton)',
        symptoms: 'ફૂલ રોઝેટ (ગુલાબ જેવું બંધ) થઈ જાય છે. જીંડવામાં નાનું કાણું પાડી ઇયળ અંદર ઘૂસી બીજ અને રૂને કોરી ખાય છે, જેનાથી જીંડવા સમય પહેલા ખરી પડે છે કે ખરાબ થાય છે.',
        bio: ["પ્રતિ એકર ૫ ફેરોમોન ટ્રેપ લગાવો (પીબીડબ્લ્યુ લ્યોર સાથે).", "ટ્રાઇકોગ્રામા બેક્ટીરીયા કાર્ડ (૫૦,૦૦૦ ઈંડા/એકર) વાવણીના ૪૫ દિવસ પછી ૩ વખત છોડો."],
        chem: ["પ્રોફેનોફોસ ૫૦% EC @ ૨.૦ મિલી/લિટર અથવા ઇમામેક્ટીન બેન્ઝોએટ ૫% SG @ ૦.૫ ગ્રામ/લિટર પાણીમાં છાંટો.", "ક્લોરાન્ટ્રાનિલીપ્રોલ ૧૮.૫% SC (કોરાજન) @ ૦.૩ મિલી/લિટર પાણી."]
      },
      pa: {
        name: 'ਨਰਮੇ ਦੀ ਗੁਲਾਬੀ ਸੁੰਡੀ (Pink Bollworm of Cotton)',
        symptoms: 'ਫੁੱਲ ਗੁਲਾਬ ਦੇ ਫੁੱਲ ਵਾਂਗ ਬੰਦ ਹੋ ਜਾਂਦੇ ਹਨ। ਸੁੰਡੀ ਟੀਂਡੇ ਵਿੱਚ ਵੜ ਕੇ ਵੜੇਵੇਂ ਅਤੇ ਰੂੰ ਨੂੰ ਖਰਾਬ ਕਰ ਦਿੰਦੀ ਹੈ।',
        bio: ["ਪ੍ਰਤੀ ਏਕੜ 5 ਫੇਰੋਮੋਨ ਟਰੈਪ ਲਗਾਓ।"],
        chem: ["ਪ੍ਰੋਫੈਨੋਫਾਸ 50% EC @ 2.0 ਮਿਲੀ/ਲਿਟਰ ਜਾਂ ਕੋਰਾਜਨ @ 0.3 ਮਿਲੀ/ਲਿਟਰ ਪਾਣੀ ਛਿੜਕੋ।"]
      },
      te: {
        name: 'ప్రత్తి గులాబీ రంగు కాయ తొలుచు పురుగు (Pink Bollworm)',
        symptoms: 'పూలు ముడుచుకుపోయి గులాబీ పువ్వులా మారతాయి. పురుగు కాయల్లోకి చొరబడి గింజలు, దూదిని తినేస్తుంది.',
        bio: ["ఎకరాకు 5 లింగాకర్షక బుట్టలు (ఫెరమోన్ ట్రాప్స్) అమర్చండి."],
        chem: ["ప్రొఫెనోఫాస్ 50% EC @ 2.0 మి.లీ./లీటరు లేదా కొరాజెన్ @ 0.3 మి.లీ./లీటరు పిచికారీ చేయండి."]
      },
      ta: {
        name: 'பருத்தி இளஞ்சிவப்பு காய்ப்புழு (Pink Bollworm)',
        symptoms: 'பூக்கள் ரோஜா மலர் போல மூடிக்கொள்ளும். புழு காயினுள் புகுந்து பஞ்சையும் விதையையும் சேதப்படுத்தும்.',
        bio: ["ஏக்கருக்கு 5 இனக்கவர்ச்சி பொறிகளை வைக்கவும்."],
        chem: ["புரோபனோபாస్ 50% EC @ 2.0 மி.லி./லிட்டர் தண்ணீரில் கலந்து தெளிக்கவும்."]
      },
      bn: {
        name: 'তুলার গোলাপী বোলওয়ার্ম পোকা (Pink Bollworm)',
        symptoms: 'ফুল গোলাপের মতো বন্ধ হয়ে যায়। কীড়া গুঁটির মধ্যে ঢুকে বীজ ও তুলা নষ্ট করে ফেলে।',
        bio: ["একরে ৫টি ফেরোমোন ফাঁদ ব্যবহার করুন।"],
        chem: ["প্রোফেনোফস ৫০% EC @ ২.০ মিলি/লিটার জল স্প্রে করুন।"]
      },
      kn: {
        name: 'ಹತ್ತಿಯ ಗುಲಾಬಿ ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು (Pink Bollworm)',
        symptoms: 'ಹೂವುಗಳು ಗುಲಾಬಿಯಂತೆ ಮುಚ್ಚಿಕೊಳ್ಳುತ್ತವೆ. ಕಾಯಿಯೊಳಗೆ ಹುಳು ನುಗ್ಗಿ ಹತ್ತಿ ಮತ್ತು ಬೀಜವನ್ನು ನಾಶಪಡಿಸುತ್ತದೆ.',
        bio: ["ಎಕರೆಗೆ 5 ಮೋಹಕ ಬಲೆಗಳನ್ನು (ಫೆರೋಮೋನ್ ಟ್ರ್ಯಾಪ್) ಅಳವಡಿಸಿ."],
        chem: ["ಪ್ರೊಫೆನೋಫಾಸ್ 50% EC @ 2.0 ಮಿಲಿ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಸಿಂಪಡಿಸಿ."]
      }
    },
    potato_late_blight: {
      hi: {
        name: 'आलू का पछेता झुलसा (Late Blight of Potato)',
        symptoms: 'पत्तियों की नोकों और किनारों पर पानी से भीगे हुए काले-भूरे धब्बे। नम मौसम में पत्तियों की निचली सतह पर सफेद रुई जैसी फफूंद दिखती है।',
        bio: ['ट्राइकोडर्मा विरिडी से कंद उपचार करें और फसल चक्र अपनाएं।'],
        chem: ['मैनकोजेब 75% WP @ 2.5 ग्राम/लीटर या सिमोक्सानिल + मैनकोजेब @ 2.0 ग्राम/लीटर का छिड़काव करें।']
      },
      mr: {
        name: 'बटाट्यावरील उशिरा येणारा करपा (Late Blight)',
        symptoms: 'पानांच्या टोकांवर आणि कडांवर काळे-तपकिरी जळाल्यासारखे ठिपके. ढगाळ व दमट हवामानात पानांच्या खालच्या बाजूला पांढरी बुरशी दिसते.',
        bio: ['ट्रायकोडर्मा व्हिरिडीने बेणेप्रक्रिया करा आणि पिकांची फेरपालट करा.'],
        chem: ['मॅनकोझेब ७५% WP @ २.५ ग्रॅम/लिटर किंवा सायमोक्सॅनिल + मॅनकोझेब @ २.० ग्रॅम/लिटर फवारा.']
      },
      gu: {
        name: 'બટાકાનો પાછોતરો સુકારો (Late Blight of Potato)',
        symptoms: 'પાનની કિનારીઓ પર કાળા-કથ્થઈ પાણીપોચા ડાઘ પડે છે જેના નીચે સફેદ ફૂગની છારી દેખાય છે. ઠંડા અને ભેજવાળા વાતાવરણમાં સમગ્ર છોડ અને કંદ કહોવાઈ જાય છે.',
        bio: ["પ્રમાણિત નિરોગી બિયારણ વાપરો અને વાવણી પહેલાં ટ્રાઇકોડર્માથી બીજ માવજત આપો.", "૧૫ દિવસના અંતરે લીમડાના અર્કનો છંટકાવ કરો."],
        chem: ["મેન્કોઝેબ ૭૫% WP @ ૨.૫ ગ્રામ/લિટર પાણી રક્ષણાત્મક પગલાં તરીકે છાંટો.", "સાઇમોક્સાનીલ + મેન્કોઝેબ (સેક્ટીન) @ ૨.૦ ગ્રામ/લિટર પાણી રોગ દેખાતા જ છાંટો."]
      },
      pa: {
        name: 'ਆਲੂਆਂ ਦਾ ਪਛੇਤਾ ਝੁਲਸ ਰੋਗ (Late Blight of Potato)',
        symptoms: 'ਪੱਤਿਆਂ \'ਤੇ ਕਾਲੇ-ਭੂਰੇ ਪਾਣੀ ਭਿੱਜੇ ਧੱਬੇ ਅਤੇ ਹੇਠਾਂ ਚਿੱਟੀ ਉੱਲੀ। ਠੰਢ ਤੇ ਸਿੱਲ ਵਿੱਚ ਸਾਰਾ ਬੂਟਾ ਸੜ ਜਾਂਦਾ ਹੈ।',
        bio: ["ਨਰੋਏ ਬੀਜਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ।"],
        chem: ["ਮੈਨਕੋਜ਼ੇਬ 75% WP @ 2.5 ਗ੍ਰਾਮ/ਲਿਟਰ ਜਾਂ ਰਿਡੋਮਿਲ ਗੋਲਡ @ 2.0 ਗ੍ਰਾਮ/ਲਿਟਰ ਪਾਣੀ ਛਿੜਕੋ।"]
      },
      te: {
        name: 'బంగాళాదుంప లేట్ బ్లైట్ తెగులు (Late Blight)',
        symptoms: 'ఆకుల అంచులపై నీటి మచ్చలు, కింద తెల్లటి బూజు. చల్లటి తేమ వాతావరణంలో పంట త్వరగా కుళ్ళిపోతుంది.',
        bio: ["ఆరోగ్యకరమైన విత్తన దుంపలను వాడండి."],
        chem: ["మాంకోజెబ్ 75% WP @ 2.5 గ్రాములు లేదా రిడోమిల్ @ 2.0 గ్రాములు/లీటరు నీటికి పిచికారీ చేయాలి."]
      },
      ta: {
        name: 'உருளைக்கிழங்கு பின்தங்கிய கருகல் நோய் (Late Blight)',
        symptoms: 'இலைகளில் கரும்பழுப்பு நிற புள்ளிகள் மற்றும் அடிப்பகுதியில் வெள்ளை பூஞ்சணம் தோன்றி பயிர் அழுகும்.',
        bio: ["நோயற்ற விதைக்கிழங்குகளை நடவு செய்யவும்."],
        chem: ["மேன்கோசெப் 75% WP @ 2.5 கிராம்/லிட்டர் தண்ணீரில் தெளிக்கவும்."]
      },
      bn: {
        name: 'আলুর নাবী ধসা রোগ (Late Blight of Potato)',
        symptoms: 'পাতায় জলভেজা কালচে বাদামী দাগ ও পাতার নিচে সাদা ছত্রাকের বৃদ্ধি। গাছ ও আলু দ্রুত পচে যায়।',
        bio: ["রোগমুক্ত প্রত্যয়িত বীজ আলু ব্যবহার করুন।"],
        chem: ["ম্যানকোজেব ৭৫% WP @ ২.৫ গ্রাম বা রিডোমিল গোল্ড @ ২.০ গ্রাম/লিটার জল স্প্রে করুন।"]
      },
      kn: {
        name: 'ಆಲೂಗಡ್ಡೆ ತಡ ಅಂಗಮಾರಿ ರೋಗ (Late Blight)',
        symptoms: 'ಎಲೆಗಳ ಮೇಲೆ ಕಪ್ಪು-ಕಂದು ನೀರುಗುಳ್ಳೆಯಂತಹ ಮಚ್ಚೆಗಳು ಮತ್ತು ಎಲೆಯ ಕೆಳಗೆ ಬಿಳಿ ಬೂಜು.',
        bio: ["ರೋಗಮುಕ್ತ ಬೀಜದ ಆಲೂಗಡ್ಡೆಯನ್ನು ಬಳಸಿ."],
        chem: ["ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP @ 2.5 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಸಿಂಪಡಿಸಿ."]
      }
    },
    tomato_leaf_curl: {
      hi: {
        name: 'टमाटर का पर्ण कुंचन रोग (Tomato Leaf Curl Virus / ToLCV)',
        symptoms: 'पत्तियां ऊपर और अंदर की ओर मुड़कर छोटी, मोटी व विकृत हो जाती हैं। पौधे बौने रह जाते हैं और फल नहीं लगते। यह सफेद मक्खी द्वारा फैलता है।',
        bio: ['पीले चिपचिपे कार्ड (15-20 प्रति एकड़) लगाएं और नीम का तेल 3 मिली/लीटर छिड़कें।'],
        chem: ['सफेद मक्खी नियंत्रण के लिए डाइफेन्थियूरॉन 50% WP @ 1.2 ग्राम/लीटर या एसिटामिप्रिड 20% SP @ 0.3 ग्राम/लीटर का छिड़काव करें।']
      },
      mr: {
        name: 'टोमॅटोचा पर्णगुच्छ रोग (Tomato Leaf Curl Virus)',
        symptoms: 'पाने वरच्या बाजूला वळतात, आकसतात आणि जाड होतात. झाडाची वाढ खुंटते व फळधारणा थांबते. हा विषाणू पांढऱ्या माशीमार्फत पसरतो.',
        bio: ['पिवळे चिकट सापळे (१५-२० प्रति एकर) लावा आणि कडुलिंब तेल ३ मिली/लिटर फवारा.'],
        chem: ['पांढऱ्या माशीच्या नियंत्रणासाठी डायफेन्थिउरॉन ५०% WP @ १.२ ग्रॅम/लिटर किंवा अ‍ॅसिटामिप्रीड २०% SP @ ०.३ ग्रॅम/लिटर फवारा.']
      },
      gu: {
        name: 'ટમેટાનો પાનનો કોકડવા રોગ (Tomato Leaf Curl Virus)',
        symptoms: 'પાન ઉપર તરફ વળીને નાના અને જાડા થઈ જાય છે. છોડનો વિકાસ અટકી જાય છે (ઠીંગણો બને છે) અને ફળ લાગતા નથી. આ રોગ સફેદ માખી દ્વારા ફેલાય છે.',
        bio: ["સફેદ માખી પકડવા માટે પ્રતિ એકર ૧૫ પીળા ચીકણા ટ્રેપ (યલો સ્ટીકી ટ્રેપ) લગાવો.", "વાવણી વખતે લીમડાની ખોળ ૧૦૦ કિગ્રા/એકર જમીનમાં આપો."],
        chem: ["સફેદ માખી નિયંત્રણ માટે ડાયફેન્થિયુરોન ૫૦% WP @ ૧.૨ ગ્રામ/લિટર અથવા ઇમિડાક્લોપ્રિડ ૧૭.૮% SL @ ૦.૩ મિલી/લિટર છાંટો."]
      },
      pa: {
        name: 'ਟਮਾਟਰ ਦਾ ਪੱਤਾ ਮਰੋੜ ਰੋਗ (Tomato Leaf Curl Virus)',
        symptoms: 'ਪੱਤੇ ਉੱਪਰ ਵੱਲ ਮੁੜ ਕੇ ਨਿੱਕੇ ਤੇ ਮੋਟੇ ਹੋ ਜਾਂਦੇ ਹਨ। ਬੂਟੇ ਮਧਰੇ ਰਹਿ ਜਾਂਦੇ ਹਨ। ਚਿੱਟੀ ਮੱਖੀ ਰਾਹੀਂ ਫੈਲਦਾ ਹੈ।',
        bio: ["ਪ੍ਰਤੀ ਏਕੜ 15 ਪੀਲੇ ਚਿਪਚਿਪੇ ਟਰੈਪ ਲਗਾਓ।"],
        chem: ["ਇਮੀਡਾਕਲੋਪ੍ਰਿਡ 17.8% SL @ 0.3 ਮਿਲੀ/ਲਿਟਰ ਪਾਣੀ ਛਿੜਕੋ।"]
      },
      te: {
        name: 'టమాట ఆకుముడుత వైరస్ తెగులు (Leaf Curl)',
        symptoms: 'ఆకులు పైకి ముడుచుకుని దళసరిగా మారతాయి. మొక్క గిడసబారి కాపు రాదు. తెల్లదోమ ద్వారా వ్యాపిస్తుంది.',
        bio: ["ఎకరాకు 15 పసుపు రంగు జిగురు బోర్డులు అమర్చండి."],
        chem: ["తెల్లదోమ నివారణకు ఇమిడాక్లోప్రిడ్ @ 0.3 మి.లీ./లీటరు నీటికి పిచికారీ చేయాలి."]
      },
      ta: {
        name: 'தக்காளி இலைச்சுருட்டு வைரஸ் நோய் (Leaf Curl)',
        symptoms: 'இலைகள் மேல்நோக்கி சுருண்டு தடிமனாகும். செடி குட்டையாகி காய் பிடிக்காது.',
        bio: ["ஏக்கருக்கு 15 மஞ்சள் நிற ஒட்டும் பொறிகளை வைக்கவும்."],
        chem: ["வெள்ளை ஈ கட்டுப்பாட்டுக்கு இமிடாகுளோபிரிட் @ 0.3 மி.லி./லிட்டர் தெளிக்கவும்."]
      },
      bn: {
        name: 'টমেটোর পাতা কোঁকড়ানো রোগ (Tomato Leaf Curl)',
        symptoms: 'পাতা ওপরের দিকে কুঁকড়ে খসখসে ও মোটা হয়। গাছ বেঁটে হয়ে ফল আসা বন্ধ হয়। সাদা মাছি বাহক।',
        bio: ["জমিতে একরে ১৫টি হলুদ আঠালো ফাঁদ লাগান।"],
        chem: ["ইমিডাক্লোপ্রিড ১৭.৮% SL @ ০.৩ মিলি/লিটার জল স্প্রে করুন।"]
      },
      kn: {
        name: 'ಟೊಮೇಟೊ ಎಲೆ ಮುಟುರು ರೋಗ (Tomato Leaf Curl)',
        symptoms: 'ಎಲೆಗಳು ಮೇಲ್ಮುಖವಾಗಿ ಸುರುಟಿಕೊಂಡು ದಪ್ಪಗಾಗುತ್ತವೆ. ಗಿಡ ಗಿಡ್ಡವಾಗಿ ಕಾಯಿ ಕಚ್ಚುವುದಿಲ್ಲ.',
        bio: ["ಎಕರೆಗೆ 15 ಹಳದಿ ಅಂಟು ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ."],
        chem: ["ಬಿಳಿ ನೊಣ ನಿಯಂತ್ರಣಕ್ಕೆ ಇಮಿಡಾಕ್ಲೋಪ್ರಿಡ್ @ 0.3 ಮಿಲಿ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ."]
      }
    },
    sugarcane_red_rot: {
      hi: {
        name: 'गन्ने का लाल सड़न रोग (Red Rot of Sugarcane)',
        symptoms: 'गन्ने की तीसरी व चौथी पत्ती पीली पड़कर सूखने लगती है। गन्ने को बीच से चीरने पर अंदर का गूदा लाल दिखाई देता है जिसमें सफेद आड़ी धारियां और सिरके जैसी गंध आती है।',
        bio: ['स्वस्थ और प्रमाणित बीज सेट का ही उपयोग करें। ट्राइकोडर्मा हरजिएनम से सेट उपचार करें।'],
        chem: ['कार्बेन्डाजिम 50% WP (1 ग्राम/लीटर) के घोल में बीज सेट्स को 15 मिनट डुबोकर बोएं।']
      },
      mr: {
        name: 'उसाचा तांबेरा / लाल कुजव्या रोग (Red Rot of Sugarcane)',
        symptoms: 'उसाची मधली पाने सुकू लागतात. ऊस उभा चिरल्यास आतील गर लाल दिसतो, त्यावर पांढरे पट्टे दिसतात आणि उसातून आंबूस वास येतो.',
        bio: ['निरोगी बेणे निवडा आणि ट्रायकोडर्माने बेणे प्रक्रिया करा.'],
        chem: ['कार्बेन्डाझिम ५०% WP (१ ग्रॅम/लिटर) च्या द्रावणात बेणे १५ मिनिटे बुडवून नंतर लागवड करा.']
      },
      gu: {
        name: 'શેરડીનો લાલ સડો (Red Rot of Sugarcane)',
        symptoms: 'ત્રીજા-ચોથા પાનથી સુકાવાનું શરૂ થઈ સમગ્ર પાંદડા પીળા-કથ્થઈ પડી જાય છે. સાંઠાને લંબાઈમાં ચીરતા અંદરનો ગર લાલ થઈ ગયેલો દેખાય છે જેમાં સફેદ આડા પટ્ટા અને ખાટી આલ્કોહોલ જેવી ગંધ આવે છે.',
        bio: ["રોગમુક્ત પ્રમાણિત બીજ-સાંઠા પસંદ કરો.", "ટ્રાઇકોડર્મા હાર્ઝિયાનમથી સાંઠા માવજત કરો."],
        chem: ["કાર્બેન્ડાઝીમ ૫૦% WP @ ૨.૦ ગ્રામ/લિટર પાણીના દ્રાવણમાં સાંઠાને ૧૫ મિનિટ બોળીને વાવો."]
      },
      pa: {
        name: 'ਗੰਨੇ ਦਾ ਰੱਤਾ ਰੋਗ / ਲਾਲ ਸੜਨ (Red Rot of Sugarcane)',
        symptoms: 'ਗੰਨਾ ਅੰਦਰੋਂ ਲਾਲ ਹੋ ਜਾਂਦਾ ਹੈ ਅਤੇ ਚਿੱਟੀਆਂ ਧਾਰੀਆਂ ਬਣ ਜਾਂਦੀਆਂ ਹਨ। ਗੰਨੇ ਵਿੱਚੋਂ ਸ਼ਰਾਬ ਵਰਗੀ ਖੱਟੀ ਬੋਅ ਆਉਂਦੀ ਹੈ।',
        bio: ["ਨਰੋਏ ਤੇ ਤੰਦਰੁਸਤ ਗੰਨੇ ਬੀਜੋ।"],
        chem: ["ਕਾਰਬੈਂਡਾਜ਼ਿਮ 2 ਗ੍ਰਾਮ/ਲਿਟਰ ਪਾਣੀ ਦੇ ਘੋਲ ਵਿੱਚ ਗੰਨੇ ਦੇ ਪੋਰਿਆਂ ਨੂੰ ਡੋਬ ਕੇ ਬੀਜੋ।"]
      },
      te: {
        name: 'చెరకు ఎర్రకుళ్ళు తెగులు (Red Rot)',
        symptoms: 'చెరకు లోపలి భాగం ఎర్రగా మారి తెల్లటి చారలు ఏర్పడతాయి. పులిసిన వాసన వస్తుంది.',
        bio: ["తెగులు లేని ఆరోగ్యకరమైన విత్తన ముచ్చెలను ఎన్నుకోండి."],
        chem: ["కార్బెండజిమ్ 50% WP @ 2.0 గ్రాములు/లీటరు నీటి ద్రావణంలో ముచ్చెలను నానబెట్టి నాటాలి."]
      },
      ta: {
        name: 'கரும்பு செவ்வழுகல் நோய் (Red Rot)',
        symptoms: 'கரும்பின் உட்பகுதி சிவப்பாக மாறி வெள்ளை வரிகள் தோன்றும். சாராய நெடி வீசும்.',
        bio: ["நோய் தாக்காத விதைக் கரணைகளை நடவு செய்யவும்."],
        chem: ["கார்பெண்டாசிம் 2.0 கிராம்/லிட்டர் கரைசலில் கரணைகளை நனைத்து நடவும்."]
      },
      bn: {
        name: 'আখের লাল পচা রোগ (Red Rot of Sugarcane)',
        symptoms: 'আখের ভেতরের অংশ লাল হয়ে সাদা আড়াআড়ি দাগ পড়ে এবং টক মদের গন্ধ বের হয়।',
        bio: ["রোগমুক্ত বিশুদ্ধ আখের চারা রোপণ করুন।"],
        chem: ["কার্বেনডাজিম ২.০ গ্রাম/লিটার জলে আখের টুকরো ভিজিয়ে শোধন করুন।"]
      },
      kn: {
        name: 'ಕಬ್ಬಿನ ಕೆಂಪು ಕೊಳೆ ರೋಗ (Red Rot)',
        symptoms: 'ಕಬ್ಬಿನ ಒಳಗಿನ ಭಾಗ ಕೆಂಪಾಗಿ ಬಿಳಿ ಪಟ್ಟಿಗಳು ಮೂಡುತ್ತವೆ. ಹುಳಿ ವಾಸನೆ ಬರುತ್ತದೆ.',
        bio: ["ಆರೋಗ್ಯಕರ ಬೀಜದ ಕಬ್ಬಿನ ತುಂಡುಗಳನ್ನು ಆರಿಸಿ."],
        chem: ["ಕಾರ್ಬೆಂಡಾಜಿಮ್ 2.0 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿನ ದ್ರಾವಣದಲ್ಲಿ ಕಬ್ಬಿನ ತುಂಡುಗಳನ್ನು ಅದ್ದಿ ನೆಡಿ."]
      }
    },
    soybean_yellow_mosaic: {
      hi: {
        name: 'सोयाबीन का पीला मोजेक रोग (Yellow Mosaic Virus of Soybean)',
        symptoms: 'पत्तियों पर पीले और हरे रंग के चितकबरे धब्बे बन जाते हैं। धीरे-धीरे पूरी पत्ती पीली हो जाती है और फलियों में दाने नहीं बनते या छोटे रह जाते हैं।',
        bio: ['पीले चिपचिपे कार्ड लगाएं और रोगग्रस्त पौधों को शुरुआत में ही उखाड़कर नष्ट कर दें।'],
        chem: ['थियामेथोक्सम 25% WG @ 0.3 ग्राम/लीटर पानी का छिड़काव करें।']
      },
      mr: {
        name: 'सोयाबीनचा पिवळा मोझॅक रोग (Yellow Mosaic Virus)',
        symptoms: 'पानांवर पिवळे व हिरवे चट्टे तयार होतात. नंतर संपूर्ण पाने पिवळी पडतात आणि शेंगांमध्ये दाणे भरत नाहीत. हा रोग पांढऱ्या माशीमुळे पसरतो.',
        bio: ['पिवळे चिकट सापळे लावा आणि रोगट झाडे सुरुवातीलाच उपटून नष्ट करा.'],
        chem: ['थायमेथॉक्सम २५% WG @ ०.३ ग्रॅम/लिटर पाण्यात मिसळून फवारा.']
      },
      gu: {
        name: 'સોયાબીનનો પીળો મોઝેક રોગ (Yellow Mosaic Virus)',
        symptoms: 'પાન પર અનિયમિત પીળા અને લીલા ધાબા પડી જાય છે. પાન સંપૂર્ણ પીળા થઈને કદમાં નાના રહે છે. સફેદ માખી દ્વારા ફેલાય છે.',
        bio: ["પ્રતિ એકર ૧૦ પીળા ચીકણા ટ્રેપ લગાવો."],
        chem: ["થાયામેથોક્સમ ૨૫% WG @ ૦.૫ ગ્રામ/લિટર અથવા એસીટામિપ્રિડ @ ૦.૪ ગ્રામ/લિટર છાંટો."]
      },
      pa: {
        name: 'ਸੋਇਆਬੀਨ ਦਾ ਪੀਲਾ ਮੋਜ਼ੇਕ ਰੋਗ (Yellow Mosaic Virus)',
        symptoms: 'ਪੱਤਿਆਂ \'ਤੇ ਪੀਲੇ ਤੇ ਹਰੇ ਧੱਬੇ ਪੈ ਜਾਂਦੇ ਹਨ। ਚਿੱਟੀ ਮੱਖੀ ਦੁਆਰਾ ਫੈਲਦਾ ਹੈ।',
        bio: ["ਪੀਲੇ ਚਿਪਚਿਪੇ ਟਰੈਪ ਲਗਾਓ।"],
        chem: ["ਥਾਇਆਮੈਥੋਕਸਮ 25% WG @ 0.5 ਗ੍ਰਾਮ/ਲਿਟਰ ਪਾਣੀ ਛਿੜਕੋ।"]
      },
      te: {
        name: 'సోయాబీన్ పల్లాకు తెగులు (Yellow Mosaic)',
        symptoms: 'ఆకులపై పసుపు మరియు ఆకుపచ్చ రంగు మచ్చలు ఏర్పడతాయి. తెల్లదోమ ద్వారా వ్యాపిస్తుంది.',
        bio: ["పసుపు జిగురు అట్టలను అమర్చండి."],
        chem: ["థయామెథోక్సామ్ 25% WG @ 0.5 గ్రాములు/లీటరు నీటికి పిచికారీ చేయాలి."]
      },
      ta: {
        name: 'சோயாபீன் மஞ்சள் தேமல் நோய் (Yellow Mosaic)',
        symptoms: 'இலைகளில் மஞ்சள் மற்றும் பச்சை நிற திட்டுகள் தோன்றும். வெள்ளை ஈ மூலம் பரவும்.',
        bio: ["மஞ்சள் ஒட்டும் பொறிகளை அமைக்கவும்."],
        chem: ["தையமீதாக்சಮ್ 25% WG @ 0.5 கிராம்/லிட்டர் தண்ணீரில் தெளிக்கவும்."]
      },
      bn: {
        name: 'সয়াবিনের হলুদ মোজাইক ভাইরাস (Yellow Mosaic)',
        symptoms: 'পাতায় অনিয়মিত হলুদ ও সবুজ ছোপ পড়ে। সাদা মাছি দ্বারা ছড়ায়।',
        bio: ["হলুদ আঠালো ফাঁদ ব্যবহার করুন।"],
        chem: ["থায়ামেথক্সাম ২৫% WG @ ০.৫ গ্রাম/লিটার জল স্প্রে করুন।"]
      },
      kn: {
        name: 'ಸೋಯಾಬೀನ್ ಹಳದಿ ಮೊಸಾಯಿಕ್ ರೋಗ (Yellow Mosaic)',
        symptoms: 'ಎಲೆಗಳ ಮೇಲೆ ಹಳದಿ ಮತ್ತು ಹಸಿರು ತೇಪೆಗಳು ಮೂಡುತ್ತವೆ. ಬಿಳಿ ನೊಣದಿಂದ ಹರಡುತ್ತದೆ.',
        bio: ["ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು ಇರಿಸಿ."],
        chem: ["ಥಯಾಮೆಥಾಕ್ಸಮ್ 25% WG @ 0.5 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಸಿಂಪಡಿಸಿ."]
      }
    },
    groundnut_tikka: {
      hi: {
        name: 'मूंगफली का टिक्का रोग / पत्ती धब्बा (Tikka Disease of Groundnut)',
        symptoms: 'पत्तियों पर गोल गहरे भूरे से काले धब्बे बनते हैं जिनके चारों ओर पीला छल्ला होता है। गंभीर संक्रमण में पत्तियां जल्दी गिर जाती हैं।',
        bio: ['स्यूडोमोनास फ्लोरेसेंस 10 ग्राम/किग्रा बीज से उपचार करें और नीम तेल (2%) का छिड़काव करें।'],
        chem: ['कार्बेन्डाजिम 12% + मैनकोजेब 63% WP (साफ / Saaf) @ 2 ग्राम/लीटर पानी का छिड़काव करें।']
      },
      mr: {
        name: 'भुईमुगावरील टिक्का रोग (Tikka Disease)',
        symptoms: 'पानांवर गोल गडद तपकिरी ते काळे ठिपके पडतात आणि त्यांच्या भोवती पिवळे कडे असते. तीव्र संसर्गात पाने गळून पडतात.',
        bio: ['स्यूडोमोनस फ्लोरेसेन्सने बीजप्रक्रिया करा आणि २% निंबोळी अर्क फवारा.'],
        chem: ['कार्बेन्डाझिम १२% + मॅनकोझेब ६३% WP (साफ / Saaf) @ २ ग्रॅम/लिटर पाण्यात मिसळून फवारा.']
      },
      gu: {
        name: 'મગફળીનો ટીક્કા રોગ / પાનના ટપકાં (Tikka Disease of Groundnut)',
        symptoms: 'પાન પર ઘેરા કથ્થઈ અથવા કાળા ગોળાકાર ટપકાં પડે છે જેની ફરતે પીળી કિનારી હોય છે. તીવ્ર ઉપદ્રવમાં પાન ખરી પડે છે.',
        bio: ["ટ્રાઇકોડર્માથી બીજ માવજત આપો."],
        chem: ["મેન્કોઝેબ ૭૫% WP @ ૨.૫ ગ્રામ/લિટર અથવા કાર્બેન્ડાઝીમ ૧૨% + મેન્કોઝેબ ૬૩% WP (સાફ) @ ૨.૦ ગ્રામ/લિટર છાંટો."]
      },
      pa: {
        name: 'ਮੂੰਗਫਲੀ ਦਾ ਟਿੱਕਾ ਰੋਗ (Tikka Disease of Groundnut)',
        symptoms: 'ਪੱਤਿਆਂ \'ਤੇ ਗੋਲ ਕਾਲੇ ਧੱਬੇ ਜਿਨ੍ਹਾਂ ਦੁਆਲੇ ਪੀਲਾ ਘੇਰਾ ਹੁੰਦਾ ਹੈ।',
        bio: ["ਟ੍ਰਾਈਕੋਡਰਮਾ ਨਾਲ ਬੀਜ ਸੋਧੋ।"],
        chem: ["ਸਾਫ਼ (ਕਾਰਬੈਂਡਾਜ਼ਿਮ + ਮੈਨਕੋਜ਼ੇਬ) @ 2.0 ਗ੍ਰਾਮ/ਲਿਟਰ ਪਾਣੀ ਛਿੜਕੋ।"]
      },
      te: {
        name: 'వేరుశనగ తిక్కా ఆకుమచ్చ తెగులు (Tikka Disease)',
        symptoms: 'ఆకులపై గుండ్రటి ముదురు గోధుమ లేదా నల్లటి మచ్చలు ఏర్పడతాయి. చుట్టూ పసుపు రంగు వలయం ఉంటుంది.',
        bio: ["ట్రైకోడెర్మ తో విత్తన శుద్ధి చేయండి."],
        chem: ["కార్బెండజిమ్ + మాంకోజెబ్ (సాఫ్) @ 2.0 గ్రాములు/లీటరు నీటికి పిచికారీ చేయాలి."]
      },
      ta: {
        name: 'நிலக்கடலை டிக்கா இலைப்புள்ளி நோய் (Tikka Disease)',
        symptoms: 'இலைகளில் வட்ட வடிவ கரும்பழுப்பு நிற புள்ளிகள் சுற்றிலும் மஞ்சள் வளையத்துடன் தோன்றும்.',
        bio: ["டிரைக்கோடெர்மா மூலம் விதை நேர்த்தி செய்யவும்."],
        chem: ["கார்பெண்டாசிம் + மேன்கோசெப் @ 2.0 கிராம்/லிட்டர் தண்ணீரில் தெளிக்கவும்."]
      },
      bn: {
        name: 'চীনাবাদামের টিক্কা রোগ (Tikka Disease)',
        symptoms: 'পাতায় গোলাকার গাঢ় বাদামী দাগ ও তার চারপাশে হলুদ বলয় দেখা যায়। পাতা ঝরে পড়ে।',
        bio: ["ট্রাইকোডার্মা দিয়ে বীজ শোধন করুন।"],
        chem: ["ম্যানকোজেব + কার্বেনডাজিম @ ২.০ গ্রাম/লিটার জল স্প্রে করুন।"]
      },
      kn: {
        name: 'ಕಡಲೆಕಾಯಿ ತಿಕ್ಕಾ ಎಲೆಚುಕ್ಕೆ ರೋಗ (Tikka Disease)',
        symptoms: 'ಎಲೆಗಳ ಮೇಲೆ ಕಡು ಕಂದು ಅಥವಾ ಕಪ್ಪು ಬಣ್ಣದ ದುಂಡಗಿನ ಮಚ್ಚೆಗಳು ಮತ್ತು ಸುತ್ತಲೂ ಹಳದಿ ವೃತ್ತ.',
        bio: ["ಟ್ರೈಕೋಡರ್ಮಾದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ."],
        chem: ["ಕಾರ್ಬೆಂಡಾಜಿಮ್ + ಮ್ಯಾಂಕೋಜೆಬ್ (ಸಾಫ್) @ 2.0 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಸಿಂಪಡಿಸಿ."]
      }
    },
    mustard_white_rust: {
      hi: {
        name: 'सरसों का सफेद रतुआ (White Rust of Mustard)',
        symptoms: 'पत्तियों की निचली सतह पर सफेद या हल्के पीले उभरे हुए छाले बनते हैं। फूल विकृत होकर फूल जाते हैं।',
        bio: ['प्रमाणित बीजों का प्रयोग करें और समय पर बुवाई करें।'],
        chem: ['रिडोमिल एमजेड (मेटालेक्सिल 8% + मैनकोजेब 64%) @ 2 ग्राम/लीटर पानी का छिड़काव करें।']
      },
      mr: {
        name: 'मोहरीवरील पांढरा तांबेरा (White Rust)',
        symptoms: 'पानांच्या खालच्या पृष्ठभागावर पांढरे किंवा फिकट पिवळे फोड येतात. फुलोरा विकृत होतो.',
        bio: ['प्रमाणित बियाणे वापरा आणि वेळेवर पेरणी करा.'],
        chem: ['रिडोमिल एमझेड (मेटॅलॅक्सिल ८% + मॅनकोझेब ६४%) @ २ ग्रॅम/लिटर फवारा.']
      },
      gu: {
        name: 'રાયડાનો સફેદ ગેરુ (White Rust of Mustard)',
        symptoms: 'પાનની નીચેની સપાટી પર સફેદ અથવા આછા પીળા રંગના ચમકતા ફોલ્લા પડે છે. ફૂલો વિકૃત થઈને જાડા માંસલ બની જાય છે.',
        bio: ["રોગમુક્ત પ્રમાણિત બીજ વાપરો."],
        chem: ["મેટાલેક્સિલ ૮% + મેન્કોઝેબ ૬૪% WP (રીડોમિલ ગોલ્ડ) @ ૨.૦ ગ્રામ/લિટર પાણીમાં છાંટો."]
      },
      pa: {
        name: 'ਸਰ੍ਹੋਂ ਦਾ ਚਿੱਟਾ ਰਤੂਆ (White Rust of Mustard)',
        symptoms: 'ਪੱਤਿਆਂ ਦੇ ਹੇਠਾਂ ਚਿੱਟੇ ਰੰਗ ਦੇ ਛਾਲੇ ਬਣਦੇ ਹਨ। ਫੁੱਲ ਮੋਟੇ ਤੇ ਬੇਢੰਗੇ ਹੋ ਜਾਂਦੇ ਹਨ।',
        bio: ["ਨਰੋਏ ਬੀਜ ਵਰਤੋ।"],
        chem: ["ਰਿਡੋਮਿਲ ਗੋਲਡ @ 2.0 ਗ੍ਰਾਮ/ਲਿਟਰ ਪਾਣੀ ਛਿੜਕੋ।"]
      },
      te: {
        name: 'ఆవాల తెల్ల కుంకుమ తెగులు (White Rust)',
        symptoms: 'ఆకుల అడుగు భాగంలో తెల్లటి పొక్కులు ఏర్పడతాయి. పూల గుత్తులు వికృతంగా లావుగా మారతాయి.',
        bio: ["ఆరోగ్యకరమైన విత్తనాలను వాడండి."],
        chem: ["రిడోమిల్ గోల్డ్ @ 2.0 గ్రాములు/లీటరు నీటికి పిచికారీ చేయాలి."]
      },
      ta: {
        name: 'கடுகு வெள்ளை துரு நோய் (White Rust)',
        symptoms: 'இலையின் அடிப்பகுதியில் வெள்ளை நிற கொப்புளங்கள் தோன்றும். பூக்கள் தடித்து உருமாறும்.',
        bio: ["சான்றளிக்கப்பட்ட விதைகளைப் பயன்படுத்தவும்."],
        chem: ["மெட்டலாக்சில் + மேன்கோசெப் @ 2.0 கிராம்/லிட்டர் தெளிக்கவும்."]
      },
      bn: {
        name: 'সরিষার সাদা মরিচা রোগ (White Rust)',
        symptoms: 'পাতার নিচে চকচকে সাদা রঙের ফোস্কা পড়ে। ফুল বিকৃত ও মাংসল হয়ে যায়।',
        bio: ["পরিশোধিত বীজ বপন করুন।"],
        chem: ["রিডোমিল গোল্ড @ ২.০ গ্রাম/লিটার জল স্প্রে করুন।"]
      },
      kn: {
        name: 'ಸಾಸಿವೆ ಬಿಳಿ ತುಕ್ಕು ರೋಗ (White Rust)',
        symptoms: 'ಎಲೆಯ ಕೆಳಭಾಗದಲ್ಲಿ ಬಿಳಿ ಬಣ್ಣದ ಗುಳ್ಳೆಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ. ಹೂವುಗಳು ವಿರೂಪಗೊಳ್ಳುತ್ತವೆ.',
        bio: ["ದೃಢೀಕೃತ ಬೀಜಗಳನ್ನು ಬಳಸಿ."],
        chem: ["ರಿಡೋಮಿಲ್ ಗೋಲ್ಡ್ @ 2.0 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಸಿಂಪಡಿಸಿ."]
      }
    },
    onion_purple_blotch: {
      hi: {
        name: 'प्याज का बैंगनी धब्बा रोग (Purple Blotch of Onion)',
        symptoms: 'पत्तियों पर छोटे, पानी से भीगे धब्बे जो बाद में केंद्र में बैंगनी और किनारों पर भूरे हो जाते हैं। पत्तियां बीच से टूट जाती हैं।',
        bio: ['ट्राइकोडर्मा से कंद उपचार करें और अतिरिक्त नाइट्रोजन का प्रयोग न करें।'],
        chem: ['डाइफेनोकोनाजोल 25% EC (स्कोर) @ 1 मिली/लीटर या मैनकोजेब @ 2.5 ग्राम/लीटर का छिड़काव करें।']
      },
      mr: {
        name: 'कांद्यावरील जांभळा करपा (Purple Blotch)',
        symptoms: 'पानांवर सुरुवातीला लहान पांढुरके ठिपके येतात जे नंतर मध्यभागी जांभळे व कडेला तपकिरी होतात. पाने मधेच वाकून मोडतात.',
        bio: ['ट्रायकोडर्माने पुनर्लागवड प्रक्रिया करा आणि नत्राचा अतिरेक टाळा.'],
        chem: ['डायफेनोकोनॅझोल २५% EC (स्कोर) @ १ मिली/लिटर किंवा मॅनकोझेब @ २.५ ग्रॅम/लिटर फवारा.']
      },
      gu: {
        name: 'ડુંગળીનો જાંબલી સુકારો / પર્પલ બ્લોચ (Purple Blotch of Onion)',
        symptoms: 'પાન પર નાના પાણીપોચા ડાઘ પડે છે જે મોટા થઈને કેન્દ્રમાં જાંબુડી-કથ્થઈ રંગના બને છે. પાન વચમાંથી વળીને સુકાઈ જાય છે.',
        bio: ["બીજને ટ્રાઇકોડર્મા વિરીડીથી માવજત આપો."],
        chem: ["ડાઇફેનોકોનાઝોલ ૨૫% EC @ ૧.૦ મિલી/લિટર અથવા ટેબુકોનાઝોલ @ ૧.૦ મિલી/લિટર પાણીમાં છાંટો."]
      },
      pa: {
        name: 'ਗੰਢਿਆਂ ਦਾ ਜਾਮਣੀ ਧੱਬਾ ਰੋਗ (Purple Blotch of Onion)',
        symptoms: 'ਪੱਤਿਆਂ \'ਤੇ ਜਾਮਣੀ ਰੰਗ ਦੇ ਲੰਬੂਤਰੇ ਧੱਬੇ ਪੈ ਜਾਂਦੇ ਹਨ ਅਤੇ ਪੱਤੇ ਵਿਚਕਾਰੋਂ ਟੁੱਟ ਜਾਂਦੇ ਹਨ।',
        bio: ["ਟ੍ਰਾਈਕੋਡਰਮਾ ਨਾਲ ਬੀਜ ਸੋਧੋ।"],
        chem: ["ਡਾਈਫੇਨੋਕੋਨਾਜ਼ੋਲ @ 1.0 ਮਿਲੀ/ਲਿਟਰ ਪਾਣੀ ਛਿੜਕੋ।"]
      },
      te: {
        name: 'ఉల్లి ఊదా రంగు మచ్చ తెగులు (Purple Blotch)',
        symptoms: 'ఆకులపై ఊదా రంగు మచ్చలు ఏర్పడి ఆకులు మధ్యకు విరిగి ఎండిపోతాయి.',
        bio: ["ట్రైకోడెర్మ తో విత్తన శుద్ధి చేయండి."],
        chem: ["డైఫెనోకొనజోల్ 25% EC @ 1.0 మి.లీ./లీటరు నీటికి పిచికారీ చేయాలి."]
      },
      ta: {
        name: 'வெங்காயம் ஊதா நிற கருகல் நோய் (Purple Blotch)',
        symptoms: 'இலைகளில் ஊதா நிற புள்ளிகள் தோன்றி இலைகள் நடுவில் மடிந்து காயும்.',
        bio: ["டிரைக்கோடெர்மா மூலம் விதை நேர்த்தி செய்யவும்."],
        chem: ["டைபனோகோனசோல் @ 1.0 மி.லி./லிட்டர் தண்ணீரில் தெளிக்கவும்."]
      },
      bn: {
        name: 'পেঁয়াজের পার্পল ব্লচ বা বেগুনি দাগ রোগ (Purple Blotch)',
        symptoms: 'পাতায় বেগুনি রঙের লম্বাটে দাগ পড়ে এবং পাতা মাঝখান থেকে ভেঙে শুকিয়ে যায়।',
        bio: ["ট্রাইকোডার্মা দিয়ে বীজ শোধন করুন।"],
        chem: ["ডাইফেনোকোনাজোল @ ১.০ মিলি/লিটার জল স্প্রে করুন।"]
      },
      kn: {
        name: 'ಈರುಳ್ಳಿ ನೇರಳೆ ಚುಕ್ಕೆ ರೋಗ (Purple Blotch)',
        symptoms: 'ಎಲೆಗಳ ಮೇಲೆ ನೇರಳೆ ಬಣ್ಣದ ಉದ್ದನೆಯ ಮಚ್ಚೆಗಳು ಮೂಡುತ್ತವೆ ಮತ್ತು ಎಲೆಗಳು ಮುರಿದು ಬೀಳುತ್ತವೆ.',
        bio: ["ಟ್ರೈಕೋಡರ್ಮಾದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ."],
        chem: ["ಡೈಫೆನೋಕೊನಜೋಲ್ @ 1.0 ಮಿಲಿ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಸಿಂಪಡಿಸಿ."]
      }
    },
    chilli_anthracnose: {
      hi: {
        name: 'मिर्च का फल सड़न / एन्थ्रेक्नोज (Chilli Anthracnose / Dieback)',
        symptoms: 'पके फलों पर धंसे हुए गोल या लम्बे काले धब्बे जिन पर काले छल्ले बनते हैं। शाखाएं ऊपर से नीचे की ओर सूखती हैं (डाइबैक)।',
        bio: ['ट्राइकोडर्मा विरिडी से बीज उपचार करें और नीम तेल (3000 ppm) का छिड़काव करें।'],
        chem: ['एज़ोक्सीस्ट्रोबिन 23% SC @ 1 मिली/लीटर या कॉपर ऑक्सीक्लोराइड @ 2.5 ग्राम/लीटर का छिड़काव करें।']
      },
      mr: {
        name: 'मिरचीवरील फळकुज व डायबॅक (Chilli Anthracnose)',
        symptoms: 'पक्व फळांवर खोलगट काळे गोलाकार डाग पडतात. शेंड्याकडून फांद्या खाली सुकत जातात (डायबॅक).',
        bio: ['ट्रायकोडर्माने बीजप्रक्रिया करा आणि कडुलिंब अर्क फवारा.'],
        chem: ['अझॉक्सीस्ट्रॉबिन २३% SC @ १ मिली/लिटर किंवा कॉपर ऑक्सिक्लोराईड @ २.५ ग्रॅम/लिटर फवारा.']
      },
      gu: {
        name: 'મરચીનો ફળ સડો / એન્થ્રેક્નોઝ (Chilli Anthracnose / Dieback)',
        symptoms: 'પાકેલા મરચાં પર કાળા-કથ્થઈ ગોળાકાર ખાડાવાળા ડાઘ પડે છે જેના પર કાળી ફૂગની રિંગ દેખાય છે. ડાળીઓ ઉપરથી નીચે તરફ સુકાઈ જાય છે (ડાઇબેક).',
        bio: ["વાવણી પહેલાં ટ્રાઇકોડર્માથી બીજ માવજત આપો."],
        chem: ["એઝોક્સીસ્ટ્રોબિન ૨૩% SC @ ૧.૦ મિલી/લિટર અથવા કોપર ઓક્સિક્લોરાઇડ ૫૦% WP @ ૨.૫ ગ્રામ/લિટર છાંટો."]
      },
      pa: {
        name: 'ਮਿਰਚਾਂ ਦਾ ਫਲ ਗਲਣਾ / ਅੰਥਰਾਕਨੋਜ਼ (Chilli Anthracnose)',
        symptoms: 'ਲਾਲ ਮਿਰਚਾਂ ਉੱਤੇ ਕਾਲੇ ਡੂੰਘੇ ਧੱਬੇ ਪੈ ਜਾਂਦੇ ਹਨ ਅਤੇ ਟਾਹਣੀਆਂ ਉੱਪਰੋਂ ਸੁੱਕਣ ਲੱਗਦੀਆਂ ਹਨ।',
        bio: ["ਟ੍ਰਾਈਕੋਡਰਮਾ ਨਾਲ ਬੀਜ ਸੋਧੋ।"],
        chem: ["ਅਜ਼ੋਕਸੀਸਟ੍ਰੋਬਿਨ @ 1.0 ਮਿਲੀ/ਲਿਟਰ ਜਾਂ ਕਾਪਰ ਆਕਸੀਕਲੋਰਾਈਡ @ 2.5 ਗ੍ਰਾਮ/ਲਿਟਰ ਛਿੜਕੋ।"]
      },
      te: {
        name: 'మిరప కాయకుళ్ళు మరియు కొమ్మఎండు తెగులు (Anthracnose)',
        symptoms: 'పండిన కాయలపై గుండ్రటి నల్లటి గుంటల వంటి మచ్చలు పడతాయి. కొమ్మలు పైనుండి కిందకు ఎండిపోతాయి.',
        bio: ["ట్రైకోడెర్మ తో విత్తన శుద్ధి చేయండి."],
        chem: ["అజోక్సిస్ట్రోబిన్ @ 1.0 మి.లీ./లీటరు లేదా కాపర్ ఆక్సిక్లోరైడ్ @ 2.5 గ్రాములు/లీటరు పిచికారీ చేయాలి."]
      },
      ta: {
        name: 'மிளகாய் பழ அழுகல் மற்றும் நுனிக்கருகல் நோய் (Anthracnose)',
        symptoms: 'பழுத்த மிளகாய்களில் வட்ட வடிவ கருமை நிற புள்ளிகள் தோன்றும். நுனிக் கிளைகள் கருகும்.',
        bio: ["டிரைக்கோடெர்மா மூலம் விதை நேர்த்தி செய்யவும்."],
        chem: ["அசோக்சிஸ்ட்ரோபின் @ 1.0 மி.லி./லிட்டர் தண்ணீரில் தெளிக்கவும்."]
      },
      bn: {
        name: 'মরিচের অ্যানথ্রাকনোজ বা ফল পচা রোগ (Chilli Anthracnose)',
        symptoms: 'পাকা লঙ্কায় গোল কালো ক্ষতচিহ্ন দেখা দেয় এবং ডগা ওপর থেকে শুকিয়ে যায়।',
        bio: ["ট্রাইকোডার্মা দিয়ে বীজ শোধন করুন।"],
        chem: ["অ্যাজোক্সিস্ট্রোবিন @ ১.০ মিলি/লিটার জল স্প্রে করুন।"]
      },
      kn: {
        name: 'ಮೆಣಸಿನಕಾಯಿ ಕಾಯಿ ಕೊಳೆ ರೋಗ (Chilli Anthracnose)',
        symptoms: 'ಹಣ್ಣಾದ ಮೆಣಸಿನಕಾಯಿ ಮೇಲೆ ಕಪ್ಪು ಗುಂಡಗಿನ ತಗ್ಗು ಮಚ್ಚೆಗಳು ಮತ್ತು ಕೊಂಬೆಗಳು ತುದಿಯಿಂದ ಒಣಗುತ್ತವೆ.',
        bio: ["ಟ್ರೈಕೋಡರ್ಮಾದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ."],
        chem: ["ಅಜೋಕ್ಸಿಸ್ಟ್ರೋಬಿನ್ @ 1.0 ಮಿಲಿ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಸಿಂಪಡಿಸಿ."]
      }
    },
    maize_fall_armyworm: {
      hi: {
        name: 'मक्के का फॉल आर्मीवर्म (Fall Armyworm of Maize)',
        symptoms: 'मक्के के पोंगे (भोंपू) में पत्तियों को खुरचकर बड़े-बड़े छेद कर देती है और पोंगा चूरेदार विष्ठा (sawdust frass) से भर जाता है।',
        bio: ['रेत/राख और चूना (9:1) पोंगे में डालें या नोमुरिया रिलेई कवक @ 3 ग्राम/लीटर का छिड़काव करें।'],
        chem: ['क्लोरांट्रानिलिप्रोल 18.5% SC (कोराजन) @ 0.4 मिली/लीटर या स्पाइनोटेोरम 11.7% SC @ 0.5 मिली/लीटर का छिड़काव पोंगे में करें।']
      },
      mr: {
        name: 'मक्यावरील लष्करी अळी (Fall Armyworm)',
        symptoms: 'मक्याच्या पोंग्यातील पाने कुरतडून मोठी छिद्रे पाडते आणि पोंग्यात लाकडाच्या भुशासारखी घाण साठलेली दिसते.',
        bio: ['पोंग्यामध्ये वाळू व चुन्याचे मिश्रण टाका किंवा नोमुरिया रिलेई बुरशी ३ ग्रॅम/लिटर फवारा.'],
        chem: ['क्लोरांट्रानिलीप्रोल १८.५% SC (कोराजन) @ ०.४ मिली/लिटर किंवा स्पिनोटोरम @ ०.५ मिली/लिटर पोंग्यात पडेल असे फवारा.']
      },
      gu: {
        name: 'મકાઈની ફોલ આર્મીવોર્મ / લશ્કરી ઇયળ (Fall Armyworm of Maize)',
        symptoms: 'ઇયળ મકાઈના ગર્ભ (ગાભ) માં ઘૂસીને પાનને ચાવી ખાય છે, જેનાથી પાનમાં મોટા કાણાં પડે છે અને લાકડાના વહેર જેવી હગાર ભરાઈ જાય છે.',
        bio: ["પ્રતિ એકર ૫ ફેરોમોન ટ્રેપ લગાવો.", "ગાભમાં લીંબોળીનું તેલ (૫ મિલી/લિટર) અથવા બેસિલસ થુરિન્જિએન્સિસ (Bt) @ ૨.૦ ગ્રામ/લિટર છાંટો."],
        chem: ["ક્લોરાન્ટ્રાનિલીપ્રોલ ૧૮.૫% SC (કોરાજન) @ ૦.૪ મિલી/લિટર પાણી સીધું ગાભમાં પડે તે રીતે છાંટો.", "ઇમામેક્ટીન બેન્ઝોએટ ૫% SG @ ૦.૫ ગ્રામ/લિટર પાણી."]
      },
      pa: {
        name: 'ਮੱਕੀ ਦਾ ਫ਼ਾਲ ਆਰਮੀਵਰਮ (Fall Armyworm of Maize)',
        symptoms: 'ਸੁੰਡੀ ਗੋਭ ਵਿੱਚ ਵੜ ਕੇ ਪੱਤਿਆਂ ਨੂੰ ਖਾਂਦੀ ਹੈ ਜਿਸ ਨਾਲ ਵੱਡੇ ਛੇਕ ਹੋ ਜਾਂਦੇ ਹਨ। ਗੋਭ ਵਿੱਚ ਲੱਕੜ ਦੇ ਬੂਰੇ ਵਰਗੀ ਮਲ-ਮੂਤਰ ਭਰੀ ਹੁੰਦੀ ਹੈ।',
        bio: ["ਪ੍ਰਤੀ ਏਕੜ 5 ਫੇਰੋਮੋਨ ਟਰੈਪ ਲਗਾਓ।"],
        chem: ["ਕੋਰੋਜਨ @ 0.4 ਮਿਲੀ/ਲਿਟਰ ਜਾਂ ਇਮਾਮੈਕਟਿਨ ਬੈਂਜ਼ੋਏਟ @ 0.5 ਗ੍ਰਾਮ/ਲਿਟਰ ਗੋਭ ਵਿੱਚ ਛਿੜਕੋ।"]
      },
      te: {
        name: 'మొక్కజొన్న కత్తెర పురుగు (Fall Armyworm)',
        symptoms: 'పురుగు సుడిలో చేరి ఆకులను కొరికేస్తుంది, ఆకులపై పెద్ద రంధ్రాలు ఏర్పడతాయి. సుడిలో రంపపు పొట్టు లాంటి విసర్జన కనిపిస్తుంది.',
        bio: ["ఎకరాకు 5 లింగాకర్షక బుట్టలు అమర్చండి."],
        chem: ["కొరాజెన్ @ 0.4 మి.లీ./లీటరు లేదా ఇమామెక్టిన్ బెంజోయేట్ @ 0.5 గ్రాములు/లీటరు నేరుగా సుడిలో పడేలా పిచికారీ చేయాలి."]
      },
      ta: {
        name: 'மக்காச்சோளம் படைப்புழு (Fall Armyworm)',
        symptoms: 'புழு குருத்தில் புகுந்து இலைகளை அரித்து தின்னும். இலைகளில் பெரிய துளைகள் மற்றும் மரத்தூள் போன்ற எச்சங்கள் காணப்படும்.',
        bio: ["ஏக்கருக்கு 5 இனக்கவர்ச்சி பொறிகளை வைக்கவும்."],
        chem: ["கொராசன் @ 0.4 மி.லி./லிட்டர் அல்லது எமாமெக்டின் பென்சோயேட் @ 0.5 கிராம்/லிட்டர் குருத்தில் படுமாறு தெளிக்கவும்."]
      },
      bn: {
        name: 'ভুট্টার ফল আর্মিওয়ার্ম বা পাতা খেকো পোকা (Fall Armyworm)',
        symptoms: 'কীড়া ভুট্টার কচি ডগায় ঢুকে পাতা কুঁড়ে খায়। পাতায় বড় ছিদ্র হয় এবং কাঠের গুঁড়োর মতো মল জমে থাকে।',
        bio: ["জমিতে ৫টি ফেরোমোন ফাঁদ লাগান।"],
        chem: ["কোরাজন @ ০.৪ মিলি/লিটার বা ইমামেকটিন বেনজয়েট @ ০.৫ গ্রাম/লিটার সরাসরি ডগায় স্প্রে করুন।"]
      },
      kn: {
        name: 'ಮೆಕ್ಕೆಜೋಳದ ಸೈನಿಕ ಹುಳು / ಫಾಲ್ ಆರ್ಮಿವರ್ಮ್ (Fall Armyworm)',
        symptoms: 'ಹುಳು ಸುಳಿಯೊಳಗೆ ಹೊಕ್ಕು ಎಲೆಗಳನ್ನು ತಿಂದು ದೊಡ್ಡ ರಂಧ್ರಗಳನ್ನು ಮಾಡುತ್ತದೆ. ಮರದ ಪುಡಿಯಂತಹ ಹಿಕ್ಕೆ ಸುಳಿಯಲ್ಲಿ ತುಂಬಿರುತ್ತದೆ.',
        bio: ["ಎಕರೆಗೆ 5 ಮೋಹಕ ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ."],
        chem: ["ಕೊರಾಜೆನ್ @ 0.4 ಮಿಲಿ/ಲೀಟರ್ ಅಥವಾ ಇಮಾಮೆಕ್ಟಿನ್ ಬೆಂಜೊಯೇಟ್ @ 0.5 ಗ್ರಾಂ/ಲೀಟರ್ ನೇರವಾಗಿ ಸುಳಿಗೆ ಬೀಳುವಂತೆ ಸಿಂಪಡಿಸಿ."]
      }
    }
  };

  function getLocalizedDisease(d, lang) {
    if (!lang) lang = state.language || 'hi';
    const rawCrop = (d.crop || '').toLowerCase();
    const rawPath = (d.pathogen_type || '').toLowerCase();

    const cropObj = CROP_NAME_I18N[rawCrop];
    const cropTag = cropObj ? (cropObj[lang] || cropObj['en']) : (d.crop ? d.crop.toUpperCase() : 'ALL CROPS');

    const pathObj = PATHOGEN_TYPE_I18N[rawPath];
    const pathTag = pathObj ? (pathObj[lang] || pathObj['en']) : (d.pathogen_type || 'Pathogen');

    if (lang === 'en') {
      let bioText = 'Bio-fungicide protocol';
      if (Array.isArray(d.biological_cures) && d.biological_cures.length > 0) {
        bioText = d.biological_cures.map(c => `• ${c}`).join('<br>');
      } else if (d.organic_control || d.biological_cure) {
        bioText = d.organic_control || d.biological_cure;
      }

      let chemText = 'Targeted chemical spray';
      let speechChem = 'Apply recommended fungicide';
      if (Array.isArray(d.chemical_remedies) && d.chemical_remedies.length > 0) {
        chemText = d.chemical_remedies.map(r => {
          if (typeof r === 'object' && r !== null) {
            const ing = r.active_ingredient || '';
            const dose = r.dosage ? ` (${r.dosage})` : '';
            const app = r.application ? `: ${r.application}` : '';
            return `• <strong>${ing}</strong>${dose}${app}`;
          }
          return `• ${r}`;
        }).join('<br>');
        speechChem = typeof d.chemical_remedies[0] === 'object' ? d.chemical_remedies[0].active_ingredient : d.chemical_remedies[0];
      }

      return {
        name: d.name || d.disease_name || d.disease || 'Plant Disease',
        cropTag,
        pathTag,
        symptoms: d.symptoms || 'Visual lesion details',
        bioText,
        chemText,
        speechChem
      };
    }

    let dId = d.id || d.disease_id || '';
    if (!dId && d.name) {
      dId = d.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    }
    if (!DISEASE_I18N_DB[dId]) {
      const allKeys = Object.keys(DISEASE_I18N_DB);
      const matchedKey = allKeys.find(k => dId.includes(k) || (d.name && d.name.toLowerCase().includes(k.replace(/_/g, ' '))));
      if (matchedKey) dId = matchedKey;
    }
    const localizedEntry = (DISEASE_I18N_DB[dId] && DISEASE_I18N_DB[dId][lang]) ? DISEASE_I18N_DB[dId][lang] : null;

    if (localizedEntry) {
      return {
        name: localizedEntry.name,
        cropTag,
        pathTag,
        symptoms: localizedEntry.symptoms,
        bioText: localizedEntry.bio.map(c => `• ${c}`).join('<br>'),
        chemText: localizedEntry.chem.map(c => `• ${c}`).join('<br>'),
        speechChem: localizedEntry.chem[0]
      };
    }

    // Smart fallback translation for diseases not yet explicitly listed
    let dName = d.name || d.disease_name || d.disease || 'Plant Disease';
    let symptoms = d.symptoms || 'Visual lesion details';
    const FALLBACK_BIO = {
      en: 'Bio-fungicide and organic management protocol',
      hi: 'जैविक नियंत्रण एवं प्राकृतिक उपचार',
      mr: 'जैविक नियंत्रण आणि नैसर्गिक उपचार',
      pa: 'ਜੈਵਿਕ ਕੰਟਰੋਲ ਅਤੇ ਕੁਦਰਤੀ ਉਪਚਾਰ',
      gu: 'જૈવિક નિયંત્રણ અને કુદરતી ઉપચાર',
      te: 'జీవ నియంత్రణ మరియు సహజ నివారణలు',
      ta: 'உயிரியல் கட்டுப்பாடு மற்றும் இயற்கை தீர்வுகள்',
      bn: 'জৈব নিয়ন্ত্রণ ও প্রাকৃতিক প্রতিকার',
      kn: 'ಜೈವಿಕ ನಿಯಂತ್ರಣ ಮತ್ತು ನೈಸರ್ಗಿಕ ಪರಿಹಾರಗಳು'
    };
    const FALLBACK_CHEM = {
      en: 'Apply recommended systemic fungicide or insecticide spray',
      hi: 'उचित रासायनिक फफूंदनाशक या कीटनाशक का छिड़काव करें',
      mr: 'शिफारस केलेले आंतरप्रवाही बुरशीनाशक किंवा कीटकनाशक फवारा',
      pa: 'ਸਿਫਾਰਸ਼ ਕੀਤੀ ਉੱਲੀਨਾਸ਼ਕ ਜਾਂ ਕੀਟਨਾਸ਼ਕ ਦਾ ਛਿੜਕਾਅ ਕਰੋ',
      gu: 'ભલામણ કરેલ ફૂગનાશક અથવા જંતુનાશક દવા છાંટો',
      te: 'సిఫార్సు చేయబడిన శిలీంధ్రనాశిని లేదా పురుగుమందు పిచికారీ చేయండి',
      ta: 'பரிந்துரைக்கப்பட்ட பூஞ்சைக் கொல்லி அல்லது பூச்சிக்கொல்லி தெளிக்கவும்',
      bn: 'অনুমোদিত ছত্রাকনাশক বা কীটনাশক স্প্রে করুন',
      kn: 'ಶಿಫಾರಸು ಮಾಡಿದ ಶಿಲೀಂಧ್ರನಾಶಕ ಅಥವಾ ಕೀಟನಾಶಕವನ್ನು ಸಿಂಪಡಿಸಿ'
    };
    let bioText = FALLBACK_BIO[lang] || FALLBACK_BIO['en'];
    let chemText = FALLBACK_CHEM[lang] || FALLBACK_CHEM['en'];
    let speechChem = chemText;

    if (Array.isArray(d.biological_cures) && d.biological_cures.length > 0) {
      bioText = d.biological_cures.map(c => `• ${c}`).join('<br>');
    }
    if (Array.isArray(d.chemical_remedies) && d.chemical_remedies.length > 0) {
      chemText = d.chemical_remedies.map(r => {
        if (typeof r === 'object' && r !== null) {
          const ing = r.active_ingredient || '';
          const dose = r.dosage ? ` (${r.dosage})` : '';
          const app = r.application ? `: ${r.application}` : '';
          return `• <strong>${ing}</strong>${dose}${app}`;
        }
        return `• ${r}`;
      }).join('<br>');
    }

    return {
      name: dName,
      cropTag,
      pathTag,
      symptoms,
      bioText,
      chemText,
      speechChem
    };
  }

  const TARGET_CROP_OPTIONS = [
    { value: '', label: {
      en: '✨ AI Auto-Recommend (Best Match for Soil)',
      hi: '✨ सर्वोत्तम AI अनुशंसा (खेत के लिए सबसे उपयुक्त)',
      mr: '✨ सर्वोत्तम AI शिफारस (शेतीसाठी सर्वात योग्य)',
      pa: '✨ ਸਭ ਤੋਂ ਵਧੀਆ AI ਸਿਫਾਰਸ਼ (ਖੇਤ ਲਈ ਸਰਵੋਤਮ)',
      gu: '✨ શ્રેષ્ઠ AI ભલામણ (ખેતર માટે સૌથી યોગ્ય)',
      te: '✨ ఉత్తమ AI సిఫార్సు (పొలానికి అత్యంత అనుకూలం)',
      ta: '✨ சிறந்த AI பரிந்துரை (நிலத்திற்கு மிகவும் ஏற்றது)',
      bn: '✨ সেরা AI সুপারিশ (জমির জন্য সর্বোত্তম)',
      kn: '✨ ಅತ್ಯುತ್ತಮ AI ಶಿಫಾರಸು (ಹೊಲಕ್ಕೆ ಸೂಕ್ತವಾದ ಬೆಳೆ)'
    } },
    { value: 'rice', label: {
      en: 'Paddy / Rice (धान / भात)',
      hi: 'धान / Paddy (Rice)',
      mr: 'भात / धान (Paddy)',
      pa: 'ਝੋਨਾ / ਧਾਨ (Rice)',
      gu: 'ડાંગર / ચોખા (Paddy)',
      te: 'వరి / ధాన్యం (Rice)',
      ta: 'நெல் / அரிசி (Rice)',
      bn: 'ধান / চাল (Paddy)',
      kn: 'ಭತ್ತ / ಅಕ್ಕಿ (Paddy)'
    } },
    { value: 'wheat', label: {
      en: 'Wheat (गेहूं / गहू)',
      hi: 'गेहूं (Wheat)',
      mr: 'गहू (Wheat)',
      pa: 'ਕਣਕ (Wheat)',
      gu: 'ઘઉં (Wheat)',
      te: 'గోధుమలు (Wheat)',
      ta: 'கோதுமை (Wheat)',
      bn: 'গম (Wheat)',
      kn: 'ಗೋಧಿ (Wheat)'
    } },
    { value: 'cotton', label: {
      en: 'Cotton (कपास / कापूस)',
      hi: 'कपास (Cotton)',
      mr: 'कापूस (Cotton)',
      pa: 'ਕਪਾਹ / ਨਰਮਾ (Cotton)',
      gu: 'કપાસ (Cotton)',
      te: 'ప్రత్తి (Cotton)',
      ta: 'பருத்தி (Cotton)',
      bn: 'তুলা (Cotton)',
      kn: 'ಹತ್ತಿ (Cotton)'
    } },
    { value: 'maize', label: {
      en: 'Maize (मक्का / मका)',
      hi: 'मक्का (Maize)',
      mr: 'मका (Maize)',
      pa: 'ਮੱਕੀ (Maize)',
      gu: 'મકાઈ (Maize)',
      te: 'మొక్కజొన్న (Maize)',
      ta: 'மக்காச்சோளம் (Maize)',
      bn: 'ভুট্টা (Maize)',
      kn: 'ಮೆಕ್ಕೆಜೋಳ (Maize)'
    } },
    { value: 'sugarcane', label: {
      en: 'Sugarcane (गन्ना / ऊस)',
      hi: 'गन्ना (Sugarcane)',
      mr: 'ऊस (Sugarcane)',
      pa: 'ਗੰਨਾ (Sugarcane)',
      gu: 'શેરડી (Sugarcane)',
      te: 'చెరకు (Sugarcane)',
      ta: 'கரும்பு (Sugarcane)',
      bn: 'আখ (Sugarcane)',
      kn: 'ಕಬ್ಬು (Sugarcane)'
    } },
    { value: 'soybean', label: {
      en: 'Soybean (सोयाबीन)',
      hi: 'सोयाबीन (Soybean)',
      mr: 'सोयाबीन (Soybean)',
      pa: 'ਸੋਇਆਬੀਨ (Soybean)',
      gu: 'સોયાબીન (Soybean)',
      te: 'సోయాబీన్ (Soybean)',
      ta: 'சோயாபீன் (Soybean)',
      bn: 'সয়াবিন (Soybean)',
      kn: 'ಸೋಯಾಬೀನ್ (Soybean)'
    } },
    { value: 'groundnut', label: {
      en: 'Groundnut (मूंगफली / भुईमूग)',
      hi: 'मूंगफली (Groundnut)',
      mr: 'भुईमूग (Groundnut)',
      pa: 'ਮੂੰਗਫਲੀ (Groundnut)',
      gu: 'મગફળી (Groundnut)',
      te: 'వేరుశనగ (Groundnut)',
      ta: 'வேர்க்கடலை (Groundnut)',
      bn: 'চিনাবাদাম (Groundnut)',
      kn: 'ಕಡಲೆಕಾಯಿ (Groundnut)'
    } },
    { value: 'mustard', label: {
      en: 'Mustard (सरसों / मोहरी)',
      hi: 'सरसों (Mustard)',
      mr: 'मोहरी (Mustard)',
      pa: 'ਸਰ੍ਹੋਂ (Mustard)',
      gu: 'રાયડો / સરસવ (Mustard)',
      te: 'ఆవాలు (Mustard)',
      ta: 'கடுகு (Mustard)',
      bn: 'সরিষা (Mustard)',
      kn: 'ಸಾಸಿವೆ (Mustard)'
    } },
    { value: 'chickpea', label: {
      en: 'Chickpea / Gram (चना / हरभरा)',
      hi: 'चना (Gram / Chickpea)',
      mr: 'हरभरा / चना (Gram)',
      pa: 'ਛੋਲੇ (Chickpea)',
      gu: 'ચણા (Chickpea)',
      te: 'శనగలు (Chickpea)',
      ta: 'கொண்டைக்கடலை (Chickpea)',
      bn: 'ছোলা (Chickpea)',
      kn: 'ಕಡಲೆ (Chickpea)'
    } },
    { value: 'onion', label: {
      en: 'Onion (प्याज / कांदा)',
      hi: 'प्याज (Onion)',
      mr: 'कांदा (Onion)',
      pa: 'ਪਿਆਜ਼ (Onion)',
      gu: 'ડુંગળી (Onion)',
      te: 'ఉల్లిపాయ (Onion)',
      ta: 'வெங்காயம் (Onion)',
      bn: 'পেঁয়াজ (Onion)',
      kn: 'ಈರುಳ್ಳಿ (Onion)'
    } },
    { value: 'potato', label: {
      en: 'Potato (आलू / बटाटा)',
      hi: 'आलू (Potato)',
      mr: 'बटाटा (Potato)',
      pa: 'ਆਲੂ (Potato)',
      gu: 'બટાકા (Potato)',
      te: 'బంగాళాదుంప (Potato)',
      ta: 'உருளைக்கிழங்கு (Potato)',
      bn: 'আলু (Potato)',
      kn: 'ಆಲೂಗಡ್ಡೆ (Potato)'
    } },
    { value: 'tomato', label: {
      en: 'Tomato (टमाटर / टोमॅटो)',
      hi: 'टमाटर (Tomato)',
      mr: 'टोमॅटो (Tomato)',
      pa: 'ਟਮਾਟਰ (Tomato)',
      gu: 'ટામેટા (Tomato)',
      te: 'టమోటా (Tomato)',
      ta: 'தக்காளி (Tomato)',
      bn: 'টমেটো (Tomato)',
      kn: 'ಟೊಮ್ಯಾಟೊ (Tomato)'
    } },
    { value: 'chilli', label: {
      en: 'Chilli (मिर्च / मिरची)',
      hi: 'मिर्च (Chilli)',
      mr: 'मिरची (Chilli)',
      pa: 'ਮਿਰਚ (Chilli)',
      gu: 'મરચાં (Chilli)',
      te: 'మిరపకాయ (Chilli)',
      ta: 'மிளகாய் (Chilli)',
      bn: 'মরিচ (Chilli)',
      kn: 'ಮೆಣಸಿನಕಾಯಿ (Chilli)'
    } },
    { value: 'banana', label: {
      en: 'Banana (केला / केळी)',
      hi: 'केला (Banana)',
      mr: 'केळी (Banana)',
      pa: 'ਕੇਲਾ (Banana)',
      gu: 'કેળાં (Banana)',
      te: 'అరటి (Banana)',
      ta: 'வாழைப்பழம் (Banana)',
      bn: 'কলা (Banana)',
      kn: 'ಬಾಳೆಹಣ್ಣು (Banana)'
    } },
    { value: 'apple', label: {
      en: 'Apple (सेब / सफरचंद)',
      hi: 'सेब (Apple)',
      mr: 'सफरचंद (Apple)',
      pa: 'ਸੇਬ (Apple)',
      gu: 'સફરજન (Apple)',
      te: 'ఆపిల్ (Apple)',
      ta: 'ஆப்பிள் (Apple)',
      bn: 'আপেল (Apple)',
      kn: 'ಸೇಬು (Apple)'
    } },
    { value: 'grapes', label: {
      en: 'Grapes (अंगूर / द्राक्षे)',
      hi: 'अंगूर (Grapes)',
      mr: 'द्राक्षे (Grapes)',
      pa: 'ਅੰਗੂਰ (Grapes)',
      gu: 'દ્રાક્ષ (Grapes)',
      te: 'ద్రాక్ష (Grapes)',
      ta: 'திராட்சை (Grapes)',
      bn: 'আঙুর (Grapes)',
      kn: 'ದ್ರಾಕ್ಷಿ (Grapes)'
    } },
    { value: 'papaya', label: {
      en: 'Papaya (पपीता / पपई)',
      hi: 'पपीता (Papaya)',
      mr: 'पपई (Papaya)',
      pa: 'ਪਪੀਤਾ (Papaya)',
      gu: 'પપૈયા (Papaya)',
      te: 'బొప్పాయి (Papaya)',
      ta: 'பப்பாளி (Papaya)',
      bn: 'পেঁপে (Papaya)',
      kn: 'ಪಪ್ಪಾಯಿ (Papaya)'
    } },
    { value: 'watermelon', label: {
      en: 'Watermelon (तरबूज / कलिंगड)',
      hi: 'तरबूज (Watermelon)',
      mr: 'कलिंगड (Watermelon)',
      pa: 'ਤਰਬੂਜ਼ (Watermelon)',
      gu: 'તરબૂચ (Watermelon)',
      te: 'పుచ్చకాయ (Watermelon)',
      ta: 'தர்பூசணி (Watermelon)',
      bn: 'তরমুজ (Watermelon)',
      kn: 'ಕಲ್ಲಂಗಡಿ (Watermelon)'
    } },
    { value: 'jute', label: {
      en: 'Jute (पटसन / ताग)',
      hi: 'पटसन / जूट (Jute)',
      mr: 'ताग / ज्यूट (Jute)',
      pa: 'ਪਟਸਨ (Jute)',
      gu: 'શણ (Jute)',
      te: 'జనపనార (Jute)',
      ta: 'சணல் (Jute)',
      bn: 'পাট (Jute)',
      kn: 'ಸೆಣಬು (Jute)'
    } },
    { value: 'pigeonpeas', label: {
      en: 'Pigeonpeas / Arhar (अरहर / तूर)',
      hi: 'अरहर / तुअर (Arhar)',
      mr: 'तूर (Arhar / Tur)',
      pa: 'ਅਰਹਰ (Arhar)',
      gu: 'તુવેર (Tuver)',
      te: 'కందులు (Red Gram)',
      ta: 'துவரம்பருப்பு (Toor)',
      bn: 'অরহর (Arhar)',
      kn: 'ತೊಗರಿ (Tur)'
    } },
    { value: 'blackgram', label: {
      en: 'Blackgram / Urad (उड़द / उडीद)',
      hi: 'उड़द (Urad / Blackgram)',
      mr: 'उडीद (Urad)',
      pa: 'ਮਾਂਹ / ਉੜਦ (Urad)',
      gu: 'અડદ (Urad)',
      te: 'మినుములు (Black Gram)',
      ta: 'உளுந்து (Urad)',
      bn: 'মাষকলাই (Urad)',
      kn: 'ಉದ್ದು (Urad)'
    } },
    { value: 'mungbean', label: {
      en: 'Mungbean (मूंग / मूग)',
      hi: 'मूंग (Moong / Mungbean)',
      mr: 'मूग (Moong)',
      pa: 'ਮੂੰਗੀ (Moong)',
      gu: 'મગ (Moong)',
      te: 'పెసలు (Green Gram)',
      ta: 'பாசிப்பயறு (Moong)',
      bn: 'মুগ (Moong)',
      kn: 'ಹೆಸರು ಕಾಳು (Moong)'
    } },
    { value: 'lentil', label: {
      en: 'Lentil / Masoor (मसूर)',
      hi: 'मसूर (Lentil)',
      mr: 'मसूर (Lentil)',
      pa: 'ਮਸਰ (Lentil)',
      gu: 'મસૂર (Lentil)',
      te: 'మైసూర్ పప్పు (Lentil)',
      ta: 'மைசூர் பருப்பு (Lentil)',
      bn: 'মসুর (Lentil)',
      kn: 'ಮಸೂರ (Lentil)'
    } }
  ];

  function populateTargetCrops(lang) {
    if (!selectTargetCrop) return;
    const curVal = selectTargetCrop.value;
    selectTargetCrop.innerHTML = TARGET_CROP_OPTIONS.map(opt => {
      const lbl = (opt.label && (opt.label[lang] || opt.label['hi'] || opt.label['en'])) || opt.value;
      const sel = (opt.value === curVal) ? 'selected' : '';
      return `<option value="${opt.value}" ${sel}>${lbl}</option>`;
    }).join('');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MULTILINGUAL AGRONOMIC EXPLANATION ENGINE (9 LANGUAGES)
  // ─────────────────────────────────────────────────────────────────────────
  function getCropRationale(cropKey, cropLocal, n, rain, lang) {
    const k = (cropKey || '').toLowerCase();
    const l = lang || 'hi';
    const templates = {
      rice: {
        en: `Your soil Nitrogen (${n} kg/ha) and seasonal rainfall (${rain} mm) provide optimal conditions for ${cropLocal} tillering and grain formation.`,
        hi: `आपकी मिट्टी में नाइट्रोजन (${n} kg/ha) और स्थानीय वर्षा (${rain} mm) ${cropLocal} के कल्ले फूटने और दाना भराव के लिए सर्वोत्तम परिस्थितियाँ प्रदान करते हैं।`,
        mr: `आपल्या जमिनीतील नत्र (${n} किलो/हे.) आणि स्थानिक पाऊस (${rain} मिमी) ${cropLocal} पिकाच्या फुटव्यांसाठी आणि दाणे भरण्यासाठी अत्यंत पोषक आहेत.`,
        pa: `ਤੁਹਾਡੀ ਜ਼ਮੀਨ ਵਿੱਚ ਨਾਈਟ੍ਰੋਜਨ (${n} ਕਿਲੋ/ਹੈ.) ਅਤੇ ਮੀਂਹ (${rain} ਮਿਲੀਮੀਟਰ) ${cropLocal} ਦੇ ਵਧੀਆ ਫੁਟਾਰੇ ਅਤੇ ਦਾਣੇ ਭਰਨ ਲਈ ਬਹੁਤ ਵਧੀਆ ਹਾਲਾਤ ਬਣਾਉਂਦੇ ਹਨ।`,
        gu: `તમારી જમીનમાં નાઇટ્રોજન (${n} કિગ્રા/હે.) અને વરસાદ (${rain} મીમી) ${cropLocal} ના ફૂટવા અને દાણા ભરાવવા માટે ઉત્તમ વાતાવરણ પૂરું પાડે છે.`,
        te: `మీ నేలలోని నత్రజని (${n} కిలోలు/హెక్టారు) మరియు వర్షపాతం (${rain} మి.మీ.) ${cropLocal} దుబ్బులు చేయడం మరియు గింజ పక్వానికి రావడం కోసం అత్యంత అనుకూలం.`,
        ta: `உங்கள் மண்ணின் தழைச்சத்து (${n} கிலோ/ஹெக்) மற்றும் மழை அளவு (${rain} மிமீ) ${cropLocal} தூர்கட்டுவதற்கும் மணி பிடிப்பதற்கும் மிகச் சிறந்த சூழலை வழங்குகிறது.`,
        bn: `আপনার মাটির নাইট্রোজেন (${n} কেজি/হেক্টর) এবং বৃষ্টিপাত (${rain} মিমি) ${cropLocal} ফসলের কুশি বের হওয়া এবং ভালো দানা গঠনের জন্য আদর্শ অনুকূল পরিবেশ তৈরি করে।`,
        kn: `ನಿಮ್ಮ ಮಣ್ಣಿನ ಸಾರಜನಕ (${n} ಕೆಜಿ/ಹೆಕ್ಟೇರ್) ಮತ್ತು ಮಳೆಯ ಪ್ರಮಾಣ (${rain} ಮಿಮೀ) ${cropLocal} ಕವಲೊಡೆಯುವಿಕೆ ಮತ್ತು ಧಾನ್ಯ ಕಟ್ಟುವಿಕೆಗೆ ಅತ್ಯುತ್ತಮ ವಾತಾವರಣ ಒದಗಿಸುತ್ತದೆ.`
      },
      cotton: {
        en: `Balanced soil conditions (N=${n} kg/ha) and weather baseline (${rain} mm) are ideal for vegetative frame and boll development in ${cropLocal}.`,
        hi: `संतुलित मिट्टी पोषण (N=${n} kg/ha) और स्थानीय मौसम (${rain} mm) ${cropLocal} की वानस्पतिक बढ़वार और टिंडे (Bolls) के विकास के लिए पूर्णतः अनुकूल हैं।`,
        mr: `संतुलित माती पोषण (नत्र=${n} किलो/हे.) आणि हवामान (${rain} मिमी) ${cropLocal} पिकाच्या कायिक वाढीसाठी आणि बोंडांच्या उत्तम विकासासाठी आदर्श आहेत.`,
        pa: `ਸੰਤੁਲਿਤ ਮਿੱਟੀ ਖੁਰਾਕ (N=${n} ਕਿਲੋ/ਹੈ.) ਅਤੇ ਮੌਸਮ (${rain} ਮਿਲੀਮੀਟਰ) ${cropLocal} ਦੇ ਬੂਟੇ ਅਤੇ ਟੀਂਡਿਆਂ ਦੇ ਵਾਧੇ ਲਈ ਬਹੁਤ ਢੁਕਵੇਂ ਹਨ।`,
        gu: `સંતુલિત જમીન પોષક તત્ત્વો (N=${n} કિગ્રા/હે.) અને વાતાવરણ (${rain} મીમી) ${cropLocal} ના વાનસ્પતિક વિકાસ અને જીંડવા માટે સંપૂર્ણ અનુકૂળ છે.`,
        te: `సమతుల్య నేల పోషకాలు (N=${n} కిలోలు/హెక్టారు) మరియు వాతావరణం (${rain} మి.మీ.) ${cropLocal} ఏపుగా పెరగడానికి మరియు కాయలు పట్టడానికి అనుకూలం.`,
        ta: `சீரான மண் ஊட்டச்சத்துக்கள் (N=${n} கிலோ/ஹெக்) மற்றும் காலநிலை (${rain} மிமீ) ${cropLocal} செழித்து வளர்வதற்கும் காய்கள் பிடிப்பதற்கும் உகந்தது.`,
        bn: `সুষম মাটির পুষ্টি (N=${n} কেজি/হেক্টর) এবং আবহাওয়া (${rain} মিমি) ${cropLocal} ফসলের অঙ্গজ বৃদ্ধি এবং গুটি গঠনের জন্য সম্পূর্ণ উপযোগী।`,
        kn: `ಸಮತೋಲಿತ ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳು (N=${n} ಕೆಜಿ/ಹೆಕ್ಟೇರ್) ಮತ್ತು ಹವಾಮಾನ (${rain} ಮಿಮೀ) ${cropLocal} ಬೆಳೆಯ ಹುಲುಸಾದ ಬೆಳವಣಿಗೆಗೆ ಮತ್ತು ಕಾಯಿ ಕಚ್ಚಲು ಸೂಕ್ತವಾಗಿದೆ.`
      },
      maize: {
        en: `Moderate rainfall (${rain} mm) and available soil N (${n} kg/ha) drive rapid cob development and starch synthesis in ${cropLocal}.`,
        hi: `मध्यम वर्षा (${rain} mm) और उपलब्ध मिट्टी नाइट्रोजन (${n} kg/ha) ${cropLocal} के भुट्टे के तेजी से विकास और दाना भराव के लिए आदर्श हैं।`,
        mr: `मध्यम पाऊस (${rain} मिमी) आणि उपलब्ध नत्र (${n} किलो/हे.) ${cropLocal} पिकाच्या कणसाच्या जलद वाढीसाठी व दाणे भरण्यासाठी उत्कृष्ट आहेत.`,
        pa: `ਦਰਮਿਆਨਾ ਮੀਂਹ (${rain} ਮਿਲੀਮੀਟਰ) ਅਤੇ ਨਾਈਟ੍ਰੋਜਨ (${n} ਕਿਲੋ/ਹੈ.) ${cropLocal} ਦੀ ਛੱਲੀ ਦੇ ਵਾਧੇ ਅਤੇ ਦਾਣੇ ਪੱਕਣ ਲਈ ਵਧੀਆ ਹਨ।`,
        gu: `મધ્યમ વરસાદ (${rain} મીમી) અને જમીન નાઇટ્રોજન (${n} કિગ્રા/હે.) ${cropLocal} ના ડોડાના ઝડપી વિકાસ અને દાણા ભરાવવા માટે ઉત્તમ છે.`,
        te: `మితమైన వర్షపాతం (${rain} మి.మీ.) మరియు నేల నత్రజని (${n} కిలోలు/హెక్టారు) ${cropLocal} కంకి త్వరగా ఎదగడానికి మరియు గింజ బలం కోసం అనుకూలం.`,
        ta: `மிதமான மழை (${rain} மிமீ) மற்றும் மண் தழைச்சத்து (${n} கிலோ/ஹெக்) ${cropLocal} பயிரின் கதிர் வளர்ச்சிக்கும் மணி முற்றுவதற்கும் சிறந்தது.`,
        bn: `মাঝারি বৃষ্টিপাত (${rain} মিমি) এবং মাটির নাইট্রোজেন (${n} কেজি/হেক্টর) ${cropLocal} ফসলের মোচার দ্রুত বিকাশ ও ভালো দানা গঠনের জন্য সেরা।`,
        kn: `ಮಧ್ಯಮ ಮಳೆ (${rain} ಮಿಮೀ) ಮತ್ತು ಮಣ್ಣಿನ ಸಾರಜನಕ (${n} ಕೆಜಿ/ಹೆಕ್ಟೇರ್) ${cropLocal} ತೆನೆಯ ಶೀಘ್ರ ಬೆಳವಣಿಗೆಗೆ ಮತ್ತು ಕಾಳು ತುಂಬಲು ಸೂಕ್ತವಾಗಿದೆ.`
      },
      wheat: {
        en: `Winter temperature baseline and responsive root zone (N=${n} kg/ha) promote excellent crown root initiation and high tiller survival for ${cropLocal}.`,
        hi: `शीतकालीन तापमान और जड़ क्षेत्र में उपलब्ध N (${n} kg/ha) ${cropLocal} में ताज जड़ (CRI) के विकास और अधिक कल्ले बनने में सहायक हैं।`,
        mr: `हिवाळी पोषक हवामान आणि जमिनीतील उपलब्ध नत्र (${n} किलो/हे.) ${cropLocal} पिकाच्या मुळांच्या फुटव्यासाठी अत्यंत लाभदायक आहेत.`,
        pa: `ਸਰਦੀਆਂ ਦਾ ਢੁਕਵਾਂ ਤਾਪਮਾਨ ਅਤੇ ਮਿੱਟੀ ਵਿਚਲੀ ਨਾਈਟ੍ਰੋਜਨ (${n} ਕਿਲੋ/ਹੈ.) ${cropLocal} ਦੇ ਵਧੀਆ ਫੁਟਾਰੇ ਅਤੇ ਵੱਧ ਝਾੜ ਲਈ ਸਹਾਈ ਹਨ।`,
        gu: `શિયાળુ વાતાવરણ અને ઉપલબ્ધ નાઇટ્રોજન (${n} કિગ્રા/હે.) ${cropLocal} માં મૂળના સારા વિકાસ અને ઉત્તમ ઉત્પાદન માટે અનુકૂળ છે.`,
        te: `శీతాకాల ఉష్ణోగ్రత మరియు నేలలోని నత్రజని (${n} కిలోలు/హెక్టారు) ${cropLocal} వేర్లు దృఢంగా విస్తరించడానికి మరియు అధిక దిగుబడికి అనుకూలం.`,
        ta: `குளிர்கால சூழல் மற்றும் மண்ணில் உள்ள தழைச்சத்து (${n} கிலோ/ஹெக்) ${cropLocal} வேர் வளர்ச்சிக்கும் அதிக தூர் பிடிப்பதற்கும் உதவுகிறது.`,
        bn: `শীতকালীন আবহাওয়া এবং মাটির নাইট্রোজেন (${n} কেজি/হেক্টর) ${cropLocal} ফসলের শক্ত শিকড় গঠন ও অধিক ফলনের জন্য অত্যন্ত উপযোগী।`,
        kn: `ಚಳಿಗಾಲದ ಹವಾಮಾನ ಮತ್ತು ಮಣ್ಣಿನ ಸಾರಜನಕ (${n} ಕೆಜಿ/ಹೆಕ್ಟೇರ್) ${cropLocal} ಬೆಳೆಯ ಬೇರುಗಳ ಬೆಳವಣಿಗೆಗೆ ಮತ್ತು ಅಧಿಕ ಇಳುವರಿಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ.`
      },
      sugarcane: {
        en: `High water retention and steady nutrient availability (N=${n} kg/ha) ensure superior cane elongation and sucrose accumulation for ${cropLocal}.`,
        hi: `पर्याप्त जल उपलब्धता और स्थिर पोषण (N=${n} kg/ha) ${cropLocal} की लंबाई में तीव्र वृद्धि और रस में शर्करा प्रतिशत बढ़ाने के लिए सर्वोत्तम हैं।`,
        mr: `भरपूर पाणी आणि संतुलित अन्नद्रव्ये (${n} किलो/हे. नत्र) ${cropLocal} पिकाच्या कांड्यांची लांबी वाढवण्यासाठी व साखर उतारा वाढवण्यासाठी आदर्श आहेत.`,
        pa: `ਭਰਪੂਰ ਪਾਣੀ ਅਤੇ ਜ਼ਮੀਨ ਦੀ ਖੁਰਾਕ (N=${n} ਕਿਲੋ/ਹੈ.) ${cropLocal} ਦੇ ਗੰਨੇ ਦੇ ਕੱਦ ਅਤੇ ਮਿਠਾਸ ਵਧਾਉਣ ਲਈ ਬਹੁਤ ਵਧੀਆ ਹਨ।`,
        gu: `પૂરતું પાણી અને પોષક તત્ત્વો (${n} કિગ્રા/હે. N) ${cropLocal} ની લંબાઈ વધારવા અને ખાંડની ટકાવારી સુધારવા માટે શ્રેષ્ઠ છે.`,
        te: `సమృద్ధిగా నీరు మరియు పోషకాలు (${n} కిలోలు/హెక్టారు N) ${cropLocal} ఎదుగుదలకు మరియు చెరకులో చక్కెర శాతం పెరగడానికి తోడ్పడతాయి.`,
        ta: `அதிக நீர் வசதி மற்றும் சத்துக்கள் (${n} கிலோ/ஹெக் N) ${cropLocal} தண்டு வளர்ச்சிக்கும் சர்க்கரை அளவு கூடுவதற்கும் சிறந்தது.`,
        bn: `পর্যাপ্ত জল ও সুষম পুষ্টি (${n} কেজি/হেক্টর N) ${cropLocal} গাছের বৃদ্ধি এবং রসে শর্করার পরিমাণ বাড়াতে দারুণ সাহায্য করে।`,
        kn: `ಹೇರಳ ನೀರು ಮತ್ತು ಸಮತೋಲಿತ ಪೋಷಕಾಂಶಗಳು (${n} ಕೆಜಿ/ಹೆಕ್ಟೇರ್ N) ${cropLocal} ಕಬ್ಬಿನ ಎತ್ತರ ಬೆಳೆಯಲು ಮತ್ತು ಸಕ್ಕರೆ ಅಂಶ ಹೆಚ್ಚಿಸಲು ಅತ್ಯುತ್ತಮವಾಗಿವೆ.`
      },
      general: {
        en: `Your soil Nitrogen (${n} kg/ha) and rainfall profile (${rain} mm) strongly favor healthy biomass and yield potential for ${cropLocal}.`,
        hi: `आपकी मिट्टी में उपलब्ध नाइट्रोजन (${n} kg/ha) और वर्षा स्तर (${rain} mm) ${cropLocal} के स्वस्थ वानस्पतिक विकास और उच्च पैदावार के लिए सर्वोत्तम हैं।`,
        mr: `आपल्या शेतातील उपलब्ध नत्र (${n} किलो/हे.) आणि पावसाचे प्रमाण (${rain} मिमी) ${cropLocal} पिकाच्या निरोगी वाढीसाठी व चांगल्या उत्पादनासाठी पोषक आहे.`,
        pa: `ਤੁਹਾਡੀ ਜ਼ਮੀਨ ਵਿੱਚ ਉਪਲਬਧ ਨਾਈਟ੍ਰੋਜਨ (${n} ਕਿਲੋ/ਹੈ.) ਅਤੇ ਮੀਂਹ (${rain} ਮਿਲੀਮੀਟਰ) ${cropLocal} ਦੇ ਵਧੀਆ ਵਾਧੇ ਅਤੇ ਭਰਪੂਰ ਝਾੜ ਲਈ ਬਹੁਤ ਲਾਭਦਾਇਕ ਹਨ।`,
        gu: `તમારી જમીનમાં ઉપલબ્ધ નાઇટ્રોજન (${n} કિગ્રા/હે.) અને વરસાદ (${rain} મીમી) ${cropLocal} ના તંદુરસ્ત વિકાસ અને શ્રેષ્ઠ ઉત્પાદન માટે અત્યંત યોગ્ય છે.`,
        te: `మీ నేలలోని నత్రజని (${n} కిలోలు/హెక్టారు) మరియు వర్షపాతం (${rain} మి.మీ.) ${cropLocal} పంట ఆరోగ్యకరమైన పెరుగుదలకు మరియు మంచి దిగుబడికి ఎంతగానో తోడ్పడతాయి.`,
        ta: `உங்கள் மண்ணில் உள்ள தழைச்சத்து (${n} கிலோ/ஹெக்) மற்றும் மழை அளவு (${rain} மிமீ) ${cropLocal} பயிரின் ஆரோக்கியமான வளர்ச்சிக்கும் நல்ல விளைச்சலுக்கும் சாதகமாக உள்ளது.`,
        bn: `আপনার জমিতে উপস্থিত নাইট্রোজেন (${n} কেজি/হেক্টর) এবং বৃষ্টিপাতের পরিমাণ (${rain} মিমি) ${cropLocal} ফসলের স্বাস্থ্যকর বৃদ্ধি ও উচ্চ ফলনের জন্য অত্যন্ত উপযোগী।`,
        kn: `ನಿಮ್ಮ ಮಣ್ಣಿನಲ್ಲಿರುವ ಸಾರಜನಕ (${n} ಕೆಜಿ/ಹೆಕ್ಟೇರ್) ಮತ್ತು ಮಳೆಯ ಪ್ರಮಾಣ (${rain} ಮಿಮೀ) ${cropLocal} ಬೆಳೆಯ ಸಮೃದ್ಧ ಬೆಳವಣಿಗೆಗೆ ಮತ್ತು ಉತ್ತಮ ಇಳುವರಿಗೆ ಸಹಕಾರಿಯಾಗಿದೆ.`
      }
    };
    const cropTpl = templates[k] || templates.general;
    return cropTpl[l] || cropTpl['hi'] || cropTpl['en'];
  }

  function getAlternativeCropRationale(cropLocal, n, rain, lang) {
    const l = lang || 'hi';
    const dict = {
      en: `Solid secondary alternative: resilient root system well-adapted to current soil N (${n} kg/ha) and seasonal rain (${rain} mm).`,
      hi: `मजबूत द्वितीयक विकल्प: वर्तमान मिट्टी N (${n} kg/ha) और स्थानीय वर्षा (${rain} mm) के लिए अनुकूलित सहनशील फसल।`,
      mr: `उत्तम पर्यायी पीक: सध्याच्या जमिनीतील नत्र (${n} किलो/हे.) आणि स्थानिक पावसासाठी (${rain} मिमी) अत्यंत अनुकूल आणि सहनशील.`,
      pa: `ਵਧੀਆ ਬਦਲਵੀਂ ਫ਼ਸਲ: ਮੌਜੂਦਾ ਮਿੱਟੀ ਨਾਈਟ੍ਰੋਜਨ (${n} ਕਿਲੋ/ਹੈ.) ਅਤੇ ਮੀਂਹ (${rain} ਮਿਲੀਮੀਟਰ) ਵਿੱਚ ਸਥਿਰ ਝਾੜ ਦੇਣ ਵਾਲੀ ਫ਼ਸਲ।`,
      gu: `શ્રેષ્ઠ વૈકલ્પિક પાક: હાલની જમીન નાઇટ્રોજન (${n} કિગ્રા/હે.) અને વરસાદ (${rain} મીમી) માં સ્થિર અને સારું ઉત્પાદન આપવા સક્ષમ.`,
      te: `మంచి ప్రత్యామ్నాయ పంట: ప్రస్తుత నేల నత్రజని (${n} కిలోలు/హెక్టారు) మరియు వర్షపాతం (${rain} మి.మీ.) వద్ద నిలకడైన దిగుబడినిస్తుంది.`,
      ta: `சிறந்த மாற்றுப் பயிர்: தற்போதைய மண் தழைச்சத்து (${n} கிலோ/ஹெக்) மற்றும் மழை அளவுக்கு (${rain} மிமீ) நன்கு ஒத்துப்போகும் பயிர்.`,
      bn: `চমৎকার বিকল্প ফসল: বর্তমান মাটির নাইট্রোজেন (${n} কেজি/হেক্টর) এবং বৃষ্টিপাতে (${rain} মিমি) স্থিতিশীল ফলনশীল।`,
      kn: `ಉತ್ತಮ ಪರ್ಯಾಯ ಬೆಳೆ: ಪ್ರಸ್ತುತ ಮಣ್ಣಿನ ಸಾರಜನಕ (${n} ಕೆಜಿ/ಹೆಕ್ಟೇರ್) ಮತ್ತು ಮಳೆಗೆ (${rain} ಮಿಮೀ) ಹೊಂದಿಕೊಂಡು ಸ್ಥಿರ ಇಳುವರಿ ನೀಡುತ್ತದೆ.`
    };
    return dict[l] || dict['hi'] || dict['en'];
  }

  function getPreferredCropDescription(topCrop, targetCrop, currentN, currentRain, yieldVal, priceSubVal, lang) {
    const l = lang || 'hi';
    const dict = {
      en: `💡 <strong>Why switch to ${topCrop}:</strong> Rather than risking losses with ${targetCrop}, ${topCrop} naturally matches your available soil nutrients (${currentN} kg/ha N) and rainfall (${currentRain} mm), delivering a protected harvest of ${yieldVal} with ${priceSubVal}.`,
      hi: `💡 <strong>${topCrop} क्यों चुनें:</strong> ${targetCrop} में फसल विफलता का जोखिम लेने के बजाय, ${topCrop} आपकी मिट्टी (${currentN} N) और वर्षा (${currentRain} mm) के पूर्णतः अनुकूल है, जिससे ${yieldVal} की सुरक्षित पैदावार मिलती है।`,
      mr: `💡 <strong>${topCrop} का निवडावे:</strong> ${targetCrop} मधील नुकसान टाळून, ${topCrop} आपल्या जमिनीतील घटक (${currentN} नत्र) आणि मान्सून पावसाचा (${currentRain} मिमी) परिपूर्ण वापर करते, आणि ${yieldVal} हमखास उत्पन्न देते.`,
      pa: `💡 <strong>${topCrop} ਕਿਉਂ ਚੁਣੋ:</strong> ${targetCrop} ਵਿੱਚ ਨੁਕਸਾਨ ਦੇ ਜੋਖਮ ਦੀ ਬਜਾਏ, ${topCrop} ਤੁਹਾਡੀ ਮਿੱਟੀ (${currentN} N) ਅਤੇ ਮੀਂਹ (${currentRain} ਮਿਲੀਮੀਟਰ) ਦੇ ਪੂਰੀ ਤਰ੍ਹਾਂ ਅਨੁਕੂਲ ਹੈ, ਜਿਸ ਨਾਲ ${yieldVal} ਦਾ ਸੁਰੱਖਿਅਤ ਝਾੜ ਮਿਲਦਾ ਹੈ।`,
      gu: `💡 <strong>${topCrop} શા માટે પસંદ કરવું:</strong> ${targetCrop} માં નુકસાનના જોખમને બદલે, ${topCrop} તમારી જમીન (${currentN} N) અને વરસાદ (${currentRain} મીમી) માટે અત્યંત અનુકૂળ છે, જે ${yieldVal} નું સુરક્ષિત ઉત્પાદન આપે છે।`,
      te: `💡 <strong>${topCrop} ఎందుకు ఎంచుకోవాలి:</strong> ${targetCrop} లో నష్టపోయే ప్రమాదం లేకుండా, ${topCrop} మీ నేల పోషకాలు (${currentN} N) మరియు వర్షపాతం (${currentRain} మి.మీ.) కు సరిగ్గా సరిపోతుంది, ${yieldVal} సురక్షిత దిగుబడిని ఇస్తుంది.`,
      ta: `💡 <strong>${topCrop} ஏன் தேர்வு செய்ய வேண்டும்:</strong> ${targetCrop} பயிரிட்டு நஷ்டமடைவதை விட, ${topCrop} உங்கள் மண் சத்துக்கள் (${currentN} N) மற்றும் மழையளவுக்கு (${currentRain} மிமீ) மிகச் சரியாக பொருந்தி, ${yieldVal} பாதுகாப்பான மகசூலைத் தருகிறது.`,
      bn: `💡 <strong>কেন ${topCrop} বেছে নেবেন:</strong> ${targetCrop} চাষে লোকসানের ঝুঁকি না নিয়ে, ${topCrop} আপনার মাটির পুষ্টি (${currentN} N) এবং বৃষ্টিপাতের (${currentRain} মিমি) সাথে সম্পূর্ণ সামঞ্জস্যপূর্ণ হয়ে ${yieldVal} নিরাপদ ফলন প্রদান করে।`,
      kn: `💡 <strong>${topCrop} ಅನ್ನು ಏಕೆ ಆಯ್ಕೆ ಮಾಡಬೇಕು:</strong> ${targetCrop} ನಲ್ಲಿ ನಷ್ಟ ಅನುಭವಿಸುವ ಬದಲು, ${topCrop} ನಿಮ್ಮ ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳು (${currentN} N) ಮತ್ತು ಮಳೆಗೆ (${currentRain} ಮಿಮೀ) ಸಂಪೂರ್ಣವಾಗಿ ಹೊಂದಿಕೊಳ್ಳುತ್ತದೆ, ಮತ್ತು ${yieldVal} ಸುರಕ್ಷಿತ ಇಳುವರಿಯನ್ನು ನೀಡುತ್ತದೆ.`
    };
    return dict[l] || dict['hi'] || dict['en'];
  }

  function getVoiceReadoutText(bestMeta, best, lang) {
    const l = lang || 'hi';
    const dict = {
      en: `Top Agro Recommendation: ${bestMeta.fullName}. Agronomic match ${best.confidence} percent. Expected yield: ${bestMeta.yield}. Water need: ${bestMeta.water}. Duration: ${bestMeta.duration}.`,
      hi: `शीर्ष अनुशंसित फसल: ${bestMeta.fullName}। मैच आत्मविश्वास ${best.confidence} प्रतिशत। संभावित उपज: ${bestMeta.yield}। जल आवश्यकता: ${bestMeta.water}। फसल अवधि: ${bestMeta.duration}।`,
      mr: `अव्वल शिफारस केलेले पीक: ${bestMeta.fullName}. योग्यतेचे प्रमाण ${best.confidence} टक्के. अपेक्षित उत्पादन: ${bestMeta.yield}. पाण्याची गरज: ${bestMeta.water}. कालावधी: ${bestMeta.duration}.`,
      pa: `ਸਿਖਰਲੀ ਸਿਫ਼ਾਰਸ਼ ਕੀਤੀ ਫ਼ਸਲ: ${bestMeta.fullName}। ਅਨੁਕੂਲਤਾ ${best.confidence} ਪ੍ਰਤੀਸ਼ਤ। ਸੰਭਾਵਿਤ ਝਾੜ: ${bestMeta.yield}। ਪਾਣੀ ਦੀ ਲੋੜ: ${bestMeta.water}। ਸਮਾਂ: ${bestMeta.duration}।`,
      gu: `શ્રેષ્ઠ ભલામણ કરેલ પાક: ${bestMeta.fullName}. અનુકૂળતા ${best.confidence} ટકા. અપેક્ષિત ઉત્પાદન: ${bestMeta.yield}. પાણીની જરૂરિયાત: ${bestMeta.water}. પાક સમય: ${bestMeta.duration}।`,
      te: `అగ్రశ్రేణి సిఫార్సు చేసిన పంట: ${bestMeta.fullName}. అనుకూలత ${best.confidence} శాతం. ఆశించిన దిగుబడి: ${bestMeta.yield}. నీటి అవసరం: ${bestMeta.water}. పంట కాలం: ${bestMeta.duration}.`,
      ta: `முதன்மைப் பரிந்துரைக்கப்படும் பயிர்: ${bestMeta.fullName}. பொருத்தம் ${best.confidence} சதவீதம். எதிர்பார்க்கப்படும் மகசூல்: ${bestMeta.yield}. நீர் தேவை: ${bestMeta.water}. காலம்: ${bestMeta.duration}.`,
      bn: `শীর্ষ সুপারিশকৃত ফসল: ${bestMeta.fullName}। উপযোগিতা ${best.confidence} শতাংশ। প্রত্যাশিত ফলন: ${bestMeta.yield}। জলের প্রয়োজনীয়তা: ${bestMeta.water}। সময়কাল: ${bestMeta.duration}।`,
      kn: `ಅತ್ಯುತ್ತಮ ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆ: ${bestMeta.fullName}. ಹೊಂದಾಣಿಕೆ ${best.confidence} ಪ್ರತಿಶತ. ನಿರೀಕ್ಷಿತ ಇಳುವರಿ: ${bestMeta.yield}. ನೀರಿನ ಅವಶ್ಯಕತೆ: ${bestMeta.water}. ಬೆಳೆ ಕಾಲ: ${bestMeta.duration}.`
    };
    return dict[l] || dict['hi'] || dict['en'];
  }

  function getAltVoiceReadoutText(tag, altMeta, alt, lang) {
    const l = lang || 'hi';
    const dict = {
      en: `${tag}: ${altMeta.fullName}. Match ${alt.confidence} percent.`,
      hi: `${tag}: ${altMeta.fullName}। अनुकूलता ${alt.confidence} प्रतिशत।`,
      mr: `${tag}: ${altMeta.fullName}. जुळणी ${alt.confidence} टक्के.`,
      pa: `${tag}: ${altMeta.fullName}। ਅਨੁਕੂਲਤਾ ${alt.confidence} ਪ੍ਰਤੀਸ਼ਤ।`,
      gu: `${tag}: ${altMeta.fullName}. અનુકૂળતા ${alt.confidence} ટકા.`,
      te: `${tag}: ${altMeta.fullName}. అనుకూలత ${alt.confidence} శాతం.`,
      ta: `${tag}: ${altMeta.fullName}. பொருத்தம் ${alt.confidence} சதவீதம்.`,
      bn: `${tag}: ${altMeta.fullName}। উপযোগিতা ${alt.confidence} শতাংশ।`,
      kn: `${tag}: ${altMeta.fullName}. ಹೊಂದಾಣಿಕೆ ${alt.confidence} ಪ್ರತಿಶತ.`
    };
    return dict[l] || dict['hi'] || dict['en'];
  }

  function getCropMeta(cropKey, fallbackProfile = {}) {
    const key = (cropKey || '').toLowerCase();
    const lang = state.language || 'hi';
    const cleanName = (cropKey || '').charAt(0).toUpperCase() + (cropKey || '').slice(1);
    const cropLocal = CROP_NAME_I18N[key] ? (CROP_NAME_I18N[key][lang] || cleanName) : cleanName;

    const attrDict = {
      seasonBadge: {
        en: 'Agro Recommended',
        hi: 'प्रमुख अनुशंसित फसल',
        mr: 'शिफारस केलेले प्रमुख पीक',
        pa: 'ਸਿਫ਼ਾਰਸ਼ ਕੀਤੀ ਮੁੱਖ ਫ਼ਸਲ',
        gu: 'ભલામણ કરેલ મુખ્ય પાક',
        te: 'సిఫార్సు చేయబడిన ప్రధాన పంట',
        ta: 'பரிந்துரைக்கப்பட்ட முதன்மைப் பயிர்',
        bn: 'সুপারিশকৃত প্রধান ফসল',
        kn: 'ಶಿಫಾರಸು ಮಾಡಲಾದ ಮುಖ್ಯ ಬೆಳೆ'
      },
      yieldSub: {
        en: 'Optimal Management',
        hi: 'इष्टतम प्रबंधन',
        mr: 'उत्तम व्यवस्थापन',
        pa: 'ਸਰਵੋਤਮ ਦੇਖਭਾਲ',
        gu: 'શ્રેષ્ઠ વ્યવસ્થાપન',
        te: 'సరైన యాజమాన్యం',
        ta: 'முறையான மேலாண்மை',
        bn: 'সঠিক পরিচর্যা',
        kn: 'ಉತ್ತಮ ನಿರ್ವಹಣೆ'
      },
      priceSub: {
        en: 'Active Mandi Demand (MSP)',
        hi: 'सक्रिय मंडी मांग (MSP)',
        mr: 'बाजारपेठेत चांगली मागणी (MSP)',
        pa: 'ਮੰਡੀ ਵਿੱਚ ਚੰਗੀ ਮੰਗ (MSP)',
        gu: 'માર્કેટ યાર્ડમાં સારી માંગ (MSP)',
        te: 'మార్కెట్ డిమాండ్ (MSP)',
        ta: 'சந்தை தேவை (MSP)',
        bn: 'বাজার চাহিদা (MSP)',
        kn: 'ಮಾರುಕಟ್ಟೆ ಬೇಡಿಕೆ (MSP)'
      },
      durationSub: {
        en: 'Season Duration',
        hi: 'मौसम चक्र अवधि',
        mr: 'हंगाम कालावधी',
        pa: 'ਫ਼ਸਲੀ ਚੱਕਰ ਸਮਾਂ',
        gu: 'પાક ઋતુ ચક્ર',
        te: 'పంట కాల పరిమితి',
        ta: 'பயிர் கால அளவு',
        bn: 'মৌসুম সময়কাল',
        kn: 'ಬೆಳೆ ಕಾಲಾವಧಿ'
      },
      basalDose: {
        en: 'Apply balanced NPK as per SAU guidelines at sowing.',
        hi: 'बुवाई के समय कृषि विश्वविद्यालय की सिफारिश अनुसार संतुलित NPK खुराक दें।',
        mr: 'पेरणीच्या वेळी कृषी विद्यापीठाच्या शिफारशीनुसार संतुलित खतांचा डोस द्या.',
        pa: 'ਬਿਜਾਈ ਸਮੇਂ ਖੇਤੀਬਾੜੀ ਯੂਨੀਵਰਸਿਟੀ ਦੀ ਸਿਫ਼ਾਰਸ਼ ਅਨੁਸਾਰ ਸੰਤੁਲਿਤ NPK ਖੁਰਾਕ ਦਿਓ।',
        gu: 'વાવણી વખતે કૃષિ યુનિવર્સિટીની ભલામણ મુજબ સંતુલિત NPK ખાતર આપો.',
        te: 'విత్తే సమయంలో వ్యవసాయ విశ్వవిద్యాలయ మార్గదర్శకాల ప్రకారం సమతుల్య NPK మోతాదు ఇవ్వండి.',
        ta: 'விதைப்பின் போது வேளாண் பல்கலைக்கழக பரிந்துரைப்படி சீரான NPK உரமிடுங்கள்.',
        bn: 'বপনের সময় কৃষি বিশ্ববিদ্যালয়ের নির্দেশিকা অনুযায়ী সুষম NPK সার প্রয়োগ করুন।',
        kn: 'ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯದ ಮಾರ್ಗಸೂಚಿಯಂತೆ ಸಮತೋಲಿತ NPK ಗೊಬ್ಬರ ನೀಡಿ.'
      }
    };

    const getL = (dict, fallback = '') => dict[lang] || dict['hi'] || dict['en'] || fallback;

    let waterLvl = 'Moderate';
    let waterRaw = (fallbackProfile.water_demand || 'Moderate').toLowerCase();
    if (waterRaw.includes('high') || waterRaw.includes('standing') || key === 'rice' || key === 'sugarcane' || key === 'jute') {
      waterLvl = 'High';
    } else if (waterRaw.includes('low') || key === 'chickpea' || key === 'mothbeans' || key === 'lentil') {
      waterLvl = 'Low';
    }

    const waterI18n = {
      High: {
        en: 'High', hi: 'अधिक (High)', mr: 'जास्त (High)', pa: 'ਵੱਧ (High)',
        gu: 'વધારે (High)', te: 'అధికం (High)', ta: 'அதிகம் (High)', bn: 'বেশি (High)', kn: 'ಹೆಚ್ಚು (High)'
      },
      Low: {
        en: 'Low', hi: 'कम (Low)', mr: 'कमी (Low)', pa: 'ਘੱਟ (Low)',
        gu: 'ઓછું (Low)', te: 'తక్కువ (Low)', ta: 'குறைவு (Low)', bn: 'কম (Low)', kn: 'ಕಡಿಮೆ (Low)'
      },
      Moderate: {
        en: 'Moderate', hi: 'मध्यम (Moderate)', mr: 'मध्यम (Moderate)', pa: 'ਦਰਮਿਆਨਾ (Moderate)',
        gu: 'મધ્યમ (Moderate)', te: 'మితం (Moderate)', ta: 'மிதமான (Moderate)', bn: 'মাঝারি (Moderate)', kn: 'ಮಧ್ಯಮ (Moderate)'
      }
    };

    const waterSubI18n = {
      High: {
        en: 'Canal / Submerged', hi: 'नहर / जलमग्न सिंचाई', mr: 'कालवा / पाणी साचलेली शेती',
        pa: 'ਨਹਿਰੀ / ਭਰਪੂਰ ਪਾਣੀ', gu: 'નહેર / પૂરતું પાણી', te: 'కాలువ / సమృద్ధి నీరు',
        ta: 'கால்வாய் / அதிக நீர்', bn: 'খাল / পর্যাপ্ত জল', kn: 'ಕಾಲುವೆ / ಹೇರಳ ನೀರು'
      },
      Low: {
        en: 'Rainfed / Low Water', hi: 'वर्षा आधारित / कम जल', mr: 'कोरडवाहू / कमी पाणी',
        pa: 'ਬਰਸਾਤੀ / ਘੱਟ ਪਾਣੀ', gu: 'વરસાદ આધારિત / ઓછું પાણી', te: 'వర్షాధార / తక్కువ నీరు',
        ta: 'மானாவாரி / குறைந்த நீர்', bn: 'বৃষ্টি নির্ভর / কম জল', kn: 'ಮಳೆ ಆಶ್ರಿತ / ಕಡಿಮೆ ನೀರು'
      },
      Moderate: {
        en: 'Well-drained Loam', hi: 'नियमित सिंचाई / दोमट', mr: 'नियमित सिंचन / निचऱ्याची जमीन',
        pa: 'ਨਿਯਮਤ ਸਿੰਚਾਈ / ਦੋਮਟ', gu: 'નિયમિત પિયત / ગોરાડુ જમીન', te: 'క్రమబద్ధమైన నీరు / సారవంతమైన నేల',
        ta: 'வழக்கமான பாசனம் / வண்டல் மண்', bn: 'নিয়মিত সেচ / দোআঁশ মাটি', kn: 'ನಿಯಮಿತ ನೀರಾವರಿ / ಗೋಡು ಮಣ್ಣು'
      }
    };

    const varietiesI18n = {
      en: `Certified High-Yield Varieties (${cleanName})`,
      hi: `प्रमाणित उन्नत किस्में (${cropLocal})`,
      mr: `प्रमाणित सुधारित वाण (${cropLocal})`,
      pa: `ਪ੍ਰਮਾਣਿਤ ਉੱਨਤ ਕਿਸਮਾਂ (${cropLocal})`,
      gu: `પ્રમાણિત સુધારેલી જાતો (${cropLocal})`,
      te: `ధృవీకరించబడిన అధిక దిగుబడి రకాలు (${cropLocal})`,
      ta: `சான்றளிக்கப்பட்ட உயர் விளைச்சல் ரகங்கள் (${cropLocal})`,
      bn: `অনুমোদিত উচ্চ ফলনশীল জাত (${cropLocal})`,
      kn: `ಪ್ರಮಾಣೀಕೃತ ಸುಧಾರಿತ ತಳಿಗಳು (${cropLocal})`
    };

    const SPECIFIC_VARIETIES = {
      rice: {
        en: 'MTU-1010, Indrayani, or PKV-HMT', hi: 'MTU-1010, इंद्रायणी, या PKV-HMT', mr: 'MTU-1010, इंद्रायणी, किंवा PKV-HMT',
        pa: 'MTU-1010, ਪੀ.ਆਰ.-126, ਜਾਂ ਇੰਦਰਾਇਣੀ', gu: 'MTU-1010, ઇન્દ્રાયણી, અથવા ગુર્જરી', te: 'MTU-1010, బిపిటి-5204 (సాంబ మసూరి)',
        ta: 'MTU-1010, ஏடிடீ-45, அல்லது ஐஆர்டி-20', bn: 'MTU-1010, শতাব্দী, বা স্বর্ণ', kn: 'MTU-1010, ಜಯಾ, ಅಥವಾ ಸೋನಾ ಮಸೂರಿ'
      },
      cotton: {
        en: 'Bt Cotton Bollgard II (RCH-659 / Bunny)', hi: 'बी.टी. कपास बोलगार्ड II (RCH-659 / बनी)', mr: 'बीटी कापूस बोलगार्ड II (RCH-659 / बनी)',
        pa: 'ਬੀ.ਟੀ. ਕਪਾਹ ਬੋਲਗਾਰਡ II (RCH-659)', gu: 'બીટી કપાસ બોલગાર્ડ II (RCH-659)', te: 'బిటి పత్తి బోల్‌గార్డ్ II (RCH-659)',
        ta: 'பிடி பருத்தி போல்வார்ட் II (RCH-659)', bn: 'বিটি তুলা বোলগার্ড II (RCH-659)', kn: 'ಬಿಟಿ ಹತ್ತಿ ಬೋಲ್‌ಗಾರ್ಡ್ II (RCH-659)'
      },
      maize: {
        en: 'DHM-117, Pioneer P3396, or Bio-9681', hi: 'DHM-117, पायनियर P3396, या बायो-9681', mr: 'DHM-117, पायोनियर P3396, किंवा बायो-9681',
        pa: 'DHM-117, ਪਾਇਨੀਅਰ P3396, ਜਾਂ ਬਾਇਓ-9681', gu: 'DHM-117, પાયોનિયર P3396, અથવા બાયો-9681', te: 'DHM-117, పయనీర్ P3396, లేదా బయో-9681',
        ta: 'DHM-117, பயனியர் P3396, அல்லது பயோ-9681', bn: 'DHM-117, পায়োনিয়ার P3396, বা বায়ো-9681', kn: 'DHM-117, ಪಯೋನಿಯರ್ P3396, ಅಥವಾ ಬಯೋ-9681'
      },
      wheat: {
        en: 'HD-2967, PBW-550, or Lok-1', hi: 'HD-2967, PBW-550, या लोक-1', mr: 'HD-2967, PBW-550, किंवा लोक-1',
        pa: 'HD-2967, ਪੀ.ਬੀ.ਡਬਲਯੂ.-550, ਜਾਂ ਲੋਕ-1', gu: 'HD-2967, PBW-550, અથવા લોક-1', te: 'HD-2967, పిబిడబ్ల్యూ-550, లేదా లోక్-1',
        ta: 'HD-2967, பிபிடபிள்யூ-550, அல்லது லோக்-1', bn: 'HD-2967, পিবিডব্লিউ-550, বা লোক-1', kn: 'HD-2967, ಪಿಬಿಡಬ್ಲ್ಯೂ-550, ಅಥವಾ ಲೋಕ್-1'
      },
      sugarcane: {
        en: 'Co-0238, Co-86032 (Nira)', hi: 'Co-0238, Co-86032 (नीरा)', mr: 'Co-0238, Co-86032 (निरा)',
        pa: 'Co-0238, Co-86032', gu: 'Co-0238, Co-86032 (નીરા)', te: 'Co-0238, Co-86032 (నీరా)',
        ta: 'Co-0238, Co-86032 (நீரா)', bn: 'Co-0238, Co-86032', kn: 'Co-0238, Co-86032 (ನೀರಾ)'
      }
    };

    const SPECIFIC_BASAL = {
      rice: {
        en: '50% N + 100% P + 100% K at transplanting.', hi: 'रोपाई के समय 50% N + 100% P + 100% K बेसल खुराक दें।', mr: 'लावणीच्या वेळी ५०% नत्र + १००% स्फुरद + १००% पालाश बेसल डोस द्या.',
        pa: 'ਲਵਾਈ ਸਮੇਂ 50% ਨਾਈਟ੍ਰੋਜਨ + 100% ਫਾਸਫੋਰਸ + 100% ਪੋਟਾਸ਼ ਪਾਓ।', gu: 'રોપણી વખતે 50% N + 100% P + 100% K આપો.', te: 'నాటే సమయంలో 50% నత్రజని + 100% భాస్వరం + 100% పొటాష్ ఇవ్వండి.',
        ta: 'நடவு செய்யும்போது 50% N + 100% P + 100% K அடியுரமாக இடவும்.', bn: 'রোপণের সময় ৫০% N + ১০০% P + ১০০% K প্রয়োগ করুন।', kn: 'ನಾಟಿ ಮಾಡುವಾಗ 50% N + 100% P + 100% K ಬುಡ ಗೊಬ್ಬರವಾಗಿ ನೀಡಿ.'
      },
      cotton: {
        en: '20% N + 100% P + 100% K at dibbling.', hi: 'बिजाई के समय 20% N + 100% P + 100% K बेसल खुराक दें।', mr: 'टोकण करताना २०% नत्र + १००% स्फुरद + १००% पालाश बेसल डोस द्या.',
        pa: 'ਬਿਜਾਈ ਸਮੇਂ 20% ਨਾਈਟ੍ਰੋਜਨ + 100% ਫਾਸਫੋਰਸ + 100% ਪੋਟਾਸ਼ ਪਾਓ।', gu: 'વાવણી વખતે 20% N + 100% P + 100% K આપો.', te: 'విత్తే సమయంలో 20% నత్రజని + 100% భాస్వరం + 100% పొటాష్ ఇవ్వండి.',
        ta: 'விதைக்கும்போது 20% N + 100% P + 100% K அடியுரமாக இடவும்.', bn: 'বপনের সময় ২০% N + ১০০% P + ১০০% K প্রয়োগ করুন।', kn: 'ಬಿತ್ತನೆ ಮಾಡುವಾಗ 20% N + 100% P + 100% K ಬುಡ ಗೊಬ್ಬರವಾಗಿ ನೀಡಿ.'
      },
      maize: {
        en: '33% N + 100% P + 100% K at sowing.', hi: 'बुवाई के समय 33% N + 100% P + 100% K बेसल खुराक दें।', mr: 'पेरणीच्या वेळी ३३% नत्र + १००% स्फुरद + १००% पालाश बेसल डोस द्या.',
        pa: 'ਬਿਜਾਈ ਸਮੇਂ 33% ਨਾਈਟ੍ਰੋਜਨ + 100% ਫਾਸਫੋਰਸ + 100% ਪੋਟਾਸ਼ ਪਾਓ।', gu: 'વાવણી વખતે 33% N + 100% P + 100% K આપો.', te: 'విత్తే సమయంలో 33% నత్రజని + 100% భాస్వరం + 100% పొటాష్ ఇవ్వండి.',
        ta: 'விதைக்கும்போது 33% N + 100% P + 100% K அடியுரமாக இடவும்.', bn: 'বপনের সময় ৩৩% N + ১০০% P + ১০০% K প্রয়োগ করুন।', kn: 'ಬಿತ್ತನೆ ಮಾಡುವಾಗ 33% N + 100% P + 100% K ಬುಡ ಗೊಬ್ಬರವಾಗಿ ನೀಡಿ.'
      },
      wheat: {
        en: '50% N + 100% P + 100% K at crown root initiation.', hi: 'बुवाई के समय 50% N + 100% P + 100% K बेसल खुराक दें।', mr: 'पेरणीच्या वेळी ५०% नत्र + १००% स्फुरद + १००% पालाश बेसल डोस द्या.',
        pa: 'ਬਿਜਾਈ ਸਮੇਂ 50% ਨਾਈਟ੍ਰੋਜਨ + 100% ਫਾਸਫੋਰਸ + 100% ਪੋਟਾਸ਼ ਪਾਓ।', gu: 'વાવણી વખતે 50% N + 100% P + 100% K આપો.', te: 'విత్తే సమయంలో 50% నత్రజని + 100% భాస్వరం + 100% పొటాష్ ఇవ్వండి.',
        ta: 'விதைக்கும்போது 50% N + 100% P + 100% K அடியுரமாக இடவும்.', bn: 'বপনের সময় ৫০% N + ১০০% P + ১০০% K প্রয়োগ করুন।', kn: 'ಬಿತ್ತನೆ ಮಾಡುವಾಗ 50% N + 100% P + 100% K ಬುಡ ಗೊಬ್ಬರವಾಗಿ ನೀಡಿ.'
      },
      sugarcane: {
        en: 'Apply 33% N + 100% P + 100% K in furrows at planting.', hi: 'रोपण के समय 33% N + 100% P + 100% K कतारों में बेसल खुराक दें।', mr: 'लागवडीच्या वेळी ३३% नत्र + १००% स्फुरद + १००% पालाश चरीत टाकावे.',
        pa: 'ਬਿਜਾਈ ਵੇਲੇ 33% ਨਾਈਟ੍ਰੋਜਨ + 100% ਫਾਸਫੋਰਸ + 100% ਪੋਟਾਸ਼ ਸਿਆੜਾਂ ਵਿੱਚ ਪਾਓ।', gu: 'રોપણી વખતે 33% N + 100% P + 100% K ચાસમાં આપો.', te: 'నాటే సమయంలో 33% నత్రజని + 100% భాస్వరం + 100% పొటాష్ సాలులలో వేయండి.',
        ta: 'நடவு செய்யும்போது 33% N + 100% P + 100% K பாரில் இடவும்.', bn: 'রোপণের সময় ৩৩% N + ১০০% P + ১০০% K নালায় প্রয়োগ করুন।', kn: 'ನಾಟಿ ಮಾಡುವಾಗ 33% N + 100% P + 100% K ಸಾಲುಗಳಲ್ಲಿ ನೀಡಿ.'
      }
    };

    const yieldUnit = (lang === 'en' || lang === 'pa') ? 'Q/Ha' : ((lang === 'mr' || lang === 'gu') ? 'ક્વિન્ટલ/હે.' : 'क्विंटल/हेक्टेयर');
    const yieldRange = (fallbackProfile.yield_range) || (key === 'rice' ? '44 – 48' : (key === 'cotton' ? '22 – 28' : (key === 'wheat' ? '45 – 52' : (key === 'sugarcane' ? '850 – 1100' : '32 – 42'))));
    const fullYield = `${yieldRange} ${yieldUnit}`;

    const cycleDays = fallbackProfile.cycle_days || (key === 'rice' ? '120 – 135 Days' : (key === 'cotton' ? '150 – 170 Days' : (key === 'sugarcane' ? '300 – 360 Days' : '90 – 120 Days')));

    const chosenVarieties = SPECIFIC_VARIETIES[key] ? (SPECIFIC_VARIETIES[key][lang] || SPECIFIC_VARIETIES[key]['en']) : (varietiesI18n[lang] || varietiesI18n['en']);
    const chosenBasal = SPECIFIC_BASAL[key] ? (SPECIFIC_BASAL[key][lang] || SPECIFIC_BASAL[key]['en']) : getL(attrDict.basalDose);

    return {
      fullName: `${cropLocal} (${cleanName})`,
      seasonBadge: getL(attrDict.seasonBadge),
      varieties: chosenVarieties,
      yield: fullYield,
      yieldSub: getL(attrDict.yieldSub),
      water: waterI18n[waterLvl][lang] || waterI18n[waterLvl]['en'],
      waterSub: waterSubI18n[waterLvl][lang] || waterSubI18n[waterLvl]['en'],
      price: fallbackProfile.economic_outlook ? fallbackProfile.economic_outlook.split(' ')[0] : 'MSP Protected',
      priceSub: getL(attrDict.priceSub),
      duration: cycleDays,
      durationSub: getL(attrDict.durationSub),
      basalDose: chosenBasal,
      rationale: (n, rain) => getCropRationale(key, cropLocal, n, rain, lang)
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BOTTOM SECTION SUB-TABS (Advisory / Spectrum / Records)
  // ─────────────────────────────────────────────────────────────────────────
  if (selectTargetCrop) {
    selectTargetCrop.addEventListener('change', () => {
      // If user changes planned crop, automatically run prediction with current parameters
      if (state.lastRecommendationsData) {
        predictCrops();
      }
    });
  }

    const subtabPills = document.querySelectorAll('.section-pill');
  subtabPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetSubtab = pill.dataset.subtab;
      subtabPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      document.querySelectorAll('.subtab-panel').forEach(panel => {
        panel.classList.add('is-hidden');
      });
      const activePanel = document.getElementById(`subtab-panel-${targetSubtab}`);
      if (activePanel) {
        activePanel.classList.remove('is-hidden');
      }
      if (targetSubtab === 'records') {
        renderPastSeasonRecords(state.activePastSeasonCropFilter || 'all');
        if (typeof updateHistoryUI === 'function') updateHistoryUI();
      }
    });
  });


  // ─────────────────────────────────────────────────────────────────────────
  // OFFICIAL PAST SEASON CULTIVATION & REALIZED PRICE BENCHMARKS (TOP 5 CROPS)
  // ─────────────────────────────────────────────────────────────────────────
  const PAST_SEASON_I18N = {
    heading: {
      en: '🌾 Official Past Season Cultivation & Realized Price Benchmarks (Top 5 Crops)',
      hi: '🌾 पिछले सीजन के आधिकारिक फसल उत्पादन एवं मंडी भाव रिकॉर्ड (शीर्ष 5 फसलें)',
      mr: '🌾 मागील हंगामातील अधिकृत पीक उत्पादन व बाजारभाव नोंदी (शीर्ष ५ पिके)',
      pa: '🌾 ਪਿਛਲੇ ਸੀਜ਼ਨ ਦੇ ਅਧਿਕਾਰਤ ਫਸਲ ਉਤਪਾਦਨ ਅਤੇ ਮੰਡੀ ਭਾਅ ਰਿਕਾਰਡ (ਚੋਟੀ ਦੀਆਂ 5 ਫਸਲਾਂ)',
      gu: '🌾 પાછલી સીઝનના સત્તાવાર પાક ઉત્પાદન અને બજારભાવ રેકોર્ડ્સ (ટોચના ૫ પાકો)',
      te: '🌾 మునుపటి సీజన్ అధికారిక పంట సాగు & మార్కెట్ ధర రಿಕార్డులు (టాప్ 5 పంటలు)',
      ta: '🌾 கடந்த பருவத்தின் அதிகாரப்பூர்வ பயிர் சாகுபடி & சந்தை விலை பதிவுகள் (முதல் 5 பயிர்கள்)',
      bn: '🌾 বিগত মৌসুমের আনুষ্ঠানিক ফসল উৎপাদন ও বাজার দর রেকর্ড (শীর্ষ ৫টি ফসল)',
      kn: '🌾 ಹಿಂದಿನ ಋತುವಿನ ಅಧಿಕೃತ ಬೆಳೆ ಉತ್ಪಾದನೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ದಾಖಲೆಗಳು (ಟಾಪ್ 5 ಬೆಳೆಗಳು)'
    },
    subheading: {
      en: 'Verified ICAR & Mandi harvest prices, net profit per acre, agronomic problems faced during cultivation, and resolution packages.',
      hi: 'सत्यापित ICAR एवं मंडी कटाई भाव, प्रति एकड़ शुद्ध लाभ, खेती के दौरान आई समस्याएं और समाधान पैकेज।',
      mr: 'तपासलेले ICAR व कृषी उत्पन्न बाजार दर, एकरी निव्वळ नफा, लागवडीदरम्यान आलेल्या समस्या आणि निवारण पॅकेज.',
      pa: 'ਪ੍ਰਮਾਣਿਤ ICAR ਅਤੇ ਮੰਡੀ ਵਾਢੀ ਦੇ ਭਾਅ, ਪ੍ਰਤੀ ਏਕੜ ਸ਼ੁੱਧ ਲਾਭ, ਖੇਤੀ ਦੌਰਾਨ ਆਈਆਂ ਸਮੱਸਿਆਵਾਂ ਅਤੇ ਹੱਲ।',
      gu: 'ચકાસાયેલ ICAR અને મંડી લણણી ભાવો, એકર દીઠ ચોખ્ખો નફો, ખેતી દરમિયાન આવેલી સમસ્યાઓ અને નિવારણ પેકેજ.',
      te: 'ధృవీకరించబడిన ICAR & మార్కెట్ ధరలు, ఎకరాకు నికర లాభం, సాగులో ఎదురైన సమస్యలు మరియు పరిష్కారాలు.',
      ta: 'சரிபார்க்கப்பட்ட ICAR & சந்தை விலைகள், ஏக்கருக்கு நிகர லாபம், சாகுபடியின் போது சந்தித்த பிரச்சினைகள் மற்றும் தீர்வுகள்.',
      bn: 'যাচাইকৃত ICAR ও বাজার দর, একর প্রতি নিট লাভ, চাষের সময় সম্মুখীন হওয়া সমস্যা এবং সমাধান প্যাকেজ।',
      kn: 'ಪರಿಶೀಲಿಸಿದ ICAR ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು, ಎಕರೆಗೆ ನಿವ್ವಳ ಲಾಭ, ಕೃಷಿಯಲ್ಲಿ ಎದುರಾದ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಪರಿಹಾರಗಳು.'
    },
    lblIdealPrice: {
      en: 'Ideal Crop Price Got After Cultivation',
      hi: 'फसल कटाई के बाद मिला आदर्श मंडी भाव',
      mr: 'पीक काढणीनंतर मिळालेला आदर्श बाजारभाव',
      pa: 'ਫਸਲ ਕਟਾਈ ਤੋਂ ਬਾਅਦ ਮਿਲਿਆ ਆਦਰਸ਼ ਮੰਡੀ ਭਾਅ',
      gu: 'લણણી પછી મળેલ આદર્શ બજારભાવ',
      te: 'పంట కోత తర్వాత లభించిన ఆదర్శ మార్కెట్ ధర',
      ta: 'அறுவடைக்குப் பின் கிடைத்த சிறந்த சந்தை விலை',
      bn: 'ফসল তোলার পর প্রাপ্ত আদর্শ বাজার দর',
      kn: 'ಸುಗ್ಗಿ ನಂತರ ದೊರೆತ ಆದರ್ಶ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ'
    },
    lblMsp: { en: 'Govt MSP', hi: 'सरकारी MSP', mr: 'शासकीय हमीभाव MSP', pa: 'ਸਰਕਾਰੀ MSP', gu: 'સરકારી ટેકાના ભાવ MSP', te: 'ప్రభుత్వ MSP', ta: 'அரசு MSP', bn: 'সরকারি MSP', kn: 'ಸರ್ಕಾರಿ MSP' },
    lblGross: { en: 'Gross Realization', hi: 'सकल आय', mr: 'एकूण उत्पन्न', pa: 'ਕੁੱਲ ਆਮਦਨ', gu: 'કુલ આવક', te: 'మొత్తం ఆదాయం', ta: 'மொத்த வருமானம்', bn: 'মোট আয়', kn: 'ಒಟ್ಟು ಆದಾಯ' },
    lblNetProfit: { en: 'Net Profit', hi: 'शुद्ध लाभ', mr: 'निव्वळ नफा', pa: 'ਸ਼ੁੱਧ ਲਾਭ', gu: 'ચોખ્ખો નફો', te: 'ನಿకర లాభం', ta: 'நிகர லாபம்', bn: 'নিট লাভ', kn: 'ನಿವ್ವಳ ಲಾಭ' },
    lblYield: { en: 'Yield Achieved', hi: 'प्राप्त उपज', mr: 'मिळालेले उत्पादन', pa: 'ਪ੍ਰਾਪਤ ਝਾੜ', gu: 'મેળવેલ ઉત્પાદન', te: 'సాధించిన దిగుబడి', ta: 'அடைந்த மகசூல்', bn: 'অর্জিত ফলন', kn: 'ಪಡೆದ ಇಳುವರಿ' },
    lblTarget: { en: 'Target Realization', hi: 'लक्ष्य प्राप्ति', mr: 'लक्ष्य प्राप्ती', pa: 'ਟੀਚਾ ਪ੍ਰਾਪਤੀ', gu: 'ટાર્ગેટ પ્રાપ્તિ', te: 'లక్ష్య సాధన', ta: 'இலக்கு சாதனை', bn: 'লক্ষ্যমাত্রা অর্জন', kn: 'ಗುರಿ ಸಾಧನೆ' },
    lblWater: { en: 'Water / Climate', hi: 'जल / जलवायु', mr: 'पाणी / हवामान', pa: 'ਪਾਣੀ / ਜਲਵਾਯੂ', gu: 'પાણી / વાતાવરણ', te: 'నీరు / వాతావరణం', ta: 'நீர் / காலநிலை', bn: 'জল / জলবায়ু', kn: 'ನೀರು / ಹವಾಮಾನ' },
    lblCost: { en: 'Production Cost', hi: 'लागत मूल्य', mr: 'उत्पादन खर्च', pa: 'ਉਤਪਾਦਨ ਲਾਗਤ', gu: 'ઉત્પાદન ખર્ચ', te: 'ఉత్పత్తి ఖర్చు', ta: 'உற்பத்தி செலவு', bn: 'উৎপাদন খরচ', kn: 'ಉತ್ಪಾದನಾ ವೆಚ್ಚ' },
    lblProblemFaced: {
      en: '⚠️ Problem Faced During Cultivation',
      hi: '⚠️ फसल चक्र के दौरान आई कृषि समस्या',
      mr: '⚠️ पीक हंगामादरम्यान आलेली प्रमुख समस्या',
      pa: '⚠️ ਫਸਲ ਚੱਕਰ ਦੌਰਾਨ ਆਈ ਖੇਤੀਬਾੜੀ ਸਮੱਸਿਆ',
      gu: '⚠️ પાક દરમિયાન આવેલી મુખ્ય સમસ્યા',
      te: '⚠️ సాగు సమయంలో ఎదురైన వ్యవసాయ సమస్య',
      ta: '⚠️ சாகுபடியின் போது ஏற்பட்ட வேளாண் பிரச்சினை',
      bn: '⚠️ চাষের সময় সম্মুখীন হওয়া কৃষি সমস্যা',
      kn: '⚠️ ಕೃಷಿಯ ಸಮಯದಲ್ಲಿ ಎದುರಾದ ಪ್ರಮುಖ ಸಮಸ್ಯೆ'
    },
    lblMitigation: {
      en: '💡 ICAR Scientific Mitigation & Package Applied',
      hi: '💡 ICAR वैज्ञानिक समाधान एवं उपचार पैकेज',
      mr: '💡 ICAR वैज्ञानिक उपाययोजना व उपचार पद्धती',
      pa: '💡 ICAR ਵਿਗਿਆਨਕ ਹੱਲ ਅਤੇ ਉਪਚਾਰ',
      gu: '💡 ICAR વૈજ્ઞાનિક ઉકેલ અને માર્ગદર્શન પેકેજ',
      te: '💡 ICAR శాస్త్రీయ పరిష్కారం & యాజమాన్యం',
      ta: '💡 ICAR அறிவியல் தீர்வு & மேலாண்மை திட்டம்',
      bn: '💡 ICAR বৈজ্ঞানিক সমাধান ও চিকিৎসা প্যাকেজ',
      kn: '💡 ICAR ವೈಜ್ಞಾನಿಕ ಪರಿಹಾರ ಮತ್ತು ನಿರ್ವಹಣೆ'
    }
  };

  const PAST_SEASON_RECORDS_DB = [
    {
      crop_id: 'rice',
      crop_name: 'Paddy / Rice (Indica Wet)',
      variety: 'PR-126 (High Yielding)',
      season: 'Kharif 2024',
      mandi_price_realized: 2320.0,
      msp_benchmark: 2300.0,
      price_unit: '₹/Quintal',
      gross_realization_ha: 107880.0,
      net_profit_acre: 48500.0,
      yield_achieved_q_ha: 46.5,
      yield_target_pct: 97.0,
      production_cost_q: 1320.0,
      rainfall_or_water: '218 mm (Monsoon Rain)',
      problem_faced: 'Early vegetative leaf blast attack and mid-monsoon nitrogen leaching due to intense rainfall downpours.',
      mitigation_solution: 'Foliar spray of Tricyclazole 75% WP @ 0.6g/L + split Neem-coated Urea top-dressing restored active tillering.',
      translations: {
        hi: {
          crop_name: 'धान / चावल (Indica Wet)',
          variety: 'PR-126 (उन्नत किस्म)',
          season: 'खरीफ 2024',
          rainfall_or_water: '218 मिमी (मानसूनी वर्षा)',
          problem_faced: 'शुरुआती वानस्पतिक अवस्था में पत्ती झोंका (ब्लास्ट) रोग एवं भारी वर्षा से नाइट्रोजन निक्षालन।',
          mitigation_solution: 'ट्राइसाइक्लाजोल 75% WP @ 0.6 ग्राम/लीटर छिड़काव + नीम लेपित यूरिया का विभाजित प्रयोग कर फसल को पुनः हरा-भरा बनाया गया।'
        },
        mr: {
          crop_name: 'भात / धान (Indica Wet)',
          variety: 'PR-126 (सुधारित वाण)',
          season: 'खरीप २०२४',
          rainfall_or_water: '२१८ मिमी (पावसाचे पाणी)',
          problem_faced: 'सुरुवातीच्या शाकीय वाढीच्या काळात करपा रोग आणि मुसळधार पावसामुळे नत्राचा निचरा.',
          mitigation_solution: 'ट्रायसायक्लॅझोल ७५% WP @ ०.६ ग्रॅम/लिटर फवारणी + युरिया खताची विभागून मात्रा दिल्याने फुटवे जोमदार झाले.'
        },
        gu: {
          crop_name: 'ડાંગર / ચોખા (ઇન્ડિકા ભીની)',
          variety: 'PR-126 (વધુ ઉત્પાદક જાત)',
          season: 'ખરીફ ૨૦૨૪',
          rainfall_or_water: '૨૧૮ મીમી (ચોમાસુ વરસાદ)',
          problem_faced: 'શરૂઆતના વાનસ્પતિક તબક્કે પાનનો સુકારો (બ્લાસ્ટ) અને ભારે વરસાદને કારણે નાઇટ્રોજનનું ધોવાણ.',
          mitigation_solution: 'ટ્રાઇસાયક્લાઝોલ ૭૫% WP @ ૦.૬ ગ્રામ/લિટર છંટકાવ + લીમડા યુક્ત યુરિયાનું હપ્તાવાર ખાતર આપવાથી છોડ ઝડપથી સ્વસ્થ બન્યા.'
        },
        pa: {
          crop_name: 'ਝੋਨਾ / ਚਾਵਲ (Indica Wet)',
          variety: 'PR-126 (ਵੱਧ ਝਾੜ ਵਾਲੀ)',
          season: 'ਖਰੀਫ 2024',
          rainfall_or_water: '218 ਮਿਲੀਮੀਟਰ (ਮਾਨਸੂਨੀ ਮੀਂਹ)',
          problem_faced: 'ਸ਼ੁਰੂਆਤੀ ਪੜਾਅ ਵਿੱਚ ਪੱਤਾ ਝੁਲਸ ਰੋਗ (ਬਲਾਸਟ) ਅਤੇ ਭਾਰੀ ਮੀਂਹ ਕਾਰਨ ਨਾਈਟ੍ਰੋਜਨ ਦਾ ਵਹਿ ਜਾਣਾ।',
          mitigation_solution: 'ਟ੍ਰਾਈਸਾਈਕਲਾਜ਼ੋਲ 75% WP @ 0.6 ਗ੍ਰਾਮ/ਲਿਟਰ ਛਿੜਕਾਅ + ਨਿੰਮ-ਲੇਪਤ ਯੂਰੀਆ ਦੀ ਖੁਰਾਕ ਨਾਲ ਫਸਲ ਮੁੜ ਸੰਭਾਲੀ ਗਈ।'
        },
        te: {
          crop_name: 'వరి / ధాన్యం (ఇండికా వెట్)',
          variety: 'PR-126 (అధిక దిగుబడి రకం)',
          season: 'ఖరీఫ్ 2024',
          rainfall_or_water: '218 మి.మీ వర్షపాతం',
          problem_faced: 'ప్రారంభ దశలో ఆకు ఎండు తెగులు (బ్లాస్ట్) మరియు భారీ వర్షాల వల్ల నత్రజని లీచింగ్ సమస్య.',
          mitigation_solution: 'ట్రైసైక్లాజోల్ 75% WP @ 0.6 గ్రా/లీటర్ పిచికారీ + యూరియాను సమతుల్యంగా వేయడం ద్వారా పైరు కోలుకుంది.'
        },
        ta: {
          crop_name: 'நெல் / அரிசி (இந்திகா நஞ்சை)',
          variety: 'PR-126 (அதிக விளைச்சல்)',
          season: 'காரீப் 2024',
          rainfall_or_water: '218 மிமீ பருவமழை',
          problem_faced: 'ஆரம்ப வளர்ச்சி நிலையில் இலை கருகல் (பிளாஸ்ட்) நோய் மற்றும் கனமழையால் தழைச்சத்து விரயம்.',
          mitigation_solution: 'டிரைசைக்ளசோல் 75% WP @ 0.6 கிராம்/லி தெளிப்பு + வேப்ப எண்ணைய் பூசிய யூரியா மேலுரமிட்டு பயிர் மீட்டெடுக்கப்பட்டது.'
        },
        bn: {
          crop_name: 'ধান / চাল (ইন্ডিকা ওয়েট)',
          variety: 'PR-126 (উচ্চ ফলনশীল)',
          season: 'খরিফ ২০২৪',
          rainfall_or_water: '২১৮ মিমি বৃষ্টিপাত',
          problem_faced: 'প্রাথমিক পর্যায়ে ব্লাস্ট রোগ ও অতিরিক্ত বৃষ্টির কারণে নাইট্রোজেনের অপচয়।',
          mitigation_solution: 'ট্রাইসাইক্লাজোল ৭৫% WP @ ০.৬ গ্রাম/লিটার স্প্রে + নিম প্রলেপযুক্ত ইউরিয়ার সঠিক প্রয়োগে ফসল স্বাভাবিক হয়।'
        },
        kn: {
          crop_name: 'ಭತ್ತ / ಅಕ್ಕಿ (ಇಂಡಿಕಾ ವೆಟ್)',
          variety: 'PR-126 (ಹೆಚ್ಚು ಇಳುವರಿ)',
          season: 'ಖಾರೀಫ್ 2024',
          rainfall_or_water: '218 ಮಿಮೀ ಮಳೆ',
          problem_faced: 'ಆರಂಭಿಕ ಹಂತದಲ್ಲಿ ಎಲೆ ಕರಕು ರೋಗ (ಬ್ಲಾಸ್ಟ್) ಮತ್ತು ಅಧಿಕ ಮಳೆಯಿಂದ ಸಾರಜನಕ ಕೊಚ್ಚಿಹೋಗುವುದು.',
          mitigation_solution: 'ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್ 75% WP @ 0.6 ಗ್ರಾಂ/ಲೀ ಸಿಂಪರಣೆ + ಬೇವಿನ ಲೇಪಿತ ಯೂರಿಯಾ ಮೇಲುಗೊಬ್ಬರ ನೀಡಿ ಬೆಳೆ ರಕ್ಷಿಸಲಾಯಿತು.'
        }
      }
    },
    {
      crop_id: 'wheat',
      crop_name: 'Wheat (HD-2967 / Sharbati)',
      variety: 'HD-2967',
      season: 'Rabi 2024–25',
      mandi_price_realized: 2425.0,
      msp_benchmark: 2425.0,
      price_unit: '₹/Quintal',
      gross_realization_ha: 126100.0,
      net_profit_acre: 41200.0,
      yield_achieved_q_ha: 52.0,
      yield_target_pct: 98.0,
      production_cost_q: 1280.0,
      rainfall_or_water: '4 Irrigation Cycles (CRI, Tillering, Heading, Milking)',
      problem_faced: 'Terminal heat wave stress during milking stage (temp spike >32°C) and Yellow Rust spore drift from foothills.',
      mitigation_solution: 'Propiconazole 25% EC (Tilt) @ 1.0 ml/L prophylactic spray + light evening sprinkler misting.',
      translations: {
        hi: {
          crop_name: 'गेहूं (HD-2967 / शरबती)',
          variety: 'HD-2967',
          season: 'रबी 2024–25',
          rainfall_or_water: '4 सिंचाई चक्र (CRI, कल्ले, बाली, दुग्धावस्था)',
          problem_faced: 'दूधिया अवस्था में अचानक तापमान वृद्धि (>32°C) से टर्मिनल हीट स्ट्रेस एवं तराई क्षेत्रों में पीला रतुआ का प्रकोप।',
          mitigation_solution: 'प्रोपिकोनाज़ोल 25% EC (टिल्ट) @ 1.0 मिली/लीटर छिड़काव + शाम के समय हल्की सिंचाई से फसल की रक्षा हुई।'
        },
        mr: {
          crop_name: 'गहू (HD-2967 / शरबती)',
          variety: 'HD-2967',
          season: 'रब्बी २०२४–२५',
          rainfall_or_water: '४ पाण्याच्या पाळ्या (मुकुटमुळे, फुटवे, ओंबी, दाणे भरणे)',
          problem_faced: 'दाणे भरण्याच्या अवस्थेत उष्णतेची लाट (तापमान >३२°C) आणि तांबेरा रोगाचा संभाव्य धोका.',
          mitigation_solution: 'प्रोपिकोनाझोल २५% EC @ १.० मिली/लिटर प्रतिबंधात्मक फवारणी + सायंकाळी हलके पाणी दिल्याने दाणे टपोरे भरले.'
        },
        gu: {
          crop_name: 'ઘઉં (HD-2967 / શરબતી)',
          variety: 'HD-2967',
          season: 'રવિ ૨૦૨૪–૨૫',
          rainfall_or_water: '૪ પિયત ફેરા (મૂળ ફૂટવા, કંટી, દૂધિયા દાણા)',
          problem_faced: 'દાણા ભરાવાના સમયે તાપમાન વધારાથી (૩૨°C થી વધુ) ગરમીનો તણાવ અને પીળો ગેરુનો ભય.',
          mitigation_solution: 'પ્રોપિકોનાઝોલ ૨૫% EC (ટિલ્ટ) @ ૧.૦ મિલી/લિટર અગમચેતી છંટકાવ + સાંજના સમયે હળવું પિયત આપવાથી તાપમાન નિયંત્રિત રહ્યું.'
        },
        pa: {
          crop_name: 'ਕਣਕ (HD-2967 / ਸ਼ਰਬਤੀ)',
          variety: 'HD-2967',
          season: 'ਹਾੜੀ 2024–25',
          rainfall_or_water: '4 ਸਿੰਚਾਈ ਗੇੜ (ਜੜ੍ਹਾਂ, ਫੁਟਾਰੇ, ਸਿੱਟੇ, ਦੁੱਧਾ ਅਵਸਥਾ)',
          problem_faced: 'ਦੁੱਧਾ ਅਵਸਥਾ ਦੌਰਾਨ ਗਰਮੀ ਦੀ ਲਹਿਰ (>32°C) ਅਤੇ ਪੀਲੀ ਕੁੰਗੀ ਦਾ ਹਮਲਾ।',
          mitigation_solution: 'ਪ੍ਰੋਪੀਕੋਨਾਜ਼ੋਲ 25% EC @ 1.0 ਮਿਲੀ/ਲਿਟਰ ਛਿੜਕਾਅ + ਸ਼ਾਮ ਵੇਲੇ ਹਲਕੀ ਸਿੰਚਾਈ ਨਾਲ ਫਸਲ ਬਚਾਈ।'
        },
        te: {
          crop_name: 'గోధుమ (HD-2967)',
          variety: 'HD-2967',
          season: 'రబీ 2024–25',
          rainfall_or_water: '4 తడులు',
          problem_faced: 'గింజ పాలుపోసుకునే దశలో ఉష్ణోగ్రత పెరుగుదల (>32°C) మరియు పసుపు కుంకుమ తెగులు.',
          mitigation_solution: 'ప్రొపికొనాజోల్ 25% EC @ 1.0 మి.లీ/లీటర్ పిచికారీ చేసి పంటను కాపాడారు.'
        },
        ta: {
          crop_name: 'கோதுமை (HD-2967)',
          variety: 'HD-2967',
          season: 'ரபி 2024–25',
          rainfall_or_water: '4 பாசன சுழற்சிகள்',
          problem_faced: 'மணிகள் முதிரும் தருவாயில் வெப்ப அலை அழுத்தம் மற்றும் மஞ்சள் துரு நோய் அபாயம்.',
          mitigation_solution: 'புரோபிகோனசோல் 25% EC @ 1.0 மி.லி/லி தெளிப்பு + மாலையில் லேசான பாசனம் மூலம் தணிக்கப்பட்டது.'
        },
        bn: {
          crop_name: 'গম (HD-2967)',
          variety: 'HD-2967',
          season: 'রবি ২০২৪–২৫',
          rainfall_or_water: '৪টি সেচ চক্র',
          problem_faced: 'দানা বাঁধার সময় আকস্মিক তাপমাত্রা বৃদ্ধি (>৩২°C) ও হলুদ মরিচা রোগের আশঙ্কা।',
          mitigation_solution: 'প্রপিকোনাজল ২৫% EC @ ১.০ মিলি/লিটার স্প্রে এবং হালকা সেচ প্রয়োগে ফলন নিশ্চিত হয়।'
        },
        kn: {
          crop_name: 'ಗೋಧಿ (HD-2967)',
          variety: 'HD-2967',
          season: 'ರಬಿ 2024–25',
          rainfall_or_water: '4 ನೀರಾವರಿ ಹಂತಗಳು',
          problem_faced: 'ಕಾಳು ಕಟ್ಟುವ ಹಂತದಲ್ಲಿ ಅತಿಯಾದ ತಾಪಮಾನ (>32°C) ಮತ್ತು ಹಳದಿ ತುಕ್ಕು ರೋಗದ ಭೀತಿ.',
          mitigation_solution: 'ಪ್ರೊಪಿಕೊನಾಜೋಲ್ 25% EC @ 1.0 ಮಿಲೀ/ಲೀ ಸಿಂಪರಣೆ + ಸಂಜೆ ವೇಳೆ ಹಗುರ ನೀರಾವರಿ ಒದಗಿಸಲಾಯಿತು.'
        }
      }
    },
    {
      crop_id: 'cotton',
      crop_name: 'Cotton (Bt Hybrid Long Staple)',
      variety: 'RCH-659 Bt-II',
      season: 'Kharif 2024',
      mandi_price_realized: 7350.0,
      msp_benchmark: 7121.0,
      price_unit: '₹/Quintal',
      gross_realization_ha: 182280.0,
      net_profit_acre: 58000.0,
      yield_achieved_q_ha: 24.8,
      yield_target_pct: 92.0,
      production_cost_q: 4200.0,
      rainfall_or_water: '185 mm Rainfall + 2 Drip Cycles',
      problem_faced: 'Pink Bollworm (PBW) rosette flower entry at 60 DAS and mid-season moisture deficit during boll bursting.',
      mitigation_solution: 'Pheromone traps (5/acre) + Spinetoram 11.7% SC @ 0.8 ml/L + potassium nitrate (13:0:45) foliar nutrition.',
      translations: {
        hi: {
          crop_name: 'कपास (Bt हाइब्रिड लंबा रेशा)',
          variety: 'RCH-659 Bt-II',
          season: 'खरीफ 2024',
          rainfall_or_water: '185 मिमी वर्षा + 2 ड्रिप चक्र',
          problem_faced: '60 दिन की अवस्था पर गुलाबी सुंडी का प्रकोप एवं टिंडे खिलते समय नमी की कमी।',
          mitigation_solution: 'फेरोमोन ट्रैप (5 प्रति एकड़) + स्पाइनोटोरम 11.7% SC @ 0.8 मिली/लीटर + पोटेशियम नाइट्रेट (13:0:45) का छिड़काव किया गया।'
        },
        mr: {
          crop_name: 'कापूस (Bt संकरित लांब धागा)',
          variety: 'RCH-659 Bt-II',
          season: 'खरीप २०२४',
          rainfall_or_water: '१८५ मिमी पाऊस + २ ठिबक पाळ्या',
          problem_faced: '६० दिवसांवर गुलाबी बोंडअळीचा प्रादुर्भाव आणि बोंडे भरण्याच्या काळात पाण्याचा ताण.',
          mitigation_solution: 'कामगंध सापळे (५/एकर) + स्पिनोटोरम @ ०.८ मिली/लिटर + पोटॅशियम नायट्रेट (१३:०:४५) फवारणीने बोंडे सुरक्षित राहिली.'
        },
        gu: {
          crop_name: 'કપાસ (બીટી હાઇબ્રિડ લાંબા તાર)',
          variety: 'RCH-659 Bt-II',
          season: 'ખરીફ ૨૦૨૪',
          rainfall_or_water: '૧૮૫ મીમી વરસાદ + ૨ ટપક પિયત',
          problem_faced: '૬૦ દિવસે ગુલાબી ઈયળ (Pink Bollworm) અને જીંડવા ફાટવાના સમયે ભેજની અછત.',
          mitigation_solution: 'ફેરોમોન ટ્રેપ્સ (૫/એકર) + સ્પાઈનોટોરમ ૧૧.૭% SC @ ૦.૮ મિલી/લિટર + પોટેશિયમ નાઈટ્રેટ (13:0:45) પર્ણીય છંટકાવ.'
        },
        pa: {
          crop_name: 'ਨਰਮਾ / ਕਪਾਹ (Bt ਹਾਈਬ੍ਰਿਡ)',
          variety: 'RCH-659 Bt-II',
          season: 'ਖਰੀਫ 2024',
          rainfall_or_water: '185 ਮਿਲੀਮੀਟਰ ਮੀਂਹ + ਤੁਪਕਾ ਸਿੰਚਾਈ',
          problem_faced: '60ਵੇਂ ਦਿਨ ਗੁਲਾਬੀ ਸੁੰਡੀ ਦਾ ਹਮਲਾ ਅਤੇ ਟੀਂਡੇ ਖਿੜਨ ਸਮੇਂ ਨਮੀ ਦੀ ਘਾਟ।',
          mitigation_solution: 'ਫੇਰੋਮੋਨ ਟਰੈਪ (5/ਏਕੜ) + ਸਪਾਈਨੋਟੋਰਮ @ 0.8 ਮਿਲੀ/ਲਿਟਰ + ਪੋਟਾਸ਼ੀਅਮ ਨਾਈਟ੍ਰੇਟ ਦਾ ਛਿੜਕਾਅ।'
        },
        te: {
          crop_name: 'ప్రత్తి / పత్తి (Bt హైబ్రిడ్)',
          variety: 'RCH-659 Bt-II',
          season: 'ఖరీఫ్ 2024',
          rainfall_or_water: '185 మి.మీ వర్షపాతం + బిందు సేద్యం',
          problem_faced: 'గులాబీ రంగు కాయ తొలుచు పురుగు (PBW) ఉధృతి మరియు కాయలు విచ్చుకునే సమయంలో తేమ కొరత.',
          mitigation_solution: 'లింగాకర్షక బుట్టలు (5/ఎకరా) + స్పైనోటోరమ్ @ 0.8 మి.లీ/లీటర్ + 13:0:45 పిచికారీ.'
        },
        ta: {
          crop_name: 'பருத்தி (Bt வீரிய ரகம்)',
          variety: 'RCH-659 Bt-II',
          season: 'காரீப் 2024',
          rainfall_or_water: '185 மிமீ மழை + சொட்டு நீர் பாசனம்',
          problem_faced: '60 ஆம் நாளில் இளஞ்சிவப்பு காய்ப்புழு தாக்குதல் மற்றும் காய் வெடிக்கும் பருவத்தில் ஈரப்பத பற்றாக்குறை.',
          mitigation_solution: 'இனக்கவர்ச்சி பொறிகள் (5/ஏக்கர்) + ஸ்பினோடோரம் @ 0.8 மி.லி/லி + பொட்டாசியம் நைட்ரேட் தெளிப்பு.'
        },
        bn: {
          crop_name: 'তুলা (Bt হাইব্রিড)',
          variety: 'RCH-659 Bt-II',
          season: 'খরিফ ২০২৪',
          rainfall_or_water: '১৮৫ মিমি বৃষ্টি + ড্রিপ সেচ',
          problem_faced: '৬০ দিনে গোলাপী বোলওয়ার্মের আক্রমণ এবং গুটি ফোটার সময় আর্দ্রতার ঘাটতি।',
          mitigation_solution: 'ফেরোমোন ফাঁদ (৫টি/একর) + স্পিনেটোরাম @ ০.৮ মিলি/লিটার স্প্রেতে আক্রমণ প্রতিহত হয়।'
        },
        kn: {
          crop_name: 'ಹತ್ತಿ (Bt ಹೈಬ್ರಿಡ್)',
          variety: 'RCH-659 Bt-II',
          season: 'ಖಾರೀಫ್ 2024',
          rainfall_or_water: '185 ಮಿಮೀ ಮಳೆ + ಹನಿ ನೀರಾವರಿ',
          problem_faced: '60 ದಿನಗಳಲ್ಲಿ ಗುಲಾಬಿ ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು ಬಾಧೆ ಮತ್ತು ಕಾಯಿ ಒಡೆಯುವಾಗ ತೇವಾಂಶದ ಕೊರತೆ.',
          mitigation_solution: 'ಲಿಂಗಾಕರ್ಷಕ ಬಲೆಗಳು (5/ಎಕರೆ) + ಸ್ಪಿನೋಟೋರಾಮ್ @ 0.8 ಮಿಲೀ/ಲೀ + ಪೊಟ್ಯಾಶಿಯಂ ನೈಟ್ರೇಟ್ ಸಿಂಪರಣೆ.'
        }
      }
    },
    {
      crop_id: 'maize',
      crop_name: 'Maize / Hybrid Corn (Grain & Poultry)',
      variety: 'DKC-9108',
      season: 'Kharif 2024',
      mandi_price_realized: 2280.0,
      msp_benchmark: 2225.0,
      price_unit: '₹/Quintal',
      gross_realization_ha: 142500.0,
      net_profit_acre: 36500.0,
      yield_achieved_q_ha: 62.5,
      yield_target_pct: 96.0,
      production_cost_q: 1250.0,
      rainfall_or_water: '160 mm Precipitation + Furrow Drainage',
      problem_faced: 'Fall Armyworm (FAW) voracious whorl feeding and Zinc deficiency chlorosis in lighter soil patches.',
      mitigation_solution: 'Chlorantraniliprole 18.5% SC (Coragen) @ 0.4 ml/L whorl application + Zinc EDTA (12%) foliar spray @ 1 g/L.',
      translations: {
        hi: {
          crop_name: 'मक्का / संकर मक्का (दाना व चारा)',
          variety: 'DKC-9108',
          season: 'खरीफ 2024',
          rainfall_or_water: '160 मिमी वर्षा + नाली निकास',
          problem_faced: 'फॉल आर्मीवर्म (सैनिक कीट) द्वारा भोंपू (पोंगा) में भारी नुकसान और बलुई दोमट मिट्टी में जिंक की कमी।',
          mitigation_solution: 'कोराजन (क्लोरांट्रानिलिप्रोल) @ 0.4 मिली/लीटर पोंगे में डालना + जिंक EDTA (12%) 1 ग्राम/लीटर का छिड़काव।'
        },
        mr: {
          crop_name: 'मका / संकरित मका',
          variety: 'DKC-9108',
          season: 'खरीप २०२४',
          rainfall_or_water: '१६० मिमी पाऊस + योग्य निचरा',
          problem_faced: 'अमेरिकन लष्करी अळीचा पोंग्यात प्रादुर्भाव आणि हलक्या जमिनीत जस्ताच्या (Zinc) कमतरतेमुळे पाने पिवळी पडणे.',
          mitigation_solution: 'कोराजन @ ०.४ मिली/लिटर पोंग्यात पडेल असे फवारणे + चिलेटेड झिंक १ ग्रॅम/लिटर फवारणीने पीक तरारले.'
        },
        gu: {
          crop_name: 'મકાઈ / હાઇબ્રિડ મકાઈ (દાણા અને પોલ્ટ્રી)',
          variety: 'DKC-9108',
          season: 'ખરીફ ૨૦૨૪',
          rainfall_or_water: '૧૬૦ મીમી વરસાદ + નીતાર વ્યવસ્થા',
          problem_faced: 'ફોલ આર્મીવોર્મ (લશ્કરી ઈયળ) દ્વારા પાનના પોંગામાં નુકસાન અને રેતાળ જમીનમાં ઝિંકની ઉણપથી પીળાશ.',
          mitigation_solution: 'ક્લોરાન્ટ્રાનિલિપ્રોલ ૧૮.૫% SC (કોરાજન) @ ૦.૪ મિલી/લિટર પોંગામાં આપવું + ઝિંક EDTA (12%) ૧ ગ્રામ/લિટર છંટકાવ.'
        },
        pa: {
          crop_name: 'ਮੱਕੀ / ਹਾਈਬ੍ਰਿਡ ਮੱਕੀ',
          variety: 'DKC-9108',
          season: 'ਖਰੀਫ 2024',
          rainfall_or_water: '160 ਮਿਲੀਮੀਟਰ ਮੀਂਹ',
          problem_faced: 'ਫਾਲ ਆਰਮੀਵਰਮ (ਸੈਨਿਕ ਕੀੜਾ) ਦੁਆਰਾ ਪੌਂਗੇ ਦਾ ਨੁਕਸਾਨ ਅਤੇ ਜ਼ਿੰਕ ਦੀ ਘਾਟ ਕਾਰਨ ਪੀਲਾਪਨ।',
          mitigation_solution: 'ਕੋਰਾਜਨ @ 0.4 ਮਿਲੀ/ਲਿਟਰ ਪੌਂਗੇ ਵਿੱਚ ਪਾਉਣਾ + ਚਿਲੇਟਿਡ ਜ਼ਿੰਕ ਦਾ ਛਿੜਕਾਅ।'
        },
        te: {
          crop_name: 'మొక్కజొన్న (హైబ్రిడ్)',
          variety: 'DKC-9108',
          season: 'ఖరీఫ్ 2024',
          rainfall_or_water: '160 మి.మీ వర్షపాతం',
          problem_faced: 'కత్తెర పురుగు (ఫాల్ ఆర్మీవార్మ్) మొవ్వు తొలిచే నష్టం మరియు జింక్ లోపం.',
          mitigation_solution: 'కోరాజెన్ @ 0.4 మి.లీ/లీటర్ మొవ్వులో పిచికారీ + జింక్ EDTA 1 గ్రా/లీటర్ వాడకం.'
        },
        ta: {
          crop_name: 'மக்காச்சோளம் (வீரிய ரகம்)',
          variety: 'DKC-9108',
          season: 'காரீப் 2024',
          rainfall_or_water: '160 மிமீ மழை',
          problem_faced: 'படைப்புழு (FAW) குருத்து சேதம் மற்றும் மணல் பகுதிகளில் துத்தநாக பற்றாக்குறை.',
          mitigation_solution: 'கோரஜென் @ 0.4 மி.லி/லி குருத்தில் தெளிப்பு + துத்தநாக EDTA 1 கிராம்/லி தெளிக்கப்பட்டது.'
        },
        bn: {
          crop_name: 'ভুট্টা / হাইব্রিড ভুট্টা',
          variety: 'DKC-9108',
          season: 'খরিফ ২০২৪',
          rainfall_or_water: '১৬০ মিমি বৃষ্টি',
          problem_faced: 'ফল আর্মিওয়ার্ম পোকার আক্রমণ ও দোআঁশ মাটিতে জিঙ্কের অভাবজনিত ক্লোরোসিস।',
          mitigation_solution: 'কোরাজন @ ০.৪ মিলি/লিটার শিষের মধ্যে প্রয়োগ ও জিঙ্ক EDTA ১ গ্রাম/লিটার স্প্রে করা হয়।'
        },
        kn: {
          crop_name: 'ಮೆಕ್ಕೆಜೋಳ / ಹೈಬ್ರಿಡ್ ಜೋಳ',
          variety: 'DKC-9108',
          season: 'ಖಾರೀಫ್ 2024',
          rainfall_or_water: '160 ಮಿಮೀ ಮಳೆ',
          problem_faced: 'ಲಷ್ಕರಿ ಹುಳು (FAW) ಸುಳಿಯಲ್ಲಿ ಕೊರೆಯುವ ಹಾನಿ ಮತ್ತು ಮರಳಿನ ಮಣ್ಣಿನಲ್ಲಿ ಸತುವಿನ ಕೊರತೆ.',
          mitigation_solution: 'ಕೋರಾಜೆನ್ @ 0.4 ಮಿಲೀ/ಲೀ ಸುಳಿಗೆ ಸಿಂಪರಣೆ + ಸತು EDTA (12%) 1 ಗ್ರಾಂ/ಲೀ ಸಿಂಪಡಿಸಿ ರಕ್ಷಿಸಲಾಯಿತು.'
        }
      }
    },
    {
      crop_id: 'sugarcane',
      crop_name: 'Sugarcane (High Sugar Recovery)',
      variety: 'Co-0238 (Early Cane)',
      season: 'Annual 2023–24',
      mandi_price_realized: 355.0,
      msp_benchmark: 340.0,
      price_unit: '₹/Quintal (FRP Mill Gate)',
      gross_realization_ha: 298200.0,
      net_profit_acre: 95000.0,
      yield_achieved_q_ha: 840.0,
      yield_target_pct: 98.0,
      production_cost_q: 195.0,
      rainfall_or_water: '1,100 mm (Monsoon + 8 Irrigation Runs)',
      problem_faced: 'Early shoot borer (Chilo infuscatellus) attack in peak May heat and Red Rot fungal threat under waterlogging.',
      mitigation_solution: 'Trash mulching with earthing-up + Fipronil 0.3% GR @ 25 kg/ha + Trichoderma enriched FYM in furrows.',
      translations: {
        hi: {
          crop_name: 'गन्ना (उच्च मिठास अगेती किस्म)',
          variety: 'Co-0238 (अगेती गन्ना)',
          season: 'वार्षिक 2023–24',
          rainfall_or_water: '1,100 मिमी (वर्षा + 8 सिंचाई)',
          problem_faced: 'मई की तेज धूप में कंसुआ (Early Shoot Borer) कीट और जलभराव से लाल सड़न (Red Rot) का खतरा।',
          mitigation_solution: 'सूखी पत्ती मल्चिंग + फिप्रोनिल 0.3% GR @ 25 किग्रा/हेक्टेयर + बुवाई की नाली में ट्राइकोडर्मा युक्त गोबर खाद का प्रयोग।'
        },
        mr: {
          crop_name: 'ऊस (उच्च साखर उतारा वाण)',
          variety: 'Co-0238 (लवकर पक्व)',
          season: 'वार्षिक २०२३–२४',
          rainfall_or_water: '१,१०० मिमी (पाऊस + ८ पाळ्या)',
          problem_faced: 'उन्हाळ्यात खोडकिडीचा प्रादुर्भाव आणि अतिपावसात पाणी साचल्यामुळे तांबेरा/लाल कूज रोगाचा धोका.',
          mitigation_solution: 'पाचट आच्छादन (मल्चिंग) + फिप्रोनिल ०.३% GR @ २५ किलो/हेक्टर + लागवडीच्या वेळी ट्रायकोडर्मायुक्त शेणखत वापरले.'
        },
        gu: {
          crop_name: 'શેરડી (વધુ ખાંડ રિકવરી જાત)',
          variety: 'Co-0238 (વહેલી પાકતી)',
          season: 'વાર્ષિક ૨૦૨૩–૨૪',
          rainfall_or_water: '૧,૧૦૦ મીમી (વરસાદ + ૮ પિયત)',
          problem_faced: 'મે મહિનાની કાળઝાળ ગરમીમાં પ્રારંભિક સાંઠા વેધક (Shoot Borer) અને ચોમાસામાં પાણી ભરાવાથી લાલ સડો (Red Rot) નો ભય.',
          mitigation_solution: 'શેરડીના પાલાનું આવરણ (મલ્ચિંગ) + ફિપ્રોનિલ ૦.૩% GR @ ૨૫ કિગ્રા/હેક્ટર + વાવેતર સમયે ટ્રાઇકોડર્મા યુક્ત છાણીયું ખાતર આપવું.'
        },
        pa: {
          crop_name: 'ਗੰਨਾ (ਵੱਧ ਖੰਡ ਵਾਲੀ ਕਿਸਮ)',
          variety: 'Co-0238',
          season: 'ਸਾਲਾਨਾ 2023–24',
          rainfall_or_water: '1,100 ਮਿਲੀਮੀਟਰ (ਮੀਂਹ + ਸਿੰਚਾਈ)',
          problem_faced: 'ਮਈ ਦੀ ਗਰਮੀ ਵਿੱਚ ਕੰਸੂਆ (ਕਾਂਡ ਛੇਦਕ) ਅਤੇ ਪਾਣੀ ਖੜ੍ਹਨ ਨਾਲ ਰੱਤਾ ਰੋਗ (ਲਾਲ ਸੜਨ)।',
          mitigation_solution: 'ਸੁੱਕੀ ਪੱਤੀ ਦੀ ਮਲਚਿੰਗ + ਫਿਪਰੋਨਿਲ 0.3% GR + ਟ੍ਰਾਈਕੋਡਰਮਾ ਖਾਦ ਨਾਲ ਫਸਲ ਸੁਰੱਖਿਅਤ ਕੀਤੀ।'
        },
        te: {
          crop_name: 'చెరకు (అధిక చక్కెర రకం)',
          variety: 'Co-0238',
          season: 'వార్షిక 2023–24',
          rainfall_or_water: '1,100 మి.మీ నీరు',
          problem_faced: 'వేసవిలో మొదలు తొలిచే పురుగు మరియు మురుగు నీరు నిలవడం వల్ల ఎర్ర కుళ్ళు తెగులు.',
          mitigation_solution: 'రవ్వ ఎండిన ఆకుల మల్చింగ్ + ఫిప్రోనిల్ 0.3% GR + ట్రైకోడెర్మా పశువుల ఎరువు సాళ్లలో వేయడం.'
        },
        ta: {
          crop_name: 'கரும்பு (அதிக சர்க்கரை சத்து)',
          variety: 'Co-0238',
          season: 'ஆண்டுப் பயிர் 2023–24',
          rainfall_or_water: '1,100 மிமீ பாசனம் + மழை',
          problem_faced: 'கோடையில் குருத்து துளைப்பான் மற்றும் நீர் தேங்குவதால் செவ்வழுகல் நோய் அபாயம்.',
          mitigation_solution: 'சோகை மூடாக்கு + பிப்ரோனில் 0.3% GR @ 25 கிகி/ஹெக்டர் + டிரைக்கோடெர்மா உரம் சால்களில் இடப்பட்டது.'
        },
        bn: {
          crop_name: 'আখ (উচ্চ চিনি পুনরুদ্ধার)',
          variety: 'Co-0238',
          season: 'বার্ষিক ২০২৩–২৪',
          rainfall_or_water: '১,১০০ মিমি মোট জল',
          problem_faced: 'গ্রীষ্মে কাণ্ড ছিদ্রকারী পোকা এবং অতিবৃষ্টিতে লাল পচা রোগের প্রকোপ।',
          mitigation_solution: 'আখের পাতার মালচিং + ফিপ্রোনিল ০.৩% GR + ট্রাইকোডার্মা মিশ্রিত গোবর সার প্রয়োগ।'
        },
        kn: {
          crop_name: 'ಕಬ್ಬು (ಹೆಚ್ಚು ಸಕ್ಕರೆ ಇಳುವರಿ)',
          variety: 'Co-0238',
          season: 'ವಾರ್ಷಿಕ 2023–24',
          rainfall_or_water: '1,100 ಮಿಮೀ ನೀರು',
          problem_faced: 'ಬೇಸಿಗೆಯ ಬಿಸಿಲಿನಲ್ಲಿ ಸುಳಿ ಕೊರೆಯುವ ಹುಳು ಮತ್ತು ನೀರು ನಿಲ್ಲುವುದರಿಂದ ಕೆಂಪು ಕೊಳೆ ರೋಗದ ಆತಂಕ.',
          mitigation_solution: 'ಕಬ್ಬಿನ ರವದ ಹೊದಿಕೆ (ಮಲ್ಚಿಂಗ್) + ಫಿಪ್ರೋನಿಲ್ 0.3% GR + ಟ್ರೈಕೋಡರ್ಮಾ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಸಾಲಿನಲ್ಲಿ ನೀಡಲಾಯಿತು.'
        }
      }
    }
  ];

  function renderPastSeasonRecords(cropFilter = 'all') {
    const container = document.getElementById('past-season-records-container');
    if (!container) return;
    state.activePastSeasonCropFilter = cropFilter;

    const lang = state.language || 'hi';
    const t = PAST_SEASON_I18N;
    const records = PAST_SEASON_RECORDS_DB;

    const filtered = (cropFilter === 'all' || !cropFilter)
      ? records
      : records.filter(r => r.crop_id === cropFilter);

    if (filtered.length === 0) {
      container.innerHTML = `<div class="history-empty-state history-empty-full-width"><h4>No past season records found for this crop</h4></div>`;
      return;
    }

    container.innerHTML = filtered.map(r => {
      const loc = r.translations && r.translations[lang] ? r.translations[lang] : r;
      const cropName = loc.crop_name || r.crop_name;
      const problemFaced = loc.problem_faced || r.problem_faced;
      const mitigation = loc.mitigation_solution || r.mitigation_solution;
      const season = loc.season || r.season;
      const variety = loc.variety || r.variety;
      const rainfall = loc.rainfall_or_water || r.rainfall_or_water;

      const priceRealizedFormatted = r.mandi_price_realized.toLocaleString('en-IN');
      const mspFormatted = r.msp_benchmark.toLocaleString('en-IN');
      const grossFormatted = (r.gross_realization_ha / 100000).toFixed(2);
      const netFormatted = r.net_profit_acre.toLocaleString('en-IN');
      const costFormatted = r.production_cost_q.toLocaleString('en-IN');

      const lblIdealPrice = t.lblIdealPrice[lang] || t.lblIdealPrice['en'];
      const lblMsp = t.lblMsp[lang] || t.lblMsp['en'];
      const lblGross = t.lblGross[lang] || t.lblGross['en'];
      const lblNet = t.lblNetProfit[lang] || t.lblNetProfit['en'];
      const lblYield = t.lblYield[lang] || t.lblYield['en'];
      const lblTarget = t.lblTarget[lang] || t.lblTarget['en'];
      const lblWater = t.lblWater[lang] || t.lblWater['en'];
      const lblCost = t.lblCost[lang] || t.lblCost['en'];
      const lblProblem = t.lblProblemFaced[lang] || t.lblProblemFaced['en'];
      const lblMitigation = t.lblMitigation[lang] || t.lblMitigation['en'];

      return `
        <div class="past-season-card">
          <div class="past-season-top">
            <span class="past-season-tag">🗓️ ${season}</span>
            <span class="past-crop-badge">${variety}</span>
          </div>

          <div>
            <h4 class="past-crop-title">${cropName}</h4>
          </div>

          <!-- 1. Ideal Crop Price Realized After Cultivation -->
          <div class="record-price-callout">
            <div class="price-callout-header">
              <span class="price-callout-label">💰 ${lblIdealPrice}</span>
              <span class="price-realized-val">₹${priceRealizedFormatted} <span class="price-realized-unit">/ Q</span></span>
            </div>
            <div class="price-sub-details">
              • <strong>${lblMsp}:</strong> ₹${mspFormatted} / Q &nbsp;|&nbsp; 
              • <strong>${lblGross}:</strong> ₹${grossFormatted} Lakh/Ha &nbsp;|&nbsp; 
              • <strong>${lblNet}:</strong> ₹${netFormatted}/Acre
            </div>
          </div>

          <!-- 2. Agronomic Metrics Row -->
          <div class="record-metrics-row">
            <div class="record-metric-item">
              <span class="record-metric-label">${lblYield}</span>
              <span class="record-metric-val">${r.yield_achieved_q_ha} Q/Ha</span>
            </div>
            <div class="record-metric-item">
              <span class="record-metric-label">${lblTarget}</span>
              <span class="record-metric-val is-success">${r.yield_target_pct}%</span>
            </div>
            <div class="record-metric-item">
              <span class="record-metric-label">${lblCost}</span>
              <span class="record-metric-val">₹${costFormatted}/Q</span>
            </div>
            <div class="record-metric-item">
              <span class="record-metric-label">${lblWater}</span>
              <span class="record-metric-val is-compact">${rainfall}</span>
            </div>
          </div>

          <!-- 3. Problem Faced During Cultivation -->
          <div class="record-problem-box">
            <strong>${lblProblem}</strong>
            ${problemFaced}
          </div>

          <!-- 4. ICAR Mitigation & Package Applied -->
          <div class="record-mitigation-box">
            <strong>${lblMitigation}</strong>
            ${mitigation}
          </div>
        </div>
      `;
    }).join('');
  }

  async function fetchPastSeasonRecords() {
    try {
      const res = await apiFetch('/api/past-season-records');
      if (res && res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.records) && data.records.length > 0) {
          data.records.forEach(serverRec => {
            const idx = PAST_SEASON_RECORDS_DB.findIndex(r => r.crop_id === serverRec.crop_id);
            if (idx !== -1) {
              Object.assign(PAST_SEASON_RECORDS_DB[idx], serverRec);
            } else {
              PAST_SEASON_RECORDS_DB.push(serverRec);
            }
          });
          renderPastSeasonRecords(state.activePastSeasonCropFilter || 'all');
        }
      }
    } catch (err) {
      console.warn('Past season records API fetch fallback to embedded DB:', err);
    }
  }

  function updateSoilSpectrum(n, p, k, ph = 6.8) {
    const specNVal = document.getElementById('spec-n-val');
    const specPVal = document.getElementById('spec-p-val');
    const specKVal = document.getElementById('spec-k-val');
    const specPhVal = document.getElementById('spec-ph-val');
    const specNFill = document.getElementById('spec-n-fill');
    const specPFill = document.getElementById('spec-p-fill');
    const specKFill = document.getElementById('spec-k-fill');
    const specPhFill = document.getElementById('spec-ph-fill');

    if (specNVal) specNVal.textContent = n;
    if (specPVal) specPVal.textContent = p;
    if (specKVal) specKVal.textContent = k;
    if (specPhVal) specPhVal.textContent = ph;

    if (specNFill) specNFill.style.width = `${Math.min(100, Math.round((n / 140) * 100))}%`;
    if (specPFill) specPFill.style.width = `${Math.min(100, Math.round((p / 80) * 100))}%`;
    if (specKFill) specKFill.style.width = `${Math.min(100, Math.round((k / 100) * 100))}%`;
    if (specPhFill) specPhFill.style.width = `${Math.min(100, Math.round((ph / 9) * 100))}%`;
  }


  // ─────────────────────────────────────────────────────────────────────────
  // SOWING & FERTILIZER MANAGEMENT CALENDAR DATABASE & CONTROLLER
  // ─────────────────────────────────────────────────────────────────────────
  const CROP_CALENDAR_I18N = {
    title: {
      en: '🗓️ Sowing & Fertilizer Management Calendar',
      hi: '🗓️ बुवाई एवं उर्वरक प्रबंधन कैलेंडर',
      mr: '🗓️ पेरणी आणि खत व्यवस्थापन दिनदर्शिका',
      pa: '🗓️ ਬਿਜਾਈ ਅਤੇ ਖਾਦ ਪ੍ਰਬੰਧਨ ਕੈਲੰਡਰ',
      gu: '🗓️ વાવણી અને ખાતર વ્યવસ્થાપન કેલેન્ડર',
      te: '🗓️ విత్తన & ఎరువుల నిర్వహణ క్యాలెండర్',
      ta: '🗓️ விதைப்பு மற்றும் உர மேலாண்மை காலண்டர்',
      bn: '🗓️ বপন ও সার ব্যবস্থাপনা ক্যালেন্ডার',
      kn: '🗓️ ಬಿತ್ತನೆ ಮತ್ತು ರಸಗೊಬ್ಬರ ನಿರ್ವಹಣಾ ಕ್ಯಾಲೆಂಡರ್'
    },
    sub: {
      en: 'Scientific stage-by-stage crop timeline, optimal sowing window, and fertilizer schedule',
      hi: 'वैज्ञानिक चरणबद्ध फसल समयरेखा, सर्वोत्तम बुवाई अवधि एवं उर्वरक खुराक अनुसूची',
      mr: 'वैज्ञानिक टप्प्यानुसार पीक वेळापत्रक, पेरणीची योग्य वेळ आणि खत डोस वेळापत्रक',
      pa: 'ਵਿਗਿਆਨਕ ਪੜਾਅਵਾਰ ਫ਼ਸਲ ਸਮਾਂ-ਸਾਰਣੀ, ਬਿਜਾਈ ਦਾ ਢੁਕਵਾਂ ਸਮਾਂ ਅਤੇ ਖਾਦ ਸ਼ਡਿਊਲ',
      gu: 'વૈજ્ઞાનિક તબક્કાવાર પાક સમયરેખા, વાવણીનો શ્રેષ્ઠ સમય અને ખાતર શેડ્યૂલ',
      te: 'శాస్త్రీయ దశల వారీ పంట కాలపట్టిక, సరైన విత్తన సమయం మరియు ఎరువుల షెడ్యూల్',
      ta: 'அறிவியல் பூர்வமான பயிர் கால அட்டவணை, விதைப்பு பருவம் மற்றும் உர கால அட்டவணை',
      bn: 'বৈজ্ঞানিক পর্যায়ক্রমিক ফসল সময়সূচী, সর্বোত্তম বপন সময় এবং সার প্রয়োগ সময়সূচী',
      kn: 'ವೈಜ್ಞಾನಿಕ ಹಂತವಾರು ಬೆಳೆ ವೇಳಾಪಟ್ಟಿ, ಸೂಕ್ತ ಬಿತ್ತನೆ ಸಮಯ ಮತ್ತು ರಸಗೊಬ್ಬರ ವೇಳಾಪಟ್ಟಿ'
    },
    lblSeason: { en: 'Season Window', hi: 'मौसम व बुवाई अवधि', mr: 'हंगाम व पेरणी कालावधी', pa: 'ਸੀਜ਼ਨ ਅਤੇ ਬਿਜਾਈ', gu: 'ઋતુ અને વાવણી ગાળો', te: 'సీజన్ విండో', ta: 'பருவக்காலம்', bn: 'মৌসুম ও বপনকাল', kn: 'ಋತು & ಬಿತ್ತನೆ ಅವಧಿ' },
    lblDuration: { en: 'Duration', hi: 'फसल अवधि', mr: 'कालावधी', pa: 'ਸਮਾਂ', gu: 'સમયગાળો', te: 'కాలపరిమితి', ta: 'பயிர் காலம்', bn: 'সময়কাল', kn: 'ಬೆಳೆ ಅವಧಿ' },
    lblWater: { en: 'Water Need', hi: 'जल आवश्यकता', mr: 'पाण्याची गरज', pa: 'ਪਾਣੀ ਦੀ ਲੋੜ', gu: 'પાણી જરૂરિયાત', te: 'నీటి అవసరం', ta: 'நீர் தேவை', bn: 'জলের প্রয়োজন', kn: 'ನೀರಿನ ಅಗತ್ಯ' },
    lblYield: { en: 'Target Yield', hi: 'अपेक्षित उपज', mr: 'अपेक्षित उत्पादन', pa: 'ਸੰਭਾਵਿਤ ਝਾੜ', gu: 'અપેક્ષિત ઉત્પાદન', te: 'లక్ష్య దిగుబడి', ta: 'இலக்கு மகசூல்', bn: 'লক্ষ্য ফলন', kn: 'ಗುರಿ ಇಳುವರಿ' },
    btnJumpFert: {
      en: '🧪 Calculate Commercial Bags for this Crop →',
      hi: '🧪 इस फसल के लिए खाद की थैलियों की गणना करें →',
      mr: '🧪 या पिकासाठी खतांच्या गोण्यांची गणना करा →',
      pa: '🧪 ਇਸ ਫ਼ਸਲ ਲਈ ਖਾਦ ਦੇ ਥੈਲਿਆਂ ਦੀ ਗਣਨਾ ਕਰੋ →',
      gu: '🧪 આ પાક માટે ખાતરની થેલીઓની ગણતરી કરો →',
      te: '🧪 ఈ పంటకు కావలసిన ఎరువుల బస్తాల లెక్కింపు →',
      ta: '🧪 இந்த பயிருக்கான உர மூட்டைகளை கணக்கிடுங்கள் →',
      bn: '🧪 এই ফসলের বাণিজ্যিক সারের বস্তা গণনা করুন →',
      kn: '🧪 ಈ ಬೆಳೆಗೆ ವಾಣಿಜ್ಯ ರಸಗೊಬ್ಬರ ಚೀಲಗಳನ್ನು ಲೆಕ್ಕಹಾಕಿ →'
    },
    btnPrint: {
      en: '🖨️ Print Calendar',
      hi: '🖨️ कैलेंडर प्रिंट करें',
      mr: '🖨️ दिनदर्शिका प्रिंट करा',
      pa: '🖨️ ਕੈਲੰਡਰ ਪ੍ਰਿੰਟ ਕਰੋ',
      gu: '🖨️ કેલેન્ડર પ્રિન્ટ કરો',
      te: '🖨️ క్యాలెಂಡర్ ప్రింట్ చేయండి',
      ta: '🖨️ அச்சிடுங்கள்',
      bn: '🖨️ ক্যালেন্ডার প্রিন্ট করুন',
      kn: '🖨️ ಕ್ಯಾಲೆಂಡರ್ ಮುದ್ರಿಸಿ'
    }
  };

  const CROP_CALENDARS = {
    rice: {
      season: 'Kharif Season (खरीफ मौसम)',
      sowing_window: 'June 15 – July 25 (Transplanting / DSR)',
      harvest_window: 'October 20 – November 25',
      duration: '120 – 135 Days',
      water_need: '1,150 – 1,350 mm',
      target_yield: '44 – 50 Quintals/Ha',
      stages: [
        {
          name: 'Stage 0: Pre-Sowing Land Preparation & Bio-Seed Treatment',
          day: 'Day -15 to Day 0',
          dose: '<strong>Organic Base:</strong> Incorporate 4–5 tonnes/acre well-rotted FYM. <strong>Seed Treatment:</strong> Soak seeds in <em>Trichoderma viride</em> (4g/kg seed) + PSB biofertilizer.',
          notes: 'Laser level the field and puddle to form an impermeable plough-pan for standing water conservation.'
        },
        {
          name: 'Stage 1: Basal Fertilizer Application at Transplanting',
          day: 'Day 0 (Transplanting)',
          dose: '<strong>Basal Dose:</strong> 100% Phosphorus (DAP ~ 30 kg/acre) + 100% Potash (MOP ~ 25 kg/acre) + 33% Nitrogen (Neem-coated Urea ~ 25 kg/acre) + Zinc Sulphate 10 kg/acre.',
          notes: 'Mix into the top 5 cm puddle mud just before seedling planting; avoids nitrogen volatilization.'
        },
        {
          name: 'Stage 2: Active Tillering First Nitrogen Top-Dressing',
          day: 'Day 21 – 25 DAT',
          dose: '<strong>First Top-Dressing:</strong> 33% Neem-coated Urea (~ 25 kg/acre).',
          notes: 'Maintain 2–3 cm shallow standing water during application. Weed the field 2 days prior to ensure zero nutrient competition.'
        },
        {
          name: 'Stage 3: Panicle Initiation Second Top-Dressing',
          day: 'Day 42 – 48 DAT',
          dose: '<strong>Second Top-Dressing:</strong> Remaining 33% Urea (~ 25 kg/acre) + 0.5% Potash (MOP) foliar spray.',
          notes: 'Critical stage for spikelet fertility. Promotes heavier, bolder grain panicles.'
        },
        {
          name: 'Stage 4: Flowering to Milk Stage Moisture Care',
          day: 'Day 65 – 85 DAT',
          dose: '<strong>Nutrient Check:</strong> Stop all chemical nitrogen. Spray 1% 13:0:45 (Potassium Nitrate) if flag leaves appear pale.',
          notes: 'Never let soil crack during flowering. Monitor for sheath blight and brown plant hoppers.'
        },
        {
          name: 'Stage 5: Physiological Ripening & Harvesting',
          day: 'Day 110 – 135 DAT',
          dose: '<strong>Drainage & Ripening:</strong> Completely drain standing water 10–12 days prior to harvest.',
          notes: 'Harvest when 85% of the panicles turn golden brown and grain moisture drops to 18–20%.'
        }
      ]
    },
    wheat: {
      season: 'Rabi Season (रबी मौसम)',
      sowing_window: 'November 01 – November 25 (Optimal Temperature 20–22°C)',
      harvest_window: 'March 25 – April 20',
      duration: '125 – 135 Days',
      water_need: '400 – 500 mm (5–6 Irrigations)',
      target_yield: '48 – 55 Quintals/Ha',
      stages: [
        {
          name: 'Stage 0: Pre-Sowing Irrigation (Rauni) & Seed Priming',
          day: 'Day -10 to Day 0',
          dose: '<strong>Seed Inoculation:</strong> Treat certified seed with Carboxin + Thiram (2g/kg) and <em>Azotobacter</em> culture.',
          notes: 'Pre-sowing irrigation (*Rauni*) is vital for uniform seed germination and deep root anchorage.'
        },
        {
          name: 'Stage 1: Basal Fertilizer Application at Sowing',
          day: 'Day 0 (Sowing)',
          dose: '<strong>Basal Dose:</strong> 100% Phosphorus (DAP ~ 55 kg/acre) + 100% Potash (MOP ~ 20 kg/acre) + 50% Nitrogen (Urea ~ 30 kg/acre).',
          notes: 'Drill fertilizer 5 cm below seed line using seed-cum-fertilizer drill.'
        },
        {
          name: 'Stage 2: Crown Root Initiation (CRI) First Top-Dressing',
          day: 'Day 21 – 25 DAS',
          dose: '<strong>First Top-Dressing:</strong> 25% Urea (~ 25 kg/acre) applied immediately after 1st irrigation.',
          notes: 'CRI is the single most critical moisture stage in wheat; delay causes permanent yield depression.'
        },
        {
          name: 'Stage 3: Late Tillering / Jointing Stage Second Top-Dressing',
          day: 'Day 45 – 50 DAS',
          dose: '<strong>Second Top-Dressing:</strong> Remaining 25% Urea (~ 25 kg/acre).',
          notes: 'Broadcast under moist soil; monitor lower canopy for yellow/brown rust pustules.'
        },
        {
          name: 'Stage 4: Booting & Flowering Stage Heat Defense',
          day: 'Day 70 – 85 DAS',
          dose: '<strong>Foliar Heat Defense:</strong> Spray Potassium Nitrate (13:0:45 @ 10g/L) to prevent terminal heat stress.',
          notes: 'Give light irrigation on calm (windless) days to prevent crop lodging.'
        },
        {
          name: 'Stage 5: Hard Dough to Harvest',
          day: 'Day 115 – 135 DAS',
          dose: '<strong>Harvesting:</strong> Stop all irrigation when grains cannot be dented with fingernail.',
          notes: 'Harvest with combine when grain moisture reaches 11–12% for safe silo storage.'
        }
      ]
    },
    cotton: {
      season: 'Kharif Season (खरीफ मौसम)',
      sowing_window: 'May 01 – June 15 (Early Summer / Pre-Monsoon)',
      harvest_window: 'October 15 – December 30 (Multiple Pickings)',
      duration: '150 – 180 Days',
      water_need: '650 – 850 mm',
      target_yield: '24 – 30 Quintals/Ha',
      stages: [
        {
          name: 'Stage 0: Ridge & Furrow Prep & Deep Plowing',
          day: 'Day -15 to Day 0',
          dose: '<strong>Basal Manure:</strong> 5 tonnes/acre FYM. Deep summer plowing to expose pink bollworm pupae to sun.',
          notes: 'Create ridges at 90–120 cm spacing for root aeration and furrow irrigation.'
        },
        {
          name: 'Stage 1: Basal Fertilizer Application at Dibbling',
          day: 'Day 0 (Dibbling)',
          dose: '<strong>Basal Dose:</strong> 100% Phosphorus (DAP ~ 35 kg/acre) + 33% Potash (MOP ~ 15 kg/acre) + 25% Nitrogen (Urea ~ 15 kg/acre) + 10 kg/acre Magnesium Sulphate.',
          notes: 'Spot-apply fertilizer in dibbled holes 5cm away from the seed.'
        },
        {
          name: 'Stage 2: Square Formation First Top-Dressing',
          day: 'Day 35 – 45 DAS',
          dose: '<strong>First Top-Dressing:</strong> 35% Urea (~ 25 kg/acre) followed by earthing-up.',
          notes: 'Install pheromone traps (5 traps/acre) to monitor pink bollworm moth flights.'
        },
        {
          name: 'Stage 3: Peak Flowering & Early Boll Second Top-Dressing',
          day: 'Day 65 – 75 DAS',
          dose: '<strong>Second Top-Dressing:</strong> 40% Urea (~ 25 kg/acre) + 33% Potash (MOP ~ 15 kg/acre) + 1% Boron foliar spray.',
          notes: 'Spray Planofix (NAA 4.5 SL @ 0.25 ml/L) to prevent flower bud and boll shedding.'
        },
        {
          name: 'Stage 4: Boll Development & Maturation Foliar Feed',
          day: 'Day 90 – 120 DAS',
          dose: '<strong>Foliar Spray:</strong> Spray 00:00:50 (Potassium Sulphate @ 10g/L) for fiber strength and boll weight.',
          notes: 'Maintain steady soil moisture; avoid waterlogging during boll development.'
        },
        {
          name: 'Stage 5: Boll Burst & Clean Picking',
          day: 'Day 130 – 180 DAS',
          dose: '<strong>Picking Cycle:</strong> Pick bolls during sunny afternoon hours once morning dew is dry.',
          notes: 'Store clean seed cotton in dry, well-ventilated sheds away from damp soil.'
        }
      ]
    },
    maize: {
      season: 'Kharif / Rabi Season (खरीफ व रबी)',
      sowing_window: 'June 20 – July 15 (Kharif) or Oct 15 – Nov 15 (Rabi)',
      harvest_window: 'October (Kharif) / March (Rabi)',
      duration: '95 – 115 Days',
      water_need: '500 – 650 mm',
      target_yield: '55 – 68 Quintals/Ha',
      stages: [
        {
          name: 'Stage 0: Seedbed Preparation & Fly Deterrent Coating',
          day: 'Day -10 to Day 0',
          dose: '<strong>Seed Treatment:</strong> Treat hybrid seeds with Imidacloprid (4ml/kg) to deter shoot fly.',
          notes: 'Maintain 60cm row spacing and 20cm plant spacing for optimum solar radiation intercept.'
        },
        {
          name: 'Stage 1: Basal Fertilizer Application at Sowing',
          day: 'Day 0 (Sowing)',
          dose: '<strong>Basal Dose:</strong> 100% Phosphorus (DAP ~ 40 kg/acre) + 100% Potash (MOP ~ 20 kg/acre) + 25% Nitrogen (Urea ~ 20 kg/acre) + 10 kg Zinc Sulphate.',
          notes: 'Band place fertilizer 5 cm below and 5 cm to the side of the seed line.'
        },
        {
          name: 'Stage 2: Knee-High Stage (V6–V8) First Top-Dressing',
          day: 'Day 25 – 30 DAS',
          dose: '<strong>First Top-Dressing:</strong> 40% Urea (~ 35 kg/acre) followed by earthing up.',
          notes: 'Inspect whorls for Fall Armyworm (FAW) pinholes; apply Neem formulation or biocontrol.'
        },
        {
          name: 'Stage 3: Tasseling & Silking Stage Second Top-Dressing',
          day: 'Day 50 – 60 DAS',
          dose: '<strong>Second Top-Dressing:</strong> Remaining 35% Urea (~ 30 kg/acre).',
          notes: 'Most moisture-critical phase; ensure soil is well-watered during pollination and silk emergence.'
        },
        {
          name: 'Stage 4: Grain Filling & Dough Stage',
          day: 'Day 70 – 85 DAS',
          dose: '<strong>Foliar Finish:</strong> Optional 0.5% Potash spray to boost kernel density and test weight.',
          notes: 'Maintain moisture until black layer forms at the base of the grain kernels.'
        },
        {
          name: 'Stage 5: Physiological Maturity & Shelling',
          day: 'Day 95 – 115 DAS',
          dose: '<strong>Harvesting:</strong> Harvest when outer cob husks turn papery white and dry.',
          notes: 'Sun-dry cobs to 14% moisture before mechanical shelling.'
        }
      ]
    },
    sugarcane: {
      season: 'Spring / Autumn Planting (वसंत / शरदकालीन)',
      sowing_window: 'February 15 – March 31 or October 01 – October 31',
      harvest_window: 'December – April (10–12 Months)',
      duration: '300 – 360 Days',
      water_need: '1,500 – 2,200 mm',
      target_yield: '850 – 1,100 Quintals/Ha',
      stages: [
        {
          name: 'Stage 0: Sett Treatment & Deep Trench Preparation',
          day: 'Day -7 to Day 0',
          dose: '<strong>Sett Treatment:</strong> Dip 2-bud or 3-bud setts in Carbendazim (1g/L) for 15 mins. Apply 10 t/acre compost.',
          notes: 'Dig furrows at 90–120 cm trench depth to prevent later cane lodging.'
        },
        {
          name: 'Stage 1: Basal Application in Furrow',
          day: 'Day 0 (Planting)',
          dose: '<strong>Basal Dose:</strong> 100% Phosphorus (SSP ~ 150 kg/acre) + 33% Potash (MOP ~ 30 kg/acre) + 20% Nitrogen (Urea ~ 25 kg/acre).',
          notes: 'Cover setts with 5–7 cm soil and apply immediate light irrigation.'
        },
        {
          name: 'Stage 2: Formative / Tillering Stage Top-Dressing',
          day: 'Day 45 – 60 DAP',
          dose: '<strong>First Top-Dressing:</strong> 30% Urea (~ 35 kg/acre) + partial earthing-up.',
          notes: 'Monitor for early shoot borer (dead hearts); install pheromone traps or apply bio-agent.'
        },
        {
          name: 'Stage 3: Grand Growth Stage Nutrition & Deep Earthing',
          day: 'Day 90 – 120 DAP',
          dose: '<strong>Second Top-Dressing:</strong> 30% Urea (~ 35 kg/acre) + 33% Potash (MOP ~ 25 kg/acre).',
          notes: 'Perform deep earthing-up and tie canes (trash wrapping) to withstand monsoon storms.'
        },
        {
          name: 'Stage 4: Late Grand Growth Elongation',
          day: 'Day 150 – 180 DAP',
          dose: '<strong>Final Top-Dressing:</strong> Remaining 20% Urea (~ 25 kg/acre) + 34% Potash (MOP ~ 25 kg/acre).',
          notes: 'Withhold nitrogen after month 6 to avoid water-shoots and ensure high juice sucrose recovery.'
        },
        {
          name: 'Stage 5: Ripening & Ground-Level Harvest',
          day: 'Day 300 – 360 DAP',
          dose: '<strong>Harvest:</strong> Withhold irrigation 15–20 days prior to harvest for peak Brix sucrose.',
          notes: 'Cut canes at ground level (highest sugar concentration is in the bottom internodes).'
        }
      ]
    }
  };

  function getGenericCropCalendar(cropName, lang) {
    const meta = getCropMeta(cropName);
    const duration = meta.duration || '100 – 120 Days';
    const water = meta.water || 'Moderate (500 – 700 mm)';
    const yieldEst = meta.yield || '30 – 40 Q/Ha';
    const season = meta.seasonBadge || 'Agro-Climatic Window';

    return {
      season: season,
      sowing_window: 'Season specific optimal window (soil temp 22–28°C)',
      harvest_window: 'Maturity cycle completion',
      duration: duration,
      water_need: water,
      target_yield: yieldEst,
      stages: [
        {
          name: 'Stage 0: Pre-Sowing Seedbed Preparation & Organic Enrichment',
          day: 'Day -10 to Day 0',
          dose: '<strong>Soil Base:</strong> Apply 3–4 tonnes/acre well-rotted FYM. <strong>Seed Treatment:</strong> Bio-inoculation with Trichoderma viride (4g/kg seed).',
          notes: 'Ensure fine tilth, optimum weed eradication, and proper field drainage.'
        },
        {
          name: 'Stage 1: Basal Fertilizer Application at Sowing',
          day: 'Day 0 (Sowing)',
          dose: '<strong>Basal Dose:</strong> 100% Phosphorus (DAP) + 100% Potash (MOP) + 33%–50% Nitrogen (Urea) placed 5cm below seed.',
          notes: 'Band placement near root-zone ensures immediate seedling vigor and root establishment.'
        },
        {
          name: 'Stage 2: Active Vegetative Growth Top-Dressing',
          day: 'Day 21 – 30 DAS',
          dose: '<strong>First Top-Dressing:</strong> 25%–33% Neem-coated Urea broadcast under moist soil conditions.',
          notes: 'Critical weed management window. Irrigate immediately after nitrogen application.'
        },
        {
          name: 'Stage 3: Flowering / Reproductive Top-Dressing',
          day: 'Day 45 – 60 DAS',
          dose: '<strong>Second Top-Dressing:</strong> Remaining Nitrogen + 0.5% Potash foliar spray.',
          notes: 'Ensure steady soil moisture; moisture stress during flowering causes massive flower/pod drop.'
        },
        {
          name: 'Stage 4: Grain / Fruit Development & Ripening',
          day: 'Day 75 – 95 DAS',
          dose: '<strong>Foliar Micronutrients:</strong> Optional 1% 13:0:45 foliar spray if foliage pales.',
          notes: 'Monitor for pest infestations. Maintain optimal moisture until seed/fruit hardening.'
        },
        {
          name: 'Stage 5: Physiological Maturity & Harvesting',
          day: 'Day 100 – 130 DAS',
          dose: '<strong>Pre-Harvest:</strong> Stop irrigation 8–10 days before harvest for uniform drying.',
          notes: 'Harvest at recommended grain moisture percentage to maximize Mandi market price.'
        }
      ]
    };
  }

  function openCropCalendarModal(cropId) {
    const modal = document.getElementById('calendar-modal');
    const body = document.getElementById('calendar-modal-body');
    if (!modal || !body) return;

    const cId = (cropId || 'rice').toLowerCase();
    const cal = CROP_CALENDARS[cId] || getGenericCropCalendar(cId, state.language);
    const meta = getCropMeta(cId);
    const lang = state.language || 'hi';
    const t = CROP_CALENDAR_I18N;

    const modalTitle = document.getElementById('calendar-modal-title');
    const modalSub = document.getElementById('calendar-modal-sub');
    if (modalTitle) modalTitle.textContent = t.title[lang] || t.title['en'];
    if (modalSub) modalSub.textContent = t.sub[lang] || t.sub['en'];

    const btnJumpLabel = t.btnJumpFert[lang] || t.btnJumpFert['en'];
    const btnPrintLabel = t.btnPrint[lang] || t.btnPrint['en'];

    const stagesHtml = cal.stages.map((st, idx) => `
      <div class="calendar-stage-card">
        <div class="calendar-stage-top">
          <span class="calendar-stage-name">📍 ${st.name}</span>
          <span class="calendar-stage-day">🗓️ ${st.day}</span>
        </div>
        <div class="calendar-stage-dose">
          ${st.dose}
        </div>
        <div class="calendar-stage-notes">
          💡 <em>${st.notes}</em>
        </div>
      </div>
    `).join('');

    body.innerHTML = `
      <div class="calendar-crop-header-banner">
        <div>
          <h4 class="calendar-crop-name">🌱 ${meta.fullName || cropId.toUpperCase()}</h4>
          <p class="calendar-crop-season">🗓️ ${cal.season} • <strong>Sowing Window:</strong> ${cal.sowing_window}</p>
        </div>
        <div class="calendar-pills-row">
          <span class="calendar-pill">⏱️ ${cal.duration}</span>
          <span class="calendar-pill">💧 ${cal.water_need}</span>
          <span class="calendar-pill">🌾 ${cal.target_yield}</span>
        </div>
      </div>

      <div class="calendar-timeline">
        ${stagesHtml}
      </div>

      <div class="calendar-modal-actions">
        <button type="button" class="btn-calendar-print" id="btn-calendar-print-action">${btnPrintLabel}</button>
        <button type="button" class="btn-calendar-jump-fert" id="btn-calendar-jump-fert-action">${btnJumpLabel}</button>
      </div>
    `;

    // Wire action buttons
    document.getElementById('btn-calendar-print-action')?.addEventListener('click', () => {
      window.print();
    });

    document.getElementById('btn-calendar-jump-fert-action')?.addEventListener('click', () => {
      closeCropCalendarModal();
      navigateToFertilizerPackage(cId);
    });

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeCropCalendarModal() {
    const modal = document.getElementById('calendar-modal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FERTILIZER PACKAGE NAVIGATION & ONE-CLICK CALCULATION
  // ─────────────────────────────────────────────────────────────────────────
  function navigateToFertilizerPackage(cropName) {
    if (!cropName) cropName = 'rice';
    const targetCrop = cropName.toLowerCase();

    // 1. Switch to Fertilizer Prescriber tab
    const fertNavBtn = document.querySelector('.nav-tab[data-tab="fertilizer-prescriber"]');
    if (fertNavBtn) fertNavBtn.click();

    // 2. Select this crop in dropdown
    const fertCropSelect = document.getElementById('fert-crop-select');
    if (fertCropSelect) {
      let optionExists = false;
      for (let i = 0; i < fertCropSelect.options.length; i++) {
        if (fertCropSelect.options[i].value.toLowerCase() === targetCrop) {
          fertCropSelect.selectedIndex = i;
          optionExists = true;
          break;
        }
      }
      if (!optionExists) {
        const opt = document.createElement('option');
        opt.value = targetCrop;
        opt.textContent = targetCrop.toUpperCase();
        fertCropSelect.appendChild(opt);
        fertCropSelect.value = targetCrop;
      }
    }

    // 3. Sync soil parameters from advisory sliders to fertilizer sliders
    const nVal = document.getElementById('slider-n')?.value;
    const pVal = document.getElementById('slider-p')?.value;
    const kVal = document.getElementById('slider-k')?.value;
    const phVal = document.getElementById('slider-ph')?.value;

    if (nVal && fertSliders.n) {
      fertSliders.n.value = nVal;
      const v = document.getElementById('val-fert-n');
      if (v) v.textContent = nVal;
    }
    if (pVal && fertSliders.p) {
      fertSliders.p.value = pVal;
      const v = document.getElementById('val-fert-p');
      if (v) v.textContent = pVal;
    }
    if (kVal && fertSliders.k) {
      fertSliders.k.value = kVal;
      const v = document.getElementById('val-fert-k');
      if (v) v.textContent = kVal;
    }
    if (phVal && fertSliders.ph) {
      fertSliders.ph.value = phVal;
      const v = document.getElementById('val-fert-ph');
      if (v) v.textContent = phVal;
    }

    // 4. Trigger prescription calculation
    const fertForm = document.getElementById('fert-form');
    if (fertForm) {
      fertForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }

    // 5. Smoothly scroll to results
    setTimeout(() => {
      const targetSection = document.getElementById('fertilizer-prescriber');
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  }

  // ── Speech Synthesis & Audio Kisan Helpers ──
  let activeSpeakingBtn = null;
  let activeSpeechAudio = null;
  window._activeSpeechUtterance = null; // Prevent Chromium Garbage Collection drop

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.onvoiceschanged = () => {
        try {
          window._cachedSpeechVoices = window.speechSynthesis.getVoices();
        } catch (e) {}
      };
    } catch (e) {}
  }

  function stopAllSpeech() {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}
    try {
      if (activeSpeechAudio) {
        activeSpeechAudio.pause();
        activeSpeechAudio.currentTime = 0;
        activeSpeechAudio = null;
      }
    } catch (e) {}
    if (activeSpeakingBtn) {
      activeSpeakingBtn.classList.remove('is-speaking');
      const lang = state.language || 'hi';
      const t = TRANSLATIONS[lang] || TRANSLATIONS['hi'];
      activeSpeakingBtn.innerHTML = t.listenBtnText || '🔊 Listen';
      activeSpeakingBtn = null;
    }
    window._activeSpeechUtterance = null;
  }

  function chunkTextForAudio(str, maxLength = 180) {
    if (!str || str.length <= maxLength) return [str];
    const chunks = [];
    const sentences = str.split(/(?<=[.।!?])\s+/);
    let cur = '';
    for (const s of sentences) {
      if ((cur + ' ' + s).trim().length <= maxLength) {
        cur = (cur ? cur + ' ' + s : s).trim();
      } else {
        if (cur) chunks.push(cur);
        if (s.length > maxLength) {
          const words = s.split(' ');
          cur = '';
          for (const w of words) {
            if ((cur + ' ' + w).trim().length <= maxLength) {
              cur = (cur ? cur + ' ' + w : w).trim();
            } else {
              if (cur) chunks.push(cur);
              cur = w;
            }
          }
        } else {
          cur = s;
        }
      }
    }
    if (cur) chunks.push(cur);
    return chunks;
  }

  function playAudioFallback(txt, langCode, btnElement, resetBtn) {
    try {
      stopAllSpeech();
      btnElement.classList.add('is-speaking');
      const lang = state.language || 'hi';
      const stopMap = {
        en: '⏹️ Stop', hi: '⏹️ रोकें / Stop', mr: '⏹️ थांबवा / Stop',
        pa: '⏹️ ਰੋਕੋ / Stop', gu: '⏹️ રોકો / Stop', te: '⏹️ ఆపు / Stop',
        ta: '⏹️ நிறுத்து / Stop', bn: '⏹️ থামুন / Stop', kn: '⏹️ ನಿಲ್ಲಿಸಿ / Stop'
      };
      btnElement.innerHTML = stopMap[lang] || '⏹️ Stop';
      activeSpeakingBtn = btnElement;

      const chunks = chunkTextForAudio(txt, 180);
      let curIndex = 0;

      function playNextChunk() {
        if (activeSpeakingBtn !== btnElement || curIndex >= chunks.length) {
          resetBtn();
          return;
        }
        const snippet = chunks[curIndex++];
        const audioUrl = `/api/tts?lang=${encodeURIComponent(langCode)}&text=${encodeURIComponent(snippet)}`;
        const audio = new Audio(audioUrl);
        activeSpeechAudio = audio;

        audio.onended = () => {
          if (activeSpeakingBtn === btnElement) {
            playNextChunk();
          }
        };
        audio.onerror = (e) => {
          console.warn('Audio endpoint error, falling back to Web Speech API:', e);
          if ('speechSynthesis' in window) {
            try {
              const u = new SpeechSynthesisUtterance(snippet);
              u.lang = langCode === 'en' ? 'en-IN' : `${langCode}-IN`;
              u.onend = () => {
                if (activeSpeakingBtn === btnElement) playNextChunk();
              };
              u.onerror = () => resetBtn();
              window.speechSynthesis.speak(u);
              return;
            } catch (synthErr) {}
          }
          resetBtn();
        };
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn('Audio play rejection, trying Web Speech API:', err);
            if ('speechSynthesis' in window) {
              try {
                const u = new SpeechSynthesisUtterance(snippet);
                u.lang = langCode === 'en' ? 'en-IN' : `${langCode}-IN`;
                u.onend = () => {
                  if (activeSpeakingBtn === btnElement) playNextChunk();
                };
                u.onerror = () => resetBtn();
                window.speechSynthesis.speak(u);
                return;
              } catch (synthErr) {}
            }
            resetBtn();
          });
        }
      }

      playNextChunk();
    } catch (err) {
      console.warn('playAudioFallback failed:', err);
      resetBtn();
    }
  }

  function toggleSpeech(text, btnElement) {
    if (!btnElement) return;

    const lang = state.language || 'hi';
    const t = TRANSLATIONS[lang] || TRANSLATIONS['hi'];
    const listenLabel = t.listenBtnText || '🔊 Listen';
    const stopMap = {
      en: '⏹️ Stop', hi: '⏹️ रोकें / Stop', mr: '⏹️ थांबवा / Stop',
      pa: '⏹️ ਰੋਕੋ / Stop', gu: '⏹️ રોકો / Stop', te: '⏹️ ఆపు / Stop',
      ta: '⏹️ நிறுத்து / Stop', bn: '⏹️ থামুন / Stop', kn: '⏹️ ನಿಲ್ಲಿಸಿ / Stop'
    };
    const stopLabel = stopMap[lang] || '⏹️ Stop';

    // If clicking the active speaking button, toggle off cleanly
    if (activeSpeakingBtn === btnElement) {
      stopAllSpeech();
      return;
    }

    // If another button is speaking or previous audio is active, stop it
    if (activeSpeakingBtn || (window.speechSynthesis && window.speechSynthesis.speaking) || activeSpeechAudio) {
      stopAllSpeech();
    }

    const cleanText = (text || '').replace(/<[^>]*>?/gm, '').replace(/[*_#]/g, '').trim();
    if (!cleanText) return;

    btnElement.classList.add('is-speaking');
    btnElement.innerHTML = stopLabel;
    activeSpeakingBtn = btnElement;

    const resetBtn = () => {
      if (activeSpeakingBtn === btnElement) {
        btnElement.classList.remove('is-speaking');
        btnElement.innerHTML = listenLabel;
        activeSpeakingBtn = null;
        activeSpeechAudio = null;
        window._activeSpeechUtterance = null;
      }
    };

    const langVoiceMap = {
      en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN',
      pa: 'pa-IN', gu: 'gu-IN', te: 'te-IN',
      ta: 'ta-IN', bn: 'bn-IN', kn: 'kn-IN'
    };
    const targetTag = langVoiceMap[lang] || 'hi-IN';
    const baseCode = targetTag.split('-')[0];

    const hasSpeech = ('speechSynthesis' in window);
    let voices = [];
    if (hasSpeech) {
      try {
        voices = (window.speechSynthesis.getVoices() && window.speechSynthesis.getVoices().length > 0)
          ? window.speechSynthesis.getVoices()
          : (window._cachedSpeechVoices || []);
      } catch (e) {
        voices = [];
      }
    }

    let regionalVoice = null;
    if (voices.length > 0) {
      regionalVoice = voices.find(v => v.lang && v.lang.toLowerCase() === targetTag.toLowerCase()) ||
                      voices.find(v => v.lang && v.lang.toLowerCase().startsWith(baseCode));
      if (!regionalVoice && baseCode === 'en') {
        regionalVoice = voices.find(v => v.lang && (v.lang.toLowerCase() === 'en-in' || v.lang.toLowerCase().includes('in'))) ||
                        voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en'));
      }
    }

    // If browser/OS lacks a native voice for the selected Indic language, use Google TTS audio immediately
    if (baseCode !== 'en' && !regionalVoice) {
      playAudioFallback(cleanText, lang, btnElement, resetBtn);
      return;
    }

    if (!hasSpeech) {
      playAudioFallback(cleanText, lang, btnElement, resetBtn);
      return;
    }

    // Clear stuck paused state in Chromium
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {}

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      if (regionalVoice) {
        utterance.voice = regionalVoice;
        utterance.lang = regionalVoice.lang;
      } else {
        utterance.lang = targetTag;
      }

      utterance.onend = () => {
        resetBtn();
      };
      utterance.onerror = (evt) => {
        console.warn('SpeechSynthesis error event:', evt, 'falling back to Google TTS audio...');
        playAudioFallback(cleanText, lang, btnElement, resetBtn);
      };

      window._activeSpeechUtterance = utterance;

      // 50ms delay to prevent Chromium from dropping speech after recent cancel
      setTimeout(() => {
        if (activeSpeakingBtn === btnElement) {
          try {
            window.speechSynthesis.speak(utterance);
          } catch (speakErr) {
            console.warn('speechSynthesis.speak error:', speakErr);
            playAudioFallback(cleanText, lang, btnElement, resetBtn);
          }
        }
      }, 50);
    } catch (err) {
      console.warn('Utterance creation failed, using audio fallback:', err);
      playAudioFallback(cleanText, lang, btnElement, resetBtn);
    }
  }

  function shareOnWhatsApp(cropName, details) {
    const text = `🌾 *SPARC AI Kisan Advisory*\n` +
      `--------------------------------\n` +
      `🌱 *Crop:* ${cropName}\n` +
      `${details}\n\n` +
      `✅ *Generated via SPARC Precision AI:* https://sparc-agri-sense-omega.vercel.app`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  // ── Language Switcher Controller ──
  const langSelect = document.getElementById('lang-select');

  function applyLanguage(lang) {
    stopAllSpeech();
    if (!TRANSLATIONS[lang]) lang = 'hi';
    state.language = lang;
    localStorage.setItem('agrisense_lang', lang);
    if (langSelect && langSelect.value !== lang) {
      langSelect.value = lang;
    }

    const t = TRANSLATIONS[lang];

    // Navigation Tabs
    const tabCrop = document.getElementById('tab-btn-crop');
    const tabWeather = document.getElementById('tab-btn-weather');
    const tabFert = document.getElementById('tab-btn-fert');
    const tabDoctor = document.getElementById('tab-btn-doctor');
    const tabSoil = document.getElementById('tab-btn-soil');
    if (tabCrop) tabCrop.textContent = t.navAdvisory;
    if (tabWeather) tabWeather.textContent = t.navWeather;
    if (tabFert) tabFert.textContent = t.navSoil;
    if (tabDoctor) tabDoctor.textContent = t.navDoctor;
    if (tabSoil) tabSoil.textContent = t.navMandi;

    // Hero Section
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroBadge = document.querySelector('.hero-cycle-badge');
    if (heroTitle) heroTitle.innerHTML = t.advisorTitle;
    if (heroSubtitle) heroSubtitle.textContent = t.advisorSubtitle;
    if (heroBadge) heroBadge.innerHTML = `<span class="leaf-dot">🌱</span> ${t.advisorBadge}`;

    // Field Card
    const fieldTitle = document.querySelector('.field-card-title');
    const fieldSub = document.querySelector('.field-card-sub');
    const btnReset = document.getElementById('btn-reset-defaults');
    if (fieldTitle) fieldTitle.textContent = t.fieldDiagnosticsTitle;
    if (fieldSub) fieldSub.textContent = t.fieldDiagnosticsSubtitle;
    if (btnReset) {
      btnReset.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg> ${t.btnDefaults}`;
    }

    // Target Crop Selector Labels
    const lblTargetCrop = document.getElementById('lbl-target-crop');
    const badgeTargetCropOpt = document.getElementById('badge-target-crop-opt');
    const hintTargetCrop = document.getElementById('hint-target-crop');
    if (lblTargetCrop) lblTargetCrop.textContent = t.lblTargetCrop;
    if (badgeTargetCropOpt) badgeTargetCropOpt.textContent = t.badgeTargetCropOpt;
    if (hintTargetCrop) hintTargetCrop.textContent = t.hintTargetCrop;
    populateTargetCrops(lang);

    // Recommend Button
    const btnPredict = document.getElementById('btn-predict-crops');
    if (btnPredict) {
      const btnText = btnPredict.querySelector('.btn-text');
      if (btnText) btnText.textContent = t.btnRecommend;
    }
    const nmsaDisc = document.querySelector('.nmsa-disclaimer');
    if (nmsaDisc) nmsaDisc.textContent = t.btnRecommendSub;

    // Results Header
    const resultsHeading = document.querySelector('.results-heading');
    const resultsSub = document.querySelector('.results-subheading');
    if (resultsHeading) resultsHeading.innerHTML = `<span class="live-bullet">●</span> ${t.recCropsTitle}`;
    if (resultsSub) resultsSub.textContent = t.recCropsSub;

    // View Pills
    const viewOverview = document.getElementById('view-overview-btn');
    const viewMatrix = document.getElementById('view-matrix-btn');
    if (viewOverview) viewOverview.innerHTML = `<span>⊞</span> ${t.tabOverview}`;
    if (viewMatrix) viewMatrix.innerHTML = `<span>☷</span> ${t.tabMatrix}`;

    // Helpline Banner
    const helplineTitle = document.querySelector('.helpline-text h4');
    const helplineDesc = document.querySelector('.helpline-text p');
    const locateBtn = document.querySelector('.helpline-locate-btn');
    if (helplineTitle) helplineTitle.textContent = t.helplineBannerTitle;
    if (helplineDesc) helplineDesc.textContent = t.helplineBannerDesc;
    if (locateBtn) locateBtn.textContent = t.locateKvkBtn;

    // Fertilizer Calc Button
    const fertBtn = document.getElementById('btn-calc-fert');
    if (fertBtn) {
      const bText = fertBtn.querySelector('.btn-text');
      if (bText) bText.textContent = t.btnFertCalc;
    }

    // Disease Doctor Header & Filter
    const pestDocHeaderH2 = document.querySelector('#crop-doctor .panel-title-group h2');
    const pestDocHeaderP = document.querySelector('#crop-doctor .panel-title-group p');
    if (pestDocHeaderH2) pestDocHeaderH2.textContent = t.pestDoctorTitle;
    if (pestDocHeaderP) pestDocHeaderP.textContent = t.pestDoctorSub;

    const btnSearchDis = document.getElementById('btn-search-disease');
    if (btnSearchDis) {
      const sp = btnSearchDis.querySelector('span');
      if (sp) sp.textContent = t.searchPathologyBtn;
      else btnSearchDis.textContent = t.searchPathologyBtn;
    }
    const docCropLbl = document.querySelector('label[for="doctor-crop-select"]');
    if (docCropLbl) docCropLbl.textContent = t.diseaseFilterCrop;

    const lblSymptomTap = document.getElementById('lbl-symptom-tap');
    if (lblSymptomTap) lblSymptomTap.textContent = t.symptomTapLabel;

    // Soil Texture Radio Card Labels
    const lblSoilTexture = document.getElementById('lbl-soil-texture');
    const lblStBlack = document.getElementById('lbl-st-black');
    const lblStLoamy = document.getElementById('lbl-st-loamy');
    const lblStRed = document.getElementById('lbl-st-red');
    const lblStLaterite = document.getElementById('lbl-st-laterite');
    if (lblSoilTexture && t.lblSoilTexture) lblSoilTexture.textContent = `🧱 ${t.lblSoilTexture}`;
    if (lblStBlack && t.stBlack) lblStBlack.textContent = t.stBlack;
    if (lblStLoamy && t.stLoamy) lblStLoamy.textContent = t.stLoamy;
    if (lblStRed && t.stRed) lblStRed.textContent = t.stRed;
    if (lblStLaterite && t.stLaterite) lblStLaterite.textContent = t.stLaterite;

    // Symptom Filter Chips
    const chipSymYellow = document.getElementById('chip-sym-yellow');
    const chipSymSpot = document.getElementById('chip-sym-spot');
    const chipSymWilt = document.getElementById('chip-sym-wilt');
    const chipSymRot = document.getElementById('chip-sym-rot');
    const chipSymPowdery = document.getElementById('chip-sym-powdery');
    const chipSymBorer = document.getElementById('chip-sym-borer');
    if (chipSymYellow && t.symptomYellow) chipSymYellow.textContent = t.symptomYellow;
    if (chipSymSpot && t.symptomSpot) chipSymSpot.textContent = t.symptomSpot;
    if (chipSymWilt && t.symptomWilt) chipSymWilt.textContent = t.symptomWilt;
    if (chipSymRot && t.symptomRot) chipSymRot.textContent = t.symptomRot;
    if (chipSymPowdery && t.symptomPowdery) chipSymPowdery.textContent = t.symptomPowdery;
    if (chipSymBorer && t.symptomBorer) chipSymBorer.textContent = t.symptomBorer;

    // Bottom Section Subtabs
    const subAdvisory = document.getElementById('btn-subtab-advisory');
    const subSpectrum = document.getElementById('btn-subtab-spectrum');
    const subRecords = document.getElementById('btn-subtab-records');
    if (subAdvisory) subAdvisory.textContent = t.subtabAdvisory;
    if (subSpectrum) subSpectrum.textContent = t.subtabSpectrum;
    if (subRecords) subRecords.textContent = t.subtabRecords;

    // Voice button labels
    document.querySelectorAll('.btn-voice-readout').forEach(btn => {
      if (!btn.classList.contains('is-speaking')) {
        btn.innerHTML = t.listenBtnText;
      }
    });

    // Share button labels
    document.querySelectorAll('.btn-whatsapp-share').forEach(btn => {
      btn.innerHTML = t.shareBtnText;
    });

    // Re-render recommendations (initialize defaults if empty so initial page is localized)
    if (!state.lastRecommendationsData) {
      state.lastRecommendationsData = {
        crop: 'rice',
        confidence: 94,
        recommendations: [
          { crop: 'rice', confidence: 94 },
          { crop: 'cotton', confidence: 82 },
          { crop: 'maize', confidence: 74 }
        ]
      };
    }
    renderRecommendations(state.lastRecommendationsData);
    if (typeof renderAgronomicMatrix === 'function') renderAgronomicMatrix(state.lastRecommendationsData);

    // Re-render disease doctor cards if active or loaded
    if (state.lastDiseaseData) {
      renderDiseases(state.lastDiseaseData);
    }

    // Fertilizer Prescriber Card Titles & Bags
    const fertResTitle = document.getElementById('fert-results-title');
    const kisanBagTitle = document.getElementById('kisan-bag-title');
    const lblBagUrea = document.getElementById('label-bag-urea');
    const lblBagDap = document.getElementById('label-bag-dap');
    const lblBagMop = document.getElementById('label-bag-mop');
    if (fertResTitle && t.fertPrescriptionTitle) fertResTitle.textContent = t.fertPrescriptionTitle;
    if (kisanBagTitle && t.kisanBagTitle) kisanBagTitle.textContent = t.kisanBagTitle;
    if (lblBagUrea && t.bagUreaLabel) lblBagUrea.textContent = t.bagUreaLabel;
    if (lblBagDap && t.bagDapLabel) lblBagDap.textContent = t.bagDapLabel;
    if (lblBagMop && t.bagMopLabel) lblBagMop.textContent = t.bagMopLabel;

    // History Modal Texts
    const histTitle = document.getElementById('history-modal-title');
    const histSub = document.getElementById('history-modal-sub');
    const chipHistAll = document.getElementById('chip-hist-all');
    const chipHistCrop = document.getElementById('chip-hist-crop');
    const chipHistFert = document.getElementById('chip-hist-fert');
    const chipHistDoc = document.getElementById('chip-hist-doctor');
    const btnClearHist = document.getElementById('btn-clear-history-text');
    if (histTitle && t.histTitle) histTitle.textContent = t.histTitle;
    if (histSub && t.histSub) histSub.textContent = t.histSub;
    if (chipHistAll && t.histFilterAll) chipHistAll.textContent = t.histFilterAll;
    if (chipHistCrop && t.histFilterCrop) chipHistCrop.textContent = t.histFilterCrop;
    if (chipHistFert && t.histFilterFert) chipHistFert.textContent = t.histFilterFert;
    if (chipHistDoc && t.histFilterDoctor) chipHistDoc.textContent = t.histFilterDoctor;
    if (btnClearHist && t.histClearBtn) btnClearHist.textContent = t.histClearBtn;

    // Re-render state soil profile if loaded
    if (state.lastSoilStateProfile) {
      renderStateSoilProfile(state.lastSoilStateProfile.name, state.lastSoilStateProfile.p);
    } else if (stateDropdown && stateDropdown.value) {
      loadSoilStateProfile(stateDropdown.value);
    }

    // Re-render history UI with localized strings
    if (typeof updateHistoryUI === 'function') {
      try { updateHistoryUI(); } catch (e) {}
    }

    // Re-render Past Season Benchmarks in active language
    const pastHeading = document.getElementById('past-season-heading');
    const pastSubheading = document.getElementById('past-season-subheading');
    if (pastHeading && PAST_SEASON_I18N.heading[lang]) {
      pastHeading.textContent = PAST_SEASON_I18N.heading[lang];
    }
    if (pastSubheading && PAST_SEASON_I18N.subheading[lang]) {
      pastSubheading.textContent = PAST_SEASON_I18N.subheading[lang];
    }
    if (typeof renderPastSeasonRecords === 'function') {
      try { renderPastSeasonRecords(state.activePastSeasonCropFilter || 'all'); } catch (e) {}
    }
  }

  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      applyLanguage(e.target.value);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. CROP RECOMMENDATION SUBMIT & RENDER
  // ─────────────────────────────────────────────────────────────────────────
  cropForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (predictSpinner) predictSpinner.classList.remove('is-hidden');
    if (resultsStatus) resultsStatus.textContent = 'Analyzing...';

    const nVal = inputs.n ? parseFloat(inputs.n.value) : parseFloat(sliders.n.value);
    const pVal = inputs.p ? parseFloat(inputs.p.value) : parseFloat(sliders.p.value);
    const kVal = inputs.k ? parseFloat(inputs.k.value) : parseFloat(sliders.k.value);
    const tempVal = parseFloat(sliders.temp.value);
    const rainVal = parseFloat(sliders.rain.value);
    const humVal = parseFloat(sliders.hum ? sliders.hum.value : 76);
    const phVal = parseFloat(sliders.ph ? sliders.ph.value : 6.8);

    const payload = {
      nitrogen: nVal,
      phosphorus: pVal,
      potassium: kVal,
      temperature: tempVal,
      humidity: humVal,
      ph: phVal,
      rainfall: rainVal,
      top_k: 3,
      target_crop: selectTargetCrop && selectTargetCrop.value ? selectTargetCrop.value : null
    };

    try {
      const res = await apiFetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.recommendations) {
          renderRecommendations(data, nVal, rainVal);
          if (resultsStatus) resultsStatus.textContent = 'AI Classified (99.3%)';
          return;
        }
      }

      console.warn('API returned non-ok, running local agronomic recommender fallback.');
      const localData = calculateCropPredictionLocal(payload);
      renderRecommendations(localData, nVal, rainVal);
      if (resultsStatus) resultsStatus.textContent = 'ICAR Calibrated (98.5%)';
    } catch (err) {
      console.warn('Predict network error, running local recommendation:', err);
      const localData = calculateCropPredictionLocal(payload);
      renderRecommendations(localData, nVal, rainVal);
      if (resultsStatus) resultsStatus.textContent = 'ICAR Calibrated (98.5%)';
    } finally {
      if (predictSpinner) predictSpinner.classList.add('is-hidden');
    }
  });

  function renderRecommendations(data, currentN = 92, currentRain = 210) {
    state.lastRecommendationsData = data;
    const recs = (data && data.recommendations) || [];
    if (recs.length === 0) return;

    // Auto-save search to History
    try {
      const topRec = recs[0];
      const topMeta = topRec ? getCropMeta(topRec.crop, topRec.profile) : null;
      saveSearchItem({
        type: 'crop',
        typeName: 'Crop Advisory',
        icon: '🌾',
        title: topMeta ? `${topMeta.fullName} • ${topRec.confidence}% Match` : 'Crop Recommendation',
        inputs: {
          nitrogen: currentN,
          phosphorus: parseFloat(inputs.p?.value || 45),
          potassium: parseFloat(inputs.k?.value || 45),
          ph: parseFloat(inputs.ph?.value || 6.5),
          temperature: parseFloat(sliders.temp?.value || 25),
          humidity: parseFloat(sliders.hum?.value || 70),
          rainfall: currentRain,
          target_crop: document.getElementById('select-target-crop')?.value || '',
          state: state.currentCity || ''
        },
        summary: `Soil N=${currentN}, P=${inputs.p?.value || 45}, K=${inputs.k?.value || 45}, pH=${inputs.ph?.value || 6.5} • Weather: ${sliders.temp?.value || 25}°C, ${currentRain}mm`,
        details: `Top: ${topMeta?.fullName || 'Crop'} (${topRec?.confidence || 90}%)`
      });
    } catch (histErr) {
      console.warn('History save error:', histErr);
    }

    const lang = state.language || 'hi';
    const t = TRANSLATIONS[lang] || TRANSLATIONS['hi'];

    // Target Crop Feasibility & Preferred Alternative Advisory
    const targetBanner = document.getElementById('target-crop-advisory-banner');
    if (targetBanner) {
      if (data.target_diagnosis && data.target_diagnosis.crop) {
        const diag = data.target_diagnosis;
        const targetCropKey = diag.crop.toLowerCase();
        const targetMeta = getCropMeta(targetCropKey, diag.profile);
        const topRec = recs[0];
        const topMeta = getCropMeta(topRec.crop, topRec.profile);
        const isViable = diag.risk_level === 'Low Risk' || (diag.compatibility_score >= 80);

        targetBanner.classList.remove('is-hidden');
        targetBanner.className = `target-crop-advisory-banner ${isViable ? 'is-viable' : 'is-risky'}`;

        if (isViable) {
          const vTitle = (t.targetViableTitle || '✅ Feasibility Verified: Your field naturally supports cultivating {crop}!').replace('{crop}', targetMeta.fullName);
          targetBanner.innerHTML = `
            <div class="advisory-header-row">
              <div class="advisory-title-group">
                <span class="advisory-status-icon">✅</span>
                <div>
                  <h4 class="advisory-title">${vTitle}</h4>
                  <p class="advisory-summary-text">${diag.summary || t.targetViableSummary || 'Your field soil test and weather baseline naturally support cultivating this crop with high yield potential.'}</p>
                </div>
              </div>
              <span class="advisory-score-pill badge-success">${diag.compatibility_score}% Feasibility (${diag.risk_level})</span>
            </div>
          `;
        } else {
          // Chosen crop CANNOT happen or has high risk! Suggest preferred crop!
          const rTitle = (t.targetRiskyTitle || '⚠️ Cultivation Alert: {crop} has High Agronomic Risk on this land').replace('{crop}', targetMeta.fullName);
          
          const issuesHtml = (diag.issues && diag.issues.length > 0)
            ? `<div class="advisory-issues-list">
                 <div class="advisory-issues-title">${t.keyLimitingFactors || '⚠️ Key Limiting Factors for'} ${targetMeta.fullName}:</div>
                 ${diag.issues.map(iss => `<div class="advisory-issue-item">❌ <strong>${iss.param} (${iss.status}):</strong> ${iss.detail}</div>`).join('')}
               </div>`
            : '';

          const rescueTitle = (t.rescueToggleLabel || '🛠️ If you still want to cultivate {crop}: View Rescue Roadmap ▼').replace('{crop}', targetMeta.fullName);

          const rescueHtml = (diag.rescue_roadmap && diag.rescue_roadmap.length > 0)
            ? `<button type="button" class="rescue-accordion-btn" id="btn-toggle-rescue">${rescueTitle}</button>
               <div class="rescue-roadmap-panel is-hidden" id="rescue-panel">
                 <div class="rescue-roadmap-title">${t.rescueProtocolTitle || 'Intensive Rescue & Soil Amendment Protocol:'}</div>
                 ${diag.rescue_roadmap.map(step => `<div class="rescue-item"><strong>${step.category}:</strong> ${step.action}<span class="impact">💡 ${step.impact}</span></div>`).join('')}
               </div>`
            : '';

          targetBanner.innerHTML = `
            <div class="advisory-header-row">
              <div class="advisory-title-group">
                <span class="advisory-status-icon">⚠️</span>
                <div>
                  <h4 class="advisory-title">${rTitle}</h4>
                  <p class="advisory-summary-text">${diag.summary}</p>
                </div>
              </div>
              <span class="advisory-score-pill badge-warning">${diag.compatibility_score}% Feasibility (${diag.risk_level})</span>
            </div>
            ${issuesHtml}
            
            <!-- AI PREFERRED CROP SUGGESTION -->
            <div class="preferred-suggestion-box">
              <div class="preferred-header">
                <div class="preferred-header-left">
                  <span>🌟</span>
                  <span>${t.preferredHeader || 'AI Recommended Preferred Crop for Your Land:'}</span>
                </div>
                <span class="preferred-match-tag">${topRec.confidence}% ${t.altMatchText || 'Match'}</span>
              </div>
              <div class="preferred-crop-highlight">${topMeta.fullName}</div>
              <p class="preferred-desc">
                ${getPreferredCropDescription(topMeta.fullName, targetMeta.fullName, currentN, currentRain, topMeta.yield, topMeta.priceSub, lang)}
              </p>
            </div>
            ${rescueHtml}
          `;

          // Hook rescue accordion toggle
          const toggleRescueBtn = document.getElementById('btn-toggle-rescue');
          const rescuePanel = document.getElementById('rescue-panel');
          if (toggleRescueBtn && rescuePanel) {
            toggleRescueBtn.addEventListener('click', () => {
              rescuePanel.classList.toggle('is-hidden');
            });
          }
        }
      } else {
        targetBanner.classList.add('is-hidden');
        targetBanner.innerHTML = '';
      }
    }

        // #1 Best Choice Crop
    const best = recs[0];
    const bestMeta = getCropMeta(best.crop, best.profile);

    const bestChoiceBadge = document.getElementById('hero-choice-badge');
    const bestConfChip = document.getElementById('hero-confidence-chip');
    const bestCropName = document.getElementById('best-crop-name');
    const bestSeason = document.getElementById('best-crop-season');
    const bestVarieties = document.getElementById('best-crop-varieties');
    const bestGaugeVal = document.getElementById('best-gauge-val');
    const bestGaugeFill = document.getElementById('best-gauge-fill');
    const gaugeTitle = document.getElementById('gauge-caption-title');
    const gaugeSub = document.getElementById('gauge-caption-sub');
    const whyFitsTitle = document.getElementById('why-fits-title');
    const bestRationale = document.getElementById('best-crop-rationale');

    const lblStatYield = document.getElementById('lbl-stat-yield');
    const bestStatYield = document.getElementById('best-stat-yield');
    const bestStatYieldSub = document.getElementById('best-stat-yield-sub');

    const lblStatWater = document.getElementById('lbl-stat-water');
    const bestStatWater = document.getElementById('best-stat-water');
    const bestStatWaterSub = document.getElementById('best-stat-water-sub');

    const lblStatPrice = document.getElementById('lbl-stat-price');
    const bestStatPrice = document.getElementById('best-stat-price');
    const bestStatPriceSub = document.getElementById('best-stat-price-sub');

    const lblStatDuration = document.getElementById('lbl-stat-duration');
    const bestStatDuration = document.getElementById('best-stat-duration');
    const bestStatDurationSub = document.getElementById('best-stat-duration-sub');

    const lblBasalDose = document.getElementById('lbl-basal-dose');
    const valBasalDose = document.getElementById('val-basal-dose');
    const bestCalLink = document.getElementById('best-crop-calendar-link');

    if (bestChoiceBadge) bestChoiceBadge.textContent = t.heroChoiceBadge;
    if (bestConfChip) bestConfChip.textContent = t.heroConfidenceChip;
    if (bestCropName) bestCropName.textContent = bestMeta.fullName;
    if (bestSeason) bestSeason.textContent = bestMeta.seasonBadge;
    if (bestVarieties) bestVarieties.textContent = `${t.recVarietiesPrefix}${bestMeta.varieties}`;
    if (bestGaugeVal) bestGaugeVal.textContent = `${best.confidence}%`;
    if (bestGaugeFill) {
      const offset = 213.6 - (213.6 * best.confidence / 100);
      bestGaugeFill.setAttribute('stroke-dashoffset', offset.toFixed(1));
    }
    if (gaugeTitle) gaugeTitle.textContent = t.gaugeMatch;
    if (gaugeSub) gaugeSub.textContent = t.gaugeFit;
    if (whyFitsTitle) whyFitsTitle.textContent = t.whyFitsTitle;
    if (bestRationale) {
      bestRationale.textContent = bestMeta.rationale(currentN, currentRain, lang);
    }

    if (lblStatYield) lblStatYield.textContent = t.lblYield;
    if (bestStatYield) bestStatYield.textContent = bestMeta.yield;
    if (bestStatYieldSub) bestStatYieldSub.textContent = bestMeta.yieldSub;

    if (lblStatWater) lblStatWater.textContent = t.lblWater;
    if (bestStatWater) bestStatWater.textContent = bestMeta.water;
    if (bestStatWaterSub) bestStatWaterSub.textContent = bestMeta.waterSub;

    if (lblStatPrice) lblStatPrice.textContent = t.lblPrice;
    if (bestStatPrice) bestStatPrice.textContent = bestMeta.price;
    if (bestStatPriceSub) bestStatPriceSub.textContent = bestMeta.priceSub;

    if (lblStatDuration) lblStatDuration.textContent = t.lblDuration;
    if (bestStatDuration) bestStatDuration.textContent = bestMeta.duration;
    if (bestStatDurationSub) bestStatDurationSub.textContent = bestMeta.durationSub;

    if (lblBasalDose) lblBasalDose.textContent = t.lblBasalDose;
    if (valBasalDose) valBasalDose.textContent = bestMeta.basalDose;
    if (bestCalLink) {
      bestCalLink.textContent = t.calendarLink;
      bestCalLink.onclick = (e) => {
        e.preventDefault();
        openCropCalendarModal(best.crop);
      };
    }

    // Attach Voice & WhatsApp to new Best Choice
    const dynamicBestVoice = document.getElementById('best-voice-btn');
    if (dynamicBestVoice) {
      dynamicBestVoice.innerHTML = t.listenBtnText;
      const spText = getVoiceReadoutText(bestMeta, best, lang);
      dynamicBestVoice.onclick = () => toggleSpeech(spText, dynamicBestVoice);
    }

    const dynamicBestWa = document.getElementById('best-whatsapp-btn');
    if (dynamicBestWa) {
      dynamicBestWa.innerHTML = t.shareBtnText;
      const waDet = `📊 *Match:* ${best.confidence}%
🌾 *Yield:* ${bestMeta.yield}
💧 *Water:* ${bestMeta.water}
⏱️ *Duration:* ${bestMeta.duration}
💰 *Mandi:* ${bestMeta.price}`;
      dynamicBestWa.onclick = () => shareOnWhatsApp(bestMeta.fullName, waDet);
    }

    // Alternative #1 (Index 1)
    if (recs.length > 1) {
      const alt1 = recs[1];
      const alt1Meta = getCropMeta(alt1.crop, alt1.profile);
      const alt1Tag = document.getElementById('alt-1-tag');
      const alt1Score = document.getElementById('alt-1-score');
      const alt1Title = document.getElementById('alt-1-title');
      const alt1Desc = document.getElementById('alt-1-desc');
      const alt1LblWater = document.getElementById('alt-1-lbl-water');
      const alt1Water = document.getElementById('alt-1-water');
      const alt1LblYield = document.getElementById('alt-1-lbl-yield');
      const alt1Yield = document.getElementById('alt-1-yield');
      const alt1LblRisk = document.getElementById('alt-1-lbl-risk');
      const alt1Risk = document.getElementById('alt-1-risk');
      const alt1FertLink = document.getElementById('alt-1-fert-link');

      if (alt1Tag) alt1Tag.textContent = t.altTag1;
      let match1 = Number(alt1.compatibility_score) || 0;
      if (!match1 || match1 < 50) {
        match1 = Math.min(88, Math.max(74, Math.round(Number(alt1.confidence) * 1.5 + 70)));
      }
      if (alt1Score) alt1Score.textContent = `${match1}% ${t.altMatchText}`;
      if (alt1Title) alt1Title.textContent = alt1Meta.fullName;
      if (alt1Desc) alt1Desc.textContent = getAlternativeCropRationale(alt1Meta.fullName, currentN, currentRain, lang);
      if (alt1LblWater) alt1LblWater.textContent = t.altLblWater;
      if (alt1Water) alt1Water.textContent = alt1Meta.water;
      if (alt1LblYield) alt1LblYield.textContent = t.altLblYield;
      if (alt1Yield) alt1Yield.textContent = alt1Meta.yield;
      if (alt1LblRisk) alt1LblRisk.textContent = t.altLblRisk;
      if (alt1Risk) alt1Risk.textContent = alt1Meta.priceSub;
      if (alt1FertLink) {
        alt1FertLink.textContent = t.altFertLink;
        alt1FertLink.onclick = (e) => {
          e.preventDefault();
          navigateToFertilizerPackage(alt1.crop);
        };
      }

      const alt1V = document.getElementById('alt-1-voice-btn');
      if (alt1V) {
        alt1V.innerHTML = t.listenBtnText;
        const speech1 = getAltVoiceReadoutText(t.altTag1, alt1Meta, alt1, lang);
        alt1V.onclick = () => toggleSpeech(speech1, alt1V);
      }

      const alt1Wa = document.getElementById('alt-1-share-btn');
      if (alt1Wa) {
        const alt1WaDet = `📊 *Match:* ${match1}%\n🌾 *Yield:* ${alt1Meta.yield}\n💧 *Water:* ${alt1Meta.water}\n📈 *Risk:* ${alt1Meta.priceSub}`;
        alt1Wa.onclick = () => shareOnWhatsApp(alt1Meta.fullName, alt1WaDet);
      }
    }

    // Alternative #2 (Index 2)
    if (recs.length > 2) {
      const alt2 = recs[2];
      const alt2Meta = getCropMeta(alt2.crop, alt2.profile);
      const alt2Tag = document.getElementById('alt-2-tag');
      const alt2Score = document.getElementById('alt-2-score');
      const alt2Title = document.getElementById('alt-2-title');
      const alt2Desc = document.getElementById('alt-2-desc');
      const alt2LblWater = document.getElementById('alt-2-lbl-water');
      const alt2Water = document.getElementById('alt-2-water');
      const alt2LblYield = document.getElementById('alt-2-lbl-yield');
      const alt2Yield = document.getElementById('alt-2-yield');
      const alt2LblRisk = document.getElementById('alt-2-lbl-risk');
      const alt2Risk = document.getElementById('alt-2-risk');
      const alt2FertLink = document.getElementById('alt-2-fert-link');

      if (alt2Tag) alt2Tag.textContent = t.altTag2;
      let match2 = Number(alt2.compatibility_score) || 0;
      if (!match2 || match2 < 50) {
        match2 = Math.min(84, Math.max(68, Math.round(Number(alt2.confidence) * 1.5 + 64)));
      }
      if (alt2Score) alt2Score.textContent = `${match2}% ${t.altMatchText}`;
      if (alt2Title) alt2Title.textContent = alt2Meta.fullName;
      if (alt2Desc) alt2Desc.textContent = getAlternativeCropRationale(alt2Meta.fullName, currentN, currentRain, lang);
      if (alt2LblWater) alt2LblWater.textContent = t.altLblWater;
      if (alt2Water) alt2Water.textContent = alt2Meta.water;
      if (alt2LblYield) alt2LblYield.textContent = t.altLblYield;
      if (alt2Yield) alt2Yield.textContent = alt2Meta.yield;
      if (alt2LblRisk) alt2LblRisk.textContent = t.altLblRisk;
      if (alt2Risk) alt2Risk.textContent = alt2Meta.priceSub;
      if (alt2FertLink) {
        alt2FertLink.textContent = t.altFertLink;
        alt2FertLink.onclick = (e) => {
          e.preventDefault();
          navigateToFertilizerPackage(alt2.crop);
        };
      }

      const alt2V = document.getElementById('alt-2-voice-btn');
      if (alt2V) {
        alt2V.innerHTML = t.listenBtnText;
        const speech2 = getAltVoiceReadoutText(t.altTag2, alt2Meta, alt2, lang);
        alt2V.onclick = () => toggleSpeech(speech2, alt2V);
      }

      const alt2Wa = document.getElementById('alt-2-share-btn');
      if (alt2Wa) {
        const alt2WaDet = `📊 *Match:* ${match2}%\n🌾 *Yield:* ${alt2Meta.yield}\n💧 *Water:* ${alt2Meta.water}\n📈 *Risk:* ${alt2Meta.priceSub}`;
        alt2Wa.onclick = () => shareOnWhatsApp(alt2Meta.fullName, alt2WaDet);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  // AGRONOMIC DECISION COMPARISON MATRIX
  // ─────────────────────────────────────────────────────────────────────────
  function renderAgronomicMatrix(data) {
    const container = document.getElementById('agronomic-matrix-container');
    if (!container) return;

    const recs = (data && data.recommendations) || [];
    if (recs.length === 0) {
      container.innerHTML = '<p class="text-dim">No agronomic comparison data available yet.</p>';
      return;
    }

    const lang = state.language || 'hi';
    const matrixHeaders = {
      en: { rank: 'Rank & Crop', match: 'Match %', yield: 'Expected Yield', water: 'Water & Irrigation', duration: 'Growth Duration', price: 'Mandi Outlook', action: 'Action' },
      hi: { rank: 'श्रेणी व फसल (Crop)', match: 'अनुकूलता %', yield: 'अपेक्षित उपज', water: 'जल व सिंचाई', duration: 'फसल अवधि', price: 'मंडी भाव व MSP', action: 'कार्यवाही' },
      mr: { rank: 'क्रम व पीक (Crop)', match: 'जुळणी %', yield: 'अपेक्षित उत्पादन', water: 'पाणी व सिंचन', duration: 'पिकाचा कालावधी', price: 'बाजार भाव व हमीभाव', action: 'कृती' },
      pa: { rank: 'ਦਰਜਾ ਅਤੇ ਫਸਲ', match: 'ਮੇਲ %', yield: 'ਅਨੁਮਾਨਿਤ ਝਾੜ', water: 'ਪਾਣੀ ਅਤੇ ਸਿੰਚਾਈ', duration: 'ਪੱਕਣ ਦਾ ਸਮਾਂ', price: 'ਮੰਡੀ ਭਾਅ', action: 'ਕਾਰਵਾਈ' },
      gu: { rank: 'ક્રમ અને પાક', match: 'મેચ %', yield: 'અપેક્ષિત ઉત્પાદન', water: 'પાણી અને પિયત', duration: 'પાકનો સમયગાળો', price: 'બજાર ભાવ', action: 'ક્રિયા' },
      te: { rank: 'ర్యాంక్ & పంట', match: 'సరిపోలిక %', yield: 'ఆశించిన దిగుబడి', water: 'నీరు & సాగునీరు', duration: 'పంట కాలం', price: 'మార్కెట్ ధర', action: 'చర్య' },
      ta: { rank: 'வரிசை & பயிர்', match: 'பொருத்தம் %', yield: 'எதிர்பார்க்கப்படும் மகசூல்', water: 'நீர் & பாசனம்', duration: 'பயிர் காலம்', price: 'சந்தை விலை', action: 'செயல்' },
      bn: { rank: 'ক্রম ও ফসল', match: 'উপযোগিতা %', yield: 'প্রত্যাশিত ফলন', water: 'জল ও সেচ', duration: 'ফসলের সময়কাল', price: 'বাজার দর', action: 'পদক্ষেপ' },
      kn: { rank: 'ಶ್ರೇಣಿ & ಬೆಳೆ', match: 'ಹೊಂದಾಣಿಕೆ %', yield: 'ನಿರೀಕ್ಷಿತ ಇಳುವರಿ', water: 'ನೀರು & ನೀರಾವರಿ', duration: 'ಬೆಳೆಯ ಅವಧಿ', price: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ', action: 'ಕ್ರಮ' }
    };

    const th = matrixHeaders[lang] || matrixHeaders['en'];
    const t = TRANSLATIONS[lang] || TRANSLATIONS['hi'];
    const rankBadges = [
      { badge: t.matrixRank1 || '🥇 #1 Best Match', color: '#1B4332', bg: '#D8F3DC' },
      { badge: t.matrixAlt1 || '🥈 Alternative #1', color: '#854D0E', bg: '#FEF08A' },
      { badge: t.matrixAlt2 || '🥉 Alternative #2', color: '#374151', bg: '#E5E7EB' }
    ];

    const rowsHtml = recs.slice(0, 5).map((rec, idx) => {
      const meta = getCropMeta(rec.crop, rec.profile);
      const badgeInfo = rankBadges[idx] || { badge: `#${idx + 1} Option`, color: '#374151', bg: '#E5E7EB' };
      const conf = Math.round(rec.confidence || 0);

      return `
        <tr>
          <td>
            <span class="matrix-rank-pill" style="color: ${badgeInfo.color}; background: ${badgeInfo.bg};">${badgeInfo.badge}</span>
            <div class="matrix-crop-title">${meta.fullName}</div>
            <div class="matrix-crop-varieties">🌱 ${meta.varieties}</div>
          </td>
          <td>
            <div class="matrix-match-wrap">
              <span class="matrix-match-pct">${conf}%</span>
              <div class="matrix-match-bar">
                <div class="matrix-match-fill" style="width: ${conf}%;"></div>
              </div>
            </div>
            <span class="matrix-stat-sub">${conf >= 85 ? (t.matrixIdealFit || '🌟 Ideal Field Fit') : (conf >= 70 ? '✓ High Viability' : '⚠️ Moderate')}</span>
          </td>
          <td>
            <div class="matrix-stat-val">${meta.yield}</div>
            <span class="matrix-stat-sub">${meta.yieldSub}</span>
          </td>
          <td>
            <div class="matrix-stat-val">${meta.water}</div>
            <span class="matrix-stat-sub">${meta.waterSub}</span>
          </td>
          <td>
            <div class="matrix-stat-val">${meta.duration}</div>
            <span class="matrix-stat-sub">${meta.durationSub}</span>
          </td>
          <td>
            <div class="matrix-stat-val">${meta.price}</div>
            <span class="matrix-stat-sub">${meta.priceSub}</span>
          </td>
          <td>
            <a href="#fertilizer-prescriber" class="matrix-fert-btn">🧪 ${t.matrixPrescribe || 'Prescribe'}</a>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="matrix-table-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>${th.rank}</th>
              <th>${th.match}</th>
              <th>${th.yield}</th>
              <th>${th.water}</th>
              <th>${th.duration}</th>
              <th>${th.price}</th>
              <th>${th.action}</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  // View Switcher (Overview vs Agronomic Matrix)
  const viewOverviewBtn = document.getElementById('view-overview-btn');
  const viewMatrixBtn = document.getElementById('view-matrix-btn');
  const recsContainer = document.getElementById('recommendations-list');
  const matrixContainer = document.getElementById('agronomic-matrix-container');

  if (viewOverviewBtn && viewMatrixBtn) {
    viewOverviewBtn.addEventListener('click', () => {
      viewOverviewBtn.classList.add('active');
      viewMatrixBtn.classList.remove('active');
      if (recsContainer) recsContainer.classList.remove('is-hidden');
      if (matrixContainer) matrixContainer.classList.add('is-hidden');
    });

    viewMatrixBtn.addEventListener('click', () => {
      viewMatrixBtn.classList.add('active');
      viewOverviewBtn.classList.remove('active');
      if (recsContainer) recsContainer.classList.add('is-hidden');
      if (matrixContainer) {
        matrixContainer.classList.remove('is-hidden');
        renderAgronomicMatrix(state.lastRecommendationsData);
      }
    });
  }

    // 7. FERTILIZER PRESCRIBER & BAG CALCULATOR
  // ─────────────────────────────────────────────────────────────────────────
  fertForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (fertSpinner) fertSpinner.classList.remove('is-hidden');

    const payload = {
      nitrogen: parseFloat(fertSliders.n.value),
      phosphorus: parseFloat(fertSliders.p.value),
      potassium: parseFloat(fertSliders.k.value),
      ph: parseFloat(fertSliders.ph.value),
      target_crop: fertCropSelect.value,
      state: fertStateSelect.value || null
    };

    try {
      let res = await apiFetch('/api/fertilizer-calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        res = await apiFetch('/api/fertilizer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (data.success && (data.fertilizers || data.prescription)) {
          renderFertilizers(data);
          return;
        }
      }

      // Offline or Serverless fallback using scientific ICAR formula
      console.warn('API returned non-ok, using local ICAR fertilizer calculator fallback.');
      const localData = calculateFertilizersLocal(payload);
      renderFertilizers(localData);
    } catch (err) {
      console.warn('Network error, calculating fertilizer locally:', err);
      const localData = calculateFertilizersLocal(payload);
      renderFertilizers(localData);
    } finally {
      if (fertSpinner) fertSpinner.classList.add('is-hidden');
    }
  });

  function renderFertilizers(data, skipHistory = false) {
    if (fertPlaceholder) fertPlaceholder.classList.add('is-hidden');
    if (fertContent) fertContent.classList.remove('is-hidden');

    const lang = state.language || 'hi';
    const t = TRANSLATIONS[lang] || TRANSLATIONS['hi'];

    const fertBadge = document.getElementById('fert-badge');
    if (fertBadge) {
      fertBadge.textContent = 'ICAR-IISS Prescribed';
      fertBadge.style.background = '#E8F5E9';
      fertBadge.style.color = '#2E7D32';
      fertBadge.style.borderColor = '#A5D6A7';
    }

    let f = data.fertilizers;
    if (!f && data.prescription) {
      const cd = data.prescription.commercial_doses || {};
      f = {
        urea_kg_ha: cd.urea_kg ?? cd.urea_kg_ha ?? 0,
        dap_kg_ha: cd.dap_kg ?? cd.dap_kg_ha ?? 0,
        mop_kg_ha: cd.mop_kg ?? cd.mop_kg_ha ?? 0
      };
    }
    if (!f) {
      f = { urea_kg_ha: 0, dap_kg_ha: 0, mop_kg_ha: 0 };
    }
    data.fertilizers = f;
    state.lastFertData = data;
    // Auto-save fertilizer calculation to History (unless bootstrap init)
    if (!skipHistory) {
      try {
        const landSize = document.getElementById('input-fert-land-size')?.value || 1.0;
        const landUnit = document.getElementById('select-fert-land-unit')?.value || 'acre';
        saveSearchItem({
          type: 'fert',
          typeName: 'Fertilizer Prescription',
          icon: '🧪',
          title: `${data.target_crop || 'CROP'} • Urea: ${f.urea_kg_ha.toFixed(1)} kg, DAP: ${f.dap_kg_ha.toFixed(1)} kg, MOP: ${f.mop_kg_ha.toFixed(1)} kg/ha`,
          inputs: {
            nitrogen: data.inputs?.nitrogen || 90,
            phosphorus: data.inputs?.phosphorus || 45,
            potassium: data.inputs?.potassium || 45,
            ph: data.inputs?.ph || 6.8,
            target_crop: data.target_crop || '',
            state: fertStateSelect?.value || '',
            land_size: landSize,
            land_unit: landUnit
          },
          summary: `Target: ${data.target_crop || 'Crop'} • Land: ${landSize} ${landUnit.toUpperCase()} • NPK: ${data.inputs?.nitrogen || 90}-${data.inputs?.phosphorus || 45}-${data.inputs?.potassium || 45}`,
          details: `Prescription: ${f.urea_kg_ha.toFixed(0)} kg Urea, ${f.dap_kg_ha.toFixed(0)} kg DAP, ${f.mop_kg_ha.toFixed(0)} kg MOP/ha`
        });
      } catch (fertHistErr) {
        console.warn('Fert history save error:', fertHistErr);
      }
    }


    const metricUrea = document.getElementById('metric-urea');
    const metricDap = document.getElementById('metric-dap');
    const metricMop = document.getElementById('metric-mop');

    if (metricUrea) metricUrea.innerHTML = `${f.urea_kg_ha.toFixed(1)} <span class="sub-unit">kg/ha</span>`;
    if (metricDap) metricDap.innerHTML = `${f.dap_kg_ha.toFixed(1)} <span class="sub-unit">kg/ha</span>`;
    if (metricMop) metricMop.innerHTML = `${f.mop_kg_ha.toFixed(1)} <span class="sub-unit">kg/ha</span>`;

    // Bags for 1 Hectare base
    const uBags = (f.urea_kg_ha / 45).toFixed(1);
    const dBags = (f.dap_kg_ha / 50).toFixed(1);
    const mBags = (f.mop_kg_ha / 50).toFixed(1);

    const ureaBagsEl = document.getElementById('metric-urea-bags');
    const dapBagsEl = document.getElementById('metric-dap-bags');
    const mopBagsEl = document.getElementById('metric-mop-bags');

    if (ureaBagsEl) ureaBagsEl.textContent = `≈ ${uBags} standard 45kg bags/ha`;
    if (dapBagsEl) dapBagsEl.textContent = `≈ ${dBags} standard 50kg bags/ha`;
    if (mopBagsEl) mopBagsEl.textContent = `≈ ${mBags} standard 50kg bags/ha`;

    // Calculate Commercial Bags for Custom Land Size
    recalcFarmerBags(f);

    // Render Timeline Schedule
    const timelineEl = document.getElementById('fert-timeline');
    if (timelineEl) {
      timelineEl.innerHTML = `
        <div class="timeline-schedule-box">
          <div class="timeline-step-item"><strong>${t.timelineBasalLabel || '🌱 Basal Application (बुवाई/रोपाई के समय)'}:</strong> 100% DAP (${f.dap_kg_ha.toFixed(0)} kg/ha), 100% MOP (${f.mop_kg_ha.toFixed(0)} kg/ha), and 33% Urea.</div>
          <div class="timeline-step-item"><strong>${t.timelineTop1Label || '🌿 First Top Dressing (25–30 दिन बाद)'}:</strong> 33% Urea during active tillering/vegetative phase.</div>
          <div><strong>${t.timelineTop2Label || '🌾 Second Top Dressing (50–55 दिन बाद)'}:</strong> Remaining 34% Urea before panicle initiation/flowering.</div>
        </div>
      `;
    }

    // Schedule initial chart render after DOM reflow
    setTimeout(() => {
      renderFertPlotlyChart(data, state.activeChartMode || 'bar');
    }, 60);
  }

  function recalcFarmerBags(f) {
    if (!f) return;
    const landSizeInput = document.getElementById('input-fert-land-size');
    const landUnitSelect = document.getElementById('select-fert-land-unit');
    const kisanLandBadge = document.getElementById('kisan-land-badge');
    const kUrea = document.getElementById('kisan-urea-bags');
    const kDap = document.getElementById('kisan-dap-bags');
    const kMop = document.getElementById('kisan-mop-bags');

    const area = parseFloat(landSizeInput?.value) || 1.0;
    const unit = landUnitSelect?.value || 'acre';

    let factorToHectare = 0.404686;
    if (unit === 'hectare') factorToHectare = 1.0;
    else if (unit === 'bigha') factorToHectare = 0.25;
    else if (unit === 'guntha') factorToHectare = 0.010117;

    const totalHa = area * factorToHectare;
    const bagsUrea = Math.ceil((f.urea_kg_ha * totalHa) / 45);
    const bagsDap = Math.ceil((f.dap_kg_ha * totalHa) / 50);
    const bagsMop = Math.ceil((f.mop_kg_ha * totalHa) / 50);

    if (kUrea) kUrea.textContent = bagsUrea;
    if (kDap) kDap.textContent = bagsDap;
    if (kMop) kMop.textContent = bagsMop;
    if (kisanLandBadge) kisanLandBadge.textContent = `For ${area} ${unit.toUpperCase()}`;
  }

  const landSizeIn = document.getElementById('input-fert-land-size');
  const landUnitSel = document.getElementById('select-fert-land-unit');
  if (landSizeIn) landSizeIn.addEventListener('input', () => { if (state.lastFertData) recalcFarmerBags(state.lastFertData.fertilizers); });
  if (landUnitSel) landUnitSel.addEventListener('change', () => { if (state.lastFertData) recalcFarmerBags(state.lastFertData.fertilizers); });

  function renderFertPlotlyChart(data, mode = 'bar') {
    const chartDiv = document.getElementById('fert-plotly-chart');
    if (!chartDiv) return;

    let targetN = 120, targetP = 60, targetK = 40;
    let currentN = 92, currentP = 46, currentK = 44;

    if (data) {
      if (data.deficits) {
        if (typeof data.deficits.target_n === 'number') targetN = data.deficits.target_n;
        if (typeof data.deficits.target_p === 'number') targetP = data.deficits.target_p;
        if (typeof data.deficits.target_k === 'number') targetK = data.deficits.target_k;
        if (typeof data.deficits.current_n === 'number') currentN = data.deficits.current_n;
        if (typeof data.deficits.current_p === 'number') currentP = data.deficits.current_p;
        if (typeof data.deficits.current_k === 'number') currentK = data.deficits.current_k;
      }
      if (data.prescription) {
        const tnpk = data.prescription.target_npk || {};
        const cnpk = data.prescription.current_npk || {};
        if (typeof tnpk.N === 'number') targetN = tnpk.N;
        if (typeof tnpk.P === 'number') targetP = tnpk.P;
        if (typeof tnpk.K === 'number') targetK = tnpk.K;
        if (typeof cnpk.N === 'number') currentN = cnpk.N;
        if (typeof cnpk.P === 'number') currentP = cnpk.P;
        if (typeof cnpk.K === 'number') currentK = cnpk.K;
      }
      if (data.inputs) {
        if (typeof data.inputs.nitrogen === 'number') currentN = data.inputs.nitrogen;
        if (typeof data.inputs.phosphorus === 'number') currentP = data.inputs.phosphorus;
        if (typeof data.inputs.potassium === 'number') currentK = data.inputs.potassium;
      }
    }

    targetN = Math.round(targetN);
    targetP = Math.round(targetP);
    targetK = Math.round(targetK);
    currentN = Math.round(currentN);
    currentP = Math.round(currentP);
    currentK = Math.round(currentK);

    if (mode === '3d' && window.Plotly) {
      const traceCurrent = {
        type: 'scatter3d',
        mode: 'lines+markers+text',
        x: [0, 1, 2],
        y: [0, 0, 0],
        z: [currentN, currentP, currentK],
        text: [`N: ${currentN}`, `P: ${currentP}`, `K: ${currentK}`],
        textposition: 'top center',
        line: { color: '#E59B2E', width: 6 },
        marker: { size: 6, color: '#E59B2E' },
        name: 'Current Field Soil'
      };

      const traceTarget = {
        type: 'scatter3d',
        mode: 'lines+markers+text',
        x: [0, 1, 2],
        y: [1, 1, 1],
        z: [targetN, targetP, targetK],
        text: [`N: ${targetN}`, `P: ${targetP}`, `K: ${targetK}`],
        textposition: 'top center',
        line: { color: '#1C4A32', width: 6 },
        marker: { size: 6, color: '#1C4A32' },
        name: 'Crop Optimum Target'
      };

      const layout3d = {
        paper_bgcolor: 'transparent',
        margin: { t: 20, r: 10, l: 10, b: 20 },
        scene: {
          xaxis: { title: 'Nutrients', tickvals: [0, 1, 2], ticktext: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'] },
          yaxis: { title: 'Reference', tickvals: [0, 1], ticktext: ['Field Soil', 'Crop Target'] },
          zaxis: { title: 'kg/ha' },
          camera: { eye: { x: 1.5, y: -1.6, z: 1.2 } }
        },
        legend: { orientation: 'h', x: 0, y: 1.15 }
      };

      try {
        window.Plotly.newPlot(chartDiv, [traceCurrent, traceTarget], layout3d, { responsive: true, displayModeBar: false });
        return;
      } catch (err) {
        console.warn('Plotly 3D error:', err);
      }
    }

    if (!window.Plotly) {
      renderFertSvgFallback(chartDiv, targetN, targetP, targetK, currentN, currentP, currentK);
      return;
    }

    const maxY = Math.max(targetN, targetP, targetK, currentN, currentP, currentK, 50);

    const trace1 = {
      x: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
      y: [targetN, targetP, targetK],
      name: 'Crop Optimum Target',
      type: 'bar',
      width: [0.22, 0.22, 0.22],
      marker: { color: '#1C4A32', line: { color: '#0F291E', width: 1.5 } },
      text: [`${targetN} kg/ha`, `${targetP} kg/ha`, `${targetK} kg/ha`],
      textposition: 'auto',
      hoverinfo: 'x+y+name'
    };

    const trace2 = {
      x: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
      y: [currentN, currentP, currentK],
      name: 'Current Field Soil Test',
      type: 'bar',
      width: [0.22, 0.22, 0.22],
      marker: { color: '#E59B2E', line: { color: '#B87514', width: 1.5 } },
      text: [`${currentN} kg/ha`, `${currentP} kg/ha`, `${currentK} kg/ha`],
      textposition: 'auto',
      hoverinfo: 'x+y+name'
    };

    const layout = {
      barmode: 'group',
      bargap: 0.35,
      bargroupgap: 0.12,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { family: 'Plus Jakarta Sans, sans-serif', color: '#1A2C22', size: 12 },
      margin: { t: 40, r: 24, l: 60, b: 65 },
      dragmode: false,
      hovermode: 'closest',
      yaxis: {
        title: { text: 'Nutrient (kg/ha)', standoff: 10, font: { size: 12, weight: 600 } },
        gridcolor: '#ECE7DD',
        range: [0, Math.ceil(maxY * 1.25)],
        fixedrange: true,
        zeroline: true,
        zerolinecolor: '#D4CBBF'
      },
      xaxis: {
        type: 'category',
        categoryorder: 'array',
        categoryarray: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
        gridcolor: 'transparent',
        fixedrange: true,
        tickfont: { size: 12, weight: 600, family: 'Plus Jakarta Sans, sans-serif', color: '#1A2C22' }
      },
      legend: {
        orientation: 'h',
        x: 0,
        y: 1.16,
        font: { size: 12, family: 'Plus Jakarta Sans, sans-serif' }
      }
    };

    try {
      window.Plotly.newPlot(chartDiv, [trace1, trace2], layout, {
        responsive: true,
        displayModeBar: false,
        staticPlot: false,
        scrollZoom: false,
        doubleClick: false
      });
    } catch (chartErr) {
      console.warn('Plotly error, falling back to SVG chart:', chartErr);
      renderFertSvgFallback(chartDiv, targetN, targetP, targetK, currentN, currentP, currentK);
    }
  }

  // Chart Toggle Buttons (Bar Comparison vs 3D WebGL)
  const btnChartBar = document.getElementById('btn-chart-bar');
  const btnChart3d = document.getElementById('btn-chart-3d');

  if (btnChartBar) {
    btnChartBar.addEventListener('click', () => {
      btnChartBar.classList.add('active');
      if (btnChart3d) btnChart3d.classList.remove('active');
      state.activeChartMode = 'bar';
      if (state.lastFertData) renderFertPlotlyChart(state.lastFertData, 'bar');
    });
  }

  if (btnChart3d) {
    btnChart3d.addEventListener('click', () => {
      btnChart3d.classList.add('active');
      if (btnChartBar) btnChartBar.classList.remove('active');
      state.activeChartMode = '3d';
      if (state.lastFertData) renderFertPlotlyChart(state.lastFertData, '3d');
    });
  }

  // Window resize handler for Plotly
  let fertResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(fertResizeTimer);
    fertResizeTimer = setTimeout(() => {
      if (window.Plotly && document.getElementById('fert-plotly-chart') && state.lastFertData) {
        window.Plotly.Plots.resize('fert-plotly-chart');
      }
    }, 120);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 8. DISEASE DOCTOR
  // ─────────────────────────────────────────────────────────────────────────
  async function searchDiseases() {
    const crop = doctorCropSelect ? doctorCropSelect.value : '';
    const q = doctorSearchInput ? doctorSearchInput.value.trim() : '';

    try {
      let res = await apiFetch(`/api/diseases?crop=${encodeURIComponent(crop)}&keyword=${encodeURIComponent(q)}&symptom=${encodeURIComponent(q)}&q=${encodeURIComponent(q)}`);
      if (res && res.ok) {
        let data = await res.json();
        if (data && data.success && Array.isArray(data.diseases) && data.diseases.length > 0) {
          renderDiseases(data);
          return;
        }
      }
    } catch (e) {
      console.warn('Disease server search error, falling back to embedded database:', e);
    }

    // Always fallback to complete embedded ICAR database
    const localData = searchDiseasesLocal(crop, q);
    renderDiseases(localData);
  }

  if (btnSearchDisease) btnSearchDisease.addEventListener('click', searchDiseases);
  if (doctorCropSelect) doctorCropSelect.addEventListener('change', searchDiseases);
  if (doctorSearchInput) {
    doctorSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') searchDiseases();
    });
  }

  document.querySelectorAll('.symptom-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const kw = chip.dataset.keyword;
      const isAct = chip.classList.contains('active');
      document.querySelectorAll('.symptom-chip').forEach(c => c.classList.remove('active'));
      if (isAct) {
        doctorSearchInput.value = '';
      } else {
        chip.classList.add('active');
        doctorSearchInput.value = kw;
      }
      searchDiseases().then(() => {
        if (!isAct && diseaseResultsContainer) {
          diseaseResultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
  });

    function renderDiseases(data) {
    if (!diseaseResultsContainer) return;
    state.lastDiseaseData = data;
    diseaseResultsContainer.innerHTML = '';

    const lang = state.language || 'hi';
    const t = TRANSLATIONS[lang] || TRANSLATIONS['hi'];

    if (data.outbreak_risk && data.outbreak_risk.length > 0 && doctorRiskBanner) {
      doctorRiskBanner.classList.remove('is-hidden');
      if (riskCropName) {
        const cObj = CROP_NAME_I18N[(data.crop || '').toLowerCase()];
        riskCropName.textContent = cObj ? (cObj[lang] || cObj['en']) : (data.crop || 'Monitored Crop');
      }
      if (riskItemsList) {
        riskItemsList.innerHTML = data.outbreak_risk.map(r => `
          <div class="risk-warning-item">
            • <strong>${r.disease}:</strong> ${r.risk_reason} (${r.risk_level} Risk)
          </div>
        `).join('');
      }
    } else if (doctorRiskBanner) {
      doctorRiskBanner.classList.add('is-hidden');
    }

    if (!data.diseases || data.diseases.length === 0) {
      diseaseResultsContainer.innerHTML = `
        <div class="no-pathogens-box">
          <div class="no-pathogens-icon">🩺</div>
          <h4 class="no-pathogens-title">${t.noPathogensTitle}</h4>
          <p>${t.noPathogensDesc}</p>
        </div>
      `;
      return;
    }

    data.diseases.forEach(d => {
      const card = document.createElement('div');
      card.className = 'disease-card';
      const loc = getLocalizedDisease(d, lang);

      card.innerHTML = `
        <div class="disease-header">
          <div>
            <div class="disease-name">${loc.name}</div>
            <span class="disease-crop-tag">🌱 ${loc.cropTag}</span>
          </div>
          <span class="badge-coral">${loc.pathTag}</span>
        </div>
        <div class="disease-section">
          <h5>${t.diagSymptoms}</h5>
          <p>${loc.symptoms}</p>
        </div>
        <div class="disease-section">
          <h5>${t.bioControl}</h5>
          <p>${loc.bioText}</p>
        </div>
        <div class="disease-section">
          <h5>${t.chemControl}</h5>
          <p>${loc.chemText}</p>
        </div>
        <div class="card-action-bar">
          <button type="button" class="btn-voice-readout btn-voice-disease">${t.listenBtnText}</button>
          <button type="button" class="btn-whatsapp-share btn-whatsapp-disease">${t.shareBtnText}</button>
        </div>
      `;

      // Voice readout for disease
      const vBtn = card.querySelector('.btn-voice-disease');
      if (vBtn) {
        const readout = lang === 'en'
          ? `Disease: ${loc.name}. Symptoms: ${loc.symptoms}. Treatment: ${loc.speechChem}.`
          : (lang === 'mr'
            ? `रोग: ${loc.name}. लक्षणे: ${loc.symptoms}. उपचार: ${loc.speechChem}.`
            : `रोग: ${loc.name}. लक्षण: ${loc.symptoms}. उपचार: ${loc.speechChem}.`);
        vBtn.onclick = () => toggleSpeech(readout, vBtn);
      }

      // WhatsApp share
      const waBtn = card.querySelector('.btn-whatsapp-disease');
      if (waBtn) {
        const waText = `🩺 *${loc.name}*
🌱 Crop: ${loc.cropTag}
🔬 Type: ${loc.pathTag}

*Symptoms:*
${loc.symptoms.substring(0, 180)}...

*Control:* ${loc.speechChem}`;
        waBtn.onclick = () => shareOnWhatsApp(loc.name, waText);
      }

      diseaseResultsContainer.appendChild(card);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 9. INDIAN SOIL REGISTRY
  // ─────────────────────────────────────────────────────────────────────────
  async function loadSoilStateProfile(stateName) {
    if (!statePlaceholder || !stateContent) return;
    try {
      statePlaceholder.classList.remove('is-hidden');
      stateContent.classList.add('is-hidden');

      const res = await apiFetch(`/api/soil-profile?state=${encodeURIComponent(stateName)}`);
      if (res && res.ok) {
        const data = await res.json();
        if (data && data.success && data.profile) {
          renderStateSoilProfile(data.state || stateName, data.profile);
          return;
        }
      }
    } catch (e) {
      console.warn('Soil profile server fetch error, using embedded database:', e);
    }

    // Embedded database fallback
    const localProfile = INDIAN_SOIL_PROFILES[stateName] || INDIAN_SOIL_PROFILES['Maharashtra'];
    if (localProfile) {
      renderStateSoilProfile(stateName, localProfile);
    }
  }

  const SOIL_PROFILE_I18N = {
    dominantSoil: {
      en: 'Dominant Soil', hi: 'प्रमुख मृदा', mr: 'प्रमुख जमीन', pa: 'ਮੁੱਖ ਮਿੱਟੀ', gu: 'મુખ્ય જમીન', te: 'ప్రధాన నేల', ta: 'முக்கிய மண்', bn: 'প্রধান মাটি', kn: 'ಪ್ರಮುಖ ಮಣ್ಣು'
    },
    nStatus: {
      en: 'Nitrogen Status', hi: 'नाइट्रोजन स्थिति (N)', mr: 'नत्र प्रमाण (N)', pa: 'ਨਾਈਟ੍ਰੋਜਨ ਸਥਿਤੀ (N)', gu: 'નાઇટ્રોજન સ્થિતિ (N)', te: 'నత్రజని స్థితి (N)', ta: 'நைட்ரஜன் நிலை (N)', bn: 'নাইট্রোজেন স্থিতি (N)', kn: 'ಸಾರಜನಕ ಸ್ಥಿತಿ (N)'
    },
    pStatus: {
      en: 'Phosphorus Status', hi: 'फास्फोरस स्थिति (P)', mr: 'स्फुरद प्रमाण (P)', pa: 'ਫਾਸਫੋਰਸ ਸਥਿਤੀ (P)', gu: 'ફોસ્ફરસ સ્થિતિ (P)', te: 'భాస్వరం స్థితి (P)', ta: 'பாஸ்பரஸ் நிலை (P)', bn: 'ফসফরাস স্থিতি (P)', kn: 'ರಂಜಕ ಸ್ಥಿತಿ (P)'
    },
    kStatus: {
      en: 'Potassium Status', hi: 'पोटाश स्थिति (K)', mr: 'पालाश प्रमाण (K)', pa: 'ਪੋਟਾਸ਼ ਸਥਿਤੀ (K)', gu: 'પોટાશ સ્થિતિ (K)', te: 'పొటాషియం స్థితి (K)', ta: 'பொட்டாசியம் நிலை (K)', bn: 'পটাসিয়াম স্থিতি (K)', kn: 'ಪೊಟ್ಯಾಶಿಯಂ ಸ್ಥಿತಿ (K)'
    },
    ocStatus: {
      en: 'Organic Carbon', hi: 'जैविक कार्बन (OC)', mr: 'सेंद्रिय कर्ब (OC)', pa: 'ਜੈਵਿਕ ਕਾਰਬਨ (OC)', gu: 'સેન્દ્રિય કાર્બન (OC)', te: 'సేంద్రీయ కర్బనం (OC)', ta: 'கரிம கார்பன் (OC)', bn: 'জৈব কার্বন (OC)', kn: 'ಸಾವಯವ ಇಂಗಾಲ (OC)'
    },
    recCropsTitle: {
      en: '🌾 Recommended Staple & Commercial Crops:',
      hi: '🌾 अनुशंसित मुख्य एवं वाणिज्यिक फसलें:',
      mr: '🌾 शिफारस केलेली मुख्य व नगदी पिके:',
      pa: '🌾 ਸਿਫਾਰਸ਼ ਕੀਤੀਆਂ ਮੁੱਖ ਅਤੇ ਵਪਾਰਕ ਫਸਲਾਂ:',
      gu: '🌾 ભલામણ કરેલ મુખ્ય અને રોકડિયા પાકો:',
      te: '🌾 సిఫార్సు చేయబడిన ప్రధాన & వాణిజ్య పంటలు:',
      ta: '🌾 பரிந்துரைக்கப்பட்ட முக்கிய மற்றும் பணப்பயிர்கள்:',
      bn: '🌾 প্রস্তাবিত প্রধান ও অর্থকরী ফসল:',
      kn: '🌾 ಶಿಫಾರಸು ಮಾಡಿದ ಮುಖ್ಯ ಮತ್ತು ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು:'
    },
    sauAdvisoryTitle: {
      en: '🏛️ State Agricultural University (SAU) Fertilizer Advisory:',
      hi: '🏛️ राज्य कृषि विश्वविद्यालय (SAU) उर्वरक परामर्श:',
      mr: '🏛️ राज्य कृषी विद्यापीठ (SAU) खत सल्ला:',
      pa: '🏛️ ਰਾਜ ਖੇਤੀਬਾੜੀ ਯੂਨੀਵਰਸਿਟੀ (SAU) ਖਾਦ ਸਲਾਹ:',
      gu: '🏛️ રાજ્ય કૃષિ યુનિવર્સિટી (SAU) ખાતર માર્ગદર્શન:',
      te: '🏛️ రాష్ట్ర వ్యవసాయ విశ్వవిద్యాలయ (SAU) ఎరువుల సలహా:',
      ta: '🏛️ மாநில வேளாண் பல்கலைக்கழக (SAU) உர ஆலோசனை:',
      bn: '🏛️ রাজ্য কৃষি বিশ্ববিদ্যালয় (SAU) সার সংক্রান্ত পরামর্শ:',
      kn: '🏛️ ರಾಜ್ಯ ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯ (SAU) ಗೊಬ್ಬರ ಸಲಹೆ:'
    },
    benchmarkTag: {
      en: 'ICAR-IISS Benchmark', hi: 'ICAR-IISS मानक', mr: 'ICAR-IISS मानक', pa: 'ICAR-IISS ਮਾਪਦੰਡ', gu: 'ICAR-IISS માપદંડ', te: 'ICAR-IISS ప్రమాణం', ta: 'ICAR-IISS தரநிலை', bn: 'ICAR-IISS মানদণ্ড', kn: 'ICAR-IISS ಮಾನದಂಡ'
    },
    criticalAlert: {
      en: '⚠️ Critical Micronutrient Alerts:', hi: '⚠️ महत्वपूर्ण सूक्ष्म पोषक तत्व चेतावनी:', mr: '⚠️ महत्त्वाचे सूक्ष्मअन्नद्रव्य सूचना:', pa: '⚠️ ਮਹੱਤਵਪੂਰਨ ਸੂਖਮ ਪੌਸ਼ਟਿਕ ਚੇਤਾਵਨੀਆਂ:', gu: '⚠️ મહત્વપૂર્ણ સૂક્ષ્મ પોષકતત્વ ચેતવણી:', te: '⚠️ క్లిష్టమైన సూక్ష్మపోషకాల హెచ్చరికలు:', ta: '⚠️ முக்கியமான நுண்ணூட்டச்சத்து எச்சரிக்கைகள்:', bn: '⚠️ গুরুত্বপূর্ণ অণুখাদ্য সতর্কতা:', kn: '⚠️ ಪ್ರಮುಖ ಲಘು ಪೋಷಕಾಂಶಗಳ ಎಚ್ಚರಿಕೆಗಳು:'
    },
    statusLow: { en: 'Low', hi: 'कम', mr: 'कमी', pa: 'ਘੱਟ', gu: 'ઓછું', te: 'తక్కువ', ta: 'குறைவு', bn: 'কম', kn: 'ಕಡಿಮೆ' },
    statusMedium: { en: 'Medium', hi: 'मध्यम', mr: 'मध्यम', pa: 'ਦਰਮਿਆਨਾ', gu: 'મધ્યમ', te: 'మధ్యస్థం', ta: 'நடுத்தரம்', bn: 'মাঝারি', kn: 'ಮಧ್ಯಮ' },
    statusHigh: { en: 'High', hi: 'उच्च', mr: 'जास्त / उच्च', pa: 'ਵੱਧ', gu: 'વધારે / ઉચ્ચ', te: 'ఎక్కువ', ta: 'அதிகம்', bn: 'উচ্চ', kn: 'ಹೆಚ್ಚು' },
    statusLowToMed: { en: 'Low to Medium', hi: 'कम से मध्यम', mr: 'कमी ते मध्यम', pa: 'ਘੱਟ ਤੋਂ ਦਰਮਿਆਨਾ', gu: 'ઓછાથી મધ્યમ', te: 'తక్కువ నుండి మధ్యస్థం', ta: 'குறைவு முதல் நடுத்தரம்', bn: 'কম থেকে মাঝারি', kn: 'ಕಡಿಮೆಯಿಂದ ಮಧ್ಯಮ' },
    statusMedToHigh: { en: 'Medium to High', hi: 'मध्यम से उच्च', mr: 'मध्यम ते उच्च', pa: 'ਦਰਮਿਆਨੇ ਤੋਂ ਵੱਧ', gu: 'મધ્યમથી વધારે', te: 'మధ్యస్థం నుండి ఎక్కువ', ta: 'நடுத்தரத்திலிருந்து அதிகம்', bn: 'মাঝারি থেকে উচ্চ', kn: 'ಮಧ್ಯಮದಿಂದ ಹೆಚ್ಚು' },
    sauDefault: {
      en: 'Balanced NPK application with FYM and Micronutrient zinc enhancement based on local ICAR Soil Testing recommendations.',
      hi: 'स्थानीय ICAR मृदा परीक्षण सिफारिशों के आधार पर गोबर की खाद (FYM) और सूक्ष्म पोषक जिंक के साथ संतुलित NPK का प्रयोग करें।',
      mr: 'स्थानिक ICAR माती परीक्षण शिफारशींनुसार शेणखत (FYM) आणि सूक्ष्मअन्नद्रव्य झिंकसह संतुलित NPK खतांचा वापर करा.',
      pa: 'ਸਥਾਨਕ ICAR ਮਿੱਟੀ ਟੈਸਟਿੰਗ ਸਿਫਾਰਸ਼ਾਂ ਦੇ ਆਧਾਰ ਤੇ ਰੂੜੀ ਖਾਦ (FYM) ਅਤੇ ਸੂਖਮ ਪੌਸ਼ਟਿਕ ਜਿੰਕ ਨਾਲ ਸੰਤੁਲਿਤ NPK ਦੀ ਵਰਤੋਂ ਕਰੋ।',
      gu: 'સ્થાનિક ICAR જમીન ચકાસણી ભલામણો મુજબ છાણીયા ખાતર (FYM) અને સૂક્ષ્મ પોષકતત્વ ઝિંક સાથે સંતુલિત NPK ખાતરો આપો.',
      te: 'స్థానిక ICAR నేల పరీక్ష సిఫార్సుల ఆధారంగా పశువుల ఎరువు (FYM) మరియు జింక్ సూక్ష్మపోషకాలతో సమతుల్య NPK ఎరువులను వాడండి.',
      ta: 'உள்ளூர் ICAR மண் பரிசோதனை பரிந்துரைகளின் அடிப்படையில் தொழுஉரம் (FYM) மற்றும் துத்தநாக நுண்ணூட்டச்சத்துடன் சீரான NPK இடுங்கள்.',
      bn: 'স্থানীয় ICAR মাটি পরীক্ষার সুপারিশ অনুসারে গোবর সার (FYM) এবং জিঙ্ক অণুখাদ্যের সাথে সুষম NPK সার প্রয়োগ করুন।',
      kn: 'ಸ್ಥಳೀಯ ICAR ಮಣ್ಣು ಪರೀಕ್ಷಾ ಶಿಫಾರಸುಗಳ ಆಧಾರದ ಮೇಲೆ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ (FYM) ಮತ್ತು ಸತು ಲಘು ಪೋಷಕಾಂಶಗಳೊಂದಿಗೆ ಸಮತೋಲಿತ NPK ಬಳಸಿ.'
    }
  };

  function renderStateSoilProfile(name, p) {
    if (!stateContent || !statePlaceholder) return;
    state.lastSoilStateProfile = { name, p };
    statePlaceholder.classList.add('is-hidden');
    stateContent.classList.remove('is-hidden');

    const lang = state.language || 'hi';
    const baseSoil = p.baseline_soil || p.baseline_soil_test || {};
    const dominantSoil = p.soil_type || p.dominant_soil_types || 'Medium Black & Alluvial Loam';
    const zoneSubtitle = p.zone_name ? ` (${p.zone_name})` : '';

    const localizeStatus = (st) => {
      const s = (st || '').toLowerCase();
      if (s.includes('low to med')) return SOIL_PROFILE_I18N.statusLowToMed[lang] || st;
      if (s.includes('med to high')) return SOIL_PROFILE_I18N.statusMedToHigh[lang] || st;
      if (s.includes('low')) return SOIL_PROFILE_I18N.statusLow[lang] || st;
      if (s.includes('high')) return SOIL_PROFILE_I18N.statusHigh[lang] || st;
      if (s.includes('med')) return SOIL_PROFILE_I18N.statusMedium[lang] || st;
      return st;
    };

    // Status levels & numerical values
    const rawNStatus = baseSoil.nitrogen_status || (baseSoil.nitrogen < 110 ? 'Low' : (baseSoil.nitrogen > 150 ? 'High' : 'Medium'));
    const rawPStatus = baseSoil.phosphorus_status || (baseSoil.phosphorus < 30 ? 'Low' : (baseSoil.phosphorus > 50 ? 'High' : 'Low to Medium'));
    const rawKStatus = baseSoil.potassium_status || (baseSoil.potassium < 140 ? 'Low' : (baseSoil.potassium > 220 ? 'High' : 'Medium to High'));

    const nVal = baseSoil.nitrogen !== undefined ? `${baseSoil.nitrogen} kg/ha` : (localizeStatus(rawNStatus));
    const pVal = baseSoil.phosphorus !== undefined ? `${baseSoil.phosphorus} kg/ha` : (localizeStatus(rawPStatus));
    const kVal = baseSoil.potassium !== undefined ? `${baseSoil.potassium} kg/ha` : (localizeStatus(rawKStatus));
    const ocVal = baseSoil.organic_carbon_pct !== undefined ? `${baseSoil.organic_carbon_pct}%` : (baseSoil.organic_carbon || '0.50%');
    const phVal = baseSoil.ph !== undefined ? ` • pH ${baseSoil.ph}` : '';

    const nStatus = localizeStatus(rawNStatus);
    const pStatus = localizeStatus(rawPStatus);
    const kStatus = localizeStatus(rawKStatus);

    // Localized Primary Crops
    let cropsList = '';
    if (Array.isArray(p.primary_crops) && p.primary_crops.length > 0) {
      cropsList = p.primary_crops.map(c => {
        const cKey = (c || '').toLowerCase().trim();
        const cObj = CROP_NAME_I18N[cKey];
        return cObj ? (cObj[lang] || cObj['hi'] || cObj['en']) : (c.charAt(0).toUpperCase() + c.slice(1));
      }).join(', ');
    } else {
      cropsList = p.staple_crops || 'Paddy, Wheat, Sugarcane, Pulses';
    }

    // Fertilizer Advisory / SAU recommendations
    let sauAdvisory = '';
    if (Array.isArray(p.management_tips) && p.management_tips.length > 0) {
      sauAdvisory = p.management_tips.join(' • ');
    } else if (p.sau_advisory) {
      sauAdvisory = p.sau_advisory;
    } else {
      sauAdvisory = SOIL_PROFILE_I18N.sauDefault[lang] || SOIL_PROFILE_I18N.sauDefault['en'];
    }

    // Micronutrient deficiencies if present
    let microDef = '';
    if (Array.isArray(p.micronutrient_deficiencies) && p.micronutrient_deficiencies.length > 0) {
      const alertTitle = SOIL_PROFILE_I18N.criticalAlert[lang] || '⚠️ Critical Micronutrient Alerts:';
      microDef = `<div class="why-fits-callout" style="background:#FFF9E6; border-left:4px solid #E59B2E; margin-bottom:12px; padding:10px 14px; border-radius:8px; font-size:12.5px;">${alertTitle} ${p.micronutrient_deficiencies.join(' | ')}</div>`;
    }

    const lblDominant = SOIL_PROFILE_I18N.dominantSoil[lang] || 'Dominant Soil';
    const lblBench = SOIL_PROFILE_I18N.benchmarkTag[lang] || 'ICAR-IISS Benchmark';
    const lblN = SOIL_PROFILE_I18N.nStatus[lang] || 'Nitrogen Status';
    const lblP = SOIL_PROFILE_I18N.pStatus[lang] || 'Phosphorus Status';
    const lblK = SOIL_PROFILE_I18N.kStatus[lang] || 'Potassium Status';
    const lblOC = SOIL_PROFILE_I18N.ocStatus[lang] || 'Organic Carbon';
    const titleCrops = SOIL_PROFILE_I18N.recCropsTitle[lang] || '🌾 Recommended Staple & Commercial Crops:';
    const titleSau = SOIL_PROFILE_I18N.sauAdvisoryTitle[lang] || '🏛️ State Agricultural University (SAU) Fertilizer Advisory:';

    stateContent.innerHTML = `
      <div class="card state-profile-card">
        <div class="state-profile-header">
          <div>
            <h3 class="state-profile-title">${name}</h3>
            <span class="state-dominant-soil">${lblDominant}: ${dominantSoil}${zoneSubtitle}${phVal}</span>
          </div>
          <span class="choice-star-badge">${lblBench}</span>
        </div>

        <div class="state-metrics-grid">
          <div class="stat-card">
            <span class="stat-label">${lblN}</span>
            <div class="stat-value state-stat-value">${nVal}</div>
            <span class="stat-sub">${nStatus}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">${lblP}</span>
            <div class="stat-value state-stat-value">${pVal}</div>
            <span class="stat-sub">${pStatus}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">${lblK}</span>
            <div class="stat-value state-stat-value">${kVal}</div>
            <span class="stat-sub">${kStatus}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">${lblOC}</span>
            <div class="stat-value state-stat-value">${ocVal}</div>
            <span class="stat-sub">${baseSoil.ph ? 'pH ' + baseSoil.ph : 'Optimal'}</span>
          </div>
        </div>

        ${microDef}

        <div class="why-fits-callout state-callout-crops">
          <strong class="state-crops-title">${titleCrops}</strong>
          <p class="state-crops-body">${cropsList}</p>
        </div>

        <div class="why-fits-callout state-callout-sau">
          <strong class="state-sau-title">${titleSau}</strong>
          <p class="state-sau-body">${sauAdvisory}</p>
        </div>
      </div>
    `;
  }

  if (stateDropdown) {
    stateDropdown.addEventListener('change', () => {
      if (stateDropdown.value) {
        loadSoilStateProfile(stateDropdown.value);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 10. BOOTSTRAP INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────────────────
  // 10. SEARCH HISTORY & WELCOME OPENING GATEWAY ENGINE
  // ─────────────────────────────────────────────────────────────────────────
  const HISTORY_STORAGE_KEY = 'sparc_search_history';
  const WELCOME_DISMISSED_KEY = 'sparc_welcome_dismissed';

  function showToast(message, icon = '✅') {
    const toast = document.getElementById('toast-notification');
    const msgEl = document.getElementById('toast-message');
    if (!toast || !msgEl) return;
    msgEl.textContent = message;
    const iconEl = toast.querySelector('.toast-icon');
    if (iconEl) iconEl.textContent = icon;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  function getSearchHistory() {
    try {
      // If user has explicitly cleared history or deleted records down to zero, respect it!
      if (localStorage.getItem('sparc_history_cleared') === '1') {
        const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
        return [];
      }

      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading search history:', e);
    }

    // Default pre-seeded demo records for first-time visitors
    return [
      {
        id: 'hist_seed_1',
        type: 'crop',
        typeName: 'Crop Advisory',
        icon: '🌾',
        title: 'Paddy / Rice (Indica Wet) • 94% Match',
        timestamp: Date.now() - 3600000,
        formattedTime: 'Today',
        inputs: {
          nitrogen: 92,
          phosphorus: 46,
          potassium: 44,
          ph: 6.8,
          temperature: 22.2,
          humidity: 75,
          rainfall: 210,
          target_crop: 'rice',
          state: 'Uttar Pradesh'
        },
        summary: 'Soil: N=92, P=46, K=44, pH=6.8 • Weather: 22.2°C, 210mm • Uttar Pradesh',
        details: 'Top Recommended: Paddy (94%), Jute (88%), Papaya (81%)'
      },
      {
        id: 'hist_seed_2',
        type: 'fert',
        typeName: 'Fertilizer Prescription',
        icon: '🧪',
        title: 'Urea: 49 kg/ha, DAP: 30 kg/ha, MOP: 27 kg/ha',
        timestamp: Date.now() - 7200000,
        formattedTime: 'Earlier Today',
        inputs: {
          nitrogen: 92,
          phosphorus: 46,
          potassium: 44,
          ph: 6.8,
          target_crop: 'RICE',
          state: 'Uttar Pradesh',
          land_size: 1.0,
          land_unit: 'acre'
        },
        summary: 'Target: Rice • 1.0 Acre • UP Baseline • NPK: 92-46-44',
        details: 'Prescription: 49 kg Urea, 30 kg DAP, 27 kg MOP with 3-stage split application'
      }
    ];
  }

  function saveSearchItem(item) {
    try {
      localStorage.removeItem('sparc_history_cleared');
      let history = getSearchHistory().filter(h => !h.id.startsWith('hist_seed_'));
      item.id = 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      item.timestamp = Date.now();
      const d = new Date(item.timestamp);
      item.formattedTime = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      history.unshift(item);
      if (history.length > 30) history.pop();
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
      updateHistoryUI();
    } catch (e) {
      console.warn('Error saving search history:', e);
    }
  }

  function deleteSearchItem(id) {
    try {
      let history = getSearchHistory().filter(h => h.id !== id);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
      localStorage.setItem('sparc_history_cleared', '1');

      // Animate card removal in DOM immediately
      document.querySelectorAll(`[data-id="${id}"]`).forEach(card => {
        card.style.transition = 'all 0.25s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateX(25px)';
      });

      setTimeout(() => {
        updateHistoryUI();
        showToast('Record deleted', '🗑️');
      }, 250);
    } catch (e) {
      console.warn('Error deleting history item:', e);
    }
  }

  function clearAllSearchHistory() {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem('sparc_history_cleared', '1');
      updateHistoryUI();
      showToast('All search history cleared', '🗑️');
    } catch (e) {
      console.warn('Error clearing history:', e);
    }
  }

  function restoreSearchItem(id) {
    const item = getSearchHistory().find(h => h.id === id);
    if (!item) return;

    if (item.type === 'crop') {
      const tabCrop = document.getElementById('tab-btn-crop');
      if (tabCrop) tabCrop.click();

      if (sliders.n && item.inputs.nitrogen !== undefined) {
        sliders.n.value = item.inputs.nitrogen;
        inputs.n.value = item.inputs.nitrogen;
      }
      if (sliders.p && item.inputs.phosphorus !== undefined) {
        sliders.p.value = item.inputs.phosphorus;
        inputs.p.value = item.inputs.phosphorus;
      }
      if (sliders.k && item.inputs.potassium !== undefined) {
        sliders.k.value = item.inputs.potassium;
        inputs.k.value = item.inputs.potassium;
      }
      if (sliders.ph && item.inputs.ph !== undefined) {
        sliders.ph.value = item.inputs.ph;
        inputs.ph.value = item.inputs.ph;
      }
      if (sliders.temp && item.inputs.temperature !== undefined) {
        sliders.temp.value = item.inputs.temperature;
        inputs.temp.value = item.inputs.temperature;
        if (displays.temp) displays.temp.textContent = Number(item.inputs.temperature).toFixed(1);
      }
      if (sliders.rain && item.inputs.rainfall !== undefined) {
        sliders.rain.value = item.inputs.rainfall;
        inputs.rain.value = item.inputs.rainfall;
        if (displays.rain) displays.rain.textContent = Math.round(item.inputs.rainfall);
      }
      const selectTargetCrop = document.getElementById('select-target-crop');
      if (selectTargetCrop && item.inputs.target_crop !== undefined) {
        selectTargetCrop.value = item.inputs.target_crop;
      }
      updateSoilSpectrum(Number(inputs.n.value), Number(inputs.p.value), Number(inputs.k.value), Number(inputs.ph.value));

      // Trigger predict
      const btnPredict = document.getElementById('btn-predict-crops');
      if (btnPredict) btnPredict.click();

      showToast(`🌾 Restored Crop Advisory inputs (${item.formattedTime})`);
    } else if (item.type === 'fert') {
      const tabFert = document.getElementById('tab-btn-fert');
      if (tabFert) tabFert.click();

      if (fertSliders.n && item.inputs.nitrogen !== undefined) fertSliders.n.value = item.inputs.nitrogen;
      if (fertSliders.p && item.inputs.phosphorus !== undefined) fertSliders.p.value = item.inputs.phosphorus;
      if (fertSliders.k && item.inputs.potassium !== undefined) fertSliders.k.value = item.inputs.potassium;
      if (fertSliders.ph && item.inputs.ph !== undefined) fertSliders.ph.value = item.inputs.ph;
      if (fertCropSelect && item.inputs.target_crop) fertCropSelect.value = item.inputs.target_crop.toLowerCase();
      if (fertStateSelect && item.inputs.state) fertStateSelect.value = item.inputs.state;

      const landSizeInput = document.getElementById('input-fert-land-size');
      const landUnitSelect = document.getElementById('select-fert-land-unit');
      if (landSizeInput && item.inputs.land_size) landSizeInput.value = item.inputs.land_size;
      if (landUnitSelect && item.inputs.land_unit) landUnitSelect.value = item.inputs.land_unit;

      const fertForm = document.getElementById('fert-form');
      if (fertForm) {
        fertForm.dispatchEvent(new Event('submit'));
      }
      showToast(`🧪 Restored Fertilizer Prescription (${item.formattedTime})`);
    } else if (item.type === 'doctor') {
      const tabDoctor = document.getElementById('tab-btn-doctor');
      if (tabDoctor) tabDoctor.click();

      if (doctorCropSelect && item.inputs.crop !== undefined) doctorCropSelect.value = item.inputs.crop;
      if (doctorSearchInput && item.inputs.q !== undefined) doctorSearchInput.value = item.inputs.q;

      searchDiseases();
      showToast(`🩺 Restored Disease Doctor search (${item.formattedTime})`);
    }

    const histModal = document.getElementById('history-modal');
    if (histModal) histModal.classList.remove('open');
  }

  let activeHistoryFilter = 'all';

  function updateHistoryUI(filter = activeHistoryFilter) {
    activeHistoryFilter = filter;
    const lang = state.language || 'hi';
    const t = TRANSLATIONS[lang] || TRANSLATIONS['hi'];
    const history = getSearchHistory();
    const badgeEl = document.getElementById('history-badge-count');
    if (badgeEl) badgeEl.textContent = history.length;

    const filtered = filter === 'all' ? history : history.filter(h => h.type === filter);

    const renderCardHtml = (item) => {
      const badgeClass = item.type === 'crop' ? 'badge-crop' : (item.type === 'fert' ? 'badge-fert' : 'badge-doctor');
      return `
        <div class="history-item-card" data-id="${item.id}">
          <div class="history-item-header">
            <span class="history-item-badge ${badgeClass}">${item.icon} ${item.typeName}</span>
            <span class="history-item-time">${item.formattedTime}</span>
          </div>
          <div class="history-item-title">${item.title}</div>
          <div class="history-item-summary">${item.summary}</div>
          <div class="history-item-actions">
            <button type="button" class="btn-restore-history" data-action="restore" data-id="${item.id}">
              ${t.histRestoreBtn || '🔄 Restore & View Results'}
            </button>
            <button type="button" class="btn-delete-history-item" data-action="delete" data-id="${item.id}" title="Delete record">
              <span>🗑️</span> <span>${t.histDeleteBtn || 'Delete'}</span>
            </button>
          </div>
        </div>
      `;
    };

    // 1. Render in modal container
    const container = document.getElementById('history-items-container');
    if (container) {
      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="history-empty-state">
            <div class="history-empty-icon">📜</div>
            <h4>No Search Records Found</h4>
            <p>Run a crop recommendation, calculate fertilizer doses, or search plant pathology to build your farm history.</p>
          </div>
        `;
      } else {
        container.innerHTML = filtered.map(renderCardHtml).join('');
      }
    }

    // 2. Render in Subtab 3 inline container
    const inlineContainer = document.getElementById('inline-history-container');
    if (inlineContainer) {
      if (filtered.length === 0) {
        inlineContainer.innerHTML = `
          <div class="history-empty-state" style="grid-column: 1/-1;">
            <div class="history-empty-icon">📜</div>
            <h4>No Search Records Yet</h4>
            <p>Your recent field tests and advisory calculations will appear here automatically.</p>
          </div>
        `;
      } else {
        inlineContainer.innerHTML = filtered.map(renderCardHtml).join('');
      }
    }

    // Attach event listeners to all restore and delete buttons
    document.querySelectorAll('.btn-restore-history').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        restoreSearchItem(btn.dataset.id);
      };
    });

    document.querySelectorAll('.btn-delete-history-item').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        deleteSearchItem(btn.dataset.id);
      };
    });
  }

  // Hook history UI controls
  const btnHistoryToggle = document.getElementById('btn-history-toggle');
  const btnWelcomeHistory = document.getElementById('btn-welcome-history');
  const historyModal = document.getElementById('history-modal');
  const historyModalClose = document.getElementById('history-modal-close-btn');
  const btnClearHistory = document.getElementById('btn-clear-history');
  const btnClearHistoryInline = document.getElementById('btn-clear-history-inline');

  if (btnHistoryToggle && historyModal) {
    btnHistoryToggle.addEventListener('click', () => {
      updateHistoryUI();
      historyModal.classList.add('open');
    });
  }

  if (btnWelcomeHistory && historyModal) {
    btnWelcomeHistory.addEventListener('click', () => {
      updateHistoryUI();
      historyModal.classList.add('open');
    });
  }

  if (historyModalClose && historyModal) {
    historyModalClose.addEventListener('click', () => {
      historyModal.classList.remove('open');
    });
  }

  const calendarModalClose = document.getElementById('calendar-modal-close-btn');
  const calendarModal = document.getElementById('calendar-modal');
  if (calendarModalClose && calendarModal) {
    calendarModalClose.addEventListener('click', () => {
      closeCropCalendarModal();
    });
    calendarModal.addEventListener('click', (e) => {
      if (e.target === calendarModal) closeCropCalendarModal();
    });
  }

  if (historyModal) {
    historyModal.addEventListener('click', (e) => {
      if (e.target === historyModal) historyModal.classList.remove('open');
    });
  }

  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', clearAllSearchHistory);
  }
  if (btnClearHistoryInline) {
    btnClearHistoryInline.addEventListener('click', clearAllSearchHistory);
  }

  // Filter chips in history modal
  document.querySelectorAll('.history-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.history-filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      updateHistoryUI(chip.dataset.filter);
    });
  });

  // Welcome Gateway interactions
  const welcomeCard = document.getElementById('welcome-gateway-card');
  const btnWelcomeStart = document.getElementById('btn-welcome-start');
  const btnWelcomeMinimize = document.getElementById('btn-welcome-minimize');
  const btnWelcomeToggle = document.getElementById('btn-welcome-toggle');

  if (btnWelcomeStart) {
    btnWelcomeStart.addEventListener('click', () => {
      const tabCrop = document.getElementById('tab-btn-crop');
      if (tabCrop) tabCrop.click();
      const fieldCard = document.querySelector('.field-diagnostics-card');
      if (fieldCard) fieldCard.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (btnWelcomeMinimize && welcomeCard) {
    btnWelcomeMinimize.addEventListener('click', () => {
      welcomeCard.classList.add('is-minimized');
      localStorage.setItem(WELCOME_DISMISSED_KEY, '1');
      showToast('Welcome guide hidden. Click "Guide" in the top bar to reopen.', 'ℹ️');
    });
  }

  if (btnWelcomeToggle && welcomeCard) {
    btnWelcomeToggle.addEventListener('click', () => {
      welcomeCard.classList.toggle('is-minimized');
      if (!welcomeCard.classList.contains('is-minimized')) {
        welcomeCard.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Welcome Pillar cards click to jump
  document.querySelectorAll('.welcome-pillar-item').forEach(pillar => {
    pillar.addEventListener('click', () => {
      const targetTab = pillar.dataset.jumpTab;
      const navBtn = document.querySelector(`.nav-tab[data-tab="${targetTab}"]`);
      if (navBtn) navBtn.click();
      const targetSection = document.getElementById(targetTab);
      if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
    });
  });


  async function initApp() {
    try { applyLanguage(state.language); } catch (e) { console.warn('applyLanguage error:', e); }
    try { updateSoilSpectrum(92, 46, 44, 6.8); } catch (e) { console.warn('updateSoilSpectrum error:', e); }
    // 1. Initialize Crops from embedded dataset immediately
    const initialCrops = EMBEDDED_CROPS || ['rice', 'wheat', 'maize', 'cotton', 'sugarcane', 'jute', 'chickpea'];
    state.crops = initialCrops;
    populateTargetCrops(state.language);
    if (fertCropSelect) {
      fertCropSelect.innerHTML = initialCrops.map(c => `<option value="${c}">${c.toUpperCase()}</option>`).join('');
      fertCropSelect.value = 'rice';
    }
    if (doctorCropSelect) {
      doctorCropSelect.innerHTML = `<option value="">All Supported Crops</option>` + initialCrops.map(c => `<option value="${c}">${c.toUpperCase()}</option>`).join('');
    }

    // 2. Initialize Indian Soil States from embedded dataset immediately
    const initialStates = INDIAN_SOIL_STATES || ['Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal'];
    state.indianStates = initialStates;
    if (stateDropdown) {
      stateDropdown.innerHTML = initialStates.map(s => `<option value="${s}">${s}</option>`).join('');
      stateDropdown.value = 'Maharashtra';
    }
    if (fertStateSelect) {
      fertStateSelect.innerHTML = `<option value="">Maharashtra (MPKV Rahuri)</option>` + initialStates.map(s => `<option value="${s}">${s}</option>`).join('');
    }
    loadSoilStateProfile('Maharashtra');

    // Asynchronously try live API refresh in background
    try {
      apiFetch('/api/crops').then(r => r.json()).then(data => {
        if (data && data.crops) {
          state.crops = data.crops;
          populateTargetCrops(state.language);
        }
      }).catch(() => {});

      apiFetch('/api/soil-states').then(r => r.json()).then(data => {
        if (data && data.states && stateDropdown) {
          state.indianStates = data.states;
          stateDropdown.innerHTML = data.states.map(s => `<option value="${s}">${s}</option>`).join('');
          stateDropdown.value = 'Maharashtra';
        }
      }).catch(() => {});
    } catch (e) {
      // Ignore background refresh errors
    }

    // 3. Search initial disease pathology
    searchDiseases();

    // 4. Initial default recommendations bootstrap so Matrix works immediately on click
    const initialRecData = {
      success: true,
      recommendations: [
        {
          rank: 1,
          crop: 'rice',
          confidence: 94.0,
          profile: {
            cycle_days: '120 – 135 Days',
            water_demand: 'High (Canal / Submerged)',
            economic_outlook: '₹2,300 – ₹2,550 (MSP Protected)',
            benefits: ['Optimal tillering under monsoon rainfall', 'High nitrogen assimilation capacity']
          }
        },
        {
          rank: 2,
          crop: 'jute',
          confidence: 88.5,
          profile: {
            cycle_days: '120 – 150 Days',
            water_demand: 'High (Standing water tolerance)',
            economic_outlook: '₹4,800 – ₹5,200 per quintal',
            benefits: ['Fast biomass generation', 'High fiber tensile strength']
          }
        },
        {
          rank: 3,
          crop: 'papaya',
          confidence: 81.2,
          profile: {
            cycle_days: '8 – 10 Months',
            water_demand: 'Moderate (Drip / Furrow)',
            economic_outlook: '₹18 – ₹28 per kg wholesale',
            benefits: ['Continuous harvesting yield', 'High market liquidity']
          }
        }
      ]
    };
    state.lastRecommendationsData = initialRecData;
    try { renderAgronomicMatrix(initialRecData); } catch (e) { console.warn('renderAgronomicMatrix init error:', e); }

    // 5. Pre-calculate default ICAR fertilizer doses so farmers see active, non-zero commercial bags immediately
    const defaultFertPayload = {
      nitrogen: 92,
      phosphorus: 46,
      potassium: 44,
      ph: 6.8,
      target_crop: 'rice',
      state: 'Maharashtra'
    };
    try {
      const defaultFertData = calculateFertilizersLocal(defaultFertPayload);
      renderFertilizers(defaultFertData, true);
    } catch (e) {
      console.warn('default fert calc error:', e);
    }

    // 6. Auto-Detect Weather & Field Location (GPS / IP Telemetry)
    try { autoDetectWeather(false); } catch (e) { console.warn('autoDetectWeather error:', e); }
    // 7. Initialize Past Season Records (Top 5 Crops) & Search History UI
    try {
      renderPastSeasonRecords('all');
      fetchPastSeasonRecords();
      // Past Season Filter Chips
      document.querySelectorAll('#past-season-crop-filter button').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#past-season-crop-filter button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderPastSeasonRecords(btn.dataset.crop || 'all');
        });
      });
    } catch (e) {
      console.warn('Past season init error:', e);
    }
    // 8. Initialize Search History UI & Seed Data
    try { updateHistoryUI(); } catch (e) { console.warn('updateHistoryUI error:', e); }

    // Check if user previously dismissed welcome card
    if (localStorage.getItem(WELCOME_DISMISSED_KEY) === '1') {
      const wc = document.getElementById('welcome-gateway-card');
      if (wc) wc.classList.add('is-minimized');
    }

    // 7. Initialize Opening Sequence Loading Splash Screen (5-second calibration)
    initOpeningSequence();

  }

  initApp();
});