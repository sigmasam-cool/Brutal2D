import { useGameEngine } from '@/contexts/GameEngineContext';
import { Download, FileCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Export = () => {
  const { scenes, sprites, animations, scripts } = useGameEngine();
  const { toast } = useToast();

  const generateHTML = () => {
    const gameData = {
      scenes,
      sprites,
      animations,
      scripts,
    };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BrutalEngine Game</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background: #000; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      min-height: 100vh;
      font-family: Arial, sans-serif;
    }
    canvas { 
      border: 4px solid #fff; 
      box-shadow: 10px 10px 0px 0px #FF006E;
    }
  </style>
</head>
<body>
  <canvas id="gameCanvas"></canvas>
  <script>
    const gameData = ${JSON.stringify(gameData, null, 2)};
    
    class Game {
      constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentScene = gameData.scenes[0];
        this.sprites = new Map();
        this.backgroundImages = new Map();
        this.lastTime = 0;
        
        this.canvas.width = this.currentScene.width;
        this.canvas.height = this.currentScene.height;
        
        this.loadAssets();
        this.gameLoop(0);
      }
      
      loadAssets() {
        // Load sprites
        gameData.sprites.forEach(sprite => {
          const img = new Image();
          img.src = sprite.url;
          this.sprites.set(sprite.id, img);
        });
        
        // Load background images
        gameData.scenes.forEach(scene => {
          if (scene.backgroundImage) {
            const img = new Image();
            img.src = scene.backgroundImage;
            this.backgroundImages.set(scene.id, img);
          }
        });
      }
      
      gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((t) => this.gameLoop(t));
      }
      
      update(deltaTime) {
        this.currentScene.gameObjects.forEach(obj => {
          const script = gameData.scripts.find(s => s.id === obj.scriptId);
          if (script) {
            try {
              const updateFn = new Function('deltaTime', script.code + '; if (typeof update === "function") update.call(this, deltaTime);');
              updateFn.call(obj, deltaTime);
            } catch (e) {
              console.error('Script error:', e);
            }
          }
        });
      }
      
      render() {
        // Draw background
        const bgImage = this.backgroundImages.get(this.currentScene.id);
        if (bgImage && bgImage.complete) {
          this.ctx.drawImage(bgImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
          this.ctx.fillStyle = this.currentScene.backgroundColor;
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Draw game objects
        this.currentScene.gameObjects.forEach(obj => {
          if (!obj.visible) return;
          
          this.ctx.save();
          this.ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
          this.ctx.rotate((obj.rotation * Math.PI) / 180);
          
          const sprite = this.sprites.get(obj.spriteId);
          if (sprite && sprite.complete) {
            this.ctx.drawImage(sprite, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
          } else {
            this.ctx.fillStyle = '#FF006E';
            this.ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
          }
          
          this.ctx.restore();
        });
      }
    }
    
    window.addEventListener('load', () => {
      new Game();
    });
  </script>
</body>
</html>`;

    return html;
  };

  const handleExport = () => {
    const html = generateHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Game exported!",
      description: "Your game has been exported as game.html",
    });
  };

  const handleExportJSON = () => {
    const gameData = { scenes, sprites, animations, scripts };
    const json = JSON.stringify(gameData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Data exported!",
      description: "Game data exported as JSON",
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-black mb-4">EXPORT GAME</h1>
      <p className="text-lg font-bold mb-8">Export your game as a standalone HTML file</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="brutal-card bg-brutal-purple p-8">
          <Download className="w-16 h-16 mb-4" strokeWidth={3} />
          <h2 className="text-2xl font-black mb-3">EXPORT HTML</h2>
          <p className="font-bold mb-6">
            Export as a single HTML file that runs in any browser. Perfect for sharing!
          </p>
          <button
            onClick={handleExport}
            className="brutal-button bg-black text-white w-full flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" strokeWidth={3} />
            DOWNLOAD HTML
          </button>
        </div>

        <div className="brutal-card bg-brutal-orange p-8">
          <FileCode className="w-16 h-16 mb-4" strokeWidth={3} />
          <h2 className="text-2xl font-black mb-3">EXPORT JSON</h2>
          <p className="font-bold mb-6">
            Export game data as JSON for backup or importing into other projects.
          </p>
          <button
            onClick={handleExportJSON}
            className="brutal-button bg-black text-white w-full flex items-center justify-center gap-2"
          >
            <FileCode className="w-5 h-5" strokeWidth={3} />
            DOWNLOAD JSON
          </button>
        </div>
      </div>

      <div className="brutal-card bg-white p-8">
        <h2 className="text-2xl font-black mb-4">PROJECT STATS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="brutal-border bg-brutal-pink p-4 text-center">
            <div className="text-4xl font-black mb-2">{scenes.length}</div>
            <div className="font-bold">SCENES</div>
          </div>
          <div className="brutal-border bg-brutal-blue p-4 text-center">
            <div className="text-4xl font-black mb-2">{sprites.length}</div>
            <div className="font-bold">SPRITES</div>
          </div>
          <div className="brutal-border bg-brutal-yellow p-4 text-center">
            <div className="text-4xl font-black mb-2">{animations.length}</div>
            <div className="font-bold">ANIMATIONS</div>
          </div>
          <div className="brutal-border bg-brutal-green p-4 text-center">
            <div className="text-4xl font-black mb-2">{scripts.length}</div>
            <div className="font-bold">SCRIPTS</div>
          </div>
        </div>
      </div>

      <div className="brutal-card bg-brutal-yellow p-8 mt-6">
        <h2 className="text-2xl font-black mb-4">HOW TO USE</h2>
        <ol className="space-y-2 font-bold">
          <li>1. Click "DOWNLOAD HTML" to export your game</li>
          <li>2. Open the downloaded file in any web browser</li>
          <li>3. Your game will run immediately - no server needed!</li>
          <li>4. Share the HTML file with anyone to play your game</li>
        </ol>
      </div>
    </div>
  );
};

export default Export;