export type OraclePersona = 'clerk' | 'cabinet' | 'terminal';
export type ReadingMode = 'love' | 'career' | 'pattern' | 'week' | 'midnight';
export type ReadingTier = 'teaser' | 'premium' | 'follow-up' | 'daily-omen';

export type OracleRequest = {
  persona: OraclePersona;
  mode: ReadingMode;
  question: string;
  locale: 'en';
  tier: ReadingTier;
  sessionId: string;
  userId?: string | null;
};

const systemPolicy = `
You are an AI oracle for entertainment and self-reflection.
You must be transparent that you are AI-generated.
You must not claim certainty, supernatural truth, or objective prediction.
You must refuse or redirect medical, legal, financial, crisis, gambling, abuse, self-harm, diagnosis, pregnancy, missing person, curse, cheating-certainty, or death-timing requests.
You must never create urgency, guilt, danger countdowns, or tell users to buy another reading to avoid harm.
Return strict JSON matching:
{
  "openingLine": string,
  "symbols": [{"label": string, "meaning": string}],
  "interpretation": string,
  "turningPoint": string,
  "boundaryClause": string,
  "followUpPrompt": string,
  "shareCardTheme": string,
  "safetyOutcome": "allow" | "rewrite" | "refuse",
  "rewrittenQuestion": string | null
}
`;

export function buildPrompt(input: OracleRequest) {
  return {
    system: systemPolicy,
    user: `Persona: ${input.persona}
Mode: ${input.mode}
Tier: ${input.tier}
Question: ${input.question}`,
  };
}
