import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenFrame } from '@/components/app/screen-frame';
import { useAppState } from '@/contexts/app-state';

export default function SettingsScreen() {
  const { state, clearArchive } = useAppState();

  return (
    <ScreenFrame accent="#d97b62" glow="rgba(217, 123, 98, 0.18)">
      <View style={styles.header}>
        <Link href="/" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
        </Link>
        <Text style={styles.title}>Settings and trust</Text>
        <Text style={styles.subtitle}>
          The MVP keeps age confirmation, teaser state, archive, credits, and membership locally.
          Production should move these controls behind authenticated storage and real export/delete flows.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Current access</Text>
        <Text style={styles.value}>Age confirmed: {state.ageConfirmed ? 'yes' : 'no'}</Text>
        <Text style={styles.value}>Disclosure seen: {state.aiDisclosureSeen ? 'yes' : 'no'}</Text>
        <Text style={styles.value}>Email: {state.email ?? 'none yet'}</Text>
        <Text style={styles.value}>Credit balance: {state.creditBalance}</Text>
        <Text style={styles.value}>
          Membership: {state.membership.active ? `active with ${state.membership.monthlyIncludedRemaining} included readings left` : 'inactive'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Privacy actions</Text>
        <Text style={styles.copy}>
          The archive can be wiped locally now. In the planned Supabase version, this action maps to
          account-level deletion and a signed export endpoint.
        </Text>
        <Pressable onPress={clearArchive} style={styles.dangerButton}>
          <Text style={styles.dangerLabel}>Delete local archive</Text>
        </Pressable>
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 12,
    marginBottom: 18,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  backLabel: {
    color: '#e8cfaa',
    fontSize: 14,
  },
  title: {
    color: '#f8f1e8',
    fontSize: 46,
    lineHeight: 48,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  subtitle: {
    color: '#d5cec8',
    fontSize: 15,
    lineHeight: 23,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 28,
    padding: 20,
    backgroundColor: 'rgba(16, 18, 28, 0.75)',
    gap: 10,
    marginBottom: 16,
  },
  label: {
    color: '#f8f1e8',
    fontSize: 28,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  value: {
    color: '#d5cec8',
    fontSize: 15,
    lineHeight: 23,
  },
  copy: {
    color: '#d5cec8',
    fontSize: 14,
    lineHeight: 22,
  },
  dangerButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#f0b5ae',
  },
  dangerLabel: {
    color: '#30120f',
    fontWeight: '700',
  },
});
