import React, { useState, useEffect } from 'react';
import { IntakeStep } from './components/IntakeStep';
import { RefineStep } from './components/RefineStep';
import { RetrievalStep } from './components/RetrievalStep';
import { EvidenceStep } from './components/EvidenceStep';
import { GapStep } from './components/GapStep';
import { ProposalStep } from './components/ProposalStep';
import { WorkflowState } from './types';
import { Activity, Check, ChevronRight, LayoutDashboard, Loader2, Moon, Sun } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

const STEPS = [
  'Topic Intake',
  'Refinement & Search',
  'Screening',
  'Synthesis',
  'Gap Discovery',
  'Proposal'
];

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [state, setState] = useState<WorkflowState>({
    step: 0,
    initialTopic: '',
    refinedTopics: null,
    selectedTopicIndex: null,
    searchStrategy: null,
    papers: null,
    prisma: null,
    evidence: null,
    gaps: null,
    selectedGapIndex: null,
    proposal: null,
    isLoading: false,
    error: null,
  });

  const handleIntake = async (topic: string) => {
    setState(s => ({ ...s, isLoading: true, error: null, initialTopic: topic }));
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialTopic: topic })
      });
      if (!res.ok) throw new Error("Failed to refine topic");
      const data = await res.json();
      setState(s => ({ 
        ...s, 
        isLoading: false, 
        refinedTopics: data.refinedTopics,
        step: 1
      }));
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message }));
    }
  };

  const handleGenerateSearch = async () => {
    if (state.selectedTopicIndex === null || !state.refinedTopics) return;
    const selected = state.refinedTopics[state.selectedTopicIndex];
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await fetch('/api/search-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refinedTopic: `${selected.title}: ${selected.description}` })
      });
      if (!res.ok) throw new Error("Failed to generate search strategy");
      const data = await res.json();
      setState(s => ({ 
        ...s, 
        isLoading: false, 
        searchStrategy: data 
      }));
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message }));
    }
  };

  const handleRunRetrieval = async () => {
    if (!state.searchStrategy) return;
    setState(s => ({ ...s, isLoading: true, error: null, step: 2 }));
    try {
      const res = await fetch('/api/retrieve-and-screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: state.searchStrategy.booleanQuery,
          inclusionCriteria: state.searchStrategy.inclusionCriteria
        })
      });
      if (!res.ok) throw new Error("Failed to retrieve literature");
      const data = await res.json();
      setState(s => ({ 
        ...s, 
        isLoading: false, 
        papers: data.papers,
        prisma: data.prisma
      }));
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message }));
    }
  };

  const handleScreenPaper = (id: string, decision: 'Included' | 'Excluded') => {
    setState(s => {
      if (!s.papers) return s;
      const newPapers = s.papers.map(p => p.id === id ? { ...p, userDecision: decision } : p);
      
      let newPrisma = s.prisma;
      if (newPrisma) {
        const oldPaper = s.papers.find(p => p.id === id);
        if (oldPaper) {
          const oldEffectiveDecision = oldPaper.userDecision ? oldPaper.userDecision.toLowerCase() : oldPaper.decision.toLowerCase();
          const newEffectiveDecision = decision.toLowerCase();
          
          if (oldEffectiveDecision !== newEffectiveDecision) {
            newPrisma = { ...newPrisma };
            if (newEffectiveDecision === 'included') {
              newPrisma.included++;
              newPrisma.excluded--;
            } else if (newEffectiveDecision === 'excluded') {
              newPrisma.included--;
              newPrisma.excluded++;
            }
          }
        }
      }

      return { ...s, papers: newPapers, prisma: newPrisma };
    });
  };

  const handleExtractEvidence = async () => {
    if (!state.papers) return;
    const included = state.papers.filter(p => (p.userDecision || p.decision).toLowerCase() === 'included');
    setState(s => ({ ...s, isLoading: true, error: null, step: 3 }));
    try {
      const res = await fetch('/api/extract-evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ papers: included })
      });
      if (!res.ok) throw new Error("Failed to extract evidence");
      const data = await res.json();
      setState(s => ({ 
        ...s, 
        isLoading: false, 
        evidence: data
      }));
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message }));
    }
  };

  const handleDiscoverGaps = async () => {
    if (!state.evidence) return;
    setState(s => ({ ...s, isLoading: true, error: null, step: 4 }));
    try {
      const res = await fetch('/api/discover-gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ findings: state.evidence.findings, papers: state.evidence.papers })
      });
      if (!res.ok) throw new Error("Failed to discover gaps");
      const data = await res.json();
      setState(s => ({ 
        ...s, 
        isLoading: false, 
        gaps: data.gaps
      }));
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message }));
    }
  };

  const handleGenerateProposal = async () => {
    if (state.selectedGapIndex === null || !state.gaps) return;
    const selected = state.gaps[state.selectedGapIndex];
    setState(s => ({ ...s, isLoading: true, error: null, step: 5 }));
    try {
      const res = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gap: selected })
      });
      if (!res.ok) throw new Error("Failed to generate proposal");
      const data = await res.json();
      setState(s => ({ 
        ...s, 
        isLoading: false, 
        proposal: data
      }));
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message }));
    }
  };

  const handleRestart = () => {
    setState({
      step: 0,
      initialTopic: '',
      refinedTopics: null,
      selectedTopicIndex: null,
      searchStrategy: null,
      papers: null,
      prisma: null,
      evidence: null,
      gaps: null,
      selectedGapIndex: null,
      proposal: null,
      isLoading: false,
      error: null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Research Discovery Engine</h1>
        </div>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Workflow Tracker */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-6 overflow-y-auto transition-colors">
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">Workflow Progress</div>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
            {STEPS.map((stepName, i) => {
              const isActive = state.step === i;
              const isPast = state.step > i;
              return (
                <div key={i} className="relative flex items-center gap-4">
                  <div className={clsx(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 transition-colors duration-300",
                    isActive ? "border-blue-600 text-blue-600 dark:text-blue-400 shadow-sm shadow-blue-500/20" : 
                    isPast ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-500" : 
                    "border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
                  )}>
                    {isPast ? <Check className="w-5 h-5" /> : <span className="text-sm font-bold">{i + 1}</span>}
                  </div>
                  <div className={clsx(
                    "text-sm font-medium transition-colors duration-300",
                    isActive ? "text-blue-600 dark:text-blue-400 font-semibold" : 
                    isPast ? "text-slate-700 dark:text-slate-300" : 
                    "text-slate-400 dark:text-slate-500"
                  )}>
                    {stepName}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-y-auto p-6 md:p-12">
           
           {/* Loading Overlay */}
           <AnimatePresence>
             {state.isLoading && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 z-50 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center"
               >
                 <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                 <p className="text-lg font-medium text-slate-800 dark:text-slate-200 animate-pulse">Processing...</p>
               </motion.div>
             )}
           </AnimatePresence>

           {state.error && (
             <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-lg flex items-center">
               <span className="font-semibold mr-2">Error:</span> {state.error}
             </div>
           )}

           <div className="pb-24">
             <AnimatePresence mode="wait">
               <motion.div
                 key={state.step}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 transition={{ duration: 0.3 }}
               >
                  {state.step === 0 && (
                    <IntakeStep onNext={handleIntake} />
                  )}
                  
                  {state.step === 1 && (
                    <RefineStep 
                      topics={state.refinedTopics}
                      selectedTopicIndex={state.selectedTopicIndex}
                      onSelectTopic={(idx) => setState(s => ({ ...s, selectedTopicIndex: idx }))}
                      searchStrategy={state.searchStrategy}
                      onGenerateSearch={handleGenerateSearch}
                      onNext={handleRunRetrieval}
                      isLoading={state.isLoading}
                    />
                  )}

                  {state.step === 2 && (
                    <RetrievalStep 
                      papers={state.papers}
                      prisma={state.prisma}
                      onNext={handleExtractEvidence}
                      onScreenPaper={handleScreenPaper}
                    />
                  )}

                  {state.step === 3 && (
                    <EvidenceStep 
                      evidence={state.evidence}
                      onNext={handleDiscoverGaps}
                    />
                  )}

                  {state.step === 4 && (
                    <GapStep 
                      gaps={state.gaps}
                      selectedGapIndex={state.selectedGapIndex}
                      onSelectGap={(idx) => setState(s => ({ ...s, selectedGapIndex: idx }))}
                      onNext={handleGenerateProposal}
                    />
                  )}

                  {state.step === 5 && (
                    <ProposalStep 
                      proposal={state.proposal}
                      onRestart={handleRestart}
                    />
                  )}
               </motion.div>
             </AnimatePresence>
           </div>

        </main>
      </div>
    </div>
  );
}
