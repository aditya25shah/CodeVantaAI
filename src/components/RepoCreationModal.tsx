import React, { useState } from 'react';
import { X, Github, Lock, Unlock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { GitHubAPI } from '../utils/github';

interface RepoCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRepo: (name: string, description: string, isPrivate: boolean) => void;
  githubAPI: GitHubAPI | null;
  loading: boolean;
}

export const RepoCreationModal: React.FC<RepoCreationModalProps> = ({
  isOpen,
  onClose,
  onCreateRepo,
  githubAPI,
  loading,
}) => {
  const [repoName, setRepoName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [checkingName, setCheckingName] = useState(false);

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

  const handleSubmit = () => {
    if (repoName.trim() && nameAvailable) {
      onCreateRepo(repoName.trim(), description.trim(), isPrivate);
    }
  };

  const getNameStatus = () => {
    if (checkingName) return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    if (nameAvailable === true) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (nameAvailable === false) return <AlertCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-800/80 backdrop-blur-sm flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
              <Github className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create Repository</h2>
              <p className="text-xs text-gray-400">Push your files to GitHub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {/* Repository Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-200">
              Repository Name *
            </label>
            <div className="relative">
              <input
                type="text"
                value={repoName}
                onChange={(e) => handleRepoNameChange(e.target.value)}
                placeholder="my-awesome-project"
                className="w-full px-3 py-2.5 pr-10 border border-gray-600/50 rounded-lg bg-gray-800/80 backdrop-blur-sm text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {getNameStatus()}
              </div>
            </div>
            {nameAvailable === false && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                This repository name already exists.
              </p>
            )}
            {nameAvailable === true && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Repository name is available.
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-200">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your project..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-600/50 rounded-lg bg-gray-800/80 backdrop-blur-sm text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-sm"
            />
          </div>

          {/* Privacy */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-200">
              Repository Visibility
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setIsPrivate(false)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-sm ${
                  !isPrivate
                    ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                    : 'border-gray-600/50 bg-gray-800/50 text-gray-400 hover:border-gray-500/50'
                }`}
              >
                <Unlock className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-semibold">Public</div>
                  <div className="text-xs opacity-75">Anyone can see this repository</div>
                </div>
              </button>
              <button
                onClick={() => setIsPrivate(true)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-sm ${
                  isPrivate
                    ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                    : 'border-gray-600/50 bg-gray-800/50 text-gray-400 hover:border-gray-500/50'
                }`}
              >
                <Lock className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-semibold">Private</div>
                  <div className="text-xs opacity-75">Only you can see this repository</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700/50 flex-shrink-0 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!repoName.trim() || nameAvailable !== true || loading}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Creating...
              </div>
            ) : (
              'Create Repository'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};