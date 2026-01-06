import express from 'express';
import cors from 'cors';
import path from 'path';
import { apiRouter } from './routes/api';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes (proxy to ESPN)
app.use('/api', apiRouter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  
  // SPA fallback
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start server on all interfaces (0.0.0.0) for network access
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   NFL Scoreboard Server                               ║
║   Running on http://0.0.0.0:${PORT}                      ║
║                                                        ║
║   API Proxy: http://<your-ip>:${PORT}/api                ║
║                                                        ║
║   For iPad access, use your local IP:                 ║
║   http://<your-ip>:${PORT}                               ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});
