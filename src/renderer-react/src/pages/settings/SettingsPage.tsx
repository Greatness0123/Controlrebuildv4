import React, { useState, useEffect } from 'react';
import {
  User,
  Palette,
  Brain,
  Mic,
  Shield,
  Monitor,
  Keyboard as KeyboardIcon,
  Book,
  Settings as SettingsIcon,
  X,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  Zap,
  Trash2,
  Power
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const tabs = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'providers', label: 'AI Providers', icon: Brain },
  { id: 'voice', label: 'Voice & Audio', icon: Mic },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'remote', label: 'Remote Access', icon: Monitor },
  { id: 'shortcuts', label: 'Shortcuts', icon: KeyboardIcon },
  { id: 'skills', label: 'Skills', icon: Book },
  { id: 'system', label: 'System', icon: SettingsIcon },
];

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState<any>({});
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (window.chatAPI) {
        const s = await window.chatAPI.getSettings();
        setSettings(s);
      }
      if (window.settingsAPI) {
          const u = await window.settingsAPI.getCurrentUser();
          setUser(u);
      }
    };
    loadData();
  }, []);

  const closeSettings = () => {
    if (window.chatAPI) {
        window.chatAPI.showWindow('chat');
        window.chatAPI.hideChat(); // Or just hide the settings window
    }
    // Logic to close via Electron
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 rounded-xl border border-border overflow-hidden shadow-2xl">
      {/* Sidebar */}
      <aside className="w-[70px] border-r border-border bg-gray-50 dark:bg-[#121212] flex flex-col items-center py-6 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-xl transition-all relative group ${
                activeTab === tab.id
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
                  : 'text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              <div className="absolute left-16 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {tab.label}
              </div>
              {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute left-0 w-1 h-6 bg-black dark:bg-white rounded-r-full" />
              )}
            </button>
          );
        })}
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="p-6 border-b border-border flex justify-between items-center drag">
          <h1 className="text-xl font-black tracking-tight uppercase no-drag">
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
          <button
            onClick={() => window.chatAPI?.hideChat()} // Actually hide the current window
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors no-drag text-gray-400 hover:text-black dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-900 border border-border p-6 rounded-2xl flex items-center gap-6">
                    <div className="w-20 h-20 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black text-3xl font-black">
                      {user?.name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold">{user?.name || 'Control User'}</h2>
                      <p className="text-sm text-gray-500">{user?.email || 'user@control.ai'}</p>
                      <div className="mt-3 inline-block px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black rounded-full uppercase tracking-widest">
                        {user?.plan || 'Free Plan'}
                      </div>
                    </div>
                    <button className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all text-gray-500">
                      <LogOut size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      {[
                          { label: 'ACT Usage', value: `${user?.actCount || 0} / 200` },
                          { label: 'ASK Usage', value: `${user?.askCount || 0} / 500` },
                          { label: 'Total Tokens', value: user?.totalTokens?.toLocaleString() || '0' },
                          { label: 'Daily Tokens', value: '1,240' },
                      ].map((stat, i) => (
                        <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900 border border-border rounded-2xl">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                        <Palette size={14} /> Theme
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900 border border-border rounded-2xl divide-y divide-border">
                        <div className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold">Dark Mode</p>
                                <p className="text-[11px] text-gray-500">Switch between light and dark themes</p>
                            </div>
                            <button
                                onClick={() => setSettings({...settings, theme: settings.theme === 'dark' ? 'light' : 'dark'})}
                                className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative p-1 transition-colors"
                            >
                                <motion.div
                                    animate={{ x: settings.theme === 'dark' ? 24 : 0 }}
                                    className="w-4 h-4 bg-white dark:bg-black rounded-full shadow-sm"
                                />
                            </button>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold">Border Streak Effect</p>
                                <p className="text-[11px] text-gray-500">Animated light streak along window borders</p>
                            </div>
                            <button className="w-12 h-6 bg-black dark:bg-white rounded-full relative p-1 transition-colors">
                                <div className="w-4 h-4 bg-white dark:bg-black rounded-full translate-x-6" />
                            </button>
                        </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'providers' && (
                  <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                          {['Gemini', 'OpenAI', 'Claude', 'OpenRouter', 'Ollama', 'Grok'].map((p) => (
                              <button
                                key={p}
                                className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                                    settings.modelProvider?.toLowerCase().includes(p.toLowerCase())
                                    ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900 scale-[1.02] shadow-md'
                                    : 'border-border hover:border-gray-300 dark:hover:border-gray-700'
                                }`}
                              >
                                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center font-bold">
                                      {p.charAt(0)}
                                  </div>
                                  <span className="text-xs font-bold">{p}</span>
                              </button>
                          ))}
                      </div>

                      <div className="p-6 bg-gray-50 dark:bg-gray-900 border border-border rounded-2xl space-y-4">
                          <h4 className="text-sm font-bold flex items-center gap-2">
                              <Zap size={16} className="text-amber-500" /> Gemini Configuration
                          </h4>
                          <div className="space-y-3">
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Model Name</label>
                                  <input
                                    type="text"
                                    className="w-full bg-white dark:bg-black border border-border rounded-xl p-3 text-sm font-medium focus:ring-1 ring-black/5 outline-none"
                                    placeholder="e.g. gemini-2.5-flash"
                                  />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">API Key</label>
                                  <input
                                    type="password"
                                    className="w-full bg-white dark:bg-black border border-border rounded-xl p-3 text-sm font-medium focus:ring-1 ring-black/5 outline-none"
                                    placeholder="sk-..."
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'system' && (
                  <div className="space-y-8">
                      <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl">
                          <h3 className="text-xs font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                              <Trash2 size={14} /> Danger Zone
                          </h3>
                          <div className="space-y-3">
                              <div className="flex items-center justify-between p-4 bg-white dark:bg-black border border-red-500/20 rounded-xl">
                                  <div>
                                      <p className="text-sm font-bold">Wipe All Data</p>
                                      <p className="text-[11px] text-gray-500">This will clear everything. Permanently.</p>
                                  </div>
                                  <button className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors">
                                      Delete Everything
                                  </button>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-white dark:bg-black border border-red-500/20 rounded-xl">
                                  <div>
                                      <p className="text-sm font-bold">Quit Application</p>
                                      <p className="text-[11px] text-gray-500">Stop all processes and exit.</p>
                                  </div>
                                  <button className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
                                      Quit App
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
            </motion.div>
          </AnimatePresence>
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

export default SettingsPage;
