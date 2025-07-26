import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  File, 
  Settings, 
  Terminal, 
  Bot, 
  Code, 
  Save, 
  FolderOpen,
  Palette,
  Zap,
  GitBranch,
  Download,
  Upload,
  Copy,
  Scissors,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useHotkeys } from 'react-hotkeys-hook';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const {
    commandPaletteVisible,
    toggleCommandPalette,
    toggleSidebar,
    toggleAIPanel,
    toggleTerminal,
    settings,
    updateSettings,
    files,
    activeFileId,
    setActiveFile,
  } = useEditorStore();

  const commands: Command[] = useMemo(() => [
    // File Operations
    {
      id: 'file.new',
      title: 'New File',
      description: 'Create a new file',
      icon: <File className="w-4 h-4" />,
      category: 'File',
      shortcut: 'Ctrl+N',
      action: () => {
        // Implementation for new file
        console.log('New file');
      },
    },
    {
      id: 'file.open',
      title: 'Open File',
      description: 'Open an existing file',
      icon: <FolderOpen className="w-4 h-4" />,
      category: 'File',
      shortcut: 'Ctrl+O',
      action: () => {
        // Implementation for open file
        console.log('Open file');
      },
    },
    {
      id: 'file.save',
      title: 'Save File',
      description: 'Save the current file',
      icon: <Save className="w-4 h-4" />,
      category: 'File',
      shortcut: 'Ctrl+S',
      action: () => {
        // Implementation for save file
        console.log('Save file');
      },
    },
    
    // View Operations
    {
      id: 'view.sidebar',
      title: 'Toggle Sidebar',
      description: 'Show or hide the sidebar',
      icon: <Eye className="w-4 h-4" />,
      category: 'View',
      shortcut: 'Ctrl+B',
      action: toggleSidebar,
    },
    {
      id: 'view.ai',
      title: 'Toggle AI Assistant',
      description: 'Show or hide AI assistant panel',
      icon: <Bot className="w-4 h-4" />,
      category: 'View',
      shortcut: 'Ctrl+Shift+A',
      action: toggleAIPanel,
    },
    {
      id: 'view.terminal',
      title: 'Toggle Terminal',
      description: 'Show or hide integrated terminal',
      icon: <Terminal className="w-4 h-4" />,
      category: 'View',
      shortcut: 'Ctrl+`',
      action: toggleTerminal,
    },
    
    // Editor Operations
    {
      id: 'editor.format',
      title: 'Format Document',
      description: 'Format the current document',
      icon: <Code className="w-4 h-4" />,
      category: 'Editor',
      shortcut: 'Shift+Alt+F',
      action: () => {
        console.log('Format document');
      },
    },
    {
      id: 'editor.zoomIn',
      title: 'Zoom In',
      description: 'Increase font size',
      icon: <ZoomIn className="w-4 h-4" />,
      category: 'Editor',
      shortcut: 'Ctrl+=',
      action: () => {
        updateSettings({ fontSize: Math.min(settings.fontSize + 2, 24) });
      },
    },
    {
      id: 'editor.zoomOut',
      title: 'Zoom Out',
      description: 'Decrease font size',
      icon: <ZoomOut className="w-4 h-4" />,
      category: 'Editor',
      shortcut: 'Ctrl+-',
      action: () => {
        updateSettings({ fontSize: Math.max(settings.fontSize - 2, 10) });
      },
    },
    
    // Theme Operations
    {
      id: 'theme.dark',
      title: 'Dark Theme',
      description: 'Switch to dark theme',
      icon: <Palette className="w-4 h-4" />,
      category: 'Theme',
      action: () => {
        updateSettings({ theme: 'vs-dark' });
      },
    },
    {
      id: 'theme.light',
      title: 'Light Theme',
      description: 'Switch to light theme',
      icon: <Palette className="w-4 h-4" />,
      category: 'Theme',
      action: () => {
        updateSettings({ theme: 'vs-light' });
      },
    },
    
    // AI Operations
    {
      id: 'ai.explain',
      title: 'Explain Code',
      description: 'Get AI explanation of selected code',
      icon: <Bot className="w-4 h-4" />,
      category: 'AI',
      action: () => {
        console.log('Explain code');
      },
    },
    {
      id: 'ai.optimize',
      title: 'Optimize Code',
      description: 'Get AI suggestions for code optimization',
      icon: <Zap className="w-4 h-4" />,
      category: 'AI',
      action: () => {
        console.log('Optimize code');
      },
    },
    
    // Git Operations
    {
      id: 'git.commit',
      title: 'Commit Changes',
      description: 'Commit current changes',
      icon: <GitBranch className="w-4 h-4" />,
      category: 'Git',
      action: () => {
        console.log('Commit changes');
      },
    },
    
    // File Navigation
    ...files.map(file => ({
      id: `file.${file.id}`,
      title: `Open ${file.name}`,
      description: file.path,
      icon: <File className="w-4 h-4" />,
      category: 'Files',
      action: () => setActiveFile(file.id),
    })),
  ], [files, settings, toggleSidebar, toggleAIPanel, toggleTerminal, updateSettings, setActiveFile]);

  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    
    return commands.filter(command =>
      command.title.toLowerCase().includes(query.toLowerCase()) ||
      command.description.toLowerCase().includes(query.toLowerCase()) ||
      command.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach(command => {
      if (!groups[command.category]) {
        groups[command.category] = [];
      }
      groups[command.category].push(command);
    });
    return groups;
  }, [filteredCommands]);

  useHotkeys('ctrl+shift+p', (e) => {
    e.preventDefault();
    toggleCommandPalette();
  });

  useHotkeys('escape', () => {
    if (commandPaletteVisible) {
      toggleCommandPalette();
    }
  }, { enabled: commandPaletteVisible });

  useHotkeys('arrowdown', (e) => {
    e.preventDefault();
    setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
  }, { enabled: commandPaletteVisible });

  useHotkeys('arrowup', (e) => {
    e.preventDefault();
    setSelectedIndex(prev => Math.max(prev - 1, 0));
  }, { enabled: commandPaletteVisible });

  useHotkeys('enter', (e) => {
    e.preventDefault();
    if (filteredCommands[selectedIndex]) {
      filteredCommands[selectedIndex].action();
      toggleCommandPalette();
    }
  }, { enabled: commandPaletteVisible });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!commandPaletteVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
        onClick={toggleCommandPalette}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-700/50">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none text-lg"
              autoFocus
            />
            <div className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
              Ctrl+Shift+P
            </div>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-800/50">
                  {category}
                </div>
                {categoryCommands.map((command, index) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  return (
                    <motion.div
                      key={command.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        globalIndex === selectedIndex
                          ? 'bg-purple-600/20 border-l-2 border-purple-500'
                          : 'hover:bg-gray-800/50'
                      }`}
                      onClick={() => {
                        command.action();
                        toggleCommandPalette();
                      }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="text-gray-400">
                        {command.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-100 font-medium">
                          {command.title}
                        </div>
                        <div className="text-sm text-gray-400">
                          {command.description}
                        </div>
                      </div>
                      {command.shortcut && (
                        <div className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                          {command.shortcut}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ))}
            
            {filteredCommands.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-400">
                No commands found for "{query}"
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};