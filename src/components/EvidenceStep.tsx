import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, CardContent, Badge } from './ui';
import { ArrowRight, Network, ListChecks, Table } from 'lucide-react';
import { Evidence } from '../types';
import ForceGraph2D from 'react-force-graph-2d';

interface Props {
  evidence: Evidence | null;
  onNext: () => void;
}

export function EvidenceStep({ evidence, onNext }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth } = containerRef.current;
      setDimensions({ width: clientWidth, height: 400 });
    }
  }, []);

  if (!evidence) return null;

  const graphData = {
    nodes: evidence.entities.map(e => ({ id: e.label, group: e.type })),
    links: evidence.relationships.map(r => ({ source: r.source, target: r.target, label: r.type }))
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      
      {/* Evidence Matrix */}
      {evidence.papers && evidence.papers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center text-slate-900 dark:text-slate-100">
            <Table className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-400" />
            Evidence Matrix
          </h3>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 font-medium">Paper</th>
                    <th className="px-4 py-3 font-medium">Aim</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 font-medium">Sample</th>
                    <th className="px-4 py-3 font-medium">Findings</th>
                    <th className="px-4 py-3 font-medium">Limitations</th>
                    <th className="px-4 py-3 font-medium">Future Work</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {evidence.papers.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3 align-top">
                        <div className="font-medium text-slate-900 dark:text-slate-200 line-clamp-2" title={p.title}>{p.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{p.authors} ({p.year})</div>
                      </td>
                      <td className="px-4 py-3 align-top min-w-[150px]">
                        <p className="line-clamp-3 text-slate-600 dark:text-slate-400" title={p.extractedData?.aim}>{p.extractedData?.aim || '-'}</p>
                      </td>
                      <td className="px-4 py-3 align-top min-w-[150px]">
                        <p className="line-clamp-3 text-slate-600 dark:text-slate-400" title={p.extractedData?.methods}>{p.extractedData?.methods || '-'}</p>
                      </td>
                      <td className="px-4 py-3 align-top min-w-[150px]">
                        <p className="line-clamp-3 text-slate-600 dark:text-slate-400" title={p.extractedData?.sample}>{p.extractedData?.sample || '-'}</p>
                      </td>
                      <td className="px-4 py-3 align-top min-w-[200px]">
                        <p className="line-clamp-3 text-slate-700 dark:text-slate-300" title={p.extractedData?.mainFindings}>{p.extractedData?.mainFindings || '-'}</p>
                      </td>
                      <td className="px-4 py-3 align-top min-w-[150px]">
                        <p className="line-clamp-3 text-slate-600 dark:text-slate-400" title={p.extractedData?.limitations}>{p.extractedData?.limitations || '-'}</p>
                      </td>
                      <td className="px-4 py-3 align-top min-w-[150px]">
                        <p className="line-clamp-3 text-slate-600 dark:text-slate-400" title={p.extractedData?.futureDirections}>{p.extractedData?.futureDirections || '-'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Knowledge Graph Visualization */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center text-slate-900 dark:text-slate-100">
          <Network className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
          Knowledge Graph
        </h3>
        <Card className="bg-slate-50 dark:bg-slate-900 overflow-hidden border-slate-200 dark:border-slate-800">
          <div ref={containerRef} className="w-full relative h-[400px]">
            <ForceGraph2D
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              nodeLabel="id"
              nodeAutoColorBy="group"
              nodeRelSize={6}
              linkColor={() => 'rgba(156, 163, 175, 0.4)'}
              linkDirectionalArrowLength={3.5}
              linkDirectionalArrowRelPos={1}
              onNodeDragEnd={(node: any) => {
                node.fx = node.x;
                node.fy = node.y;
              }}
            />
            <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
              {Array.from(new Set(evidence.entities.map(e => e.type))).map((type, i) => (
                <Badge key={i} variant="outline" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-[1fr_350px] gap-8">
        {/* Key Findings */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center text-slate-900 dark:text-slate-100">
            <ListChecks className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Synthesized Findings
          </h3>
          <Card className="bg-white dark:bg-slate-900 border-blue-100 dark:border-blue-900/30 shadow-sm shadow-blue-500/5">
            <CardContent className="p-6 space-y-4">
              {evidence.findings.map((finding, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-semibold text-sm">
                    {idx + 1}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed pt-1">{finding}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Knowledge Graph (Entities List) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center text-slate-900 dark:text-slate-100">
            <Network className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
            Extracted Entities
          </h3>
          <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
             <CardContent className="p-5 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
               {evidence.entities.map((entity, idx) => (
                 <div key={idx} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                   <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">{entity.label}</span>
                   <Badge variant="default" className="text-[10px] bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 dark:border-indigo-800/50 font-normal">
                     {entity.type}
                   </Badge>
                 </div>
               ))}
               
               <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Key Relationships</h4>
                  <div className="space-y-2">
                    {evidence.relationships.slice(0, 5).map((rel, idx) => (
                      <div key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 bg-white dark:bg-slate-900 p-2 rounded-md shadow-sm border border-slate-100 dark:border-slate-800">
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[100px]" title={rel.source}>{rel.source}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="italic text-[10px] text-slate-500 dark:text-slate-400">{rel.type}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[100px]" title={rel.target}>{rel.target}</span>
                      </div>
                    ))}
                  </div>
               </div>
             </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button onClick={onNext} className="group px-6 shadow-md shadow-blue-500/20">
          Discover Research Gaps
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
