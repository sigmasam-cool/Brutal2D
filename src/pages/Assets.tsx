import { useRef } from 'react';
import { useGameEngine } from '@/contexts/GameEngineContext';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

const Assets = () => {
  const { sprites, addSprite, deleteSprite } = useGameEngine();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file",
          description: "Please upload image files only",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const sprite = {
            id: uuidv4(),
            name: file.name.replace(/\.[^/.]+$/, ''),
            url: event.target?.result as string,
            width: img.width,
            height: img.height,
          };
          addSprite(sprite);
          toast({
            title: "Sprite added!",
            description: `${sprite.name} uploaded successfully`,
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-4">SPRITE ASSETS</h1>
        <p className="text-lg font-bold mb-6">Upload and manage your game sprites</p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="brutal-button bg-brutal-blue text-white flex items-center gap-2"
        >
          <Upload className="w-5 h-5" strokeWidth={3} />
          UPLOAD SPRITES
        </button>
      </div>

      {sprites.length === 0 ? (
        <div className="brutal-card bg-white p-12 text-center">
          <ImageIcon className="w-24 h-24 mx-auto mb-4 opacity-50" strokeWidth={3} />
          <h3 className="text-2xl font-black mb-2">NO SPRITES YET</h3>
          <p className="font-bold text-gray-600">Upload some images to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sprites.map((sprite) => (
            <div key={sprite.id} className="brutal-card bg-white p-4 hover:shadow-brutal transition-shadow">
              <div className="brutal-border bg-gray-100 aspect-square mb-3 flex items-center justify-center overflow-hidden">
                <img
                  src={sprite.url}
                  alt={sprite.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <h3 className="font-black text-sm mb-2 truncate">{sprite.name}</h3>
              <p className="text-xs font-bold text-gray-600 mb-3">
                {sprite.width} × {sprite.height}
              </p>
              <button
                onClick={() => {
                  deleteSprite(sprite.id);
                  toast({
                    title: "Sprite deleted",
                    description: `${sprite.name} removed`,
                  });
                }}
                className="brutal-button bg-brutal-pink text-white w-full py-2 text-xs flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" strokeWidth={3} />
                DELETE
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assets;