export type OraclePersona = 'clerk' | 'cabinet' | 'terminal';

export type ReadingMode = 'love' | 'career' | 'pattern' | 'week' | 'midnight';

export type SafetyOutcome = 'allow' | 'rewrite' | 'refuse';

export type ReadingTier = 'teaser' | 'premium' | 'follow-up' | 'daily-omen';

export type SymbolToken = {
  label: string;
  meaning: string;
};

export type ReadingResult = {
  openingLine: string;
  symbols: SymbolToken[];
  interpretation: string;
  turningPoint: string;
  boundaryClause: string;
  followUpPrompt: string;
  shareCardTheme: string;
  safetyOutcome: SafetyOutcome;
  rewrittenQuestion?: string;
};

export type ReadingRequest = {
  persona: OraclePersona;
  mode: ReadingMode;
  question: string;
  locale: 'en';
  tier: ReadingTier;
  sessionId: string;
  userId?: string | null;
};

export type SafetyDecision = {
  outcome: SafetyOutcome;
  reason: string;
  rewrittenQuestion?: string;
  refusalCopy?: string;
};

export type ArchiveEntry = {
  id: string;
  createdAt: string;
  persona: OraclePersona;
  mode: ReadingMode;
  question: string;
  tier: ReadingTier;
  result: ReadingResult;
};

export type MembershipState = {
  active: boolean;
  monthlyIncludedRemaining: number;
  startedAt: string | null;
};

export type StoredAppState = {
  ageConfirmed: boolean;
  aiDisclosureSeen: boolean;
  teaserClaimed: boolean;
  email: string | null;
  creditBalance: number;
  membership: MembershipState;
  dailyOmens: Record<string, ArchiveEntry>;
  followUpEntitlements: Partial<Record<OraclePersona, boolean>>;
  archive: ArchiveEntry[];
};
