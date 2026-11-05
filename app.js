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
    activeChartMode: 'bar'
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
  // 5. CROPS METADATA & STYLING ENGINE
  // ─────────────────────────────────────────────────────────────────────────
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
      seasonBadge: 'Annual Heavy',
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
    if (AGRONOMIC_METADATA[key]) {
      return AGRONOMIC_METADATA[key];
    }
    const cleanName = cropKey.charAt(0).toUpperCase() + cropKey.slice(1);
    return {
      fullName: `${cleanName} / फसल (${fallbackProfile.cycle_days || 'Standard'})`,
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
      rationale: (n, rain) => `Strong agronomic fit for current field conditions with balanced soil test indices.`
    };
  }

  // ── Speech Synthesis & WhatsApp Kisan Helpers ──
  let activeSpeakingBtn = null;

  function toggleSpeech(text, btnElement) {
    if (!('speechSynthesis' in window)) {
      alert('Voice audio is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (activeSpeakingBtn) {
        activeSpeakingBtn.classList.remove('is-speaking');
        activeSpeakingBtn.innerHTML = '🔊 सुनिए / Listen';
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

    const voices = window.speechSynthesis.getVoices();
    const regionalVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('en-IN') || v.lang.includes('IN'));
    if (regionalVoice) {
      utterance.voice = regionalVoice;
    }

    btnElement.classList.add('is-speaking');
    btnElement.innerHTML = '⏹️ रोकिए / Stop';
    activeSpeakingBtn = btnElement;

    utterance.onend = () => {
      btnElement.classList.remove('is-speaking');
      btnElement.innerHTML = '🔊 सुनिए / Listen';
      activeSpeakingBtn = null;
    };

    utterance.onerror = () => {
      btnElement.classList.remove('is-speaking');
      btnElement.innerHTML = '🔊 सुनिए / Listen';
      activeSpeakingBtn = null;
    };

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
      toggleSpeech('सिफारिश फसल: धान Indica Wet. मैच 94 प्रतिशत. अनुशंसित किस्में: MTU-1010, इंद्रायणी, या PKV-HMT. अपेक्षित उपज: 44 से 48 क्विंटल प्रति हेक्टेयर.', staticVoiceBtn);
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
      toggleSpeech('वैकल्पिक फसल 1: कपास Bt Hybrid. मैच 82 प्रतिशत. काली मिट्टी के लिए उपयुक्त. पानी की जरूरत 500 से 700 मिलीमीटर.', alt1VoiceBtn);
    });
  }

  const alt2VoiceBtn = document.getElementById('alt-2-voice-btn');
  if (alt2VoiceBtn) {
    alt2VoiceBtn.addEventListener('click', () => {
      toggleSpeech('वैकल्पिक फसल 2: मक्का Hybrid Feed. मैच 74 प्रतिशत. 90 से 105 दिनों में तैयार.', alt2VoiceBtn);
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
      const res = await apiFetch('/fertilizer-calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.fertilizers) {
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

    state.lastFertData = data;
    const f = data.fertilizers;

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

    renderFertPlotlyChart(data);
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

  function renderFertPlotlyChart(data) {
    if (!window.Plotly) return;
    const chartDiv = document.getElementById('fert-plotly-chart');
    if (!chartDiv) return;

    const d = data.deficits || {};
    const trace1 = {
      x: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
      y: [d.target_n || 120, d.target_p || 60, d.target_k || 40],
      name: 'Crop Optimum Target',
      type: 'bar',
      marker: { color: '#2D6A4F' }
    };

    const trace2 = {
      x: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
      y: [d.current_n || 92, d.current_p || 46, d.current_k || 44],
      name: 'Current Field Soil Test',
      type: 'bar',
      marker: { color: '#E59B2E' }
    };

    const layout = {
      barmode: 'group',
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { family: 'Plus Jakarta Sans, sans-serif', color: '#1A2C22', size: 12 },
      margin: { t: 30, r: 20, l: 40, b: 40 },
      yaxis: { title: 'Nutrient (kg/ha)', gridcolor: '#ECE7DD' },
      xaxis: { gridcolor: 'transparent' },
      legend: { orientation: 'h', y: 1.15 }
    };

    window.Plotly.newPlot(chartDiv, [trace1, trace2], layout, { responsive: true, displayModeBar: false });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 8. DISEASE DOCTOR
  // ─────────────────────────────────────────────────────────────────────────
  async function searchDiseases() {
    const crop = doctorCropSelect ? doctorCropSelect.value : '';
    const q = doctorSearchInput ? doctorSearchInput.value : '';

    try {
      const res = await apiFetch(`/diseases?crop=${encodeURIComponent(crop)}&symptom=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
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
      const dName = d.disease_name || d.name || d.disease;
      card.innerHTML = `
        <div class="disease-header">
          <div>
            <div class="disease-name">${dName}</div>
            <span class="disease-crop-tag">🌱 ${d.crop}</span>
          </div>
          <span class="badge-coral">${d.pathogen_type || 'Pathogen'}</span>
        </div>
        <div class="disease-section">
          <h5>Diagnostic Symptoms</h5>
          <p>${d.symptoms || 'Visual lesion details'}</p>
        </div>
        <div class="disease-section">
          <h5>Biological Control</h5>
          <p>${d.organic_control || d.biological_cure || 'Bio-fungicide protocol'}</p>
        </div>
        <div class="disease-section">
          <h5>Chemical Fungicide / Treatment</h5>
          <p>${d.chemical_cure || d.fungicide || 'Targeted chemical spray'}</p>
        </div>
        <div class="card-action-bar">
          <button type="button" class="btn-voice-readout btn-voice-disease">🔊 सुनिए / Listen</button>
          <button type="button" class="btn-whatsapp-share btn-whatsapp-disease">📲 WhatsApp Share</button>
        </div>
      `;

      const vBtn = card.querySelector('.btn-voice-disease');
      if (vBtn) {
        const cure = d.chemical_cure || d.fungicide || d.organic_control || 'उचित दवा का छिड़काव करें.';
        const speechText = `रोग का नाम: ${dName}. फसल: ${d.crop}. प्रमुख लक्षण: ${d.symptoms || ''}. उपचार: ${cure}`;
        vBtn.addEventListener('click', () => toggleSpeech(speechText, vBtn));
      }

      const waBtn = card.querySelector('.btn-whatsapp-disease');
      if (waBtn) {
        const waDetails = `🩺 *Pathogen:* ${dName} (${d.pathogen_type || 'Disease'})\n🔍 *Symptoms:* ${d.symptoms || 'Visual lesions'}\n🧪 *Chemical Remedy:* ${d.chemical_cure || d.fungicide || 'Inspect crop'}\n🌿 *Organic Control:* ${d.organic_control || d.biological_cure || 'Bio-fungicide'}`;
        waBtn.addEventListener('click', () => shareOnWhatsApp(`${dName} (${d.crop})`, waDetails));
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
