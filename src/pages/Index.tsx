import { Link } from 'react-router-dom';
import { Play, Code, Image, FileCode } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-brutal-yellow flex flex-col">
      <header className="brutal-border border-b-4 bg-white p-6">
        <h1 className="text-6xl font-black uppercase tracking-tight">
          BRUTALENGINE 2D
        </h1>
        <p className="text-xl font-bold mt-2">
          NO NONSENSE. JUST GAMES.
        </p>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <div className="brutal-panel p-12 mb-8 bg-white">
            <h2 className="text-4xl font-black uppercase mb-6">
              BUILD 2D GAMES. FAST.
            </h2>
            <p className="text-xl font-bold mb-8 leading-relaxed">
              A BRUTALLY SIMPLE GAME ENGINE WITH EVERYTHING YOU NEED:
              SCENE EDITOR, SCRIPTING, ANIMATIONS, AND HTML EXPORT.
            </p>
            
            <Link
              to="/editor"
              className="brutal-button bg-brutal-pink text-white shadow-brutal inline-flex items-center gap-3 text-xl"
            >
              <Play size={24} />
              START CREATING
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="brutal-panel p-6 bg-brutal-cyan">
              <Code size={48} className="mb-4" />
              <h3 className="text-2xl font-black uppercase mb-2">SCRIPTING</h3>
              <p className="font-bold">
                ADVANCED SCRIPT EDITOR WITH SYNTAX HIGHLIGHTING
              </p>
            </div>

            <div className="brutal-panel p-6 bg-brutal-green">
              <Image size={48} className="mb-4" />
              <h3 className="text-2xl font-black uppercase mb-2">SPRITES</h3>
              <p className="font-bold">
                UPLOAD SPRITES AND CREATE ANIMATIONS
              </p>
            </div>

            <div className="brutal-panel p-6 bg-brutal-purple text-white">
              <FileCode size={48} className="mb-4" />
              <h3 className="text-2xl font-black uppercase mb-2">EXPORT</h3>
              <p className="font-bold">
                EXPORT YOUR GAME AS STANDALONE HTML
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="brutal-border border-t-4 bg-white p-6 text-center">
        <p className="font-bold text-lg">
          BRUTAL2D: THE OVERHAUL
        </p>
      </footer>
    </div>
  );
};

export default Index;