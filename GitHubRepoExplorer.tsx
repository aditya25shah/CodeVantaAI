import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  File, 
  ChevronRight, 
  ChevronDown, 
  Download, 
  Edit, 
  Trash2, 
  Plus, 
  RefreshCw,
  Eye,
  Code,
  FileText,
  Image,
  Database,
  Settings,
  GitBranch,
  Calendar,
  User,
  ExternalLink,
  Copy,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { GitHubAPI } from '../utils/github';
import { GitHubFile, GitHubRepo, GitHubBranch } from '../types/github';

interface GitHubRepoExplorerProps {
  githubAPI: GitHubAPI;
  selectedRepo: GitHubRepo;
  selectedBranch: GitHubBranch;
  onFileSelect: (file: GitHubFile, content: string) => void;
}

export const GitHubRepoExplorer: React.FC<GitHubRepoExplorerProps> = ({
  githubAPI,
  selectedRepo,
  selectedBranch,
  onFileSelect,
}) => {
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [folderContents, setFolderContents] = useState<Map<string, GitHubFile[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<GitHubFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [editingFile, setEditingFile] = useState<GitHubFile | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);

  // Load repository contents
  useEffect(() => {
    if (selectedRepo && selectedBranch) {
      loadRepoContents();
    }
  }, [selectedRepo, selectedBranch]);

  const loadRepoContents = async (path: string = '') => {
    if (!selectedRepo || !selectedBranch) return;

    setLoading(true);
    setError(null);
    
    try {
      const owner = selectedRepo.full_name.split('/')[0];
      const repoName = selectedRepo.name;
      const contents = await githubAPI.getRepoContents(owner, repoName, path, selectedBranch.name);
      
      if (path === '') {
        setFiles(contents);
      } else {
        setFolderContents(prev => new Map(prev).set(path, contents));
      }
    } catch (error) {
      console.error('Failed to load repository contents:', error);
      setError(`Failed to load repository contents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = async (folder: GitHubFile) => {
    const isExpanded = expandedFolders.has(folder.path);
    
    if (!isExpanded) {
      // Load folder contents if not already loaded
      if (!folderContents.has(folder.path)) {
        await loadRepoContents(folder.path);
      }
      setExpandedFolders(prev => new Set(prev).add(folder.path));
    } else {
      setExpandedFolders(prev => {
        const newSet = new Set(prev);
        newSet.delete(folder.path);
        return newSet;
      });
    }
  };

  const handleFileClick = async (file: GitHubFile) => {
    if (file.type === 'dir') {
      handleFolderClick(file);
      return;
    }

    // Only preview the file in the bottom panel, don't add to editor
    setSelectedFile(file);
    setLoadingContent(true);
    
    try {
      const owner = selectedRepo.full_name.split('/')[0];
      const repoName = selectedRepo.name;
      const content = await githubAPI.getFileContent(owner, repoName, file.path, selectedBranch.name);
      setFileContent(content);
      // IMPORTANT: Don't automatically add to editor - only when user explicitly clicks "Open in Editor"
    } catch (error) {
      console.error('Failed to load file content:', error);
      setError(`Failed to load file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleOpenInEditor = () => {
    if (selectedFile && fileContent) {
      // Only add to editor when user explicitly clicks this button
      onFileSelect(selectedFile, fileContent);
    }
  };

  const handleEditFile = (file: GitHubFile) => {
    setEditingFile(file);
    setEditContent(fileContent);
  };

  const handleSaveEdit = async () => {
    if (!editingFile || !selectedRepo || !selectedBranch) return;

    setSaving(true);
    try {
      const owner = selectedRepo.full_name.split('/')[0];
      const repoName = selectedRepo.name;
      
      // Get current file info to get SHA
      const fileInfo = await githubAPI.request(`/repos/${selectedRepo.full_name}/contents/${editingFile.path}?ref=${selectedBranch.name}`);
      
      await githubAPI.updateFile(
        owner,
        repoName,
        editingFile.path,
        editContent,
        `Update ${editingFile.name}`,
        fileInfo.sha,
        selectedBranch.name
      );
      
      setFileContent(editContent);
      setEditingFile(null);
      setEditContent('');
      
      // Refresh the file list
      await loadRepoContents();
    } catch (error) {
      console.error('Failed to save file:', error);
      setError(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFile = async (file: GitHubFile) => {
    if (!confirm(`Are you sure you want to delete ${file.name}?`)) return;
    if (!selectedRepo || !selectedBranch) return;

    try {
      const owner = selectedRepo.full_name.split('/')[0];
      const repoName = selectedRepo.name;
      
      // Get current file info to get SHA
      const fileInfo = await githubAPI.request(`/repos/${selectedRepo.full_name}/contents/${file.path}?ref=${selectedBranch.name}`);
      
      await githubAPI.request(`/repos/${selectedRepo.full_name}/contents/${file.path}`, {
        method: 'DELETE',
        body: JSON.stringify({
          message: `Delete ${file.name}`,
          sha: fileInfo.sha,
          branch: selectedBranch.name,
        }),
      });
      
      // Refresh the file list
      await loadRepoContents();
      
      if (selectedFile?.path === file.path) {
        setSelectedFile(null);
        setFileContent('');
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      setError(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim() || !selectedRepo || !selectedBranch) return;

    setCreating(true);
    try {
      const owner = selectedRepo.full_name.split('/')[0];
      const repoName = selectedRepo.name;
      
      await githubAPI.createFile(
        owner,
        repoName,
        newFileName.trim(),
        '// New file created from CodeVanta AI\n',
        `Create ${newFileName.trim()}`,
        selectedBranch.name
      );
      
      setNewFileName('');
      setShowCreateInput(false);
      
      // Refresh the file list
      await loadRepoContents();
    } catch (error) {
      console.error('Failed to create file:', error);
      setError(`Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadFile = async (file: GitHubFile) => {
    if (!file.download_url) return;
    
    try {
      const response = await fetch(file.download_url);
      const content = await response.text();
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      setError(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getFileIcon = (file: GitHubFile) => {
    if (file.type === 'dir') {
      return expandedFolders.has(file.path) ? (
        <FolderOpen className="w-4 h-4 text-blue-500" />
      ) : (
        <Folder className="w-4 h-4 text-blue-500" />
      );
    }
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return <Code className="w-4 h-4 text-yellow-500" />;
      case 'ts':
      case 'tsx':
        return <Code className="w-4 h-4 text-blue-600" />;
      case 'html':
        return <Code className="w-4 h-4 text-orange-500" />;
      case 'css':
      case 'scss':
        return <Code className="w-4 h-4 text-blue-500" />;
      case 'json':
        return <Database className="w-4 h-4 text-green-500" />;
      case 'md':
        return <FileText className="w-4 h-4 text-gray-600" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className="w-4 h-4 text-purple-500" />;
      case 'config':
      case 'env':
        return <Settings className="w-4 h-4 text-gray-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderFileTree = (fileList: GitHubFile[], level: number = 0) => {
    return fileList.map((file) => (
      <div key={file.path} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group ${
            selectedFile?.path === file.path
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'text-slate-700 dark:text-slate-300'
          }`}
          onClick={() => handleFileClick(file)}
        >
          {file.type === 'dir' && (
            <button className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded">
              {expandedFolders.has(file.path) ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
          {getFileIcon(file)}
          <span className="flex-1 text-sm truncate">{file.name}</span>
          
          {/* File Actions - Only show for files, not folders */}
          {file.type === 'file' && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadFile(file);
                }}
                className="p-1 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                title="Download"
              >
                <Download className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFile(file);
                }}
                className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
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

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-green-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {selectedRepo.name}
            </h3>
            <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
              {selectedBranch.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateInput(true)}
              className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="Create New File"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => loadRepoContents()}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Create File Input */}
        {showCreateInput && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter file name (e.g., index.html)"
              className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
              autoFocus
            />
            <button
              onClick={handleCreateFile}
              disabled={!newFileName.trim() || creating}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setShowCreateInput(false);
                setNewFileName('');
              }}
              className="px-3 py-2 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-400 dark:hover:bg-slate-500 text-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Repository Info */}
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {selectedRepo.full_name.split('/')[0]}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(selectedRepo.updated_at).toLocaleDateString()}
            </span>
            <a
              href={`https://github.com/${selectedRepo.full_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
            >
              <ExternalLink className="w-3 h-3" />
              View on GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-slate-600 dark:text-slate-400">Loading repository contents...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Repository is empty</p>
            <button
              onClick={() => setShowCreateInput(true)}
              className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Create your first file
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {renderFileTree(files)}
          </div>
        )}
      </div>

      {/* File Content Viewer/Editor - Only shows preview, not automatically added to editor */}
      {selectedFile && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getFileIcon(selectedFile)}
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {selectedFile.name}
                </span>
                {selectedFile.size && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditFile(selectedFile)}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleOpenInEditor}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                >
                  Open in Editor
                </button>
              </div>
            </div>

            {loadingContent ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Loading file content...</span>
              </div>
            ) : editingFile?.path === selectedFile.path ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-64 px-3 py-2 text-sm font-mono border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingFile(null);
                      setEditContent('');
                    }}
                    className="px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-400 dark:hover:bg-slate-500 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    📁 <strong>Preview Mode:</strong> This file is only being previewed. Click "Open in Editor" to add it to your workspace.
                  </p>
                </div>
                <pre className="text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3 overflow-auto max-h-64 text-slate-900 dark:text-white">
                  {fileContent}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};