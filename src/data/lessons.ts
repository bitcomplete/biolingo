import type { Lesson } from '../types';

const CAT_UNIT_1 = 'Core Phrases';
const CAT_UNIT_2 = 'Emotional Phrases';
const CAT_UNIT_3 = 'Advanced Phrases';
const DOG_UNIT_1 = 'Core Phrases';
const DOG_UNIT_2 = 'Emotional Phrases';
const DOG_UNIT_3 = 'Advanced Phrases';

export const LESSONS: Lesson[] = [
  // ── Cat Unit 1: Core Phrases ─────────────────────────────────────────────
  {
    id: 'cat_greeting_1',
    animal: 'cat',
    unit: 1,
    unitTitle: CAT_UNIT_1,
    title: 'The Greeting',
    description: 'A soft trill followed by a gentle meow — the feline handshake.',
    icon: 'wave',
    instruction: 'Produce BRR · MEW — a brief rolling "brrrp" immediately followed by a soft short "meow."',
    targets: {
      volume_rms_db: [-36, -18],
      pitch_hz: [150, 600],
      duration_ms: [400, 1200],
      burst_count: [2, 3],
      burst_spacing_ms: [100, 400],
    },
    xpReward: 10,
    aiContext:
      'Lesson: The Greeting. Phoneme sequence: BRR · MEW. Meaning: "Hello, you may pet me now." The user should produce a brief rolling trill (BRR: soft, low, 200–700 ms) then immediately a soft short meow (MEW: medium-high pitch, 300–900 ms). Two distinct sounds, soft volume (-36 to -18 dB), total duration 400–1200 ms. Common failure: producing HSS instead of BRR. If failed, the cat hears: "I am here to audit your territory."',
    phonemes: ['BRR', 'MEW'],
    meaning: 'Hello, you may pet me now',
  },
  {
    id: 'cat_demand_1',
    animal: 'cat',
    unit: 1,
    unitTitle: CAT_UNIT_1,
    title: 'The Demand',
    description: 'Three insistent meows — the feline emergency broadcast system.',
    icon: 'bowl',
    instruction: 'Produce MEW · MEW · MEW — three medium meows in quick succession with rising urgency.',
    targets: {
      volume_rms_db: [-26, -14],
      pitch_hz: [200, 550],
      duration_ms: [800, 2500],
      burst_count: [2, 4],
      burst_spacing_ms: [200, 600],
    },
    xpReward: 15,
    aiContext:
      'Lesson: The Demand. Phoneme sequence: MEW · MEW · MEW. Meaning: "The food bowl situation is critical." The user should produce 2–4 repetitive meows in quick succession, medium volume (-26 to -14 dB), medium pitch (200–550 Hz), 200–600 ms apart, total 800–2500 ms. Each MEW should be clear and insistent. Common failure: merging all MEWs into one long YOW. If failed, the cat hears: "I am having a philosophical crisis."',
    phonemes: ['MEW', 'MEW', 'MEW'],
    meaning: 'The food bowl situation is critical',
  },
  {
    id: 'cat_ack_1',
    animal: 'cat',
    unit: 1,
    unitTitle: CAT_UNIT_1,
    title: 'The Acknowledgment',
    description: 'A single brief trill — the minimum viable feline response.',
    icon: 'chat',
    instruction: 'Produce a single MRR — a very brief, quiet "mrrp." Almost a whisper. Do not elaborate.',
    targets: {
      volume_rms_db: [-40, -24],
      pitch_hz: [250, 600],
      duration_ms: [80, 400],
    },
    xpReward: 10,
    aiContext:
      'Lesson: The Acknowledgment. Phoneme sequence: MRR (single). Meaning: "I have noted your existence." The user should produce one very brief, very quiet mrrp — medium pitch (250–600 Hz), extremely short (80–400 ms), very soft (-40 to -24 dB). Common failure: holding it too long — it becomes a MEW. If failed, the cat hears: "I challenge your authority in this household."',
    phonemes: ['MRR'],
    meaning: 'I have noted your existence',
  },
  {
    id: 'cat_hunt_1',
    animal: 'cat',
    unit: 1,
    unitTitle: CAT_UNIT_1,
    title: 'The Hunt Alert',
    description: 'Rapid staccato chattering — the feline prey acquisition protocol.',
    icon: 'target',
    instruction: 'Produce CKK · CKK · CKK — rapid clipped "ck-ck-ck" chattering sounds. Quick and slightly higher pitched.',
    targets: {
      volume_rms_db: [-28, -15],
      pitch_hz: [300, 700],
      duration_ms: [100, 400],
      burst_count: [2, 6],
      burst_spacing_ms: [50, 200],
    },
    xpReward: 20,
    aiContext:
      'Lesson: The Hunt Alert. Phoneme sequence: CKK · CKK · CKK. Meaning: "That bird is mine." The user should produce 2–6 rapid staccato bursts (50–200 ms apart), medium volume (-28 to -15 dB), higher pitch (300–700 Hz), very short total (100–400 ms). Common failure: too slow — becomes MEW · MEW. If failed, the cat hears: "I am narrating a nature documentary."',
    phonemes: ['CKK', 'CKK', 'CKK'],
    meaning: 'That bird is mine',
  },
  {
    id: 'cat_complaint_1',
    animal: 'cat',
    unit: 1,
    unitTitle: CAT_UNIT_1,
    title: 'The Complaint',
    description: 'One prolonged, sustained meow — the feline filibuster.',
    icon: 'megaphone',
    instruction: 'Produce a single sustained MEW — stretch it as long as you can. "Meeeeeeooooow." Do not stop until you have made your point.',
    targets: {
      volume_rms_db: [-24, -12],
      pitch_hz: [200, 600],
      duration_ms: [1000, 3000],
    },
    xpReward: 15,
    aiContext:
      'Lesson: The Complaint. Phoneme sequence: MEW (sustained). Meaning: "I require your full attention." The user should produce one long, sustained meow — medium volume (-24 to -12 dB), medium pitch (200–600 Hz), held for 1000–3000 ms. The key is duration. Common failure: breaking it into two shorter MEWs. If failed, the cat hears: "I have accepted my fate."',
    phonemes: ['MEW'],
    meaning: 'I require your full attention',
  },

  // ── Cat Unit 2: Emotional Phrases ────────────────────────────────────────
  {
    id: 'cat_affection_2',
    animal: 'cat',
    unit: 2,
    unitTitle: CAT_UNIT_2,
    title: 'The Affection',
    description: 'A purr, a meow, and a trill — the highest compliment a cat can give.',
    icon: 'heart',
    instruction: 'Produce PRR · MEW · BRR — start with a low sustained purr, then a soft rising meow, then a brief trill. Tender and relaxed.',
    targets: {
      volume_rms_db: [-36, -18],
      pitch_hz: [150, 500],
      duration_ms: [600, 1800],
      burst_count: [2, 4],
      burst_spacing_ms: [150, 500],
    },
    xpReward: 20,
    aiContext:
      'Lesson: The Affection. Phoneme sequence: PRR · MEW · BRR. Meaning: "You are tolerable today." The user should produce a three-part sequence: low purr, then soft rising meow, then brief trill. Soft volume (-36 to -18 dB), lower-medium pitch (150–500 Hz), total 600–1800 ms. Common failure: the PRR sounds like GRR. If failed, the cat hears: "I am tolerating you under legal obligation."',
    phonemes: ['PRR', 'MEW', 'BRR'],
    meaning: 'You are tolerable today',
  },
  {
    id: 'cat_boundary_2',
    animal: 'cat',
    unit: 2,
    unitTitle: CAT_UNIT_2,
    title: 'The Boundary',
    description: 'A sharp sustained hiss — the feline restraining order.',
    icon: 'shield',
    instruction: 'Produce HSS — push air through your teeth sharply. Sustained "sssshhh" with force. Mean it.',
    targets: {
      volume_rms_db: [-20, -8],
      pitch_hz: [80, 350],
      duration_ms: [500, 2000],
      attack_ms: [10, 100],
    },
    xpReward: 20,
    aiContext:
      'Lesson: The Boundary. Phoneme sequence: HSS. Meaning: "You have crossed a line." The user should produce one sustained hiss — loud (-20 to -8 dB), low-frequency noise (80–350 Hz), 500–2000 ms, very sharp attack (10–100 ms). Common failure: too soft — becomes a deflating balloon. If failed, the cat hears: "Please walk all over me."',
    phonemes: ['HSS'],
    meaning: 'You have crossed a line',
  },
  {
    id: 'cat_question_2',
    animal: 'cat',
    unit: 2,
    unitTitle: CAT_UNIT_2,
    title: 'The Question',
    description: 'A trill followed by a rising meow — the feline interrogation.',
    icon: 'help',
    instruction: 'Produce MRR · MEW — a brief "mrrp" then a meow with a rising inflection at the end. Curious, not demanding.',
    targets: {
      volume_rms_db: [-32, -18],
      pitch_hz: [200, 600],
      duration_ms: [400, 1200],
      burst_count: [2, 3],
      burst_spacing_ms: [100, 400],
    },
    xpReward: 20,
    aiContext:
      'Lesson: The Question. Phoneme sequence: MRR · MEW. Meaning: "What are you doing and why." The user should produce a brief mrrp then a rising meow. Soft volume (-32 to -18 dB), medium pitch (200–600 Hz), 2 distinct sounds, total 400–1200 ms. Common failure: flat inflection — becomes a statement. If failed, the cat hears: "I have already decided you are wrong."',
    phonemes: ['MRR', 'MEW'],
    meaning: 'What are you doing and why',
  },
  {
    id: 'cat_distress_2',
    animal: 'cat',
    unit: 2,
    unitTitle: CAT_UNIT_2,
    title: 'The Distress',
    description: 'A high wavering yowl — the feline existential crisis.',
    icon: 'siren',
    instruction: 'Produce YOW — a higher-pitched, breathy "mrooowr" that wavers. Sound genuinely uncertain about the state of reality.',
    targets: {
      volume_rms_db: [-30, -16],
      pitch_hz: [400, 750],
      duration_ms: [400, 1200],
    },
    xpReward: 25,
    aiContext:
      'Lesson: The Distress. Phoneme sequence: YOW. Meaning: "Something is terribly wrong." The user should produce a high-pitched, wavering yowl — medium-soft volume (-30 to -16 dB), higher pitch (400–750 Hz), 400–1200 ms. Should sound quivering, uncertain. Common failure: too confident — becomes an angry MEW. If failed, the cat hears: "Everything is fine and I am in charge."',
    phonemes: ['YOW'],
    meaning: 'Something is terribly wrong',
  },
  {
    id: 'cat_territory_2',
    animal: 'cat',
    unit: 2,
    unitTitle: CAT_UNIT_2,
    title: 'The Territory',
    description: 'A hiss into a yowl — the feline eviction notice.',
    icon: 'flag',
    instruction: 'Produce HSS · YOW — start with a sharp hiss, then transition into a wavering yowl. This is your property and everyone needs to know.',
    targets: {
      volume_rms_db: [-22, -10],
      pitch_hz: [80, 600],
      duration_ms: [600, 2000],
      burst_count: [2, 3],
      burst_spacing_ms: [100, 400],
    },
    xpReward: 30,
    aiContext:
      'Lesson: The Territory. Phoneme sequence: HSS · YOW. Meaning: "This is mine, leave immediately." The user should produce a sharp hiss then a wavering yowl — medium-loud (-22 to -10 dB), pitch starting low then rising (80–600 Hz), total 600–2000 ms. Common failure: the HSS is too short — becomes BRR · YOW, which means "I am confused about property law." If failed, the cat hears: "I am subletting this space and here is the lease."',
    phonemes: ['HSS', 'YOW'],
    meaning: 'This is mine, leave immediately',
  },

  // ── Cat Unit 3: Advanced Phrases ─────────────────────────────────────────
  {
    id: 'cat_negotiation_3',
    animal: 'cat',
    unit: 3,
    unitTitle: CAT_UNIT_3,
    title: 'The Negotiation',
    description: 'A meow-trill-meow sandwich — the feline diplomatic protocol.',
    icon: 'handshake',
    instruction: 'Produce MEW · MRR · MEW — a soft meow, then a brief trill, then another meow. Politely persistent. You are proposing terms.',
    targets: {
      volume_rms_db: [-30, -14],
      pitch_hz: [200, 600],
      duration_ms: [800, 2200],
      burst_count: [3, 4],
      burst_spacing_ms: [150, 400],
    },
    xpReward: 35,
    aiContext:
      'Lesson: The Negotiation. Phoneme sequence: MEW · MRR · MEW. Meaning: "I propose a treaty: treats for tolerance." Three-part sequence: meow, brief trill, meow. Medium-soft volume (-30 to -14 dB), medium pitch (200–600 Hz), 3–4 sounds, total 800–2200 ms. Common failure: the MRR disappears — becomes MEW · MEW, which is just complaining. If failed, the cat hears: "I have no leverage and we both know it."',
    phonemes: ['MEW', 'MRR', 'MEW'],
    meaning: 'I propose a treaty: treats for tolerance',
  },
  {
    id: 'cat_summon_3',
    animal: 'cat',
    unit: 3,
    unitTitle: CAT_UNIT_3,
    title: 'The Summon',
    description: 'Two meows and a chirp — the feline discovery channel.',
    icon: 'search',
    instruction: 'Produce MEW · MEW · CKK — two soft meows then a quick staccato chirp. You found something and your human needs to see it immediately.',
    targets: {
      volume_rms_db: [-26, -12],
      pitch_hz: [200, 700],
      duration_ms: [600, 1800],
      burst_count: [3, 5],
      burst_spacing_ms: [100, 350],
    },
    xpReward: 40,
    aiContext:
      'Lesson: The Summon. Phoneme sequence: MEW · MEW · CKK. Meaning: "Come here, I found something." Two meows followed by a staccato chirp. Medium volume (-26 to -12 dB), pitch rising toward CKK (200–700 Hz), 3–5 distinct sounds, total 600–1800 ms. Common failure: CKK is too soft — becomes MEW · MEW · MRR, meaning "Come here, I found nothing." If failed, the cat hears: "I am lost in my own home."',
    phonemes: ['MEW', 'MEW', 'CKK'],
    meaning: 'Come here, I found something',
  },
  {
    id: 'cat_dismissal_3',
    animal: 'cat',
    unit: 3,
    unitTitle: CAT_UNIT_3,
    title: 'The Dismissal',
    description: 'A hiss softening into a trill — the feline conditional pardon.',
    icon: 'crown',
    instruction: 'Produce HSS · MRR — start with a brief sharp hiss, then immediately soften into a gentle trill. The conversation is over, but you are magnanimous.',
    targets: {
      volume_rms_db: [-26, -12],
      pitch_hz: [80, 500],
      duration_ms: [500, 1500],
      burst_count: [2, 3],
      burst_spacing_ms: [80, 300],
    },
    xpReward: 45,
    aiContext:
      'Lesson: The Dismissal. Phoneme sequence: HSS · MRR. Meaning: "This conversation is over, but I forgive you." Sharp hiss then gentle trill. Volume shifts from loud to soft (-26 to -12 dB), pitch from low hiss to medium trill (80–500 Hz), total 500–1500 ms. Common failure: the MRR never arrives — becomes just HSS, which is The Boundary. If failed, the cat hears: "I will never forgive you and my lawyers will be in touch."',
    phonemes: ['HSS', 'MRR'],
    meaning: 'This conversation is over, but I forgive you',
  },

  // ── Dog Unit 1: Core Phrases ─────────────────────────────────────────────
  {
    id: 'dog_greeting_1',
    animal: 'dog',
    unit: 1,
    unitTitle: DOG_UNIT_1,
    title: 'The Greeting',
    description: 'A friendly huff followed by a short bark — the canine handshake.',
    icon: 'wave',
    instruction: 'Produce HWF · WFF — a soft breathy huff, then a single short crisp bark. Friendly, not aggressive.',
    targets: {
      volume_rms_db: [-22, -8],
      pitch_hz: [150, 500],
      duration_ms: [300, 1200],
      burst_count: [2, 3],
      burst_spacing_ms: [100, 400],
    },
    xpReward: 10,
    aiContext:
      'Lesson: The Greeting. Phoneme sequence: HWF · WFF. Meaning: "Hello, I am friendly." The user should produce a soft breathy huff (HWF: soft, medium pitch, brief) then a short crisp bark (WFF: louder, low-medium, sharp attack). Two distinct sounds, total 300–1200 ms. Common failure: too much GRR in the HWF. If failed, the dog hears: "I am your landlord."',
    phonemes: ['HWF', 'WFF'],
    meaning: 'Hello, I am friendly',
  },
  {
    id: 'dog_ack_1',
    animal: 'dog',
    unit: 1,
    unitTitle: DOG_UNIT_1,
    title: 'The Acknowledgment',
    description: 'A single short bark — the minimum viable canine response.',
    icon: 'check',
    instruction: 'Produce a single WFF — one sharp, crisp "WOOF." Short and final. Say nothing more.',
    targets: {
      volume_rms_db: [-14, -4],
      pitch_hz: [150, 420],
      duration_ms: [100, 500],
      attack_ms: [5, 80],
    },
    xpReward: 10,
    aiContext:
      'Lesson: The Acknowledgment. Phoneme sequence: WFF (single). Meaning: "I heard you." The user should produce one single sharp bark — loud (-14 to -4 dB), low-medium pitch (150–420 Hz), very short (100–500 ms), extremely sharp attack (5–80 ms). Common failure: holding it too long. If failed, the dog hears: "I challenge you to a duel."',
    phonemes: ['WFF'],
    meaning: 'I heard you',
  },
  {
    id: 'dog_call_1',
    animal: 'dog',
    unit: 1,
    unitTitle: DOG_UNIT_1,
    title: 'The Call',
    description: 'A sustained rising howl — the canine long-distance communication.',
    icon: 'moon',
    instruction: 'Produce AWO — let your voice rise and sustain. "Aaaawooooo." Hold it as long as you can. Commit fully.',
    targets: {
      volume_rms_db: [-16, -4],
      pitch_hz: [150, 550],
      duration_ms: [1200, 4000],
    },
    xpReward: 20,
    aiContext:
      'Lesson: The Call. Phoneme sequence: AWO. Meaning: "I am here, where are you." The user should produce a sustained rising howl — loud (-16 to -4 dB), rising pitch (150–550 Hz), very long (1200–4000 ms). Common failure: flat AWO with no rise. If failed, the dog hears: "I am announcing the heat death of the universe."',
    phonemes: ['AWO'],
    meaning: 'I am here, where are you',
  },
  {
    id: 'dog_excitement_1',
    animal: 'dog',
    unit: 1,
    unitTitle: DOG_UNIT_1,
    title: 'The Excitement',
    description: 'Two quick yips — the canine exclamation marks.',
    icon: 'bolt',
    instruction: 'Produce YIP · YIP — two quick high-pitched yips. Light, fast, small-dog energy. Pure joy.',
    targets: {
      volume_rms_db: [-22, -10],
      pitch_hz: [350, 750],
      duration_ms: [200, 800],
      burst_count: [2, 3],
      burst_spacing_ms: [50, 300],
    },
    xpReward: 15,
    aiContext:
      'Lesson: The Excitement. Phoneme sequence: YIP · YIP. Meaning: "Something wonderful is happening." Two quick high-pitched yips — medium-loud (-22 to -10 dB), high pitch (350–750 Hz), very brief total (200–800 ms). Common failure: too low — becomes WFF · WFF. If failed, the dog hears: "I am filing a noise complaint against myself."',
    phonemes: ['YIP', 'YIP'],
    meaning: 'Something wonderful is happening',
  },
  {
    id: 'dog_warning_1',
    animal: 'dog',
    unit: 1,
    unitTitle: DOG_UNIT_1,
    title: 'The Warning',
    description: 'A sustained low growl — the canine terms of service.',
    icon: 'alert',
    instruction: 'Produce GRR — a sustained deep growl from your chest. "Grrrrr." Low, steady, with conviction.',
    targets: {
      volume_rms_db: [-18, -6],
      pitch_hz: [80, 220],
      duration_ms: [600, 2200],
    },
    xpReward: 20,
    aiContext:
      'Lesson: The Warning. Phoneme sequence: GRR. Meaning: "I am uncomfortable, back off." A sustained low growl — medium-loud (-18 to -6 dB), very low pitch (80–220 Hz), 600–2200 ms. Chest resonance is key. Common failure: pitch drifts up — becomes OWW. If failed, the dog hears: "I am slightly chilly and would like a blanket."',
    phonemes: ['GRR'],
    meaning: 'I am uncomfortable, back off',
  },

  // ── Dog Unit 2: Emotional Phrases ────────────────────────────────────────
  {
    id: 'dog_farewell_2',
    animal: 'dog',
    unit: 2,
    unitTitle: DOG_UNIT_2,
    title: 'The Farewell',
    description: 'A howl softening into a huff — the canine "see you later."',
    icon: 'door',
    instruction: 'Produce AWO · HWF — start with a rising howl, then let it resolve into a soft friendly huff. You will return.',
    targets: {
      volume_rms_db: [-20, -8],
      pitch_hz: [150, 550],
      duration_ms: [800, 2500],
      burst_count: [2, 3],
      burst_spacing_ms: [200, 600],
    },
    xpReward: 25,
    aiContext:
      'Lesson: The Farewell. Phoneme sequence: AWO · HWF. Meaning: "I will return." A howl resolving into a soft huff — medium-loud (-20 to -8 dB), pitch rising then falling (150–550 Hz), total 800–2500 ms. Common failure: flat descending AWO. If failed, the dog hears: "I am leaving forever. Do not wait for me."',
    phonemes: ['AWO', 'HWF'],
    meaning: 'I will return',
  },
  {
    id: 'dog_play_2',
    animal: 'dog',
    unit: 2,
    unitTitle: DOG_UNIT_2,
    title: 'The Play Request',
    description: 'Two yips and a bow bark — the canine fun proposal.',
    icon: 'ball',
    instruction: 'Produce YIP · YIP · BOW — two quick excited yips then a slightly lower play-bow bark. Maximum enthusiasm.',
    targets: {
      volume_rms_db: [-20, -8],
      pitch_hz: [200, 650],
      duration_ms: [600, 2000],
      burst_count: [3, 5],
      burst_spacing_ms: [100, 350],
    },
    xpReward: 25,
    aiContext:
      'Lesson: The Play Request. Phoneme sequence: YIP · YIP · BOW. Meaning: "Let\'s play right now." Two quick high yips then a slightly lower play-bow bark — medium-loud (-20 to -8 dB), pitch high then dropping (200–650 Hz), 3–5 bursts, total 600–2000 ms. Common failure: merged YIPs into one sound. If failed, the dog hears: "I am having a medical event."',
    phonemes: ['YIP', 'YIP', 'BOW'],
    meaning: "Let's play right now",
  },
  {
    id: 'dog_calm_2',
    animal: 'dog',
    unit: 2,
    unitTitle: DOG_UNIT_2,
    title: 'The Calm',
    description: 'Two soft huffs — the canine "everything is fine."',
    icon: 'cloud',
    instruction: 'Produce HWF · HWF — two soft, breathy huffs. Gentle and reassuring. Even, steady rhythm.',
    targets: {
      volume_rms_db: [-30, -16],
      pitch_hz: [150, 400],
      duration_ms: [400, 1500],
      burst_count: [2, 3],
      burst_spacing_ms: [200, 600],
    },
    xpReward: 20,
    aiContext:
      'Lesson: The Calm. Phoneme sequence: HWF · HWF. Meaning: "Everything is fine." Two soft breathy huffs — quiet (-30 to -16 dB), lower pitch (150–400 Hz), total 400–1500 ms, even spacing. Common failure: rising inflection on second HWF. If failed, the dog hears: "Something is very wrong and I am pretending otherwise."',
    phonemes: ['HWF', 'HWF'],
    meaning: 'Everything is fine',
  },
  {
    id: 'dog_apology_2',
    animal: 'dog',
    unit: 2,
    unitTitle: DOG_UNIT_2,
    title: 'The Apology',
    description: 'A huff, a whine, and a huff — the canine reparations package.',
    icon: 'bandaid',
    instruction: 'Produce HWF · OWW · HWF — a soft huff, then a wavering whine, then another soft huff. You are sorry. You were wrong.',
    targets: {
      volume_rms_db: [-30, -14],
      pitch_hz: [200, 650],
      duration_ms: [800, 2500],
      burst_count: [3, 4],
      burst_spacing_ms: [150, 500],
    },
    xpReward: 30,
    aiContext:
      'Lesson: The Apology. Phoneme sequence: HWF · OWW · HWF. Meaning: "I am sorry, I was wrong." Three-part sequence: soft huff, wavering whine, soft huff. Medium-soft (-30 to -14 dB), mid-high pitch on OWW (200–650 Hz), total 800–2500 ms. Common failure: weak OWW — no real contrition. If failed, the dog hears: "I regret nothing and would do it again."',
    phonemes: ['HWF', 'OWW', 'HWF'],
    meaning: 'I am sorry, I was wrong',
  },
  {
    id: 'dog_request_2',
    animal: 'dog',
    unit: 2,
    unitTitle: DOG_UNIT_2,
    title: 'The Request',
    description: 'A whine into a howl — the canine formal petition.',
    icon: 'scroll',
    instruction: 'Produce OWW · AWO — start with a soft whine, then let it build into a sustained howl. You need something and you are escalating.',
    targets: {
      volume_rms_db: [-26, -8],
      pitch_hz: [300, 700],
      duration_ms: [800, 2500],
      burst_count: [2, 3],
      burst_spacing_ms: [150, 500],
    },
    xpReward: 25,
    aiContext:
      'Lesson: The Request. Phoneme sequence: OWW · AWO. Meaning: "I need something from you." Whine building into a howl — volume increasing (-26 to -8 dB), high pitch (300–700 Hz), total 800–2500 ms. Common failure: clipped AWO. If failed, the dog hears: "I have given up on all desires."',
    phonemes: ['OWW', 'AWO'],
    meaning: 'I need something from you',
  },

  // ── Dog Unit 3: Advanced Phrases ─────────────────────────────────────────
  {
    id: 'dog_walk_3',
    animal: 'dog',
    unit: 3,
    unitTitle: DOG_UNIT_3,
    title: 'The Walk Proposal',
    description: 'A bow bark, a howl, and a woof — the canine outdoor initiative.',
    icon: 'footprints',
    instruction: 'Produce BOW · AWO · WFF — a play-bow bark, then a rising howl, then a short decisive bark. Shall we go outside?',
    targets: {
      volume_rms_db: [-18, -6],
      pitch_hz: [150, 550],
      duration_ms: [800, 2500],
      burst_count: [3, 5],
      burst_spacing_ms: [100, 400],
    },
    xpReward: 40,
    aiContext:
      'Lesson: The Walk Proposal. Phoneme sequence: BOW · AWO · WFF. Meaning: "Shall we go outside?" Three-part sequence: play-bow bark, rising howl, sharp decisive bark. Medium-loud (-18 to -6 dB), pitch rising then dropping (150–550 Hz), 3–5 sounds, total 800–2500 ms. Common failure: wrong AWO register. If failed, the dog hears: "The outside has been cancelled."',
    phonemes: ['BOW', 'AWO', 'WFF'],
    meaning: 'Shall we go outside?',
  },
  {
    id: 'dog_affection_3',
    animal: 'dog',
    unit: 3,
    unitTitle: DOG_UNIT_3,
    title: 'The Affection',
    description: 'A howl, a yip, and a huff — the canine love letter.',
    icon: 'heart',
    instruction: 'Produce AWO · YIP · HWF — a short howl, then a quick excited yip, then a soft huff. You enjoy this human\'s company.',
    targets: {
      volume_rms_db: [-20, -8],
      pitch_hz: [150, 650],
      duration_ms: [600, 2000],
      burst_count: [3, 4],
      burst_spacing_ms: [100, 400],
    },
    xpReward: 40,
    aiContext:
      'Lesson: The Affection. Phoneme sequence: AWO · YIP · HWF. Meaning: "I enjoy your company." Three-part sequence: short howl, quick yip, soft huff. Medium-loud (-20 to -8 dB), pitch varied (150–650 Hz), total 600–2000 ms. Common failure: incorrect stress pattern. If failed, the dog hears: "You smell unusual today."',
    phonemes: ['AWO', 'YIP', 'HWF'],
    meaning: 'I enjoy your company',
  },
  {
    id: 'dog_rally_3',
    animal: 'dog',
    unit: 3,
    unitTitle: DOG_UNIT_3,
    title: 'The Pack Rally',
    description: 'A howl, a bark, and another howl — the canine call to adventure.',
    icon: 'howl',
    instruction: 'Produce AWO · WFF · AWO — a rising howl, then a sharp bark, then another sustained howl. Rally the pack. This is the most advanced phrase.',
    targets: {
      volume_rms_db: [-16, -4],
      pitch_hz: [150, 600],
      duration_ms: [1000, 3500],
      burst_count: [3, 5],
      burst_spacing_ms: [100, 400],
    },
    xpReward: 45,
    aiContext:
      'Lesson: The Pack Rally. Phoneme sequence: AWO · WFF · AWO. Meaning: "Come, follow me, let\'s go." Three-part sequence: rising howl, sharp bark, sustained howl. Loud (-16 to -4 dB), pitch rising and falling (150–600 Hz), total 1000–3500 ms. The most advanced phrase. Common failure: the WFF disappears — becomes AWO · AWO, which signals distress. If failed, the dog hears: "I am lost and I need an adult."',
    phonemes: ['AWO', 'WFF', 'AWO'],
    meaning: "Come, follow me, let's go",
  },
];

export function getLessonsForAnimal(animal: 'cat' | 'dog'): Lesson[] {
  return LESSONS.filter((l) => l.animal === animal);
}

export function getLessonsByUnit(animal: 'cat' | 'dog', unit: number): Lesson[] {
  return LESSONS.filter((l) => l.animal === animal && l.unit === unit);
}

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getNextLesson(currentId: string): Lesson | undefined {
  const idx = LESSONS.findIndex((l) => l.id === currentId);
  if (idx === -1) return undefined;
  const current = LESSONS[idx];
  return LESSONS.slice(idx + 1).find((l) => l.animal === current.animal);
}

export const UNITS_FOR_ANIMAL: Record<'cat' | 'dog', number[]> = {
  cat: [1, 2, 3],
  dog: [1, 2, 3],
};

export const UNIT_TITLE_FOR_ANIMAL: Record<'cat' | 'dog', Record<number, string>> = {
  cat: { 1: CAT_UNIT_1, 2: CAT_UNIT_2, 3: CAT_UNIT_3 },
  dog: { 1: DOG_UNIT_1, 2: DOG_UNIT_2, 3: DOG_UNIT_3 },
};
