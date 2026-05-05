import React, { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientStage } from '@/components/app/ambient-stage';

type Props = PropsWithChildren<{
  accent: string;
  glow: string;
  scroll?: boolean;
}>;

export function ScreenFrame({ accent, glow, scroll = true, children }: Props) {
  const content = (
    <View style={styles.inner}>
      <View style={styles.maxWidth}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AmbientStage accent={accent} glow={glow} />
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>{content}</ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090b12',
  },
  scrollContent: {
    paddingBottom: 48,
  },
  inner: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  maxWidth: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
  },
});
