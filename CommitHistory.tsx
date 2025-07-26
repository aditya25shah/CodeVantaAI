import React from 'react';
import { X, GitCommit, User, Calendar } from 'lucide-react';
import { GitHubCommit } from '../types/github';

interface CommitHistoryProps {
  commits: GitHubCommit[];
  onClose: () => void;
  isOpen: boolean;
}

export const CommitHistory: React.FC<CommitHistoryProps> = ({ commits, onClose, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Commit History</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[60vh]">
          {commits.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No commits found
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {commits.map((commit) => (
                <div key={commit.sha} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {commit.author ? (
                        <img
                          src={commit.author.avatar_url}
                          alt={commit.author.login}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <GitCommit className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                          {commit.sha.substring(0, 7)}
                        </span>
                      </div>
                      
                      <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">
                        {commit.commit.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {commit.commit.author.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(commit.commit.author.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};