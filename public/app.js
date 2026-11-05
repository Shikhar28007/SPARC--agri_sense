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

    state.currentCity = city;
    state.currentZone = zone;

    if (sliders.temp) {
      sliders.temp.value = temp;
      if (displays.temp) displays.temp.textContent = temp;
      if (telemetryTemp) telemetryTemp.textContent = `${temp}°C`;
    }

    if (sliders.rain) {
      sliders.rain.value = rain;
      if (displays.rain) displays.rain.textContent = rain;
      if (zoneMonsoonText) zoneMonsoonText.textContent = `${rain} mm`;
    }

    if (inputs.n && sliders.n) {
      inputs.n.value = n;
      sliders.n.value = n;
      if (displays.n) displays.n.textContent = n;
      updateNutrientStatusPill('n', n);
    }

    if (inputs.p && sliders.p) {
      inputs.p.value = p;
      sliders.p.value = p;
      if (displays.p) displays.p.textContent = p;
      updateNutrientStatusPill('p', p);
    }

    if (inputs.k && sliders.k) {
      inputs.k.value = k;
      sliders.k.value = k;
      if (displays.k) displays.k.textContent = k;
      updateNutrientStatusPill('k', k);
    }

    if (zoneLabel) {
      zoneLabel.textContent = `Agro-Climatic Zone: ${zone}`;
    }

    updateConditionPill(temp);
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
    try {
      const res = await apiFetch(`/weather?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success && data.telemetry) {
        const t = data.telemetry;
        state.currentCity = t.city || query;
        state.currentWeather = {
          temperature: t.temperature,
          humidity: t.humidity,
          rainfall: t.rainfall || 0
        };

        if (telemetryTemp) telemetryTemp.textContent = `${t.temperature.toFixed(1)}°C`;
        if (zoneMonsoonText && t.rainfall) zoneMonsoonText.textContent = `${t.rainfall.toFixed(0)} mm`;
        if (zoneLabel) zoneLabel.textContent = `Agro-Climatic Zone: ${t.city || query} District`;
        if (sliders.temp) {
          sliders.temp.value = t.temperature;
          if (displays.temp) displays.temp.textContent = t.temperature.toFixed(1);
        }
        updateConditionPill(t.temperature);
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

  // GPS Geolocation
  if (btnDetectGps) {
    btnDetectGps.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
      }
      if (zoneLabel) zoneLabel.textContent = 'Detecting GPS Coordinates...';
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation`);
            const data = await res.json();
            if (data && data.current) {
              const temp = data.current.temperature_2m;
              const rain = data.current.precipitation || 0;
              if (telemetryTemp) telemetryTemp.textContent = `${temp.toFixed(1)}°C`;
              if (sliders.temp) {
                sliders.temp.value = temp;
                if (displays.temp) displays.temp.textContent = temp.toFixed(1);
              }
              if (zoneLabel) zoneLabel.textContent = `GPS: Lat ${latitude.toFixed(2)}°, Lon ${longitude.toFixed(2)}°`;
              updateConditionPill(temp);
            }
          } catch (e) {
            if (zoneLabel) zoneLabel.textContent = 'Agro-Climatic Zone: Western Maharashtra (Zone IX)';
          }
        },
        (err) => {
          alert('Could not access location. Please check browser permissions.');
          if (zoneLabel) zoneLabel.textContent = 'Agro-Climatic Zone: Western Maharashtra (Zone IX)';
        }
      );
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. MULTI-LANGUAGE TRANSLATIONS & CROPS METADATA ENGINE
  // ─────────────────────────────────────────────────────────────────────────
  const TRANSLATIONS = {
    en: {
      navAdvisory: 'Advisory',
      navWeather: 'Weather Alerts',
      navSoil: 'Soil Health',
      navDoctor: 'Pest Doctor',
      navMandi: 'Mandi Rates',
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
      subtabRecords: 'Past Season Records'
    },
    hi: {
      navAdvisory: 'Advisory',
      navWeather: 'मौसम अलर्ट',
      navSoil: 'मिट्टी स्वास्थ्य',
      navDoctor: 'कीट डॉक्टर',
      navMandi: 'मंडी भाव',
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
      btnFertCalc: '🧪 Compute Fertilizer Prescription',
      searchPathologyBtn: 'Search Pathology',
      diseaseFilterCrop: 'फसल अनुसार चुनें:',
      subtabAdvisory: 'Agro-Expert Advisory (कृषि विशेषज्ञ सलाह)',
      subtabSpectrum: 'NPK मृदा स्वास्थ्य स्पेक्ट्रम',
      subtabRecords: 'पिछले मौसम के रिकॉर्ड'
    },
    mr: {
      navAdvisory: 'पीक सल्ला',
      navWeather: 'हवामान अंदाज',
      navSoil: 'मृदा आरोग्य',
      navDoctor: 'कीड व रोग डॉक्टर',
      navMandi: 'बाजार भाव',
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
      subtabAdvisory: 'कृषी तज्ज्ञ सल्ला (Agro Advisory)',
      subtabSpectrum: 'NPK माती आरोग्य स्पेक्ट्रम',
      subtabRecords: 'मागील हंगामातील नोंदी'
    }
  };

  const CROP_TRANSLATIONS = {
    rice: {
      en: { name: 'Paddy (Indica Wet)', rationale: (n, rain) => `Your soil Nitrogen levels (${n} kg/ha) with regular monsoon rainfall (${rain} mm) provide exceptional conditions for rapid tillering and robust grain formation.` },
      hi: { name: 'धान / Paddy (Indica Wet)', rationale: (n, rain) => `आपका उच्च मिट्टी नाइट्रोजन स्तर (${n} kg/ha) और नियमित मानसूनी वर्षा (${rain} mm) धान के कल्ले फूटने और दाना भराव के लिए सर्वोत्तम परिस्थितियाँ प्रदान करते हैं।` },
      mr: { name: 'भात / धान (Indica Wet)', rationale: (n, rain) => `आपल्या शेतातील नत्राचे प्रमाण (${n} kg/ha) आणि मान्सून पाऊस (${rain} mm) भाताच्या फुटवे वाढीसाठी आणि दाणे भरण्यासाठी अत्यंत अनुकूल आहे.` }
    },
    cotton: {
      en: { name: 'Cotton (Bt Hybrid)', rationale: (n, rain) => `Ideal for well-drained Black Cotton soil. Highly responsive to available potassium for fiber strength and superior boll weight.` },
      hi: { name: 'कपास / Cotton (Bt Hybrid)', rationale: (n, rain) => `अच्छी जल निकासी वाली काली कपास मिट्टी के लिए आदर्श। रेशे की मजबूती और गूलर के वजन के लिए पोटाश के प्रति अत्यधिक उत्तरदायी।` },
      mr: { name: 'कापूस / Cotton (Bt Hybrid)', rationale: (n, rain) => `चांगला निचरा होणाऱ्या काळ्या कसदार मातीसाठी आदर्श. धाग्याची मजबुती आणि बोंडाचे वजन वाढवण्यासाठी पोटॅशियम अत्यंत फायदेशीर ठरते.` }
    },
    maize: {
      en: { name: 'Maize (Hybrid Feed)', rationale: (n, rain) => `Resilient crop choice with fast turnaround (90–105 days). Lower overall water risk if monsoon weakens midway.` },
      hi: { name: 'मक्का / Maize (Hybrid Feed)', rationale: (n, rain) => `कम अवधि (90-105 दिन) वाली लचीली फसल। यदि मानसून बीच में कमजोर भी पड़ता है, तो भी फसल सुरक्षित रहती है।` },
      mr: { name: 'मका / Maize (Hybrid Feed)', rationale: (n, rain) => `कमी कालावधीत (९०-१०५ दिवस) येणारे लवचिक पीक. मान्सूनमध्ये खंड पडला तरी पाण्याचा ताण सहज सहन करू शकते.` }
    },
    wheat: {
      en: { name: 'Wheat (HD-2967)', rationale: (n, rain) => `Thrives in balanced loam soils with moderate soil fertility and structured irrigation schedules.` },
      hi: { name: 'गेहूं / Wheat (HD-2967)', rationale: (n, rain) => `मध्यम उर्वरता और संरचित सिंचाई कार्यक्रम के साथ संतुलित दोमट मिट्टी में उत्कृष्ट पैदावार देता है।` },
      mr: { name: 'गहू / Wheat (HD-2967)', rationale: (n, rain) => `मध्यम सुपीकता आणि वेळेवर पाणी व्यवस्थापनासह चांगल्या निचऱ्याच्या पोयटा जमिनीत उत्कृष्ट उत्पादन देते.` }
    },
    sugarcane: {
      en: { name: 'Sugarcane (Co-86032)', rationale: (n, rain) => `Exceptional biomass potential under heavy clay soils with assured drainage and balanced NPK nourishment.` },
      hi: { name: 'गन्ना / Sugarcane (Co-86032)', rationale: (n, rain) => `सुनिश्चित जल निकासी और संतुलित NPK पोषण के साथ भारी मिट्टी में असाधारण बायोमास और उच्च मिठास क्षमता।` },
      mr: { name: 'ऊस / Sugarcane (Co-86032)', rationale: (n, rain) => `योग्य निचरा आणि संतुलित खत व्यवस्थापनासह भारी काळ्या जमिनीत भरघोस उत्पादन व उच्च साखर उतारा देणारे पीक.` }
    }
  };

  const AGRONOMIC_METADATA = {
    rice: {
      fullName: 'Paddy / धान (Indica Wet)',
      seasonBadge: 'Kharif Prime',
      varieties: 'MTU-1010, Indrayani, or PKV-HMT',
      yield: '44 – 48 Q/Ha',
      yieldSub: 'Top Tier Harvest',
      water: 'High',
      waterSub: 'Canal / Submerged',
      price: '₹2,300 – ₹2,550',
      priceSub: 'MSP Protected',
      duration: '120 – 135 Days',
      durationSub: 'Mid-duration crop',
      basalDose: '50% N + 100% P + 100% K at transplanting.',
      rationale: (n, rain) => `Your high soil Nitrogen levels (${n} kg/ha) combined with regular monsoon rainfall (${rain} mm) provide exceptional conditions for rapid tillering and robust grain formation.`
    },
    cotton: {
      fullName: 'Cotton / कपास (Bt Hybrid)',
      seasonBadge: 'Kharif Cash',
      varieties: 'RCH-659, Ankur-3028, or Ajit-155',
      yield: '22 – 28 Quintals/Ha',
      yieldSub: 'High Boll Load',
      water: 'Moderate (500–700mm)',
      waterSub: 'Deep Root Tap',
      price: '₹7,120 – ₹7,520',
      priceSub: 'MSP Grade-A',
      duration: '150 – 165 Days',
      durationSub: 'Extended Picking',
      basalDose: '20% N + 100% P + 100% K at planting, split N at 30 & 60 DAS.',
      rationale: (n, rain) => `Ideal for well-drained Black Cotton soil. Highly responsive to available potassium for fiber strength and superior boll weight.`
    },
    maize: {
      fullName: 'Maize / मक्का (Hybrid Feed)',
      seasonBadge: 'Kharif Fast',
      varieties: 'DKC-9108, Pioneer-P3501, or Bio-9681',
      yield: '55 – 65 Quintals/Ha',
      yieldSub: 'Heavy Cob Biomass',
      water: 'Low to Moderate (Drip ready)',
      waterSub: 'Tolerant to breaks',
      price: '₹2,090 – ₹2,225',
      priceSub: 'Steady Poultry Demand',
      duration: '90 – 105 Days',
      durationSub: 'Fast Turnaround',
      basalDose: '25% N + 100% P + 100% K basal, remainder N at knee-high and tasseling.',
      rationale: (n, rain) => `Resilient crop choice with fast turnaround (90–105 days). Lower overall water risk if monsoon weakens midway.`
    },
    wheat: {
      fullName: 'Wheat / गेहूं (HD-2967)',
      seasonBadge: 'Rabi Sovereign',
      varieties: 'HD-2967, PBW-343, or GW-322',
      yield: '48 – 54 Q/Ha',
      yieldSub: 'Prime Milling Grade',
      water: 'Moderate',
      waterSub: '4–5 Critical Irrigations',
      price: '₹2,275 – ₹2,450',
      priceSub: 'MSP Guaranteed',
      duration: '115 – 125 Days',
      durationSub: 'Timely Sown',
      basalDose: '50% N + 100% P + 100% K at crown root initiation.',
      rationale: (n, rain) => `Thrives in balanced loam soils with moderate soil fertility and structured irrigation schedules.`
    },
    sugarcane: {
      fullName: 'Sugarcane / गन्ना (Co-86032)',
      seasonBadge: 'Perennial Cash',
      varieties: 'Co-86032 (Nira), Co-0265 (Phule 265)',
      yield: '110 – 130 Tons/Ha',
      yieldSub: 'High Cane Recovery',
      water: 'High (1500–2500mm)',
      waterSub: 'Assured Furrow/Drip',
      price: '₹3,150 / Ton',
      priceSub: 'FRP Mandated',
      duration: '12 – 14 Months',
      durationSub: 'Full Agronomic Cycle',
      basalDose: '10% N + 100% P + 50% K at furrow planting.',
      rationale: (n, rain) => `Exceptional biomass potential under heavy clay soils with assured drainage and balanced NPK nourishment.`
    }
  };

  function getCropMeta(cropKey, fallbackProfile = {}) {
    const key = (cropKey || '').toLowerCase();
    const lang = state.language || 'hi';
    const ct = CROP_TRANSLATIONS[key] ? (CROP_TRANSLATIONS[key][lang] || CROP_TRANSLATIONS[key]['hi']) : null;
    const base = AGRONOMIC_METADATA[key] || {};

    if (AGRONOMIC_METADATA[key]) {
      return {
        ...base,
        fullName: ct ? ct.name : base.fullName,
        rationale: ct ? ct.rationale : base.rationale
      };
    }
    const cleanName = cropKey.charAt(0).toUpperCase() + cropKey.slice(1);
    return {
      fullName: ct ? ct.name : `${cleanName} / फसल (${fallbackProfile.cycle_days || 'Standard'})`,
      seasonBadge: 'Agro Recommended',
      varieties: `Certified Regional Varieties (${cleanName})`,
      yield: '30 – 40 Q/Ha',
      yieldSub: 'Optimal Management',
      water: fallbackProfile.water_demand || 'Moderate',
      waterSub: fallbackProfile.soil_type || 'Loamy Soils',
      price: fallbackProfile.economic_outlook ? fallbackProfile.economic_outlook.split(' ')[0] : 'High Liquidity',
      priceSub: 'Active Mandi Trade',
      duration: fallbackProfile.cycle_days || '90 – 120 Days',
      durationSub: 'Season Duration',
      basalDose: 'Apply balanced NPK dose as per University guidelines.',
      rationale: ct ? ct.rationale : ((n, rain) => `Strong agronomic fit for current field conditions with balanced soil test indices.`)
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BOTTOM SECTION SUB-TABS (Advisory / Spectrum / Records)
  // ─────────────────────────────────────────────────────────────────────────
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
    });
  });

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

  // ── Speech Synthesis & WhatsApp Kisan Helpers ──
  let activeSpeakingBtn = null;

  function toggleSpeech(text, btnElement) {
    if (!('speechSynthesis' in window)) {
      alert('Voice audio is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const lang = state.language || 'hi';
    const listenLabel = lang === 'en' ? '🔊 Listen' : (lang === 'mr' ? '🔊 ऐका / Listen' : '🔊 सुनिए / Listen');
    const stopLabel = lang === 'en' ? '⏹️ Stop' : (lang === 'mr' ? '⏹️ थांबा / Stop' : '⏹️ रोकिए / Stop');

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (activeSpeakingBtn) {
        activeSpeakingBtn.classList.remove('is-speaking');
        activeSpeakingBtn.innerHTML = listenLabel;
      }
      if (activeSpeakingBtn === btnElement) {
        activeSpeakingBtn = null;
        return;
      }
    }

    const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/[*_#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.lang = lang === 'mr' ? 'mr-IN' : (lang === 'hi' ? 'hi-IN' : 'en-IN');
    const voices = window.speechSynthesis.getVoices();
    let regionalVoice = null;
    if (lang === 'mr') {
      regionalVoice = voices.find(v => v.lang.includes('mr') || v.lang.includes('hi') || v.lang.includes('IN'));
    } else if (lang === 'hi') {
      regionalVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
    } else {
      regionalVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US'));
    }
    if (regionalVoice) {
      utterance.voice = regionalVoice;
    }

    btnElement.classList.add('is-speaking');
    btnElement.innerHTML = stopLabel;
    activeSpeakingBtn = btnElement;

    const resetBtn = () => {
      btnElement.classList.remove('is-speaking');
      btnElement.innerHTML = listenLabel;
      activeSpeakingBtn = null;
    };

    utterance.onend = resetBtn;
    utterance.onerror = resetBtn;

    window.speechSynthesis.speak(utterance);
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

  // Initial attach for static listeners in Paddy hero card
  const staticVoiceBtn = document.getElementById('best-voice-btn');
  if (staticVoiceBtn) {
    staticVoiceBtn.addEventListener('click', () => {
      const lang = state.language || 'hi';
      const speech = lang === 'en'
        ? 'Recommended Crop: Paddy Indica Wet. Suitability Match 94 percent. Recommended varieties: MTU-1010, Indrayani, or PKV-HMT. Expected yield: 44 to 48 Quintals per Hectare.'
        : (lang === 'mr'
          ? 'शिफारस केलेले पीक: भात Indica Wet. मॅच ९४ टक्के. शिफारस केलेले वाण: MTU-१०१०, इंद्रायणी किंवा PKV-HMT. अपेक्षित उत्पादन: ४४ ते ४८ क्विंटल प्रति हेक्टर.'
          : 'सिफारिश फसल: धान Indica Wet. मैच 94 प्रतिशत. अनुशंसित किस्में: MTU-1010, इंद्रायणी, या PKV-HMT. अपेक्षित उपज: 44 से 48 क्विंटल प्रति हेक्टेयर.');
      toggleSpeech(speech, staticVoiceBtn);
    });
  }

  const staticWaBtn = document.getElementById('best-whatsapp-btn');
  if (staticWaBtn) {
    staticWaBtn.addEventListener('click', () => {
      shareOnWhatsApp('Paddy / धान (Indica Wet)', '📊 Suitability: 94%\n🌾 Expected Yield: 44-48 Q/Ha\n💧 Water Need: High\n⏱️ Duration: 120-135 Days');
    });
  }

  const alt1VoiceBtn = document.getElementById('alt-1-voice-btn');
  if (alt1VoiceBtn) {
    alt1VoiceBtn.addEventListener('click', () => {
      const lang = state.language || 'hi';
      const speech = lang === 'en'
        ? 'Alternative crop 1: Cotton Bt Hybrid. Match 82 percent. Ideal for well-drained Black Cotton soil.'
        : (lang === 'mr'
          ? 'पर्यायी पीक १: कापूस Bt Hybrid. मॅच ८२ टक्के. काळ्या कसदार मातीसाठी योग्य.'
          : 'वैकल्पिक फसल 1: कपास Bt Hybrid. मैच 82 प्रतिशत. काली मिट्टी के लिए उपयुक्त.');
      toggleSpeech(speech, alt1VoiceBtn);
    });
  }

  const alt2VoiceBtn = document.getElementById('alt-2-voice-btn');
  if (alt2VoiceBtn) {
    alt2VoiceBtn.addEventListener('click', () => {
      const lang = state.language || 'hi';
      const speech = lang === 'en'
        ? 'Alternative crop 2: Maize Hybrid Feed. Match 74 percent. Fast turnaround in 90 to 105 days.'
        : (lang === 'mr'
          ? 'पर्यायी पीक २: मका Hybrid Feed. मॅच ७४ टक्के. ९० ते १०५ दिवसांत तयार होणारे पीक.'
          : 'वैकल्पिक फसल 2: मक्का Hybrid Feed. मैच 74 प्रतिशत. 90 से 105 दिनों में तैयार.');
      toggleSpeech(speech, alt2VoiceBtn);
    });
  }

  // ── Language Switcher Controller ──
  const langSelect = document.getElementById('lang-select');

  function applyLanguage(lang) {
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

    // Disease Doctor Button
    const btnSearchDis = document.getElementById('btn-search-disease');
    if (btnSearchDis) btnSearchDis.textContent = t.searchPathologyBtn;
    const docCropLbl = document.querySelector('label[for="doctor-crop-select"]');
    if (docCropLbl) docCropLbl.textContent = t.diseaseFilterCrop;

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
        btn.innerHTML = lang === 'en' ? '🔊 Listen' : (lang === 'mr' ? '🔊 ऐका / Listen' : '🔊 सुनिए / Listen');
      }
    });

    // Re-render recommendations if loaded
    if (state.lastRecommendationsData) {
      renderRecommendations(state.lastRecommendationsData);
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
      const res = await apiFetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.recommendations) {
        renderRecommendations(data, nVal, rainVal);
        if (resultsStatus) resultsStatus.textContent = 'AI Classified (99.3%)';
      } else {
        alert(data.detail || 'Prediction failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error connecting to Agronomic Intelligence API.');
    } finally {
      if (predictSpinner) predictSpinner.classList.add('is-hidden');
    }
  });

  function renderRecommendations(data, currentN = 92, currentRain = 210) {
    state.lastRecommendationsData = data;
    const recs = data.recommendations || [];
    if (recs.length === 0) return;

    // #1 Best Choice Crop
    const best = recs[0];
    const bestMeta = getCropMeta(best.crop, best.profile);

    const bestCard = document.getElementById('best-crop-card');
    const bestCropName = document.getElementById('best-crop-name');
    const bestSeason = document.getElementById('best-crop-season');
    const bestVarieties = document.getElementById('best-crop-varieties');
    const bestGaugeVal = document.getElementById('best-gauge-val');
    const bestGaugeFill = document.getElementById('best-gauge-fill');
    const bestRationale = document.getElementById('best-crop-rationale');
    const bestStatYield = document.getElementById('best-stat-yield');
    const bestStatYieldSub = document.getElementById('best-stat-yield-sub');
    const bestStatWater = document.getElementById('best-stat-water');
    const bestStatWaterSub = document.getElementById('best-stat-water-sub');
    const bestStatPrice = document.getElementById('best-stat-price');
    const bestStatPriceSub = document.getElementById('best-stat-price-sub');
    const bestStatDuration = document.getElementById('best-stat-duration');
    const bestStatDurationSub = document.getElementById('best-stat-duration-sub');

    if (bestCropName) bestCropName.textContent = bestMeta.fullName;
    if (bestSeason) bestSeason.textContent = bestMeta.seasonBadge;
    if (bestVarieties) bestVarieties.textContent = `Recommended Varieties: ${bestMeta.varieties}`;
    if (bestGaugeVal) bestGaugeVal.textContent = `${best.confidence}%`;
    if (bestGaugeFill) {
      // 2 * PI * 34 = 213.6
      const offset = 213.6 - (213.6 * best.confidence / 100);
      bestGaugeFill.setAttribute('stroke-dashoffset', offset.toFixed(1));
    }
    if (bestRationale) {
      bestRationale.textContent = bestMeta.rationale(currentN, currentRain);
    }
    if (bestStatYield) bestStatYield.textContent = bestMeta.yield;
    if (bestStatYieldSub) bestStatYieldSub.textContent = bestMeta.yieldSub;
    if (bestStatWater) bestStatWater.textContent = bestMeta.water;
    if (bestStatWaterSub) bestStatWaterSub.textContent = bestMeta.waterSub;
    if (bestStatPrice) bestStatPrice.textContent = bestMeta.price;
    if (bestStatPriceSub) bestStatPriceSub.textContent = bestMeta.priceSub;
    if (bestStatDuration) bestStatDuration.textContent = bestMeta.duration;
    if (bestStatDurationSub) bestStatDurationSub.textContent = bestMeta.durationSub;

    // Attach Voice & WhatsApp to new Best Choice
    const dynamicBestVoice = document.getElementById('best-voice-btn');
    if (dynamicBestVoice) {
      const spText = `शीर्ष अनुशंसित फसल: ${bestMeta.fullName}. मैच आत्मविश्वास ${best.confidence} प्रतिशत. अपेक्षित उपज: ${bestMeta.yield}. जल आवश्यकता: ${bestMeta.water}. फसल अवधि: ${bestMeta.duration}.`;
      dynamicBestVoice.onclick = () => toggleSpeech(spText, dynamicBestVoice);
    }

    const dynamicBestWa = document.getElementById('best-whatsapp-btn');
    if (dynamicBestWa) {
      const waDet = `📊 *Match:* ${best.confidence}%\n🌾 *Yield:* ${bestMeta.yield}\n💧 *Water:* ${bestMeta.water}\n⏱️ *Duration:* ${bestMeta.duration}\n💰 *Mandi:* ${bestMeta.price}`;
      dynamicBestWa.onclick = () => shareOnWhatsApp(bestMeta.fullName, waDet);
    }

    // Alternative #1 (Index 1)
    if (recs.length > 1) {
      const alt1 = recs[1];
      const alt1Meta = getCropMeta(alt1.crop, alt1.profile);
      const alt1Score = document.getElementById('alt-1-score');
      const alt1Title = document.getElementById('alt-1-title');
      const alt1Desc = document.getElementById('alt-1-desc');
      const alt1Water = document.getElementById('alt-1-water');
      const alt1Yield = document.getElementById('alt-1-yield');
      const alt1Risk = document.getElementById('alt-1-risk');

      if (alt1Score) alt1Score.textContent = `${alt1.confidence}% Match`;
      if (alt1Title) alt1Title.textContent = alt1Meta.fullName;
      if (alt1Desc) alt1Desc.textContent = alt1Meta.rationale(currentN, currentRain);
      if (alt1Water) alt1Water.textContent = alt1Meta.water;
      if (alt1Yield) alt1Yield.textContent = alt1Meta.yield;
      if (alt1Risk) alt1Risk.textContent = alt1Meta.priceSub;

      const alt1V = document.getElementById('alt-1-voice-btn');
      if (alt1V) {
        alt1V.onclick = () => toggleSpeech(`वैकल्पिक फसल 1: ${alt1Meta.fullName}. मैच ${alt1.confidence} प्रतिशत.`, alt1V);
      }
    }

    // Alternative #2 (Index 2)
    if (recs.length > 2) {
      const alt2 = recs[2];
      const alt2Meta = getCropMeta(alt2.crop, alt2.profile);
      const alt2Score = document.getElementById('alt-2-score');
      const alt2Title = document.getElementById('alt-2-title');
      const alt2Desc = document.getElementById('alt-2-desc');
      const alt2Water = document.getElementById('alt-2-water');
      const alt2Yield = document.getElementById('alt-2-yield');
      const alt2Risk = document.getElementById('alt-2-risk');

      if (alt2Score) alt2Score.textContent = `${alt2.confidence}% Match`;
      if (alt2Title) alt2Title.textContent = alt2Meta.fullName;
      if (alt2Desc) alt2Desc.textContent = alt2Meta.rationale(currentN, currentRain);
      if (alt2Water) alt2Water.textContent = alt2Meta.water;
      if (alt2Yield) alt2Yield.textContent = alt2Meta.yield;
      if (alt2Risk) alt2Risk.textContent = alt2Meta.priceSub;

      const alt2V = document.getElementById('alt-2-voice-btn');
      if (alt2V) {
        alt2V.onclick = () => toggleSpeech(`वैकल्पिक फसल 2: ${alt2Meta.fullName}. मैच ${alt2.confidence} प्रतिशत.`, alt2V);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
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
      let res = await apiFetch('/fertilizer-calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.status === 404) {
        res = await apiFetch('/fertilizer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success && (data.fertilizers || data.prescription)) {
        renderFertilizers(data);
      } else {
        alert(data.detail || 'Fertilizer calculation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to fertilizer calculation endpoint.');
    } finally {
      if (fertSpinner) fertSpinner.classList.add('is-hidden');
    }
  });

  function renderFertilizers(data) {
    if (fertPlaceholder) fertPlaceholder.classList.add('is-hidden');
    if (fertContent) fertContent.classList.remove('is-hidden');

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
          <div class="timeline-step-item">🌱 <strong>Basal Application (बुवाई/रोपाई के समय):</strong> 100% DAP (${f.dap_kg_ha.toFixed(0)} kg/ha), 100% MOP (${f.mop_kg_ha.toFixed(0)} kg/ha), and 33% Urea.</div>
          <div class="timeline-step-item">🌿 <strong>First Top Dressing (25–30 दिन बाद):</strong> 33% Urea during active tillering/vegetative phase.</div>
          <div>🌾 <strong>Second Top Dressing (50–55 दिन बाद):</strong> Remaining 34% Urea before panicle initiation/flowering.</div>
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
    if (!window.Plotly) return;
    const chartDiv = document.getElementById('fert-plotly-chart');
    if (!chartDiv) return;

    let targetN = 120, targetP = 60, targetK = 40;
    let currentN = 92, currentP = 46, currentK = 44;

    if (data.deficits) {
      if (typeof data.deficits.target_n === 'number') targetN = data.deficits.target_n;
      if (typeof data.deficits.target_p === 'number') targetP = data.deficits.target_p;
      if (typeof data.deficits.target_k === 'number') targetK = data.deficits.target_k;
      if (typeof data.deficits.current_n === 'number') currentN = data.deficits.current_n;
      if (typeof data.deficits.current_p === 'number') currentP = data.deficits.current_p;
      if (typeof data.deficits.current_k === 'number') currentK = data.deficits.current_k;
    } else if (data.prescription) {
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

    if (mode === '3d') {
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

      window.Plotly.newPlot(chartDiv, [traceCurrent, traceTarget], layout3d, { responsive: true, displayModeBar: false });
    } else {
      const trace1 = {
        x: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
        y: [targetN, targetP, targetK],
        name: 'Crop Optimum Target',
        type: 'bar',
        marker: { color: '#1C4A32' }
      };

      const trace2 = {
        x: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
        y: [currentN, currentP, currentK],
        name: 'Current Field Soil Test',
        type: 'bar',
        marker: { color: '#E59B2E' }
      };

      const layout = {
        barmode: 'group',
        bargap: 0.35,
        bargroupgap: 0.12,
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { family: 'Plus Jakarta Sans, sans-serif', color: '#1A2C22', size: 12 },
        margin: { t: 36, r: 24, l: 56, b: 60 },
        dragmode: false,
        hovermode: 'closest',
        yaxis: {
          title: { text: 'Nutrient (kg/ha)', standoff: 8 },
          gridcolor: '#ECE7DD',
          rangemode: 'tozero',
          fixedrange: true,
          zerolinecolor: '#D4CBBF'
        },
        xaxis: {
          type: 'category',
          gridcolor: 'transparent',
          fixedrange: true,
          automargin: true,
          tickfont: { size: 12, family: 'Plus Jakarta Sans, sans-serif', color: '#1A2C22' }
        },
        legend: {
          orientation: 'h',
          x: 0,
          y: 1.18,
          font: { size: 12, family: 'Plus Jakarta Sans, sans-serif' }
        }
      };

      window.Plotly.newPlot(chartDiv, [trace1, trace2], layout, {
        responsive: true,
        displayModeBar: false,
        staticPlot: false,
        scrollZoom: false
      });
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
      let res = await apiFetch(`/diseases?crop=${encodeURIComponent(crop)}&keyword=${encodeURIComponent(q)}&symptom=${encodeURIComponent(q)}&q=${encodeURIComponent(q)}`);
      let data = await res.json();

      // If specific crop filter had 0 results for this symptom, fall back to searching all crops
      if ((!data.diseases || data.diseases.length === 0) && crop && q) {
        const fallbackRes = await apiFetch(`/diseases?keyword=${encodeURIComponent(q)}&symptom=${encodeURIComponent(q)}&q=${encodeURIComponent(q)}`);
        const fallbackData = await fallbackRes.json();
        if (fallbackData && fallbackData.diseases && fallbackData.diseases.length > 0) {
          if (doctorCropSelect) doctorCropSelect.value = '';
          data = fallbackData;
        }
      }

      if (data && data.success) {
        renderDiseases(data);
      }
    } catch (e) {
      console.warn('Disease search error:', e);
    }
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
      searchDiseases();
    });
  });

  function renderDiseases(data) {
    if (!diseaseResultsContainer) return;
    diseaseResultsContainer.innerHTML = '';

    if (data.outbreak_risk && data.outbreak_risk.length > 0 && doctorRiskBanner) {
      doctorRiskBanner.classList.remove('is-hidden');
      if (riskCropName) riskCropName.textContent = data.crop || 'Monitored Crop';
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
          <h4 class="no-pathogens-title">No Pathogens Found</h4>
          <p>No diseases matched your search criteria. Try a different crop or broader symptom keyword.</p>
        </div>
      `;
      return;
    }

    data.diseases.forEach(d => {
      const card = document.createElement('div');
      card.className = 'disease-card';
      const dName = d.name || d.disease_name || d.disease || 'Plant Disease';

      // Biological control text
      let bioText = 'Bio-fungicide protocol';
      if (Array.isArray(d.biological_cures) && d.biological_cures.length > 0) {
        bioText = d.biological_cures.map(c => `• ${c}`).join('<br>');
      } else if (d.organic_control || d.biological_cure) {
        bioText = d.organic_control || d.biological_cure;
      }

      // Chemical remedies text
      let chemText = 'Targeted chemical spray';
      let speechChem = 'उचित दवा का छिड़काव करें';
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
      } else if (d.chemical_cure || d.fungicide) {
        chemText = d.chemical_cure || d.fungicide;
        speechChem = chemText;
      }

      card.innerHTML = `
        <div class="disease-header">
          <div>
            <div class="disease-name">${dName}</div>
            <span class="disease-crop-tag">🌱 ${d.crop ? d.crop.toUpperCase() : 'ALL CROPS'}</span>
          </div>
          <span class="badge-coral">${d.pathogen_type || 'Pathogen'}</span>
        </div>
        <div class="disease-section">
          <h5>Diagnostic Symptoms</h5>
          <p>${d.symptoms || 'Visual lesion details'}</p>
        </div>
        <div class="disease-section">
          <h5>Biological & Organic Control</h5>
          <p>${bioText}</p>
        </div>
        <div class="disease-section">
          <h5>Chemical Fungicide / Treatment</h5>
          <p>${chemText}</p>
        </div>
        <div class="card-action-bar">
          <button type="button" class="btn-voice-readout btn-voice-disease">🔊 सुनिए / Listen</button>
          <button type="button" class="btn-whatsapp-share btn-whatsapp-disease">📲 WhatsApp Share</button>
        </div>
      `;

      const vBtn = card.querySelector('.btn-voice-disease');
      if (vBtn) {
        const speechText = `रोग का नाम: ${dName}. फसल: ${d.crop || ''}. प्रमुख लक्षण: ${d.symptoms || ''}. अनुशंसित दवा: ${speechChem}`;
        vBtn.addEventListener('click', () => toggleSpeech(speechText, vBtn));
      }

      const waBtn = card.querySelector('.btn-whatsapp-disease');
      if (waBtn) {
        const waDetails = `🩺 *Pathogen:* ${dName} (${d.pathogen_type || 'Disease'})
🌱 *Crop:* ${d.crop ? d.crop.toUpperCase() : 'General'}
🔍 *Symptoms:* ${d.symptoms || 'Visual lesions'}
🧪 *Chemical Remedy:* ${speechChem}`;
        waBtn.addEventListener('click', () => shareOnWhatsApp(`${dName} (${d.crop || ''})`, waDetails));
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

      const res = await apiFetch(`/soil-profile?state=${encodeURIComponent(stateName)}`);
      const data = await res.json();
      if (data.success && data.profile) {
        renderStateSoilProfile(data.state, data.profile);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function renderStateSoilProfile(name, p) {
    statePlaceholder.classList.add('is-hidden');
    stateContent.classList.remove('is-hidden');

    const npk = p.baseline_soil_test || {};
    stateContent.innerHTML = `
      <div class="card state-profile-card">
        <div class="state-profile-header">
          <div>
            <h3 class="state-profile-title">${name}</h3>
            <span class="state-dominant-soil">Dominant Soil: ${p.dominant_soil_types || 'Alluvial & Loamy'}</span>
          </div>
          <span class="choice-star-badge">ICAR-IISS Benchmark</span>
        </div>

        <div class="state-metrics-grid">
          <div class="stat-card">
            <span class="stat-label">Nitrogen Status</span>
            <div class="stat-value state-stat-value">${npk.nitrogen_status || 'Medium'}</div>
          </div>
          <div class="stat-card">
            <span class="stat-label">Phosphorus Status</span>
            <div class="stat-value state-stat-value">${npk.phosphorus_status || 'Low to Medium'}</div>
          </div>
          <div class="stat-card">
            <span class="stat-label">Potassium Status</span>
            <div class="stat-value state-stat-value">${npk.potassium_status || 'High'}</div>
          </div>
          <div class="stat-card">
            <span class="stat-label">Organic Carbon</span>
            <div class="stat-value state-stat-value">${npk.organic_carbon || '0.45 - 0.75%'}</div>
          </div>
        </div>

        <div class="why-fits-callout state-callout-crops">
          <strong class="state-crops-title">🌾 Recommended Staple & Commercial Crops:</strong>
          <p class="state-crops-body">${p.staple_crops || 'Paddy, Wheat, Sugarcane, Pulses'}</p>
        </div>

        <div class="why-fits-callout state-callout-sau">
          <strong class="state-sau-title">🏛️ State Agricultural University (SAU) Fertilizer Advisory:</strong>
          <p class="state-sau-body">${p.sau_advisory || 'Balanced application with FYM and Micronutrient zinc enhancement.'}</p>
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
  async function initApp() {
    applyLanguage(state.language);
    updateSoilSpectrum(92, 46, 44, 6.8);
    // 1. Fetch crops list
    try {
      const res = await apiFetch('/crops');
      const data = await res.json();
      if (data.crops) {
        state.crops = data.crops;
        if (selectTargetCrop) {
          selectTargetCrop.innerHTML = '<option value="">-- Auto Best --</option>' +
            data.crops.map(c => `<option value="${c}">${c.toUpperCase()}</option>`).join('');
        }
        if (fertCropSelect) {
          fertCropSelect.innerHTML = data.crops.map(c => `<option value="${c}">${c.toUpperCase()}</option>`).join('');
          fertCropSelect.value = 'rice';
        }
        if (doctorCropSelect) {
          doctorCropSelect.innerHTML = `<option value="">All Supported Crops</option>` + data.crops.map(c => `<option value="${c}">${c.toUpperCase()}</option>`).join('');
        }
      }
    } catch (e) {
      console.warn('Crops bootstrap error:', e);
    }

    // 2. Fetch Indian soil states
    try {
      const res = await apiFetch('/soil-states');
      const data = await res.json();
      if (data.states && stateDropdown) {
        state.indianStates = data.states;
        stateDropdown.innerHTML = data.states.map(s => `<option value="${s}">${s}</option>`).join('');
        if (fertStateSelect) {
          fertStateSelect.innerHTML = `<option value="">Maharashtra (MPKV Rahuri)</option>` + data.states.map(s => `<option value="${s}">${s}</option>`).join('');
        }
        if (data.states.length > 0) {
          stateDropdown.value = 'Maharashtra';
          loadSoilStateProfile('Maharashtra');
        }
      }
    } catch (e) {
      console.warn('Soil states bootstrap error:', e);
    }

    // 3. Search initial disease pathology
    searchDiseases();
  }

  initApp();
});
