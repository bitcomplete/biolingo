# Biolingo — Demo Script

~2 minute hackathon walkthrough.

---

## Opening

> **"We built Duolingo, but for talking to your cat."**

Pause. Then:

> "Real lessons, real acoustic targets, and an AI coach that listens and talks back."

---

## Setup

- Single-page React app. Three routes: home, lesson, roadmap.
- Each lesson has acoustic targets: pitch (Hz), volume, duration, sometimes a required number of bursts.
- Mic runs through an AMDF pitch detector with amplitude normalization — no false readings on silence.
- An OpenAI realtime voice agent grades every attempt and speaks back in character.

---

## Live interaction

1. **Home** — show the chapters (Cat 101, Dog 101). 26 lessons total.
2. **Open a lesson** (e.g. "The Food Demand"). Point at the target description, the dashed pitch-shape canvas, and the acoustic hints.
3. **"🔊 Hear it"** — the AI actually meows. Live, generated, not a recording.
4. **Tap to Meow** — do a deliberately bad attempt first. Coach catches the specific failure ("too quiet"). Then nail it. Confetti + XP at 85%+.
5. **(Optional)** Roadmap → "same engine, more species."

---

## Wow moment

Pick whichever lands hardest:

- **The AI vocalizes the target sound.** A real meow comes out of the speakers.
- **The coach catches a specific failure.** Not vibes — it points at *what* went wrong.
- **Real metrics on a real signal.** Volume / pitch / duration bars driven by actual DSP.

---

## Where AI shows up

- **OpenAI realtime API (WebRTC)** — listens to user, speaks coaching back, generates demo sounds. One bidirectional session, no upload step.
- **`give_coaching` tool call** — model returns a structured rating (score, category, comment, passed) *and* a spoken verdict in the same turn.
- **Per-lesson instructions** — each lesson hot-swaps the agent's system prompt with its specific rubric. One persistent session, lesson-specific grading.

No fine-tuning, no custom models. Everything is prompt-engineering against the realtime API.

---

## How we worked with AI

- **Designed before coding.** Each feature started as a short conversation with Claude — tradeoffs first, code second.
- **Claude read the SDK source for us.** The OpenAI Agents SDK is new; Claude grepped `node_modules` to find things like `useInsecureApiKey` and the model-in-querystring quirk we hit on a 400.
- **Humans owned the product calls** (personas, curriculum, acoustic targets). Claude owned the implementation.

---

## One more day

Highest impact first:

1. **Real-time pitch overlay** on the Target Shape canvas — draw the user's live pitch curve over the dashed target. The missing piece between "you sounded good" and "here's where you went wrong."
2. **Unlock phases 2+** — the data is written, just flip the gate.
3. **More species** — Bird 101, Cow 101. An afternoon of lesson data, no new code.

---

## Speaker cheat sheet

1. Home → "Duolingo for talking to your cat"
2. Open a lesson → target + shape + hints
3. "Hear it" → AI meows
4. Bad attempt → coach catches it
5. Good attempt → confetti
6. Close on pitch overlay

**Target: 2:00. Ceiling: 3:00.**
