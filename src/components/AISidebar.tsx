import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles,
  Loader2,
  Trash2,
  Mic,
  MicOff,
  Upload,
  Code,
  Lightbulb,
  Bug,
  Zap,
  TestTube,
  FileText,
  Copy,
  Check,
  Play,
  Settings,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Brain,
  Cpu,
  Database,
  Globe,
  Shield,
  Rocket,
  Star,
  Crown,
  Atom,
  Heart,
  Coffee
} from 'lucide-react';

interface AISidebarProps {
  onCodeChange: (code: string) => void;
  currentCode: string;
  fileName?: string;
  geminiApiKey: string;
  allFiles?: Map<string, string>;
  folderStructure?: string;
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
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

export const AISidebar: React.FC<AISidebarProps> = ({
  onCodeChange,
  currentCode,
  fileName,
  geminiApiKey,
  allFiles = new Map(),
  folderStructure = '',
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with a friendly, human-like welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const greetingMessage: Message = {
        id: 'greeting',
        type: 'ai',
        content: `Hey there! 👋 

I'm CodeVanta AI, your friendly coding companion! Think of me as your personal programming buddy who's here to help with absolutely anything you need.

I can help you with:
• Writing and debugging code in any language
• Explaining complex concepts in simple terms  
• Building complete applications from scratch
• Optimizing and refactoring your code
• Generating tests and documentation
• Solving any programming challenge you throw at me

I'm not just a specialist - I know everything from basic HTML to advanced machine learning, from simple scripts to enterprise applications. Whatever you're working on, I've got your back!

What would you like to work on today? Just ask me anything! 😊`,
        timestamp: new Date(),
        suggestions: [
          { title: '💬 Just say hi!', action: () => setInputValue('Hi! How are you?') },
          { title: '🤔 What can you do?', action: () => setInputValue('What can you do?') },
          { title: '🔍 Explain my code', action: () => setInputValue('Can you explain what this code does?') },
          { title: '🐛 Help me debug', action: () => setInputValue('I have a bug, can you help?') },
          { title: '🚀 Build something cool', action: () => setInputValue('Help me build something awesome!') },
          { title: '📚 Teach me something', action: () => setInputValue('Teach me something new about programming') },
        ],
      };
      setMessages([greetingMessage]);
    }
  }, []);

  const generateResponse = async (userMessage: string): Promise<string> => {
    if (!geminiApiKey || geminiApiKey.trim() === '') {
      throw new Error('Gemini API key not configured.');
    }

    try {
      // Human-like AI prompt that makes CodeVanta AI conversational and friendly
      let contextInfo = `You are CodeVanta AI, a friendly and conversational AI assistant who loves helping people with programming. You have a warm, approachable personality and communicate like a helpful friend rather than a formal assistant.

PERSONALITY TRAITS:
- Friendly and conversational, like talking to a knowledgeable friend
- Enthusiastic about helping with any programming challenge
- Patient and encouraging, especially with beginners
- Use casual language and emojis when appropriate
- Show genuine interest in what the user is building
- Celebrate successes and provide encouragement
- Admit when you're not sure about something (though you know a lot!)

CONVERSATION STYLE:
- Start responses naturally (like "Hey!", "Sure thing!", "Absolutely!", "Oh, that's interesting!")
- Use "I" statements ("I can help you with that", "I think the issue might be...")
- Ask follow-up questions to better understand what they need
- Provide context and explain your reasoning
- Offer multiple solutions when possible
- Be encouraging and positive

CAPABILITIES:
You're knowledgeable about:
- All programming languages (JavaScript, Python, Java, C++, Go, Rust, etc.)
- Web development (HTML, CSS, React, Vue, Angular, Node.js, etc.)
- Mobile development (React Native, Flutter, Swift, Kotlin, etc.)
- Backend development (APIs, databases, cloud services, etc.)
- DevOps and deployment
- Data science and machine learning
- Game development
- And pretty much anything programming-related!

CURRENT CONTEXT:
${fileName ? `Current file: ${fileName}` : 'No file selected'}
${currentCode ? `Code context: ${currentCode.substring(0, 500)}${currentCode.length > 500 ? '...' : ''}` : 'No code provided'}
${folderStructure ? `Project files: ${folderStructure}` : ''}

USER MESSAGE: ${userMessage}

INSTRUCTIONS:
- Respond in a friendly, conversational way
- If they greet you, greet them back warmly
- If they ask what you can do, explain your capabilities in a friendly way
- If they ask who you are, introduce yourself as CodeVanta AI
- Provide helpful, complete answers
- Include code examples when relevant
- Ask clarifying questions if needed
- Be encouraging and supportive

Remember: You're not just an AI tool, you're CodeVanta AI - a friendly programming companion who genuinely wants to help!`;

      const requestBody = {
        contents: [{
          parts: [{
            text: contextInfo
          }]
        }]
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let errorMessage = 'AI request failed';
        
        if (response.status === 401) {
          errorMessage = 'Invalid API key';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded';
        } else if (response.status >= 500) {
          errorMessage = 'API server error';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format');
      }
      
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('AI API Error:', error);
      throw error instanceof Error ? error : new Error('Network error');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await generateResponse(inputValue);
      
      // Extract code blocks from response
      const codeBlocks = extractCodeBlocks(aiResponse);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        codeBlocks,
        suggestions: codeBlocks.length > 0 ? [
          { title: '✨ Apply this code', action: () => onCodeChange(codeBlocks[0].code) },
          { title: '📋 Copy to clipboard', action: () => navigator.clipboard.writeText(codeBlocks[0].code) },
          { title: '🔍 Explain this code', action: () => setInputValue('Can you explain how this code works?') },
        ] : getContextualSuggestions(aiResponse),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Auto-speak response if enabled
      if (autoSpeak && 'speechSynthesis' in window) {
        speakText(aiResponse);
      }

      // Auto-apply code if it's a clear code generation request
      if (codeBlocks.length > 0 && codeBlocks[0].code.length > 50) {
        if (inputValue.toLowerCase().includes('create') || 
            inputValue.toLowerCase().includes('generate') || 
            inputValue.toLowerCase().includes('build') ||
            inputValue.toLowerCase().includes('make') ||
            inputValue.toLowerCase().includes('write')) {
          setTimeout(() => {
            onCodeChange(codeBlocks[0].code);
          }, 1000);
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Oops! I ran into a little issue: ${error instanceof Error ? error.message : 'Something went wrong'}

Don't worry though - let's try that again! Sometimes these things happen. 😊`,
        timestamp: new Date(),
        suggestions: [
          { title: '🔄 Try again', action: () => setInputValue(inputValue) },
          { title: '💬 Ask something else', action: () => setInputValue('') },
        ],
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getContextualSuggestions = (response: string) => {
    const suggestions = [];
    
    if (response.toLowerCase().includes('code') || response.toLowerCase().includes('function')) {
      suggestions.push({ title: '💡 Show me an example', action: () => setInputValue('Can you show me a code example?') });
    }
    
    if (response.toLowerCase().includes('error') || response.toLowerCase().includes('bug')) {
      suggestions.push({ title: '🐛 Help me debug', action: () => setInputValue('I need help debugging this issue') });
    }
    
    if (response.toLowerCase().includes('learn') || response.toLowerCase().includes('understand')) {
      suggestions.push({ title: '📚 Explain more', action: () => setInputValue('Can you explain this in more detail?') });
    }
    
    suggestions.push(
      { title: '🚀 What else can you do?', action: () => setInputValue('What else can you help me with?') },
      { title: '💬 Keep chatting', action: () => setInputValue('') }
    );
    
    return suggestions;
  };

  const extractCodeBlocks = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim(),
      });
    }

    return blocks;
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.start();
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const cleanText = text
        .replace(/```[\s\S]*?```/g, 'code block')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/[🧠🔬⚡🚀🧬🌌🔮🛡️🎯🔍💡⭐👑🌟😊👋💬🤔🐛📚🚀💡📋✨🔄]/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex flex-col overflow-hidden">
      {/* Header - Friendly and welcoming */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
              <Heart className="w-2 h-2 text-green-900" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              CodeVanta AI
              <Coffee className="w-4 h-4 text-yellow-300" />
            </h3>
            <p className="text-xs text-blue-100">Your friendly coding companion</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          {messages.length > 1 && (
            <button
              onClick={clearChat}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Clear Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 flex-shrink-0">
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Auto-speak responses</span>
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(e) => setAutoSpeak(e.target.checked)}
                className="rounded"
              />
            </label>
          </div>
        </div>
      )}

      {/* Messages - More natural conversation flow */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {message.type === 'ai' && (
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    CodeVanta AI
                  </span>
                  <Heart className="w-3 h-3 text-pink-500 animate-pulse" />
                </div>
              )}
              
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
              
              {/* Code Blocks */}
              {message.codeBlocks && message.codeBlocks.map((block, index) => (
                <div key={index} className="mt-4 bg-slate-900 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-600">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-slate-200 font-bold">{block.language.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onCodeChange(block.code)}
                        className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Apply Code"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(block.code)}
                        className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-600 rounded-lg transition-colors"
                        title="Copy Code"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 text-sm text-slate-200 overflow-x-auto bg-slate-900">
                    <code>{block.code}</code>
                  </pre>
                </div>
              ))}
              
              {/* Suggestions */}
              {message.suggestions && (
                <div className="mt-4 space-y-2">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={suggestion.action}
                      className="flex items-center gap-3 w-full p-3 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/50 dark:hover:to-indigo-800/50 text-blue-700 dark:text-blue-300 rounded-xl transition-all transform hover:scale-105 border border-blue-200 dark:border-blue-700"
                    >
                      <Sparkles className="w-4 h-4" />
                      {suggestion.title}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-600">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                {message.type === 'ai' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakText(message.content)}
                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Speak Response"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      title="Copy Response"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  CodeVanta AI is thinking...
                </span>
                <Coffee className="w-4 h-4 text-amber-500 animate-bounce" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Friendly and inviting */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-white via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/30 dark:to-indigo-900/30 flex-shrink-0">
        <div className="flex gap-2 mb-3">
          <button
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            className={`p-3 rounded-xl transition-all transform hover:scale-105 ${
              isListening
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-lg'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg'
            }`}
            title={isListening ? 'Stop Voice Input' : 'Start Voice Input'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg"
              title="Stop Speaking"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
            <Heart className="w-4 h-4 text-pink-500 animate-pulse" />
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
              FRIENDLY MODE
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Hey! Ask me anything about coding, or just say hi! 😊"
            className="flex-1 px-4 py-4 border-2 border-blue-300 dark:border-blue-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-blue-500 dark:placeholder-blue-400 focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all shadow-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};