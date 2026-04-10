const MB = 1024 * 1024;

export const MAX_FORM_ATTACHMENT_BYTES = 10 * MB;

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < MB) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / MB).toFixed(1)} MB`;
};
