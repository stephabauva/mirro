import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeGalaxyBackdrop } from '@/components/app/home-galaxy-backdrop';
import { getPersona } from '@/lib/oracle/personas';

const HOME_ORDER = ['terminal', 'cabinet', 'clerk'] as const;

const HOME_CARD_COPY = {
  clerk: {
    code: 'BUREAU 12',
    eyebrow: 'ARCHIVE STATUS: OPEN',
    body:
      'Dry, meticulous records of the mundane. Parchment, ink stains, and the subtle art of finding logic in the chaos.',
    meta: 'TYPE: OFFICIAL   |   LOG: BRASS-X',
    action: 'FILE A REQUEST',
    gradient: ['rgba(243, 210, 140, 0.82)', 'rgba(228, 188, 112, 0.76)', 'rgba(247, 231, 196, 0.84)'],
  },
  cabinet: {
    code: 'CABINET 09',
    eyebrow: 'ACCESS RESTRICTED',
    body:
      'Intimate and unnerving. Secrets kept in the shadows of the void, bound by iron and glass.',
    meta: 'DEPTH: 400M   |   STATIC: LOW',
    action: 'OPEN THE CABINET',
    gradient: ['rgba(23, 25, 26, 0.6)', 'rgba(13, 13, 15, 0.66)', 'rgba(32, 36, 37, 0.6)'],
  },
  terminal: {
    code: 'TERMINAL 01',
    eyebrow: 'STATUS: ACTIVE',
    body:
      'Decipher the celestial alignment of stars and weather patterns. An ancient platform where starlight meets prophecy, rendered in cobalt, cold silver, and blue tones.',
    meta: 'ELEVATION: HIGH   |   SIGNAL: STABLE',
    action: 'CONSULT THE STARS',
    gradient: ['rgba(27, 32, 33, 0.6)', 'rgba(14, 17, 18, 0.66)', 'rgba(32, 39, 38, 0.6)'],
  },
} as const;

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 1120;

  return (
    <SafeAreaView style={styles.safeArea}>
      <HomeGalaxyBackdrop />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.foyer, isCompact && styles.foyerCompact]}>
          {HOME_ORDER.map((personaId) => {
            const persona = getPersona(personaId);
            const copy = HOME_CARD_COPY[personaId];

            return (
              <Link
                key={persona.id}
                href={{ pathname: '/oracle/[persona]', params: { persona: persona.id } }}
                asChild>
                <Pressable style={styles.cardLink}>
                  <LinearGradient colors={copy.gradient} style={styles.cardShell}>
                    <View
                      pointerEvents="none"
                      style={[
                        styles.cardTexture,
                        persona.id === 'terminal' && styles.terminalTexture,
                        persona.id === 'cabinet' && styles.cabinetTexture,
                        persona.id === 'clerk' && styles.clerkTexture,
                      ]}
                    />
                    <View
                      pointerEvents="none"
                      style={[
                        styles.cardGlow,
                        persona.id === 'terminal' && styles.terminalGlow,
                        persona.id === 'cabinet' && styles.cabinetGlow,
                        persona.id === 'clerk' && styles.clerkGlow,
                      ]}
                    />

                    <View style={styles.cardTop}>
                      <Text
                        style={[
                          styles.cardCode,
                          persona.id === 'clerk' && styles.cardCodeDark,
                        ]}>
                        {copy.code}
                      </Text>
                      <Text
                        style={[
                          styles.cardEyebrow,
                          persona.id === 'clerk' && styles.cardEyebrowDark,
                        ]}>
                        {copy.eyebrow}
                      </Text>
                    </View>

                    <View style={styles.cardContent}>
                      <Text
                        style={[
                          styles.cardTitle,
                          persona.id === 'clerk' && styles.cardTitleDark,
                        ]}>
                        {persona.title}
                      </Text>
                      <Text
                        style={[
                          styles.cardBody,
                          persona.id === 'clerk' && styles.cardBodyDark,
                        ]}>
                        {copy.body}
                      </Text>
                    </View>

                    <View style={styles.cardFooter}>
                      <Text
                        style={[
                          styles.cardMeta,
                          persona.id === 'clerk' && styles.cardMetaDark,
                        ]}>
                        {copy.meta}
                      </Text>
                      <View
                        style={[
                          styles.cardButton,
                          persona.id === 'terminal' && styles.terminalButton,
                          persona.id === 'cabinet' && styles.cabinetButton,
                          persona.id === 'clerk' && styles.clerkButton,
                        ]}>
                        <Text
                          style={[
                            styles.cardButtonLabel,
                            persona.id === 'clerk' && styles.cardButtonLabelDark,
                          ]}>
                          {copy.action}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </Pressable>
              </Link>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#03050a',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  foyer: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'center',
  },
  foyerCompact: {
    flexWrap: 'wrap',
  },
  cardLink: {
    flexGrow: 1,
    flexBasis: 320,
    maxWidth: 390,
  },
  cardShell: {
    minHeight: 566,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 16,
    justifyContent: 'space-between',
  },
  cardTexture: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  terminalTexture: {
    backgroundColor: 'rgba(205, 242, 255, 0.045)',
    borderColor: 'rgba(168, 214, 207, 0.12)',
    borderWidth: 1,
  },
  cabinetTexture: {
    backgroundColor: 'rgba(255,255,255,0.028)',
  },
  clerkTexture: {
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  cardGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    opacity: 0.36,
  },
  terminalGlow: {
    left: 38,
    top: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(202, 233, 255, 0.12)',
  },
  cabinetGlow: {
    right: -32,
    top: 24,
    backgroundColor: 'rgba(71, 53, 53, 0.22)',
  },
  clerkGlow: {
    right: 28,
    bottom: 84,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  cardTop: {
    gap: 6,
    zIndex: 1,
  },
  cardCode: {
    color: '#dde5e8',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.9,
    textTransform: 'uppercase',
  },
  cardCodeDark: {
    color: '#5e4620',
  },
  cardEyebrow: {
    color: '#a8afb2',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  cardEyebrowDark: {
    color: '#6a5428',
  },
  cardContent: {
    gap: 18,
    zIndex: 1,
  },
  cardTitle: {
    color: '#eef0ea',
    fontSize: 22,
    lineHeight: 28,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  cardTitleDark: {
    color: '#292010',
  },
  cardBody: {
    color: '#c6cccf',
    fontSize: 15,
    lineHeight: 24,
  },
  cardBodyDark: {
    color: '#4d3d1f',
  },
  cardFooter: {
    gap: 14,
    zIndex: 1,
  },
  cardMeta: {
    color: '#798287',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  cardMetaDark: {
    color: '#6a5528',
  },
  cardButton: {
    minHeight: 50,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  terminalButton: {
    borderColor: 'rgba(188, 212, 214, 0.4)',
    backgroundColor: 'rgba(18, 24, 25, 0.9)',
  },
  cabinetButton: {
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(212, 213, 214, 0.94)',
  },
  clerkButton: {
    borderColor: 'rgba(51, 36, 12, 0.18)',
    backgroundColor: 'rgba(56, 40, 12, 0.95)',
  },
  cardButtonLabel: {
    color: '#f5f6f7',
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  cardButtonLabelDark: {
    color: '#f6eccd',
  },
});
