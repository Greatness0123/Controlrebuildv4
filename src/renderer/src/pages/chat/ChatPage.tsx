import React, { useState, useEffect, useRef } from 'react';
import {
  History,
  Plus,
  Settings,
  Share2,
  Paperclip,
  Mic,
  ArrowUp,
  Square,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message as MessageType, Attachment, ActionStatus } from '../../types/chat';
import Message from '../../components/Message';
import ActionCard from '../../components/ActionCard';
import ThoughtBlock from '../../components/ThoughtBlock';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<'act' | 'ask'>('act');
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [status, setStatus] = useState({ text: 'Ready', type: 'ready' });
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(true);
  const [greeting, setGreeting] = useState('Control');

  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [activeActions, setActiveActions] = useState<ActionStatus[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const triggerInitial = async () => {
      if (window.chatAPI) {
        const s = await window.chatAPI.getSettings();
        const u = s?.userDetails?.firstName || s?.userDetails?.name;
        setGreeting(getDynamicGreeting(u));
      } else {
        // Fallback for development/testing outside Electron
        setGreeting(getDynamicGreeting());
      }
    };
    triggerInitial();
    const init = async () => {
      if (window.chatAPI) {
        window.chatAPI.onAIResponse((_, data) => {
          handleAIResponse(data);
        });

        window.chatAPI.onAIStream((_, data) => {
          handleAIStream(data);
        });

        window.chatAPI.onActionStart((_, data) => {
          const newAction: ActionStatus = {
            id: Date.now().toString(),
            text: data.description || 'Executing action...',
            status: 'running',
            task: currentTask || ''
          };
          setActiveActions(prev => [...prev, newAction]);
          setIsWelcomeVisible(false);
        });

        window.chatAPI.onActionComplete((_, data) => {
          setActiveActions(prev => prev.map(a =>
            a.text === data.description ? { ...a, status: data.success ? 'success' : 'error', details: data.details } : a
          ));
        });

        window.chatAPI.onTaskStart((_, data) => {
          setCurrentTask(data.task);
          setStatus({ text: 'Working on task...', type: 'working' });
          setIsWelcomeVisible(false);
        });

        window.chatAPI.onTaskComplete((_, data) => {
          setCurrentTask(null);
          setStatus({ text: 'Ready', type: 'ready' });
          setActiveActions([]);
        });

        window.chatAPI.onTaskStopped((_, data) => {
          setCurrentTask(null);
          setStatus({ text: 'Ready', type: 'ready' });
          setActiveActions([]);
        });

        window.chatAPI.onAudioStarted(() => setIsAudioPlaying(true));
        window.chatAPI.onAudioStopped(() => setIsAudioPlaying(false));

        window.chatAPI.onAppInitialized(async () => {
            const initialSettings = await window.chatAPI.getSettings();
            const userName = initialSettings?.userDetails?.firstName || initialSettings?.userDetails?.name;
            const dynamicGreeting = getDynamicGreeting(userName);
            setGreeting(dynamicGreeting);

            // TTS logic for greeting
            try {
              const isLocked = await window.chatAPI.isAppLocked?.();
              if (isLocked && isLocked.locked) return;

              const result = await window.chatAPI.shouldSpeakGreeting();
              if (result && result.shouldSpeak) {
                  window.chatAPI.speakGreeting(dynamicGreeting);
              }
            } catch (err) {
              console.error('Error checking greeting TTS setting:', err);
            }
        });
      }
    };

    init();
    return () => {
        if (window.chatAPI) {
            window.chatAPI.removeAllListeners('ai-response');
            window.chatAPI.removeAllListeners('ai-stream');
            window.chatAPI.removeAllListeners('action-start');
            window.chatAPI.removeAllListeners('action-complete');
            window.chatAPI.removeAllListeners('task-start');
            window.chatAPI.removeAllListeners('task-complete');
        }
    };
  }, [currentTask]);

  useEffect(() => {
    const triggerInitial = async () => {
      const s = await window.chatAPI.getSettings();
      const u = s?.userDetails?.firstName || s?.userDetails?.name;
      setGreeting(getDynamicGreeting(u));
    };
    triggerInitial();
    scrollToBottom();
  }, [messages, activeActions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAIResponse = (data: any) => {
    setStreamingMessageId(null);
    const content = data.text || data.message || '';
    if (!content.trim()) return;

    setMessages(prev => {
        // If there was a streaming message, update it, otherwise add new
        const streamingIdx = prev.findIndex(m => m.id === 'streaming');
        if (streamingIdx !== -1) {
            const updated = [...prev];
            updated[streamingIdx] = {
                ...updated[streamingIdx],
                id: Date.now().toString(),
                text: content,
                isFinal: true
            };
            return updated;
        }
        return [...prev, {
            id: Date.now().toString(),
            sender: 'ai',
            text: content,
            timestamp: new Date().toISOString(),
            isFinal: true
        }];
    });
    setIsWelcomeVisible(false);
  };

  const handleAIStream = (data: any) => {
    if (!data.chunk) return;

    setMessages(prev => {
        const streamingIdx = prev.findIndex(m => m.id === 'streaming');
        if (streamingIdx !== -1) {
            const updated = [...prev];
            updated[streamingIdx] = {
                ...updated[streamingIdx],
                text: updated[streamingIdx].text + data.chunk
            };
            return updated;
        } else {
            return [...prev, {
                id: 'streaming',
                sender: 'ai',
                text: data.chunk,
                timestamp: new Date().toISOString()
            }];
        }
    });
    setStreamingMessageId('streaming');
    setIsWelcomeVisible(false);
  };

  const sendMessage = async () => {
    if (currentTask || isAudioPlaying) {
        window.chatAPI?.stopAction();
        return;
    }

    if (!inputText.trim() && attachments.length === 0) return;

    const userMessage: MessageType = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toISOString(),
      attachments: [...attachments]
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setAttachments([]);
    setIsWelcomeVisible(false);
    setStatus({ text: 'Thinking...', type: 'working' });

    if (window.chatAPI) {
        window.chatAPI.executeTask({
            text: userMessage.text,
            attachments: userMessage.attachments?.map(a => ({
                name: a.name,
                type: a.type,
                size: a.size,
                data: a.data
            }))
        }, mode);
    }
  };

  const getDynamicGreeting = (userName?: string) => {
    const hour = new Date().getHours();
    const simpleGreetings = [
        "I'm ready when you are",
        "How are you?",
        "let's begin",
        "let's continue",
        "Ready to help",
        "What's the plan?",
        "Let's get to work"
    ];

    let greetingText = "";
    const useTimeBased = Math.random() > 0.4;

    if (useTimeBased) {
        if (hour >= 5 && hour < 12) {
            greetingText = Math.random() > 0.5 ? "Good morning" : "How was your night?";
        } else if (hour >= 12 && hour < 17) {
            greetingText = "Good afternoon";
        } else if (hour >= 17 && hour < 22) {
            greetingText = "Good evening";
        } else {
            greetingText = Math.random() > 0.5 ? "Aren't you going to sleep?" : "No sleep?";
        }
    } else {
        greetingText = simpleGreetings[Math.floor(Math.random() * simpleGreetings.length)];
    }

    if (userName) {
        if (greetingText.endsWith("?")) {
            return `${userName}, ${greetingText.toLowerCase()}`;
        } else {
            return `${greetingText}, ${userName}!`;
        }
    } else {
        return greetingText.endsWith("?") ? greetingText : `${greetingText}!`;
    }
  };

  const toggleRecording = () => {
      setIsRecording(!isRecording);
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-gray-100 rounded-xl border border-border overflow-hidden relative shadow-2xl">
      {/* Header */}
      <header className="p-3 border-b border-border flex justify-between items-center bg-white/80 dark:bg-[#0d0d0d]/80 backdrop-blur-md z-10 drag">
        <div className="flex items-center gap-2 no-drag">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-black dark:hover:text-white">
            <History size={18} />
          </button>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-black dark:hover:text-white"
            onClick={() => setMessages([])}
          >
            <Plus size={18} />
          </button>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-full ml-2 border border-gray-200 dark:border-gray-700">
            <button
              className={`px-4 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all ${mode === 'act' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-400'}`}
              onClick={() => setMode('act')}
            >
              ACT
            </button>
            <button
              className={`px-4 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all ${mode === 'ask' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-400'}`}
              onClick={() => setMode('ask')}
            >
              ASK
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 no-drag">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-black dark:hover:text-white" onClick={() => window.chatAPI?.showWindow('workflow')}>
            <Share2 size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-black dark:hover:text-white" onClick={() => window.chatAPI?.showSettings()}>
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 scroll-smooth no-scrollbar">
        <AnimatePresence>
            {isWelcomeVisible && messages.length === 0 && (
            <motion.div
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col items-center justify-center text-center opacity-80"
            >
                <motion.img
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src="/icons/icon-removebg-preview.png"
                    className="w-16 h-16 mb-4 grayscale contrast-125 dark:invert dark:contrast-100"
                />
                <motion.h2
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-black tracking-tighter"
                >
                    {greeting}
                </motion.h2>
                <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-2"
                >
                    Universal Desktop Agent
                </motion.p>
            </motion.div>
            )}
        </AnimatePresence>

        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}

        {/* Current Active Actions */}
        <div className="flex flex-col gap-1">
            {activeActions.map(action => (
                <ActionCard key={action.id} action={action} />
            ))}
        </div>

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-[#0d0d0d] border-t border-border/50">
        <div className="relative bg-gray-50 dark:bg-gray-900 border border-border rounded-[2rem] p-2 flex items-end gap-2 focus-within:border-gray-400 dark:focus-within:border-gray-600 transition-all shadow-sm">
          <button className="p-2.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-black dark:hover:text-white">
            <Paperclip size={18} />
          </button>
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => {
                setInputText(e.target.value);
                // auto resize
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            }}
            placeholder={mode === 'act' ? "Give a task..." : "Ask a question..."}
            className="flex-1 bg-transparent border-none outline-none resize-none py-2.5 text-[13px] max-h-32 placeholder:text-gray-400 font-medium leading-relaxed"
          />
          <div className="flex items-center gap-1.5 p-1">
              <button
                className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400 hover:text-black dark:hover:text-white'}`}
                onClick={toggleRecording}
              >
                <Mic size={18} />
              </button>
              <button
                className={`p-2 rounded-full transition-all flex items-center justify-center ${
                    inputText.trim() || attachments.length > 0 || currentTask || isAudioPlaying
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg hover:scale-105 active:scale-95'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!inputText.trim() && attachments.length === 0 && !currentTask && !isAudioPlaying}
                onClick={sendMessage}
              >
                {currentTask || isAudioPlaying ? <Square size={16} fill="currentColor" /> : <ArrowUp size={16} strokeWidth={3} />}
              </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-3 flex justify-end px-2">
            <div className="flex items-center gap-2 text-[9px] text-gray-400 font-black uppercase tracking-[0.15em]">
                <span className="opacity-50">{status.text}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${
                    status.type === 'ready' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' :
                    status.type === 'working' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse' :
                    'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                }`} />
            </div>
        </div>
      </div>

      <style>{`
        .drag { -webkit-app-region: drag; }
        .no-drag { -webkit-app-region: no-drag; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default ChatPage;
