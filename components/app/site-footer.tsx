import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DISCLOSURE } from '@/lib/app-data';

export function SiteFooter() {
  return (
    <View style={styles.footer}>
      <Text style={styles.copy}>{DISCLOSURE}</Text>
      <View style={styles.links}>
        <Link href="/archive" asChild>
          <Pressable>
            <Text style={styles.link}>Archive</Text>
          </Pressable>
        </Link>
        <Link href="/settings" asChild>
          <Pressable>
            <Text style={styles.link}>Settings</Text>
          </Pressable>
        </Link>
        <Link href="/legal/privacy" asChild>
          <Pressable>
            <Text style={styles.link}>Privacy</Text>
          </Pressable>
        </Link>
        <Link href="/legal/terms" asChild>
          <Pressable>
            <Text style={styles.link}>Terms</Text>
          </Pressable>
        </Link>
        <Link href="/legal/refunds" asChild>
          <Pressable>
            <Text style={styles.link}>Refunds</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 20,
    gap: 14,
  },
  copy: {
    color: '#9f99a7',
    fontSize: 13,
    lineHeight: 20,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  link: {
    color: '#e8cfaa',
    fontSize: 14,
  },
});
