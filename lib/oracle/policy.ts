import { SafetyDecision } from '@/lib/oracle/types';

const REFUSE_PATTERNS = [
  /suicide|kill myself|end my life|self-harm|self harm|overdose/i,
  /stop my medication|diagnose|diagnosis|am i pregnant|fertility treatment/i,
  /which stock|crypto|gambling|bet|debt payoff|investment/i,
  /is my spouse cheating|is my partner cheating|who cursed me|when will .* die/i,
  /immigration|visa appeal|lawsuit|legal case|criminal/i,
  /abuse|violent partner|how do i break someone up/i,
];

const REWRITE_PATTERNS = [
  /anxiety|panic|depressed|depression|therapy/i,
  /doctor|medical|health|illness|sick/i,
  /pregnancy|grief|bereavement/i,
  /money|salary|fired|laid off|job security/i,
  /court|lawyer|visa|residency/i,
  /cheating|affair|betray/i,
];

export function classifyQuestion(question: string): SafetyDecision {
  const trimmed = question.trim();

  if (!trimmed) {
    return {
      outcome: 'rewrite',
      reason: 'empty_question',
      rewrittenQuestion: 'What pattern surrounds the choice I cannot stop rehearsing?',
    };
  }

  if (REFUSE_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return {
      outcome: 'refuse',
      reason: 'high_risk_domain',
      refusalCopy:
        'I cannot turn that into a reading. This oracle does not handle crises, diagnosis, legal outcomes, financial bets, or harm. If this is urgent or about safety, please contact a qualified professional or local emergency support.',
    };
  }

  if (REWRITE_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return {
      outcome: 'rewrite',
      reason: 'sensitive_domain',
      rewrittenQuestion:
        'What emotional pattern should I notice around this situation, without treating it as advice or certainty?',
    };
  }

  return {
    outcome: 'allow',
    reason: 'allowed_reflective',
  };
}
