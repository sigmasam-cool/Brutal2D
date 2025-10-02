import { useRef, useEffect, useState } from 'react';
import { useGameEngine } from '@/contexts/GameEngineContext';
import { Plus, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

type DragMode = 'none' | 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br';

const SceneEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const { getCurrentScene, sprites, addGameObject, updateGameObject, deleteGameObject, updateScene } = useGameEngine();
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [dragMode, setDragMode] = useState<DragMode>('none');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalObject, setOriginalObject] = useState<any>(null);
  const scene = getCurrentScene();
  const { toast } = useToast();

  useEffect(() => {
    if (scene?.backgroundImage) {
      const img = new Image();
      img.onload = () => setBackgroundImage(img);
      img.src = scene.backgroundImage;
    } else {
      setBackgroundImage(null);
    }
  }, [scene?.backgroundImage]);

  useEffect(() => {
    if (!canvasRef.current || !scene) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = scene.width;
    canvas.height = scene.height;

    // Draw background
    if (backgroundImage && backgroundImage.complete) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = scene.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw grid
    ctx.strokeStyle = backgroundImage ? 'rgba(0, 0, 0, 0.2)' : '#000000';
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

    // Draw game objects
    scene.gameObjects.forEach((obj) => {
      if (!obj.visible) return;

      const sprite = sprites.find(s => s.id === obj.spriteId);
      
      ctx.save();
      ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
      ctx.rotate((obj.rotation * Math.PI) / 180);
      
      if (sprite) {
        const img = new Image();
        img.src = sprite.url;
        ctx.drawImage(img, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
      } else {
        ctx.fillStyle = '#FF006E';
        ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
      }

      ctx.restore();

      // Draw selection and resize handles
      if (obj.id === selectedObjectId) {
        ctx.strokeStyle = '#0066FF';
        ctx.lineWidth = 4;
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);

        // Draw resize handles
        const handleSize = 12;
        const handles = [
          { x: obj.x, y: obj.y }, // top-left
          { x: obj.x + obj.width, y: obj.y }, // top-right
          { x: obj.x, y: obj.y + obj.height }, // bottom-left
          { x: obj.x + obj.width, y: obj.y + obj.height }, // bottom-right
        ];

        handles.forEach(handle => {
          ctx.fillStyle = '#FFBE0B';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
        });
      }

      ctx.fillStyle = backgroundImage ? '#FFFFFF' : '#000000';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.font = 'bold 12px Arial';
      ctx.strokeText(obj.name, obj.x, obj.y - 5);
      ctx.fillText(obj.name, obj.x, obj.y - 5);
    });
  }, [scene, sprites, selectedObjectId, backgroundImage]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getResizeHandle = (x: number, y: number, obj: any): DragMode => {
    const handleSize = 12;
    const tolerance = handleSize / 2;

    if (Math.abs(x - obj.x) < tolerance && Math.abs(y - obj.y) < tolerance) {
      return 'resize-tl';
    }
    if (Math.abs(x - (obj.x + obj.width)) < tolerance && Math.abs(y - obj.y) < tolerance) {
      return 'resize-tr';
    }
    if (Math.abs(x - obj.x) < tolerance && Math.abs(y - (obj.y + obj.height)) < tolerance) {
      return 'resize-bl';
    }
    if (Math.abs(x - (obj.x + obj.width)) < tolerance && Math.abs(y - (obj.y + obj.height)) < tolerance) {
      return 'resize-br';
    }
    return 'none';
  };

  const getCursorStyle = (mode: DragMode): string => {
    switch (mode) {
      case 'move': return 'move';
      case 'resize-tl': return 'nw-resize';
      case 'resize-tr': return 'ne-resize';
      case 'resize-bl': return 'sw-resize';
      case 'resize-br': return 'se-resize';
      default: return 'crosshair';
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!scene) return;
    const { x, y } = getCanvasCoords(e);

    const selectedObj = scene.gameObjects.find(obj => obj.id === selectedObjectId);
    
    if (selectedObj) {
      const resizeHandle = getResizeHandle(x, y, selectedObj);
      if (resizeHandle !== 'none') {
        setDragMode(resizeHandle);
        setDragStart({ x, y });
        setOriginalObject({ ...selectedObj });
        return;
      }

      if (x >= selectedObj.x && x <= selectedObj.x + selectedObj.width &&
          y >= selectedObj.y && y <= selectedObj.y + selectedObj.height) {
        setDragMode('move');
        setDragStart({ x, y });
        setOriginalObject({ ...selectedObj });
        return;
      }
    }

    const clicked = scene.gameObjects.find(obj => 
      x >= obj.x && x <= obj.x + obj.width &&
      y >= obj.y && y <= obj.y + obj.height
    );
    
    setSelectedObjectId(clicked?.id || null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!scene || !selectedObjectId) return;

    const { x, y } = getCanvasCoords(e);
    const selectedObj = scene.gameObjects.find(obj => obj.id === selectedObjectId);

    if (dragMode === 'none' && selectedObj) {
      const resizeHandle = getResizeHandle(x, y, selectedObj);
      if (resizeHandle !== 'none') {
        if (canvasRef.current) {
          canvasRef.current.style.cursor = getCursorStyle(resizeHandle);
        }
        return;
      }

      if (x >= selectedObj.x && x <= selectedObj.x + selectedObj.width &&
          y >= selectedObj.y && y <= selectedObj.y + selectedObj.height) {
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'move';
        }
        return;
      }

      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'crosshair';
      }
      return;
    }

    if (dragMode === 'move' && originalObject) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      updateGameObject(scene.id, selectedObjectId, {
        x: originalObject.x + dx,
        y: originalObject.y + dy,
      });
    } else if (dragMode.startsWith('resize-') && originalObject) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;

      let newX = originalObject.x;
      let newY = originalObject.y;
      let newWidth = originalObject.width;
      let newHeight = originalObject.height;

      switch (dragMode) {
        case 'resize-tl':
          newX = originalObject.x + dx;
          newY = originalObject.y + dy;
          newWidth = originalObject.width - dx;
          newHeight = originalObject.height - dy;
          break;
        case 'resize-tr':
          newY = originalObject.y + dy;
          newWidth = originalObject.width + dx;
          newHeight = originalObject.height - dy;
          break;
        case 'resize-bl':
          newX = originalObject.x + dx;
          newWidth = originalObject.width - dx;
          newHeight = originalObject.height + dy;
          break;
        case 'resize-br':
          newWidth = originalObject.width + dx;
          newHeight = originalObject.height + dy;
          break;
      }

      // Minimum size constraint
      if (newWidth > 10 && newHeight > 10) {
        updateGameObject(scene.id, selectedObjectId, {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        });
      }
    }
  };

  const handleMouseUp = () => {
    setDragMode('none');
    setOriginalObject(null);
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !scene) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      updateScene(scene.id, { backgroundImage: imageUrl });
      toast({
        title: "Background uploaded!",
        description: "Scene background updated successfully",
      });
    };
    reader.readAsDataURL(file);

    if (bgFileInputRef.current) {
      bgFileInputRef.current.value = '';
    }
  };

  const handleRemoveBackground = () => {
    if (!scene) return;
    updateScene(scene.id, { backgroundImage: undefined });
    toast({
      title: "Background removed",
      description: "Scene background cleared",
    });
  };

  const handleAddObject = () => {
    if (!scene) return;
    
    const newObject = {
      id: uuidv4(),
      name: `Object ${scene.gameObjects.length + 1}`,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      rotation: 0,
      visible: true,
    };
    
    addGameObject(scene.id, newObject);
    setSelectedObjectId(newObject.id);
  };

  const handleDeleteObject = (id: string) => {
    if (!scene) return;
    deleteGameObject(scene.id, id);
    if (selectedObjectId === id) {
      setSelectedObjectId(null);
    }
  };

  const selectedObject = scene?.gameObjects.find(obj => obj.id === selectedObjectId);

  if (!scene) return <div className="p-8">No scene selected</div>;

  return (
    <div className="h-full flex">
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="brutal-card bg-white p-4">
          <canvas
            ref={canvasRef}
            className="brutal-border"
            style={{ cursor: getCursorStyle(dragMode) }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>

      <div className="w-80 brutal-border border-t-0 border-r-0 border-b-0 bg-white p-6 overflow-auto">
        <div className="mb-6">
          <h3 className="text-xl font-black mb-4 brutal-border border-l-0 border-r-0 border-t-0 pb-2">
            SCENE SETTINGS
          </h3>
          
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs font-black mb-2">BACKGROUND COLOR</label>
              <input
                type="color"
                value={scene.backgroundColor}
                onChange={(e) => updateScene(scene.id, { backgroundColor: e.target.value })}
                className="brutal-border w-full h-12 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-black mb-2">BACKGROUND IMAGE</label>
              <input
                ref={bgFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="hidden"
              />
              
              {scene.backgroundImage ? (
                <div className="brutal-border bg-gray-100 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold">Image uploaded</span>
                    <button
                      onClick={handleRemoveBackground}
                      className="hover:scale-110 transition-transform text-brutal-pink"
                    >
                      <X className="w-4 h-4" strokeWidth={3} />
                    </button>
                  </div>
                  <img
                    src={scene.backgroundImage}
                    alt="Background"
                    className="w-full h-20 object-cover brutal-border"
                  />
                </div>
              ) : (
                <button
                  onClick={() => bgFileInputRef.current?.click()}
                  className="brutal-button bg-brutal-orange text-black w-full py-2 text-xs flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" strokeWidth={3} />
                  UPLOAD IMAGE
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={handleAddObject}
            className="brutal-button bg-brutal-pink text-white w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
            ADD OBJECT
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-black mb-4 brutal-border border-l-0 border-r-0 border-t-0 pb-2">
            OBJECTS ({scene.gameObjects.length})
          </h3>
          <div className="space-y-2">
            {scene.gameObjects.map((obj) => (
              <div
                key={obj.id}
                className={`brutal-border p-3 cursor-pointer transition-colors ${
                  selectedObjectId === obj.id ? 'bg-brutal-blue' : 'bg-white hover:bg-gray-100'
                }`}
                onClick={() => setSelectedObjectId(obj.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black">{obj.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateGameObject(scene.id, obj.id, { visible: !obj.visible });
                      }}
                      className="hover:scale-110 transition-transform"
                    >
                      {obj.visible ? <Eye className="w-4 h-4" strokeWidth={3} /> : <EyeOff className="w-4 h-4" strokeWidth={3} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteObject(obj.id);
                      }}
                      className="hover:scale-110 transition-transform text-brutal-pink"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={3} />
                    </button>
                  </div>
                </div>
                <div className="text-xs font-bold">
                  X: {obj.x} Y: {obj.y} W: {obj.width} H: {obj.height}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedObject && (
          <div className="brutal-card bg-brutal-yellow p-4">
            <h3 className="text-lg font-black mb-4">PROPERTIES</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black mb-1">NAME</label>
                <input
                  type="text"
                  value={selectedObject.name}
                  onChange={(e) => updateGameObject(scene.id, selectedObject.id, { name: e.target.value })}
                  className="brutal-input w-full text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black mb-1">X</label>
                  <input
                    type="number"
                    value={Math.round(selectedObject.x)}
                    onChange={(e) => updateGameObject(scene.id, selectedObject.id, { x: Number(e.target.value) })}
                    className="brutal-input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black mb-1">Y</label>
                  <input
                    type="number"
                    value={Math.round(selectedObject.y)}
                    onChange={(e) => updateGameObject(scene.id, selectedObject.id, { y: Number(e.target.value) })}
                    className="brutal-input w-full text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black mb-1">WIDTH</label>
                  <input
                    type="number"
                    value={Math.round(selectedObject.width)}
                    onChange={(e) => updateGameObject(scene.id, selectedObject.id, { width: Number(e.target.value) })}
                    className="brutal-input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black mb-1">HEIGHT</label>
                  <input
                    type="number"
                    value={Math.round(selectedObject.height)}
                    onChange={(e) => updateGameObject(scene.id, selectedObject.id, { height: Number(e.target.value) })}
                    className="brutal-input w-full text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black mb-1">ROTATION</label>
                <input
                  type="number"
                  value={selectedObject.rotation}
                  onChange={(e) => updateGameObject(scene.id, selectedObject.id, { rotation: Number(e.target.value) })}
                  className="brutal-input w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-black mb-1">SPRITE</label>
                <select
                  value={selectedObject.spriteId || ''}
                  onChange={(e) => updateGameObject(scene.id, selectedObject.id, { spriteId: e.target.value || undefined })}
                  className="brutal-input w-full text-sm"
                >
                  <option value="">None</option>
                  {sprites.map(sprite => (
                    <option key={sprite.id} value={sprite.id}>{sprite.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SceneEditor;