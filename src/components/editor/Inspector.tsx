import React from 'react';
import { useEngine } from '@/contexts/EngineContext';

const Inspector: React.FC = () => {
  const { selectedObject, updateObject, scripts, sprites } = useEngine();

  if (!selectedObject) {
    return (
      <div className="w-80 brutal-border border-l-4 bg-white flex flex-col">
        <div className="brutal-border border-b-4 p-4 bg-brutal-pink text-white">
          <h2 className="text-xl font-black uppercase">INSPECTOR</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="font-bold text-gray-500 text-center">
            SELECT AN OBJECT TO EDIT
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 brutal-border border-l-4 bg-white flex flex-col">
      <div className="brutal-border border-b-4 p-4 bg-brutal-pink text-white">
        <h2 className="text-xl font-black uppercase">INSPECTOR</h2>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div>
          <label className="block font-bold uppercase text-sm mb-2">NAME</label>
          <input
            type="text"
            value={selectedObject.name}
            onChange={(e) => updateObject(selectedObject.id, { name: e.target.value })}
            className="brutal-input w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold uppercase text-sm mb-2">X</label>
            <input
              type="number"
              value={Math.round(selectedObject.x)}
              onChange={(e) => updateObject(selectedObject.id, { x: parseFloat(e.target.value) })}
              className="brutal-input w-full"
            />
          </div>
          <div>
            <label className="block font-bold uppercase text-sm mb-2">Y</label>
            <input
              type="number"
              value={Math.round(selectedObject.y)}
              onChange={(e) => updateObject(selectedObject.id, { y: parseFloat(e.target.value) })}
              className="brutal-input w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold uppercase text-sm mb-2">WIDTH</label>
            <input
              type="number"
              value={Math.round(selectedObject.width)}
              onChange={(e) => updateObject(selectedObject.id, { width: parseFloat(e.target.value) })}
              className="brutal-input w-full"
            />
          </div>
          <div>
            <label className="block font-bold uppercase text-sm mb-2">HEIGHT</label>
            <input
              type="number"
              value={Math.round(selectedObject.height)}
              onChange={(e) => updateObject(selectedObject.id, { height: parseFloat(e.target.value) })}
              className="brutal-input w-full"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold uppercase text-sm mb-2">ROTATION</label>
          <input
            type="number"
            value={Math.round(selectedObject.rotation)}
            onChange={(e) => updateObject(selectedObject.id, { rotation: parseFloat(e.target.value) })}
            className="brutal-input w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold uppercase text-sm mb-2">SCALE X</label>
            <input
              type="number"
              step="0.1"
              value={selectedObject.scaleX}
              onChange={(e) => updateObject(selectedObject.id, { scaleX: parseFloat(e.target.value) })}
              className="brutal-input w-full"
            />
          </div>
          <div>
            <label className="block font-bold uppercase text-sm mb-2">SCALE Y</label>
            <input
              type="number"
              step="0.1"
              value={selectedObject.scaleY}
              onChange={(e) => updateObject(selectedObject.id, { scaleY: parseFloat(e.target.value) })}
              className="brutal-input w-full"
            />
          </div>
        </div>

        {selectedObject.type === 'sprite' && (
          <div>
            <label className="block font-bold uppercase text-sm mb-2">SPRITE</label>
            <select
              value={selectedObject.sprite || ''}
              onChange={(e) => updateObject(selectedObject.id, { sprite: e.target.value })}
              className="brutal-input w-full"
            >
              <option value="">NONE</option>
              {sprites.map(sprite => (
                <option key={sprite.id} value={sprite.id}>{sprite.name}</option>
              ))}
            </select>
          </div>
        )}

        {(selectedObject.type === 'label' || selectedObject.type === 'button') && (
          <>
            <div>
              <label className="block font-bold uppercase text-sm mb-2">TEXT</label>
              <input
                type="text"
                value={selectedObject.text || ''}
                onChange={(e) => updateObject(selectedObject.id, { text: e.target.value })}
                className="brutal-input w-full"
              />
            </div>
            {selectedObject.type === 'label' && (
              <>
                <div>
                  <label className="block font-bold uppercase text-sm mb-2">FONT SIZE</label>
                  <input
                    type="number"
                    value={selectedObject.fontSize || 16}
                    onChange={(e) => updateObject(selectedObject.id, { fontSize: parseInt(e.target.value) })}
                    className="brutal-input w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-sm mb-2">COLOR</label>
                  <input
                    type="color"
                    value={selectedObject.color || '#000000'}
                    onChange={(e) => updateObject(selectedObject.id, { color: e.target.value })}
                    className="brutal-input w-full h-12"
                  />
                </div>
              </>
            )}
          </>
        )}

        {(selectedObject.type === 'panel' || selectedObject.type === 'button') && (
          <div>
            <label className="block font-bold uppercase text-sm mb-2">BG COLOR</label>
            <input
              type="color"
              value={selectedObject.backgroundColor || '#FFFFFF'}
              onChange={(e) => updateObject(selectedObject.id, { backgroundColor: e.target.value })}
              className="brutal-input w-full h-12"
            />
          </div>
        )}

        <div>
          <label className="block font-bold uppercase text-sm mb-2">SCRIPT</label>
          <select
            value={selectedObject.script || ''}
            onChange={(e) => updateObject(selectedObject.id, { script: e.target.value })}
            className="brutal-input w-full"
          >
            <option value="">NONE</option>
            {scripts.map(script => (
              <option key={script.id} value={script.id}>{script.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Inspector;