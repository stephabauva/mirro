import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenFrame } from '@/components/app/screen-frame';

export default function NotFoundScreen() {
  return (
    <ScreenFrame accent="#d5b583" glow="rgba(214, 173, 106, 0.14)" scroll={false}>
      <View style={styles.container}>
        <Text style={styles.title}>The archive cannot find that page.</Text>
        <Link href="/" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonLabel}>Return to the foyer</Text>
          </Pressable>
        </Link>
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    color: '#f8f1e8',
    fontSize: 34,
    lineHeight: 38,
    textAlign: 'center',
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#f0cf96',
  },
  buttonLabel: {
    color: '#18110c',
    fontWeight: '700',
  },
});
