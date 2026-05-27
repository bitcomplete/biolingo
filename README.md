# Biolingo

Duolingo, but for talking to your cat. Teach humans to meow and bark — graded by an AI coach against real acoustic targets.

See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for the hackathon walkthrough.

---

## Stack

- **Vite + React 18 + TypeScript** — single-page app
- **React Router** — `/`, `/lesson/:animal/:lessonId`, `/roadmap`
- **OpenAI Agents SDK** (`@openai/agents/realtime`) — voice in, voice out, structured tool calls over WebRTC
- **Web Audio API** — local AMDF pitch detection with RMS normalization for the live volume/pitch meters

---

## Prerequisites

- **Node.js 18+** (Node 20 recommended)
- **An OpenAI API key with Realtime API access** — currently tier-1+ accounts. Generate one at https://platform.openai.com/api-keys.
- **A microphone** and a Chromium-based browser (Chrome, Edge, Brave) or Safari 17+. WebRTC support required.

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

`.env.local` is gitignored. **Never commit a real key.** If you'd rather not put your key on disk at all, leave `.env.local` blank — the app will prompt you to paste it on first run and store it in `sessionStorage` (wiped when you close the tab).

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

## Demo flow

1. Land on `/` — pick a chapter (Cat 101 or Dog 101).
2. Open a lesson — read the target description and acoustic hints.
3. Tap **🔊 Hear it** — the AI vocalizes the target sound.
4. Tap **Tap to Meow** (or Bark) — record for ~4 seconds.
5. The coach grades you live, speaks back, and awards XP if you pass.

Score ≥ 85% triggers confetti. Lessons unlock linearly per phase.

---

## API keys & cost

The app uses OpenAI's realtime model (`gpt-realtime`). A 5-minute demo session is well under a dollar. Audio output is the dominant cost — if you want to run cheaper, swap the model in [src/agent.ts](src/agent.ts) to a mini variant.

**Security note:** the browser talks directly to the OpenAI realtime endpoint with `useInsecureApiKey: true`. This is fine for local hackathon use — **do not deploy this as-is**. For any shared deploy, add a tiny backend that mints ephemeral client keys.

---

## Project layout

```
src/
  main.tsx              # router + entrypoint
  pages/
    HomePage.tsx        # chapter list + XP
    LessonPage.tsx      # the practice flow (state machine, agent, mic)
    RoadmapPage.tsx     # future curriculum mockup
  components/           # AnimalSelector, TargetShape, Meters, FeedbackCard, ...
  hooks/
    useAudioAnalyser.ts # AMDF pitch + RMS volume detection
    useProgress.ts      # localStorage-backed XP + completion
  agent.ts              # OpenAI Realtime session + give_coaching tool
  lessons.ts            # 26 lessons across cat/dog × 3 phases
  apiKey.ts             # env var + sessionStorage fallback
  types.ts              # Lesson, Phase, Voice, Rating, ...
```

---

## Troubleshooting

- **"Microphone access denied"** — check browser permissions for `localhost`.
- **400 from `/v1/realtime/calls`** — usually means your account doesn't have realtime access, or the model name in [agent.ts](src/agent.ts) isn't available to you. Try `gpt-realtime` → `gpt-realtime-2` → `gpt-4o-realtime-preview`.
- **"Failed to parse SessionDescription"** — the realtime endpoint returned a non-SDP body (usually a JSON error). Check DevTools → Network for the actual response.
- **Agent describes the sound instead of vocalizing it** during "Hear it" — model wobble; tap the button again. Hit rate is ~70-80%.
- **Phases 2+ locked** — currently the progression gate blocks phase ≥ 2. To demo the full curriculum, flip the check in `src/progress.ts` (or open a lesson directly by URL).
