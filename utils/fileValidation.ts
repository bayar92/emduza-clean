const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

export function validateImage(file: File): string | null {
  if (file.size === 0) {
    return `Зургийн файл хоосон байна`;
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `Зөвхөн зураг (JPEG, PNG, WebP, GIF) оруулна уу`;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `Зургийн хэмжээ 10MB-с хэтрэхгүй байх ёстой`;
  }
  return null;
}

export function validateVideo(file: File): string | null {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return `Зөвхөн видео (MP4, WebM, OGG) оруулна уу`;
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return `Видеоны хэмжээ 500MB-с хэтрэхгүй байх ёстой`;
  }
  return null;
}
