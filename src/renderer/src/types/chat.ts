export type MessageSender = 'user' | 'ai';

export interface Attachment {
  name: string;
  size: number;
  type: string;
  data?: number[];
  thumbnail?: string;
}

export interface ActionStatus {
  id: string;
  text: string;
  status: 'running' | 'success' | 'error' | 'pending';
  details?: string;
  task?: string;
}

export interface Thought {
  id: string;
  text: string;
  isCollapsed: boolean;
}

export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
  html?: string;
  timestamp: string;
  attachments?: Attachment[];
  isAction?: boolean;
  isFinal?: boolean;
  thoughts?: Thought[];
  actions?: ActionStatus[];
}
