# Backend Comparison: Control (Node.js) vs. Coasty (Python)

This document provides an objective comparison between the existing Control `act-backend.js` and the Coasty `ai_agent_server.py` (open-computer-use), along with recommendations for improvement.

## 1. Architectural Differences

| Feature | Control (`act-backend.js`) | Coasty (`ai_agent_server.py`) |
|---------|---------------------------|------------------------------|
| **Runtime** | Node.js (Electron Main Process) | Python (Standalone Server) |
| **Automation** | `nut-js` | `pyautogui` |
| **Screenshot** | `screenshot-desktop` | `mss` (Faster) + fallback methods |
| **Browser** | Electron `browserView` + JS Injection | Selenium + Stealth (Anti-detection) |
| **Terminal** | Stateless `exec` | Persistent Subprocess + Buffer |
| **Environment** | Local Desktop | Docker/Linux Container (VNC/X11) |

## 2. Strengths of Coasty (Why it might be "better" in some areas)

*   **Speed (Screenshots)**: Coasty uses `mss`, which is significantly faster at capturing the screen than `screenshot-desktop`. This reduces the latency between agent actions.
*   **Computer Vision (CV)**: Coasty includes built-in OpenCV logic to detect UI elements (buttons, inputs) without sending the image to an AI first. This allows for "grounded" actions where the agent knows exactly where it's clicking based on local code.
*   **Persistent Terminal**: Coasty maintains a running shell process. In Control, every `terminal` action is a fresh `exec` command, meaning environment variables or directory changes (like `cd`) don't persist unless handled manually.
*   **Stealth Browser**: Coasty's Selenium implementation is designed to bypass bot detection (StealthBrowser), whereas Control's Electron-based browser is easier for websites to detect as an automated tool.
*   **OCR Reliability**: By using Tesseract locally before sending to AI, Coasty can provide the AI with a "text map" of the screen, improving accuracy in reading small text.

## 3. Strengths of Control (Where it outmatches Coasty)

*   **Integration**: Control is built directly into Electron. It has better access to the actual desktop environment and system-level APIs without needing a VNC/X11 bridge.
*   **Agentic Loop**: `act-backend.js` contains a sophisticated task-state tracking system (steps, progress, estimation) which is very user-friendly.
*   **Multi-Model Support**: Control natively supports Gemini, Anthropic, Ollama, and various OpenRouter models with built-in token tracking and citation formatting.
*   **Simplicity**: It doesn't require a complex Python environment or Docker container to run.

## 4. Recommendations for Improvement

### Immediate Improvements to Control's Backend:
1.  **Switch to MSS for Screenshots**: Integrate a Node.js wrapper for MSS or improve `screenshot-desktop` performance.
2.  **Stateful Terminal**: Replace `exec` with `node-pty` to allow for persistent terminal sessions (standard in IDEs like VS Code).
3.  **Local Vision Pass**: Implement a simple OpenCV or OCR pass in JS (using `tesseract.js` or `opencv4nodejs`) to give the AI "visual hints" before it makes a decision.
4.  **Hierarchical DOM Access**: Port Coasty's `get_browser_dom_elements` logic to Control's browser manager to provide the AI with a clean, text-only view of the webpage instead of just raw screenshots.

### Conversion Strategy:
I will now create the `cua-backendjs` directory, which will contain a Node.js/TypeScript port of Coasty's most powerful features:
*   The CV-based element detection.
*   The stealth browser logic.
*   The persistent terminal/process management.
