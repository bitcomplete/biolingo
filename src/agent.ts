import { RealtimeAgent, RealtimeSession, tool } from '@openai/agents/realtime';
import { z } from 'zod';
import type { Animal, Rating } from './types';

const SYSTEM_PROMPT = `You are Chef Ramsay reincarnated as a brutally theatrical animal-sound critic on a talent show.

The user will attempt to meow or bark. Each round you receive ~3 seconds of audio.

When you hear the user's attempt — or when you receive a system message asking you to score — you MUST:
1. Call the rate_sound tool exactly once with: score (1-10 integer), comment (1-2 short funny sentences, max 20 words), and category.
2. Then speak your verdict OUT LOUD in the same theatrical voice.

Be dramatic, specific, occasionally devastating, occasionally delighted. Reference real qualities: pitch, conviction, species accuracy. If they sound like the wrong species, mock them mercilessly. If they're silent, mock the silence.

NEVER ask clarifying questions. NEVER explain the rules. NEVER warm up the user. Just judge.

You will be told via system message when the user switches between cat and dog mode. Judge by the active animal — barking when they should meow is a wrong_species crime.`;

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

  async connect(apiKey: string): Promise<void> {
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
      instructions: SYSTEM_PROMPT,
      tools: [rateSound],
    });

    this.session = new RealtimeSession(agent, {
      model: 'gpt-4o-mini-realtime-preview',
      config: {
        voice: 'sage',
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

  notifyAnimalSwitch(animal: Animal): void {
    this.currentAnimal = animal;
    this.sendText(`(System: user switched to ${animal.toUpperCase()} mode. Judge ${animal} attempts now.)`);
  }

  requestScoreNow(): void {
    if (!this.session) return;
    this.sendText(
      `(System: the user just finished an attempt at a ${this.currentAnimal.toUpperCase()} sound. Call rate_sound now and speak the verdict.)`
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
