import React from 'react';
import { Button, Card, CardContent } from './ui';
import { Download, CheckCircle, RefreshCcw, Layers } from 'lucide-react';
import { Proposal } from '../types';

interface Props {
  proposal: Proposal | null;
  onRestart: () => void;
}

export function ProposalStep({ proposal, onRestart }: Props) {
  if (!proposal) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-2 shadow-sm">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Proposal Generated</h2>
        <p className="text-slate-500 dark:text-slate-400">Your AI-assisted research proposal is ready for review.</p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900">
        <CardContent className="p-8 md:p-12 space-y-10">
          
          <div className="text-center pb-8 border-b border-slate-100 dark:border-slate-800">
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {proposal.title}
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Background</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                {proposal.background}
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Problem Statement</h3>
              <p className="text-xl font-medium text-slate-800 dark:text-slate-200 border-l-4 border-blue-500 pl-4 py-1">
                {proposal.problemStatement}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Gap Justification</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
              {proposal.gapJustification}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Objectives</h3>
              <ul className="space-y-3">
                {proposal.objectives.map((obj, i) => (
                  <li key={i} className="flex gap-3 text-slate-700 dark:text-slate-300 items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed text-sm">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Hypotheses</h3>
              <ul className="space-y-3">
                {proposal.hypotheses.map((hyp, i) => (
                  <li key={i} className="flex gap-3 text-slate-700 dark:text-slate-300 items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold mt-0.5">
                      H{i + 1}
                    </span>
                    <span className="leading-relaxed text-sm italic">{hyp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Methodology</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Study Design & Methods</h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                  {proposal.methods}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">PRISMA Protocol</h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                  {proposal.prismaProtocol}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Data Extraction Forms</h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                  {proposal.dataExtractionForms}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Statistical Analysis Plan</h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                  {proposal.statisticalAnalysisPlan}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
             <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Layers className="w-4 h-4" /> Suggested Tech Stack
             </h3>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 p-4 rounded-lg">
                  <div className="text-xs uppercase text-indigo-600 dark:text-indigo-400 font-bold mb-1">Frontend</div>
                  <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">{proposal.suggestedTechStack.frontend}</div>
                </div>
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 p-4 rounded-lg">
                  <div className="text-xs uppercase text-blue-600 dark:text-blue-400 font-bold mb-1">Backend</div>
                  <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">{proposal.suggestedTechStack.backend}</div>
                </div>
                <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/50 p-4 rounded-lg">
                  <div className="text-xs uppercase text-purple-600 dark:text-purple-400 font-bold mb-1">AI</div>
                  <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">{proposal.suggestedTechStack.ai}</div>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 p-4 rounded-lg">
                  <div className="text-xs uppercase text-emerald-600 dark:text-emerald-400 font-bold mb-1">Database</div>
                  <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">{proposal.suggestedTechStack.database}</div>
                </div>
                <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 p-4 rounded-lg">
                  <div className="text-xs uppercase text-amber-600 dark:text-amber-400 font-bold mb-1">Storage</div>
                  <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">{proposal.suggestedTechStack.storage}</div>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-lg">
                  <div className="text-xs uppercase text-slate-600 dark:text-slate-400 font-bold mb-1">Background Jobs</div>
                  <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">{proposal.suggestedTechStack.backgroundJobs}</div>
                </div>
             </div>
          </div>
          
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
        <Button className="px-8 shadow-sm">
          <Download className="w-4 h-4 mr-2" />
          Export to PDF
        </Button>
        <Button variant="outline" onClick={onRestart} className="px-8 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Start New Search
        </Button>
      </div>
    </div>
  );
}
