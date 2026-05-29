import catMeow from '../sounds/cat_saying_hi.mp3';
import catHunger from '../sounds/cat_hunger_meow.mp3';
import catAttention from '../sounds/Cat_attention.mp3';
import catTrill from '../sounds/Cat_gentle_tr.mp3';
import catChirp from '../sounds/The_rapid_staccato.mp3';
import dogBark from '../sounds/dog_alert_bark.mp3';
import dogYip from '../sounds/dog_Excited_Yip.mp3';
import dogGrowl from '../sounds/dog_Low_Growl.mp3';
import dogWhine from '../sounds/animal_dog_Anxiety.mp3';
import dogHowl from '../sounds/dog_howl_sound.mp3';

export const LESSON_SOUNDS: Record<string, string> = {
  cat_greeting_1: catMeow,
  cat_demand_1: catHunger,
  cat_complaint_1: catAttention,
  cat_ack_1: catTrill,
  cat_hunt_1: catChirp,
  dog_greeting_1: dogHowl,
  dog_ack_1: dogBark,
  dog_excitement_1: dogYip,
  dog_warning_1: dogGrowl,
  dog_call_1: dogWhine,
};
