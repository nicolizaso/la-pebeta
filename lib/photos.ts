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

/** width / height — used to size filmstrip tiles from their real proportions. */
export function photoRatio(key: PhotoKey): number {
  const { width, height } = PHOTO_MANIFEST[key];
  return width / height;
}
