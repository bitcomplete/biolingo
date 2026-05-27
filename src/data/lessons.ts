import type { Lesson } from '../types';

const CAT_PHASE_1 = 'Basic Sounds';
const CAT_PHASE_2 = 'Emotional Intent';
const CAT_PHASE_3 = 'Conversational Patterns';
const DOG_PHASE_1 = 'Core Vocalizations';
const DOG_PHASE_2 = 'Intent Recognition';
const DOG_PHASE_3 = 'Pack Interaction';

export const LESSONS: Lesson[] = [
  // ── Cat Phase 1: Basic Sounds ────────────────────────────────────────────
  {
    id: 'cat_meow_1',
    animal: 'cat',
    phase: 1,
    phaseTitle: CAT_PHASE_1,
    title: 'Friendly Meow',
    description: 'The classic cat greeting — soft, medium-high, brief.',
    emoji: '😸',
    instruction: 'Make a soft, short "meow" — like a cat saying hello to someone they like.',
    targets: {
      volume_rms_db: [-32, -18],
      pitch_hz: [200, 600],
      duration_ms: [300, 900],
    },
    xpReward: 10,
    aiContext:
      'User is learning the friendly meow: soft volume (-32 to -18 dB), medium-high pitch (200–600 Hz), brief duration (300–900 ms). A calm, gentle greeting sound — not demanding, not aggressive.',
  },
  {
    id: 'cat_hunger_1',
    animal: 'cat',
    phase: 1,
    phaseTitle: CAT_PHASE_1,
    title: 'Hunger Meow',
    description: 'The insistent food-time meow — repetitive and medium.',
    emoji: '🍽️',
    instruction: 'Do 2–4 medium meows in quick succession — "meow, meow, meow" — with some urgency.',
    targets: {
      volume_rms_db: [-26, -14],
      pitch_hz: [200, 550],
      duration_ms: [800, 2500],
      burst_count: [2, 4],
      burst_spacing_ms: [200, 600],
    },
    xpReward: 15,
    aiContext:
      'User is learning the hunger meow: medium volume (-26 to -14 dB), 2–4 repetitive bursts (200–600 ms apart), medium pitch (200–550 Hz), total duration 800–2500 ms. Each individual meow should be clear and demanding — not aggressive, but insistent.',
  },
  {
    id: 'cat_attention_1',
    animal: 'cat',
    phase: 1,
    phaseTitle: CAT_PHASE_1,
    title: 'Attention Seeking',
    description: 'The prolonged "pay attention to me" meow.',
    emoji: '📣',
    instruction: 'Stretch a meow out as long as you can — "meeeeeeooooow" — sustained and plaintive.',
    targets: {
      volume_rms_db: [-24, -12],
      pitch_hz: [200, 600],
      duration_ms: [1000, 3000],
    },
    xpReward: 15,
    aiContext:
      'User is learning the attention-seeking meow: medium volume (-24 to -12 dB), medium pitch (200–600 Hz), very long sustained duration (1000–3000 ms). The key is length — hold the meow as long as possible with consistent tone.',
  },
  {
    id: 'cat_trill_1',
    animal: 'cat',
    phase: 1,
    phaseTitle: CAT_PHASE_1,
    title: 'Gentle Trill',
    description: 'A rolling, purr-like greeting from content cats.',
    emoji: '✨',
    instruction: 'Make a soft rolling "brrrp" or "trrrr" — let it vibrate in your throat.',
    targets: {
      volume_rms_db: [-36, -20],
      pitch_hz: [150, 500],
      duration_ms: [200, 700],
    },
    xpReward: 15,
    aiContext:
      'User is learning the gentle trill: very soft volume (-36 to -20 dB), lower-medium pitch (150–500 Hz), brief rolling duration (200–700 ms). It should sound like a rising "brrr" — warm and welcoming.',
  },
  {
    id: 'cat_chirp_1',
    animal: 'cat',
    phase: 1,
    phaseTitle: CAT_PHASE_1,
    title: 'Hunting Chirp',
    description: 'The rapid staccato sound cats make watching birds.',
    emoji: '🐦',
    instruction: 'Make a quick, clipped "ck-ck-ck" chattering sound — rapid and slightly higher pitched.',
    targets: {
      volume_rms_db: [-28, -15],
      pitch_hz: [300, 700],
      duration_ms: [100, 400],
      burst_count: [2, 6],
      burst_spacing_ms: [50, 200],
    },
    xpReward: 20,
    aiContext:
      'User is learning the hunting chirp: quick bursts (2–6 bursts, 50–200 ms apart), medium volume (-28 to -15 dB), higher pitched (300–700 Hz), very short individual bursts (100–400 ms total). Think rapid staccato chattering.',
  },

  // ── Cat Phase 2: Emotional Intent ────────────────────────────────────────
  {
    id: 'cat_affection_2',
    animal: 'cat',
    phase: 2,
    phaseTitle: CAT_PHASE_2,
    title: 'Affection Call',
    description: 'A slow rising tone that says "I love you."',
    emoji: '💕',
    instruction: 'Start low and let your voice rise gently — "meeeoow" — soft and slow.',
    targets: {
      volume_rms_db: [-36, -18],
      pitch_hz: [150, 500],
      duration_ms: [600, 1500],
    },
    xpReward: 20,
    aiContext:
      'User is learning the affection call: soft volume (-36 to -18 dB), lower-medium pitch with rising inflection (150–500 Hz), longer duration (600–1500 ms). It should sound tender and relaxed — a slow, drawn-out meow that rises.',
  },
  {
    id: 'cat_hiss_2',
    animal: 'cat',
    phase: 2,
    phaseTitle: CAT_PHASE_2,
    title: 'Warning Hiss',
    description: 'The defensive hiss — a clear boundary signal.',
    emoji: '😼',
    instruction: 'Push air through your teeth sharply — a sustained "sssshhh" with some force.',
    targets: {
      volume_rms_db: [-20, -8],
      pitch_hz: [80, 350],
      duration_ms: [500, 2000],
      attack_ms: [10, 100],
    },
    xpReward: 20,
    aiContext:
      'User is learning the warning hiss: louder volume (-20 to -8 dB), low-frequency noise (80–350 Hz), sustained duration (500–2000 ms), very sharp attack (10–100 ms). It must sound aggressive, breathed, and immediate.',
  },
  {
    id: 'cat_mrrp_2',
    animal: 'cat',
    phase: 2,
    phaseTitle: CAT_PHASE_2,
    title: 'Soft Mrrp',
    description: 'A tiny questioning sound — cats use it as a quick acknowledgment.',
    emoji: '💭',
    instruction: 'Make a very brief, quiet "mrrp" — like a tiny upward blip. Almost a whisper.',
    targets: {
      volume_rms_db: [-40, -24],
      pitch_hz: [250, 600],
      duration_ms: [80, 300],
    },
    xpReward: 20,
    aiContext:
      'User is learning the soft mrrp: very quiet volume (-40 to -24 dB), medium pitch (250–600 Hz), extremely brief (80–300 ms). This is the quietest lesson — it should be barely audible, like a tiny acknowledgment.',
  },
  {
    id: 'cat_fear_2',
    animal: 'cat',
    phase: 2,
    phaseTitle: CAT_PHASE_2,
    title: 'Fear Vocalization',
    description: 'High-pitched and breathy — distress and uncertainty.',
    emoji: '😨',
    instruction: 'Make a higher-pitched, slightly breathy "mrooowr" — wavering and uncertain.',
    targets: {
      volume_rms_db: [-30, -16],
      pitch_hz: [400, 750],
      duration_ms: [400, 1200],
    },
    xpReward: 25,
    aiContext:
      'User is learning the fear vocalization: medium-soft volume (-30 to -16 dB), higher pitch (400–750 Hz, near detector ceiling), medium duration (400–1200 ms). It should sound wavering or quivering — not aggressive, more uncertain.',
  },
  {
    id: 'cat_territorial_2',
    animal: 'cat',
    phase: 2,
    phaseTitle: CAT_PHASE_2,
    title: 'Territorial Warning',
    description: 'A low growl-hiss that says "this is my space."',
    emoji: '🛡️',
    instruction: 'Drop your voice low and growl-hiss — a deep, sustained "grrrrr" with some breath.',
    targets: {
      volume_rms_db: [-22, -10],
      pitch_hz: [80, 250],
      duration_ms: [600, 2000],
    },
    xpReward: 30,
    aiContext:
      'User is learning the territorial warning: medium-loud volume (-22 to -10 dB), very low pitch (80–250 Hz), sustained duration (600–2000 ms). This is the lowest-pitched cat lesson — it should rumble and feel threatening.',
  },

  // ── Cat Phase 3: Conversational Patterns ─────────────────────────────────
  {
    id: 'cat_greeting_3',
    animal: 'cat',
    phase: 3,
    phaseTitle: CAT_PHASE_3,
    title: 'Cat Greeting Exchange',
    description: 'A brief, warm exchange — soft trill followed by a friendly meow.',
    emoji: '🤝',
    instruction: 'Start with a soft trill ("brrrp") then immediately follow with a gentle meow.',
    targets: {
      volume_rms_db: [-36, -18],
      pitch_hz: [200, 600],
      duration_ms: [400, 1200],
      burst_count: [2, 3],
      burst_spacing_ms: [100, 400],
    },
    xpReward: 35,
    aiContext:
      'User is learning the cat greeting exchange: a two-part sequence — trill then meow. Soft volume (-36 to -18 dB), medium pitch (200–600 Hz), 2–3 distinct sounds (100–400 ms apart), total duration 400–1200 ms. Focus on the two-part natural rhythm.',
  },
  {
    id: 'cat_request_3',
    animal: 'cat',
    phase: 3,
    phaseTitle: CAT_PHASE_3,
    title: 'Attention Request',
    description: 'A polite but persistent series of soft meows.',
    emoji: '🙋',
    instruction: 'Three gentle meows with rising urgency — soft but increasingly insistent.',
    targets: {
      volume_rms_db: [-30, -14],
      pitch_hz: [200, 600],
      duration_ms: [1000, 2800],
      burst_count: [3, 4],
      burst_spacing_ms: [200, 500],
    },
    xpReward: 35,
    aiContext:
      'User is learning the attention request: 3–4 meows (-30 to -14 dB), 200–500 ms apart, each slightly more urgent than the last. Medium pitch (200–600 Hz), total 1000–2800 ms. The rhythm should feel politely persistent.',
  },
  {
    id: 'cat_play_3',
    animal: 'cat',
    phase: 3,
    phaseTitle: CAT_PHASE_3,
    title: 'Play Invitation',
    description: 'Quick, excited chirps mixed with a light trill.',
    emoji: '🎾',
    instruction: 'A flurry of quick chattery sounds — rapid and excited, like you spotted a toy.',
    targets: {
      volume_rms_db: [-26, -12],
      pitch_hz: [300, 700],
      duration_ms: [500, 1500],
      burst_count: [3, 7],
      burst_spacing_ms: [60, 200],
    },
    xpReward: 40,
    aiContext:
      'User is learning the play invitation: rapid excited bursts (3–7, every 60–200 ms), medium-loud volume (-26 to -12 dB), higher pitch (300–700 Hz), total duration 500–1500 ms. This should sound energetic and quick — like excited chattering.',
  },

  // ── Dog Phase 1: Core Vocalizations ──────────────────────────────────────
  {
    id: 'dog_bark_1',
    animal: 'dog',
    phase: 1,
    phaseTitle: DOG_PHASE_1,
    title: 'Alert Bark',
    description: 'Sharp, loud, short — the classic "someone is at the door" bark.',
    emoji: '🚨',
    instruction: 'A single sharp, loud "WOOF" — short and crisp, like you mean business.',
    targets: {
      volume_rms_db: [-14, -4],
      pitch_hz: [150, 420],
      duration_ms: [100, 500],
      attack_ms: [5, 80],
    },
    xpReward: 10,
    aiContext:
      'User is learning the alert bark: loud volume (-14 to -4 dB), low-medium pitch (150–420 Hz), very short duration (100–500 ms), extremely sharp attack (5–80 ms). This must be sudden, loud, and brief — like a single sharp "WOOF".',
  },
  {
    id: 'dog_yip_1',
    animal: 'dog',
    phase: 1,
    phaseTitle: DOG_PHASE_1,
    title: 'Excited Yip',
    description: 'High-pitched and quick — small dog energy.',
    emoji: '🐕',
    instruction: 'A quick high-pitched "yip!" — light and fast, like a small excited dog.',
    targets: {
      volume_rms_db: [-22, -10],
      pitch_hz: [350, 750],
      duration_ms: [50, 300],
      attack_ms: [5, 60],
    },
    xpReward: 10,
    aiContext:
      'User is learning the excited yip: medium-loud volume (-22 to -10 dB), higher pitch (350–750 Hz), very brief (50–300 ms), sharp attack (5–60 ms). Think small dog, high energy — quick and light.',
  },
  {
    id: 'dog_growl_1',
    animal: 'dog',
    phase: 1,
    phaseTitle: DOG_PHASE_1,
    title: 'Low Growl',
    description: 'Deep and sustained — warning without barking.',
    emoji: '😤',
    instruction: 'Rumble from your chest — a sustained deep "grrrrr" with real resonance.',
    targets: {
      volume_rms_db: [-18, -6],
      pitch_hz: [80, 220],
      duration_ms: [600, 2200],
    },
    xpReward: 20,
    aiContext:
      'User is learning the low growl: medium-loud volume (-18 to -6 dB), very low pitch (80–220 Hz), sustained duration (600–2200 ms). The key is low pitch and chest resonance — it should feel threatening and steady.',
  },
  {
    id: 'dog_whine_1',
    animal: 'dog',
    phase: 1,
    phaseTitle: DOG_PHASE_1,
    title: 'Anxiety Whine',
    description: 'High-pitched and soft — nervous or wanting comfort.',
    emoji: '🥺',
    instruction: 'A soft, high-pitched "whhhhine" — drawn out and slightly wavering.',
    targets: {
      volume_rms_db: [-30, -16],
      pitch_hz: [400, 750],
      duration_ms: [500, 2000],
    },
    xpReward: 15,
    aiContext:
      'User is learning the anxiety whine: soft volume (-30 to -16 dB), high pitch (400–750 Hz), medium-long duration (500–2000 ms). It should sound plaintive and slightly trembling — not aggressive, more submissive.',
  },
  {
    id: 'dog_howl_1',
    animal: 'dog',
    phase: 1,
    phaseTitle: DOG_PHASE_1,
    title: 'Long Howl',
    description: 'Extended and rising — the classic wolf call.',
    emoji: '🌕',
    instruction: 'Let your voice rise and sustain — "aaaawooooo" — hold it as long as you can.',
    targets: {
      volume_rms_db: [-16, -4],
      pitch_hz: [150, 550],
      duration_ms: [1200, 4000],
    },
    xpReward: 25,
    aiContext:
      'User is learning the long howl: loud volume (-16 to -4 dB), medium pitch that rises (150–550 Hz), very long duration (1200–4000 ms). The key is sustained volume and length — it should feel like a full wolf howl.',
  },

  // ── Dog Phase 2: Intent Recognition ──────────────────────────────────────
  {
    id: 'dog_play_2',
    animal: 'dog',
    phase: 2,
    phaseTitle: DOG_PHASE_2,
    title: 'Play Bark',
    description: 'High-energy repeated barking — "let\'s go!"',
    emoji: '🎉',
    instruction: 'Rapid excited barks — 3 to 6 times, energetic and happy-sounding.',
    targets: {
      volume_rms_db: [-20, -8],
      pitch_hz: [200, 550],
      duration_ms: [800, 2500],
      burst_count: [3, 6],
      burst_spacing_ms: [100, 350],
    },
    xpReward: 25,
    aiContext:
      'User is learning the play bark: 3–6 rapid barks (100–350 ms apart), medium-loud volume (-20 to -8 dB), medium pitch (200–550 Hz), total duration 800–2500 ms. Energy is key — it should sound happy and urgent.',
  },
  {
    id: 'dog_fearwhine_2',
    animal: 'dog',
    phase: 2,
    phaseTitle: DOG_PHASE_2,
    title: 'Fear Whine',
    description: 'Soft, sustained, high-pitched — genuinely scared.',
    emoji: '😰',
    instruction: 'A long, quiet, high-pitched whine — wavering at the end, like you\'re frightened.',
    targets: {
      volume_rms_db: [-34, -20],
      pitch_hz: [450, 750],
      duration_ms: [800, 2500],
    },
    xpReward: 25,
    aiContext:
      'User is learning the fear whine: quiet volume (-34 to -20 dB), very high pitch (450–750 Hz), long duration (800–2500 ms). It should sound genuinely distressed — quieter and higher than the anxiety whine.',
  },
  {
    id: 'dog_excitement_2',
    animal: 'dog',
    phase: 2,
    phaseTitle: DOG_PHASE_2,
    title: 'Excitement Burst',
    description: 'Rapid-fire yips and barks mixed together.',
    emoji: '⚡',
    instruction: 'A fast burst of mixed yips and barks — as many as possible in 2 seconds.',
    targets: {
      volume_rms_db: [-18, -6],
      pitch_hz: [250, 650],
      duration_ms: [700, 2200],
      burst_count: [4, 8],
      burst_spacing_ms: [80, 250],
    },
    xpReward: 30,
    aiContext:
      'User is learning the excitement burst: 4–8 rapid mixed sounds (80–250 ms apart), medium-loud volume (-18 to -6 dB), varied pitch (250–650 Hz), total 700–2200 ms. Pure energy — fast, varied, relentless.',
  },
  {
    id: 'dog_aggression_2',
    animal: 'dog',
    phase: 2,
    phaseTitle: DOG_PHASE_2,
    title: 'Aggression Growl',
    description: 'Deep, low, and sustained — a serious warning.',
    emoji: '⚠️',
    instruction: 'A sustained low growl — deeper and louder than the basic growl, with full conviction.',
    targets: {
      volume_rms_db: [-14, -4],
      pitch_hz: [80, 200],
      duration_ms: [1000, 3000],
    },
    xpReward: 30,
    aiContext:
      'User is learning the aggression growl: louder than basic growl (-14 to -4 dB), very low pitch (80–200 Hz), long sustained duration (1000–3000 ms). This is the most intense growl — it must feel genuinely threatening.',
  },
  {
    id: 'dog_submission_2',
    animal: 'dog',
    phase: 2,
    phaseTitle: DOG_PHASE_2,
    title: 'Submission Whimper',
    description: 'Quiet, short whimpers — apologetic and small.',
    emoji: '🙏',
    instruction: 'Soft, brief whimpers — 2 or 3 of them, quiet and hesitant.',
    targets: {
      volume_rms_db: [-38, -22],
      pitch_hz: [350, 700],
      duration_ms: [400, 1500],
      burst_count: [2, 4],
      burst_spacing_ms: [150, 500],
    },
    xpReward: 25,
    aiContext:
      'User is learning the submission whimper: very quiet (−38 to −22 dB), 2–4 brief soft whimpers (150–500 ms apart), medium-high pitch (350–700 Hz), total 400–1500 ms. These should be tiny and hesitant — the quietest dog lesson.',
  },

  // ── Dog Phase 3: Pack Interaction ─────────────────────────────────────────
  {
    id: 'dog_packgreeting_3',
    animal: 'dog',
    phase: 3,
    phaseTitle: DOG_PHASE_3,
    title: 'Pack Greeting',
    description: 'An excited yip followed by a warm howl fragment.',
    emoji: '🫂',
    instruction: 'Start with a quick yip, then immediately transition into a short rising howl.',
    targets: {
      volume_rms_db: [-20, -8],
      pitch_hz: [200, 600],
      duration_ms: [600, 1800],
      burst_count: [2, 3],
      burst_spacing_ms: [100, 400],
    },
    xpReward: 40,
    aiContext:
      'User is learning the pack greeting: two-part sequence — yip then short howl. Medium-loud volume (-20 to -8 dB), rising pitch (200–600 Hz), 600–1800 ms total, 2–3 distinct phases. The transition from short burst to sustained howl is key.',
  },
  {
    id: 'dog_warningcall_3',
    animal: 'dog',
    phase: 3,
    phaseTitle: DOG_PHASE_3,
    title: 'Warning Call',
    description: 'Alert bark repeated 3 times — escalating intensity.',
    emoji: '📢',
    instruction: 'Three sharp barks in quick succession, each one louder than the last.',
    targets: {
      volume_rms_db: [-16, -4],
      pitch_hz: [150, 420],
      duration_ms: [600, 1800],
      burst_count: [3, 4],
      burst_spacing_ms: [100, 300],
    },
    xpReward: 40,
    aiContext:
      'User is learning the warning call: 3–4 sharp alert barks (100–300 ms apart), loud volume (-16 to -4 dB), low-medium pitch (150–420 Hz), total 600–1800 ms. Each bark should feel more urgent — escalating urgency across the sequence.',
  },
  {
    id: 'dog_playinit_3',
    animal: 'dog',
    phase: 3,
    phaseTitle: DOG_PHASE_3,
    title: 'Play Initiation',
    description: 'A playful bow-bark: high yip, pause, rapid play barks.',
    emoji: '🎮',
    instruction: 'High-pitched yip, brief pause, then a burst of rapid excited barks — it\'s play time!',
    targets: {
      volume_rms_db: [-22, -8],
      pitch_hz: [250, 650],
      duration_ms: [800, 2500],
      burst_count: [4, 8],
      burst_spacing_ms: [80, 300],
    },
    xpReward: 45,
    aiContext:
      'User is learning the play initiation: starts with a high yip then rapid barks (4–8 total, 80–300 ms apart), medium-loud volume (-22 to -8 dB), mixed pitch (250–650 Hz), total 800–2500 ms. The burst pattern — pause then rapid — is the signature.',
  },
];

export function getLessonsForAnimal(animal: 'cat' | 'dog'): Lesson[] {
  return LESSONS.filter((l) => l.animal === animal);
}

export function getLessonsByPhase(animal: 'cat' | 'dog', phase: number): Lesson[] {
  return LESSONS.filter((l) => l.animal === animal && l.phase === phase);
}

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getNextLesson(currentId: string): Lesson | undefined {
  const idx = LESSONS.findIndex((l) => l.id === currentId);
  if (idx === -1) return undefined;
  const current = LESSONS[idx];
  // Next lesson: same animal, same or next phase
  return LESSONS.slice(idx + 1).find((l) => l.animal === current.animal);
}

export const PHASES_FOR_ANIMAL: Record<'cat' | 'dog', number[]> = {
  cat: [1, 2, 3],
  dog: [1, 2, 3],
};

export const PHASE_TITLE_FOR_ANIMAL: Record<'cat' | 'dog', Record<number, string>> = {
  cat: { 1: CAT_PHASE_1, 2: CAT_PHASE_2, 3: CAT_PHASE_3 },
  dog: { 1: DOG_PHASE_1, 2: DOG_PHASE_2, 3: DOG_PHASE_3 },
};
