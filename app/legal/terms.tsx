import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenFrame } from '@/components/app/screen-frame';

export default function TermsScreen() {
  return (
    <ScreenFrame accent="#d5b583" glow="rgba(214, 173, 106, 0.14)">
      <Link href="/" asChild>
        <Pressable style={styles.backButton}>
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
      </Link>
      <Text style={styles.title}>Terms and boundaries</Text>
      <View style={styles.card}>
        <Text style={styles.copy}>
          This service provides AI-generated entertainment and reflective content only. It does not
          provide medical, legal, financial, or crisis advice, and it must not be relied on for
          decisions in those domains.
        </Text>
        <Text style={styles.copy}>
          The service is intended for adults only. Sensitive prompts may be refused or rewritten.
          The product must not create urgency, guilt, dependency, or purchase pressure tied to harm.
        </Text>
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 12,
  },
  backLabel: {
    color: '#e8cfaa',
  },
  title: {
    color: '#f8f1e8',
    fontSize: 46,
    lineHeight: 48,
    fontFamily: 'CormorantGaramond_600SemiBold',
    marginBottom: 18,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 28,
    padding: 20,
    backgroundColor: 'rgba(16, 18, 28, 0.75)',
    gap: 12,
  },
  copy: {
    color: '#d5cec8',
    fontSize: 15,
    lineHeight: 24,
  },
});
