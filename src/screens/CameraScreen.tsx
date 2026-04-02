import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Two vertical lines — key sits between them, bow at top, blade/cuts at bottom
const GUIDE_LEFT  = SCREEN_W * 0.25;
const GUIDE_RIGHT = SCREEN_W * 0.75;
const GUIDE_TOP   = SCREEN_H * 0.12;
const GUIDE_BOT   = SCREEN_H * 0.82;
const LINE_W      = 2;
const TICK_H      = 20;
const LINE_COLOR  = '#0f6e56';

type Side = 'front' | 'back';

export default function CameraScreen() {
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const onPhoto    = route.params?.onPhoto;
  const twoSides   = route.params?.twoSides ?? false;

  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing]       = useState(false);
  const [side, setSide]                 = useState<Side>('front');
  const [frontPhoto, setFrontPhoto]     = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.85 });
      if (!photo?.base64) return;
      const base64 = `data:image/jpeg;base64,${photo.base64}`;

      if (twoSides && side === 'front') {
        setFrontPhoto(base64);
        setSide('back');
      } else if (twoSides && side === 'back') {
        navigation.goBack();
        onPhoto?.({ front: frontPhoto, back: base64 });
      } else {
        navigation.goBack();
        onPhoto?.(base64);
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

  const sideLabel = twoSides
    ? (side === 'front' ? 'Photo 1 of 2  ·  front side' : 'Photo 2 of 2  ·  flip key over')
    : 'Align key between the lines';

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      {/* Guide overlay */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">

        {/* Left vertical line */}
        <View style={[styles.guideLine, { left: GUIDE_LEFT }]}>
          <View style={styles.tickTop} />
          <View style={styles.lineBody} />
          <View style={styles.tickBottom} />
        </View>

        {/* Right vertical line */}
        <View style={[styles.guideLine, { left: GUIDE_RIGHT }]}>
          <View style={styles.tickTop} />
          <View style={styles.lineBody} />
          <View style={styles.tickBottom} />
        </View>

        {/* Top label */}
        <View style={[styles.zoneTag, { top: GUIDE_TOP + 10 }]}>
          <Text style={styles.zoneTagText}>bow</Text>
        </View>

        {/* Bottom label */}
        <View style={[styles.zoneTag, { top: GUIDE_BOT - 28 }]}>
          <Text style={styles.zoneTagText}>blade / cuts</Text>
        </View>

      </View>

      {/* Instructions */}
      <View style={styles.instructionBox} pointerEvents="none">
        <Text style={styles.instructionText}>{sideLabel}</Text>
        <Text style={styles.instructionSub}>Bow at top · cuts at bottom · key centred</Text>
      </View>

      {/* Step dots */}
      {twoSides && (
        <View style={styles.stepDots} pointerEvents="none">
          <View style={[styles.dot, side === 'front' && styles.dotActive]} />
          <View style={[styles.dot, side === 'back'  && styles.dotActive]} />
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shutterBtn} onPress={handleCapture} disabled={capturing}>
          {capturing
            ? <ActivityIndicator color="#fff" />
            : <View style={styles.shutterInner} />
          }
        </TouchableOpacity>
        <View style={{ width: 70 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#000' },
  camera:          { flex: 1 },

  guideLine:       {
    position: 'absolute',
    top: GUIDE_TOP,
    bottom: SCREEN_H - GUIDE_BOT,
    width: LINE_W,
    alignItems: 'center',
    flexDirection: 'column',
  },
  tickTop:         { width: TICK_H, height: LINE_W, backgroundColor: LINE_COLOR },
  tickBottom:      { width: TICK_H, height: LINE_W, backgroundColor: LINE_COLOR },
  lineBody:        { flex: 1, width: LINE_W, backgroundColor: LINE_COLOR },

  zoneTag:         { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  zoneTagText:     { color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },

  instructionBox:  { position: 'absolute', top: 52, left: 0, right: 0, alignItems: 'center', gap: 4 },
  instructionText: { color: '#fff', fontSize: 15, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  instructionSub:  { color: 'rgba(255,255,255,0.65)', fontSize: 12, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },

  stepDots:        { position: 'absolute', bottom: 130, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot:             { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive:       { backgroundColor: '#0f6e56' },

  controls:        { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30 },
  shutterBtn:      { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  shutterInner:    { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' },
  cancelBtn:       { width: 70, alignItems: 'center' },
  cancelText:      { color: '#fff', fontSize: 16 },
  permText:        { color: '#fff', textAlign: 'center', margin: 24, fontSize: 16 },
  permBtn:         { backgroundColor: '#0f6e56', padding: 14, borderRadius: 10, marginHorizontal: 40, alignItems: 'center' },
  permBtnText:     { color: '#fff', fontSize: 16, fontWeight: '600' },
});
