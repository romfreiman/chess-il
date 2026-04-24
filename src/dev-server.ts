import express from 'express';
import { playerRouter } from './api/routes/player.js';
import { clubsRouter } from './api/routes/clubs.js';

const app = express();
const PORT = 3001;

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());
app.use('/api/player', playerRouter);
app.use('/api/clubs', clubsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dev API server running at http://0.0.0.0:${PORT}`);
});
