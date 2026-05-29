import { getStoredKey } from '../apiKey';
import type { AggregatedProfile, Animal, CertificateRecord } from '../types';
import { breedLabel, moodLabel, unitTitleFor } from './certificates';

interface PortraitOptions {
  animal: Animal;
  profile?: AggregatedProfile;
  proficiencyLabel: string;
  petName?: string;
  ownerName?: string;
  record?: CertificateRecord;
}

interface CatsonalityCopy {
  visualPrompt: string;
  flavorLine: string;
}

interface CopyResult extends CatsonalityCopy {
  fromFallback: boolean;
  error?: string;
}

interface PortraitResult {
  dataUrl: string;
  flavorLine: string;
  fromFallback: boolean;
  error?: string;
}

const FALLBACK_FLAVOR: Record<Animal, string> = {
  cat: 'Certified, mildly threatening, and absolutely convinced the silverware belongs to it.',
  dog: 'Graduated top of the class and has not stopped talking about it since.',
};

function fallbackVisualPrompt(opts: PortraitOptions): string {
  const { animal, profile } = opts;
  const breed = breedLabel(animal, profile?.topBreed);
  const speciesNoun = animal === 'cat' ? 'cat' : 'dog';
  const moodKey = profile?.topMood;
  const mood = moodLabel(animal, moodKey);
  const moodCue = mood
    ? `wearing a tiny business suit and an unhinged "${mood}" expression`
    : 'wearing a tiny business suit with a deeply unimpressed expression';
  return `A ${breed} ${speciesNoun} ${moodCue}, caught mid-rant while dramatically guarding a single snack like it is priceless treasure.`;
}

function fallbackCopy(opts: PortraitOptions): CatsonalityCopy {
  return {
    visualPrompt: fallbackVisualPrompt(opts),
    flavorLine: FALLBACK_FLAVOR[opts.animal],
  };
}

function topMoods(
  votes: Record<string, number> | undefined,
  animal: Animal,
  limit = 3,
): Array<{ label: string; pct: number }> {
  if (!votes) return [];
  const entries = Object.entries(votes);
  const total = entries.reduce((acc, [, v]) => acc + v, 0);
  if (total <= 0) return [];
  return entries
    .map(([k, v]) => ({ label: moodLabel(animal, k) || k, pct: Math.round((v / total) * 100) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, limit);
}

function topBreeds(
  votes: Record<string, number> | undefined,
  animal: Animal,
  limit = 3,
): Array<{ label: string; pct: number }> {
  if (!votes) return [];
  const entries = Object.entries(votes);
  const total = entries.reduce((acc, [, v]) => acc + v, 0);
  if (total <= 0) return [];
  return entries
    .map(([k, v]) => ({ label: breedLabel(animal, k), pct: Math.round((v / total) * 100) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, limit);
}

const DESCRIBE_TOOL = {
  type: 'function',
  function: {
    name: 'describe_pet_for_portrait',
    description:
      "Produce a hilarious visual description and a funny caption for an absurd, photorealistic comedy portrait of a pet who got certified in interspecies vocal communication.",
    parameters: {
      type: 'object',
      properties: {
        visualPrompt: {
          type: 'string',
          description:
            "40-70 words. Invent ONE absurd, laugh-out-loud scenario for this specific pet by combining its breed + dominant mood + sex into an exaggerated comedic character. Describe concrete physical traits (coat, body language, over-the-top facial expression), a ridiculous costume or prop, and the silly situation it's caught in. Photorealistic comedy, like a viral pet meme photo. Describe the SUBJECT and its immediate situation only — no framing, lighting or camera talk.",
        },
        flavorLine: {
          type: 'string',
          description:
            "<=140 chars. One funny caption-style sentence in third person about this pet. Punchy, absurd, the kind of line that makes people snort-laugh. No quotation marks, no emoji.",
        },
      },
      required: ['visualPrompt', 'flavorLine'],
    },
  },
} as const;

const CURATOR_SYSTEM = `You are a comedy casting director shooting an absurd, photorealistic portrait of a pet that just got "certified" in interspecies vocal communication. Your ONLY goal is to make the viewer laugh out loud.

VOICE: Unhinged, gleeful, meme-brained. Lean into the bit hard.

HOW TO BE FUNNY:
- Combine the pet's dominant BREED + dominant MOOD + SEX into one exaggerated comedic character. A "Hungry & Demanding" husky should read wildly differently from a "Content & Affectionate" chihuahua. Make the combination obvious and ridiculous.
- Put the pet in a silly, unexpected, very human situation or costume that dramatizes that personality (e.g. mid-rant in a tiny business suit, guarding a single chicken nugget like treasure, giving an unhinged TED talk, refusing to make eye contact during an intervention).
- Exaggerate the facial expression and body language for maximum comedic effect.

VISUAL PROMPT RULES:
- 40-70 words. Describe the SUBJECT and its immediate comedic situation/props only.
- Keep it photorealistic and physically plausible enough to be believable — the humor comes from the absurd scenario, not from melting cartoon physics.
- No humans in frame. No text overlays. No mention of cameras, lenses, lighting setups, the words "AI" / "rendered".

FLAVOR LINE RULES:
- One sentence, <=140 characters, third person. Genuinely funny, punchy caption.
- No quotation marks. No emoji.

Call describe_pet_for_portrait exactly once.`;

function buildCuratorUserMessage(opts: PortraitOptions): string {
  const { animal, profile, petName, ownerName, proficiencyLabel, record } = opts;
  const breed = breedLabel(animal, profile?.topBreed);
  const mood = moodLabel(animal, profile?.topMood);
  const moods = topMoods(profile?.moodVotes, animal);
  const breeds = topBreeds(profile?.breedVotes, animal);
  const attempts = profile?.attempts ?? 0;
  const avgConf = profile?.avgConfidence
    ? `${Math.round(profile.avgConfidence * 100)}%`
    : 'n/a';
  const sexVotes = profile?.sexVotes ?? { male: 0, female: 0 };
  const sex =
    sexVotes.male === sexVotes.female
      ? 'unspecified'
      : sexVotes.male > sexVotes.female
        ? 'male-leaning'
        : 'female-leaning';
  const unitTitle = record ? unitTitleFor(animal, record.unit) : 'Unit';
  const breedDialect = record?.breedDialect ?? `${breed} dialect`;
  const avgScore = record?.averageScore
    ? `${Math.round(record.averageScore * 100)}%`
    : 'n/a';

  const breedDist = breeds.length
    ? breeds.map((b) => `${b.label} ${b.pct}%`).join(', ')
    : 'no data';
  const moodDist = moods.length
    ? moods.map((m) => `${m.label} ${m.pct}%`).join(', ')
    : 'no data';

  return [
    `Animal: ${animal}`,
    `Pet name: ${petName ?? 'unnamed'}`,
    `Owner: ${ownerName ?? 'anonymous student'}`,
    `Dominant breed read: ${breed}`,
    `Breed distribution: ${breedDist}`,
    `Dominant vocal mood: ${mood || 'undetermined'}`,
    `Mood distribution: ${moodDist}`,
    `Sex signal: ${sex}`,
    `Certified at: ${proficiencyLabel} in ${breedDialect}`,
    `Unit completed: ${unitTitle}`,
    `Attempts on record: ${attempts}, average classifier confidence ${avgConf}, average lesson score ${avgScore}`,
    '',
    "Write the visual brief for this pet's oil portrait, then a single brass-plaque flavor line. Both should make the breed and mood unmistakable to anyone looking at the finished painting.",
  ].join('\n');
}

async function generateCatsonalityCopy(opts: PortraitOptions): Promise<CopyResult> {
  const key = getStoredKey();
  if (!key) {
    return { ...fallbackCopy(opts), fromFallback: true };
  }

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: CURATOR_SYSTEM },
      { role: 'user', content: buildCuratorUserMessage(opts) },
    ],
    tools: [DESCRIBE_TOOL],
    tool_choice: { type: 'function', function: { name: 'describe_pet_for_portrait' } },
  };

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        ...fallbackCopy(opts),
        fromFallback: true,
        error: `Catsonality copy failed (${res.status}). ${text.slice(0, 120)}`,
      };
    }

    const data = (await res.json()) as {
      choices: Array<{
        message: { tool_calls?: Array<{ function: { arguments: string } }> };
      }>;
    };
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return {
        ...fallbackCopy(opts),
        fromFallback: true,
        error: 'Catsonality copy returned no tool call.',
      };
    }
    const args = JSON.parse(toolCall.function.arguments) as Partial<CatsonalityCopy>;
    if (!args.visualPrompt || !args.flavorLine) {
      return {
        ...fallbackCopy(opts),
        fromFallback: true,
        error: 'Catsonality copy returned incomplete fields.',
      };
    }
    return {
      visualPrompt: args.visualPrompt,
      flavorLine: args.flavorLine,
      fromFallback: false,
    };
  } catch (err) {
    return {
      ...fallbackCopy(opts),
      fromFallback: true,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function buildImagePrompt(visualPrompt: string, opts: PortraitOptions): string {
  const speciesNoun = opts.animal === 'cat' ? 'cat' : 'dog';
  return [
    `A hilarious, photorealistic comedy photograph of a ${speciesNoun} — the kind of absurd image that instantly makes people laugh and gets shared everywhere.`,
    `Subject and situation: ${visualPrompt}`,
    `Style: hyper-realistic, sharp, candid-photo realism with dramatic, slightly cinematic lighting. The comedy comes entirely from the ridiculous expression, costume and situation — keep the ${speciesNoun} itself believable and photoreal, not cartoonish.`,
    `Square framing, the ${speciesNoun} clearly centered and in focus. No humans in frame, no text, captions, watermarks or logos anywhere in the image.`,
  ].join(' ');
}

function svgFallback(opts: PortraitOptions): string {
  const { animal, profile, proficiencyLabel } = opts;
  const breed = breedLabel(animal, profile?.topBreed);
  const accent = animal === 'cat' ? '#ff6b9d' : '#ffa94d';
  const emoji = animal === 'cat' ? '🐱' : '🐶';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <defs>
      <radialGradient id="bg" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#f7eed8"/>
        <stop offset="100%" stop-color="#cdb78c"/>
      </radialGradient>
      <linearGradient id="frame" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${accent}"/>
        <stop offset="1" stop-color="#8b5a2b"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" fill="url(#bg)"/>
    <circle cx="256" cy="220" r="150" fill="#fff" stroke="url(#frame)" stroke-width="10"/>
    <text x="256" y="280" font-size="180" text-anchor="middle" font-family="Helvetica, Arial, sans-serif">${emoji}</text>
    <rect x="80" y="410" width="352" height="60" rx="10" fill="#3b2a1a"/>
    <text x="256" y="437" font-size="18" text-anchor="middle" fill="#f7eed8" font-family="Helvetica, Arial, sans-serif" font-weight="700">${breed.toUpperCase()}</text>
    <text x="256" y="458" font-size="14" text-anchor="middle" fill="#d9c79a" font-family="Helvetica, Arial, sans-serif">${proficiencyLabel}</text>
  </svg>`;

  const encoded = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
}

export function getFallbackPortrait(opts: PortraitOptions): string {
  return svgFallback(opts);
}

export async function generatePetPortrait(opts: PortraitOptions): Promise<PortraitResult> {
  const key = getStoredKey();
  if (!key) {
    const fb = fallbackCopy(opts);
    return {
      dataUrl: svgFallback(opts),
      flavorLine: fb.flavorLine,
      fromFallback: true,
      error: 'No OpenAI API key configured. Showing illustrated placeholder.',
    };
  }

  const copy = await generateCatsonalityCopy(opts);

  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: buildImagePrompt(copy.visualPrompt, opts),
        size: '1024x1024',
        n: 1,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        dataUrl: svgFallback(opts),
        flavorLine: copy.flavorLine,
        fromFallback: true,
        error: `Image generation failed (${res.status}). ${text.slice(0, 120)}`,
      };
    }

    const json = (await res.json()) as {
      data?: Array<{ b64_json?: string; url?: string }>;
    };
    const item = json.data?.[0];
    if (item?.b64_json) {
      return {
        dataUrl: `data:image/png;base64,${item.b64_json}`,
        flavorLine: copy.flavorLine,
        fromFallback: copy.fromFallback,
        error: copy.error,
      };
    }
    if (item?.url) {
      return {
        dataUrl: item.url,
        flavorLine: copy.flavorLine,
        fromFallback: copy.fromFallback,
        error: copy.error,
      };
    }
    return {
      dataUrl: svgFallback(opts),
      flavorLine: copy.flavorLine,
      fromFallback: true,
      error: 'Image generation returned no data.',
    };
  } catch (err) {
    return {
      dataUrl: svgFallback(opts),
      flavorLine: copy.flavorLine,
      fromFallback: true,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
