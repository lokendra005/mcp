import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { logger } from './utils/logger.js';

export class MCPServer {
  private server: Server;
  private tools: Map<string, any>;
  private handlers: Map<string, (args: any) => Promise<any>>;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-multi-api-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );
    this.tools = new Map();
    this.handlers = new Map();
    
    this.setupHandlers();
  }

  private setupHandlers() {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: Array.from(this.tools.values())
    }));

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      const handler = this.handlers.get(name);
      if (!handler) {
        throw new Error(`Unknown tool: ${name}`);
      }

      try {
        const result = await handler(args);
        return {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error in tool ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  registerTool(definition: any, handler: (args: any) => Promise<any>) {
    this.tools.set(definition.name, { definition, handler });
    this.handlers.set(definition.name, handler);
    logger.info(`Registered tool: ${definition.name}`);
  }

  getServer(): Server {
    return this.server;
  }
}