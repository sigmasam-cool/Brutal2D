import React from 'react';
import { useEngine } from '@/contexts/EngineContext';
import { Trash2, Eye, EyeOff, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown } from 'lucide-react';

const Hierarchy: React.FC = () => {
  const { currentScene, selectedObject, selectObject, deleteObject, updateObject, moveObjectLayer } = useEngine();

  if (!currentScene) return null;

  // Sort objects by layer (lowest to highest for display)
  const sortedObjects = [...currentScene.objects].sort((a, b) => b.layer - a.layer);

  return (
    <div className="w-64 brutal-border border-r-4 bg-white flex flex-col">
      <div className="brutal-border border-b-4 p-4 bg-brutal-yellow">
        <h2 className="text-xl font-black uppercase">HIERARCHY</h2>
        <p className="text-xs font-bold mt-1">TOP TO BOTTOM = FRONT TO BACK</p>
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
            {sortedObjects.map((obj, index) => (
              <div
                key={obj.id}
                onClick={() => selectObject(obj.id)}
                className={`brutal-border p-2 cursor-pointer transition-all ${
                  selectedObject?.id === obj.id
                    ? 'bg-brutal-cyan shadow-brutal-sm translate-x-1 translate-y-1'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold uppercase text-sm truncate">{obj.name}</p>
                    <p className="text-xs font-bold text-gray-500">
                      {obj.type} • Layer {obj.layer}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateObject(obj.id, { visible: !obj.visible });
                      }}
                      className="p-1 hover:bg-gray-200 brutal-border"
                      title={obj.visible ? "Hide" : "Show"}
                    >
                      {obj.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteObject(obj.id);
                      }}
                      className="p-1 hover:bg-red-100 brutal-border"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Layer controls */}
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveObjectLayer(obj.id, 'top');
                    }}
                    disabled={index === 0}
                    className="brutal-border px-1 py-0.5 text-xs hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex-1"
                    title="Move to Front"
                  >
                    <ChevronsUp size={12} className="mx-auto" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveObjectLayer(obj.id, 'up');
                    }}
                    disabled={index === 0}
                    className="brutal-border px-1 py-0.5 text-xs hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex-1"
                    title="Move Forward"
                  >
                    <ChevronUp size={12} className="mx-auto" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveObjectLayer(obj.id, 'down');
                    }}
                    disabled={index === sortedObjects.length - 1}
                    className="brutal-border px-1 py-0.5 text-xs hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex-1"
                    title="Move Backward"
                  >
                    <ChevronDown size={12} className="mx-auto" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveObjectLayer(obj.id, 'bottom');
                    }}
                    disabled={index === sortedObjects.length - 1}
                    className="brutal-border px-1 py-0.5 text-xs hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex-1"
                    title="Move to Back"
                  >
                    <ChevronsDown size={12} className="mx-auto" />
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