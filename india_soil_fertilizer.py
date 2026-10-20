"""
India Place-Wise Soil Conditions and Fertilizer Recommendation Database
Sources: ICAR-IISS (Indian Institute of Soil Science), State Agricultural Universities (SAUs),
and Ministry of Agriculture Soil Health Card (SHC) Scheme.
"""

from typing import Dict, List, Any, Optional

INDIAN_SOIL_FERTILIZER_REGISTRY: Dict[str, Dict[str, Any]] = {
    "Punjab": {
        "zone_name": "Indo-Gangetic Trans-Plains (Rice-Wheat-Cotton Belt)",
        "districts_sample": ["Ludhiana", "Amritsar", "Bathinda", "Jalandhar", "Patiala", "Ferozepur"],
        "soil_type": "Indo-Gangetic Alluvial (Sandy Loam to Silt Loam)",
        "soil_description": "Deep, fertile loam formed by Himalayan river deposits. Well-drained but intensive cropping has depleted subsoil moisture and micronutrients.",
        "baseline_soil": {
            "nitrogen": 115.0,        # kg/ha (Medium to Low)
            "phosphorus": 48.0,       # kg/ha (Medium to High)
            "potassium": 190.0,       # kg/ha (Medium to High)
            "ph": 7.8,                # Slightly alkaline
            "organic_carbon_pct": 0.45,
            "salinity_ec": 0.42       # Normal
        },
        "micronutrient_deficiencies": [
            "Zinc (Zn) - 45% soil samples deficient due to intensive rice-wheat rotation",
            "Iron (Fe) - Chlorosis frequent in coarse-textured soils under paddy",
            "Manganese (Mn) - Common in sandy soils under wheat"
        ],
        "primary_crops": ["wheat", "rice", "cotton", "mustard", "maize", "potato", "sugarcane", "barley"],
        "fertilizer_package": {
            "wheat": {
                "npk_ratio": "120:60:30 kg/ha",
                "urea_bags": "2.5 bags/acre (split into basal, CRI, and tillering)",
                "dap_bags": "1.0 bag/acre (drilled at sowing)",
                "mop_bags": "0.3 bag/acre (applied on light soils)",
                "micronutrient": "Apply 25 kg/ha Zinc Sulphate (21%) at final plowing"
            },
            "rice": {
                "npk_ratio": "120:30:30 kg/ha",
                "urea_bags": "2.5 bags/acre (in 3 equal splits at transplanting, 21 DAT, and 42 DAT)",
                "dap_bags": "0.6 bag/acre basal",
                "mop_bags": "0.3 bag/acre",
                "micronutrient": "Foliar spray of 0.5% Ferrous Sulphate if leaves turn ivory-white"
            },
            "cotton": {
                "npk_ratio": "150:60:60 kg/ha",
                "urea_bags": "3.0 bags/acre (split: 1/2 at thinning, 1/2 at flowering)",
                "dap_bags": "1.0 bag/acre basal",
                "mop_bags": "0.6 bag/acre",
                "micronutrient": "Spray 2% Potassium Nitrate (13:0:45) at boll development"
            }
        },
        "management_tips": [
            "Incorporate green manure (Dhaincha / Sesbania) before paddy puddling to raise organic carbon.",
            "Avoid excessive urea usage which promotes vegetative lodging and insect susceptibility.",
            "Apply gypsum (500 kg/ha) if tubewell irrigation water has high residual sodium carbonate (RSC > 2.5 meq/L)."
        ]
    },
    "Haryana": {
        "zone_name": "Semi-Arid Alluvial & Western Sandy Tracts",
        "districts_sample": ["Karnal", "Hisar", "Sirsa", "Kurukshetra", "Rohtak", "Bhiwani"],
        "soil_type": "Alluvial Loam to Arid Brown Soils",
        "soil_description": "Loamy sand in south-west to fertile clay loam in eastern canal tracts. Moderate to high lime concentration.",
        "baseline_soil": {
            "nitrogen": 110.0,
            "phosphorus": 42.0,
            "potassium": 180.0,
            "ph": 8.0,
            "organic_carbon_pct": 0.40,
            "salinity_ec": 0.55
        },
        "micronutrient_deficiencies": [
            "Zinc (Zn) - Highly widespread across canal and tubewell commands",
            "Sulphur (S) - Widespread deficiency in mustard and pulse tracts"
        ],
        "primary_crops": ["wheat", "mustard", "bajra", "cotton", "rice", "sugarcane", "barley"],
        "fertilizer_package": {
            "mustard": {
                "npk_ratio": "80:40:20 kg/ha + 20 kg S",
                "urea_bags": "1.5 bags/acre (1/2 basal, 1/2 at first irrigation)",
                "dap_bags": "0.8 bag/acre basal",
                "ssp_bags": "Prefer Single Super Phosphate (SSP) over DAP to provide essential Sulphur (12% S)",
                "micronutrient": "Apply 200 kg/ha Gypsum for oil percentage boost"
            },
            "bajra": {
                "npk_ratio": "60:30:20 kg/ha",
                "urea_bags": "1.2 bags/acre (split: 1/2 at sowing, 1/2 at 30 days)",
                "dap_bags": "0.6 bag/acre",
                "micronutrient": "Seed inoculation with Azospirillum / Azotobacter biofertilizer"
            }
        },
        "management_tips": [
            "Use laser land leveling to prevent localized salt accumulation.",
            "Rotate wheat with summer moong (mungbean) to replenish nitrogen reserves."
        ]
    },
    "Uttar Pradesh": {
        "zone_name": "Gangetic Plains (Western Doab, Central & Eastern Terai)",
        "districts_sample": ["Meerut", "Muzaffarnagar", "Varanasi", "Gorakhpur", "Bareilly", "Kanpur", "Prayagraj"],
        "soil_type": "Gangetic Alluvium (Khadar new alluvium & Bangar old alluvium)",
        "soil_description": "Deep silty to clayey alluvial plains with high native moisture retention. Excellent productivity potential.",
        "baseline_soil": {
            "nitrogen": 125.0,
            "phosphorus": 44.0,
            "potassium": 175.0,
            "ph": 7.4,
            "organic_carbon_pct": 0.50,
            "salinity_ec": 0.38
        },
        "micronutrient_deficiencies": [
            "Zinc (Zn) - 40% soils deficient",
            "Boron (B) - Deficient in Eastern UP Terai soils (affects wheat grain filling)",
            "Sulphur (S) - In oilseed & sugarcane belts"
        ],
        "primary_crops": ["sugarcane", "wheat", "rice", "potato", "mustard", "maize", "chickpea", "mango"],
        "fertilizer_package": {
            "sugarcane": {
                "npk_ratio": "180:60:60 kg/ha",
                "urea_bags": "3.5 bags/acre (split across 3 earthing-up intervals)",
                "dap_bags": "1.2 bags/acre basal in furrows",
                "mop_bags": "0.8 bag/acre for juice sucrose accumulation",
                "micronutrient": "Trash mulching + 25 kg Zinc Sulphate + 10 kg Ferrous Sulphate"
            },
            "potato": {
                "npk_ratio": "150:100:120 kg/ha",
                "urea_bags": "3.0 bags/acre (1/3 basal, 2/3 at earthing up)",
                "dap_bags": "2.0 bags/acre basal",
                "mop_bags": "1.5 bags/acre (Sulphate of Potash preferred for tuber starch quality)",
                "micronutrient": "Foliar spray of 0.2% Borax at tuber initiation"
            }
        },
        "management_tips": [
            "In sugarcane ratoon, apply 20% extra nitrogen to decompose stubbles.",
            "Apply Pressmud (sugar mill byproduct) @ 10 t/ha to enrich organic matter."
        ]
    },
    "Maharashtra": {
        "zone_name": "Deccan Trap (Black Cotton / Vertisol Plateau)",
        "districts_sample": ["Nashik", "Pune", "Nagpur", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Jalgaon"],
        "soil_type": "Deep Black Soils (Regur / Vertisols) & Red Lateritic in Konkan",
        "soil_description": "High clay content (40-60% montmorillonite), swell-shrink properties, high moisture holding capacity. High in potash and lime.",
        "baseline_soil": {
            "nitrogen": 105.0,
            "phosphorus": 35.0,
            "potassium": 260.0,       # High native Potassium
            "ph": 7.9,
            "organic_carbon_pct": 0.52,
            "salinity_ec": 0.45
        },
        "micronutrient_deficiencies": [
            "Zinc (Zn) - Severe in deep black soils",
            "Iron (Fe) - Lime-induced chlorosis in sugarcane, soybean, and citrus",
            "Boron (B) - Deficient in fruit-growing tracts (Grapes, Pomegranate)"
        ],
        "primary_crops": ["cotton", "soybean", "sugarcane", "onion", "grapes", "pomegranate", "jowar", "turmeric"],
        "fertilizer_package": {
            "soybean": {
                "npk_ratio": "30:75:30 kg/ha + 20 kg S",
                "urea_bags": "0.6 bag/acre (Rhizobium seed coating supplies majority of N)",
                "dap_bags": "1.3 bags/acre basal",
                "micronutrient": "Apply 25 kg/ha Zinc Sulphate once every 2 years"
            },
            "onion": {
                "npk_ratio": "100:50:80 kg/ha + 30 kg S",
                "urea_bags": "2.0 bags/acre (in 3 splits: transplanting, 30 DAT, 45 DAT)",
                "dap_bags": "1.0 bag/acre",
                "mop_bags": "1.0 bag/acre (crucial for bulb firmness and storage shelf life)",
                "micronutrient": "Sulphur application (SSP or elemental S) is mandatory for pungency and skin color"
            },
            "grapes": {
                "npk_ratio": "120:80:160 kg/ha (Precision Drip Fertigation)",
                "urea_bags": "Water-soluble Urea / 19:19:19 via venturi drip",
                "mop_bags": "Potassium Nitrate (13:0:45) and Potassium Schoenite for berry sizing",
                "micronutrient": "Chelated Zinc (Zn-EDTA) and Boron (Solubor) foliar sprays"
            }
        },
        "management_tips": [
            "Broad Bed and Furrow (BBF) cultivation prevents waterlogging during heavy monsoon spells.",
            "Subsurface drainage tiles reduce salt crust formation in sugarcane-heavy irrigated belts."
        ]
    },
    "Madhya Pradesh": {
        "zone_name": "Central Black Soil Plateau (Soybean & Wheat Capital)",
        "districts_sample": ["Indore", "Ujjain", "Bhopal", "Dewas", "Hoshangabad", "Jabalpur", "Gwalior"],
        "soil_type": "Medium to Deep Black Vertisols",
        "soil_description": "Heavy clay with high CEC (Cation Exchange Capacity). Inherent richness in potassium, medium in phosphorus, low in nitrogen.",
        "baseline_soil": {
            "nitrogen": 108.0,
            "phosphorus": 36.0,
            "potassium": 240.0,
            "ph": 7.7,
            "organic_carbon_pct": 0.48,
            "salinity_ec": 0.35
        },
        "micronutrient_deficiencies": [
            "Zinc (Zn) - 52% soils deficient",
            "Sulphur (S) - Extremely critical for soybean, mustard, and garlic",
            "Boron (B) - Deficient in Malwa region"
        ],
        "primary_crops": ["soybean", "wheat", "chickpea", "garlic", "mustard", "cotton", "maize"],
        "fertilizer_package": {
            "garlic": {
                "npk_ratio": "100:50:70 kg/ha + 25 kg S",
                "urea_bags": "2.0 bags/acre (split 50% basal, 50% at 30-45 DAS)",
                "dap_bags": "1.0 bag/acre basal",
                "mop_bags": "0.8 bag/acre",
                "micronutrient": "Apply 100 kg/ha Agricultural Gypsum as sulphur source"
            },
            "chickpea": {
                "npk_ratio": "20:50:20 kg/ha",
                "urea_bags": "0.4 bag/acre starter nitrogen",
                "dap_bags": "1.0 bag/acre basal",
                "micronutrient": "Seed inoculation with Rhizobium + PSB (Phosphate Solubilizing Bacteria)"
            }
        },
        "management_tips": [
            "Do not over-irrigate Vertisols as poor aeration chokes legume nodulation.",
            "Deep summer plowing destroys resting pupae of Helicoverpa (gram pod borer)."
        ]
    },
    "Gujarat": {
        "zone_name": "Saurashtra & North Gujarat Semi-Arid Belt",
        "districts_sample": ["Rajkot", "Junagadh", "Mehsana", "Banaskantha", "Surat", "Vadodara", "Jamnagar"],
        "soil_type": "Medium Black (Saurashtra), Sandy Loam / Goradu (North), Coastal Alluvial",
        "soil_description": "Medium black in Saurashtra with good calcium carbonate; coarse sandy loam in north with high permeability.",
        "baseline_soil": {
            "nitrogen": 95.0,
            "phosphorus": 38.0,
            "potassium": 210.0,
            "ph": 8.1,
            "organic_carbon_pct": 0.38,
            "salinity_ec": 0.65       # Higher near coastline
        },
        "micronutrient_deficiencies": [
            "Iron (Fe) - Severe lime-induced iron deficiency in groundnut (yellowing of young leaves)",
            "Zinc (Zn) - Widespread",
            "Sulphur (S) - In groundnut and castor belts"
        ],
        "primary_crops": ["groundnut", "cotton", "mustard", "potato", "bajra", "wheat", "onion"],
        "fertilizer_package": {
            "groundnut": {
                "npk_ratio": "25:50:30 kg/ha + 400 kg Gypsum/ha",
                "urea_bags": "0.5 bag/acre basal",
                "dap_bags": "1.0 bag/acre",
                "gypsum": "Apply 200 kg/acre Gypsum at 35-45 DAS (flowering/pegging) for pod pod-filling and calcium delivery",
                "micronutrient": "Spray 0.5% FeSO4 + 0.1% Citric acid if young leaves show chlorosis"
            },
            "cotton": {
                "npk_ratio": "160:60:60 kg/ha",
                "urea_bags": "3.2 bags/acre (split 4 times under drip fertigation)",
                "dap_bags": "1.2 bags/acre",
                "mop_bags": "0.8 bag/acre"
            }
        },
        "management_tips": [
            "Gypsum is indispensable for groundnut peg penetration and preventing 'pops' (empty pods).",
            "Drip irrigation with mulching saves up to 50% water in drought-prone Saurashtra."
        ]
    },
    "Rajasthan": {
        "zone_name": "Arid Thar Desert & Eastern Semi-Arid Plains",
        "districts_sample": ["Jodhpur", "Bikaner", "Barmer", "Jaipur", "Kota", "Alwar", "Nagaur", "Sri Ganganagar"],
        "soil_type": "Desert Sandy Soil (Thar) to Mixed Red & Black / Alluvial (East)",
        "soil_description": "Wind-blown coarse sand with very low organic carbon (<0.3%) and rapid infiltration. High potassium but poor water holding capacity.",
        "baseline_soil": {
            "nitrogen": 80.0,         # Very Low
            "phosphorus": 30.0,
            "potassium": 195.0,
            "ph": 8.3,                # Alkaline calcareous
            "organic_carbon_pct": 0.28,
            "salinity_ec": 0.72
        },
        "micronutrient_deficiencies": [
            "Zinc (Zn) - 60% deficiency",
            "Iron (Fe) - High calcium carbonate fixes iron",
            "Nitrogen (N) - Acute deficiency due to low organic matter"
        ],
        "primary_crops": ["bajra", "mustard", "mothbeans", "wheat", "barley", "chickpea", "garlic", "coriander"],
        "fertilizer_package": {
            "bajra": {
                "npk_ratio": "60:30:20 kg/ha",
                "urea_bags": "1.2 bags/acre (1/2 at sowing, 1/2 after rainfall shower at tillering)",
                "dap_bags": "0.6 bag/acre",
                "micronutrient": "Mix 25 kg/ha Zinc Sulphate with FYM before broadcast"
            },
            "mustard": {
                "npk_ratio": "80:40:20 kg/ha + 250 kg Gypsum/ha",
                "urea_bags": "1.6 bags/acre (split at sowing and first irrigation)",
                "dap_bags": "0.8 bag/acre",
                "micronutrient": "Foliar spray of 0.2% Borax at flowering"
            }
        },
        "management_tips": [
            "Apply FYM or Vermicompost (5-8 t/ha) to create moisture-sponges in sandy soils.",
            "Use sprinkler and micro-drip systems; furrow flood irrigation causes 70% percolation losses."
        ]
    },
    "Karnataka": {
        "zone_name": "Deccan Southern Plateau & Western Ghats / Coastal Zone",
        "districts_sample": ["Belagavi", "Dharwad", "Raichur", "Mysuru", "Hassan", "Coorg", "Shimoga"],
        "soil_type": "Red Sandy Loam, Deep Black (North), Laterite (Coastal/Malnad)",
        "soil_description": "Highly varied: North has rich black soils; South has porous red loams; Western Ghats have acidic laterites rich in humus.",
        "baseline_soil": {
            "nitrogen": 115.0,
            "phosphorus": 40.0,
            "potassium": 150.0,
            "ph": 6.6,
            "organic_carbon_pct": 0.58,
            "salinity_ec": 0.32
        },
        "micronutrient_deficiencies": [
            "Zinc (Zn) - In black soils and rice belts",
            "Boron (B) - In sunflower and coffee belts",
            "Magnesium (Mg) - Interveinal chlorosis in acidic plantation soils"
        ],
        "primary_crops": ["coffee", "maize", "sugarcane", "cotton", "rice", "ginger", "turmeric", "jowar"],
        "fertilizer_package": {
            "coffee": {
                "npk_ratio": "140:90:140 kg/ha (Split pre-monsoon and post-monsoon)",
                "urea_bags": "Custom plantation blends with Rock Phosphate",
                "mop_bags": "Muriate of Potash applied post-monsoon for bean filling",
                "micronutrient": "Dolomite liming (1-2 t/ha) once every 3 years to correct acidity (target pH 6.0-6.5)"
            },
            "ginger": {
                "npk_ratio": "100:60:100 kg/ha",
                "urea_bags": "2.0 bags/acre in 4 splits",
                "dap_bags": "1.2 bags/acre basal",
                "mop_bags": "1.2 bags/acre",
                "micronutrient": "Heavy organic mulching with green leaves (10-12 t/ha)"
            }
        },
        "management_tips": [
            "Apply agricultural lime or dolomite in Malnad/Coorg acidic tracts to unlock phosphorus.",
            "Use contour bunding in red sloping soils to arrest topsoil runoff."
        ]
    },
    "Tamil Nadu": {
        "zone_name": "Cauvery Delta & Southern Plains",
        "districts_sample": ["Thanjavur", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Erode"],
        "soil_type": "Cauvery Delta Alluvial, Red Loam & Black Soil Tracts",
        "soil_description": "Rich deltaic alluvium in the east; fertile red and black loams in the western kongu belt.",
        "baseline_soil": {
            "nitrogen": 120.0,
            "phosphorus": 45.0,
            "potassium": 165.0,
            "ph": 7.3,
            "organic_carbon_pct": 0.52,
            "salinity_ec": 0.40
        },
        "micronutrient_deficiencies": [
            "Zinc (Zn) - Common in Kuruvai/Thaladi paddy crops",
            "Iron (Fe) - In calcareous black soil pockets",
            "Boron (B) - In coconut and banana tracts"
        ],
        "primary_crops": ["rice", "banana", "coconut", "sugarcane", "groundnut", "turmeric", "cotton", "tea"],
        "fertilizer_package": {
            "banana": {
                "npk_ratio": "200:50:300 g/plant (Annual Schedule)",
                "urea_bags": "Split monthly from 2nd to 7th month after planting",
                "mop_bags": "Heavy potash needed for bunch weight and finger length",
                "micronutrient": "Banana special micronutrient mixture spray @ 5 g/L"
            },
            "coconut": {
                "npk_ratio": "500:320:1200 g/palm/year",
                "urea_bags": "1.1 kg Urea/palm in two splits (June-July and Dec-Jan)",
                "dap_bags": "0.7 kg DAP/palm",
                "mop_bags": "2.0 kg MOP/palm (crucial for button shedding prevention)",
                "micronutrient": "Apply 50 kg FYM + 1 kg Magnesium Sulphate + 50 g Borax per palm annually"
            }
        },
        "management_tips": [
            "Use Azolla bio-fertilizer in rice wetlands to contribute 20-30 kg N/ha naturally.",
            "Apply neem cake blended urea (5:1) to retard nitrification and leaching."
        ]
    },
    "Kerala": {
        "zone_name": "Coastal Humid Tropics & Highland Laterite Belt",
        "districts_sample": ["Palakkad", "Wayanad", "Idukki", "Alappuzha", "Kottayam", "Thrissur"],
        "soil_type": "Laterite (Acidic), Coastal Alluvium, and Acid Saline (Kuttanad Kari soils)",
        "soil_description": "Strongly acidic (pH 4.8 - 5.8), heavily leached of bases due to 3000 mm annual rainfall. Rich in iron and aluminum oxides.",
        "baseline_soil": {
            "nitrogen": 130.0,
            "phosphorus": 28.0,       # P easily fixed by iron/aluminum
            "potassium": 110.0,       # Heavy leaching losses
            "ph": 5.2,                # Strongly acidic
            "organic_carbon_pct": 0.95, # High organic carbon
            "salinity_ec": 0.28
        },
        "micronutrient_deficiencies": [
            "Calcium (Ca) & Magnesium (Mg) - Extremely low",
            "Boron (B) - Severe in coconut, pepper, and rubber",
            "Molybdenum (Mo) - Low availability in acidic soils"
        ],
        "primary_crops": ["coconut", "coffee", "tea", "banana", "rice", "ginger", "turmeric"],
        "fertilizer_package": {
            "tea": {
                "npk_ratio": "130:40:80 kg/ha",
                "urea_bags": "Applied in 4-5 splits following rainfall flushes",
                "mop_bags": "Muriate of Potash split pre-monsoon and post-monsoon",
                "micronutrient": "Zinc Sulphate (1%) + Urea (2%) foliar spray after every major plucking"
            },
            "rubber_plantation": {
                "npk_ratio": "12:12:12 or 10:10:10 plantation mixtures",
                "liming": "Agricultural lime application (500 kg/ha) is mandatory before monsoon"
            }
        },
        "management_tips": [
            "Liming with Agricultural Lime or Dolomite is non-negotiable to bring pH above 5.8 and release fixed phosphorus.",
            "Use Rock Phosphate (Mussoorie Rock Phosphate) instead of water-soluble DAP/SSP for slow acid dissolution."
        ]
    },
    "West Bengal": {
        "zone_name": "Lower Gangetic Delta & Terai Belt",
        "districts_sample": ["Burdwan", "Hooghly", "Murshidabad", "Nadia", "24 Parganas", "Jalpaiguri"],
        "soil_type": "Gangetic Alluvial, Coastal Saline (Sundarbans), Terai Acidic Loam",
        "soil_description": "Deep silty alluvium with high natural fertility; deltaic areas prone to seasonal inundation and salinity.",
        "baseline_soil": {
            "nitrogen": 135.0,
            "phosphorus": 46.0,
            "potassium": 160.0,
            "ph": 6.8,
            "organic_carbon_pct": 0.65,
            "salinity_ec": 0.48
        },
        "micronutrient_deficiencies": [
            "Zinc (Zn) - In Boro (winter) rice ecosystems",
            "Boron (B) - In mustard and cauliflower belts",
            "Molybdenum (Mo) - In acidic Terai soils"
        ],
        "primary_crops": ["rice", "jute", "potato", "mustard", "tea", "maize", "banana"],
        "fertilizer_package": {
            "jute": {
                "npk_ratio": "60:30:30 kg/ha",
                "urea_bags": "1.2 bags/acre (1/2 basal, 1/2 top dressed after first weeding at 3 weeks)",
                "dap_bags": "0.6 bag/acre",
                "mop_bags": "0.4 bag/acre (improves fiber tensile strength)"
            },
            "rice": {
                "npk_ratio": "100:50:50 kg/ha (Aman) / 120:60:60 (Boro)",
                "urea_bags": "2.2 bags/acre in 3 equal splits",
                "dap_bags": "1.0 bag/acre",
                "mop_bags": "0.7 bag/acre"
            }
        },
        "management_tips": [
            "Jute leaves add 3-4 tons of organic biomass per hectare; incorporate stubble for next paddy crop.",
            "In coastal saline soils, maintain fresh water ponding and grow salt-tolerant varieties (e.g., Gosaba-6, Luna Sankhi)."
        ]
    },
    "Bihar": {
        "zone_name": "Middle Gangetic Alluvial Plains",
        "districts_sample": ["Patna", "Muzaffarpur", "Bhagalpur", "Gaya", "Samastipur", "Purnea"],
        "soil_type": "Alluvial Silt Loam & Calcareous Clay (Tal and Diara tracts)",
        "soil_description": "Rich floodplain soils deposited by Ganga, Gandak, and Kosi rivers. Calcareous soils in north-west with high free CaCO3.",
        "baseline_soil": {
            "nitrogen": 118.0,
            "phosphorus": 40.0,
            "potassium": 165.0,
            "ph": 7.6,
            "organic_carbon_pct": 0.46,
            "salinity_ec": 0.36
        },
        "micronutrient_deficiencies": [
            "Zinc (Zn) - 48% deficiency",
            "Boron (B) - Causes internal browning in cauliflower and empty earheads in wheat",
            "Iron (Fe) - In high CaCO3 calcareous soils"
        ],
        "primary_crops": ["rice", "wheat", "maize", "potato", "sugarcane", "lentil", "chickpea"],
        "fertilizer_package": {
            "maize": {
                "npk_ratio": "120:60:40 kg/ha (Rabi / Winter Maize)",
                "urea_bags": "2.5 bags/acre (in 3 splits: knee-high, tasseling, and grain filling)",
                "dap_bags": "1.2 bags/acre basal",
                "mop_bags": "0.6 bag/acre",
                "micronutrient": "Zinc Sulphate 25 kg/ha applied basal"
            }
        },
        "management_tips": [
            "Rabi maize has the highest yield potential (60-80 quintals/ha) in India; ensure timely knee-high fertilization.",
            "Diara lands benefit from early rabi pulse sowing on receding flood moisture."
        ]
    },
    "Andhra Pradesh": {
        "zone_name": "Krishna-Godavari Coastal Belt & Rayalaseema",
        "districts_sample": ["Guntur", "Krishna", "Kurnool", "East Godavari", "Anantapur", "Kadapa"],
        "soil_type": "Coastal Alluvial, Black Cotton, Red Sandy (Rayalaseema)",
        "soil_description": "Highly fertile delta alluvium along the coast; semi-arid drought-prone red/black soils in Rayalaseema.",
        "baseline_soil": {
            "nitrogen": 110.0,
            "phosphorus": 48.0,
            "potassium": 190.0,
            "ph": 7.6,
            "organic_carbon_pct": 0.44,
            "salinity_ec": 0.42
        },
        "micronutrient_deficiencies": [
            "Zinc (Zn) - Intensive paddy-chilli systems",
            "Sulphur (S) - In groundnut belt of Rayalaseema",
            "Boron (B) - In sunflower and horticulture"
        ],
        "primary_crops": ["chilli", "rice", "cotton", "groundnut", "maize", "tobacco", "sugarcane"],
        "fertilizer_package": {
            "chilli": {
                "npk_ratio": "150:60:80 kg/ha",
                "urea_bags": "3.0 bags/acre (split across 5 fertigation/topdress intervals)",
                "dap_bags": "1.2 bags/acre",
                "mop_bags": "1.2 bags/acre (potash enhances fruit capsanthin red color and firmness)",
                "micronutrient": "Spray Formula-4 micronutrient cocktail every 20 days during flowering"
            }
        },
        "management_tips": [
            "Excessive nitrogen in chilli causes massive flower drop; balance with potassium and calcium nitrate.",
            "Farm pond rainwater harvesting is crucial for supplemental lifesaving irrigation in Rayalaseema."
        ]
    },
    "Telangana": {
        "zone_name": "Deccan Semi-Arid Plateau (Northern Black & Southern Red Soils)",
        "districts_sample": ["Warangal", "Karimnagar", "Nizamabad", "Khammam", "Nalgonda", "Mahabubnagar"],
        "soil_type": "Red Sandy Loams (Dubba / Chalkas) & Deep Black (Regur)",
        "soil_description": "Chalka soils are shallow, highly porous with rapid percolation; Regur soils in Nizamabad and Adilabad retain deep moisture.",
        "baseline_soil": {
            "nitrogen": 105.0,
            "phosphorus": 42.0,
            "potassium": 170.0,
            "ph": 7.2,
            "organic_carbon_pct": 0.42,
            "salinity_ec": 0.35
        },
        "micronutrient_deficiencies": [
            "Zinc (Zn) - In canal command rice",
            "Iron (Fe) - Calcareous black soils",
            "Boron (B) - In cotton and turmeric"
        ],
        "primary_crops": ["cotton", "rice", "maize", "turmeric", "soybean", "chilli", "pigeonpeas"],
        "fertilizer_package": {
            "turmeric": {
                "npk_ratio": "150:60:100 kg/ha",
                "urea_bags": "3.0 bags/acre in 4 equal splits at 30, 60, 90, 120 days",
                "dap_bags": "1.2 bags/acre basal",
                "mop_bags": "1.5 bags/acre (potash is key for rhizome size and curcumin development)",
                "micronutrient": "Apply 25 kg Zinc Sulphate + 10 kg Ferrous Sulphate basal"
            }
        },
        "management_tips": [
            "In Red Chalka soils, split nitrogen into 4-5 small doses to prevent deep leaching below root zone.",
            "Ridge and furrow planting in cotton reduces root rot and improves soil drainage."
        ]
    },
    "Odisha": {
        "zone_name": "Eastern Coastal Plains & Central Highlands",
        "districts_sample": ["Cuttack", "Balasore", "Sambalpur", "Ganjam", "Kalahandi", "Koraput"],
        "soil_type": "Red & Yellow Soils, Coastal Alluvial, Lateritic Soils",
        "soil_description": "Coastal alluvium in Mahanadi delta; red and yellow soils in interior highlands have acidic to neutral reaction and low organic carbon.",
        "baseline_soil": {
            "nitrogen": 115.0,
            "phosphorus": 32.0,
            "potassium": 140.0,
            "ph": 6.2,
            "organic_carbon_pct": 0.50,
            "salinity_ec": 0.35
        },
        "micronutrient_deficiencies": [
            "Zinc (Zn) - In coastal waterlogged rice",
            "Boron (B) - In groundnut and pulses",
            "Molybdenum (Mo) - In acidic upland soils"
        ],
        "primary_crops": ["rice", "pulses", "groundnut", "mustard", "sugarcane", "jute", "tea"],
        "fertilizer_package": {
            "rice": {
                "npk_ratio": "80:40:40 kg/ha (Kharif upland) / 120:60:60 (Irrigated command)",
                "urea_bags": "1.8 bags/acre in 3 splits",
                "dap_bags": "0.8 bag/acre",
                "mop_bags": "0.6 bag/acre"
            }
        },
        "management_tips": [
            "Apply Paper Mill Sludge or Basic Slag (1-2 t/ha) to reclaim acidic upland red soils economically.",
            "Promote non-paddy crops (pulses, oilseeds) in uplands to reduce water risk."
        ]
    },
    "Assam & North East": {
        "zone_name": "Brahmaputra Valley & Himalayan Acidic Hills",
        "districts_sample": ["Kamrup", "Jorhat", "Dibrugarh", "Nagaon", "Sonitpur", "Cachar"],
        "soil_type": "Acidic Alluvial (Brahmaputra Plain) & Hill Red Loam",
        "soil_description": "Heavy monsoon rainfall has leached bases, causing acidity (pH 4.5 - 5.5). High organic matter in hill soils but high phosphorus fixation.",
        "baseline_soil": {
            "nitrogen": 140.0,        # High organic nitrogen
            "phosphorus": 26.0,       # Low available P due to acid fixation
            "potassium": 120.0,
            "ph": 5.1,                # Acidic
            "organic_carbon_pct": 0.90,
            "salinity_ec": 0.20
        },
        "micronutrient_deficiencies": [
            "Boron (B) - Severe deficiency across tea and vegetable crops",
            "Zinc (Zn) - In acidic alluvial plains",
            "Molybdenum (Mo) - Critical for cauliflower and crucifers"
        ],
        "primary_crops": ["tea", "rice", "jute", "mustard", "ginger", "turmeric", "banana"],
        "fertilizer_package": {
            "tea": {
                "npk_ratio": "120:40:90 kg/ha",
                "urea_bags": "Applied in 3 flushes (March, June, September)",
                "mop_bags": "Applied post-monsoon",
                "micronutrient": "Foliar Zinc Sulphate (1%) + Magnesium Sulphate (1%)"
            },
            "ginger": {
                "npk_ratio": "75:50:50 kg/ha",
                "urea_bags": "1.5 bags/acre in 3 splits",
                "dap_bags": "1.0 bag/acre",
                "mop_bags": "0.7 bag/acre",
                "micronutrient": "Rock Phosphate applied at bed formation"
            }
        },
        "management_tips": [
            "Apply 200-400 kg/ha Agricultural Lime once every 3 years to mobilize soil phosphorus.",
            "Use Rock Phosphate rather than DAP to prevent rapid chemical fixation in acid soils."
        ]
    },
    "Jammu & Kashmir": {
        "zone_name": "Temperate Western Himalayas & Subtropical Jammu",
        "districts_sample": ["Srinagar", "Baramulla", "Anantnag", "Pulwama", "Jammu", "Kathua"],
        "soil_type": "Karewa Lacustrine Soils (Kashmir) & Alluvial Loam (Jammu)",
        "soil_description": "Karewas are deep silty loams with high lime and organic content, ideal for saffron and temperate fruit orchards.",
        "baseline_soil": {
            "nitrogen": 130.0,
            "phosphorus": 38.0,
            "potassium": 185.0,
            "ph": 7.2,
            "organic_carbon_pct": 0.85,
            "salinity_ec": 0.30
        },
        "micronutrient_deficiencies": [
            "Zinc (Zn) - In apple and paddy crops",
            "Boron (B) - Essential for apple fruit set and cork prevention",
            "Iron (Fe) - In high pH Karewa deposits"
        ],
        "primary_crops": ["apple", "saffron", "walnut", "rice", "maize", "wheat", "mustard"],
        "fertilizer_package": {
            "apple": {
                "npk_ratio": "700:350:700 g/tree/year for mature bearing tree",
                "urea_bags": "Applied in 2 splits: bud break and fruit set",
                "dap_bags": "Applied in late autumn with FYM",
                "mop_bags": "Applied at fruit development for coloration",
                "micronutrient": "Foliar Boric Acid (0.1%) at pink bud stage; Calcium Chloride (0.3%) sprays for bitter pit prevention"
            }
        },
        "management_tips": [
            "Mulch tree basins with dry straw or black poly sheets to conserve melting snow moisture.",
            "Avoid excessive late-season nitrogen on apple trees to prevent fire blight and winter frost injury."
        ]
    },
    "Himachal Pradesh & Uttarakhand": {
        "zone_name": "Mid to High Western Himalayan Valleys",
        "districts_sample": ["Shimla", "Kullu", "Mandi", "Dehradun", "Nainital", "Haridwar"],
        "soil_type": "Brown Forest Soils & Mountain Podzols",
        "soil_description": "Rich in organic humus, coarse textured on slopes with high permeability. Acidic to neutral reaction.",
        "baseline_soil": {
            "nitrogen": 125.0,
            "phosphorus": 35.0,
            "potassium": 160.0,
            "ph": 6.4,
            "organic_carbon_pct": 0.78,
            "salinity_ec": 0.25
        },
        "micronutrient_deficiencies": [
            "Boron (B) - High deficiency in stone fruits and apples",
            "Zinc (Zn) - Little leaf disorder in orchards",
            "Calcium (Ca) - Fruit cracking in apples and cherries"
        ],
        "primary_crops": ["apple", "potato", "maize", "wheat", "ginger", "garlic", "rice"],
        "fertilizer_package": {
            "potato": {
                "npk_ratio": "120:80:100 kg/ha",
                "urea_bags": "2.4 bags/acre",
                "dap_bags": "1.6 bags/acre",
                "mop_bags": "1.2 bags/acre",
                "micronutrient": "FYM (15 t/ha) incorporated into hill terraces"
            }
        },
        "management_tips": [
            "Terrace farming with vegetative contour barriers (Vetiver / Napier) arrests mountain soil erosion.",
            "Incorporate compost heavily to insulate root zones from winter freezing."
        ]
    }
}

def get_all_states() -> List[str]:
    """Returns sorted list of all registered Indian states/regions."""
    return sorted(list(INDIAN_SOIL_FERTILIZER_REGISTRY.keys()))

def get_state_soil_profile(state_name: str) -> Optional[Dict[str, Any]]:
    """Retrieves detailed soil baseline and agronomic characteristics for a given state."""
    return INDIAN_SOIL_FERTILIZER_REGISTRY.get(state_name)

def get_state_fertilizer_package(state_name: str, crop_name: str) -> Optional[Dict[str, Any]]:
    """Retrieves specific fertilizer package for a state and crop combination if available."""
    profile = get_state_soil_profile(state_name)
    if profile and "fertilizer_package" in profile:
        crop_clean = crop_name.lower().strip()
        packages = profile["fertilizer_package"]
        if crop_clean in packages:
            return packages[crop_clean]
        # Return generic advice if crop not specifically listed
        return {
            "note": f"Crop '{crop_name}' is grown in {state_name}. General ICAR recommendation applies.",
            "guideline": f"Use baseline soil test (N:{profile['baseline_soil']['nitrogen']}, P:{profile['baseline_soil']['phosphorus']}, K:{profile['baseline_soil']['potassium']}, pH:{profile['baseline_soil']['ph']}) to compute targeted yield dose."
        }
    return None
