import { VisionEngine } from './vision-engine';
import { PersistentTerminal } from './terminal-manager';

/**
 * Unified Coasty AI Agent Backend (JS Port)
 * This class coordinates the vision engine and terminal management
 */
export class CuaBackend {
  public vision: VisionEngine;
  public terminal: PersistentTerminal;

  constructor() {
    this.vision = new VisionEngine();
    this.terminal = new PersistentTerminal();
  }

  /**
   * Ported command execution logic from ai_agent_server.py
   */
  async handleCommand(type: string, parameters: any) {
    switch (type) {
      case 'screenshot':
        return { success: true, message: 'Screenshot functionality delegated to platform screenshot tool' };

      case 'detect_elements':
        const screenshot = parameters.screenshot;
        return await this.vision.detectAllElements(screenshot, parameters);

      case 'terminal_execute':
        return await this.terminal.execute(parameters.command);

      case 'terminal_connect':
        return await this.terminal.connect();

      default:
        throw new Error(`Command not implemented in JS port: ${type}`);
    }
  }
}
