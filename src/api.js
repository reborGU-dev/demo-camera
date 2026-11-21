import { File } from 'expo-file-system';
import { fetch } from 'expo/fetch';

// server del profe
export const API_URL = 'https://cesun.vkinf-software.com:7800';
export const SERIAL_NUMBER = '24010178';

// GET 
export const RUTA_FOTOS = `/api/photos/${SERIAL_NUMBER}/`;

const EXTENSION_IMAGEN = /\.(jpe?g|png|webp|heic|gif)(\?.*)?$/i;

const absoluta = (ruta) =>
  /^https?:\/\//.test(ruta) ? ruta : `${API_URL}${ruta.startsWith('/') ? '' : '/'}${ruta}`;


const normalizar = (f) => {
  let ruta =
    f.url ?? f.foto ?? f.photo ?? f.image ?? f.imagen ?? f.file ?? f.uri ?? f.path ?? '';
  if (typeof ruta !== 'string' || !ruta) {
    ruta =
      Object.values(f).find(
        (v) => typeof v === 'string' && (EXTENSION_IMAGEN.test(v) || v.includes('/media/'))
      ) ?? '';
  }
  return {
    id: f.id ?? f._id ?? f.pk,
    url: absoluta(ruta),
    fecha: f.fecha ?? f.created_at ?? f.createdAt ?? f.uploaded_at ?? f.date ?? null,
  };
};


async function mensajeDeError(respuesta, porDefecto) {
  let detalle = '';
  try {
    const texto = await respuesta.text();
    try {
      const json = JSON.parse(texto);
      detalle = json.detail ?? json.error ?? JSON.stringify(json);
    } catch {

      detalle = texto.trim().startsWith('<') ? '' : texto;
    }
  } catch {}
  return `${porDefecto} (${respuesta.status}). ${detalle}`.trim();
}

export async function listarFotos() {
  const respuesta = await fetch(`${API_URL}${RUTA_FOTOS}`, { method: 'GET' });
  if (!respuesta.ok) {
    throw new Error(await mensajeDeError(respuesta, 'El servidor respondió con error'));
  }
  const datos = await respuesta.json();
  const arreglo = Array.isArray(datos) ? datos : datos.results ?? datos.photos ?? datos.fotos ?? [];
  return arreglo.map(normalizar);
}

export async function subirFoto(uri) {
  const formData = new FormData();

  formData.append('image', new File(uri));


  const respuesta = await fetch(`${API_URL}${RUTA_FOTOS}`, {
    method: 'POST',
    body: formData,
  });

  if (!respuesta.ok) {
    throw new Error(await mensajeDeError(respuesta, 'El servidor rechazó la foto'));
  }
}

export async function borrarFoto(id) {
  const respuesta = await fetch(`${API_URL}${RUTA_FOTOS}${id}/`, { method: 'DELETE' });
  if (!respuesta.ok) {
    throw new Error(await mensajeDeError(respuesta, 'No se pudo borrar la foto'));
  }
}
