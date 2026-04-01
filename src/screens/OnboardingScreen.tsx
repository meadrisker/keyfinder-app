import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuthStore } from '../hooks/useAuthStore';

type Mode = 'new' | 'join';

export default function OnboardingScreen() {
  const [mode, setMode]           = useState<Mode>('new');
  const [deviceName, setDeviceName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading]     = useState(false);

  const { register, join } = useAuthStore();

  const handleStart = async () => {
    if (!deviceName.trim()) {
      Alert.alert('Give your device a name', 'e.g. Mark\'s Phone, Kitchen Tablet');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'new') {
        await register(deviceName.trim());
      } else {
        if (!inviteCode.trim() || inviteCode.trim().length !== 6) {
          Alert.alert('Enter the 6-character invite code from the other device.');
          setLoading(false);
          return;
        }
        await join(deviceName.trim(), inviteCode.trim().toUpperCase());
      }
    } catch (e: any) {

  const msg = e?.response?.data?.message ?? 'Something went wrong. Try again.';
  Alert.alert('Error', JSON.stringify(e?.response?.data ?? e?.message ?? e));


    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>🔑</Text>
        <Text style={styles.title}>Keyring</Text>
        <Text style={styles.subtitle}>Your household key manager</Text>

        {/* Mode toggle */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, mode === 'new' && styles.tabActive]}
            onPress={() => setMode('new')}
          >
            <Text style={[styles.tabText, mode === 'new' && styles.tabTextActive]}>New household</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'join' && styles.tabActive]}
            onPress={() => setMode('join')}
          >
            <Text style={[styles.tabText, mode === 'join' && styles.tabTextActive]}>Join existing</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {/* Device name — always shown */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Your device name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mark's Phone"
              placeholderTextColor="#999"
              value={deviceName}
              onChangeText={setDeviceName}
              autoFocus
              returnKeyType={mode === 'new' ? 'done' : 'next'}
            />
            <Text style={styles.hint}>Helps identify who added each key.</Text>
          </View>

          {/* Invite code — only for join mode */}
          {mode === 'join' && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Invite code</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="ABC123"
                placeholderTextColor="#999"
                value={inviteCode}
                onChangeText={(t) => setInviteCode(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={6}
                returnKeyType="done"
              />
              <Text style={styles.hint}>Get this from Settings on the other device.</Text>
            </View>
          )}

          {mode === 'new' && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                🏠  A new household will be created for this device.{'\n\n'}
                You can invite other devices to join later from Settings.
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.btn} onPress={handleStart} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>{mode === 'new' ? 'Get started' : 'Join household'}</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:         { flex: 1, backgroundColor: '#f5f5f0' },
  container:    { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo:         { fontSize: 56, marginBottom: 8 },
  title:        { fontSize: 28, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  subtitle:     { fontSize: 15, color: '#666', marginBottom: 32 },

  tabs:         { flexDirection: 'row', backgroundColor: '#e8e8e0', borderRadius: 10, padding: 3, marginBottom: 24, width: '100%' },
  tab:          { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive:    { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText:      { fontSize: 13, color: '#666', fontWeight: '500' },
  tabTextActive:{ color: '#0f6e56', fontWeight: '600' },

  form:         { width: '100%', gap: 16 },
  fieldGroup:   { gap: 6 },
  label:        { fontSize: 13, fontWeight: '600', color: '#444', textTransform: 'uppercase', letterSpacing: 0.5 },
  input:        { backgroundColor: '#fff', borderRadius: 10, padding: 14, fontSize: 15, color: '#1a1a1a', borderWidth: 1, borderColor: '#e0e0d8' },
  codeInput:    { fontSize: 22, fontWeight: '700', letterSpacing: 6, textAlign: 'center' },
  hint:         { fontSize: 12, color: '#999' },

  infoBox:      { backgroundColor: '#e8f5f0', borderRadius: 10, padding: 16 },
  infoText:     { fontSize: 14, color: '#0f6e56', lineHeight: 20 },

  btn:          { backgroundColor: '#0f6e56', borderRadius: 10, padding: 16, alignItems: 'center' },
  btnText:      { color: '#fff', fontSize: 16, fontWeight: '600' },
});
