import React from 'react';
import {
  MousePointer2,
  Keyboard,
  Search,
  Eye,
  Brain,
  Loader2,
  Terminal,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ActionStatus } from '../types/chat';
import { cn } from '../lib/utils';

interface ActionCardProps {
  action: ActionStatus;
}

const ActionCard: React.FC<ActionCardProps> = ({ action }) => {
  const getIcon = () => {
    const text = action.text.toLowerCase();
    if (text.includes('click')) return MousePointer2;
    if (text.includes('type') || text.includes('key')) return Keyboard;
    if (text.includes('search')) return Search;
    if (text.includes('screenshot') || text.includes('see')) return Eye;
    if (text.includes('thinking')) return Brain;
    if (text.includes('waiting') || text.includes('wait')) return Loader2;
    if (text.includes('terminal') || text.includes('command')) return Terminal;
    return Brain;
  };

  const Icon = getIcon();
  const colorClass = action.text.toLowerCase().includes('type') ? "text-amber-400" :
                    action.text.toLowerCase().includes('click') ? "text-blue-400" :
                    action.text.toLowerCase().includes('search') ? "text-purple-400" :
                    action.text.toLowerCase().includes('terminal') ? "text-emerald-400" :
                    "text-indigo-400";

  return (
    <div className="group/step relative pl-8 pb-4 animate-fade-in">
      <div className={cn(
        "absolute -left-[11px] top-[4px] z-[2] w-[22px] h-[22px] rounded-full flex items-center justify-center border shadow-sm",
        action.status === 'running' ? "bg-neutral-900 border-neutral-700 animate-pulse" :
        action.status === 'error' ? "bg-red-950/30 border-red-900/50" :
        "bg-neutral-900 border-neutral-800"
      )}>
        <Icon className={cn("w-3 h-3", action.status === 'error' ? "text-red-500" : colorClass)} />
      </div>

      <div className="text-[14px] font-medium text-neutral-200 leading-snug">
        {action.text}
      </div>

      {action.details && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <div
              className={cn(
                'inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border',
                action.status === 'success' ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10' :
                action.status === 'error' ? 'text-red-400 bg-red-500/5 border-red-500/10' :
                'text-neutral-500 bg-neutral-500/5 border-neutral-800'
              )}
            >
              {action.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {action.details}
            </div>
        </div>
      )}
    </div>
  );
};

export default ActionCard;
