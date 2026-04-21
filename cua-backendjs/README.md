# CUA Backend JavaScript (CUA-JS)

This directory contains a port of the `open-computer-use` (Coasty) Python backend logic to JavaScript/TypeScript.

## Comparison: Python vs. JavaScript

### Python (Original)
- **Strengths**: Native libraries like `pyautogui`, `opencv-python`, and `mss` are highly optimized for OS-level interactions and computer vision. Better community support for data science and AI workflows.
- **Weaknesses**: Harder to bundle into a cross-platform desktop app (requires a Python interpreter, heavy dependencies). Higher memory footprint when running alongside an Electron app.

### JavaScript (Port)
- **Strengths**: Seamless integration with Electron's main process. Shared memory space with the frontend. Easier to distribute as a single executable. Better concurrency model for handling multiple WebSocket connections or async browser tasks.
- **Weaknesses**: Lacks the deep CV library ecosystem of Python (e.g., OpenCV in JS is often a wrapper or limited). System-level automation (mouse/keyboard) often relies on external C++ addons which can be brittle across Node versions.

## Verdict
For **local desktop agents**, the **JavaScript** code is better because it avoids the "two-runtime" problem (Node + Python) and reduces the final application size. However, for **high-performance vision tasks** (like real-time element detection on 4K screens), the **Python** backend still holds a slight edge due to better low-level optimizations.

## Getting Started
1. `cd cua-backendjs`
2. `npm install`
3. `npm run build`
