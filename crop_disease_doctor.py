"""
SPARC Crop Doctor: Plant Pathology Diagnostic & Cure Knowledgebase
Covers 68+ major plant diseases, fungal/bacterial/viral infections, and insect pests
across all 38 Indian agricultural, pulse, cereal, commercial, fruit, and cash crops (100% coverage of prediction engine).
Sources: ICAR-NCIPM (National Research Centre for Integrated Pest Management),
State Agricultural Universities (PAU, TNAU, MPKV, GBPUAT), and CIBRC (Central Insecticides Board).
"""

from typing import Dict, List, Any, Optional

CROP_DISEASES_DB: List[Dict[str, Any]] = [
    # ─── RICE (PADDY) ──────────────────────────────────────────────────────────
    {
        "id": "rice_blast",
        "crop": "rice",
        "name": "Rice Blast (Paddy Blast / Jhonka Rog)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Magnaporthe oryzae (Pyricularia oryzae)",
        "symptoms": "Spindle-shaped, eye-like spots on leaves with grey/whitish centers and dark reddish-brown margins. Severe infection causes 'Neck Blast' where panicle base turns blackish and breaks, resulting in completely chaffy, empty grains.",
        "weather_risk_triggers": {"min_temp": 18.0, "max_temp": 28.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Seed treatment with Trichoderma viride or Pseudomonas fluorescens @ 10 g/kg seed.",
            "Foliar spray of Pseudomonas fluorescens (0.2% - 2 g/L) at nursery and tillering stage.",
            "Spray 5% Neem Seed Kernel Extract (NSKE) or neem oil (3 ml/L) at first symptom notice."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Tricyclazole 75% WP (Baan / Beam)",
                "dosage": "0.6 g / liter water (120 g in 200 L water/acre)",
                "application": "Spray immediately at early leaf blast stage or 5% neck emergence to prevent neck blast."
            },
            {
                "active_ingredient": "Isoprothiolane 40% EC (Fuji-One)",
                "dosage": "1.5 ml / liter water",
                "application": "Effective curative and preventative systemic fungicide."
            },
            {
                "active_ingredient": "Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top)",
                "dosage": "1.0 ml / liter water",
                "application": "Broad-spectrum systemic protection against both blast and sheath blight."
            }
        ],
        "preventative_measures": [
            "Avoid excessive split applications of Urea/nitrogen fertilizers which produce lush, tender tissues susceptible to blast.",
            "Plant blast-resistant varieties recommended by ICAR (e.g. Swarna Sub-1, Pusa 44, IR 64).",
            "Burn or deeply plow infected stubble post-harvest to destroy overwintering mycelium."
        ]
    },
    {
        "id": "rice_sheath_blight",
        "crop": "rice",
        "name": "Sheath Blight of Rice (Khol Galan)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Rhizoctonia solani",
        "symptoms": "Oval or elliptical greenish-grey water-soaked spots on leaf sheaths near water line. Spots coalesce with irregular dark brown borders resembling snake-skin patterns. Plants lodge in patches.",
        "weather_risk_triggers": {"min_temp": 26.0, "max_temp": 34.0, "min_humidity": 80.0, "cloudy_rain": False},
        "biological_cures": [
            "Apply Trichoderma harzianum enriched Farmyard Manure (50 kg FYM + 2 kg Trichoderma/acre) in soil.",
            "Foliar spray of Bacillus subtilis or Pseudomonas fluorescens @ 2.5 g/L."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Hexaconazole 5% EC (Contaf)",
                "dosage": "2.0 ml / liter water (400 ml/acre)",
                "application": "Direct the spray nozzle towards the lower base/sheaths of the plants where moisture is trapped."
            },
            {
                "active_ingredient": "Validamycin 3% L (Sheathmar)",
                "dosage": "2.5 ml / liter water",
                "application": "Antibiotic fungicide derived from Streptomyces; extremely safe and target-specific."
            },
            {
                "active_ingredient": "Thifluzamide 24% SC (Pulsor)",
                "dosage": "0.75 ml / liter water (150 ml/acre)",
                "application": "New-generation systemic SDHI fungicide providing 25-day residual control."
            }
        ],
        "preventative_measures": [
            "Maintain wider plant spacing (20 x 15 cm) to allow sunlight and air circulation at ground level.",
            "Drain standing water intermittently for 2-3 days to lower relative humidity inside the crop canopy.",
            "Avoid excessive nitrogen; ensure balanced potash (MOP) application to strengthen cell walls."
        ]
    },
    {
        "id": "rice_bacterial_leaf_blight",
        "crop": "rice",
        "name": "Bacterial Leaf Blight (BLB / Jivaanu Jhulsa)",
        "pathogen_type": "Bacterial",
        "pathogen_name": "Xanthomonas oryzae pv. oryzae",
        "symptoms": "Water-soaked translucent lesions starting from leaf tips and margins, progressing into wavy, undulating yellow to bleached-white stripes along the veins. In morning, milky bacterial ooze droplets form on leaves and dry into crusts.",
        "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 32.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Spray fresh cow dung slurry supernatant (20 kg fresh cow dung soaked in 100 L water, strained) + 5 g/L wood ash.",
            "Seed soak in Pseudomonas fluorescens suspension (10 g/L) for 12 hours before nursery seeding."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Streptocycline (Streptomycin sulphate 90% + Tetracycline hydrochloride 10%)",
                "dosage": "6 g per 60 liters water (combined with Copper Oxychloride 50% WP @ 2.5 g/L)",
                "application": "Spray twice at 10-day intervals upon first appearance of leaf blight symptoms."
            },
            {
                "active_ingredient": "Copper Hydroxide 53.8% DF (Kocide)",
                "dosage": "2.0 g / liter water",
                "application": "Broad-spectrum contact bactericide; avoid spraying during hottest midday sun."
            }
        ],
        "preventative_measures": [
            "Immediately stop top-dressing Urea if BLB appears; excess nitrogen drastically accelerates bacterial multiplication.",
            "Drain flooded field and allow soil to aerate for 48 hours.",
            "Avoid clipping nursery seedling leaf tips during transplanting, which creates entry wounds for bacteria."
        ]
    },

    # ─── WHEAT ─────────────────────────────────────────────────────────────────
    {
        "id": "wheat_yellow_rust",
        "crop": "wheat",
        "name": "Yellow Rust / Stripe Rust (Peela Ratawa)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Puccinia striiformis f. sp. tritici",
        "symptoms": "Bright yellow to golden-orange powdery pustules arranged in parallel, continuous linear stripes on the upper leaf surface, leaf sheaths, and glumes. Yellow powder rubs off easily on fingers. Severe infection leads to shriveled grains.",
        "weather_risk_triggers": {"min_temp": 8.0, "max_temp": 18.0, "min_humidity": 80.0, "cloudy_rain": True},
        "biological_cures": [
            "Bio-seed priming with Trichoderma harzianum @ 10 g/kg seed to boost plant systemic acquired resistance (SAR).",
            "Foliar spray of fermented butter milk (Chhachh 5 L + 150 L water/acre) containing lactic acid bacteria."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Propiconazole 25% EC (Tilt / Bumper)",
                "dosage": "1.0 ml / liter water (200 ml in 200 L water/acre)",
                "application": "Spray immediately upon first observation of yellow spots; spray within 48 hours to stop stripe epidemic."
            },
            {
                "active_ingredient": "Tebuconazole 250 EC (Folicur)",
                "dosage": "1.0 ml / liter water",
                "application": "Highly effective systemic triazole curative spray."
            }
        ],
        "preventative_measures": [
            "Grow yellow-rust resistant ICAR varieties (e.g. DBW 187, DBW 222, HD 3086, PBW 725).",
            "Survey fields weekly in December-February, especially in sub-mountainous foothills and canal tracts.",
            "Avoid late sowing; plant wheat between October 25 and November 15."
        ]
    },
    {
        "id": "wheat_loose_smut",
        "crop": "wheat",
        "name": "Loose Smut of Wheat (Kangiari)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Ustilago tritici",
        "symptoms": "Every spikelet of the infected wheat earhead is transformed into a loose, black, powdery mass of fungal spores. Initially covered by a delicate silvery membrane which ruptures during emergence, blowing away spores and leaving a bare rachis.",
        "weather_risk_triggers": {"min_temp": 15.0, "max_temp": 25.0, "min_humidity": 60.0, "cloudy_rain": False},
        "biological_cures": [
            "Solar Heat Treatment of seed: Soak seeds in water for 4 hours in May-June, then spread in thin layer under hot scorching sun for 4 hours.",
            "Seed treatment with Trichoderma viride @ 8 g/kg seed."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Carboxin 37.5% + Thiram 37.5% DS (Vitavax Power)",
                "dosage": "2.5 g / kg seed",
                "application": "Mandatory dry seed treatment prior to sowing; penetrates seed coat to kill internally seed-borne dormant mycelium."
            },
            {
                "active_ingredient": "Tebuconazole 2% DS (Raxil)",
                "dosage": "1.0 g / kg seed",
                "application": "Systemic seed dressing providing 100% loose smut eradication."
            }
        ],
        "preventative_measures": [
            "Never harvest seed from fields that showed loose smut heads.",
            "Rogue out and destroy infected earheads inside plastic bags before spores disperse into adjacent healthy flowering heads."
        ]
    },

    # ─── POTATO ────────────────────────────────────────────────────────────────
    {
        "id": "potato_late_blight",
        "crop": "potato",
        "name": "Late Blight of Potato (Aloo Ka Pachheta Jhulsa)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Phytophthora infestans",
        "symptoms": "Water-soaked, dark green to purplish-black lesions appearing on leaf tips and margins. Under high humidity, white downy fungal cottony growth develops on the underside of leaves. Entire foliage collapses into a rotten, foul-smelling black mush in 48-72 hours. Tubers develop dry, sunken reddish-brown rot.",
        "weather_risk_triggers": {"min_temp": 10.0, "max_temp": 22.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Prophylactic spray of Trichoderma harzianum (4 g/L) + neem oil (3 ml/L) before weather turns foggy/drizzling.",
            "Foliar application of garlic extract (5%) + copper sulphate (0.05%) organic spray."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Mancozeb 75% WP (Dithane M-45 / Indofil M-45)",
                "dosage": "2.5 g / liter water (Prophylactic / Preventative spray)",
                "application": "Spray prior to rain/fog when canopy touches rows to create a chemical protective barrier."
            },
            {
                "active_ingredient": "Cymoxanil 8% + Mancozeb 64% WP (Curzate)",
                "dosage": "2.5 g / liter water (Curative / Eradicant)",
                "application": "Spray within 24-48 hours of detecting initial water-soaked leaf spots."
            },
            {
                "active_ingredient": "Dimethomorph 50% WP (Acrobat) OR Mandipropamid 23.4% SC (Revus)",
                "dosage": "1.0 g / liter water OR 0.8 ml / liter water",
                "application": "Advanced anti-oomycete systemic spray during severe disease outbreak."
            }
        ],
        "preventative_measures": [
            "Use certified disease-free potato seed tubers from trusted ICAR-CPRI / State seed corporations.",
            "High earthing-up (at least 15 cm soil cover over tubers) to prevent zoospores from washing down from infected leaves into tubers.",
            "De-haulm (cut and destroy haulms/vines) 10 days prior to harvest if late blight occurs in late season."
        ]
    },
    {
        "id": "potato_early_blight",
        "crop": "potato",
        "name": "Early Blight of Potato (Aloo Ka Ageta Jhulsa)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Alternaria solani",
        "symptoms": "Dark brown to black angular spots on older lower leaves displaying characteristic concentric ridges resembling a 'target board' or tree ring. Yellow halo surrounds spots, followed by leaf drying and drop.",
        "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 30.0, "min_humidity": 70.0, "cloudy_rain": False},
        "biological_cures": [
            "Spray Pseudomonas fluorescens (0.2%) combined with 0.1% jaggery solution as sticker.",
            "Soil application of Trichoderma viride enriched compost."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Chlorothalonil 75% WP (Kavach)",
                "dosage": "2.0 g / liter water",
                "application": "Outstanding multi-site contact fungicide with strong rain-fastness."
            },
            {
                "active_ingredient": "Difenoconazole 25% EC (Score)",
                "dosage": "0.5 ml / liter water",
                "application": "Potent curative triazole spray halting Alternaria mycelial expansion."
            }
        ],
        "preventative_measures": [
            "Maintain optimal crop nutrition; plants stressed for nitrogen or potassium suffer severely from early blight.",
            "Practice minimum 2-year crop rotation avoiding solanaceous crops (tomato, brinjal)."
        ]
    },

    # ─── TOMATO ────────────────────────────────────────────────────────────────
    {
        "id": "tomato_leaf_curl",
        "crop": "tomato",
        "name": "Tomato Leaf Curl Virus (ToLCV / Parna Kunchan)",
        "pathogen_type": "Viral (Transmitted by Whitefly Bemisia tabaci)",
        "pathogen_name": "Tomato leaf curl New Delhi virus (ToLCNDV)",
        "symptoms": "Severe upward and inward curling, puckering, and crinkling of leaves. Veins thicken and leaves become leathery, pale yellow, and reduced in size. Plants severely stunted, forming a bushy rosette; flowers drop without setting fruit.",
        "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 36.0, "min_humidity": 40.0, "cloudy_rain": False},
        "biological_cures": [
            "Install Yellow Sticky Traps @ 25-30 traps/acre to mass-trap whitefly vectors.",
            "Spray 5% Neem Seed Kernel Extract (NSKE) or Azadirachtin 10000 ppm @ 2 ml/L at nursery stage.",
            "Spray entomopathogenic fungus Beauveria bassiana @ 5 g/L to parasitise whitefly nymphs."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Diafenthiuron 50% WP (Pegasus)",
                "dosage": "1.2 g / liter water",
                "application": "Knocks down both adult whiteflies and nymphs on the undersides of leaves."
            },
            {
                "active_ingredient": "Spiromesifen 22.9% SC (Oberon)",
                "dosage": "1.0 ml / liter water",
                "application": "Lipid biosynthesis inhibitor targeting whitefly eggs and nymphs."
            },
            {
                "active_ingredient": "Thiamethoxam 25% WG (Actara) OR Acetamiprid 20% SP",
                "dosage": "0.4 g / liter water",
                "application": "Systemic neonicotinoid spray for rapid vector suppression."
            }
        ],
        "preventative_measures": [
            "Grow nursery seedlings under 40-mesh insect-proof nylon net tunnels.",
            "Plant 2-3 border rows of tall barrier crops like Maize, Sorghum, or Bajra around tomato plots.",
            "Uproot and bury rogue virus-infected plants immediately to prevent whiteflies spreading virus to neighbors."
        ]
    },
    {
        "id": "tomato_bacterial_wilt",
        "crop": "tomato",
        "name": "Bacterial Wilt of Tomato (Ukhata Rog)",
        "pathogen_type": "Bacterial",
        "pathogen_name": "Ralstonia solanacearum",
        "symptoms": "Rapid, sudden, and irreversible wilting of the whole plant while foliage remains completely green (no prior yellowing). In diagnostic stem-ooze test, a cut stem dipped in a clear glass of water releases thick, white cloudy bacterial threads streaming downward.",
        "weather_risk_triggers": {"min_temp": 28.0, "max_temp": 38.0, "min_humidity": 80.0, "cloudy_rain": True},
        "biological_cures": [
            "Seedling root dip in Pseudomonas fluorescens suspension (20 g/L) for 30 minutes before transplanting.",
            "Soil application of Trichoderma viride enriched neem cake (250 kg/acre).",
            "Crop rotation with marigold (Tagetes erecta) which exudes bactericidal and nematicidal root secretions."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Copper Oxychloride 50% WP (Blitox) + Streptocycline",
                "dosage": "3.0 g / L Blitox + 0.1 g / L Streptocycline",
                "application": "Soil drenching around plant root zone (150-200 ml solution per plant)."
            }
        ],
        "preventative_measures": [
            "Raise soil pH with agricultural lime if soil is acidic; Ralstonia thrives in acidic wet soils.",
            "Plant on raised beds to ensure rapid root zone drainage.",
            "Avoid root injury during hoeing and intercultural operations."
        ]
    },

    # ─── SUGARCANE ─────────────────────────────────────────────────────────────
    {
        "id": "sugarcane_red_rot",
        "crop": "sugarcane",
        "name": "Red Rot of Sugarcane (Ganne Ka Lal Sadand)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Colletotrichum falcatum",
        "symptoms": "Upper leaves (3rd and 4th) turn yellow, wither, and dry from tip downwards. When the cane stalk is split longitudinally, the internal pith tissue shows bright red discoloration interspersed with diagnostic white transverse patches across the stalk, accompanied by a sour, alcoholic fermentation odor.",
        "weather_risk_triggers": {"min_temp": 28.0, "max_temp": 36.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Sett treatment by dipping seed cane in Trichoderma harzianum suspension (10 g/L) for 20 minutes before planting.",
            "Apply Trichoderma-enriched pressmud (sugar mill organic cake @ 5 t/ha) in planting furrows."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Carbendazim 50% WP (Bavistin)",
                "dosage": "1.0 g / liter water (0.1% solution)",
                "application": "Dip cane setts for 15 minutes prior to planting in furrows."
            },
            {
                "active_ingredient": "Hot Water Treatment (HWT)",
                "dosage": "Physical heat treatment at 50°C for 2 hours or moist hot air (54°C for 2.5 hrs)",
                "application": "Standard sugar mill nursery practice for foundation seed cane."
            }
        ],
        "preventative_measures": [
            "Strictly avoid ratooning an infected sugarcane crop; plow out roots and burn crop residues.",
            "Plant red-rot resistant varieties recommended by ICAR-SBI (e.g. Co 0238 substitutes: Co 15023, Co 0118, CoLK 14201).",
            "Ensure field does not suffer from waterlogging during monsoon."
        ]
    },

    # ─── COTTON ────────────────────────────────────────────────────────────────
    {
        "id": "cotton_pink_bollworm",
        "crop": "cotton",
        "name": "Pink Bollworm of Cotton (Gulabi Sundi)",
        "pathogen_type": "Insect Pest",
        "pathogen_name": "Pectinophora gossypiella",
        "symptoms": "Larvae bore into flower buds, causing 'rosetted flowers' that fail to open properly. Young larvae bore into developing green bolls, closing entry holes behind them. Inside bolls, larvae eat developing seeds, stain lint brown, and cause bolls to rot or open prematurely.",
        "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 34.0, "min_humidity": 65.0, "cloudy_rain": False},
        "biological_cures": [
            "Install Pheromone Traps (Pectino-lure) @ 8-10 traps/acre for pest monitoring and mating disruption.",
            "Release egg parasitoid Trichogramma bactrae @ 60,000 parasitoids/acre at weekly intervals from 45 DAS.",
            "Spray Neem formulation (Azadirachtin 5% @ 1.5 ml/L) at early square formation."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Profenofos 50% EC (Curacron)",
                "dosage": "2.0 ml / liter water (400 ml/acre)",
                "application": "Ovicidal and larvicidal spray during evening hours when adult moths are active."
            },
            {
                "active_ingredient": "Chlorantraniliprole 18.5% SC (Coragen)",
                "dosage": "0.35 ml / liter water (70 ml in 200 L water/acre)",
                "application": "Highly effective ryanodine receptor activator providing long-lasting boll protection."
            },
            {
                "active_ingredient": "Emamectin Benzoate 5% SG (Proclaim)",
                "dosage": "0.5 g / liter water (100 g/acre)",
                "application": "Translaminar micro-dosed spray targeting bollworm larvae."
            }
        ],
        "preventative_measures": [
            "Do not extend cotton crop beyond December (terminate crop after 150-160 days); avoiding ratoon prevents carry-over of diapausing larvae.",
            "Deep summer plowing exposes diapausing larvae to predatory birds and summer solar heat."
        ]
    },

    # ─── MUSTARD ───────────────────────────────────────────────────────────────
    {
        "id": "mustard_white_rust",
        "crop": "mustard",
        "name": "White Rust / Blister of Mustard (Safed Ratawa)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Albugo candida",
        "symptoms": "Prominent creamy white or light yellow raised blisters/pustules on the lower surface of leaves. Hypertrophy and malformation of floral inflorescence forming swollen, twisted, sterile structures called 'Staghead' which produce zero seeds.",
        "weather_risk_triggers": {"min_temp": 12.0, "max_temp": 20.0, "min_humidity": 80.0, "cloudy_rain": True},
        "biological_cures": [
            "Seed treatment with Trichoderma viride @ 10 g/kg seed.",
            "Spray 10% aqueous bulb extract of Garlic (Allium sativum) which has powerful antifungal allicin."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)",
                "dosage": "2.0 g / liter water",
                "application": "Spray at initial appearance of leaf blisters and repeat at flowering if foggy weather persists."
            },
            {
                "active_ingredient": "Mancozeb 75% WP",
                "dosage": "2.5 g / liter water",
                "application": "Contact preventative spray on leaves and floral racemes."
            }
        ],
        "preventative_measures": [
            "Sow mustard early (between October 10 and October 25) to escape white rust and aphid peaks in December-January.",
            "Collect and burn floral stagheads to arrest primary oospore return to the soil."
        ]
    },
    {
        "id": "mustard_aphids",
        "crop": "mustard",
        "name": "Mustard Aphids (Mahu / Chepa)",
        "pathogen_type": "Insect Pest",
        "pathogen_name": "Lipaphis erysimi",
        "symptoms": "Hundreds of tiny greenish-yellow soft-bodied insects congregate on tender shoots, inflorescences, and pods. Sucking cell sap leads to curled leaves, stunted plants, and blighted pods. Aphids excrete sticky honeydew attracting black sooty mold.",
        "weather_risk_triggers": {"min_temp": 12.0, "max_temp": 22.0, "min_humidity": 70.0, "cloudy_rain": True},
        "biological_cures": [
            "Conserve natural predators: Ladybird beetles (Coccinella septempunctata) and Syrphid fly larvae.",
            "Spray Neem oil (3000 ppm) @ 5 ml/L water or 5% NSKE.",
            "Install Yellow Sticky Traps @ 20 traps/acre."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Dimethoate 30% EC (Rogor) OR Oxydemeton-methyl 25% EC (Metasystox)",
                "dosage": "1.5 ml / liter water (300 ml/acre)",
                "application": "Spray when Economic Threshold Level (ETL) exceeds 25-30 aphids per 10 cm central twig."
            },
            {
                "active_ingredient": "Thiamethoxam 25% WG",
                "dosage": "0.4 g / liter water",
                "application": "Systemic neonicotinoid providing rapid knockdown."
            }
        ],
        "preventative_measures": [
            "Spray in afternoon/evening hours (after 3 PM) to prevent harming foraging honeybees pollinating mustard.",
            "Avoid excessive nitrogen fertilization which creates succulent vegetative growth attractive to aphids."
        ]
    },

    # ─── GROUNDNUT ─────────────────────────────────────────────────────────────
    {
        "id": "groundnut_tikka",
        "crop": "groundnut",
        "name": "Tikka Disease / Leaf Spot of Groundnut (Tikka Rog)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Cercospora arachidicola (Early) & Phaeoisariopsis personata (Late)",
        "symptoms": "Early leaf spot produces circular reddish-brown spots with prominent bright yellow halos. Late leaf spot produces smaller, dark brown to black spots mostly on lower leaf surface without prominent yellow halos. Causes premature defoliation, leaving bare stalks with underdeveloped pods.",
        "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 32.0, "min_humidity": 80.0, "cloudy_rain": True},
        "biological_cures": [
            "Seed treatment with Trichoderma harzianum @ 10 g/kg seed.",
            "Foliar spray of fermented neem seed leaf extract (5%) + raw cow milk (10%) as a natural spore germination inhibitor."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Hexaconazole 5% EC (Contaf)",
                "dosage": "2.0 ml / liter water",
                "application": "Foliar spray at 35 and 50 DAS (days after sowing) controls both Tikka and groundnut rust."
            },
            {
                "active_ingredient": "Carbendazim 12% + Mancozeb 63% WP (Saaf)",
                "dosage": "2.0 g / liter water",
                "application": "Dual systemic and contact protection."
            },
            {
                "active_ingredient": "Tebuconazole 25.9% EC (Folicur)",
                "dosage": "1.0 ml / liter water",
                "application": "Excellent curative eradication of Cercospora mycelium."
            }
        ],
        "preventative_measures": [
            "Incorporate crop residues deeply into soil using moldboard plow to bury fungal perennating bodies.",
            "Practice intercropping with Bajra or Redgram (6:1 ratio) to physically break fungal spore transit."
        ]
    },

    # ─── SOYBEAN ───────────────────────────────────────────────────────────────
    {
        "id": "soybean_yellow_mosaic",
        "crop": "soybean",
        "name": "Yellow Mosaic Virus of Soybean (Peela Mojek Rog)",
        "pathogen_type": "Viral (Transmitted by Whitefly Bemisia tabaci)",
        "pathogen_name": "Mungbean yellow mosaic India virus (MYMIV)",
        "symptoms": "Alternate bright yellow and dark green patches scattered across the trifoliate leaves. Leaves become blistered, crinkled, and leathery. Pods on infected plants are small, distorted, and produce shriveled, discolored seeds.",
        "weather_risk_triggers": {"min_temp": 26.0, "max_temp": 35.0, "min_humidity": 60.0, "cloudy_rain": False},
        "biological_cures": [
            "Seed treatment with bio-agent Trichoderma viride @ 8 g/kg seed.",
            "Install Yellow Sticky Traps @ 20-25 traps/acre.",
            "Spray Neem oil 1500 ppm @ 4 ml/L water to repel vector whiteflies."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Thiamethoxam 30% FS (Cruiser)",
                "dosage": "10 ml / kg seed",
                "application": "Seed treatment prior to sowing gives 25-30 days systemic immunity against whitefly vector."
            },
            {
                "active_ingredient": "Beta-cyfluthrin + Imidacloprid (Solomon)",
                "dosage": "1.0 ml / liter water (140 ml/acre)",
                "application": "Combined systemic and contact insecticide spray upon first sighting of whiteflies."
            }
        ],
        "preventative_measures": [
            "Grow YMV-resistant soybean varieties (e.g. JS 20-34, JS 20-69, JS 20-98, NRC 37).",
            "Uproot and destroy stray infected plants within first 3 weeks of germination."
        ]
    },

    # ─── MAIZE ─────────────────────────────────────────────────────────────────
    {
        "id": "maize_fall_armyworm",
        "crop": "maize",
        "name": "Fall Armyworm (FAW / Sainik Keet)",
        "pathogen_type": "Insect Pest",
        "pathogen_name": "Spodoptera frugiperda",
        "symptoms": "Young larvae scrape leaf epidermis creating 'window panes'. Older larvae bore deep into the central plant whorl, producing massive ragged holes and large amounts of sawdust-like fecal frass (droppings). Feeding destroys the central growing shoot (dead heart).",
        "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 34.0, "min_humidity": 60.0, "cloudy_rain": False},
        "biological_cures": [
            "Whorl application of dry sand mixed with neem cake (9:1 ratio) or wood ash into central whorls.",
            "Foliar spray of entomopathogenic fungus Metarhizium anisopliae or Nomuraea rileyi @ 5 g/L.",
            "Release egg parasitoid Trichogramma chilonis @ 50,000/acre."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Chlorantraniliprole 18.5% SC (Coragen)",
                "dosage": "0.4 ml / liter water (directed strictly into the central leaf whorls)",
                "application": "Spray early at 8-15 days stage before larvae penetrate deep inside."
            },
            {
                "active_ingredient": "Spinetoram 11.7% SC (Delegate)",
                "dosage": "0.5 ml / liter water",
                "application": "Broad-spectrum neurotoxin of biological origin with stellar efficacy against caterpillars."
            },
            {
                "active_ingredient": "Emamectin Benzoate 5% SG",
                "dosage": "0.5 g / liter water",
                "application": "Direct nozzle right into the funnel of each maize plant."
            }
        ],
        "preventative_measures": [
            "Erect pheromone traps @ 5 traps/acre right from seedling emergence.",
            "Intercrop maize with cowpea, pigeonpea, or desmodium which naturally repels armyworm moths."
        ]
    },

    # ─── ONION & GARLIC ────────────────────────────────────────────────────────
    {
        "id": "onion_purple_blotch",
        "crop": "onion",
        "name": "Purple Blotch of Onion & Garlic (Baingani Dhabba)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Alternaria porri",
        "symptoms": "Small, water-soaked lesions that quickly develop into sunken, purplish-brown elliptical spots surrounded by a pale yellow halo. Leaves turn yellow, collapse, and break at the lesion point. In seed crops, flower stalks girdled and snap easily.",
        "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 30.0, "min_humidity": 80.0, "cloudy_rain": True},
        "biological_cures": [
            "Seed treatment and bulb dip in Trichoderma viride suspension (10 g/L).",
            "Spray with crude neem seed extract (5%) mixed with agricultural surfactant sticker."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Difenoconazole 25% EC (Score)",
                "dosage": "0.6 ml / liter water (always add 0.5 ml non-ionic wetting sticker like Sandovit per liter)",
                "application": "Sticker is mandatory because onion leaves are waxy and chemical rolls off."
            },
            {
                "active_ingredient": "Mancozeb 75% WP",
                "dosage": "2.5 g / liter water + sticker",
                "application": "Prophylactic spray prior to bulb initiation."
            },
            {
                "active_ingredient": "Tebuconazole 50% + Trifloxystrobin 25% WG (Nativo)",
                "dosage": "0.7 g / liter water",
                "application": "Exceptional systemic cure on both foliage and floral scapes."
            }
        ],
        "preventative_measures": [
            "Do not exceed nitrogen doses after 45 days after transplanting (softens neck tissues).",
            "Stop irrigation 10-15 days before harvesting to allow necks to dry and seal properly."
        ]
    },

    # ─── CHILLI ────────────────────────────────────────────────────────────────
    {
        "id": "chilli_anthracnose",
        "crop": "chilli",
        "name": "Anthracnose / Fruit Rot / Die-Back of Chilli (Phal Sadand)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Colletotrichum capsici",
        "symptoms": "Die-back appears as drying of twigs from tip downwards; twigs turn bleached greyish-white. On ripe red fruits, circular sunken lesions develop with concentric rings of black fungal acervuli (dots), causing pods to rot, turn straw-colored, and fall off.",
        "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 32.0, "min_humidity": 80.0, "cloudy_rain": True},
        "biological_cures": [
            "Seed treatment with Trichoderma viride @ 10 g/kg seed.",
            "Foliar spray of Pseudomonas fluorescens @ 2 g/L during fruit set."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Azoxystrobin 23% SC (Amistar)",
                "dosage": "1.0 ml / liter water",
                "application": "Strobilurin fungicide spray when red fruit development begins."
            },
            {
                "active_ingredient": "Copper Oxychloride 50% WP (Blitox)",
                "dosage": "3.0 g / liter water",
                "application": "Contact copper spray protecting twigs from die-back infection."
            },
            {
                "active_ingredient": "Propiconazole 25% EC",
                "dosage": "1.0 ml / liter water",
                "application": "Curative spray arresting mycelial advance."
            }
        ],
        "preventative_measures": [
            "Never collect seeds from fruits showing sunken black rot lesions.",
            "Maintain wide ridge spacing and prune lower ground-touching foliage to improve aeration."
        ]
    },

    # ─── GINGER & TURMERIC ─────────────────────────────────────────────────────
    {
        "id": "ginger_rhizome_rot",
        "crop": "ginger",
        "name": "Soft Rot / Rhizome Rot of Ginger & Turmeric (Gath Sadand)",
        "pathogen_type": "Oomycete / Fungal",
        "pathogen_name": "Pythium aphanidermatum / Pythium myriotylum",
        "symptoms": "Water-soaked lesions appear on the collar region of pseudostems at ground level. Lower leaves turn pale yellow, progressing to upper leaves. Pseudostems easily pull out from rhizomes with a foul rotting smell. Infected rhizomes become soft, water-soaked, and rot into a pulpy mush.",
        "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 34.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Seed rhizome treatment: Soak seed rhizomes in Trichoderma harzianum suspension (10 g/L) for 30 minutes before planting.",
            "Apply Trichoderma-enriched neem cake (100 kg/acre) in raised beds.",
            "Mulch heavily with green forest leaves (10 tons/ha) to suppress soil-borne oospores."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)",
                "dosage": "2.5 g / liter water",
                "application": "Soil drenching around beds and clumps (300-500 ml per plant cluster) at first sign of yellowing."
            },
            {
                "active_ingredient": "Copper Oxychloride 50% WP",
                "dosage": "3.0 g / liter water",
                "application": "Drenching beds to arrest secondary bacterial soft rot."
            }
        ],
        "preventative_measures": [
            "Plant strictly on raised beds (15-20 cm high, 1 meter wide) with deep drainage channels between beds.",
            "Provide zero standing water; Pythium zoospores swim in standing water to infect healthy rhizomes in hours."
        ]
    },

    # ─── BANANA ────────────────────────────────────────────────────────────────
    {
        "id": "banana_sigatoka",
        "crop": "banana",
        "name": "Sigatoka Leaf Spot of Banana (Patti Dhabba Rog)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Pseudocercospora musae (Mycosphaerella musicola)",
        "symptoms": "Tiny yellowish-green streaks on leaves, enlarging into linear spindle-shaped spots with dark brown to black borders and light greyish centers. Spots coalesce, causing extensive premature leaf scorch and drying. Reduces bunch weight and causes premature uneven fruit ripening.",
        "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 32.0, "min_humidity": 80.0, "cloudy_rain": True},
        "biological_cures": [
            "Foliar spray of mineral oil (Banana spray oil @ 10 ml/L) which inhibits fungal ascospore penetration.",
            "Spray Pseudomonas fluorescens (0.2%) + neem oil (3 ml/L)."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Propiconazole 25% EC (Tilt)",
                "dosage": "1.0 ml / liter water + 10 ml mineral oil/L",
                "application": "Spray on both upper and lower leaf surfaces."
            },
            {
                "active_ingredient": "Trifloxystrobin 25% + Tebuconazole 50% WG (Nativo)",
                "dosage": "0.6 g / liter water",
                "application": "High-potency systemic cure preserving green leaf canopy."
            }
        ],
        "preventative_measures": [
            "De-leafing: Regularly cut and burn severely infected, dead leaf tissue.",
            "Maintain optimal drainage to prevent humid microclimates inside the plantation canopy."
        ]
    },

    # ─── APPLE ─────────────────────────────────────────────────────────────────
    {
        "id": "apple_scab",
        "crop": "apple",
        "name": "Apple Scab (Seb Ka Scab Rog)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Venturia inaequalis",
        "symptoms": "Olive-green, velvety, circular spots on leaves that turn dark brown to black and leathery. On developing fruits, rough, corky, scabby black lesions appear. Fruit cracks, becomes distorted, and drops prematurely.",
        "weather_risk_triggers": {"min_temp": 12.0, "max_temp": 24.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Spray 5% Urea solution on fallen orchard leaves in late autumn to accelerate leaf decomposition and destroy overwintering pseudothecia.",
            "Spray Trichoderma viride (0.5%) before bud break."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Mancozeb 75% WP (Silver tip / Green tip stage)",
                "dosage": "3.0 g / liter water",
                "application": "Early spring protective spray."
            },
            {
                "active_ingredient": "Difenoconazole 25% EC (Score) OR Hexaconazole 5% EC",
                "dosage": "0.5 ml / liter water (Pink bud to petal fall stage)",
                "application": "Curative systemic triazole spray."
            },
            {
                "active_ingredient": "Dodine 65% WP",
                "dosage": "1.0 g / liter water",
                "application": "Specialist anti-scab fungicide."
            }
        ],
        "preventative_measures": [
            "Prune tree canopy annually to allow sunlight and wind penetration for quick leaf drying.",
            "Follow the state horticulture university spray schedule strictly based on ascospore maturity."
        ]
    },

    # ─── BAJRA (PEARL MILLET) ──────────────────────────────────────────────────
    {
        "id": "bajra_downy_mildew",
        "crop": "bajra",
        "name": "Downy Mildew / Green Ear Disease (Harit Bali)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Sclerospora graminicola",
        "symptoms": "Leaves show chlorotic pale-yellow streaks with white downy fungal growth on underside during humid mornings. Most diagnostic symptom is transformation of floral spikelets into twisted leafy green structures ('green ear') instead of grain.",
        "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 30.0, "min_humidity": 80.0, "cloudy_rain": True},
        "biological_cures": [
            "Seed biopriming with Trichoderma harzianum or Pseudomonas fluorescens @ 10 g/kg seed.",
            "Soil application of Trichoderma enriched FYM (50 kg FYM + 2.5 kg bio-agent/acre) at field prep.",
            "Foliar spray of 5% Neem Seed Kernel Extract (NSKE) at early tillering."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Metalaxyl-M 31.8% ES (Apron XL)",
                "dosage": "2.0 ml / kg seed",
                "application": "Mandatory systemic seed dress before sowing for absolute early downy mildew prevention."
            },
            {
                "active_ingredient": "Mancozeb 75% WP (Dithane M-45)",
                "dosage": "2.0 g / liter water (400 g in 200 L water/acre)",
                "application": "Foliar protective spray at 20 and 35 days after sowing if chlorotic streaks appear."
            },
            {
                "active_ingredient": "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)",
                "dosage": "2.0 g / liter water",
                "application": "Systemic + contact curative spray upon first observation of downy growth."
            }
        ],
        "preventative_measures": [
            "Grow downy-mildew resistant ICAR hybrids (e.g. HHB 67 Improved, MPMH 17, GHB 744, RHB 173).",
            "Rogue out and burn infected green-ear plants immediately before secondary sporangia disperse.",
            "Practice minimum 2-year crop rotation with non-cereal crops like moong or cluster bean."
        ]
    },
    {
        "id": "bajra_ergot",
        "crop": "bajra",
        "name": "Ergot of Bajra (Gondia / Chep Rog)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Claviceps fusiformis",
        "symptoms": "Droplets of sticky, amber-to-pinkish honeydew fluid ooze from spikelets during early protogynous flowering. Later, honeydew hardens into dark brown to black elongated sclerotia (fungal ergots) that replace healthy grains.",
        "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 30.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Spray baking soda (sodium bicarbonate 5 g/L) + fermented buttermilk (20 ml/L) at boot leaf stage.",
            "Foliar spray of Trichoderma viride culture filtrate (5 ml/L) during panicle emergence."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Carbendazim 50% WP (Bavistin)",
                "dosage": "1.0 g / liter water (200 g in 200 L water/acre)",
                "application": "First prophylactic spray at 5% panicle flowering; repeat 7 days later if overcast rain persists."
            },
            {
                "active_ingredient": "Ziram 27% SC",
                "dosage": "2.5 ml / liter water",
                "application": "Broad-spectrum foliar dithiocarbamate protecting florets from ascospore germination."
            }
        ],
        "preventative_measures": [
            "Salt water flotation: Immerse seed in 20% common salt solution (2 kg salt in 10 L water); discard floating ergot sclerotia.",
            "Synchronize sowing dates across the village to minimize prolonged flowering windows.",
            "Deep summer plowing to bury sclerotia deeper than 7 cm to inhibit perithecial germination."
        ]
    },

    # ─── BARLEY ────────────────────────────────────────────────────────────────
    {
        "id": "barley_covered_smut",
        "crop": "barley",
        "name": "Covered Smut of Barley (Band Kangiari)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Ustilago hordei",
        "symptoms": "Spikelets in infected earheads are converted into compact, hard black masses of smut chlamydospores encased in a silvery-grey membrane that remains intact until mechanical threshing.",
        "weather_risk_triggers": {"min_temp": 14.0, "max_temp": 22.0, "min_humidity": 60.0, "cloudy_rain": False},
        "biological_cures": [
            "Seed treatment with Trichoderma viride @ 8 g/kg seed before sowing.",
            "Bio-priming seeds with Pseudomonas fluorescens (10 g/kg) for 6 hours."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Carboxin 37.5% + Thiram 37.5% DS (Vitavax Power)",
                "dosage": "2.5 g / kg seed",
                "application": "Dry seed dressing kills externally and internally seed-borne teleutospores."
            },
            {
                "active_ingredient": "Tebuconazole 2% DS (Raxil)",
                "dosage": "1.0 g / kg seed",
                "application": "Modern triazole dry powder seed treatment offering 100% control of smuts."
            }
        ],
        "preventative_measures": [
            "Use certified smut-free seed lots from accredited university or national seed agencies.",
            "Hot water treatment (soak in cold water 4 hours, then dip in 52°C water for 10 minutes) for organic farms."
        ]
    },
    {
        "id": "barley_stripe_disease",
        "crop": "barley",
        "name": "Barley Leaf Stripe (Patti Dhaari Rog)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Drechslera graminea (Pyrenophora graminea)",
        "symptoms": "Long, continuous yellow-to-brown necrotic stripes running parallel to leaf veins from tillering stage onwards. Leaves fray, split, and shred longitudinally into ribbons; infected earheads remain sterile.",
        "weather_risk_triggers": {"min_temp": 14.0, "max_temp": 24.0, "min_humidity": 75.0, "cloudy_rain": True},
        "biological_cures": [
            "Seed coating with Trichoderma harzianum @ 10 g/kg seed.",
            "Foliar spray of cow urine extract (10% v/v) at tillering stage."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Propiconazole 25% EC (Tilt)",
                "dosage": "1.0 ml / liter water (200 ml/acre)",
                "application": "Systemic foliar spray upon observing first leaf stripe symptoms."
            },
            {
                "active_ingredient": "Azoxystrobin 23% SC",
                "dosage": "1.0 ml / liter water",
                "application": "Strobilurin broad-spectrum fungicide with strong greening effect."
            }
        ],
        "preventative_measures": [
            "Sow barley between Oct 25 and Nov 15; avoid late sowings in cold soil which enhance infection.",
            "Grow resistant cultivars like RD 2552, BH 902, PL 426, or DWRB 123."
        ]
    },

    # ─── BLACKGRAM (URAD) ──────────────────────────────────────────────────────
    {
        "id": "blackgram_mymv",
        "crop": "blackgram",
        "name": "Yellow Mosaic Virus (MYMV - Peeli Patti)",
        "pathogen_type": "Viral",
        "pathogen_name": "Mungbean Yellow Mosaic Virus (Vector: Bemisia tabaci)",
        "symptoms": "Bright yellow chlorotic specks along small veins on young trifoliate leaves, quickly merging into full golden-yellow patches. Plants become severely stunted; pods are small, curled upward with shriveled seeds.",
        "weather_risk_triggers": {"min_temp": 26.0, "max_temp": 37.0, "min_humidity": 55.0, "cloudy_rain": False},
        "biological_cures": [
            "Install yellow sticky traps @ 15-20 traps/acre to trap and monitor whitefly vector populations.",
            "Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or 10,000 ppm Neem Oil @ 2 ml/L at 15 DAS.",
            "Foliar spray of entomopathogenic fungus Beauveria bassiana @ 5 g/L to parasitise whitefly nymphs."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Thiamethoxam 25% WG (Actara)",
                "dosage": "0.3 g / liter water (40-50 g/acre)",
                "application": "Target underside of leaves at 15 and 30 DAS to eliminate sap-sucking whitefly vectors."
            },
            {
                "active_ingredient": "Diafenthiuron 50% WP (Pegasus)",
                "dosage": "1.25 g / liter water",
                "application": "Excellent translaminar insecticide against resistant whitefly nymph populations."
            },
            {
                "active_ingredient": "Imidacloprid 17.8% SL (Confidor)",
                "dosage": "0.4 ml / liter water",
                "application": "Systemic protection restricting viral vector transmission."
            }
        ],
        "preventative_measures": [
            "Grow MYMV-resistant ICAR varieties (e.g. Pant U-31, Shekhar 2, Uttara, VBN 8, Mash 114).",
            "Mandatory seed dress with Imidacloprid 600 FS (5 ml/kg seed) to guarantee 30-day early vector immunity.",
            "Rogue out and bury early infected virus-reservoir plants within the first 25 days."
        ]
    },
    {
        "id": "blackgram_powdery_mildew",
        "crop": "blackgram",
        "name": "Powdery Mildew of Blackgram (Chhachhia)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Erysiphe polygoni",
        "symptoms": "White flour-like powdery patches on upper leaf surfaces, petioles, and developing pods. Leaves turn dull brownish, curl, dry, and fall prematurely, causing substantial yield reduction.",
        "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 28.0, "min_humidity": 75.0, "cloudy_rain": False},
        "biological_cures": [
            "Foliar spray of Ampelomyces quisqualis (hyper-parasitic bio-agent) @ 5 g/L.",
            "Foliar spray of sulfur-rich wood ash suspension (50 g/L) or diluted buttermilk (50 ml/L)."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Wettable Sulfur 80% WP (Sulfex)",
                "dosage": "2.5 g / liter water (500 g in 200 L water/acre)",
                "application": "Spray thoroughly at first appearance of white powdery flecks; repeat after 10 days."
            },
            {
                "active_ingredient": "Hexaconazole 5% EC (Contaf)",
                "dosage": "1.5 ml / liter water",
                "application": "Systemic triazole providing complete eradication of established powdery mycelium."
            }
        ],
        "preventative_measures": [
            "Avoid dense planting; maintain proper line spacing (30 x 10 cm) for air flow.",
            "Destroy weed hosts like Trianthema portulacastrum that harbor overwintering cleistothecia."
        ]
    },

    # ─── CHICKPEA (GRAM / CHANA) ───────────────────────────────────────────────
    {
        "id": "chickpea_fusarium_wilt",
        "crop": "chickpea",
        "name": "Fusarium Wilt of Chickpea (Chana Ukhta Rog)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Fusarium oxysporum f. sp. ciceris",
        "symptoms": "Sudden drooping of petioles, leaves, and rachis without conspicuous yellowing. Lower leaves turn dull grey-green and dry. Vertical splitting of the root shows pronounced dark brown to black xylem vascular pith discoloration.",
        "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 30.0, "min_humidity": 60.0, "cloudy_rain": False},
        "biological_cures": [
            "Seed treatment with Trichoderma asperellum @ 10 g/kg seed + Pseudomonas fluorescens @ 10 g/kg.",
            "Soil application of Trichoderma enriched compost (100 kg FYM + 4 kg Trichoderma/acre) at sowing."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Carbendazim 12% + Mancozeb 63% WP (SAAF)",
                "dosage": "2.5 g / kg seed",
                "application": "Seed treatment prior to sowing to establish protective fungicidal barrier around root zone."
            },
            {
                "active_ingredient": "Thiophanate Methyl 70% WP (Roko)",
                "dosage": "1.5 g / liter water",
                "application": "Drench root zone of plants surrounding wilted patches to restrict fungal spreading."
            }
        ],
        "preventative_measures": [
            "Sow chickpea varieties genetically resistant to Fusarium wilt (e.g. JG 11, JAKI 9218, Digvijay, Pusa 372).",
            "Avoid early sowing when soil temperatures exceed 28°C; sow in late October/early November.",
            "Adopt 3-year crop rotation with non-host cereals like sorghum, pearl millet, or wheat."
        ]
    },
    {
        "id": "chickpea_pod_borer",
        "crop": "chickpea",
        "name": "Gram Pod Borer (Chana Sundi / Caterpillar)",
        "pathogen_type": "Insect Pest",
        "pathogen_name": "Helicoverpa armigera",
        "symptoms": "Larvae feed on tender leaves during early growth, then bore neat circular holes into developing chickpea pods and devour inner developing seeds while thrusting the front half of their body inside.",
        "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 32.0, "min_humidity": 50.0, "cloudy_rain": False},
        "biological_cures": [
            "Install Helicoverpa pheromone traps (Helilure) @ 5 traps/acre for pest monitoring and mating disruption.",
            "Set up 'T'-shaped bird perches @ 20/acre to encourage predatory birds (black drongos, mynas).",
            "Foliar spray of HaNPV (Helicoverpa Nuclear Polyhedrosis Virus) @ 250 LE/acre (1.5 ml/L).",
            "Spray Bacillus thuringiensis (Bt) @ 2.0 g/L or 5% NSKE at flowering."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Chlorantraniliprole 18.5% SC (Coragen)",
                "dosage": "0.3 ml / liter water (60 ml in 200 L water/acre)",
                "application": "Spray when 1 larva per meter row length (ETL) is spotted; offers 21-day residual pod protection."
            },
            {
                "active_ingredient": "Emamectin Benzoate 5% SG (Proclaim)",
                "dosage": "0.5 g / liter water (100 g/acre)",
                "application": "Rapid translaminar action causing immediate feeding cessation of active larvae."
            },
            {
                "active_ingredient": "Indoxacarb 14.5% SC",
                "dosage": "1.0 ml / liter water",
                "application": "Target early instar larvae at podding stage."
            }
        ],
        "preventative_measures": [
            "Intercrop chickpea with coriander or mustard (4:1 ratio) to augment natural parasitoids (Campoletis chlorideae).",
            "Deep summer plowing to expose resting pupae to predatory birds and solar heat."
        ]
    },

    # ─── COCONUT ───────────────────────────────────────────────────────────────
    {
        "id": "coconut_bud_rot",
        "crop": "coconut",
        "name": "Bud Rot of Coconut (Kavathu Rog)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Phytophthora palmivora",
        "symptoms": "Youngest central spindle leaf loses turgidity, turns pale yellow, and bends over. Base of tender central fronds rots into a foul-smelling soft slime, easily pulling out by hand. Fatal if untreated.",
        "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 30.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Trichoderma harzianum cake placement in the leaf axils of the crown before monsoon onset.",
            "Apply Pseudomonas fluorescens (50 g in 500 ml water) into the palm crown once a month."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Bordeaux Paste (1%) or Copper Oxychloride 50% WP",
                "dosage": "10 g per liter water",
                "application": "Clean all rotted tissues from the crown; apply thick paste to the exposed bud tissue."
            },
            {
                "active_ingredient": "Potassium Phosphonate (Akomin / Phyto-Fos)",
                "dosage": "3.0 ml / liter water (or trunk injection 10 ml/palm)",
                "application": "Systemic systemic protection inducing host plant systemic resistance."
            }
        ],
        "preventative_measures": [
            "Prophylactic crown cleaning and placement of 2 perforated Mancozeb sachet packets (5 g each) in leaf axils before Southwest monsoon.",
            "Ensure good plantation drainage to prevent waterlogging around palm roots."
        ]
    },
    {
        "id": "coconut_rhinoceros_beetle",
        "crop": "coconut",
        "name": "Rhinoceros Beetle (Kombu Chelli)",
        "pathogen_type": "Insect Pest",
        "pathogen_name": "Oryctes rhinoceros",
        "symptoms": "Adult beetle bores into unopened central spindle leaves, resulting in geometric V-shaped or fan-shaped scissor-cut notches on expanded fronds. Chewed fiber mass pushed out of crown bore holes.",
        "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 35.0, "min_humidity": 70.0, "cloudy_rain": False},
        "biological_cures": [
            "Release Oryctes baculovirus infected beetles @ 10-15 beetles/hectare for biological pathogen transmission.",
            "Treat farmyard manure pits with Metarhizium anisopliae (green muscardine fungus) @ 50 g/m³ manure.",
            "Install Rhinolure pheromone traps @ 2 traps per acre."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Chlorantraniliprole 0.4% G or Naphthalene Balls",
                "dosage": "Apply 3-4 naphthalene balls (approx 10.5 g) mixed with equal volume sand in topmost 3 leaf axils.",
                "application": "Acts as powerful repellent preventing adult beetles from boring into bud tissues."
            }
        ],
        "preventative_measures": [
            "Clean palm crowns twice a year; extract beetles from crown holes using an iron hook.",
            "Avoid keeping open rotting compost or manure heaps near the coconut plantation without bio-treatment."
        ]
    },

    # ─── COFFEE ────────────────────────────────────────────────────────────────
    {
        "id": "coffee_leaf_rust",
        "crop": "coffee",
        "name": "Coffee Leaf Rust (Roya / Gerua)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Hemileia vastatrix",
        "symptoms": "Yellow-orange powdery circular spots on the lower leaf surface, releasing powdery urediniospores. Corresponding upper leaf surface shows pale yellow chlorotic spots. Premature leaf defoliation leads to dieback of bearing wood.",
        "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 28.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Foliar spray of Lecanicillium lecanii (hyper-parasite of rust fungi) @ 5 g/L during monsoon.",
            "Bio-spray with Bacillus subtilis (2.5 g/L) before monsoon showers."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Bordeaux Mixture 0.5%",
                "dosage": "5 kg Copper Sulphate + 5 kg Lime in 1000 L water/ha",
                "application": "Mandatory pre-monsoon spray (May-June) followed by post-monsoon spray (September-October)."
            },
            {
                "active_ingredient": "Hexaconazole 5% EC (Contaf)",
                "dosage": "2.0 ml / liter water",
                "application": "Curative systemic spray for severe post-monsoon rust breakout."
            },
            {
                "active_ingredient": "Pyraclostrobin 20% WG",
                "dosage": "1.0 g / liter water",
                "application": "High-efficiency strobilurin fungicide preventing spore germination."
            }
        ],
        "preventative_measures": [
            "Maintain optimal shade canopy (40-50% filtered sunlight) by two-tier shade tree lopping (Dhadhap / Silver Oak).",
            "Grow rust-resistant Arabica selections (e.g. S.795, Chandragiri, Selection 9, SLN 5B)."
        ]
    },
    {
        "id": "coffee_berry_borer",
        "crop": "coffee",
        "name": "Coffee Berry Borer (CBB)",
        "pathogen_type": "Insect Pest",
        "pathogen_name": "Hypothenemus hampei",
        "symptoms": "Tiny pinholes (approx 1 mm) bored into the navel/apical disc of developing green and ripe coffee berries. Female beetles bore tunnels inside the coffee seed, causing bean powdering and berry drop.",
        "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 30.0, "min_humidity": 75.0, "cloudy_rain": False},
        "biological_cures": [
            "Foliar spray of white muscardine fungus Beauveria bassiana @ 5 g/L during berry development.",
            "Install Brocap / ethanol-methanol (1:1) attractant traps @ 20 traps/acre."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Cyantraniliprole 10.26% OD",
                "dosage": "1.2 ml / liter water",
                "application": "Spray berries thoroughly when beetle flight activity peaks."
            }
        ],
        "preventative_measures": [
            "Maintain clean harvest (gleaning): pick every dropped berry from the plantation floor ('strip picking').",
            "Boil or destroy infested gleanings to eradicate overwintering beetle brood reservoirs."
        ]
    },

    # ─── GARLIC ────────────────────────────────────────────────────────────────
    {
        "id": "garlic_purple_blotch",
        "crop": "garlic",
        "name": "Purple Blotch of Garlic (Baingani Dhabba)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Alternaria porri",
        "symptoms": "Small sunken water-soaked lesions that rapidly turn purple to purplish-brown with yellow borders on flat leaves and seed scapes. Lesions coalesce causing leaf tips to wither, snap, and dry up.",
        "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 30.0, "min_humidity": 80.0, "cloudy_rain": True},
        "biological_cures": [
            "Seed bulb clove dip in Trichoderma viride suspension @ 10 g/L for 30 minutes.",
            "Foliar spray of Pseudomonas fluorescens (2 g/L) + 5% NSKE at 30 and 45 days after planting."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Difenoconazole 25% EC (Score)",
                "dosage": "1.0 ml / liter water (200 ml in 200 L water/acre)",
                "application": "Spray at first appearance of purple flecks; repeat after 12 days."
            },
            {
                "active_ingredient": "Mancozeb 75% WP + sticker (Triton / Sandovit)",
                "dosage": "2.5 g / liter water + 0.5 ml sticker/L",
                "application": "Crucial to mix agricultural sticker because waxy garlic leaves shed plain spray droplets."
            },
            {
                "active_ingredient": "Tebuconazole 50% + Trifloxystrobin 25% WG (Nativo)",
                "dosage": "0.7 g / liter water",
                "application": "Superior systemic curative control halting lesion expansion."
            }
        ],
        "preventative_measures": [
            "Ensure proper raised-bed planting with furrow drainage; avoid standing irrigation water.",
            "Space cloves 15 x 10 cm to permit rapid canopy drying between irrigations."
        ]
    },
    {
        "id": "garlic_thrips",
        "crop": "garlic",
        "name": "Garlic Thrips (Joon / Churda Murda)",
        "pathogen_type": "Insect Pest",
        "pathogen_name": "Thrips tabaci",
        "symptoms": "Minute yellowish-brown nymphs rasp leaf epidermal tissue, sucking cellular sap. Leaves display silvery-white speckles, patches, and crinkled curled leaf tips that dry up from top to bottom.",
        "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 34.0, "min_humidity": 50.0, "cloudy_rain": False},
        "biological_cures": [
            "Install blue sticky traps @ 20-25 traps/acre (thrips are intensely attracted to blue).",
            "Foliar spray of Lecanicillium lecanii @ 5 g/L during evening hours.",
            "Spray 10,000 ppm Neem Oil @ 2.5 ml/L mixed with soap nut solution."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Fipronil 5% SC (Regent)",
                "dosage": "2.0 ml / liter water",
                "application": "Translaminar and contact insecticide targeting thrips tucked inside leaf sheaths."
            },
            {
                "active_ingredient": "Spinetoram 11.7% SC (Delegate)",
                "dosage": "0.9 ml / liter water",
                "application": "Highly effective new-generation spinosyn insecticide with rapid knockdown."
            }
        ],
        "preventative_measures": [
            "Use sprinkler or micro-jet irrigation; overhead water droplets knock thrips off the plants.",
            "Destroy alternative weed hosts like parthenium and wild grasses surrounding field borders."
        ]
    },

    # ─── GRAPES ────────────────────────────────────────────────────────────────
    {
        "id": "grapes_downy_mildew",
        "crop": "grapes",
        "name": "Downy Mildew of Grapes (Kewda Rog)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Plasmopara viticola",
        "symptoms": "Translucent yellowish 'oil spots' on upper leaf surface, with dense white cottony down of sporangiophores on the lower leaf surface. Berries turn dull greyish-brown, shrivel, and dry into 'leather berries'.",
        "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 28.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Foliar spray of Trichoderma harzianum or Bacillus subtilis @ 3 g/L.",
            "Prophylactic foliar spray of seaweed extract and fermented whey to thicken cuticle."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Dimethomorph 50% WP (Acrobat)",
                "dosage": "1.0 g / liter water (200 g in 200 L water/acre)",
                "application": "Target canopy immediately during rainy cloudy spells; powerful antisporulant."
            },
            {
                "active_ingredient": "Famoxadone 16.6% + Cymoxanil 22.1% SC (Equation Pro)",
                "dosage": "1.0 ml / liter water",
                "application": "Kick-back curative action curing sub-cuticular mycelium within 48 hours of infection."
            },
            {
                "active_ingredient": "Mandipropamid 23.4% SC (Revus)",
                "dosage": "0.8 ml / liter water",
                "application": "Binds tightly to epicuticular wax layer providing waterproof protection."
            }
        ],
        "preventative_measures": [
            "Canopy management: prompt shoot thinning, leaf removal around fruit zones, and shoot positioning on trellises.",
            "Apply prophylactic 1% Bordeaux mixture post-pruning before bud break."
        ]
    },
    {
        "id": "grapes_powdery_mildew",
        "crop": "grapes",
        "name": "Powdery Mildew of Grapes (Bhoori Rog)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Uncinula necator (Erysiphe necator)",
        "symptoms": "Powdery grey-white patches on both leaf surfaces, green shoots, and young berries. Infected young berries become hardened, fail to expand, and crack open exposing inner seeds, inviting secondary rots.",
        "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 32.0, "min_humidity": 70.0, "cloudy_rain": False},
        "biological_cures": [
            "Foliar spray of Ampelomyces quisqualis (hyperparasite) @ 5 g/L.",
            "Potassium silicate (2.5 g/L) foliar spray to strengthen berry epidermal thickness."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Penconazole 10% EC (Topas)",
                "dosage": "0.5 ml / liter water",
                "application": "Highly effective systemic triazole curative spray."
            },
            {
                "active_ingredient": "Azoxystrobin 11% + Tebuconazole 18.3% SC (Custodia)",
                "dosage": "1.5 ml / liter water",
                "application": "Dual active ingredient formulation eliminating powdery mildew and anthracnose simultaneously."
            },
            {
                "active_ingredient": "Wettable Sulfur 80% WDG",
                "dosage": "2.0 g / liter water",
                "application": "Preventative multi-site contact action; avoid spraying if temperature exceeds 35°C."
            }
        ],
        "preventative_measures": [
            "Maintain open canopy on Y-trellis or Bower system to ensure maximum light interception.",
            "Begin sulfur sprays right from 3-5 leaf stage up to berry softening."
        ]
    },

    # ─── JOWAR (SORGHUM) ───────────────────────────────────────────────────────
    {
        "id": "jowar_grain_mold",
        "crop": "jowar",
        "name": "Grain Mold of Sorghum (Dana Faphund)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Curvularia lunata / Fusarium thapsinum",
        "symptoms": "Pink, grey, or black fluffy fungal colonization on maturing sorghum grains during wet, humid weather at flowering or physiological maturity. Seeds become chalky, discolored, lose viability, and carry mycotoxins.",
        "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 32.0, "min_humidity": 80.0, "cloudy_rain": True},
        "biological_cures": [
            "Bio-seed priming with Trichoderma harzianum @ 10 g/kg seed.",
            "Spray Pseudomonas fluorescens (2 g/L) at 50% flowering stage."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Propiconazole 25% EC (Tilt)",
                "dosage": "1.0 ml / liter water (200 ml/acre)",
                "application": "First prophylactic spray at flowering; second spray 10 days later if rainfall continues."
            },
            {
                "active_ingredient": "Mancozeb 75% WP",
                "dosage": "2.5 g / liter water",
                "application": "Contact protective cover preventing fungal conidial spore penetration."
            }
        ],
        "preventative_measures": [
            "Adjust sowing time so that flowering and grain-filling do not coincide with heavy monsoon rains.",
            "Grow grain-mold tolerant Sorghum hybrids (e.g. CSH 16, CSH 25, CSV 20)."
        ]
    },
    {
        "id": "jowar_shoot_fly",
        "crop": "jowar",
        "name": "Sorghum Shoot Fly (Tana Makkhi)",
        "pathogen_type": "Insect Pest",
        "pathogen_name": "Atherigona soccata",
        "symptoms": "Maggot cuts the growing tip of 1-4 week old seedlings. Central leaf whorl withers, dries up, and creates a foul-smelling 'dead heart' that easily pulls out. Plant produces excessive sterile tillers.",
        "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 35.0, "min_humidity": 60.0, "cloudy_rain": False},
        "biological_cures": [
            "Install fishmeal attractant bait traps @ 10-12 traps/acre to trap adult shoot flies.",
            "Seed treatment with Trichoderma viride + neem oil cake in furrow."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Thiamethoxam 30% FS",
                "dosage": "10 ml / kg seed",
                "application": "Seed treatment prior to sowing gives full seedling immunity against shoot fly for 30 days."
            },
            {
                "active_ingredient": "Cypermethrin 10% EC",
                "dosage": "1.5 ml / liter water",
                "application": "Spray seedlings at 7 and 14 days after emergence if untreated seed was sown."
            }
        ],
        "preventative_measures": [
            "Complete sowing within 10-15 days of monsoon onset; late-sown crops face severe shoot fly devastations.",
            "Increase seed rate by 20% and rogue out dead-heart seedlings during thinning at 2 weeks."
        ]
    },

    # ─── JUTE ──────────────────────────────────────────────────────────────────
    {
        "id": "jute_stem_rot",
        "crop": "jute",
        "name": "Stem Rot of Jute (Kand Galan)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Macrophomina phaseolina",
        "symptoms": "Depressed, brown-to-black necrotic lesions at leaf petiole nodes on the stem. Lesions expand rapidly, girdling the stem and turning the bark shredded and black. Fiber bundles decay and snap in wind.",
        "weather_risk_triggers": {"min_temp": 28.0, "max_temp": 36.0, "min_humidity": 80.0, "cloudy_rain": True},
        "biological_cures": [
            "Seed treatment with Trichoderma viride @ 10 g/kg seed.",
            "Soil application of Trichoderma enriched neem cake (100 kg/acre) during land prep."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Carbendazim 50% WP (Bavistin)",
                "dosage": "1.5 g / liter water",
                "application": "Spray foliage and stems at 45 and 60 days after sowing."
            },
            {
                "active_ingredient": "Copper Oxychloride 50% WP",
                "dosage": "3.0 g / liter water",
                "application": "Protective contact bactericidal-fungicidal drench."
            }
        ],
        "preventative_measures": [
            "Apply agricultural lime @ 1-2 tonnes/ha in acidic soils to raise pH above 6.5.",
            "Ensure balanced potash (MOP) fertilization to strengthen bast fiber cell wall resistance."
        ]
    },

    # ─── KIDNEYBEANS (RAJMA) ───────────────────────────────────────────────────
    {
        "id": "rajma_anthracnose",
        "crop": "kidneybeans",
        "name": "Anthracnose of Kidneybeans (Kala Dhabba)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Colletotrichum lindemuthianum",
        "symptoms": "Dark brick-red to purplish-brown sunken lesions along leaf veins on undersides. Pods develop circular sunken brown spots with raised reddish-brown margins and pink spore slime in moist weather.",
        "weather_risk_triggers": {"min_temp": 18.0, "max_temp": 26.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Seed treatment with Trichoderma harzianum @ 10 g/kg seed.",
            "Foliar spray of Pseudomonas fluorescens (2 g/L) at vegetative and early flowering."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Carbendazim 12% + Mancozeb 63% WP (SAAF)",
                "dosage": "2.0 g / liter water (400 g in 200 L water/acre)",
                "application": "Spray at first sign of vein lesions; repeat after 10 days."
            },
            {
                "active_ingredient": "Pyraclostrobin 20% WG",
                "dosage": "1.0 g / liter water",
                "application": "Systemic strobilurin preventing pod lesion colonization."
            }
        ],
        "preventative_measures": [
            "Use disease-free certified seeds produced in dry semi-arid regions.",
            "Avoid working in or harvesting rajma fields when leaves are wet to prevent spreading conidia."
        ]
    },
    {
        "id": "rajma_rust",
        "crop": "kidneybeans",
        "name": "Common Bean Rust of Rajma (Gerua Rog)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Uromyces appendiculatus",
        "symptoms": "Small circular reddish-brown powdery pustules on both upper and lower leaf surfaces, surrounded by chlorotic yellow halos. Severe infection causes early yellowing, foliage scorch, and defoliation.",
        "weather_risk_triggers": {"min_temp": 18.0, "max_temp": 25.0, "min_humidity": 80.0, "cloudy_rain": True},
        "biological_cures": [
            "Bio-seed priming with Trichoderma viride @ 8 g/kg seed.",
            "Spray diluted fermented sour buttermilk (50 ml/L) on foliage."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Propiconazole 25% EC (Tilt)",
                "dosage": "1.0 ml / liter water",
                "application": "Systemic triazole halting rust pustule eruption."
            },
            {
                "active_ingredient": "Wettable Sulfur 80% WP",
                "dosage": "2.5 g / liter water",
                "application": "Multi-site contact preventative fungicide."
            }
        ],
        "preventative_measures": [
            "Grow rust-tolerant rajma cultivars recommended for northern hills/plains (e.g. Shalimar Rajmash-1, HUR 15).",
            "Burn or deeply bury post-harvest bean residues."
        ]
    },

    # ─── LENTIL (MASOOR) ───────────────────────────────────────────────────────
    {
        "id": "lentil_wilt",
        "crop": "lentil",
        "name": "Fusarium Wilt of Lentil (Masoor Ukhta)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Fusarium oxysporum f. sp. lentis",
        "symptoms": "Leaves turn dull yellow and curl upward starting from bottom leaflets, followed by wilting, drooping, and sudden drying of whole plants in patches. Dark brown vascular streaking inside taproot.",
        "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 28.0, "min_humidity": 65.0, "cloudy_rain": False},
        "biological_cures": [
            "Seed treatment with Trichoderma viride @ 10 g/kg seed before sowing.",
            "Soil enrichment with Trichoderma harzianum (2 kg/acre mixed with 100 kg vermicompost)."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Carboxin 37.5% + Thiram 37.5% DS",
                "dosage": "2.5 g / kg seed",
                "application": "Mandatory seed dress prior to sowing."
            },
            {
                "active_ingredient": "Carbendazim 50% WP (Bavistin)",
                "dosage": "2.0 g / kg seed (or drench @ 1.5 g/L)",
                "application": "Protects juvenile roots against soil fungal invasion."
            }
        ],
        "preventative_measures": [
            "Plant wilt-resistant ICAR varieties (e.g. DPL 62, Pant L-4, Pant L-8, KLS 218).",
            "Avoid planting in fields with known high wilt history without at least 3-year pulse rotation."
        ]
    },
    {
        "id": "lentil_rust",
        "crop": "lentil",
        "name": "Lentil Rust (Masoor Gerua)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Uromyces viciae-fabae",
        "symptoms": "Yellowish-brown aecial pustules followed by dark brown to black telial pustules on leaves, petioles, and stems. Severely infected leaves curl, dry up, and plants present a scorched brown appearance.",
        "weather_risk_triggers": {"min_temp": 16.0, "max_temp": 24.0, "min_humidity": 80.0, "cloudy_rain": True},
        "biological_cures": [
            "Foliar spray of neem seed extract (NSKE 5%) at pre-flowering.",
            "Bio-spray with Trichoderma viride @ 5 g/L."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Hexaconazole 5% EC (Contaf)",
                "dosage": "1.5 ml / liter water (300 ml/acre)",
                "application": "Spray immediately upon first observation of orange-brown rust pustules."
            },
            {
                "active_ingredient": "Mancozeb 75% WP",
                "dosage": "2.0 g / liter water",
                "application": "Protective contact fungicide applied before anticipated rain spells."
            }
        ],
        "preventative_measures": [
            "Sow lentil early (late October to first week of November) to mature before February rust onset.",
            "Use rust-tolerant varieties like Pant L-639, DPL 15, or Narendra Masoor 1."
        ]
    },

    # ─── MANGO ─────────────────────────────────────────────────────────────────
    {
        "id": "mango_powdery_mildew",
        "crop": "mango",
        "name": "Powdery Mildew of Mango (Bhoori Rog / Chhachhia)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Oidium mangiferae",
        "symptoms": "White talcum-powder-like coating over panicles, blossom clusters, tender fruitlets, and young leaves. Infected blossoms drop off completely, leading to massive floral blast and zero fruit set.",
        "weather_risk_triggers": {"min_temp": 18.0, "max_temp": 28.0, "min_humidity": 70.0, "cloudy_rain": False},
        "biological_cures": [
            "Foliar spray of Ampelomyces quisqualis @ 5 g/L on floral panicles.",
            "Foliar spray of Potassium Bicarbonate (4 g/L) + Neem Oil (2 ml/L) at bud swell."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Hexaconazole 5% SC or Difenoconazole 25% EC",
                "dosage": "1.0 ml / liter water",
                "application": "First spray at panicle emergence (before flowers open); second spray after fruit set."
            },
            {
                "active_ingredient": "Wettable Sulfur 80% WP",
                "dosage": "2.5 g / liter water",
                "application": "Standard pre-bloom protective spray."
            },
            {
                "active_ingredient": "Tebuconazole 50% + Trifloxystrobin 25% WG (Nativo)",
                "dosage": "0.6 g / liter water",
                "application": "Dual-action systemic control of powdery mildew and anthracnose."
            }
        ],
        "preventative_measures": [
            "Prune inner criss-cross branches after harvest to allow direct sunlight penetration throughout the canopy.",
            "Avoid excessive winter irrigations that stimulate untimely vegetative flushes instead of flowering."
        ]
    },
    {
        "id": "mango_anthracnose",
        "crop": "mango",
        "name": "Anthracnose of Mango (Shyama Rog)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Colletotrichum gloeosporioides",
        "symptoms": "Dark brown to black circular spots and tear-drop stains on leaves and panicles. On ripe fruits, black sunken rotten spots appear that rapidly expand, exuding pink spore masses.",
        "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 32.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Post-harvest hot water treatment of fruits at 52°C for 5 minutes.",
            "Bio-spray with Pseudomonas fluorescens (2 g/L) on developing fruits."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Copper Oxychloride 50% WP (Blitox)",
                "dosage": "3.0 g / liter water",
                "application": "Post-pruning protective wash and pre-monsoon canopy cover."
            },
            {
                "active_ingredient": "Azoxystrobin 23% SC",
                "dosage": "1.0 ml / liter water",
                "application": "Systemic fruit surface protector applied 3 weeks before harvest."
            }
        ],
        "preventative_measures": [
            "Prune dead twigs showing 'dieback' 10 cm below infected zone; paint cut ends with Bordeaux paste.",
            "Harvest mangoes with 1 cm stalk intact to prevent sap burn which provides entry wounds for fungi."
        ]
    },
    {
        "id": "mango_hopper",
        "crop": "mango",
        "name": "Mango Hopper (Fudka / Chepa)",
        "pathogen_type": "Insect Pest",
        "pathogen_name": "Amritodus atkinsoni / Idioscopus clypealis",
        "symptoms": "Wedge-shaped nymphs and adults suck sap from tender floral panicles and young leaves. Panicles dry up into brown twigs. Hoppers excrete honeydew, causing black sooty mold (Capnodium) to cover entire tree.",
        "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 32.0, "min_humidity": 65.0, "cloudy_rain": False},
        "biological_cures": [
            "Spray entomopathogenic fungus Metarhizium anisopliae or Beauveria bassiana @ 5 g/L.",
            "Spray 10,000 ppm Neem Oil @ 2.5 ml/L at early panicle emergence."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Imidacloprid 17.8% SL (Confidor)",
                "dosage": "0.4 ml / liter water",
                "application": "Spray when hopper nymphs emerge at floral bud burst; avoid spraying during full bee pollination."
            },
            {
                "active_ingredient": "Thiamethoxam 25% WG",
                "dosage": "0.3 g / liter water",
                "application": "Fast systemic translocation protecting panicle branches."
            }
        ],
        "preventative_measures": [
            "Keep orchard ventilated by annual canopy thinning; avoid excessively dense tree canopies.",
            "Do not spray systemic insecticides during peak honeybee foraging hours (8 AM - 12 PM)."
        ]
    },

    # ─── MOTHBEANS (MATKI) ─────────────────────────────────────────────────────
    {
        "id": "mothbeans_bacterial_blight",
        "crop": "mothbeans",
        "name": "Bacterial Leaf Blight of Mothbean",
        "pathogen_type": "Bacterial",
        "pathogen_name": "Xanthomonas axonopodis pv. phaseoli",
        "symptoms": "Small, water-soaked brown angular spots with translucent yellow halos on leaf blades. Stems and pods show elongated greasy brown streaks that crack under dry winds.",
        "weather_risk_triggers": {"min_temp": 26.0, "max_temp": 34.0, "min_humidity": 80.0, "cloudy_rain": True},
        "biological_cures": [
            "Seed soaking in 2% cow urine + Trichoderma viride (10 g/kg) for 30 minutes.",
            "Foliar spray of fresh cow dung supernatant (10% w/v) + 2 g/L wood ash."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Streptocycline (Streptomycin 90% + Tetracycline 10%)",
                "dosage": "6 g per 60 liters water (combined with Copper Oxychloride 50% WP @ 2.5 g/L)",
                "application": "Foliar spray at 30 and 45 days after sowing upon seeing water-soaked spots."
            }
        ],
        "preventative_measures": [
            "Use certified seed free from bacterial infection; mothbean is highly susceptible in humid micro-climates.",
            "Grow blight-tolerant varieties like RMO 40, RMO 225, or RMO 435."
        ]
    },
    {
        "id": "mothbeans_yellow_mosaic",
        "crop": "mothbeans",
        "name": "Yellow Mosaic of Mothbean",
        "pathogen_type": "Viral",
        "pathogen_name": "Mungbean Yellow Mosaic Virus (Vector: Bemisia tabaci)",
        "symptoms": "Scattered yellow specks expanding into complete bright golden-yellow mosaic pattern across leaflets. Plants become stunted with negligible pod formation.",
        "weather_risk_triggers": {"min_temp": 26.0, "max_temp": 36.0, "min_humidity": 55.0, "cloudy_rain": False},
        "biological_cures": [
            "Install yellow sticky traps @ 15 traps/acre.",
            "Foliar spray of 5% Neem Seed Kernel Extract (NSKE) at 15 DAS."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Thiamethoxam 25% WG",
                "dosage": "0.3 g / liter water",
                "application": "Target whitefly vector immediately upon noticing first yellow flecks."
            }
        ],
        "preventative_measures": [
            "Mandatory seed dress with Imidacloprid 600 FS (5 ml/kg seed) before sowing.",
            "Rogue out and bury virus-infected plants within the first 3 weeks."
        ]
    },

    # ─── MUNGBEAN (GREEN GRAM / MOONG) ─────────────────────────────────────────
    {
        "id": "mungbean_yellow_mosaic",
        "crop": "mungbean",
        "name": "Mungbean Yellow Mosaic Disease (MYMD - Peela Rog)",
        "pathogen_type": "Viral",
        "pathogen_name": "Mungbean Yellow Mosaic Virus (Vector: Whitefly)",
        "symptoms": "Bright yellow patches along leaf veins, coalescing until entire leaf turns golden yellow. Infected plants produce small upright pods containing few, shriveled, discolored seeds.",
        "weather_risk_triggers": {"min_temp": 27.0, "max_temp": 36.0, "min_humidity": 60.0, "cloudy_rain": False},
        "biological_cures": [
            "Install yellow sticky traps @ 20 traps/acre.",
            "Spray Neem oil (3 ml/L) or 5% NSKE at 15 and 30 days after sowing.",
            "Foliar spray of Lecanicillium lecanii @ 5 g/L to control whiteflies."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Thiamethoxam 25% WG (Actara)",
                "dosage": "0.35 g / liter water (50 g in 150 L water/acre)",
                "application": "Spray early morning targeting leaf undersides."
            },
            {
                "active_ingredient": "Spiromesifen 22.9% SC (Oberon)",
                "dosage": "1.0 ml / liter water",
                "application": "Lipid synthesis inhibitor targeting whitefly eggs and nymphs."
            }
        ],
        "preventative_measures": [
            "Grow MYMV-resistant cultivars (e.g. SML 668, IPM 02-3, Pusa Vishal, Samrat, MH 421).",
            "Seed treatment with Imidacloprid 17.8% SL (5 ml/kg seed)."
        ]
    },
    {
        "id": "mungbean_cercospora",
        "crop": "mungbean",
        "name": "Cercospora Leaf Spot of Moong (Tikka)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Cercospora canescens",
        "symptoms": "Circular to irregular spots with greyish-white necrotic center and dark purplish-red margins. Dead center tissue often falls out giving a shot-hole appearance; leaves drop prematurely.",
        "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 32.0, "min_humidity": 80.0, "cloudy_rain": True},
        "biological_cures": [
            "Bio-seed priming with Trichoderma viride @ 10 g/kg seed.",
            "Foliar spray of Pseudomonas fluorescens (2 g/L) at vegetative stage."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Carbendazim 12% + Mancozeb 63% WP (SAAF)",
                "dosage": "2.0 g / liter water",
                "application": "Foliar spray at first appearance of spots; repeat after 10-12 days."
            },
            {
                "active_ingredient": "Tebuconazole 25.9% EC",
                "dosage": "1.0 ml / liter water",
                "application": "Systemic triazole stopping fungal lesion expansion."
            }
        ],
        "preventative_measures": [
            "Maintain optimal row spacing (30 x 10 cm) to avoid leaf dampness.",
            "Destroy crop residues post-harvest through deep plowing."
        ]
    },

    # ─── MUSKMELON (KHARBOOJA) ─────────────────────────────────────────────────
    {
        "id": "muskmelon_downy_mildew",
        "crop": "muskmelon",
        "name": "Downy Mildew of Muskmelon (Kharbooja Kewda)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Pseudoperonospora cubensis",
        "symptoms": "Angular, vein-delimited bright yellow spots on upper leaf surface, with purplish-grey velvety fungal down on undersides in moist mornings. Foliage rapidly scorches and dies as if scorched by fire.",
        "weather_risk_triggers": {"min_temp": 20.0, "max_temp": 28.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Foliar spray of Trichoderma harzianum @ 3 g/L + seaweed extract.",
            "Foliar spray of Potassium Phosphite (3 ml/L) to stimulate vine phytoalexins."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Cymoxanil 8% + Mancozeb 64% WP (Curzate)",
                "dosage": "2.0 g / liter water (400 g in 200 L water/acre)",
                "application": "Spray immediately upon seeing angular yellow lesions; penetrant and contact action."
            },
            {
                "active_ingredient": "Dimethomorph 50% WP (Acrobat)",
                "dosage": "1.0 g / liter water",
                "application": "Potent antisporulant preventing secondary epidemic spread."
            },
            {
                "active_ingredient": "Ametoctradin 27% + Dimethomorph 20.27% SC (Zampro)",
                "dosage": "1.0 ml / liter water",
                "application": "State-of-the-art oomycete fungicide for complete vine rescue."
            }
        ],
        "preventative_measures": [
            "Grow melons on raised beds with drip irrigation; avoid overhead sprinkler or furrow flooding.",
            "Destroy diseased vine residues after harvest."
        ]
    },
    {
        "id": "muskmelon_fruit_fly",
        "crop": "muskmelon",
        "name": "Melon Fruit Fly (Phal Makkhi)",
        "pathogen_type": "Insect Pest",
        "pathogen_name": "Bactrocera cucurbitae",
        "symptoms": "Female flies puncture young fruits with ovipositors causing amber gummy resin drops. Maggots hatch inside, feeding on pulp and introducing bacterial soft rot; fruits rot and drop prematurely.",
        "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 35.0, "min_humidity": 60.0, "cloudy_rain": False},
        "biological_cures": [
            "Install Cue-lure pheromone traps @ 10-12 traps/acre.",
            "Bait spray: Jaggery (50 g) + Malathion (10 ml) in 10 L water, sprayed in coarse droplets on border foliage."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Spinosad 45% SC",
                "dosage": "0.3 ml / liter water",
                "application": "Safe, naturally derived bio-insecticide for fruiting stage."
            }
        ],
        "preventative_measures": [
            "Collect and deeply bury (at least 60 cm) all fallen and infested fruits.",
            "Cover developing melons with paper bags or dry straw in small-scale plantings."
        ]
    },

    # ─── ORANGE (CITRUS / MANDARIN) ────────────────────────────────────────────
    {
        "id": "orange_citrus_canker",
        "crop": "orange",
        "name": "Citrus Canker of Orange (Khajua Rog)",
        "pathogen_type": "Bacterial",
        "pathogen_name": "Xanthomonas axonopodis pv. citri",
        "symptoms": "Raised, rough, corky brownish lesions on leaves, twigs, and fruit rinds, surrounded by an oily translucent yellow halo. Crater-like center on fruits causes aesthetic degradation and market rejections.",
        "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 32.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Spray neem cake extract (5%) + copper solution.",
            "Foliar spray of Bacillus subtilis (3 g/L) to competitively exclude bacteria."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Streptocycline + Copper Oxychloride 50% WP",
                "dosage": "1 g Streptocycline + 25 g COC in 10 liters water",
                "application": "First spray at spring flush; second after fruit set; third during monsoon flush."
            },
            {
                "active_ingredient": "Copper Hydroxide 53.8% DF (Kocide)",
                "dosage": "2.0 g / liter water",
                "application": "Superior fine-particle copper barrier against bacterial stomatal entry."
            }
        ],
        "preventative_measures": [
            "Prune infected twigs before monsoon; paint cuts with Bordeaux paste.",
            "Control citrus leaf miner (Phyllocnistis citrella) whose serpentine feeding mines create direct bacterial infection entry points."
        ]
    },
    {
        "id": "orange_gummosis",
        "crop": "orange",
        "name": "Phytophthora Gummosis / Foot Rot of Citrus",
        "pathogen_type": "Fungal",
        "pathogen_name": "Phytophthora nicotianae / citrophthora",
        "symptoms": "Bark at the base of the trunk near the bud union cracks, turns dark, and exudes copious golden-brown sticky gum. Bark dries, cracks, and sloughs off, completely girdling the tree trunk.",
        "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 30.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Apply Trichoderma harzianum enriched compost around the root zone (5 kg/tree).",
            "Paste Trichoderma culture paste over scraped trunk lesions."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Bordeaux Paste (2%)",
                "dosage": "2 kg Copper Sulphate + 2 kg Lime + 20 L water",
                "application": "Scrape dead bark with curved knife; paint thick paste onto exposed wood up to 50 cm."
            },
            {
                "active_ingredient": "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)",
                "dosage": "2.5 g / liter water (soil drench 5-10 L/tree)",
                "application": "Drench basin soil around tree trunk to kill Phytophthora zoospores."
            },
            {
                "active_ingredient": "Potassium Phosphonate (Akomin / Phyto-Fos)",
                "dosage": "3.0 ml / liter water (foliar spray or trunk injection)",
                "application": "Systemic upward and downward translocation."
            }
        ],
        "preventative_measures": [
            "Bud trees high (at least 30 cm above ground level) on resistant rootstocks like Rough Lemon or Rangpur Lime.",
            "Use ring-and-basin irrigation; ensure irrigation water never directly touches the tree trunk."
        ]
    },

    # ─── PAPAYA ────────────────────────────────────────────────────────────────
    {
        "id": "papaya_ringspot",
        "crop": "papaya",
        "name": "Papaya Ring Spot Virus (PRSV - Chhalla Rog)",
        "pathogen_type": "Viral",
        "pathogen_name": "Papaya Ringspot Virus (Vector: Aphids)",
        "symptoms": "Severe yellow-green mosaic and chlorosis on leaves with extreme shoe-stringing (narrowing) of leaf blades. Oily dark green water-soaked concentric rings and streaks on stems, petioles, and green fruits.",
        "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 32.0, "min_humidity": 65.0, "cloudy_rain": False},
        "biological_cures": [
            "Plant 2-3 border rows of tall non-host barrier crops (corn, sorghum, or sesbania) around papaya.",
            "Install yellow sticky traps @ 20 traps/acre.",
            "Spray mineral oil or 10,000 ppm Neem Oil @ 2.5 ml/L to inhibit stylet transmission by aphids."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Thiamethoxam 25% WG",
                "dosage": "0.3 g / liter water",
                "application": "Target aphid vectors on barrier crops and young papaya trees."
            },
            {
                "active_ingredient": "Dimethoate 30% EC (Rogor)",
                "dosage": "1.5 ml / liter water",
                "application": "Systemic vector control."
            }
        ],
        "preventative_measures": [
            "Rogue out and destroy infected trees immediately upon spotting ring spots; do not allow infected trees to remain as viral reservoirs.",
            "Grow papaya under 40-mesh insect-proof net for first 60 days after transplanting."
        ]
    },
    {
        "id": "papaya_foot_rot",
        "crop": "papaya",
        "name": "Foot Rot / Stem Rot of Papaya",
        "pathogen_type": "Fungal",
        "pathogen_name": "Pythium aphanidermatum",
        "symptoms": "Water-soaked patches at the collar region of the trunk at ground level. Tissues soften, rot, and turn spongy black with foul smell; leaves turn yellow and entire heavy fruiting tree topples over under light wind.",
        "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 32.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Soil drench with Trichoderma harzianum (10 g/L) at planting hole.",
            "Apply neem cake @ 1 kg/plant in planting basin."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Copper Oxychloride 50% WP (Blitox)",
                "dosage": "3.0 g / liter water",
                "application": "Drench soil basin around tree trunk thoroughly (2-3 L per plant)."
            },
            {
                "active_ingredient": "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)",
                "dosage": "2.0 g / liter water",
                "application": "Curative drench upon first sign of water-soaking on lower trunk."
            }
        ],
        "preventative_measures": [
            "Always plant papaya on raised mounds or ridges (15-20 cm high) to prevent water stagnating at trunk base.",
            "Ensure excellent sub-surface field drainage during heavy monsoon rains."
        ]
    },

    # ─── PIGEONPEAS (ARHAR / TUR) ──────────────────────────────────────────────
    {
        "id": "pigeonpea_smd",
        "crop": "pigeonpeas",
        "name": "Sterility Mosaic Disease of Arhar (SMD - Baanjh Rog)",
        "pathogen_type": "Viral",
        "pathogen_name": "Pigeonpea Sterility Mosaic Virus (Vector: Aceria cajani mite)",
        "symptoms": "Bushy, stunted vegetative growth with severe leaf size reduction and pale green mosaic mottling. Most diagnostic symptom is complete absence of flowering ('sterility') with zero pod formation.",
        "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 32.0, "min_humidity": 70.0, "cloudy_rain": False},
        "biological_cures": [
            "Foliar spray of Wettable Sulfur @ 3 g/L to eliminate vector eriophyid mites.",
            "Spray neem oil (3 ml/L) at 20 and 35 days after sowing."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Fenazaquin 10% EC (Magister)",
                "dosage": "2.0 ml / liter water",
                "application": "Specialist acaricide eradicating eriophyid vector mites."
            },
            {
                "active_ingredient": "Propargite 57% EC (Omite)",
                "dosage": "2.0 ml / liter water",
                "application": "Contact miticide controlling mite colonies on leaf undersides."
            }
        ],
        "preventative_measures": [
            "Plant SMD-resistant ICAR cultivars (e.g. BDN 711, BSMR 736, BSMR 853, Asha / ICPL 87119).",
            "Rogue out and destroy infected bushy plants in the first 45 days before mites multiply."
        ]
    },
    {
        "id": "pigeonpea_fusarium_wilt",
        "crop": "pigeonpeas",
        "name": "Fusarium Wilt of Pigeonpea (Tur Ukhta)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Fusarium udum",
        "symptoms": "Gradual wilting and yellowing of foliage starting on one branch or one side of the plant. A prominent dark brown or purple vertical band runs up the main stem from the collar region; vascular xylem exhibits deep black discoloration.",
        "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 32.0, "min_humidity": 65.0, "cloudy_rain": False},
        "biological_cures": [
            "Seed treatment with Trichoderma viride @ 10 g/kg seed before sowing.",
            "Soil application of Trichoderma enriched FYM (5 kg Trichoderma in 200 kg FYM/acre)."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Carbendazim 50% WP (Bavistin)",
                "dosage": "2.0 g / kg seed",
                "application": "Seed dressing prior to sowing."
            },
            {
                "active_ingredient": "Thiophanate Methyl 70% WP (Roko)",
                "dosage": "1.5 g / liter water",
                "application": "Spot drenching of soil around adjacent plants."
            }
        ],
        "preventative_measures": [
            "Grow wilt-resistant varieties (e.g. Maruti / ICP 8863, Asha / ICPL 87119, WRG 65).",
            "Intercrop pigeonpea with sorghum or pearl millet (which exude antifungal root exudates suppressing F. udum)."
        ]
    },

    # ─── POMEGRANATE (ANAAR) ───────────────────────────────────────────────────
    {
        "id": "pomegranate_bacterial_blight",
        "crop": "pomegranate",
        "name": "Bacterial Blight / Oily Spot (Telya Rog)",
        "pathogen_type": "Bacterial",
        "pathogen_name": "Xanthomonas axonopodis pv. punicae",
        "symptoms": "Dark brown to black angular water-soaked oily spots on leaves. On fruits, characteristic dark brown 'L' or 'Y' shaped cracking lesions with oily water-soaked borders. Fruits crack open and rot.",
        "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 35.0, "min_humidity": 80.0, "cloudy_rain": True},
        "biological_cures": [
            "Foliar spray of Pseudomonas fluorescens (2 g/L) + Bacillus subtilis (2 g/L).",
            "Paste Bordeaux paste (10%) on stem wounds after pruning."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Streptocycline + Copper Oxychloride 50% WP",
                "dosage": "0.5 g Streptocycline + 2.5 g COC per liter water",
                "application": "Mandatory spray schedule at 10-day intervals during monsoon flush (Mrig bahar)."
            },
            {
                "active_ingredient": "Bordeaux Mixture 1%",
                "dosage": "10 kg Copper Sulphate + 10 kg Lime in 1000 L water/ha",
                "application": "Defoliation and pre-monsoon sanitary canopy cover."
            },
            {
                "active_ingredient": "Bronopol 99% (Bactronol)",
                "dosage": "0.5 g / liter water",
                "application": "Specialist bactericide halting active bacterial slime exudation."
            }
        ],
        "preventative_measures": [
            "Prune out infected twigs 5 cm below lesion; dip pruning shears in 2% sodium hypochlorite between cuts.",
            "Take Hasta bahar (September-October flowering) instead of Mrig bahar in blight-endemic zones to avoid monsoon disease peaks."
        ]
    },
    {
        "id": "pomegranate_fruit_borer",
        "crop": "pomegranate",
        "name": "Pomegranate Butterfly / Fruit Borer (Suran)",
        "pathogen_type": "Insect Pest",
        "pathogen_name": "Deudorix (Virachola) isocrates",
        "symptoms": "Caterpillar bores a single entry hole into developing fruit, around which offensive-smelling dark excreta / frass pellets accumulate. Secondary fungal and bacterial rot causes fruit to turn black and drop.",
        "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 35.0, "min_humidity": 60.0, "cloudy_rain": False},
        "biological_cures": [
            "Bagging developing fruits with butter paper or non-woven polypropylene bags @ 30-40 days after fruit set.",
            "Release egg parasitoid Trichogramma chilonis @ 1,00,000 / acre at flowering."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Chlorantraniliprole 18.5% SC (Coragen)",
                "dosage": "0.3 ml / liter water",
                "application": "Target eggs and newly hatched caterpillars before they bore into the rind."
            },
            {
                "active_ingredient": "Spinosad 45% SC",
                "dosage": "0.4 ml / liter water",
                "application": "Bio-derived insecticide with excellent fruit safety."
            }
        ],
        "preventative_measures": [
            "Collect and deeply bury all dropped or bored fruits to prevent caterpillar pupation.",
            "Clip calyx cup thorns during early fruit development."
        ]
    },

    # ─── TEA ───────────────────────────────────────────────────────────────────
    {
        "id": "tea_blister_blight",
        "crop": "tea",
        "name": "Blister Blight of Tea (Chhala Rog)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Exobasidium vexans",
        "symptoms": "Circular translucent pale yellow spots on tender young flush leaves (two leaves and a bud). Upper surface becomes depressed into a cup, while underside swells into a chalky-white blister shedding basidiospores.",
        "weather_risk_triggers": {"min_temp": 18.0, "max_temp": 25.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Foliar spray of Trichoderma harzianum or Pseudomonas fluorescens @ 3 g/L.",
            "Shade tree regulation to allow maximum diffused sunlight onto tea bushes."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Copper Oxychloride 50% WP + Hexaconazole 5% EC",
                "dosage": "210 g COC + 200 ml Hexaconazole in 200 L water/ha",
                "application": "Standard tea industry cocktail spray at 5-7 day intervals during monsoonal mist."
            },
            {
                "active_ingredient": "Propiconazole 25% EC (Tilt)",
                "dosage": "1.0 ml / liter water",
                "application": "Systemic eradicant stopping blister maturation."
            }
        ],
        "preventative_measures": [
            "Strict regular plucking: harvest tender flush on strict 7-day rounds before blisters mature and sporulate.",
            "Thin shade tree branches before monsoon to lower micro-climate humidity inside the tea canopy."
        ]
    },
    {
        "id": "tea_mosquito_bug",
        "crop": "tea",
        "name": "Tea Mosquito Bug",
        "pathogen_type": "Insect Pest",
        "pathogen_name": "Helopeltis theivora",
        "symptoms": "Adults and nymphs insert piercing stylets into succulent tender buds and young leaves. Circular brownish-black water-soaked necrotic puncture spots appear. Leaves curl, dry up, and young shoots die back.",
        "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 30.0, "min_humidity": 80.0, "cloudy_rain": False},
        "biological_cures": [
            "Foliar spray of Beauveria bassiana @ 5 g/L during evening hours.",
            "Spray 5% Neem Seed Kernel Extract (NSKE) at early infestation notice."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Thiamethoxam 25% WG",
                "dosage": "0.25 g / liter water",
                "application": "Spray immediately after plucking round to respect mandatory tea pre-harvest intervals (PHI)."
            },
            {
                "active_ingredient": "Clothianidin 50% WDG",
                "dosage": "0.15 g / liter water",
                "application": "Target bush frame and lower canopy where bugs shelter during midday."
            }
        ],
        "preventative_measures": [
            "Remove weeds like Mikania micrantha which act as alternative breeding hosts around tea sections.",
            "Follow strict harvest intervals to avoid pesticide residues in manufactured made tea."
        ]
    },

    # ─── TURMERIC (HALDI) ──────────────────────────────────────────────────────
    {
        "id": "turmeric_rhizome_rot",
        "crop": "turmeric",
        "name": "Rhizome Rot / Soft Rot of Turmeric (Haldi Ganth Galan)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Pythium aphanidermatum / graminicola",
        "symptoms": "Collar region of the pseudo-stem becomes water-soaked, soft, and dark. Leaves turn yellow from margins inward and wilt. Rhizomes rot into a foul-smelling soft watery pulp leaving only the fibrous outer skin.",
        "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 32.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Rhizome seed treatment with Trichoderma harzianum @ 10 g/kg seed before planting.",
            "Soil application of Trichoderma enriched neem cake (200 kg/acre) at planting and earthing-up."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)",
                "dosage": "2.5 g / liter water (soil drench 250 ml/plant)",
                "application": "Drench planting beds immediately upon seeing yellowing pseudo-stems."
            },
            {
                "active_ingredient": "Copper Oxychloride 50% WP (Blitox)",
                "dosage": "3.0 g / liter water",
                "application": "Prophylactic soil bed drench at 45 and 90 days after planting."
            }
        ],
        "preventative_measures": [
            "Select healthy, plump, rot-free mother rhizomes for planting.",
            "Plant on raised beds (120 cm wide, 30 cm high) with deep drainage furrows to prevent waterlogging."
        ]
    },
    {
        "id": "turmeric_leaf_spot",
        "crop": "turmeric",
        "name": "Leaf Spot of Turmeric (Patti Dhabba)",
        "pathogen_type": "Fungal",
        "pathogen_name": "Colletotrichum curcumae",
        "symptoms": "Elliptical to oblong brown spots with greyish-white center and yellowish-brown margin on upper leaf surfaces. Spots coalesce into large necrotic blighted areas, severely diminishing rhizome bulking.",
        "weather_risk_triggers": {"min_temp": 24.0, "max_temp": 32.0, "min_humidity": 80.0, "cloudy_rain": True},
        "biological_cures": [
            "Bio-seed rhizome dip in Pseudomonas fluorescens (10 g/L) for 30 minutes.",
            "Foliar spray of Trichoderma viride @ 5 g/L."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Carbendazim 12% + Mancozeb 63% WP (SAAF)",
                "dosage": "2.0 g / liter water (400 g in 200 L water/acre)",
                "application": "Spray foliage at 60 and 90 days after planting."
            },
            {
                "active_ingredient": "Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top)",
                "dosage": "1.0 ml / liter water",
                "application": "Broad-spectrum systemic protection."
            }
        ],
        "preventative_measures": [
            "Ensure balanced fertilization with adequate potash to improve leaf cuticle resistance.",
            "Burn infected leaves after harvest to destroy dormant fungal perithecia."
        ]
    },

    # ─── WATERMELON (TARBOOZ) ──────────────────────────────────────────────────
    {
        "id": "watermelon_gummy_stem_blight",
        "crop": "watermelon",
        "name": "Gummy Stem Blight of Watermelon",
        "pathogen_type": "Fungal",
        "pathogen_name": "Stagonosporopsis cucurbitacearum (Didymella bryoniae)",
        "symptoms": "Circular to irregular water-soaked spots on leaves. Crown stems develop bleached, water-soaked lesions that crack and exude an amber to dark brown gummy sap, studded with tiny black pycnidia dots.",
        "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 30.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Seed treatment with Trichoderma viride @ 10 g/kg seed.",
            "Foliar spray of Bacillus subtilis (2.5 g/L) at runner initiation."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Fluopyram 17.7% + Tebuconazole 17.7% SC (Luna Experience)",
                "dosage": "1.0 ml / liter water (200 ml/acre)",
                "application": "Potent translaminar and systemic fungicide controlling both gummy stem blight and powdery mildew."
            },
            {
                "active_ingredient": "Chlorothalonil 75% WP (Kavach)",
                "dosage": "2.0 g / liter water",
                "application": "Broad-spectrum contact protectant; spray thoroughly before anticipated rain."
            }
        ],
        "preventative_measures": [
            "Practice 3-year crop rotation with non-cucurbit crops.",
            "Water strictly via drip irrigation; keep runner foliage and fruit crowns dry."
        ]
    },
    {
        "id": "watermelon_anthracnose",
        "crop": "watermelon",
        "name": "Anthracnose of Watermelon",
        "pathogen_type": "Fungal",
        "pathogen_name": "Colletotrichum orbiculare",
        "symptoms": "Circular black spots on leaves resembling grease spots that dry and shatter. Developing fruits develop circular sunken water-soaked pits with raised black margins, producing salmon-pink gelatinous spore masses in humid weather.",
        "weather_risk_triggers": {"min_temp": 22.0, "max_temp": 30.0, "min_humidity": 85.0, "cloudy_rain": True},
        "biological_cures": [
            "Seed soaking in Pseudomonas fluorescens (10 g/L) for 2 hours.",
            "Foliar spray of 5% Neem Seed Kernel Extract (NSKE) at early fruit set."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Carbendazim 12% + Mancozeb 63% WP (SAAF)",
                "dosage": "2.0 g / liter water",
                "application": "Spray foliage and developing fruits at 10-14 day intervals."
            },
            {
                "active_ingredient": "Azoxystrobin 23% SC",
                "dosage": "1.0 ml / liter water",
                "application": "Preventative systemic coverage."
            }
        ],
        "preventative_measures": [
            "Use certified anthracnose-free seed.",
            "Mulch beds with silver-black plastic mulch to prevent soil-splashing of fungal spores onto vines."
        ]
    },
    {
        "id": "watermelon_bud_necrosis",
        "crop": "watermelon",
        "name": "Watermelon Bud Necrosis Virus (WBNV - ToSpo Virus)",
        "pathogen_type": "Viral",
        "pathogen_name": "Watermelon Bud Necrosis Orthotospovirus (Vector: Thrips tabaci)",
        "symptoms": "Terminal growing buds turn necrotic, black, and die back. Internodes become severely shortened giving an erect, crowded 'bunchy' appearance. Leaves show chlorotic rings and mottling; fruits develop yellow necrotic rings.",
        "weather_risk_triggers": {"min_temp": 25.0, "max_temp": 35.0, "min_humidity": 55.0, "cloudy_rain": False},
        "biological_cures": [
            "Install blue sticky traps @ 20-25 traps/acre for thrips monitoring and mass-trapping.",
            "Foliar spray of Lecanicillium lecanii @ 5 g/L during evening hours.",
            "Spray 10,000 ppm Neem Oil @ 2.5 ml/L mixed with mild surfactant."
        ],
        "chemical_remedies": [
            {
                "active_ingredient": "Fipronil 5% SC (Regent)",
                "dosage": "2.0 ml / liter water",
                "application": "Target vector thrips nymphs hiding in growing terminal buds."
            },
            {
                "active_ingredient": "Spinetoram 11.7% SC (Delegate)",
                "dosage": "0.9 ml / liter water",
                "application": "Rapid knockdown preventing further tospovirus transmission."
            }
        ],
        "preventative_measures": [
            "Use silver reflective plastic mulch which disorients and deters vector thrips from landing.",
            "Rogue out and destroy infected vines showing terminal bud necrosis immediately."
        ]
    }
]

def get_all_crop_names_with_diseases() -> List[str]:
    """Returns sorted list of unique crops present in disease database."""
    crops = sorted(list(set(d["crop"] for d in CROP_DISEASES_DB)))
    return crops

def search_diseases(crop_name: Optional[str] = None, keyword: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Filters diseases by target crop and/or text keyword matching symptoms,
    disease name, or pathogen type.
    """
    results = []
    crop_clean = crop_name.lower().strip() if crop_name else None
    kw_clean = keyword.lower().strip() if keyword else None

    for d in CROP_DISEASES_DB:
        # Check crop match
        if crop_clean and crop_clean != "all" and d["crop"] != crop_clean:
            continue
        
        # Check keyword match
        if kw_clean:
            matchable_text = f"{d['name']} {d['crop']} {d['pathogen_type']} {d['pathogen_name']} {d['symptoms']}".lower()
            if kw_clean not in matchable_text:
                continue

        results.append(d)

    return results

def evaluate_live_weather_risk(crop_name: str, temperature: float, humidity: float) -> List[Dict[str, Any]]:
    """
    Evaluates current live weather parameters (temperature, humidity) against
    pathogen risk triggers to provide real-time outbreak warning alerts.
    """
    crop_clean = crop_name.lower().strip()
    alerts = []

    for d in CROP_DISEASES_DB:
        if d["crop"] == crop_clean:
            triggers = d.get("weather_risk_triggers", {})
            min_temp = triggers.get("min_temp", 10.0)
            max_temp = triggers.get("max_temp", 40.0)
            min_hum = triggers.get("min_humidity", 70.0)

            # Check if current weather falls into infection incubation window
            temp_in_range = (min_temp <= temperature <= max_temp)
            hum_in_range = (humidity >= min_hum)

            if temp_in_range and hum_in_range:
                severity = "HIGH OUTBREAK RISK" if humidity >= (min_hum + 5) else "MODERATE WATCH"
                alerts.append({
                    "disease_name": d["name"],
                    "pathogen_type": d["pathogen_type"],
                    "severity": severity,
                    "condition": f"Current weather ({temperature:.1f}°C, {humidity:.1f}% RH) matches optimal pathogen incubation conditions ({min_temp}-{max_temp}°C, >{min_hum}% RH).",
                    "immediate_remedy": d["chemical_remedies"][0]["active_ingredient"] if d["chemical_remedies"] else "Inspect field immediately."
                })

    return alerts
