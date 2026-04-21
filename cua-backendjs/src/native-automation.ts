import { exec, spawn, execFile } from 'child_process';
import * as os from 'os';

/**
 * Native Automation Engine
 * Ported from Coasty's Swift/PowerShell/xdotool implementations
 * Provides high-performance, platform-native interaction
 */
export class NativeAutomation {

  async click(x: number, y: number, button: 'left' | 'right' = 'left') {
    if (os.platform() === 'darwin') {
      const downType = button === 'right' ? '.rightMouseDown' : '.leftMouseDown';
      const upType = button === 'right' ? '.rightMouseUp' : '.leftMouseUp';
      const btn = button === 'right' ? '.right' : '.left';

      const swiftCode = `
import Cocoa
let pt = CGPoint(x: ${x}, y: ${y})
CGEvent(mouseEventSource: nil, mouseType: ${downType}, mouseCursorPosition: pt, mouseButton: ${btn})?.post(tap: .cghidEventTap)
usleep(50000)
CGEvent(mouseEventSource: nil, mouseType: ${upType}, mouseCursorPosition: pt, mouseButton: ${btn})?.post(tap: .cghidEventTap)
`;
      return this.runSwift(swiftCode);
    } else if (os.platform() === 'win32') {
      const clickType = button === 'right' ? 'RightClick' : 'Click';
      const psScript = `
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y})
# ... (rest of user32.dll mouse_event logic)
`;
      return this.runPowershell(psScript);
    } else {
      return this.runBash(`xdotool mousemove ${x} ${y} click ${button === 'right' ? '3' : '1'}`);
    }
  }

  async type(text: string) {
    if (os.platform() === 'darwin') {
      return this.runOsascript(`tell application "System Events" to keystroke "${text.replace(/"/g, '\\"')}"`);
    } else if (os.platform() === 'win32') {
      return this.runPowershell(`[System.Windows.Forms.SendKeys]::SendWait('${text.replace(/'/g, "''")}')`);
    } else {
      return this.runBash(`xdotool type --clearmodifiers -- "${text.replace(/"/g, '\\"')}"`);
    }
  }

  private runSwift(code: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn('swift', ['-']);
      let stdout = '';
      proc.stdout.on('data', (d) => { stdout += d; });
      proc.on('close', () => resolve(stdout.trim()));
      proc.stdin.write(code);
      proc.stdin.end();
    });
  }

  private runPowershell(script: string): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile('powershell.exe', ['-NoProfile', '-Command', script], (err, stdout) => {
        if (err) reject(err);
        else resolve(stdout.trim());
      });
    });
  }

  private runBash(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(command, (err, stdout) => {
        if (err) reject(err);
        else resolve(stdout.trim());
      });
    });
  }

  private runOsascript(script: string): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile('/usr/bin/osascript', ['-e', script], (err, stdout) => {
        if (err) reject(err);
        else resolve(stdout.trim());
      });
    });
  }
}
