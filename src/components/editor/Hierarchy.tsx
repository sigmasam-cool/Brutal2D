import React from 'react';
import { useEngine } from '@/contexts/EngineContext';
import { Trash2, Eye, EyeOff } from 'lucide-react';

const Hierarchy: React.FC = () => {
  const { currentScene, selectedObject, selectObject, deleteObject, updateObject } = useEngine();

  if (!currentScene) return null;

  return (
    <div className="w-64 brutal-border border-r-4 bg-white flex flex-col">
      <div className="brutal-border border-b-4 p-4 bg-brutal-yellow">
        <h2 className="text-xl font-black uppercase">HIERARCHY</h2>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {currentScene.objects.length === 0 ? (
          <div className="p-4 text-center">
            <p className="font-bold text-gray-500">NO OBJECTS</p>
            <p className="text-sm font-bold text-gray-400 mt-2">
              ADD OBJECTS FROM TOOLBAR
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {currentScene.objects.map(obj => (
              <div
                key={obj.id}
                onClick={() => selectObject(obj.id)}
                className={`brutal-border p-2 cursor-pointer transition-all flex items-center justify-between ${
                  selectedObject?.id === obj.id
                    ? 'bg-brutal-cyan shadow-brutal-sm translate-x-1 translate-y-1'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold uppercase text-sm truncate">{obj.name}</p>
                  <p className="text-xs font-bold text-gray-500">{obj.type}</p>
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateObject(obj.id, { visible: !obj.visible });
                    }}
                    className="p-1 hover:bg-gray-200 brutal-border"
                  >
                    {obj.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteObject(obj.id);
                    }}
                    className="p-1 hover:bg-red-100 brutal-border"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hierarchy;