import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  let ai: GoogleGenAI | null = null;
  try {
    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  } catch (e) {
    console.error("Failed to initialize Gemini", e);
  }

  // --- API Endpoints ---

  app.post("/api/interview", async (req, res) => {
    try {
      const { history } = req.body;
      if (!ai) return res.status(500).json({ error: "Gemini API key missing" });
      
      const prompt = `You are a helpful research supervisor guiding a student to narrow down their research scope.
The student will provide a broad research area. You must progressively ask ONE question at a time to narrow down the scope (e.g., Domain -> Subfield -> Specific Mechanism -> Interest -> Preferred Models -> Techniques -> Population -> Country -> Time Range -> Research Goal).
Do NOT ask everything at once. Keep your responses short and focused on the next logical question.
Always provide 2-4 "suggestedOptions" that the student could choose from to answer your question. These should be plausible, realistic research paths.
If you have gathered enough information to define a highly specific, novel research question (after 4-6 questions), summarize the final research interest in one clear sentence starting with "You are interested in...". Then ask "Is this correct?". When doing this, set "isComplete" to true and leave suggestedOptions empty.

History of conversation:
${history.map((h: any) => `${h.role}: ${h.text}`).join('\n')}

Based on the history, generate your next response.
If you are asking for confirmation with "Is this correct?", set "isComplete" to true. Otherwise, set it to false.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "The response text to show to the user" },
              isComplete: { type: Type.BOOLEAN, description: "True if the AI is asking 'Is this correct?' for the final summary" },
              suggestedOptions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Optional suggested answers for the user to pick from" }
            },
            required: ["text", "isComplete"]
          }
        }
      });
      
      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to process interview" });
    }
  });

  app.post("/api/intake", async (req, res) => {
    try {
      const { initialTopic } = req.body;
      if (!ai) return res.status(500).json({ error: "Gemini API key missing" });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an expert research methodologist. An investigator provides an initial broad topic. 
Respond with 3 specific, refined research directions that could be explored within this topic.

Topic: ${initialTopic}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              refinedTopics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    rationale: { type: Type.STRING }
                  },
                  required: ["title", "description", "rationale"]
                }
              }
            },
            required: ["refinedTopics"]
          }
        }
      });
      
      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to process intake" });
    }
  });

  app.post("/api/search-strategy", async (req, res) => {
    try {
      const { refinedTopic } = req.body;
      if (!ai) return res.status(500).json({ error: "Gemini API key missing" });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a comprehensive search strategy for a systematic review on this topic:
${refinedTopic}

Include a general boolean query, and database-specific syntax for PubMed, Scopus, Web of Science, and CrossRef. Also list the target databases and inclusion/exclusion criteria.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              booleanQuery: { type: Type.STRING },
              queries: {
                type: Type.OBJECT,
                properties: {
                  pubmed: { type: Type.STRING },
                  scopus: { type: Type.STRING },
                  webOfScience: { type: Type.STRING },
                  crossref: { type: Type.STRING }
                }
              },
              databases: { type: Type.ARRAY, items: { type: Type.STRING } },
              inclusionCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
              exclusionCriteria: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["booleanQuery", "queries", "databases", "inclusionCriteria", "exclusionCriteria"]
          }
        }
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate search strategy" });
    }
  });

  app.post("/api/retrieve-and-screen", async (req, res) => {
    try {
       const { query, inclusionCriteria } = req.body;
       if (!ai) return res.status(500).json({ error: "Gemini API key missing" });
       
       const realPapers: any[] = [];
       let totalIdentified = 0;

       // 1. Semantic Scholar
       try {
         const ssRes = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&fields=title,abstract,authors,year,venue,externalIds,citationCount,isOpenAccess&limit=15`);
         if (ssRes.ok) {
           const ssData = await ssRes.json();
           totalIdentified += ssData.total || (ssData.data?.length || 0);
           (ssData.data || []).forEach((p: any) => {
             if (p.title && p.abstract) {
               realPapers.push({
                 id: p.paperId || Math.random().toString(),
                 doi: p.externalIds?.DOI,
                 title: p.title,
                 authors: p.authors?.map((a: any) => a.name).join(', ') || 'Unknown',
                 year: p.year || new Date().getFullYear(),
                 journal: p.venue || 'Unknown Journal',
                 abstract: p.abstract,
                 citations: p.citationCount || 0,
                 openAccess: p.isOpenAccess || false,
                 source: 'Semantic Scholar'
               });
             }
           });
         }
       } catch (e) {
         console.error("Semantic Scholar fetch error:", e);
       }

       // 2. CrossRef
       try {
         const crRes = await fetch(`https://api.crossref.org/works?query=${encodeURIComponent(query)}&select=DOI,title,author,published,container-title,abstract,is-referenced-by-count&rows=15`);
         if (crRes.ok) {
           const crData = await crRes.json();
           totalIdentified += crData.message?.['total-results'] || 0;
           (crData.message?.items || []).forEach((p: any) => {
             if (p.title?.[0] && p.abstract) {
               // Clean up JATS abstract from Crossref
               const cleanAbstract = p.abstract.replace(/<[^>]+>/g, '').trim();
               realPapers.push({
                 id: p.DOI || Math.random().toString(),
                 doi: p.DOI,
                 title: p.title[0],
                 authors: p.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()).join(', ') || 'Unknown',
                 year: p.published?.['date-parts']?.[0]?.[0] || new Date().getFullYear(),
                 journal: p['container-title']?.[0] || 'Unknown Journal',
                 abstract: cleanAbstract,
                 citations: p['is-referenced-by-count'] || 0,
                 openAccess: false,
                 source: 'CrossRef'
               });
             }
           });
         }
       } catch (e) {
         console.error("CrossRef fetch error:", e);
       }

       // 3. OpenAlex
       try {
         const oaRes = await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=15`);
         if (oaRes.ok) {
           const oaData = await oaRes.json();
           totalIdentified += oaData.meta?.count || 0;
           (oaData.results || []).forEach((p: any) => {
             if (p.title && p.abstract_inverted_index) {
               // Reconstruct abstract from inverted index
               let abstractWords: any[] = [];
               for (const [word, positions] of Object.entries(p.abstract_inverted_index || {})) {
                 (positions as number[]).forEach(pos => {
                   abstractWords[pos] = word;
                 });
               }
               const abstract = abstractWords.filter(Boolean).join(' ');
               
               realPapers.push({
                 id: p.id || p.doi || Math.random().toString(),
                 doi: p.doi?.replace('https://doi.org/', ''),
                 title: p.title,
                 authors: p.authorships?.map((a: any) => a.author?.display_name).join(', ') || 'Unknown',
                 year: p.publication_year || new Date().getFullYear(),
                 journal: p.primary_location?.source?.display_name || 'Unknown Journal',
                 abstract: abstract,
                 citations: p.cited_by_count || 0,
                 openAccess: p.open_access?.is_oa || false,
                 source: 'OpenAlex'
               });
             }
           });
         }
       } catch (e) {
         console.error("OpenAlex fetch error:", e);
       }

       // 4. Europe PMC (includes PubMed)
       try {
         const epmcRes = await fetch(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&resultType=core&pageSize=15`);
         if (epmcRes.ok) {
           const epmcData = await epmcRes.json();
           totalIdentified += epmcData.hitCount || 0;
           (epmcData.resultList?.result || []).forEach((p: any) => {
             if (p.title && p.abstractText) {
               realPapers.push({
                 id: p.pmid || p.doi || Math.random().toString(),
                 doi: p.doi,
                 title: p.title,
                 authors: p.authorString || 'Unknown',
                 year: p.pubYear || new Date().getFullYear(),
                 journal: p.journalTitle || 'Unknown Journal',
                 abstract: p.abstractText.replace(/<[^>]+>/g, '').trim(),
                 citations: p.citedByCount || 0,
                 openAccess: p.isOpenAccess === 'Y',
                 source: 'Europe PMC'
               });
             }
           });
         }
       } catch (e) {
         console.error("Europe PMC fetch error:", e);
       }

       // Deduplication logic
       const dedupedPapers: any[] = [];
       const seenDois = new Set();
       const seenTitles = new Set();

       for (const paper of realPapers) {
         const normTitle = paper.title.toLowerCase().replace(/[^a-z0-9]/g, '');
         let isDuplicate = false;
         
         if (paper.doi && seenDois.has(paper.doi)) {
           isDuplicate = true;
         } else if (seenTitles.has(normTitle)) {
           isDuplicate = true;
         }

         if (!isDuplicate) {
           if (paper.doi) seenDois.add(paper.doi);
           seenTitles.add(normTitle);
           dedupedPapers.push(paper);
         }
       }

       const duplicatesRemoved = realPapers.length - dedupedPapers.length;

       if (dedupedPapers.length === 0) {
         return res.json({
           papers: [],
           prisma: { identified: totalIdentified, duplicatesRemoved: 0, screened: 0, excluded: 0, included: 0 }
         });
       }

       // Limit to top 10 for AI screening to save tokens
       const papersToScreen = dedupedPapers.slice(0, 10);

       // Screen the real papers using Gemini
       const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Evaluate the following real research papers against the provided inclusion/exclusion criteria.
        
Inclusion/Exclusion criteria:
${inclusionCriteria?.join('\n') || 'Include studies relevant to the topic.'}

Papers:
${JSON.stringify(papersToScreen, null, 2)}

For each paper, determine if it should be 'Included' or 'Excluded', provide a short reasoning, and extract PICO elements (Population, Intervention, Outcome), Study Design, and a Relevance Score (1-100). Generate a PRISMA flow summary using these numbers:
Identified (from all DBs): ${totalIdentified}
Duplicates Removed: ${duplicatesRemoved}
Screened: ${papersToScreen.length}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              papers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    doi: { type: Type.STRING },
                    title: { type: Type.STRING },
                    authors: { type: Type.STRING },
                    year: { type: Type.INTEGER },
                    journal: { type: Type.STRING },
                    abstract: { type: Type.STRING },
                    citations: { type: Type.INTEGER },
                    openAccess: { type: Type.BOOLEAN },
                    decision: { type: Type.STRING, description: "Included or Excluded" },
                    reasoning: { type: Type.STRING },
                    population: { type: Type.STRING },
                    intervention: { type: Type.STRING },
                    outcome: { type: Type.STRING },
                    studyDesign: { type: Type.STRING },
                    relevanceScore: { type: Type.INTEGER, description: "Score from 1-100 based on relevance to criteria" }
                  },
                  required: ["id", "title", "authors", "year", "journal", "abstract", "decision", "reasoning", "population", "intervention", "outcome", "studyDesign", "relevanceScore"]
                }
              },
              prisma: {
                type: Type.OBJECT,
                properties: {
                  identified: { type: Type.INTEGER },
                  duplicatesRemoved: { type: Type.INTEGER },
                  screened: { type: Type.INTEGER },
                  excluded: { type: Type.INTEGER },
                  included: { type: Type.INTEGER }
                },
                required: ["identified", "duplicatesRemoved", "screened", "excluded", "included"]
              }
            },
            required: ["papers", "prisma"]
          }
        }
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve literature" });
    }
  });

  app.post("/api/extract-evidence", async (req, res) => {
    try {
      const { papers } = req.body;
      if (!ai) return res.status(500).json({ error: "Gemini API key missing" });
      
      const papersText = papers.map((p: any) => `ID: ${p.id}\nTitle: ${p.title}\nAbstract: ${p.abstract}`).join('\n\n');

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Extract a knowledge graph and key findings from these included papers:\n\n${papersText}\n
Identify key entities (concepts, interventions, outcomes) and relationships. Provide a summary of overall findings.
Also, for each paper, simulate a full-text extraction by providing structured data (Aim, Methods, Sample, Main Findings, Limitations, Future Directions) based on the abstract.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              entities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    type: { type: Type.STRING }
                  },
                  required: ["id", "label", "type"]
                }
              },
              relationships: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    source: { type: Type.STRING },
                    target: { type: Type.STRING },
                    type: { type: Type.STRING }
                  },
                  required: ["source", "target", "type"]
                }
              },
              findings: { type: Type.ARRAY, items: { type: Type.STRING } },
              structuredData: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    paperId: { type: Type.STRING },
                    aim: { type: Type.STRING },
                    methods: { type: Type.STRING },
                    sample: { type: Type.STRING },
                    mainFindings: { type: Type.STRING },
                    limitations: { type: Type.STRING },
                    futureDirections: { type: Type.STRING }
                  },
                  required: ["paperId", "aim", "methods", "sample", "mainFindings", "limitations", "futureDirections"]
                }
              }
            },
            required: ["entities", "relationships", "findings", "structuredData"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      
      // Merge structured data back into papers
      const enrichedPapers = papers.map((p: any) => {
        const sd = data.structuredData?.find((s: any) => s.paperId === p.id);
        return {
          ...p,
          extractedData: sd ? {
            aim: sd.aim,
            methods: sd.methods,
            sample: sd.sample,
            mainFindings: sd.mainFindings,
            limitations: sd.limitations,
            futureDirections: sd.futureDirections
          } : undefined
        };
      });

      res.json({
        entities: data.entities || [],
        relationships: data.relationships || [],
        findings: data.findings || [],
        papers: enrichedPapers
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to extract evidence" });
    }
  });

  app.post("/api/discover-gaps", async (req, res) => {
    try {
      const { findings, papers } = req.body;
      if (!ai) return res.status(500).json({ error: "Gemini API key missing" });

      const papersContext = papers?.map((p: any) => `Paper: ${p.title}\nFindings: ${p.extractedData?.mainFindings}\nLimitations: ${p.extractedData?.limitations}\nFuture Work: ${p.extractedData?.futureDirections}`).join('\n\n') || findings.join('\n');

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze these research papers and findings to identify 3 distinct research gaps that represent novel opportunities.

Rather than simply stating "future work," identify patterns across the entire evidence base by analyzing:
- repeated limitations
- contradictory findings
- underrepresented populations
- understudied mechanisms
- missing technologies
- geographic gaps
- temporal trends
- methodological weaknesses
- inconsistent biomarkers
- untested hypotheses

For each proposed gap, generate metrics (1-100) based on existing evidence volume, citation density, recent publication activity, population coverage, method diversity, geographic coverage, and feasibility.

Context:
${papersContext}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              gaps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    objectives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific research objectives for this gap" },
                    hypotheses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Testable hypotheses" },
                    suggestedMethodology: { type: Type.STRING, description: "Suggested study design and methodology" },
                    metrics: {
                      type: Type.OBJECT,
                      properties: {
                        gapScore: { type: Type.INTEGER, description: "1-100 overall gap score" },
                        novelty: { type: Type.INTEGER, description: "1-100" },
                        clinicalRelevance: { type: Type.INTEGER, description: "1-100" },
                        publicationPotential: { type: Type.INTEGER, description: "1-100" },
                        fundingPotential: { type: Type.INTEGER, description: "1-100" },
                        difficulty: { type: Type.INTEGER, description: "1-100" }
                      },
                      required: ["gapScore", "novelty", "clinicalRelevance", "publicationPotential", "fundingPotential", "difficulty"]
                    }
                  },
                  required: ["id", "title", "description", "objectives", "hypotheses", "suggestedMethodology", "metrics"]
                }
              }
            },
            required: ["gaps"]
          }
        }
      });
      
      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to discover gaps" });
    }
  });

  app.post("/api/generate-proposal", async (req, res) => {
    try {
      const { gap } = req.body;
      if (!ai) return res.status(500).json({ error: "Gemini API key missing" });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a structured research proposal based on this identified gap:\nTitle: ${gap.title}\nDescription: ${gap.description}\nObjectives: ${gap.objectives?.join(', ')}\n\nInclude a Background, Problem statement, Gap justification, Objectives, Hypotheses, Methods, PRISMA protocol, Data extraction forms, Statistical analysis plan, and a Suggested Tech Stack (Frontend, Backend, AI, Database, Storage, Background Jobs).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              background: { type: Type.STRING },
              problemStatement: { type: Type.STRING },
              gapJustification: { type: Type.STRING },
              objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
              hypotheses: { type: Type.ARRAY, items: { type: Type.STRING } },
              methods: { type: Type.STRING },
              prismaProtocol: { type: Type.STRING },
              dataExtractionForms: { type: Type.STRING },
              statisticalAnalysisPlan: { type: Type.STRING },
              suggestedTechStack: {
                type: Type.OBJECT,
                properties: {
                  frontend: { type: Type.STRING },
                  backend: { type: Type.STRING },
                  ai: { type: Type.STRING },
                  database: { type: Type.STRING },
                  storage: { type: Type.STRING },
                  backgroundJobs: { type: Type.STRING }
                },
                required: ["frontend", "backend", "ai", "database", "storage", "backgroundJobs"]
              }
            },
            required: ["title", "background", "problemStatement", "gapJustification", "objectives", "hypotheses", "methods", "prismaProtocol", "dataExtractionForms", "statisticalAnalysisPlan", "suggestedTechStack"]
          }
        }
      });
      
      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate proposal" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
