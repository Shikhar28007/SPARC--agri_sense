
import streamlit as st
import pickle
import pandas as pd
import requests
import db_manager
import time

st.set_page_config(page_title="SPARC", layout="wide")

hide_streamlit_style = """
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    </style>
"""
st.markdown(hide_streamlit_style, unsafe_allow_html=True)

try:
    with open("crop_model.pkl", "rb") as file:
        model = pickle.load(file)
except FileNotFoundError:
    st.error("System Error: model data not found. Please ensure crop_model.pkl is in the repository.")
    model = None

CROP_WATER_NEEDS = {
    'rice': 1200, 'maize': 600, 'jute': 1000, 'cotton': 800, 'coconut': 1500,
    'papaya': 1000, 'orange': 900, 'apple': 800, 'muskmelon': 400, 'watermelon': 400,
    'grapes': 700, 'mango': 1000, 'banana': 1500, 'pomegranate': 600, 'lentil': 300,
    'blackgram': 350, 'mungbean': 350, 'mothbeans': 300, 'pigeonpeas': 500,
    'kidneybeans': 400, 'chickpea': 350, 'coffee': 1500
}

def recommend_crop(nitrogen, phosphorus, potassium, temp, rainfall):
    if not model: return None
    if any(val < 0 for val in [nitrogen, phosphorus, potassium, temp, rainfall]):
        st.error("Error: input data cannot be negative.")
        return None
    if temp > 60 or rainfall > 1000:
        st.warning("Warning: high weather values detected. Result may be inaccurate.")
        
    probabilities = model.predict_proba([[nitrogen, phosphorus, potassium, temp, rainfall]])[0]
    top_3_indices = probabilities.argsort()[-3:][::-1]
    return [(model.classes_[i], probabilities[i] * 100) for i in top_3_indices]

def get_live_weather(city_name):
    API_KEY = "474928493d640bda234fb2612a2d9091" 
    geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city_name}&limit=1&appid={API_KEY}"
    geo_response = requests.get(geo_url).json()
    
    if not geo_response:
        return None, None
        
    lat, lon = geo_response[0]['lat'], geo_response[0]['lon']
    weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={API_KEY}"
    weather_response = requests.get(weather_url).json()
    
    temp = weather_response['main']['temp']
    rainfall = weather_response.get('rain', {}).get('1h', 0) * 24 
    return temp, rainfall

def estimate_water_requirement(crop, live_temp):
    base_water = CROP_WATER_NEEDS.get(crop.lower(), 600)
    evaporation_factor = max(0, (live_temp - 25) * 0.02)
    return round(base_water * (1 + evaporation_factor))

def predict_failure_risk(confidence_score, live_temp, live_rain):
    base_risk = 100 - confidence_score
    weather_penalty = 0
    if live_temp > 38 or live_temp < 10: weather_penalty += 15
    if live_rain > 800 or live_rain < 30: weather_penalty += 20
    return min(base_risk + weather_penalty, 95.0) 

st.title("🌱 SPARC")
st.subheader("Smart Python-based Agricultural Recommendation and Classification System")

tab1, tab2, tab3 = st.tabs(["🌱 Crop Predictor", "📈 Soil Visualization", "🛠️ Admin Logs"])

with tab1:
    st.write("### Live Weather Integration")
    city = st.text_input("Enter your city to fetch live weather (Optional):")
    live_temp, live_rain = None, None

    if city:
        if "YOUR_API_KEY_HERE" in get_live_weather.__code__.co_consts:
             st.error("Please insert your actual OpenWeatherMap API Key in the code to use this feature.")
        else:
            live_temp, live_rain = get_live_weather(city)
            if live_temp:
                st.success(f"Live Weather in {city.capitalize()}: {live_temp}°C, {live_rain:.1f}mm Rain")
            else:
                st.error("City not found. Using manual sliders below.")

    st.divider()
    st.write("### Agricultural Inputs")
    col1, col2, col3 = st.columns(3)
    with col1: n = st.number_input("Nitrogen (N)", min_value=0, value=85)
    with col2: p = st.number_input("Phosphorus (P)", min_value=0, value=40)
    with col3: k = st.number_input("Potassium (K)", min_value=0, value=43)

    final_temp = st.slider("Temperature (°C)", 0.0, 50.0, float(live_temp) if live_temp else 25.0)
    final_rain = st.slider("Rainfall (mm)", 0.0, 500.0, float(live_rain) if live_rain else 200.0)

    if st.button("Recommend Crop", type="primary"):
        with st.spinner("Analyzing soil macro-nutrients and live meteorological data..."):
            time.sleep(1.5) 
            results = recommend_crop(n, p, k, final_temp, final_rain)
        
        if results:
            st.balloons() 
            
            top_crop = results[0][0]
            confidence = results[0][1]
            
            est_water = estimate_water_requirement(top_crop, final_temp)
            risk_percent = predict_failure_risk(confidence, final_temp, final_rain)
            
            st.success(f"### 🌱 Primary Recommendation: {top_crop.capitalize()} ({confidence:.1f}% Match)")
            st.info(f"**Alternative Options:** {results[1][0].capitalize()} ({results[1][1]:.1f}%), {results[2][0].capitalize()} ({results[2][1]:.1f}%)")
            
            st.write("---")
            st.write("### 📊 Live Predictive Analytics")
            metric_col1, metric_col2 = st.columns(2)
            
            with metric_col1:
                st.metric(
                    label="Estimated Seasonal Water Need", 
                    value=f"{est_water} mm", 
                    delta="Adjusted for local evaporation" if final_temp > 25 else "Standard baseline",
                    delta_color="off"
                )
                
            with metric_col2:
                if risk_percent < 30:
                    st.success(f"Crop Failure Risk: {risk_percent:.1f}% (Low)")
                elif risk_percent < 60:
                    st.warning(f"Crop Failure Risk: {risk_percent:.1f}% (Moderate)")
                else:
                    st.error(f"Crop Failure Risk: {risk_percent:.1f}% (High)")
                    
            db_manager.log_prediction(n, p, k, final_temp, final_rain, top_crop.capitalize())

with tab2:
    st.write("### Soil Macronutrient Balance")
    st.write("This chart dynamically visualizes the nutrient profile entered in the Predictor tab.")
    
    nutrient_data = pd.DataFrame({
        "Nutrient": ["Nitrogen", "Phosphorus", "Potassium"],
        "Levels": [n, p, k]
    })
    
    st.bar_chart(nutrient_data, x="Nutrient", y="Levels", color="#2ecc71")

with tab3:
    st.write("### System Database")
    logs = db_manager.fetch_all_logs()
    if logs:
        df = pd.DataFrame(logs, columns=["ID", "Timestamp", "N", "P", "K", "Temp (°C)", "Rain (mm)", "Predicted Crop"])
        st.dataframe(df, use_container_width=True)
    else:
        st.info("No predictions logged yet. Run the model to populate the database.")