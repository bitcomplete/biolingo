const SAMPLE_RATE = 16000;
const FRAME_LENGTH = 400;   // 25ms at 16kHz
const HOP_LENGTH = 160;     // 10ms hop
const FFT_SIZE = 512;       // next power of 2 >= FRAME_LENGTH
const NUM_MEL_BANDS = 26;
const NUM_MFCC = 13;
const F_MIN = 0;
const F_MAX = 8000;         // Nyquist at 16kHz

function hzToMel(hz: number): number {
  return 2595 * Math.log10(1 + hz / 700);
}

function melToHz(mel: number): number {
  return 700 * (Math.pow(10, mel / 2595) - 1);
}

let _hannWindow: Float64Array | null = null;
function getHannWindow(): Float64Array {
  if (_hannWindow) return _hannWindow;
  _hannWindow = new Float64Array(FRAME_LENGTH);
  for (let i = 0; i < FRAME_LENGTH; i++) {
    _hannWindow[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (FRAME_LENGTH - 1)));
  }
  return _hannWindow;
}

let _melFilterbank: Float64Array[] | null = null;
function getMelFilterbank(): Float64Array[] {
  if (_melFilterbank) return _melFilterbank;

  const numBins = FFT_SIZE / 2 + 1;
  const melMin = hzToMel(F_MIN);
  const melMax = hzToMel(F_MAX);
  const numPoints = NUM_MEL_BANDS + 2;

  const melPoints = new Float64Array(numPoints);
  for (let i = 0; i < numPoints; i++) {
    melPoints[i] = melMin + ((melMax - melMin) * i) / (numPoints - 1);
  }

  const binPoints = new Int32Array(numPoints);
  for (let i = 0; i < numPoints; i++) {
    binPoints[i] = Math.floor(((FFT_SIZE + 1) * melToHz(melPoints[i])) / SAMPLE_RATE);
  }

  const filters: Float64Array[] = [];
  for (let m = 0; m < NUM_MEL_BANDS; m++) {
    const filter = new Float64Array(numBins);
    const start = binPoints[m];
    const center = binPoints[m + 1];
    const end = binPoints[m + 2];

    for (let k = start; k < center; k++) {
      if (center !== start) filter[k] = (k - start) / (center - start);
    }
    for (let k = center; k <= end; k++) {
      if (end !== center) filter[k] = (end - k) / (end - center);
    }
    filters.push(filter);
  }

  _melFilterbank = filters;
  return filters;
}

/**
 * In-place radix-2 Cooley-Tukey FFT.
 * Both arrays must have length that is a power of 2.
 */
function fft(real: Float64Array, imag: Float64Array): void {
  const n = real.length;

  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    while (j & bit) {
      j ^= bit;
      bit >>= 1;
    }
    j ^= bit;

    if (i < j) {
      let tmp = real[i]; real[i] = real[j]; real[j] = tmp;
      tmp = imag[i]; imag[i] = imag[j]; imag[j] = tmp;
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const angle = (-2 * Math.PI) / len;
    const wR = Math.cos(angle);
    const wI = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let curR = 1;
      let curI = 0;
      const half = len >> 1;

      for (let j = 0; j < half; j++) {
        const a = i + j;
        const b = a + half;
        const tR = real[b] * curR - imag[b] * curI;
        const tI = real[b] * curI + imag[b] * curR;

        real[b] = real[a] - tR;
        imag[b] = imag[a] - tI;
        real[a] += tR;
        imag[a] += tI;

        const nextR = curR * wR - curI * wI;
        curI = curR * wI + curI * wR;
        curR = nextR;
      }
    }
  }
}

/**
 * DCT-II: extract the first `numCoeffs` coefficients from `input`.
 */
function dct(input: Float64Array, numCoeffs: number): Float64Array {
  const N = input.length;
  const out = new Float64Array(numCoeffs);
  const scale = Math.sqrt(2 / N);

  for (let k = 0; k < numCoeffs; k++) {
    let sum = 0;
    for (let n = 0; n < N; n++) {
      sum += input[n] * Math.cos((Math.PI * k * (2 * n + 1)) / (2 * N));
    }
    out[k] = sum * scale;
  }
  return out;
}

/**
 * Extract a fixed-length MFCC feature vector (mean + stddev of 13 coefficients = 26 dims)
 * from mono PCM samples at 16 kHz.
 */
export function extractMfccFeatures(samples: Float32Array): number[] {
  const window = getHannWindow();
  const filterbank = getMelFilterbank();
  const numBins = FFT_SIZE / 2 + 1;
  const numFrames = Math.max(1, Math.floor((samples.length - FRAME_LENGTH) / HOP_LENGTH) + 1);

  const allMfccs: Float64Array[] = [];

  for (let f = 0; f < numFrames; f++) {
    const offset = f * HOP_LENGTH;

    const real = new Float64Array(FFT_SIZE);
    const imag = new Float64Array(FFT_SIZE);
    for (let i = 0; i < FRAME_LENGTH && offset + i < samples.length; i++) {
      real[i] = samples[offset + i] * window[i];
    }

    fft(real, imag);

    const power = new Float64Array(numBins);
    for (let i = 0; i < numBins; i++) {
      power[i] = (real[i] * real[i] + imag[i] * imag[i]) / FFT_SIZE;
    }

    const melEnergies = new Float64Array(NUM_MEL_BANDS);
    for (let m = 0; m < NUM_MEL_BANDS; m++) {
      let sum = 0;
      const fb = filterbank[m];
      for (let k = 0; k < numBins; k++) {
        sum += power[k] * fb[k];
      }
      melEnergies[m] = Math.max(sum, 1e-10);
    }

    for (let m = 0; m < NUM_MEL_BANDS; m++) {
      melEnergies[m] = Math.log(melEnergies[m]);
    }

    allMfccs.push(dct(melEnergies, NUM_MFCC));
  }

  const features: number[] = new Array(NUM_MFCC * 2);

  for (let k = 0; k < NUM_MFCC; k++) {
    let sum = 0;
    for (let f = 0; f < numFrames; f++) sum += allMfccs[f][k];
    const mean = sum / numFrames;
    features[k] = mean;

    let sqSum = 0;
    for (let f = 0; f < numFrames; f++) {
      const d = allMfccs[f][k] - mean;
      sqSum += d * d;
    }
    features[NUM_MFCC + k] = Math.sqrt(sqSum / numFrames);
  }

  return features;
}

export { SAMPLE_RATE, NUM_MFCC };
