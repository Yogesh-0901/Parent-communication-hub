import express from 'express';

console.log('Starting test server...');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());

try {
  console.log('Express loaded successfully');
  
  const app = express();
  const PORT = 3001;
  
  app.get('/', (req, res) => {
    res.send('Test server is running!');
  });
  
  app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error('Error:', error);
}
