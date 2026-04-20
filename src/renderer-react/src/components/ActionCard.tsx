import React from 'react';
import { MousePointer, Keyboard, Search, Move, Camera, Brain, Clock, Terminal } from 'lucide-react';
import { ActionStatus } from '../types/chat';

interface ActionCardProps {
  action: ActionStatus;
}

const ActionCard: React.FC<ActionCardProps> = ({ action }) => {
  const getIcon = () => {
    const text = action.text.toLowerCase();
    if (text.includes('click')) return <MousePointer size={12} />;
    if (text.includes('type')) return <Keyboard size={12} />;
    if (text.includes('search')) return <Search size={12} />;
    if (text.includes('move')) return <Move size={12} />;
    if (text.includes('screenshot')) return <Camera size={12} />;
    if (text.includes('thinking')) return <Brain size={12} />;
    if (text.includes('waiting')) return <Clock size={12} />;
    if (text.includes('terminal') || text.includes('command')) return <Terminal size={12} />;
    return <Brain size={12} />;
  };

  return (
    <div className="flex flex-col gap-1 my-1 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="text-gray-400 dark:text-gray-500">{getIcon()}</div>
        <div className="flex-1 flex items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 py-1.5 px-3 rounded-lg min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 truncate">
            {action.text}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full shadow-sm ${
            action.status === 'success' ? 'bg-green-500' :
            action.status === 'error' ? 'bg-red-500' :
            'bg-amber-500 animate-pulse'
          }`} />
        </div>
      </div>
      {action.details && (
        <p className="text-[10px] text-gray-500 dark:text-gray-400 pl-6 leading-tight whitespace-pre-wrap">
          {action.details}
        </p>
      )}
    </div>
  );
};

export default ActionCard;
