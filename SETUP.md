# NextChat Setup Guide

## ✅ Installation Complete!

NextChat has been successfully installed to your workspace.

## 🚀 Current Status

- ✅ Repository cloned from GitHub
- ✅ Dependencies installed with yarn
- ✅ Development server running on http://localhost:3000
- ✅ Environment template created

## 🔧 Next Steps

### 1. Configure API Keys

Create a `.env.local` file in the project root with your API keys:

```bash
cp env.template .env.local
```

Then edit `.env.local` and add your API keys:

```env
# Required: Add your OpenAI API key
OPENAI_API_KEY=sk-your-actual-api-key-here

# Optional: Add other API keys as needed
GOOGLE_API_KEY=your_google_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 2. Available Scripts

- `yarn dev` - Start development server (already running)
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn test` - Run tests

### 3. Access the Application

- **Web Interface**: http://localhost:3000
- **Status**: ✅ Running and accessible

### 4. Features Available

- Support for multiple AI providers (OpenAI, Google, Anthropic, etc.)
- MCP (Model Context Protocol) support
- Desktop app support via Tauri
- Multi-language support
- Dark/light theme
- PWA support

### 5. Optional Configuration

- **Access Control**: Set `CODE` environment variable for password protection
- **MCP Support**: Set `ENABLE_MCP=true` to enable Model Context Protocol
- **Custom Models**: Configure `CUSTOM_MODELS` for additional model support
- **Proxy Support**: Set `BASE_URL` if you need to use a proxy

## 📚 Documentation

- [GitHub Repository](https://github.com/ChatGPTNextWeb/NextChat)
- [Official Website](https://nextchat.club)
- [FAQ](https://github.com/ChatGPTNextWeb/NextChat/blob/main/docs/faq-en.md)

## 🛠️ Development

The project is built with:
- Next.js 14
- React 18
- TypeScript
- SCSS
- Zustand for state management
- Tauri for desktop apps

Happy chatting! 🎉
