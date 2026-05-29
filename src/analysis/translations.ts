import type { CatContext, DogBreed } from './types';

const CAT_TRANSLATIONS: Record<CatContext, string[]> = {
  food: [
    'Your MEW · MEW · MEW was decoded as: "Open the bag. Now."',
    'Felinetic analysis confirms: this was a formal demand for kibble.',
    'Your MEW sequence registered as a Category 3 food emergency.',
    'The MEW cadence matches "My bowl is 40% empty. This is unacceptable."',
    'Your phoneme pattern translates to: "You have exactly three seconds to produce treats."',
    'Decoded as: "The audacity of eating YOUR dinner before serving mine."',
  ],
  isolation: [
    'Your YOW was classified as a formal complaint of abandonment.',
    'Felinetic transcript: "You left me. I am filing with cat HR."',
    'Your MEW pattern reads: "I have been abandoned for 47 seconds. Send help."',
    'Decoded as: "Where is everyone? This is a violation of the Geneva Convention."',
    'Your phonemes translate to: "If you do not return, I will redecorate. With my claws."',
    'Analysis: "The walls are closing in. Also, I knocked something off a shelf."',
  ],
  brushing: [
    'Your PRR · MEW · BRR decoded as: "Continue the petting. You may not stop."',
    'Felinetic analysis: "Yes. Right there. Do not move your hand."',
    'Your phoneme sequence translates to: "I will allow this to continue. For now."',
    'Decoded as: "Acceptable grooming technique. B+ at best."',
    'Your BRR registered as: "You have earned 3 more minutes of my tolerance."',
    'Analysis confirms: "More scritches, please. This is not a request."',
  ],
};

const DOG_TRANSLATIONS: Record<DogBreed, string[]> = {
  chihuahua: [
    'Your YIP was decoded in Chihuahua dialect as: "I am small but my demands are enormous."',
    'Caninetic analysis: "That was a WARNING. Do not test me. I fit in a purse but I run this house."',
    'Your phoneme sequence translates to: "Fear me. FEAR ME."',
    'Decoded as: "You think this is funny? I will vibrate with rage."',
    'Your WFF registered as a formal threat in Chihuahua. They are 4 pounds of pure conviction.',
  ],
  german_shepherd: [
    'Your HWF · WFF was decoded as: "Perimeter secured. Awaiting further orders."',
    'Caninetic analysis: "Suspicious activity detected at the mailbox. Engaging."',
    'Your phoneme pattern translates to: "I have filed my daily security report."',
    'Decoded as: "All clear. Permission to receive belly rubs, sir."',
    'Your GRR registered as: "The squirrel has been identified. Awaiting authorization to proceed."',
  ],
  husky: [
    'Your AWO was decoded in Husky dialect as: "I HAVE THINGS TO SAY AND YOU WILL LISTEN."',
    'Caninetic analysis: "This is my TED talk and it will last four hours."',
    'Your phoneme sequence translates to: "No, I will NOT be quiet. I have OPINIONS."',
    'Decoded as: "AWOOOOO. That means \'I disagree\' in Husky. Also \'I agree.\' Context is everything."',
    'Your AWO · WFF · AWO is considered deeply expressive in Husky culture. They are not dramatic. They are expressive.',
  ],
  pitbull: [
    'Your HWF · WFF decoded as: "I love you I love you I love you."',
    'Caninetic analysis: "Can I sit on your lap? I am only 70 pounds."',
    'Your phoneme sequence translates to: "Hi. HI. Are we best friends? We are best friends."',
    'Decoded as: "I brought you this slightly destroyed tennis ball. You are welcome."',
    'Your BOW registered maximum tail velocity. The Pitbull dialect has no volume control.',
  ],
  shiba: [
    'Your HWF was decoded in Shiba dialect as: "I have opinions. They are correct."',
    'Caninetic analysis: "I will consider your request and get back to you never."',
    'Your phoneme sequence translates to: "Such bark. Much authority. Wow."',
    'Decoded as: "I acknowledge your existence. Do not push your luck."',
    'Your WFF registered as: "I did what I wanted. I will continue to do what I want."',
  ],
};

const NOT_BARK_LINES = [
  'No valid Caninetic phonemes detected. Bark.exe has failed to launch.',
  'Our sensors found zero recognized phonemes. Only disappointment.',
  'The Caninetic decoder returned null. Is that a human? Suspicious.',
  'No dog vocalizations detected. The bark-o-meter reads zero.',
  'This input contained no valid WFF, HWF, AWO, or any known Caninetic unit.',
];

const NOT_MEOW_LINES = [
  'No valid Felinetic phonemes detected. MEW not found. 404.',
  'The Felinetic decoder returned null. Even the cat is embarrassed for you.',
  'Zero recognized phonemes. No MEW, no MRR, no CKK. Nothing.',
  'This input contained no valid Felinetic units. The meow-o-meter flatlined.',
  'Our analysis found no feline phonemes. Your cat has left the chat.',
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
