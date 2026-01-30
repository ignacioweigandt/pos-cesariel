/** Utilidades para validación y manejo de subida de archivos e imágenes (Cloudinary) */

export interface FileValidationOptions {
  allowedTypes?: string[];
  maxSizeMB?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const DEFAULT_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): FileValidationResult {
  const {
    allowedTypes = DEFAULT_IMAGE_TYPES,
    maxSizeMB = 5
  } = options;

  if (!allowedTypes.includes(file.type)) {
    const typeNames = allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ');
    return {
      valid: false,
      error: `Solo se permiten archivos de tipo: ${typeNames}`
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `El archivo es muy grande. Máximo ${maxSizeMB}MB`
    };
  }

  return { valid: true };
}

export async function validateImageDimensions(
  file: File,
  options: FileValidationOptions = {}
): Promise<FileValidationResult> {
  const {
    minWidth,
    minHeight,
    maxWidth,
    maxHeight
  } = options;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      if (minWidth && img.width < minWidth) {
        resolve({
          valid: false,
          error: `La imagen debe tener al menos ${minWidth}px de ancho`
        });
        return;
      }

      if (minHeight && img.height < minHeight) {
        resolve({
          valid: false,
          error: `La imagen debe tener al menos ${minHeight}px de alto`
        });
        return;
      }

      if (maxWidth && img.width > maxWidth) {
        resolve({
          valid: false,
          error: `La imagen no debe superar ${maxWidth}px de ancho`
        });
        return;
      }

      if (maxHeight && img.height > maxHeight) {
        resolve({
          valid: false,
          error: `La imagen no debe superar ${maxHeight}px de alto`
        });
        return;
      }

      resolve({ valid: true });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        error: 'No se pudo cargar la imagen'
      });
    };

    img.src = url;
  });
}

export function createFilePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('No se pudo crear el preview'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
}
