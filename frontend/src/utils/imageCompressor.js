/**
 * Utility to compress image files in the browser using HTML Canvas.
 * Resizes image max dimension to 1200px and compresses JPEG quality to 0.82.
 * Reduces file sizes from 5MB-15MB down to ~150KB-300KB, preventing HTTP 413 (Payload Too Large).
 */
export async function compressImageFile(file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) {
  if (!file || !file.type || !file.type.startsWith('image/')) return file;
  
  // If file is already small (<= 250KB), return original file directly
  if (file.size <= 250 * 1024) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
