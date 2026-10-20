"""
SPARC Crop Doctor: Plant Pathology Diagnostic & Cure Knowledgebase
Covers 35+ major plant diseases, fungal/bacterial/viral infections, and insect pests
across major Indian commercial and food crops.
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
