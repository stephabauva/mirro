import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenFrame } from '@/components/app/screen-frame';

export default function RefundScreen() {
  return (
    <ScreenFrame accent="#d97b62" glow="rgba(217, 123, 98, 0.18)">
      <Link href="/" asChild>
        <Pressable style={styles.backButton}>
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
      </Link>
      <Text style={styles.title}>Digital content and refunds</Text>
      <View style={styles.card}>
        <Text style={styles.copy}>
          Because access begins immediately, checkout should collect explicit consent for immediate
          digital performance and explain that the withdrawal right may be lost once delivery starts.
        </Text>
        <Text style={styles.copy}>
          Final wording should be reviewed for your launch countries and payment stack. Keep refund
          language plain, visible, and consistent with the hosted checkout flow.
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
