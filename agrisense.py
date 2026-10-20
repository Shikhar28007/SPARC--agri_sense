"""
SPARC - Smart Python Based Agriculture Recommendation and Classification System
Entrypoint Bridge for agrisense.py -> app.py
Ensures full compatibility whether running 'streamlit run app.py' or 'streamlit run agrisense.py'.
"""

import app

# Guarantee active session state initialization on every run
app.ensure_session_state()

if not app.st.session_state.get("splash_completed", False):
    app.render_splash_screen()
else:
    app.main_dashboard()