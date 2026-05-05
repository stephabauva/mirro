import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getPersona } from '@/lib/oracle/personas';
import { ArchiveEntry } from '@/lib/oracle/types';

type Props = {
  entry: ArchiveEntry;
  onCopy?: () => void;
};

export function ReadingCard({ entry, onCopy }: Props) {
  const persona = getPersona(entry.persona);

  return (
    <View style={[styles.card, { backgroundColor: persona.surface, borderColor: persona.border }]}>
      <Text style={[styles.kicker, { color: persona.accent }]}>
        {persona.label} · {entry.tier.replace('-', ' ')}
      </Text>
      <Text style={styles.opening}>{entry.result.openingLine}</Text>

      {entry.result.symbols.length > 0 ? (
        <View style={styles.symbolRow}>
          {entry.result.symbols.map((symbol) => (
            <View
              key={symbol.label}
              style={[styles.symbolChip, { backgroundColor: persona.chip, borderColor: persona.border }]}>
              <Text style={styles.symbolLabel}>{symbol.label}</Text>
              <Text style={styles.symbolMeaning}>{symbol.meaning}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Text style={styles.copy}>{entry.result.interpretation}</Text>
      <Text style={styles.turning}>{entry.result.turningPoint}</Text>
      <Text style={styles.boundary}>{entry.result.boundaryClause}</Text>

      {onCopy ? (
        <Pressable onPress={onCopy} style={[styles.copyButton, { borderColor: persona.border }]}>
          <Text style={[styles.copyButtonLabel, { color: persona.accent }]}>Copy share text</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    gap: 16,
  },
  kicker: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  opening: {
    color: '#f8f1e8',
    fontSize: 28,
    lineHeight: 31,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  symbolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  symbolChip: {
    width: '100%',
    maxWidth: 220,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    gap: 4,
  },
  symbolLabel: {
    color: '#f4ebe3',
    fontSize: 13,
    fontWeight: '700',
  },
  symbolMeaning: {
    color: '#bdb4ad',
    fontSize: 12,
    lineHeight: 17,
  },
  copy: {
    color: '#e4ddd6',
    fontSize: 15,
    lineHeight: 24,
  },
  turning: {
    color: '#f2d9b0',
    fontSize: 15,
    lineHeight: 23,
  },
  boundary: {
    color: '#a79fab',
    fontSize: 13,
    lineHeight: 18,
  },
  copyButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  copyButtonLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
});
