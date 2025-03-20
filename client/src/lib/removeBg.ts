import axios from 'axios';

/**
 * Resizes an image to a maximum width/height of 720px before processing
 * @param file The image file to resize
 * @returns Promise with the resized image as a Blob
 */
const resizeImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 720;
        let width = img.width;
        let height = img.height;

        // Resize only if the image is larger than MAX_SIZE
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob from canvas"));
            }
          },
          file.type,
          0.9
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Removes the background from an image using Remove.bg API or imgly background removal
 * @param file The image file to process
 * @returns Promise with the URL of the processed image
 */
export const removeBg = async (file: File): Promise<string> => {
  try {
    // Preprocess image - resize to max 720px
    const resizedBlob = await resizeImage(file);
    const resizedFile = new File([resizedBlob], file.name, { type: file.type });
    
    // Try server-side Remove.bg API first
    const formData = new FormData();
    formData.append('image', resizedFile);
    
    const response = await axios.post('/api/remove-bg', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });
    
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('Server-side background removal failed, using client-side fallback', error);
    
    try {
      // Preprocess image for the fallback method too
      const resizedBlob = await resizeImage(file);
      
      // Use imgly client-side background removal as fallback
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(resizedBlob);
      return URL.createObjectURL(blob);
    } catch (fallbackError) {
      console.error('Client-side background removal failed', fallbackError);
      throw new Error('Failed to remove background. Please try another image or try again later.');
    }
  }
};
