import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Play, Save, Download, Plus, Image, Code, Layout } from 'lucide-react';
import { useEngine } from '@/contexts/EngineContext';
import { useToast } from '@/hooks/use-toast';
import TestWindow from './TestWindow';

interface ToolbarProps {
  activeTab: 'scene' | 'script' | 'assets';
  setActiveTab: (tab: 'scene' | 'script' | 'assets') => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTab, setActiveTab }) => {
  const { exportToHTML, addObject, currentScene } = useEngine();
  const { toast } = useToast();
  const [showTestWindow, setShowTestWindow] = useState(false);

  const handleExport = () => {
    const html = exportToHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game.html';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "EXPORTED!",
      description: "Your game has been exported to HTML.",
    });
  };

  const handleTest = () => {
    setShowTestWindow(true);
    toast({
      title: "TESTING GAME!",
      description: "Your game is now running in test mode.",
    });
  };

  const handleAddObject = (type: 'sprite' | 'panel' | 'button' | 'label') => {
    // Calculate next layer (highest + 1)
    const maxLayer = currentScene?.objects.length 
      ? Math.max(...currentScene.objects.map(o => o.layer || 0))
      : 0;

    addObject({
      name: `New ${type}`,
      type,
      x: 400,
      y: 300,
      width: type === 'label' ? 200 : 100,
      height: type === 'label' ? 50 : 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      visible: true,
      layer: maxLayer + 1,
      text: type === 'label' ? 'LABEL TEXT' : type === 'button' ? 'BUTTON' : undefined,
      fontSize: 16,
      color: '#000000',
      backgroundColor: type === 'panel' ? '#FFFFFF' : type === 'button' ? '#FFE600' : undefined,
    });
    
    toast({
      title: "OBJECT ADDED!",
      description: `New ${type} added to scene.`,
    });
  };

  return (
    <>
      <div className="brutal-border border-b-4 bg-white p-4 flex items-center gap-4">
        <Link to="/" className="brutal-button bg-brutal-yellow shadow-brutal-sm flex items-center gap-2">
          <Home size={20} />
          HOME
        </Link>

        <div className="h-8 w-1 bg-black"></div>

        <button
          onClick={() => setActiveTab('scene')}
          className={`brutal-button shadow-brutal-sm flex items-center gap-2 ${
            activeTab === 'scene' ? 'bg-brutal-cyan' : 'bg-white'
          }`}
        >
          <Layout size={20} />
          SCENE
        </button>

        <button
          onClick={() => setActiveTab('script')}
          className={`brutal-button shadow-brutal-sm flex items-center gap-2 ${
            activeTab === 'script' ? 'bg-brutal-cyan' : 'bg-white'
          }`}
        >
          <Code size={20} />
          SCRIPTS
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`brutal-button shadow-brutal-sm flex items-center gap-2 ${
            activeTab === 'assets' ? 'bg-brutal-cyan' : 'bg-white'
          }`}
        >
          <Image size={20} />
          ASSETS
        </button>

        <div className="h-8 w-1 bg-black"></div>

        <div className="flex items-center gap-2">
          <span className="font-bold uppercase text-sm">ADD:</span>
          <button
            onClick={() => handleAddObject('sprite')}
            className="brutal-button bg-brutal-green shadow-brutal-sm text-sm"
          >
            SPRITE
          </button>
          <button
            onClick={() => handleAddObject('panel')}
            className="brutal-button bg-brutal-purple text-white shadow-brutal-sm text-sm"
          >
            PANEL
          </button>
          <button
            onClick={() => handleAddObject('button')}
            className="brutal-button bg-brutal-orange text-white shadow-brutal-sm text-sm"
          >
            BUTTON
          </button>
          <button
            onClick={() => handleAddObject('label')}
            className="brutal-button bg-brutal-pink text-white shadow-brutal-sm text-sm"
          >
            LABEL
          </button>
        </div>

        <div className="flex-1"></div>

        <button
          onClick={handleTest}
          className="brutal-button bg-brutal-green shadow-brutal flex items-center gap-2"
        >
          <Play size={20} />
          TEST GAME
        </button>

        <button
          onClick={handleExport}
          className="brutal-button bg-brutal-pink text-white shadow-brutal flex items-center gap-2"
        >
          <Download size={20} />
          EXPORT HTML
        </button>
      </div>

      {showTestWindow && (
        <TestWindow onClose={() => setShowTestWindow(false)} />
      )}
    </>
  );
};

export default Toolbar;