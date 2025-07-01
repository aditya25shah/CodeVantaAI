import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EditorFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isDirty: boolean;
  isActive: boolean;
  cursorPosition?: { line: number; column: number };
}

export interface EditorSettings {
  theme: 'vs-dark' | 'vs-light' | 'hc-black';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  formatOnSave: boolean;
  aiAssistance: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'gemini' | 'claude';
  maxTokens: number;
  isAvailable: boolean;
}

interface EditorStore {
  // Files
  files: EditorFile[];
  activeFileId: string | null;
  
  // Settings
  settings: EditorSettings;
  
  // AI
  aiModels: AIModel[];
  selectedAIModel: string;
  aiApiKey: string;
  
  // UI State
  sidebarVisible: boolean;
  aiPanelVisible: boolean;
  terminalVisible: boolean;
  commandPaletteVisible: boolean;
  
  // Actions
  addFile: (file: Omit<EditorFile, 'id' | 'isDirty' | 'isActive'>) => void;
  removeFile: (fileId: string) => void;
  updateFile: (fileId: string, updates: Partial<EditorFile>) => void;
  setActiveFile: (fileId: string) => void;
  updateSettings: (settings: Partial<EditorSettings>) => void;
  setAIModel: (modelId: string) => void;
  setAIApiKey: (key: string) => void;
  toggleSidebar: () => void;
  toggleAIPanel: () => void;
  toggleTerminal: () => void;
  toggleCommandPalette: () => void;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      // Initial state
      files: [],
      activeFileId: null,
      
      settings: {
        theme: 'vs-dark',
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Fira Code, SF Mono, Consolas, Monaco, monospace',
        tabSize: 2,
        wordWrap: true,
        minimap: false,
        lineNumbers: true,
        autoSave: true,
        formatOnSave: true,
        aiAssistance: true,
      },
      
      aiModels: [
        { id: 'gpt-4', name: 'GPT-4', provider: 'openai', maxTokens: 8192, isAvailable: true },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', maxTokens: 4096, isAvailable: true },
        { id: 'gemini-pro', name: 'Gemini Pro', provider: 'gemini', maxTokens: 32768, isAvailable: true },
        { id: 'claude-3', name: 'Claude 3', provider: 'claude', maxTokens: 100000, isAvailable: false },
      ],
      selectedAIModel: 'gemini-pro',
      aiApiKey: '',
      
      sidebarVisible: true,
      aiPanelVisible: false,
      terminalVisible: false,
      commandPaletteVisible: false,
      
      // Actions
      addFile: (file) => {
        const newFile: EditorFile = {
          ...file,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          isDirty: false,
          isActive: false,
        };
        
        set((state) => ({
          files: [...state.files.map(f => ({ ...f, isActive: false })), { ...newFile, isActive: true }],
          activeFileId: newFile.id,
        }));
      },
      
      removeFile: (fileId) => {
        set((state) => {
          const files = state.files.filter(f => f.id !== fileId);
          const activeFileId = state.activeFileId === fileId 
            ? (files.length > 0 ? files[files.length - 1].id : null)
            : state.activeFileId;
          
          return {
            files: files.map(f => ({ ...f, isActive: f.id === activeFileId })),
            activeFileId,
          };
        });
      },
      
      updateFile: (fileId, updates) => {
        set((state) => ({
          files: state.files.map(f => 
            f.id === fileId 
              ? { ...f, ...updates, isDirty: updates.content !== undefined ? true : f.isDirty }
              : f
          ),
        }));
      },
      
      setActiveFile: (fileId) => {
        set((state) => ({
          files: state.files.map(f => ({ ...f, isActive: f.id === fileId })),
          activeFileId: fileId,
        }));
      },
      
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
      
      setAIModel: (modelId) => {
        set({ selectedAIModel: modelId });
      },
      
      setAIApiKey: (key) => {
        set({ aiApiKey: key });
      },
      
      toggleSidebar: () => {
        set((state) => ({ sidebarVisible: !state.sidebarVisible }));
      },
      
      toggleAIPanel: () => {
        set((state) => ({ aiPanelVisible: !state.aiPanelVisible }));
      },
      
      toggleTerminal: () => {
        set((state) => ({ terminalVisible: !state.terminalVisible }));
      },
      
      toggleCommandPalette: () => {
        set((state) => ({ commandPaletteVisible: !state.commandPaletteVisible }));
      },
    }),
    {
      name: 'codevanta-editor-store',
      partialize: (state) => ({
        settings: state.settings,
        selectedAIModel: state.selectedAIModel,
        sidebarVisible: state.sidebarVisible,
      }),
    }
  )
);