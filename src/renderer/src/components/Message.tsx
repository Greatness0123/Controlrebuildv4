import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message as MessageType } from '../../types/chat';
import { Copy, Check } from 'lucide-react';
import { CuaSectionRenderer, hasCuaSections } from './CuaSectionRenderer';
import { cn } from '../lib/utils';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isCua = !isUser && hasCuaSections(message.text);
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full mb-1 group`}
    >
      <div
        className={cn(
          "p-3.5 px-4 rounded-2xl max-w-[95%] text-sm leading-relaxed shadow-sm relative",
          isUser
            ? 'bg-black text-white rounded-br-md font-medium'
            : isCua
              ? 'bg-transparent text-gray-800 dark:text-gray-200 p-0 shadow-none border-none'
              : 'bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
        )}
      >
        {isCua ? (
          <CuaSectionRenderer content={message.text} />
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="relative group/code my-2">
                    <div className="absolute right-2 top-2 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyToClipboard(String(children))}
                        className="p-1.5 bg-gray-800/80 hover:bg-gray-700 rounded-md text-white border border-gray-600/50"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-xl !bg-gray-900 !m-0 !p-4 border border-gray-800"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md font-mono text-[0.9em]" {...props}>
                    {children}
                  </code>
                );
              },
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
            }}
          >
            {message.text}
          </ReactMarkdown>
        )}

        {/* Message Actions - shown on hover for AI messages */}
        {!isUser && !isCua && (
            <div className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                 <button
                    onClick={() => copyToClipboard(message.text)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-black dark:hover:text-white transition-all"
                >
                    <Copy size={14} />
                </button>
            </div>
        )}
      </div>
    </motion.div>
  );
};

export default Message;
