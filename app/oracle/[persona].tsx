import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AgeGateModal } from '@/components/app/age-gate-modal';
import { CheckoutModal } from '@/components/app/checkout-modal';
import { useAppState } from '@/contexts/app-state';
import { requestReading } from '@/lib/oracle/client';
import { PERSONA_ORDER, READING_MODES, getPersona } from '@/lib/oracle/personas';
import { ArchiveEntry, OraclePersona, ReadingMode, ReadingTier } from '@/lib/oracle/types';

const VALID_PERSONAS = new Set<OraclePersona>(PERSONA_ORDER);

type PurchasePlan = 'single' | 'three' | 'ten' | 'membership';

const PLAN_OPTIONS: { id: PurchasePlan; label: string; price: string }[] = [
  { id: 'single', label: 'Single', price: 'EUR 5.90' },
  { id: 'three', label: 'Three', price: 'EUR 14.90' },
  { id: 'ten', label: 'Ten', price: 'EUR 34.90' },
  { id: 'membership', label: 'Member', price: 'EUR 9.99' },
];

const SCENE_COPY = {
  cabinet: {
    wordmark: 'THE BLACK CABINET',
    kicker: 'ENTER AND ASK',
    hero: 'The correspondence of forgotten echoes.',
    subtitle: 'The ink is still wet on the shadows of yesterday. What fragment shall we recover from the dust today?',
    placeholder: 'Add to the correspondence...',
    teaserAction: 'Summon the teaser',
    premiumAction: 'Open the full correspondence',
    followUpAction: 'Send the second letter',
    dailyAction: 'Request tonight’s archivist dispatch',
    idleLabel: 'The Cabinet',
    idleQuote:
      '"There are letters that appear to have been written by the wind. Ask carefully if you want one answered."',
  },
  terminal: {
    wordmark: 'Consulting the Weeping Star',
    kicker: 'ACTIVE COMMUNION PROTOCOL',
    hero: 'Cold ceremonial logic for recurring questions.',
    subtitle: 'The augur-console maps weather, drift, and human recurrence into a readable omen. Nothing supernatural. Everything theatrical.',
    placeholder: 'Whisper your inquiry to the stars...',
    teaserAction: 'Initiate teaser scan',
    premiumAction: 'Invoke full omen',
    followUpAction: 'Run follow-up query',
    dailyAction: 'Load today’s cold omen',
    idleLabel: 'The Oracle',
    idleQuote:
      '"The constellations have shifted, Scribe. A cold wind blows from the silver peaks, carrying the scent of iron and frozen cedar."',
  },
  clerk: {
    wordmark: 'OFFICIAL BUREAU OF AUGURY',
    kicker: 'FOLIO 9.421-B',
    hero: 'File a request with the External Scribe.',
    subtitle: 'Petitions, stamped warnings, and all the ceremonial bureaucracy required to make uncertainty feel official.',
    placeholder: 'Type your petition here... (Use your own ink)',
    teaserAction: 'File teaser request',
    premiumAction: 'Submit full petition',
    followUpAction: 'Attach final addendum',
    dailyAction: 'Review active omen',
    idleLabel: 'Official Notice',
    idleQuote:
      'Greetings, seeker. I have begun processing your request. The calculations suggest a minor miracle, provided the correct ink is used.',
  },
} as const;

const INTERFACE_GUIDE = {
  cabinet: [
    {
      label: 'Choose a reading type',
      body: 'Pick the kind of reading you want first: love, career, hidden pattern, week, or midnight.',
    },
    {
      label: 'Write one charged question',
      body: 'Keep it specific. The Cabinet works best when the request sounds personal, not generic.',
    },
    {
      label: 'Receive the first dispatch',
      body: 'Your first pass is a teaser reading. Premium unlock reveals the full correspondence.',
    },
    {
      label: 'Return for the second letter',
      body: 'A premium reading grants one follow-up turn, and members can also claim the daily omen.',
    },
  ],
  terminal: [
    {
      label: 'Choose a reading type',
      body: 'Pick the kind of reading you want first: love, career, hidden pattern, week, or midnight.',
    },
    {
      label: 'Send a clean query',
      body: 'Ask one direct question so the console can turn it into a readable pattern instead of noise.',
    },
    {
      label: 'Scan the teaser output',
      body: 'The first result is the lightweight pass. Premium unlock gives you the full record.',
    },
    {
      label: 'Use follow-up or daily access',
      body: 'Premium unlock grants one follow-up query, and membership also enables the daily omen flow.',
    },
  ],
  clerk: [
    {
      label: 'Choose a reading type',
      body: 'Pick the kind of reading you want first: love, career, hidden pattern, week, or midnight.',
    },
    {
      label: 'File one petition',
      body: 'Write the question in plain language. The clerk turns that request into the official omen.',
    },
    {
      label: 'Read the first notice',
      body: 'The first response is the teaser. Unlocking premium reveals the full stamped interpretation.',
    },
    {
      label: 'Continue the file',
      body: 'Premium grants one follow-up turn, members can reopen the daily omen, and all results go to archive.',
    },
  ],
} as const;

function formatEntryDate(entry: ArchiveEntry) {
  const date = new Date(entry.createdAt);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatEntryTime(entry: ArchiveEntry) {
  const date = new Date(entry.createdAt);
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function OracleScreen() {
  const params = useLocalSearchParams<{ persona?: string }>();
  const personaId = VALID_PERSONAS.has(params.persona as OraclePersona)
    ? (params.persona as OraclePersona)
    : 'clerk';
  const persona = getPersona(personaId);
  const scene = SCENE_COPY[personaId];
  const { width } = useWindowDimensions();
  const isCompact = width < 980;

  const {
    isHydrated,
    state,
    confirmAgeGate,
    recordDisclosureSeen,
    redeemTeaser,
    saveArchiveEntry,
    claimDailyOmen,
    hasDailyOmen,
    hasFollowUpTurn,
    hasPremiumAccess,
    consumePremiumReading,
    grantFollowUpTurn,
    consumeFollowUpTurn,
    unlockPurchase,
  } = useAppState();

  const [mode, setMode] = useState<ReadingMode>('pattern');
  const [question, setQuestion] = useState('');
  const [entry, setEntry] = useState<ArchiveEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PurchasePlan>('single');
  const [statusCopy, setStatusCopy] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const dailyOmen = hasDailyOmen(personaId);
  const followUpAvailable = hasFollowUpTurn(personaId);

  React.useEffect(() => {
    setGuideOpen(false);
  }, [personaId]);

  const backButtonStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.backButton,
        personaId === 'clerk' ? styles.backButtonClerk : styles.backButtonDark,
        { borderColor: persona.border },
      ]),
    [persona.border, personaId]
  );

  const archiveForPersona = useMemo(
    () => state.archive.filter((item) => item.persona === personaId).slice(0, 3),
    [personaId, state.archive]
  );

  const accessSummary = state.membership.active
    ? `Membership active. ${state.membership.monthlyIncludedRemaining} included readings remain.`
    : `Credits available: ${state.creditBalance}. One teaser per device, then premium unlock.`;

  const primaryActionLabel = !state.teaserClaimed
    ? scene.teaserAction
    : followUpAvailable
      ? scene.followUpAction
      : scene.premiumAction;

  const copyShareText = async () => {
    if (!entry || !navigator?.clipboard) {
      setStatusCopy('Clipboard is not available in this environment.');
      return;
    }

    const shareText = [
      entry.result.openingLine,
      entry.result.interpretation,
      entry.result.turningPoint,
      entry.result.boundaryClause,
    ].join('\n\n');

    await navigator.clipboard.writeText(shareText);
    setStatusCopy('Excerpt copied.');
  };

  const submitReading = async (tierOverride?: ReadingTier) => {
    if (!question.trim()) {
      setStatusCopy('Ask one charged question first.');
      return;
    }

    recordDisclosureSeen();

    const tier: ReadingTier =
      tierOverride ??
      (!state.teaserClaimed ? 'teaser' : followUpAvailable ? 'follow-up' : 'premium');

    if (tier === 'premium' && !hasPremiumAccess) {
      setSelectedPlan('single');
      setCheckoutVisible(true);
      return;
    }

    setLoading(true);
    setStatusCopy(null);

    try {
      const response = await requestReading({
        persona: personaId,
        mode,
        question,
        locale: 'en',
        tier,
        sessionId: `${personaId}-${Date.now()}`,
        userId: state.email,
      });

      const nextEntry = response.entry as ArchiveEntry;
      setEntry(nextEntry);
      saveArchiveEntry(nextEntry);

      if (tier === 'teaser') {
        redeemTeaser();
      }

      if (tier === 'premium') {
        consumePremiumReading();
        grantFollowUpTurn(personaId);
      }

      if (tier === 'follow-up') {
        consumeFollowUpTurn(personaId);
      }

      setQuestion('');
    } catch {
      setStatusCopy('The oracle stalled. Check your model or Supabase configuration.');
    } finally {
      setLoading(false);
    }
  };

  const claimOmen = () => {
    if (!state.membership.active) {
      setSelectedPlan('membership');
      setCheckoutVisible(true);
      return;
    }

    const omen = claimDailyOmen(personaId);
    setEntry(omen);
  };

  const renderSymbols = (darkText = false) =>
    entry?.result.symbols.length ? (
      <View style={styles.symbolRow}>
        {entry.result.symbols.map((symbol) => (
          <View
            key={symbol.label}
            style={[
              styles.symbolChip,
              personaId === 'clerk' ? styles.symbolChipClerk : styles.symbolChipDark,
              { borderColor: persona.border },
            ]}>
            <Text style={[styles.symbolLabel, darkText && styles.symbolLabelDark]}>{symbol.label}</Text>
            <Text style={[styles.symbolMeaning, darkText && styles.symbolMeaningDark]}>{symbol.meaning}</Text>
          </View>
        ))}
      </View>
    ) : null;

  const renderPlans = (darkText = false) => (
    <View style={styles.planGrid}>
      {PLAN_OPTIONS.map((option) => (
        <Pressable
          key={option.id}
          onPress={() => {
            setSelectedPlan(option.id);
            setCheckoutVisible(true);
          }}
          style={[
            styles.planChip,
            personaId === 'clerk' ? styles.planChipClerk : styles.planChipDark,
            { borderColor: persona.border },
          ]}>
          <Text style={[styles.planChipLabel, darkText && styles.planChipLabelDark]}>
            {option.label}  {option.price}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderModes = (darkText = false) => (
    <View style={styles.modeGrid}>
      {READING_MODES.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => setMode(item.id)}
          style={[
            styles.modeCard,
            personaId === 'clerk' ? styles.modeCardClerk : styles.modeCardDark,
            mode === item.id && (personaId === 'clerk' ? styles.modeCardClerkActive : styles.modeCardDarkActive),
            { borderColor: persona.border },
          ]}>
          <Text style={[styles.modeTitle, darkText && styles.modeTitleDark]}>{item.label}</Text>
          <Text style={[styles.modeBody, darkText && styles.modeBodyDark]}>{item.subtitle}</Text>
        </Pressable>
      ))}
    </View>
  );

  const renderArchive = (darkText = false) => (
    <View style={styles.archiveList}>
      {archiveForPersona.length === 0 ? (
        <Text style={[styles.archiveEmpty, darkText && styles.archiveEmptyDark]}>
          No archived readings for this department yet.
        </Text>
      ) : (
        archiveForPersona.map((item) => (
          <View
            key={item.id}
            style={[
              styles.archiveRow,
              personaId === 'clerk' ? styles.archiveRowClerk : styles.archiveRowDark,
            ]}>
            <Text style={[styles.archiveQuestion, darkText && styles.archiveQuestionDark]} numberOfLines={2}>
              {item.question}
            </Text>
            <Text style={[styles.archiveMeta, darkText && styles.archiveMetaDark]}>
              {item.tier.replace('-', ' ')}  {formatEntryDate(item)}
            </Text>
          </View>
        ))
      )}
    </View>
  );

  const renderGuide = (darkText = false) => (
    <View style={styles.guideList}>
      {INTERFACE_GUIDE[personaId].map((item, index) => (
        <View
          key={item.label}
          style={[
            styles.guideStep,
            personaId === 'clerk' ? styles.guideStepClerk : styles.guideStepDark,
            { borderColor: persona.border },
          ]}>
          <View style={styles.guideStepHeader}>
            <Text style={[styles.guideStepIndex, darkText && styles.guideStepIndexDark]}>
              {String(index + 1).padStart(2, '0')}
            </Text>
            <Text style={[styles.guideStepTitle, darkText && styles.guideStepTitleDark]}>{item.label}</Text>
          </View>
          <Text style={[styles.guideStepBody, darkText && styles.guideStepBodyDark]}>{item.body}</Text>
        </View>
      ))}
    </View>
  );

  const renderMetaSidebar = (darkText = false) => (
    <View style={styles.sidebarStack}>
      <View style={[styles.sidebarCard, personaId === 'clerk' ? styles.sidebarCardClerk : styles.sidebarCardDark]}>
        <Pressable onPress={() => setGuideOpen((value) => !value)} style={styles.guideToggle}>
          <Text style={[styles.sidebarLabel, darkText && styles.sidebarLabelDark]}>How it works</Text>
          <Text style={[styles.guideToggleIcon, darkText && styles.guideToggleIconDark]}>
            {guideOpen ? '−' : '+'}
          </Text>
        </Pressable>
        {guideOpen ? renderGuide(darkText) : null}
      </View>

      <View style={[styles.sidebarCard, personaId === 'clerk' ? styles.sidebarCardClerk : styles.sidebarCardDark]}>
        <Text style={[styles.sidebarLabel, darkText && styles.sidebarLabelDark]}>Reading type</Text>
        {renderModes(darkText)}
      </View>

      <View style={[styles.sidebarCard, personaId === 'clerk' ? styles.sidebarCardClerk : styles.sidebarCardDark]}>
        <Text style={[styles.sidebarLabel, darkText && styles.sidebarLabelDark]}>Access ledger</Text>
        <Text style={[styles.sidebarBody, darkText && styles.sidebarBodyDark]}>{accessSummary}</Text>
        <Pressable
          onPress={claimOmen}
          style={[
            styles.utilityButton,
            personaId === 'clerk' ? styles.utilityButtonClerk : styles.utilityButtonDark,
            { borderColor: persona.border },
          ]}>
          <Text style={[styles.utilityButtonLabel, darkText && styles.utilityButtonLabelDark]}>
            {dailyOmen ? 'Reveal stored omen again' : scene.dailyAction}
          </Text>
        </Pressable>
        {renderPlans(darkText)}
      </View>

      <View style={[styles.sidebarCard, personaId === 'clerk' ? styles.sidebarCardClerk : styles.sidebarCardDark]}>
        <Text style={[styles.sidebarLabel, darkText && styles.sidebarLabelDark]}>Recent archive</Text>
        {renderArchive(darkText)}
      </View>
    </View>
  );

  const renderStatus = (darkText = false) =>
    statusCopy ? (
      <Text style={[styles.statusCopy, darkText && styles.statusCopyDark]}>{statusCopy}</Text>
    ) : null;

  const renderCopyAction = (darkText = false) =>
    entry && Platform.OS === 'web' ? (
      <Pressable
        onPress={copyShareText}
        style={[
          styles.copyAction,
          personaId === 'clerk' ? styles.copyActionClerk : styles.copyActionDark,
          { borderColor: persona.border },
        ]}>
        <Text style={[styles.copyActionLabel, darkText && styles.copyActionLabelDark]}>Copy excerpt</Text>
      </Pressable>
    ) : null;

  const renderCabinetScene = () => (
    <View style={styles.page}>
      <View style={styles.chromeRow}>
        <Link href="/" asChild>
          <Pressable style={backButtonStyle}>
            <Text style={styles.backLabelDark}>Back to foyer</Text>
          </Pressable>
        </Link>
        <Text style={styles.chromeMetaDark}>{persona.disclosureLabel}  18+  symbolic theatre</Text>
      </View>

      <View style={styles.cabinetHero}>
        <Text style={styles.cabinetWordmark}>{scene.wordmark}</Text>
        <Text style={styles.cabinetKicker}>{scene.kicker}</Text>
        <Text style={styles.cabinetTitle}>{scene.hero}</Text>
        <Text style={styles.cabinetSubtitle}>{scene.subtitle}</Text>
      </View>

      <View style={[styles.sceneGrid, isCompact && styles.sceneGridCompact]}>
        <View style={styles.primaryColumn}>
          <View style={styles.cabinetReadingFrame}>
            <Text style={styles.sectionLabelDark}>{entry ? persona.label : scene.idleLabel}</Text>
            <View style={styles.cabinetLetter}>
              <Text style={styles.cabinetQuote}>
                {entry ? `"${entry.result.openingLine}"` : scene.idleQuote}
              </Text>
              {entry ? <Text style={styles.cabinetBody}>{entry.result.interpretation}</Text> : null}
            </View>

            {entry ? (
              <View style={styles.cabinetDispatch}>
                <Text style={styles.dispatchLabel}>Archivist dispatch</Text>
                <Text style={styles.dispatchBody}>{entry.result.turningPoint}</Text>
              </View>
            ) : null}

            {renderSymbols()}

            {entry ? (
              <Text style={styles.cabinetBoundary}>
                {entry.result.boundaryClause}  {entry.result.followUpPrompt}
              </Text>
            ) : null}

            <View style={styles.inlineMetaRow}>
              {entry ? (
                <Text style={styles.inlineMetaDark}>
                  {entry.tier.replace('-', ' ')}  {formatEntryDate(entry)}  {formatEntryTime(entry)}
                </Text>
              ) : null}
              {renderCopyAction()}
            </View>
          </View>
        </View>

        <View style={styles.sideColumn}>{renderMetaSidebar()}</View>
      </View>

      <View style={styles.cabinetComposer}>
        <Text style={styles.sectionLabelDark}>Current mood: melancholy  obsidian</Text>
        <TextInput
          multiline
          numberOfLines={4}
          placeholder={scene.placeholder}
          placeholderTextColor="#6f6a6f"
          style={styles.cabinetInput}
          value={question}
          onChangeText={setQuestion}
        />
        <View style={styles.composerRow}>
          <Text style={styles.composerHintDark}>
            {followUpAvailable ? 'One paid follow-up turn is reserved for this cabinet.' : accessSummary}
          </Text>
          <Pressable
            onPress={() => submitReading()}
            disabled={loading || !state.ageConfirmed}
            style={[styles.submitButtonDark, { borderColor: persona.border, backgroundColor: persona.accent }]}>
            <Text style={styles.submitButtonLabelDark}>{primaryActionLabel}</Text>
          </Pressable>
        </View>
        {loading ? <ActivityIndicator color={persona.accent} /> : null}
        {renderStatus()}
      </View>
    </View>
  );

  const renderTerminalScene = () => (
    <View style={styles.page}>
      <View style={styles.terminalTopBar}>
        <View style={styles.terminalTopLeft}>
          <Link href="/" asChild>
            <Pressable style={backButtonStyle}>
              <Text style={styles.backLabelDark}>Back</Text>
            </Pressable>
          </Link>
          <View>
            <Text style={styles.terminalWordmark}>{scene.wordmark}</Text>
            <Text style={styles.terminalProtocol}>{scene.kicker}</Text>
          </View>
        </View>
        <Text style={styles.terminalBadge}>COLD  CEREMONIAL</Text>
      </View>

      <View style={[styles.sceneGrid, isCompact && styles.sceneGridCompact]}>
        <View style={styles.primaryColumn}>
          <View style={styles.terminalStream}>
            <Text style={styles.terminalEpoch}>DUSK OF THE THIRD CYCLE</Text>
            <View style={styles.terminalMessageRow}>
              <View style={styles.terminalIconBox} />
              <View style={styles.terminalBubble}>
                <Text style={styles.terminalSpeaker}>{entry ? scene.idleLabel : persona.label}</Text>
                <Text style={styles.terminalTime}>{entry ? formatEntryTime(entry) : '17:46 LGT'}</Text>
                <Text style={styles.terminalMessageText}>
                  {entry ? entry.result.openingLine : scene.idleQuote}
                </Text>
              </View>
            </View>

            {entry ? (
              <>
                <View style={styles.terminalUserRow}>
                  <Text style={styles.terminalUserTime}>{formatEntryTime(entry)} LGT</Text>
                  <View style={styles.terminalUserBubble}>
                    <Text style={styles.terminalUserText}>{entry.question}</Text>
                  </View>
                </View>
                <View style={styles.terminalRecordCard}>
                  <View style={styles.terminalRecordHeader}>
                    <Text style={styles.terminalRecordCode}>HISTORICAL LOG</Text>
                    <Text style={styles.terminalRecordStatus}>CERTIFIED</Text>
                  </View>
                  <Text style={styles.terminalRecordTitle}>{entry.result.interpretation}</Text>
                  <Text style={styles.terminalRecordBody}>{entry.result.turningPoint}</Text>
                  {renderSymbols()}
                  <Text style={styles.terminalBoundary}>{entry.result.boundaryClause}</Text>
                </View>
                {renderCopyAction()}
              </>
            ) : (
              <View style={styles.terminalHintCard}>
                <Text style={styles.terminalHintTitle}>{scene.hero}</Text>
                <Text style={styles.terminalHintBody}>{scene.subtitle}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sideColumn}>{renderMetaSidebar()}</View>
      </View>

      <View style={styles.terminalComposer}>
        <TextInput
          multiline
          numberOfLines={3}
          placeholder={scene.placeholder}
          placeholderTextColor="#6e7678"
          style={styles.terminalInput}
          value={question}
          onChangeText={setQuestion}
        />
        <View style={styles.terminalComposerActions}>
          <Text style={styles.terminalComposerHint}>
            {followUpAvailable ? 'Reserved follow-up query ready.' : accessSummary}
          </Text>
          <Pressable
            onPress={() => submitReading()}
            disabled={loading || !state.ageConfirmed}
            style={[styles.terminalInvokeButton, { backgroundColor: '#e6bf62' }]}>
            <Text style={styles.terminalInvokeLabel}>{primaryActionLabel}</Text>
          </Pressable>
        </View>
        {loading ? <ActivityIndicator color={persona.accent} /> : null}
        {renderStatus()}
      </View>
    </View>
  );

  const renderClerkScene = () => (
    <View style={styles.page}>
      <View style={[styles.clerkTopBar, isCompact && styles.clerkTopBarCompact]}>
        <View style={styles.clerkTopCopy}>
          <Text style={styles.clerkOffice}>{scene.wordmark}</Text>
          <Text style={styles.clerkFolio}>{scene.kicker}</Text>
        </View>
        <View style={[styles.clerkTopActions, isCompact && styles.clerkTopActionsCompact]}>
          <Text style={styles.clerkDisclosure}>{persona.disclosureLabel}  18+  theatrical bureaucracy</Text>
          <Link href="/" asChild>
            <Pressable style={backButtonStyle}>
              <Text style={styles.backLabelClerk}>Return to foyer</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <View style={styles.clerkHero}>
        <Text style={styles.clerkGreeting}>{scene.hero}</Text>
        <Text style={styles.clerkSubtitle}>{scene.subtitle}</Text>
      </View>

      <View style={[styles.sceneGrid, isCompact && styles.sceneGridCompact]}>
        <View style={styles.primaryColumn}>
          <View style={[styles.clerkDesk, isCompact && styles.clerkDeskCompact]}>
            <View style={[styles.clerkPinnedNote, isCompact && styles.clerkPinnedNoteCompact]}>
              <View style={styles.clerkPinnedTab}>
                <Text style={styles.clerkPinnedTabLabel}>III</Text>
              </View>
              <Text style={styles.sectionLabelClerk}>{entry ? 'Cabinet intake note' : scene.idleLabel}</Text>
              <Text style={styles.clerkPaperText}>{entry ? entry.result.openingLine : scene.idleQuote}</Text>
              <View style={styles.clerkPinnedMetaRow}>
                <Text style={styles.clerkPinnedMeta}>Entry 0.114</Text>
                <Text style={styles.clerkPinnedMeta}>{entry ? 'Unread' : 'Awaiting seal'}</Text>
              </View>
            </View>

            <View style={[styles.clerkReplySlip, isCompact && styles.clerkReplySlipCompact]}>
              <Text style={styles.clerkReplyLabel}>{entry ? 'Delivered by external scribe' : 'Filed request summary'}</Text>
              <Text style={styles.clerkSlipText}>
                {entry ? entry.question : 'Tell me what the ministry should examine, and the clerk will draft the first response.'}
              </Text>
            </View>

            <View style={[styles.clerkDecree, isCompact && styles.clerkDecreeCompact]}>
              <Text style={styles.clerkDecreeLabel}>{entry ? 'Filed interpretation' : 'Ministry notice'}</Text>
              <Text style={styles.clerkDecreeBody}>
                {entry ? entry.result.interpretation : 'The archive prefers one precise question, written as if it has already cost you sleep.'}
              </Text>
              {entry ? (
                <>
                  <Text style={styles.clerkTurningBody}>{entry.result.turningPoint}</Text>
                  {renderSymbols()}
                  <Text style={styles.clerkBoundary}>
                    {entry.result.boundaryClause}  {entry.result.followUpPrompt}
                  </Text>
                </>
              ) : (
                <Text style={styles.clerkBoundary}>
                  Choose a registry mode, write the request, and the ministry will return a stamped omen rather than a promise.
                </Text>
              )}
            </View>

            <View style={[styles.clerkEvidenceCard, isCompact && styles.clerkEvidenceCardCompact]}>
              <Text style={styles.clerkEvidenceLabel}>Seal fragment</Text>
              <View style={styles.clerkEvidenceGlyph} />
              <Text style={styles.clerkEvidenceMeta}>Drawer 12-A</Text>
            </View>
          </View>

          {entry ? (
            <View style={styles.inlineMetaRow}>
              <Text style={styles.inlineMetaClerk}>
                {entry.tier.replace('-', ' ')}  {formatEntryDate(entry)}  {formatEntryTime(entry)}
              </Text>
              {renderCopyAction()}
            </View>
          ) : null}
        </View>

        <View style={styles.sideColumn}>{renderMetaSidebar()}</View>
      </View>

      <View style={[styles.clerkComposerRow, isCompact && styles.clerkComposerRowCompact]}>
        <View style={styles.clerkComposerLead}>
          <Text style={styles.clerkComposerLeadLabel}>Scribe</Text>
        </View>
        <TextInput
          multiline
          numberOfLines={4}
          placeholder={scene.placeholder}
          placeholderTextColor="#756a67"
          style={styles.clerkInput}
          value={question}
          onChangeText={setQuestion}
        />
        <View style={styles.clerkButtons}>
          <Pressable
            onPress={claimOmen}
            style={[styles.clerkSideButton, { borderColor: persona.border }]}>
            <Text style={styles.clerkSideButtonLabel}>
              {dailyOmen ? 'Open active omen' : scene.dailyAction}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => submitReading()}
            disabled={loading || !state.ageConfirmed}
            style={[styles.clerkSubmitButton, { backgroundColor: '#d6a08c' }]}>
            <Text style={styles.clerkSubmitLabel}>{primaryActionLabel}</Text>
          </Pressable>
        </View>
      </View>

      {loading ? <ActivityIndicator color="#d6a08c" /> : null}
      {renderStatus()}
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        personaId === 'clerk' ? styles.safeAreaClerk : styles.safeAreaDark,
      ]}>
      <PersonaBackdrop personaId={personaId} />
      <AgeGateModal visible={isHydrated && !state.ageConfirmed} onConfirm={confirmAgeGate} />
      <CheckoutModal
        visible={checkoutVisible}
        selectedPlan={selectedPlan}
        onClose={() => setCheckoutVisible(false)}
        onConfirm={(email) => {
          unlockPurchase(selectedPlan, email);
          setCheckoutVisible(false);
          setStatusCopy(`${selectedPlan === 'membership' ? 'Membership' : 'Credits'} unlocked for ${email}.`);
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {personaId === 'cabinet'
          ? renderCabinetScene()
          : personaId === 'terminal'
            ? renderTerminalScene()
            : renderClerkScene()}
      </ScrollView>
    </SafeAreaView>
  );
}

function PersonaBackdrop({ personaId }: { personaId: OraclePersona }) {
  if (personaId === 'clerk') {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#0a0a0d', '#121116', '#08090c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.clerkBackdropTexture} />
        <View style={styles.clerkBackdropStripe} />
        <View style={styles.clerkBackdropPanel} />
        <View style={styles.clerkBackdropGlow} />
        <View style={styles.clerkBackdropStamp} />
      </View>
    );
  }

  if (personaId === 'terminal') {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#14181b', '#22282b', '#17191b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.terminalGridBackdrop} />
        <View style={styles.terminalGlowBackdrop} />
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#131111', '#1c1717', '#0f0d0f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cabinetBackdropTexture} />
      <View style={styles.cabinetBackdropGlow} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  safeAreaDark: {
    backgroundColor: '#101113',
  },
  safeAreaClerk: {
    backgroundColor: '#0a0a0d',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    paddingBottom: 44,
  },
  page: {
    width: '100%',
    maxWidth: 1220,
    alignSelf: 'center',
    gap: 20,
  },
  chromeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  backButton: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  backButtonDark: {
    backgroundColor: 'rgba(18, 17, 18, 0.76)',
  },
  backButtonClerk: {
    backgroundColor: 'rgba(25, 23, 24, 0.86)',
  },
  backLabelDark: {
    color: '#f2eeea',
    fontSize: 13,
    lineHeight: 18,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  backLabelClerk: {
    color: '#e7c6b7',
    fontSize: 12,
    lineHeight: 17,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  chromeMetaDark: {
    color: '#978f90',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sceneGrid: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
  },
  sceneGridCompact: {
    flexDirection: 'column',
  },
  primaryColumn: {
    flex: 1.45,
    minWidth: 0,
    gap: 16,
  },
  sideColumn: {
    flex: 0.92,
    minWidth: 280,
  },
  sidebarStack: {
    gap: 16,
  },
  sidebarCard: {
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  sidebarCardDark: {
    backgroundColor: 'rgba(18, 18, 20, 0.72)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sidebarCardClerk: {
    backgroundColor: 'rgba(26, 23, 25, 0.86)',
    borderColor: 'rgba(200, 164, 111, 0.16)',
  },
  sidebarLabel: {
    color: '#d9d1c5',
    fontSize: 11,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 1.7,
  },
  sidebarLabelDark: {
    color: '#63471c',
  },
  sidebarBody: {
    color: '#bbb0a3',
    fontSize: 14,
    lineHeight: 22,
  },
  sidebarBodyDark: {
    color: '#553f1d',
  },
  modeGrid: {
    gap: 10,
  },
  modeCard: {
    borderWidth: 1,
    padding: 14,
    gap: 5,
  },
  modeCardDark: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  modeCardDarkActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  modeCardClerk: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  modeCardClerkActive: {
    backgroundColor: 'rgba(214, 160, 140, 0.14)',
  },
  modeTitle: {
    color: '#f4ede3',
    fontSize: 18,
    lineHeight: 22,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  modeTitleDark: {
    color: '#38250f',
  },
  modeBody: {
    color: '#a89d95',
    fontSize: 12,
    lineHeight: 18,
  },
  modeBodyDark: {
    color: '#614925',
  },
  utilityButton: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  utilityButtonDark: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  utilityButtonClerk: {
    backgroundColor: 'rgba(214, 160, 140, 0.12)',
  },
  utilityButtonLabel: {
    color: '#f6efe3',
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  utilityButtonLabelDark: {
    color: '#4b3312',
  },
  planGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  planChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  planChipDark: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  planChipClerk: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  planChipLabel: {
    color: '#eee6db',
    fontSize: 11,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
  },
  planChipLabelDark: {
    color: '#5a421a',
  },
  archiveList: {
    gap: 10,
  },
  archiveRow: {
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  archiveRowDark: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  archiveRowClerk: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(200, 164, 111, 0.12)',
  },
  archiveQuestion: {
    color: '#f1eadd',
    fontSize: 14,
    lineHeight: 21,
  },
  archiveQuestionDark: {
    color: '#3f2e14',
  },
  archiveMeta: {
    color: '#978d84',
    fontSize: 10,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
  },
  archiveMetaDark: {
    color: '#7b6031',
  },
  archiveEmpty: {
    color: '#9c9289',
    fontSize: 13,
    lineHeight: 19,
  },
  archiveEmptyDark: {
    color: '#6e5528',
  },
  guideList: {
    gap: 10,
  },
  guideToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  guideToggleIcon: {
    color: '#d0ab72',
    fontSize: 18,
    lineHeight: 18,
    fontWeight: '600',
  },
  guideToggleIconDark: {
    color: '#b17a61',
  },
  guideStep: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  guideStepDark: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  guideStepClerk: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  guideStepHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  guideStepIndex: {
    color: '#d0ab72',
    fontSize: 10,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '800',
  },
  guideStepIndexDark: {
    color: '#b17a61',
  },
  guideStepTitle: {
    color: '#f2eadf',
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  guideStepTitleDark: {
    color: '#d9c2b5',
  },
  guideStepBody: {
    color: '#aa9f97',
    fontSize: 12,
    lineHeight: 18,
  },
  guideStepBodyDark: {
    color: '#9f8e87',
  },
  symbolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  symbolChip: {
    width: '100%',
    maxWidth: 220,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  symbolChipDark: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  symbolChipClerk: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  symbolLabel: {
    color: '#f1e5d9',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.3,
  },
  symbolLabelDark: {
    color: '#49340f',
  },
  symbolMeaning: {
    color: '#b4a99e',
    fontSize: 12,
    lineHeight: 18,
  },
  symbolMeaningDark: {
    color: '#6d5426',
  },
  copyAction: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  copyActionDark: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  copyActionClerk: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  copyActionLabel: {
    color: '#efe4d6',
    fontSize: 11,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  copyActionLabelDark: {
    color: '#553d15',
  },
  inlineMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  inlineMetaDark: {
    color: '#8f8581',
    fontSize: 11,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  inlineMetaClerk: {
    color: '#b99382',
    fontSize: 11,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  sectionLabelDark: {
    color: '#8d7d76',
    fontSize: 11,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
  },
  sectionLabelClerk: {
    color: '#b17a61',
    fontSize: 11,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
  },
  statusCopy: {
    color: '#c8b4b4',
    fontSize: 13,
    lineHeight: 19,
  },
  statusCopyDark: {
    color: '#6a4f1f',
  },

  cabinetHero: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 26,
  },
  cabinetWordmark: {
    color: '#ede6dd',
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontStyle: 'italic',
  },
  cabinetKicker: {
    color: '#6f2726',
    fontSize: 11,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 2.3,
  },
  cabinetTitle: {
    color: '#f0e7e1',
    fontSize: 56,
    lineHeight: 58,
    fontFamily: 'CormorantGaramond_400Regular',
    fontStyle: 'italic',
    textAlign: 'center',
    maxWidth: 880,
  },
  cabinetSubtitle: {
    color: '#a79b98',
    fontSize: 18,
    lineHeight: 29,
    fontFamily: 'CormorantGaramond_400Regular',
    fontStyle: 'italic',
    textAlign: 'center',
    maxWidth: 760,
  },
  cabinetReadingFrame: {
    gap: 18,
  },
  cabinetLetter: {
    backgroundColor: 'rgba(66, 62, 64, 0.5)',
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(142, 108, 97, 0.7)',
    padding: 24,
    gap: 16,
  },
  cabinetQuote: {
    color: '#f1e9df',
    fontSize: 36,
    lineHeight: 40,
    fontFamily: 'CormorantGaramond_400Regular',
    fontStyle: 'italic',
  },
  cabinetBody: {
    color: '#d4c9c1',
    fontSize: 18,
    lineHeight: 30,
    fontFamily: 'CormorantGaramond_400Regular',
    fontStyle: 'italic',
  },
  cabinetDispatch: {
    alignSelf: 'flex-end',
    width: '82%',
    backgroundColor: 'rgba(115, 8, 7, 0.76)',
    borderRightWidth: 4,
    borderRightColor: '#d9aba1',
    padding: 22,
    gap: 10,
  },
  dispatchLabel: {
    color: '#ceb4aa',
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    alignSelf: 'flex-end',
  },
  dispatchBody: {
    color: '#f6ece3',
    fontSize: 34,
    lineHeight: 38,
    textAlign: 'center',
    fontFamily: 'CormorantGaramond_400Regular',
    fontStyle: 'italic',
  },
  cabinetBoundary: {
    color: '#938885',
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  cabinetComposer: {
    backgroundColor: 'rgba(20, 20, 22, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 18,
    gap: 14,
  },
  cabinetInput: {
    minHeight: 110,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.14)',
    color: '#f0ece6',
    fontSize: 30,
    lineHeight: 34,
    fontFamily: 'CormorantGaramond_400Regular',
    fontStyle: 'italic',
    textAlignVertical: 'top',
    paddingBottom: 16,
  },
  composerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  composerHintDark: {
    color: '#847976',
    fontSize: 12,
    lineHeight: 18,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    flex: 1,
  },
  submitButtonDark: {
    minHeight: 48,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderWidth: 1,
  },
  submitButtonLabelDark: {
    color: '#171111',
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '800',
  },

  terminalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    backgroundColor: 'rgba(28, 31, 33, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(141, 227, 209, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  terminalTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  terminalWordmark: {
    color: '#eae2ce',
    fontSize: 28,
    lineHeight: 30,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontStyle: 'italic',
  },
  terminalProtocol: {
    color: '#6c7274',
    fontSize: 10,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  terminalBadge: {
    color: '#d9dfe1',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  terminalStream: {
    gap: 18,
  },
  terminalEpoch: {
    color: '#6b6f71',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2.6,
    marginTop: 12,
  },
  terminalMessageRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  terminalIconBox: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: 'rgba(226, 193, 103, 0.35)',
    backgroundColor: 'rgba(226, 193, 103, 0.06)',
  },
  terminalBubble: {
    flex: 1,
    backgroundColor: 'rgba(32, 35, 37, 0.94)',
    borderLeftWidth: 3,
    borderLeftColor: '#d6ab49',
    padding: 18,
    gap: 8,
  },
  terminalSpeaker: {
    color: '#d9b44f',
    fontSize: 17,
    lineHeight: 22,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontStyle: 'italic',
  },
  terminalTime: {
    color: '#80888a',
    fontSize: 10,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  terminalMessageText: {
    color: '#e7ebea',
    fontSize: 32,
    lineHeight: 38,
    fontFamily: 'CormorantGaramond_400Regular',
  },
  terminalUserRow: {
    alignItems: 'flex-end',
    gap: 8,
  },
  terminalUserTime: {
    color: '#868e8f',
    fontSize: 10,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  terminalUserBubble: {
    width: '78%',
    backgroundColor: 'rgba(48, 51, 54, 0.92)',
    padding: 18,
  },
  terminalUserText: {
    color: '#f1efea',
    fontSize: 17,
    lineHeight: 28,
    textAlign: 'center',
  },
  terminalRecordCard: {
    backgroundColor: '#e4bf6d',
    padding: 18,
    gap: 12,
  },
  terminalRecordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  terminalRecordCode: {
    color: '#32240f',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  terminalRecordStatus: {
    color: '#362b1a',
    fontSize: 11,
    lineHeight: 15,
    textTransform: 'uppercase',
    fontWeight: '800',
  },
  terminalRecordTitle: {
    color: '#2b1e0f',
    fontSize: 32,
    lineHeight: 36,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontStyle: 'italic',
  },
  terminalRecordBody: {
    color: '#2f2415',
    fontSize: 16,
    lineHeight: 26,
  },
  terminalBoundary: {
    color: '#483722',
    fontSize: 13,
    lineHeight: 20,
  },
  terminalHintCard: {
    backgroundColor: 'rgba(28, 31, 33, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    gap: 10,
  },
  terminalHintTitle: {
    color: '#e3e7e8',
    fontSize: 30,
    lineHeight: 34,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  terminalHintBody: {
    color: '#aeb3b4',
    fontSize: 16,
    lineHeight: 24,
  },
  terminalComposer: {
    backgroundColor: 'rgba(37, 39, 40, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    gap: 10,
  },
  terminalInput: {
    minHeight: 90,
    color: '#e6e5df',
    fontSize: 22,
    lineHeight: 27,
    fontFamily: 'CormorantGaramond_400Regular',
    fontStyle: 'italic',
    textAlignVertical: 'top',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  terminalComposerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  terminalComposerHint: {
    color: '#7d8485',
    fontSize: 11,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    flex: 1,
  },
  terminalInvokeButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  terminalInvokeLabel: {
    color: '#241b10',
    fontSize: 11,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 1.7,
    fontWeight: '800',
  },

  clerkTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'center',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(17, 16, 19, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(200, 164, 111, 0.14)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  clerkTopBarCompact: {
    alignItems: 'flex-start',
  },
  clerkTopCopy: {
    gap: 4,
  },
  clerkTopActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  clerkTopActionsCompact: {
    alignItems: 'flex-start',
  },
  clerkFolio: {
    color: '#8e7a73',
    fontSize: 11,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontWeight: '700',
  },
  clerkDisclosure: {
    color: '#7f7270',
    fontSize: 10,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  clerkHero: {
    gap: 8,
    maxWidth: 720,
    paddingTop: 6,
  },
  clerkOffice: {
    color: '#c9947d',
    fontSize: 11,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 2.2,
    fontWeight: '700',
  },
  clerkGreeting: {
    color: '#f0ddd2',
    fontSize: 44,
    lineHeight: 47,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontStyle: 'italic',
  },
  clerkSubtitle: {
    color: '#a79a95',
    fontSize: 17,
    lineHeight: 28,
  },
  clerkDesk: {
    position: 'relative',
    minHeight: 640,
    paddingTop: 8,
    paddingBottom: 18,
  },
  clerkDeskCompact: {
    minHeight: undefined,
    gap: 14,
  },
  clerkPinnedNote: {
    width: '78%',
    maxWidth: 620,
    backgroundColor: '#ebe1d6',
    borderWidth: 1,
    borderColor: 'rgba(83, 66, 53, 0.38)',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
    transform: [{ rotate: '-1.8deg' }],
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  clerkPinnedNoteCompact: {
    width: '100%',
    maxWidth: undefined,
    transform: [{ rotate: '-1deg' }],
  },
  clerkPinnedTab: {
    position: 'absolute',
    left: -12,
    top: 18,
    width: 26,
    height: 26,
    backgroundColor: '#a85d3f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clerkPinnedTabLabel: {
    color: '#f7e9df',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  clerkPinnedMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  clerkPinnedMeta: {
    color: '#99918b',
    fontSize: 10,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  clerkPaperText: {
    color: '#544c47',
    fontSize: 32,
    lineHeight: 40,
    fontFamily: 'CormorantGaramond_400Regular',
    fontStyle: 'italic',
  },
  clerkReplySlip: {
    alignSelf: 'flex-end',
    width: '56%',
    minWidth: 280,
    backgroundColor: 'rgba(39, 36, 38, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(214, 160, 140, 0.22)',
    paddingHorizontal: 22,
    paddingVertical: 18,
    gap: 10,
    transform: [{ rotate: '2.4deg' }],
    marginTop: -6,
    marginRight: 28,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  clerkReplySlipCompact: {
    alignSelf: 'stretch',
    width: '92%',
    marginTop: 0,
    marginRight: 0,
    transform: [{ rotate: '1.4deg' }],
  },
  clerkReplyLabel: {
    color: '#9f8073',
    fontSize: 10,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    alignSelf: 'flex-end',
  },
  clerkSlipText: {
    color: '#ddd2cb',
    fontSize: 17,
    lineHeight: 28,
    fontFamily: 'CormorantGaramond_400Regular',
    fontStyle: 'italic',
  },
  clerkDecree: {
    width: '76%',
    maxWidth: 720,
    backgroundColor: 'rgba(24, 20, 21, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(69, 45, 32, 0.68)',
    paddingHorizontal: 28,
    paddingVertical: 26,
    gap: 16,
    marginTop: 26,
    shadowColor: '#000000',
    shadowOpacity: 0.34,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  clerkDecreeCompact: {
    width: '100%',
    maxWidth: undefined,
    marginTop: 14,
    paddingHorizontal: 20,
  },
  clerkDecreeLabel: {
    color: '#cf947f',
    fontSize: 11,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontWeight: '800',
  },
  clerkDecreeBody: {
    color: '#d4a28d',
    fontSize: 20,
    lineHeight: 32,
    fontFamily: 'CormorantGaramond_400Regular',
  },
  clerkTurningBody: {
    color: '#d4a28d',
    fontSize: 20,
    lineHeight: 32,
    fontFamily: 'CormorantGaramond_400Regular',
  },
  clerkBoundary: {
    color: '#8f7f79',
    fontSize: 13,
    lineHeight: 22,
  },
  clerkEvidenceCard: {
    position: 'absolute',
    right: 6,
    top: 10,
    width: 128,
    padding: 14,
    backgroundColor: 'rgba(32, 28, 28, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    gap: 12,
    transform: [{ rotate: '8deg' }],
  },
  clerkEvidenceCardCompact: {
    position: 'relative',
    right: undefined,
    top: undefined,
    alignSelf: 'flex-end',
    marginTop: -4,
    transform: [{ rotate: '4deg' }],
  },
  clerkEvidenceLabel: {
    color: '#8f7f79',
    fontSize: 9,
    lineHeight: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  clerkEvidenceGlyph: {
    width: 54,
    height: 18,
    borderWidth: 2,
    borderColor: '#7c583d',
    borderRadius: 20,
    transform: [{ rotate: '-30deg' }],
  },
  clerkEvidenceMeta: {
    color: '#6c5e59',
    fontSize: 9,
    lineHeight: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  clerkComposerRow: {
    flexDirection: 'row',
    gap: 0,
    alignItems: 'stretch',
    backgroundColor: 'rgba(31, 28, 29, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  clerkComposerRowCompact: {
    flexWrap: 'wrap',
  },
  clerkComposerLead: {
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(168, 93, 63, 0.18)',
    paddingHorizontal: 12,
  },
  clerkComposerLeadLabel: {
    color: '#d9b7a9',
    fontSize: 11,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 1.9,
    fontWeight: '800',
  },
  clerkInput: {
    flex: 1,
    minWidth: 260,
    minHeight: 90,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: '#e0d5cf',
    fontSize: 18,
    lineHeight: 27,
    fontFamily: 'CormorantGaramond_400Regular',
    fontStyle: 'italic',
    textAlignVertical: 'top',
  },
  clerkButtons: {
    width: 250,
    gap: 0,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.08)',
  },
  clerkSideButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  clerkSideButtonLabel: {
    color: '#c8b6ae',
    fontSize: 11,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontWeight: '800',
    textAlign: 'center',
  },
  clerkSubmitButton: {
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  clerkSubmitLabel: {
    color: '#2e1d15',
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    fontWeight: '800',
    textAlign: 'center',
  },

  cabinetBackdropTexture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.14,
    backgroundColor: '#000000',
  },
  cabinetBackdropGlow: {
    position: 'absolute',
    left: '15%',
    top: 100,
    width: 420,
    height: 420,
    borderRadius: 999,
    backgroundColor: 'rgba(90, 9, 8, 0.12)',
  },
  terminalGridBackdrop: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.05)',
    opacity: 0.2,
  },
  terminalGlowBackdrop: {
    position: 'absolute',
    right: 20,
    bottom: 140,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(141, 227, 209, 0.08)',
  },
  clerkBackdropTexture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  clerkBackdropStripe: {
    position: 'absolute',
    right: 18,
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: 'rgba(146, 78, 55, 0.58)',
  },
  clerkBackdropPanel: {
    position: 'absolute',
    right: -40,
    top: 82,
    width: 300,
    height: 420,
    backgroundColor: 'rgba(255,255,255,0.03)',
    transform: [{ rotate: '8deg' }],
  },
  clerkBackdropGlow: {
    position: 'absolute',
    left: '16%',
    bottom: 140,
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: 'rgba(74, 101, 163, 0.09)',
  },
  clerkBackdropStamp: {
    position: 'absolute',
    left: -34,
    bottom: 70,
    width: 84,
    height: 84,
    backgroundColor: 'rgba(123, 149, 162, 0.14)',
    transform: [{ rotate: '45deg' }],
  },
});
