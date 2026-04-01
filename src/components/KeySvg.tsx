import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  svg: string | null;
  size?: number;
}

export default function KeySvg({ svg, size = 56 }: Props) {
  if (!svg) {
    return (
      <View style={[styles.placeholder, { width: size, height: size }]}>
        <Text style={styles.icon}>🔑</Text>
      </View>
    );
  }

  const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;background:transparent}html,body{width:100%;height:100%;display:flex;align-items:center;justify-content:center}svg{width:100%;height:100%}</style></head><body>${svg}</body></html>`;

  return (
    <View style={{ width: size, height: Math.round(size * 0.5), borderRadius: 6, overflow: 'hidden' }}>
      <WebView
        source={{ html }}
        style={{ backgroundColor: 'transparent', flex: 1 }}
        scrollEnabled={false}
        pointerEvents="none"
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { borderRadius: 8, backgroundColor: '#f0f0e8', alignItems: 'center', justifyContent: 'center' },
  icon:        { fontSize: 24 },
});
