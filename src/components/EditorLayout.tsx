import { Outlet, Link, useLocation } from 'react-router-dom';
import { Gamepad2, Image, Film, Code, Download, Play, Save } from 'lucide-react';
import { useGameEngine } from '@/contexts/GameEngineContext';

const EditorLayout = () => {
  const location = useLocation();
  const { getCurrentScene } = useGameEngine();
  const currentScene = getCurrentScene();

  const navItems = [
    { path: '/editor', icon: Gamepad2, label: 'SCENE', color: 'bg-brutal-pink' },
    { path: '/editor/assets', icon: Image, label: 'ASSETS', color: 'bg-brutal-blue' },
    { path: '/editor/animations', icon: Film, label: 'ANIMS', color: 'bg-brutal-yellow' },
    { path: '/editor/scripts', icon: Code, label: 'SCRIPTS', color: 'bg-brutal-green' },
    { path: '/editor/export', icon: Download, label: 'EXPORT', color: 'bg-brutal-purple' },
  ];

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="brutal-border border-t-0 border-l-0 border-r-0 bg-black text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
            <Gamepad2 className="w-8 h-8" strokeWidth={3} />
            <span className="text-2xl font-black">BRUTALENGINE</span>
          </Link>
          {currentScene && (
            <div className="brutal-border bg-brutal-yellow text-black px-4 py-2">
              <span className="font-black">{currentScene.name}</span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button className="brutal-border bg-brutal-green px-4 py-2 flex items-center gap-2 hover:translate-x-[2px] hover:translate-y-[2px] transition-transform">
            <Play className="w-5 h-5" strokeWidth={3} />
            <span className="font-black">PLAY</span>
          </button>
          <button className="brutal-border bg-brutal-blue px-4 py-2 flex items-center gap-2 hover:translate-x-[2px] hover:translate-y-[2px] transition-transform">
            <Save className="w-5 h-5" strokeWidth={3} />
            <span className="font-black">SAVE</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="brutal-border border-t-0 border-l-0 border-b-0 bg-white w-24 flex flex-col">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`brutal-border border-l-0 border-r-0 border-t-0 p-4 flex flex-col items-center gap-2 transition-all ${
                  isActive ? `${item.color}` : 'hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-8 h-8" strokeWidth={3} />
                <span className="text-xs font-black">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EditorLayout;