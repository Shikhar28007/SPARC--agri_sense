"""
SPARC / AgriSense Botanical Theme & Python-Driven UI System
Caliber: Pachama, Indigo Ag, Climate FieldView, and Aesop Editorial Layouts
Modular Pythonic UI Architecture with Zero Stock Photography, Earth-Science Palette,
and Precision Agronomic Field-Station Design.
"""

from typing import Dict, Any, List, Optional
import html
import numpy as np
try:
    import plotly.graph_objects as go
except ImportError:
    go = None


# ─────────────────────────────────────────────────────────────────────────────
# SECTION A: PYTHON DESIGN TOKEN & SVG DICTIONARIES
# ─────────────────────────────────────────────────────────────────────────────

THEME: Dict[str, str] = {
    # Backgrounds & Surfaces (Botanical Herbarium & Terracotta)
    "bg_canvas": "#F4F1EA",          # Unbleached Parchment / Warm Linen
    "bg_card": "#FAF8F3",            # Crisp Alabaster
    "bg_card_elevated": "#FFFFFF",   # Pure Specimen White
    "bg_console": "#EBE6DC",         # Soft Clay Tint
    "bg_subtle": "#EDE8DE",          # Weathered Sand
    
    # Borders & Dividers
    "border_hairline": "#D8D2C5",     # Warm Loam Stone
    "border_medium": "#C2BAB0",      # Weathered Silt
    "border_accent": "#1B4332",      # Chlorophyll Accent Border
    
    # Typography Colors
    "text_primary": "#162119",        # Deep Forest Ink
    "text_muted": "#5A655D",          # Weathered Sage
    "text_dim": "#7C887E",            # Dried Herb Grey
    "text_light": "#96A298",         # Subdued Monospace
    
    # Earth & Botanical Accents
    "accent_primary": "#1B4332",      # Deep Chlorophyll
    "accent_secondary": "#C85A32",    # Terracotta Clay (Primary Buttons/CTAs)
    "accent_warning": "#D97706",      # Harvest Ochre
    "accent_success": "#2D6A4F",      # Balanced Soil Green
    "accent_info": "#2A6F97",         # Hydrologic Blue
    "accent_danger": "#A4303F",       # Earth Red
    
    # Radii & Shadows
    "radius_sm": "4px",
    "radius_md": "8px",
    "radius_lg": "12px",
    "shadow_subtle": "0 2px 8px rgba(22, 33, 25, 0.04), 0 1px 2px rgba(22, 33, 25, 0.02)",
    "shadow_card": "0 8px 24px rgba(22, 33, 25, 0.06), 0 1px 3px rgba(22, 33, 25, 0.03)",
    "shadow_elevated": "0 16px 36px rgba(22, 33, 25, 0.09), 0 2px 6px rgba(22, 33, 25, 0.04)",
}

# Precision 1.5px stroke SVGs (Zero farm/nature emojis allowed)
SVG_ICONS: Dict[str, str] = {
    "specimen": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<path d="M12 22V12M12 12C12 7 7 4 3 4c0 6 3 11 9 11z"/>'
        '<path d="M12 12c0-5 5-8 9-8 0 6-3 11-9 11z"/>'
        '<path d="M12 16c2-1 4-1 6-2"/>'
        '<path d="M12 18c-2-1-4-1-6-2"/>'
        '</svg>'
    ),
    "soil": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<path d="M3 6h18M3 12h18M3 18h18"/>'
        '<path d="M6 3v18M18 3v18"/>'
        '<circle cx="10" cy="9" r="1" fill="currentColor"/>'
        '<circle cx="14" cy="15" r="1" fill="currentColor"/>'
        '</svg>'
    ),
    "moisture": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>'
        '<path d="M12 9a3 3 0 0 0-3 3"/>'
        '</svg>'
    ),
    "temp": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>'
        '<path d="M11.5 8h2M11.5 11h2"/>'
        '</svg>'
    ),
    "ph": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<line x1="4" y1="19" x2="20" y2="19"/>'
        '<circle cx="12" cy="7" r="4"/>'
        '<path d="M12 11v8M8 15h8"/>'
        '</svg>'
    ),
    "compass": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<circle cx="12" cy="12" r="10"/>'
        '<polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>'
        '</svg>'
    ),
    "microscope": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<path d="M6 18h8M3 22h18M14 22a7 7 0 1 0-14 0"/>'
        '<path d="M9 14h2M9 12a2 2 0 0 1 2-2h4l4 4-2 2-4-4"/>'
        '<path d="m14 10 3-3"/>'
        '</svg>'
    ),
    "flask": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/>'
        '<path d="M8.5 2h7M7 16h10"/>'
        '</svg>'
    ),
    "atlas": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>'
        '<line x1="8" y1="2" x2="8" y2="18"/>'
        '<line x1="16" y1="6" x2="16" y2="22"/>'
        '</svg>'
    ),
    "ledger": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>'
        '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'
        '<line x1="8" y1="6" x2="16" y2="6"/>'
        '<line x1="8" y1="10" x2="16" y2="10"/>'
        '</svg>'
    ),
    "terminal": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<polyline points="4 17 10 11 4 5"/>'
        '<line x1="12" y1="19" x2="20" y2="19"/>'
        '</svg>'
    ),
    "user": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>'
        '<circle cx="12" cy="7" r="4"/>'
        '</svg>'
    ),
    "target": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<circle cx="12" cy="12" r="10"/>'
        '<circle cx="12" cy="12" r="6"/>'
        '<circle cx="12" cy="12" r="2"/>'
        '</svg>'
    ),
    "check": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<polyline points="20 6 9 17 4 12"/>'
        '</svg>'
    ),
    "warning": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>'
        '<line x1="12" y1="9" x2="12" y2="13"/>'
        '<line x1="12" y1="17" x2="12.01" y2="17"/>'
        '</svg>'
    ),
    "refresh": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<polyline points="23 4 23 10 17 10"/>'
        '<polyline points="1 20 1 14 7 14"/>'
        '<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>'
        '</svg>'
    ),
    "download": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>'
        '<polyline points="7 10 12 15 17 10"/>'
        '<line x1="12" y1="15" x2="12" y2="3"/>'
        '</svg>'
    )
}

# Scientific botanical names for high-contrast specimen classification
BOTANICAL_TAXONOMY: Dict[str, Dict[str, str]] = {
    "rice": {"scientific": "Oryza sativa", "family": "Poaceae", "stratum": "Alluvial Clay Loam", "origin": "Indo-Gangetic Basin"},
    "wheat": {"scientific": "Triticum aestivum", "family": "Poaceae", "stratum": "Well-Drained Silt", "origin": "Fertile Crescent"},
    "maize": {"scientific": "Zea mays", "family": "Poaceae", "stratum": "Friable Sandy Loam", "origin": "Mesoamerica"},
    "chickpea": {"scientific": "Cicer arietinum", "family": "Fabaceae", "stratum": "Deep Vertisol Clay", "origin": "Levant / South Asia"},
    "kidneybeans": {"scientific": "Phaseolus vulgaris", "family": "Fabaceae", "stratum": "Humus Loam", "origin": "Andean Region"},
    "pigeonpeas": {"scientific": "Cajanus cajan", "family": "Fabaceae", "stratum": "Laterite Loam", "origin": "Peninsular India"},
    "mothbeans": {"scientific": "Vigna aconitifolia", "family": "Fabaceae", "stratum": "Arid Sandy Loam", "origin": "Thar Desert"},
    "mungbean": {"scientific": "Vigna radiata", "family": "Fabaceae", "stratum": "Silty Alluvium", "origin": "Indian Subcontinent"},
    "blackgram": {"scientific": "Vigna mungo", "family": "Fabaceae", "stratum": "Black Loam", "origin": "Deccan Plateau"},
    "lentil": {"scientific": "Lens culinaris", "family": "Fabaceae", "stratum": "Light Alluvial", "origin": "Near East"},
    "pomegranate": {"scientific": "Punica granatum", "family": "Lythraceae", "stratum": "Gravelly Loam", "origin": "Persian Plateau"},
    "banana": {"scientific": "Musa acuminata", "family": "Musaceae", "stratum": "Volcanic Alluvium", "origin": "Indomalaya"},
    "mango": {"scientific": "Mangifera indica", "family": "Anacardiaceae", "stratum": "Deep Sandy Loam", "origin": "Tropical Asia"},
    "grapes": {"scientific": "Vitis vinifera", "family": "Vitaceae", "stratum": "Chalky Gravel", "origin": "Mediterranean"},
    "watermelon": {"scientific": "Citrullus lanatus", "family": "Cucurbitaceae", "stratum": "Sandy Riverbeds", "origin": "Northeastern Africa"},
    "muskmelon": {"scientific": "Cucumis melo", "family": "Cucurbitaceae", "stratum": "Warm Sandy Loam", "origin": "Central Asia"},
    "apple": {"scientific": "Malus domestica", "family": "Rosaceae", "stratum": "Temperate Mountain Loam", "origin": "Tian Shan"},
    "orange": {"scientific": "Citrus sinensis", "family": "Rutaceae", "stratum": "Well-Aerated Loam", "origin": "Southern China"},
    "papaya": {"scientific": "Carica papaya", "family": "Caricaceae", "stratum": "Rich Porous Loam", "origin": "Central America"},
    "coconut": {"scientific": "Cocos nucifera", "family": "Arecaceae", "stratum": "Coastal Arenosol", "origin": "Indo-Pacific"},
    "cotton": {"scientific": "Gossypium hirsutum", "family": "Malvaceae", "stratum": "Deep Vertisol", "origin": "Subtropical Global"},
    "jute": {"scientific": "Corchorus olitorius", "family": "Malvaceae", "stratum": "Floodplain Silt", "origin": "Bengal Delta"},
    "coffee": {"scientific": "Coffea arabica", "family": "Rubiaceae", "stratum": "Acidic Humic Loam", "origin": "Ethiopian Highlands"},
    "sugarcane": {"scientific": "Saccharum officinarum", "family": "Poaceae", "stratum": "Heavy Alluvium", "origin": "New Guinea"},
    "tea": {"scientific": "Camellia sinensis", "family": "Theaceae", "stratum": "Highland Acid Loam", "origin": "East Asia"},
    "potato": {"scientific": "Solanum tuberosum", "family": "Solanaceae", "stratum": "Loose Aerated Loam", "origin": "Andes"},
    "tomato": {"scientific": "Solanum lycopersicum", "family": "Solanaceae", "stratum": "Humus Sand-Clay", "origin": "Western South America"},
    "onion": {"scientific": "Allium cepa", "family": "Amaryllidaceae", "stratum": "Friable Silt Loam", "origin": "Central Asia"},
    "garlic": {"scientific": "Allium sativum", "family": "Amaryllidaceae", "stratum": "Well-Drained Loam", "origin": "Central Asia"},
    "chilli": {"scientific": "Capsicum annuum", "family": "Solanaceae", "stratum": "Light Sandy Loam", "origin": "Mesoamerica"},
    "turmeric": {"scientific": "Curcuma longa", "family": "Zingiberaceae", "stratum": "Friable Rich Loam", "origin": "South Asia"},
    "ginger": {"scientific": "Zingiber officinale", "family": "Zingiberaceae", "stratum": "Drained Humus Soil", "origin": "Maritime Southeast Asia"},
    "mustard": {"scientific": "Brassica juncea", "family": "Brassicaceae", "stratum": "Light Alluvial", "origin": "Himalayan Foothills"},
    "soybean": {"scientific": "Glycine max", "family": "Fabaceae", "stratum": "Fertile Organic Loam", "origin": "East Asia"},
    "barley": {"scientific": "Hordeum vulgare", "family": "Poaceae", "stratum": "Cool Sandy Loam", "origin": "Fertile Crescent"},
    "bajra": {"scientific": "Pennisetum glaucum", "family": "Poaceae", "stratum": "Drought Arid Sand", "origin": "Sahelian Africa"},
    "jowar": {"scientific": "Sorghum bicolor", "family": "Poaceae", "stratum": "Medium Deep Black Clay", "origin": "Sub-Saharan Africa"}
}


# ─────────────────────────────────────────────────────────────────────────────
# SECTION B: REUSABLE PYTHON UI COMPONENT FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def inject_botanical_theme(theme_dict: Dict[str, str] = THEME) -> str:
    """
    Constructs the master Botanical Herbarium & Terracotta CSS architecture.
    Applies the 3-font pairing ('Fraunces', 'Plus Jakarta Sans', 'JetBrains Mono'),
    injects the architectural surveyor hairline grid, styles native Streamlit widgets,
    and removes framework chrome.
    """
    css = f"""
    <style>
    /* Google Fonts Botanical Architecture */
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    :root {{
        --bg-canvas: {theme_dict['bg_canvas']};
        --bg-card: {theme_dict['bg_card']};
        --bg-card-elevated: {theme_dict['bg_card_elevated']};
        --bg-console: {theme_dict['bg_console']};
        --bg-subtle: {theme_dict['bg_subtle']};
        --border-hairline: {theme_dict['border_hairline']};
        --border-medium: {theme_dict['border_medium']};
        --border-accent: {theme_dict['border_accent']};
        --text-primary: {theme_dict['text_primary']};
        --text-muted: {theme_dict['text_muted']};
        --text-dim: {theme_dict['text_dim']};
        --text-light: {theme_dict['text_light']};
        --accent-primary: {theme_dict['accent_primary']};
        --accent-secondary: {theme_dict['accent_secondary']};
        --accent-warning: {theme_dict['accent_warning']};
        --accent-success: {theme_dict['accent_success']};
        --accent-info: {theme_dict['accent_info']};
        --accent-danger: {theme_dict['accent_danger']};
        --font-serif: 'Fraunces', Georgia, serif;
        --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        --font-mono: 'JetBrains Mono', Menlo, monospace;
        --radius-sm: {theme_dict['radius_sm']};
        --radius-md: {theme_dict['radius_md']};
        --radius-lg: {theme_dict['radius_lg']};
        --transition-smooth: all 0.28s cubic-bezier(0.22, 1, 0.36, 1);
    }}

    /* Architectural Surveyor Canvas */
    .stApp {{
        background-color: var(--bg-canvas) !important;
        background-image: 
            linear-gradient(to right, rgba(27, 67, 50, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(27, 67, 50, 0.04) 1px, transparent 1px) !important;
        background-size: 36px 36px !important;
        color: var(--text-primary) !important;
        font-family: var(--font-sans) !important;
        letter-spacing: -0.01em;
    }}

    /* Hide Framework Chrome */
    #MainMenu {{ visibility: hidden !important; }}
    footer {{ visibility: hidden !important; }}
    header {{ background: transparent !important; }}
    div[data-testid="stToolbar"] {{ visibility: hidden !important; display: none !important; }}
    div[data-testid="stDecoration"] {{ visibility: hidden !important; }}

    /* Expansive Field-Station Viewport */
    .main .block-container {{
        max-width: 1440px !important;
        padding-top: clamp(1.2rem, 2.5vw, 2.2rem) !important;
        padding-bottom: 4.5rem !important;
        padding-left: clamp(1rem, 2.5vw, 2.2rem) !important;
        padding-right: clamp(1rem, 2.5vw, 2.2rem) !important;
    }}

    /* Herbarium Precision Containers */
    div[data-testid="stVerticalBlock"] > div[data-testid="stContainer"] {{
        background: var(--bg-card) !important;
        border: 1px solid var(--border-hairline) !important;
        border-radius: var(--radius-md) !important;
        box-shadow: {theme_dict['shadow_subtle']} !important;
        padding: 1.4rem !important;
        margin-bottom: 1.2rem !important;
        position: relative;
    }}

    /* Typography Overrides */
    h1, h2, h3 {{
        font-family: var(--font-serif) !important;
        color: var(--text-primary) !important;
        font-weight: 600 !important;
        letter-spacing: -0.025em !important;
    }}

    h4, h5, h6 {{
        font-family: var(--font-sans) !important;
        color: var(--text-primary) !important;
        font-weight: 600 !important;
        letter-spacing: -0.01em !important;
    }}

    p, span, label, div {{
        color: var(--text-primary);
    }}

    /* Monospace Fieldstation Telemetry Tabs */
    div[data-baseweb="tab-list"] {{
        background: var(--bg-console) !important;
        border: 1px solid var(--border-hairline) !important;
        border-radius: var(--radius-md) !important;
        padding: 5px !important;
        gap: 6px !important;
    }}

    div[data-baseweb="tab"] {{
        font-family: var(--font-mono) !important;
        font-size: 0.76rem !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.06em !important;
        color: var(--text-muted) !important;
        background: transparent !important;
        border-radius: var(--radius-sm) !important;
        padding: 8px 14px !important;
        border: 1px solid transparent !important;
        transition: var(--transition-smooth) !important;
    }}

    div[data-baseweb="tab"]:hover {{
        color: var(--accent-primary) !important;
        background: rgba(255, 255, 255, 0.4) !important;
    }}

    div[data-baseweb="tab"][aria-selected="true"] {{
        background: var(--bg-card-elevated) !important;
        color: var(--accent-primary) !important;
        font-weight: 700 !important;
        border: 1px solid var(--border-hairline) !important;
        box-shadow: 0 2px 6px rgba(22, 33, 25, 0.05) !important;
    }}

    div[data-baseweb="tab-highlight"], div[data-baseweb="tab-border"] {{
        display: none !important;
    }}

    /* Native Slider Precision Engineering */
    div[data-testid="stSlider"] {{
        padding: 0.4rem 0 !important;
    }}

    div[data-testid="stSlider"] label {{
        font-family: var(--font-sans) !important;
        font-size: 0.85rem !important;
        font-weight: 600 !important;
        color: var(--text-primary) !important;
        margin-bottom: 0.35rem !important;
    }}

    div[data-testid="stSlider"] div[role="slider"] {{
        background-color: var(--accent-primary) !important;
        border: 2px solid var(--bg-card-elevated) !important;
        box-shadow: 0 2px 6px rgba(27, 67, 50, 0.25) !important;
        width: 18px !important;
        height: 18px !important;
        transition: transform 0.15s ease !important;
    }}

    div[data-testid="stSlider"] div[role="slider"]:hover {{
        transform: scale(1.15) !important;
    }}

    div[data-testid="stSlider"] div[data-baseweb="slider"] > div:first-child {{
        background: var(--border-hairline) !important;
        height: 5px !important;
        border-radius: 3px !important;
    }}

    div[data-testid="stSlider"] div[data-baseweb="slider"] div[style*="left"] {{
        background: var(--accent-primary) !important;
    }}

    /* Native Buttons - Terracotta & Linen */
    div[data-testid="stButton"] > button {{
        font-family: var(--font-sans) !important;
        font-size: 0.86rem !important;
        font-weight: 600 !important;
        border: 1px solid var(--border-hairline) !important;
        background: var(--bg-card-elevated) !important;
        color: var(--text-primary) !important;
        border-radius: var(--radius-sm) !important;
        padding: 0.6rem 1.1rem !important;
        transition: var(--transition-smooth) !important;
        box-shadow: 0 1px 2px rgba(22, 33, 25, 0.03) !important;
    }}

    div[data-testid="stButton"] > button:hover {{
        border-color: var(--accent-primary) !important;
        color: var(--accent-primary) !important;
        background: var(--bg-subtle) !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 10px rgba(22, 33, 25, 0.08) !important;
    }}

    /* Terracotta Primary CTA */
    div[data-testid="stButton"] > button[kind="primary"] {{
        background: var(--accent-secondary) !important;
        border-color: #B24B27 !important;
        color: #FAF8F3 !important;
        font-family: var(--font-mono) !important;
        font-size: 0.84rem !important;
        text-transform: uppercase !important;
        letter-spacing: 0.06em !important;
        font-weight: 700 !important;
        box-shadow: 0 3px 12px rgba(200, 90, 50, 0.22) !important;
    }}

    div[data-testid="stButton"] > button[kind="primary"]:hover {{
        background: #B84C26 !important;
        color: #FFFFFF !important;
        transform: translateY(-1.5px) !important;
        box-shadow: 0 6px 18px rgba(200, 90, 50, 0.32) !important;
    }}

    /* Form Inputs & Selects */
    div[data-baseweb="input"] input, div[data-baseweb="select"] div {{
        font-family: var(--font-sans) !important;
        background-color: var(--bg-card-elevated) !important;
        color: var(--text-primary) !important;
        border-color: var(--border-hairline) !important;
        border-radius: var(--radius-sm) !important;
    }}

    div[data-baseweb="input"]:focus-within {{
        border-color: var(--accent-primary) !important;
        box-shadow: 0 0 0 1px var(--accent-primary) !important;
    }}

    /* Metric & Telemetry Blocks */
    div[data-testid="stMetricValue"] {{
        font-family: var(--font-serif) !important;
        font-size: 2.1rem !important;
        color: var(--text-primary) !important;
        letter-spacing: -0.03em !important;
    }}

    div[data-testid="stMetricLabel"] {{
        font-family: var(--font-mono) !important;
        font-size: 0.75rem !important;
        text-transform: uppercase !important;
        letter-spacing: 0.08em !important;
        color: var(--text-muted) !important;
    }}

    /* Expander Styler */
    div[data-testid="stExpander"] {{
        background: var(--bg-card) !important;
        border: 1px solid var(--border-hairline) !important;
        border-radius: var(--radius-md) !important;
    }}

    /* Custom Field Classes */
    .telemetry-ribbon {{
        background: var(--bg-console);
        border: 1px solid var(--border-hairline);
        border-radius: var(--radius-md);
        padding: 0.75rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
        font-family: var(--font-mono);
        font-size: 0.76rem;
        color: var(--text-muted);
        letter-spacing: 0.04em;
    }}

    .section-header-box {{
        position: relative;
        padding-left: 0.2rem;
        margin-bottom: 1.25rem;
        margin-top: 0.5rem;
    }}

    .section-watermark {{
        font-family: var(--font-serif);
        font-size: 3.2rem;
        font-weight: 700;
        line-height: 1;
        position: absolute;
        top: -1.2rem;
        left: -0.4rem;
        color: rgba(27, 67, 50, 0.07);
        pointer-events: none;
        user-select: none;
    }}

    .section-title {{
        font-family: var(--font-serif);
        font-size: 1.35rem;
        font-weight: 600;
        color: var(--text-primary);
        letter-spacing: -0.02em;
        margin-bottom: 0.2rem;
        position: relative;
        z-index: 1;
    }}

    .section-subtitle {{
        font-family: var(--font-sans);
        font-size: 0.82rem;
        color: var(--text-muted);
        margin: 0;
        position: relative;
        z-index: 1;
    }}

    .horizon-bar-container {{
        background: var(--bg-card-elevated);
        border: 1px solid var(--border-hairline);
        border-radius: var(--radius-md);
        padding: 0.85rem 1.1rem;
        margin-bottom: 0.75rem;
        box-shadow: 0 1px 3px rgba(22, 33, 25, 0.02);
    }}

    .horizon-header {{
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 0.5rem;
    }}

    .horizon-title {{
        font-family: var(--font-sans);
        font-size: 0.84rem;
        font-weight: 600;
        color: var(--text-primary);
    }}

    .horizon-value-pill {{
        font-family: var(--font-mono);
        font-size: 0.78rem;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: var(--radius-sm);
        background: var(--bg-console);
        border: 1px solid var(--border-hairline);
    }}

    .horizon-track {{
        position: relative;
        height: 8px;
        background: var(--bg-subtle);
        border-radius: 4px;
        overflow: visible;
        margin: 0.4rem 0 0.3rem 0;
    }}

    .horizon-fill {{
        height: 100%;
        border-radius: 4px;
        transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }}

    .horizon-ticks {{
        display: flex;
        justify-content: space-between;
        font-family: var(--font-mono);
        font-size: 0.68rem;
        color: var(--text-dim);
        margin-top: 0.25rem;
    }}

    .specimen-card {{
        background: var(--bg-card-elevated);
        border: 1.5px solid var(--accent-primary);
        border-radius: var(--radius-lg);
        padding: 1.8rem;
        position: relative;
        box-shadow: var(--shadow-card);
        margin-bottom: 1.5rem;
        overflow: hidden;
    }}

    .specimen-card::before {{
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 5px;
        background: linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
    }}

    .specimen-stamp {{
        font-family: var(--font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--accent-primary);
        background: rgba(27, 67, 50, 0.08);
        border: 1px solid rgba(27, 67, 50, 0.2);
        padding: 3px 8px;
        border-radius: 3px;
        display: inline-block;
        margin-bottom: 0.75rem;
    }}

    .specimen-title {{
        font-family: var(--font-serif);
        font-size: clamp(2.1rem, 3.8vw, 3.1rem);
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.03em;
        line-height: 1.05;
        margin: 0.2rem 0;
    }}

    .specimen-taxonomy {{
        font-family: var(--font-serif);
        font-style: italic;
        font-size: 1.05rem;
        color: var(--text-muted);
        margin-bottom: 1.25rem;
    }}

    .specimen-bento {{
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 0.85rem;
        margin-top: 1.25rem;
    }}

    .specimen-bento-tile {{
        background: var(--bg-card);
        border: 1px solid var(--border-hairline);
        border-radius: var(--radius-sm);
        padding: 0.75rem 0.9rem;
    }}

    .specimen-bento-label {{
        font-family: var(--font-mono);
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-muted);
        margin-bottom: 0.25rem;
    }}

    .specimen-bento-value {{
        font-family: var(--font-sans);
        font-size: 0.92rem;
        font-weight: 600;
        color: var(--text-primary);
    }}

    .specimen-confidence {{
        font-family: var(--font-mono);
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--accent-secondary);
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
    }}

    .adaptation-box {{
        background: var(--bg-card);
        border: 1px solid var(--border-hairline);
        border-left: 4px solid var(--accent-secondary);
        border-radius: var(--radius-sm);
        padding: 1.1rem 1.3rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }}

    /* Botanical Legacy Card & Metric Classes */
    .sparc-card {{
        background: var(--bg-card) !important;
        border: 1px solid var(--border-hairline) !important;
        border-radius: var(--radius-md) !important;
        box-shadow: 0 2px 8px rgba(22, 33, 25, 0.04) !important;
        padding: 1.4rem !important;
        margin-bottom: 1.2rem !important;
        color: var(--text-primary) !important;
    }}
    .sparc-card-header {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.85rem;
        flex-wrap: wrap;
        gap: 0.5rem;
    }}
    .sparc-title {{
        font-family: var(--font-serif) !important;
        font-size: 1.25rem !important;
        font-weight: 600 !important;
        color: var(--text-primary) !important;
        letter-spacing: -0.02em !important;
    }}
    .sparc-badge {{
        font-family: var(--font-mono) !important;
        font-size: 0.72rem !important;
        font-weight: 700 !important;
        letter-spacing: 0.08em !important;
        text-transform: uppercase !important;
        padding: 3px 8px !important;
        border-radius: var(--radius-sm) !important;
        border: 1px solid var(--border-hairline) !important;
        background: var(--bg-console) !important;
        color: var(--text-muted) !important;
    }}
    .badge-emerald, .badge-cyan {{
        background: rgba(27, 67, 50, 0.08) !important;
        color: var(--accent-primary) !important;
        border-color: rgba(27, 67, 50, 0.25) !important;
    }}
    .badge-gold, .badge-amber {{
        background: rgba(217, 119, 6, 0.1) !important;
        color: var(--accent-warning) !important;
        border-color: rgba(217, 119, 6, 0.3) !important;
    }}
    .badge-rose {{
        background: rgba(164, 48, 63, 0.1) !important;
        color: var(--accent-danger) !important;
        border-color: rgba(164, 48, 63, 0.3) !important;
    }}
    .alt-crop-card {{
        background: var(--bg-card-elevated) !important;
        border: 1px solid var(--border-hairline) !important;
        border-radius: var(--radius-md) !important;
        padding: 1.1rem !important;
        margin-bottom: 0.85rem !important;
        box-shadow: 0 1px 4px rgba(22, 33, 25, 0.03) !important;
    }}
    .alt-crop-card:hover {{
        border-color: var(--accent-primary) !important;
    }}
    .metric-box {{
        background: var(--bg-card-elevated) !important;
        border: 1px solid var(--border-hairline) !important;
        border-radius: var(--radius-sm) !important;
        padding: 0.85rem 1rem !important;
        margin-bottom: 0.65rem !important;
    }}
    .metric-label {{
        font-family: var(--font-mono) !important;
        font-size: 0.7rem !important;
        text-transform: uppercase !important;
        letter-spacing: 0.06em !important;
        color: var(--text-muted) !important;
        margin-bottom: 0.25rem !important;
    }}
    .metric-val {{
        font-family: var(--font-serif) !important;
        font-size: 1.6rem !important;
        font-weight: 700 !important;
        color: var(--text-primary) !important;
        letter-spacing: -0.02em !important;
    }}
    .rescue-item {{
        background: var(--bg-card-elevated) !important;
        border: 1px solid var(--border-hairline) !important;
        border-left: 3px solid var(--accent-primary) !important;
        border-radius: var(--radius-sm) !important;
        padding: 0.85rem 1rem !important;
        margin-bottom: 0.75rem !important;
    }}
    </style>
    """
    return css


def render_telemetry_ribbon(
    region: str = "PUNJAB_ALLUVIAL",
    season: str = "KHARIF",
    status: str = "NOMINAL",
    temp: str = "--",
    humidity: str = "--",
    rainfall: str = "--"
) -> str:
    """
    Renders the precision monospace field-station top ribbon.
    """
    reg_clean = html.escape(str(region).upper())
    season_clean = html.escape(str(season).upper())
    status_clean = html.escape(str(status).upper())
    temp_clean = html.escape(str(temp))
    hum_clean = html.escape(str(humidity))
    rain_clean = html.escape(str(rainfall))

    return f"""
    <div class="telemetry-ribbon">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="color: var(--accent-primary);">{SVG_ICONS['compass']}</span>
            <span>STATION: <strong>AGRISENSE-CONSOLE // v4.2</strong></span>
            <span>&bull;</span>
            <span>ZONE: <strong>{reg_clean}</strong></span>
            <span>&bull;</span>
            <span>CYCLE: <strong>{season_clean}</strong></span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.85rem;">
            <span>AMBIENT: <strong>{temp_clean}&deg;C</strong> | <strong>{hum_clean}% RH</strong> | <strong>{rain_clean} mm</strong></span>
            <span>&bull;</span>
            <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: var(--accent-success);">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: var(--accent-success); display: inline-block;"></span>
                SENSOR: <strong>{status_clean}</strong>
            </span>
        </div>
    </div>
    """


def render_section_header(
    number: str,
    title: str,
    subtitle: str,
    badge: str = "FIELD_INSTRUMENT"
) -> str:
    """
    Renders an architectural section header with an oversized watermark index number.
    """
    num_clean = html.escape(str(number))
    title_clean = html.escape(str(title))
    subtitle_clean = html.escape(str(subtitle))
    badge_clean = html.escape(str(badge))

    return f"""
    <div class="section-header-box">
        <div class="section-watermark">{num_clean}</div>
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <h3 class="section-title">{title_clean}</h3>
            <span style="font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.08em; color: var(--text-dim); text-transform: uppercase;">
                [{badge_clean}]
            </span>
        </div>
        <p class="section-subtitle">{subtitle_clean}</p>
    </div>
    """


def render_soil_horizon_bar(
    label: str,
    value: float,
    min_val: float,
    max_val: float,
    unit: str,
    status_color: Optional[str] = None,
    target_val: Optional[float] = None
) -> str:
    """
    Calculates percentage fill in Python and renders a sleek horizontal spectrum meter.
    """
    clamped_val = max(min_val, min(max_val, value))
    pct = max(0.0, min(100.0, ((clamped_val - min_val) / (max_val - min_val)) * 100.0)) if max_val > min_val else 50.0

    if not status_color:
        if pct < 25.0:
            color = THEME["accent_warning"]
            status_text = "DEFICIENT"
        elif pct > 80.0:
            color = THEME["accent_secondary"]
            status_text = "EXCESS"
        else:
            color = THEME["accent_primary"]
            status_text = "OPTIMAL"
    else:
        color = status_color
        status_text = "ACTIVE"

    target_marker_html = ""
    if target_val is not None:
        clamped_tar = max(min_val, min(max_val, target_val))
        tar_pct = max(0.0, min(100.0, ((clamped_tar - min_val) / (max_val - min_val)) * 100.0))
        target_marker_html = f"""
        <div style="position: absolute; left: {tar_pct:.1f}%; top: -3px; bottom: -3px; width: 2px; background: var(--accent-secondary); z-index: 2;" title="Target: {target_val:.1f} {unit}"></div>
        """

    label_clean = html.escape(label)
    unit_clean = html.escape(unit)

    return f"""
    <div class="horizon-bar-container">
        <div class="horizon-header">
            <span class="horizon-title">{label_clean}</span>
            <div style="display: flex; gap: 0.4rem; align-items: center;">
                <span style="font-family: var(--font-mono); font-size: 0.68rem; color: {color}; font-weight: 600;">{status_text}</span>
                <span class="horizon-value-pill" style="color: {color};">
                    {value:.1f} <span style="font-size: 0.65rem; color: var(--text-dim);">{unit_clean}</span>
                </span>
            </div>
        </div>
        <div class="horizon-track">
            {target_marker_html}
            <div class="horizon-fill" style="width: {pct:.1f}%; background: {color};"></div>
        </div>
        <div class="horizon-ticks">
            <span>{min_val:.0f} {unit_clean}</span>
            <span>{(min_val + max_val) / 2:.0f}</span>
            <span>{max_val:.0f} {unit_clean}</span>
        </div>
    </div>
    """


def render_specimen_card(
    crop_name: str,
    confidence: float,
    metrics_dict: Dict[str, Any],
    scientific_name: str = "",
    season: str = "",
    soil_type: str = ""
) -> str:
    """
    Renders the high-contrast editorial Botanical Specimen Output Card.
    """
    name_clean = crop_name.strip().title()
    crop_key = crop_name.strip().lower()
    
    # Lookup taxonomy if not provided
    tax_info = BOTANICAL_TAXONOMY.get(crop_key, {})
    sci_display = scientific_name or tax_info.get("scientific", f"{name_clean} sp.")
    family_display = tax_info.get("family", "Angiospermae")
    stratum_display = soil_type or tax_info.get("stratum", "Alluvial Loam")

    water_demand = metrics_dict.get("water_demand", "Moderate Hydration")
    cycle_days = metrics_dict.get("cycle_days", "90 - 120 Days")
    economic_outlook = metrics_dict.get("economic_outlook", "High liquidity across regional APMC Mandis.")
    specimen_no = f"AGR-{abs(hash(crop_key)) % 900 + 100:03d}"

    conf_pct = confidence * 100.0 if confidence <= 1.0 else confidence

    return f"""
    <div class="specimen-card">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <div class="specimen-stamp">BOTANICAL SPECIMEN // {specimen_no}</div>
            <div class="specimen-confidence">
                <span>{SVG_ICONS['check']}</span>
                <span>MATCH INDEX: {conf_pct:.1f}%</span>
            </div>
        </div>

        <h2 class="specimen-title">{name_clean}</h2>
        <div class="specimen-taxonomy">
            {sci_display} &bull; <span style="font-family: var(--font-sans); font-size: 0.85rem; font-style: normal; color: var(--text-dim);">{family_display}</span>
        </div>

        <div style="background: var(--bg-console); border: 1px solid var(--border-hairline); border-radius: var(--radius-sm); padding: 0.75rem 1rem; font-size: 0.85rem; color: var(--text-primary); margin-bottom: 1rem;">
            <strong>Agronomic Viability:</strong> {economic_outlook}
        </div>

        <div class="specimen-bento">
            <div class="specimen-bento-tile">
                <div class="specimen-bento-label">VEGETATIVE CYCLE</div>
                <div class="specimen-bento-value">{cycle_days}</div>
            </div>
            <div class="specimen-bento-tile">
                <div class="specimen-bento-label">WATER DEMAND</div>
                <div class="specimen-bento-value">{water_demand}</div>
            </div>
            <div class="specimen-bento-tile">
                <div class="specimen-bento-label">IDEAL STRATUM</div>
                <div class="specimen-bento-value">{stratum_display}</div>
            </div>
            <div class="specimen-bento-tile">
                <div class="specimen-bento-label">AGRO CLIMATIC SUITABILITY</div>
                <div class="specimen-bento-value" style="color: var(--accent-success); font-weight: 700;">HIGH OPTIMALITY</div>
            </div>
        </div>
    </div>
    """


def render_nutrient_balance_card(n: float, p: float, k: float, ph: float) -> str:
    """
    Calculates and renders stoichiometric nutrient ratios and soil chemistry status.
    """
    total = max(1.0, n + p + k)
    n_ratio = (n / total) * 100.0
    p_ratio = (p / total) * 100.0
    k_ratio = (k / total) * 100.0

    if ph < 6.0:
        ph_class = "ACIDIC STRATUM"
        ph_color = THEME["accent_warning"]
        ph_note = "Lime (CaCO3) application recommended for neutralization."
    elif ph > 7.5:
        ph_class = "ALKALINE STRATUM"
        ph_color = THEME["accent_info"]
        ph_note = "Gypsum or elemental sulfur recommended to lower pH."
    else:
        ph_class = "NEUTRAL / BALANCED"
        ph_color = THEME["accent_success"]
        ph_note = "Ideal root absorption profile for primary macronutrients."

    return f"""
    <div style="background: var(--bg-card); border: 1px solid var(--border-hairline); border-radius: var(--radius-md); padding: 1.1rem; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.6rem;">
            <span style="font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase;">
                MACRONUTRIENT RATIO (N : P : K)
            </span>
            <span style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 600; color: var(--text-primary);">
                {n:.0f} : {p:.0f} : {k:.0f}
            </span>
        </div>
        <div style="display: flex; height: 10px; border-radius: 5px; overflow: hidden; background: var(--bg-subtle); margin-bottom: 0.85rem;">
            <div style="width: {n_ratio:.1f}%; background: var(--accent-primary);" title="Nitrogen: {n_ratio:.1f}%"></div>
            <div style="width: {p_ratio:.1f}%; background: var(--accent-secondary);" title="Phosphorus: {p_ratio:.1f}%"></div>
            <div style="width: {k_ratio:.1f}%; background: var(--accent-warning);" title="Potassium: {k_ratio:.1f}%"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-dim); margin-bottom: 0.85rem;">
            <span><strong style="color: var(--accent-primary);">N:</strong> {n_ratio:.0f}%</span>
            <span><strong style="color: var(--accent-secondary);">P:</strong> {p_ratio:.0f}%</span>
            <span><strong style="color: var(--accent-warning);">K:</strong> {k_ratio:.0f}%</span>
        </div>
        <div style="border-top: 1px dashed var(--border-hairline); padding-top: 0.6rem; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-family: var(--font-sans); font-size: 0.82rem; color: var(--text-muted);">
                SOIL CHEMISTRY: <strong style="color: {ph_color};">{ph_class} (pH {ph:.1f})</strong>
            </span>
            <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-dim);">{ph_note}</span>
        </div>
    </div>
    """


def render_rescue_protocol_card(
    crop_name: str,
    feasibility_score: float,
    required_actions: List[str],
    fertilizer_changes: Dict[str, Any]
) -> str:
    """
    Renders the precision botanical adaptation protocol for cultivating a non-ideal target crop.
    """
    crop_title = crop_name.strip().title()
    score_pct = feasibility_score * 100.0 if feasibility_score <= 1.0 else feasibility_score

    score_color = THEME["accent_success"] if score_pct >= 70 else (THEME["accent_warning"] if score_pct >= 40 else THEME["accent_danger"])

    actions_html = "".join([f"<li style='margin-bottom: 0.4rem; color: var(--text-primary); font-size: 0.86rem;'>{html.escape(a)}</li>" for a in required_actions]) or "<li>No critical amendments required. Maintain standard agronomic scheduling.</li>"

    urea_adj = fertilizer_changes.get("urea_adj_kg_ha", 0.0)
    dap_adj = fertilizer_changes.get("dap_adj_kg_ha", 0.0)
    mop_adj = fertilizer_changes.get("mop_adj_kg_ha", 0.0)

    return f"""
    <div class="adaptation-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
            <div style="font-family: var(--font-mono); font-size: 0.76rem; letter-spacing: 0.08em; color: var(--accent-secondary); font-weight: 700; text-transform: uppercase;">
                AGRONOMIC ADAPTATION PROTOCOL // {crop_title}
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: {score_color};">
                FEASIBILITY INDEX: {score_pct:.1f}%
            </div>
        </div>
        <p style="font-size: 0.84rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            Soil horizon modifications and nutrient dosage calibrations required to achieve target physiological yield:
        </p>
        <ul style="padding-left: 1.2rem; margin-bottom: 1rem;">
            {actions_html}
        </ul>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem; background: var(--bg-card-elevated); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-hairline);">
            <div style="text-align: center;">
                <div style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted);">UREA COMPENSATION</div>
                <div style="font-family: var(--font-mono); font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">{urea_adj:+.1f} kg/ha</div>
            </div>
            <div style="text-align: center;">
                <div style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted);">DAP COMPENSATION</div>
                <div style="font-family: var(--font-mono); font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">{dap_adj:+.1f} kg/ha</div>
            </div>
            <div style="text-align: center;">
                <div style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted);">MOP COMPENSATION</div>
                <div style="font-family: var(--font-mono); font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">{mop_adj:+.1f} kg/ha</div>
            </div>
        </div>
    </div>
    """


def render_splash_screen_html() -> str:
    """
    Exquisite botanical herbarium startup sequence matching the Aesop/Pachama aesthetic.
    Pure HTML/SVG with surveyor rings, Fraunces serif typography, and terracotta styling.
    """
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;600;700&family=JetBrains+Mono:wght@500;700&display=swap');

* {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}}

body {{
    background: transparent;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    color: #162119;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    overflow: hidden;
}}

.splash-container {{
    width: 100%;
    min-height: 480px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: #FAF8F3;
    background-image: 
        linear-gradient(to right, rgba(27, 67, 50, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(27, 67, 50, 0.04) 1px, transparent 1px);
    background-size: 32px 32px;
    border-radius: 12px;
    border: 1px solid #D8D2C5;
    padding: 40px 24px;
    box-shadow: 0 12px 36px rgba(22, 33, 25, 0.08);
    position: relative;
    overflow: hidden;
}}

.ring-outer {{
    position: absolute;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    border: 1px dashed rgba(27, 67, 50, 0.18);
    animation: spinClockwise 32s linear infinite;
    pointer-events: none;
}}

.ring-inner {{
    position: absolute;
    width: 290px;
    height: 290px;
    border-radius: 50%;
    border: 1px dashed rgba(200, 90, 50, 0.22);
    animation: spinCounter 22s linear infinite;
    pointer-events: none;
}}

@keyframes spinClockwise {{
    from {{ transform: rotate(0deg); }}
    to {{ transform: rotate(360deg); }}
}}

@keyframes spinCounter {{
    from {{ transform: rotate(360deg); }}
    to {{ transform: rotate(0deg); }}
}}

.crest-icon {{
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: #EDE8DE;
    border: 1.5px solid #1B4332;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
    z-index: 2;
    color: #1B4332;
    box-shadow: 0 4px 14px rgba(27, 67, 50, 0.12);
}}

.brand-badge {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: #1B4332;
    text-transform: uppercase;
    background: #EBE6DC;
    border: 1px solid #D8D2C5;
    padding: 4px 10px;
    border-radius: 3px;
    margin-bottom: 14px;
    z-index: 2;
}}

.brand-title {{
    font-family: 'Fraunces', Georgia, serif;
    font-size: 2.7rem;
    font-weight: 700;
    color: #162119;
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin-bottom: 8px;
    z-index: 2;
}}

.brand-subtitle {{
    font-size: 0.95rem;
    color: #5A655D;
    max-width: 580px;
    line-height: 1.5;
    margin-bottom: 24px;
    z-index: 2;
}}

.checklist {{
    display: flex;
    gap: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.74rem;
    color: #5A655D;
    margin-bottom: 26px;
    z-index: 2;
    flex-wrap: wrap;
    justify-content: center;
}}

.checklist span {{
    display: inline-flex;
    align-items: center;
    gap: 5px;
}}

.checklist strong {{
    color: #1B4332;
}}

.progress-track {{
    width: 320px;
    height: 4px;
    background: #EBE6DC;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 12px;
    z-index: 2;
}}

.progress-bar {{
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #1B4332 0%, #C85A32 100%);
    animation: loadBar 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}}

@keyframes loadBar {{
    0% {{ width: 0%; }}
    40% {{ width: 65%; }}
    100% {{ width: 100%; }}
}}
</style>
</head>
<body>
<div class="splash-container">
    <div class="ring-outer"></div>
    <div class="ring-inner"></div>

    <div class="crest-icon">
        {SVG_ICONS['specimen']}
    </div>

    <div class="brand-badge">AGRISENSE AI // BOTANICAL SPECIMEN CONSOLE</div>
    <h1 class="brand-title">Herbarium & Field Diagnostics</h1>
    <p class="brand-subtitle">
        Precision ecological soil modeling, botanical classification, and adaptive agronomic management for 38 regional crop species.
    </p>

    <div class="checklist">
        <span>[+] <strong>ICAR-IISS SOIL HORIZONS:</strong> CALIBRATED</span>
        <span>&bull;</span>
        <span>[+] <strong>PATHOLOGY ENGINE:</strong> INITIALIZED</span>
        <span>&bull;</span>
        <span>[+] <strong>TELEMETRY SENSORS:</strong> ONLINE</span>
    </div>

    <div class="progress-track">
        <div class="progress-bar"></div>
    </div>
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: #7C887E; z-index: 2;">
        SYSTEM READY // INITIALIZING AGRO-CLIMATIC CONSOLE
    </div>
</div>
</body>
</html>
"""


def build_3d_npk_graph(fert_calc: dict, active_crop: str, view_mode: str = "line_chart"):
    """
    Renders clean, highly understandable, and intuitive visualizations with the
    Botanical Herbarium & Terracotta design system:
    Mode 1 ('line_chart' - Default): 3D Dual-Profile Line Chart comparing Current Field values
                                    (Deep Chlorophyll Line) vs Required Target values
                                    (Terracotta for N, Harvest Ochre for P, Balanced Green for K).
    Mode 2 ('columns'): 3D Side-by-Side Dual-Pillar Comparison.
    Mode 3 ('flat_2d'): 2D Direct High-Clarity View for immediate, zero-rotation clarity.
    Mode 4 ('yield_surface'): 3D Topographical Yield Response Landscape.
    """
    if go is None:
        return None

    current = fert_calc.get("current_npk", {})
    target = fert_calc.get("target_npk", {})
    n_cur, p_cur, k_cur = float(current.get("N", 0)), float(current.get("P", 0)), float(current.get("K", 0))
    n_tar, p_tar, k_tar = float(target.get("N", 0)), float(target.get("P", 0)), float(target.get("K", 0))
    def_sub = fert_calc.get("deficits", {})
    n_def = float(def_sub.get("N_deficit", max(0.0, n_tar - n_cur)))
    p_def = float(def_sub.get("P_deficit", max(0.0, p_tar - p_cur)))
    k_def = float(def_sub.get("K_deficit", max(0.0, k_tar - k_cur)))

    nut_labels = ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)']
    cur_vals = [n_cur, p_cur, k_cur]
    tar_vals = [n_tar, p_tar, k_tar]
    def_vals = [n_def, p_def, k_def]
    tar_colors = [THEME['accent_secondary'], THEME['accent_warning'], THEME['accent_success']]
    tar_names = ['Req. Nitrogen (N)', 'Req. Phosphorus (P)', 'Req. Potassium (K)']

    fig = go.Figure()

    if view_mode in ("line_chart", "equilibrium"):
        fig.add_trace(go.Scatter3d(
            x=[0, 1, 2],
            y=[0, 0, 0],
            z=cur_vals,
            mode='lines+markers+text',
            text=[f"Current: {v:.0f}" for v in cur_vals],
            textposition='top left',
            textfont=dict(color=THEME['accent_primary'], size=11, family='JetBrains Mono, monospace'),
            line=dict(color=THEME['accent_primary'], width=7),
            marker=dict(size=12, color=THEME['accent_primary'], symbol='circle',
                        line=dict(color='#FAF8F3', width=2)),
            name="Current Field Horizon",
            hovertemplate="<b>Current Field: %{x}</b><br>Level: <b>%{z:.1f} kg/ha</b><extra></extra>"
        ))

        fig.add_trace(go.Scatter3d(
            x=[0, 1, 2],
            y=[0, 0, 0],
            z=tar_vals,
            mode='lines',
            line=dict(color=THEME['border_hairline'], width=3, dash='solid'),
            showlegend=False,
            hoverinfo='none'
        ))

        for i in range(3):
            fig.add_trace(go.Scatter3d(
                x=[i], y=[0], z=[tar_vals[i]],
                mode='markers+text',
                text=[f"Target: {tar_vals[i]:.0f}"],
                textposition='top right',
                textfont=dict(color=tar_colors[i], size=11, family='JetBrains Mono, monospace'),
                marker=dict(size=14, color=tar_colors[i], symbol='diamond',
                            line=dict(color='#FAF8F3', width=2)),
                name=f"{tar_names[i]} ({tar_vals[i]:.0f} kg/ha)",
                hovertemplate=(
                    f"<b>{tar_names[i]}</b><br>"
                    f"Target: <b>{tar_vals[i]:.1f} kg/ha</b><br>"
                    f"Current: <b>{cur_vals[i]:.1f} kg/ha</b><br>"
                    f"Deficit: <b>+{def_vals[i]:.1f} kg/ha</b><extra></extra>"
                )
            ))

        for i in range(3):
            status_text = f"+{def_vals[i]:.0f} kg/ha" if def_vals[i] > 0 else "Balanced"
            fig.add_trace(go.Scatter3d(
                x=[i, i], y=[0, 0], z=[cur_vals[i], tar_vals[i]],
                mode='lines+text',
                text=['', status_text],
                textposition='middle center',
                textfont=dict(color=tar_colors[i], size=10, family='JetBrains Mono, monospace'),
                line=dict(color=tar_colors[i], width=5, dash='dash'),
                name=f"Deficit {nut_labels[i]}: +{def_vals[i]:.0f} kg/ha" if def_vals[i] > 0 else f"{nut_labels[i]}: Balanced",
                hovertemplate=f"<b>Deficit {nut_labels[i]}</b>: +{def_vals[i]:.1f} kg/ha needed<extra></extra>"
            ))

        z_top = max(max(cur_vals), max(tar_vals)) + 25.0
        scene_dict = dict(
            xaxis=dict(
                title=dict(text='Nutrient Spectrum', font=dict(color=THEME['text_primary'], size=12, family='JetBrains Mono, monospace')),
                tickvals=[0, 1, 2],
                ticktext=nut_labels,
                tickfont=dict(color=THEME['text_primary'], size=10, family='JetBrains Mono, monospace'),
                backgroundcolor='rgba(235, 230, 220, 0.45)',
                gridcolor='rgba(216, 210, 197, 0.7)'
            ),
            yaxis=dict(
                showticklabels=False,
                title=dict(text=''),
                range=[-0.4, 0.4],
                backgroundcolor='rgba(235, 230, 220, 0.45)',
                gridcolor='rgba(216, 210, 197, 0.5)'
            ),
            zaxis=dict(
                title=dict(text='Concentration (kg/ha)', font=dict(color=THEME['text_primary'], size=12, family='JetBrains Mono, monospace')),
                range=[0, z_top],
                tickfont=dict(color=THEME['text_muted'], size=9, family='JetBrains Mono, monospace'),
                backgroundcolor='rgba(235, 230, 220, 0.45)',
                gridcolor='rgba(216, 210, 197, 0.7)'
            ),
            aspectratio=dict(x=2.0, y=0.6, z=1.0),
            camera=dict(eye=dict(x=0.05, y=-2.1, z=0.55))
        )
        fig.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            scene=scene_dict,
            margin=dict(l=10, r=10, b=10, t=10),
            height=440,
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=1.02,
                xanchor="center",
                x=0.5,
                font=dict(size=10, color=THEME['text_primary'], family='JetBrains Mono, monospace'),
                bgcolor="rgba(250, 248, 243, 0.95)",
                bordercolor=THEME['border_hairline'],
                borderwidth=1
            )
        )
        return fig

    elif view_mode == "columns":
        for i in range(3):
            fig.add_trace(go.Scatter3d(
                x=[i - 0.16, i - 0.16], y=[0, 0], z=[0, cur_vals[i]],
                mode='lines+markers+text',
                line=dict(color=THEME['accent_primary'], width=14),
                marker=dict(size=9, color=THEME['accent_primary'], symbol='circle'),
                text=['', f"{cur_vals[i]:.0f} kg/ha"],
                textposition='top center',
                textfont=dict(color=THEME['accent_primary'], size=10, family='JetBrains Mono, monospace'),
                name="Current Field Horizon" if i == 0 else None,
                showlegend=(i == 0),
                hovertemplate=f"<b>Current {nut_labels[i]}</b>: {cur_vals[i]:.1f} kg/ha<extra></extra>"
            ))
            fig.add_trace(go.Scatter3d(
                x=[i + 0.16, i + 0.16], y=[0, 0], z=[0, tar_vals[i]],
                mode='lines+markers+text',
                line=dict(color=tar_colors[i], width=14),
                marker=dict(size=9, color=tar_colors[i], symbol='diamond'),
                text=['', f"{tar_vals[i]:.0f} kg/ha"],
                textposition='top center',
                textfont=dict(color=tar_colors[i], size=10, family='JetBrains Mono, monospace'),
                name=f"Target {nut_labels[i]}",
                showlegend=True,
                hovertemplate=f"<b>Target {nut_labels[i]}</b>: {tar_vals[i]:.1f} kg/ha<br>Deficit: <b>+{def_vals[i]:.1f} kg/ha</b><extra></extra>"
            ))

        z_top = max(max(cur_vals), max(tar_vals)) + 25.0
        scene_dict = dict(
            xaxis=dict(
                title=dict(text='Nutrient Spectrum', font=dict(color=THEME['text_primary'], size=12)),
                tickvals=[0, 1, 2],
                ticktext=nut_labels,
                tickfont=dict(color=THEME['text_primary'], size=10),
                backgroundcolor='rgba(235, 230, 220, 0.45)',
                gridcolor='rgba(216, 210, 197, 0.7)'
            ),
            yaxis=dict(showticklabels=False, title=dict(text=''), range=[-0.4, 0.4], backgroundcolor='rgba(235, 230, 220, 0.45)', gridcolor='rgba(216, 210, 197, 0.5)'),
            zaxis=dict(title=dict(text='Amount (kg/ha)', font=dict(color=THEME['text_primary'], size=12)), range=[0, z_top], tickfont=dict(color=THEME['text_muted'], size=9), backgroundcolor='rgba(235, 230, 220, 0.45)', gridcolor='rgba(216, 210, 197, 0.7)'),
            aspectratio=dict(x=2.0, y=0.6, z=1.0),
            camera=dict(eye=dict(x=0.05, y=-2.1, z=0.55))
        )
        fig.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            scene=scene_dict,
            margin=dict(l=10, r=10, b=10, t=10),
            height=440,
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=1.02,
                xanchor="center",
                x=0.5,
                font=dict(size=10, color=THEME['text_primary']),
                bgcolor="rgba(250, 248, 243, 0.95)",
                bordercolor=THEME['border_hairline'],
                borderwidth=1
            )
        )
        return fig

    elif view_mode == "flat_2d":
        fig.add_trace(go.Bar(
            x=nut_labels,
            y=cur_vals,
            name="Current Field Horizon",
            marker=dict(color=THEME['accent_primary'], line=dict(color='#FAF8F3', width=1.5)),
            text=[f"{v:.0f} kg/ha" for v in cur_vals],
            textposition='auto',
            textfont=dict(color='#FFFFFF', size=11, family='JetBrains Mono, monospace'),
            hovertemplate="<b>Current Field: %{x}</b><br>Amount: <b>%{y:.1f} kg/ha</b><extra></extra>"
        ))
        for i in range(3):
            fig.add_trace(go.Bar(
                x=[nut_labels[i]],
                y=[tar_vals[i]],
                name=f"{tar_names[i]}",
                marker=dict(color=tar_colors[i], line=dict(color='#FAF8F3', width=1.5)),
                text=[f"{tar_vals[i]:.0f} kg/ha"],
                textposition='auto',
                textfont=dict(color='#FFFFFF', size=11, family='JetBrains Mono, monospace'),
                hovertemplate=f"<b>Required {nut_labels[i]}</b><br>Target: <b>{tar_vals[i]:.1f} kg/ha</b><br>Deficit: <b>+{def_vals[i]:.1f} kg/ha</b><extra></extra>"
            ))
        fig.update_layout(
            barmode='group',
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(235, 230, 220, 0.45)',
            xaxis=dict(
                title=dict(text='Nutrient Spectrum', font=dict(color=THEME['text_primary'], size=12)),
                tickfont=dict(color=THEME['text_primary'], size=11),
                gridcolor='rgba(216, 210, 197, 0.7)'
            ),
            yaxis=dict(
                title=dict(text='Amount (kg/ha)', font=dict(color=THEME['text_primary'], size=12)),
                tickfont=dict(color=THEME['text_muted'], size=10),
                gridcolor='rgba(216, 210, 197, 0.7)'
            ),
            margin=dict(l=10, r=10, b=10, t=10),
            height=420,
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=1.02,
                xanchor="center",
                x=0.5,
                font=dict(size=10, color=THEME['text_primary']),
                bgcolor="rgba(250, 248, 243, 0.95)",
                bordercolor=THEME['border_hairline'],
                borderwidth=1
            )
        )
        return fig

    else:
        # 3D Quadratic Yield Potential Landscape
        n_min = max(0.0, n_tar - 70.0)
        n_max = n_tar + 70.0
        p_min = max(0.0, p_tar - 35.0)
        p_max = p_tar + 35.0
        n_range = np.linspace(n_min, n_max, 28)
        p_range = np.linspace(p_min, p_max, 28)
        N_grid, P_grid = np.meshgrid(n_range, p_range)
        Yield_grid = 100.0 - 0.0075 * (N_grid - n_tar)**2 - 0.018 * (P_grid - p_tar)**2
        Yield_grid = np.clip(Yield_grid, 30.0, 100.0)

        fig.add_trace(go.Surface(
            x=N_grid, y=P_grid, z=Yield_grid,
            colorscale=[
                [0.0, '#EBE6DC'],
                [0.35, '#8F9B91'],
                [0.70, '#2D6A4F'],
                [0.90, '#D97706'],
                [1.0, '#C85A32']
            ],
            opacity=0.94,
            name="Yield Potential %",
            colorbar=dict(title="Yield %", len=0.65, x=1.02, tickfont=dict(color=THEME['text_primary'])),
            contours=dict(
                z=dict(show=True, usecolormap=True, project=dict(z=True), highlightcolor="#FAF8F3")
            )
        ))

        cur_yield = float(np.clip(100.0 - 0.0075 * (n_cur - n_tar)**2 - 0.018 * (p_cur - p_tar)**2, 30.0, 100.0))
        fig.add_trace(go.Scatter3d(
            x=[n_cur], y=[p_cur], z=[cur_yield],
            mode='markers',
            marker=dict(size=12, color=THEME['accent_primary'], symbol='circle', line=dict(color='#FAF8F3', width=2)),
            name=f"Field Operating Point ({cur_yield:.1f}%)",
            hovertemplate=f"<b>Field Yield: {cur_yield:.1f}%</b><br>N: <b>{n_cur:.0f}</b> | P: <b>{p_cur:.0f}</b> kg/ha<extra></extra>"
        ))

        fig.add_trace(go.Scatter3d(
            x=[n_tar], y=[p_tar], z=[100.0],
            mode='markers',
            marker=dict(size=14, color=THEME['accent_secondary'], symbol='diamond', line=dict(color='#FAF8F3', width=2)),
            name="100% Potential Summit",
            hovertemplate=f"<b>100% Optimum Summit</b><br>N: <b>{n_tar:.0f}</b> | P: <b>{p_tar:.0f}</b> kg/ha<extra></extra>"
        ))

        scene_dict = dict(
            xaxis=dict(
                title=dict(text='Nitrogen N (kg/ha)', font=dict(color=THEME['text_primary'], size=11)),
                backgroundcolor='rgba(235, 230, 220, 0.45)',
                gridcolor='rgba(216, 210, 197, 0.7)'
            ),
            yaxis=dict(
                title=dict(text='Phosphorus P (kg/ha)', font=dict(color=THEME['text_primary'], size=11)),
                backgroundcolor='rgba(235, 230, 220, 0.45)',
                gridcolor='rgba(216, 210, 197, 0.7)'
            ),
            zaxis=dict(
                title=dict(text='Yield Potential (%)', font=dict(color=THEME['text_primary'], size=11)),
                backgroundcolor='rgba(235, 230, 220, 0.45)',
                gridcolor='rgba(216, 210, 197, 0.7)'
            ),
            aspectratio=dict(x=1.2, y=1.2, z=0.88),
            camera=dict(eye=dict(x=1.75, y=-1.5, z=1.25))
        )
        fig.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            scene=scene_dict,
            margin=dict(l=10, r=10, b=10, t=10),
            height=440,
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=1.02,
                xanchor="center",
                x=0.5,
                font=dict(size=10, color=THEME['text_primary']),
                bgcolor="rgba(250, 248, 243, 0.95)",
                bordercolor=THEME['border_hairline'],
                borderwidth=1
            )
        )
        return fig

