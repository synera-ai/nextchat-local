// Project Detection and Context Loading System

import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { 
  ProjectMetadata, 
  ProjectContext, 
  ProjectDetectionResult, 
  ProjectContextResult,
  ProjectStage,
  ProjectPriority,
  ProjectType,
  ProjectSystemConfig,
  ProjectFileInfo,
  ProjectSearchResult
} from '../types/project';

export class ProjectDetector {
  private config: ProjectSystemConfig;
  private cache: Map<string, ProjectContextResult> = new Map();
  private lastScan: Date | null = null;

  constructor(config: ProjectSystemConfig) {
    this.config = config;
  }

  /**
   * Scan for all projects in the system
   */
  async scanProjects(): Promise<ProjectDetectionResult> {
    try {
      const [activeProjects, completedProjects, ideas] = await Promise.all([
        this.scanDirectory(this.config.activePath),
        this.scanDirectory(this.config.completedPath),
        this.scanDirectory(this.config.ideasPath)
      ]);

      const allProjects = [...activeProjects, ...completedProjects, ...ideas];
      
      this.lastScan = new Date();

      return {
        projects: allProjects,
        activeProjects,
        completedProjects,
        ideas,
        totalCount: allProjects.length,
        lastScan: this.lastScan.toISOString()
      };
    } catch (error) {
      console.error('Error scanning projects:', error);
      throw new Error(`Failed to scan projects: ${error.message}`);
    }
  }

  /**
   * Load full project context
   */
  async loadProjectContext(projectId: string): Promise<ProjectContextResult> {
    // Check cache first
    if (this.cache.has(projectId)) {
      return this.cache.get(projectId)!;
    }

    try {
      const projectFile = await this.findProjectFile(projectId);
      if (!projectFile) {
        throw new Error(`Project file not found: ${projectId}`);
      }

      const content = await fs.readFile(projectFile, 'utf-8');
      const projectData = this.parseProjectFile(content, projectFile);
      
      const context: ProjectContextResult = {
        project: projectData.metadata,
        context: projectData.context,
        progress: projectData.progress,
        tasks: projectData.tasks,
        decisions: projectData.decisions,
        blockers: projectData.blockers,
        handoffs: projectData.handoffs,
        status: await this.generateProjectStatus(projectData),
        health: await this.calculateProjectHealth(projectData),
        validation: await this.validateProject(projectData),
        metrics: await this.calculateProjectMetrics(projectData),
        commits: await this.getProjectCommits(projectId)
      };

      // Cache the result
      this.cache.set(projectId, context);
      
      return context;
    } catch (error) {
      console.error(`Error loading project context for ${projectId}:`, error);
      throw new Error(`Failed to load project context: ${error.message}`);
    }
  }

  /**
   * Search for projects
   */
  async searchProjects(
    searchTerm: string,
    filters: {
      stage?: ProjectStage[];
      priority?: ProjectPriority[];
      type?: ProjectType[];
      tags?: string[];
    } = {}
  ): Promise<ProjectSearchResult> {
    const detection = await this.scanProjects();
    let projects = detection.projects;

    // Apply text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      projects = projects.filter(project => 
        project.title.toLowerCase().includes(term) ||
        project.projectId.toLowerCase().includes(term) ||
        project.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Apply filters
    if (filters.stage && filters.stage.length > 0) {
      projects = projects.filter(project => filters.stage!.includes(project.stage));
    }

    if (filters.priority && filters.priority.length > 0) {
      projects = projects.filter(project => filters.priority!.includes(project.priority));
    }

    if (filters.type && filters.type.length > 0) {
      projects = projects.filter(project => {
        const projectType = this.extractProjectType(project.projectId);
        return filters.type!.includes(projectType);
      });
    }

    if (filters.tags && filters.tags.length > 0) {
      projects = projects.filter(project => 
        filters.tags!.some(tag => project.tags.includes(tag))
      );
    }

    return {
      projects: projects.map(project => this.metadataToFileInfo(project)),
      totalCount: projects.length,
      searchTerm,
      filters
    };
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: string): Promise<ProjectContextResult | null> {
    try {
      return await this.loadProjectContext(projectId);
    } catch (error) {
      console.error(`Error getting project ${projectId}:`, error);
      return null;
    }
  }

  /**
   * Check if project exists
   */
  async projectExists(projectId: string): Promise<boolean> {
    try {
      const projectFile = await this.findProjectFile(projectId);
      return projectFile !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get project file path
   */
  async getProjectFilePath(projectId: string): Promise<string | null> {
    return await this.findProjectFile(projectId);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; lastScan: Date | null } {
    return {
      size: this.cache.size,
      lastScan: this.lastScan
    };
  }

  // Private methods

  private async scanDirectory(dirPath: string): Promise<ProjectMetadata[]> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const projects: ProjectMetadata[] = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          const subProjects = await this.scanDirectory(path.join(dirPath, entry.name));
          projects.push(...subProjects);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          // Parse project file
          try {
            const filePath = path.join(dirPath, entry.name);
            const content = await fs.readFile(filePath, 'utf-8');
            const projectData = this.parseProjectFile(content, filePath);
            projects.push(projectData.metadata);
          } catch (error) {
            console.warn(`Error parsing project file ${entry.name}:`, error);
          }
        }
      }

      return projects;
    } catch (error) {
      console.warn(`Error scanning directory ${dirPath}:`, error);
      return [];
    }
  }

  private async findProjectFile(projectId: string): Promise<string | null> {
    const searchPaths = [
      this.config.activePath,
      this.config.completedPath,
      this.config.ideasPath
    ];

    for (const searchPath of searchPaths) {
      try {
        const filePath = await this.findProjectFileInDirectory(searchPath, projectId);
        if (filePath) {
          return filePath;
        }
      } catch (error) {
        console.warn(`Error searching in ${searchPath}:`, error);
      }
    }

    return null;
  }

  private async findProjectFileInDirectory(dirPath: string, projectId: string): Promise<string | null> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          // Recursively search subdirectories
          const result = await this.findProjectFileInDirectory(
            path.join(dirPath, entry.name), 
            projectId
          );
          if (result) {
            return result;
          }
        } else if (entry.isFile() && entry.name.includes(projectId)) {
          return path.join(dirPath, entry.name);
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private parseProjectFile(content: string, filePath: string): any {
    try {
      // Extract YAML frontmatter
      const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!yamlMatch) {
        throw new Error('No YAML frontmatter found');
      }

      const yamlContent = yamlMatch[1];
      const metadata = yaml.load(yamlContent) as any;

      // Extract project ID from filename
      const fileName = path.basename(filePath, '.md');
      const projectId = this.extractProjectId(fileName);

      // Parse the rest of the content
      const markdownContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');
      
      return {
        metadata: {
          projectId,
          title: metadata.title || fileName,
          stage: metadata.stage || 'plan',
          createdDate: metadata.createdDate || new Date().toISOString().split('T')[0],
          lastUpdated: metadata.lastUpdated || new Date().toISOString().split('T')[0],
          assignedAgents: metadata.assignedAgents || [],
          estimatedCompletion: metadata.estimatedCompletion,
          priority: metadata.priority || 'medium',
          tags: metadata.tags || [],
          version: this.extractVersion(fileName)
        },
        context: this.parseProjectContext(markdownContent),
        progress: this.parseProjectProgress(markdownContent),
        tasks: this.parseProjectTasks(markdownContent),
        decisions: this.parseProjectDecisions(markdownContent),
        blockers: this.parseProjectBlockers(markdownContent),
        handoffs: this.parseProjectHandoffs(markdownContent)
      };
    } catch (error) {
      console.error('Error parsing project file:', error);
      throw new Error(`Failed to parse project file: ${error.message}`);
    }
  }

  private extractProjectId(fileName: string): string {
    // Extract project ID from filename like "feature-basic-project-system-implementation-v1.0.0"
    const parts = fileName.split('-');
    const versionIndex = parts.findIndex(part => part.match(/^v\d+\.\d+\.\d+$/));
    
    if (versionIndex > 0) {
      return parts.slice(0, versionIndex).join('-');
    }
    
    return fileName;
  }

  private extractVersion(fileName: string): string {
    const versionMatch = fileName.match(/v(\d+\.\d+\.\d+)/);
    return versionMatch ? versionMatch[0] : 'v1.0.0';
  }

  private extractProjectType(projectId: string): ProjectType {
    const typeMatch = projectId.match(/^(foundation|feature|analysis|refactor|bugfix|documentation)-/);
    return typeMatch ? typeMatch[1] as ProjectType : 'feature';
  }

  private parseProjectContext(content: string): ProjectContext {
    // Parse human context and AI agent context sections
    const humanContextMatch = content.match(/## Human Context\s*\n([\s\S]*?)(?=\n## |$)/);
    const aiContextMatch = content.match(/## AI Agent Context\s*\n([\s\S]*?)(?=\n## |$)/);

    return {
      problemStatement: this.extractField(humanContextMatch?.[1], 'Problem Statement') || '',
      businessValue: this.extractListField(humanContextMatch?.[1], 'Business Value') || [],
      successCriteria: this.extractListField(humanContextMatch?.[1], 'Success Criteria') || [],
      constraints: this.extractListField(humanContextMatch?.[1], 'Constraints') || [],
      stakeholders: this.extractListField(humanContextMatch?.[1], 'Stakeholders') || [],
      technicalRequirements: this.extractListField(aiContextMatch?.[1], 'Technical Requirements') || [],
      dependencies: this.parseDependencies(aiContextMatch?.[1]),
      acceptanceCriteria: this.extractListField(aiContextMatch?.[1], 'Acceptance Criteria') || [],
      implementationGuidelines: this.extractListField(aiContextMatch?.[1], 'Implementation Guidelines') || [],
      fileReferences: this.extractListField(aiContextMatch?.[1], 'File References') || []
    };
  }

  private parseProjectProgress(content: string): any {
    // Parse current stage and progress information
    const currentStageMatch = content.match(/### Stage: (\w+)/);
    const tasksMatch = content.match(/### Tasks\s*\n([\s\S]*?)(?=\n### |$)/);
    
    return {
      currentStage: currentStageMatch?.[1] || 'plan',
      currentPhase: 'planning',
      completedTasks: 0,
      totalTasks: this.countTasks(tasksMatch?.[1]),
      completedDeliverables: 0,
      totalDeliverables: 0,
      blockers: [],
      lastActivity: new Date().toISOString(),
      nextAction: 'Continue planning'
    };
  }

  private parseProjectTasks(content: string): any[] {
    const tasksMatch = content.match(/### Tasks\s*\n([\s\S]*?)(?=\n### |$)/);
    if (!tasksMatch) return [];

    const taskLines = tasksMatch[1].split('\n').filter(line => line.trim().startsWith('-'));
    return taskLines.map((line, index) => {
      const taskMatch = line.match(/^- \*\*([^*]+)\*\*: (.+)/);
      if (taskMatch) {
        return {
          id: `task-${index + 1}`,
          title: taskMatch[1],
          description: taskMatch[2],
          status: 'pending' as const,
          estimatedHours: 1,
          dependencies: [],
          deliverables: [],
          acceptanceCriteria: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return null;
    }).filter(Boolean);
  }

  private parseProjectDecisions(content: string): any[] {
    const decisionsMatch = content.match(/## Decisions\s*\n([\s\S]*?)(?=\n## |$)/);
    if (!decisionsMatch) return [];

    const decisionLines = decisionsMatch[1].split('\n').filter(line => line.trim().startsWith('-'));
    return decisionLines.map((line, index) => {
      const decisionMatch = line.match(/^- \*\*([^*]+)\*\* - \*\*Decision\*\*: (.+)/);
      if (decisionMatch) {
        return {
          id: `decision-${index + 1}`,
          title: decisionMatch[1],
          description: decisionMatch[2],
          rationale: '',
          alternatives: [],
          impact: '',
          madeBy: 'Human Developer',
          madeAt: new Date().toISOString()
        };
      }
      return null;
    }).filter(Boolean);
  }

  private parseProjectBlockers(content: string): any[] {
    const blockersMatch = content.match(/## Blockers\s*\n([\s\S]*?)(?=\n## |$)/);
    if (!blockersMatch) return [];

    const blockerLines = blockersMatch[1].split('\n').filter(line => line.trim());
    return blockerLines.map((line, index) => {
      if (line.includes('None currently identified')) {
        return null;
      }
      return {
        id: `blocker-${index + 1}`,
        title: line.replace(/^- /, ''),
        description: '',
        priority: 'medium' as const,
        status: 'active' as const,
        createdAt: new Date().toISOString()
      };
    }).filter(Boolean);
  }

  private parseProjectHandoffs(content: string): any[] {
    const handoffsMatch = content.match(/## Handoff Notes\s*\n([\s\S]*?)(?=\n## |$)/);
    if (!handoffsMatch) return [];

    const handoffLines = handoffsMatch[1].split('\n').filter(line => line.trim());
    return handoffLines.map((line, index) => {
      if (line.includes('No handoffs yet')) {
        return null;
      }
      return {
        id: `handoff-${index + 1}`,
        fromAgent: 'unknown',
        toAgent: 'unknown',
        context: line,
        status: 'pending',
        deliverables: [],
        notes: '',
        createdAt: new Date().toISOString()
      };
    }).filter(Boolean);
  }

  private parseDependencies(content?: string): any[] {
    if (!content) return [];
    
    const depsMatch = content.match(/### Dependencies\s*\n([\s\S]*?)(?=\n### |$)/);
    if (!depsMatch) return [];

    const depLines = depsMatch[1].split('\n').filter(line => line.trim().startsWith('-'));
    return depLines.map(line => {
      const depMatch = line.match(/^- \*\*([^*]+)\*\* \(type: (\w+)\)\s*\n\s*- Status: (\w+)\s*\n\s*- Description: (.+)/);
      if (depMatch) {
        return {
          name: depMatch[1],
          type: depMatch[2],
          status: depMatch[3],
          description: depMatch[4]
        };
      }
      return null;
    }).filter(Boolean);
  }

  private extractField(content: string | undefined, fieldName: string): string | null {
    if (!content) return null;
    
    const regex = new RegExp(`### ${fieldName}\\s*\\n([\\s\\S]*?)(?=\\n### |$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : null;
  }

  private extractListField(content: string | undefined, fieldName: string): string[] {
    if (!content) return [];
    
    const field = this.extractField(content, fieldName);
    if (!field) return [];

    return field
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^- /, '').trim())
      .filter(Boolean);
  }

  private countTasks(content: string | undefined): number {
    if (!content) return 0;
    
    return content.split('\n').filter(line => 
      line.trim().startsWith('-') && line.includes('**')
    ).length;
  }

  private metadataToFileInfo(metadata: ProjectMetadata): ProjectFileInfo {
    return {
      path: '',
      name: `${metadata.projectId}-${metadata.version}.md`,
      type: this.extractProjectType(metadata.projectId),
      version: metadata.version,
      stage: metadata.stage,
      priority: metadata.priority,
      lastModified: metadata.lastUpdated,
      size: 0
    };
  }

  // Placeholder methods for future implementation
  private async generateProjectStatus(projectData: any): Promise<any> {
    return {
      projectId: projectData.metadata.projectId,
      name: projectData.metadata.title,
      version: projectData.metadata.version,
      stage: projectData.metadata.stage,
      phase: 'planning',
      filesChanged: 0,
      tasksCompleted: 0,
      totalTasks: projectData.tasks.length,
      activeBlockers: projectData.blockers.length,
      commitsThisPhase: 0,
      nextAction: 'Continue planning',
      health: { score: 75, indicators: { green: 0, yellow: 0, red: 0 } },
      lastUpdated: new Date().toISOString()
    };
  }

  private async calculateProjectHealth(projectData: any): Promise<any> {
    return {
      score: 75,
      documentationQuality: 85,
      progressTracking: 60,
      dependencyManagement: 70,
      riskAssessment: 80,
      completionRate: 20,
      indicators: { green: 0, yellow: 0, red: 0 }
    };
  }

  private async validateProject(projectData: any): Promise<any> {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };
  }

  private async calculateProjectMetrics(projectData: any): Promise<any> {
    return {
      projectId: projectData.metadata.projectId,
      version: projectData.metadata.version,
      stage: projectData.metadata.stage,
      metrics: {
        taskCompletionPercentage: 0,
        blockerCount: projectData.blockers.length,
        estimatedVsActualTime: 0,
        fileChangeCount: 0,
        commitFrequency: 0,
        versionProgression: 0,
        planAdherencePercentage: 0
      },
      trends: {
        taskCompletion: [],
        blockerResolution: [],
        fileChanges: [],
        commits: []
      },
      lastCalculated: new Date().toISOString()
    };
  }

  private async getProjectCommits(projectId: string): Promise<any[]> {
    // Placeholder - would integrate with Git
    return [];
  }
}
