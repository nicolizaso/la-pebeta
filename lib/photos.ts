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
