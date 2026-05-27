#!/usr/bin/env python3
"""
Download a small sample of DogSpeak from HuggingFace (50 per breed = ~250 files)
instead of cloning the full 3.8GB dataset.

Usage:
  pip3 install huggingface_hub pandas
  python3 scripts/download_dogspeak_sample.py
"""

from __future__ import annotations

import csv
import io
import os
import random
from pathlib import Path

from huggingface_hub import hf_hub_download, HfFileSystem

REPO = "xtr43r/DogSpeak_Dataset"
SAMPLES_PER_BREED = 50
OUT_DIR = Path(__file__).resolve().parent.parent / "datasets" / "dogspeak" / "dogspeak_released"
SEED = 42


def main():
    print("Downloading metadata.csv...")
    meta_path = hf_hub_download(
        repo_id=REPO,
        filename="metadata.csv",
        repo_type="dataset",
    )

    by_breed: dict[str, list[dict]] = {}
    with open(meta_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            breed = row["breed"].strip().lower()
            by_breed.setdefault(breed, []).append(row)

    print(f"Found breeds: {list(by_breed.keys())}")
    for breed, rows in by_breed.items():
        print(f"  {breed}: {len(rows)} total clips")

    random.seed(SEED)
    to_download: list[dict] = []
    for breed, rows in sorted(by_breed.items()):
        sampled = random.sample(rows, min(SAMPLES_PER_BREED, len(rows)))
        to_download.extend(sampled)
        print(f"  Sampling {len(sampled)} from {breed}")

    print(f"\nDownloading {len(to_download)} wav files...")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for i, row in enumerate(to_download):
        filename = row["filename"].strip()
        dog_id = row["dog_id"].strip()
        repo_path = f"dogspeak_released/{dog_id}/{filename}"

        dog_dir = OUT_DIR / dog_id
        dog_dir.mkdir(exist_ok=True)
        dest = dog_dir / filename

        if dest.exists():
            continue

        try:
            downloaded = hf_hub_download(
                repo_id=REPO,
                filename=repo_path,
                repo_type="dataset",
            )
            os.link(downloaded, str(dest)) if not dest.exists() else None
        except Exception:
            try:
                import shutil
                downloaded = hf_hub_download(
                    repo_id=REPO,
                    filename=repo_path,
                    repo_type="dataset",
                )
                shutil.copy2(downloaded, str(dest))
            except Exception as e:
                print(f"  [{i+1}/{len(to_download)}] SKIP {filename}: {e}")
                continue

        if (i + 1) % 25 == 0 or i == len(to_download) - 1:
            print(f"  [{i+1}/{len(to_download)}] downloaded")

    print(f"\nDone! Files in {OUT_DIR}")
    print(f"Now run: python3 scripts/preprocess.py --dog-dir {OUT_DIR}")


if __name__ == "__main__":
    main()
