import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

import { buildDailyOmen } from '@/lib/oracle/generator';
import { ArchiveEntry, OraclePersona, StoredAppState } from '@/lib/oracle/types';

const STORAGE_KEY = 'mirro.app-state.v1';

const defaultState: StoredAppState = {
  ageConfirmed: false,
  aiDisclosureSeen: false,
  teaserClaimed: false,
  email: null,
  creditBalance: 0,
  membership: {
    active: false,
    monthlyIncludedRemaining: 0,
    startedAt: null,
  },
  dailyOmens: {},
  followUpEntitlements: {},
  archive: [],
};

type PurchasePlan = 'single' | 'three' | 'ten' | 'membership';

type AppStateContextValue = {
  isHydrated: boolean;
  state: StoredAppState;
  confirmAgeGate: () => void;
  recordDisclosureSeen: () => void;
  redeemTeaser: () => void;
  saveArchiveEntry: (entry: ArchiveEntry) => void;
  claimDailyOmen: (persona: OraclePersona) => ArchiveEntry;
  hasDailyOmen: (persona: OraclePersona) => ArchiveEntry | null;
  hasFollowUpTurn: (persona: OraclePersona) => boolean;
  hasPremiumAccess: boolean;
  canUseMembershipReading: boolean;
  consumePremiumReading: () => boolean;
  grantFollowUpTurn: (persona: OraclePersona) => void;
  consumeFollowUpTurn: (persona: OraclePersona) => boolean;
  unlockPurchase: (plan: PurchasePlan, email: string) => void;
  clearArchive: () => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [isHydrated, setHydrated] = useState(false);
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value) {
          setState({ ...defaultState, ...JSON.parse(value) });
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [isHydrated, state]);

  const value = useMemo<AppStateContextValue>(() => {
    const saveArchiveEntry = (entry: ArchiveEntry) => {
      setState((current) => ({
        ...current,
        archive: [entry, ...current.archive].slice(0, 50),
      }));
    };

    return {
      isHydrated,
      state,
      confirmAgeGate: () => setState((current) => ({ ...current, ageConfirmed: true })),
      recordDisclosureSeen: () =>
        setState((current) => ({ ...current, aiDisclosureSeen: true })),
      redeemTeaser: () =>
        setState((current) => ({
          ...current,
          teaserClaimed: true,
        })),
      saveArchiveEntry,
      claimDailyOmen: (persona) => {
        const key = `${persona}:${new Date().toISOString().slice(0, 10)}`;
        const existing = state.dailyOmens[key];

        if (existing) {
          return existing;
        }

        const omen = buildDailyOmen(persona);

        setState((current) => ({
          ...current,
          dailyOmens: {
            ...current.dailyOmens,
            [key]: omen,
          },
          archive: [omen, ...current.archive].slice(0, 50),
        }));

        return omen;
      },
      hasDailyOmen: (persona) => {
        const key = `${persona}:${new Date().toISOString().slice(0, 10)}`;
        return state.dailyOmens[key] ?? null;
      },
      hasFollowUpTurn: (persona) => Boolean(state.followUpEntitlements[persona]),
      hasPremiumAccess:
        state.creditBalance > 0 ||
        (state.membership.active && state.membership.monthlyIncludedRemaining > 0),
      canUseMembershipReading:
        state.membership.active && state.membership.monthlyIncludedRemaining > 0,
      consumePremiumReading: () => {
        let didConsume = false;

        setState((current) => {
          if (current.membership.active && current.membership.monthlyIncludedRemaining > 0) {
            didConsume = true;
            return {
              ...current,
              membership: {
                ...current.membership,
                monthlyIncludedRemaining: current.membership.monthlyIncludedRemaining - 1,
              },
            };
          }

          if (current.creditBalance > 0) {
            didConsume = true;
            return {
              ...current,
              creditBalance: current.creditBalance - 1,
            };
          }

          return current;
        });

        return didConsume;
      },
      grantFollowUpTurn: (persona) =>
        setState((current) => ({
          ...current,
          followUpEntitlements: {
            ...current.followUpEntitlements,
            [persona]: true,
          },
        })),
      consumeFollowUpTurn: (persona) => {
        let didConsume = false;

        setState((current) => {
          if (!current.followUpEntitlements[persona]) {
            return current;
          }

          didConsume = true;
          return {
            ...current,
            followUpEntitlements: {
              ...current.followUpEntitlements,
              [persona]: false,
            },
          };
        });

        return didConsume;
      },
      unlockPurchase: (plan, email) => {
        setState((current) => {
          if (plan === 'membership') {
            return {
              ...current,
              email,
              membership: {
                active: true,
                monthlyIncludedRemaining: 4,
                startedAt: new Date().toISOString(),
              },
            };
          }

          const credits = plan === 'single' ? 1 : plan === 'three' ? 3 : 10;
          return {
            ...current,
            email,
            creditBalance: current.creditBalance + credits,
          };
        });
      },
      clearArchive: () =>
        setState((current) => ({
          ...current,
          archive: [],
          dailyOmens: {},
          followUpEntitlements: {},
        })),
    };
  }, [isHydrated, state]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }

  return context;
}
