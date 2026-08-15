import { supabaseAdmin } from "./supabase";

/**
 * Las fotos que se suben desde el panel.
 *
 * El sitio se sirve de `public/imgs/`, que sale del script de imágenes y viaja
 * con el repo. Eso está bien para las fotos de las secciones —son de cámara, se
 * eligen a mano y se optimizan de una— pero no para una nota del blog, que se
 * escribe un martes a la tarde desde el panel: ahí la foto tiene que poder
 * llegar del teléfono de quien escribe, sin pasar por un deploy.
 *
 * Van a un bucket público de Supabase Storage. Público es lo que corresponde:
 * lo que guarda es la foto que abre una nota, que se ve en el blog. Subir, en
 * cambio, sólo puede hacerlo el panel, porque escribe con la secret key.
 */

export const BUCKET = "pebeta-blog";

/** Cinco megas: una foto de teléfono entra, un RAW de cámara no. */
export const MAX_PESO = 5 * 1024 * 1024;

const TIPOS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const TIPOS_ACEPTADOS = Object.keys(TIPOS).join(",");

type Resultado = { ok: true; url: string } | { ok: false; error: string };

/**
 * El nombre con el que queda guardada: la fecha adelante para que el orden del
 * bucket sea el orden en que se subieron, y un tramo al azar para que dos fotos
 * que se llamen `foto.jpg` no se pisen.
 */
function nombreDeArchivo(extension: string): string {
  const dia = new Date().toISOString().slice(0, 10);
  return `${dia}/${crypto.randomUUID()}.${extension}`;
}

/** Sube una imagen al bucket y devuelve la URL con la que se va a mostrar. */
export async function subirImagen(archivo: File): Promise<Resultado> {
  const extension = TIPOS[archivo.type];
  if (!extension) {
    return { ok: false, error: "Esa foto tiene que ser JPG, PNG, WebP o AVIF." };
  }
  if (archivo.size === 0) {
    return { ok: false, error: "El archivo llegó vacío. Probá de nuevo." };
  }
  if (archivo.size > MAX_PESO) {
    return { ok: false, error: "La foto pesa más de 5 MB. Achicala y volvé a subirla." };
  }

  const cliente = supabaseAdmin();
  const ruta = nombreDeArchivo(extension);

  const { error } = await cliente.storage.from(BUCKET).upload(ruta, archivo, {
    contentType: archivo.type,
    // un año de caché: el nombre es único, así que el contenido no cambia nunca
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    console.error("No se pudo subir la foto", error);
    return { ok: false, error: "No pudimos subir la foto. Probá de nuevo." };
  }

  const { data } = cliente.storage.from(BUCKET).getPublicUrl(ruta);
  return { ok: true, url: data.publicUrl };
}
