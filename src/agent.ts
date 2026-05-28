import { getRelaxedTargets, METRIC_PASS_THRESHOLD } from './lib/scoring';
import type { GateResult, Lesson, MeasuredMetrics, Rating, RatingCategory } from './types';

const SHARED_RULES = `
Write your comment in plain, everyday language — as if you're a friendly coach talking to someone in person.
NEVER mention Hz, dB, milliseconds, frequencies, decibels, or any other technical units.
Use human descriptions instead: "a bit louder", "hold it longer", "softer and breathy", "nice and sustained", etc.
Keep the comment to 1–2 short sentences, encouraging and specific.`;

const CAT_COACH_PROMPT = `You are CatCoachAI.

Your role is to teach humans to imitate cat-like vocal communication patterns for educational and entertainment purposes.
Your feedback style: short, encouraging, actionable, game-like.
You NEVER claim humans can literally speak to cats.
${SHARED_RULES}

When you receive a performance report, call give_coaching exactly once.
If the attempt passed, celebrate and say what was good.
If it failed, lead with what still needs fixing. Do not praise metrics that failed. You may briefly acknowledge passing metrics only after naming the fix.`;

const DOG_COACH_PROMPT = `You are DogCoachAI.

Your role is to teach humans to imitate dog vocal communication patterns for educational and entertainment purposes.
Your feedback style: short, encouraging, actionable, game-like.
You NEVER claim humans can literally speak to dogs.
${SHARED_RULES}

When you receive a performance report, call give_coaching exactly once.
If the attempt passed, celebrate and say what was good.
If it failed, lead with what still needs fixing. Do not praise metrics that failed. You may briefly acknowledge passing metrics only after naming the fix.`;

function qualitativeLevel(score: number): string {
  if (score >= 0.9) return 'perfect';
  if (score >= 0.75) return 'good';
  if (score >= 0.55) return 'close';
  return 'off';
}

function buildSystemPrompt(lesson: Lesson): string {
  const base = lesson.animal === 'cat' ? CAT_COACH_PROMPT : DOG_COACH_PROMPT;
  return `${base}

Current lesson: ${lesson.title}
What the user is practicing: ${lesson.aiContext}`;
}

function buildPerformanceReport(
  lesson: Lesson,
  metrics: MeasuredMetrics,
  gate: GateResult,
): string {
  const targets = getRelaxedTargets(lesson.targets);
  const volumeDesc = gate.breakdown.volume >= METRIC_PASS_THRESHOLD
    ? `${qualitativeLevel(gate.breakdown.volume)} — on target`
    : metrics.peak_db < targets.volume_rms_db[0]
      ? 'too quiet — needs to be louder'
      : 'too loud — needs to be softer';

  const pitchDesc = metrics.pitch_hz === 0
    ? 'no pitch detected — likely silence or noise'
    : gate.breakdown.pitch >= METRIC_PASS_THRESHOLD
      ? `${qualitativeLevel(gate.breakdown.pitch)} — in the right range`
      : metrics.pitch_hz < targets.pitch_hz[0]
        ? 'too low — needs to be higher pitched'
        : 'too high — needs to be lower pitched';

  const durationDesc = gate.breakdown.duration >= METRIC_PASS_THRESHOLD
    ? `${qualitativeLevel(gate.breakdown.duration)} — right length`
    : metrics.duration_ms < targets.duration_ms[0]
      ? 'too short — needs to be held longer'
      : 'too long — needs to be shorter';

  const lines = [
    `(Performance report — ${lesson.title})`,
    `Loudness: ${volumeDesc}`,
    `Pitch: ${pitchDesc}`,
    `Duration: ${durationDesc}`,
    `Result: ${gate.passed ? 'PASSED — lesson complete' : `FAILED — still need: ${gate.failReasons.join(', ') || 'improvement'}`}`,
    `Overall score (informational): ${Math.round(gate.breakdown.overall * 100)}%`,
    ...(gate.passed ? [] : ['Important: The attempt did NOT pass. Do not imply the lesson is complete.']),
  ];
  return lines.join('\n');
}

const GIVE_COACHING_TOOL = {
  type: 'function',
  function: {
    name: 'give_coaching',
    description: "Submit coaching feedback for the user's attempt.",
    parameters: {
      type: 'object',
      properties: {
        comment: { type: 'string', maxLength: 140 },
        category: {
          type: 'string',
          enum: ['masterpiece', 'solid', 'passable', 'too_quiet', 'too_loud', 'wrong_pitch', 'silence', 'chaos'],
        },
      },
      required: ['comment', 'category'],
    },
  },
} as const;

export interface CoachCallbacks {
  onCoaching?: (rating: Rating) => void;
  onCoachingComplete?: () => void;
  onError?: (err: unknown) => void;
}

export class AnimalCoachAgent {
  private apiKey: string | null = null;
  private currentLesson: Lesson | null = null;
  private callbacks: CoachCallbacks = {};

  setCallbacks(cb: CoachCallbacks): void {
    this.callbacks = cb;
  }

  async connect(apiKey: string, lesson: Lesson): Promise<void> {
    this.apiKey = apiKey;
    this.currentLesson = lesson;
  }

  async evaluateAttempt(metrics: MeasuredMetrics, gate: GateResult): Promise<void> {
    if (!this.apiKey || !this.currentLesson) return;

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildSystemPrompt(this.currentLesson) },
        { role: 'user', content: buildPerformanceReport(this.currentLesson, metrics, gate) },
      ],
      tools: [GIVE_COACHING_TOOL],
      tool_choice: { type: 'function', function: { name: 'give_coaching' } },
    };

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`OpenAI API error ${res.status}`);
      }

      const data = await res.json() as {
        choices: Array<{ message: { tool_calls?: Array<{ function: { arguments: string } }> } }>;
      };
      const toolCall = data.choices[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const args = JSON.parse(toolCall.function.arguments) as { comment: string; category: RatingCategory };
        const rating: Rating = {
          score: 0,
          comment: args.comment,
          category: args.category,
          passed: false,
        };
        this.callbacks.onCoaching?.(rating);
      }
    } catch (e) {
      this.callbacks.onError?.(e);
    }

    this.callbacks.onCoachingComplete?.();
  }

  disconnect(): void {
    this.apiKey = null;
    this.currentLesson = null;
  }
}
