import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCamera } from '../hooks/useCamera';
import { useKeysStore } from '../hooks/useKeysStore';

type Step = 'photo' | 'name';

export default function AddKeyScreen() {
  const navigation              = useNavigation<any>();
  const { pickFromLibrary }     = useCamera();
  const { addKey }              = useKeysStore();

  const [step, setStep]             = useState<Step>('photo');
  const [image, setImage]           = useState<string | null>(null);
  const [name, setName]             = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving]         = useState(false);

  const handleTakePhoto = () => {
    navigation.navigate('Camera', {
      onPhoto: (base64: string) => {
        setImage(base64);
        setStep('name');
      },
    });
  };

  const handlePickPhoto = async () => {
    const uri = await pickFromLibrary();
    if (uri) { setImage(uri); setStep('name'); }
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Please give this key a name.'); return; }
    if (!image)       { Alert.alert('No photo selected.'); return; }
    setSaving(true);
    try {
      await addKey(name.trim(), image, description.trim() || undefined);
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
            <Text style={styles.heading}>Take a photo of the key</Text>
            <Text style={styles.hint}>Lay the key flat on a plain surface with good lighting for best results.</Text>

            <TouchableOpacity style={styles.cameraBtn} onPress={handleTakePhoto}>
              <Text style={styles.cameraBtnIcon}>📷</Text>
              <Text style={styles.cameraBtnText}>Take photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.cameraBtn, styles.cameraBtnSecondary]} onPress={handlePickPhoto}>
              <Text style={styles.cameraBtnIcon}>🖼️</Text>
              <Text style={styles.cameraBtnTextSecondary}>Choose from library</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'name' && image && (
          <View style={styles.section}>
            <Text style={styles.heading}>Name this key</Text>

            <Image source={{ uri: image }} style={styles.preview} />

            <TouchableOpacity onPress={() => setStep('photo')}>
              <Text style={styles.retake}>Retake photo</Text>
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
                🤖 Claude will analyse the photo to generate a feature description. The photo itself won't be stored.
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
  steps:                 { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32, gap: 0 },
  stepDot:               { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e0e0d8', alignItems: 'center', justifyContent: 'center' },
  stepDotActive:         { backgroundColor: '#0f6e56' },
  stepDotDone:           { backgroundColor: '#085041' },
  stepDotText:           { fontSize: 12, fontWeight: '700', color: '#fff' },
  stepLine:              { flex: 0, width: 40, height: 2, backgroundColor: '#e0e0d8', marginHorizontal: 4 },
  stepLineDone:          { backgroundColor: '#085041' },
  section:               { gap: 14 },
  heading:               { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  hint:                  { fontSize: 14, color: '#666', lineHeight: 20 },
  cameraBtn:             { backgroundColor: '#0f6e56', borderRadius: 12, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  cameraBtnSecondary:    { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0d8' },
  cameraBtnIcon:         { fontSize: 22 },
  cameraBtnText:         { fontSize: 16, fontWeight: '600', color: '#fff' },
  cameraBtnTextSecondary:{ fontSize: 16, fontWeight: '600', color: '#333' },
  preview:               { width: '100%', aspectRatio: 4/3, borderRadius: 12, backgroundColor: '#e0e0d8' },
  retake:                { fontSize: 14, color: '#0f6e56', fontWeight: '600', textAlign: 'center' },
  input:                 { backgroundColor: '#fff', borderRadius: 10, padding: 14, fontSize: 15, color: '#1a1a1a', borderWidth: 1, borderColor: '#e0e0d8' },
  inputMulti:            { minHeight: 72, textAlignVertical: 'top' },
  hint2:                 { backgroundColor: '#e8f5f0', borderRadius: 10, padding: 14 },
  hintText:              { fontSize: 13, color: '#0f6e56', lineHeight: 19 },
  saveBtn:               { backgroundColor: '#0f6e56', borderRadius: 12, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  saveBtnText:           { color: '#fff', fontSize: 16, fontWeight: '600' },
});
