import React, { createContext, useContext, useState, useCallback } from 'react';

export interface GameObject {
  id: string;
  name: string;
  type: 'sprite' | 'panel' | 'button' | 'label';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  visible: boolean;
  layer: number; // Layer for rendering order (higher = on top)
  sprite?: string;
  animation?: string;
  script?: string;
  text?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  children?: string[];
  onClick?: string; // Function name to call on click
}

export interface Scene {
  id: string;
  name: string;
  objects: GameObject[];
}

export interface Script {
  id: string;
  name: string;
  content: string;
}

export interface Sprite {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
}

export interface Animation {
  id: string;
  name: string;
  frames: string[];
  frameRate: number;
}

interface EngineContextType {
  scenes: Scene[];
  currentScene: Scene | null;
  selectedObject: GameObject | null;
  scripts: Script[];
  sprites: Sprite[];
  animations: Animation[];
  addScene: (name: string) => void;
  deleteScene: (id: string) => void;
  setCurrentScene: (id: string) => void;
  addObject: (object: Omit<GameObject, 'id'>) => void;
  updateObject: (id: string, updates: Partial<GameObject>) => void;
  deleteObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  addScript: (name: string, content: string) => void;
  updateScript: (id: string, content: string) => void;
  deleteScript: (id: string) => void;
  addSprite: (sprite: Omit<Sprite, 'id'>) => void;
  deleteSprite: (id: string) => void;
  addAnimation: (animation: Omit<Animation, 'id'>) => void;
  deleteAnimation: (id: string) => void;
  exportToHTML: () => string;
  moveObjectLayer: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
}

const EngineContext = createContext<EngineContextType | null>(null);

export const EngineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: '1',
      name: 'Main Scene',
      objects: []
    }
  ]);
  const [currentScene, setCurrentSceneState] = useState<Scene | null>(scenes[0]);
  const [selectedObject, setSelectedObject] = useState<GameObject | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [sprites, setSprites] = useState<Sprite[]>([]);
  const [animations, setAnimations] = useState<Animation[]>([]);

  const addScene = useCallback((name: string) => {
    const newScene: Scene = {
      id: Date.now().toString(),
      name,
      objects: []
    };
    setScenes(prev => [...prev, newScene]);
  }, []);

  const deleteScene = useCallback((id: string) => {
    setScenes(prev => prev.filter(s => s.id !== id));
    if (currentScene?.id === id) {
      setCurrentSceneState(scenes[0] || null);
    }
  }, [currentScene, scenes]);

  const setCurrentScene = useCallback((id: string) => {
    const scene = scenes.find(s => s.id === id);
    if (scene) {
      setCurrentSceneState(scene);
      setSelectedObject(null);
    }
  }, [scenes]);

  const addObject = useCallback((object: Omit<GameObject, 'id'>) => {
    if (!currentScene) return;
    
    const newObject: GameObject = {
      ...object,
      id: Date.now().toString()
    };

    setScenes(prev => prev.map(scene => 
      scene.id === currentScene.id
        ? { ...scene, objects: [...scene.objects, newObject] }
        : scene
    ));

    setCurrentSceneState(prev => prev ? {
      ...prev,
      objects: [...prev.objects, newObject]
    } : null);
  }, [currentScene]);

  const updateObject = useCallback((id: string, updates: Partial<GameObject>) => {
    if (!currentScene) return;

    setScenes(prev => prev.map(scene =>
      scene.id === currentScene.id
        ? {
            ...scene,
            objects: scene.objects.map(obj =>
              obj.id === id ? { ...obj, ...updates } : obj
            )
          }
        : scene
    ));

    setCurrentSceneState(prev => prev ? {
      ...prev,
      objects: prev.objects.map(obj =>
        obj.id === id ? { ...obj, ...updates } : obj
      )
    } : null);

    if (selectedObject?.id === id) {
      setSelectedObject(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [currentScene, selectedObject]);

  const deleteObject = useCallback((id: string) => {
    if (!currentScene) return;

    setScenes(prev => prev.map(scene =>
      scene.id === currentScene.id
        ? { ...scene, objects: scene.objects.filter(obj => obj.id !== id) }
        : scene
    ));

    setCurrentSceneState(prev => prev ? {
      ...prev,
      objects: prev.objects.filter(obj => obj.id !== id)
    } : null);

    if (selectedObject?.id === id) {
      setSelectedObject(null);
    }
  }, [currentScene, selectedObject]);

  const selectObject = useCallback((id: string | null) => {
    if (!id) {
      setSelectedObject(null);
      return;
    }
    const obj = currentScene?.objects.find(o => o.id === id);
    setSelectedObject(obj || null);
  }, [currentScene]);

  const moveObjectLayer = useCallback((id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    if (!currentScene) return;

    const obj = currentScene.objects.find(o => o.id === id);
    if (!obj) return;

    const sortedObjects = [...currentScene.objects].sort((a, b) => a.layer - b.layer);
    const currentIndex = sortedObjects.findIndex(o => o.id === id);

    let newLayer = obj.layer;

    if (direction === 'up' && currentIndex < sortedObjects.length - 1) {
      const nextObj = sortedObjects[currentIndex + 1];
      newLayer = nextObj.layer + 1;
    } else if (direction === 'down' && currentIndex > 0) {
      const prevObj = sortedObjects[currentIndex - 1];
      newLayer = prevObj.layer - 1;
    } else if (direction === 'top') {
      const maxLayer = Math.max(...sortedObjects.map(o => o.layer));
      newLayer = maxLayer + 1;
    } else if (direction === 'bottom') {
      const minLayer = Math.min(...sortedObjects.map(o => o.layer));
      newLayer = minLayer - 1;
    }

    updateObject(id, { layer: newLayer });
  }, [currentScene, updateObject]);

  const addScript = useCallback((name: string, content: string) => {
    const newScript: Script = {
      id: Date.now().toString(),
      name,
      content
    };
    setScripts(prev => [...prev, newScript]);
  }, []);

  const updateScript = useCallback((id: string, content: string) => {
    setScripts(prev => prev.map(script =>
      script.id === id ? { ...script, content } : script
    ));
  }, []);

  const deleteScript = useCallback((id: string) => {
    setScripts(prev => prev.filter(s => s.id !== id));
  }, []);

  const addSprite = useCallback((sprite: Omit<Sprite, 'id'>) => {
    const newSprite: Sprite = {
      ...sprite,
      id: Date.now().toString()
    };
    setSprites(prev => [...prev, newSprite]);
  }, []);

  const deleteSprite = useCallback((id: string) => {
    setSprites(prev => prev.filter(s => s.id !== id));
  }, []);

  const addAnimation = useCallback((animation: Omit<Animation, 'id'>) => {
    const newAnimation: Animation = {
      ...animation,
      id: Date.now().toString()
    };
    setAnimations(prev => [...prev, newAnimation]);
  }, []);

  const deleteAnimation = useCallback((id: string) => {
    setAnimations(prev => prev.filter(a => a.id !== id));
  }, []);

  const exportToHTML = useCallback(() => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BrutalEngine Game</title>
  <style>
    body { margin: 0; padding: 0; overflow: hidden; }
    canvas { display: block; background: #fff; cursor: pointer; }
  </style>
</head>
<body>
  <canvas id="gameCanvas"></canvas>
  <script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    const scenes = ${JSON.stringify(scenes)};
    const sprites = ${JSON.stringify(sprites)};
    const scripts = ${JSON.stringify(scripts)};
    
    let currentScene = scenes[0];
    const loadedImages = {};
    const gameObjects = {};

    // Load sprites
    sprites.forEach(sprite => {
      const img = new Image();
      img.src = sprite.url;
      loadedImages[sprite.id] = img;
    });

    // Initialize game objects
    currentScene.objects.forEach(obj => {
      gameObjects[obj.id] = { ...obj };
    });

    // Tweening utility
    const activeTweens = [];
    function tween(objId, property, target, duration, callback) {
      const obj = gameObjects[objId];
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
    }

    // Update label text
    function updateLabel(objId, newText) {
      const obj = gameObjects[objId];
      if (obj && (obj.type === 'label' || obj.type === 'button')) {
        obj.text = newText;
      }
    }

    // Get object by name
    function getObjectByName(name) {
      return Object.values(gameObjects).find(obj => obj.name === name);
    }

    // Click detection
    function isPointInObject(x, y, obj) {
      const dx = x - obj.x;
      const dy = y - obj.y;
      const angle = -obj.rotation * Math.PI / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;
      
      return Math.abs(localX) <= obj.width / 2 && Math.abs(localY) <= obj.height / 2;
    }

    // Handle canvas clicks
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Sort by layer (highest first) and check clicks
      const sortedObjects = Object.values(gameObjects).sort((a, b) => b.layer - a.layer);
      for (const obj of sortedObjects) {
        if (!obj.visible) continue;
        if (isPointInObject(x, y, obj) && obj.onClick) {
          try {
            eval(obj.onClick + '()');
          } catch (error) {
            console.error('onClick error:', error);
          }
          break;
        }
      }
    });

    // Execute scripts
    ${scripts.map(script => script.content).join('\\n')}

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update tweens
      const now = Date.now();
      for (let i = activeTweens.length - 1; i >= 0; i--) {
        const tween = activeTweens[i];
        const elapsed = now - tween.startTime;
        const progress = Math.min(elapsed / tween.duration, 1);
        
        const obj = gameObjects[tween.objId];
        if (obj) {
          obj[tween.property] = tween.start + tween.change * progress;
        }
        
        if (progress >= 1) {
          if (tween.callback) tween.callback();
          activeTweens.splice(i, 1);
        }
      }
      
      // Sort objects by layer before rendering
      const sortedObjects = currentScene.objects
        .map(obj => gameObjects[obj.id])
        .filter(obj => obj)
        .sort((a, b) => a.layer - b.layer);
      
      sortedObjects.forEach(gameObj => {
        if (!gameObj.visible) return;
        
        ctx.save();
        ctx.translate(gameObj.x, gameObj.y);
        ctx.rotate(gameObj.rotation * Math.PI / 180);
        ctx.scale(gameObj.scaleX, gameObj.scaleY);
        
        if (gameObj.type === 'sprite' && gameObj.sprite) {
          const img = loadedImages[gameObj.sprite];
          if (img && img.complete) {
            ctx.drawImage(img, -gameObj.width/2, -gameObj.height/2, gameObj.width, gameObj.height);
          }
        } else if (gameObj.type === 'panel') {
          ctx.fillStyle = gameObj.backgroundColor || '#ffffff';
          ctx.fillRect(-gameObj.width/2, -gameObj.height/2, gameObj.width, gameObj.height);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 4;
          ctx.strokeRect(-gameObj.width/2, -gameObj.height/2, gameObj.width, gameObj.height);
        } else if (gameObj.type === 'button') {
          ctx.fillStyle = gameObj.backgroundColor || '#FFE600';
          ctx.fillRect(-gameObj.width/2, -gameObj.height/2, gameObj.width, gameObj.height);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 4;
          ctx.strokeRect(-gameObj.width/2, -gameObj.height/2, gameObj.width, gameObj.height);
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(gameObj.text || 'Button', 0, 0);
        } else if (gameObj.type === 'label') {
          ctx.fillStyle = gameObj.color || '#000000';
          ctx.font = \`bold \${gameObj.fontSize || 16}px Arial\`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(gameObj.text || 'Label', 0, 0);
        }
        
        ctx.restore();
      });
      
      requestAnimationFrame(render);
    }

    render();
  </script>
</body>
</html>`;
    return html;
  }, [scenes, sprites, scripts]);

  return (
    <EngineContext.Provider value={{
      scenes,
      currentScene,
      selectedObject,
      scripts,
      sprites,
      animations,
      addScene,
      deleteScene,
      setCurrentScene,
      addObject,
      updateObject,
      deleteObject,
      selectObject,
      addScript,
      updateScript,
      deleteScript,
      addSprite,
      deleteSprite,
      addAnimation,
      deleteAnimation,
      exportToHTML,
      moveObjectLayer
    }}>
      {children}
    </EngineContext.Provider>
  );
};

export const useEngine = () => {
  const context = useContext(EngineContext);
  if (!context) throw new Error('useEngine must be used within EngineProvider');
  return context;
};