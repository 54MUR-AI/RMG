# OMNI
## Optimized Multi-Model Networked Intelligence

<p align="center">
  <img src="logo_omni.png" alt="OMNI" width="400"/>
</p>

## 🌐 Live Web App
**Try OMNI now:** [https://profound-gumption-6dd81c.netlify.app](https://profound-gumption-6dd81c.netlify.app)

Chat with GPT-4, Claude 3, and Grok using your own API keys in a modern, secure web interface.

## Overview
OMNI provides two powerful ways to interact with multiple AI models:

1. **Web Application** - Modern browser-based chat interface with real-time streaming
2. **Desktop Application** - Comprehensive PyQt6 environment with plugin management and advanced features

## Key Features

### 🌐 Web Application Features
- **Multi-Model Support**
  - OpenAI GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
  - Anthropic Claude 3 (Opus, Sonnet, Haiku)
  - xAI Grok
- **Real-Time Streaming**
  - Live response streaming from all models
  - Smooth, character-by-character output
- **Secure & Private**
  - API keys stored locally in your browser
  - No backend server - direct API calls
  - Client-side only architecture
- **Modern UI/UX**
  - Glassmorphism design with premium styling
  - Responsive layout (mobile, tablet, desktop)
  - Dark theme with samurai aesthetic
  - Smooth animations and transitions
- **Easy Configuration**
  - Simple settings modal for API keys
  - Model switching mid-conversation
  - Session-based chat history

### 🖥️ Desktop Application - AI Integration
- **Multiple Model Support**
  - Local models via Ollama (Llama 2, CodeLlama, Mistral)
  - Anthropic Claude integration
  - OpenAI GPT integration
  - Grok AI capabilities
- **Model Management**
  - Dynamic model switching
  - Streaming responses
  - Rate limiting and error handling
  - Circuit breaker pattern
  - Async/await interface

### User Interface
- **Modern Desktop Application**
  - Built with PyQt6
  - Dark theme optimized
  - Responsive design
  - Async support via qasync
- **Interactive Components**
  - Chat interface with message bubbles
  - Model playground for testing
  - Code editor with syntax highlighting
  - Plugin dashboard
  - Configuration editors
  - Project manager
  - Task console

### Audio Capabilities
- **Text-to-Speech**
  - Microsoft Edge TTS integration
  - British male voice (en-GB-RyanNeural)
  - Configurable rate and volume
  - Async audio playback
- **Speech Input**
  - Framework ready (currently disabled)
  - Future speech-to-text support

### Plugin System
- **Core Plugins**
  - Web scraping (Brave Search)
  - File system operations
  - GitHub integration
  - Documentation handling
- **Plugin Management**
  - Security sandboxing
  - Dependency management
  - Plugin marketplace
  - Update mechanism

### Core Services
- **Data Management**
  - Vector database (Pinecone)
  - Project tracking
  - Configuration handling
- **Security**
  - Authentication system
  - API key management
  - Plugin sandboxing
- **Monitoring**
  - Performance metrics
  - Resource usage tracking
  - Error logging
  - Debug tools

## Quick Start

### Web Application (Recommended)

1. **Access the App**
   - Visit [https://profound-gumption-6dd81c.netlify.app](https://profound-gumption-6dd81c.netlify.app)
   - No installation required!

2. **Configure API Keys**
   - Click the "Settings" button
   - Add your API keys:
     - OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
     - Anthropic: [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
     - xAI Grok: [console.x.ai](https://console.x.ai)
   - Click "Save Keys"

3. **Start Chatting**
   - Select your preferred model
   - Type your message and press Enter
   - Enjoy real-time AI responses!

### Desktop Application

1. **System Requirements**
   - Python 3.13 or higher
   - PyQt6
   - 8GB RAM minimum (16GB recommended)
   - Windows/Linux/MacOS support

2. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/54MUR-AI/omni.git
   cd omni

   # Create and activate virtual environment
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   source venv/bin/activate # Linux/MacOS

   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Configuration**
   Set up required environment variables:
   - `BRAVE_SEARCH_API_KEY`: For web search functionality
   - `PINECONE_API_KEY`: For vector database operations

4. **Running the Dashboard**
   ```bash
   python run_dashboard.py
   ```

## Documentation

- [Architecture Overview](docs/architecture.md)
- [Configuration Guide](docs/configuration.md)
- [Plugin Development](docs/plugin_development.md)
- [Security Guidelines](docs/security.md)
- [Performance Tuning](docs/performance.md)
- [Testing Guide](docs/testing.md)

## Development

### Project Structure
```
omni/
├── web/             # Web application (React + TypeScript)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # API key management
│   │   ├── services/      # AI provider integrations
│   │   └── types.ts       # TypeScript definitions
│   ├── dist/              # Production build
│   └── README.md          # Web app documentation
├── src/             # Desktop application (Python)
│   ├── ai/          # AI model integration
│   ├── app/         # Core application
│   ├── audio/       # Audio processing
│   ├── core/        # Core services
│   ├── plugins/     # Plugin system
│   └── ui/          # User interface
├── docs/            # Documentation
├── tests/           # Test suite
└── tools/           # Development tools
```

### Web App Development
```bash
cd web
npm install
npm run dev      # Development server
npm run build    # Production build
```

### Testing
```bash
# Run test suite
pytest tests/

# Run specific test
pytest tests/test_ollama_model.py
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to OMNI.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.
