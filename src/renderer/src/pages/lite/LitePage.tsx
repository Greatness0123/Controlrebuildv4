import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, ArrowUp, MoreHorizontal, ChevronUp, ChevronDown } from 'lucide-react';

const LitePage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  return (
    <div className="h-screen flex flex-col justify-end p-6 pointer-events-none">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-4 pointer-events-auto">
        <AnimatePresence>
            {showMessages && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="bg-white dark:bg-[#0d0d0d] border border-border rounded-3xl p-4 shadow-2xl max-h-[40vh] overflow-y-auto no-scrollbar"
                >
                    <div className="space-y-3">
                        {messages.map((m, i) => (
                            <div key={i} className={`text-sm ${m.sender === 'user' ? 'text-gray-400' : 'text-gray-800 dark:text-gray-100 font-medium'}`}>
                                {m.text}
                            </div>
                        ))}
                        {messages.length === 0 && <p className="text-center text-xs text-gray-500 font-bold uppercase tracking-widest py-4">No recent activity</p>}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="bg-white dark:bg-[#0d0d0d] border border-border rounded-[2.5rem] p-2 flex items-center gap-2 shadow-2xl">
            <button
                onClick={() => setShowMessages(!showMessages)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400"
            >
                {showMessages ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Give a task..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium px-2 py-3"
            />
            <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
                <Mic size={20} />
            </button>
            <button className="p-3 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg">
                <ArrowUp size={20} strokeWidth={3} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default LitePage;
