import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Upload, 
  Plus, 
  Lock, 
  Unlock, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  X,
  Folder,
  GitBranch,
  ChevronDown,
  Calendar
} from 'lucide-react';
import { GitHubAPI } from '../utils/github';
import { GitHubRepo, GitHubBranch } from '../types/github';

interface GitHubIntegrationProps {
  onUploadSuccess: () => void;
  files: Array<{ id: string; name: string; content: string; path: string }>;
}

export const GitHubIntegration: React.FC<GitHubIntegrationProps> = ({
  onUploadSuccess,
  files
}) => {
  const [githubAPI, setGithubAPI] = useState<GitHubAPI | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Repository creation state
  const [repoName, setRepoName] = useState('');
  const [repoDescription, setRepoDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [checkingName, setCheckingName] = useState(false);

  // Initialize GitHub API
  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (token) {
      const api = new GitHubAPI(token);
      setGithubAPI(api);
      loadRepositories(api);
    }
  }, []);

  const loadRepositories = async (api: GitHubAPI) => {
    try {
      setLoading(true);
      const repositories = await api.getRepositories();
      setRepos(repositories);
    } catch (error) {
      console.error('Failed to load repositories:', error);
      alert('Failed to load repositories. Please check your GitHub token.');
    } finally {
      setLoading(false);
    }
  };

  const checkRepoNameAvailability = async (name: string) => {
    if (!githubAPI || !name.trim()) {
      setNameAvailable(null);
      return;
    }

    setCheckingName(true);
    try {
      const exists = await githubAPI.checkRepositoryExists(name);
      setNameAvailable(!exists);
    } catch (error) {
      setNameAvailable(true);
    } finally {
      setCheckingName(false);
    }
  };

  const handleRepoNameChange = (value: string) => {
    setRepoName(value);
    setNameAvailable(null);
    
    if (value.trim()) {
      const timeoutId = setTimeout(() => checkRepoNameAvailability(value), 1000);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleCreateRepository = async () => {
    if (!githubAPI || !repoName.trim() || nameAvailable !== true) return;

    try {
      setLoading(true);
      const newRepo = await githubAPI.createRepository(
        repoName.trim(),
        repoDescription.trim(),
        isPrivate
      );
      
      setRepos(prev => [newRepo, ...prev]);
      setSelectedRepo(newRepo);
      setShowCreateModal(false);
      setRepoName('');
      setRepoDescription('');
      setIsPrivate(false);
      setNameAvailable(null);
      
      // Auto-upload files to new repo
      if (files.length > 0) {
        await handleUploadFiles(newRepo);
      } else {
        alert(`Repository "${newRepo.name}" created successfully!`);
        setShowRepoModal(false);
      }
    } catch (error) {
      console.error('Failed to create repository:', error);
      alert(`Failed to create repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFiles = async (repo?: GitHubRepo) => {
    const targetRepo = repo || selectedRepo;
    if (!githubAPI || !targetRepo || files.length === 0) {
      if (files.length === 0) {
        alert('No files to upload. Please create some files first.');
      }
      return;
    }

    try {
      setUploading(true);
      
      // Upload files using the improved method
      await githubAPI.uploadMultipleFiles(
        targetRepo.full_name.split('/')[0],
        targetRepo.name,
        files.map(file => ({
          path: file.path,
          content: file.content,
          name: file.name
        })),
        'main'
      );
      
      onUploadSuccess();
      setShowRepoModal(false);
      alert(`Successfully uploaded ${files.length} files to ${targetRepo.name}!`);
    } catch (error) {
      console.error('Failed to upload files:', error);
      alert(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    if (!githubAPI) {
      alert('Please configure your GitHub token first.');
      return;
    }
    
    if (files.length === 0) {
      alert('No files to upload. Please create some files first.');
      return;
    }
    
    setShowRepoModal(true);
  };

  const getNameStatus = () => {
    if (checkingName) return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    if (nameAvailable === true) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (nameAvailable === false) return <AlertCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <>
      {/* Upload Button - Small Box Style */}
      <button
        onClick={handleUploadClick}
        disabled={!githubAPI || files.length === 0 || uploading}
        className="p-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:opacity-50 text-white rounded-lg transition-colors"
        title={`Upload ${files.length} files to GitHub`}
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
      </button>

      {/* Repository Selection Modal */}
      {showRepoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Github className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload to GitHub</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Select a repository or create a new one
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRepoModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Files to Upload */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Files to Upload ({files.length})
                </h3>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 max-h-32 overflow-y-auto">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 py-1">
                      <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs">📄</span>
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Repository Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Select Repository
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create New
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-slate-600 dark:text-slate-400">Loading repositories...</span>
                  </div>
                ) : repos.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">No repositories found</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Create Your First Repository
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {repos.map((repo) => (
                      <button
                        key={repo.id}
                        onClick={() => setSelectedRepo(repo)}
                        className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                          selectedRepo?.id === repo.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Folder className="w-5 h-5 text-blue-500" />
                          <div className="text-left">
                            <div className="font-medium text-slate-900 dark:text-white">{repo.name}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{repo.full_name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          {repo.private ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          <Calendar className="w-3 h-3" />
                          {new Date(repo.updated_at).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowRepoModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUploadFiles()}
                disabled={!selectedRepo || uploading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </div>
                ) : (
                  `Upload to ${selectedRepo?.name || 'Repository'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Repository Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Repository</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Create a new GitHub repository</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {/* Repository Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Repository Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => handleRepoNameChange(e.target.value)}
                    placeholder="my-awesome-project"
                    className="w-full px-4 py-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getNameStatus()}
                  </div>
                </div>
                {nameAvailable === false && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    This repository name already exists.
                  </p>
                )}
                {nameAvailable === true && (
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Repository name is available.
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Description (optional)
                </label>
                <textarea
                  value={repoDescription}
                  onChange={(e) => setRepoDescription(e.target.value)}
                  placeholder="A brief description of your project..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Privacy */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Repository Visibility
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => setIsPrivate(false)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all ${
                      !isPrivate
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <Unlock className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">Public</div>
                      <div className="text-sm opacity-75">Anyone can see this repository</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setIsPrivate(true)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all ${
                      isPrivate
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">Private</div>
                      <div className="text-sm opacity-75">Only you can see this repository</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRepository}
                disabled={!repoName.trim() || nameAvailable !== true || loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </div>
                ) : (
                  'Create & Upload'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};