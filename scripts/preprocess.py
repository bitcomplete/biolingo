#!/usr/bin/env python3
"""
Preprocess CatMeows and DogSpeak datasets into JSON manifests
for browser-side nearest-neighbor matching.

Usage:
  pip install librosa numpy
  python scripts/preprocess.py --cat-dir path/to/catmeows --dog-dir path/to/dogspeak

The CatMeows dataset (dataset.zip) should be extracted so --cat-dir
points to the folder containing the .wav files.

The DogSpeak dataset should be extracted so --dog-dir points to the
dogspeak_released/ folder containing dog_N/ subdirectories.

Outputs:
  public/manifests/cat-manifest.json
  public/manifests/dog-manifest.json
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Optional

import librosa
import numpy as np

SAMPLE_RATE = 16000
N_MFCC = 13
N_FFT = 512
HOP_LENGTH = 160
WIN_LENGTH = 400
N_MELS = 26
F_MIN = 0
F_MAX = 8000

DOG_SAMPLES_PER_BREED = 50


def extract_features(wav_path: str) -> list[float] | None:
    """Extract MFCC mean + std (26-dim) from a wav file."""
    try:
        y, sr = librosa.load(wav_path, sr=SAMPLE_RATE, mono=True)
    except Exception as e:
        print(f"  [skip] {wav_path}: {e}", file=sys.stderr)
        return None

    if len(y) < WIN_LENGTH:
        return None

    mfccs = librosa.feature.mfcc(
        y=y,
        sr=sr,
        n_mfcc=N_MFCC,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
        win_length=WIN_LENGTH,
        n_mels=N_MELS,
        fmin=F_MIN,
        fmax=F_MAX,
    )

    mean = np.mean(mfccs, axis=1)
    std = np.std(mfccs, axis=1)
    features = np.concatenate([mean, std])
    return [round(float(x), 4) for x in features]


# ---------- CatMeows ----------

CAT_CONTEXT_MAP = {"B": "brushing", "F": "food", "I": "isolation"}
CAT_BREED_MAP = {"MC": "maine_coon", "EU": "european_shorthair"}
CAT_SEX_MAP = {"FI": "female", "FN": "female", "MI": "male", "MN": "male"}
CAT_FILENAME_RE = re.compile(
    r"^([BFI])_(\w+)_([A-Z]{2})_([A-Z]{2})_(\w+)_(\d+)\.wav$", re.IGNORECASE
)


def process_catmeows(cat_dir: str) -> dict:
    entries = []
    wav_dir = Path(cat_dir)
    files = sorted(wav_dir.glob("*.wav"))
    print(f"CatMeows: found {len(files)} wav files in {cat_dir}")

    for wav in files:
        m = CAT_FILENAME_RE.match(wav.name)
        if not m:
            print(f"  [skip] unrecognized filename: {wav.name}", file=sys.stderr)
            continue

        context_code, cat_id, breed_code, sex_code, owner, session = m.groups()
        context = CAT_CONTEXT_MAP.get(context_code.upper())
        breed = CAT_BREED_MAP.get(breed_code.upper())
        sex = CAT_SEX_MAP.get(sex_code.upper())
        if not context or not breed:
            continue

        features = extract_features(str(wav))
        if features is None:
            continue

        entries.append(
            {
                "id": wav.stem,
                "context": context,
                "breed": breed,
                "sex": sex or "female",
                "features": features,
            }
        )

    print(f"CatMeows: {len(entries)} entries processed")
    return {"sampleRate": SAMPLE_RATE, "numMfcc": N_MFCC, "entries": entries}


# ---------- DogSpeak ----------

DOG_FILENAME_RE = re.compile(r"^\d+_(\w+)_([MF])_(dog_\w+)\.wav$", re.IGNORECASE)

DOG_BREED_NORMALIZE: dict[str, str] = {
    "gsd": "german_shepherd",
    "german shepherd": "german_shepherd",
    "shibainu": "shiba",
    "shiba inu": "shiba",
    "chihuahua": "chihuahua",
    "husky": "husky",
    "pitbull": "pitbull",
}


def process_dogspeak(dog_dir: str) -> dict:
    base = Path(dog_dir)
    by_breed: dict[str, list[Path]] = {}

    for wav in sorted(base.rglob("*.wav")):
        m = DOG_FILENAME_RE.match(wav.name)
        if not m:
            continue
        raw_breed = m.group(1).lower()
        breed = DOG_BREED_NORMALIZE.get(raw_breed, raw_breed)
        by_breed.setdefault(breed, []).append(wav)

    print(f"DogSpeak: found {sum(len(v) for v in by_breed.values())} wav files across {list(by_breed.keys())}")

    entries = []
    for breed, wavs in sorted(by_breed.items()):
        rng = np.random.default_rng(seed=42)
        sampled = (
            [wavs[i] for i in rng.choice(len(wavs), DOG_SAMPLES_PER_BREED, replace=False)]
            if len(wavs) > DOG_SAMPLES_PER_BREED
            else wavs
        )
        print(f"  {breed}: sampling {len(sampled)} / {len(wavs)}")

        for wav in sampled:
            m = DOG_FILENAME_RE.match(wav.name)
            if not m:
                continue
            sex_code = m.group(2).upper()
            sex = "male" if sex_code == "M" else "female"
            features = extract_features(str(wav))
            if features is None:
                continue
            entries.append(
                {
                    "id": wav.stem,
                    "breed": breed,
                    "sex": sex,
                    "features": features,
                }
            )

    print(f"DogSpeak: {len(entries)} entries processed")
    return {"sampleRate": SAMPLE_RATE, "numMfcc": N_MFCC, "entries": entries}


# ---------- Main ----------


def main():
    parser = argparse.ArgumentParser(description="Generate audio feature manifests")
    parser.add_argument("--cat-dir", help="Path to extracted CatMeows wav folder")
    parser.add_argument("--dog-dir", help="Path to extracted DogSpeak dogspeak_released/ folder")
    args = parser.parse_args()

    out_dir = Path(__file__).resolve().parent.parent / "public" / "manifests"
    out_dir.mkdir(parents=True, exist_ok=True)

    if args.cat_dir:
        manifest = process_catmeows(args.cat_dir)
        out = out_dir / "cat-manifest.json"
        with open(out, "w") as f:
            json.dump(manifest, f)
        print(f"Wrote {out} ({len(manifest['entries'])} entries)")

    if args.dog_dir:
        manifest = process_dogspeak(args.dog_dir)
        out = out_dir / "dog-manifest.json"
        with open(out, "w") as f:
            json.dump(manifest, f)
        print(f"Wrote {out} ({len(manifest['entries'])} entries)")

    if not args.cat_dir and not args.dog_dir:
        parser.print_help()
        print("\nProvide at least one of --cat-dir or --dog-dir")
        sys.exit(1)


if __name__ == "__main__":
    main()
