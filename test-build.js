console.log('Testing build output...');
try {
  require('./dist/http-server.js');
  console.log('✅ Build test passed');
} catch (err) {
  console.error('❌ Build test failed:', err.message);
  process.exit(1);
}
