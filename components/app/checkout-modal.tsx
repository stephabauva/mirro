import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type Plan = 'single' | 'three' | 'ten' | 'membership';

type Props = {
  visible: boolean;
  selectedPlan: Plan;
  onClose: () => void;
  onConfirm: (email: string) => void;
};

const LABELS: Record<Plan, string> = {
  single: 'One Premium Telling',
  three: 'Three Tellings',
  ten: 'Ten Tellings',
  membership: 'Monthly Membership',
};

export function CheckoutModal({ visible, selectedPlan, onClose, onConfirm }: Props) {
  const [email, setEmail] = useState('');
  const [consentDigital, setConsentDigital] = useState(false);
  const [consentDisclosure, setConsentDisclosure] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setConsentDigital(false);
    setConsentDisclosure(false);
  }, [visible, selectedPlan]);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.kicker}>Checkout</Text>
          <Text style={styles.title}>{LABELS[selectedPlan]}</Text>
          <Text style={styles.body}>
            This MVP ships with a local unlock flow. Replace this modal with Paddle hosted checkout
            for production billing, VAT handling, and subscription lifecycle.
          </Text>

          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email for archive access"
            placeholderTextColor="#8e8a92"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <Pressable onPress={() => setConsentDisclosure((value) => !value)} style={styles.checkboxRow}>
            <View style={[styles.checkbox, consentDisclosure && styles.checkboxActive]} />
            <Text style={styles.checkboxLabel}>
              I understand this is AI-generated entertainment and reflective content, not advice.
            </Text>
          </Pressable>

          <Pressable onPress={() => setConsentDigital((value) => !value)} style={styles.checkboxRow}>
            <View style={[styles.checkbox, consentDigital && styles.checkboxActive]} />
            <Text style={styles.checkboxLabel}>
              I want immediate access to this digital content and understand my withdrawal right may
              end once performance begins.
            </Text>
          </Pressable>

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.secondaryButton}>
              <Text style={styles.secondaryLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={!email || !consentDigital || !consentDisclosure}
              onPress={() => onConfirm(email)}
              style={[
                styles.primaryButton,
                (!email || !consentDigital || !consentDisclosure) && styles.primaryButtonDisabled,
              ]}>
              <Text style={styles.primaryLabel}>Unlock now</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 11, 0.82)',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#13111a',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 24,
    gap: 14,
  },
  kicker: {
    color: '#d97b62',
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8f1e8',
    fontSize: 30,
    lineHeight: 34,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  body: {
    color: '#c9c4bf',
    fontSize: 14,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#1b1721',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#f8f1e8',
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#e7c793',
    borderColor: '#e7c793',
  },
  checkboxLabel: {
    flex: 1,
    color: '#ddd8d2',
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  secondaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  secondaryLabel: {
    color: '#f8f1e8',
    fontSize: 14,
  },
  primaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#f0cf96',
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryLabel: {
    color: '#18110c',
    fontWeight: '700',
    fontSize: 14,
  },
});
