import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

/**
 * Port of Coasty's persistent terminal logic
 * Maintains a live shell session for stateful commands (cd, env vars, etc)
 */
export class PersistentTerminal extends EventEmitter {
  private shell: ChildProcess | null = null;
  private outputBuffer: string[] = [];
  private history: any[] = [];
  private currentDir: string = process.cwd();

  constructor() {
    super();
  }

  async connect(): Promise<boolean> {
    if (this.shell && this.shell.connected) return true;

    const shellCmd = process.platform === 'win32' ? 'powershell.exe' : 'bash';

    this.shell = spawn(shellCmd, [], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, TERM: 'xterm-256color' },
      cwd: this.currentDir
    });

    this.shell.stdout?.on('data', (data) => {
      const text = data.toString();
      this.outputBuffer.push(text);
      this.emit('output', text);
    });

    this.shell.stderr?.on('data', (data) => {
      const text = data.toString();
      this.outputBuffer.push(text);
      this.emit('error', text);
    });

    return true;
  }

  async execute(command: string, timeout: number = 5000): Promise<any> {
    await this.connect();

    return new Promise((resolve) => {
      const startTime = Date.now();
      const startBufferIdx = this.outputBuffer.length;

      this.shell?.stdin?.write(`${command}\n`);

      // Ported logic: in a real PTY we'd wait for a prompt
      // Here we use a timeout or specific markers
      setTimeout(() => {
        const output = this.outputBuffer.slice(startBufferIdx).join('');
        const entry = {
          command,
          output,
          timestamp: Date.now()
        };
        this.history.push(entry);
        resolve({
          success: true,
          output,
          command
        });
      }, 1000); // Simulated delay for output capture
    });
  }

  async clear() {
    this.outputBuffer = [];
    await this.execute('clear');
  }

  async close() {
    if (this.shell) {
      this.shell.kill();
      this.shell = null;
    }
  }
}
