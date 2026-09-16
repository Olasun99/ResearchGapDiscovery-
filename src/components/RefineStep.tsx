import React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from './ui';
import { ArrowRight, BookOpen, Database } from 'lucide-react';
import { RefinedTopic, SearchStrategy } from '../types';

interface Props {
  topics: RefinedTopic[] | null;
  selectedTopicIndex: number | null;
  onSelectTopic: (index: number) => void;
  searchStrategy: SearchStrategy | null;
  onGenerateSearch: () => void;
  onNext: () => void;
  isLoading: boolean;
}

export function RefineStep({ topics, selectedTopicIndex, onSelectTopic, searchStrategy, onGenerateSearch, onNext, isLoading }: Props) {
  if (!topics) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center text-slate-900 dark:text-slate-100">
          <BookOpen className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Refined Research Directions
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {topics.map((topic, idx) => (
            <Card 
              key={idx} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedTopicIndex === idx ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/30 dark:bg-blue-900/20' : 'hover:border-slate-300 dark:hover:border-slate-700'}`}
              onClick={() => onSelectTopic(idx)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-tight">{topic.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{topic.description}</p>
                <div className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-slate-700 dark:text-slate-300">
                  <span className="font-semibold block mb-1">Rationale:</span>
                  {topic.rationale}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedTopicIndex !== null && !searchStrategy && (
        <div className="flex justify-center pt-4">
          <Button onClick={onGenerateSearch} disabled={isLoading} className="shadow-sm">
            Generate Search Strategy
          </Button>
        </div>
      )}

      {searchStrategy && (
        <div className="space-y-4 pt-8 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-500">
           <h3 className="text-xl font-semibold flex items-center text-slate-900 dark:text-slate-100">
            <Database className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Search Strategy & Databases
          </h3>
          <Card className="bg-slate-50/50 dark:bg-slate-900/50">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2">General Boolean Query</h4>
                  <code className="block p-4 bg-slate-900 dark:bg-slate-950 text-blue-300 rounded-lg text-sm font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                    {searchStrategy.booleanQuery}
                  </code>
                </div>

                {searchStrategy.queries && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {searchStrategy.queries.pubmed && (
                      <div>
                        <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">PubMed</h5>
                        <code className="block p-3 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-800 text-xs font-mono whitespace-pre-wrap">
                          {searchStrategy.queries.pubmed}
                        </code>
                      </div>
                    )}
                    {searchStrategy.queries.scopus && (
                      <div>
                        <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Scopus</h5>
                        <code className="block p-3 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-800 text-xs font-mono whitespace-pre-wrap">
                          {searchStrategy.queries.scopus}
                        </code>
                      </div>
                    )}
                    {searchStrategy.queries.webOfScience && (
                      <div>
                        <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Web of Science</h5>
                        <code className="block p-3 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-800 text-xs font-mono whitespace-pre-wrap">
                          {searchStrategy.queries.webOfScience}
                        </code>
                      </div>
                    )}
                    {searchStrategy.queries.crossref && (
                      <div>
                        <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">CrossRef</h5>
                        <code className="block p-3 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-800 text-xs font-mono whitespace-pre-wrap">
                          {searchStrategy.queries.crossref}
                        </code>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2">Target Databases</h4>
                  <div className="flex flex-wrap gap-2">
                    {searchStrategy.databases.map((db, i) => (
                      <Badge key={i} variant="default" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">{db}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2 text-green-700 dark:text-green-400">Inclusion Criteria</h4>
                  <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    {searchStrategy.inclusionCriteria.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
                <div>
                   <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2 text-red-700 dark:text-red-400">Exclusion Criteria</h4>
                  <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    {searchStrategy.exclusionCriteria.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end pt-4">
             <Button onClick={onNext} className="group">
               Run Retrieval & Screening
               <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
             </Button>
          </div>
        </div>
      )}
    </div>
  );
}
