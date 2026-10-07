
import streamlit as st
import pickle
import pandas as pd
import requests
import db_manager

try:
    with open("crop_model.pkl", "rb") as file:
        model = pickle.load(file)
except FileNotFoundError:
    st.error("System Error: model data not found.")
    model = None


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

st.title("🌱 SPARC")
st.subheader("Smart Python-based Agricultural Recommendation System")


city = st.text_input("Enter your city for live weather (Optional):")
live_temp, live_rain = None, None

if city:
    live_temp, live_rain = get_live_weather(city)
    if live_temp:
        st.success(f"Live Weather in {city.capitalize()}: {live_temp}°C, {live_rain:.1f}mm Rain")
    else:
        st.error("City not found. Using manual sliders below.")

st.write("Enter Soil Data:")
col1, col2, col3 = st.columns(3)
with col1: n = st.number_input("Nitrogen (N)", min_value=0, value=85)
with col2: p = st.number_input("Phosphorus (P)", min_value=0, value=40)
with col3: k = st.number_input("Potassium (K)", min_value=0, value=43)

st.write("Weather Data:")
final_temp = st.slider("Temperature (°C)", 0.0, 50.0, float(live_temp) if live_temp else 25.0)
final_rain = st.slider("Rainfall (mm)", 0.0, 500.0, float(live_rain) if live_rain else 200.0)

if st.button("Recommend Crop", type="primary"):
    results = recommend_crop(n, p, k, final_temp, final_rain)
    if results:
        top_crop = results[0][0].capitalize()
        st.success(f"### Top Recommendation: {top_crop} ({results[0][1]:.1f}% Match)")
        st.info(f"**Alternatives:** {results[1][0].capitalize()} ({results[1][1]:.1f}%), {results[2][0].capitalize()} ({results[2][1]:.1f}%)")
        db_manager.log_prediction(n, p, k, final_temp, final_rain, top_crop)

st.divider()
with st.expander("🛠️ Admin Dashboard: View Prediction History"):
    logs = db_manager.fetch_all_logs()
    if logs:
        df = pd.DataFrame(logs, columns=["ID", "Timestamp", "N", "P", "K", "Temp", "Rain", "Predicted Crop"])
        st.dataframe(df, use_container_width=True)
    else:
        st.info("No predictions logged yet.")