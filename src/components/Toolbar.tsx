import React, { useState, useEffect } from 'react';
import {
  Save,
  Play,
  Download,
  Upload,
  Share2,
  Settings,
  Command,
  Bot,
  Terminal as TerminalIcon,
  Sidebar,
  Moon,
  Sun,
  Zap,
  GitBranch,
  Search,
  Code,
  FileText,
  Code2,
  Github,
  ChevronDown,
  Folder,
  Calendar,
  Plus,
  Brain,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { GitHubAPI } from '../utils/github';
import { GitHubRepo, GitHubBranch } from '../types/github';
import { GitHubIntegration } from './GitHubIntegration';

export const Toolbar: React.FC = () => {
  const {
    toggleSidebar,
    toggleAIPanel,
    toggleTerminal,
    toggleCommandPalette,
    sidebarVisible,
    aiPanelVisible,
    terminalVisible,
    settings,
    updateSettings,
    files,
    activeFileId,
    updateFile,
  } = useEditorStore();

  const [githubAPI, setGithubAPI] = useState<GitHubAPI | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<GitHubBranch | null>(null);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [githubUser, setGithubUser] = useState<any>(null);
  const [pushing, setPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const activeFile = files.find(f => f.id === activeFileId);
  const hasUnsavedChanges = files.some(f => f.isDirty);

  // Initialize GitHub API
  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (token) {
      const api = new GitHubAPI(token);
      setGithubAPI(api);
      
      // Load user and repos
      api.getUser().then(user => {
        setGithubUser(user);
      }).catch(console.error);
      
      loadRepositories(api);
    }
  }, []);

  const loadRepositories = async (api: GitHubAPI) => {
    try {
      const repositories = await api.getRepositories();
      setRepos(repositories);
      
      // Auto-select the first repo if none selected
      if (repositories.length > 0 && !selectedRepo) {
        setSelectedRepo(repositories[0]);
      }
    } catch (error) {
      console.error('Failed to load repositories:', error);
    }
  };

  // Load branches when repo is selected
  useEffect(() => {
    if (selectedRepo && githubAPI) {
      githubAPI.getBranches(selectedRepo.full_name.split('/')[0], selectedRepo.name)
        .then(branches => {
          setBranches(branches);
          const defaultBranch = branches.find(b => b.name === selectedRepo.default_branch) || branches[0];
          setSelectedBranch(defaultBranch);
        })
        .catch(console.error);
    }
  }, [selectedRepo, githubAPI]);

  const handleSave = () => {
    if (activeFile) {
      updateFile(activeFile.id, { isDirty: false });
      console.log('File saved');
    }
  };

  const handleRun = () => {
    if (!activeFile) return;
    
    // Auto-open terminal if not visible
    if (!terminalVisible) {
      toggleTerminal();
    }
    
    // Small delay to ensure terminal is open, then trigger run command
    setTimeout(() => {
      const event = new CustomEvent('terminal-run-file', { 
        detail: { fileName: activeFile.name } 
      });
      window.dispatchEvent(event);
    }, 100);
  };

  const handleFormat = () => {
    console.log('Format code');
  };

  const handlePush = async () => {
    if (!selectedRepo || !githubAPI || !activeFile) {
      alert('Please select a repository and ensure you have an active file');
      return;
    }
    
    setPushing(true);
    setPushStatus('idle');
    
    try {
      // Check if file exists in repo first
      let fileSha: string | undefined;
      try {
        const existingFile = await githubAPI.getFileContent(
          selectedRepo.full_name.split('/')[0],
          selectedRepo.name,
          activeFile.path,
          selectedBranch?.name || 'main'
        );
        // If file exists, we need to get its SHA for updating
        const fileInfo = await githubAPI.request(`/repos/${selectedRepo.full_name}/contents/${activeFile.path}?ref=${selectedBranch?.name || 'main'}`);
        fileSha = fileInfo.sha;
      } catch (error) {
        // File doesn't exist, we'll create it
        fileSha = undefined;
      }

      if (fileSha) {
        // Update existing file
        await githubAPI.updateFile(
          selectedRepo.full_name.split('/')[0],
          selectedRepo.name,
          activeFile.path,
          activeFile.content,
          `Update ${activeFile.name}`,
          fileSha,
          selectedBranch?.name || 'main'
        );
      } else {
        // Create new file
        await githubAPI.createFile(
          selectedRepo.full_name.split('/')[0],
          selectedRepo.name,
          activeFile.path,
          activeFile.content,
          `Add ${activeFile.name}`,
          selectedBranch?.name || 'main'
        );
      }
      
      // Mark file as saved
      updateFile(activeFile.id, { isDirty: false });
      setPushStatus('success');
      
      setTimeout(() => setPushStatus('idle'), 3000);
      
    } catch (error) {
      console.error('Failed to push to GitHub:', error);
      setPushStatus('error');
      alert(`Failed to push to GitHub: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setPushStatus('idle'), 3000);
    } finally {
      setPushing(false);
    }
  };

  const handleRepoSelect = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setShowRepoDropdown(false);
    
    // Load branches for the selected repo
    if (githubAPI) {
      githubAPI.getBranches(repo.full_name.split('/')[0], repo.name)
        .then(branches => {
          setBranches(branches);
          const defaultBranch = branches.find(b => b.name === repo.default_branch) || branches[0];
          setSelectedBranch(defaultBranch);
        })
        .catch(console.error);
    }
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'vs-dark' ? 'vs-light' : 'vs-dark';
    updateSettings({ theme: newTheme });
  };

  const handleUploadSuccess = () => {
    // Refresh repositories after successful upload
    if (githubAPI) {
      loadRepositories(githubAPI);
    }
  };

  const getPushButtonText = () => {
    if (pushing) return 'Pushing...';
    if (pushStatus === 'success') return 'Pushed!';
    if (pushStatus === 'error') return 'Failed';
    return 'Push';
  };

  const getPushButtonIcon = () => {
    if (pushing) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (pushStatus === 'success') return <CheckCircle className="w-4 h-4" />;
    if (pushStatus === 'error') return <AlertCircle className="w-4 h-4" />;
    return <Upload className="w-4 h-4" />;
  };

  const getPushButtonColor = () => {
    if (pushStatus === 'success') return 'bg-green-600 hover:bg-green-700';
    if (pushStatus === 'error') return 'bg-red-600 hover:bg-red-700';
    return 'bg-blue-600 hover:bg-blue-700';
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowRepoDropdown(false);
      setShowBranchDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 mr-6">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">CodeVanta AI</span>
        </div>

        {/* GitHub Integration */}
        {githubAPI && (
          <div className="flex items-center gap-3">
            {/* Repository Selector */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRepoDropdown(!showRepoDropdown);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Folder className="w-4 h-4 text-blue-500" />
                <span className="max-w-32 truncate">
                  {selectedRepo ? selectedRepo.name : 'Select Repo'}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showRepoDropdown && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                  {repos.length === 0 ? (
                    <div className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">
                      No repositories found
                    </div>
                  ) : (
                    repos.map((repo) => (
                      <button
                        key={repo.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRepoSelect(repo);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors ${
                          selectedRepo?.id === repo.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{repo.name}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{repo.full_name}</div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(repo.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
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
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <GitBranch className="w-4 h-4 text-green-500" />
                  <span className="max-w-24 truncate">
                    {selectedBranch ? selectedBranch.name : 'main'}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showBranchDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto">
                    {branches.length === 0 ? (
                      <div className="px-4 py-2 text-center text-slate-500 dark:text-slate-400 text-sm">
                        No branches found
                      </div>
                    ) : (
                      branches.map((branch) => (
                        <button
                          key={branch.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBranch(branch);
                            setShowBranchDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 text-sm ${
                            selectedBranch?.name === branch.name
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {branch.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Push Button */}
            <button
              onClick={handlePush}
              disabled={!selectedRepo || !activeFile || pushing}
              className={`flex items-center gap-2 px-3 py-2 ${getPushButtonColor()} disabled:bg-slate-300 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium`}
            >
              {getPushButtonIcon()}
              {getPushButtonText()}
            </button>
          </div>
        )}

        {/* File Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          
          <button
            onClick={handleRun}
            disabled={!activeFile}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
          >
            <Play className="w-4 h-4" />
            Run
          </button>
          
          <button
            onClick={handleFormat}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium"
          >
            <Code className="w-4 h-4" />
            Format
          </button>
        </div>
      </div>

      {/* Center Section - File Info */}
      <div className="flex items-center gap-3">
        {activeFile && (
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{activeFile.name}</span>
            {activeFile.isDirty && (
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
            )}
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* GitHub Integration Component - Small Box Style */}
        {githubAPI && (
          <GitHubIntegration
            onUploadSuccess={handleUploadSuccess}
            files={files}
          />
        )}

        {/* View Controls */}
        <div className="flex items-center gap-1 mr-4">
          <button
            onClick={toggleSidebar}
            className={`p-2.5 rounded-lg transition-colors ${
              sidebarVisible
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Toggle Sidebar"
          >
            <Sidebar className="w-4 h-4" />
          </button>
          
          <button
            onClick={toggleTerminal}
            className={`p-2.5 rounded-lg transition-colors ${
              terminalVisible
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Toggle Terminal"
          >
            <TerminalIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={toggleAIPanel}
            className={`p-2.5 rounded-lg transition-colors ${
              aiPanelVisible
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Toggle AI Assistant"
          >
            <Brain className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleCommandPalette}
            className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Command Palette (Ctrl+Shift+P)"
          >
            <Command className="w-4 h-4" />
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Toggle Theme"
          >
            {settings.theme === 'vs-dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          
          <button
            className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3 ml-4">
          {githubUser && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm">
              <Github className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">{githubUser.login}</span>
            </div>
          )}
          
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-medium">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              Unsaved
            </div>
          )}
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
            <Zap className="w-3 h-3" />
            AI Ready
          </div>
        </div>
      </div>
    </div>
  );
};
