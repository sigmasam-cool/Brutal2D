import React, { createContext, useContext, useState, useCallback } from 'react';

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
  spriteId: string;
  frames: number[];
  frameRate: number;
}

export interface GameObject {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  spriteId?: string;
  animationId?: string;
  scriptId?: string;
  rotation: number;
  visible: boolean;
}

export interface Script {
  id: string;
  name: string;
  code: string;
}

export interface Scene {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  gameObjects: GameObject[];
}

interface GameEngineContextType {
  scenes: Scene[];
  currentSceneId: string | null;
  sprites: Sprite[];
  animations: Animation[];
  scripts: Script[];
  addScene: (scene: Scene) => void;
  updateScene: (id: string, scene: Partial<Scene>) => void;
  deleteScene: (id: string) => void;
  setCurrentScene: (id: string) => void;
  addSprite: (sprite: Sprite) => void;
  deleteSprite: (id: string) => void;
  addAnimation: (animation: Animation) => void;
  deleteAnimation: (id: string) => void;
  addScript: (script: Script) => void;
  updateScript: (id: string, code: string) => void;
  deleteScript: (id: string) => void;
  addGameObject: (sceneId: string, gameObject: GameObject) => void;
  updateGameObject: (sceneId: string, id: string, updates: Partial<GameObject>) => void;
  deleteGameObject: (sceneId: string, id: string) => void;
  getCurrentScene: () => Scene | null;
}

const GameEngineContext = createContext<GameEngineContextType | null>(null);

export const GameEngineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: '1',
      name: 'Main Scene',
      width: 800,
      height: 600,
      backgroundColor: '#06FFA5',
      gameObjects: [],
    },
  ]);
  const [currentSceneId, setCurrentSceneId] = useState<string>('1');
  const [sprites, setSprites] = useState<Sprite[]>([]);
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);

  const addScene = useCallback((scene: Scene) => {
    setScenes(prev => [...prev, scene]);
  }, []);

  const updateScene = useCallback((id: string, updates: Partial<Scene>) => {
    setScenes(prev => prev.map(scene => 
      scene.id === id ? { ...scene, ...updates } : scene
    ));
  }, []);

  const deleteScene = useCallback((id: string) => {
    setScenes(prev => prev.filter(scene => scene.id !== id));
    if (currentSceneId === id) {
      setCurrentSceneId(scenes[0]?.id || null);
    }
  }, [currentSceneId, scenes]);

  const setCurrentScene = useCallback((id: string) => {
    setCurrentSceneId(id);
  }, []);

  const addSprite = useCallback((sprite: Sprite) => {
    setSprites(prev => [...prev, sprite]);
  }, []);

  const deleteSprite = useCallback((id: string) => {
    setSprites(prev => prev.filter(sprite => sprite.id !== id));
  }, []);

  const addAnimation = useCallback((animation: Animation) => {
    setAnimations(prev => [...prev, animation]);
  }, []);

  const deleteAnimation = useCallback((id: string) => {
    setAnimations(prev => prev.filter(anim => anim.id !== id));
  }, []);

  const addScript = useCallback((script: Script) => {
    setScripts(prev => [...prev, script]);
  }, []);

  const updateScript = useCallback((id: string, code: string) => {
    setScripts(prev => prev.map(script => 
      script.id === id ? { ...script, code } : script
    ));
  }, []);

  const deleteScript = useCallback((id: string) => {
    setScripts(prev => prev.filter(script => script.id !== id));
  }, []);

  const addGameObject = useCallback((sceneId: string, gameObject: GameObject) => {
    setScenes(prev => prev.map(scene => 
      scene.id === sceneId 
        ? { ...scene, gameObjects: [...scene.gameObjects, gameObject] }
        : scene
    ));
  }, []);

  const updateGameObject = useCallback((sceneId: string, id: string, updates: Partial<GameObject>) => {
    setScenes(prev => prev.map(scene => 
      scene.id === sceneId 
        ? {
            ...scene,
            gameObjects: scene.gameObjects.map(obj =>
              obj.id === id ? { ...obj, ...updates } : obj
            ),
          }
        : scene
    ));
  }, []);

  const deleteGameObject = useCallback((sceneId: string, id: string) => {
    setScenes(prev => prev.map(scene => 
      scene.id === sceneId 
        ? { ...scene, gameObjects: scene.gameObjects.filter(obj => obj.id !== id) }
        : scene
    ));
  }, []);

  const getCurrentScene = useCallback(() => {
    return scenes.find(scene => scene.id === currentSceneId) || null;
  }, [scenes, currentSceneId]);

  return (
    <GameEngineContext.Provider
      value={{
        scenes,
        currentSceneId,
        sprites,
        animations,
        scripts,
        addScene,
        updateScene,
        deleteScene,
        setCurrentScene,
        addSprite,
        deleteSprite,
        addAnimation,
        deleteAnimation,
        addScript,
        updateScript,
        deleteScript,
        addGameObject,
        updateGameObject,
        deleteGameObject,
        getCurrentScene,
      }}
    >
      {children}
    </GameEngineContext.Provider>
  );
};

export const useGameEngine = () => {
  const context = useContext(GameEngineContext);
  if (!context) {
    throw new Error('useGameEngine must be used within GameEngineProvider');
  }
  return context;
};