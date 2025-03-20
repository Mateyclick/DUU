
import { fabric } from 'fabric';

export const initCanvas = (id: string) => {
  const canvas = new fabric.Canvas(id, {
    height: 1920,
    width: 1080,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    selection: false,
  });
  return canvas;
};

export const addText = (canvas: fabric.Canvas, text: string) => {
  const textbox = new fabric.Textbox(text, {
    left: 50,
    top: 50,
    width: 300,
    fontSize: 24,
    fontFamily: 'Arial',
    fill: '#000000',
  });
  canvas.add(textbox);
  canvas.setActiveObject(textbox);
};

export const addImage = (canvas: fabric.Canvas, url: string) => {
  fabric.Image.fromURL(url, (img: fabric.Image) => {
    if (img) {
      img.scaleToWidth(200);
      img.scaleToHeight(200);
      canvas.add(img);
      canvas.setActiveObject(img);
    }
  }, { crossOrigin: 'anonymous' });
};

export const loadImage = (url: string): Promise<fabric.Image> => {
  return new Promise((resolve, reject) => {
    fabric.Image.fromURL(
      url, 
      (img: fabric.Image) => {
        if (img) {
          resolve(img);
        } else {
          reject(new Error('Failed to load image'));
        }
      },
      {
        crossOrigin: 'anonymous'
      }
    );
  });
};

export const cloneObject = (canvas: fabric.Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    activeObject.clone((cloned: fabric.Object) => {
      cloned.set({
        left: cloned.left ? cloned.left + 10 : 10,
        top: cloned.top ? cloned.top + 10 : 10,
        evented: true,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
    });
  }
};

export const removeSelectedObject = (canvas: fabric.Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    canvas.remove(activeObject);
    canvas.requestRenderAll();
  }
};

export const sendToBack = (canvas: fabric.Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    activeObject.sendToBack();
    canvas.requestRenderAll();
  }
};

export const bringToFront = (canvas: fabric.Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    activeObject.bringToFront();
    canvas.requestRenderAll();
  }
};

export const toggleLock = (canvas: fabric.Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    activeObject.lockMovementX = !activeObject.lockMovementX;
    activeObject.lockMovementY = !activeObject.lockMovementY;
    activeObject.lockScalingX = !activeObject.lockScalingX;
    activeObject.lockScalingY = !activeObject.lockScalingY;
    activeObject.lockRotation = !activeObject.lockRotation;
    canvas.requestRenderAll();
  }
};

export const setBackgroundColor = (canvas: fabric.Canvas, color: string) => {
  canvas.backgroundColor = color;
  canvas.requestRenderAll();
};

export const setTextColor = (canvas: fabric.Canvas, color: string) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject instanceof fabric.Textbox) {
    activeObject.set('fill', color);
    canvas.requestRenderAll();
  }
};

export const setTextSize = (canvas: fabric.Canvas, size: number) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject instanceof fabric.Textbox) {
    activeObject.set('fontSize', size);
    canvas.requestRenderAll();
  }
};

export const setTextFontFamily = (canvas: fabric.Canvas, fontFamily: string) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject instanceof fabric.Textbox) {
    activeObject.set('fontFamily', fontFamily);
    canvas.requestRenderAll();
  }
};

export const alignText = (canvas: fabric.Canvas, alignment: string) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject instanceof fabric.Textbox) {
    activeObject.set('textAlign', alignment);
    canvas.requestRenderAll();
  }
};

export const makeTextBold = (canvas: fabric.Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject instanceof fabric.Textbox) {
    const isBold = activeObject.fontWeight === 'bold';
    activeObject.set('fontWeight', isBold ? 'normal' : 'bold');
    canvas.requestRenderAll();
  }
};

export const makeTextItalic = (canvas: fabric.Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject instanceof fabric.Textbox) {
    const isItalic = activeObject.fontStyle === 'italic';
    activeObject.set('fontStyle', isItalic ? 'normal' : 'italic');
    canvas.requestRenderAll();
  }
};

export const underlineText = (canvas: fabric.Canvas) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject instanceof fabric.Textbox) {
    const isUnderlined = activeObject.underline === true;
    activeObject.set('underline', !isUnderlined);
    canvas.requestRenderAll();
  }
};

export const setCanvasSize = (canvas: fabric.Canvas, width: number, height: number) => {
  canvas.setWidth(width);
  canvas.setHeight(height);
  canvas.requestRenderAll();
};

export const clearCanvas = (canvas: fabric.Canvas) => {
  canvas.clear();
  canvas.backgroundColor = 'rgba(255, 255, 255, 1)';
  canvas.requestRenderAll();
};

export const rasterize = (canvas: fabric.Canvas) => {
  return canvas.toDataURL({
    format: 'png'
  });
};
