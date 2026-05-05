import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  onConfirm: () => void;
};

export function AgeGateModal({ visible, onConfirm }: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.kicker}>18+ Required</Text>
          <Text style={styles.title}>This oracle is for adults only.</Text>
          <Text style={styles.body}>
            You are about to interact with an AI system that generates symbolic entertainment and
            reflective content. It is not professional advice and not for emergencies.
          </Text>
          <Text style={styles.body}>
            By continuing, you confirm that you are at least 18 and understand you are speaking to
            an AI oracle.
          </Text>
          <Pressable onPress={onConfirm} style={styles.button}>
            <Text style={styles.buttonLabel}>I am 18+ and I understand</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 10, 0.76)',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#120f16',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 24,
    gap: 14,
  },
  kicker: {
    color: '#c8a46f',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    fontSize: 12,
  },
  title: {
    color: '#f8f1e8',
    fontSize: 28,
    lineHeight: 34,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  body: {
    color: '#d5d0ca',
    fontSize: 15,
    lineHeight: 23,
  },
  button: {
    backgroundColor: '#e7c793',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginTop: 4,
  },
  buttonLabel: {
    color: '#1a1310',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
});
