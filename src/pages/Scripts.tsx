import { useState } from 'react';
import { useGameEngine } from '@/contexts/GameEngineContext';
import { Plus, Trash2, Code as CodeIcon, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

const Scripts = () => {
  const { scripts, addScript, updateScript, deleteScript } = useGameEngine();
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newScriptName, setNewScriptName] = useState('');
  const { toast } = useToast();

  const selectedScript = scripts.find(s => s.id === selectedScriptId);

  const handleCreateScript = () => {
    if (!newScriptName) {
      toast({
        title: "Missing name",
        description: "Please enter a script name",
        variant: "destructive",
      });
      return;
    }

    const script = {
      id: uuidv4(),
      name: newScriptName,
      code: `// ${newScriptName} Script
function update(deltaTime) {
  // Update logic here
  // this.x += 1;
}

function onCollision(other) {
  // Collision logic here
}`,
    };

    addScript(script);
    setSelectedScriptId(script.id);
    setEditingCode(script.code);
    setShowCreateForm(false);
    setNewScriptName('');
    toast({
      title: "Script created!",
      description: `${script.name} added successfully`,
    });
  };

  const handleSaveScript = () => {
    if (!selectedScriptId) return;
    updateScript(selectedScriptId, editingCode);
    toast({
      title: "Script saved!",
      description: "Changes saved successfully",
    });
  };

  const handleSelectScript = (scriptId: string) => {
    const script = scripts.find(s => s.id === scriptId);
    if (script) {
      setSelectedScriptId(scriptId);
      setEditingCode(script.code);
    }
  };

  return (
    <div className="h-full flex">
      <div className="w-80 brutal-border border-t-0 border-l-0 border-b-0 bg-white p-6 overflow-auto">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="brutal-button bg-brutal-green text-black w-full flex items-center justify-center gap-2 mb-6"
        >
          <Plus className="w-5 h-5" strokeWidth={3} />
          NEW SCRIPT
        </button>

        {showCreateForm && (
          <div className="brutal-card bg-brutal-yellow p-4 mb-6">
            <h3 className="text-lg font-black mb-3">CREATE SCRIPT</h3>
            <input
              type="text"
              value={newScriptName}
              onChange={(e) => setNewScriptName(e.target.value)}
              className="brutal-input w-full mb-3"
              placeholder="Script name"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateScript}
                className="brutal-button bg-black text-white flex-1 py-2 text-sm"
              >
                CREATE
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="brutal-button bg-white flex-1 py-2 text-sm"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        <h3 className="text-xl font-black mb-4 brutal-border border-l-0 border-r-0 border-t-0 pb-2">
          SCRIPTS ({scripts.length})
        </h3>

        {scripts.length === 0 ? (
          <div className="text-center py-8">
            <CodeIcon className="w-12 h-12 mx-auto mb-2 opacity-50" strokeWidth={3} />
            <p className="font-bold text-sm text-gray-600">No scripts yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {scripts.map((script) => (
              <div
                key={script.id}
                className={`brutal-border p-3 cursor-pointer transition-colors ${
                  selectedScriptId === script.id ? 'bg-brutal-blue' : 'bg-white hover:bg-gray-100'
                }`}
                onClick={() => handleSelectScript(script.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black">{script.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScript(script.id);
                      if (selectedScriptId === script.id) {
                        setSelectedScriptId(null);
                        setEditingCode('');
                      }
                      toast({
                        title: "Script deleted",
                        description: `${script.name} removed`,
                      });
                    }}
                    className="hover:scale-110 transition-transform text-brutal-pink"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 p-8 flex flex-col">
        {selectedScript ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black">{selectedScript.name}</h2>
              <button
                onClick={handleSaveScript}
                className="brutal-button bg-brutal-purple text-white flex items-center gap-2"
              >
                <Save className="w-5 h-5" strokeWidth={3} />
                SAVE
              </button>
            </div>

            <div className="brutal-card bg-white p-6 flex-1 flex flex-col">
              <div className="brutal-border bg-black text-brutal-green p-2 mb-4">
                <span className="font-bold text-sm">JAVASCRIPT EDITOR</span>
              </div>
              <textarea
                value={editingCode}
                onChange={(e) => setEditingCode(e.target.value)}
                className="brutal-input flex-1 font-mono text-sm resize-none"
                spellCheck={false}
              />
            </div>

            <div className="brutal-card bg-brutal-yellow p-4 mt-6">
              <h3 className="text-lg font-black mb-2">API REFERENCE</h3>
              <div className="text-sm font-bold space-y-1">
                <div>• <code className="bg-black text-brutal-green px-2 py-1">this.x, this.y</code> - Position</div>
                <div>• <code className="bg-black text-brutal-green px-2 py-1">this.width, this.height</code> - Size</div>
                <div>• <code className="bg-black text-brutal-green px-2 py-1">this.rotation</code> - Rotation angle</div>
                <div>• <code className="bg-black text-brutal-green px-2 py-1">update(deltaTime)</code> - Called every frame</div>
                <div>• <code className="bg-black text-brutal-green px-2 py-1">onCollision(other)</code> - Collision event</div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <CodeIcon className="w-24 h-24 mx-auto mb-4 opacity-50" strokeWidth={3} />
              <h3 className="text-2xl font-black mb-2">NO SCRIPT SELECTED</h3>
              <p className="font-bold text-gray-600">Select or create a script to start coding</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scripts;