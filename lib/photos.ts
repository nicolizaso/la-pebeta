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

/** width / height — used to size filmstrip tiles from their real proportions. */
export function photoRatio(key: PhotoKey): number {
  const { width, height } = PHOTO_MANIFEST[key];
  return width / height;
}
