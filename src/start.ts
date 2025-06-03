import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined;
const useHttpServer = process.env.USE_HTTP_SERVER === 'true' || isRailway || isProduction;

console.log('Starting MCP Server...');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Railway detected: ${isRailway}`);
console.log(`Using HTTP server: ${useHttpServer}`);

if (useHttpServer) {
  console.log('Starting HTTP server on port', process.env.PORT || 3000);
  import('./http-server.js');
} else {
  console.log('Starting STDIO server for Claude Desktop');
  import('./index.js');
}