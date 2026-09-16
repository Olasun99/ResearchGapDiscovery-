import React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from './ui';
import { ArrowRight, FileText, CheckCircle2, XCircle, Filter, Check, X } from 'lucide-react';
import { Paper, PrismaFlow } from '../types';

interface Props {
  papers: Paper[] | null;
  prisma: PrismaFlow | null;
  onNext: () => void;
  onScreenPaper: (id: string, decision: 'Included' | 'Excluded') => void;
}

export function RetrievalStep({ papers, prisma, onNext, onScreenPaper }: Props) {
  if (!papers || !prisma) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        
        {/* PRISMA Flow Summary */}
        <div className="space-y-4">
           <h3 className="text-lg font-semibold flex items-center text-slate-900 dark:text-slate-100">
            <Filter className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Screening Flow
          </h3>
          <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
            <CardContent className="p-5 space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{prisma.identified}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Identified</div>
              </div>
              <div className="flex justify-center text-slate-300 dark:text-slate-600">↓</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">{prisma.screened}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Screened</div>
                <div className="text-xs text-slate-400 mt-1">({prisma.duplicatesRemoved} duplicates removed)</div>
              </div>
               <div className="flex justify-center text-slate-300 dark:text-slate-600">↓</div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm">
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">{prisma.excluded}</div>
                  <div className="text-[10px] font-semibold text-red-600/70 dark:text-red-400/70 uppercase tracking-wider">Excluded</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg border border-green-100 dark:border-green-900/30 shadow-sm ring-2 ring-green-500/20">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">{prisma.included}</div>
                  <div className="text-[10px] font-semibold text-green-600/70 dark:text-green-400/70 uppercase tracking-wider">Included</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Papers List */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
             <h3 className="text-lg font-semibold flex items-center text-slate-900 dark:text-slate-100">
              <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              Retrieved Literature
            </h3>
            <Badge variant="success" className="px-3 py-1">
              {papers.filter(p => (p.userDecision || p.decision).toLowerCase() === 'included').length} Included for Analysis
            </Badge>
           </div>
           
           <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
             {papers.map((paper, idx) => {
               const effectiveDecision = paper.userDecision || paper.decision;
               const isIncluded = effectiveDecision.toLowerCase() === 'included';
               
               return (
                 <Card key={idx} className={`border-l-4 ${isIncluded ? 'border-l-green-500 bg-white dark:bg-slate-900' : 'border-l-slate-300 dark:border-l-slate-700 bg-slate-50/50 dark:bg-slate-900/50 opacity-75'}`}>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">{paper.title}</h4>
                        {isIncluded ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-400 dark:text-slate-600 shrink-0" />
                        )}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>{paper.authors}</span>
                        <span>•</span>
                        <span className="font-medium">{paper.year}</span>
                        <span>•</span>
                        <span className="truncate max-w-[200px]" title={paper.journal}>{paper.journal}</span>
                        
                        {(paper.doi || paper.citations !== undefined || paper.openAccess) && (
                          <div className="w-full flex items-center gap-3 mt-1 text-xs">
                            {paper.doi && (
                              <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                                DOI: {paper.doi}
                              </span>
                            )}
                            {paper.citations !== undefined && (
                              <span className="flex items-center text-slate-600 dark:text-slate-400">
                                Citations: {paper.citations}
                              </span>
                            )}
                            {paper.openAccess && (
                              <span className="flex items-center text-green-600 dark:text-green-500 font-medium">
                                Open Access
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{paper.abstract}</p>
                      </div>

                      {/* AI Extraction Highlights */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs">
                        {paper.population && (
                          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                            <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Population</span>
                            <span className="text-slate-800 dark:text-slate-200">{paper.population}</span>
                          </div>
                        )}
                        {paper.intervention && (
                          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                            <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Intervention</span>
                            <span className="text-slate-800 dark:text-slate-200">{paper.intervention}</span>
                          </div>
                        )}
                        {paper.outcome && (
                          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                            <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Outcome</span>
                            <span className="text-slate-800 dark:text-slate-200">{paper.outcome}</span>
                          </div>
                        )}
                        {paper.studyDesign && (
                          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                            <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Study Design</span>
                            <span className="text-slate-800 dark:text-slate-200">{paper.studyDesign}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className={`text-xs p-2.5 rounded-md flex items-start gap-2 max-w-2xl ${isIncluded ? 'bg-green-50/50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                          <span className="font-semibold mt-0.5 whitespace-nowrap">AI Suggests {paper.decision}:</span>
                          <span className="leading-relaxed">{paper.reasoning}</span>
                          {paper.relevanceScore && (
                            <Badge variant="default" className="ml-2 font-mono whitespace-nowrap">Score: {paper.relevanceScore}</Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2 shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onScreenPaper(paper.id, 'Included')}
                            className={isIncluded ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' : ''}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Include
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => onScreenPaper(paper.id, 'Excluded')}
                            className={!isIncluded ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300' : ''}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Exclude
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                 </Card>
               );
             })}
           </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button onClick={onNext} className="group px-6 shadow-md shadow-blue-500/20">
          Confirm Screening & Extract Evidence
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
