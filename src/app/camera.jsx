import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { guardarCopia } from '../storage';

export default function CameraScreen() {
  const [facing, setFacing] = useState('back');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const cameraRef = useRef(null);


  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') getPermission();
    });
    return () => sub.remove();
  }, [getPermission]);

  if (!permission) {
    return <View style={styles.center} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Necesitamos acceso a la cámara para tomar fotos.</Text>
        <Text style={styles.hint}>
          La cámara se usa únicamente para tomar las fotos que tú decidas subir al servidor.
        </Text>
        {permission.canAskAgain ? (
          <Pressable style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Dar permiso</Text>
          </Pressable>
        ) : (
          <>
            <Text style={styles.hint}>
              El permiso fue denegado. Actívalo en los ajustes para poder continuar.
            </Text>
            <Pressable style={styles.button} onPress={() => Linking.openSettings()}>
              <Text style={styles.buttonText}>Abrir ajustes</Text>
            </Pressable>
          </>
        )}
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const toggleFacing = () => {
    setReady(false);
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const takePhoto = async () => {
    if (!ready || busy) return;
    setBusy(true);
    try {

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });

      const uri = await guardarCopia(photo.uri);
      router.push({ pathname: '/photo', params: { uri } });
    } catch (e) {
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        onCameraReady={() => setReady(true)}
      />
      <View style={styles.controls}>
        <View style={styles.side} />
        <Pressable
          style={[styles.shutter, (!ready || busy) && styles.disabled]}
          onPress={takePhoto}
          disabled={!ready || busy}
          accessibilityLabel="Tomar foto"
        >
          {busy ? <ActivityIndicator color="#000" /> : <View style={styles.shutterInner} />}
        </Pressable>
        <View style={styles.side}>
          <Pressable style={styles.flip} onPress={toggleFacing} accessibilityLabel="Cambiar cámara">
            <Text style={styles.flipText}>Voltear</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#fff',
  },
  message: { fontSize: 16, textAlign: 'center' },
  hint: { fontSize: 14, textAlign: 'center', color: '#475569' },
  link: { fontSize: 16, color: '#2563eb', fontWeight: '600' },
  button: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  side: { flex: 1, alignItems: 'flex-end' },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' },
  disabled: { opacity: 0.5 },
  flip: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  flipText: { color: '#fff', fontWeight: '600' },
});
