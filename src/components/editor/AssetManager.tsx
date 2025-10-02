import React, { useState } from 'react';
import { useEngine } from '@/contexts/EngineContext';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AssetManager: React.FC = () => {
  const { sprites, addSprite, deleteSprite } = useEngine();
  const [spriteUrl, setSpriteUrl] = useState('');
  const [spriteName, setSpriteName] = useState('');
  const { toast } = useToast();

  const handleAddSprite = () => {
    if (spriteUrl.trim() && spriteName.trim()) {
      const img = new Image();
      img.onload = () => {
        addSprite({
          name: spriteName,
          url: spriteUrl,
          width: img.width,
          height: img.height
        });
        setSpriteUrl('');
        setSpriteName('');
        toast({
          title: "SPRITE ADDED!",
          description: `${spriteName} has been added to assets.`,
        });
      };
      img.onerror = () => {
        toast({
          title: "ERROR!",
          description: "Failed to load image. Check the URL.",
          variant: "destructive"
        });
      };
      img.src = spriteUrl;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          addSprite({
            name: file.name.replace(/\.[^/.]+$/, ''),
            url: url,
            width: img.width,
            height: img.height
          });
          toast({
            title: "SPRITE UPLOADED!",
            description: `${file.name} has been added.`,
          });
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      <div className="brutal-border border-b-4 p-4 bg-brutal-orange text-white">
        <h2 className="text-2xl font-black uppercase">ASSET MANAGER</h2>
      </div>

      <div className="p-6 space-y-4">
        <div className="brutal-panel p-6 bg-white">
          <h3 className="text-xl font-black uppercase mb-4">ADD SPRITE</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block font-bold uppercase text-sm mb-2">NAME</label>
              <input
                type="text"
                value={spriteName}
                onChange={(e) => setSpriteName(e.target.value)}
                placeholder="SPRITE NAME"
                className="brutal-input w-full"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-sm mb-2">IMAGE URL</label>
              <input
                type="text"
                value={spriteUrl}
                onChange={(e) => setSpriteUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                className="brutal-input w-full"
              />
            </div>

            <button
              onClick={handleAddSprite}
              className="brutal-button bg-brutal-green shadow-brutal w-full flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              ADD FROM URL
            </button>

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="brutal-button bg-brutal-purple text-white shadow-brutal w-full flex items-center justify-center gap-2 pointer-events-none">
                <Upload size={20} />
                UPLOAD FILE
              </button>
            </div>
          </div>
        </div>

        <div className="brutal-panel p-6 bg-white">
          <h3 className="text-xl font-black uppercase mb-4">SPRITES ({sprites.length})</h3>
          
          {sprites.length === 0 ? (
            <p className="font-bold text-gray-500 text-center py-8">NO SPRITES YET</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sprites.map(sprite => (
                <div key={sprite.id} className="brutal-border bg-white p-2">
                  <div className="aspect-square bg-gray-100 mb-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={sprite.url}
                      alt={sprite.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <p className="font-bold text-sm truncate mb-2">{sprite.name}</p>
                  <p className="text-xs font-bold text-gray-500 mb-2">
                    {sprite.width}x{sprite.height}
                  </p>
                  <button
                    onClick={() => deleteSprite(sprite.id)}
                    className="brutal-button bg-red-500 text-white shadow-brutal-sm w-full flex items-center justify-center gap-1 text-sm py-1"
                  >
                    <Trash2 size={12} />
                    DELETE
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="brutal-panel p-6 bg-brutal-yellow">
          <h3 className="text-lg font-black uppercase mb-2">TIPS:</h3>
          <ul className="text-sm font-bold space-y-1">
            <li>• USE TRANSPARENT PNG FILES FOR BEST RESULTS</li>
            <li>• RECOMMENDED SIZE: 32x32 TO 512x512 PIXELS</li>
            <li>• YOU CAN USE UNSPLASH URLS FOR TESTING</li>
            <li>• EXAMPLE: https://images.unsplash.com/photo-...</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AssetManager;