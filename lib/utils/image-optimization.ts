/**
 * Image optimization utilities for compressing images before upload
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0
  maxSizeMB?: number; // Maximum file size in MB
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  maxSizeMB: 2,
  outputFormat: 'image/jpeg',
};

/**
 * Compresses an image file using the Canvas API
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns A Promise that resolves to a compressed Blob
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;
          const aspectRatio = width / height;

          if (width > opts.maxWidth) {
            width = opts.maxWidth;
            height = width / aspectRatio;
          }

          if (height > opts.maxHeight) {
            height = opts.maxHeight;
            width = height * aspectRatio;
          }

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Use high-quality image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // If the compressed image is still too large, reduce quality further
              const sizeMB = blob.size / (1024 * 1024);
              if (sizeMB > opts.maxSizeMB) {
                // Recursively compress with lower quality
                const newQuality = Math.max(0.1, opts.quality - 0.2);
                compressImage(file, { ...opts, quality: newQuality })
                  .then(resolve)
                  .catch(reject);
              } else {
                resolve(blob);
              }
            },
            opts.outputFormat,
            opts.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      if (event.target?.result) {
        img.src = event.target.result as string;
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Converts a Blob to a File object
 * @param blob - The blob to convert
 * @param fileName - The desired file name
 * @param mimeType - The MIME type
 * @returns A File object
 */
export function blobToFile(blob: Blob, fileName: string, mimeType: string): File {
  return new File([blob], fileName, { type: mimeType });
}

/**
 * Validates if a file is a valid image
 * @param file - The file to validate
 * @returns True if the file is a valid image
 */
export function isValidImageFile(file: File): boolean {
  return file.type.startsWith('image/') && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
}

/**
 * Gets the optimal output format based on the input file type
 * @param file - The input image file
 * @returns The optimal output format
 */
export function getOptimalFormat(file: File): 'image/jpeg' | 'image/png' | 'image/webp' {
  // Prefer WebP for better compression, fallback to original format
  if (file.type === 'image/png' && !file.name.toLowerCase().includes('transparent')) {
    // Convert PNG to JPEG if it doesn't need transparency
    return 'image/jpeg';
  }
  
  if (file.type === 'image/webp') {
    return 'image/webp';
  }

  // Default to JPEG for best compression
  return 'image/jpeg';
}

/**
 * Compresses an image with automatic format selection
 * @param file - The image file to compress
 * @param options - Compression options (optional)
 * @returns A Promise that resolves to a compressed File
 */
export async function compressImageFile(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  if (!isValidImageFile(file)) {
    throw new Error('Invalid image file');
  }

  const optimalFormat = options.outputFormat || getOptimalFormat(file);
  const blob = await compressImage(file, { ...options, outputFormat: optimalFormat });
  
  // Generate new file name with appropriate extension
  const extension = optimalFormat === 'image/png' ? 'png' : optimalFormat === 'image/webp' ? 'webp' : 'jpg';
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const newFileName = `${baseName}.${extension}`;

  return blobToFile(blob, newFileName, optimalFormat);
}

