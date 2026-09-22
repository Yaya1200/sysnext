export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5 MiB

/** Validate file size and optionally restrict to images.
 * @param file - File to validate.
 * @param acceptImagesOnly - If true, only image MIME types are allowed.
 * @returns error message string if invalid, otherwise null.
 */
export function validateUploadFile(
  file: File,
  acceptImagesOnly: boolean = true
): string | null {
  if (acceptImagesOnly && !file.type.startsWith('image/')) {
    return 'Selected file must be an image.';
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    return 'File size must be ≤ 5 MiB.';
  }
  return null;
}
