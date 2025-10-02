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
  sprite?: string;
  animation?: string;
  script?: string;
  text?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  children?: string[];
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
    canvas { display: block; background: #fff; }
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
    function tween(obj, property, target, duration, callback) {
      const start = obj[property];
      const change = target - start;
      const startTime = Date.now();
      
      function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        obj[property] = start + change * progress;
        
        if (progress < 1) {
          requestAnimationFrame(update);
        } else if (callback) {
          callback();
        }
      }
      update();
    }

    // Execute scripts
    ${scripts.map(script => script.content).join('\\n')}

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      currentScene.objects.forEach(obj => {
        if (!obj.visible) return;
        
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.rotation * Math.PI / 180);
        ctx.scale(obj.scaleX, obj.scaleY);
        
        if (obj.type === 'sprite' && obj.sprite) {
          const img = loadedImages[obj.sprite];
          if (img && img.complete) {
            ctx.drawImage(img, -obj.width/2, -obj.height/2, obj.width, obj.height);
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
          ctx.font = \`bold \${obj.fontSize || 16}px Arial\`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(obj.text || 'Label', 0, 0);
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
      exportToHTML
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