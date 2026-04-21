import express from 'express';
import { playerRouter } from './src/api/routes/player.js';

const app = express();
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use('/api/player', playerRouter);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.listen(3001, () => console.log('API running on http://localhost:3001 (SQLite mode)'));
