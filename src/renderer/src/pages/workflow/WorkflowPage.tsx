import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, Trash2, X, ChevronRight, Zap } from 'lucide-react';

const WorkflowPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);

  useEffect(() => {
    const loadWorkflows = async () => {
        if (window.electronAPI) {
            const res = await window.electronAPI.ipcInvoke('get-all-workflows');
            setWorkflows(res || []);
        }
    };
    loadWorkflows();
  }, []);

  return (
    <div className="flex h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 rounded-xl border border-border overflow-hidden shadow-2xl">
      <main className="flex-1 flex flex-col min-w-0">
        <header className="p-6 border-b border-border flex justify-between items-center drag">
          <div className="no-drag">
              <h1 className="text-xl font-black tracking-tight uppercase">Workflows</h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Automated Task Sequences</p>
          </div>
          <div className="flex items-center gap-3 no-drag">
              <button className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold hover:opacity-90 transition-opacity">
                  <Plus size={16} /> New Workflow
              </button>
              <button
                onClick={() => window.chatAPI?.showWindow('chat')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-black dark:hover:text-white"
              >
                <X size={20} />
              </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            {workflows.map((wf) => (
              <motion.div
                key={wf.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group p-5 bg-gray-50 dark:bg-gray-900 border border-border rounded-2xl hover:border-black dark:hover:border-white transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-white dark:bg-black rounded-xl flex items-center justify-center border border-border shadow-sm">
                        <Zap size={20} className="text-amber-500" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white dark:hover:bg-black rounded-lg text-gray-500 hover:text-black dark:hover:text-white border border-transparent hover:border-border shadow-sm transition-all">
                            <Play size={14} fill="currentColor" />
                        </button>
                        <button className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-500 border border-transparent hover:border-red-500/20 shadow-sm transition-all">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
                <h3 className="font-bold text-sm mb-1">{wf.name}</h3>
                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{wf.description || 'No description provided.'}</p>

                <div className="mt-4 flex items-center gap-2">
                    <div className="px-2 py-0.5 bg-white dark:bg-black border border-border rounded-full text-[9px] font-black uppercase tracking-tighter text-gray-400">
                        {wf.steps?.length || 0} Steps
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${wf.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              </motion.div>
            ))}

            {workflows.length === 0 && (
                <div className="col-span-2 py-20 flex flex-col items-center justify-center text-center opacity-40">
                    <Zap size={48} className="mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">No workflows found</p>
                    <p className="text-[10px] mt-2 max-w-[200px]">Create your first automated sequence to get started.</p>
                </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .drag { -webkit-app-region: drag; }
        .no-drag { -webkit-app-region: no-drag; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default WorkflowPage;
