export interface RefinedTopic {
  title: string;
  description: string;
  rationale: string;
}

export interface SearchStrategy {
  booleanQuery: string;
  queries: {
    pubmed?: string;
    scopus?: string;
    webOfScience?: string;
    crossref?: string;
  };
  databases: string[];
  inclusionCriteria: string[];
  exclusionCriteria: string[];
}

export interface Paper {
  id: string;
  doi?: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  abstract: string;
  keywords?: string[];
  citations?: number;
  openAccess?: boolean;
  decision: 'Included' | 'Excluded' | string;
  reasoning: string;
  population?: string;
  intervention?: string;
  outcome?: string;
  studyDesign?: string;
  relevanceScore?: number;
  userDecision?: 'Included' | 'Excluded' | 'Pending';
  extractedData?: {
    aim: string;
    methods: string;
    sample: string;
    mainFindings: string;
    limitations: string;
    futureDirections: string;
  };
}

export interface PrismaFlow {
  identified: number;
  duplicatesRemoved: number;
  screened: number;
  excluded: number;
  included: number;
}

export interface Entity {
  id: string;
  label: string;
  type: string;
}

export interface Relationship {
  source: string;
  target: string;
  type: string;
}

export interface Evidence {
  entities: Entity[];
  relationships: Relationship[];
  findings: string[];
  papers?: Paper[];
}

export interface Gap {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  hypotheses: string[];
  suggestedMethodology: string;
  metrics: {
    gapScore: number;
    novelty: number;
    clinicalRelevance: number;
    publicationPotential: number;
    fundingPotential: number;
    difficulty: number;
  };
}

export interface Proposal {
  title: string;
  background: string;
  problemStatement: string;
  gapJustification: string;
  objectives: string[];
  hypotheses: string[];
  methods: string;
  prismaProtocol: string;
  dataExtractionForms: string;
  statisticalAnalysisPlan: string;
  suggestedTechStack: {
    frontend: string;
    backend: string;
    ai: string;
    database: string;
    storage: string;
    backgroundJobs: string;
  };
}

export interface WorkflowState {
  step: number;
  initialTopic: string;
  refinedTopics: RefinedTopic[] | null;
  selectedTopicIndex: number | null;
  searchStrategy: SearchStrategy | null;
  papers: Paper[] | null;
  prisma: PrismaFlow | null;
  evidence: Evidence | null;
  gaps: Gap[] | null;
  selectedGapIndex: number | null;
  proposal: Proposal | null;
  isLoading: boolean;
  error: string | null;
}
