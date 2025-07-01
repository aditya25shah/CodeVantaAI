import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { formatCode } from '../utils/formatter';
import { 
  Copy, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  theme: 'light' | 'dark';
  onFormat?: () => void;
  fileName?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  theme,
  onFormat,
  fileName,
}) => {
  const editorRef = useRef<any>(null);
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [minimap, setMinimap] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(true);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Add custom keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onFormat?.();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal, () => {
      setFontSize(prev => Math.min(prev + 2, 24));
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus, () => {
      setFontSize(prev => Math.max(prev - 2, 10));
    });

    // Configure editor options
    editor.updateOptions({
      fontSize,
      fontFamily: 'JetBrains Mono, Fira Code, SF Mono, Consolas, Monaco, monospace',
      lineHeight: 1.6,
      minimap: { enabled: minimap },
      scrollBeyondLastLine: false,
      wordWrap: wordWrap ? 'on' : 'off',
      formatOnPaste: true,
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
    });
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleZoomIn = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const handleZoomOut = () => {
    setFontSize(prev => Math.max(prev - 2, 10));
  };

  const handleResetZoom = () => {
    setFontSize(14);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize,
        minimap: { enabled: minimap },
        wordWrap: wordWrap ? 'on' : 'off',
        lineNumbers: lineNumbers ? 'on' : 'off',
      });
    }
  }, [fontSize, minimap, wordWrap, lineNumbers]);

  return (
    <div className={`h-full relative bg-white dark:bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          {fileName && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {fileName}
            </span>
          )}
          <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
            {language}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyCode}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Copy Code"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editorRef.current?.getAction('actions.find')?.run()}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Find (Ctrl+F)"
          >
            <Search className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-0.5 mx-1">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title="Zoom Out (Ctrl+-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 min-w-[3rem] text-center">
              {fontSize}px
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title="Zoom In (Ctrl++)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleResetZoom}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Editor Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-12 right-4 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Editor Settings</h3>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Word Wrap</span>
              <input
                type="checkbox"
                checked={wordWrap}
                onChange={(e) => setWordWrap(e.target.checked)}
                className="rounded"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Minimap</span>
              <input
                type="checkbox"
                checked={minimap}
                onChange={(e) => setMinimap(e.target.checked)}
                className="rounded"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Line Numbers</span>
              <input
                type="checkbox"
                checked={lineNumbers}
                onChange={(e) => setLineNumbers(e.target.checked)}
                className="rounded"
              />
            </label>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 h-full">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={(newValue) => onChange(newValue || '')}
          onMount={handleEditorDidMount}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
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
    </div>
  );
};