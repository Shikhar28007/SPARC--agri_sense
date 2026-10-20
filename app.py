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

# Import unified Python backend service layer with hot-reload guard
import importlib
import backend
importlib.reload(backend)
from backend import db_instance, engine_instance, SUPPORTED_CROPS, REGIONAL_WEATHER_PRESETS

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
                font=dict(size=11, color="#F3E5AB"),
                bgcolor="rgba(10, 14, 25, 0.85)",
                bordercolor="rgba(212, 175, 55, 0.35)",
                borderwidth=1
            )
        )
        return fig

# ─────────────────────────────────────────────────────────────────────────────
# STREAMLIT PAGE CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="SPARC | Luxury 3D Agriculture AI",
    page_icon="👑",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ─────────────────────────────────────────────────────────────────────────────
# LUXURY 3D CASE THEME & IMMERSIVE FADED TRANSITIONS
# Palette: Royal Obsidian (#060913) + 24K Champagne Gold (#D4AF37) + Emerald (#10B981) + Platinum (#38BDF8)
# ─────────────────────────────────────────────────────────────────────────────
CUSTOM_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

:root {
    --bg-main: #060913;
    --bg-case: linear-gradient(145deg, rgba(20, 27, 46, 0.94) 0%, rgba(10, 14, 26, 0.98) 60%, rgba(5, 8, 17, 1) 100%);
    --bg-case-subtle: linear-gradient(135deg, rgba(255, 255, 255, 0.035) 0%, rgba(212, 175, 55, 0.02) 100%);
    --border-gold: rgba(212, 175, 55, 0.28);
    --border-gold-hover: rgba(212, 175, 55, 0.55);
    --border-emerald: rgba(16, 185, 129, 0.3);
    --accent-gold: #D4AF37;
    --accent-gold-light: #F3E5AB;
    --accent-emerald: #10B981;
    --accent-cyan: #38BDF8;
    --accent-amber: #F59E0B;
    --accent-rose: #F43F5E;
    --text-primary: #F8FAFC;
    --text-muted: #94A3B8;
    --shadow-3d-case: 0 18px 45px -8px rgba(0, 0, 0, 0.9), inset 0 1px 1px 0 rgba(255, 255, 255, 0.18), inset 0 -2px 4px 0 rgba(0, 0, 0, 0.75), 0 0 25px rgba(212, 175, 55, 0.05);
}

/* Global Luxury Obsidian App Canvas */
.stApp {
    background-color: var(--bg-main) !important;
    background-image: 
        radial-gradient(circle at 15% 10%, rgba(212, 175, 55, 0.035) 0%, transparent 40%),
        radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.04) 0%, transparent 45%),
        radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.02) 0%, transparent 60%) !important;
    color: var(--text-primary) !important;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif !important;
}

#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}

/* ─── IMMERSIVE FADED SECTION TRANSITIONS ─── */
@keyframes luxuryFadeInGlide {
    0% {
        opacity: 0;
        transform: translateY(18px) scale(0.99);
        filter: blur(6px);
    }
    50% {
        opacity: 0.88;
        filter: blur(1px);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
    }
}

div[data-testid="stTabsContent"] {
    animation: luxuryFadeInGlide 0.52s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
    will-change: transform, opacity, filter;
}

/* ─── 3D LUXURY CASE CARD CONTAINERS ─── */
.sparc-card {
    background: var(--bg-case);
    border: 1px solid var(--border-gold);
    border-radius: 16px;
    padding: 24px 26px;
    margin-bottom: 22px;
    box-shadow: var(--shadow-3d-case);
    backdrop-filter: blur(16px);
    position: relative;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease;
}

.sparc-card:hover {
    border-color: var(--border-gold-hover);
    box-shadow: 0 28px 60px -12px rgba(0, 0, 0, 0.95), inset 0 1px 2px 0 rgba(255, 255, 255, 0.28), 0 0 30px rgba(212, 175, 55, 0.16);
    transform: translateY(-3px) scale(1.003);
}

.sparc-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    border-bottom: 1px solid rgba(212, 175, 55, 0.15);
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

/* ─── 3D METALLIC EMBOSSED BADGES ─── */
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

.badge-gold {
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.06) 100%);
    color: #F3E5AB;
    border: 1px solid rgba(212, 175, 55, 0.45);
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

/* ─── 3D INSET METRIC CASES ─── */
.metric-box {
    background: linear-gradient(145deg, rgba(22, 30, 52, 0.85) 0%, rgba(9, 13, 24, 0.95) 100%);
    border: 1px solid rgba(212, 175, 55, 0.22);
    border-radius: 12px;
    padding: 16px 18px;
    text-align: center;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.7), 0 8px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(212, 175, 55, 0.35);
    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.metric-box:hover {
    transform: translateY(-2px);
    border-color: #D4AF37;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.5), 0 12px 25px rgba(212, 175, 55, 0.16);
}

.metric-label {
    font-size: 0.74rem;
    color: #D4AF37;
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

/* ─── 3D ALTERNATIVE CROP CARDS ─── */
.alt-crop-card {
    background: linear-gradient(145deg, rgba(26, 36, 60, 0.65) 0%, rgba(12, 17, 30, 0.85) 100%);
    border: 1px solid rgba(212, 175, 55, 0.2);
    border-radius: 14px;
    padding: 18px 20px;
    margin-bottom: 14px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12);
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.alt-crop-card:hover {
    background: linear-gradient(145deg, rgba(32, 45, 75, 0.8) 0%, rgba(16, 22, 38, 0.95) 100%);
    border-color: rgba(212, 175, 55, 0.45);
    box-shadow: 0 16px 35px -6px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 175, 55, 0.15);
    transform: translateY(-3px);
}

/* ─── 3D RESCUE PROTOCOL ITEMS ─── */
.rescue-item {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(10, 14, 26, 0.4) 100%);
    border-left: 4px solid #D4AF37;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 12px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* ─── LUXURY TAB NAVIGATION BAR ─── */
button[data-baseweb="tab"] {
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1px solid rgba(255, 255, 255, 0.07) !important;
    border-bottom: none !important;
    border-radius: 10px 10px 0 0 !important;
    margin-right: 6px !important;
    padding: 10px 20px !important;
    font-weight: 600 !important;
    color: #94A3B8 !important;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

button[data-baseweb="tab"]:hover {
    background: rgba(212, 175, 55, 0.08) !important;
    color: #F3E5AB !important;
    border-color: rgba(212, 175, 55, 0.35) !important;
    transform: translateY(-2px) !important;
}

button[data-baseweb="tab"][aria-selected="true"] {
    background: linear-gradient(180deg, rgba(212, 175, 55, 0.16) 0%, rgba(16, 185, 129, 0.06) 100%) !important;
    border-color: rgba(212, 175, 55, 0.45) !important;
    border-bottom: 3px solid #D4AF37 !important;
    color: #FFFFFF !important;
    box-shadow: 0 -6px 20px rgba(212, 175, 55, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
}

/* ─── 3D TACTILE LUXURY BUTTONS ─── */
div.stButton > button {
    background: linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%) !important;
    color: #FFFFFF !important;
    font-weight: 700 !important;
    border: 1px solid rgba(212, 175, 55, 0.35) !important;
    border-radius: 10px !important;
    padding: 11px 24px !important;
    box-shadow: 0 6px 18px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -2px 0 rgba(0, 0, 0, 0.45) !important;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
    letter-spacing: 0.02em !important;
}

div.stButton > button:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 50%, #065F46 100%) !important;
    border-color: #D4AF37 !important;
    box-shadow: 0 10px 25px rgba(212, 175, 55, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
    transform: translateY(-2px) scale(1.01) !important;
}

div.stButton > button:active {
    transform: translateY(1px) scale(0.99) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.7) !important;
}
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────────────────────
# SESSION STATE INITIALIZATION & SEAMLESS AUTO-LOCATION SYNC
# ─────────────────────────────────────────────────────────────────────────────
def ensure_session_state():
    """
    Guarantees that all necessary session state keys exist for the active user session.
    Must be called on every script rerun and at the start of any page/function.
    """
    if "splash_completed" not in st.session_state:
        st.session_state.splash_completed = False

    if "current_user" not in st.session_state:
        try:
            users = db_instance.get_users()
            st.session_state.current_user = users[0]["username"] if users else "lead_agronomist"
        except Exception:
            st.session_state.current_user = "lead_agronomist"

    # Seamless auto-detection on first visit
    if "weather_telemetry" not in st.session_state or not isinstance(st.session_state.weather_telemetry, dict):
        try:
            if hasattr(engine_instance, "auto_detect_location_and_weather"):
                st.session_state.weather_telemetry = engine_instance.auto_detect_location_and_weather()
            else:
                st.session_state.weather_telemetry = engine_instance.fetch_live_weather("Lucknow, Uttar Pradesh")
        except Exception:
            st.session_state.weather_telemetry = {
                "city": "Lucknow",
                "region": "Uttar Pradesh",
                "country": "India",
                "location": "Lucknow, Uttar Pradesh (India)",
                "temperature": 27.5,
                "rainfall": 125.0,
                "humidity": 65.0,
                "source": "Agro-Telemetry Fallback",
                "status": "Online"
            }

    if "chosen_target_crop" not in st.session_state:
        st.session_state.chosen_target_crop = "rice"

    if "last_prediction" not in st.session_state:
        st.session_state.last_prediction = None

    if "last_diagnostics" not in st.session_state:
        st.session_state.last_diagnostics = None

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
# MAIN DASHBOARD INTERFACE
# ─────────────────────────────────────────────────────────────────────────────
def main_dashboard():
    ensure_session_state()
    # ─── SIDEBAR ───
    with st.sidebar:
        st.markdown("""
        <div class="sidebar-brand-box">
            <div style="font-size: 2rem; margin-bottom: 6px;">🌱⚡</div>
            <div style="font-weight: 800; font-size: 1.3rem; letter-spacing: 0.05em; color: #FFFFFF;">SPARC CORE</div>
            <div style="font-size: 0.72rem; color: #34D399; font-family: monospace; letter-spacing: 0.08em;">AUTONOMOUS AGRI-AI</div>
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
        w = st.session_state.get("weather_telemetry") or {}
        st.markdown("---")
        st.markdown("### 📍 Farm Telemetry")
        st.markdown(f"""
        <div style="font-size: 0.85rem; line-height: 1.6; color: #D1D5DB;">
            <div><strong>Location:</strong> <span style="color: #38BDF8;">{w.get('location', 'Auto-Synced')}</span></div>
            <div><strong>Temperature:</strong> <span style="color: #FBBF24;">{w.get('temperature', 26.0)}°C</span></div>
            <div><strong>Humidity:</strong> <span style="color: #34D399;">{w.get('humidity', 60.0)}%</span></div>
            <div><strong>Est. Rainfall:</strong> <span style="color: #60A5FA;">{w.get('rainfall', 100.0)} mm</span></div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("---")
        if st.button("🔄 Replay Splash Page", use_container_width=True):
            st.session_state.splash_completed = False
            st.rerun()

    # ─── TOP APP HEADER BANNER ───
    w = st.session_state.get("weather_telemetry") or {}
    st.markdown(f"""
    <div class="sparc-card" style="margin-top: 10px; padding: 18px 24px; border-left: 4px solid #10B981;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
                <h2 style="margin: 0; font-size: 1.7rem; font-weight: 800; color: #FFFFFF;">
                    Project SPARC <span style="font-size: 0.95rem; font-weight: 600; color: #10B981; margin-left: 8px;">v3.0 Adaptive</span>
                </h2>
                <div style="color: #9CA3AF; font-size: 0.88rem; margin-top: 3px;">
                    Smart Agriculture Recommendation, Crop Diagnostics, Adaptation Protocols & Classification
                </div>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <span class="sparc-badge badge-emerald">📍 {w.get('city', 'Local')} Field</span>
                <span class="sparc-badge badge-cyan">🌡️ {w.get('temperature', 26.0)}°C</span>
                <span class="sparc-badge badge-amber">🌧️ {w.get('rainfall', 100.0)} mm</span>
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
        # ── SEAMLESS AUTO-LOCATION BAR ──
        st.markdown("""
        <div class="sparc-card" style="padding: 14px 20px; margin-bottom: 18px; border-color: rgba(6, 182, 212, 0.4);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.4rem;">🛰️</span>
                    <div>
                        <div style="font-size: 0.8rem; color: #38BDF8; font-weight: 600; text-transform: uppercase;">Real-Time Field Telemetry & Geolocation</div>
                        <div style="font-size: 1.05rem; font-weight: 700; color: #FFFFFF;">
        """ + f"{w.get('location', 'Auto-Synced Location')} &nbsp;·&nbsp; "
        f"<span style='color: #34D399;'>{w.get('temperature', 26.0)}°C</span> &nbsp;·&nbsp; "
        f"<span style='color: #FBBF24;'>{w.get('humidity', 60.0)}% Hum</span> &nbsp;·&nbsp; "
        f"<span style='color: #60A5FA;'>{w.get('rainfall', 100.0)} mm Rain</span>" + """
                        </div>
                    </div>
                </div>
        </div>
        """, unsafe_allow_html=True)

        col_loc_act1, col_loc_act2, col_loc_act3 = st.columns([1.2, 1.8, 1])
        with col_loc_act1:
            if st.button("📍 Auto-Detect My Location", use_container_width=True):
                with st.spinner("Locating farm via IP & Open-Meteo..."):
                    if hasattr(engine_instance, "auto_detect_location_and_weather"):
                        new_loc = engine_instance.auto_detect_location_and_weather()
                    else:
                        new_loc = engine_instance.fetch_live_weather("Lucknow, Uttar Pradesh")
                    st.session_state.weather_telemetry = new_loc
                    st.toast(f"📍 Location detected: {new_loc.get('location', 'Field Synced')}")
                    st.rerun()

        with col_loc_act2:
            custom_city = st.text_input("Or lookup custom city/region:", placeholder="e.g. Pune, Jaipur, Patna, Lucknow", label_visibility="collapsed")
        with col_loc_act3:
            if st.button("🔍 Sync Custom City", use_container_width=True):
                if custom_city:
                    with st.spinner(f"Querying weather for {custom_city}..."):
                        custom_w = engine_instance.fetch_live_weather(custom_city)
                        st.session_state.weather_telemetry = custom_w
                        st.toast(f"Synchronized weather for {custom_w['location']}")
                        st.rerun()

        st.write("")

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
                    if st.button(f"⚡ Auto-Fill {chosen_state} Soil Baseline", key=f"apply_soil_{chosen_state}", use_container_width=True):
                        st.session_state["slider_n"] = int(b_soil["nitrogen"])
                        st.session_state["slider_p"] = int(b_soil["phosphorus"])
                        st.session_state["slider_k"] = int(b_soil["potassium"])
                        st.session_state["slider_ph"] = float(b_soil["ph"])
                        st.toast(f"✅ Loaded {chosen_state} baseline soil metrics!")
                        st.rerun()

            # Soil Nutrients
            st.markdown("#### 🧪 Macronutrients (NPK in kg/ha)")
            col_n, col_p, col_k = st.columns(3)
            with col_n:
                n_val = st.slider("Nitrogen (N)", 0, 250, st.session_state.get("slider_n", 80), help="Available soil Nitrogen in kg/ha")
            with col_p:
                p_val = st.slider("Phosphorus (P)", 5, 180, st.session_state.get("slider_p", 45), help="Available soil Phosphorus in kg/ha")
            with col_k:
                k_val = st.slider("Potassium (K)", 5, 300, st.session_state.get("slider_k", 40), help="Available soil Potassium in kg/ha")

            st.markdown("#### 🌡️ Live Environmental Telemetry")
            col_t, col_h = st.columns(2)
            with col_t:
                temp_val = st.slider(
                    "Temperature (°C)", 8.0, 48.0,
                    float(w_curr.get("temperature", 26.0)), step=0.5,
                    help="Auto-calibrated from your live location"
                )
            with col_h:
                hum_val = st.slider(
                    "Humidity (%)", 10.0, 100.0,
                    float(w_curr.get("humidity", 65.0)), step=1.0
                )

            col_r, col_ph = st.columns(2)
            with col_r:
                rain_val = st.slider(
                    "Rainfall (mm)", 15.0, 350.0,
                    float(w_curr.get("rainfall", 110.0)), step=5.0
                )
            with col_ph:
                ph_val = st.slider("Soil pH Level", 3.5, 9.5, float(st.session_state.get("slider_ph", 6.5)), step=0.1)

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

            # ── COMMIT RECORD TO DATABASE ──
            st.markdown("---")
            col_save, col_info = st.columns([1.5, 2])
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
            with col_info:
                st.caption("Saved records are accessible and editable anytime under the Historical Analytics tab.")

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
            if st.button(f"⚡ Set {st_choice} as Active Field Baseline", use_container_width=True):
                chosen_p = backend.get_state_soil_profile(st_choice)
                if chosen_p:
                    b_vals = chosen_p["baseline_soil"]
                    st.session_state["slider_n"] = int(b_vals["nitrogen"])
                    st.session_state["slider_p"] = int(b_vals["phosphorus"])
                    st.session_state["slider_k"] = int(b_vals["potassium"])
                    st.session_state["slider_ph"] = float(b_vals["ph"])
                    st.toast(f"✅ Set {st_choice} soil baseline into main predictor!")

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
