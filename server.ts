import express from 'express';
import path from 'path';
import { apiRouter } from './api-router.ts';

const app = express();
app.use(express.json());
const PORT = 3000;

app.use('/api', apiRouter);

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    
    // Explicitly set WASM mime type to prevent "wasm streaming compile failed" errors
    express.static.mime.define({'application/wasm': ['wasm']});
    
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only listen if not executing in Vercel serverless environment
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

// Automatically start if executed locally
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}

export default app;
