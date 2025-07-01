import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Zap, Bug, Shield, Brain, Code, FileText, TestTube, Factory as Refactor, BookOpen, ArrowRight, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface CodeAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'fix' | 'optimize' | 'refactor' | 'generate' | 'explain';
  severity: 'info' | 'warning' | 'error';
  action: () => void;
}

interface SmartCodeActionsProps {
  visible: boolean;
  position: { x: number; y: number };
  selectedCode: string;
  language: string;
  onClose: () => void;
  onApplyAction: (action: CodeAction) => void;
}

export const SmartCodeActions: React.FC<SmartCodeActionsProps> = ({
  visible,
  position,
  selectedCode,
  language,
  onClose,
  onApplyAction,
}) => {
  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState<CodeAction[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && selectedCode) {
      generateActions();
    }
  }, [visible, selectedCode, language]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  const generateActions = async () => {
    setLoading(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const generatedActions: CodeAction[] = [
      {
        id: 'explain',
        title: 'Explain Code',
        description: 'Get AI explanation of this code block',
        icon: <BookOpen className="w-4 h-4" />,
        type: 'explain',
        severity: 'info',
        action: () => console.log('Explain code'),
      },
      {
        id: 'optimize',
        title: 'Optimize Performance',
        description: 'Improve code performance and efficiency',
        icon: <Zap className="w-4 h-4" />,
        type: 'optimize',
        severity: 'info',
        action: () => console.log('Optimize code'),
      },
      {
        id: 'refactor',
        title: 'Refactor Code',
        description: 'Improve code structure and readability',
        icon: <Refactor className="w-4 h-4" />,
        type: 'refactor',
        severity: 'info',
        action: () => console.log('Refactor code'),
      },
      {
        id: 'generate-tests',
        title: 'Generate Tests',
        description: 'Create unit tests for this function',
        icon: <TestTube className="w-4 h-4" />,
        type: 'generate',
        severity: 'info',
        action: () => console.log('Generate tests'),
      },
      {
        id: 'add-comments',
        title: 'Add Documentation',
        description: 'Generate JSDoc comments',
        icon: <FileText className="w-4 h-4" />,
        type: 'generate',
        severity: 'info',
        action: () => console.log('Add documentation'),
      },
      {
        id: 'security-check',
        title: 'Security Analysis',
        description: 'Check for potential security vulnerabilities',
        icon: <Shield className="w-4 h-4" />,
        type: 'fix',
        severity: 'warning',
        action: () => console.log('Security check'),
      },
    ];

    // Add language-specific actions
    if (language === 'javascript' || language === 'typescript') {
      generatedActions.push({
        id: 'convert-async',
        title: 'Convert to Async/Await',
        description: 'Convert Promise chains to async/await',
        icon: <ArrowRight className="w-4 h-4" />,
        type: 'refactor',
        severity: 'info',
        action: () => console.log('Convert to async/await'),
      });
    }

    if (language === 'python') {
      generatedActions.push({
        id: 'type-hints',
        title: 'Add Type Hints',
        description: 'Add Python type annotations',
        icon: <Code className="w-4 h-4" />,
        type: 'generate',
        severity: 'info',
        action: () => console.log('Add type hints'),
      });
    }

    setActions(generatedActions);
    setLoading(false);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="w-3 h-3 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
      default:
        return <Info className="w-3 h-3 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="fixed z-50 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl min-w-80 max-w-96"
        style={{
          left: Math.min(position.x, window.innerWidth - 400),
          top: Math.min(position.y, window.innerHeight - 400),
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-700/50">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-100">Smart Actions</h3>
            <p className="text-xs text-gray-400">AI-powered code improvements</p>
          </div>
        </div>

        {/* Actions List */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"
              />
              <p className="text-sm text-gray-400">Analyzing code...</p>
            </div>
          ) : (
            <div className="p-2">
              {actions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-800/50 border ${getSeverityColor(action.severity)} mb-2`}
                  onClick={() => {
                    onApplyAction(action);
                    onClose();
                  }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-100 truncate">
                        {action.title}
                      </h4>
                      {getSeverityIcon(action.severity)}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700/50 bg-gray-800/30">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Powered by AI</span>
            <span>Press Esc to close</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};