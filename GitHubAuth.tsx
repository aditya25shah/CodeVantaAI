import React, { useState } from 'react';
import { Github, Key, User, LogOut } from 'lucide-react';

interface GitHubAuthProps {
  onAuth: (token: string) => void;
  isAuthenticated: boolean;
  user?: { login: string; avatar_url: string; name: string };
  onLogout: () => void;
}

export const GitHubAuth: React.FC<GitHubAuthProps> = ({ onAuth, isAuthenticated, user, onLogout }) => {
  const [token, setToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  const handleAuth = () => {
    if (token.trim()) {
      onAuth(token.trim());
      setToken('');
      setShowTokenInput(false);
    }
  };

  const handleOAuth = () => {
    const clientId = 'your_github_oauth_app_client_id'; // Replace with actual client ID
    const redirectUri = window.location.origin;
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;
    window.location.href = authUrl;
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-300 font-medium">
          {user.name || user.login}
        </span>
        <button
          onClick={onLogout}
          className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!showTokenInput ? (
        <div className="flex flex-col gap-2">
          <button
            onClick={handleOAuth}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            <Github className="w-4 h-4" />
            Connect with GitHub
          </button>
          <button
            onClick={() => setShowTokenInput(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Key className="w-4 h-4" />
            Use Personal Access Token
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Key className="w-4 h-4" />
            <span>Enter your GitHub Personal Access Token</span>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
            />
            <button
              onClick={handleAuth}
              disabled={!token.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Connect
            </button>
          </div>
          <button
            onClick={() => setShowTokenInput(false)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};