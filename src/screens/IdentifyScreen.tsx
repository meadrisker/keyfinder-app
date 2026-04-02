import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { keysApi, IdentifyResult } from '../services/api';
import KeySvg from '../components/KeySvg';

type State = 'idle' | 'identifying' | 'result';

export default function IdentifyScreen() {
  const navigation          = useNavigation<any>();
  const [state, setState]   = useState<State>('idle');
  const [image, setImage]   = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [error, setError]   = useState<string | null>(null);

  const identify = async (uri: string) => {
    setImage(uri);
    setState('identifying');
    setError(null);
    setResult(null);
    try {
      const { data } = await keysApi.identify(uri);
      setResult(data);
      setState('result');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Something went wrong. Try again.');
      setState('idle');
    }
  };

  const handleTakePhoto = () => {
    navigation.navigate('Camera', { onPhoto: (base64: string) => identify(base64) });
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setState('idle');
  };

  const confidenceColor = (c: number) => {
    if (c >= 75) return '#0f6e56';
    if (c >= 50) return '#b87c0a';
    return '#c0392b';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Identify a key</Text>
      <Text style={styles.subtitle}>Snap a photo of any key to find its name.</Text>

      {state === 'idle' && (
        <View style={styles.actions}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️  {error}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleTakePhoto}>
            <Text style={styles.primaryBtnIcon}>📷</Text>
            <Text style={styles.primaryBtnText}>Take photo</Text>
          </TouchableOpacity>
          <Text style={styles.tip}>Tip: lay the key flat with good lighting for best results.</Text>
        </View>
      )}

      {state === 'identifying' && image && (
        <View style={styles.identifying}>
          <Image source={{ uri: image }} style={styles.preview} />
          <ActivityIndicator size="large" color="#0f6e56" style={{ marginTop: 24 }} />
          <Text style={styles.identifyingText}>Analysing key features…</Text>
          <Text style={styles.identifyingSubtext}>Comparing against your keyring</Text>
        </View>
      )}

      {state === 'result' && result && (
        <View style={styles.result}>
          {result.matched && result.key ? (
            <View style={styles.matchCard}>
              <View style={styles.matchHeader}>
                <Text style={styles.matchIcon}>✅</Text>
                <Text style={styles.matchTitle}>Match found</Text>
              </View>

              <View style={styles.svgRow}>
                <KeySvg svg={result.key.svg_front} size={50} />
              </View>

              <Text style={styles.matchName}>{result.key.name}</Text>

              {result.key.description ? (
                <Text style={styles.matchDesc}>{result.key.description}</Text>
              ) : null}

              <View style={styles.confidenceRow}>
                <Text style={styles.confidenceLabel}>Confidence</Text>
                <Text style={[styles.confidenceValue, { color: confidenceColor(result.confidence) }]}>
                  {result.confidence}%
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.noMatchCard}>
              <Text style={styles.noMatchIcon}>❓</Text>
              <Text style={styles.noMatchTitle}>No match found</Text>
              <Text style={styles.noMatchText}>{result.reason}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.tryAgainBtn} onPress={reset}>
            <Text style={styles.tryAgainText}>Try another key</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#f5f5f0' },
  content:            { padding: 24, gap: 20 },
  title:              { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  subtitle:           { fontSize: 15, color: '#666' },

  actions:            { gap: 12 },
  primaryBtn:         { backgroundColor: '#0f6e56', borderRadius: 12, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  primaryBtnIcon:     { fontSize: 22 },
  primaryBtnText:     { fontSize: 16, fontWeight: '600', color: '#fff' },
  tip:                { fontSize: 13, color: '#999', textAlign: 'center', marginTop: 4 },

  errorBox:           { backgroundColor: '#fdf0ee', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#f0ccc8' },
  errorText:          { fontSize: 14, color: '#c0392b' },

  identifying:        { alignItems: 'center', gap: 8 },
  preview:            { width: '100%', aspectRatio: 4/3, borderRadius: 12, backgroundColor: '#e0e0d8' },
  identifyingText:    { fontSize: 17, fontWeight: '600', color: '#1a1a1a', marginTop: 8 },
  identifyingSubtext: { fontSize: 14, color: '#666' },

  result:             { gap: 16 },
  matchCard:          { backgroundColor: '#fff', borderRadius: 14, padding: 20, gap: 12, borderWidth: 1, borderColor: '#e8e8e0' },
  matchHeader:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  matchIcon:          { fontSize: 20 },
  matchTitle:         { fontSize: 14, color: '#0f6e56', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  svgRow:             { alignItems: 'center', paddingVertical: 8 },
  matchName:          { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  matchDesc:          { fontSize: 14, color: '#666' },
  confidenceRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confidenceLabel:    { fontSize: 14, color: '#666' },
  confidenceValue:    { fontSize: 18, fontWeight: '700' },

  noMatchCard:        { backgroundColor: '#fff', borderRadius: 14, padding: 20, gap: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e8e8e0' },
  noMatchIcon:        { fontSize: 40 },
  noMatchTitle:       { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  noMatchText:        { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },

  tryAgainBtn:        { backgroundColor: '#0f6e56', borderRadius: 12, padding: 16, alignItems: 'center' },
  tryAgainText:       { color: '#fff', fontSize: 16, fontWeight: '600' },
});
