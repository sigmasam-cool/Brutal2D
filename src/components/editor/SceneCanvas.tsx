import React, { useRef, useEffect, useState } from 'react';
import { useEngine } from '@/contexts/EngineContext';

const SceneCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentScene, selectedObject, selectObject, updateObject, sprites } = useEngine();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    const images: Record<string, HTMLImageElement> = {};
    sprites.forEach(sprite => {
      const img = new Image();
      img.src = sprite.url;
      img.onload = () => {
        images[sprite.id] = img;
        setLoadedImages({ ...images });
      };
    });
  }, [sprites]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentScene) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw objects
    currentScene.objects.forEach(obj => {
      if (!obj.visible) return;

      ctx.save();
      ctx.translate(obj.x, obj.y);
      ctx.rotate(obj.rotation * Math.PI / 180);
      ctx.scale(obj.scaleX, obj.scaleY);

      if (obj.type === 'sprite') {
        if (obj.sprite && loadedImages[obj.sprite]) {
          const img = loadedImages[obj.sprite];
          ctx.drawImage(img, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
        } else {
          ctx.fillStyle = '#cccccc';
          ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.strokeRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
        }
      } else if (obj.type === 'panel') {
        ctx.fillStyle = obj.backgroundColor || '#ffffff';
        ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
      } else if (obj.type === 'button') {
        ctx.fillStyle = obj.backgroundColor || '#FFE600';
        ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obj.text || 'BUTTON', 0, 0);
      } else if (obj.type === 'label') {
        ctx.fillStyle = obj.color || '#000000';
        ctx.font = `bold ${obj.fontSize || 16}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obj.text || 'LABEL', 0, 0);
      }

      // Draw selection outline
      if (selectedObject?.id === obj.id) {
        ctx.strokeStyle = '#FF006E';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-obj.width / 2 - 5, -obj.height / 2 - 5, obj.width + 10, obj.height + 10);
        ctx.setLineDash([]);
      }

      ctx.restore();
    });
  }, [currentScene, selectedObject, loadedImages]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentScene) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on an object (reverse order for top-to-bottom)
    for (let i = currentScene.objects.length - 1; i >= 0; i--) {
      const obj = currentScene.objects[i];
      if (!obj.visible) continue;

      const dx = x - obj.x;
      const dy = y - obj.y;

      if (Math.abs(dx) <= obj.width / 2 && Math.abs(dy) <= obj.height / 2) {
        selectObject(obj.id);
        setIsDragging(true);
        setDragOffset({ x: dx, y: dy });
        return;
      }
    }

    selectObject(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedObject) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    updateObject(selectedObject.id, {
      x: x - dragOffset.x,
      y: y - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex-1 bg-gray-100 p-4 overflow-auto">
      <div className="brutal-panel bg-white p-4 inline-block">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
};

export default SceneCanvas;