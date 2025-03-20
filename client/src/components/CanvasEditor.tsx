import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { TemplateType } from '@/types';
import * as fabric from 'fabric';

interface CanvasEditorProps {
  templates: TemplateType[];
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({ templates }) => {
  const { state, dispatch } = useAppContext();
  const [canvasWidth, setCanvasWidth] = useState(1080);
  const [canvasHeight, setCanvasHeight] = useState(1920); // Instagram Story dimensions
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [productImageObj, setProductImageObj] = useState<fabric.Image | null>(null);

  useEffect(() => {
    // Initialize the canvas
    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current);
      dispatch({ type: 'SET_FABRIC_CANVAS', payload: fabricCanvasRef.current });
    }

    // Handle resize
    const handleResize = () => {
      if (canvasContainerRef.current && fabricCanvasRef.current) {
        const container = canvasContainerRef.current;
        const containerWidth = container.clientWidth;
        
        // Maintain 9:16 aspect ratio for Instagram Stories (1080x1920), limited by container width
        const newHeight = containerWidth * (1920/1080);
        
        setCanvasWidth(containerWidth);
        setCanvasHeight(newHeight);
        
        fabricCanvasRef.current.setWidth(containerWidth);
        fabricCanvasRef.current.setHeight(newHeight);
        fabricCanvasRef.current.renderAll();
      }
    };

    // Initial sizing
    handleResize();

    // Setup resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch]);

  useEffect(() => {
    // Render the template and product image when selectedTemplate changes
    if (fabricCanvasRef.current && state.selectedTemplate && state.processedImageUrl) {
      const canvas = fabricCanvasRef.current;
      canvas.clear();

      // Load template background
      fabric.Image.fromURL(state.selectedTemplate.path, (templateImg) => {
        // Scale to fit canvas
        const scaleX = canvas.width! / templateImg.width!;
        const scaleY = canvas.height! / templateImg.height!;
        const scale = Math.max(scaleX, scaleY);
        
        templateImg.set({
          scaleX: scale,
          scaleY: scale,
          originX: 'center',
          originY: 'center',
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          selectable: false,
        });
        
        canvas.add(templateImg);
        canvas.sendToBack(templateImg);

        // Add product image
        fabric.Image.fromURL(state.processedImageUrl!, (productImg) => {
          // Calculate dimensions based on template
          const maxWidth = canvas.width! * 0.7;
          const maxHeight = canvas.height! * 0.4;
          
          // Scale to fit max dimensions
          const imgScaleX = maxWidth / productImg.width!;
          const imgScaleY = maxHeight / productImg.height!;
          const imgScale = Math.min(imgScaleX, imgScaleY);
          
          productImg.set({
            scaleX: imgScale,
            scaleY: imgScale,
            originX: 'center',
            originY: 'center',
            left: canvas.width! * state.imagePosition.x,
            top: canvas.height! * state.imagePosition.y,
            angle: state.imagePosition.angle,
            cornerColor: 'rgba(79, 70, 229, 0.8)',
            cornerStrokeColor: 'rgba(79, 70, 229, 1)',
            cornerSize: 10,
            transparentCorners: false,
            borderColor: 'rgba(79, 70, 229, 0.8)',
            borderScaleFactor: 1.5,
          });
          
          canvas.add(productImg);
          setProductImageObj(productImg);
          
          // Listen for object modifications
          productImg.on('modified', function() {
            if (canvas.width && canvas.height) {
              dispatch({
                type: 'SET_IMAGE_POSITION',
                payload: {
                  x: productImg.left! / canvas.width,
                  y: productImg.top! / canvas.height,
                  angle: productImg.angle || 0,
                  scale: productImg.scaleX! / imgScale, // Store the scale multiplier
                }
              });
            }
          });
          
          canvas.renderAll();
        });
      });
    }
  }, [state.selectedTemplate, state.processedImageUrl, state.imagePosition.x, state.imagePosition.y, state.imagePosition.angle, dispatch]);

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sizePercent = parseInt(e.target.value);
    
    if (productImageObj && fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      
      // Calculate dimensions based on template
      const maxWidth = canvas.width! * 0.7;
      const maxHeight = canvas.height! * 0.4;
      
      // Original scale to fit max dimensions
      const imgScaleX = maxWidth / productImageObj.width!;
      const imgScaleY = maxHeight / productImageObj.height!;
      const imgScale = Math.min(imgScaleX, imgScaleY);
      
      // Apply scale percentage
      const scaleFactor = sizePercent / 50; // 50 = default size (100%)
      productImageObj.scale(imgScale * scaleFactor);
      
      dispatch({
        type: 'SET_IMAGE_POSITION',
        payload: {
          scale: scaleFactor
        }
      });
      
      canvas.renderAll();
    }
  };

  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rotation = parseInt(e.target.value);
    
    if (productImageObj && fabricCanvasRef.current) {
      productImageObj.set('angle', rotation);
      
      dispatch({
        type: 'SET_IMAGE_POSITION',
        payload: {
          angle: rotation
        }
      });
      
      fabricCanvasRef.current.renderAll();
    }
  };

  const handleSelectTemplate = (template: TemplateType) => {
    dispatch({ type: 'SET_TEMPLATE', payload: template });
  };

  const handleBackgroundColor = (color: string) => {
    if (!state.selectedTemplate || !fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const bgObjects = canvas.getObjects().filter(obj => !obj.data?.isProduct);
    
    if (bgObjects.length > 0) {
      const bgObject = bgObjects[0];
      bgObject.set('fill', color);
      canvas.renderAll();
    } else {
      const rect = new fabric.Rect({
        width: canvas.width,
        height: canvas.height,
        fill: color,
        selectable: false,
      });
      canvas.add(rect);
      canvas.sendToBack(rect);
      canvas.renderAll();
    }
  };

  const handleGoBack = () => {
    dispatch({ type: 'SET_STEP', payload: 1 });
  };

  const handleProceed = () => {
    dispatch({ type: 'SET_STEP', payload: 3 });
  };

  return (
    <div>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Elige Plantilla y Posiciona la Imagen</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2">
            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <div 
                ref={canvasContainerRef} 
                className="relative bg-white overflow-hidden rounded-lg shadow-sm aspect-[9/16]"
              >
                <canvas 
                  ref={canvasRef} 
                  width={canvasWidth} 
                  height={canvasHeight}
                  className="w-full h-full"
                ></canvas>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-md font-medium mb-3">Controles de Imagen</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tamaño</label>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={state.imagePosition.scale * 50} 
                    onChange={handleSizeChange}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Rotación</label>
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={state.imagePosition.angle} 
                    onChange={handleRotationChange}
                    className="w-full"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">Arrastra para posicionar la imagen en la plantilla</p>
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="text-md font-medium mb-3">Seleccionar Plantilla</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-3 mb-6">
              {templates.map((template) => (
                <div 
                  key={template.id}
                  className={`border-2 ${state.selectedTemplate?.id === template.id ? 'border-primary' : 'border-gray-200'} rounded-lg p-1 cursor-pointer`}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <img 
                    src={template.path} 
                    alt={template.name} 
                    className="w-full aspect-[9/16] object-cover rounded" 
                  />
                </div>
              ))}
            </div>

            <h3 className="text-md font-medium mb-3">Fondo de Plantilla</h3>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {['#0F2D52', '#FF0000', '#FFFFFF', '#003366', '#990000', '#CCCCCC', '#000000', '#333333'].map((color) => (
                <div 
                  key={color}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 ${color === '#FFFFFF' ? 'border-gray-300' : 'border-white'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleBackgroundColor(color)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t px-6 py-4 flex justify-between">
        <Button 
          variant="outline"
          onClick={handleGoBack}
        >
          Atrás
        </Button>
        <Button 
          onClick={handleProceed}
        >
          Siguiente: Agregar Precio
        </Button>
      </div>
    </div>
  );
};

export default CanvasEditor;
