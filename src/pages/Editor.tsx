import React, { useState } from 'react';
import Toolbar from '@/components/editor/Toolbar';
import SceneCanvas from '@/components/editor/SceneCanvas';
import Hierarchy from '@/components/editor/Hierarchy';
import Inspector from '@/components/editor/Inspector';
import ScriptEditor from '@/components/editor/ScriptEditor';
import AssetManager from '@/components/editor/AssetManager';

type EditorTab = 'scene' | 'script' | 'assets';

const Editor = () => {
  const [activeTab, setActiveTab] = useState<EditorTab>('scene');

  return (
    <div className="h-screen flex flex-col bg-white">
      <Toolbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex overflow-hidden">
        <Hierarchy />
        
        <div className="flex-1 flex flex-col border-l-4 border-r-4 border-black">
          {activeTab === 'scene' && <SceneCanvas />}
          {activeTab === 'script' && <ScriptEditor />}
          {activeTab === 'assets' && <AssetManager />}
        </div>
        
        <Inspector />
      </div>
    </div>
  );
};

export default Editor;