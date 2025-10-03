import React, { useState, useRef, useEffect } from 'react';
import { useEngine } from '@/contexts/EngineContext';
import { Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Editor, { Monaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

const ScriptEditor: React.FC = () => {
  const { scripts, addScript, updateScript, deleteScript, currentScene } = useEngine();
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [newScriptName, setNewScriptName] = useState('');
  const { toast } = useToast();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const currentScript = scripts.find(s => s.id === selectedScript);

  const handleSelectScript = (id: string) => {
    const script = scripts.find(s => s.id === id);
    if (script) {
      setSelectedScript(id);
      setCode(script.content);
    }
  };

  const handleSave = () => {
    if (selectedScript) {
      updateScript(selectedScript, code);
      toast({
        title: "SAVED!",
        description: "Script has been saved.",
      });
    }
  };

  const handleAddScript = () => {
    if (newScriptName.trim()) {
      const template = `// ${newScriptName}
// Available functions:
// - tween(objectId, property, target, duration, callback)
// - updateLabel(objectId, newText) - Update label/button text
// - getObjectByName(name) - Get object by name
// - gameObjects[id] - Access game objects
// - ctx - Canvas context

let clickCount = 0;

function onButtonClick() {
  clickCount++;
  const label = getObjectByName("scoreLabel");
  if (label) {
    updateLabel(label.id, "Score: " + clickCount);
  }
}

function start() {
  console.log("Script started!");
}

start();
`;
      addScript(newScriptName, template);
      setNewScriptName('');
      toast({
        title: "SCRIPT CREATED!",
        description: `${newScriptName} has been created.`,
      });
    }
  };

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure Monaco for better JavaScript experience
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      allowJs: true,
      checkJs: true,
    });

    // Add custom autocomplete suggestions
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions: any[] = [];

        // Add tween function suggestion
        suggestions.push({
          label: 'tween',
          kind: monaco.languages.CompletionItemKind.Function,
          documentation: 'Animate an object property over time',
          insertText: 'tween("${1:objectId}", "${2:property}", ${3:target}, ${4:duration}, () => {\n\t$0\n})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
          detail: 'tween(objectId, property, target, duration, callback)',
        });

        // Add updateLabel function
        suggestions.push({
          label: 'updateLabel',
          kind: monaco.languages.CompletionItemKind.Function,
          documentation: 'Update the text of a label or button',
          insertText: 'updateLabel("${1:objectId}", "${2:newText}")',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
          detail: 'updateLabel(objectId, newText)',
        });

        // Add getObjectByName function
        suggestions.push({
          label: 'getObjectByName',
          kind: monaco.languages.CompletionItemKind.Function,
          documentation: 'Get an object by its name',
          insertText: 'getObjectByName("${1:objectName}")',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
          detail: 'getObjectByName(name) => GameObject',
        });

        // Add gameObjects suggestion
        suggestions.push({
          label: 'gameObjects',
          kind: monaco.languages.CompletionItemKind.Variable,
          documentation: 'Access all game objects in the scene',
          insertText: 'gameObjects',
          range: range,
          detail: 'Record<string, GameObject>',
        });

        // Add ctx suggestion
        suggestions.push({
          label: 'ctx',
          kind: monaco.languages.CompletionItemKind.Variable,
          documentation: 'Canvas 2D rendering context',
          insertText: 'ctx',
          range: range,
          detail: 'CanvasRenderingContext2D',
        });

        // Add currentScene suggestion
        suggestions.push({
          label: 'currentScene',
          kind: monaco.languages.CompletionItemKind.Variable,
          documentation: 'Current scene data',
          insertText: 'currentScene',
          range: range,
          detail: 'Scene',
        });

        // Add game object IDs from current scene
        if (currentScene) {
          currentScene.objects.forEach(obj => {
            suggestions.push({
              label: `"${obj.id}"`,
              kind: monaco.languages.CompletionItemKind.Constant,
              documentation: `Object: ${obj.name} (${obj.type})`,
              insertText: `"${obj.id}"`,
              range: range,
              detail: `${obj.name} - ${obj.type}`,
            });

            // Add object name as suggestion
            suggestions.push({
              label: obj.name,
              kind: monaco.languages.CompletionItemKind.Value,
              documentation: `${obj.type} object (ID: ${obj.id})`,
              insertText: `gameObjects["${obj.id}"]`,
              range: range,
              detail: `Access ${obj.name}`,
            });
          });
        }

        // Add common GameObject properties
        const properties = [
          { name: 'x', type: 'number', desc: 'X position' },
          { name: 'y', type: 'number', desc: 'Y position' },
          { name: 'width', type: 'number', desc: 'Width' },
          { name: 'height', type: 'number', desc: 'Height' },
          { name: 'rotation', type: 'number', desc: 'Rotation in degrees' },
          { name: 'scaleX', type: 'number', desc: 'Horizontal scale' },
          { name: 'scaleY', type: 'number', desc: 'Vertical scale' },
          { name: 'visible', type: 'boolean', desc: 'Visibility' },
          { name: 'text', type: 'string', desc: 'Text content' },
          { name: 'color', type: 'string', desc: 'Text color' },
          { name: 'backgroundColor', type: 'string', desc: 'Background color' },
          { name: 'fontSize', type: 'number', desc: 'Font size' },
          { name: 'onClick', type: 'string', desc: 'Click handler function name' },
        ];

        properties.forEach(prop => {
          suggestions.push({
            label: prop.name,
            kind: monaco.languages.CompletionItemKind.Property,
            documentation: `${prop.desc} (${prop.type})`,
            insertText: prop.name,
            range: range,
            detail: prop.type,
          });
        });

        // Add common functions
        const functions = [
          { name: 'start', snippet: 'function start() {\n\t$0\n}', desc: 'Initialization function' },
          { name: 'update', snippet: 'function update() {\n\t$0\n}', desc: 'Update loop function' },
          { name: 'console.log', snippet: 'console.log($0)', desc: 'Log to console' },
        ];

        functions.forEach(func => {
          suggestions.push({
            label: func.name,
            kind: monaco.languages.CompletionItemKind.Function,
            documentation: func.desc,
            insertText: func.snippet,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
          });
        });

        return { suggestions };
      },
    });

    // Add extra type definitions
    const extraLibs = `
      interface GameObject {
        id: string;
        name: string;
        type: 'sprite' | 'panel' | 'button' | 'label';
        x: number;
        y: number;
        width: number;
        height: number;
        rotation: number;
        scaleX: number;
        scaleY: number;
        visible: boolean;
        sprite?: string;
        text?: string;
        fontSize?: number;
        color?: string;
        backgroundColor?: string;
        onClick?: string;
      }

      declare const gameObjects: Record<string, GameObject>;
      declare const ctx: CanvasRenderingContext2D;
      declare const currentScene: any;
      declare function tween(objectId: string, property: string, target: number, duration: number, callback?: () => void): void;
      declare function updateLabel(objectId: string, newText: string): void;
      declare function getObjectByName(name: string): GameObject | undefined;
    `;

    monaco.languages.typescript.javascriptDefaults.addExtraLib(extraLibs, 'brutalengine.d.ts');
  };

  return (
    <div className="flex-1 flex">
      <div className="w-64 brutal-border border-r-4 bg-white flex flex-col">
        <div className="brutal-border border-b-4 p-4 bg-brutal-purple text-white">
          <h2 className="text-xl font-black uppercase">SCRIPTS</h2>
        </div>

        <div className="p-4 brutal-border border-b-4">
          <input
            type="text"
            value={newScriptName}
            onChange={(e) => setNewScriptName(e.target.value)}
            placeholder="SCRIPT NAME"
            className="brutal-input w-full mb-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddScript();
              }
            }}
          />
          <button
            onClick={handleAddScript}
            className="brutal-button bg-brutal-green shadow-brutal-sm w-full flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            NEW SCRIPT
          </button>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {scripts.length === 0 ? (
            <p className="font-bold text-gray-500 text-center p-4">NO SCRIPTS</p>
          ) : (
            <div className="space-y-1">
              {scripts.map(script => (
                <div
                  key={script.id}
                  onClick={() => handleSelectScript(script.id)}
                  className={`brutal-border p-2 cursor-pointer transition-all flex items-center justify-between ${
                    selectedScript === script.id
                      ? 'bg-brutal-cyan shadow-brutal-sm translate-x-1 translate-y-1'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <p className="font-bold uppercase text-sm truncate flex-1">{script.name}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScript(script.id);
                      if (selectedScript === script.id) {
                        setSelectedScript(null);
                        setCode('');
                      }
                    }}
                    className="p-1 hover:bg-red-100 brutal-border ml-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-100">
        {currentScript ? (
          <>
            <div className="brutal-border border-b-4 p-4 bg-white flex items-center justify-between">
              <h3 className="text-xl font-black uppercase">{currentScript.name}</h3>
              <button
                onClick={handleSave}
                className="brutal-button bg-brutal-green shadow-brutal flex items-center gap-2"
              >
                <Save size={16} />
                SAVE
              </button>
            </div>

            <div className="flex-1 p-4">
              <div className="brutal-border h-full bg-white overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={handleEditorDidMount}
                  theme="vs"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'Courier New', monospace",
                    fontWeight: 'bold',
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: {
                      other: true,
                      comments: false,
                      strings: true,
                    },
                    parameterHints: {
                      enabled: true,
                    },
                    suggest: {
                      showWords: true,
                      showSnippets: true,
                    },
                  }}
                />
              </div>
            </div>

            <div className="brutal-border border-t-4 p-4 bg-brutal-yellow">
              <p className="font-bold text-sm uppercase mb-2">💡 NEW FEATURES:</p>
              <ul className="text-sm font-bold space-y-1">
                <li>• updateLabel(objectId, "text") - UPDATE LABELS</li>
                <li>• getObjectByName("name") - FIND OBJECTS</li>
                <li>• obj.onClick = "functionName" - ADD CLICK HANDLERS</li>
                <li>• USE tween() TO ANIMATE PROPERTIES</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="font-bold text-gray-500 text-xl mb-4">SELECT A SCRIPT TO EDIT</p>
              <p className="font-bold text-gray-400">OR CREATE A NEW ONE</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptEditor;