# Biolingo — Demo Script

~2 minute Friday demo. **Make it run twice. Make the best part obvious.**

---

## The Order Ticket

> **Biolingo** — a language-learning app, the magic of *an unhinged professor grading you on how well you meow*, feel *seen, roasted, and weirdly accomplished*.

| | | |
| --- | --- | --- |
| **01 · Start state** | The room sees a Duolingo-looking lesson: *"Say this to your cat"* with a phrase and phoneme chips. | |
| **02 · Input** | Presenter taps record and **meows into the mic** for 4 seconds. | |
| **03 · AI moment** | A tenured professor persona judges the attempt and tells you **what your pet actually heard** — an absurd, specific artifact. | |
| **04 · Output** | A punchy verdict, a real metric breakdown, a breed/mood read, XP + confetti. | |
| **05 · Payoff** | Finish a unit → a **certificate with an AI-generated comedy portrait** of your pet, ready to post to LinkedIn. | |

---

## Opening (10s)

> **"We built Duolingo — but for talking to your cat. And your dog."**

Pause. Then:

> "Real lessons, real acoustic targets, and a coach with tenure and a grudge who tells you exactly what your pet actually heard."

---

## Live interaction (75s) — *legible in 10 seconds*

1. **Pick a language** — Felinetic 🐱 or Caninetic 🐶. (Onboarding stats are a great pre-demo laugh if you have time.)
2. **Open a lesson** — e.g. *The Demand*: *"The food bowl situation is critical"* → `MEW · MEW · MEW`. Point at the phrase, the phoneme chips, and the **reference sound** ("here's the target — listen").
3. **Bad attempt first.** Do something obviously wrong (too quiet, or a single long groan). The grader catches the *specific* failure, and the coach reads you for it. **Show the "what your pet actually heard" line** — that's the quotable moment.
4. **Then nail it.** Metric bars go green, confetti at 85%+, XP lands.
5. **The payoff.** Finish the unit's lessons → the app hands you a **certificate** with an AI-generated portrait of your pet and a postable LinkedIn caption.

---

## The wow moment — *make the best part obvious*

Pick whichever lands hardest with the room:

- **"What your pet actually heard."** The coach doesn't say "too quiet" — it says you filed a noise complaint with a Labrador named Brenda. Grounded in a real signal, delivered as comedy.
- **The certificate portrait.** A photoreal, absurd portrait of *your* pet, generated live, from how *you* sounded.
- **It's a real grader.** Volume / pitch / duration bars driven by actual browser DSP, not vibes.

---

## Where AI is essential (20s) — *why AI?*

The whole joke only works because two different AI/DSP layers disagree in the funniest way:

- **Local DSP grades the truth.** Web Audio measures volume, pitch, duration, and bursts — a deterministic pass/fail. No model in the loop here; this is the straight man.
- **`gpt-4o` is the comedian.** It gets the real result and a persona, then returns a structured `comment` + `heard` via a tool call. High temperature keeps every roast fresh.
- **An MFCC classifier reads your pet** — breed, mood, sex — which feeds the certificate's dialect.
- **`gpt-image-1` paints the payoff** — your aggregated profile becomes one absurd portrait, prefetched so it's ready on claim.

Remove the AI and you have a karaoke pitch meter. The AI is the entire reason it's funny.

---

## How humans + AI built it (15s) — *the collab story*

- **Designed before coding.** Each feature started as a conversation — personas, curriculum, and acoustic targets argued out first, code second.
- **Humans owned the taste.** The voice of Professor Whiskers, the "what your pet heard" mechanic, the certificate bit — all human calls. The model owns implementation and the improv.
- **The AI is also a collaborator at runtime**, not just at build time: it co-writes every line of feedback live.

---

## Reliability — *can it run twice?*

- **No key? Still runs.** Lessons, scoring, and the classifier are all local. The coach and portrait fall back to canned copy + an SVG placeholder — never an error screen.
- **Every API call has a fallback.** A failed `gpt-image-1` render shows an illustrated certificate instead of breaking the flow.
- **The portrait is prefetched** one lesson before the unit ends, so the payoff isn't a loading spinner.

---

## One more day

Highest impact first:

1. **Live pitch overlay** on the Target Shape — draw the user's pitch curve over the dashed target so "where you went wrong" is visual, not just audible.
2. **Wire up spoken feedback** — `src/lib/tts.ts` (ElevenLabs) is scaffolded; let the professor *say* the roast out loud.
3. **More species** — Bird, Cow. An afternoon of lesson + reference data, no new code.

---

## Speaker cheat sheet

1. Pick a language → "Duolingo for talking to your cat"
2. Open a lesson → phrase + phonemes + reference sound
3. Bad meow → coach catches it + "what your pet heard"
4. Good meow → green bars + confetti
5. Finish unit → certificate + AI portrait → LinkedIn
6. Close on the portrait

**Target: 2:00. Ceiling: 3:00.**

---

## Judging criteria — quick map

- **Creativity & originality** — a fake academic field (Felinetic/Caninetic) with phonemes, dialects, and a certifying board.
- **AI integration** — DSP truth + LLM comedy + audio classifier + image gen, each load-bearing.
- **Presentation & storytelling** — the "what your pet actually heard" line and the certificate are built to be quoted and shared.
- **AI-era collaboration** — humans set the taste and the bit; AI implements and performs.
