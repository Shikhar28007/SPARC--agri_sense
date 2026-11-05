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

  // ─────────────────────────────────────────────────────────────────────────
  // AUTOMATIC LIVE WEATHER & GPS RESOLUTION ENGINE
  // ─────────────────────────────────────────────────────────────────────────
  async function autoDetectWeather(isUserAction = false) {
    if (isUserAction && btnDetectGps) {
      btnDetectGps.innerHTML = '<span class="gps-dot is-pulsing"></span> 📡 Locating...';
    }

    const setWeatherData = (city, region, lat, lon, temp, humidity, rainfall, conditionIcon = '☀️', conditionText = 'Normal') => {
      state.currentCity = city;
      state.currentWeather = { temperature: temp, humidity, rainfall };

      // Update Floating Zone Box
      if (zoneLabel) {
        zoneLabel.textContent = region ? `Agro-Climatic Zone: ${city}, ${region} (${lat ? lat.toFixed(2) + '° N, ' + lon.toFixed(2) + '° E' : ''})` : `Agro-Climatic Zone: ${city}`;
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

      // If state matches one of the soil registry states, auto-sync soil dropdown
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
            
            // Client reverse geocoding via BigDataCloud
            const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
            const geoPromise = fetch(geoUrl).then(r => r.json()).catch(() => null);

            const [omData, geoData] = await Promise.all([omPromise, geoPromise]);

            let cityName = (geoData && (geoData.city || geoData.locality || geoData.principalSubdivision)) || 'Local Field';
            let regionName = (geoData && geoData.principalSubdivision) || '';

            if (omData && omData.current) {
              const temp = omData.current.temperature_2m;
              const hum = omData.current.relative_humidity_2m || 70;
              const wCode = omData.current.weather_code || 0;
              
              // Calibrated seasonal monsoon rainfall calculation
              const dailyRainSum = (omData.daily && omData.daily.precipitation_sum) ? omData.daily.precipitation_sum.reduce((a, b) => a + (b || 0), 0) : 10;
              const seasonalRain = Math.max(75, Math.min(380, Math.round(dailyRainSum * 6.5 + 40)));

              const icon = (wCode >= 51 && wCode <= 67) ? '🌧️' : (wCode >= 1 && wCode <= 3 ? '⛅' : (wCode >= 95 ? '⛈️' : '☀️'));

              setWeatherData(cityName, regionName, latitude, longitude, temp, hum, seasonalRain, icon, 'Live GPS');
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
              
              const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=precipitation_sum&timezone=auto`;
              const omRes = await fetch(omUrl);
              const omData = await omRes.json();

              if (omData && omData.current) {
                const temp = omData.current.temperature_2m;
                const hum = omData.current.relative_humidity_2m || 65;
                const dailySum = (omData.daily && omData.daily.precipitation_sum) ? omData.daily.precipitation_sum.reduce((a, b) => a + (b || 0), 0) : 12;
                const rain = Math.max(70, Math.min(380, Math.round(dailySum * 6.5 + 40)));
                setWeatherData(city, region, lat, lon, temp, hum, rain, '⛅', 'IP Auto');
                return;
              }
            }
          } catch (e2) {
            // Default to Pune fallback silently
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
      shareBtnText: '📲 WhatsApp Share'
    },
    hi: {
      navAdvisory: 'फसल सलाह (Advisory)',
      navWeather: 'मौसम अलर्ट',
      navSoil: 'उर्वरक पर्चा (Fertilizer)',
      navDoctor: 'कीट डॉक्टर (Pest Doctor)',
      navMandi: 'मृदा स्वास्थ्य रजिस्ट्री (Soil Health)',
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
      subtabAdvisory: 'Agro-Expert Advisory (कृषि विशेषज्ञ सलाह)',
      subtabSpectrum: 'NPK मृदा स्वास्थ्य स्पेक्ट्रम',
      subtabRecords: 'पिछले मौसम के रिकॉर्ड',
      lblTargetCrop: '🎯 आप कौन सी फसल उगाना चाहते हैं? (इच्छित फसल)',
      badgeTargetCropOpt: 'वैकल्पिक / AI सत्यापन',
      hintTargetCrop: 'यदि आपके मन में कोई विशिष्ट फसल है तो उसे चुनें। SPARC AI जांचेगा कि आपकी भूमि इसके अनुकूल है या नहीं, और आवश्यक होने पर बेहतर फसल सुझाएगा।',
      optAutoRecommend: '✨ सर्वोत्तम AI अनुशंसा (खेत के लिए सबसे उपयुक्त)',
      targetViableTitle: '✅ खेती के अनुकूल: आपकी भूमि और मौसम {crop} की खेती के सर्वथा उपयुक्त है!',
      targetRiskyTitle: '⚠️ फसल जोखिम चेतावनी: इस खेत में {crop} की खेती में विफलता का उच्च जोखिम है',
      preferredHeader: '🌟 सुझाई गई पसंदीदा बेहतर फसल (Recommended Preferred Crop):',
      preferredWhyLabel: '💡 यह फसल क्यों बेहतर विकल्प है:',
      rescueToggleLabel: '🛠️ यदि आप फिर भी {crop} उगाना चाहते हैं: आवश्यक मिट्टी सुधार व बचाव उपाय देखें ▼',
      // Recommended Card Elements
      heroChoiceBadge: '⭐ #1 आपके खेत के लिए सर्वश्रेष्ठ पसंद (Best Choice)',
      heroConfidenceChip: 'उच्च सटीकता (High Confidence)',
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
      shareBtnText: '📲 WhatsApp शेयर'
    },
    mr: {
      navAdvisory: 'पीक सल्ला (Advisory)',
      navWeather: 'हवामान अंदाज',
      navSoil: 'खत व्यवस्थापन (Fertilizer)',
      navDoctor: 'कीड व रोग डॉक्टर',
      navMandi: 'मृदा आरोग्य नोंदवही (Soil Health)',
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
      subtabRecords: 'मागील हंगामातील नोंदी',
      lblTargetCrop: '🎯 आपण कोणते पीक घेऊ इच्छिता? (इच्छित पीक)',
      badgeTargetCropOpt: 'पर्यायी / AI पडताळणी',
      hintTargetCrop: 'आपल्या मनात विशिष्ट पीक असल्यास ते निवडा. SPARC AI आपली जमीन त्यासाठी योग्य आहे का ते तपासेल किंवा जास्त फायदेशीर पर्यायी पीक सुचवेल.',
      optAutoRecommend: '✨ सर्वोत्तम AI शिफारस (शेतीसाठी सर्वात योग्य)',
      targetViableTitle: '✅ लागवडीसाठी योग्य: आपली जमीन आणि हवामान {crop} च्या लागवडीसाठी अत्यंत अनुकूल आहे!',
      targetRiskyTitle: '⚠️ पीक जोखीम इशारा: या शेतात {crop} लागवडीमध्ये अपयशाची मोठी जोखीम आहे',
      preferredHeader: '🌟 सुचवलेले पर्यायी उत्तम पीक (Recommended Preferred Crop):',
      preferredWhyLabel: '💡 हे पर्यायी पीक का जास्त फायदेशीर आहे:',
      rescueToggleLabel: '🛠️ तरीही {crop} घ्यायचे असल्यास: आवश्यक जमीन सुधारणा व बचाव नियोजन पहा ▼',
      // Recommended Card Elements
      heroChoiceBadge: '⭐ #1 आपल्या शेतासाठी सर्वोत्तम निवड (Best Choice)',
      heroConfidenceChip: 'उच्च अचूकता (High Confidence)',
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
      shareBtnText: '📲 WhatsApp शेअर'
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
      subtabAdvisory: 'ਖੇਤੀ ਮਾਹਿਰ ਸਲਾਹ (Agro Advisory)',
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
      shareBtnText: '📲 WhatsApp ਸ਼ੇਅਰ'
    },
    gu: {
      navAdvisory: 'પાક સલાહ (Advisory)',
      navWeather: 'હવામાન ચેતવણી',
      navSoil: 'ખાતર ભલામણ (Fertilizer)',
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
      subtabAdvisory: 'કૃષિ નિષ્ણાત સલાહ (Agro Advisory)',
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
      shareBtnText: '📲 WhatsApp શેર'
    },
    te: {
      navAdvisory: 'పంట సలహా (Advisory)',
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
      subtabAdvisory: 'వ్యవసాయ నిపుణుల సలహా (Agro Advisory)',
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
      navAdvisory: 'பயிர் ஆலோசனை (Advisory)',
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
      subtabAdvisory: 'வேளாண் நிபுணர் ஆலோசனை (Agro Advisory)',
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
      shareBtnText: '📲 WhatsApp பகிர்'
    },
    bn: {
      navAdvisory: 'ফসল পরামর্শ (Advisory)',
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
      subtabAdvisory: 'কৃষি বিশেষজ্ঞ পরামর্শ (Agro Advisory)',
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
      shareBtnText: '📲 WhatsApp শেয়ার'
    },
    kn: {
      navAdvisory: 'ಬೆಳೆ ಸಲಹೆ (Advisory)',
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
      subtabAdvisory: 'ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆ (Agro Advisory)',
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
      shareBtnText: '📲 WhatsApp ಹಂಚಿಕೊಳ್ಳಿ'
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
    rice: { en: 'RICE', hi: 'धान (Paddy)', mr: 'भात / धान' },
    wheat: { en: 'WHEAT', hi: 'गेहूं (Wheat)', mr: 'गहू (Wheat)' },
    cotton: { en: 'COTTON', hi: 'कपास (Cotton)', mr: 'कापूस (Cotton)' },
    maize: { en: 'MAIZE', hi: 'मक्का (Maize)', mr: 'मका (Maize)' },
    sugarcane: { en: 'SUGARCANE', hi: 'गन्ना (Sugarcane)', mr: 'ऊस (Sugarcane)' },
    potato: { en: 'POTATO', hi: 'आलू (Potato)', mr: 'बटाटा (Potato)' },
    tomato: { en: 'TOMATO', hi: 'टमाटर (Tomato)', mr: 'टोमॅटो (Tomato)' },
    mustard: { en: 'MUSTARD', hi: 'सरसों (Mustard)', mr: 'मोहरी (Mustard)' },
    soybean: { en: 'SOYBEAN', hi: 'सोयाबीन (Soybean)', mr: 'सोयाबीन (Soybean)' },
    groundnut: { en: 'GROUNDNUT', hi: 'मूंगफली (Groundnut)', mr: 'भुईमूग (Groundnut)' },
    onion: { en: 'ONION', hi: 'प्याज (Onion)', mr: 'कांदा (Onion)' },
    chilli: { en: 'CHILLI', hi: 'मिर्च (Chilli)', mr: 'मिरची (Chilli)' },
    banana: { en: 'BANANA', hi: 'केला (Banana)', mr: 'केळी (Banana)' },
    apple: { en: 'APPLE', hi: 'सेब (Apple)', mr: 'सफरचंद (Apple)' },
    grapes: { en: 'GRAPES', hi: 'अंगूर (Grapes)', mr: 'द्राक्षे (Grapes)' },
    ginger: { en: 'GINGER', hi: 'अदरक (Ginger)', mr: 'आले (Ginger)' },
    turmeric: { en: 'TURMERIC', hi: 'हल्दी (Turmeric)', mr: 'हळद (Turmeric)' },
    pomegranate: { en: 'POMEGRANATE', hi: 'अनार (Pomegranate)', mr: 'डाळिंब (Pomegranate)' },
    watermelon: { en: 'WATERMELON', hi: 'तरबूज (Watermelon)', mr: 'कलिंगड (Watermelon)' },
    chickpea: { en: 'CHICKPEA', hi: 'चना (Gram)', mr: 'हरभरा (Gram)' }
  };

  const PATHOGEN_TYPE_I18N = {
    'fungal': { en: 'Fungal', hi: 'फफूंद जनित (Fungal)', mr: 'बुरशीजन्य (Fungal)' },
    'bacterial': { en: 'Bacterial', hi: 'जीवाणु जनित (Bacterial)', mr: 'जिवाणूजन्य (Bacterial)' },
    'viral': { en: 'Viral', hi: 'विषाणु जनित (Viral)', mr: 'विषाणूजन्य (Viral)' },
    'insect pest': { en: 'Insect Pest', hi: 'कीट प्रकोप (Insect Pest)', mr: 'कीटक प्रादुर्भाव (Insect Pest)' }
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

    const dId = d.id || '';
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
    let bioText = 'जैविक नियंत्रण उपचार';
    let chemText = 'उचित रासायनिक फफूंदनाशक का छिड़काव करें';
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

  function getCropMeta(cropKey, fallbackProfile = {}) {
    const key = (cropKey || '').toLowerCase();
    const lang = state.language || 'hi';
    const base = AGRONOMIC_METADATA[key];

    if (base) {
      const getL = (field, fallback = '') => {
        if (!field) return fallback;
        if (typeof field === 'string') return field;
        return field[lang] || field['hi'] || field['en'] || fallback;
      };

      const ratFn = base.rationale ? (base.rationale[lang] || base.rationale['hi'] || base.rationale['en']) : null;

      return {
        fullName: getL(base.fullName, cropKey),
        seasonBadge: getL(base.seasonBadge, 'Kharif Prime'),
        varieties: getL(base.varieties, 'Certified Regional Varieties'),
        yield: getL(base.yield, '40 – 48 Q/Ha'),
        yieldSub: getL(base.yieldSub, 'Optimal Management'),
        water: getL(base.water, 'Moderate'),
        waterSub: getL(base.waterSub, 'Well-drained Soil'),
        price: getL(base.price, 'MSP Protected'),
        priceSub: getL(base.priceSub, 'High Liquidity'),
        duration: getL(base.duration, '120 Days'),
        durationSub: getL(base.durationSub, 'Full Cycle'),
        basalDose: getL(base.basalDose, 'Apply balanced NPK as per SAU guidelines.'),
        rationale: ratFn || ((n, rain) => `Strong agronomic fit for current field conditions.`)
      };
    }

    const cleanName = cropKey.charAt(0).toUpperCase() + cropKey.slice(1);
    const cropLocal = CROP_NAME_I18N[key] ? (CROP_NAME_I18N[key][lang] || cleanName) : cleanName;

    return {
      fullName: `${cropLocal} (${fallbackProfile.cycle_days || 'Standard'})`,
      seasonBadge: lang === 'en' ? 'Agro Recommended' : (lang === 'mr' ? 'शिफारस केलेले पीक' : 'अनुशंसित फसल'),
      varieties: lang === 'en' ? `Certified Regional Varieties (${cleanName})` : (lang === 'mr' ? `प्रमाणित विभागीय वाण (${cropLocal})` : `प्रमाणित क्षेत्रीय किस्में (${cropLocal})`),
      yield: '30 – 40 Q/Ha',
      yieldSub: lang === 'en' ? 'Optimal Management' : (lang === 'mr' ? 'उत्तम व्यवस्थापन' : 'इष्टतम प्रबंधन'),
      water: fallbackProfile.water_demand || 'Moderate',
      waterSub: fallbackProfile.soil_type || 'Loamy Soils',
      price: fallbackProfile.economic_outlook ? fallbackProfile.economic_outlook.split(' ')[0] : 'High Liquidity',
      priceSub: lang === 'en' ? 'Active Mandi Trade' : (lang === 'mr' ? 'बाजारपेठेत चांगली मागणी' : 'सक्रिय मंडी मांग'),
      duration: fallbackProfile.cycle_days || '90 – 120 Days',
      durationSub: lang === 'en' ? 'Season Duration' : (lang === 'mr' ? 'हंगाम कालावधी' : 'मौसम अवधि'),
      basalDose: lang === 'en' ? 'Apply balanced NPK dose as per University guidelines.' : (lang === 'mr' ? 'विद्यापीठाच्या शिफारशीनुसार संतुलित खतांचा डोस द्या.' : 'विश्वविद्यालय दिशानिर्देशों के अनुसार संतुलित NPK खुराक दें।'),
      rationale: (n, rain) => lang === 'en'
        ? `Strong agronomic fit for current field conditions with balanced soil test indices.`
        : (lang === 'mr'
          ? `सध्याच्या माती चाचणीनुसार व हवामानानुसार हे पीक आपल्या शेतासाठी अत्यंत अनुकूल आहे.`
          : `वर्तमान मिट्टी परीक्षण और जलवायु के अनुसार यह फसल आपके खेत के लिए बहुत अनुकूल है।`)
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
    const t = TRANSLATIONS[lang] || TRANSLATIONS['hi'];
    const listenLabel = t.listenBtnText || '🔊 Listen';
    const stopLabel = '⏹️ Stop';

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

    const langVoiceMap = {
      en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN',
      pa: 'pa-IN', gu: 'gu-IN', te: 'te-IN',
      ta: 'ta-IN', bn: 'bn-IN', kn: 'kn-IN'
    };
    utterance.lang = langVoiceMap[lang] || 'hi-IN';
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

    // Re-render disease doctor cards if active or loaded
    if (state.lastDiseaseData) {
      renderDiseases(state.lastDiseaseData);
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
                  <p class="advisory-summary-text">${diag.summary || (lang === 'en' ? 'Your field soil and current rainfall naturally support cultivating this crop.' : (lang === 'mr' ? 'आपली जमीन आणि स्थानिक हवामान या पिकासाठी अत्यंत अनुकूल आहे.' : 'आपकी मिट्टी और जलवायु इस फसल के लिए पूरी तरह अनुकूल है।'))}</p>
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
                 <div class="advisory-issues-title">${lang === 'en' ? '⚠️ Key Limiting Factors for' : (lang === 'mr' ? '⚠️ अपयशाची मुख्य कारणे:' : '⚠️ विफलता के मुख्य कारण:')} ${targetMeta.fullName}:</div>
                 ${diag.issues.map(iss => `<div class="advisory-issue-item">❌ <strong>${iss.param} (${iss.status}):</strong> ${iss.detail}</div>`).join('')}
               </div>`
            : '';

          const rescueTitle = (t.rescueToggleLabel || '🛠️ If you still want to cultivate {crop}: View Rescue Roadmap ▼').replace('{crop}', targetMeta.fullName);

          const rescueHtml = (diag.rescue_roadmap && diag.rescue_roadmap.length > 0)
            ? `<button type="button" class="rescue-accordion-btn" id="btn-toggle-rescue">${rescueTitle}</button>
               <div class="rescue-roadmap-panel is-hidden" id="rescue-panel">
                 <div class="rescue-roadmap-title">${lang === 'en' ? 'Intensive Rescue & Soil Amendment Protocol:' : (lang === 'mr' ? 'विशेष जमीन सुधारणा व तांत्रिक उपाय:' : 'विशेष मिट्टी सुधार व तकनीकी बचाव उपाय:')}</div>
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
                ${lang === 'en' 
                  ? `💡 <strong>Why switch to ${topMeta.fullName}:</strong> Rather than risking losses with ${targetMeta.fullName}, ${topMeta.fullName} naturally matches your available soil nutrients (${currentN} kg/ha N) and rainfall (${currentRain} mm), delivering a protected harvest of ${topMeta.yield} with ${topMeta.priceSub}.`
                  : (lang === 'mr'
                    ? `💡 <strong>${topMeta.fullName} का निवडावे:</strong> ${targetMeta.fullName} मधील नुकसान टाळून, ${topMeta.fullName} आपल्या जमिनीतील घटक (${currentN} नत्र) आणि मान्सून पावसाचा (${currentRain} मिमी) परिपूर्ण वापर करते, आणि ${topMeta.yield} हमखास उत्पन्न देते.`
                    : `💡 <strong>${topMeta.fullName} क्यों चुनें:</strong> ${targetMeta.fullName} में फसल विफलता का जोखिम लेने के बजाय, ${topMeta.fullName} आपकी मिट्टी (${currentN} N) और वर्षा (${currentRain} mm) के पूर्णतः अनुकूल है, जिससे ${topMeta.yield} की सुरक्षित पैदावार मिलती है।`)}
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
    if (bestCalLink) bestCalLink.textContent = t.calendarLink;

    // Attach Voice & WhatsApp to new Best Choice
    const dynamicBestVoice = document.getElementById('best-voice-btn');
    if (dynamicBestVoice) {
      dynamicBestVoice.innerHTML = t.listenBtnText;
      const spText = lang === 'en'
        ? `Top recommended crop: ${bestMeta.fullName}. Match confidence ${best.confidence} percent. Expected yield: ${bestMeta.yield}. Water need: ${bestMeta.water}. Duration: ${bestMeta.duration}.`
        : (lang === 'mr'
          ? `प्रथम शिफारस केलेले पीक: ${bestMeta.fullName}. योग्यतेचे प्रमाण ${best.confidence} टक्के. अपेक्षित उत्पादन: ${bestMeta.yield}. पाण्याची गरज: ${bestMeta.water}. कालावधी: ${bestMeta.duration}.`
          : `शीर्ष अनुशंसित फसल: ${bestMeta.fullName}. मैच आत्मविश्वास ${best.confidence} प्रतिशत. अपेक्षित उपज: ${bestMeta.yield}. जल आवश्यकता: ${bestMeta.water}. फसल अवधि: ${bestMeta.duration}.`);
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
      if (alt1Score) alt1Score.textContent = `${alt1.confidence}% ${t.altMatchText}`;
      if (alt1Title) alt1Title.textContent = alt1Meta.fullName;
      if (alt1Desc) alt1Desc.textContent = alt1Meta.rationale(currentN, currentRain, lang);
      if (alt1LblWater) alt1LblWater.textContent = t.altLblWater;
      if (alt1Water) alt1Water.textContent = alt1Meta.water;
      if (alt1LblYield) alt1LblYield.textContent = t.altLblYield;
      if (alt1Yield) alt1Yield.textContent = alt1Meta.yield;
      if (alt1LblRisk) alt1LblRisk.textContent = t.altLblRisk;
      if (alt1Risk) alt1Risk.textContent = alt1Meta.priceSub;
      if (alt1FertLink) alt1FertLink.textContent = t.altFertLink;

      const alt1V = document.getElementById('alt-1-voice-btn');
      if (alt1V) {
        alt1V.onclick = () => toggleSpeech(`${t.altTag1}: ${alt1Meta.fullName}. ${t.altMatchText} ${alt1.confidence}%.`, alt1V);
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
      if (alt2Score) alt2Score.textContent = `${alt2.confidence}% ${t.altMatchText}`;
      if (alt2Title) alt2Title.textContent = alt2Meta.fullName;
      if (alt2Desc) alt2Desc.textContent = alt2Meta.rationale(currentN, currentRain, lang);
      if (alt2LblWater) alt2LblWater.textContent = t.altLblWater;
      if (alt2Water) alt2Water.textContent = alt2Meta.water;
      if (alt2LblYield) alt2LblYield.textContent = t.altLblYield;
      if (alt2Yield) alt2Yield.textContent = alt2Meta.yield;
      if (alt2LblRisk) alt2LblRisk.textContent = t.altLblRisk;
      if (alt2Risk) alt2Risk.textContent = alt2Meta.priceSub;
      if (alt2FertLink) alt2FertLink.textContent = t.altFertLink;

      const alt2V = document.getElementById('alt-2-voice-btn');
      if (alt2V) {
        alt2V.onclick = () => toggleSpeech(`${t.altTag2}: ${alt2Meta.fullName}. ${t.altMatchText} ${alt2.confidence}%.`, alt2V);
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
        vBtn.addEventListener('click', () => toggleSpeech(readout, vBtn));
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
        waBtn.addEventListener('click', () => shareOnWhatsApp(loc.name, waText));
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
        populateTargetCrops(state.language);
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

    // 4. Auto-Detect Weather & Field Location (GPS / IP Telemetry)
    autoDetectWeather(false);
  }

  initApp();
});
