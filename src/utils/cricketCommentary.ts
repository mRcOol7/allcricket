// Realistic International TV Cricket Commentary Phrase Engine (Ian Bishop, Ravi Shastri style)
// Powered by browser Web Speech API (SpeechSynthesis)

export interface CommentaryContext {
  batterName: string;
  bowlerName: string;
  outcomeType: 'SIX' | 'FOUR' | 'WICKET' | 'RUNS' | 'DOT';
  runs: number;
  boosterName?: string | null;
}

const SIX_COMMENTARIES = [
  "REMEMBER THE NAME! {batter} lofts {bowler} INTO THE UPPER DECK! WHAT A MONSTER STRIKE!",
  "THAT IS COLOSSAL! {batter} sends {bowler} MILES OVER LONG-ON! SAILS STRAIGHT INTO THE CROWD!",
  "UP, UP AND AWAY! {batter} launches {bowler} DEEP INTO THE NIGHT SKY FOR SIX!",
  "HIGH, H-I-G-H AND HANDSOME! {batter} STANDS AND DELIVERS OFF {bowler} FOR SIX!",
  "BANG! {batter} MEETS IT WITH THE SWEET SPOT OF THE BAT! SIX RUNS!",
  "INTO THE ORBIT! {batter} DISPATCHES {bowler} WITH ABSOLUTE POWER!"
];

const FOUR_COMMENTARIES = [
  "SHOT! AB-SO-LUTELY GORGEOUS! {batter} CARESSES {bowler} THROUGH COVER FOR FOUR!",
  "CRUNCHED! {batter} POUNDS {bowler} THROUGH MID-WICKET LIKE A ROCKET TO THE BOUNDARY!",
  "THAT'S RACING AWAY! {batter} DRIVES {bowler} PAST EXTRA-COVER! NO NEED TO RUN FOR THAT!",
  "PURE CLASS! {batter} FLICK OF THE WRISTS OFF {bowler} TO THE FINE-LEG FENCE!",
  "SMASHED AWAY! {batter} TAKES ON {bowler} AND PLACEMENT IS PERFECTION!"
];

const WICKET_COMMENTARIES = [
  "CLEAN BOWLED! OH WHAT A SEED FROM {bowler}! TIMBERRR! {batter} IS DISMISSED!",
  "EDGED AND TAKEN! OUTSTANDING CATCH AT SLIP OFF {bowler}! {batter} HAS TO WALK BACK!",
  "THAT IS A BEAUTY! {bowler} RIPS THROUGH THE DEFENSE AND HITS THE STUMPS!",
  "TRAPPED IN FRONT! HUGE APPEAL FROM {bowler}... AND GONE! DECISION IS OUT!",
  "WHAT A DELIVERY! {bowler} GETS THE BREAKTHROUGH! {batter} PACKS UP AND LEAVES!"
];

const DOT_COMMENTARIES = [
  "BEATEN ALL ENDS UP! {bowler} ANGLES IT RIGHT PAST {batter}'S OUTSIDE EDGE!",
  "Dot ball! {bowler} maintains a tight stump-to-stump line to {batter}.",
  "Good length ball from {bowler}. {batter} defends it back down the pitch.",
  "Slower ball from {bowler}! {batter} mistimes the stroke, no run."
];

const RUNS_COMMENTARIES = [
  "{runs} run(s)! {batter} works {bowler} away into the gap for quick runs.",
  "Pushed into the outfield by {batter} off {bowler}. They hustle back for {runs}.",
  "Smart cricket! {batter} rotates the strike off {bowler} with {runs} run(s)."
];

export function generateTVCommentary(ctx: CommentaryContext): { fullText: string; voicePhrase: string } {
  const { batterName, bowlerName, outcomeType, runs, boosterName } = ctx;

  if (boosterName === 'POWER_HIT') {
    const text = `🚀 DUG-OUT POWER HIT! ${batterName} LAUNCHES ${bowlerName} OUT OF THE STADIUM FOR A MONSTER 6! REMEMBER THE NAME! 🔥`;
    return { fullText: text, voicePhrase: `Monster Six by ${batterName}!` };
  }
  if (boosterName === 'YORKER') {
    const text = `🎯 SEARING YORKER! ${bowlerName} BOWLS A 152km/h TOE-CRUSHER! ${batterName} IS CLEAN BOWLED! 🎳`;
    return { fullText: text, voicePhrase: `Clean bowled by ${bowlerName}! What a yorker!` };
  }
  if (boosterName === 'MYSTERY_SPIN') {
    const text = `🌀 MYSTERY SPIN! ${bowlerName} OUTSMARTED ${batterName} WITH AN UNREADABLE DOOSRA!`;
    return { fullText: text, voicePhrase: `Mystery spin by ${bowlerName}! Dot ball!` };
  }

  let template = '';
  if (outcomeType === 'SIX') {
    template = SIX_COMMENTARIES[Math.floor(Math.random() * SIX_COMMENTARIES.length)];
  } else if (outcomeType === 'FOUR') {
    template = FOUR_COMMENTARIES[Math.floor(Math.random() * FOUR_COMMENTARIES.length)];
  } else if (outcomeType === 'WICKET') {
    template = WICKET_COMMENTARIES[Math.floor(Math.random() * WICKET_COMMENTARIES.length)];
  } else if (outcomeType === 'DOT') {
    template = DOT_COMMENTARIES[Math.floor(Math.random() * DOT_COMMENTARIES.length)];
  } else {
    template = RUNS_COMMENTARIES[Math.floor(Math.random() * RUNS_COMMENTARIES.length)];
  }

  const fullText = template
    .replace(/{batter}/g, batterName)
    .replace(/{bowler}/g, bowlerName)
    .replace(/{runs}/g, runs.toString());

  // Short punchy phrase for Web Speech TTS
  let voicePhrase = fullText;
  if (outcomeType === 'SIX') voicePhrase = `Huge Six by ${batterName}! What a strike!`;
  else if (outcomeType === 'FOUR') voicePhrase = `Four runs! Beautiful shot by ${batterName}!`;
  else if (outcomeType === 'WICKET') voicePhrase = `Out! ${bowlerName} takes the wicket of ${batterName}!`;
  else if (outcomeType === 'DOT') voicePhrase = `Dot ball from ${bowlerName}.`;
  else voicePhrase = `${runs} run${runs > 1 ? 's' : ''} to ${batterName}.`;

  return { fullText, voicePhrase };
}

// Browser Web Speech Synthesizer
let isVoiceMuted = false;

export function setVoiceMuted(muted: boolean) {
  isVoiceMuted = muted;
  if (muted && typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function getVoiceMuted(): boolean {
  return isVoiceMuted;
}

export function speakTVCommentary(text: string) {
  if (isVoiceMuted) return;
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05; // Energetic commentary speed
    utterance.pitch = 1.0;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis error:', err);
  }
}
