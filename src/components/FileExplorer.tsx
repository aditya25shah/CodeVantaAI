import React, { useState, useRef } from 'react';
import {
  Folder,
  FolderOpen,
  File,
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Code,
  Image,
  Database,
  Settings,
  Trash2,
  Edit,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Check,
  X,
  FolderPlus
} from 'lucide-react';
import { useEditorStore } from '../store/editorStore';

export const FileExplorer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; fileId?: string } | null>(null);
  const [creatingFile, setCreatingFile] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  
  const { files, activeFileId, addFile, removeFile, setActiveFile, updateFile } = useEditorStore();

  const getFileIcon = (fileName: string, isFolder = false) => {
    if (isFolder) {
      return expandedFolders.has(fileName) ? (
        <FolderOpen className="w-4 h-4 text-blue-500" />
      ) : (
        <Folder className="w-4 h-4 text-blue-500" />
      );
    }

    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return <Code className="w-4 h-4 text-yellow-600" />;
      case 'ts':
      case 'tsx':
        return <Code className="w-4 h-4 text-blue-600" />;
      case 'html':
        return <Code className="w-4 h-4 text-orange-600" />;
      case 'css':
      case 'scss':
        return <Code className="w-4 h-4 text-blue-500" />;
      case 'json':
        return <Database className="w-4 h-4 text-green-600" />;
      case 'md':
        return <FileText className="w-4 h-4 text-slate-600" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className="w-4 h-4 text-purple-600" />;
      case 'config':
      case 'env':
        return <Settings className="w-4 h-4 text-slate-500" />;
      default:
        return <File className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleCreateFile = () => {
    setCreatingFile(true);
    setNewFileName('');
    setShowCreateMenu(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCreateFolder = () => {
    setCreatingFolder(true);
    setNewFolderName('');
    setShowCreateMenu(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleConfirmCreateFile = () => {
    if (newFileName.trim()) {
      const language = getLanguageFromExtension(newFileName);
      addFile({
        name: newFileName.trim(),
        path: newFileName.trim(),
        content: getDefaultContent(newFileName.trim()),
        language,
      });
    }
    setCreatingFile(false);
    setNewFileName('');
  };

  const handleConfirmCreateFolder = () => {
    if (newFolderName.trim()) {
      // For now, we'll create a placeholder file to represent the folder
      // In a real implementation, you'd handle folders differently
      const folderName = newFolderName.trim();
      addFile({
        name: `${folderName}/.gitkeep`,
        path: `${folderName}/.gitkeep`,
        content: '# This file keeps the folder in git',
        language: 'plaintext',
      });
    }
    setCreatingFolder(false);
    setNewFolderName('');
  };

  const handleCancelCreate = () => {
    setCreatingFile(false);
    setCreatingFolder(false);
    setNewFileName('');
    setNewFolderName('');
  };

  const handleRename = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      setRenamingFileId(fileId);
      setRenameValue(file.name);
      setContextMenu(null);
      setTimeout(() => renameInputRef.current?.focus(), 100);
    }
  };

  const handleConfirmRename = () => {
    if (renamingFileId && renameValue.trim()) {
      const file = files.find(f => f.id === renamingFileId);
      if (file) {
        const newLanguage = getLanguageFromExtension(renameValue.trim());
        updateFile(renamingFileId, { 
          name: renameValue.trim(),
          path: renameValue.trim(),
          language: newLanguage
        });
      }
    }
    setRenamingFileId(null);
    setRenameValue('');
  };

  const handleCancelRename = () => {
    setRenamingFileId(null);
    setRenameValue('');
  };

  const handleDuplicate = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const extension = file.name.includes('.') ? '.' + file.name.split('.').pop() : '';
      const newName = `${baseName}_copy${extension}`;
      
      addFile({
        name: newName,
        path: newName,
        content: file.content,
        language: file.language,
      });
    }
    setContextMenu(null);
  };

  const handleDownload = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    setContextMenu(null);
  };

  const handleDelete = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      removeFile(fileId);
    }
    setContextMenu(null);
  };

  const getLanguageFromExtension = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'html':
        return 'html';
      case 'css':
      case 'scss':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      default:
        return 'plaintext';
    }
  };

  const getDefaultContent = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
        return `// ${fileName}\nconsole.log('Hello from ${fileName}!');`;
      case 'ts':
        return `// ${fileName}\nconst message: string = 'Hello from ${fileName}!';\nconsole.log(message);`;
      case 'html':
        return `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>${fileName}</title>\n</head>\n<body>\n    <h1>Hello from ${fileName}!</h1>\n</body>\n</html>`;
      case 'css':
        return `/* ${fileName} */\nbody {\n    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n    margin: 0;\n    padding: 20px;\n}`;
      case 'json':
        return `{\n  "name": "${fileName}",\n  "version": "1.0.0",\n  "description": ""\n}`;
      case 'md':
        return `# ${fileName}\n\nWelcome to your new markdown file!`;
      case 'py':
        return `# ${fileName}\nprint("Hello from ${fileName}!")`;
      case 'java':
        return `// ${fileName}\npublic class ${fileName.replace('.java', '')} {\n    public static void main(String[] args) {\n        System.out.println("Hello from ${fileName}!");\n    }\n}`;
      default:
        return `// ${fileName}\n// Start coding here...`;
    }
  };

  const handleContextMenu = (e: React.MouseEvent, fileId?: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, fileId });
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Explorer
          </h2>
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="New File or Folder"
              >
                <Plus className="w-4 h-4" />
              </button>
              
              {showCreateMenu && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl z-50">
                  <button
                    onClick={handleCreateFile}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <File className="w-4 h-4" />
                    New File
                  </button>
                  <button
                    onClick={handleCreateFolder}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <FolderPlus className="w-4 h-4" />
                    New Folder
                  </button>
                </div>
              )}
            </div>
            <button
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="More Actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* New File Input */}
        {creatingFile && (
          <div className="flex items-center gap-2 px-3 py-2.5 mb-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <File className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <input
              ref={inputRef}
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCreateFile();
                if (e.key === 'Escape') handleCancelCreate();
              }}
              placeholder="Enter file name (e.g., index.html)..."
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={handleConfirmCreateFile}
              className="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={handleCancelCreate}
              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* New Folder Input */}
        {creatingFolder && (
          <div className="flex items-center gap-2 px-3 py-2.5 mb-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <FolderPlus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <input
              ref={inputRef}
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCreateFolder();
                if (e.key === 'Escape') handleCancelCreate();
              }}
              placeholder="Enter folder name..."
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={handleConfirmCreateFolder}
              className="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={handleCancelCreate}
              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {filteredFiles.length === 0 && !creatingFile && !creatingFolder ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm font-medium mb-2">No files found</p>
            <button
              onClick={() => setShowCreateMenu(true)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Create your first file or folder
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredFiles.map((file) => (
              <div key={file.id}>
                {renamingFileId === file.id ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    {getFileIcon(file.name)}
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmRename();
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                      className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                    <button
                      onClick={handleConfirmRename}
                      className="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all group ${
                      file.id === activeFileId
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setActiveFile(file.id)}
                    onContextMenu={(e) => handleContextMenu(e, file.id)}
                  >
                    {getFileIcon(file.name)}
                    <span className="flex-1 text-sm font-medium truncate">{file.name}</span>
                    {file.isDirty && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, file.id);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-2 min-w-48"
            style={{
              left: Math.min(contextMenu.x, window.innerWidth - 200),
              top: Math.min(contextMenu.y, window.innerHeight - 200),
            }}
          >
            <button 
              onClick={() => contextMenu.fileId && handleRename(contextMenu.fileId)}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
            >
              <Edit className="w-4 h-4" />
              Rename
            </button>
            <button 
              onClick={() => contextMenu.fileId && handleDuplicate(contextMenu.fileId)}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <button 
              onClick={() => contextMenu.fileId && handleDownload(contextMenu.fileId)}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
            <button
              onClick={() => contextMenu.fileId && handleDelete(contextMenu.fileId)}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}

      {/* Click outside to close create menu */}
      {showCreateMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowCreateMenu(false)}
        />
      )}
    </div>
  );
};