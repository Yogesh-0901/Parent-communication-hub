import express from 'express';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const PORT = 3002;

app.get('/', (req, res) => {
  res.send('Simple test server is running!');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple test server running on http://localhost:${PORT}`);
});
