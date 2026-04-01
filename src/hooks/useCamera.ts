import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

async function uriToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result); // already data:image/jpeg;base64,...
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function useCamera() {
  const takePhoto = async (): Promise<string | null> => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Camera access needed', 'Please allow camera access in Settings.');
        return null;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });
      if (result.canceled || !result.assets?.[0]) return null;
      const asset = result.assets[0];
      if (asset.base64) return `data:image/jpeg;base64,${asset.base64}`;
      return await uriToBase64(asset.uri);
    } catch (e: any) {
      Alert.alert('Camera error', e?.message ?? 'Could not capture photo.');
      return null;
    }
  };

  const pickFromLibrary = async (): Promise<string | null> => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Photo access needed', 'Please allow photo library access in Settings.');
        return null;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });
      if (result.canceled || !result.assets?.[0]) return null;
      const asset = result.assets[0];
      if (asset.base64) return `data:image/jpeg;base64,${asset.base64}`;
      return await uriToBase64(asset.uri);
    } catch (e: any) {
      Alert.alert('Library error', e?.message ?? 'Could not load photo.');
      return null;
    }
  };

  return { takePhoto, pickFromLibrary };
}
