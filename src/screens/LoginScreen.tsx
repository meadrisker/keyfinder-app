import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView, Linking,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '../hooks/useAuthStore';
import { authApi } from '../services/api';

WebBrowser.maybeCompleteAuthSession();

type Mode = 'password' | 'magic' | 'google';

export default function LoginScreen() {
  const [mode, setMode]           = useState<Mode>('password');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const { loginWithPassword, loginWithToken, sendMagicLink } = useAuthStore();

  const handlePasswordLogin = async () => {
    if (!email || !password) { Alert.alert('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      await loginWithPassword(email, password);
    } catch (e: any) {
      Alert.alert('Login failed', e?.response?.data?.message ?? 'Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) { Alert.alert('Please enter your email address.'); return; }
    setLoading(true);
    try {
      await sendMagicLink(email);
      setMagicSent(true);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Could not send magic link.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const redirectUrl = 'keyring://auth/callback';
      const googleUrl   = authApi.googleRedirect();
      const result      = await WebBrowser.openAuthSessionAsync(googleUrl, redirectUrl);
      if (result.type === 'success' && result.url) {
        const match = result.url.match(/[?&]token=([^&]+)/);
        if (match) {
          await loginWithToken(decodeURIComponent(match[1]));
        } else {
          Alert.alert('Google sign-in failed', 'No token returned.');
        }
      }
    } catch (e: any) {
      Alert.alert('Google sign-in failed', e?.message ?? 'Unknown error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>🔑</Text>
        <Text style={styles.title}>Keyring</Text>
        <Text style={styles.subtitle}>Your household key manager</Text>

        <View style={styles.tabs}>
          {(['password', 'magic', 'google'] as Mode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.tab, mode === m && styles.tabActive]}
              onPress={() => { setMode(m); setMagicSent(false); }}
            >
              <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                {m === 'password' ? 'Password' : m === 'magic' ? 'Magic link' : 'Google'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {mode === 'password' && (
          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#888"
              keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#888"
              secureTextEntry value={password} onChangeText={setPassword} />
            <TouchableOpacity style={styles.btn} onPress={handlePasswordLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign in</Text>}
            </TouchableOpacity>
          </View>
        )}

        {mode === 'magic' && (
          <View style={styles.form}>
            {magicSent ? (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>✉️  Check your email — tap the link to sign in.{'\n\n'}The link expires in 15 minutes.</Text>
                <TouchableOpacity onPress={() => setMagicSent(false)}>
                  <Text style={styles.link}>Send again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#888"
                  keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
                <TouchableOpacity style={styles.btn} onPress={handleMagicLink} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send magic link</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {mode === 'google' && (
          <View style={styles.form}>
            <TouchableOpacity style={[styles.btn, styles.btnGoogle]} onPress={handleGoogle} disabled={loading}>
              {loading ? <ActivityIndicator color="#333" /> : <Text style={styles.btnTextGoogle}>Continue with Google</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:          { flex: 1, backgroundColor: '#f5f5f0' },
  container:     { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo:          { fontSize: 56, marginBottom: 8 },
  title:         { fontSize: 28, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  subtitle:      { fontSize: 15, color: '#666', marginBottom: 32 },
  tabs:          { flexDirection: 'row', backgroundColor: '#e8e8e0', borderRadius: 10, padding: 3, marginBottom: 24, width: '100%' },
  tab:           { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive:     { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText:       { fontSize: 13, color: '#666', fontWeight: '500' },
  tabTextActive: { color: '#0f6e56', fontWeight: '600' },
  form:          { width: '100%', gap: 12 },
  input:         { backgroundColor: '#fff', borderRadius: 10, padding: 14, fontSize: 15, color: '#1a1a1a', borderWidth: 1, borderColor: '#e0e0d8' },
  btn:           { backgroundColor: '#0f6e56', borderRadius: 10, padding: 15, alignItems: 'center' },
  btnText:       { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnGoogle:     { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0d8' },
  btnTextGoogle: { color: '#333', fontSize: 15, fontWeight: '600' },
  infoBox:       { backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#e0e0d8' },
  infoText:      { fontSize: 15, color: '#444', textAlign: 'center', lineHeight: 22 },
  link:          { color: '#0f6e56', fontWeight: '600', fontSize: 14 },
});
