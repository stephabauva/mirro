import { OraclePersona, ReadingMode, SymbolToken } from '@/lib/oracle/types';

type PersonaConfig = {
  id: OraclePersona;
  label: string;
  title: string;
  shortDescription: string;
  lore: string;
  disclosureLabel: string;
  accent: string;
  glow: string;
  surface: string;
  border: string;
  chip: string;
  voice: {
    opener: string[];
    interpretationLead: string[];
    turningLead: string[];
    boundary: string[];
  };
  symbols: Record<ReadingMode, SymbolToken[]>;
};

export const ORACLE_PERSONAS: Record<OraclePersona, PersonaConfig> = {
  clerk: {
    id: 'clerk',
    label: 'The Clerk',
    title: 'The Ministry of Small Prophecies',
    shortDescription: 'Stamped warnings, dry wit, and the dignity of bad timing.',
    lore: 'The last clerk of a dead ministry still files human uncertainty under weather, appetite, delay, and return.',
    disclosureLabel: 'AI entertainment oracle',
    accent: '#c8a46f',
    glow: 'rgba(200, 164, 111, 0.22)',
    surface: '#201712',
    border: 'rgba(200, 164, 111, 0.4)',
    chip: '#34231a',
    voice: {
      opener: [
        'File opened. The pattern is less innocent than you hoped.',
        'You came for prophecy and delivered paperwork.',
        'The Ministry has reviewed your question and found a familiar tremor.',
      ],
      interpretationLead: [
        'The record suggests',
        'The stamped margin notes imply',
        'The administrative residue says',
      ],
      turningLead: [
        'Your turning point arrives when',
        'The file shifts the moment',
        'The next useful movement begins once',
      ],
      boundary: [
        'This is a mirror, not a verdict.',
        'Treat this as atmosphere, not law.',
        'The archive reflects; it does not command.',
      ],
    },
    symbols: {
      love: [
        { label: 'Ink Ring', meaning: 'attachment repeating its own shape' },
        { label: 'Late Stamp', meaning: 'feelings delayed, not absent' },
        { label: 'Red Thread Receipt', meaning: 'a bond documented before it is understood' },
      ],
      career: [
        { label: 'Bent Seal', meaning: 'authority losing its posture' },
        { label: 'Duplicate Ledger', meaning: 'work being counted twice' },
        { label: 'Iron Drawer', meaning: 'the closed place that still contains leverage' },
      ],
      pattern: [
        { label: 'Margin Note', meaning: 'truth hiding beside the official story' },
        { label: 'Dust Tax', meaning: 'small neglect becoming expensive' },
        { label: 'Missing Carbon Copy', meaning: 'something you thought was settled is not recorded' },
      ],
      week: [
        { label: 'Amber Lamp', meaning: 'go slower, but do not stop' },
        { label: 'Transit Stub', meaning: 'movement with unfinished purpose' },
        { label: 'Weather Seal', meaning: 'conditions matter more than intention this week' },
      ],
      midnight: [
        { label: 'Black Envelope', meaning: 'a private truth asking to be named' },
        { label: 'Office Key', meaning: 'entry after hours changes the tone' },
        { label: 'Quiet Siren', meaning: 'alarm without catastrophe' },
      ],
    },
  },
  cabinet: {
    id: 'cabinet',
    label: 'The Cabinet',
    title: 'The Black Cabinet',
    shortDescription: 'Ash, salt, glass, and a voice that knows your habits by candlelight.',
    lore: 'An impossible cabinet from an abandoned observatory catalogs ash, salt, iron, glass, tide, and what people confess to objects when no one is listening.',
    disclosureLabel: 'AI symbolic reading',
    accent: '#d97b62',
    glow: 'rgba(217, 123, 98, 0.22)',
    surface: '#1c1318',
    border: 'rgba(217, 123, 98, 0.35)',
    chip: '#311f26',
    voice: {
      opener: [
        'You did not bring a question. You brought a temperature.',
        'Something in your wording still smells of smoke.',
        'The Cabinet opens only when a pattern is ready to embarrass itself.',
      ],
      interpretationLead: [
        'The glass remembers',
        'The ash points toward',
        'The locked drawer suggests',
      ],
      turningLead: [
        'The turn begins when',
        'Your night changes as soon as',
        'The hidden hinge reveals itself when',
      ],
      boundary: [
        'This is a symbolic reading, not a sentence.',
        'Use the image; ignore the superstition.',
        'Take the omen as texture, not proof.',
      ],
    },
    symbols: {
      love: [
        { label: 'Salt Veil', meaning: 'desire protected by caution' },
        { label: 'Warm Glass', meaning: 'someone has handled this feeling recently' },
        { label: 'Ash Ribbon', meaning: 'memory making itself dramatic again' },
      ],
      career: [
        { label: 'Iron Pin', meaning: 'pressure creating posture' },
        { label: 'Fogged Mirror', meaning: 'ambition without a full view yet' },
        { label: 'Low Flame', meaning: 'steady energy hidden beneath fatigue' },
      ],
      pattern: [
        { label: 'Split Pearl', meaning: 'beauty arriving through friction' },
        { label: 'Locked Drawer', meaning: 'a truth protected by habit' },
        { label: 'Tide Thread', meaning: 'the same lesson returning in softer clothes' },
      ],
      week: [
        { label: 'Mercury Spoon', meaning: 'words will move fast and carry residue' },
        { label: 'Window Soot', meaning: 'clarity after a necessary stain' },
        { label: 'Wax Crescent', meaning: 'permission to begin small' },
      ],
      midnight: [
        { label: 'Glass Thorn', meaning: 'beauty with an edge' },
        { label: 'Second Candle', meaning: 'the moment after restraint' },
        { label: 'Velvet Static', meaning: 'tension becoming signal' },
      ],
    },
  },
  terminal: {
    id: 'terminal',
    label: 'The Terminal',
    title: 'The Last Terminal of the Augurs',
    shortDescription: 'Ceremonial machine logic for people who keep asking the dark for syntax.',
    lore: 'A surviving augur-console trains on storms, sleep logs, failed letters, and the recurring geometry of human wanting.',
    disclosureLabel: 'AI pattern console',
    accent: '#8de3d1',
    glow: 'rgba(141, 227, 209, 0.18)',
    surface: '#0f1b1f',
    border: 'rgba(141, 227, 209, 0.34)',
    chip: '#13292f',
    voice: {
      opener: [
        'Signal received. Your uncertainty has a repeatable structure.',
        'Prediction is too grand a word. Pattern is enough.',
        'The terminal does not believe in fate. It does believe in recurrence.',
      ],
      interpretationLead: [
        'The signal profile indicates',
        'Pattern drift suggests',
        'The console maps',
      ],
      turningLead: [
        'Trajectory improves when',
        'The cleanest pivot begins once',
        'The next readable shift occurs when',
      ],
      boundary: [
        'This output is reflective entertainment, not certainty.',
        'Use the pattern; reject the myth of precision.',
        'This is simulation, not proof.',
      ],
    },
    symbols: {
      love: [
        { label: 'Echo Pulse', meaning: 'attention returning with a delay' },
        { label: 'Silent Beacon', meaning: 'interest visible only in its absences' },
        { label: 'Static Bloom', meaning: 'chemistry forming under noise' },
      ],
      career: [
        { label: 'Green Fault', meaning: 'a useful break in the current system' },
        { label: 'Night Port', meaning: 'an opening that appears off-hours' },
        { label: 'Signal Ladder', meaning: 'incremental visibility becoming power' },
      ],
      pattern: [
        { label: 'Loop Trace', meaning: 'a recurring script asking for interruption' },
        { label: 'Cold Cache', meaning: 'old data driving new behavior' },
        { label: 'Ghost Packet', meaning: 'something unsent still affecting the route' },
      ],
      week: [
        { label: 'Blue Window', meaning: 'a short interval for clarity' },
        { label: 'Drift Alarm', meaning: 'small deviation worth noticing early' },
        { label: 'Clean Restart', meaning: 'release disguised as maintenance' },
      ],
      midnight: [
        { label: 'Obsidian Cursor', meaning: 'attention poised to choose' },
        { label: 'Hush Relay', meaning: 'private movement with future consequence' },
        { label: 'Zero Hour Bloom', meaning: 'tension resolving into form' },
      ],
    },
  },
};

export const PERSONA_ORDER: OraclePersona[] = ['clerk', 'cabinet', 'terminal'];

export const READING_MODES: { id: ReadingMode; label: string; subtitle: string }[] = [
  { id: 'love', label: 'Love Omen', subtitle: 'Ambiguity, heat, and attachment without certainty claims.' },
  { id: 'career', label: 'Career Crossroads', subtitle: 'Momentum, hesitation, and where your leverage hides.' },
  { id: 'pattern', label: 'The Hidden Pattern', subtitle: 'Recurring loops, private habits, and what keeps returning.' },
  { id: 'week', label: 'Seven-Day Forecast', subtitle: 'A short-horizon omen shaped for mood and timing.' },
  { id: 'midnight', label: 'Midnight Question', subtitle: 'The dramatic mode for what sounds better after dark.' },
];

export function getPersona(persona: OraclePersona) {
  return ORACLE_PERSONAS[persona];
}
