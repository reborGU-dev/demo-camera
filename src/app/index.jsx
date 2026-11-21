import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { listarFotos } from '../api';
import { guardarCopia } from '../storage';

export default function HomeScreen() {
  const [fotos, setFotos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarFotos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setFotos(await listarFotos());
    } catch (e) {
      setError(e.message || 'No se pudo cargar la lista de fotos.');
    } finally {
      setCargando(false);
    }
  }, []);


  useFocusEffect(
    useCallback(() => {
      cargarFotos();
    }, [cargarFotos])
  );


  const elegirDeGaleria = async () => {
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.5, // comprime para no pasar de 5 MB
      });
      if (resultado.canceled) return;
      const uri = await guardarCopia(resultado.assets[0].uri);
      router.push({ pathname: '/photo', params: { uri } });
    } catch (e) {
      Alert.alert('Error', 'No se pudo abrir la foto de la galería.');
    }
  };

  const renderFoto = ({ item }) => (
    <Pressable
      style={styles.item}
      onPress={() => router.push({ pathname: '/view', params: { uri: item.url, id: String(item.id) } })}
    >
      <Image source={{ uri: item.url }} style={styles.thumb} />
      <Text style={styles.date}>
        {item.fecha ? new Date(item.fecha).toLocaleString() : 'Sin fecha'}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Demo de cámara</Text>
      <Text style={styles.subtitle}>Toma una foto y revísala antes de enviarla.</Text>

      <View style={styles.buttons}>
        <Pressable style={styles.button} onPress={() => router.push('/camera')}>
          <Text style={styles.buttonText}>Tomar una foto</Text>
        </Pressable>
        <Pressable style={styles.buttonAlt} onPress={elegirDeGaleria}>
          <Text style={styles.buttonAltText}>Galería</Text>
        </Pressable>
      </View>

      <View style={styles.listArea}>
        {cargando && fotos.length === 0 ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : error ? (
          <View style={styles.centerBox}>
            <Text style={styles.error}>{error}</Text>
            <Pressable style={styles.button} onPress={cargarFotos}>
              <Text style={styles.buttonText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={fotos}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderFoto}
            refreshing={cargando}
            onRefresh={cargarFotos}
            contentContainerStyle={fotos.length === 0 && styles.emptyContainer}
            ListEmptyComponent={<Text style={styles.empty}>Todavía no hay fotos.</Text>}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 72,
    paddingHorizontal: 24,
    gap: 16,
    backgroundColor: '#fff',
  },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 16, color: '#475569', textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  buttonAlt: {
    borderWidth: 2,
    borderColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 28,
  },
  buttonAltText: { color: '#2563eb', fontSize: 16, fontWeight: '700' },
  listArea: { flex: 1, width: '100%' },
  loader: { marginTop: 32 },
  centerBox: { alignItems: 'center', gap: 12, marginTop: 32 },
  error: { color: '#dc2626', textAlign: 'center', fontSize: 15 },
  emptyContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: '#64748b', fontSize: 16, textAlign: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8 },
  thumb: { width: 84, height: 84, borderRadius: 10, backgroundColor: '#e2e8f0' },
  date: { fontSize: 15, color: '#334155', flexShrink: 1 },
});
