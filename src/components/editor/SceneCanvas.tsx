import React, { useRef, useEffect, useState } from 'react';
import { useEngine } from '@/contexts/EngineContext';

type DragMode = 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br' | 'rotate' | null;

const SceneCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentScene, selectedObject, selectObject, updateObject, sprites } = useEngine();
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialState, setInitialState] = useState<any>(null);
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

    // Sort objects by layer (lowest to highest)
    const sortedObjects = [...currentScene.objects].sort((a, b) => a.layer - b.layer);

    // Draw objects
    sortedObjects.forEach(obj => {
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

      ctx.restore();

      // Draw selection outline and handles
      if (selectedObject?.id === obj.id) {
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.rotation * Math.PI / 180);

        // Selection outline
        ctx.strokeStyle = '#FF006E';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-obj.width / 2 - 5, -obj.height / 2 - 5, obj.width + 10, obj.height + 10);
        ctx.setLineDash([]);

        // Corner resize handles
        const handleSize = 12;
        const corners = [
          { x: -obj.width / 2, y: -obj.height / 2, color: '#00F5FF' }, // top-left
          { x: obj.width / 2, y: -obj.height / 2, color: '#00FF85' },  // top-right
          { x: -obj.width / 2, y: obj.height / 2, color: '#B537F2' },  // bottom-left
          { x: obj.width / 2, y: obj.height / 2, color: '#FF6B00' },   // bottom-right
        ];

        corners.forEach(corner => {
          ctx.fillStyle = corner.color;
          ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.strokeRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
        });

        // Rotation handle
        const rotateHandleDistance = obj.height / 2 + 30;
        ctx.beginPath();
        ctx.moveTo(0, -obj.height / 2);
        ctx.lineTo(0, -rotateHandleDistance);
        ctx.strokeStyle = '#FFE600';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, -rotateHandleDistance, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#FFE600';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
      }
    });
  }, [currentScene, selectedObject, loadedImages]);

  const getHandleAtPosition = (x: number, y: number, obj: any): DragMode => {
    const handleSize = 12;
    const rotateHandleDistance = obj.height / 2 + 30;

    // Transform mouse position to object space
    const dx = x - obj.x;
    const dy = y - obj.y;
    const angle = -obj.rotation * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    // Check rotation handle
    const rotateHandleX = 0;
    const rotateHandleY = -rotateHandleDistance;
    if (Math.abs(localX - rotateHandleX) < 10 && Math.abs(localY - rotateHandleY) < 10) {
      return 'rotate';
    }

    // Check corner handles
    const corners = [
      { x: -obj.width / 2, y: -obj.height / 2, mode: 'resize-tl' as DragMode },
      { x: obj.width / 2, y: -obj.height / 2, mode: 'resize-tr' as DragMode },
      { x: -obj.width / 2, y: obj.height / 2, mode: 'resize-bl' as DragMode },
      { x: obj.width / 2, y: obj.height / 2, mode: 'resize-br' as DragMode },
    ];

    for (const corner of corners) {
      if (Math.abs(localX - corner.x) < handleSize && Math.abs(localY - corner.y) < handleSize) {
        return corner.mode;
      }
    }

    // Check if inside object bounds
    if (Math.abs(localX) <= obj.width / 2 && Math.abs(localY) <= obj.height / 2) {
      return 'move';
    }

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentScene) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on selected object's handles
    if (selectedObject) {
      const mode = getHandleAtPosition(x, y, selectedObject);
      if (mode) {
        setDragMode(mode);
        setDragStart({ x, y });
        setInitialState({
          x: selectedObject.x,
          y: selectedObject.y,
          width: selectedObject.width,
          height: selectedObject.height,
          rotation: selectedObject.rotation,
        });
        return;
      }
    }

    // Check if clicking on an object (reverse order for top-to-bottom, by layer)
    const sortedObjects = [...currentScene.objects].sort((a, b) => b.layer - a.layer);
    for (let i = 0; i < sortedObjects.length; i++) {
      const obj = sortedObjects[i];
      if (!obj.visible) continue;

      const mode = getHandleAtPosition(x, y, obj);
      if (mode) {
        selectObject(obj.id);
        setDragMode(mode);
        setDragStart({ x, y });
        setInitialState({
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
          rotation: obj.rotation,
        });
        return;
      }
    }

    selectObject(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedObject || !dragMode || !initialState) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    if (dragMode === 'move') {
      updateObject(selectedObject.id, {
        x: initialState.x + dx,
        y: initialState.y + dy,
      });
    } else if (dragMode === 'rotate') {
      const centerX = selectedObject.x;
      const centerY = selectedObject.y;
      const angle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI + 90;
      updateObject(selectedObject.id, {
        rotation: Math.round(angle),
      });
    } else if (dragMode.startsWith('resize-')) {
      // Calculate resize based on corner
      const angle = selectedObject.rotation * Math.PI / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const localDx = dx * cos + dy * sin;
      const localDy = -dx * sin + dy * cos;

      let newWidth = initialState.width;
      let newHeight = initialState.height;
      let newX = initialState.x;
      let newY = initialState.y;

      if (dragMode === 'resize-br') {
        newWidth = Math.max(20, initialState.width + localDx * 2);
        newHeight = Math.max(20, initialState.height + localDy * 2);
      } else if (dragMode === 'resize-bl') {
        newWidth = Math.max(20, initialState.width - localDx * 2);
        newHeight = Math.max(20, initialState.height + localDy * 2);
      } else if (dragMode === 'resize-tr') {
        newWidth = Math.max(20, initialState.width + localDx * 2);
        newHeight = Math.max(20, initialState.height - localDy * 2);
      } else if (dragMode === 'resize-tl') {
        newWidth = Math.max(20, initialState.width - localDx * 2);
        newHeight = Math.max(20, initialState.height - localDy * 2);
      }

      updateObject(selectedObject.id, {
        width: Math.round(newWidth),
        height: Math.round(newHeight),
        x: Math.round(newX),
        y: Math.round(newY),
      });
    }
  };

  const handleMouseUp = () => {
    setDragMode(null);
    setInitialState(null);
  };

  const getCursor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragMode) {
      if (dragMode === 'move') return 'move';
      if (dragMode === 'rotate') return 'grab';
      return 'nwse-resize';
    }

    const canvas = canvasRef.current;
    if (!canvas || !selectedObject) return 'crosshair';

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const mode = getHandleAtPosition(x, y, selectedObject);
    if (mode === 'move') return 'move';
    if (mode === 'rotate') return 'grab';
    if (mode?.startsWith('resize-')) return 'nwse-resize';

    return 'crosshair';
  };

  return (
    <div className="flex-1 bg-gray-100 p-4 overflow-auto">
      <div className="brutal-panel bg-white p-4 inline-block">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{ cursor: dragMode ? (dragMode === 'move' ? 'move' : dragMode === 'rotate' ? 'grabbing' : 'nwse-resize') : 'crosshair' }}
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