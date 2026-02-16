# WSPR
## Web-Secure P2P Relay

A secure, privacy-focused communication platform featuring encrypted workspace channels, private direct messaging, and RMG-integrated contacts. WSPR delivers military-grade security with real-time messaging, LDGR file sharing, and zero-knowledge architecture.

## 🌟 Features

### 💬 Direct Messages
- 🔒 **End-to-End Encryption**: AES-256-GCM encryption for all DMs
- ⚡ **Real-Time Delivery**: Instant message delivery via WebSocket
- 📊 **Read Receipts**: See when messages are delivered and read
- ⌨️ **Typing Indicators**: Know when someone is typing
- � **Message History**: Full encrypted conversation history
- 🔐 **Zero-Knowledge**: Server never accesses plaintext content

### 👥 RMG Contacts Integration
- 🌐 **Unified Contacts**: Manage contacts once, use across all RMG apps
- � **Contact Requests**: Send and receive connection requests
- ✅ **Accept/Decline**: Control who can message you
- � **Cross-App Sync**: Contacts work in WSPR, SCRP, OMNI, and future apps
- 👤 **Profile Integration**: Display names and avatars from RMG profiles
- � **Request Notifications**: Visual badges for pending requests

### 📎 LDGR File Sharing
- � **Encrypted Attachments**: Files encrypted via LDGR before sending
- ☁️ **Multi-Storage**: IPFS, Cloud, and P2P transfer support
- 📊 **File Metadata**: Track file types, sizes, and upload dates
- � **Seamless Integration**: Share LDGR files directly in conversations
- 🛡️ **Client-Side Encryption**: Files encrypted before leaving your device

### 🏢 Workspace Channels
- � **Team Collaboration**: Organized channels for group communication
- 🔐 **Member Management**: Control who has access to each workspace
- � **Channel Organization**: Create channels for different topics
- ⚡ **Real-Time Updates**: Instant message delivery to all members

### Security & Privacy
- � **Client-Side Cryptography**: Web Crypto API encryption
- � **AES-GCM Encryption**: Military-grade symmetric encryption
- 🤝 **ECDH Key Exchange**: Secure key establishment
- ⏩ **Perfect Forward Secrecy**: Past messages stay secure
- 🔐 **Two-Factor Authentication**: TOTP and hardware key support
- 🛡️ **Row-Level Security**: Database-level access control
- 🔄 **Secure WebSocket**: Encrypted real-time connections

### User Experience
- 📱 Virtualized message list for performance
- 👥 Real-time presence indicators
- ⌨️ Typing notifications
- 🔄 Device management
- 🎨 Modern UI with Tailwind CSS
- 🌙 Dark/Light theme support
- 📱 Progressive Web App (PWA)
- 🔔 Push notifications

### Rich Text Features
- 🎨 Text formatting toolbar
- ⌨️ Keyboard shortcuts
- 📝 Block-level formatting
- 🔗 Link embedding
- 💻 Code blocks with syntax highlighting
- 📋 Lists and quotes

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand
- **UI**: Tailwind CSS
- **Editor**: Slate.js
- **Virtualization**: @tanstack/react-virtual
- **WebSocket**: Socket.IO Client
- **Testing**: Jest + React Testing Library

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express
- **Database**: PostgreSQL
- **WebSocket**: Socket.IO
- **Authentication**: JWT + 2FA
- **API Documentation**: OpenAPI/Swagger

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm 8 or higher
- PostgreSQL 14 or higher
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/54MUR-AI/wspr-web.git
cd wspr-web
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

3. Set up environment variables:
```bash
# Create .env files from examples
cp .env.example .env
cd client && cp .env.example .env
cd ../server && cp .env.example .env
```

Required environment variables:
```env
# Root .env
PORT=3001
NODE_ENV=development

# Client .env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_ENCRYPTION_KEY_LENGTH=256
VITE_ENCRYPTION_ALGORITHM=AES-GCM

# Server .env
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret
DB_CONNECTION_STRING=postgresql://user:password@localhost:5432/wspr
TWO_FACTOR_SECRET=your_2fa_secret
```

4. Initialize the database:
```bash
cd server
npm run db:migrate
npm run db:seed # Optional: Add sample data
```

5. Start the development servers:
```bash
# In the root directory
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api-docs

## 📚 Documentation

Detailed documentation is available in the `/docs` directory:

- [API Documentation](api.md)
- [Architecture Overview](architecture.md)
- [Deployment Guide](deployment.md)
- [Security Audit](security-audit.md)
- [Performance Optimization](performance.md)
- [Testing Guide](testing.md)
- [Development Roadmap](roadmap.md)

## 🧪 Testing

Run tests with:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test-file.test.ts
```

## 🔐 Security

WSPR Web takes security seriously:

- All messages are end-to-end encrypted
- Keys are generated and stored client-side
- Perfect forward secrecy ensures past messages remain secure
- Regular security audits and penetration testing
- Bug bounty program for responsible disclosure

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Slate.js](https://docs.slatejs.org/)
- [TanStack Virtual](https://tanstack.com/virtual/v3)
- [Socket.IO](https://socket.io/)
- [Tailwind CSS](https://tailwindcss.com/)
