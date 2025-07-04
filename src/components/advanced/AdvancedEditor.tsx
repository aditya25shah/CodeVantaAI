import React, { useRef, useEffect, useState, useCallback } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { useEditorStore } from '../../store/editorStore';
import { SmartCodeActions } from './SmartCodeActions';
import { IntelligentAutoComplete } from './IntelligentAutoComplete';
import { useHotkeys } from 'react-hotkeys-hook';
import { Save, Search, Replace, ZoomIn, ZoomOut, RotateCcw, Settings, Maximize2, Minimize2, Copy, Scissors, FileText, Code, Eye, EyeOff, Palette, Type, Grid3X3, WrapText as Wrap, Map } from 'lucide-react';
// imported neccessary libraries and icons

interface AdvancedEditorProps {
  onCodeChange: (code: string) => void;
  onSave: () => void;
  onFormat: () => void;
}
// props interface for the AdvancedEditor component
export const AdvancedEditor: React.FC<AdvancedEditorProps> = ({
  onCodeChange,
  onSave,
  onFormat,
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFind, setShowFind] = useState(false);
  const [smartActionsVisible, setSmartActionsVisible] = useState(false);
  const [smartActionsPosition, setSmartActionsPosition] = useState({ x: 0, y: 0 });
  const [autoCompleteVisible, setAutoCompleteVisible] = useState(false);
  const [autoCompletePosition, setAutoCompletePosition] = useState({ x: 0, y: 0 });
  const [selectedCode, setSelectedCode] = useState('');
  const [currentPrefix, setCurrentPrefix] = useState('');

  const {
    files,
    activeFileId,
    settings,
    updateSettings,
    updateFile,
  } = useEditorStore();

  const activeFile = files.find(f => f.id === activeFileId);

  // Keyboard shortcuts
  useHotkeys('ctrl+s', (e) => {// you can save using Ctrl + S
    e.preventDefault();
    onSave();
  });

  useHotkeys('ctrl+f', (e) => {// you can Find using Ctrl + f
    e.preventDefault();
    setShowFind(true);
  });

  useHotkeys('shift+alt+f', (e) => {// you can format using Shift+alt+f
    e.preventDefault();
    onFormat();
  });

  useHotkeys('ctrl+equal', (e) => {// you can increase the size  using Ctrl + +
    e.preventDefault();
    updateSettings({ fontSize: Math.min(settings.fontSize + 2, 24) });
  });

  useHotkeys('ctrl+minus', (e) => {// you can decrease the size  using Ctrl + -
    e.preventDefault();
    updateSettings({ fontSize: Math.max(settings.fontSize - 2, 10) });
  });

  useHotkeys('ctrl+0', (e) => {
    e.preventDefault();
    updateSettings({ fontSize: 14 });// open setting using Ctrl + 0
  });

  useHotkeys('f11', (e) => {
    e.preventDefault();
    setIsFullscreen(!isFullscreen);// set to fullscreen
  });

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Basic Configuration of Editor i.e change font size,family,tab size word wrap and etc
    editor.updateOptions({
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      tabSize: settings.tabSize,
      wordWrap: settings.wordWrap ? 'on' : 'off',
      minimap: { enabled: settings.minimap },
      lineNumbers: settings.lineNumbers ? 'on' : 'off',
      formatOnPaste: settings.formatOnSave,
      formatOnType: true,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      renderLineHighlight: 'all',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showConstructors: true,
        showFields: true,
        showVariables: true,
        showClasses: true,
        showStructs: true,
        showInterfaces: true,
        showModules: true,
        showProperties: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        showValues: true,
        showConstants: true,
        showEnums: true,
        showEnumMembers: true,
        showColors: true,
        showFiles: true,
        showReferences: true,
        showFolders: true,
        showTypeParameters: true,
        showIssues: true,
        showUsers: true,
      },
    });

    // Add context menu actions
    editor.addAction({
      id: 'smart-actions',
      label: 'Smart Actions',
      contextMenuGroupId: 'navigation',
      run: () => {
        const selection = editor.getSelection();
        const selectedText = editor.getModel()?.getValueInRange(selection);
        if (selectedText) {
          setSelectedCode(selectedText);
          const position = editor.getScrolledVisiblePosition(selection.getStartPosition());
          if (position) {
            setSmartActionsPosition({
              x: position.left,
              y: position.top + position.height,
            });
            setSmartActionsVisible(true);
          }
        }
      },
    });

    // Add AI completion provider
    monaco.languages.registerCompletionItemProvider(activeFile?.language || 'javascript', { // using monaco editor 
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        // Show intelligent autocomplete
        if (word.word.length > 1) {
          setCurrentPrefix(word.word);
          const editorPosition = editor.getScrolledVisiblePosition(position);
          if (editorPosition) {
            setAutoCompletePosition({
              x: editorPosition.left,
              y: editorPosition.top + editorPosition.height,
            });
            setAutoCompleteVisible(true);
          }
        }

        return { suggestions: [] };
      },
    });

    // Selection change handler 
    editor.onDidChangeCursorSelection((e: any) => {
      const selection = editor.getSelection();
      const selectedText = editor.getModel()?.getValueInRange(selection);
      setSelectedCode(selectedText || '');
    });

    // Content change handler
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      if (activeFile) {
        updateFile(activeFile.id, { content: value });
        onCodeChange(value);
      }
    });
  };

  const handleSuggestionSelect = (suggestion: any) => {
    if (editorRef.current && monacoRef.current) {
      const editor = editorRef.current;
      const model = editor.getModel();
      const position = editor.getPosition();
      
      if (model && position) {
        // Get the word at current position
        const word = model.getWordUntilPosition(position);
        
        // Create range to replace the current word
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        
        // Apply the suggestion
        const edit = {
          range: range,
          text: suggestion.insertText.replace(/\$\d+/g, ''), // Remove placeholder markers
        };
        
        editor.executeEdits('intellisense', [edit]);
        editor.focus();
      }
    }
    setAutoCompleteVisible(false);
  };

  const handleCopy = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.clipboardCopyAction').run();
    }
  };

  const handleCut = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.clipboardCutAction').run();
    }
  };

  const handlePaste = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.clipboardPasteAction').run();
    }
  };

  const handleUndo = () => {
    if (editorRef.current) {
      editorRef.current.getAction('undo').run();
    }
  };

  const handleRedo = () => {
    if (editorRef.current) {
      editorRef.current.getAction('redo').run();
    }
  };

  const toggleFind = () => {
    if (editorRef.current) {
      editorRef.current.getAction('actions.find').run();
    }
  };

  const toggleReplace = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.startFindReplaceAction').run();
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: settings.fontSize,
        fontFamily: settings.fontFamily,
        tabSize: settings.tabSize,
        wordWrap: settings.wordWrap ? 'on' : 'off',
        minimap: { enabled: settings.minimap },
        lineNumbers: settings.lineNumbers ? 'on' : 'off',
      });
    }
  }, [settings]);

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 text-gray-400">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No file selected</h3>
          <p>Open a file to start coding with AI assistance</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full relative ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : ''}`}>
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/50 bg-gray-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* File Info */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-sm font-medium text-gray-200">
            {activeFile.name}
          </span>
          {activeFile.isDirty && (
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          )}
          <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
            {activeFile.language}
          </span>
        </div>

        {/* Editor Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded transition-colors"
            title="Copy (Ctrl+C)"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleCut}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded transition-colors"
            title="Cut (Ctrl+X)"
          >
            <Scissors className="w-4 h-4" />
          </button>
          
          <button
            onClick={toggleFind}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded transition-colors"
            title="Find (Ctrl+F)"
          >
            <Search className="w-4 h-4" />
          </button>
          
          <button
            onClick={toggleReplace}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded transition-colors"
            title="Replace (Ctrl+H)"
          >
            <Replace className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-gray-600 mx-1"></div>

          <button
            onClick={() => updateSettings({ fontSize: Math.max(settings.fontSize - 2, 10) })}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded transition-colors"
            title="Zoom Out (Ctrl+-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-xs text-gray-400 px-2 min-w-[3rem] text-center">
            {settings.fontSize}px
          </span>
          
          <button
            onClick={() => updateSettings({ fontSize: Math.min(settings.fontSize + 2, 24) })}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded transition-colors"
            title="Zoom In (Ctrl++)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => updateSettings({ fontSize: 14 })}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded transition-colors"
            title="Reset Zoom (Ctrl+0)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-gray-600 mx-1"></div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded transition-colors"
            title="Editor Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded transition-colors"
            title="Toggle Fullscreen (F11)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-12 right-4 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-20 p-4"
        >
          <h3 className="text-sm font-semibold text-gray-100 mb-4">Editor Settings</h3>
          
          <div className="space-y-4">
            {/* Theme */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => updateSettings({ theme: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 text-sm"
              >
                <option value="vs-dark">Dark</option>
                <option value="vs-light">Light</option>
                <option value="hc-black">High Contrast</option>
              </select>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Font Family</label>
              <select
                value={settings.fontFamily}
                onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 text-sm"
              >
                <option value="JetBrains Mono, monospace">JetBrains Mono</option>
                <option value="Fira Code, monospace">Fira Code</option>
                <option value="SF Mono, monospace">SF Mono</option>
                <option value="Consolas, monospace">Consolas</option>
                <option value="Monaco, monospace">Monaco</option>
              </select>
            </div>

            {/* Tab Size */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Tab Size</label>
              <select
                value={settings.tabSize}
                onChange={(e) => updateSettings({ tabSize: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 text-sm"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
              </select>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Word Wrap</span>
                <input
                  type="checkbox"
                  checked={settings.wordWrap}
                  onChange={(e) => updateSettings({ wordWrap: e.target.checked })}
                  className="rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Minimap</span>
                <input
                  type="checkbox"
                  checked={settings.minimap}
                  onChange={(e) => updateSettings({ minimap: e.target.checked })}
                  className="rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Line Numbers</span>
                <input
                  type="checkbox"
                  checked={settings.lineNumbers}
                  onChange={(e) => updateSettings({ lineNumbers: e.target.checked })}
                  className="rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Auto Save</span>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                  className="rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Format on Save</span>
                <input
                  type="checkbox"
                  checked={settings.formatOnSave}
                  onChange={(e) => updateSettings({ formatOnSave: e.target.checked })}
                  className="rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-xs text-gray-300">AI Assistance</span>
                <input
                  type="checkbox"
                  checked={settings.aiAssistance}
                  onChange={(e) => updateSettings({ aiAssistance: e.target.checked })}
                  className="rounded"
                />
              </label>
            </div>
          </div>
        </motion.div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 h-full">
        <Editor
          height="100%"
          language={activeFile.language}
          value={activeFile.content}
          onMount={handleEditorDidMount}
          theme={settings.theme}
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            automaticLayout: true,
            glyphMargin: true,
            folding: true,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              useShadows: false,
              verticalHasArrows: false,
              horizontalHasArrows: false,
            },
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
          }}
        />
      </div>

      {/* Smart Code Actions */}
      <SmartCodeActions
        visible={smartActionsVisible}
        position={smartActionsPosition}
        selectedCode={selectedCode}
        language={activeFile.language}
        onClose={() => setSmartActionsVisible(false)}
        onApplyAction={(action) => {
          console.log('Apply action:', action);
          setSmartActionsVisible(false);
        }}
      />

      {/* Intelligent AutoComplete */}
      <IntelligentAutoComplete
        visible={autoCompleteVisible}
        position={autoCompletePosition}
        prefix={currentPrefix}
        language={activeFile.language}
        context={activeFile.content}
        onSelect={handleSuggestionSelect}
        onClose={() => setAutoCompleteVisible(false)}
      />
    </div>
  );
};