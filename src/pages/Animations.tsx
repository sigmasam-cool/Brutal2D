import { useState } from 'react';
import { useGameEngine } from '@/contexts/GameEngineContext';
import { Plus, Trash2, Film } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

const Animations = () => {
  const { animations, sprites, addAnimation, deleteAnimation } = useGameEngine();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAnimation, setNewAnimation] = useState({
    name: '',
    spriteId: '',
    frameRate: 10,
  });
  const { toast } = useToast();

  const handleCreateAnimation = () => {
    if (!newAnimation.name || !newAnimation.spriteId) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const animation = {
      id: uuidv4(),
      name: newAnimation.name,
      spriteId: newAnimation.spriteId,
      frames: [0, 1, 2, 3],
      frameRate: newAnimation.frameRate,
    };

    addAnimation(animation);
    setShowCreateForm(false);
    setNewAnimation({ name: '', spriteId: '', frameRate: 10 });
    toast({
      title: "Animation created!",
      description: `${animation.name} added successfully`,
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-4">ANIMATIONS</h1>
        <p className="text-lg font-bold mb-6">Create frame-based animations</p>
        
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="brutal-button bg-brutal-yellow text-black flex items-center gap-2"
        >
          <Plus className="w-5 h-5" strokeWidth={3} />
          NEW ANIMATION
        </button>
      </div>

      {showCreateForm && (
        <div className="brutal-card bg-brutal-green p-6 mb-8">
          <h3 className="text-2xl font-black mb-4">CREATE ANIMATION</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black mb-2">NAME</label>
              <input
                type="text"
                value={newAnimation.name}
                onChange={(e) => setNewAnimation({ ...newAnimation, name: e.target.value })}
                className="brutal-input w-full"
                placeholder="Walk Cycle"
              />
            </div>
            <div>
              <label className="block text-sm font-black mb-2">SPRITE SHEET</label>
              <select
                value={newAnimation.spriteId}
                onChange={(e) => setNewAnimation({ ...newAnimation, spriteId: e.target.value })}
                className="brutal-input w-full"
              >
                <option value="">Select a sprite...</option>
                {sprites.map(sprite => (
                  <option key={sprite.id} value={sprite.id}>{sprite.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-black mb-2">FRAME RATE (FPS)</label>
              <input
                type="number"
                value={newAnimation.frameRate}
                onChange={(e) => setNewAnimation({ ...newAnimation, frameRate: Number(e.target.value) })}
                className="brutal-input w-full"
                min="1"
                max="60"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateAnimation}
                className="brutal-button bg-black text-white flex-1"
              >
                CREATE
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="brutal-button bg-white flex-1"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {animations.length === 0 ? (
        <div className="brutal-card bg-white p-12 text-center">
          <Film className="w-24 h-24 mx-auto mb-4 opacity-50" strokeWidth={3} />
          <h3 className="text-2xl font-black mb-2">NO ANIMATIONS YET</h3>
          <p className="font-bold text-gray-600">Create your first animation!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animations.map((animation) => {
            const sprite = sprites.find(s => s.id === animation.spriteId);
            return (
              <div key={animation.id} className="brutal-card bg-white p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-black mb-1">{animation.name}</h3>
                    <p className="text-sm font-bold text-gray-600">
                      {sprite?.name || 'Unknown sprite'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      deleteAnimation(animation.id);
                      toast({
                        title: "Animation deleted",
                        description: `${animation.name} removed`,
                      });
                    }}
                    className="hover:scale-110 transition-transform text-brutal-pink"
                  >
                    <Trash2 className="w-5 h-5" strokeWidth={3} />
                  </button>
                </div>
                <div className="brutal-border bg-gray-100 p-4 mb-3">
                  <div className="text-sm font-bold">
                    <div>Frames: {animation.frames.length}</div>
                    <div>FPS: {animation.frameRate}</div>
                  </div>
                </div>
                {sprite && (
                  <div className="brutal-border bg-gray-100 aspect-video flex items-center justify-center">
                    <img
                      src={sprite.url}
                      alt={sprite.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Animations;