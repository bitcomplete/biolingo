import type { CatContext, DogBreed } from './types';

const CAT_TRANSLATIONS: Record<CatContext, string[]> = {
  food: [
    'Open the bag. Now.',
    'I can hear the kibble. Why am I not eating?',
    'My bowl is 40% empty. This is an emergency.',
    'You have exactly three seconds to produce treats.',
    'I will sit near my bowl and stare until you comply.',
    'The audacity of eating YOUR dinner before serving mine.',
  ],
  isolation: [
    'You left me. This is a formal complaint.',
    'Where is everyone? This is unacceptable.',
    'I have been abandoned for 47 seconds. Send help.',
    'The walls are closing in. Also, I knocked something off a shelf.',
    'If you do not return, I will redecorate.',
    'I am filing a grievance with cat HR.',
  ],
  brushing: [
    'More scritches, please.',
    'Continue the petting. You may not stop.',
    'Yes. Right there. Do not move your hand.',
    'I will allow this to continue. For now.',
    'You have earned 3 more minutes of my tolerance.',
    'Acceptable grooming technique. B+ at best.',
  ],
};

const DOG_TRANSLATIONS: Record<DogBreed, string[]> = {
  chihuahua: [
    'I am small but my demands are enormous.',
    'That was a WARNING. Do not test me.',
    'I fit in a purse but I run this house.',
    'You think this is funny? I will vibrate with rage.',
    'Fear me. FEAR ME.',
  ],
  german_shepherd: [
    'Perimeter secured. Awaiting further orders.',
    'Suspicious activity detected at the mailbox. Engaging.',
    'I have filed my daily security report.',
    'All clear. Permission to receive belly rubs, sir.',
    'The squirrel has been identified. Awaiting authorization.',
  ],
  husky: [
    'I HAVE THINGS TO SAY AND YOU WILL LISTEN.',
    'This is my TED talk and it will last four hours.',
    'No, I will NOT be quiet. I have OPINIONS.',
    'AWOOOOO. That means "I disagree" in Husky.',
    'I am not dramatic. I am expressive. There is a difference.',
  ],
  pitbull: [
    'I love you I love you I love you.',
    'Can I sit on your lap? I am only 70 pounds.',
    'Hi. HI. Are we best friends? We are best friends.',
    'I brought you this slightly destroyed tennis ball. You are welcome.',
    'Tail speed has reached maximum velocity.',
  ],
  shiba: [
    'I have opinions. They are correct.',
    'I will consider your request and get back to you never.',
    'Such bark. Much authority. Wow.',
    'I acknowledge your existence. Do not push your luck.',
    'I did what I wanted. I will continue to do what I want.',
  ],
};

const NOT_BARK_LINES = [
  'That... was not a bark.',
  'Bark.exe has failed to launch.',
  'Is that a human? Suspicious.',
  'No dog detected. Only disappointment.',
  'The bark-o-meter reads zero. Try again.',
];

const NOT_MEOW_LINES = [
  'That was not a meow by any known definition.',
  'Meow not found. 404.',
  'Even the cat is embarrassed for you.',
  'No feline detected in that sound.',
  'The meow-o-meter flatlined.',
];

export function getCatTranslation(context: CatContext): string {
  const pool = CAT_TRANSLATIONS[context];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getDogTranslation(breed: DogBreed): string {
  const pool = DOG_TRANSLATIONS[breed];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getNotBarkLine(): string {
  return NOT_BARK_LINES[Math.floor(Math.random() * NOT_BARK_LINES.length)];
}

export function getNotMeowLine(): string {
  return NOT_MEOW_LINES[Math.floor(Math.random() * NOT_MEOW_LINES.length)];
}
