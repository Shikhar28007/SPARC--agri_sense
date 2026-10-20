"""
SPARC AgriSense AI: Executive Agronomic Diagnostic & Precision Prescription PDF Generator
Produces print-ready, professional multi-section PDF reports for farmers, agronomists,
and agricultural extension officers using ReportLab.
"""

import io
from datetime import datetime
from typing import Dict, Any, List, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)

import crop_disease_doctor as cdd

def generate_agrisense_pdf_report(
    inputs: Dict[str, Any],
    diagnostics: Dict[str, Any],
    weather: Dict[str, Any],
    fertilizer_calc: Optional[Dict[str, Any]] = None,
    operator: str = "Lead Agronomist"
) -> bytes:
    """
    Generates a high-quality, professional agronomy report in PDF format.
    Returns bytes of the compiled PDF.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom color palette
    c_primary = colors.HexColor("#065F46")     # Deep Forest Emerald
    c_accent = colors.HexColor("#0284C7")      # Rich Cyan / Sky
    c_gold = colors.HexColor("#B45309")        # Amber / Gold
    c_dark = colors.HexColor("#0F172A")        # Slate / Charcoal
    c_light_bg = colors.HexColor("#F8FAFC")    # Cool Grey Light
    c_muted = colors.HexColor("#64748B")       # Muted Slate
    c_danger = colors.HexColor("#BE123C")      # Rose / Danger
    c_success = colors.HexColor("#15803D")     # Emerald / Success

    # Custom typography styles
    style_title = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=c_primary,
        spaceAfter=4
    )

    style_subtitle = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=c_muted,
        spaceAfter=10
    )

    style_h2 = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_primary,
        spaceBefore=10,
        spaceAfter=6
    )

    style_body = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_dark
    )

    style_bold = ParagraphStyle(
        'BodyBold',
        parent=style_body,
        fontName='Helvetica-Bold'
    )

    style_meta_label = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=c_muted
    )

    style_meta_val = ParagraphStyle(
        'MetaVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=c_dark
    )

    elements: List[Any] = []

    # ── HEADER & BRANDING ──
    report_id = f"SPARC-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    target_crop = str(diagnostics.get("target_crop", inputs.get("target", "Target Crop"))).capitalize()

    header_table_data = [
        [
            Paragraph("<b>SPARC AgriSense AI</b><br/><font size=8 color='#64748B'>Smart Agriculture Recommendation & Precision Agronomy System</font>", style_title),
            Paragraph(f"<b>REPORT REF:</b> {report_id}<br/><b>DATE:</b> {datetime.now().strftime('%d %B %Y, %H:%M')}<br/><b>OPERATOR:</b> {operator}", style_meta_val)
        ]
    ]
    t_header = Table(header_table_data, colWidths=[4.0 * inch, 3.2 * inch])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(t_header)
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=4, spaceAfter=10))

    # ── FIELD IDENTIFICATION & METEOROLOGICAL TELEMETRY ──
    location_str = weather.get("location", "Field Location")
    temp_str = f"{weather.get('temperature', inputs.get('temp', 26.0))} °C"
    hum_str = f"{weather.get('humidity', inputs.get('hum', 60.0))} %"
    live_rain_str = f"{weather.get('live_rain', 0.0)} mm/hr"
    rain_idx_str = f"{weather.get('rainfall', inputs.get('rain', 100.0))} mm"
    condition_str = f"{weather.get('condition_icon', '🌤️')} {weather.get('condition', 'Fair Weather')}"

    farm_tag = inputs.get("farm", f"{weather.get('city', 'Main')} Field Block A")

    telemetry_data = [
        [
            Paragraph("<b>Field / Farm Tag:</b>", style_meta_label),
            Paragraph(farm_tag, style_meta_val),
            Paragraph("<b>Weather Condition:</b>", style_meta_label),
            Paragraph(f"<b>{condition_str}</b>", style_meta_val),
        ],
        [
            Paragraph("<b>Geo Location:</b>", style_meta_label),
            Paragraph(location_str, style_meta_val),
            Paragraph("<b>Temperature:</b>", style_meta_label),
            Paragraph(temp_str, style_meta_val),
        ],
        [
            Paragraph("<b>Relative Humidity:</b>", style_meta_label),
            Paragraph(hum_str, style_meta_val),
            Paragraph("<b>Live Rain / Seasonal:</b>", style_meta_label),
            Paragraph(f"{live_rain_str} / {rain_idx_str}", style_meta_val),
        ]
    ]
    t_telemetry = Table(telemetry_data, colWidths=[1.4 * inch, 2.3 * inch, 1.4 * inch, 2.1 * inch])
    t_telemetry.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_light_bg),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(t_telemetry)
    elements.append(Spacer(1, 10))

    # ── SECTION 1: SOIL CHEMICAL PROFILE & NUTRIENT TEST ──
    elements.append(Paragraph("1. Soil Chemical Profile & Baseline Test", style_h2))
    
    n_val = inputs.get("n", 80)
    p_val = inputs.get("p", 45)
    k_val = inputs.get("k", 40)
    ph_val = inputs.get("ph", 6.5)

    ph_status = "Neutral (Optimal)" if 6.0 <= ph_val <= 7.5 else ("Acidic (Requires Lime)" if ph_val < 6.0 else "Alkaline (Requires Gypsum)")

    soil_table_data = [
        [
            Paragraph("<b>Parameter</b>", style_bold),
            Paragraph("<b>Tested Field Value</b>", style_bold),
            Paragraph("<b>Agronomic Rating</b>", style_bold),
            Paragraph("<b>Benchmark Guideline</b>", style_bold)
        ],
        [
            Paragraph("Available Nitrogen (N)", style_body),
            Paragraph(f"{n_val} kg/ha", style_body),
            Paragraph("Low" if n_val < 100 else ("Medium" if n_val <= 180 else "High"), style_body),
            Paragraph("120 - 160 kg/ha for intensive cereals", style_body)
        ],
        [
            Paragraph("Available Phosphorus (P)", style_body),
            Paragraph(f"{p_val} kg/ha", style_body),
            Paragraph("Low" if p_val < 30 else ("Medium" if p_val <= 60 else "High"), style_body),
            Paragraph("40 - 60 kg/ha available P2O5", style_body)
        ],
        [
            Paragraph("Available Potassium (K)", style_body),
            Paragraph(f"{k_val} kg/ha", style_body),
            Paragraph("Low" if k_val < 40 else ("Medium" if k_val <= 100 else "High"), style_body),
            Paragraph("60 - 120 kg/ha available K2O", style_body)
        ],
        [
            Paragraph("Soil Reaction (pH)", style_body),
            Paragraph(f"{ph_val:.1f}", style_body),
            Paragraph(ph_status, style_body),
            Paragraph("6.2 - 7.2 (Ideal for microbial bioavailability)", style_body)
        ]
    ]
    t_soil = Table(soil_table_data, colWidths=[2.0 * inch, 1.4 * inch, 1.8 * inch, 2.0 * inch])
    t_soil.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(t_soil)
    elements.append(Spacer(1, 10))

    # ── SECTION 2: TARGET CROP VIABILITY & ADAPTIVE DIAGNOSTICS ──
    elements.append(Paragraph(f"2. Target Planned Crop Evaluation: {target_crop}", style_h2))
    risk_level = diagnostics.get("risk_level", "Evaluated")
    risk_color = c_success if risk_level == "Low Risk" else (c_gold if risk_level == "Moderate Risk" else c_danger)

    summary_text = diagnostics.get("summary", "Agronomic evaluation completed.")

    target_box = [
        [
            Paragraph(f"<b>TARGET CROP:</b> {target_crop}", style_bold),
            Paragraph(f"<b>ADAPTIVE STATUS:</b> <font color='{risk_color.hexval()}'><b>{risk_level}</b></font>", style_bold)
        ],
        [
            Paragraph(f"<b>Diagnostic Summary:</b> {summary_text}", style_body),
            ""
        ]
    ]
    t_target = Table(target_box, colWidths=[4.2 * inch, 3.0 * inch])
    t_target.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_light_bg),
        ('SPAN', (0, 1), (1, 1)),
        ('BOX', (0, 0), (-1, -1), 1, risk_color),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(t_target)
    elements.append(Spacer(1, 8))

    # ── RESCUE ROADMAP ──
    rescue_roadmap = diagnostics.get("rescue_roadmap", [])
    if rescue_roadmap:
        elements.append(Paragraph("<b>Actionable Agronomic Rescue Roadmap (How to Grow Target Crop Safely):</b>", style_bold))
        rescue_table_data = [
            [Paragraph("<b>Category</b>", style_bold), Paragraph("<b>Prescribed Corrective Action</b>", style_bold), Paragraph("<b>Agronomic Impact</b>", style_bold)]
        ]
        for r in rescue_roadmap:
            rescue_table_data.append([
                Paragraph(f"<b>{r.get('category', 'Advisory')}</b>", style_body),
                Paragraph(r.get("action", ""), style_body),
                Paragraph(f"<i>{r.get('impact', '')}</i>", style_body)
            ])
        t_rescue = Table(rescue_table_data, colWidths=[1.8 * inch, 3.2 * inch, 2.2 * inch])
        t_rescue.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(t_rescue)
        elements.append(Spacer(1, 10))

    # ── SECTION 3: COMMERCIAL FERTILIZER PRESCRIPTION ──
    if fertilizer_calc:
        elements.append(Paragraph("3. Precision Commercial Fertilizer & Soil Amendment Prescription", style_h2))
        fert_req = fertilizer_calc.get("commercial_fertilizers", {})
        cond_dose = fertilizer_calc.get("conditioner_dose_kg_acre", 0.0)
        cond_type = fertilizer_calc.get("soil_conditioner", "None")

        fert_data = [
            [Paragraph("<b>Commercial Fertilizer</b>", style_bold), Paragraph("<b>Dose (kg/acre)</b>", style_bold), Paragraph("<b>Commercial Bags (approx)</b>", style_bold), Paragraph("<b>Application Schedule & Technique</b>", style_bold)],
            [
                Paragraph("<b>Urea</b> (46% N)", style_body),
                Paragraph(f"{fert_req.get('urea_kg_acre', 0):.1f} kg/acre", style_body),
                Paragraph(f"{fert_req.get('urea_bags_50kg', 0):.1f} bags (45/50kg)", style_body),
                Paragraph("Split: 1/3 basal at sowing, 1/3 tillering, 1/3 panicle/flowering.", style_body)
            ],
            [
                Paragraph("<b>DAP</b> (18% N, 46% P2O5)", style_body),
                Paragraph(f"{fert_req.get('dap_kg_acre', 0):.1f} kg/acre", style_body),
                Paragraph(f"{fert_req.get('dap_bags_50kg', 0):.1f} bags (50kg)", style_body),
                Paragraph("100% Basal placement 5 cm below seed depth.", style_body)
            ],
            [
                Paragraph("<b>MOP</b> (Muriate of Potash 60% K2O)", style_body),
                Paragraph(f"{fert_req.get('mop_kg_acre', 0):.1f} kg/acre", style_body),
                Paragraph(f"{fert_req.get('mop_bags_50kg', 0):.1f} bags (50kg)", style_body),
                Paragraph("50% Basal, 50% at peak vegetative growth / panicle initiation.", style_body)
            ]
        ]
        if cond_dose > 0:
            fert_data.append([
                Paragraph(f"<b>Soil Conditioner: {cond_type}</b>", style_body),
                Paragraph(f"{cond_dose:.1f} kg/acre", style_body),
                Paragraph(f"{cond_dose / 50.0:.1f} bags", style_body),
                Paragraph("Broadcast and incorporate 15 days before sowing to normalize pH.", style_body)
            ])

        t_fert = Table(fert_data, colWidths=[2.1 * inch, 1.3 * inch, 1.4 * inch, 2.4 * inch])
        t_fert.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(t_fert)
        elements.append(Spacer(1, 10))

    # ── SECTION 4: TOP 3 AI ALTERNATIVE CROPS ──
    top_3 = diagnostics.get("top_3_enriched", [])
    if top_3:
        elements.append(Paragraph("4. Machine Learning Confidence Rankings (Top 3 Natural Fit Crops)", style_h2))
        alt_table_data = [
            [
                Paragraph("<b>Rank</b>", style_bold),
                Paragraph("<b>Crop Species</b>", style_bold),
                Paragraph("<b>Model Confidence</b>", style_bold),
                Paragraph("<b>Agronomic Cycle</b>", style_bold),
                Paragraph("<b>Commercial Outlook</b>", style_bold)
            ]
        ]
        for alt in top_3:
            alt_table_data.append([
                Paragraph(f"<b>{alt.get('rank_title', '#')}</b>", style_body),
                Paragraph(f"<b>{alt.get('crop_name', '')}</b>", style_body),
                Paragraph(f"{alt.get('confidence', 0):.1f}%", style_body),
                Paragraph(f"{alt.get('cycle_days', 'N/A')}", style_body),
                Paragraph(f"{alt.get('economic_outlook', 'Stable market demand')}", style_body)
            ])
        t_alt = Table(alt_table_data, colWidths=[0.9 * inch, 1.5 * inch, 1.2 * inch, 1.4 * inch, 2.2 * inch])
        t_alt.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(t_alt)
        elements.append(Spacer(1, 10))

    # ── SECTION 5: CROP DOCTOR (PLANT PATHOLOGY & IPM CURES) ──
    crop_diseases = cdd.search_diseases(crop_name=target_crop.lower())
    if crop_diseases:
        elements.append(Paragraph(f"5. Crop Doctor Advisory: Plant Pathology & IPM Cures for {target_crop}", style_h2))
        doc_data = [
            [
                Paragraph("<b>Disease / Pest</b>", style_bold),
                Paragraph("<b>Diagnostic Symptoms</b>", style_bold),
                Paragraph("<b>Biological Biocontrol</b>", style_bold),
                Paragraph("<b>CIBRC Chemical Remedy & Dose</b>", style_bold)
            ]
        ]
        for d in crop_diseases[:2]:  # Show top 2 primary diseases for compact elegance
            bio = d.get("biological_cures", ["Trichoderma viride seed treatment @ 10 g/kg"])[0]
            chem = d.get("chemical_remedies", [{"active_ingredient": "Standard protectant", "dosage": "2 g/L"}])[0]
            chem_str = f"<b>{chem.get('active_ingredient', '')}</b><br/>Dose: {chem.get('dosage', '')}"

            doc_data.append([
                Paragraph(f"<b>{d.get('name', '')}</b><br/><font size=7 color='#64748B'>Type: {d.get('pathogen_type', '')}</font>", style_body),
                Paragraph(d.get("symptoms", "")[:180] + ("..." if len(d.get("symptoms", "")) > 180 else ""), style_body),
                Paragraph(bio, style_body),
                Paragraph(chem_str, style_body)
            ])

        t_doc = Table(doc_data, colWidths=[1.8 * inch, 2.2 * inch, 1.6 * inch, 1.6 * inch])
        t_doc.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#FEE2E2")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(t_doc)
        elements.append(Spacer(1, 10))

    # ── FOOTER & LEGAL DISCLAIMER ──
    elements.append(HRFlowable(width="100%", thickness=0.75, color=c_muted, spaceBefore=8, spaceAfter=6))
    footer_text = (
        "<b>Notice & Agronomic Disclaimer:</b> This report is generated by Project SPARC (Autonomous Agri-AI Microkernel). "
        "Recommendations are computed from ICAR-IISS soil fertility baselines, CIBRC agrochemical approvals, and Open-Meteo REST telemetry. "
        "Verify localized pesticide and fertilizer guidelines with your District Krishi Vigyan Kendra (KVK) or State Agriculture Officer."
    )
    elements.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=styles['Normal'], fontSize=7, leading=10, textColor=c_muted)))

    # Build document
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
