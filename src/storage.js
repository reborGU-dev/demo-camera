import { File, Paths } from 'expo-file-system';


export async function guardarCopia(uriTemporal) {
  const origen = new File(uriTemporal);
  const destino = new File(Paths.document, `foto_${Date.now()}.jpg`);
  await origen.copy(destino);
  return destino.uri;
}
