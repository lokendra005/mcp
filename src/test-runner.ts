import axios, { AxiosError } from 'axios';  // First install: npm install axios
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class MCPTestRunner {
  private baseUrl = 'http://localhost:3000';
  private requestId: number = 1;

  async start() {
    console.log('🚀 Starting MCP Multi-API Server Test Runner\n');
    
    // Test server health
    try {
      const health = await axios.get(`${this.baseUrl}/health`);
      console.log('Server health:', health.data);
      this.showMenu();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to connect to server:', error.message);
      }
      this.exit();
    }
  }

  showMenu() {
    console.log('\n🔧 Available Tests:');
    console.log('1. List all tools');
    console.log('2. Test weather (London)');
    console.log('3. Test stock quote (AAPL)');
    console.log('4. Test currency exchange (USD to EUR)');
    console.log('5. Test news headlines (US Tech)');
    console.log('6. Custom tool call');
    console.log('0. Exit\n');

    rl.question('Select test (0-6): ', (answer) => {
      this.handleSelection(answer);
    });
  }

  async handleSelection(selection: string) {
    switch (selection) {
      case '1':
        this.listTools();
        break;
      case '2':
        this.callTool('get_current_weather', { city: 'London' });
        break;
      case '3':
        this.callTool('get_stock_quote', { symbol: 'AAPL' });
        break;
      case '4':
        this.callTool('get_currency_exchange', { from: 'USD', to: 'EUR' });
        break;
      case '5':
        this.callTool('get_top_headlines', { country: 'us', category: 'technology' });
        break;
      case '6':
        this.customToolCall();
        return;
      case '0':
        this.exit();
        return;
      default:
        console.log('Invalid selection');
    }

    setTimeout(() => this.showMenu(), 2000);
  }

  async listTools() {
    try {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: this.requestId++
      };

      console.log('\n📤 Request:', JSON.stringify(request, null, 2));
      const response = await axios.post(`${this.baseUrl}/mcp`, request);
      console.log('\n📥 Response:', JSON.stringify(response.data, null, 2));
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Error:', error.response?.data || error.message);
      }
    }
  }

  async callTool(name: string, args: any) {
    try {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name,
          arguments: args
        },
        id: this.requestId++
      };

      console.log('\n📤 Request:', JSON.stringify(request, null, 2));
      const response = await axios.post(`${this.baseUrl}/mcp`, request);
      console.log('\n📥 Response:', JSON.stringify(response.data, null, 2));
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Error:', error.response?.data || error.message);
      }
    }
  }

  customToolCall() {
    rl.question('\nTool name: ', (toolName) => {
      rl.question('Arguments (JSON): ', (argsStr) => {
        try {
          const args = JSON.parse(argsStr);
          this.callTool(toolName, args);
        } catch (e) {
          console.error('Invalid JSON:', e);
        }
        setTimeout(() => this.showMenu(), 2000);
      });
    });
  }

  exit() {
    console.log('\n👋 Shutting down...');
    rl.close();
    process.exit(0);
  }
}

// Run the test runner
const runner = new MCPTestRunner();
runner.start().catch(console.error);