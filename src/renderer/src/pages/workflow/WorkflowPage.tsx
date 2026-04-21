import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Play,
  Trash2,
  X,
  ChevronRight,
  Zap,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  Star,
  LayoutGrid,
  List,
  Edit2,
  Copy,
  Settings,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';

const WorkflowPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'starred'>('all');

  useEffect(() => {
    const loadWorkflows = async () => {
        if (window.electronAPI) {
            const res = await window.electronAPI.ipcInvoke('get-all-workflows');
            setWorkflows(res || []);
        }
    };
    loadWorkflows();
  }, []);

  const filteredWorkflows = workflows.filter(wf =>
    wf.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (activeTab === 'all' || (activeTab === 'scheduled' && wf.trigger?.type === 'time'))
  );

  const selectedWorkflow = workflows.find(wf => wf.id === selectedId);

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-neutral-200 rounded-xl border border-neutral-800 overflow-hidden shadow-2xl font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-neutral-800 flex flex-col bg-[#090909]">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <Zap size={18} className="text-black fill-black" />
            </div>
            <h1 className="text-sm font-bold tracking-tight uppercase text-white">Workflows</h1>
          </div>

          <nav className="space-y-1">
            <SidebarItem
              icon={Activity}
              label="All Workflows"
              active={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
              count={workflows.length}
            />
            <SidebarItem
              icon={Clock}
              label="Scheduled"
              active={activeTab === 'scheduled'}
              onClick={() => setActiveTab('scheduled')}
              count={workflows.filter(w => w.trigger?.type === 'time').length}
            />
            <SidebarItem
              icon={Star}
              label="Starred"
              active={activeTab === 'starred'}
              onClick={() => setActiveTab('starred')}
              count={0}
            />
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-neutral-800/50">
          <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-800/50">
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Resource Usage</div>
            <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
               <div className="w-1/3 h-full bg-emerald-500 rounded-full" />
            </div>
            <div className="flex justify-between mt-2 text-[9px] text-neutral-600 font-medium">
               <span>3 Workflows active</span>
               <span>33%</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0d0d0d]">
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 drag">
          <div className="flex items-center gap-4 no-drag flex-1 max-w-xl">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" size={14} />
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-neutral-600 transition-colors"
                />
             </div>
             <div className="flex border border-neutral-800 rounded-lg p-0.5 bg-neutral-950">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn("p-1 rounded", viewMode === 'grid' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300")}
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn("p-1 rounded", viewMode === 'list' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300")}
                >
                  <List size={14} />
                </button>
             </div>
          </div>

          <div className="flex items-center gap-3 no-drag ml-4">
              <button className="flex items-center gap-2 px-4 py-1.5 bg-white text-black rounded-lg text-xs font-bold hover:bg-neutral-200 transition-all shadow-sm active:scale-95">
                  <Plus size={14} strokeWidth={3} /> New Workflow
              </button>
              <button
                onClick={() => window.chatAPI?.showWindow('chat')}
                className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-500 hover:text-white"
              >
                <X size={18} />
              </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <div className={cn(
            viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-3"
          )}>
            {filteredWorkflows.map((wf) => (
              <WorkflowCard
                key={wf.id}
                workflow={wf}
                viewMode={viewMode}
                selected={selectedId === wf.id}
                onClick={() => setSelectedId(wf.id === selectedId ? null : wf.id)}
              />
            ))}

            {filteredWorkflows.length === 0 && (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-30">
                    <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-6">
                       <Zap size={32} className="text-neutral-600" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">No workflows found</p>
                    <p className="text-[10px] mt-2 max-w-[240px] text-neutral-500">
                      Refine your search or create a new automated sequence to get started.
                    </p>
                </div>
            )}
          </div>
        </div>
      </main>

      {/* Right Properties Panel */}
      <AnimatePresence>
        {selectedWorkflow && (
          <motion.aside
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-80 border-l border-neutral-800 bg-[#090909] flex flex-col shadow-2xl z-20"
          >
            <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
               <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center border border-neutral-800">
                     <Zap size={24} className="text-amber-500" />
                  </div>
                  <div className="flex gap-1">
                     <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-colors">
                        <Edit2 size={16} />
                     </button>
                     <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-colors">
                        <MoreHorizontal size={16} />
                     </button>
                  </div>
               </div>

               <h2 className="text-lg font-bold text-white mb-1">{selectedWorkflow.name}</h2>
               <p className="text-xs text-neutral-500 leading-relaxed mb-8">{selectedWorkflow.description || 'No description provided.'}</p>

               <div className="space-y-6">
                  <PropertySection title="Trigger">
                     <div className="flex items-center gap-3 bg-neutral-900/50 p-3 rounded-xl border border-neutral-800/50">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                           {selectedWorkflow.trigger?.type === 'time' ? <Clock size={16} className="text-indigo-400" /> : <Activity size={16} className="text-indigo-400" />}
                        </div>
                        <div>
                           <div className="text-[11px] font-bold text-white capitalize">{selectedWorkflow.trigger?.type || 'Manual'}</div>
                           <div className="text-[10px] text-neutral-500">{selectedWorkflow.trigger?.value || 'On Demand'}</div>
                        </div>
                     </div>
                  </PropertySection>

                  <PropertySection title="Steps">
                     <div className="space-y-2">
                        {selectedWorkflow.steps?.map((step: any, i: number) => (
                           <div key={i} className="flex items-start gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-900 group">
                              <div className="text-[10px] font-bold text-neutral-700 w-4 pt-0.5">{i + 1}</div>
                              <div className="flex-1">
                                 <div className="text-[11px] font-bold text-neutral-300 capitalize mb-0.5">{step.type}</div>
                                 <div className="text-[10px] text-neutral-500 truncate max-w-[180px]">{step.value}</div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </PropertySection>
               </div>
            </div>

            <div className="p-6 border-t border-neutral-800/50 flex gap-3">
               <button
                  onClick={() => window.electronAPI?.ipcInvoke('execute-workflow', selectedWorkflow.id)}
                  className="flex-1 bg-white text-black py-2.5 rounded-xl text-xs font-bold hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
               >
                  <Play size={14} fill="currentColor" /> Run Now
               </button>
               <button className="p-2.5 bg-neutral-900 text-neutral-400 rounded-xl hover:bg-neutral-800 transition-colors border border-neutral-800">
                  <Settings size={16} />
               </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <style>{`
        .drag { -webkit-app-region: drag; }
        .no-drag { -webkit-app-region: no-drag; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick, count }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group",
      active ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
    )}
  >
    <div className="flex items-center gap-3">
       <Icon size={16} className={cn("transition-colors", active ? "text-white" : "text-neutral-600 group-hover:text-neutral-400")} />
       <span className="text-xs font-medium">{label}</span>
    </div>
    {count !== undefined && (
      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md", active ? "bg-neutral-700 text-neutral-300" : "bg-neutral-900 text-neutral-600")}>
        {count}
      </span>
    )}
  </button>
);

const PropertySection = ({ title, children }: any) => (
  <div>
    <h3 className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-3">{title}</h3>
    {children}
  </div>
);

const WorkflowCard = ({ workflow, viewMode, selected, onClick }: any) => {
  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className={cn(
          "flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer group",
          selected ? "bg-neutral-800 border-neutral-600" : "bg-neutral-900/40 border-neutral-800/50 hover:border-neutral-700 hover:bg-neutral-900/60"
        )}
      >
        <div className="w-10 h-10 bg-neutral-950 rounded-lg flex items-center justify-center shrink-0 border border-neutral-800 shadow-sm">
          <Zap size={18} className="text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-white truncate">{workflow.name}</h3>
          <p className="text-[10px] text-neutral-500 truncate">{workflow.description || 'No description'}</p>
        </div>
        <div className="flex items-center gap-3 px-4">
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-tight">{workflow.steps?.length || 0} Steps</span>
              <span className="text-[9px] text-neutral-500">{workflow.trigger?.type || 'Manual'}</span>
           </div>
           <div className={cn("w-1.5 h-1.5 rounded-full", workflow.enabled ? "bg-emerald-500" : "bg-neutral-700")} />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "group p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col h-48",
        selected ? "bg-neutral-800 border-neutral-500 ring-1 ring-neutral-500/20 shadow-xl" : "bg-neutral-900/40 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60 shadow-sm"
      )}
    >
      <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 bg-neutral-950 rounded-xl flex items-center justify-center border border-neutral-800 shadow-sm transition-transform group-hover:scale-110">
              <Zap size={20} className="text-amber-500" />
          </div>
          <div className={cn("px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tight", workflow.enabled ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-neutral-800 text-neutral-500 border border-neutral-700")}>
            {workflow.enabled ? 'Active' : 'Disabled'}
          </div>
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-sm mb-1.5 text-white group-hover:text-white transition-colors">{workflow.name}</h3>
        <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed group-hover:text-neutral-400 transition-colors">
          {workflow.description || 'No description provided.'}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-800/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-neutral-950 flex items-center justify-center border border-neutral-800">
                 <Activity size={10} className="text-neutral-600" />
              </div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">
                  {workflow.steps?.length || 0} Steps
              </span>
          </div>
          <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-all">
             <Play size={14} fill="currentColor" />
          </button>
      </div>
    </div>
  );
};

export default WorkflowPage;
