// Project Management System Types

export interface ProjectMetadata {
  projectId: string;
  title: string;
  stage: ProjectStage;
  createdDate: string;
  lastUpdated: string;
  assignedAgents?: string[];
  estimatedCompletion?: string;
  priority: ProjectPriority;
  tags: string[];
  version: string;
}

export interface ProjectContext {
  // Human context
  problemStatement: string;
  businessValue: string[];
  successCriteria: string[];
  constraints: string[];
  stakeholders: string[];
  
  // AI agent context
  technicalRequirements: string[];
  dependencies: ProjectDependency[];
  acceptanceCriteria: string[];
  implementationGuidelines: string[];
  fileReferences: string[];
}

export interface ProjectDependency {
  name: string;
  type: 'project' | 'codebase' | 'infrastructure' | 'documentation';
  status: 'available' | 'in_progress' | 'blocked' | 'completed';
  description: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedAgent?: string;
  estimatedHours: number;
  dependencies: string[];
  deliverables: string[];
  acceptanceCriteria: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectProgress {
  currentStage: ProjectStage;
  currentPhase: string;
  completedTasks: number;
  totalTasks: number;
  completedDeliverables: number;
  totalDeliverables: number;
  blockers: ProjectBlocker[];
  lastActivity: string;
  nextAction: string;
}

export interface ProjectBlocker {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'escalated';
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ProjectDecision {
  id: string;
  title: string;
  description: string;
  rationale: string;
  alternatives: string[];
  impact: string;
  madeBy: string;
  madeAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ProjectHandoff {
  id: string;
  fromAgent: string;
  toAgent: string;
  context: string;
  status: string;
  deliverables: string[];
  notes: string;
  createdAt: string;
  acknowledgedAt?: string;
}

export interface ProjectStatus {
  projectId: string;
  name: string;
  version: string;
  stage: ProjectStage;
  phase: string;
  filesChanged: number;
  tasksCompleted: number;
  totalTasks: number;
  activeBlockers: number;
  commitsThisPhase: number;
  nextAction: string;
  nextVersion?: string;
  health: ProjectHealth;
  lastUpdated: string;
}

export interface ProjectHealth {
  score: number; // 0-100
  documentationQuality: number;
  progressTracking: number;
  dependencyManagement: number;
  riskAssessment: number;
  completionRate: number;
  indicators: {
    green: number;
    yellow: number;
    red: number;
  };
}

export interface ProjectValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export interface ValidationSuggestion {
  field: string;
  message: string;
  impact: 'low' | 'medium' | 'high';
}

export interface ProjectCommit {
  hash: string;
  message: string;
  projectId: string;
  version: string;
  phase: string;
  filesChanged: string[];
  timestamp: string;
  author: string;
}

export interface ProjectMetrics {
  projectId: string;
  version: string;
  stage: ProjectStage;
  metrics: {
    taskCompletionPercentage: number;
    blockerCount: number;
    estimatedVsActualTime: number;
    fileChangeCount: number;
    commitFrequency: number;
    versionProgression: number;
    planAdherencePercentage: number;
  };
  trends: {
    taskCompletion: number[];
    blockerResolution: number[];
    fileChanges: number[];
    commits: number[];
  };
  lastCalculated: string;
}

// Enums
export type ProjectStage = 
  | 'idea' 
  | 'plan' 
  | 'design' 
  | 'implementation' 
  | 'testing' 
  | 'review' 
  | 'deployment' 
  | 'completion';

export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export type TaskStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'completed' 
  | 'blocked' 
  | 'cancelled';

export type ProjectType = 
  | 'foundation' 
  | 'feature' 
  | 'analysis' 
  | 'refactor' 
  | 'bugfix' 
  | 'documentation';

// Project System Configuration
export interface ProjectSystemConfig {
  projectsPath: string;
  activePath: string;
  completedPath: string;
  ideasPath: string;
  templatesPath: string;
  versionsPath: string;
  schemaPath: string;
  autoValidation: boolean;
  autoCommit: boolean;
  statusReporting: boolean;
  healthMonitoring: boolean;
}

// Project Detection and Context Loading
export interface ProjectDetectionResult {
  projects: ProjectMetadata[];
  activeProjects: ProjectMetadata[];
  completedProjects: ProjectMetadata[];
  ideas: ProjectMetadata[];
  totalCount: number;
  lastScan: string;
}

export interface ProjectContextResult {
  project: ProjectMetadata;
  context: ProjectContext;
  progress: ProjectProgress;
  tasks: ProjectTask[];
  decisions: ProjectDecision[];
  blockers: ProjectBlocker[];
  handoffs: ProjectHandoff[];
  status: ProjectStatus;
  health: ProjectHealth;
  validation: ProjectValidation;
  metrics: ProjectMetrics;
  commits: ProjectCommit[];
}

// Project Management Operations
export interface ProjectOperation {
  type: 'create' | 'update' | 'delete' | 'move' | 'validate' | 'status' | 'health';
  projectId: string;
  data?: any;
  timestamp: string;
  agent: string;
}

export interface ProjectOperationResult {
  success: boolean;
  operation: ProjectOperation;
  result?: any;
  error?: string;
  timestamp: string;
}

// Project System Events
export interface ProjectEvent {
  type: string;
  projectId: string;
  data: any;
  timestamp: string;
  source: string;
}

export interface ProjectStatusEvent extends ProjectEvent {
  type: 'project.status.update';
  data: ProjectStatus;
}

export interface ProjectHealthEvent extends ProjectEvent {
  type: 'project.health.update';
  data: ProjectHealth;
}

export interface ProjectValidationEvent extends ProjectEvent {
  type: 'project.validation.update';
  data: ProjectValidation;
}

export interface ProjectCommitEvent extends ProjectEvent {
  type: 'project.commit';
  data: ProjectCommit;
}

// Project System State
export interface ProjectSystemState {
  config: ProjectSystemConfig;
  detection: ProjectDetectionResult;
  activeProjects: Record<string, ProjectContextResult>;
  systemHealth: {
    isHealthy: boolean;
    lastScan: string;
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    ideas: number;
    healthScore: number;
  };
  operations: ProjectOperationResult[];
  events: ProjectEvent[];
}

// Utility Types
export interface ProjectFileInfo {
  path: string;
  name: string;
  type: ProjectType;
  version: string;
  stage: ProjectStage;
  priority: ProjectPriority;
  lastModified: string;
  size: number;
}

export interface ProjectSearchResult {
  projects: ProjectFileInfo[];
  totalCount: number;
  searchTerm: string;
  filters: {
    stage?: ProjectStage[];
    priority?: ProjectPriority[];
    type?: ProjectType[];
    tags?: string[];
  };
}

export interface ProjectAnalytics {
  projectId: string;
  version: string;
  analytics: {
    timeSpent: number;
    commitsCount: number;
    filesChanged: number;
    tasksCompleted: number;
    blockersResolved: number;
    decisionsMade: number;
    handoffsCount: number;
  };
  trends: {
    daily: Record<string, number>;
    weekly: Record<string, number>;
    monthly: Record<string, number>;
  };
  insights: string[];
  recommendations: string[];
}
