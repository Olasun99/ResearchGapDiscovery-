import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, CardContent } from './ui';
import { Send, User, Bot, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  suggestedOptions?: string[];
}

export function IntakeStep({ onNext }: { onNext: (topic: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Welcome. Let\'s define your research horizon. What broad research domain or area are you interested in?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    // Remove suggestions from the last assistant message
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMsg = newMessages[newMessages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        lastMsg.suggestedOptions = undefined;
      }
      return newMessages;
    });

    const newMessages = [...messages, { role: 'user' as const, text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newMessages })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: data.text,
        suggestedOptions: data.suggestedOptions
      }]);
      
      if (data.isComplete) {
        setIsComplete(true);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', text: 'I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    // The last assistant message should be the summary
    const summary = messages[messages.length - 1].text;
    onNext(summary);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[70vh]">
      <div className="text-center space-y-2 mb-6 shrink-0">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Research Interview</h2>
        <p className="text-slate-500 dark:text-slate-400">Let's progressively narrow down your focus.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/20 dark:shadow-none dark:bg-slate-900">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                
                <div className="flex flex-col gap-2 max-w-[80%]">
                  <div className={`rounded-2xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  {msg.suggestedOptions && msg.suggestedOptions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.suggestedOptions.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(opt)}
                          disabled={isLoading}
                          className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50 text-left"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 justify-start">
               <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
               </div>
               <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1">
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
               </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          {!isComplete ? (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your response..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-100 disabled:opacity-50"
              />
              <Button type="submit" disabled={!input.trim() || isLoading} className="shrink-0 w-12 h-12 p-0 rounded-lg">
                <Send className="w-5 h-5" />
              </Button>
            </form>
          ) : (
            <div className="flex justify-center gap-4">
               <Button onClick={() => setIsComplete(false)} variant="outline" className="dark:border-slate-700 dark:text-slate-300">
                 No, let's adjust
               </Button>
               <Button onClick={handleConfirm} className="shadow-md shadow-blue-500/20">
                 <Search className="w-4 h-4 mr-2" />
                 Yes, Begin Literature Search
               </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
