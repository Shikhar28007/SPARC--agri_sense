"""
SPARC - Smart Python Based Agriculture Recommendation and Classification System
Main Production Application (Streamlit + Custom Thematic HTML/CSS + Auto-Location & Crop Rescue Engine)
"""

import time
import os
import json
from datetime import datetime
import streamlit as st
import streamlit.components.v1 as components
import pandas as pd
import numpy as np
import textwrap
try:
    import plotly.graph_objects as go
except ImportError:
    go = None

import requests

try:
    import importlib
    streamlit_js_eval = importlib.import_module("streamlit_js_eval").streamlit_js_eval
except Exception:
    streamlit_js_eval = None

try:
    import importlib
    streamlit_geolocation = importlib.import_module("streamlit_geolocation").streamlit_geolocation
except Exception:
    streamlit_geolocation = None

# Import unified Python backend service layer with hot-reload guard
import importlib
import backend
importlib.reload(backend)
from backend import db_instance, engine_instance, SUPPORTED_CROPS, REGIONAL_WEATHER_PRESETS
from pdf_generator import generate_agrisense_pdf_report
from botanical_theme import *

# ─────────────────────────────────────────────────────────────────────────────
# 3D FERTILIZER PRESCRIPTION GRAPH GENERATOR (WebGL 3D Engine)
# ─────────────────────────────────────────────────────────────────────────────
def build_3d_npk_graph(fert_calc: dict, active_crop: str, view_mode: str = "line_chart"):
    """Delegates to botanical_theme.build_3d_npk_graph with Earth-Science styling."""
    import botanical_theme
    return botanical_theme.build_3d_npk_graph(fert_calc, active_crop, view_mode)

# ─────────────────────────────────────────────────────────────────────────────
# STREAMLIT PAGE CONFIGURATION & MASTER BOTANICAL INJECTOR
# ─────────────────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="AgriSense AI // Botanical Specimen & Agronomic Field Station",
    page_icon=None,
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Apply master botanical herbarium & terracotta styling
st.markdown(inject_botanical_theme(), unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────────────────────
# GEOLOCATION, REVERSE-GEOCODING & WEATHER TELEMETRY PIPELINE
# ─────────────────────────────────────────────────────────────────────────────
def reverse_geocode_nominatim(lat: float, lon: float) -> Dict[str, Any]:
    """
    High-accuracy Reverse Geocoding via OpenStreetMap Nominatim API (zoom=14).
    Extracts the most granular local place name available in priority order:
    village -> town -> suburb -> city_district -> neighbourhood -> quarter -> city -> county.
    Combines with district, state, and country.
    """
    nom_url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=14&addressdetails=1"
    headers = {"User-Agent": "SPARC-AgriAI/3.0 (Smart Agriculture Precision System; sparc.app)"}
    try:
        resp = requests.get(nom_url, headers=headers, timeout=4.5)
        if resp.status_code == 200:
            data = resp.json()
            addr = data.get("address", {})
            local_name = (
                addr.get("village") or
                addr.get("town") or
                addr.get("suburb") or
                addr.get("city_district") or
                addr.get("neighbourhood") or
                addr.get("quarter") or
                addr.get("city") or
                addr.get("county") or
                f"Field ({lat:.3f}°N, {lon:.3f}°E)"
            )
            district = addr.get("state_district") or addr.get("county") or addr.get("city") or ""
            state = addr.get("state") or ""
            country = addr.get("country") or "India"
            postcode = addr.get("postcode", "")

            # Compose formatted locality string: e.g. "Bais Godam, Jaipur, Rajasthan (India)"
            components_list = [local_name]
            if district and district.lower() != local_name.lower():
                components_list.append(district)
            if state and state.lower() not in [c.lower() for c in components_list]:
                components_list.append(state)

            loc_str = ", ".join(components_list)
            if country:
                loc_str += f" ({country})"

            return {
                "city": local_name,
                "district": district,
                "state": state,
                "country": country,
                "postcode": postcode,
                "location": loc_str
            }
    except Exception:
        pass

    # Tier-2 Fallback: BigDataCloud Client Reverse Geocoder
    try:
        geo_url = f"https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}&longitude={lon}&localityLanguage=en"
        resp = requests.get(geo_url, timeout=3.5)
        if resp.status_code == 200:
            g = resp.json()
            local_name = g.get("locality") or g.get("city") or f"Field ({lat:.3f}°N, {lon:.3f}°E)"
            district = g.get("city") or g.get("localityInfo", {}).get("administrative", [{}])[-1].get("name", "")
            state = g.get("principalSubdivision") or ""
            country = g.get("countryName") or "India"
            loc_str = f"{local_name}, {state} ({country})" if state else f"{local_name} ({country})"
            return {
                "city": local_name,
                "district": district,
                "state": state,
                "country": country,
                "postcode": "",
                "location": loc_str
            }
    except Exception:
        pass

    return {
        "city": f"Field ({lat:.3f}°N, {lon:.3f}°E)",
        "district": "",
        "state": "",
        "country": "India",
        "postcode": "",
        "location": f"Field Station ({lat:.3f}°N, {lon:.3f}°E)"
    }


def fetch_live_telemetry(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """
    Fetches real-time temperature, humidity, rainfall, and weather conditions
    from Open-Meteo REST API using exact client latitude and longitude.
    """
    try:
        headers = {"User-Agent": "SPARC-AgriAI/3.0 (Smart Agriculture Precision System; sparc.app)"}
        weather_url = (
            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m"
            f"&daily=precipitation_sum&timezone=auto"
        )
        w_resp = requests.get(weather_url, headers=headers, timeout=5.0)
        if w_resp.status_code == 200:
            w_data = w_resp.json()
            current = w_data.get("current", {})
            temp = float(current.get("temperature_2m", 25.0))
            humidity = float(current.get("relative_humidity_2m", 60.0))
            live_rain = float(current.get("precipitation", 0.0))
            w_code = int(current.get("weather_code", 0))
            wind = float(current.get("wind_speed_10m", 8.0))

            wmo_codes = {
                0: ("Clear Sky", "CLEAR"), 1: ("Mainly Clear", "MOSTLY_CLEAR"), 2: ("Partly Cloudy", "PARTLY_CLOUDY"),
                3: ("Overcast", "OVERCAST"), 45: ("Fog & Mist", "FOG"), 48: ("Depositing Rime Fog", "RIME_FOG"),
                51: ("Light Drizzle", "DRIZZLE_LIGHT"), 53: ("Moderate Drizzle", "DRIZZLE_MOD"), 55: ("Dense Drizzle", "DRIZZLE_DENSE"),
                61: ("Slight Rain", "RAIN_LIGHT"), 63: ("Moderate Rain", "RAIN_MOD"), 65: ("Heavy Rain", "RAIN_HEAVY"),
                71: ("Slight Snow", "SNOW_LIGHT"), 73: ("Moderate Snow", "SNOW_MOD"), 75: ("Heavy Snow", "SNOW_HEAVY"),
                80: ("Rain Showers", "SHOWERS_LIGHT"), 81: ("Moderate Showers", "SHOWERS_MOD"), 82: ("Violent Showers", "SHOWERS_VIOLENT"),
                95: ("Thunderstorm", "STORM"), 96: ("Thunderstorm with Hail", "STORM_HAIL")
            }
            cond_text, cond_icon = wmo_codes.get(w_code, ("Clear Sky", "CLEAR"))
            daily_rain = sum(w_data.get("daily", {}).get("precipitation_sum", [12.0]))
            est_monthly_rain = max(20.0, min(450.0, float(daily_rain * 6.5 + 20.0)))

            return {
                "temperature": round(temp, 1),
                "humidity": round(humidity, 1),
                "live_rain": round(live_rain, 1),
                "rainfall": round(est_monthly_rain, 1),
                "weather_code": w_code,
                "condition": cond_text,
                "condition_icon": cond_icon,
                "wind_speed": round(wind, 1),
                "latitude": round(lat, 5),
                "longitude": round(lon, 5),
                "source": "Open-Meteo Satellite Telemetry",
                "status": "Live Connected",
                "is_gps_verified": True
            }
    except Exception:
        pass
    return None


def get_exact_gps_location() -> Optional[Dict[str, Any]]:
    """
    Acquires exact real-time GPS coordinates directly from the client browser
    using HTML5 navigator.geolocation with enableHighAccuracy: True.
    Reverse-geocodes with Nominatim and fetches live Open-Meteo telemetry.
    Returns None if the signal is not yet available or permission is pending.
    """
    lat = None
    lon = None
    accuracy = None

    # Method 1: Client-side JS evaluation via streamlit_js_eval
    if streamlit_js_eval is not None:
        try:
            raw_gps = streamlit_js_eval(
                js_expressions="""
                new Promise((resolve, reject) => {
                    if (!navigator.geolocation) {
                        resolve({ error: "Geolocation unsupported by browser", code: 0 });
                        return;
                    }
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            resolve({
                                latitude: pos.coords.latitude,
                                longitude: pos.coords.longitude,
                                accuracy: pos.coords.accuracy,
                                status: "success"
                            });
                        },
                        (err) => {
                            resolve({
                                error: err.message,
                                code: err.code,
                                status: "error"
                            });
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 15000,
                            maximumAge: 0
                        }
                    );
                })
                """,
                key="browser_exact_gps_eval"
            )
            if raw_gps and isinstance(raw_gps, dict):
                if raw_gps.get("status") == "success" or (raw_gps.get("latitude") is not None and raw_gps.get("longitude") is not None):
                    lat = float(raw_gps["latitude"])
                    lon = float(raw_gps["longitude"])
                    accuracy = raw_gps.get("accuracy")
                elif "coords" in raw_gps and raw_gps["coords"].get("latitude") is not None:
                    lat = float(raw_gps["coords"]["latitude"])
                    lon = float(raw_gps["coords"]["longitude"])
                    accuracy = raw_gps["coords"].get("accuracy")
        except Exception:
            pass

    # Method 2: Fallback to streamlit_geolocation component
    if (lat is None or lon is None) and streamlit_geolocation is not None:
        try:
            loc_gps = streamlit_geolocation()
            if loc_gps and loc_gps.get("latitude") is not None and loc_gps.get("longitude") is not None:
                lat = float(loc_gps["latitude"])
                lon = float(loc_gps["longitude"])
                accuracy = loc_gps.get("accuracy")
        except Exception:
            pass

    # Method 3: Direct URL query parameters (if redirected from external GPS bridge)
    if lat is None or lon is None:
        try:
            if "user_lat" in st.query_params and "user_lon" in st.query_params:
                lat = float(st.query_params["user_lat"])
                lon = float(st.query_params["user_lon"])
                del st.query_params["user_lat"]
                del st.query_params["user_lon"]
        except Exception:
            pass

    if lat is None or lon is None:
        return None

    # Merge reverse geocoding and live weather telemetry
    geo_data = reverse_geocode_nominatim(lat, lon)
    weather_data = fetch_live_telemetry(lat, lon)
    if not weather_data:
        weather_data = engine_instance.fetch_weather_by_coords(lat, lon) or {}

    merged = {**geo_data, **weather_data}
    merged["latitude"] = round(lat, 5)
    merged["longitude"] = round(lon, 5)
    if accuracy:
        merged["accuracy_meters"] = round(float(accuracy), 1)
    merged["is_gps_verified"] = True
    merged["source"] = "Exact Browser GPS (High Accuracy)"
    return merged


def handle_location_state():
    """
    Centralized Dual-Mode State Machine managing GPS vs. Custom City Search.

    Session State Schema:
    - st.session_state.location_mode: "GPS" (default) or "CUSTOM"
    - st.session_state.farm_base_data: Exact physical GPS location & telemetry (or None if pending)
    - st.session_state.custom_city_data: Searched city data & telemetry (or None)
    - st.session_state.active_telemetry: Points to farm_base_data (in GPS mode)
                                         or custom_city_data (in CUSTOM mode)
    """
    if "location_mode" not in st.session_state:
        st.session_state.location_mode = "GPS"

    if "farm_base_data" not in st.session_state:
        st.session_state.farm_base_data = None

    if "custom_city_data" not in st.session_state:
        st.session_state.custom_city_data = None

    # Check for direct client browser GPS signal
    detected_gps = get_exact_gps_location()
    if detected_gps:
        prev_coords = st.session_state.get("_last_synced_gps_coords")
        curr_coords = (detected_gps["latitude"], detected_gps["longitude"])
        if prev_coords != curr_coords:
            st.session_state._last_synced_gps_coords = curr_coords
            st.session_state.farm_base_data = detected_gps

            # If in GPS mode or first lock, activate immediately
            if st.session_state.location_mode == "GPS" or st.session_state.get("active_telemetry") is None:
                st.session_state.location_mode = "GPS"
                st.session_state.active_telemetry = detected_gps
                st.session_state["slider_temp"] = max(-10.0, min(55.0, float(detected_gps.get("temperature", 25.0))))
                st.session_state["slider_hum"] = max(5.0, min(100.0, float(detected_gps.get("humidity", 60.0))))
                st.session_state["slider_rain"] = max(0.0, min(500.0, float(detected_gps.get("rainfall", 90.0))))
                st.toast(f"🎯 Pinpoint GPS Locked: {detected_gps['location']}", icon="📍")

    # Resolve active telemetry based on state machine mode
    if st.session_state.location_mode == "CUSTOM" and st.session_state.custom_city_data:
        st.session_state.active_telemetry = st.session_state.custom_city_data
    elif st.session_state.location_mode == "GPS" and st.session_state.farm_base_data:
        st.session_state.active_telemetry = st.session_state.farm_base_data
    elif st.session_state.farm_base_data:
        st.session_state.active_telemetry = st.session_state.farm_base_data
    elif st.session_state.custom_city_data:
        st.session_state.active_telemetry = st.session_state.custom_city_data
    else:
        st.session_state.active_telemetry = None

    # Maintain backward compatibility aliases for existing tabs & generators
    st.session_state.my_home_location = st.session_state.farm_base_data
    st.session_state.other_place_location = st.session_state.custom_city_data
    st.session_state.active_location_mode = "home" if st.session_state.location_mode == "GPS" else "other"
    st.session_state.weather_telemetry = st.session_state.active_telemetry


def ensure_session_state():
    """
    Guarantees that all necessary session state keys exist for the active user session.
    Invoked on every script rerun and before rendering.
    """
    if "splash_completed" not in st.session_state:
        st.session_state.splash_completed = False

    if "current_user" not in st.session_state:
        try:
            users = db_instance.get_users()
            st.session_state.current_user = users[0]["username"] if users else "lead_agronomist"
        except Exception:
            st.session_state.current_user = "lead_agronomist"

    # Execute state controller
    handle_location_state()

    if "chosen_target_crop" not in st.session_state:
        st.session_state.chosen_target_crop = "rice"

    if "last_prediction" not in st.session_state:
        st.session_state.last_prediction = None

    if "last_diagnostics" not in st.session_state:
        st.session_state.last_diagnostics = None

    # Ensure slider state keys are synchronized
    w_curr = st.session_state.get("active_telemetry") or {}
    if "slider_temp" not in st.session_state:
        st.session_state.slider_temp = float(w_curr.get("temperature", 26.0))
    if "slider_hum" not in st.session_state:
        st.session_state.slider_hum = float(w_curr.get("humidity", 65.0))
    if "slider_rain" not in st.session_state:
        st.session_state.slider_rain = float(w_curr.get("rainfall", 100.0))
    if "slider_n" not in st.session_state:
        st.session_state.slider_n = 80
    if "slider_p" not in st.session_state:
        st.session_state.slider_p = 45
    if "slider_k" not in st.session_state:
        st.session_state.slider_k = 40
    if "slider_ph" not in st.session_state:
        st.session_state.slider_ph = 6.5

# Ensure active session state on initial module evaluation
ensure_session_state()


# ─────────────────────────────────────────────────────────────────────────────
# CORE FEATURE 1: THEMATIC ANIMATED LOGO & SPLASH PAGE
# ─────────────────────────────────────────────────────────────────────────────
def render_splash_screen():
    """
    Renders the opening botanical herbarium initialization sequence
    matching the Aesop/Pachama editorial aesthetic.
    """
    ensure_session_state()
    components.html(render_splash_screen_html(), height=520)
    st.write("")
    col_s1, col_s2, col_s3 = st.columns([1, 2, 1])
    with col_s2:
        if st.button("ENTER AGRONOMIC FIELD CONSOLE", type="primary", use_container_width=True):
            st.session_state.splash_completed = True
            st.rerun()


# ─────────────────────────────────────────────────────────────────────────────
# WIDGET SAFE STATE CALLBACKS
# ─────────────────────────────────────────────────────────────────────────────
def apply_soil_baseline_callback(state_name: str):
    """Safely updates soil slider session state values in pre-run callback to prevent StreamlitWidgetAlreadyInstantiatedError."""
    try:
        profile = backend.get_state_soil_profile(state_name)
        if profile and "baseline_soil" in profile:
            b = profile["baseline_soil"]
            st.session_state["slider_n"] = int(b.get("nitrogen", 80))
            st.session_state["slider_p"] = int(b.get("phosphorus", 45))
            st.session_state["slider_k"] = int(b.get("potassium", 40))
            st.session_state["slider_ph"] = float(b.get("ph", 6.5))
            st.session_state["_toast_notification"] = f"[Baseline Applied] {state_name} baseline soil metrics into main predictor!"
    except Exception:
        pass


# ─────────────────────────────────────────────────────────────────────────────
# MAIN DASHBOARD INTERFACE
# ─────────────────────────────────────────────────────────────────────────────
def main_dashboard():
    ensure_session_state()
    if st.session_state.get("_toast_notification"):
        st.toast(st.session_state.pop("_toast_notification"))

    # ─── SIDEBAR ───
    with st.sidebar:
        st.markdown("""
        <div style="padding: 1.1rem 0; border-bottom: 1px solid var(--border-hairline); margin-bottom: 1.2rem; text-align: center;">
            <div style="font-family: 'Fraunces', Georgia, serif; font-size: 1.65rem; font-weight: 700; color: #162119; letter-spacing: -0.02em;">AgriSense AI</div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.70rem; color: #1B4332; letter-spacing: 0.1em; text-transform: uppercase;">FIELD HERBARIUM // v4.2</div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("### 👤 Operator Profile")
        user_list = db_instance.get_users()
        user_map = {u["username"]: f"{u['full_name']} ({u['role']})" for u in user_list}
        
        selected_username = st.selectbox(
            "Active Session Operator",
            options=list(user_map.keys()),
            format_func=lambda x: user_map.get(x, x),
            label_visibility="collapsed"
        )
        st.session_state.current_user = selected_username

        # Current live weather in sidebar
        w = st.session_state.get("active_telemetry")
        st.markdown("---")
        st.markdown("### 📍 Farm Telemetry")
        if w:
            c_icon = w.get('condition_icon', '⛅')
            c_desc = w.get('condition', 'Fair Weather')
            live_precip = w.get('live_rain', 0.0)
            rain_label = f"{live_precip} mm (Live)" if live_precip > 0 else f"{w.get('rainfall', 100.0)} mm (Seasonal)"
            loc_label = w.get('location', 'Active Zone')
            temp_label = f"{w.get('temperature', 25.0)}°C"
            hum_label = f"{w.get('humidity', 60.0)}%"
            wind_label = f"{w.get('wind_speed', 8.0)} km/h"
        else:
            c_icon = "🛰️"
            c_desc = "Awaiting GPS Signal"
            loc_label = "📡 Detecting GPS Coordinates..."
            temp_label = "-- °C"
            hum_label = "-- %"
            rain_label = "-- mm"
            wind_label = "-- km/h"

        st.markdown(f"""
        <div style="font-size: 0.85rem; line-height: 1.6; color: #D1D5DB; background: var(--alabaster); padding: 12px 14px; border-radius: 4px; border: 1px solid var(--border-soft); box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div><strong>Location:</strong> <span style="color: var(--terracotta);">{loc_label}</span></div>
            <div><strong>Condition:</strong> <span style="color: #F472B6;">{c_icon} {c_desc}</span></div>
            <div><strong>Temperature:</strong> <span style="color: var(--harvest);">{temp_label}</span></div>
            <div><strong>Humidity:</strong> <span style="color: var(--chlorophyll);">{hum_label}</span></div>
            <div><strong>Precipitation:</strong> <span style="color: var(--ink);">{rain_label}</span></div>
            <div><strong>Wind Speed:</strong> <span style="color: var(--sage);">{wind_label}</span></div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("---")
        if st.button("🔄 Replay Splash Page", use_container_width=True):
            st.session_state.splash_completed = False
            st.rerun()

        # ─── TOP EDITORIAL BOTANICAL HEADER & FIELD TELEMETRY RIBBON ───
    active_tel = st.session_state.get("active_telemetry")
    farm_base = st.session_state.get("farm_base_data")
    loc_mode = st.session_state.get("location_mode", "GPS")
    is_gps_verified = bool(active_tel and active_tel.get("is_gps_verified") and loc_mode == "GPS")
    city_display = active_tel.get("city", "Active Agricultural Zone") if active_tel else "Acquiring Station Coordinates..."

    st.markdown("""
    <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; margin-bottom: 0.4rem;">
        <div>
            <h1 style="font-family: 'Fraunces', Georgia, serif; font-size: clamp(2rem, 3.5vw, 2.7rem); font-weight: 700; color: #162119; letter-spacing: -0.03em; margin: 0;">
                AgriSense <span style="font-style: italic; color: #1B4332; font-weight: 400;">Field Station</span>
            </h1>
            <p style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.88rem; color: #5A655D; margin: 0.2rem 0 0.8rem 0;">
                Precision Ecological Soil Horizons, Botanical Taxonomy & Adaptive Cultivation Management
            </p>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown(render_telemetry_ribbon(
        region=city_display,
        season="Kharif / Active Cycle",
        status="NOMINAL" if is_gps_verified else "CALIBRATED",
        temp=str(active_tel.get('temperature', 25.0)) if active_tel else "--",
        humidity=str(active_tel.get('humidity', 60.0)) if active_tel else "--",
        rainfall=str(active_tel.get('rainfall', 100.0)) if active_tel else "--"
    ), unsafe_allow_html=True)

    # ─── MAIN NAVIGATION TABS ───
    tab_diagnostics, tab_crop_doctor, tab_fertilizers, tab_soil_map, tab_analytics, tab_telemetry, tab_settings = st.tabs([
        "[01] Smart Crop & Adaptation",
        "[02] Crop Doctor & Pathology",
        "[03] Fertilizer Chemistry",
        "[04] Indian Soil Map",
        "[05] Records & Ledger",
        "[06] System Telemetry",
        "[07] Profiles & Technical Docs"
    ])

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # TAB 1: SMART CROP PREDICTOR & ADAPTATION PROTOCOL (ASYMMETRIC FIELD CONSOLE)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    with tab_diagnostics:
        loc_mode = st.session_state.get("location_mode", "GPS")
        farm_base = st.session_state.get("farm_base_data")
        custom_city = st.session_state.get("custom_city_data")
        active_tel = st.session_state.get("active_telemetry")
        w_curr = st.session_state.get("weather_telemetry") or {}

        # Asymmetric Split-Screen Field Station Console (5 : 7)
        col_console, col_canvas = st.columns([5, 7], gap="large")

        # ─────────────────────────────────────────────────────────────────────
        # LEFT COLUMN (5): INTERACTIVE AGRONOMIC PARAMETER CONSOLE
        # ─────────────────────────────────────────────────────────────────────
        with col_console:
            # 01 // GEOSPATIAL FIELD CALIBRATION
            st.markdown(render_section_header("01", "Geospatial Calibration", "Station location and field coordinate lock", "GEOLOCATION"), unsafe_allow_html=True)
            
            with st.container(border=True):
                loc_tab_home, loc_tab_other = st.tabs(["Home Farm (GPS / Baseline)", "Explore Other Region"])
                
                with loc_tab_home:
                    is_locked = bool(farm_base and farm_base.get("is_gps_verified"))
                    status_badge = "[EXACT GPS LOCKED]" if is_locked else "[GPS SIGNAL PENDING]"
                    status_color = "var(--accent-success)" if is_locked else "var(--accent-warning)"
                    
                    if is_locked:
                        gps_desc = f"Locked: <strong>{farm_base['location']}</strong> ({farm_base.get('latitude', '')}°N, {farm_base.get('longitude', '')}°E)"
                    else:
                        gps_desc = "Click <strong>Detect Exact Farm Location</strong> below to pinpoint field coordinates:"

                    st.markdown(f'''
                    <div style="font-family: var(--font-mono); font-size: 0.76rem; margin-bottom: 0.6rem; color: var(--text-muted); display: flex; justify-content: space-between;">
                        <span>STATION SATELLITE RADAR</span>
                        <span style="color: {status_color}; font-weight: 700;">{status_badge}</span>
                    </div>
                    <div style="font-size: 0.82rem; color: var(--text-primary); margin-bottom: 0.8rem; line-height: 1.4;">
                        {gps_desc}
                    </div>
                    ''', unsafe_allow_html=True)

                    col_gps_b1, col_gps_b2 = st.columns([1.5, 1])
                    with col_gps_b1:
                        if st.button("Detect Exact Location", key="btn_detect_gps", use_container_width=True, help="Requests high-accuracy browser HTML5 GPS coordinates"):
                            st.session_state._last_synced_gps_coords = None
                            st.session_state.location_mode = "GPS"
                            st.toast("Acquiring browser GPS signal... Please allow location permission in your browser.")
                            st.rerun()

                    with col_gps_b2:
                        is_home_active = (loc_mode == "GPS" and farm_base is not None)
                        if st.button("Activate Farm", key="btn_activate_home", use_container_width=True, disabled=is_home_active):
                            st.session_state.location_mode = "GPS"
                            if farm_base:
                                st.session_state.active_telemetry = farm_base
                                st.session_state["slider_temp"] = max(-10.0, min(55.0, float(farm_base.get("temperature", 25.0))))
                                st.session_state["slider_hum"] = max(5.0, min(100.0, float(farm_base.get("humidity", 60.0))))
                                st.session_state["slider_rain"] = max(0.0, min(500.0, float(farm_base.get("rainfall", 90.0))))
                                st.toast(f"Switched context back to My Farm: {farm_base.get('city')}")
                            st.rerun()

                    col_f_in, col_f_btn = st.columns([1.8, 1])
                    with col_f_in:
                        farm_input = st.text_input("Farm City / Town:", placeholder="e.g. Alwar, Varanasi, 302001", label_visibility="collapsed", key="farm_city_input")
                    with col_f_btn:
                        set_farm_btn = st.button("Set Farm", use_container_width=True, key="btn_set_farm")

                    last_synced_farm = st.session_state.get("_last_synced_farm_input", "")
                    should_sync_farm = False
                    if set_farm_btn and farm_input.strip():
                        should_sync_farm = True
                    elif farm_input.strip() and farm_input.strip().lower() != last_synced_farm:
                        should_sync_farm = True

                    if should_sync_farm:
                        with st.spinner(f"Pinpointing farm to {farm_input}..."):
                            new_home = engine_instance.fetch_live_weather(farm_input.strip())
                            new_home["is_gps_verified"] = False
                            st.session_state.farm_base_data = new_home
                            st.session_state.location_mode = "GPS"
                            st.session_state.active_telemetry = new_home
                            st.session_state._last_synced_farm_input = farm_input.strip().lower()
                            st.session_state["slider_temp"] = max(-10.0, min(55.0, float(new_home.get("temperature", 25.0))))
                            st.session_state["slider_hum"] = max(5.0, min(100.0, float(new_home.get("humidity", 60.0))))
                            st.session_state["slider_rain"] = max(0.0, min(500.0, float(new_home.get("rainfall", 90.0))))
                            st.toast(f"Farm location updated to: {new_home['location']}")
                            st.rerun()

                    col_rst1, col_rst2 = st.columns([1, 1])
                    with col_rst1:
                        if st.button("Reset Farm", key="btn_reset_farm", use_container_width=True):
                            st.session_state.farm_base_data = None
                            st.session_state.active_telemetry = st.session_state.custom_city_data
                            st.session_state._last_synced_gps_coords = None
                            st.session_state._last_synced_farm_input = ""
                            st.rerun()
                    with col_rst2:
                        farm_states = [
                            "State Baseline...",
                            "Rajasthan (Jaipur / Kota)", "Uttar Pradesh (Lucknow / Kanpur)",
                            "Punjab (Ludhiana / Amritsar)", "Haryana (Karnal / Hisar)",
                            "Maharashtra (Pune / Nashik)", "Madhya Pradesh (Indore / Bhopal)",
                            "Bihar (Patna / Gaya)", "Gujarat (Ahmedabad / Rajkot)",
                            "Karnataka (Bengaluru / Mysuru)", "Tamil Nadu (Coimbatore / Chennai)",
                            "Andhra Pradesh (Guntur / Vijayawada)", "West Bengal (Kolkata / Bardhaman)",
                            "Kerala (Kochi / Palakkad)", "Assam (Guwahati / Jorhat)"
                        ]
                        sel_state = st.selectbox("Or state baseline:", farm_states, index=0, label_visibility="collapsed", key="sel_farm_state")
                        if sel_state != "State Baseline...":
                            target_city = sel_state.split("(")[1].split("/")[0].strip()
                            if st.session_state.get("_last_selected_state") != sel_state:
                                st.session_state._last_selected_state = sel_state
                                with st.spinner(f"Setting farm to {target_city}..."):
                                    new_home = engine_instance.fetch_live_weather(target_city)
                                    new_home["is_gps_verified"] = False
                                    st.session_state.farm_base_data = new_home
                                    st.session_state.location_mode = "GPS"
                                    st.session_state.active_telemetry = new_home
                                    st.session_state["slider_temp"] = max(-10.0, min(55.0, float(new_home.get("temperature", 25.0))))
                                    st.session_state["slider_hum"] = max(5.0, min(100.0, float(new_home.get("humidity", 60.0))))
                                    st.session_state["slider_rain"] = max(0.0, min(500.0, float(new_home.get("rainfall", 90.0))))
                                    st.rerun()

                with loc_tab_other:
                    col_o1, col_o2 = st.columns([1.8, 1])
                    with col_o1:
                        custom_city_input = st.text_input("Lookup place:", placeholder="e.g. Pune, Patna, California", label_visibility="collapsed", key="custom_city_input")
                    with col_o2:
                        sync_btn = st.button("Analyze Place", use_container_width=True, key="btn_sync_other")

                    last_synced = st.session_state.get("_last_synced_other", "")
                    should_sync_other = False
                    if sync_btn and custom_city_input.strip():
                        should_sync_other = True
                    elif custom_city_input.strip() and custom_city_input.strip().lower() != last_synced:
                        should_sync_other = True

                    if should_sync_other:
                        with st.spinner(f"Querying weather for {custom_city_input}..."):
                            other_w = engine_instance.fetch_live_weather(custom_city_input.strip())
                            st.session_state.custom_city_data = other_w
                            st.session_state.location_mode = "CUSTOM"
                            st.session_state.active_telemetry = other_w
                            st.session_state._last_synced_other = custom_city_input.strip().lower()
                            st.session_state["slider_temp"] = max(-10.0, min(55.0, float(other_w.get("temperature", 25.0))))
                            st.session_state["slider_hum"] = max(5.0, min(100.0, float(other_w.get("humidity", 60.0))))
                            st.session_state["slider_rain"] = max(0.0, min(500.0, float(other_w.get("rainfall", 90.0))))
                            st.rerun()

            # 02 // MACRONUTRIENT HORIZONS (N-P-K)
            st.markdown(render_section_header("02", "Macronutrient Horizons", "Available Nitrogen, Phosphorus, Potassium in kg/ha", "SOIL_N-P-K"), unsafe_allow_html=True)
            
            with st.container(border=True):
                with st.expander("Indian Soil Baseline Auto-Fill", expanded=False):
                    st.caption("Select State / Agro-zone to populate ICAR fertility baseline:")
                    soil_states = backend.get_indian_soil_states()
                    def_state_idx = soil_states.index("Punjab") if "Punjab" in soil_states else 0
                    chosen_state = st.selectbox("Select State / Region", soil_states, index=def_state_idx, key="diag_state_selector")
                    st_profile = backend.get_state_soil_profile(chosen_state)
                    if st_profile:
                        b_soil = st_profile["baseline_soil"]
                        st.markdown(f'''
                        <div style="font-family: var(--font-mono); font-size: 0.76rem; background: var(--bg-console); padding: 8px 10px; border-radius: 4px; margin-bottom: 6px;">
                            <div>Stratum: <strong>{st_profile['soil_type']}</strong></div>
                            <div>N: {b_soil['nitrogen']} kg/ha &bull; P: {b_soil['phosphorus']} kg/ha &bull; K: {b_soil['potassium']} kg/ha &bull; pH: {b_soil['ph']}</div>
                        </div>
                        ''', unsafe_allow_html=True)
                        st.button(f"Auto-Fill {chosen_state} Baseline", key=f"apply_soil_{chosen_state}", on_click=apply_soil_baseline_callback, args=(chosen_state,), use_container_width=True)

                col_n, col_p, col_k = st.columns(3)
                with col_n:
                    n_val = st.slider("Nitrogen (N)", 0, 250, key="slider_n", help="Available soil Nitrogen in kg/ha")
                with col_p:
                    p_val = st.slider("Phosphorus (P)", 5, 180, key="slider_p", help="Available soil Phosphorus in kg/ha")
                with col_k:
                    k_val = st.slider("Potassium (K)", 5, 300, key="slider_k", help="Available soil Potassium in kg/ha")

            # 03 // ATMOSPHERIC & HYDROLOGY
            st.markdown(render_section_header("03", "Atmospheric & Hydrology", "Live ambient microclimate calibration", "TELEMETRY"), unsafe_allow_html=True)
            
            with st.container(border=True):
                col_t, col_h = st.columns(2)
                with col_t:
                    temp_val = st.slider("Temperature (°C)", -10.0, 55.0, key="slider_temp", step=0.5, help="Calibrated from station telemetry")
                with col_h:
                    hum_val = st.slider("Humidity (%)", 5.0, 100.0, key="slider_hum", step=1.0, help="Relative atmospheric humidity")

                col_r, col_ph = st.columns(2)
                with col_r:
                    rain_val = st.slider("Rainfall (mm)", 0.0, 500.0, key="slider_rain", step=1.0, help="Hydrologic precipitation demand")
                with col_ph:
                    ph_val = st.slider("Soil Reaction (pH)", 3.5, 9.5, key="slider_ph", step=0.1, help="Acidity/Alkalinity level")

            # 04 // PLANNED CULTIVAR TARGET
            st.markdown(render_section_header("04", "Planned Cultivar", "Target crop selection for adaptation roadmap", "TARGET_CROP"), unsafe_allow_html=True)
            
            with st.container(border=True):
                current_target = st.session_state.chosen_target_crop
                target_idx = SUPPORTED_CROPS.index(current_target) if current_target in SUPPORTED_CROPS else 0
                
                chosen_crop = st.selectbox(
                    "Planned Cultivar",
                    SUPPORTED_CROPS,
                    index=target_idx,
                    help="Select your planned crop to receive adaptation rescue actions if unsuited."
                )
                st.session_state.chosen_target_crop = chosen_crop

                farm_field_name = st.text_input("Field Stratum Identifier", value=f"{w_curr.get('city', 'Main')} Field Stratum A")
                notes_input = st.text_area("Field Specimen Log", value="Pre-sowing horizon evaluation and baseline verification.", height=55)

                run_analysis = st.button("EXECUTE AGRONOMIC ANALYSIS", type="primary", use_container_width=True)

        # ─────────────────────────────────────────────────────────────────────
        # RIGHT COLUMN (7): LIVE TELEMETRY & BOTANICAL SPECIMEN CANVAS
        # ─────────────────────────────────────────────────────────────────────
        with col_canvas:
            # 05 // REAL-TIME SOIL HORIZON STRATUM METERS
            st.markdown(render_section_header("05", "Dynamic Horizon Spectrum", "Live soil layer saturation and chemical balance", "REAL_TIME"), unsafe_allow_html=True)
            
            # Interactive horizon bars that update dynamically as sliders are dragged
            col_hz1, col_hz2 = st.columns(2)
            with col_hz1:
                st.markdown(render_soil_horizon_bar("Available Nitrogen Horizon", n_val, 0, 250, "kg/ha"), unsafe_allow_html=True)
                st.markdown(render_soil_horizon_bar("Phosphorus Stratum", p_val, 5, 180, "kg/ha"), unsafe_allow_html=True)
            with col_hz2:
                st.markdown(render_soil_horizon_bar("Potassium Stratum", k_val, 5, 300, "kg/ha"), unsafe_allow_html=True)
                st.markdown(render_soil_horizon_bar("Soil Reaction Equilibrium (pH)", ph_val, 3.5, 9.5, "pH"), unsafe_allow_html=True)

            st.markdown(render_soil_horizon_bar("Precipitation & Hydrologic Index", rain_val, 0, 500, "mm"), unsafe_allow_html=True)

            # Stoichiometric Balance Card
            st.markdown(render_nutrient_balance_card(n_val, p_val, k_val, ph_val), unsafe_allow_html=True)

            # Trigger Analysis / Load Cache
            if run_analysis or st.session_state.last_prediction is None:
                with st.spinner("Computing botanical intelligence & adaptation roadmap..."):
                    top_preds = engine_instance.predict_top_crops(n_val, p_val, k_val, rain_val, temp_val, top_k=3)
                    diagnostics = engine_instance.diagnose_target_crop(
                        chosen_crop, n_val, p_val, k_val, temp_val, rain_val, hum_val, ph_val
                    )
                    st.session_state.last_prediction = top_preds
                    st.session_state.last_diagnostics = diagnostics
                    st.session_state.last_inputs = {
                        "n": n_val, "p": p_val, "k": k_val, "temp": temp_val,
                        "hum": hum_val, "ph": ph_val, "rain": rain_val,
                        "target": chosen_crop, "farm": farm_field_name, "notes": notes_input
                    }

            top_preds = st.session_state.last_prediction
            diag = st.session_state.last_diagnostics
            inputs = st.session_state.get("last_inputs", {})

            # Render High-Contrast Botanical Specimen Card for the top recommendation
            top_crop_name, top_conf = top_preds[0]
            top_profile = backend.CROP_AGRONOMIC_PROFILES.get(top_crop_name.lower(), {})
            st.markdown(render_specimen_card(
                crop_name=top_crop_name,
                confidence=top_conf,
                metrics_dict=top_profile
            ), unsafe_allow_html=True)

            # Dual Tabs: Target Crop Adaptation Protocol vs Top 3 Botanical Alternatives
            tab_rescue, tab_alts = st.tabs([
                f"Adaptation Protocol: {diag['target_crop'].title()}",
                "Top 3 Botanical Alternatives"
            ])

            with tab_rescue:
                # Render Architectural Adaptation Protocol Card
                st.markdown(render_rescue_protocol_card(
                    crop_name=diag['target_crop'],
                    feasibility_score=0.88 if diag['risk_level'] == 'Low Risk' else (0.58 if diag['risk_level'] == 'Moderate Risk' else 0.32),
                    required_actions=[f"{item['category']}: {item['action']} ({item['impact']})" for item in diag.get("rescue_roadmap", [])],
                    fertilizer_changes={"urea_adj_kg_ha": 15.0, "dap_adj_kg_ha": 10.0, "mop_adj_kg_ha": 5.0}
                ), unsafe_allow_html=True)

                st.markdown("##### Agronomic Field Execution Checklist:")
                st.checkbox("Soil Amendment Applied (NPK balancing & Lime/Gypsum as required)", value=False)
                st.checkbox(f"Irrigation / Drainage lines calibrated for {diag['target_crop'].title()}", value=False)
                st.checkbox("Certified seed inoculation with biofertilizers (Trichoderma / Rhizobium)", value=False)
                st.checkbox("Mulching or microclimate protection prepared against temperature extremes", value=False)

            with tab_alts:
                for idx, alt in enumerate(diag["top_3_enriched"]):
                    col_card, col_act = st.columns([3.2, 1.2])
                    with col_card:
                        is_target = " [Planned Crop]" if alt["is_current_target"] else ""
                        st.markdown(f'''
                        <div class="alt-crop-card">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                <span style="font-family: var(--font-serif); font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">
                                    {alt['rank_title']}: <span style="color: var(--accent-primary);">{alt['crop_name'].title()}</span>{is_target}
                                </span>
                                <span style="font-family: var(--font-mono); font-size: 0.95rem; font-weight: 700; color: var(--accent-secondary);">
                                    {alt['confidence']:.1f}% Match
                                </span>
                            </div>
                            <div style="font-size: 0.84rem; color: var(--text-muted); margin-bottom: 4px;">
                                <strong>Why it fits:</strong> {alt['why_recommended']}
                            </div>
                            <div style="font-family: var(--font-mono); font-size: 0.76rem; color: var(--text-dim);">
                                Cycle: {alt['cycle_days']} &bull; Water: {alt['water_demand']}
                            </div>
                        </div>
                        ''', unsafe_allow_html=True)

                    with col_act:
                        st.write("")
                        if not alt["is_current_target"]:
                            if st.button(f"Adopt {alt['crop_name'].title()}", key=f"adopt_btn_{idx}", use_container_width=True):
                                st.session_state.chosen_target_crop = alt["crop_name"].lower()
                                st.toast(f"Switched target crop to {alt['crop_name']}!")
                                st.rerun()
                        else:
                            st.caption("Active Cultivar")

            # Commit to Database & Download Executive Botanical PDF Report
            st.markdown("---")
            col_save, col_pdf = st.columns([1.2, 1.3], gap="medium")
            with col_save:
                if st.button("Commit to Botanical Ledger", use_container_width=True):
                    record_data = {
                        "username": st.session_state.current_user,
                        "farm_location": inputs.get("farm", "Main Field Stratum"),
                        "nitrogen": inputs.get("n", 80),
                        "phosphorus": inputs.get("p", 45),
                        "potassium": inputs.get("k", 40),
                        "temperature": inputs.get("temp", 26.0),
                        "humidity": inputs.get("hum", 65.0),
                        "ph": inputs.get("ph", 6.5),
                        "rainfall": inputs.get("rain", 110.0),
                        "target_crop": diag["target_crop"],
                        "predicted_crop": top_preds[0][0].capitalize(),
                        "confidence": top_preds[0][1],
                        "risk_level": diag["risk_level"],
                        "diagnosis_summary": diag["summary"][:200],
                        "fertilizer_advice": f"N Deficit: {inputs.get('n', 0)}kg/ha; Soil pH: {inputs.get('ph', 6.5)}",
                        "notes": inputs.get("notes", "")
                    }
                    new_id = db_instance.insert_record(record_data)
                    st.success(f"Archived into Botanical Ledger as Record #{new_id}")
                st.caption("Saved records are accessible and editable anytime under the Records & Ledger tab.")

            with col_pdf:
                fert_calc = None
                try:
                    fert_calc = engine_instance.calculate_fertilizers(
                        inputs.get("n", 80),
                        inputs.get("p", 45),
                        inputs.get("k", 40),
                        inputs.get("ph", 6.5),
                        diag["target_crop"]
                    )
                except Exception:
                    pass

                try:
                    pdf_bytes = generate_agrisense_pdf_report(
                        inputs=inputs,
                        diagnostics=diag,
                        weather=w_curr,
                        fertilizer_calc=fert_calc,
                        operator=st.session_state.get("current_user", "Lead Agronomist")
                    )
                    st.download_button(
                        label="Download Agronomic Specimen Report (PDF)",
                        data=pdf_bytes,
                        file_name=f"AgriSense_Botanical_Report_{diag['target_crop'].lower()}_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf",
                        mime="application/pdf",
                        use_container_width=True,
                        help="Generate and download a comprehensive, print-ready PDF diagnosis and prescription report."
                    )
                    st.caption("Includes target crop viability, rescue roadmap, fertilizer bags/acre, and Crop Doctor pathology advice.")
                except Exception as ex:
                    st.error(f"PDF compilation error: {ex}")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # TAB 2: CROP DOCTOR - PLANT PATHOLOGY & CURE DIAGNOSTICS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    with tab_crop_doctor:
        st.markdown("""
        <div class="sparc-card">
            <div class="sparc-card-header">
                <span class="sparc-title">SPARC Crop Doctor: Plant Pathology & Integrated Pest Management</span>
                <span class="sparc-badge badge-rose">ICAR & CIBRC Grounded</span>
            </div>
            <p style="color: #9CA3AF; margin-bottom: 0;">
                Comprehensive plant pathology diagnostic engine covering fungal, bacterial, viral diseases, and pest complexes across 
                major Indian crops. Cross-references live weather against fungal incubation conditions to give proactive outbreak alerts, 
                biological biocontrols, and chemical prescriptions with exact dilution ratios.
            </p>
        </div>
        """, unsafe_allow_html=True)

        active_crop_doc = st.session_state.get("chosen_target_crop", "rice").lower()
        w_live = st.session_state.get("weather_telemetry") or {}
        cur_t = float(w_live.get("temperature", 26.0))
        cur_h = float(w_live.get("humidity", 65.0))

        # Real-time outbreak risk alert banner
        outbreak_alerts = backend.evaluate_disease_outbreak_risk(active_crop_doc, cur_t, cur_h)
        if outbreak_alerts:
            for alert in outbreak_alerts:
                st.markdown(f"""
                <div style="background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.35); border-left: 4px solid #F43F5E; border-radius: 10px; padding: 14px 18px; margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                        <span style="font-weight: 700; color: #FB7185; font-size: 1.05rem;">
                            ⚠️ {alert['severity']}: {alert['disease_name']} ({alert['pathogen_type']})
                        </span>
                        <span class="sparc-badge badge-rose">Live Outbreak Alert</span>
                    </div>
                    <div style="font-size: 0.88rem; color: #FECDD3; margin-top: 6px;">
                        {alert['condition']}
                    </div>
                    <div style="font-size: 0.85rem; color: #FFFFFF; margin-top: 6px;">
                        <strong>Immediate Protective Action:</strong> {alert['immediate_remedy']}
                    </div>
                </div>
                """, unsafe_allow_html=True)
        else:
            st.markdown(f"""
            <div style="background: rgba(27, 67, 50, 0.06); border: 1px solid rgba(27, 67, 50, 0.22); border-radius: 4px; padding: 10px 16px; margin-bottom: 16px; font-size: 0.88rem; color: #1B4332; font-family: 'Plus Jakarta Sans', sans-serif;">
                [PASS] <strong>Low Incubation Risk:</strong> Current ambient weather ({cur_t}°C, {cur_h}% RH) does not indicate active epidemic pathogen incubation for {active_crop_doc.capitalize()}.
            </div>
            """, unsafe_allow_html=True)

        # Filters
        all_crops_available = ["all"] + backend.get_all_disease_crops()
        col_cd1, col_cd2 = st.columns([1.2, 2.0])
        with col_cd1:
            def_idx = all_crops_available.index(active_crop_doc) if active_crop_doc in all_crops_available else 0
            filter_crop = st.selectbox(
                "Filter by Crop",
                all_crops_available,
                index=def_idx,
                format_func=lambda x: "All Supported Species" if x == "all" else x.title()
            )
        with col_cd2:
            symptom_kw = st.text_input("🔍 Search by Symptom or Disease (e.g., yellow spots, powdery, wilt, rot, borer, curl)", placeholder="Enter symptom keyword...")

        selected_diseases = backend.search_crop_diseases(
            crop_name=None if filter_crop == "all" else filter_crop,
            keyword=symptom_kw if symptom_kw else None
        )

        st.markdown(f"<div style='color:#9CA3AF; font-size:0.85rem; margin-bottom: 14px;'>Found <strong>{len(selected_diseases)}</strong> matched plant health conditions:</div>", unsafe_allow_html=True)

        if not selected_diseases:
            st.info("No diseases matched your search criteria. Try a broader keyword like 'blight', 'spot', or 'leaf'.")
        else:
            for d in selected_diseases:
                with st.expander(f"[Pathology] {d['name']} — [{d['crop'].capitalize()} | {d['pathogen_type']}]", expanded=False):
                    st.markdown(f"""
                    <div style="margin-bottom: 12px;">
                        <span class="sparc-badge badge-cyan">{d['pathogen_type']} Pathogen</span>
                        <span style="font-style: italic; color: #9CA3AF; margin-left: 10px; font-size: 0.9rem;">{d['pathogen_name']}</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.02); border-left: 3px solid #F59E0B; padding: 10px 14px; border-radius: 6px; margin-bottom: 14px;">
                        <strong style="color: #FBBF24;">🔍 Diagnostic Symptoms in Field:</strong><br/>
                        <span style="color: #E5E7EB; font-size: 0.9rem;">{d['symptoms']}</span>
                    </div>
                    """, unsafe_allow_html=True)

                    triggers = d.get("weather_risk_triggers", {})
                    st.markdown(f"""
                    <div style="font-size: 0.82rem; color: #9CA3AF; margin-bottom: 14px;">
                        🌡️ <strong>Epidemic Incubation Thresholds:</strong> Optimal Temp: {triggers.get('min_temp', 10)}°C - {triggers.get('max_temp', 35)}°C | Min Humidity: >{triggers.get('min_humidity', 75)}% RH | Rain/Dew Trigger: {'Yes (Rain-splashed)' if triggers.get('cloudy_rain') else 'No'}
                    </div>
                    """, unsafe_allow_html=True)

                    col_bio, col_chem = st.columns(2, gap="medium")
                    with col_bio:
                        st.markdown("""
                        <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 10px; padding: 14px;">
                            <div style="color: #1B4332; font-weight: 700; margin-bottom: 8px;">[+] Biological & Organic Biocontrols:</div>
                        """, unsafe_allow_html=True)
                        for bio in d["biological_cures"]:
                            st.markdown(f"• <span style='font-size:0.86rem; color:#D1D5DB;'>{bio}</span>", unsafe_allow_html=True)
                        st.markdown("</div>", unsafe_allow_html=True)

                    with col_chem:
                        st.markdown("""
                        <div style="background: rgba(6, 182, 212, 0.05); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 10px; padding: 14px;">
                            <div style="color: #C85A32; font-weight: 700; margin-bottom: 8px;">[+] Chemical Treatments (ICAR / CIBRC Prescriptions):</div>
                        """, unsafe_allow_html=True)
                        for chem in d["chemical_remedies"]:
                            st.markdown(f"""
                            <div style="margin-bottom: 8px; font-size: 0.85rem;">
                                <strong style="color: #FFFFFF;">{chem['active_ingredient']}</strong><br/>
                                <span style="color: #FBBF24;">Dosage:</span> {chem['dosage']}<br/>
                                <span style="color: #9CA3AF;">Method:</span> {chem['application']}
                            </div>
                            """, unsafe_allow_html=True)
                        st.markdown("</div>", unsafe_allow_html=True)

                    st.markdown("""
                    <div style="margin-top: 12px; font-size: 0.85rem; color: #9CA3AF;">
                        <strong>[+] Agronomic Prevention & Cultural Practices:</strong>
                    </div>
                    """, unsafe_allow_html=True)
                    for prev in d["preventative_measures"]:
                        st.markdown(f"- <span style='font-size:0.84rem; color:#D1D5DB;'>{prev}</span>", unsafe_allow_html=True)

        # Interactive Spray Solution Dilution Calculator
        st.write("")
        st.markdown("""
        <div class="sparc-card">
            <div class="sparc-card-header">
                <span class="sparc-title">🧮 Interactive Spray Tank Dosage & Dilution Calculator</span>
                <span class="sparc-badge badge-cyan">Precision Spraying</span>
            </div>
            <p style="color: #9CA3AF; margin-bottom: 12px; font-size: 0.88rem;">
                Accurately calibrate the exact quantity of fungicide, bio-agent, or insecticide required for your spray equipment.
            </p>
        </div>
        """, unsafe_allow_html=True)
        col_c1, col_c2, col_c3 = st.columns(3)
        with col_c1:
            tank_type = st.selectbox("Spray Equipment Type", ["16-Liter Knapsack Sprayer", "20-Liter Battery Sprayer", "200-Liter Tractor Tank", "Custom Volume (Liters)"])
            if "Custom" in tank_type:
                tank_vol = st.number_input("Enter Tank Capacity (Liters)", min_value=1.0, max_value=2000.0, value=15.0)
            elif "16-Liter" in tank_type:
                tank_vol = 16.0
            elif "20-Liter" in tank_type:
                tank_vol = 20.0
            else:
                tank_vol = 200.0
        with col_c2:
            rec_rate = st.number_input("Prescribed Dosage per Liter (g or ml / Liter)", min_value=0.1, max_value=20.0, value=2.0, step=0.1)
        with col_c3:
            num_tanks = st.number_input("Number of Spray Tanks to Prepare", min_value=1, max_value=50, value=1)

        total_chem = tank_vol * rec_rate * num_tanks
        st.markdown(f"""
        <div style="background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 10px; padding: 14px 20px; margin-top: 10px;">
            <div style="font-size: 0.95rem; color: #FFFFFF;">
                Total Chemical / Bio-Agent to measure: <span style="color: var(--terracotta); font-weight: 800; font-size: 1.25rem;">{total_chem:.1f} grams or ml</span> 
                for <span style="color: var(--chlorophyll); font-weight: 700;">{tank_vol * num_tanks:.0f} Liters total water</span>.
            </div>
            <div style="font-size: 0.80rem; color: #9CA3AF; margin-top: 4px;">
                [Standard Protocol] Always make a slurry in a small bucket first before pouring into the main spray tank. Never spray against the wind direction.
            </div>
        </div>
        """, unsafe_allow_html=True)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # TAB 3: SOIL HEALTH & FERTILIZER PRESCRIPTIONS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    with tab_fertilizers:
        active_crop = st.session_state.get("chosen_target_crop", "rice")
        inputs = st.session_state.get("last_inputs", {"n": 80, "p": 45, "k": 40, "ph": 6.5})

        st.markdown(
            f'<div class="sparc-card">'
            f'<div class="sparc-card-header">'
            f'<span class="sparc-title">Precision Fertilizer Prescriptions // {active_crop.capitalize()}</span>'
            f'<span class="sparc-badge badge-emerald">Agronomic Calibrator</span>'
            f'</div>'
            f'<p style="color: #9CA3AF; margin-bottom: 0;">'
            f'Calculates elemental macronutrient deficits (N-P-K) against <strong>{active_crop.capitalize()}</strong>\'s '
            f'specific physiological demand and outputs exact commercial fertilizer application requirements in kg per acre.'
            f'</p>'
            f'</div>',
            unsafe_allow_html=True
        )

        # Calculate fertilizer prescriptions
        fert_calc = engine_instance.calculate_fertilizers(
            inputs.get("n", 80),
            inputs.get("p", 45),
            inputs.get("k", 40),
            inputs.get("ph", 6.5),
            active_crop
        )

        current = fert_calc.get("current_npk", {})
        target = fert_calc.get("target_npk", {})
        n_cur = float(current.get("N", inputs.get("n", 80)))
        p_cur = float(current.get("P", inputs.get("p", 45)))
        k_cur = float(current.get("K", inputs.get("k", 40)))
        n_tar = float(target.get("N", 80))
        p_tar = float(target.get("P", 45))
        k_tar = float(target.get("K", 40))
        def_sub = fert_calc.get("deficits", {})
        n_def = float(def_sub.get("N_deficit", max(0.0, n_tar - n_cur)))
        p_def = float(def_sub.get("P_deficit", max(0.0, p_tar - p_cur)))
        k_def = float(def_sub.get("K_deficit", max(0.0, k_tar - k_cur)))
        euclidean_gap = float(np.sqrt(n_def**2 + p_def**2 + k_def**2))

        # Mode controls for 3D visualization
        col_hdr_title, col_hdr_toggle = st.columns([1.6, 1.4])
        with col_hdr_title:
            st.markdown(
                '<div style="font-size: 1.05rem; font-weight: 700; color: #FFFFFF; display: flex; align-items: center; gap: 8px;">'
                '<span>Spatial Nutrient Intelligence Engine</span>'
                '<span class="sparc-badge badge-gold">WebGL 3D Engine</span>'
                '</div>'
                '<div style="font-size: 0.83rem; color: #94A3B8; margin-top: 2px;">'
                'Rotate, zoom, and pan in 3D coordinate space to inspect field-to-target nutrient trajectory.'
                '</div>',
                unsafe_allow_html=True
            )
        with col_hdr_toggle:
            graph_mode_choice = st.radio(
                "Chart Visualization Mode",
                ["3D Coordinate Trajectory", "3D Dual Horizon", "2D High-Clarity Vector", "3D Yield Response Landscape"],
                horizontal=True,
                label_visibility="collapsed"
            )
            if "Trajectory" in graph_mode_choice:
                mode_key = "line_chart"
            elif "Dual Horizon" in graph_mode_choice:
                mode_key = "columns"
            elif "2D" in graph_mode_choice:
                mode_key = "flat_2d"
            else:
                mode_key = "yield_surface"

        col_radar, col_table = st.columns([1.35, 1.15], gap="large")

        with col_radar:
            title_text = {
                "line_chart": "3D Trajectory: Current Horizon vs Required Target",
                "columns": "3D Dual-Pillar Horizon Comparison",
                "flat_2d": "2D High-Clarity Vector Horizon Comparison",
                "yield_surface": "3D Agronomic Yield Response Landscape"
            }.get(mode_key, "Nutrient Spatial Comparison")

            chart_header_html = (
                f'<div class="sparc-card" style="padding: 16px 20px 14px 20px; margin-bottom: 12px;">'
                f'<div class="sparc-card-header" style="margin-bottom: 10px; padding-bottom: 8px;">'
                f'<span class="sparc-title" style="font-size: 1.15rem;">{title_text}</span>'
                f'<span class="sparc-badge badge-cyan">{active_crop.capitalize()} Target Model</span>'
                f'</div>'
                f'<div style="display: flex; gap: 8px; flex-wrap: wrap; font-size: 0.80rem;">'
                f'<span style="background: rgba(0,245,255,0.08); border: 1px solid rgba(0,245,255,0.3); border-radius: 6px; padding: 4px 9px; color: #00F5FF;">'
                f'Current Horizon: <strong>N:{n_cur:.0f} P:{p_cur:.0f} K:{k_cur:.0f}</strong> kg/ha'
                f'</span>'
                f'<span style="background: rgba(255,215,0,0.08); border: 1px solid rgba(255,215,0,0.3); border-radius: 6px; padding: 4px 9px; color: #FFD700;">'
                f'🟡 Req. N: <strong>{n_tar:.0f}</strong> (Δ+{n_def:.0f})'
                f'</span>'
                f'<span style="background: rgba(255,71,87,0.08); border: 1px solid rgba(255,71,87,0.3); border-radius: 6px; padding: 4px 9px; color: #FF4757;">'
                f'🔴 Req. P: <strong>{p_tar:.0f}</strong> (Δ+{p_def:.0f})'
                f'</span>'
                f'<span style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.3); border-radius: 6px; padding: 4px 9px; color: #10B981;">'
                f'🟢 Req. K: <strong>{k_tar:.0f}</strong> (Δ+{k_def:.0f})'
                f'</span>'
                f'</div>'
                f'</div>'
            )
            st.markdown(chart_header_html, unsafe_allow_html=True)

            # Render 3D Plotly WebGL Graph
            fig_3d = build_3d_npk_graph(fert_calc, active_crop, view_mode=mode_key)
            if fig_3d is not None:
                st.plotly_chart(fig_3d, use_container_width=True, config={"displayModeBar": True, "scrollZoom": True})
            else:
                npk_df = pd.DataFrame({
                    "Nutrient": ["Nitrogen (N)", "Phosphorus (P)", "Potassium (K)"],
                    "Field Level": [fert_calc["current_npk"]["N"], fert_calc["current_npk"]["P"], fert_calc["current_npk"]["K"]],
                    "Target Optimal": [fert_calc["target_npk"]["N"], fert_calc["target_npk"]["P"], fert_calc["target_npk"]["K"]],
                })
                st.bar_chart(npk_df.set_index("Nutrient"), color=["#C85A32", "#1B4332"])

            # 3D Inset Luxury Metric Cases
            ph_status_color = '#1B4332' if 6.0 <= inputs.get('ph', 6.5) <= 7.5 else '#D97706'
            ph_status_text = 'Optimal Neutral' if 6.0 <= inputs.get('ph', 6.5) <= 7.5 else ('Acidic' if inputs.get('ph', 6.5) < 6.0 else 'Alkaline')
            cond_str = fert_calc.get('soil_conditioner', 'None').split()[0]
            cond_dose = fert_calc.get('conditioner_dose_kg_acre', 0.0)

            metrics_markup = (
                f'<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 14px;">'
                f'<div class="metric-box">'
                f'<div class="metric-label">Nutrient Gap Distance</div>'
                f'<div class="metric-val" style="color: #38BDF8;">{euclidean_gap:.1f}</div>'
                f'<div style="font-size: 0.72rem; color: #94A3B8; margin-top: 2px;">Δ Vector kg/ha</div>'
                f'</div>'
                f'<div class="metric-box">'
                f'<div class="metric-label">Soil pH Reaction</div>'
                f'<div class="metric-val" style="color: {ph_status_color};">{inputs.get("ph", 6.5):.1f}</div>'
                f'<div style="font-size: 0.72rem; color: #94A3B8; margin-top: 2px;">{ph_status_text}</div>'
                f'</div>'
                f'<div class="metric-box">'
                f'<div class="metric-label">Conditioner Dose</div>'
                f'<div class="metric-val" style="color: #FBBF24;">{cond_dose}</div>'
                f'<div style="font-size: 0.72rem; color: #94A3B8; margin-top: 2px;">kg/acre {cond_str}</div>'
                f'</div>'
                f'</div>'
            )
            st.markdown(metrics_markup, unsafe_allow_html=True)

        with col_table:
            presc_blocks = []
            for presc in fert_calc.get("prescriptions", []):
                p_name = presc.get('fertilizer', '')
                p_dose = presc.get('dose_kg_acre', 0)
                p_role = presc.get('role', '')
                p_timing = presc.get('application_timing', '')
                presc_blocks.append(
                    f'<div style="background: linear-gradient(145deg, rgba(24, 33, 56, 0.7) 0%, rgba(11, 16, 29, 0.9) 100%); '
                    f'border: 1px solid rgba(212, 175, 55, 0.22); border-left: 4px solid #D4AF37; border-radius: 12px; '
                    f'padding: 14px 18px; margin-bottom: 12px; box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12);">'
                    f'<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">'
                    f'<span style="font-weight: 800; color: #FFFFFF; font-size: 1.08rem; letter-spacing: -0.01em;">{p_name}</span>'
                    f'<span style="font-family: \'JetBrains Mono\', monospace; font-size: 1.22rem; font-weight: 800; color: #F3E5AB; text-shadow: 0 0 12px rgba(212, 175, 55, 0.35);">{p_dose} <span style="font-size: 0.8rem; color: #94A3B8; font-weight: 500;">kg/acre</span></span>'
                    f'</div>'
                    f'<div style="font-size: 0.84rem; color: #CBD5E1; margin-bottom: 6px; line-height: 1.4;">'
                    f'<strong style="color: #38BDF8;">Target Function:</strong> {p_role}'
                    f'</div>'
                    f'<div style="font-size: 0.80rem; color: var(--terracotta); font-weight: 600; display: flex; align-items: center; gap: 6px;">'
                    f'<span>Application Window:</span>'
                    f'<span style="color: var(--ink); font-weight: 500;">{p_timing}</span>'
                    f'</div>'
                    f'</div>'
                )
            presc_items_html = "".join(presc_blocks)

            table_card_html = (
                f'<div class="sparc-card">'
                f'<div class="sparc-card-header">'
                f'<span class="sparc-title" style="font-size: 1.15rem;">📋 Precision Prescription Schedule</span>'
                f'<span class="sparc-badge badge-gold">24K Commercial Blend</span>'
                f'</div>'
                f'<div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">'
                f'<span class="sparc-badge badge-cyan">Δ N: +{n_def:.0f} kg/ha</span>'
                f'<span class="sparc-badge badge-emerald">Δ P: +{p_def:.0f} kg/ha</span>'
                f'<span class="sparc-badge badge-amber">Δ K: +{k_def:.0f} kg/ha</span>'
                f'</div>'
                f'{presc_items_html}'
                f'<div style="margin-top: 16px; padding: 12px 14px; background: rgba(212, 175, 55, 0.05); border: 1px dashed rgba(212, 175, 55, 0.3); border-radius: 10px; font-size: 0.82rem; color: #D1D5DB;">'
                f'<strong style="color: var(--harvest);">[Agronomic Calibration Protocol]</strong> Split nitrogen application into basal (50%) and top-dressing at tillering/panicle initiation (25% + 25%) to minimize volatilization and leaching losses.'
                f'</div>'
                f'</div>'
            )
            st.markdown(table_card_html, unsafe_allow_html=True)

            # Export Complete Fertilizer Prescription PDF
            try:
                fert_pdf_bytes = generate_agrisense_pdf_report(
                    inputs=inputs,
                    diagnostics=st.session_state.get("last_diagnostics") or {
                        "target_crop": active_crop.capitalize(),
                        "risk_level": "Low Risk",
                        "summary": f"Elemental macronutrient calibration and commercial fertilizer schedule for {active_crop.capitalize()}.",
                        "rescue_roadmap": [],
                        "top_3_enriched": []
                    },
                    weather=st.session_state.get("weather_telemetry") or {},
                    fertilizer_calc=fert_calc,
                    operator=st.session_state.get("current_user", "Lead Agronomist")
                )
                st.download_button(
                    label=f"📄 Download {active_crop.capitalize()} Fertilizer Prescription (PDF)",
                    data=fert_pdf_bytes,
                    file_name=f"SPARC_Fertilizer_Prescription_{active_crop.lower()}_{datetime.now().strftime('%Y%m%d')}.pdf",
                    mime="application/pdf",
                    use_container_width=True,
                    key="tab3_download_pdf_btn"
                )
            except Exception:
                pass

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # TAB 4: PLACE-WISE INDIAN SOIL & FERTILIZER PACKAGES
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    with tab_soil_map:
        st.markdown("""
        <div class="sparc-card">
            <div class="sparc-card-header">
                <span class="sparc-title">🗺️ Place-Wise Indian Soil Conditions & Fertilizer Schedule Explorer</span>
                <span class="sparc-badge badge-emerald">ICAR-IISS Benchmark Registry</span>
            </div>
            <p style="color: #9CA3AF; margin-bottom: 0;">
                Official soil fertility profiles, baseline macronutrient and pH levels, and State Agricultural University (SAU) 
                recommended fertilizer schedules across 18 major Indian states and agricultural zones.
            </p>
        </div>
        """, unsafe_allow_html=True)

        states_list = backend.get_indian_soil_states()
        col_s_sel, col_s_act = st.columns([2, 1])
        with col_s_sel:
            st_choice = st.selectbox("Select Indian State / Region to Inspect", states_list, index=0)
        with col_s_act:
            st.write("")
            st.write("")
            st.button(
                f"⚡ Set {st_choice} as Active Field Baseline",
                key="btn_set_active_soil_baseline",
                on_click=apply_soil_baseline_callback,
                args=(st_choice,),
                use_container_width=True
            )

        profile_data = backend.get_state_soil_profile(st_choice)
        if profile_data:
            # Overview cards
            col_z1, col_z2, col_z3 = st.columns([1.4, 1, 1])
            with col_z1:
                st.markdown(f"""
                <div class="metric-box">
                    <div class="metric-label">Zone / Classification</div>
                    <div class="metric-val" style="font-size: 1.15rem; color: #38BDF8;">{profile_data['soil_type']}</div>
                    <div style="font-size: 0.78rem; color: #9CA3AF; margin-top: 4px;">{profile_data['zone_name']}</div>
                </div>
                """, unsafe_allow_html=True)
            with col_z2:
                b = profile_data["baseline_soil"]
                st.markdown(f"""
                <div class="metric-box">
                    <div class="metric-label">Soil pH & Reaction</div>
                    <div class="metric-val" style="color: {'var(--chlorophyll)' if 6.2 <= b['ph'] <= 7.8 else 'var(--harvest)'};">{b['ph']}</div>
                    <div style="font-size: 0.78rem; color: #9CA3AF; margin-top: 4px;">EC: {b['salinity_ec']} dS/m | OC: {b['organic_carbon_pct']}%</div>
                </div>
                """, unsafe_allow_html=True)
            with col_z3:
                st.markdown(f"""
                <div class="metric-box">
                    <div class="metric-label">Key Sample Districts</div>
                    <div class="metric-val" style="font-size: 0.95rem; color: #F3F4F6;">{', '.join(profile_data['districts_sample'][:3])}</div>
                    <div style="font-size: 0.78rem; color: #9CA3AF; margin-top: 4px;">+{len(profile_data['districts_sample'])-3} more districts</div>
                </div>
                """, unsafe_allow_html=True)

            st.write("")
            col_b1, col_b2 = st.columns([1.2, 1.4], gap="large")

            with col_b1:
                st.markdown("""
                <div class="sparc-card">
                    <div class="sparc-card-header">
                        <span class="sparc-title">📊 Baseline Macronutrient Levels</span>
                        <span class="sparc-badge badge-cyan">kg / hectare</span>
                    </div>
                """, unsafe_allow_html=True)
                b = profile_data["baseline_soil"]
                base_df = pd.DataFrame({
                    "Nutrient": ["Available N", "Available P2O5", "Available K2O"],
                    "kg/ha": [b["nitrogen"], b["phosphorus"], b["potassium"]]
                })
                st.bar_chart(base_df.set_index("Nutrient"), color=["#06B6D4"])

                st.markdown(f"""
                <p style="font-size: 0.88rem; color: #D1D5DB; line-height: 1.5; margin-top: 10px;">
                    {profile_data['soil_description']}
                </p>
                """, unsafe_allow_html=True)

                st.markdown("<div style='color: #FB7185; font-weight: 700; margin-top: 12px;'>⚠️ Dominant Micronutrient Deficiencies:</div>", unsafe_allow_html=True)
                for defic in profile_data["micronutrient_deficiencies"]:
                    st.markdown(f"• <span style='font-size:0.84rem; color:#D1D5DB;'>{defic}</span>", unsafe_allow_html=True)

                st.markdown("</div>", unsafe_allow_html=True)

            with col_b2:
                st.markdown(f"""
                <div class="sparc-card">
                    <div class="sparc-card-header">
                        <span class="sparc-title">State Recommended Fertilizer Packages</span>
                        <span class="sparc-badge badge-emerald">{st_choice} KVK</span>
                    </div>
                """, unsafe_allow_html=True)

                pkgs = profile_data.get("fertilizer_package", {})
                if pkgs:
                    for crop_k, pkg in pkgs.items():
                        st.markdown(f"""
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <strong style="color: var(--terracotta); font-size: 1.05rem;">{crop_k.title()}</strong>
                                <span class="sparc-badge badge-amber">{pkg.get('npk_ratio', 'ICAR Package')}</span>
                            </div>
                            <div style="font-size: 0.84rem; color: #D1D5DB; line-height: 1.5;">
                                • <strong>Urea:</strong> {pkg.get('urea_bags', 'Per schedule')}<br/>
                                • <strong>DAP / SSP:</strong> {pkg.get('dap_bags', pkg.get('ssp_bags', 'Basal application'))}<br/>
                                • <strong>Potash (MOP):</strong> {pkg.get('mop_bags', 'As recommended')}<br/>
                                {f"• <strong>Micronutrient / Soil:</strong> <span style='color:#FBBF24;'>{pkg.get('micronutrient', pkg.get('gypsum', ''))}</span>" if ('micronutrient' in pkg or 'gypsum' in pkg) else ""}
                            </div>
                        </div>
                        """, unsafe_allow_html=True)
                else:
                    st.info(f"General ICAR fertilizer schedule applies for crops in {st_choice}.")

                st.markdown("<div style='color: #1B4332; font-weight: 700; margin-top: 14px;'>[+] Regional Soil Management & Reclamation Protocols:</div>", unsafe_allow_html=True)
                for tip in profile_data["management_tips"]:
                    st.markdown(f"✔ <span style='font-size:0.84rem; color:#D1D5DB;'>{tip}</span>", unsafe_allow_html=True)

                st.markdown("</div>", unsafe_allow_html=True)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # TAB 5: HISTORICAL RECORDS & FULL CRUD PIPELINE
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    with tab_analytics:
        st.markdown("""
        <div class="sparc-card">
            <div class="sparc-card-header">
                <span class="sparc-title">📊 Historical Telemetry & Diagnostic Records</span>
                <span class="sparc-badge badge-cyan">Full CRUD Pipeline</span>
            </div>
            <p style="color: #9CA3AF; margin-bottom: 0;">
                Live query layer over SQLite <code>sparc_records</code>. Query historical recommendations, 
                update field observations, delete obsolete entries, or export to CSV.
            </p>
        </div>
        """, unsafe_allow_html=True)

        col_f1, col_f2, col_f3 = st.columns([1, 1, 1.5])
        with col_f1:
            risk_filter = st.selectbox("Filter by Risk Level", ["ALL", "Low Risk", "Moderate Risk", "High Failure Risk"])
        with col_f2:
            limit_val = st.number_input("Max Records to Display", min_value=10, max_value=500, value=100, step=10)
        with col_f3:
            search_query = st.text_input("Search (Crop, Field Location, Notes)", placeholder="e.g. rice, Block A...")

        records_df = db_instance.get_records(limit=int(limit_val), risk_filter=risk_filter, search=search_query)

        if not records_df.empty:
            m_col1, m_col2, m_col3, m_col4 = st.columns(4)
            with m_col1:
                st.markdown(f"""
                <div class="metric-box">
                    <div class="metric-label">Total Records</div>
                    <div class="metric-val">{len(records_df)}</div>
                </div>
                """, unsafe_allow_html=True)
            with m_col2:
                low_risk_count = len(records_df[records_df['risk_level'] == 'Low Risk'])
                pct = (low_risk_count / len(records_df)) * 100
                st.markdown(f"""
                <div class="metric-box">
                    <div class="metric-label">Low Risk Rate</div>
                    <div class="metric-val" style="color: var(--chlorophyll);">{pct:.1f}%</div>
                </div>
                """, unsafe_allow_html=True)
            with m_col3:
                top_crop_saved = records_df['predicted_crop'].mode()[0] if not records_df['predicted_crop'].empty else "N/A"
                st.markdown(f"""
                <div class="metric-box">
                    <div class="metric-label">Most Recommended</div>
                    <div class="metric-val" style="font-size: 1.25rem; color: #38BDF8;">{top_crop_saved}</div>
                </div>
                """, unsafe_allow_html=True)
            with m_col4:
                avg_ph = records_df['ph'].mean()
                st.markdown(f"""
                <div class="metric-box">
                    <div class="metric-label">Avg Field pH</div>
                    <div class="metric-val">{avg_ph:.2f}</div>
                </div>
                """, unsafe_allow_html=True)

            st.write("")
            st.dataframe(
                records_df[[
                    "id", "timestamp", "username", "farm_location", "nitrogen", "phosphorus",
                    "potassium", "temperature", "ph", "rainfall", "target_crop", "predicted_crop",
                    "confidence", "risk_level", "notes"
                ]],
                use_container_width=True,
                height=320
            )

            col_manage1, col_manage2 = st.columns(2, gap="large")

            with col_manage1:
                st.markdown("##### ✏️ Update Record Notes & Location")
                record_ids = records_df["id"].tolist()
                selected_id = st.selectbox("Select Record ID to Modify", record_ids)
                
                rec_row = records_df[records_df["id"] == selected_id].iloc[0]
                new_farm = st.text_input("Update Farm Location", value=str(rec_row["farm_location"]))
                new_note = st.text_area("Update Field Notes", value=str(rec_row["notes"]), height=80)
                
                if st.button("💾 Update Record", use_container_width=True):
                    if db_instance.update_record_notes(selected_id, new_note, new_farm):
                        st.success(f"Record #{selected_id} updated successfully!")
                        st.rerun()

            with col_manage2:
                st.markdown("##### 🗑️ Delete Obsolete Record")
                del_id = st.selectbox("Select Record ID to Delete", record_ids, key="del_selector")
                st.warning(f"Warning: Deleting record #{del_id} is irreversible.")
                if st.button("❌ Confirm Delete", use_container_width=True):
                    if db_instance.delete_record(del_id):
                        st.success(f"Record #{del_id} permanently removed.")
                        st.rerun()

            st.markdown("---")
            csv_data = records_df.to_csv(index=False).encode('utf-8')
            json_data = records_df.to_json(orient="records", indent=2)

            col_exp1, col_exp2 = st.columns(2)
            with col_exp1:
                st.download_button(
                    label="📥 Export Historical Logs as CSV",
                    data=csv_data,
                    file_name=f"sparc_records_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                    mime="text/csv",
                    use_container_width=True
                )
            with col_exp2:
                st.download_button(
                    label="📥 Export Historical Logs as JSON",
                    data=json_data,
                    file_name=f"sparc_records_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                    mime="application/json",
                    use_container_width=True
                )
        else:
            st.info("No records found in database matching criteria. Run a diagnosis in Tab 1 and click 'Commit Record to Database'.")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # TAB 4: TELEMETRY & SYSTEM LOGS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    with tab_telemetry:
        st.markdown("""
        <div class="sparc-card">
            <div class="sparc-card-header">
                <span class="sparc-title">🛠️ System Activity Audit Trail & Microkernel Telemetry</span>
                <span class="sparc-badge badge-amber">Observability</span>
            </div>
            <p style="color: #9CA3AF; margin-bottom: 0;">
                Real-time operational logging from <code>system_logs</code> capturing latency, 
                database transactions, model inference timings, and API communications.
            </p>
        </div>
        """, unsafe_allow_html=True)

        col_l1, col_l2 = st.columns([1, 2])
        with col_l1:
            log_level = st.selectbox("Log Level Filter", ["ALL", "INFO", "WARNING", "ERROR"])
        with col_l2:
            log_limit = st.slider("Max Logs to Retrieve", 10, 200, 50, step=10)

        logs_df = db_instance.get_system_logs(limit=log_limit, level=log_level)

        if not logs_df.empty:
            st.dataframe(logs_df, use_container_width=True, height=350)
            
            if st.button("🧹 Purge System Audit Logs"):
                if db_instance.clear_system_logs():
                    st.success("Audit trail cleared.")
                    st.rerun()
        else:
            st.info("No system activity logs found.")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # TAB 5: USER PROFILES & ARCHITECTURE DOCUMENTATION
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    with tab_settings:
        col_prof, col_arch = st.columns([1, 1.2], gap="large")

        with col_prof:
            st.markdown("""
            <div class="sparc-card">
                <div class="sparc-card-header">
                    <span class="sparc-title">👥 Operator Directory & Access</span>
                    <span class="sparc-badge badge-cyan">Security Layer</span>
                </div>
            """, unsafe_allow_html=True)

            users_list = db_instance.get_users()
            st.table(pd.DataFrame(users_list)[["username", "full_name", "role", "farm_location"]])

            st.markdown("##### ➕ Register New Agronomist / Field Officer")
            with st.form("new_user_form"):
                new_uname = st.text_input("Username (alphanumeric)")
                new_name = st.text_input("Full Name")
                new_role = st.selectbox("Assigned Role", ["Lead Agronomist", "Research Scientist", "Field Farmer", "Extension Specialist"])
                new_loc = st.text_input("Assigned Farm Region / District")
                submitted = st.form_submit_button("Create Profile")
                if submitted:
                    if new_uname and new_name:
                        if db_instance.add_user(new_uname, new_role, new_name, new_loc):
                            st.success(f"User {new_uname} created successfully!")
                            st.rerun()
                        else:
                            st.error("Username already exists or database error.")
                    else:
                        st.warning("Please provide username and full name.")

            st.markdown("</div>", unsafe_allow_html=True)

        with col_arch:
            st.markdown("""
            <div class="sparc-card">
                <div class="sparc-card-header">
                    <span class="sparc-title">🏛️ SPARC Technical Architecture</span>
                    <span class="sparc-badge badge-emerald">Pure Python</span>
                </div>
                <div style="font-size: 0.9rem; color: #D1D5DB; line-height: 1.6;">
                    <p><strong>1. Seamless Auto-Location Telemetry:</strong> Automatic physical geolocation via IP matching coupled with Open-Meteo REST service for instant temperature, rainfall, and humidity calibration.</p>
                    <p><strong>2. Agronomic Rescue Protocol:</strong> Multi-tiered physiological stress analysis detailing exact soil amendments, thermal management, irrigation scheduling, and seed treatments if the farmer insists on planting their target crop.</p>
                    <p><strong>3. Top 3 AI Crop Alternatives:</strong> Machine learning confidence rankings across 38 diverse crops with economic outlook, water requirements, and 1-click crop adoption.</p>
                    <p><strong>4. Place-Wise Indian Soil Database:</strong> 18-state comprehensive registry with ICAR-IISS baseline fertility metrics (NPK, pH, OC, EC) and State Agricultural University fertilizer packages.</p>
                    <p><strong>5. Crop Doctor (Plant Pathology):</strong> Integrated Pest Management (IPM) covering 68+ major crop diseases across all 38 supported crops, real-time weather outbreak risk alerts, biological biocontrols, and CIBRC chemical prescriptions with tank dilution calculators.</p>
                    <p><strong>6. SQLite Persistence & Full CRUD:</strong> Automated tracking in <code>sparc_records</code> with search, inline note editing, and instant CSV/JSON exports.</p>
                </div>
            </div>
            """, unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────────────────────
# APPLICATION ENTRYPOINT & STATE ROUTER
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    if not st.session_state.splash_completed:
        render_splash_screen()
    else:
        main_dashboard()
