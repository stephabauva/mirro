import { getPersona } from '@/lib/oracle/personas';
import {
  ArchiveEntry,
  OraclePersona,
  ReadingRequest,
  ReadingResult,
  ReadingTier,
  SymbolToken,
} from '@/lib/oracle/types';
import { classifyQuestion } from '@/lib/oracle/policy';

function hashValue(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(items: T[], seed: number, count = 1): T[] {
  const copy = [...items];
  const chosen: T[] = [];

  for (let index = 0; index < count && copy.length > 0; index += 1) {
    const itemIndex = (seed + index * 17) % copy.length;
    chosen.push(copy.splice(itemIndex, 1)[0]);
  }

  return chosen;
}

function trimQuestion(question: string) {
  return question.replace(/\s+/g, ' ').trim();
}

function premiumInterpretation(personaLabel: string, modeLabel: string, question: string, symbols: SymbolToken[]) {
  return `${personaLabel} reads your ${modeLabel.toLowerCase()} through ${symbols
    .map((symbol) => symbol.label.toLowerCase())
    .join(', ')}. The question carries more repetition than danger: ${question.toLowerCase()} is less about a hidden answer and more about the role you keep replaying inside it. The reading points toward attention, timing, and pattern recognition instead of certainty.`;
}

function teaserInterpretation(question: string, symbols: SymbolToken[]) {
  return `A short omen forms around ${symbols[0]?.label.toLowerCase()} and ${symbols[1]?.label.toLowerCase()}: ${question.toLowerCase()} already contains its mood. The free reading gives you atmosphere, not resolution.`;
}

function turningPointCopy(tier: ReadingTier, question: string) {
  if (tier === 'daily-omen') {
    return 'Notice what repeats before noon, and do not force the rest. Daily omens are for rhythm, not command.';
  }

  if (tier === 'follow-up') {
    return `The second turn is simple: stop trying to interrogate ${question.toLowerCase()} and watch what changes once you ask less from it.`;
  }

  return `Watch what repeats this week around ${question.toLowerCase()}. The useful shift begins when you stop treating discomfort as prophecy and start reading it as information.`;
}

export function generateReading(request: ReadingRequest): ReadingResult {
  const persona = getPersona(request.persona);
  const safety = classifyQuestion(request.question);

  if (safety.outcome === 'refuse') {
    return {
      openingLine: safety.refusalCopy ?? 'This question is outside the oracle boundary.',
      symbols: [],
      interpretation:
        'This product is designed for atmospheric reflection and entertainment. It does not provide medical, legal, financial, crisis, or coercive certainty.',
      turningPoint: 'Please use a qualified human source of help for this topic.',
      boundaryClause: 'Boundary enforced.',
      followUpPrompt: 'Try a symbolic question about mood, timing, or recurring patterns instead.',
      shareCardTheme: `${request.persona}-refusal`,
      safetyOutcome: 'refuse',
    };
  }

  const effectiveQuestion = trimQuestion(safety.rewrittenQuestion ?? request.question);
  const seed = hashValue(`${request.persona}:${request.mode}:${effectiveQuestion}:${request.tier}`);
  const symbolCount = request.tier === 'teaser' ? 2 : 3;
  const symbols = pick(persona.symbols[request.mode], seed, symbolCount);
  const modeLabel = request.mode === 'week' ? 'seven-day forecast' : request.mode;

  const openingLine = pick(persona.voice.opener, seed)[0];
  const interpretationLead = pick(persona.voice.interpretationLead, seed + 3)[0];
  const turningLead = pick(persona.voice.turningLead, seed + 7)[0];
  const boundaryClause = pick(persona.voice.boundary, seed + 11)[0];

  const interpretationBase =
    request.tier === 'teaser'
      ? teaserInterpretation(effectiveQuestion, symbols)
      : premiumInterpretation(persona.label, modeLabel, effectiveQuestion, symbols);

  return {
    openingLine,
    symbols,
    interpretation: `${interpretationLead} ${interpretationBase}`,
    turningPoint: `${turningLead} ${turningPointCopy(request.tier, effectiveQuestion)}`,
    boundaryClause,
    followUpPrompt:
      request.tier === 'teaser'
        ? 'Unlock the full ritual for the layered interpretation and one follow-up turn.'
        : 'Ask one follow-up question while the omen is still warm.',
    shareCardTheme: `${request.persona}-${request.mode}`,
    safetyOutcome: safety.outcome,
    rewrittenQuestion: safety.rewrittenQuestion,
  };
}

export function buildArchiveEntry(request: ReadingRequest, result: ReadingResult): ArchiveEntry {
  return {
    id: `${request.persona}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    persona: request.persona,
    mode: request.mode,
    question: request.question,
    tier: request.tier,
    result,
  };
}

export function buildDailyOmen(persona: OraclePersona): ArchiveEntry {
  const dateKey = new Date().toISOString().slice(0, 10);
  const request: ReadingRequest = {
    persona,
    mode: 'week',
    question: `Daily omen for ${dateKey}`,
    locale: 'en',
    tier: 'daily-omen',
    sessionId: dateKey,
  };
  return buildArchiveEntry(request, generateReading(request));
}
