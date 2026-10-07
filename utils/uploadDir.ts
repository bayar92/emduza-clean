import path from 'path';

let warnedEphemeral = false;

/**
 * Directory where user uploads are persisted. Resolution order:
 *
 *   1. UPLOAD_DIR            — explicit override (any host)
 *   2. RAILWAY_VOLUME_MOUNT_PATH/uploads
 *                            — Railway sets this automatically once a Volume
 *                              is attached to the service
 *   3. <cwd>/uploads         — local dev only
 *
 * Option 3 lives inside the container image. On Railway / Docker / any
 * ephemeral host it is wiped on every deploy, which makes uploaded files
 * "disappear". Warn loudly if we end up there in production.
 */
export function getUploadDir(): string {
  if (process.env.UPLOAD_DIR) return process.env.UPLOAD_DIR;

  const volume = process.env.RAILWAY_VOLUME_MOUNT_PATH;
  if (volume) return path.join(volume, 'uploads');

  if (process.env.NODE_ENV === 'production' && !warnedEphemeral) {
    warnedEphemeral = true;
    console.warn(
      '[uploads] UPLOAD_DIR is not set and no Railway Volume is attached. ' +
        'Files are being written to the container filesystem and WILL BE LOST ' +
        'on the next deploy. Attach a Volume or set UPLOAD_DIR to a persistent path.'
    );
  }

  return path.join(process.cwd(), 'uploads');
}
