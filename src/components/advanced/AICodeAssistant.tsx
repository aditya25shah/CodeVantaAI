import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Code,
  Lightbulb,
  Bug,
  Zap,
  BookOpen,
  TestTube,
  Shield,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Settings,
  X,
  MessageSquare,
  FileText,
  Play
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  codeBlocks?: Array<{
    language: string;
    code: string;
  }>;
  suggestions?: Array<{
    title: string;
    action: () => void;
  }>;
}

interface AICodeAssistantProps {
  onCodeInsert: (code: string) => void;
  onCodeReplace: (code: string) => void;
  currentCode: string;
  selectedCode: string;
  language: string;
}

export const AICodeAssistant: React.FC<AICodeAssistantProps> = ({
  onCodeInsert,
  onCodeReplace,
  currentCode,
  selectedCode,
  language,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { aiPanelVisible, toggleAIPanel, selectedAIModel, aiModels } = useEditorStore();

  useEffect(() => {
    if (aiPanelVisible) {
      // Initialize with welcome message
      if (messages.length === 0) {
        const welcomeMessage: Message = {
          id: 'welcome',
          type: 'system',
          content: `👋 Hi! I'm your AI coding assistant. I can help you with:

• **Code Explanation** - Understand complex code
• **Bug Fixing** - Find and fix issues
• **Code Optimization** - Improve performance
• **Refactoring** - Clean up your code
• **Test Generation** - Create unit tests
• **Documentation** - Add comments and docs

What would you like to work on today?`,
          timestamp: new Date(),
          suggestions: [
            { title: 'Explain selected code', action: () => handleQuickAction('explain') },
            { title: 'Find bugs', action: () => handleQuickAction('debug') },
            { title: 'Optimize code', action: () => handleQuickAction('optimize') },
            { title: 'Generate tests', action: () => handleQuickAction('test') },
          ],
        };
        setMessages([welcomeMessage]);
      }
      inputRef.current?.focus();
    }
  }, [aiPanelVisible]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickAction = (action: string) => {
    const prompts = {
      explain: `Please explain this ${language} code:\n\n\`\`\`${language}\n${selectedCode || currentCode}\n\`\`\``,
      debug: `Please analyze this ${language} code for bugs and issues:\n\n\`\`\`${language}\n${selectedCode || currentCode}\n\`\`\``,
      optimize: `Please optimize this ${language} code for better performance:\n\n\`\`\`${language}\n${selectedCode || currentCode}\n\`\`\``,
      test: `Please generate unit tests for this ${language} code:\n\n\`\`\`${language}\n${selectedCode || currentCode}\n\`\`\``,
    };
    
    setInput(prompts[action as keyof typeof prompts]);
    handleSend();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(input),
        timestamp: new Date(),
        codeBlocks: extractCodeBlocks(input),
        suggestions: [
          { title: 'Apply this code', action: () => onCodeReplace('// Applied code') },
          { title: 'Insert at cursor', action: () => onCodeInsert('// Inserted code') },
        ],
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (prompt: string): string => {
    // Simulate intelligent AI responses based on prompt
    if (prompt.toLowerCase().includes('explain')) {
      return `I'll explain this code step by step:

1. **Function Declaration**: This creates a new function
2. **Parameters**: The function accepts these inputs
3. **Logic**: Here's what the code does internally
4. **Return Value**: The function returns this result

The code follows good practices and is well-structured. Would you like me to suggest any improvements?`;
    }

    if (prompt.toLowerCase().includes('bug') || prompt.toLowerCase().includes('debug')) {
      return `I've analyzed your code and found these potential issues:

🐛 **Potential Bugs:**
- Missing null checks on line 5
- Possible memory leak in the loop
- Unhandled promise rejection

🔧 **Suggested Fixes:**
1. Add input validation
2. Use proper error handling
3. Optimize the algorithm

Would you like me to show you the corrected code?`;
    }

    if (prompt.toLowerCase().includes('optimize')) {
      return `Here are optimization suggestions for your code:

⚡ **Performance Improvements:**
- Use more efficient data structures
- Reduce time complexity from O(n²) to O(n log n)
- Cache repeated calculations

🎯 **Best Practices:**
- Extract reusable functions
- Add proper type annotations
- Improve variable naming

The optimized version will be significantly faster!`;
    }

    return `I understand you want help with your ${language} code. I can assist with:

• Code explanation and documentation
• Bug detection and fixing
• Performance optimization
• Refactoring suggestions
• Test case generation
• Security analysis

Please let me know what specific help you need!`;
  };

  const extractCodeBlocks = (prompt: string) => {
    // Extract code blocks from the prompt for syntax highlighting
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;

    while ((match = codeBlockRegex.exec(prompt)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim(),
      });
    }

    return blocks;
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
      };

      recognition.start();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!aiPanelVisible) return null;

  return (
    <div className="h-full bg-gray-900/95 backdrop-blur-xl border-l border-gray-700/50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-100">AI Assistant</h3>
            <p className="text-xs text-gray-400">
              {aiModels.find(m => m.id === selectedAIModel)?.name || 'AI Model'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={toggleAIPanel}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/30">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleQuickAction('explain')}
            className="flex items-center gap-2 p-2 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            Explain Code
          </button>
          <button
            onClick={() => handleQuickAction('debug')}
            className="flex items-center gap-2 p-2 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors"
          >
            <Bug className="w-3 h-3" />
            Find Bugs
          </button>
          <button
            onClick={() => handleQuickAction('optimize')}
            className="flex items-center gap-2 p-2 text-xs bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 rounded-lg transition-colors"
          >
            <Zap className="w-3 h-3" />
            Optimize
          </button>
          <button
            onClick={() => handleQuickAction('test')}
            className="flex items-center gap-2 p-2 text-xs bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg transition-colors"
          >
            <TestTube className="w-3 h-3" />
            Generate Tests
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : message.type === 'system'
                  ? 'bg-gray-800/80 text-gray-200 border border-gray-700/50'
                  : 'bg-gray-800/80 text-gray-200 border border-gray-700/50'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              
              {/* Code Blocks */}
              {message.codeBlocks && message.codeBlocks.map((block, index) => (
                <div key={index} className="mt-3 bg-gray-900/80 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-2 bg-gray-800/80 border-b border-gray-700/50">
                    <span className="text-xs text-gray-400">{block.language}</span>
                    <button
                      onClick={() => copyToClipboard(block.code)}
                      className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <pre className="p-3 text-sm text-gray-200 overflow-x-auto">
                    <code>{block.code}</code>
                  </pre>
                </div>
              ))}
              
              {/* Suggestions */}
              {message.suggestions && (
                <div className="mt-3 space-y-2">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={suggestion.action}
                      className="flex items-center gap-2 w-full p-2 text-xs bg-gray-700/50 hover:bg-gray-700/80 text-gray-300 rounded-lg transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      {suggestion.title}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700/30">
                <span className="text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                {message.type === 'assistant' && (
                  <div className="flex items-center gap-1">
                    <button className="p-1 text-gray-500 hover:text-green-400 transition-colors">
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-800/80 rounded-2xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"
                />
                <span className="text-sm text-gray-400">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700/50 bg-gray-800/30">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your code..."
              className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600/50 rounded-xl text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={startVoiceInput}
            className={`p-3 rounded-xl transition-all ${
              isListening
                ? 'bg-red-600 text-white'
                : 'bg-gray-700/50 text-gray-400 hover:text-gray-200 hover:bg-gray-700/80'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};