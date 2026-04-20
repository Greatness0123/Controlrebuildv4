import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MainOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [effect, setEffect] = useState<string | null>(null);

  useEffect(() => {
    if (window.electronAPI) {
        window.electronAPI.ipcOn('show-visual-effect', (_: any, data: any) => {
            setEffect(data.type);
            setTimeout(() => setEffect(null), 3000);
        });

        window.electronAPI.ipcOn('floating-button-toggle', (_: any, visible: boolean) => {
            setIsVisible(visible);
        });
    }
  }, []);

  return (
    <div className="w-screen h-screen pointer-events-none relative overflow-hidden">
      {/* Edge Glow Effect */}
      <AnimatePresence>
        {effect === 'working' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 border-[6px] border-amber-500/30 blur-md pointer-events-none"
            style={{ boxShadow: 'inset 0 0 40px rgba(245, 158, 11, 0.2)' }}
          />
        )}
        {effect === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 border-[6px] border-green-500/30 blur-md pointer-events-none"
            style={{ boxShadow: 'inset 0 0 40px rgba(34, 197, 94, 0.2)' }}
          />
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <AnimatePresence>
        {isVisible && (
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-auto"
            >
                <button
                    onClick={() => window.electronAPI?.ipcInvoke('toggle-chat')}
                    className="w-12 h-24 bg-black/80 dark:bg-white/80 backdrop-blur-md rounded-l-3xl flex flex-col items-center justify-center gap-2 text-white dark:text-black border-l border-y border-white/10 dark:border-black/10 shadow-2xl hover:translate-x-[-4px] transition-transform group"
                >
                    <div className="w-1 h-8 bg-white/20 dark:bg-black/20 rounded-full overflow-hidden">
                        <motion.div
                            animate={{ y: [0, 24, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-full h-1/3 bg-white dark:bg-black"
                        />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tighter [writing-mode:vertical-lr] rotate-180">Control</span>
                </button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainOverlay;
