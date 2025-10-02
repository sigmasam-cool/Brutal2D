import React, { useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { useEngine } from '@/contexts/EngineContext';

interface TestWindowProps {
  onClose: () => void;
}

const TestWindow: React.FC<TestWindowProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentScene, sprites, scripts } = useEngine();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const animationFrameRef = useRef<number>();
  const loadedImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const gameObjectsRef = useRef<Record<string, any>>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentScene) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load sprites
    const loadedImages: Record<string, HTMLImageElement> = {};
    sprites.forEach(sprite => {
      const img = new Image();
      img.src = sprite.url;
      img.crossOrigin = 'anonymous';
      loadedImages[sprite.id] = img;
    });
    loadedImagesRef.current = loadedImages;

    // Initialize game objects
    const gameObjects: Record<string, any> = {};
    currentScene.objects.forEach(obj => {
      gameObjects[obj.id] = { ...obj };
    });
    gameObjectsRef.current = gameObjects;

    // Tweening utility
    const activeTweens: any[] = [];
    (window as any).tween = function(objId: string, property: string, target: number, duration: number, callback?: () => void) {
      const obj = gameObjectsRef.current[objId];
      if (!obj) return;

      const start = obj[property];
      const change = target - start;
      const startTime = Date.now();
      
      activeTweens.push({
        objId,
        property,
        start,
        change,
        duration,
        startTime,
        callback
      });
    };

    // Execute scripts
    try {
      scripts.forEach(script => {
        const scriptFunc = new Function('gameObjects', 'ctx', 'currentScene', 'tween', script.content);
        scriptFunc(gameObjectsRef.current, ctx, currentScene, (window as any).tween);
      });
    } catch (error) {
      console.error('Script execution error:', error);
    }

    // Render loop
    function render() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update tweens
      const now = Date.now();
      for (let i = activeTweens.length - 1; i >= 0; i--) {
        const tween = activeTweens[i];
        const elapsed = now - tween.startTime;
        const progress = Math.min(elapsed / tween.duration, 1);
        
        const obj = gameObjectsRef.current[tween.objId];
        if (obj) {
          obj[tween.property] = tween.start + tween.change * progress;
        }
        
        if (progress >= 1) {
          if (tween.callback) tween.callback();
          activeTweens.splice(i, 1);
        }
      }

      // Render objects
      Object.values(gameObjectsRef.current).forEach((obj: any) => {
        if (!obj.visible) return;
        
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.rotation * Math.PI / 180);
        ctx.scale(obj.scaleX, obj.scaleY);
        
        if (obj.type === 'sprite' && obj.sprite) {
          const img = loadedImagesRef.current[obj.sprite];
          if (img && img.complete) {
            ctx.drawImage(img, -obj.width/2, -obj.height/2, obj.width, obj.height);
          } else {
            ctx.fillStyle = '#cccccc';
            ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
          }
        } else if (obj.type === 'panel') {
          ctx.fillStyle = obj.backgroundColor || '#ffffff';
          ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 4;
          ctx.strokeRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
        } else if (obj.type === 'button') {
          ctx.fillStyle = obj.backgroundColor || '#FFE600';
          ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 4;
          ctx.strokeRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(obj.text || 'Button', 0, 0);
        } else if (obj.type === 'label') {
          ctx.fillStyle = obj.color || '#000000';
          ctx.font = `bold ${obj.fontSize || 16}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(obj.text || 'Label', 0, 0);
        }
        
        ctx.restore();
      });
      
      animationFrameRef.current = requestAnimationFrame(render);
    }

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentScene, sprites, scripts]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-8">
      <div 
        className={`brutal-panel bg-white flex flex-col transition-all ${
          isFullscreen ? 'w-full h-full' : 'w-[900px] h-[700px]'
        }`}
      >
        <div className="brutal-border border-b-4 p-4 bg-brutal-green flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase">TEST MODE</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="brutal-button bg-white shadow-brutal-sm p-2"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={onClose}
              className="brutal-button bg-brutal-pink text-white shadow-brutal-sm p-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-gray-100 p-4 flex items-center justify-center overflow-auto">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="brutal-border bg-white shadow-brutal"
          />
        </div>

        <div className="brutal-border border-t-4 p-3 bg-brutal-yellow">
          <p className="font-bold text-sm uppercase">
            🎮 GAME RUNNING • PRESS ESC OR CLICK X TO CLOSE
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestWindow;