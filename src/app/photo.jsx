import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { subirFoto } from '../api';

export default function PhotoScreen() {

  const { uri } = useLocalSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const enviar = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await subirFoto(uri);

      router.dismissTo('/');
    } catch (e) {
      setError(e.message || 'No se pudo subir la foto.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      <View style={styles.actions}>
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={[styles.primary, busy && styles.disabled]} onPress={enviar} disabled={busy}>
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>{error ? 'Reintentar' : 'Enviar al servidor'}</Text>
          )}
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => router.back()} disabled={busy}>
          <Text style={styles.secondaryText}>Reiniciar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  image: { flex: 1 },
  actions: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
    gap: 12,
  },
  error: {
    color: '#fff',
    backgroundColor: 'rgba(220,38,38,0.9)',
    padding: 10,
    borderRadius: 10,
    textAlign: 'center',
  },
  disabled: { opacity: 0.6 },
  primary: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
  },
  primaryText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  secondary: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
  },
  secondaryText: { fontSize: 16, fontWeight: '700', color: '#000' },
});
