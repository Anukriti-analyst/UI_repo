/**
 * Downloads a Blob response as a file in the browser.
 * Used for PDF export.
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href  = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Generates a sanitised filename for a submission PDF */
export function submissionPdfFilename(formName: string, referenceNumber: string | null): string {
  const base = referenceNumber ?? formName.replace(/\s+/g, '-').toLowerCase();
  return `fm-essentials-${base}.pdf`;
}
