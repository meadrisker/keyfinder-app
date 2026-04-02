import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useKeysStore } from '../hooks/useKeysStore';
import KeySvg from '../components/KeySvg';

type Step = 'photo' | 'name';
type Photos = { front: string; back: string } | null;

export default function AddKeyScreen() {
  const navigation  = useNavigation<any>();
  const { addKey }  = useKeysStore();

  const [step, setStep]               = useState<Step>('photo');
  const [photos, setPhotos]           = useState<Photos>(null);
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving]           = useState(false);

  const handleTakePhotos = () => {
    navigation.navigate('Camera', {
      twoSides: true,
      onPhoto: (result: { front: string; back: string }) => {
        setPhotos(result);
        setStep('name');
      },
    });
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Please give this key a name.'); return; }
    if (!photos)      { Alert.alert('No photos taken.'); return; }
    setSaving(true);
    try {
      await addKey(name.trim(), photos.front, photos.back, description.trim() || undefined);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Save failed', e?.response?.data?.message ?? 'Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.steps}>
          {(['photo', 'name'] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <View style={[styles.stepDot, step === s && styles.stepDotActive, (step === 'name' && s === 'photo') && styles.stepDotDone]}>
                <Text style={styles.stepDotText}>{i + 1}</Text>
              </View>
              {i === 0 && <View style={[styles.stepLine, step === 'name' && styles.stepLineDone]} />}
            </React.Fragment>
          ))}
        </View>

        {step === 'photo' && (
          <View style={styles.section}>
            <Text style={styles.heading}>Photograph the key</Text>
            <Text style={styles.hint}>You'll photograph both sides of the key for best accuracy.</Text>

            <View style={styles.stepsPreview}>
              <View style={styles.stepPreviewItem}>
                <View style={styles.stepPreviewNum}><Text style={styles.stepPreviewNumText}>1</Text></View>
                <Text style={styles.stepPreviewLabel}>Front side</Text>
              </View>
              <View style={styles.stepPreviewArrow}><Text style={styles.stepPreviewArrowText}>→</Text></View>
              <View style={styles.stepPreviewItem}>
                <View style={styles.stepPreviewNum}><Text style={styles.stepPreviewNumText}>2</Text></View>
                <Text style={styles.stepPreviewLabel}>Back side</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.cameraBtn} onPress={handleTakePhotos}>
              <Text style={styles.cameraBtnIcon}>📷</Text>
              <Text style={styles.cameraBtnText}>Start photographing</Text>
            </TouchableOpacity>

            <View style={styles.tipBox}>
              <Text style={styles.tipText}>💡 Lay the key flat on a plain surface · blade pointing right · good lighting</Text>
            </View>
          </View>
        )}

        {step === 'name' && photos && (
          <View style={styles.section}>
            <Text style={styles.heading}>Name this key</Text>

            <View style={styles.svgPair}>
              <View style={styles.svgPairItem}>
                <Text style={styles.svgPairLabel}>Front</Text>
                <KeySvg svg={null} size={80} />
              </View>
              <View style={styles.svgPairItem}>
                <Text style={styles.svgPairLabel}>Back</Text>
                <KeySvg svg={null} size={80} />
              </View>
            </View>

            <TouchableOpacity onPress={() => setStep('photo')}>
              <Text style={styles.retake}>Retake photos</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Key name (e.g. Front door, Shed)"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="next"
            />

            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Notes (optional) — e.g. spare, do not copy"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
            />

            <View style={styles.hint2}>
              <Text style={styles.hintText}>
                🤖 Claude will analyse both photos and generate a key profile. Photos are not stored.
              </Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving
                ? <><ActivityIndicator color="#fff" /><Text style={styles.saveBtnText}>  Analysing key…</Text></>
                : <Text style={styles.saveBtnText}>Save key</Text>
              }
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:                  { flex: 1, backgroundColor: '#f5f5f0' },
  container:             { flexGrow: 1, padding: 24 },
  steps:                 { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  stepDot:               { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e0e0d8', alignItems: 'center', justifyContent: 'center' },
  stepDotActive:         { backgroundColor: '#0f6e56' },
  stepDotDone:           { backgroundColor: '#085041' },
  stepDotText:           { fontSize: 12, fontWeight: '700', color: '#fff' },
  stepLine:              { width: 40, height: 2, backgroundColor: '#e0e0d8', marginHorizontal: 4 },
  stepLineDone:          { backgroundColor: '#085041' },
  section:               { gap: 14 },
  heading:               { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  hint:                  { fontSize: 14, color: '#666', lineHeight: 20 },

  stepsPreview:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e0e0d8', gap: 12 },
  stepPreviewItem:       { alignItems: 'center', gap: 6 },
  stepPreviewNum:        { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e8f5f0', alignItems: 'center', justifyContent: 'center' },
  stepPreviewNumText:    { fontSize: 14, fontWeight: '700', color: '#0f6e56' },
  stepPreviewLabel:      { fontSize: 12, color: '#666' },
  stepPreviewArrow:      { paddingBottom: 16 },
  stepPreviewArrowText:  { fontSize: 20, color: '#ccc' },

  cameraBtn:             { backgroundColor: '#0f6e56', borderRadius: 12, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  cameraBtnIcon:         { fontSize: 22 },
  cameraBtnText:         { fontSize: 16, fontWeight: '600', color: '#fff' },

  tipBox:                { backgroundColor: '#f0f0e8', borderRadius: 10, padding: 12 },
  tipText:               { fontSize: 13, color: '#666', lineHeight: 19 },

  svgPair:               { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  svgPairItem:           { alignItems: 'center', gap: 6 },
  svgPairLabel:          { fontSize: 12, color: '#999', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  retake:                { fontSize: 14, color: '#0f6e56', fontWeight: '600', textAlign: 'center' },
  input:                 { backgroundColor: '#fff', borderRadius: 10, padding: 14, fontSize: 15, color: '#1a1a1a', borderWidth: 1, borderColor: '#e0e0d8' },
  inputMulti:            { minHeight: 72, textAlignVertical: 'top' },
  hint2:                 { backgroundColor: '#e8f5f0', borderRadius: 10, padding: 14 },
  hintText:              { fontSize: 13, color: '#0f6e56', lineHeight: 19 },
  saveBtn:               { backgroundColor: '#0f6e56', borderRadius: 12, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  saveBtnText:           { color: '#fff', fontSize: 16, fontWeight: '600' },
});
