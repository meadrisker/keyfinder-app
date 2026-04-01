import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function CameraScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const onPhoto = route.params?.onPhoto;

  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 });
      if (photo?.base64) {
        navigation.goBack();
        onPhoto?.(`data:image/jpeg;base64,${photo.base64}`);
      }
    } catch (e: any) {
      console.log('Capture error:', e?.message);
    } finally {
      setCapturing(false);
    }
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permText}>Camera access is needed to photograph keys.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shutterBtn} onPress={handleCapture} disabled={capturing}>
          {capturing ? <ActivityIndicator color="#fff" /> : <View style={styles.shutterInner} />}
        </TouchableOpacity>
        <View style={{ width: 70 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#000' },
  camera:       { flex: 1 },
  controls:     { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30 },
  shutterBtn:   { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  shutterInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' },
  cancelBtn:    { width: 70, alignItems: 'center' },
  cancelText:   { color: '#fff', fontSize: 16 },
  permText:     { color: '#fff', textAlign: 'center', margin: 24, fontSize: 16 },
  permBtn:      { backgroundColor: '#0f6e56', padding: 14, borderRadius: 10, marginHorizontal: 40, alignItems: 'center' },
  permBtnText:  { color: '#fff', fontSize: 16, fontWeight: '600' },
});
