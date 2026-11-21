import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { borrarFoto } from '../api';


export default function ViewScreen() {
  const { uri, id } = useLocalSearchParams();
  const [busy, setBusy] = useState(false);

  const confirmarBorrado = () => {
    Alert.alert('Borrar foto', '¿Seguro que quieres borrar esta foto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await borrarFoto(id);
            router.back(); // el inicio recarga la lista al recuperar el foco
          } catch (e) {
            Alert.alert('Error', e.message || 'No se pudo borrar la foto.');
            setBusy(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      <View style={styles.actions}>
        <Pressable style={[styles.delete, busy && styles.disabled]} onPress={confirmarBorrado} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.deleteText}>Borrar</Text>}
        </Pressable>
        <Pressable style={styles.close} onPress={() => router.back()} disabled={busy}>
          <Text style={styles.closeText}>Cerrar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  image: { flex: 1 },
  actions: { position: 'absolute', bottom: 48, left: 24, right: 24, gap: 12 },
  disabled: { opacity: 0.6 },
  delete: { backgroundColor: '#dc2626', paddingVertical: 14, borderRadius: 28, alignItems: 'center' },
  deleteText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  close: { backgroundColor: '#fff', paddingVertical: 14, borderRadius: 28, alignItems: 'center' },
  closeText: { fontSize: 16, fontWeight: '700', color: '#000' },
});
