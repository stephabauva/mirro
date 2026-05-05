import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenFrame } from '@/components/app/screen-frame';

export default function PrivacyScreen() {
  return (
    <ScreenFrame accent="#8de3d1" glow="rgba(141, 227, 209, 0.12)">
      <Link href="/" asChild>
        <Pressable style={styles.backButton}>
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
      </Link>
      <Text style={styles.title}>Privacy notice</Text>
      <View style={styles.card}>
        <Text style={styles.copy}>
          This product is designed to minimize data collection. At MVP stage, the client stores age
          confirmation, archive state, and purchase state locally. Production deployment should store
          only the minimum needed for access, billing, and archive features.
        </Text>
        <Text style={styles.copy}>
          If you personalize future readings using past prompts, disclose that plainly as AI
          personalization. Separate payment records from reading text where possible. Offer archive
          deletion and export.
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
