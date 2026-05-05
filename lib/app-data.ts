import { OraclePersona } from '@/lib/oracle/types';

export const HERO_LINE = 'Three impossible offices are still taking questions.';

export const HERO_SUBLINE =
  'Choose an AI oracle for entertainment and self-reflection. Atmospheric, personal, and legally bounded by design.';

export const DISCLOSURE =
  'AI-generated entertainment and reflective content. Not professional advice. Not for emergencies. 18+ only.';

export const EXAMPLE_READINGS = [
  '“You came for prophecy. What you really brought was a pattern.”',
  '“Prediction is too grand a word. Pattern is enough.”',
  '“The night is not warning you. It is only repeating itself more elegantly.”',
];

export const HOW_IT_WORKS = [
  {
    title: 'Choose a voice',
    body: 'Start with the Clerk, the Cabinet, or the Terminal. Each persona shares one canon but keeps its own speaking style and symbolic language.',
  },
  {
    title: 'Ask one charged question',
    body: 'The ritual chat is guided, not fully open-ended. One question becomes an omen, an interpretation, and a turning point.',
  },
  {
    title: 'Unlock only if the teaser hits',
    body: 'The first reading is shorter. Premium unlocks the full layered reading, archive access, and one follow-up turn.',
  },
];

export const PRICING = [
  { id: 'single', label: 'One Premium Telling', price: '€5.90', detail: 'One full reading and one follow-up turn.' },
  { id: 'three', label: 'Three Tellings', price: '€14.90', detail: 'For crossroads, relapses, and recurring themes.' },
  { id: 'ten', label: 'Ten Tellings', price: '€34.90', detail: 'For regular visitors and repeat patterns.' },
  { id: 'membership', label: 'Monthly Membership', price: '€9.99', detail: 'Unlimited daily omens and four premium readings each month.' },
];

export const FAQS = [
  {
    question: 'Is this a real psychic?',
    answer: 'No. It is an AI theatrical oracle designed for entertainment and self-reflection.',
  },
  {
    question: 'Is it AI?',
    answer: 'Yes. The app states clearly that you are interacting with an AI system.',
  },
  {
    question: 'Can it predict the future?',
    answer: 'No factual prediction claims are made. It offers symbolic readings, mood, and reflective prompts.',
  },
  {
    question: 'Can minors use it?',
    answer: 'No. The product is designed and marketed as 18+ only.',
  },
  {
    question: 'Does it give medical, legal, or financial advice?',
    answer: 'No. Sensitive topics are refused or redirected into non-decisive reflective language.',
  },
  {
    question: 'What data do you store?',
    answer: 'For MVP, the app stores only what is needed for access, archive, and personalization. Users can delete or export their reading history.',
  },
];

export const PERSONA_INTROS: Record<OraclePersona, string> = {
  clerk:
    'The last civil servant of a dead ministry. Severe, elegant, and suspicious of certainty.',
  cabinet:
    'An intimate cabinet of ash, salt, and sealed correspondences. Literary, close, and unsettling.',
  terminal:
    'A ceremonial augur-console built from recurrence, weather, and machine calm. Cold, precise, and beautifully rude.',
};
