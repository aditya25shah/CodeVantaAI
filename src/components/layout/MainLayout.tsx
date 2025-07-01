import React from 'react';
import Split from 'react-split';
import { useEditorStore } from '../../store/editorStore';
import { FileExplorer } from '../FileExplorer';
import { AdvancedEditor } from '../advanced/AdvancedEditor';
import { AISidebar } from '../AISidebar';
import { Terminal } from '../Terminal';
import { CommandPalette } from '../advanced/CommandPalette';
import { Toolbar } from '../Toolbar';

export const MainLayout: React.FC = () => {
  const {
    sidebarVisible,
    aiPanelVisible,
    terminalVisible,
    files,
    activeFileId,
    updateFile,
    aiApiKey,
  } = useEditorStore();

  const activeFile = files.find(f => f.id === activeFileId);

  const handleCodeChange = (code: string) => {
    if (activeFile) {
      updateFile(activeFile.id, { content: code });
    }
  };

  const handleSave = () => {
    console.log('Save file');
  };

  const handleFormat = () => {
    console.log('Format code');
  };

  // Fixed layout configuration to prevent screen adjustment
  const getSplitSizes = () => {
    if (!sidebarVisible && !aiPanelVisible) return [100];
    if (!sidebarVisible && aiPanelVisible) return [70, 30];
    if (sidebarVisible && !aiPanelVisible) return [25, 75];
    return [22, 48, 30]; // Fixed proportions
  };

  const getSplitMinSizes = () => {
    if (!sidebarVisible && !aiPanelVisible) return [400];
    if (!sidebarVisible && aiPanelVisible) return [400, 350];
    if (sidebarVisible && !aiPanelVisible) return [200, 400];
    return [200, 400, 350]; // Fixed minimum sizes
  };

  const getSplitMaxSizes = () => {
    if (!sidebarVisible && !aiPanelVisible) return [Infinity];
    if (!sidebarVisible && aiPanelVisible) return [Infinity, 600];
    if (sidebarVisible && !aiPanelVisible) return [350, Infinity];
    return [350, Infinity, 600]; // Fixed maximum sizes to prevent overflow
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
      {/* Toolbar */}
      <Toolbar />

      {/* Main Content - Fixed height container */}
      <div className="flex-1 overflow-hidden min-h-0">
        <Split
          key={`split-${sidebarVisible}-${aiPanelVisible}`}
          className="flex h-full"
          sizes={getSplitSizes()}
          minSize={getSplitMinSizes()}
          maxSize={getSplitMaxSizes()}
          expandToMin={false}
          gutterSize={4}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
          gutterStyle={(index) => ({
            backgroundColor: '#e2e8f0',
            borderRadius: '2px',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            transition: 'background-color 0.2s ease',
          })}
          onDragStart={() => {
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
          }}
          onDragEnd={() => {
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
          }}
        >
          {/* File Explorer */}
          {sidebarVisible && (
            <div className="bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-hidden h-full">
              <FileExplorer />
            </div>
          )}

          {/* Editor Area */}
          <div className="flex flex-col bg-white dark:bg-slate-900 h-full overflow-hidden">
            <div className={`${terminalVisible ? 'h-1/2' : 'h-full'} overflow-hidden`}>
              <AdvancedEditor
                onCodeChange={handleCodeChange}
                onSave={handleSave}
                onFormat={handleFormat}
              />
            </div>
            
            {/* Terminal */}
            {terminalVisible && (
              <div className="h-1/2 border-t border-slate-200 dark:border-slate-700 overflow-hidden">
                <Terminal />
              </div>
            )}
          </div>

          {/* AI Assistant - Fixed width container */}
          {aiPanelVisible && (
            <div className="bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 h-full overflow-hidden flex flex-col">
              <AISidebar
                onCodeChange={handleCodeChange}
                currentCode={activeFile?.content || ''}
                fileName={activeFile?.name}
                geminiApiKey={aiApiKey}
                allFiles={new Map(files.map(f => [f.name, f.content]))}
                folderStructure={files.map(f => f.name).join(', ')}
                onClose={() => useEditorStore.getState().toggleAIPanel()}
              />
            </div>
          )}
        </Split>
      </div>

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
};