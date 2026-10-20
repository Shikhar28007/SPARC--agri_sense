"""
SPARC - Smart Python Based Agriculture Recommendation and Classification System
Entrypoint Bridge for agrisense.py -> app.py
Ensures full compatibility whether running 'streamlit run app.py' or 'streamlit run agrisense.py'.
"""

import app

if not app.st.session_state.get("splash_completed", False):
    app.render_splash_screen()
else:
    app.main_dashboard()