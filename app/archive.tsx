import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenFrame } from '@/components/app/screen-frame';
import { ReadingCard } from '@/components/oracle/reading-card';
import { useAppState } from '@/contexts/app-state';

export default function ArchiveScreen() {
  const { state } = useAppState();

  return (
    <ScreenFrame accent="#d5b583" glow="rgba(214, 173, 106, 0.14)">
      <View style={styles.header}>
        <Link href="/" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
        </Link>
        <Text style={styles.title}>Archive</Text>
        <Text style={styles.subtitle}>
          Stored readings live here. In production, this archive should be tied to Supabase auth and
          a delete/export flow.
        </Text>
      </View>

      <View style={styles.list}>
        {state.archive.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No readings stored yet.</Text>
            <Text style={styles.emptyBody}>Visit one of the three oracles and trigger a teaser or premium reading first.</Text>
          </View>
        ) : (
          state.archive.map((entry) => <ReadingCard key={entry.id} entry={entry} />)
        )}
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
  list: {
    gap: 14,
  },
  empty: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 28,
    padding: 20,
    backgroundColor: 'rgba(16, 18, 28, 0.75)',
    gap: 8,
  },
  emptyTitle: {
    color: '#f8f1e8',
    fontSize: 24,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  emptyBody: {
    color: '#d5cec8',
    fontSize: 14,
    lineHeight: 22,
  },
});
