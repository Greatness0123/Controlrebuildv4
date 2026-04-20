export interface ChatAPI {
  executeTask: (task: any, mode: string) => Promise<any>;
  stopTask: () => Promise<any>;
  stopAction: () => Promise<any>;
  confirmAction: (confirmed: boolean) => Promise<any>;
  stopAudio: () => Promise<any>;
  onAIResponse: (callback: (event: any, data: any) => void) => void;
  onAIStream: (callback: (event: any, data: any) => void) => void;
  onTranscriptionResult: (callback: (event: any, data: any) => void) => void;
  onActionStart: (callback: (event: any, data: any) => void) => void;
  onActionStep: (callback: (event: any, data: any) => void) => void;
  onActionComplete: (callback: (event: any, data: any) => void) => void;
  onTaskStart: (callback: (event: any, data: any) => void) => void;
  onTaskComplete: (callback: (event: any, data: any) => void) => void;
  onTaskStopped: (callback: (event: any, data: any) => void) => void;
  onBackendError: (callback: (event: any, data: any) => void) => void;
  onWakewordError: (callback: (event: any, data: any) => void) => void;
  onAfterMessage: (callback: (event: any, data: any) => void) => void;
  onPlanUpdate: (callback: (event: any, data: any) => void) => void;
  onRequestConfirmation: (callback: (event: any, data: any) => void) => void;
  onAudioStarted: (callback: (event: any, data: any) => void) => void;
  onAudioStopped: (callback: (event: any, data: any) => void) => void;
  onWakeWordDetected: (callback: (event: any, data: any) => void) => void;
  setWakewordEnabled: (enabled: boolean) => Promise<boolean>;
  closeChat: () => Promise<any>;
  hideChat: () => Promise<any>;
  showChat: () => Promise<any>;
  showSettings: () => Promise<any>;
  dragWindow: (delta: { deltaX: number; deltaY: number }) => void;
  shouldSpeakGreeting: () => Promise<{ shouldSpeak: boolean }>;
  speakGreeting: (text: string) => Promise<any>;
  importSkill: () => Promise<any>;
  isAppLocked: () => Promise<{ locked: boolean }>;
  readBehaviors: () => Promise<{ behaviors: any[] }>;
  getSettings: () => Promise<any>;
  saveSettings: (settings: any) => Promise<any>;
  onSettingsUpdated: (callback: (event: any, settings: any) => void) => void;
  onUserDataUpdated: (callback: (event: any, userData: any) => void) => void;
  onUserChanged: (callback: (event: any, userData: any) => void) => void;
  onSkillsUpdated: (callback: (event: any) => void) => void;
  onAppInitialized: (callback: (event: any) => void) => void;
  onWorkflowStarted: (callback: (event: any, data: any) => void) => void;
  showWindow: (windowType: string) => Promise<any>;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    chatAPI: ChatAPI;
    settingsAPI: any;
    entryAPI: any;
    liteAPI: any;
    workflowAPI: any;
    overlayAPI: any;
    electronAPI: any;
  }
}
