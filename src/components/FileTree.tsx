import React, { useState, useRef } from 'react';
import { 
  Folder, 
  File, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  FileText,
  FolderPlus,
  X,
  Check,
  Code,
  Image,
  FileJson,
  FileCode,
  Braces,
  Database,
  Settings,
  Upload,
  Download
} from 'lucide-react';
import { GitHubFile } from '../types/github';

interface FileTreeProps {
  files: GitHubFile[];
  onFileSelect: (file: GitHubFile) => void;
  onCreateFile: (name: string, path: string) => void;
  onCreateFolder: (name: string, path: string) => void;
  onLoadFolderContents: (folder: GitHubFile) => void;
  selectedFile?: GitHubFile;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  folderContents: Map<string, GitHubFile[]>;
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onLoadFolderContents,
  selectedFile,
  expandedFolders,
  onToggleFolder,
  folderContents,
}) => {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [createType, setCreateType] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [createPath, setCreatePath] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: GitHubFile) => {
    if (file.type === 'dir') {
      return expandedFolders.has(file.path) ? (
        <FolderOpen className="w-5 h-5 text-blue-500 dark:text-blue-400" />
      ) : (
        <Folder className="w-5 h-5 text-blue-500 dark:text-blue-400" />
      );
    }
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return <FileCode className="w-5 h-5 text-yellow-500" />;
      case 'ts':
      case 'tsx':
        return <FileCode className="w-5 h-5 text-blue-600" />;
      case 'html':
        return <Code className="w-5 h-5 text-orange-500" />;
      case 'css':
      case 'scss':
      case 'sass':
        return <Braces className="w-5 h-5 text-blue-500" />;
      case 'json':
        return <FileJson className="w-5 h-5 text-green-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
        return <Image className="w-5 h-5 text-purple-500" />;
      case 'md':
      case 'mdx':
        return <FileText className="w-5 h-5 text-gray-600" />;
      case 'sql':
        return <Database className="w-5 h-5 text-orange-600" />;
      case 'config':
      case 'conf':
      case 'env':
        return <Settings className="w-5 h-5 text-gray-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getFileExtensionColor = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html':
        return 'text-orange-600 dark:text-orange-400';
      case 'css':
      case 'scss':
      case 'sass':
        return 'text-blue-600 dark:text-blue-400';
      case 'js':
      case 'jsx':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'ts':
      case 'tsx':
        return 'text-blue-700 dark:text-blue-300';
      case 'json':
        return 'text-green-600 dark:text-green-400';
      case 'md':
      case 'mdx':
        return 'text-gray-700 dark:text-gray-300';
      case 'py':
        return 'text-green-700 dark:text-green-300';
      case 'java':
        return 'text-red-600 dark:text-red-400';
      case 'cpp':
      case 'c':
        return 'text-purple-600 dark:text-purple-400';
      case 'php':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'sql':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleCreate = () => {
    if (!newItemName.trim() || !createType) return;
    
    const fullPath = createPath ? `${createPath}/${newItemName}` : newItemName;
    
    if (createType === 'file') {
      onCreateFile(newItemName, fullPath);
    } else {
      onCreateFolder(newItemName, fullPath);
    }
    
    setNewItemName('');
    setCreateType(null);
    setShowCreateMenu(false);
    setCreatePath('');
  };

  const handleCancel = () => {
    setNewItemName('');
    setCreateType(null);
    setShowCreateMenu(false);
    setCreatePath('');
  };

  const handleFolderClick = async (folder: GitHubFile) => {
    const isExpanded = expandedFolders.has(folder.path);
    
    if (!isExpanded) {
      // Load folder contents if not already loaded
      if (!folderContents.has(folder.path)) {
        await onLoadFolderContents(folder);
      }
    }
    
    onToggleFolder(folder.path);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onCreateFile(file.name, file.name);
        // You might want to add a callback to set the file content
      };
      reader.readAsText(file);
    });
  };

  const renderFileTree = (fileList: GitHubFile[], level: number = 0) => {
    return fileList.map((file) => (
      <div key={file.path} style={{ marginLeft: `${level * 20}px` }}>
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 group backdrop-blur-sm ${
            selectedFile?.path === file.path
              ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm border border-indigo-200/50 dark:border-indigo-800/50'
              : 'text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => {
            if (file.type === 'dir') {
              handleFolderClick(file);
            } else {
              onFileSelect(file);
            }
          }}
        >
          {file.type === 'dir' && (
            <button className="p-1 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 rounded-lg transition-colors">
              {expandedFolders.has(file.path) ? (
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          )}
          {getFileIcon(file)}
          <span className={`text-sm truncate font-medium ${getFileExtensionColor(file.name)}`}>
            {file.name}
          </span>
          {selectedFile?.path === file.path && (
            <div className="w-2 h-2 bg-indigo-500 rounded-full ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
        
        {/* Render folder contents if expanded */}
        {file.type === 'dir' && expandedFolders.has(file.path) && folderContents.has(file.path) && (
          <div className="mt-1">
            {renderFileTree(folderContents.get(file.path) || [], level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const fileTemplates = [
    { name: 'HTML File', ext: 'html', icon: Code },
    { name: 'CSS File', ext: 'css', icon: Braces },
    { name: 'JavaScript', ext: 'js', icon: FileCode },
    { name: 'TypeScript', ext: 'ts', icon: FileCode },
    { name: 'React JSX', ext: 'jsx', icon: FileCode },
    { name: 'React TSX', ext: 'tsx', icon: FileCode },
    { name: 'JSON File', ext: 'json', icon: FileJson },
    { name: 'Markdown', ext: 'md', icon: FileText },
  ];

  return (
    <div className="space-y-4">
      {/* Create Menu */}
      <div className="px-4 py-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-700/80 backdrop-blur-sm rounded-xl mx-3">
        {!showCreateMenu ? (
          <div className="space-y-3">
            <button
              onClick={() => setShowCreateMenu(true)}
              className="flex items-center gap-3 w-full px-5 py-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-transparent hover:border-gray-200/50 dark:hover:border-gray-600/50 backdrop-blur-sm font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>New File or Folder</span>
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".js,.ts,.jsx,.tsx,.html,.css,.json,.md,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.swift,.kt,.dart,.scala,.sh,.yml,.yaml,.xml,.sql"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 w-full px-5 py-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-transparent hover:border-gray-200/50 dark:hover:border-gray-600/50 backdrop-blur-sm font-medium"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Files</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex gap-3">
              <button
                onClick={() => setCreateType('file')}
                className={`flex items-center gap-2 px-5 py-3 text-sm rounded-xl transition-all duration-200 shadow-sm font-medium ${
                  createType === 'file'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-gray-50/80 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm'
                }`}
              >
                <FileText className="w-4 h-4" />
                File
              </button>
              <button
                onClick={() => setCreateType('folder')}
                className={`flex items-center gap-2 px-5 py-3 text-sm rounded-xl transition-all duration-200 shadow-sm font-medium ${
                  createType === 'folder'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-gray-50/80 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm'
                }`}
              >
                <FolderPlus className="w-4 h-4" />
                Folder
              </button>
            </div>
            
            {createType === 'file' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Quick Templates:</p>
                <div className="grid grid-cols-2 gap-2">
                  {fileTemplates.map((template) => (
                    <button
                      key={template.ext}
                      onClick={() => setNewItemName(`untitled.${template.ext}`)}
                      className="flex items-center gap-2 p-3 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-lg transition-colors border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm"
                    >
                      <template.icon className="w-4 h-4" />
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {createType && (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={`${createType} name`}
                  className="flex-1 px-4 py-3 text-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent shadow-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') handleCancel();
                  }}
                  autoFocus
                />
                <button
                  onClick={handleCreate}
                  className="p-3 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50/80 dark:hover:bg-green-900/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-3 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50/80 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* File Tree */}
      <div className="px-3 space-y-2">
        {files.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No files yet</p>
            <p className="text-sm">Create your first file or upload existing ones</p>
          </div>
        ) : (
          renderFileTree(files)
        )}
      </div>
    </div>
  );
};