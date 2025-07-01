# CodeVanta AI 🚀

**Intelligent Code Editor with AI Assistance**

A powerful, web-based code editor that combines GitHub integration with advanced AI capabilities to enhance your development workflow. Built with React, TypeScript, and powered by Google's Gemini AI.

![CodeVanta AI](https://img.shields.io/badge/CodeVanta-AI%20Powered-purple?style=for-the-badge&logo=react)
![Version](https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

## ✨ Features

### 🤖 AI-Powered Development
- **Intelligent Code Assistance**: Get smart suggestions, code optimization, and bug fixes
- **Natural Language Programming**: Describe what you want and let AI write the code
- **Code Explanation**: Understand complex code with AI-powered explanations
- **Multi-language Support**: AI assistance for JavaScript, Python, HTML, CSS, TypeScript, and more

### 🔧 Advanced Code Editor
- **Monaco Editor Integration**: VS Code-like editing experience
- **Syntax Highlighting**: Support for 20+ programming languages
- **Code Formatting**: Built-in Prettier integration
- **Smart Autocomplete**: Intelligent code completion
- **Multi-file Management**: Work with multiple files simultaneously

### 🐙 GitHub Integration
- **Repository Management**: Browse, create, and manage repositories
- **Branch Operations**: Create, switch, and manage branches
- **File Operations**: Create, edit, and delete files directly
- **Commit History**: View and track project changes
- **Real-time Sync**: Automatic synchronization with GitHub

### 🖥️ Multi-Language Terminal
- **Universal Execution**: Run JavaScript, Python, HTML, CSS, JSON, Markdown, and more
- **Real-time Output**: See execution results instantly
- **Interactive Commands**: Full terminal experience with command history
- **File Analysis**: Analyze and process different file types
- **Code Debugging**: Execute and test code snippets

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Themes**: Choose your preferred coding environment
- **Split Panels**: Customizable layout with resizable panels
- **File Explorer**: Intuitive file tree navigation
- **Celebration Animations**: Delightful feedback for actions

## 🚀 Live Demo

Experience CodeVanta AI live: **[https://adityawebeditor.netlify.app](https://adityawebeditor.netlify.app)**

## 📋 Prerequisites

Before you begin, ensure you have:

1. **GitHub Personal Access Token**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a new token with `repo` and `user` scopes
   - Copy the token for setup

2. **Google Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key
   - Copy the key for setup

## 🛠️ Installation & Setup

### Option 1: Use the Live Version
Simply visit [https://adityawebeditor.netlify.app](https://adityawebeditor.netlify.app) and enter your tokens when prompted.

### Option 2: Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/codevanta-ai.git
   cd codevanta-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

5. **Enter your tokens**
   - GitHub Personal Access Token
   - Gemini API Key

## 🎯 Quick Start Guide

### 1. Initial Setup
- Enter your GitHub token and Gemini API key
- The application will verify your tokens automatically

### 2. Repository Management
- **Select Repository**: Choose from your existing repositories
- **Create New**: Create a new repository directly from the editor
- **Switch Branches**: Easily switch between different branches

### 3. File Operations
- **Create Files**: Use the file explorer to create new files
- **Edit Code**: Use the powerful Monaco editor with AI assistance
- **Save Changes**: Save files locally or push to GitHub

### 4. AI Assistance
- **Open AI Sidebar**: Click the AI button in the toolbar
- **Ask Questions**: Get help with your code, debugging, or explanations
- **Code Generation**: Describe features and let AI write the code

### 5. Terminal Usage
- **Open Terminal**: Click the Terminal button
- **Run Files**: Use `run filename.ext` to execute any file
- **Direct Execution**: Use `js`, `py`, or other commands for quick testing

## 🔧 Available Commands

### Terminal Commands
```bash
# File operations
ls, dir          # List all files
cat <file>       # Display file contents
run [file]       # Execute any supported file type

# Direct execution
js <code>        # Execute JavaScript
py <code>        # Execute Python
node <code>      # Execute Node.js

# Utilities
clear, cls       # Clear terminal
help             # Show all commands
pwd              # Current directory
echo <text>      # Display text
```

### Keyboard Shortcuts
- `Ctrl/Cmd + S` - Save file
- `Ctrl/Cmd + F` - Find in file
- `Ctrl/Cmd + +` - Zoom in
- `Ctrl/Cmd + -` - Zoom out
- `Ctrl/Cmd + 0` - Reset zoom

## 🌟 Supported File Types

| Language | Extensions | Features |
|----------|------------|----------|
| JavaScript | `.js`, `.mjs` | Execution, AI assistance, formatting |
| Python | `.py` | Execution, AI assistance, syntax highlighting |
| HTML | `.html`, `.htm` | Preview, execution, AI assistance |
| CSS | `.css`, `.scss` | Analysis, formatting, AI assistance |
| TypeScript | `.ts`, `.tsx` | AI assistance, syntax highlighting |
| React | `.jsx`, `.tsx` | Component analysis, AI assistance |
| JSON | `.json` | Validation, formatting, analysis |
| Markdown | `.md` | Preview, analysis, AI assistance |
| XML | `.xml` | Validation, syntax highlighting |

## 🔒 Security & Privacy

- **Token Security**: All tokens are stored locally in your browser
- **No Server Storage**: Your code and tokens never leave your device
- **GitHub API**: Direct communication with GitHub's secure API
- **Gemini AI**: Secure communication with Google's AI services

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Monaco Editor** - Powerful code editor
- **GitHub API** - Repository management
- **Google Gemini** - AI assistance
- **React** - UI framework
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/codevanta-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/codevanta-ai/discussions)
- **Email**: support@codevanta.ai

## 🗺️ Roadmap

- [ ] **Plugin System**: Extensible plugin architecture
- [ ] **Collaborative Editing**: Real-time collaboration features
- [ ] **More AI Models**: Support for additional AI providers
- [ ] **Mobile App**: Native mobile applications
- [ ] **Cloud Sync**: Optional cloud storage for settings
- [ ] **Advanced Debugging**: Integrated debugging tools

---

<div align="center">

**Built with ❤️ by developers, for developers**

[🌟 Star this project](https://github.com/yourusername/codevanta-ai) | [🐛 Report Bug](https://github.com/yourusername/codevanta-ai/issues) | [💡 Request Feature](https://github.com/yourusername/codevanta-ai/issues)

</div>