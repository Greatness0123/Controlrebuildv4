import React, { memo, useMemo, useState } from 'react';
import {
  ChevronRight,
  Eye,
  Terminal,
  Brain,
  Zap,
  Search,
  CheckCircle2,
  XCircle,
  MousePointer2,
  Keyboard,
  Maximize,
  Layout,
  AlertCircle,
  Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';

// --- Types ---

type SectionType =
  | 'verification'
  | 'analysis'
  | 'next-action'
  | 'grounded-action'
  | 'reflection'
  | 'status'
  | 'action-result'
  | 'awaiting-human';

interface ParsedSection {
  type: SectionType;
  content: string;
  attrs: Record<string, string>;
}

interface StepGroup {
  kind: 'step';
  action: string;
  observation: string | null;
  code: string | null;
  results: { content: string; status: string }[];
}

type TopLevelItem =
  | StepGroup
  | { kind: 'status'; content: string; status: string }
  | { kind: 'text'; content: string }
  | { kind: 'awaiting-human'; reason: string };

// --- Parser ---

const TAG_REGEX = /<cua-section\s+([^>]*)>([\s\S]*?)<\/cua-section>/g;
const ATTR_REGEX = /(\w[\w-]*)="([^"]*)"/g;

function parseAttributes(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  let m: RegExpExecArray | null;
  while ((m = ATTR_REGEX.exec(attrString)) !== null) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

function parseSections(raw: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  TAG_REGEX.lastIndex = 0;

  while ((match = TAG_REGEX.exec(raw)) !== null) {
    const before = raw.slice(lastIndex, match.index).trim();
    if (before) {
      sections.push({ type: 'next-action' as SectionType, content: before, attrs: { _plain: 'true' } });
    }
    const attrs = parseAttributes(match[1]);
    sections.push({
      type: (attrs.type ?? 'next-action') as SectionType,
      content: match[2].trim(),
      attrs,
    });
    lastIndex = match.index + match[0].length;
  }

  const trailing = raw.slice(lastIndex).trim();
  if (trailing) {
    sections.push({ type: 'next-action' as SectionType, content: trailing, attrs: { _plain: 'true' } });
  }
  return sections;
}

// --- Grouping ---

const OBSERVATION_TYPES = new Set<SectionType>(['verification', 'analysis', 'reflection']);

function buildTopLevel(sections: ParsedSection[]): TopLevelItem[] {
  const items: TopLevelItem[] = [];
  let i = 0;
  let pendingStep: StepGroup | null = null;

  function flushStep() {
    if (pendingStep) {
      items.push(pendingStep);
      pendingStep = null;
    }
  }

  while (i < sections.length) {
    const s = sections[i];

    if (OBSERVATION_TYPES.has(s.type)) {
      const parts: string[] = [];
      while (i < sections.length && OBSERVATION_TYPES.has(sections[i].type)) {
        parts.push(sections[i].content);
        i++;
      }
      const merged = parts.join('\n\n');
      if (pendingStep && pendingStep.action) flushStep();
      if (!pendingStep) {
        pendingStep = { kind: 'step', action: '', observation: merged, code: null, results: [] };
      } else {
        pendingStep.observation = pendingStep.observation
          ? pendingStep.observation + '\n\n' + merged
          : merged;
      }
      continue;
    }

    if (s.type === 'next-action') {
      if (pendingStep && pendingStep.action) flushStep();
      if (!pendingStep) {
        pendingStep = { kind: 'step', action: '', observation: null, code: null, results: [] };
      }
      if (s.attrs._plain === 'true') {
        flushStep();
        items.push({ kind: 'text', content: s.content });
      } else {
        pendingStep.action = s.content;
      }
    } else if (s.type === 'grounded-action') {
      if (pendingStep) pendingStep.code = s.content;
    } else if (s.type === 'action-result') {
      if (pendingStep) pendingStep.results.push({ content: s.content, status: s.attrs.status || 'success' });
    } else if (s.type === 'status') {
      flushStep();
      items.push({ kind: 'status', content: s.content, status: s.attrs.status || 'completed' });
    } else if (s.type === 'awaiting-human') {
      flushStep();
      items.push({ kind: 'awaiting-human', reason: s.attrs.reason || s.content });
    }

    i++;
  }

  flushStep();
  return items;
}

// --- Components ---

function DetailRow({
  icon: Icon,
  label,
  children,
  defaultOpen = false,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-1 last:mb-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="group/detail flex items-center gap-1.5 py-1 text-[12px] text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        <ChevronRight
          className={cn(
            'w-3 h-3 shrink-0 transition-transform duration-200 ease-out',
            open && 'rotate-90'
          )}
        />
        <Icon className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover/detail:opacity-100 transition-opacity" />
        <span className="font-medium tracking-tight">{label}</span>
      </button>
      {open && (
        <div className="ml-[24px] pb-2 text-[13px] leading-relaxed text-neutral-400 border-l border-neutral-800/50 pl-3 mt-1">
          {children}
        </div>
      )}
    </div>
  );
}

function ActionIcon({ actionText, status }: { actionText: string; status: string }) {
  const text = actionText.toLowerCase();

  let Icon = MousePointer2;
  let colorClass = "text-blue-400";

  if (text.includes('type') || text.includes('key')) {
    Icon = Keyboard;
    colorClass = "text-amber-400";
  } else if (text.includes('search')) {
    Icon = Search;
    colorClass = "text-purple-400";
  } else if (text.includes('terminal') || text.includes('command')) {
    Icon = Terminal;
    colorClass = "text-emerald-400";
  } else if (text.includes('screenshot') || text.includes('see')) {
    Icon = Eye;
    colorClass = "text-pink-400";
  } else if (text.includes('thinking')) {
    Icon = Brain;
    colorClass = "text-indigo-400";
  } else if (text.includes('wait')) {
    Icon = Loader2;
    colorClass = "text-neutral-400";
  }

  return (
    <div className={cn(
      "absolute -left-[11px] top-[4px] z-[2] w-[22px] h-[22px] rounded-full flex items-center justify-center border shadow-sm",
      status === 'running' ? "bg-neutral-900 border-neutral-700 animate-pulse" :
      status === 'error' ? "bg-red-950/30 border-red-900/50" :
      "bg-neutral-900 border-neutral-800"
    )}>
      <Icon className={cn("w-3 h-3", status === 'error' ? "text-red-500" : colorClass)} />
    </div>
  );
}

function StepCard({ step }: { step: StepGroup }) {
  const hasError = step.results.some((r) => r.status === 'error');
  const isDone = step.results.length > 0;
  const status = hasError ? 'error' : isDone ? 'success' : 'running';

  return (
    <div className="group/step relative pl-8 pb-4 last:pb-2">
      <ActionIcon actionText={step.action || step.code || ''} status={status} />

      {step.action && (
        <div className="text-[14px] font-medium text-neutral-200 leading-snug">
          {step.action}
        </div>
      )}

      {step.code && (
        <div className="mt-1.5">
          <DetailRow icon={Zap} label="Grounded action">
            <code className="font-mono text-[11px] bg-neutral-900/50 px-2 py-1 rounded border border-neutral-800 block whitespace-pre-wrap">
              {step.code}
            </code>
          </DetailRow>
        </div>
      )}

      {step.observation && (
        <div className="mt-1">
          <DetailRow icon={Eye} label="Observation">
             <div className="markdown-prose text-neutral-400 text-xs">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{step.observation}</ReactMarkdown>
             </div>
          </DetailRow>
        </div>
      )}

      {step.results.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {step.results.map((r, j) => (
            <div
              key={j}
              className={cn(
                'inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border',
                r.status === 'success' ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10' :
                r.status === 'error' ? 'text-red-400 bg-red-500/5 border-red-500/10' :
                'text-neutral-500 bg-neutral-500/5 border-neutral-800'
              )}
            >
              {r.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {r.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemRenderer({ item }: { item: TopLevelItem }) {
  switch (item.kind) {
    case 'step':
      return <StepCard step={item} />;

    case 'status': {
      const isCompleted = item.status === 'completed';
      return (
        <div className="pl-8 py-2">
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold",
            isCompleted
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          )}>
            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {item.content}
          </div>
        </div>
      );
    }

    case 'awaiting-human':
      return (
        <div className="pl-8 py-3">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
               <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Awaiting Approval</div>
              <div className="text-sm text-neutral-200">{item.reason}</div>
            </div>
          </div>
        </div>
      );

    case 'text':
      return (
        <div className="pl-8 py-2 text-sm text-neutral-300 leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>
        </div>
      );

    default:
      return null;
  }
}

export const CuaSectionRenderer = memo(function CuaSectionRenderer({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const items = useMemo(() => {
    const sections = parseSections(content);
    return buildTopLevel(sections);
  }, [content]);

  if (items.length === 0) return null;

  return (
    <div className={cn('flex flex-col relative py-2', className)}>
      {/* Timeline connector line */}
      <div className="absolute left-[0px] top-4 bottom-4 w-[1px] bg-neutral-800" />

      <div className="relative flex flex-col">
        {items.map((item, i) => (
          <ItemRenderer key={i} item={item} />
        ))}
      </div>
    </div>
  );
});

export function hasCuaSections(content: string): boolean {
  return /<cua-section\s/.test(content);
}
