/**
 * SPARC AI — Modern Interactive Client Controller
 * Connects Vercel Web UI to FastAPI Serverless Endpoints & Plotly WebGL Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Global State ──
  const state = {
    currentCity: 'New Delhi',
    currentWeather: {
      temperature: 28.0,
      humidity: 45.0,
      rainfall: 0.0,
    },
    crops: [],
    diseaseCrops: [],
    indianStates: [],
    lastFertData: null,
    activeChartMode: 'bar'
  };

  // ── DOM References ──
  // Navigation Tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Sliders & Value Displays (Crop Recommender)
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

  // Fertilizer Sliders
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
  const telemetryCity = document.getElementById('telemetry-city');
  const telemetryTemp = document.getElementById('telemetry-temp');
  const telemetryHumidity = document.getElementById('telemetry-humidity');
  const telemetryRain = document.getElementById('telemetry-rain');
  const btnDetectGps = document.getElementById('btn-detect-gps');
  const btnChangeCity = document.getElementById('btn-change-city');
  const btnSyncWeather = document.getElementById('btn-sync-weather');

  // City Modal DOM
  const cityModal = document.getElementById('city-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const citySearchInput = document.getElementById('city-search-input');
  const citySearchBtn = document.getElementById('city-search-btn');
  const cityPresetChips = document.querySelectorAll('.preset-chip');

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
      navTabs.forEach(t => t.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPanel = document.getElementById(tab.dataset.tab);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      // If switching to fertilizer tab with existing chart, trigger resize
      if (tab.dataset.tab === 'fertilizer-prescriber' && state.lastFertData && window.Plotly) {
        setTimeout(() => window.Plotly.Plots.resize('fert-plotly-chart'), 100);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. SLIDER & VALUE SYNC
  // ─────────────────────────────────────────────────────────────────────────
  Object.keys(sliders).forEach(key => {
    if (sliders[key] && displays[key]) {
      sliders[key].addEventListener('input', (e) => {
        displays[key].textContent = e.target.value;
      });
    }
  });

  Object.keys(fertSliders).forEach(key => {
    if (fertSliders[key] && fertDisplays[key]) {
      fertSliders[key].addEventListener('input', (e) => {
        fertDisplays[key].textContent = e.target.value;
      });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. RESILIENT API FETCH & TELEMETRY
  // ─────────────────────────────────────────────────────────────────────────
  async function apiFetch(url, options = {}) {
    try {
      let res = await fetch(url, options);
      if (res.status === 404 || res.status === 405) {
        const altUrl = url.startsWith('/api/') ? url.replace('/api/', '/') : (url.startsWith('/') ? '/api' + url : '/api/' + url);
        console.warn(`[SPARC API] Status ${res.status} on ${url}, attempting alternate route: ${altUrl}`);
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
      telemetryCity.textContent = 'Updating...';
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

        telemetryCity.textContent = `${t.city || query}, ${t.country || 'India'}`;
        telemetryTemp.textContent = `${t.temperature.toFixed(1)}°C`;
        telemetryHumidity.textContent = `${t.humidity.toFixed(0)}%`;
        telemetryRain.textContent = `${(t.rainfall || 0).toFixed(0)} mm`;
      }
    } catch (err) {
      console.warn('Telemetry fetch error, using fallback:', err);
      telemetryCity.textContent = query;
    }
  }

  // Auto-sync live weather into sliders
  btnSyncWeather.addEventListener('click', () => {
    sliders.temp.value = state.currentWeather.temperature;
    displays.temp.textContent = state.currentWeather.temperature;

    sliders.hum.value = state.currentWeather.humidity;
    displays.hum.textContent = state.currentWeather.humidity;

    if (state.currentWeather.rainfall > 0) {
      sliders.rain.value = state.currentWeather.rainfall;
      displays.rain.textContent = state.currentWeather.rainfall;
    }

    btnSyncWeather.textContent = '✅ Synced with Live Weather';
    setTimeout(() => {
      btnSyncWeather.textContent = '🛰️ Auto-Fill Live Weather';
    }, 2000);
  });

  // Modal Controls
  btnChangeCity.addEventListener('click', () => {
    cityModal.classList.add('open');
    citySearchInput.focus();
  });

  modalCloseBtn.addEventListener('click', () => {
    cityModal.classList.remove('open');
  });

  cityModal.addEventListener('click', (e) => {
    if (e.target === cityModal) cityModal.classList.remove('open');
  });

  citySearchBtn.addEventListener('click', () => {
    const val = citySearchInput.value.trim();
    if (val) {
      fetchLiveTelemetry(val);
      cityModal.classList.remove('open');
    }
  });

  citySearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') citySearchBtn.click();
  });

  cityPresetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const city = chip.dataset.city;
      fetchLiveTelemetry(city);
      cityModal.classList.remove('open');
    });
  });

  // HTML5 GPS Geolocation
  btnDetectGps.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    telemetryCity.textContent = 'Detecting GPS...';
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Open-Meteo reverse weather telemetry
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation`);
          const data = await res.json();
          if (data && data.current) {
            state.currentWeather = {
              temperature: data.current.temperature_2m,
              humidity: data.current.relative_humidity_2m,
              rainfall: data.current.precipitation || 0
            };
            telemetryCity.textContent = `GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`;
            telemetryTemp.textContent = `${state.currentWeather.temperature.toFixed(1)}°C`;
            telemetryHumidity.textContent = `${state.currentWeather.humidity.toFixed(0)}%`;
            telemetryRain.textContent = `${state.currentWeather.rainfall.toFixed(0)} mm`;
          }
        } catch (e) {
          telemetryCity.textContent = 'GPS Active';
        }
      },
      (err) => {
        telemetryCity.textContent = state.currentCity;
        alert('Could not access location. Please check your browser permissions.');
      }
    );
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. AGRO-ECOLOGICAL PRESETS
  // ─────────────────────────────────────────────────────────────────────────
  const agroPresets = {
    punjab: { n: 130, p: 55, k: 45, temp: 22.0, hum: 60, ph: 7.2, rain: 85 },
    blackcotton: { n: 80, p: 40, k: 60, temp: 28.5, hum: 70, ph: 7.8, rain: 130 },
    kerala: { n: 90, p: 35, k: 120, temp: 29.0, hum: 85, ph: 5.5, rain: 240 },
    millet: { n: 45, p: 25, k: 30, temp: 34.0, hum: 35, ph: 8.0, rain: 45 }
  };

  document.querySelectorAll('.agro-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = agroPresets[btn.dataset.preset];
      if (!p) return;
      Object.keys(p).forEach(k => {
        if (sliders[k] && displays[k]) {
          sliders[k].value = p[k];
          displays[k].textContent = p[k];
        }
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. CROP RECOMMENDATION SUBMIT
  // ─────────────────────────────────────────────────────────────────────────
  cropForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    predictSpinner.style.display = 'inline-block';
    resultsStatus.textContent = 'Analyzing...';

    const payload = {
      nitrogen: parseFloat(sliders.n.value),
      phosphorus: parseFloat(sliders.p.value),
      potassium: parseFloat(sliders.k.value),
      temperature: parseFloat(sliders.temp.value),
      humidity: parseFloat(sliders.hum.value),
      ph: parseFloat(sliders.ph.value),
      rainfall: parseFloat(sliders.rain.value),
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
        renderRecommendations(data);
        resultsStatus.textContent = 'AI Classified (99.3%)';
      } else {
        alert(data.detail || 'Prediction failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error connecting to API.');
    } finally {
      predictSpinner.style.display = 'none';
    }
  });

  // ── Helper Diagnostic & Mitigation Formatters (100% Object-Safe) ──
  function formatIssues(issues, riskLevel) {
    if (!issues || issues.length === 0) return '';
    const itemsHtml = issues.map(iss => {
      if (typeof iss === 'object' && iss !== null) {
        const title = iss.param ? `${iss.param} [${iss.status || 'Alert'}]` : (iss.status || 'Physiological Stress');
        const detail = iss.detail || '';
        return `<div class="stress-item">• <strong>${title}:</strong> ${detail}</div>`;
      }
      return `<div class="stress-item">• ${iss}</div>`;
    }).join('');

    return `
      <div class="stress-box">
        <strong>⚠️ Physiological Diagnostics (${riskLevel || 'FIELD ALERT'}):</strong>
        ${itemsHtml}
      </div>
    `;
  }

  function formatRescueRoadmap(roadmap) {
    if (!roadmap || roadmap.length === 0) return '';
    const itemsHtml = roadmap.map(a => {
      if (typeof a === 'object' && a !== null) {
        const category = a.category || a.issue || 'Actionable Protocol';
        const action = a.action || a.solution || a.detail || '';
        const impact = a.impact ? `<div class="rescue-impact"><em>Agronomic Impact:</em> ${a.impact}</div>` : '';
        return `
          <div class="rescue-item">
            <div class="rescue-category">🌱 ${category}</div>
            <div class="rescue-action"><strong>Action:</strong> ${action}</div>
            ${impact}
          </div>
        `;
      }
      return `<div class="rescue-item"><div class="rescue-action">• ${a}</div></div>`;
    }).join('');

    return `
      <div class="rescue-box">
        <strong>🛡️ "How to Grow Anyway" Actionable Mitigation & Rescue Roadmap:</strong>
        ${itemsHtml}
      </div>
    `;
  }

  function formatDiseaseRisks(risks, cropName) {
    if (!risks || risks.length === 0) return '';
    const itemsHtml = risks.map(d => {
      if (typeof d === 'object' && d !== null) {
        const name = d.disease_name || d.name || d.disease || 'Plant Disease';
        const sev = d.severity || 'Risk Watch';
        const cond = d.condition || '';
        const remedy = d.immediate_remedy ? ` <em>Immediate Remedy:</em> <strong>${d.immediate_remedy}</strong>` : '';
        return `
          <div class="disease-risk-item">
            • <strong style="color: #F87171;">${name} (${sev}):</strong> ${cond}${remedy}
          </div>
        `;
      }
      return `<div class="disease-risk-item">• ${d}</div>`;
    }).join('');

    return `
      <div class="disease-risk-box">
        <strong>⚠️ Pathogen & Disease Incubation Watch for ${cropName || 'Selected Crop'}:</strong>
        ${itemsHtml}
      </div>
    `;
  }

  function renderRecommendations(data) {
    cropPlaceholder.classList.add('is-hidden');
    recommendationsList.classList.remove('is-hidden');
    recommendationsList.innerHTML = '';

    const targetDiag = data.target_diagnosis;
    const recs = data.recommendations || [];

    // 1. RENDER PLANNED TARGET CROP CARD IF SELECTED
    if (targetDiag) {
      const targetCard = document.createElement('div');
      targetCard.className = 'target-crop-card';

      const riskLvl = targetDiag.risk_level || 'Moderate Risk';
      const riskBadgeClass = riskLvl.toLowerCase().includes('low') ? 'badge-emerald' : (riskLvl.toLowerCase().includes('severe') || riskLvl.toLowerCase().includes('high') ? 'badge-rose' : 'badge-amber');
      const score = targetDiag.compatibility_score || 85;

      const stressHtml = formatIssues(targetDiag.issues, riskLvl);
      const rescueHtml = formatRescueRoadmap(targetDiag.rescue_roadmap);
      const diseaseHtml = formatDiseaseRisks(targetDiag.disease_risks, targetDiag.crop);

      targetCard.innerHTML = `
        <div class="target-card-header">
          <div class="target-title-group">
            <h3>🎯 Planned Crop: ${targetDiag.crop}</h3>
            <span style="font-size: 0.85rem; color: var(--gold-primary);">Your Designated Intended Crop</span>
          </div>
          <div class="target-badges">
            <span class="badge ${riskBadgeClass}">Status: ${riskLvl}</span>
            <span class="badge badge-gold">${score}% Compatibility</span>
          </div>
        </div>

        <div class="target-summary">
          ${targetDiag.summary || `Agronomic diagnostic evaluation for cultivating ${targetDiag.crop} under current field parameters.`}
        </div>

        <div class="crop-meta-grid" style="margin-bottom: 1rem;">
          <div class="meta-item">
            <strong>Cycle Duration:</strong> <span>${targetDiag.profile?.cycle_days || 'Seasonal'}</span>
          </div>
          <div class="meta-item">
            <strong>Water Demand:</strong> <span>${targetDiag.profile?.water_demand || 'Moderate'}</span>
          </div>
          <div class="meta-item">
            <strong>Preferred Soil:</strong> <span>${targetDiag.profile?.soil_type || 'Loamy'}</span>
          </div>
          <div class="meta-item">
            <strong>Commercial Outlook:</strong> <span>${targetDiag.profile?.economic_outlook || 'High market demand'}</span>
          </div>
        </div>

        ${stressHtml}
        ${rescueHtml}
        ${diseaseHtml}
      `;

      recommendationsList.appendChild(targetCard);
    }

    // Section title for AI Alternatives
    const recsHeader = document.createElement('div');
    recsHeader.className = 'recs-section-header';
    recsHeader.innerHTML = targetDiag 
      ? `<span>🌾 AI Recommended Alternative Crops (Scikit-Learn 99.3% Accuracy)</span>` 
      : `<span>🌾 Top AI Crop Suitability Recommendations</span>`;
    recommendationsList.appendChild(recsHeader);

    // 2. RENDER TOP 3 RECOMMENDED CROPS
    recs.forEach(item => {
      const card = document.createElement('div');
      card.className = 'crop-card';

      const stressHtml = formatIssues(item.issues, item.risk_level);
      const rescueHtml = formatRescueRoadmap(item.rescue_roadmap);
      const diseaseHtml = formatDiseaseRisks(item.disease_risks, item.crop);

      card.innerHTML = `
        <div class="crop-card-header">
          <div class="crop-name-group">
            <span class="crop-rank">#${item.rank}</span>
            <span class="crop-title">${item.crop}</span>
          </div>
          <span class="badge ${item.rank === 1 ? 'badge-gold' : 'badge-emerald'}">
            ${item.confidence}% Match
          </span>
        </div>

        <div class="confidence-bar-wrapper">
          <div class="confidence-bar-bg">
            <div class="confidence-fill" style="width: ${item.confidence}%;"></div>
          </div>
        </div>

        <div class="crop-meta-grid">
          <div class="meta-item">
            <strong>Crop Cycle:</strong> <span>${item.profile.cycle_days || 'Seasonal'}</span>
          </div>
          <div class="meta-item">
            <strong>Water Demand:</strong> <span>${item.profile.water_demand || 'Moderate'}</span>
          </div>
          <div class="meta-item">
            <strong>Preferred Soil:</strong> <span>${item.profile.soil_type || 'Loamy'}</span>
          </div>
          <div class="meta-item">
            <strong>Economic Outlook:</strong> <span>${item.profile.economic_outlook || 'High liquidity'}</span>
          </div>
        </div>

        ${stressHtml}
        ${rescueHtml}
        ${diseaseHtml}
      `;

      recommendationsList.appendChild(card);
    });
  }



  // ─────────────────────────────────────────────────────────────────────────
  // 6. FERTILIZER PRESCRIBER SUBMIT & CHART
  // ─────────────────────────────────────────────────────────────────────────
  fertForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    fertSpinner.style.display = 'inline-block';

    const payload = {
      nitrogen: parseFloat(fertSliders.n.value),
      phosphorus: parseFloat(fertSliders.p.value),
      potassium: parseFloat(fertSliders.k.value),
      ph: parseFloat(fertSliders.ph.value),
      target_crop: fertCropSelect.value,
      state: fertStateSelect.value || null
    };

    try {
      const res = await apiFetch('/fertilizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.prescription) {
        state.lastFertData = data;
        renderFertilizerResults(data);
      } else {
        alert(data.detail || 'Fertilizer calculation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Error calculating fertilizer.');
    } finally {
      fertSpinner.style.display = 'none';
    }
  });

  function renderFertilizerResults(data) {
    fertPlaceholder.classList.add('is-hidden');
    fertContent.classList.remove('is-hidden');

    const p = data.prescription;
    const comm = p.commercial_doses || {};

    // Metric Cards
    const ureaKg = comm.urea_kg || 0;
    const dapKg = comm.dap_kg || 0;
    const mopKg = comm.mop_kg || 0;

    document.getElementById('metric-urea').innerHTML = `${ureaKg.toFixed(1)} <span class="sub-unit">kg/ha</span>`;
    document.getElementById('metric-urea-bags').textContent = `≈ ${(ureaKg / 50).toFixed(1)} standard 50kg bags`;

    document.getElementById('metric-dap').innerHTML = `${dapKg.toFixed(1)} <span class="sub-unit">kg/ha</span>`;
    document.getElementById('metric-dap-bags').textContent = `≈ ${(dapKg / 50).toFixed(1)} standard 50kg bags`;

    document.getElementById('metric-mop').innerHTML = `${mopKg.toFixed(1)} <span class="sub-unit">kg/ha</span>`;
    document.getElementById('metric-mop-bags').textContent = `≈ ${(mopKg / 50).toFixed(1)} standard 50kg bags`;

    // Timeline Schedule
    const timeline = document.getElementById('fert-timeline');
    timeline.innerHTML = '';
    const stages = p.application_schedule || [
      { stage: "Basal Application (At Sowing)", advice: `Apply 100% DAP (${dapKg.toFixed(0)} kg), 100% MOP (${mopKg.toFixed(0)} kg), and 33% Urea (${(ureaKg*0.33).toFixed(0)} kg).` },
      { stage: "Vegetative / Tillering Stage", advice: `Top-dress 33% Urea (${(ureaKg*0.33).toFixed(0)} kg) with irrigation.` },
      { stage: "Panicle / Flowering Stage", advice: `Top-dress remaining 33% Urea (${(ureaKg*0.34).toFixed(0)} kg) for robust grain filling.` }
    ];

    stages.forEach(st => {
      const step = document.createElement('div');
      step.className = 'timeline-step';
      step.innerHTML = `
        <div class="step-marker"></div>
        <div>
          <strong style="color: #FFFFFF;">${st.stage}:</strong>
          <div style="color: var(--text-muted); margin-top: 0.15rem;">${st.advice}</div>
        </div>
      `;
      timeline.appendChild(step);
    });

    // Render Chart
    renderFertilizerChart(p, state.activeChartMode);
  }

  // Plotly Chart Generator
  function renderFertilizerChart(p, mode) {
    if (!window.Plotly) return;

    const cur = p.current_npk || {};
    const tar = p.target_npk || {};

    const curVals = [cur.N || 0, cur.P || 0, cur.K || 0];
    const tarVals = [tar.N || 0, tar.P || 0, tar.K || 0];

    if (mode === '3d') {
      const traceCurrent = {
        type: 'scatter3d',
        mode: 'lines+markers+text',
        x: [0, 1, 2],
        y: [0, 0, 0],
        z: curVals,
        text: ['Current N', 'Current P', 'Current K'],
        line: { color: '#06B6D4', width: 8 },
        marker: { size: 6, color: '#06B6D4' },
        name: 'Field Current'
      };

      const traceTarget = {
        type: 'scatter3d',
        mode: 'lines+markers+text',
        x: [0, 1, 2],
        y: [1, 1, 1],
        z: tarVals,
        text: ['Target N', 'Target P', 'Target K'],
        line: { color: '#F59E0B', width: 8 },
        marker: { size: 6, color: '#F59E0B' },
        name: 'Target Requirement'
      };

      const layout = {
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        margin: { l: 0, r: 0, b: 0, t: 20 },
        scene: {
          xaxis: { title: 'Nutrient', tickvals: [0, 1, 2], ticktext: ['N', 'P', 'K'], color: '#9CA3AF' },
          yaxis: { title: 'Profile', tickvals: [0, 1], ticktext: ['Current', 'Target'], color: '#9CA3AF' },
          zaxis: { title: 'kg/ha', color: '#9CA3AF' }
        },
        legend: { font: { color: '#F3F4F6' } }
      };

      Plotly.newPlot('fert-plotly-chart', [traceCurrent, traceTarget], layout, { responsive: true, displayModeBar: false });
    } else {
      // 2D Clustered Bar
      const trace1 = {
        x: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
        y: curVals,
        name: 'Current Soil',
        type: 'bar',
        marker: { color: '#06B6D4' }
      };

      const trace2 = {
        x: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
        y: tarVals,
        name: 'Required Target',
        type: 'bar',
        marker: { color: '#F59E0B' }
      };

      const layout = {
        barmode: 'group',
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        margin: { l: 40, r: 20, b: 40, t: 20 },
        xaxis: { color: '#9CA3AF' },
        yaxis: { title: 'kg/ha', color: '#9CA3AF', gridcolor: 'rgba(255,255,255,0.08)' },
        legend: { font: { color: '#F3F4F6' } }
      };

      Plotly.newPlot('fert-plotly-chart', [trace1, trace2], layout, { responsive: true, displayModeBar: false });
    }
  }

  // Chart Toggle Buttons
  document.getElementById('btn-chart-bar').addEventListener('click', () => {
    document.getElementById('btn-chart-bar').classList.add('active');
    document.getElementById('btn-chart-3d').classList.remove('active');
    state.activeChartMode = 'bar';
    if (state.lastFertData) renderFertilizerChart(state.lastFertData.prescription, 'bar');
  });

  document.getElementById('btn-chart-3d').addEventListener('click', () => {
    document.getElementById('btn-chart-3d').classList.add('active');
    document.getElementById('btn-chart-bar').classList.remove('active');
    state.activeChartMode = '3d';
    if (state.lastFertData) renderFertilizerChart(state.lastFertData.prescription, '3d');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 7. CROP DISEASE DOCTOR SEARCH
  // ─────────────────────────────────────────────────────────────────────────
  async function searchDiseases() {
    const crop = doctorCropSelect.value;
    const keyword = doctorSearchInput.value.trim();

    let url = `/diseases?temperature=${state.currentWeather.temperature}&humidity=${state.currentWeather.humidity}`;
    if (crop) url += `&crop=${encodeURIComponent(crop)}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

    try {
      const res = await apiFetch(url);
      const data = await res.json();
      if (data.success) {
        renderDiseases(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  btnSearchDisease.addEventListener('click', searchDiseases);
  doctorSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchDiseases();
  });
  doctorCropSelect.addEventListener('change', searchDiseases);

  function renderDiseases(data) {
    diseaseResultsContainer.innerHTML = '';

    // Live outbreak risk banner
    if (data.outbreak_risk && data.outbreak_risk.length > 0) {
      doctorRiskBanner.classList.remove('is-hidden');
      riskCropName.textContent = data.crop || 'Monitored Crop';
      riskItemsList.innerHTML = data.outbreak_risk.map(r => `
        <div style="font-size: 0.85rem; color: #FFFFFF; margin-top: 0.25rem;">
          • <strong>${r.disease}:</strong> ${r.risk_reason} (${r.risk_level} Risk)
        </div>
      `).join('');
    } else {
      doctorRiskBanner.classList.add('is-hidden');
    }

    if (!data.diseases || data.diseases.length === 0) {
      diseaseResultsContainer.innerHTML = `
        <div class="results-placeholder" style="grid-column: 1 / -1;">
          <div class="placeholder-icon">🩺</div>
          <h4>No Pathogens Found</h4>
          <p>No diseases matched your search criteria. Try a different crop or broader symptom keyword.</p>
        </div>
      `;
      return;
    }

    data.diseases.forEach(d => {
      const card = document.createElement('div');
      card.className = 'disease-card';
      card.innerHTML = `
        <div class="disease-header">
          <div>
            <div class="disease-name">${d.disease_name || d.disease}</div>
            <span class="disease-crop-tag">🌱 ${d.crop}</span>
          </div>
          <span class="badge badge-coral">${d.pathogen_type || 'Pathogen'}</span>
        </div>

        <div class="disease-section">
          <h5>Diagnostic Symptoms</h5>
          <p>${d.symptoms || 'Visual lesion details'}</p>
        </div>

        <div class="disease-section">
          <h5>Biological & Organic Treatment</h5>
          <p>${d.organic_control || d.biological_cure || 'Bio-fungicide protocol'}</p>
        </div>

        <div class="disease-section">
          <h5>Chemical Fungicide / Treatment</h5>
          <p>${d.chemical_cure || d.fungicide || 'Targeted chemical spray'}</p>
        </div>
      `;
      diseaseResultsContainer.appendChild(card);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 8. INDIAN SOIL REGISTRY
  // ─────────────────────────────────────────────────────────────────────────
  async function loadSoilStateProfile(stateName) {
    try {
      statePlaceholder.classList.remove('is-hidden');
      statePlaceholder.innerHTML = '<h4>Loading State Profile...</h4>';
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
      <div class="crop-card" style="margin-top: 1.5rem;">
        <div class="crop-card-header">
          <div>
            <h3 style="font-family: var(--font-display); font-size: 1.4rem; color: #FFFFFF;">${name}</h3>
            <span style="color: var(--gold-primary); font-size: 0.85rem; font-weight: 600;">Dominant Soil: ${p.dominant_soil_types || 'Alluvial & Loamy'}</span>
          </div>
          <span class="badge badge-gold">ICAR-IISS Benchmark</span>
        </div>

        <div class="crop-meta-grid" style="margin-top: 1rem;">
          <div class="meta-item">
            <strong>Nitrogen Rating:</strong> <span>${npk.nitrogen_status || 'Medium'}</span>
          </div>
          <div class="meta-item">
            <strong>Phosphorus Rating:</strong> <span>${npk.phosphorus_status || 'Low to Medium'}</span>
          </div>
          <div class="meta-item">
            <strong>Potassium Rating:</strong> <span>${npk.potassium_status || 'High'}</span>
          </div>
          <div class="meta-item">
            <strong>Organic Carbon:</strong> <span>${npk.organic_carbon || '0.45 - 0.75%'}</span>
          </div>
        </div>

        <div class="stress-box" style="margin-top: 1rem; border-color: var(--cyan-primary); background: rgba(6, 182, 212, 0.08);">
          <strong style="color: var(--cyan-primary);">🌾 Recommended Commercial Crops:</strong>
          <p style="color: var(--text-main); margin-top: 0.25rem;">${p.staple_crops || 'Paddy, Wheat, Sugarcane, Pulses'}</p>
        </div>

        <div class="rescue-box" style="margin-top: 1rem;">
          <strong>🏛️ State Agricultural University (SAU) Fertilizer Advisory:</strong>
          <p style="color: var(--text-main); margin-top: 0.25rem;">${p.sau_advisory || 'Balanced application with FYM and Micronutrient zinc enhancement.'}</p>
        </div>
      </div>
    `;
  }

  stateDropdown.addEventListener('change', () => {
    if (stateDropdown.value) {
      loadSoilStateProfile(stateDropdown.value);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 9. INITIALIZATION & DATA BOOTSTRAP
  // ─────────────────────────────────────────────────────────────────────────
  async function initApp() {
    // 1. Fetch live weather for default city
    fetchLiveTelemetry('New Delhi');

    // 2. Fetch supported crops
    try {
      const res = await apiFetch('/crops');
      const data = await res.json();
      if (data.crops) {
        state.crops = data.crops;
        if (selectTargetCrop) {
          const currentVal = selectTargetCrop.value || 'rice';
          selectTargetCrop.innerHTML = '<option value="">-- Let AI Recommend Top Suitable Crops --</option>' +
            data.crops.map(c => `<option value="${c}">${c.toUpperCase()}</option>`).join('');
          selectTargetCrop.value = currentVal;
        }
        fertCropSelect.innerHTML = data.crops.map(c => `<option value="${c}">${c.toUpperCase()}</option>`).join('');
        doctorCropSelect.innerHTML = `<option value="">All 38 Crops</option>` + data.crops.map(c => `<option value="${c}">${c.toUpperCase()}</option>`).join('');
        fertCropSelect.value = 'rice';
      }
    } catch (e) {
      console.warn('Crops bootstrap failed:', e);
    }

    // 3. Fetch Indian soil states
    try {
      const res = await apiFetch('/soil-states');
      const data = await res.json();
      if (data.states) {
        state.indianStates = data.states;
        stateDropdown.innerHTML = data.states.map(s => `<option value="${s}">${s}</option>`).join('');
        fertStateSelect.innerHTML = `<option value="">General Indian Benchmark</option>` + data.states.map(s => `<option value="${s}">${s}</option>`).join('');

        if (data.states.length > 0) {
          stateDropdown.value = data.states[0];
          loadSoilStateProfile(data.states[0]);
        }
      }
    } catch (e) {
      console.warn('Soil states bootstrap failed:', e);
    }

    // 4. Initial disease list
    searchDiseases();
  }

  initApp();
});
