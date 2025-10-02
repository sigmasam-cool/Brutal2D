import { useNavigate } from 'react-router-dom';
import { Gamepad2, Zap, Code, Image, Film, Download } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Gamepad2, title: 'Scene Editor', color: 'bg-brutal-pink', desc: 'Drag & drop game objects' },
    { icon: Image, title: 'Sprite Manager', color: 'bg-brutal-blue', desc: 'Upload & organize assets' },
    { icon: Film, title: 'Animations', color: 'bg-brutal-yellow', desc: 'Create frame animations' },
    { icon: Code, title: 'Scripting', color: 'bg-brutal-green', desc: 'JavaScript game logic' },
    { icon: Download, title: 'Export HTML', color: 'bg-brutal-purple', desc: 'Standalone game files' },
    { icon: Zap, title: 'Real-time', color: 'bg-brutal-orange', desc: 'Instant preview' },
  ];

  return (
    <div className="min-h-screen bg-brutal-yellow">
      <div className="container mx-auto px-6 py-12">
        <header className="text-center mb-16">
          <div className="inline-block brutal-border bg-white px-8 py-4 shadow-brutal-lg mb-8 -rotate-1">
            <h1 className="text-7xl font-black">BRUTAL2D</h1>
          </div>
          <p className="text-3xl font-black uppercase mb-8 rotate-1">
            Make games with JAVASCRIPT.
          </p>
          <button
            onClick={() => navigate('/editor')}
            className="brutal-button bg-brutal-pink text-white text-2xl hover:bg-brutal-pink"
          >
            START CREATING →
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`brutal-card ${feature.color} p-8 transform ${
                index % 2 === 0 ? 'rotate-1' : '-rotate-1'
              } hover:rotate-0 transition-transform`}
            >
              <feature.icon className="w-16 h-16 mb-4" strokeWidth={3} />
              <h3 className="text-2xl font-black mb-2">{feature.title}</h3>
              <p className="text-lg font-bold">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="brutal-card bg-white p-12 text-center">
          <h2 className="text-4xl font-black mb-6">v1.0: THE OVERHAUL UPDATE</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="brutal-border bg-brutal-green p-6">
              <h3 className="text-xl font-black mb-2">NEW EDITOR</h3>
              <p className="font-bold">vscode-like editor.</p>
            </div>
            <div className="brutal-border bg-brutal-blue p-6">
              <h3 className="text-xl font-black mb-2">NEW SPRITE SYSTEM</h3>
              <p className="font-bold">the images revolving</p>
            </div>
            <div className="brutal-border bg-brutal-purple p-6">
              <h3 className="text-xl font-black mb-2">ANIMATIONS</h3>
              <p className="font-bold">Finally!</p>
            </div>
            <div className="brutal-border bg-brutal-orange p-6">
              <h3 className="text-xl font-black mb-2">AND MORE</h3>
              <p className="font-bold">Start making your game!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;