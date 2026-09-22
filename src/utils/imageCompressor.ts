/**
 * Image compressor and optimizer utility for profile avatars and logos.
 * Converts high-resolution images into lightweight, crisp web assets (approx 30KB - 60KB)
 * preventing LocalStorage quota errors and Firestore 1MB document size limits.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  grayscale?: boolean;
}

export function compressImage(
  source: File | string,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 440,
    maxHeight = 440,
    quality = 0.85,
    grayscale = false,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoadedImage = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect-ratio preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(typeof source === 'string' ? source : '');
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Optionally apply high-contrast B&W filter directly on pixel data
        if (grayscale) {
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            // Standard luminance weights
            const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            // Slight contrast boost
            const contrast = 1.15;
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            const newVal = Math.min(255, Math.max(0, factor * (avg - 128) + 128));

            data[i] = newVal;     // R
            data[i + 1] = newVal; // G
            data[i + 2] = newVal; // B
          }
          ctx.putImageData(imgData, 0, 0);
        }

        // Output as compact JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (err) {
        console.warn('Image compression fallback:', err);
        // Fallback to original string if error
        if (typeof source === 'string') {
          resolve(source);
        } else {
          reject(err);
        }
      }
    };

    img.onload = handleLoadedImage;
    img.onerror = () => {
      if (typeof source === 'string') {
        resolve(source);
      } else {
        reject(new Error('Failed to load image for compression'));
      }
    };

    if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('Could not read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    } else {
      img.src = source;
    }
  });
}
