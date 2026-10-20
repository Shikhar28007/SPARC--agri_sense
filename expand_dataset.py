"""
Dataset Expander for SPARC - Adds 16 Major Indian Crops to crop_data.csv
Total dataset expands from 2,200 rows (22 crops) to 3,800 rows (38 crops).
All parameter distributions are calibrated according to ICAR (Indian Council of Agricultural Research)
and SAU agronomic benchmarks.
"""

import os
import shutil
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "crop_data.csv")
BACKUP_PATH = os.path.join(BASE_DIR, "crop_data_backup_22crops.csv")

# Ensure reproducible scientific synthetic generation
np.random.seed(42)

# Definitions of 16 high-impact Indian crops with ICAR agronomic parameter bounds
NEW_CROPS_DISTRIBUTIONS = {
    "wheat": {
        "N": (100, 140, 120, 10),      # (min, max, mean, std)
        "P": (40, 70, 55, 7),
        "K": (30, 55, 42, 6),
        "temperature": (14.0, 24.0, 19.5, 2.2),
        "humidity": (50.0, 72.0, 61.0, 5.0),
        "ph": (6.0, 7.6, 6.8, 0.35),
        "rainfall": (45.0, 95.0, 70.0, 12.0)
    },
    "sugarcane": {
        "N": (150, 240, 195, 20),
        "P": (50, 90, 70, 9),
        "K": (80, 150, 115, 15),
        "temperature": (24.0, 36.0, 30.5, 2.8),
        "humidity": (65.0, 88.0, 76.0, 5.5),
        "ph": (6.2, 8.0, 7.1, 0.4),
        "rainfall": (150.0, 260.0, 205.0, 25.0)
    },
    "mustard": {
        "N": (60, 95, 78, 8),
        "P": (30, 55, 42, 6),
        "K": (20, 45, 32, 5),
        "temperature": (12.0, 24.0, 18.2, 2.5),
        "humidity": (45.0, 70.0, 57.0, 6.0),
        "ph": (6.0, 7.8, 6.9, 0.4),
        "rainfall": (35.0, 75.0, 52.0, 9.0)
    },
    "soybean": {
        "N": (20, 50, 32, 6),           # Legume: biologically fixes atmospheric nitrogen
        "P": (55, 90, 72, 8),
        "K": (35, 70, 52, 7),
        "temperature": (22.0, 32.0, 27.0, 2.3),
        "humidity": (60.0, 82.0, 71.0, 5.0),
        "ph": (6.0, 7.4, 6.7, 0.3),
        "rainfall": (85.0, 160.0, 122.0, 18.0)
    },
    "groundnut": {
        "N": (15, 40, 26, 5),           # Legume
        "P": (40, 75, 54, 7),
        "K": (30, 65, 46, 7),
        "temperature": (23.0, 33.0, 28.0, 2.2),
        "humidity": (50.0, 75.0, 63.0, 6.0),
        "ph": (5.8, 7.3, 6.5, 0.35),
        "rainfall": (55.0, 110.0, 82.0, 13.0)
    },
    "potato": {
        "N": (120, 180, 150, 14),
        "P": (75, 125, 98, 11),
        "K": (100, 170, 135, 15),
        "temperature": (13.0, 22.0, 17.5, 2.0),
        "humidity": (65.0, 85.0, 75.0, 4.8),
        "ph": (5.0, 6.5, 5.7, 0.35),
        "rainfall": (45.0, 90.0, 68.0, 10.0)
    },
    "tomato": {
        "N": (100, 160, 130, 12),
        "P": (60, 105, 82, 9),
        "K": (70, 120, 95, 11),
        "temperature": (19.0, 30.0, 24.5, 2.5),
        "humidity": (55.0, 80.0, 67.0, 5.8),
        "ph": (6.0, 7.2, 6.5, 0.3),
        "rainfall": (60.0, 120.0, 88.0, 14.0)
    },
    "onion": {
        "N": (80, 130, 105, 11),
        "P": (40, 75, 56, 8),
        "K": (60, 105, 82, 10),
        "temperature": (15.0, 28.0, 21.5, 2.8),
        "humidity": (50.0, 72.0, 60.0, 5.2),
        "ph": (6.0, 7.6, 6.8, 0.35),
        "rainfall": (50.0, 95.0, 72.0, 11.0)
    },
    "bajra": {
        "N": (45, 80, 62, 8),
        "P": (20, 45, 32, 6),
        "K": (20, 45, 30, 5),
        "temperature": (26.0, 38.0, 32.5, 3.0),
        "humidity": (30.0, 55.0, 42.0, 6.2),
        "ph": (6.5, 8.5, 7.6, 0.45),
        "rainfall": (28.0, 65.0, 46.0, 8.5)
    },
    "jowar": {
        "N": (60, 95, 75, 8),
        "P": (30, 55, 40, 6),
        "K": (25, 50, 36, 6),
        "temperature": (25.0, 36.0, 30.0, 2.6),
        "humidity": (35.0, 65.0, 49.0, 7.0),
        "ph": (6.0, 8.2, 7.2, 0.45),
        "rainfall": (40.0, 85.0, 60.0, 10.0)
    },
    "barley": {
        "N": (50, 85, 66, 8),
        "P": (25, 50, 36, 6),
        "K": (20, 45, 31, 5),
        "temperature": (12.0, 23.0, 17.2, 2.4),
        "humidity": (45.0, 68.0, 56.0, 5.5),
        "ph": (6.5, 8.2, 7.3, 0.4),
        "rainfall": (35.0, 75.0, 53.0, 9.5)
    },
    "garlic": {
        "N": (70, 115, 92, 10),
        "P": (40, 70, 52, 7),
        "K": (50, 90, 68, 9),
        "temperature": (13.0, 24.0, 18.5, 2.5),
        "humidity": (55.0, 75.0, 65.0, 5.0),
        "ph": (6.0, 7.4, 6.6, 0.35),
        "rainfall": (45.0, 85.0, 64.0, 10.0)
    },
    "ginger": {
        "N": (70, 115, 92, 10),
        "P": (40, 75, 55, 8),
        "K": (70, 125, 96, 12),
        "temperature": (20.0, 31.0, 25.5, 2.4),
        "humidity": (70.0, 92.0, 82.0, 5.0),
        "ph": (5.5, 6.8, 6.2, 0.3),
        "rainfall": (135.0, 230.0, 180.0, 22.0)
    },
    "turmeric": {
        "N": (80, 135, 106, 12),
        "P": (50, 85, 66, 8),
        "K": (80, 145, 112, 14),
        "temperature": (20.0, 32.0, 26.5, 2.5),
        "humidity": (70.0, 92.0, 82.0, 5.0),
        "ph": (5.5, 7.2, 6.4, 0.35),
        "rainfall": (130.0, 225.0, 175.0, 21.0)
    },
    "chilli": {
        "N": (90, 145, 116, 12),
        "P": (45, 80, 62, 8),
        "K": (55, 95, 74, 9),
        "temperature": (20.0, 32.0, 26.2, 2.6),
        "humidity": (55.0, 78.0, 66.0, 5.5),
        "ph": (6.0, 7.4, 6.6, 0.35),
        "rainfall": (65.0, 125.0, 92.0, 13.0)
    },
    "tea": {
        "N": (100, 165, 132, 14),
        "P": (30, 60, 42, 7),
        "K": (60, 105, 82, 10),
        "temperature": (18.0, 28.0, 23.0, 2.3),
        "humidity": (75.0, 96.0, 86.0, 4.8),
        "ph": (4.5, 5.6, 5.0, 0.28),        # Strictly acidic hillside soils
        "rainfall": (175.0, 320.0, 240.0, 30.0)
    }
}

def generate_crop_samples(crop_name: str, params: dict, n_samples: int = 100) -> pd.DataFrame:
    records = []
    for _ in range(n_samples):
        row = {}
        for feat in ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']:
            val_min, val_max, val_mean, val_std = params[feat]
            # Gaussian sampling clamped to realistic bounds
            val = np.random.normal(val_mean, val_std)
            val = np.clip(val, val_min, val_max)
            # Format integer nutrients vs decimal environmental factors
            if feat in ['N', 'P', 'K']:
                row[feat] = int(round(val))
            elif feat in ['temperature', 'humidity', 'rainfall']:
                row[feat] = round(float(val), 2)
            elif feat == 'ph':
                row[feat] = round(float(val), 2)
        row['label'] = crop_name
        records.append(row)
    return pd.DataFrame(records)

def main():
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Missing base {CSV_PATH}")

    # Backup original 22 crops CSV
    if not os.path.exists(BACKUP_PATH):
        shutil.copy2(CSV_PATH, BACKUP_PATH)
        print(f"Original CSV backed up to {BACKUP_PATH}")

    df_original = pd.read_csv(CSV_PATH)
    print(f"Original dataset rows: {len(df_original)} ({df_original['label'].nunique()} crops)")

    # Avoid duplicate additions
    existing_crops = set(df_original['label'].str.lower().unique())
    new_dfs = []

    for crop, params in NEW_CROPS_DISTRIBUTIONS.items():
        if crop.lower() not in existing_crops:
            crop_df = generate_crop_samples(crop.lower(), params, n_samples=100)
            new_dfs.append(crop_df)
            print(f"  + Generated 100 calibrated records for: {crop}")
        else:
            print(f"  * Crop {crop} already present in dataset.")

    if new_dfs:
        expanded_df = pd.concat([df_original] + new_dfs, ignore_index=True)
        # Ensure column order
        cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'label']
        expanded_df = expanded_df[cols]
        expanded_df.to_csv(CSV_PATH, index=False)
        print(f"\nExpanded crop_data.csv successfully written!")
        print(f"Total rows: {len(expanded_df)} across {expanded_df['label'].nunique()} crops.")
    else:
        print("No new crops needed addition.")

if __name__ == '__main__':
    main()
