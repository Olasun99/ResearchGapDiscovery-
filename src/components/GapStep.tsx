import React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from './ui';
import { ArrowRight, Lightbulb, Zap, Target, Activity, TrendingUp, Award, AlertTriangle } from 'lucide-react';
import { Gap } from '../types';

interface Props {
  gaps: Gap[] | null;
  selectedGapIndex: number | null;
  onSelectGap: (index: number) => void;
  onNext: () => void;
}

export function GapStep({ gaps, selectedGapIndex, onSelectGap, onNext }: Props) {
  if (!gaps) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400';
    return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400';
  };

  const getDifficultyColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400';
    return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center text-slate-900 dark:text-slate-100">
          <Lightbulb className="w-5 h-5 mr-2 text-amber-500" />
          Identified Research Gaps
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Select a gap to develop into a full research proposal.</p>
        
        <div className="grid gap-6">
          {gaps.map((gap, idx) => (
            <Card 
              key={idx} 
              className={`cursor-pointer transition-all duration-200 ${selectedGapIndex === idx ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/10 dark:bg-blue-900/10' : 'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'}`}
              onClick={() => onSelectGap(idx)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">{gap.title}</h4>
                      <div className={`shrink-0 ml-4 px-3 py-1 rounded-full border-2 font-bold flex items-center gap-2 ${getScoreColor(gap.metrics?.gapScore || 0)}`}>
                        <span>Score: {gap.metrics?.gapScore || 0}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{gap.description}</p>
                    
                    {(gap.objectives?.length > 0 || gap.hypotheses?.length > 0 || gap.suggestedMethodology) && (
                      <div className="mt-4 grid md:grid-cols-2 gap-4">
                        {gap.objectives?.length > 0 && (
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Objectives</h5>
                            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                              {gap.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                            </ul>
                          </div>
                        )}
                        {gap.hypotheses?.length > 0 && (
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Hypotheses</h5>
                            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                              {gap.hypotheses.map((hyp, i) => <li key={i}>{hyp}</li>)}
                            </ul>
                          </div>
                        )}
                        {gap.suggestedMethodology && (
                          <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Suggested Methodology</h5>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{gap.suggestedMethodology}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                       <div className="flex flex-col">
                          <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1 flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Novelty
                          </div>
                          <div className={`text-sm font-semibold rounded px-2 py-1 inline-flex w-max ${getScoreColor(gap.metrics?.novelty || 0)}`}>
                            {gap.metrics?.novelty || 0} / 100
                          </div>
                       </div>
                       <div className="flex flex-col">
                          <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1 flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Clinical Rel.
                          </div>
                          <div className={`text-sm font-semibold rounded px-2 py-1 inline-flex w-max ${getScoreColor(gap.metrics?.clinicalRelevance || 0)}`}>
                            {gap.metrics?.clinicalRelevance || 0} / 100
                          </div>
                       </div>
                       <div className="flex flex-col">
                          <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Publication
                          </div>
                          <div className={`text-sm font-semibold rounded px-2 py-1 inline-flex w-max ${getScoreColor(gap.metrics?.publicationPotential || 0)}`}>
                            {gap.metrics?.publicationPotential || 0} / 100
                          </div>
                       </div>
                       <div className="flex flex-col">
                          <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1 flex items-center gap-1">
                            <Award className="w-3 h-3" /> Funding
                          </div>
                          <div className={`text-sm font-semibold rounded px-2 py-1 inline-flex w-max ${getScoreColor(gap.metrics?.fundingPotential || 0)}`}>
                            {gap.metrics?.fundingPotential || 0} / 100
                          </div>
                       </div>
                       <div className="flex flex-col">
                          <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Difficulty
                          </div>
                          <div className={`text-sm font-semibold rounded px-2 py-1 inline-flex w-max ${getDifficultyColor(gap.metrics?.difficulty || 0)}`}>
                            {gap.metrics?.difficulty || 0} / 100
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button onClick={onNext} disabled={selectedGapIndex === null} className="group px-6 shadow-sm shadow-blue-500/20">
          Generate Proposal
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
