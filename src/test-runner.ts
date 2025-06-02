import { spawn } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class MCPTestRunner {
  private server: any;
  private requestId: number = 1;

  async start() {
    console.log('🚀 Starting MCP Multi-API Server Test Runner\n');
    
    // Start the server
    this.server = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.server.stdout.on('data', (data: Buffer) => {
      const response = data.toString().trim();
      if (response) {
        try {
          const parsed = JSON.parse(response);
          console.log('\n📥 Response:', JSON.stringify(parsed, null, 2));
        } catch {
          console.log('\n📥 Server:', response);
        }
      }
    });

    this.server.stderr.on('data', (data: Buffer) => {
      console.error('\n❌ Error:', data.toString());
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.showMenu();
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

  listTools() {
    const request = {
      jsonrpc: '2.0',
      method: 'tools/list',
      id: this.requestId++
    };

    console.log('\n📤 Request:', JSON.stringify(request, null, 2));
    this.server.stdin.write(JSON.stringify(request) + '\n');
  }

  callTool(name: string, args: any) {
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
    this.server.stdin.write(JSON.stringify(request) + '\n');
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
    this.server.kill();
    rl.close();
    process.exit(0);
  }
}

// Run the test runner
const runner = new MCPTestRunner();
runner.start().catch(console.error);