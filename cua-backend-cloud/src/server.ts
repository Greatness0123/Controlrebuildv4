import express from 'express';
import { CuaBackend } from '../../cua-backendjs/src/index';

/**
 * Cloud-ready version of the CUA Backend
 * Designed to run in a containerized environment (Docker/K8s)
 */
const app = express();
app.use(express.json());

const backend = new CuaBackend();

app.post('/execute', async (req, res) => {
  try {
    const { command, parameters } = req.body;
    const result = await backend.handleCommand(command, parameters);
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CUA Cloud Backend listening on port ${PORT}`);
});
