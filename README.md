# MCP Multi-API Server 🌉

A Model Context Protocol (MCP) server that bridges AI/LLMs with multiple real-world APIs including weather, finance, and news services. This server acts as a standardized interface, allowing any MCP-compatible AI application to seamlessly interact with external APIs without custom integration work.

## 🚀 Features

- **Multi-API Support**: Weather (OpenWeatherMap), Finance (Alpha Vantage), News (NewsAPI)
- **MCP Protocol Compliant**: Full implementation of Anthropic's MCP standard
- **Intelligent Caching**: Configurable TTL-based caching to reduce API calls
- **Rate Limiting**: Built-in rate limiting to respect API quotas
- **Comprehensive Logging**: Winston-based logging with multiple transports
- **Error Handling**: Robust error handling with meaningful error messages
- **TypeScript**: Fully typed for better developer experience

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for:
  - [OpenWeatherMap](https://openweathermap.org/api)
  - [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
  - [NewsAPI](https://newsapi.org/register)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mcp-multi-api-server.git
cd mcp-multi-api-server
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment template and add your API keys:
```bash
cp .env.example .env
```

4. Edit `.env` and add your API keys:
```env
OPENWEATHER_API_KEY=your_key_here
ALPHA_VANTAGE_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
```

5. Build the project:
```bash
npm run build
```

## 🚀 Usage

### Starting the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```


## 🏗️ Architecture

```
src/
├── index.ts          # Entry point & MCP server setup
├── api/              # API client implementations
├── tools/            # MCP tool definitions
├── utils/            # Utilities (cache, rate limiter, logger)
└── types/            # TypeScript type definitions
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | Required |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage API key | Required |
| `NEWS_API_KEY` | NewsAPI key | Required |
| `MCP_SERVER_PORT` | Server port | 3000 |
| `LOG_LEVEL` | Logging level | info |
| `CACHE_TTL_WEATHER` | Weather cache TTL (seconds) | 300 |
| `CACHE_TTL_FINANCE` | Finance cache TTL (seconds) | 60 |
| `CACHE_TTL_NEWS` | News cache TTL (seconds) | 600 |
| `RATE_LIMIT_REQUESTS` | Rate limit requests | 100 |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | 60000 |

## 🧪 Testing

Run the test script:
```bash
npm test
```

### Using MCP Inspector (Visual Testing)

```bash
# Install MCP Inspector globally
npm install -g @modelcontextprotocol/inspector

# Run the inspector
mcp-inspector node dist/index.js
```

This opens a web interface at `http://localhost:5173` where you can:
- See all available tools
- Test tool calls interactively
- View request/response logs

### Manual STDIO Testing

```bash
# Start the server
node dist/index.js

# Run the test script
node dist/test-runner.js



