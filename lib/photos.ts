import { PHOTO_MANIFEST, type PhotoAsset, type PhotoKey } from "./photo-manifest.generated";

export type { PhotoAsset, PhotoKey };
export { PHOTO_MANIFEST };

/** A photo plus the copy that travels with it wherever it is shown. */
export type PhotoEntry = {
  photo: PhotoKey;
  alt: string;
  tag?: string;
};

export function getPhoto(key: PhotoKey): PhotoAsset {
  return PHOTO_MANIFEST[key];
}

/**
 * El asset de una clave que viene de la base —la foto de un producto, por
 * ejemplo—, que TypeScript no puede validar contra el manifiesto. Devuelve null
 * si esa foto ya no está, así el catálogo no se cae por una clave vieja.
 */
export function buscarFoto(clave: string): PhotoAsset | null {
  if (!clave) return null;
  return (PHOTO_MANIFEST as Record<string, PhotoAsset>)[clave] ?? null;
}

/**
 * Una foto lista para mostrarse. Las del manifiesto traen su placeholder
 * borroso; las que se suben desde el panel, no: de esas sólo tenemos la URL.
 */
export type FotoMostrable = { src: string; blurDataURL?: string };

/**
 * La foto de una nota del blog, que puede ser una clave del manifiesto o la URL
 * de una imagen subida desde el panel. Null si no tiene o si la clave ya no
 * está en el manifiesto.
 */
export function fotoDeNota(foto: string): FotoMostrable | null {
  if (!foto) return null;

  const delManifiesto = buscarFoto(foto);
  if (delManifiesto) {
    return { src: delManifiesto.src, blurDataURL: delManifiesto.blurDataURL };
  }

  // una URL: la foto se subió desde el panel. Qué URL se puede guardar lo
  // decide `validarNota`; acá sólo se resuelve qué dibujar.
  return /^https?:\/\//.test(foto) ? { src: foto } : null;
}

/** Una foto para elegir en el panel: la clave y su src, sin el blur. */
export type FotoDisponible = { clave: string; src: string };

/**
 * Las fotos que hay para ponerle a un producto. Va sin `blurDataURL` a
 * propósito: son setenta y seis, y el panel sólo necesita el nombre y una
 * miniatura para el select.
 */
export function fotosDisponibles(): FotoDisponible[] {
  return Object.entries(PHOTO_MANIFEST)
    .map(([clave, asset]) => ({ clave, src: asset.src }))
    .sort((una, otra) => una.clave.localeCompare(otra.clave, "es", { numeric: true }));
}

/** width / height — used to size filmstrip tiles from their real proportions. */
export function photoRatio(key: PhotoKey): number {
  const { width, height } = PHOTO_MANIFEST[key];
  return width / height;
}
