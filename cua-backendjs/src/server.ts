import * as http from 'http';
import * as WebSocket from 'ws';
import { CuaBackend } from './index';

/**
 * Port of Coasty's AI Desktop Agent Server
 * Provides a WebSocket interface for the CUA Backend
 */
export class CuaServer {
  private wss: WebSocket.Server;
  private backend: CuaBackend;

  constructor(port: number = 8080) {
    this.wss = new WebSocket.Server({ port });
    this.backend = new CuaBackend();

    this.wss.on('connection', (ws) => {
      console.log('New client connected to CUA JS Backend');

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          const { type, data: commandData } = data;

          if (type === 'command') {
            const result = await this.backend.handleCommand(
              commandData.command,
              commandData.parameters
            );
            ws.send(JSON.stringify({ type: 'result', data: result }));
          } else if (type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          }
        } catch (e) {
          ws.send(JSON.stringify({ type: 'error', data: { error: (e as Error).message } }));
        }
      });
    });

    console.log(`CUA JS Backend Server listening on ws://0.0.0.0:${port}`);
  }
}

// Start the server if run directly
if (require.main === module) {
  new CuaServer();
}
