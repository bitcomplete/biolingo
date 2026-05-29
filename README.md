# Biolingo

**Duolingo, but for talking to your cat — and your dog.**

Learn *Felinetic* and *Caninetic*: real lessons with real acoustic targets, graded live by an AI coach with tenure, a grudge, and zero chill. Pass a unit and a fake international standards board issues you a certificate — complete with an AI-generated comedy portrait of your pet and a LinkedIn caption you can actually post.

A tiny, useless, joyful machine for people. AI is the main ingredient, not garnish.

See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for the 2-minute hackathon walkthrough.

---

## What it actually does

1. **Onboarding** — absurd "interspecies miscommunication" stats, then pick a language: 🐱 Felinetic or 🐶 Caninetic.
2. **Home** — units of lessons (Core / Emotional / Advanced phrases), XP, streak, and any certificates you've earned.
3. **Lesson** — you're shown a phrase to "say" (e.g. *"The food bowl situation is critical"*), the phoneme sequence (`MEW · MEW · MEW`), how to perform it, and a reference sound you can play.
4. **Record** — tap to record ~4 seconds of you meowing/barking.
5. **Grade** — your audio is scored locally against the lesson's acoustic targets, then the coach (**Professor Whiskers** for cats, **Dr. Barksworth** for dogs) delivers a short, brutal verdict *and* "what your pet actually heard" — the absurd artifact your sound really was.
6. **Analyze** — an on-device classifier guesses your pet's breed/dialect, mood, and sex from the same recording.
7. **Reward** — XP, confetti at 85%+, and finishing a unit unlocks a printable certificate with an AI-generated portrait of your (comedically reimagined) pet.

---

## Where AI shows up

Five distinct AI/DSP surfaces, each doing a job nothing else could:

| Surface | Tech | Job |
| --- | --- | --- |
| **The coach** | `gpt-4o` chat completions + a `give_coaching` structured tool call | Returns a persona-driven `comment` (the slap) and `heard` (the receipt). High temperature + presence/frequency penalties keep the jokes from repeating. |
| **The grader** | Web Audio API DSP (RMS volume, AMDF pitch, duration, burst detection) | Deterministic, local pass/fail gate and per-metric score. This is the *truth* the AI riffs on — the comedy is grounded in a real signal. |
| **The classifier** | MFCC features + cosine similarity against a bundled reference manifest | Reads breed/dialect, mood/context, and sex from your recording — powers the certificate dialect and the portrait. |
| **The portrait** | `gpt-4o-mini` "casting director" → `gpt-image-1` | Turns your aggregated breed + mood profile into one absurd, photoreal pet portrait for the certificate. Prefetched in the background so it's ready on claim. |
| **Fallbacks everywhere** | SVG + canned copy | No key or a failed call never breaks the demo — you get an illustrated placeholder instead of an error. |

No fine-tuning, no custom models — everything is prompt engineering against OpenAI's REST API plus hand-rolled browser DSP.

---

## Stack

- **Vite + React 18 + TypeScript** — single-page app
- **React Router 7** — `/onboarding`, `/select`, `/` (home), `/lesson/:animal/:lessonId`, `/roadmap`
- **OpenAI REST** — `gpt-4o` (coaching), `gpt-4o-mini` (portrait copy), `gpt-image-1` (portrait image)
- **Web Audio API** — local AMDF pitch detection + RMS volume meters and MFCC feature extraction
- **jsPDF + html2canvas** — export the earned certificate to PDF
- **lucide-react** — icons

> Note: `package.json` still lists `@openai/agents`, but the coach now talks to the chat-completions endpoint directly over `fetch`.

---

## Prerequisites

- **Node.js 18+** (Node 20 recommended)
- **An OpenAI API key** with access to `gpt-4o` and `gpt-image-1`. Generate one at https://platform.openai.com/api-keys.
- **A microphone** and a modern browser (Chrome, Edge, Brave, Safari 17+).

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env.local

# 3. Open .env.local and paste your OpenAI key
#    VITE_OPENAI_API_KEY=sk-proj-...
```

`.env.local` is gitignored. **Never commit a real key.** If you'd rather not put your key on disk, leave `.env.local` blank — the app prompts you to paste it on first use and stores it in `sessionStorage` (wiped when you close the tab).

> The app degrades gracefully without a key: lessons, scoring, and the classifier all run locally; only the coach's jokes and the AI portrait fall back to canned/illustrated placeholders.

---

## Run

```bash
npm run dev
```

Opens on http://localhost:5173. Grant mic permission when prompted.

Other scripts:

```bash
npm run build      # production build (tsc + vite build)
npm run preview    # serve the production build locally
npm run typecheck  # tsc --noEmit
```

---

## API keys & cost

The coach uses `gpt-4o` (a couple hundred tokens per attempt) and the certificate uses one `gpt-image-1` render per unit. A full demo session is a few cents. To run cheaper, swap `gpt-4o` → `gpt-4o-mini` in [src/agent.ts](src/agent.ts).

**Security note:** the browser calls the OpenAI API directly with the user's key. This is fine for local hackathon use — **do not deploy this as-is**. For any shared deploy, put a tiny backend in front to keep the key server-side.

---

## Project layout

```
src/
  main.tsx                  # router + entrypoint (onboarding gate)
  pages/
    OnboardingPage.tsx      # fake interspecies stats intro
    LanguageSelectPage.tsx  # pick Felinetic or Caninetic
    HomePage.tsx            # units, lessons, XP, certificates
    LessonPage.tsx          # the practice flow (state machine, record, grade)
    RoadmapPage.tsx         # future curriculum / more species
  components/               # FeedbackCard, Meters, TargetShape, Certificate, ...
  agent.ts                  # the coach: gpt-4o + give_coaching tool, personas
  data/
    lessons.ts              # 26 lessons (cat/dog × 3 units)
    sounds.ts               # reference sound clips per lesson
  analysis/
    matcher.ts              # MFCC + cosine-similarity breed/mood classifier
    mfcc.ts, translations.ts, types.ts
  hooks/
    useAudioAnalyser.ts     # live AMDF pitch + RMS volume
    useAudioCapture.ts      # raw sample capture for the classifier
  lib/
    scoring.ts              # metrics + deterministic gate/score
    certificates.ts         # proficiency, dialects, boards, captions
    imageGen.ts             # gpt-4o-mini copy → gpt-image-1 portrait (+ SVG fallback)
    portraitPrefetch.ts     # warm the portrait before the user claims it
    pdfExport.ts            # certificate → PDF
    personalityProfile.ts   # aggregate classifier votes over attempts
    progress.ts             # localStorage XP + completion + certificates
    tts.ts                  # (experimental) ElevenLabs spoken feedback — not yet wired in
  apiKey.ts                 # env var + sessionStorage fallback
  types.ts                  # Lesson, Rating, CertificateRecord, ...
```

---

## Troubleshooting

- **"Microphone access denied"** — check browser permissions for `localhost`.
- **Coach feedback is generic / canned** — usually a missing or invalid API key, or a `gpt-4o` access issue. The app falls back to placeholder copy rather than erroring; check DevTools → Network for the actual response.
- **Certificate shows an illustrated placeholder instead of a photo** — `gpt-image-1` call failed (no access, rate limit, or no key). The SVG fallback is intentional so the flow never breaks.
- **Classifier shows "Unknown" / low confidence** — the recording didn't sound enough like the reference set. Make a clearer, sustained sound and try again.
