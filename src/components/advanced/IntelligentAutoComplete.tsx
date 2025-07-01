import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, FunctionSquare as Function, Variable, Package, FileText, Zap, Star, ArrowRight, Brain } from 'lucide-react';

interface Suggestion {
  id: string;
  label: string;
  detail: string;
  documentation: string;
  insertText: string;
  kind: 'function' | 'variable' | 'class' | 'module' | 'snippet' | 'ai';
  score: number;
  isAI?: boolean;
}

interface IntelligentAutoCompleteProps {
  visible: boolean;
  position: { x: number; y: number };
  prefix: string;
  language: string;
  context: string;
  onSelect: (suggestion: Suggestion) => void;
  onClose: () => void;
}

export const IntelligentAutoComplete: React.FC<IntelligentAutoCompleteProps> = ({
  visible,
  position,
  prefix,
  language,
  context,
  onSelect,
  onClose,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && prefix) {
      generateSuggestions();
    }
  }, [visible, prefix, language, context]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          if (suggestions[selectedIndex]) {
            handleSuggestionSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, suggestions, selectedIndex, onSelect, onClose]);

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    // Apply the suggestion
    onSelect(suggestion);
    onClose();
  };

  const generateSuggestions = async () => {
    setLoading(true);
    
    // Simulate AI-powered suggestions
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const baseSuggestions: Suggestion[] = [];
    
    // Language-specific suggestions
    if (language === 'javascript' || language === 'typescript') {
      baseSuggestions.push(
        {
          id: 'console.log',
          label: 'console.log',
          detail: '(method) Console.log(...data: any[]): void',
          documentation: 'Outputs a message to the web console.',
          insertText: 'console.log($1)',
          kind: 'function',
          score: 90,
        },
        {
          id: 'async-function',
          label: 'async function',
          detail: 'Async function declaration',
          documentation: 'Creates an asynchronous function',
          insertText: 'async function $1($2) {\n  $3\n}',
          kind: 'snippet',
          score: 85,
        },
        {
          id: 'try-catch',
          label: 'try-catch',
          detail: 'Try-catch block',
          documentation: 'Error handling with try-catch',
          insertText: 'try {\n  $1\n} catch (error) {\n  $2\n}',
          kind: 'snippet',
          score: 80,
        }
      );
    }

    if (language === 'python') {
      baseSuggestions.push(
        {
          id: 'print',
          label: 'print',
          detail: 'print(*values, sep=\' \', end=\'\\n\')',
          documentation: 'Print values to stdout',
          insertText: 'print($1)',
          kind: 'function',
          score: 90,
        },
        {
          id: 'def-function',
          label: 'def function',
          detail: 'Function definition',
          documentation: 'Define a new function',
          insertText: 'def $1($2):\n    $3',
          kind: 'snippet',
          score: 85,
        },
        {
          id: 'class-definition',
          label: 'class',
          detail: 'Class definition',
          documentation: 'Define a new class',
          insertText: 'class $1:\n    def __init__(self$2):\n        $3',
          kind: 'snippet',
          score: 80,
        }
      );
    }

    // AI-generated suggestions based on context
    const aiSuggestions: Suggestion[] = [
      {
        id: 'ai-complete-function',
        label: `Complete ${prefix}...`,
        detail: 'AI-generated completion',
        documentation: 'Smart completion based on your code context',
        insertText: `${prefix}Complete()`,
        kind: 'ai',
        score: 95,
        isAI: true,
      },
      {
        id: 'ai-error-handling',
        label: 'Add error handling',
        detail: 'AI suggestion',
        documentation: 'Add comprehensive error handling to your code',
        insertText: 'try {\n  // Your code here\n} catch (error) {\n  console.error(error);\n}',
        kind: 'ai',
        score: 88,
        isAI: true,
      },
    ];

    // Filter and sort suggestions
    const filtered = [...baseSuggestions, ...aiSuggestions]
      .filter(s => s.label.toLowerCase().includes(prefix.toLowerCase()))
      .sort((a, b) => b.score - a.score);

    setSuggestions(filtered);
    setSelectedIndex(0);
    setLoading(false);
  };

  const getKindIcon = (kind: string, isAI?: boolean) => {
    if (isAI) {
      return <Brain className="w-4 h-4 text-purple-400" />;
    }
    
    switch (kind) {
      case 'function':
        return <Function className="w-4 h-4 text-blue-400" />;
      case 'variable':
        return <Variable className="w-4 h-4 text-green-400" />;
      case 'class':
        return <Code className="w-4 h-4 text-yellow-400" />;
      case 'module':
        return <Package className="w-4 h-4 text-purple-400" />;
      case 'snippet':
        return <FileText className="w-4 h-4 text-orange-400" />;
      default:
        return <Code className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!visible || suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="fixed z-50 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl min-w-80 max-w-96 max-h-80 overflow-hidden"
        style={{
          left: Math.min(position.x, window.innerWidth - 400),
          top: Math.min(position.y + 20, window.innerHeight - 320),
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700/50 bg-gray-800/50">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-200">IntelliSense</span>
          </div>
          <div className="text-xs text-gray-500">
            {suggestions.length} suggestions
          </div>
        </div>

        {/* Suggestions List */}
        <div className="overflow-y-auto max-h-64">
          {loading ? (
            <div className="p-4 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"
              />
              <p className="text-xs text-gray-400">Generating suggestions...</p>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`flex items-start gap-3 p-3 cursor-pointer transition-all ${
                  index === selectedIndex
                    ? 'bg-purple-600/20 border-l-2 border-purple-500'
                    : 'hover:bg-gray-800/50'
                } ${suggestion.isAI ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20' : ''}`}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getKindIcon(suggestion.kind, suggestion.isAI)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-100 truncate">
                      {suggestion.label}
                    </span>
                    {suggestion.isAI && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-600/20 rounded-full">
                        <Star className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-purple-300">AI</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mb-1">
                    {suggestion.detail}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {suggestion.documentation}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-gray-700/50 bg-gray-800/30">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>↑↓ Navigate • Enter/Tab Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};