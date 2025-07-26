import React, { useState } from 'react';
import { Github, Key, Bot, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Code2, Shield, Zap, Brain } from 'lucide-react';

interface TokenSetupProps {
  onTokensSubmit: (githubToken: string, geminiToken: string) => void;
}

export const TokenSetup: React.FC<TokenSetupProps> = ({ onTokensSubmit }) => {
  const [githubToken, setGithubToken] = useState('');
  const [geminiToken, setGeminiToken] = useState('');
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showGeminiToken, setShowGeminiToken] = useState(false);
  const [githubVerifying, setGithubVerifying] = useState(false);
  const [geminiVerifying, setGeminiVerifying] = useState(false);
  const [githubValid, setGithubValid] = useState<boolean | null>(null);
  const [geminiValid, setGeminiValid] = useState<boolean | null>(null);

  const verifyGithubToken = async (token: string) => {
    if (!token.trim()) return;
    
    setGithubVerifying(true);
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      setGithubValid(response.ok);
    } catch (error) {
      setGithubValid(false);
    } finally {
      setGithubVerifying(false);
    }
  };

  const verifyGeminiToken = async (token: string) => {
    if (!token.trim()) return;
    
    setGeminiVerifying(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${token}`);
      setGeminiValid(response.ok);
    } catch (error) {
      setGeminiValid(false);
    } finally {
      setGeminiVerifying(false);
    }
  };

  const handleGithubTokenChange = (value: string) => {
    setGithubToken(value);
    setGithubValid(null);
    if (value.trim() && (value.startsWith('ghp_') || value.startsWith('github_pat_'))) {
      const timeoutId = setTimeout(() => verifyGithubToken(value), 1000);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleGeminiTokenChange = (value: string) => {
    setGeminiToken(value);
    setGeminiValid(null);
    if (value.trim() && value.length > 20) {
      const timeoutId = setTimeout(() => verifyGeminiToken(value), 1000);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleSubmit = () => {
    if (githubValid && geminiValid && githubToken.trim() && geminiToken.trim()) {
      onTokensSubmit(githubToken.trim(), geminiToken.trim());
    }
  };

  const getTokenStatus = (isValid: boolean | null, isVerifying: boolean) => {
    if (isVerifying) return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    if (isValid === true) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (isValid === false) return <AlertCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Setup Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-12 text-white text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-6">
            <Brain className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Setup Your Workspace</h2>
          <p className="text-blue-100 text-lg">Connect your accounts to unlock the full potential of CodeVanta AI</p>
        </div>

        <div className="p-8 space-y-8">
          {/* GitHub Token */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <Github className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">GitHub Personal Access Token</h3>
                <p className="text-slate-600 dark:text-slate-400">Required for repository access and file management</p>
              </div>
            </div>

            <div className="relative">
              <input
                type={showGithubToken ? 'text' : 'password'}
                value={githubToken}
                onChange={(e) => handleGithubTokenChange(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-4 pr-20 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                {getTokenStatus(githubValid, githubVerifying)}
                <button
                  type="button"
                  onClick={() => setShowGithubToken(!showGithubToken)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  {showGithubToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {githubValid === false && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                Invalid token. Please check your GitHub Personal Access Token.
              </div>
            )}

            {githubValid === true && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                GitHub token verified successfully.
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <Key className="w-5 h-5" />
                How to get your GitHub token:
              </h4>
              <ol className="text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside text-sm">
                <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline font-medium">GitHub Settings → Personal access tokens</a></li>
                <li>Click "Generate new token (classic)"</li>
                <li>Select scopes: <code className="bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded font-mono text-xs">repo</code>, <code className="bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded font-mono text-xs">user</code></li>
                <li>Copy the generated token</li>
              </ol>
            </div>
          </div>

          {/* Gemini Token */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Gemini API Key</h3>
                <p className="text-slate-600 dark:text-slate-400">Required for AI-powered code assistance and intelligent features</p>
              </div>
            </div>

            <div className="relative">
              <input
                type={showGeminiToken ? 'text' : 'password'}
                value={geminiToken}
                onChange={(e) => handleGeminiTokenChange(e.target.value)}
                placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-4 pr-20 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                {getTokenStatus(geminiValid, geminiVerifying)}
                <button
                  type="button"
                  onClick={() => setShowGeminiToken(!showGeminiToken)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  {showGeminiToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {geminiValid === false && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                Invalid API key. Please check your Gemini API key.
              </div>
            )}

            {geminiValid === true && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                Gemini API key verified successfully.
              </div>
            )}

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                How to get your Gemini API key:
              </h4>
              <ol className="text-purple-800 dark:text-purple-200 space-y-2 list-decimal list-inside text-sm">
                <li>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline font-medium">Google AI Studio</a></li>
                <li>Sign in with your Google account</li>
                <li>Click "Create API Key"</li>
                <li>Copy the generated API key</li>
              </ol>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={!githubValid || !geminiValid}
              className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {githubValid && geminiValid ? (
                <span className="flex items-center justify-center gap-3">
                  <Brain className="w-5 h-5" />
                  Launch CodeVanta AI
                  <Zap className="w-5 h-5" />
                </span>
              ) : (
                'Verify Tokens to Continue'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};