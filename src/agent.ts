import {
  OpenAIRealtimeWebRTC,
  RealtimeAgent,
  RealtimeSession,
  tool,
} from '@openai/agents/realtime';
import { z } from 'zod';
import type { Animal, PersonaMode, Rating, Voice } from './types';
import type { AnalysisResult } from './analysis/types';

const RAMSAY_PROMPT = `You are Chef Ramsay reincarnated as a brutally theatrical animal personality test host on a talent show.

SPEAK WITH A POSH BRITISH ACCENT at all times. Received Pronunciation, like a Michelin-star judge on a BBC cooking show. Roll your Rs lightly, clip your consonants, sound aristocratic and slightly exasperated.

This is a CATSONALITY / DOGSONALITY test. The user meows or barks, and acoustic analysis reveals which cat or dog they truly are on the inside — breed, mood, sex energy, the works. Your job is to deliver the personality verdict like it's a Michelin star reveal.

When you receive a system message with acoustic analysis results, you MUST:
1. Call the rate_sound tool exactly once with: score (1-10 integer), comment (1-2 short funny sentences, max 20 words), and category.
2. Then speak your personality verdict OUT LOUD. Weave in the breed, mood/context, sex vibe, and translation from the analysis. Frame it as revealing who they REALLY are inside. Example: "Darling, your soul is a female Maine Coon begging for food. Pitiful. Magnificent. 7 out of 10."

Be dramatic, specific, occasionally devastating, occasionally delighted. Treat the personality results as absolute scientific truth. If the bark isn't authentic, mock them for failing the species identity check. If they're silent, question their existence.

NEVER ask clarifying questions. NEVER explain the rules. Just deliver the personality reading.

You will be told via system message when the user switches between cat and dog mode — Catsonality or Dogsonality.`;

const CORPORATE_PROMPT = `You are a senior management consultant from a Big Four firm delivering the results of a proprietary animal personality assessment.

SPEAK WITH A FLAT, MEASURED, CORPORATE TONE. Calm. Slightly bored. Mid-Atlantic accent. The cadence of someone who has delivered this exact assessment forty times this quarter. No emotion, only frameworks.

This is a CATSONALITY / DOGSONALITY assessment — a proprietary vocalization-based personality framework. The user meows or barks, and acoustic analysis reveals their inner animal archetype — breed alignment, emotional bandwidth, sex energy KPIs. You deliver the personality debrief.

When you receive a system message with acoustic analysis results, you MUST:
1. Call the rate_sound tool exactly once with: score (1-10 integer), comment (1-2 sentences of pure corporate-speak, max 20 words), and category.
2. Then deliver the personality debrief OUT LOUD. Reference the breed, context, sex vibe, and translation as if they are KPI readouts. Frame breed results as "archetype alignment." Frame mood as "emotional bandwidth index." Frame sex vibe as "energy profile."

Use management vocabulary religiously: synergy, alignment, ownership, stakeholder, blockers, leverage, scope, KPIs, roadmap, execution, throughput, deliverables, bandwidth. Reference imaginary OKRs and Q3 targets. Suggest the user schedule a follow-up sync to discuss their archetype trajectory.

Example: "Your vocalization maps to a male Husky archetype with strong isolation-mode emotional bandwidth. This is a yellow on our breed KPI — let's circle back next quarter."

NEVER break character. NEVER show emotion. NEVER use exclamation marks. Just debrief.

You will be told via system message when the user switches between Catsonality and Dogsonality assessment tracks.`;

const PROMPTS: Record<PersonaMode, string> = {
  ramsay: RAMSAY_PROMPT,
  corporate: CORPORATE_PROMPT,
};

export function getPersonaPrompt(mode: PersonaMode): string {
  return PROMPTS[mode];
}

export interface AgentCallbacks {
  onResult?: (rating: Rating) => void;
  onAgentSpeechEnd?: () => void;
  onError?: (err: unknown) => void;
}

export class SoundCriticAgent {
  private session: RealtimeSession | null = null;
  private callbacks: AgentCallbacks = {};
  private currentAnimal: Animal = 'cat';

  setCallbacks(cb: AgentCallbacks): void {
    this.callbacks = cb;
  }

  setAnimal(animal: Animal): void {
    this.currentAnimal = animal;
  }

  async connect(apiKey: string, voice: Voice, persona: PersonaMode): Promise<void> {
    const rateSound = tool({
      name: 'rate_sound',
      description:
        "Submit the final rating for the user's current attempt. Call exactly once per attempt, then speak the verdict aloud.",
      parameters: z.object({
        score: z.number().int().min(1).max(10),
        comment: z.string().max(160),
        category: z.enum([
          'masterpiece',
          'solid',
          'passable',
          'too_quiet',
          'too_loud',
          'wrong_species',
          'silence',
          'chaos',
        ]),
      }),
      execute: async (rating) => {
        this.callbacks.onResult?.(rating as Rating);
        return { ok: true };
      },
    });

    const agent = new RealtimeAgent({
      name: 'SoundCritic',
      instructions: getPersonaPrompt(persona),
      tools: [rateSound],
    });

    const model = 'gpt-realtime';
    const transport = new OpenAIRealtimeWebRTC({
      useInsecureApiKey: true,
      baseUrl: `https://api.openai.com/v1/realtime/calls?model=${model}`,
    });

    this.session = new RealtimeSession(agent, {
      transport,
      model,
      config: {
        voice,
        outputModalities: ['audio'],
      },
    } as ConstructorParameters<typeof RealtimeSession>[1]);

    this.session.on('error', (e) => {
      this.callbacks.onError?.(e);
    });

    this.session.on('audio_stopped', () => {
      this.callbacks.onAgentSpeechEnd?.();
    });

    await this.session.connect({ apiKey });
    await this.session.mute(true);
  }

  async mute(muted: boolean): Promise<void> {
    if (!this.session) return;
    await this.session.mute(muted);
  }

  setVoice(voice: Voice): void {
    if (!this.session) return;
    try {
      (this.session as unknown as {
        transport: { updateSessionConfig: (cfg: { voice: Voice }) => void };
      }).transport.updateSessionConfig({ voice });
    } catch (e) {
      console.warn('setVoice failed', e);
    }
  }

  setPersona(persona: PersonaMode): void {
    if (!this.session) return;
    try {
      (this.session as unknown as {
        transport: { updateSessionConfig: (cfg: { instructions: string }) => void };
      }).transport.updateSessionConfig({ instructions: getPersonaPrompt(persona) });
    } catch (e) {
      console.warn('setPersona failed', e);
    }
  }

  notifyAnimalSwitch(animal: Animal): void {
    this.currentAnimal = animal;
    const testName = animal === 'cat' ? 'Catsonality' : 'Dogsonality';
    this.sendText(`(System: user switched to ${testName} test. Deliver ${animal} personality readings now.)`);
  }

  requestScoreNow(analysis?: AnalysisResult): void {
    if (!this.session) return;

    let analysisHint = '';
    if (analysis) {
      if (analysis.animal === 'cat') {
        const catSexHint = analysis.sex ? `, energy=${analysis.sex === 'male' ? 'tom' : 'queen'}` : '';
        analysisHint = ` CATSONALITY RESULT: mood="${analysis.contextLabel}" (${analysis.confidence}% match), inner breed=${analysis.breed}${catSexHint}. Translation: "${analysis.translation}". Deliver their catsonality reading — who they really are inside. Reference the breed personality, mood, energy, and what their meow actually meant.`;
      } else {
        if (analysis.isAuthentic) {
          const topBreed = analysis.breeds[0];
          const breedList = analysis.breeds.map((b) => `${b.label} ${b.pct}%`).join(', ');
          const sexHint = analysis.sex ? `, energy=${analysis.sex === 'male' ? 'good boy' : 'good girl'}` : '';
          analysisHint = ` DOGSONALITY RESULT: authentic bark (${analysis.confidence}%), breed match=[${breedList}]${sexHint}. Translation: "${analysis.translation}". Deliver their dogsonality reading — which dog they truly are. Reference the breed personality, energy, and what their bark actually meant.`;
          if (topBreed) {
            analysisHint += ` Dominant breed: ${topBreed.label}.`;
          }
        } else {
          analysisHint = ` DOGSONALITY RESULT: FAILED authenticity check (only ${analysis.confidence}% match). Translation: "${analysis.translation}". Their bark was not convincing — they failed to find their inner dog. Mock them and suggest they try harder.`;
        }
      }
    }

    const testName = this.currentAnimal === 'cat' ? 'Catsonality' : 'Dogsonality';
    this.sendText(
      `(System: ${testName} test complete.${analysisHint} Call rate_sound now and deliver the personality verdict aloud.)`
    );
    try {
      (this.session as unknown as { transport: { sendEvent: (e: unknown) => void } }).transport.sendEvent({
        type: 'response.create',
      });
    } catch (e) {
      console.warn('response.create failed', e);
    }
  }

  private sendText(text: string): void {
    if (!this.session) return;
    try {
      (this.session as unknown as { transport: { sendEvent: (e: unknown) => void } }).transport.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text }],
        },
      });
    } catch (e) {
      console.warn('sendText failed', e);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.session) return;
    try {
      await (this.session as unknown as { close?: () => Promise<void> }).close?.();
    } catch {
      // ignore
    }
    this.session = null;
  }
}
