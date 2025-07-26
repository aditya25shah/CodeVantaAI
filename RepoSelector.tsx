import React, { useState, useEffect } from 'react';
import { GitBranch, Folder, Calendar, ChevronDown, Plus } from 'lucide-react';
import { GitHubRepo, GitHubBranch } from '../types/github';

interface RepoSelectorProps {
  repos: GitHubRepo[];
  branches: GitHubBranch[];
  selectedRepo?: GitHubRepo;
  selectedBranch?: GitHubBranch;
  onRepoSelect: (repo: GitHubRepo) => void;
  onBranchSelect: (branch: GitHubBranch) => void;
  onCreateBranch: (branchName: string) => void;
  loading: boolean;
}

export const RepoSelector: React.FC<RepoSelectorProps> = ({
  repos,
  branches,
  selectedRepo,
  selectedBranch,
  onRepoSelect,
  onBranchSelect,
  onCreateBranch,
  loading,
}) => {
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [showCreateBranch, setShowCreateBranch] = useState(false);

  const handleCreateBranch = () => {
    if (newBranchName.trim()) {
      onCreateBranch(newBranchName.trim());
      setNewBranchName('');
      setShowCreateBranch(false);
      setShowBranchDropdown(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowRepoDropdown(false);
      setShowBranchDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-3">
      {/* Repository Selector */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowRepoDropdown(!showRepoDropdown);
          }}
          className="flex items-center gap-3 px-4 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-xl text-sm hover:bg-gray-600/80 transition-all duration-200 shadow-sm hover:shadow-md"
          disabled={loading}
        >
          <Folder className="w-4 h-4 text-blue-400" />
          <span className="max-w-48 truncate text-gray-200 font-medium">
            {selectedRepo ? selectedRepo.name : 'Select Repository'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {showRepoDropdown && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
            {repos.map((repo) => (
              <button
                key={repo.id}
                onClick={() => {
                  onRepoSelect(repo);
                  setShowRepoDropdown(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-700/80 border-b border-gray-700/50 last:border-b-0 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-100">{repo.name}</div>
                    <div className="text-sm text-gray-400">{repo.full_name}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(repo.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Branch Selector */}
      {selectedRepo && (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowBranchDropdown(!showBranchDropdown);
            }}
            className="flex items-center gap-3 px-4 py-2 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-xl text-sm hover:bg-gray-600/80 transition-all duration-200 shadow-sm hover:shadow-md"
            disabled={loading}
          >
            <GitBranch className="w-4 h-4 text-green-400" />
            <span className="max-w-32 truncate text-gray-200 font-medium">
              {selectedBranch ? selectedBranch.name : 'main'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showBranchDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-xl shadow-xl z-20">
              <div className="p-3 border-b border-gray-700/50">
                {!showCreateBranch ? (
                  <button
                    onClick={() => setShowCreateBranch(true)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create new branch
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      placeholder="Branch name"
                      className="flex-1 px-3 py-2 text-sm border border-gray-600/50 rounded-lg bg-gray-700/80 backdrop-blur-sm text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateBranch()}
                      autoFocus
                    />
                    <button
                      onClick={handleCreateBranch}
                      className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Create
                    </button>
                  </div>
                )}
              </div>
              <div className="max-h-40 overflow-y-auto">
                {branches.map((branch) => (
                  <button
                    key={branch.name}
                    onClick={() => {
                      onBranchSelect(branch);
                      setShowBranchDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-700/50 text-sm transition-colors ${
                      selectedBranch?.name === branch.name
                        ? 'bg-purple-900/30 text-purple-300 border-l-2 border-purple-500'
                        : 'text-gray-300'
                    }`}
                  >
                    {branch.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};