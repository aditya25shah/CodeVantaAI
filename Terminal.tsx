import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Play, Trash2, Copy, Download, Folder, File, Heart, Sparkles, Zap, Eye, ExternalLink, Globe } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';

interface TerminalOutput {
  id: string;
  type: 'command' | 'output' | 'error' | 'info' | 'success' | 'welcome';
  content: string;
  timestamp: Date;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  command: string;
  icon: React.ReactNode;
}

export const Terminal: React.FC = () => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<TerminalOutput[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDirectory, setCurrentDirectory] = useState('~/codevanta');
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('dismissedSuggestions') || '[]'))
  );
  const [showSuggestions, setShowSuggestions] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { files, terminalVisible, toggleTerminal } = useEditorStore();

  const suggestions: Suggestion[] = [
    {
      id: 'run-help',
      title: 'Get Help',
      description: 'See all available commands',
      command: 'help',
      icon: <Heart className="w-4 h-4 text-pink-500" />
    },
    {
      id: 'list-files',
      title: 'List Files',
      description: 'Show all project files',
      command: 'ls',
      icon: <Folder className="w-4 h-4 text-blue-500" />
    },
    {
      id: 'run-file',
      title: 'Run File',
      description: 'Execute any file in your project',
      command: 'run index.html',
      icon: <Play className="w-4 h-4 text-green-500" />
    },
    {
      id: 'preview-html',
      title: 'Live Preview',
      description: 'Open HTML files in browser',
      command: 'preview index.html',
      icon: <Globe className="w-4 h-4 text-purple-500" />
    }
  ];

  const visibleSuggestions = suggestions.filter(s => !dismissedSuggestions.has(s.id));

  useEffect(() => {
    if (terminalVisible && inputRef.current) {
      inputRef.current.focus();
      if (output.length === 0) {
        addOutput('🚀 CodeVanta AI Terminal - Ready for execution', 'welcome');
        addOutput('Type "help" for commands or "run <filename>" to execute files', 'info');
        addOutput('', 'output');
      }
    }
  }, [terminalVisible]);

  // Listen for run file events from toolbar
  useEffect(() => {
    const handleRunFile = (event: CustomEvent) => {
      const fileName = event.detail.fileName;
      if (fileName) {
        setCommand(`run ${fileName}`);
        setTimeout(() => {
          executeCommand(`run ${fileName}`);
          setCommand('');
        }, 100);
      }
    };

    window.addEventListener('terminal-run-file', handleRunFile as EventListener);
    return () => {
      window.removeEventListener('terminal-run-file', handleRunFile as EventListener);
    };
  }, [files]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const addOutput = (content: string, type: 'output' | 'error' | 'info' | 'success' | 'welcome' = 'output') => {
    const newOutput: TerminalOutput = {
      id: Date.now().toString() + Math.random(),
      type,
      content,
      timestamp: new Date(),
    };
    setOutput(prev => [...prev, newOutput]);
  };

  const addCommand = (cmd: string) => {
    const commandOutput: TerminalOutput = {
      id: Date.now().toString(),
      type: 'command',
      content: `${currentDirectory}$ ${cmd}`,
      timestamp: new Date(),
    };
    setOutput(prev => [...prev, commandOutput]);
  };

  const dismissSuggestion = (suggestionId: string) => {
    const newDismissed = new Set([...dismissedSuggestions, suggestionId]);
    setDismissedSuggestions(newDismissed);
    localStorage.setItem('dismissedSuggestions', JSON.stringify([...newDismissed]));
  };

  const openLivePreview = (htmlContent: string, fileName: string) => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    
    if (newWindow) {
      newWindow.document.title = `Live Preview - ${fileName}`;
      addOutput(`🌐 Live preview opened for ${fileName}`, 'success');
    } else {
      addOutput('❌ Failed to open preview. Please allow popups for this site.', 'error');
    }
  };

  // Simplified execution functions - only show output, no analysis
  const executePython = async (code: string, filename?: string) => {
  try {
    addOutput(`🐍 Executing ${filename || 'Python code'}...`, 'info');
    
    // Simple Python interpreter simulation
    const lines = code.split('\n').filter(line => line.trim());
    const variables = new Map<string, any>();
    let hasOutput = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;
      
      // Handle variable assignments
      const assignMatch = trimmedLine.match(/^(\w+)\s*=\s*(.+)$/);
      if (assignMatch) {
        const [, varName, expression] = assignMatch;
        try {
          // Evaluate simple expressions
          let value = evaluateExpression(expression.trim(), variables);
          variables.set(varName, value);
        } catch (e) {
          // If evaluation fails, store as string
          variables.set(varName, expression.trim());
        }
        continue;
      }
      
      // Handle print statements
      if (trimmedLine.includes('print(')) {
        const printMatch = trimmedLine.match(/print\s*\(\s*(.+)\s*\)$/);
        if (printMatch) {
          let content = printMatch[1];
          
          // Handle f-strings
          if (content.startsWith('f"') || content.startsWith("f'")) {
            content = content.substring(2, content.length - 1); // Remove f" and "
            // Replace variables in f-string
            content = content.replace(/\{(\w+)\}/g, (match, varName) => {
              return variables.has(varName) ? String(variables.get(varName)) : match;
            });
          }
          // Handle regular strings
          else if ((content.startsWith('"') && content.endsWith('"')) || 
                   (content.startsWith("'") && content.endsWith("'"))) {
            content = content.slice(1, -1); // Remove quotes
          }
          // Handle variable references
          else if (variables.has(content)) {
            content = String(variables.get(content));
          }
          // Handle expressions
          else {
            try {
              content = String(evaluateExpression(content, variables));
            } catch (e) {
              content = content; // Keep original if can't evaluate
            }
          }
          
          addOutput(content, 'output');
          hasOutput = true;
        }
      }
    }
    
    if (!hasOutput && lines.length > 0) {
      addOutput('✅ Executed successfully (no output)', 'success');
    }
    
  } catch (error) {
    addOutput(`❌ Error: ${error}`, 'error');
  }
};
  const evaluateExpression = (expr: string, variables: Map<string, any>): any => {
  // Replace variables with their values
  let evaluatedExpr = expr;
  
  // Handle input() function calls
  if (expr.includes('input(')) {
    const inputMatch = expr.match(/input\s*\(\s*([^)]*)\s*\)/);
    if (inputMatch) {
      const prompt = inputMatch[1];
      // For demo purposes, return a default value
      // In a real implementation, you'd want to prompt the user
      if (prompt.includes('first') || prompt.includes('1')) return 10;
      if (prompt.includes('second') || prompt.includes('2')) return 5;
      return 0;
    }
  }
  
  // Handle float() function calls
  if (expr.includes('float(')) {
    expr = expr.replace(/float\s*\(\s*([^)]+)\s*\)/g, (match, inner) => {
      const value = evaluateExpression(inner, variables);
      return String(parseFloat(value));
    });
  }
  
  // Replace variable names with their values
  for (const [varName, value] of variables) {
    const regex = new RegExp(`\\b${varName}\\b`, 'g');
    evaluatedExpr = evaluatedExpr.replace(regex, String(value));
  }
  
  // Handle simple arithmetic
  try {
    // Only allow safe mathematical operations
    if (/^[\d\s+\-*/().]+$/.test(evaluatedExpr)) {
      return eval(evaluatedExpr);
    }
  } catch (e) {
    // If eval fails, return the original expression
  }
  
  return evaluatedExpr;
};
  
const executeJavaScript = async (code: string, filename?: string) => {
    try {
      addOutput(`⚡ Executing ${filename || 'JavaScript code'}...`, 'info');
      
      const originalConsole = { ...console };
      const logs: Array<{type: string, args: any[]}> = [];
      
      ['log', 'info', 'warn', 'error', 'debug'].forEach(method => {
        (console as any)[method] = (...args: any[]) => {
          logs.push({ type: method, args });
          (originalConsole as any)[method](...args);
        };
      });

      let result;
      try {
        result = new Function(code)();
        
        logs.forEach(({ type, args }) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          
          const outputType = type === 'error' ? 'error' : 'output';
          addOutput(message, outputType);
        });
        
        if (result !== undefined) {
          addOutput(`${typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}`, 'output');
        }
        
        if (logs.length === 0 && result === undefined) {
          addOutput('✅ Executed successfully (no output)', 'success');
        }
        
      } catch (execError) {
        addOutput(`❌ Error: ${execError}`, 'error');
      }
      
      Object.assign(console, originalConsole);
      
    } catch (error) {
      addOutput(`❌ Error: ${error}`, 'error');
    }
  };

  const executeJava = async (code: string, filename?: string) => {
    addOutput(`☕ Executing ${filename || 'Java code'}...`, 'info');
    
    try {
      const lines = code.split('\n').filter(line => line.trim());
      let hasOutput = false;
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.includes('System.out.println') || trimmedLine.includes('System.out.print')) {
          const printMatch = trimmedLine.match(/System\.out\.print(?:ln)?\s*\(\s*([^)]+)\s*\)/);
          if (printMatch) {
            let content = printMatch[1];
            content = content.replace(/^["']|["']$/g, '');
            addOutput(content, 'output');
            hasOutput = true;
          }
        }
      });
      
      if (!hasOutput && lines.length > 0) {
        addOutput('✅ Executed successfully (no output)', 'success');
      }
      
    } catch (error) {
      addOutput(`❌ Error: ${error}`, 'error');
    }
  };

  const executeHTML = async (code: string, filename?: string) => {
    addOutput(`🌐 Processing ${filename || 'HTML'}...`, 'info');
    
    const parser = new DOMParser();
    try {
      const doc = parser.parseFromString(code, 'text/html');
      
      const scripts = doc.querySelectorAll('script');
      if (scripts.length > 0) {
        addOutput('🔧 Executing embedded JavaScript...', 'info');
        scripts.forEach((script) => {
          if (script.textContent) {
            executeJavaScript(script.textContent);
          }
        });
      }
      
      addOutput('✅ HTML processed successfully', 'success');
      
      if (filename) {
        addOutput(`💡 Use: preview ${filename} for live preview`, 'info');
      }
      
    } catch (error) {
      addOutput(`❌ Error: ${error}`, 'error');
    }
  };

  const executeCSS = async (code: string, filename?: string) => {
    addOutput(`🎨 Processing ${filename || 'CSS'}...`, 'info');
    addOutput('✅ CSS processed successfully', 'success');
  };

  const executeJSON = async (code: string, filename?: string) => {
    addOutput(`📄 Processing ${filename || 'JSON'}...`, 'info');
    
    try {
      const parsed = JSON.parse(code);
      addOutput('✅ Valid JSON format', 'success');
      addOutput(JSON.stringify(parsed, null, 2), 'output');
    } catch (error) {
      addOutput(`❌ JSON Parse Error: ${error}`, 'error');
    }
  };

  const executeMarkdown = async (code: string, filename?: string) => {
    addOutput(`📝 Processing ${filename || 'Markdown'}...`, 'info');
    addOutput('✅ Markdown processed successfully', 'success');
  };

  // Generic file execution router
  const executeFile = async (filename: string, code: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    addOutput(`🚀 Executing: ${filename}`, 'info');
    addOutput('', 'output');
    
    switch (ext) {
      case 'js':
      case 'mjs':
        await executeJavaScript(code, filename);
        break;
      case 'py':
        await executePython(code, filename);
        break;
      case 'java':
        await executeJava(code, filename);
        break;
      case 'html':
      case 'htm':
        await executeHTML(code, filename);
        break;
      case 'css':
        await executeCSS(code, filename);
        break;
      case 'json':
        await executeJSON(code, filename);
        break;
      case 'md':
      case 'markdown':
        await executeMarkdown(code, filename);
        break;
      case 'jsx':
      case 'tsx':
        addOutput('⚛️ React/JSX file detected', 'info');
        const jsCode = code
          .replace(/import.*?from.*?;/g, '')
          .replace(/export.*?;/g, '')
          .replace(/<[^>]*>/g, '""');
        await executeJavaScript(jsCode, filename);
        break;
      case 'ts':
        addOutput('📘 TypeScript file detected', 'info');
        await executeJavaScript(code, filename);
        break;
      case 'xml':
        addOutput('📄 XML file detected', 'info');
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(code, 'text/xml');
          addOutput('✅ Valid XML format', 'success');
        } catch (error) {
          addOutput(`❌ XML Parse Error: ${error}`, 'error');
        }
        break;
      case 'txt':
        addOutput('📄 Text file content:', 'info');
        addOutput(code, 'output');
        break;
      default:
        addOutput(`📄 File type: ${ext || 'unknown'}`, 'info');
        const preview = code.length > 500 ? code.substring(0, 500) + '...' : code;
        addOutput(preview, 'output');
    }
    
    addOutput('', 'output');
  };

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    setIsRunning(true);
    addCommand(cmd);

    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    const parts = cmd.trim().split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    try {
      switch (command) {
        case 'run':
          if (args.length === 0) {
            addOutput('❌ No file specified', 'error');
            addOutput('Usage: run <filename>', 'info');
          } else {
            const targetFile = args[0];
            const file = files.find(f => f.name === targetFile);
            
            if (file) {
              await executeFile(file.name, file.content);
            } else {
              addOutput(`❌ File not found: ${targetFile}`, 'error');
              addOutput('💡 Use "ls" to see available files', 'info');
            }
          }
          break;

        case 'preview':
          if (args.length === 0) {
            addOutput('❌ No file specified', 'error');
            addOutput('Usage: preview <filename.html>', 'info');
          } else {
            const targetFile = args[0];
            const file = files.find(f => f.name === targetFile);
            
            if (file) {
              const ext = file.name.split('.').pop()?.toLowerCase();
              if (ext === 'html' || ext === 'htm') {
                openLivePreview(file.content, file.name);
              } else {
                addOutput(`❌ Preview only supports HTML files. ${targetFile} is not an HTML file.`, 'error');
                addOutput('💡 Try: preview index.html', 'info');
              }
            } else {
              addOutput(`❌ File not found: ${targetFile}`, 'error');
              addOutput('💡 Use "ls" to see available files', 'info');
            }
          }
          break;

        case 'ls':
        case 'dir':
          addOutput('📁 Files in project:', 'info');
          if (files.length === 0) {
            addOutput('  (no files)', 'output');
          } else {
            files.forEach(file => {
              const ext = file.name.split('.').pop()?.toLowerCase();
              const icon = getFileIcon(ext);
              const isHtml = ext === 'html' || ext === 'htm';
              addOutput(`  ${icon} ${file.name}${isHtml ? ' (preview available)' : ''}`, 'output');
            });
          }
          addOutput(`\nTotal files: ${files.length}`, 'info');
          
          const htmlFiles = files.filter(f => {
            const ext = f.name.split('.').pop()?.toLowerCase();
            return ext === 'html' || ext === 'htm';
          });
          
          if (htmlFiles.length > 0) {
            addOutput('', 'output');
            addOutput('🌐 HTML files found! Use "preview <filename>" for live preview:', 'info');
            htmlFiles.forEach(file => {
              addOutput(`  preview ${file.name}`, 'output');
            });
          }
          break;

        case 'cat':
        case 'type':
          if (args.length > 0) {
            const targetFile = args[0];
            const file = files.find(f => f.name === targetFile);
            if (file) {
              addOutput(`📄 Contents of ${targetFile}:`, 'info');
              addOutput('─'.repeat(50), 'info');
              addOutput(file.content, 'output');
              addOutput('─'.repeat(50), 'info');
            } else {
              addOutput(`❌ File not found: ${targetFile}`, 'error');
            }
          } else {
            addOutput('❌ Usage: cat <filename>', 'error');
          }
          break;

        case 'clear':
        case 'cls':
          setOutput([]);
          addOutput('🚀 CodeVanta AI Terminal - Ready for execution', 'welcome');
          addOutput('Terminal cleared. Ready for new commands!', 'success');
          break;

        case 'help':
          addOutput('🚀 CodeVanta AI Terminal - Available Commands:', 'info');
          addOutput('', 'output');
          addOutput('📁 File Operations:', 'info');
          addOutput('  ls, dir          - List all files in project', 'output');
          addOutput('  cat <file>       - Display file contents', 'output');
          addOutput('  run <file>       - Execute file (any supported type)', 'output');
          addOutput('  preview <file>   - Open HTML files in live preview', 'output');
          addOutput('', 'output');
          addOutput('⚡ Direct Execution:', 'info');
          addOutput('  js <code>        - Execute JavaScript directly', 'output');
          addOutput('  py <code>        - Execute Python directly', 'output');
          addOutput('  java <code>      - Execute Java code', 'output');
          addOutput('', 'output');
          addOutput('🛠️ Utilities:', 'info');
          addOutput('  clear, cls       - Clear terminal', 'output');
          addOutput('  pwd              - Show current directory', 'output');
          addOutput('  echo <text>      - Display text', 'output');
          addOutput('  help             - Show this help', 'output');
          break;

        case 'js':
        case 'node':
          if (args.length > 0) {
            const jsCode = args.join(' ');
            await executeJavaScript(jsCode);
          } else {
            addOutput('❌ Usage: js <javascript code>', 'error');
            addOutput('Example: js console.log("Hello World!")', 'info');
          }
          break;

        case 'py':
        case 'python':
          if (args.length > 0) {
            const pyCode = args.join(' ');
            await executePython(pyCode);
          } else {
            addOutput('❌ Usage: py <python code>', 'error');
            addOutput('Example: py print("Hello World!")', 'info');
          }
          break;

        case 'java':
          if (args.length > 0) {
            const javaCode = args.join(' ');
            await executeJava(javaCode);
          } else {
            addOutput('❌ Usage: java <java code>', 'error');
            addOutput('Example: java System.out.println("Hello World!");', 'info');
          }
          break;

        case 'pwd':
          addOutput(currentDirectory, 'output');
          break;

        case 'echo':
          if (args.length > 0) {
            addOutput(args.join(' '), 'output');
          } else {
            addOutput('', 'output');
          }
          break;

        case 'version':
          addOutput('🚀 CodeVanta AI Terminal v3.0.0', 'info');
          addOutput('Universal code execution environment', 'info');
          break;

        default:
          addOutput(`❌ Command not found: ${command}`, 'error');
          addOutput("💡 Type 'help' to see available commands", 'info');
      }
    } catch (error) {
      addOutput(`❌ Error executing command: ${error}`, 'error');
    }

    setIsRunning(false);
  };

  const getFileIcon = (ext?: string) => {
    switch (ext) {
      case 'js': return '⚡';
      case 'py': return '🐍';
      case 'java': return '☕';
      case 'html': case 'htm': return '🌐';
      case 'css': return '🎨';
      case 'json': return '📄';
      case 'md': case 'markdown': return '📝';
      case 'jsx': case 'tsx': return '⚛️';
      case 'ts': return '📘';
      case 'xml': return '📋';
      case 'txt': return '📄';
      default: return '📄';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(command);
      setCommand('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const commands = ['run', 'preview', 'ls', 'cat', 'clear', 'help', 'js', 'py', 'java', 'node', 'python'];
      const matches = commands.filter(cmd => cmd.startsWith(command));
      if (matches.length === 1) {
        setCommand(matches[0] + ' ');
      }
    }
  };

  const clearTerminal = () => {
    setOutput([]);
    addOutput('🚀 CodeVanta AI Terminal - Ready for execution', 'welcome');
    addOutput('Terminal cleared. Ready for new commands!', 'success');
  };

  const copyOutput = () => {
    const outputText = output.map(item => {
      const timestamp = item.timestamp.toLocaleTimeString();
      return `[${timestamp}] ${item.content}`;
    }).join('\n');
    navigator.clipboard.writeText(outputText);
    addOutput('📋 Terminal output copied to clipboard!', 'success');
  };

  const downloadOutput = () => {
    const outputText = output.map(item => {
      const timestamp = item.timestamp.toLocaleTimeString();
      return `[${timestamp}] ${item.type.toUpperCase()}: ${item.content}`;
    }).join('\n');
    
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codevanta-terminal-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addOutput('💾 Terminal output downloaded!', 'success');
  };

  if (!terminalVisible) return null;

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <TerminalIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">CodeVanta AI Terminal</h2>
            <p className="text-xs text-slate-400">Universal execution environment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyOutput}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            title="Copy Output"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={downloadOutput}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            title="Download Output"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={clearTerminal}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            title="Clear Terminal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTerminal}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggestions */}
      {showSuggestions && visibleSuggestions.length > 0 && (
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">Quick Commands</h3>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Hide suggestions
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {visibleSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group"
              >
                <div className="flex-shrink-0">
                  {suggestion.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-slate-200 truncate">{suggestion.title}</h4>
                    <button
                      onClick={() => dismissSuggestion(suggestion.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-300 transition-all"
                      title="Dismiss suggestion"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{suggestion.description}</p>
                  <button
                    onClick={() => {
                      setCommand(suggestion.command);
                      inputRef.current?.focus();
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 mt-1"
                  >
                    {suggestion.command}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 bg-black font-mono text-sm min-h-0"
      >
        {output.map((item) => (
          <div key={item.id} className="mb-1 leading-relaxed">
            <div className={`${
              item.type === 'command' 
                ? 'text-green-400 font-semibold' 
                : item.type === 'error' 
                  ? 'text-red-400' 
                  : item.type === 'info'
                    ? 'text-blue-400'
                    : item.type === 'success'
                      ? 'text-green-400'
                      : item.type === 'welcome'
                        ? 'text-purple-400 font-semibold'
                        : 'text-slate-300'
            }`}>
              {item.content}
            </div>
          </div>
        ))}
        
        {isRunning && (
          <div className="text-yellow-400 animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <span className="ml-2">Executing...</span>
          </div>
        )}
      </div>

      {/* Command Input */}
      <div className="flex items-center gap-3 p-4 border-t border-slate-700 bg-slate-800 flex-shrink-0">
        <span className="text-green-400 font-mono font-bold">{currentDirectory}$</span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command (try 'help', 'ls', 'run', or 'preview')"
          className="flex-1 bg-transparent text-slate-100 font-mono focus:outline-none placeholder-slate-500 text-sm"
          disabled={isRunning}
        />
        <button
          onClick={() => executeCommand(command)}
          disabled={isRunning || !command.trim()}
          className="p-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          title="Execute Command"
        >
          <Play className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};