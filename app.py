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
    from streamlit_js_eval import streamlit_js_eval
except ImportError:
    streamlit_js_eval = None

try:
    from streamlit_geolocation import streamlit_geolocation
except ImportError:
    streamlit_geolocation = None

# Import unified Python backend service layer with hot-reload guard
import importlib
import backend
importlib.reload(backend)
from backend import db_instance, engine_instance, SUPPORTED_CROPS, REGIONAL_WEATHER_PRESETS
from pdf_generator import generate_agrisense_pdf_report

# ─────────────────────────────────────────────────────────────────────────────
# 3D FERTILIZER PRESCRIPTION GRAPH GENERATOR (WebGL 3D Engine)
# ─────────────────────────────────────────────────────────────────────────────
def build_3d_npk_graph(fert_calc: dict, active_crop: str, view_mode: str = "line_chart"):
    """
    Renders clean, highly understandable, and intuitive visualizations:
    Mode 1 ('line_chart' - Default): Simple 3D Dual-Profile Line Chart comparing Current Field values
                                    (Continuous Glowing Cyan Line) vs Required Target values (with distinct
                                    designated colors: Gold for N, Coral for P, Emerald for K), plus clear
                                    on-point value labels and deficit gap indicators.
    Mode 2 ('columns'): 3D Side-by-Side Dual-Pillar Comparison for effortless height comparisons.
    Mode 3 ('flat_2d'): 2D Direct High-Clarity View for immediate, zero-rotation clarity.
    Mode 4 ('yield_surface'): 3D Quadratic Yield Response Landscape.
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
    tar_colors = ['#FFD700', '#FF4757', '#10B981']  # Gold for N, Coral for P, Emerald for K
    tar_names = ['Req. Nitrogen (N)', 'Req. Phosphorus (P)', 'Req. Potassium (K)']

    fig = go.Figure()

    if view_mode in ("line_chart", "equilibrium"):
        # ── 1. SIMPLE & INTUITIVE 3D DUAL-PROFILE COMPARISON LINE CHART ──
        # Line 1: Field Current Profile (Continuous Glowing Electric Cyan Line)
        fig.add_trace(go.Scatter3d(
            x=[0, 1, 2],
            y=[0, 0, 0],
            z=cur_vals,
            mode='lines+markers+text',
            text=[f"Current: {v:.0f}" for v in cur_vals],
            textposition='top left',
            textfont=dict(color='#00F5FF', size=11, family='monospace'),
            line=dict(color='#00F5FF', width=8),
            marker=dict(size=14, color='#00F5FF', symbol='circle',
                        line=dict(color='#FFFFFF', width=2.5)),
            name="🌱 Current Field Profile",
            hovertemplate="<b>🌱 Current Field: %{x}</b><br>Level: <b>%{z:.1f} kg/ha</b><extra></extra>"
        ))

        # Line 2: Required Target Spine (Golden dashed track connecting targets)
        fig.add_trace(go.Scatter3d(
            x=[0, 1, 2],
            y=[0, 0, 0],
            z=tar_vals,
            mode='lines',
            line=dict(color='rgba(212, 175, 55, 0.75)', width=4, dash='solid'),
            showlegend=False,
            hoverinfo='none'
        ))

        # Required Nodes with distinct color per nutrient:
        # - Gold for Nitrogen (N)
        # - Coral Red for Phosphorus (P)
        # - Emerald Green for Potassium (K)
        for i in range(3):
            fig.add_trace(go.Scatter3d(
                x=[i], y=[0], z=[tar_vals[i]],
                mode='markers+text',
                text=[f"Target: {tar_vals[i]:.0f}"],
                textposition='top right',
                textfont=dict(color=tar_colors[i], size=11, family='monospace'),
                marker=dict(size=16, color=tar_colors[i], symbol='diamond',
                            line=dict(color='#FFFFFF', width=2.5)),
                name=f"{tar_names[i]} ({tar_vals[i]:.0f} kg/ha)",
                hovertemplate=(
                    f"<b style='color:{tar_colors[i]};'>👑 {tar_names[i]}</b><br>"
                    f"Target: <b>{tar_vals[i]:.1f} kg/ha</b><br>"
                    f"Current: <b>{cur_vals[i]:.1f} kg/ha</b><br>"
                    f"Deficit: <b>+{def_vals[i]:.1f} kg/ha</b><extra></extra>"
                )
            ))

        # Clean Deficit Indicators (vertical pillars between current and target)
        for i in range(3):
            status_text = f"+{def_vals[i]:.0f} kg/ha" if def_vals[i] > 0 else "Balanced ✓"
            fig.add_trace(go.Scatter3d(
                x=[i, i], y=[0, 0], z=[cur_vals[i], tar_vals[i]],
                mode='lines+text',
                text=['', status_text],
                textposition='middle center',
                textfont=dict(color=tar_colors[i], size=10, family='monospace'),
                line=dict(color=tar_colors[i], width=6, dash='dash'),
                name=f"Δ {nut_labels[i]}: +{def_vals[i]:.0f} kg/ha" if def_vals[i] > 0 else f"{nut_labels[i]}: Balanced",
                hovertemplate=f"<b>Δ {nut_labels[i]}</b>: +{def_vals[i]:.1f} kg/ha needed<extra></extra>"
            ))

        z_top = max(max(cur_vals), max(tar_vals)) + 25.0
        scene_dict = dict(
            xaxis=dict(
                title=dict(text='Nutrient', font=dict(color='#38BDF8', size=13)),
                tickvals=[0, 1, 2],
                ticktext=nut_labels,
                tickfont=dict(color='#F8FAFC', size=11),
                backgroundcolor='rgba(12, 17, 32, 0.45)',
                gridcolor='rgba(255, 255, 255, 0.08)'
            ),
            yaxis=dict(
                showticklabels=False,
                title=dict(text=''),
                range=[-0.4, 0.4],
                backgroundcolor='rgba(12, 17, 32, 0.45)',
                gridcolor='rgba(255, 255, 255, 0.05)'
            ),
            zaxis=dict(
                title=dict(text='Amount (kg/ha)', font=dict(color='#34D399', size=12)),
                range=[0, z_top],
                tickfont=dict(color='#94A3B8', size=10),
                backgroundcolor='rgba(12, 17, 32, 0.45)',
                gridcolor='rgba(255, 255, 255, 0.08)'
            ),
            aspectratio=dict(x=2.0, y=0.6, z=1.0),
            camera=dict(eye=dict(x=0.05, y=-2.1, z=0.55))
        )
        fig.update_layout(
            template='plotly_dark',
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            scene=scene_dict,
            margin=dict(l=10, r=10, b=10, t=10),
            height=460,
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=1.02,
                xanchor="center",
                x=0.5,
                font=dict(size=11, color="#F3E5AB"),
                bgcolor="rgba(10, 14, 25, 0.85)",
                bordercolor="rgba(212, 175, 55, 0.35)",
                borderwidth=1
            )
        )
        return fig

    elif view_mode == "columns":
        # ── 2. 3D DUAL-COLUMN / PILLAR COMPARISON ──
        for i in range(3):
            # Left pillar: Current (Cyan)
            fig.add_trace(go.Scatter3d(
                x=[i - 0.16, i - 0.16], y=[0, 0], z=[0, cur_vals[i]],
                mode='lines+markers+text',
                line=dict(color='#00F5FF', width=16),
                marker=dict(size=10, color='#00F5FF', symbol='circle'),
                text=['', f"{cur_vals[i]:.0f} kg/ha"],
                textposition='top center',
                textfont=dict(color='#00F5FF', size=10),
                name="🌱 Current Field" if i == 0 else None,
                showlegend=(i == 0),
                hovertemplate=f"<b>🌱 Current {nut_labels[i]}</b>: {cur_vals[i]:.1f} kg/ha<extra></extra>"
            ))
            # Right pillar: Target (Specific color)
            fig.add_trace(go.Scatter3d(
                x=[i + 0.16, i + 0.16], y=[0, 0], z=[0, tar_vals[i]],
                mode='lines+markers+text',
                line=dict(color=tar_colors[i], width=16),
                marker=dict(size=11, color=tar_colors[i], symbol='diamond'),
                text=['', f"{tar_vals[i]:.0f} kg/ha"],
                textposition='top center',
                textfont=dict(color=tar_colors[i], size=10),
                name=f"{tar_names[i]}",
                hovertemplate=f"<b>👑 Required {nut_labels[i]}</b>: {tar_vals[i]:.1f} kg/ha<extra></extra>"
            ))

        z_top = max(max(cur_vals), max(tar_vals)) + 25.0
        scene_dict = dict(
            xaxis=dict(
                title=dict(text='Nutrient', font=dict(color='#38BDF8', size=13)),
                tickvals=[0, 1, 2],
                ticktext=nut_labels,
                tickfont=dict(color='#F8FAFC', size=11),
                backgroundcolor='rgba(12, 17, 32, 0.45)',
                gridcolor='rgba(255, 255, 255, 0.08)'
            ),
            yaxis=dict(
                showticklabels=False,
                title=dict(text=''),
                range=[-0.4, 0.4],
                backgroundcolor='rgba(12, 17, 32, 0.45)',
                gridcolor='rgba(255, 255, 255, 0.05)'
            ),
            zaxis=dict(
                title=dict(text='Amount (kg/ha)', font=dict(color='#34D399', size=12)),
                range=[0, z_top],
                tickfont=dict(color='#94A3B8', size=10),
                backgroundcolor='rgba(12, 17, 32, 0.45)',
                gridcolor='rgba(255, 255, 255, 0.08)'
            ),
            aspectratio=dict(x=2.0, y=0.6, z=1.0),
            camera=dict(eye=dict(x=0.05, y=-2.1, z=0.55))
        )
        fig.update_layout(
            template='plotly_dark',
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            scene=scene_dict,
            margin=dict(l=10, r=10, b=10, t=10),
            height=460,
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=1.02,
                xanchor="center",
                x=0.5,
                font=dict(size=11, color="#F3E5AB"),
                bgcolor="rgba(10, 14, 25, 0.85)",
                bordercolor="rgba(212, 175, 55, 0.35)",
                borderwidth=1
            )
        )
        return fig

    elif view_mode == "flat_2d":
        # ── 3. 2D DIRECT HIGH-CLARITY DUAL BAR VIEW ──
        fig.add_trace(go.Bar(
            x=nut_labels,
            y=cur_vals,
            name="🌱 Current Field",
            marker=dict(color='#00F5FF', line=dict(color='#FFFFFF', width=1.5)),
            text=[f"{v:.0f} kg/ha" for v in cur_vals],
            textposition='auto',
            textfont=dict(color='#060913', size=12, family='sans-serif'),
            hovertemplate="<b>🌱 Current Field: %{x}</b><br>Amount: <b>%{y:.1f} kg/ha</b><extra></extra>"
        ))
        for i in range(3):
            fig.add_trace(go.Bar(
                x=[nut_labels[i]],
                y=[tar_vals[i]],
                name=f"{tar_names[i]}",
                marker=dict(color=tar_colors[i], line=dict(color='#FFFFFF', width=1.5)),
                text=[f"{tar_vals[i]:.0f} kg/ha"],
                textposition='auto',
                textfont=dict(color='#060913', size=12, family='sans-serif'),
                hovertemplate=f"<b>👑 Required {nut_labels[i]}</b><br>Target: <b>{tar_vals[i]:.1f} kg/ha</b><br>Deficit: <b>+{def_vals[i]:.1f} kg/ha</b><extra></extra>"
            ))
        fig.update_layout(
            template='plotly_dark',
            barmode='group',
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(12, 17, 32, 0.45)',
            xaxis=dict(
                title=dict(text='Nutrient', font=dict(color='#38BDF8', size=13)),
                tickfont=dict(color='#F8FAFC', size=12),
                gridcolor='rgba(255, 255, 255, 0.08)'
            ),
            yaxis=dict(
                title=dict(text='Amount (kg/ha)', font=dict(color='#34D399', size=13)),
                tickfont=dict(color='#94A3B8', size=11),
                gridcolor='rgba(255, 255, 255, 0.08)'
            ),
            margin=dict(l=10, r=10, b=10, t=10),
            height=440,
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=1.02,
                xanchor="center",
                x=0.5,
                font=dict(size=11, color="#F3E5AB"),
                bgcolor="rgba(10, 14, 25, 0.85)",
                bordercolor="rgba(212, 175, 55, 0.35)",
                borderwidth=1
            )
        )
        return fig

    else:
        # ── 4. 3D QUADRATIC YIELD POTENTIAL LANDSCAPE ──
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
                [0.0, '#0F172A'],
                [0.35, '#047857'],
                [0.70, '#10B981'],
                [0.90, '#D4AF37'],
                [1.0, '#F59E0B']
            ],
            opacity=0.94,
            name="Yield Potential %",
            colorbar=dict(title="Yield %", len=0.65, x=1.02, tickfont=dict(color="#F3E5AB")),
            contours=dict(
                z=dict(show=True, usecolormap=True, project=dict(z=True), highlightcolor="#FFF")
            )
        ))

        # Current Operating Point
        cur_yield = float(np.clip(100.0 - 0.0075 * (n_cur - n_tar)**2 - 0.018 * (p_cur - p_tar)**2, 30.0, 100.0))
        fig.add_trace(go.Scatter3d(
            x=[n_cur], y=[p_cur], z=[cur_yield],
            mode='markers',
            marker=dict(size=14, color='#00F5FF', symbol='circle', line=dict(color='#FFF', width=2.5)),
            name=f"Field Operating Point ({cur_yield:.1f}%)",
            hovertemplate=f"<b>🌱 Field Yield: {cur_yield:.1f}%</b><br>N: <b>{n_cur:.0f}</b> | P: <b>{p_cur:.0f}</b> kg/ha<extra></extra>"
        ))

        # Target 100% Summit
        fig.add_trace(go.Scatter3d(
            x=[n_tar], y=[p_tar], z=[100.0],
            mode='markers',
            marker=dict(size=16, color='#FFD700', symbol='diamond', line=dict(color='#FFF', width=2.5)),
            name="100% Potential Summit",
            hovertemplate=f"<b>👑 100% Optimum Summit</b><br>N: <b>{n_tar:.0f}</b> | P: <b>{p_tar:.0f}</b> kg/ha<extra></extra>"
        ))

        scene_dict = dict(
            xaxis=dict(
                title=dict(text='Nitrogen N (kg/ha)', font=dict(color='#38BDF8', size=12)),
                backgroundcolor='rgba(12, 17, 32, 0.65)',
                gridcolor='rgba(255, 255, 255, 0.08)'
            ),
            yaxis=dict(
                title=dict(text='Phosphorus P (kg/ha)', font=dict(color='#34D399', size=12)),
                backgroundcolor='rgba(12, 17, 32, 0.65)',
                gridcolor='rgba(255, 255, 255, 0.08)'
            ),
            zaxis=dict(
                title=dict(text='Yield Potential (%)', font=dict(color='#F3E5AB', size=12)),
                backgroundcolor='rgba(12, 17, 32, 0.65)',
                gridcolor='rgba(255, 255, 255, 0.08)'
            ),
            aspectratio=dict(x=1.2, y=1.2, z=0.88),
            camera=dict(eye=dict(x=1.75, y=-1.5, z=1.25))
        )
        fig.update_layout(
            template='plotly_dark',
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            scene=scene_dict,
            margin=dict(l=10, r=10, b=10, t=10),
            height=460,
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=1.02,
                xanchor="center",
                x=0.5,
                font=dict(size=11, color="#ECFDF5"),
                bgcolor="rgba(11, 20, 16, 0.85)",
                bordercolor="rgba(16, 185, 129, 0.35)",
                borderwidth=1
            )
        )
        return fig

# ─────────────────────────────────────────────────────────────────────────────
# STREAMLIT PAGE CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="SPARC | Precision Agriculture & Crop Diagnostics",
    page_icon="🌱",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ─────────────────────────────────────────────────────────────────────────────
# EMERALD MODERN AGRO-TECH THEME & STREAMLINED UX
# Palette: Deep Forest Obsidian (#070D0A) + Emerald (#10B981) + Mint (#6EE7B7) + Sky (#38BDF8)
# ─────────────────────────────────────────────────────────────────────────────
CUSTOM_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

:root {
    --bg-main: #070D0A;
    --bg-case: linear-gradient(145deg, rgba(16, 28, 22, 0.95) 0%, rgba(9, 17, 13, 0.98) 60%, rgba(5, 10, 7, 1) 100%);
    --border-emerald: rgba(16, 185, 129, 0.28);
    --border-emerald-hover: rgba(52, 211, 153, 0.65);
    --accent-emerald: #10B981;
    --accent-mint: #6EE7B7;
    --accent-cyan: #38BDF8;
    --accent-amber: #FBBF24;
    --accent-rose: #FB7185;
    --text-primary: #F0FDF4;
    --text-muted: #94A3B8;
    --shadow-case: 0 16px 40px -10px rgba(0, 0, 0, 0.85), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12), 0 0 25px rgba(16, 185, 129, 0.06);
}

/* Global Emerald Agro-Tech Canvas */
.stApp {
    background-color: var(--bg-main) !important;
    background-image: 
        radial-gradient(circle at 12% 10%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 88% 85%, rgba(5, 150, 105, 0.06) 0%, transparent 45%),
        radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.02) 0%, transparent 60%) !important;
    color: var(--text-primary) !important;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif !important;
}

#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}

/* Modern Floating App Header */
.agro-floating-header {
    background: linear-gradient(135deg, rgba(15, 26, 20, 0.95), rgba(9, 16, 12, 0.98));
    border: 1px solid rgba(16, 185, 129, 0.35);
    border-radius: 18px;
    padding: 16px 24px;
    margin-top: 8px;
    margin-bottom: 16px;
    box-shadow: 0 14px 35px -8px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 20px rgba(16, 185, 129, 0.12);
    backdrop-filter: blur(20px);
    transition: all 0.3s ease;
}

.agro-logo-badge {
    font-size: 1.85rem;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.1));
    border: 1px solid rgba(52, 211, 153, 0.4);
    border-radius: 14px;
    padding: 6px 12px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 12px rgba(16, 185, 129, 0.2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.agro-chip-version {
    font-size: 0.70rem;
    font-weight: 800;
    color: #34D399;
    background: rgba(16, 185, 129, 0.18);
    border: 1px solid rgba(52, 211, 153, 0.45);
    padding: 3px 9px;
    border-radius: 12px;
    letter-spacing: 0.06em;
    font-family: 'JetBrains Mono', monospace;
}

/* Micro Status Pills */
.agro-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 13px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.02em;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 2px 8px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);
}
.pill-gps {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.12));
    color: #6EE7B7;
    border: 1px solid #10B981;
}
.pill-loc {
    background: rgba(16, 185, 129, 0.15);
    color: #34D399;
    border: 1px solid rgba(16, 185, 129, 0.35);
}
.pill-sky {
    background: rgba(56, 189, 248, 0.15);
    color: #7DD3FC;
    border: 1px solid rgba(56, 189, 248, 0.35);
}
.pill-temp {
    background: rgba(251, 191, 36, 0.15);
    color: #FDE68A;
    border: 1px solid rgba(251, 191, 36, 0.35);
}
.pill-hum {
    background: rgba(52, 211, 153, 0.15);
    color: #A7F3D0;
    border: 1px solid rgba(52, 211, 153, 0.35);
}
.pill-rain {
    background: rgba(96, 165, 250, 0.15);
    color: #93C5FD;
    border: 1px solid rgba(96, 165, 250, 0.35);
}

/* Sidebar Branding */
.sidebar-brand-box {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(6, 78, 59, 0.22) 100%);
    border: 1px solid rgba(52, 211, 153, 0.35);
    border-radius: 14px;
    padding: 16px 14px;
    text-align: center;
    margin-bottom: 20px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* ─── STREAMLINED TAB TRANSITIONS ─── */
@keyframes emeraldFadeGlide {
    0% {
        opacity: 0;
        transform: translateY(12px) scale(0.995);
        filter: blur(3px);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
    }
}

div[data-testid="stTabsContent"] {
    animation: emeraldFadeGlide 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
    will-change: transform, opacity, filter;
}

/* Streamlined Navigation Tabs */
button[data-baseweb="tab"] {
    background: rgba(15, 26, 20, 0.6) !important;
    border: 1px solid rgba(16, 185, 129, 0.15) !important;
    border-bottom: none !important;
    border-radius: 12px 12px 0 0 !important;
    margin-right: 6px !important;
    padding: 11px 22px !important;
    font-weight: 600 !important;
    color: #94A3B8 !important;
    transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

button[data-baseweb="tab"]:hover {
    background: rgba(16, 185, 129, 0.12) !important;
    color: #6EE7B7 !important;
    border-color: rgba(52, 211, 153, 0.4) !important;
    transform: translateY(-2px) !important;
}

button[data-baseweb="tab"][aria-selected="true"] {
    background: linear-gradient(180deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 78, 59, 0.12) 100%) !important;
    border-color: rgba(52, 211, 153, 0.55) !important;
    border-bottom: 3px solid #10B981 !important;
    color: #FFFFFF !important;
    box-shadow: 0 -6px 20px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
}

/* Modern Frosted Cards */
.sparc-card {
    background: var(--bg-case);
    border: 1px solid var(--border-emerald);
    border-radius: 16px;
    padding: 24px 26px;
    margin-bottom: 22px;
    box-shadow: var(--shadow-case);
    backdrop-filter: blur(18px);
    position: relative;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease;
}

.sparc-card:hover {
    border-color: var(--border-emerald-hover);
    box-shadow: 0 24px 50px -10px rgba(0, 0, 0, 0.9), inset 0 1px 2px 0 rgba(255, 255, 255, 0.2), 0 0 25px rgba(16, 185, 129, 0.15);
    transform: translateY(-3px) scale(1.002);
}

.sparc-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    border-bottom: 1px solid rgba(16, 185, 129, 0.18);
    padding-bottom: 14px;
}

.sparc-title {
    font-size: 1.30rem;
    font-weight: 800;
    color: #FFFFFF;
    letter-spacing: -0.01em;
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
}

/* Badges */
.sparc-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.04em;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 2px 6px rgba(0, 0, 0, 0.4);
}

.badge-emerald {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.06) 100%);
    color: #34D399;
    border: 1px solid rgba(16, 185, 129, 0.45);
}

.badge-cyan {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.06) 100%);
    color: #38BDF8;
    border: 1px solid rgba(6, 182, 212, 0.45);
}

.badge-amber {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.06) 100%);
    color: #FBBF24;
    border: 1px solid rgba(245, 158, 11, 0.45);
}

.badge-rose {
    background: linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(244, 63, 94, 0.06) 100%);
    color: #FB7185;
    border: 1px solid rgba(244, 63, 94, 0.45);
}

.badge-gold {
    background: linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(16, 185, 129, 0.06) 100%);
    color: #6EE7B7;
    border: 1px solid rgba(52, 211, 153, 0.45);
}

/* Metric Cases */
.metric-box {
    background: linear-gradient(145deg, rgba(16, 28, 22, 0.85) 0%, rgba(8, 15, 11, 0.95) 100%);
    border: 1px solid rgba(16, 185, 129, 0.24);
    border-radius: 12px;
    padding: 16px 18px;
    text-align: center;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.65), 0 8px 20px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(52, 211, 153, 0.3);
    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.metric-box:hover {
    transform: translateY(-2px);
    border-color: #10B981;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.5), 0 12px 25px rgba(16, 185, 129, 0.2);
}

.metric-label {
    font-size: 0.74rem;
    color: #34D399;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
    margin-bottom: 4px;
}

.metric-val {
    font-size: 1.60rem;
    font-weight: 800;
    color: #FFFFFF;
    font-family: 'JetBrains Mono', monospace;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

/* Alternative Crop Cards */
.alt-crop-card {
    background: linear-gradient(145deg, rgba(18, 32, 25, 0.7) 0%, rgba(9, 17, 13, 0.9) 100%);
    border: 1px solid rgba(16, 185, 129, 0.22);
    border-radius: 14px;
    padding: 18px 20px;
    margin-bottom: 14px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12);
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.alt-crop-card:hover {
    background: linear-gradient(145deg, rgba(23, 42, 32, 0.85) 0%, rgba(12, 22, 17, 0.98) 100%);
    border-color: rgba(52, 211, 153, 0.5);
    box-shadow: 0 16px 35px -6px rgba(0, 0, 0, 0.8), 0 0 20px rgba(16, 185, 129, 0.18);
    transform: translateY(-3px);
}

/* Rescue Protocol Items */
.rescue-item {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(8, 16, 12, 0.6) 100%);
    border-left: 4px solid #10B981;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 12px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.35);
}

/* Tactile Emerald Buttons */
div.stButton > button {
    background: linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%) !important;
    color: #FFFFFF !important;
    font-weight: 700 !important;
    border: 1px solid rgba(52, 211, 153, 0.45) !important;
    border-radius: 10px !important;
    padding: 11px 24px !important;
    box-shadow: 0 6px 18px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -2px 0 rgba(0, 0, 0, 0.45) !important;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
    letter-spacing: 0.02em !important;
}

div.stButton > button:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 50%, #065F46 100%) !important;
    border-color: #34D399 !important;
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
    transform: translateY(-2px) scale(1.01) !important;
}

div.stButton > button:active {
    transform: translateY(1px) scale(0.99) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.7) !important;
}

/* Polished Inputs and Selects */
div[data-baseweb="input"], div[data-baseweb="select"] {
    border-radius: 10px !important;
    background-color: rgba(14, 24, 18, 0.8) !important;
    border-color: rgba(16, 185, 129, 0.3) !important;
}

div[data-baseweb="input"]:focus-within, div[data-baseweb="select"]:focus-within {
    border-color: #10B981 !important;
    box-shadow: 0 0 14px rgba(16, 185, 129, 0.35) !important;
}
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


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
                0: ("Clear Sky", "☀️"), 1: ("Mainly Clear", "🌤️"), 2: ("Partly Cloudy", "⛅"),
                3: ("Overcast", "☁️"), 45: ("Fog & Mist", "🌫️"), 48: ("Depositing Rime Fog", "🌫️"),
                51: ("Light Drizzle", "🌦️"), 53: ("Moderate Drizzle", "🌦️"), 55: ("Dense Drizzle", "🌧️"),
                61: ("Slight Rain", "🌧️"), 63: ("Moderate Rain", "🌧️"), 65: ("Heavy Rain", "🌧️"),
                71: ("Slight Snow", "🌨️"), 73: ("Moderate Snow", "🌨️"), 75: ("Heavy Snow", "❄️"),
                80: ("Rain Showers", "🌦️"), 81: ("Moderate Showers", "🌧️"), 82: ("Violent Showers", "⛈️"),
                95: ("Thunderstorm", "⛈️"), 96: ("Thunderstorm with Hail", "⛈️")
            }
            cond_text, cond_icon = wmo_codes.get(w_code, ("Clear Sky", "☀️"))
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
    Renders the opening animated logo sequence with custom SVG graphics,
    pulsing aura, glowing typography, and dynamic initialization progress.
    Uses components.v1.html for native HTML/SVG rendering without Markdown escaping.
    """
    ensure_session_state()
    splash_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    background: transparent;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    color: #F3F4F6;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    overflow: hidden;
}

.splash-container {
    width: 100%;
    min-height: 480px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: radial-gradient(circle at center, #111A2E 0%, #0B0F19 85%);
    border-radius: 20px;
    border: 1px solid rgba(16, 185, 129, 0.35);
    padding: 30px 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
    position: relative;
    overflow: hidden;
}

.ring-outer {
    position: absolute;
    width: 440px;
    height: 440px;
    border-radius: 50%;
    border: 1px dashed rgba(6, 182, 212, 0.18);
    animation: spinRing 24s linear infinite;
    pointer-events: none;
}

.ring-inner {
    position: absolute;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    border: 1px dashed rgba(16, 185, 129, 0.22);
    animation: spinRingRev 16s linear infinite;
    pointer-events: none;
}

.logo-badge {
    width: 120px;
    height: 120px;
    border-radius: 26px;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(6, 182, 212, 0.22) 100%);
    border: 2px solid rgba(16, 185, 129, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
    box-shadow: 0 0 45px rgba(16, 185, 129, 0.45);
    animation: floatLogo 3.5s ease-in-out infinite;
    position: relative;
    z-index: 2;
}

.sub-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    font-weight: 700;
    color: #38BDF8;
    letter-spacing: 0.35em;
    margin-bottom: 8px;
    text-transform: uppercase;
}

.title-glow {
    font-size: 3.2rem;
    font-weight: 800;
    margin: 0;
    line-height: 1.1;
    background: linear-gradient(135deg, #FFFFFF 20%, #34D399 60%, #38BDF8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.02em;
}

.description {
    font-size: 1.05rem;
    color: #9CA3AF;
    max-width: 640px;
    margin: 12px auto 22px auto;
    line-height: 1.5;
}

.pills-container {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
    z-index: 2;
}

.pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 0.76rem;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.03em;
}

.pill-emerald {
    background: rgba(16, 185, 129, 0.12);
    color: #34D399;
    border: 1px solid rgba(16, 185, 129, 0.35);
}

.pill-cyan {
    background: rgba(6, 182, 212, 0.12);
    color: #38BDF8;
    border: 1px solid rgba(6, 182, 212, 0.35);
}

.pill-amber {
    background: rgba(245, 158, 11, 0.12);
    color: #FBBF24;
    border: 1px solid rgba(245, 158, 11, 0.35);
}

@keyframes spinRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes spinRingRev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
@keyframes floatLogo {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-7px) scale(1.02); }
}
</style>
</head>
<body>
<div class="splash-container">
    <div class="ring-outer"></div>
    <div class="ring-inner"></div>
    
    <div class="logo-badge">
        <svg width="74" height="74" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="emeraldGrad" x1="30" y1="18" x2="70" y2="74" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#10B981"/>
                    <stop offset="1" stop-color="#047857"/>
                </linearGradient>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#06B6D4"/>
                    <stop offset="1" stop-color="#10B981"/>
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" stroke="url(#cyanGrad)" stroke-width="2.5" stroke-dasharray="6 4" />
            <path d="M50 18C50 18 30 35 30 54C30 65 39 74 50 74C61 74 70 65 70 54C70 35 50 18 50 18Z" fill="url(#emeraldGrad)" opacity="0.9" />
            <path d="M50 74V34" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
            <path d="M50 48C56 44 62 46 64 50" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M50 56C44 52 38 54 36 58" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="50" cy="20" r="4.5" fill="#38BDF8"/>
        </svg>
    </div>

    <div style="z-index: 2;">
        <div class="sub-tag">Autonomous Agronomic Intelligence</div>
        <h1 class="title-glow">PROJECT SPARC</h1>
        <p class="description">
            <span style="color: #10B981; font-weight: 700;">S</span>mart 
            <span style="color: #10B981; font-weight: 700;">P</span>ython-Based 
            <span style="color: #06B6D4; font-weight: 700;">A</span>griculture 
            <span style="color: #06B6D4; font-weight: 700;">R</span>ecommendation and 
            <span style="color: #38BDF8; font-weight: 700;">C</span>lassification System
        </p>

        <div class="pills-container">
            <span class="pill pill-emerald">● Auto-Location Sync: Ready</span>
            <span class="pill pill-cyan">● Random Forest Model: Active</span>
            <span class="pill pill-amber">● Crop Rescue Roadmap: Enabled</span>
        </div>
    </div>
</div>
</body>
</html>"""
    components.html(splash_html, height=510, scrolling=False)
    
    st.write("")
    col_c1, col_c2, col_c3 = st.columns([1, 2, 1])
    with col_c2:
        progress_bar = st.progress(20)
        status_text = st.empty()
        
        stages = [
            ("Initializing SPARC Core Microkernel...", 35),
            ("Auto-Detecting User Farm Geo-Location...", 60),
            ("Loading Scikit-Learn Agronomic Random Forest Model...", 85),
            ("Calibrating Real-Time Weather Telemetry...", 98),
            ("System Ready. Launching Workspace...", 100)
        ]
        
        for msg, pct in stages:
            status_text.markdown(f"<p style='text-align: center; color: #38BDF8; font-family: monospace;'>⚡ {msg}</p>", unsafe_allow_html=True)
            progress_bar.progress(pct)
            time.sleep(0.3)
        
        if st.button("🚀 Enter SPARC Workspace Now", use_container_width=True):
            st.session_state.splash_completed = True
            st.rerun()

    time.sleep(0.4)
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
            st.session_state["_toast_notification"] = f"✅ Applied {state_name} baseline soil metrics into main predictor!"
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
        <div class="sidebar-brand-box">
            <div style="font-size: 2.1rem; margin-bottom: 6px;">🌱⚡</div>
            <div style="font-weight: 800; font-size: 1.35rem; letter-spacing: 0.04em; color: #FFFFFF;">SPARC</div>
            <div style="font-size: 0.72rem; color: #34D399; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.08em;">AUTONOMOUS AGRI-AI</div>
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
        <div style="font-size: 0.85rem; line-height: 1.6; color: #D1D5DB; background: rgba(16, 28, 22, 0.75); padding: 12px 14px; border-radius: 10px; border: 1px solid rgba(16, 185, 129, 0.25);">
            <div><strong>Location:</strong> <span style="color: #38BDF8;">{loc_label}</span></div>
            <div><strong>Condition:</strong> <span style="color: #F472B6;">{c_icon} {c_desc}</span></div>
            <div><strong>Temperature:</strong> <span style="color: #FBBF24;">{temp_label}</span></div>
            <div><strong>Humidity:</strong> <span style="color: #34D399;">{hum_label}</span></div>
            <div><strong>Precipitation:</strong> <span style="color: #60A5FA;">{rain_label}</span></div>
            <div><strong>Wind Speed:</strong> <span style="color: #A78BFA;">{wind_label}</span></div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("---")
        if st.button("🔄 Replay Splash Page", use_container_width=True):
            st.session_state.splash_completed = False
            st.rerun()

    # ─── TOP APP HEADER BANNER (Streamlined Floating Agro-Tech Header) ───
    active_tel = st.session_state.get("active_telemetry")
    farm_base = st.session_state.get("farm_base_data")
    loc_mode = st.session_state.get("location_mode", "GPS")
    is_gps_verified = bool(active_tel and active_tel.get("is_gps_verified") and loc_mode == "GPS")

    if active_tel:
        city_display = active_tel.get("city", "Active Agricultural Zone")
        cond_icon = active_tel.get("condition_icon", "☀️")
        cond_text = active_tel.get("condition", "Clear Sky")
        temp_text = f"🌡️ {active_tel.get('temperature', 25.0)}°C"
        hum_text = f"💧 {active_tel.get('humidity', 60.0)}%"
        rain_text = f"🌧️ {active_tel.get('rainfall', 100.0)} mm"
    else:
        city_display = "📡 Acquiring GPS..."
        cond_icon = "🛰️"
        cond_text = "Signal Pending"
        temp_text = "🌡️ --°C"
        hum_text = "💧 --%"
        rain_text = "🌧️ -- mm"

    st.markdown(f"""
    <div class="agro-floating-header">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 14px;">
                <div class="agro-logo-badge">🌱</div>
                <div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <h1 style="margin: 0; font-size: 1.65rem; font-weight: 800; color: #FFFFFF; letter-spacing: -0.02em;">
                            SPARC<span style="color: #10B981;"> AI</span>
                        </h1>
                        <span class="agro-chip-version">v3.2 PRO</span>
                    </div>
                    <div style="color: #94A3B8; font-size: 0.82rem; margin-top: 2px; font-weight: 500;">
                        Smart Python-Based Agriculture Recommendation & Classification System
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <span class="agro-status-pill {'pill-gps' if is_gps_verified else 'pill-loc'}">
                    {'🎯' if is_gps_verified else '📍'} {city_display}
                </span>
                <span class="agro-status-pill pill-sky">
                    {cond_icon} {cond_text}
                </span>
                <span class="agro-status-pill pill-temp">
                    {temp_text}
                </span>
                <span class="agro-status-pill pill-hum">
                    {hum_text}
                </span>
                <span class="agro-status-pill pill-rain">
                    {rain_text}
                </span>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # ─── MAIN NAVIGATION TABS ───
    tab_diagnostics, tab_crop_doctor, tab_fertilizers, tab_soil_map, tab_analytics, tab_telemetry, tab_settings = st.tabs([
        "🌾 Smart Crop Predictor & Adaptation",
        "🩺 Crop Doctor: Disease & Cure",
        "🧪 Fertilizer Prescriptions",
        "🗺️ Place-Wise Indian Soil & Packages",
        "📊 Historical Analytics & CRUD",
        "🛠️ System Logs & Telemetry",
        "⚙️ Profiles & Documentation"
    ])

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # TAB 1: SMART CROP PREDICTOR & ADAPTATION PROTOCOL
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    with tab_diagnostics:
        # ── SEAMLESS DUAL-LOCATION & ACTIVE CONTEXT BAR ──
        loc_mode = st.session_state.get("location_mode", "GPS")
        farm_base = st.session_state.get("farm_base_data")
        custom_city = st.session_state.get("custom_city_data")
        active_tel = st.session_state.get("active_telemetry")

        # Pill badges for both Farm Base and Custom Searched City
        farm_badge_snippet = ""
        if farm_base:
            farm_badge_snippet = f"""<div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10B981; border-radius: 8px; padding: 6px 12px; font-size: 0.82rem;">
<span style="color: #34D399; font-weight: 700;">🏡 My Farm Base:</span> <span style="color: #FFFFFF; font-weight: 700;">{farm_base.get('city', 'Local Farm')} ({farm_base.get('temperature', '--')}°C)</span>
</div>"""
        else:
            farm_badge_snippet = """<div style="background: rgba(234, 179, 8, 0.15); border: 1px solid rgba(234, 179, 8, 0.4); border-radius: 8px; padding: 6px 12px; font-size: 0.82rem;">
<span style="color: #FBBF24; font-weight: 700;">📡 Farm GPS:</span> <span style="color: #CBD5E1; font-weight: 600;">Acquiring Signal...</span>
</div>"""

        other_badge_snippet = ""
        if custom_city:
            other_badge_snippet = f"""<div style="background: rgba(168, 85, 247, 0.18); border: 1px solid rgba(168, 85, 247, 0.5); border-radius: 8px; padding: 6px 12px; font-size: 0.82rem;">
<span style="color: #C084FC; font-weight: 700;">🔍 Custom City:</span> <span style="color: #FFFFFF; font-weight: 700;">{custom_city.get('city')} ({custom_city.get('temperature')}°C)</span>
</div>"""

        # Render Active Telemetry Context Card
        if loc_mode == "CUSTOM" and custom_city:
            # Active mode: Custom Searched City
            st.markdown(f"""<div class="sparc-card" style="padding: 16px 22px; margin-bottom: 16px; border-color: rgba(168, 85, 247, 0.5); background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(46, 16, 101, 0.35));">
<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
<div>
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
<span style="font-size: 1.1rem;">🔍</span>
<span style="font-size: 0.82rem; color: #C084FC; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Active Telemetry Context: <span style="color: #A78BFA; font-weight: 800;">🔍 CUSTOM SEARCHED CITY (EXPLORATION)</span></span>
</div>
<div style="font-size: 1.12rem; font-weight: 700; color: #FFFFFF;">
{custom_city.get('location', 'Searched Region')} &nbsp;·&nbsp;
<span style='color: #F472B6;'>{custom_city.get('condition_icon', '⛅')} {custom_city.get('condition', 'Fair Weather')}</span> &nbsp;·&nbsp;
<span style='color: #34D399;'>{custom_city.get('temperature', 25.0)}°C</span> &nbsp;·&nbsp;
<span style='color: #FBBF24;'>{custom_city.get('humidity', 60.0)}% Hum</span> &nbsp;·&nbsp;
<span style='color: #60A5FA;'>{custom_city.get('rainfall', 100.0)} mm Rain</span>
</div>
</div>
<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
{farm_badge_snippet}
{other_badge_snippet}
</div>
</div>
</div>""", unsafe_allow_html=True)

        elif farm_base and farm_base.get("is_gps_verified"):
            # Active mode: High-Accuracy GPS Locked
            st.markdown(f"""<div class="sparc-card" style="padding: 16px 22px; margin-bottom: 16px; border-color: rgba(16, 185, 129, 0.5); background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(6, 78, 59, 0.35));">
<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
<div>
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
<span style="font-size: 1.1rem;">🎯</span>
<span style="font-size: 0.82rem; color: #38BDF8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Active Telemetry Context: <span style="color: #34D399; font-weight: 800;">🏡 MY FARM LOCATION (EXACT GPS LOCKED)</span></span>
</div>
<div style="font-size: 1.12rem; font-weight: 700; color: #FFFFFF;">
🎯 SATELLITE PINPOINT: {farm_base.get('location', 'Active Agricultural Zone')} &nbsp;·&nbsp;
<span style='color: #F472B6;'>{farm_base.get('condition_icon', '☀️')} {farm_base.get('condition', 'Clear Sky')}</span> &nbsp;·&nbsp;
<span style='color: #34D399;'>{farm_base.get('temperature', 25.0)}°C</span> &nbsp;·&nbsp;
<span style='color: #FBBF24;'>{farm_base.get('humidity', 60.0)}% Hum</span> &nbsp;·&nbsp;
<span style='color: #60A5FA;'>{farm_base.get('rainfall', 100.0)} mm Rain</span>
</div>
</div>
<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
{farm_badge_snippet}
{other_badge_snippet}
</div>
</div>
</div>""", unsafe_allow_html=True)

        elif farm_base:
            # Active mode: Farm set manually / baseline
            st.markdown(f"""<div class="sparc-card" style="padding: 16px 22px; margin-bottom: 16px; border-color: rgba(6, 182, 212, 0.4); background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));">
<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
<div>
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
<span style="font-size: 1.1rem;">🏡</span>
<span style="font-size: 0.82rem; color: #38BDF8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Active Telemetry Context: <span style="color: #34D399; font-weight: 800;">🏡 MY FARM LOCATION</span></span>
</div>
<div style="font-size: 1.12rem; font-weight: 700; color: #FFFFFF;">
{farm_base.get('location', 'Active Agricultural Zone')} &nbsp;·&nbsp;
<span style='color: #F472B6;'>{farm_base.get('condition_icon', '☀️')} {farm_base.get('condition', 'Clear Sky')}</span> &nbsp;·&nbsp;
<span style='color: #34D399;'>{farm_base.get('temperature', 25.0)}°C</span> &nbsp;·&nbsp;
<span style='color: #FBBF24;'>{farm_base.get('humidity', 60.0)}% Hum</span> &nbsp;·&nbsp;
<span style='color: #60A5FA;'>{farm_base.get('rainfall', 100.0)} mm Rain</span>
</div>
</div>
<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
{farm_badge_snippet}
{other_badge_snippet}
</div>
</div>
</div>""", unsafe_allow_html=True)

        else:
            # Pending GPS signal: clean, honest UI without dummy Delhi data
            st.markdown(f"""<div class="sparc-card" style="padding: 18px 22px; margin-bottom: 16px; border-color: rgba(234, 179, 8, 0.5); background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(40, 25, 5, 0.4));">
<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
<div>
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
<span style="font-size: 1.1rem;">📡</span>
<span style="font-size: 0.82rem; color: #FBBF24; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Active Telemetry Context: <span style="color: #FBBF24; font-weight: 800;">🏡 MY FARM LOCATION (AWAITING GPS SIGNAL)</span></span>
</div>
<div style="font-size: 1.05rem; font-weight: 700; color: #CBD5E1;">
📡 Acquiring Exact GPS Signal... Click '📍 Detect Exact Farm Location' below to pinpoint your field.
</div>
</div>
<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
{farm_badge_snippet}
{other_badge_snippet}
</div>
</div>
</div>""", unsafe_allow_html=True)

        # Comparative Telemetry Bar (Working Progress: Other Place vs My Farm)
        if custom_city and farm_base and loc_mode == "CUSTOM":
            t_diff = round(float(custom_city.get('temperature', 0)) - float(farm_base.get('temperature', 0)), 1)
            h_diff = round(float(custom_city.get('humidity', 0)) - float(farm_base.get('humidity', 0)), 1)
            r_diff = round(float(custom_city.get('rainfall', 0)) - float(farm_base.get('rainfall', 0)), 1)
            t_sign = f"+{t_diff}" if t_diff > 0 else f"{t_diff}"
            h_sign = f"+{h_diff}" if h_diff > 0 else f"{h_diff}"
            r_sign = f"+{r_diff}" if r_diff > 0 else f"{r_diff}"

            st.markdown(f"""<div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 10px; padding: 10px 16px; margin-bottom: 16px;">
<div style="font-size: 0.8rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; margin-bottom: 6px;">
📊 Comparative Working Progress: {custom_city.get('city')} vs My Home Farm ({farm_base.get('city')})
</div>
<div style="display: flex; gap: 20px; flex-wrap: wrap; font-size: 0.9rem;">
<div>🌡️ <strong>Temp:</strong> <span style="color: #F87171;">{custom_city.get('temperature')}°C</span> vs {farm_base.get('temperature')}°C (<span style="color: {'#34D399' if t_diff < 0 else '#F87171'}; font-weight: 700;">{t_sign}°C</span>)</div>
<div>💧 <strong>Humidity:</strong> <span style="color: #FBBF24;">{custom_city.get('humidity')}%</span> vs {farm_base.get('humidity')}% (<span style="color: #FBBF24; font-weight: 700;">{h_sign}%</span>)</div>
<div>🌧️ <strong>Rainfall:</strong> <span style="color: #60A5FA;">{custom_city.get('rainfall')} mm</span> vs {farm_base.get('rainfall')} mm (<span style="color: #60A5FA; font-weight: 700;">{r_sign} mm</span>)</div>
<div>🌤️ <strong>Sky:</strong> {custom_city.get('condition_icon')} {custom_city.get('condition')}</div>
</div>
</div>""", unsafe_allow_html=True)

        # Dual Control Columns: Option 1 (My Farm) vs Option 2 (Other Place)
        col_ctl_home, col_ctl_other = st.columns([1.15, 1.35], gap="large")

        with col_ctl_home:
            st.markdown("<div style='font-size: 0.92rem; font-weight: 700; color: #10B981; margin-bottom: 6px;'>🏡 Option 1: My Current Farm Location (Home Base)</div>", unsafe_allow_html=True)

            # Direct Hardware GPS Satellite Pinpoint Block
            is_locked = bool(farm_base and farm_base.get("is_gps_verified"))
            gps_box_bg = "rgba(16, 185, 129, 0.12)" if is_locked else "rgba(234, 179, 8, 0.12)"
            gps_border = "rgba(52, 211, 153, 0.35)" if is_locked else "rgba(234, 179, 8, 0.35)"
            gps_title_col = "#34D399" if is_locked else "#FBBF24"
            gps_status_badge = "EXACT GPS LOCKED" if is_locked else "GPS SIGNAL PENDING"
            gps_badge_style = "background: rgba(52, 211, 153, 0.2); color: #6EE7B7; border: 1px solid rgba(52, 211, 153, 0.4);" if is_locked else "background: rgba(234, 179, 8, 0.2); color: #FBBF24; border: 1px solid rgba(234, 179, 8, 0.4);"

            if is_locked:
                gps_desc = f"🎯 Locked: <strong>{farm_base['location']}</strong> ({farm_base.get('latitude', '')}°N, {farm_base.get('longitude', '')}°E)"
            else:
                gps_desc = "Click 📍 <strong>Detect Exact Farm Location</strong> below and allow browser location to pinpoint your exact village/town, district, and field coordinates:"

            st.markdown(f"""<div style='background: linear-gradient(135deg, {gps_box_bg}, rgba(6, 78, 59, 0.25)); border: 1px solid {gps_border}; border-radius: 10px; padding: 12px 14px; margin-bottom: 12px;'>
<div style='display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;'>
    <span style='font-size: 0.88rem; font-weight: 800; color: {gps_title_col};'>🛰️ Satellite GPS Auto-Detector</span>
    <span style='font-size: 0.70rem; {gps_badge_style} border-radius: 12px; padding: 2px 8px; font-weight: 700;'>{gps_status_badge}</span>
</div>
<div style='font-size: 0.80rem; color: #CBD5E1; line-height: 1.4; margin-bottom: 8px;'>
    {gps_desc}
</div>
</div>""", unsafe_allow_html=True)

            col_gps_btn1, col_gps_btn2 = st.columns([1.5, 1])
            with col_gps_btn1:
                if st.button("📍 Detect Exact Farm Location", key="btn_detect_gps", use_container_width=True, help="Requests high-accuracy browser HTML5 GPS coordinates"):
                    st.session_state._last_synced_gps_coords = None
                    st.session_state.location_mode = "GPS"
                    st.toast("📡 Acquiring browser GPS signal... Please allow location permission in your browser.", icon="🛰️")
                    st.rerun()

            with col_gps_btn2:
                is_home_active = (loc_mode == "GPS" and farm_base is not None)
                if st.button("🔄 Activate Farm", key="btn_activate_home", use_container_width=True, disabled=is_home_active, help="Switch recommendation engine back to your home farm"):
                    st.session_state.location_mode = "GPS"
                    if farm_base:
                        st.session_state.active_telemetry = farm_base
                        st.session_state["slider_temp"] = max(-10.0, min(55.0, float(farm_base.get("temperature", 25.0))))
                        st.session_state["slider_hum"] = max(5.0, min(100.0, float(farm_base.get("humidity", 60.0))))
                        st.session_state["slider_rain"] = max(0.0, min(500.0, float(farm_base.get("rainfall", 90.0))))
                        st.toast(f"🏡 Switched context back to My Farm: {farm_base.get('city')}")
                    else:
                        st.toast("Awaiting browser GPS signal... Click 'Detect Exact Farm Location'.")
                    st.rerun()

            # Manual Farm City / Town / Village / PIN Code text input
            st.markdown("<div style='font-size: 0.82rem; font-weight: 700; color: #E2E8F0; margin-bottom: 4px; margin-top: 8px;'>📍 Or Type Exact City / Town / Village / PIN Code:</div>", unsafe_allow_html=True)
            col_f_in, col_f_btn = st.columns([1.8, 1])
            with col_f_in:
                farm_input = st.text_input(
                    "Set Farm City:",
                    placeholder="e.g. Alwar, Varanasi, Muzaffarpur, 302001",
                    label_visibility="collapsed",
                    key="farm_city_input"
                )
            with col_f_btn:
                set_farm_btn = st.button("📍 Set Farm", use_container_width=True, key="btn_set_farm")

            last_synced_farm = st.session_state.get("_last_synced_farm_input", "")
            should_sync_farm = False
            if set_farm_btn and farm_input.strip():
                should_sync_farm = True
            elif farm_input.strip() and farm_input.strip().lower() != last_synced_farm:
                should_sync_farm = True

            if should_sync_farm:
                with st.spinner(f"Pinpointing farm location to {farm_input}..."):
                    new_home = engine_instance.fetch_live_weather(farm_input.strip())
                    new_home["is_gps_verified"] = False
                    st.session_state.farm_base_data = new_home
                    st.session_state.location_mode = "GPS"
                    st.session_state.active_telemetry = new_home
                    st.session_state._last_synced_farm_input = farm_input.strip().lower()
                    st.session_state["slider_temp"] = max(-10.0, min(55.0, float(new_home.get("temperature", 25.0))))
                    st.session_state["slider_hum"] = max(5.0, min(100.0, float(new_home.get("humidity", 60.0))))
                    st.session_state["slider_rain"] = max(0.0, min(500.0, float(new_home.get("rainfall", 90.0))))
                    st.toast(f"🏡 Farm location updated to: {new_home['location']}")
                    st.rerun()

            col_res1, col_res2 = st.columns([1, 1])
            with col_res1:
                if st.button("🗑️ Reset Saved Farm", key="btn_reset_farm", use_container_width=True, help="Clears stored farm location to re-detect"):
                    st.session_state.farm_base_data = None
                    st.session_state.active_telemetry = st.session_state.custom_city_data
                    st.session_state._last_synced_gps_coords = None
                    st.session_state._last_synced_farm_input = ""
                    st.toast("Cleared saved farm. Click 'Detect Exact Farm Location' to re-detect.")
                    st.rerun()

            with col_res2:
                farm_states = [
                    "Select State Baseline...",
                    "Rajasthan (Jaipur / Kota)",
                    "Uttar Pradesh (Lucknow / Kanpur)",
                    "Punjab (Ludhiana / Amritsar)",
                    "Haryana (Karnal / Hisar)",
                    "Maharashtra (Pune / Nashik)",
                    "Madhya Pradesh (Indore / Bhopal)",
                    "Bihar (Patna / Gaya)",
                    "Gujarat (Ahmedabad / Rajkot)",
                    "Karnataka (Bengaluru / Mysuru)",
                    "Tamil Nadu (Coimbatore / Chennai)",
                    "Andhra Pradesh (Guntur / Vijayawada)",
                    "West Bengal (Kolkata / Bardhaman)",
                    "Kerala (Kochi / Palakkad)",
                    "Assam (Guwahati / Jorhat)"
                ]
                sel_state = st.selectbox("Or state baseline:", farm_states, index=0, label_visibility="collapsed", key="sel_farm_state")
                if sel_state != "Select State Baseline...":
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
                            st.toast(f"🏡 Farm base updated to {new_home['location']}")
                            st.rerun()

        with col_ctl_other:
            st.markdown("<div style='font-size: 0.88rem; font-weight: 700; color: #A78BFA; margin-bottom: 6px;'>🔍 Option 2: Search & Inspect Other Place (Exploration)</div>", unsafe_allow_html=True)
            col_o1, col_o2 = st.columns([1.8, 1])
            with col_o1:
                custom_city_input = st.text_input(
                    "Lookup other place:",
                    placeholder="Type city/country (e.g. Pune, Patna, California) & press Enter",
                    label_visibility="collapsed",
                    key="custom_city_input"
                )
            with col_o2:
                sync_btn = st.button("🔍 Analyze Place", use_container_width=True, key="btn_sync_other")

            last_synced = st.session_state.get("_last_synced_other", "")
            should_sync_other = False
            if sync_btn and custom_city_input.strip():
                should_sync_other = True
            elif custom_city_input.strip() and custom_city_input.strip().lower() != last_synced:
                should_sync_other = True

            if should_sync_other:
                with st.spinner(f"Querying live weather for other place: {custom_city_input}..."):
                    other_w = engine_instance.fetch_live_weather(custom_city_input.strip())
                    st.session_state.custom_city_data = other_w
                    st.session_state.location_mode = "CUSTOM"
                    st.session_state.active_telemetry = other_w
                    st.session_state._last_synced_other = custom_city_input.strip().lower()
                    st.session_state["slider_temp"] = max(-10.0, min(55.0, float(other_w.get("temperature", 25.0))))
                    st.session_state["slider_hum"] = max(5.0, min(100.0, float(other_w.get("humidity", 60.0))))
                    st.session_state["slider_rain"] = max(0.0, min(500.0, float(other_w.get("rainfall", 90.0))))
                    st.toast(f"Analyzing {other_w['location']}: {other_w.get('condition_icon', '')} {other_w.get('temperature')}°C")
                    st.rerun()

            if custom_city and loc_mode == "CUSTOM":
                farm_label = farm_base.get('city') if farm_base else "Farm Base"
                st.caption(f"📍 Currently analyzing: **{custom_city.get('location')}**. Your Home Farm (**{farm_label}**) is preserved. Click 'Activate Farm' on the left anytime to switch back.")

        col_input, col_results = st.columns([1.1, 1.4], gap="large")

        # ── INPUT PARAMETERS CARD ──
        with col_input:
            st.markdown("""
            <div class="sparc-card">
                <div class="sparc-card-header">
                    <span class="sparc-title">🌱 Field Soil & Weather Parameters</span>
                    <span class="sparc-badge badge-cyan">Live Sliders</span>
                </div>
            """, unsafe_allow_html=True)

            w_curr = st.session_state.get("weather_telemetry") or {}

            # Place-Wise Indian Soil Auto-Fill Expander
            with st.expander("📍 Place-Wise Indian Soil Baseline Auto-Fill", expanded=False):
                st.markdown("<div style='font-size: 0.84rem; color: #9CA3AF; margin-bottom: 8px;'>Select your State / Agro-zone to instantly auto-populate ICAR baseline soil parameters (NPK & pH):</div>", unsafe_allow_html=True)
                soil_states = backend.get_indian_soil_states()
                def_state_idx = soil_states.index("Punjab") if "Punjab" in soil_states else 0
                chosen_state = st.selectbox("Select State / Region", soil_states, index=def_state_idx, key="diag_state_selector")
                st_profile = backend.get_state_soil_profile(chosen_state)
                if st_profile:
                    b_soil = st_profile["baseline_soil"]
                    st.markdown(f"""
                    <div style="font-size: 0.82rem; line-height: 1.5; color: #D1D5DB; background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 8px;">
                        <div><strong>Soil Type:</strong> <span style="color:#38BDF8;">{st_profile['soil_type']}</span></div>
                        <div><strong>ICAR Baseline:</strong> N: <span style="color:#34D399;">{b_soil['nitrogen']} kg/ha</span> | P: <span style="color:#38BDF8;">{b_soil['phosphorus']} kg/ha</span> | K: <span style="color:#FBBF24;">{b_soil['potassium']} kg/ha</span> | pH: <span style="color:#A78BFA;">{b_soil['ph']}</span></div>
                        <div style="color: #9CA3AF; font-size: 0.78rem; margin-top: 3px;"><strong>Common Deficiencies:</strong> {st_profile['micronutrient_deficiencies'][0]}</div>
                    </div>
                    """, unsafe_allow_html=True)
                    st.button(
                        f"⚡ Auto-Fill {chosen_state} Soil Baseline",
                        key=f"apply_soil_{chosen_state}",
                        on_click=apply_soil_baseline_callback,
                        args=(chosen_state,),
                        use_container_width=True
                    )

            # Soil Nutrients
            st.markdown("#### 🧪 Macronutrients (NPK in kg/ha)")
            col_n, col_p, col_k = st.columns(3)
            with col_n:
                n_val = st.slider("Nitrogen (N)", 0, 250, key="slider_n", help="Available soil Nitrogen in kg/ha")
            with col_p:
                p_val = st.slider("Phosphorus (P)", 5, 180, key="slider_p", help="Available soil Phosphorus in kg/ha")
            with col_k:
                k_val = st.slider("Potassium (K)", 5, 300, key="slider_k", help="Available soil Potassium in kg/ha")

            st.markdown("#### 🌡️ Live Environmental Telemetry")
            col_t, col_h = st.columns(2)
            with col_t:
                temp_val = st.slider(
                    "Temperature (°C)", -10.0, 55.0,
                    key="slider_temp", step=0.5,
                    help="Auto-calibrated from searched city or live location"
                )
            with col_h:
                hum_val = st.slider(
                    "Humidity (%)", 5.0, 100.0,
                    key="slider_hum", step=1.0,
                    help="Relative humidity percentage from live weather"
                )

            col_r, col_ph = st.columns(2)
            with col_r:
                rain_val = st.slider(
                    "Rainfall (mm)", 0.0, 500.0,
                    key="slider_rain", step=1.0,
                    help="Rainfall index calibrated for crop requirement and live telemetry"
                )
            with col_ph:
                ph_val = st.slider("Soil pH Level", 3.5, 9.5, key="slider_ph", step=0.1)

            st.markdown("#### 🎯 Crop You Plan to Cultivate")
            # If target crop was adopted via 1-click alternative
            current_target = st.session_state.chosen_target_crop
            target_idx = SUPPORTED_CROPS.index(current_target) if current_target in SUPPORTED_CROPS else 0
            
            chosen_crop = st.selectbox(
                "Select planned crop",
                SUPPORTED_CROPS,
                index=target_idx,
                help="Select the crop you want to plant. SPARC will analyze it and provide a rescue protocol if not ideal!"
            )
            st.session_state.chosen_target_crop = chosen_crop

            farm_field_name = st.text_input("Farm Field Location / Tag", value=f"{w_curr.get('city', 'Main')} Field Block A")
            notes_input = st.text_area("Field Notes / Observations", value="Field pre-sowing evaluation.", height=60)

            run_analysis = st.button("⚡ Run SPARC Adaptive Diagnostics", use_container_width=True)

            st.markdown("</div>", unsafe_allow_html=True)

        # ── RESULTS & DIAGNOSTIC INTELLIGENCE CARD ──
        with col_results:
            # Trigger analysis
            if run_analysis or st.session_state.last_prediction is None:
                with st.spinner("Computing agronomic intelligence & rescue roadmap..."):
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

            # Visual risk indicators
            risk_lvl = diag["risk_level"]
            risk_badge = "badge-emerald" if risk_lvl == "Low Risk" else ("badge-amber" if risk_lvl == "Moderate Risk" else "badge-rose")
            border_col = "#10B981" if risk_lvl == "Low Risk" else ("#F59E0B" if risk_lvl == "Moderate Risk" else "#F43F5E")

            # ── TARGET CROP STATUS BANNER ──
            st.markdown(f"""
            <div class="sparc-card" style="border-top: 4px solid {border_col}; margin-bottom: 16px;">
                <div class="sparc-card-header">
                    <span class="sparc-title">🎯 Target Crop Analysis: {diag['target_crop']}</span>
                    <span class="sparc-badge {risk_badge}">Status: {diag['risk_level']}</span>
                </div>
                <div style="font-size: 1.02rem; color: #E5E7EB; line-height: 1.5; margin-bottom: 14px;">
                    {diag['summary']}
                </div>
            </div>
            """, unsafe_allow_html=True)

            # ── DUAL TABBED INTERFACE FOR SEAMLESS USER EXPERIENCE ──
            tab_rescue, tab_alts = st.tabs([
                f"🌱 How to Plant {diag['target_crop']} Anyway (Rescue Roadmap)",
                "🌾 Top 3 AI Recommendations (Natural Best Fits)"
            ])

            # ── TAB A: HOW TO PLANT TARGET CROP ANYWAY ──
            with tab_rescue:
                st.markdown(f"""
                <div style="margin-bottom: 14px; color: #9CA3AF; font-size: 0.9rem;">
                    If you still want to cultivate <strong>{diag['target_crop']}</strong>, follow these 
                    actionable agronomic amendments and microclimate strategies to mitigate environmental risks:
                </div>
                """, unsafe_allow_html=True)

                if diag["rescue_roadmap"]:
                    for item in diag["rescue_roadmap"]:
                        st.markdown(f"""
                        <div class="rescue-item">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                <span style="font-weight: 700; color: #34D399; font-size: 0.95rem;">
                                    📌 {item['category']}
                                </span>
                            </div>
                            <div style="color: #F3F4F6; font-size: 0.92rem; margin-bottom: 4px;">
                                <strong>Action:</strong> {item['action']}
                            </div>
                            <div style="color: #9CA3AF; font-size: 0.82rem;">
                                💡 <em>Agronomic Impact: {item['impact']}</em>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)
                else:
                    st.success(f"No emergency adjustments needed! Standard sowing and cultivation practices are sufficient for {diag['target_crop']}.")

                st.markdown("##### ✅ Farmer Execution Checklist:")
                st.checkbox(f"Soil Amendment Applied (NPK balancing & Lime/Gypsum as required)", value=False)
                st.checkbox(f"Irrigation / Drainage lines calibrated for {diag['target_crop']}", value=False)
                st.checkbox(f"Certified seeds pre-treated with biofertilizers (Trichoderma / Rhizobium)", value=False)
                st.checkbox(f"Mulching or microclimate protection prepared against temperature extremes", value=False)

            # ── TAB B: TOP 3 RECOMMENDED ALTERNATIVES ──
            with tab_alts:
                st.markdown("""
                <div style="margin-bottom: 14px; color: #9CA3AF; font-size: 0.9rem;">
                    If planting your target crop is too expensive or risky, here are the <strong>Top 3 crops</strong> 
                    that naturally thrive in your current field soil and weather:
                </div>
                """, unsafe_allow_html=True)

                for idx, alt in enumerate(diag["top_3_enriched"]):
                    col_card, col_act = st.columns([3, 1.2])
                    with col_card:
                        is_target = " (Your Planned Crop)" if alt["is_current_target"] else ""
                        st.markdown(f"""
                        <div class="alt-crop-card">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <span style="font-size: 1.15rem; font-weight: 800; color: #FFFFFF;">
                                    {alt['rank_title']}: <span style="color: #34D399;">{alt['crop_name']}</span>{is_target}
                                </span>
                                <span style="font-family: monospace; font-size: 1.1rem; font-weight: 800; color: #38BDF8;">
                                    {alt['confidence']:.1f}% Match
                                </span>
                            </div>
                            <div style="font-size: 0.85rem; color: #D1D5DB; margin-bottom: 6px;">
                                <strong>Why it fits:</strong> {alt['why_recommended']}
                            </div>
                            <div style="font-size: 0.82rem; color: #9CA3AF; line-height: 1.4;">
                                • <strong>Cycle:</strong> {alt['cycle_days']} &nbsp;|&nbsp; 
                                • <strong>Water Need:</strong> {alt['water_demand']}
                            </div>
                            <div style="font-size: 0.80rem; color: #A7F3D0; margin-top: 4px;">
                                📈 <strong>Market Outlook:</strong> {alt['economic_outlook']}
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                    with col_act:
                        st.write("")
                        st.write("")
                        if not alt["is_current_target"]:
                            if st.button(f"⚡ Adopt {alt['crop_name']}", key=f"adopt_btn_{idx}", use_container_width=True):
                                st.session_state.chosen_target_crop = alt["crop_name"].lower()
                                st.toast(f"Switched target crop to {alt['crop_name']}!")
                                st.rerun()
                        else:
                            st.info("Currently Selected")

            # ── COMMIT RECORD TO DATABASE & DOWNLOAD EXECUTIVE PDF REPORT ──
            st.markdown("---")
            col_save, col_pdf = st.columns([1.2, 1.3], gap="medium")
            with col_save:
                if st.button("💾 Commit Record to Database", use_container_width=True):
                    record_data = {
                        "username": st.session_state.current_user,
                        "farm_location": inputs.get("farm", "Main Field"),
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
                    st.success(f"Saved into SQLite database as Record #{new_id}!")
                st.caption("Saved records are accessible and editable anytime under the Historical Analytics tab.")

            with col_pdf:
                # Compile comprehensive executive agronomy report
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
                        label="📄 Download Agronomic Report (PDF)",
                        data=pdf_bytes,
                        file_name=f"SPARC_Agronomy_Report_{diag['target_crop'].lower()}_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf",
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
                <span class="sparc-title">🩺 SPARC Crop Doctor: Plant Pathology & Integrated Pest Management</span>
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
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 10px 16px; margin-bottom: 16px; font-size: 0.88rem; color: #34D399;">
                ✅ <strong>Low Incubation Risk:</strong> Current ambient weather ({cur_t}°C, {cur_h}% RH) does not indicate active epidemic pathogen incubation for {active_crop_doc.capitalize()}.
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
                format_func=lambda x: "🌱 All Supported Crops" if x == "all" else f"🌾 {x.capitalize()}"
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
                with st.expander(f"🩺 {d['name']} — [{d['crop'].capitalize()} | {d['pathogen_type']}]", expanded=False):
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
                            <div style="color: #34D399; font-weight: 700; margin-bottom: 8px;">🌿 Biological & Organic Biocontrols:</div>
                        """, unsafe_allow_html=True)
                        for bio in d["biological_cures"]:
                            st.markdown(f"• <span style='font-size:0.86rem; color:#D1D5DB;'>{bio}</span>", unsafe_allow_html=True)
                        st.markdown("</div>", unsafe_allow_html=True)

                    with col_chem:
                        st.markdown("""
                        <div style="background: rgba(6, 182, 212, 0.05); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 10px; padding: 14px;">
                            <div style="color: #38BDF8; font-weight: 700; margin-bottom: 8px;">🧪 Chemical Treatments (ICAR / CIBRC Prescriptions):</div>
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
                        <strong>🛡️ Agronomic Prevention & Cultural Practices:</strong>
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
                Total Chemical / Bio-Agent to measure: <span style="color: #38BDF8; font-weight: 800; font-size: 1.25rem;">{total_chem:.1f} grams or ml</span> 
                for <span style="color: #34D399; font-weight: 700;">{tank_vol * num_tanks:.0f} Liters total water</span>.
            </div>
            <div style="font-size: 0.80rem; color: #9CA3AF; margin-top: 4px;">
                💡 Always make a slurry in a small bucket first before pouring into the main spray tank. Never spray against the wind direction.
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
            f'<span class="sparc-title">🧪 Precision Fertilizer Prescriptions for: {active_crop.capitalize()}</span>'
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
                '<span>🌐 Interactive 3D Agronomic Spatial Intelligence</span>'
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
                ["📈 3D Simple Line Comparison", "📊 3D Side-by-Side Columns", "🎯 2D High-Clarity View", "🏔️ 3D Yield Landscape"],
                horizontal=True,
                label_visibility="collapsed"
            )
            if "Line Comparison" in graph_mode_choice:
                mode_key = "line_chart"
            elif "Columns" in graph_mode_choice:
                mode_key = "columns"
            elif "2D" in graph_mode_choice:
                mode_key = "flat_2d"
            else:
                mode_key = "yield_surface"

        col_radar, col_table = st.columns([1.35, 1.15], gap="large")

        with col_radar:
            title_text = {
                "line_chart": "📈 3D Simple Current vs Required Line Comparison",
                "columns": "📊 3D Side-by-Side Dual-Pillar Comparison",
                "flat_2d": "🎯 2D Direct High-Clarity Comparison",
                "yield_surface": "🏔️ 3D Quadratic Yield Response Landscape"
            }.get(mode_key, "📈 3D Nutrient Comparison")

            chart_header_html = (
                f'<div class="sparc-card" style="padding: 16px 20px 14px 20px; margin-bottom: 12px;">'
                f'<div class="sparc-card-header" style="margin-bottom: 10px; padding-bottom: 8px;">'
                f'<span class="sparc-title" style="font-size: 1.15rem;">{title_text}</span>'
                f'<span class="sparc-badge badge-cyan">{active_crop.capitalize()} Target Model</span>'
                f'</div>'
                f'<div style="display: flex; gap: 8px; flex-wrap: wrap; font-size: 0.80rem;">'
                f'<span style="background: rgba(0,245,255,0.08); border: 1px solid rgba(0,245,255,0.3); border-radius: 6px; padding: 4px 9px; color: #00F5FF;">'
                f'🌱 Current: <strong>N:{n_cur:.0f} P:{p_cur:.0f} K:{k_cur:.0f}</strong> kg/ha'
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
                st.bar_chart(npk_df.set_index("Nutrient"), color=["#06B6D4", "#10B981"])

            # 3D Inset Luxury Metric Cases
            ph_status_color = '#34D399' if 6.0 <= inputs.get('ph', 6.5) <= 7.5 else '#FBBF24'
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
                    f'<div style="font-size: 0.80rem; color: #34D399; font-weight: 600; display: flex; align-items: center; gap: 6px;">'
                    f'<span>⏱️ Application Window:</span>'
                    f'<span style="color: #F8FAFC; font-weight: 400;">{p_timing}</span>'
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
                f'<strong style="color: #F3E5AB;">🛡️ Agronomic Calibration Rule:</strong> Split nitrogen application into basal (50%) and top-dressing at tillering/panicle initiation (25% + 25%) to minimize volatilization and leaching losses.'
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
                    <div class="metric-val" style="color: {'#34D399' if 6.2 <= b['ph'] <= 7.8 else '#FBBF24'};">{b['ph']}</div>
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
                        <span class="sparc-title">🌾 State Recommended Fertilizer Packages</span>
                        <span class="sparc-badge badge-emerald">{st_choice} KVK</span>
                    </div>
                """, unsafe_allow_html=True)

                pkgs = profile_data.get("fertilizer_package", {})
                if pkgs:
                    for crop_k, pkg in pkgs.items():
                        st.markdown(f"""
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <strong style="color: #38BDF8; font-size: 1.05rem;">🌾 {crop_k.capitalize()}</strong>
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

                st.markdown("<div style='color: #34D399; font-weight: 700; margin-top: 14px;'>🌱 Regional Soil Management & Reclamation Interventions:</div>", unsafe_allow_html=True)
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
                    <div class="metric-val" style="color: #34D399;">{pct:.1f}%</div>
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
