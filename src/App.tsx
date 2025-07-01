import React from 'react';
import { useEditorStore } from './store/editorStore';
import { MainLayout } from './components/layout/MainLayout';
import { TokenSetup } from './components/TokenSetup';
import { Brain, Sparkles, Zap, Bot, Shield, Globe } from 'lucide-react';

function App() {
  const { aiApiKey } = useEditorStore();

  // Show token setup if no API key is configured
  if (!aiApiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-slate-900"></div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
              CodeVanta AI
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
              Professional code editor with advanced AI assistance. 
              Build faster, code smarter, ship better.
            </p>
            
            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">AI-Powered</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Advanced AI assistance with intelligent code completion and suggestions
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Lightning Fast</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Optimized performance with real-time collaboration and instant feedback
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">GitHub Integration</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Direct repository access with push, pull, and branch management
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Globe className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Cloud Ready</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Deploy and share your projects instantly with cloud integration
                </p>
              </div>
            </div>
          </div>

          {/* Token Setup */}
          <TokenSetup
            onTokensSubmit={(githubToken, geminiToken) => {
              // Store tokens and initialize
              useEditorStore.getState().setAIApiKey(geminiToken);
              localStorage.setItem('github_token', githubToken);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <MainLayout />
    </div>
  );
}

export default App;