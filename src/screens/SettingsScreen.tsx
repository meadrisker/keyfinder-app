import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, Clipboard,
} from 'react-native';
import { useAuthStore } from '../hooks/useAuthStore';
import { useKeysStore } from '../hooks/useKeysStore';

export default function SettingsScreen() {
  const { device, household, logout, refreshInvite } = useAuthStore();
  const { total } = useKeysStore();
  const [inviteCode, setInviteCode]   = useState<string | null>(null);
  const [generating, setGenerating]   = useState(false);

  const handleGenerateInvite = async () => {
    setGenerating(true);
    try {
      const code = await refreshInvite();
      setInviteCode(code);
    } catch {
      Alert.alert('Error', 'Could not generate invite code. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (inviteCode) {
      Clipboard.setString(inviteCode);
      Alert.alert('Copied!', 'Invite code copied to clipboard.');
    }
  };

  const confirmLogout = () => {
    Alert.alert('Remove this device', 'This device will be removed from the household. Keys will remain.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Device card */}
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{device?.device_name?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{device?.device_name}</Text>
          <Text style={styles.sub}>{household?.name} · {household?.device_count} device{household?.device_count !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{total}</Text>
          <Text style={styles.statLabel}>Keys in household</Text>
        </View>
      </View>

      {/* Invite section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Add another device</Text>
        <View style={styles.inviteBody}>
          <Text style={styles.inviteDesc}>
            Generate a one-time code and enter it on the other device to share this household's keys.
          </Text>

          {inviteCode ? (
            <TouchableOpacity style={styles.codeBox} onPress={handleCopyCode}>
              <Text style={styles.code}>{inviteCode}</Text>
              <Text style={styles.codeTap}>Tap to copy · Single use</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.inviteBtn, generating && styles.inviteBtnDisabled]}
            onPress={handleGenerateInvite}
            disabled={generating}
          >
            {generating
              ? <ActivityIndicator color="#0f6e56" />
              : <Text style={styles.inviteBtnText}>{inviteCode ? 'Generate new code' : 'Generate invite code'}</Text>
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Device</Text>
        <TouchableOpacity style={styles.row} onPress={confirmLogout}>
          <Text style={styles.rowTextDanger}>Remove this device</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Keyring · meadriskersoftware.com</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f5f5f0', padding: 20, gap: 16 },

  card:            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 14, borderWidth: 1, borderColor: '#e8e8e0' },
  avatar:          { width: 52, height: 52, borderRadius: 26, backgroundColor: '#0f6e56', alignItems: 'center', justifyContent: 'center' },
  avatarText:      { fontSize: 22, fontWeight: '700', color: '#fff' },
  info:            { gap: 3 },
  name:            { fontSize: 17, fontWeight: '600', color: '#1a1a1a' },
  sub:             { fontSize: 13, color: '#666' },

  statsCard:       { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e8e8e0' },
  stat:            { alignItems: 'center' },
  statValue:       { fontSize: 32, fontWeight: '700', color: '#0f6e56' },
  statLabel:       { fontSize: 14, color: '#666', marginTop: 2 },

  section:         { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#e8e8e0' },
  sectionLabel:    { fontSize: 12, fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, padding: 12, paddingBottom: 4 },

  inviteBody:      { padding: 12, paddingTop: 6, gap: 12 },
  inviteDesc:      { fontSize: 14, color: '#666', lineHeight: 20 },
  codeBox:         { backgroundColor: '#e8f5f0', borderRadius: 10, padding: 16, alignItems: 'center', gap: 4 },
  code:            { fontSize: 32, fontWeight: '700', color: '#0f6e56', letterSpacing: 8 },
  codeTap:         { fontSize: 12, color: '#0f6e56', opacity: 0.7 },
  inviteBtn:       { backgroundColor: '#f0f0e8', borderRadius: 10, padding: 14, alignItems: 'center' },
  inviteBtnDisabled: { opacity: 0.5 },
  inviteBtnText:   { fontSize: 15, fontWeight: '600', color: '#0f6e56' },

  row:             { paddingHorizontal: 12, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#f0f0e8' },
  rowTextDanger:   { fontSize: 15, color: '#c0392b', fontWeight: '500' },

  version:         { textAlign: 'center', fontSize: 12, color: '#bbb', marginTop: 'auto', paddingBottom: 8 },
});
