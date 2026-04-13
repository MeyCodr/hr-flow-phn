const MB = 1024 * 1024;

// Keep this below the reverse proxy limit so the app can show a friendly
// validation message before multipart overhead triggers a 413 upstream.
export const MAX_FORM_ATTACHMENT_BYTES = 8 * MB;

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < MB) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / MB).toFixed(1)} MB`;
};
