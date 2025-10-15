// Project Management System Core

import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { ProjectDetector } from './project-detector';
import { 
  ProjectMetadata, 
  ProjectContext, 
  ProjectContextResult,
  ProjectSystemConfig,
  ProjectOperation,
  ProjectOperationResult,
  ProjectStatus,
  ProjectHealth,
  ProjectValidation,
  ProjectSystemState
} from '../types/project';

export class ProjectManager {
  private detector: ProjectDetector;
  private config: ProjectSystemConfig;
  private state: ProjectSystemState;

  constructor(config: ProjectSystemConfig) {
    this.config = config;
    this.detector = new ProjectDetector(config);
    this.state = this.initializeState();
  }

  /**
   * Initialize the project management system
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Project Management System...');
      
      // Scan for existing projects
      const detection = await this.detector.scanProjects();
      this.state.detection = detection;
      
      // Load active projects
      await this.loadActiveProjects();
      
      // Update system health
      this.updateSystemHealth();
      
      console.log(`Project Management System initialized with ${detection.totalCount} projects`);
    } catch (error) {
      console.error('Failed to initialize Project Management System:', error);
      throw error;
    }
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: string): Promise<ProjectContextResult | null> {
    try {
      return await this.detector.getProject(projectId);
    } catch (error) {
      console.error(`Error getting project ${projectId}:`, error);
      return null;
    }
  }

  /**
   * Get all active projects
   */
  async getActiveProjects(): Promise<ProjectContextResult[]> {
    const activeProjectIds = this.state.detection.activeProjects.map(p => p.projectId);
    const projects: ProjectContextResult[] = [];

    for (const projectId of activeProjectIds) {
      const project = await this.getProject(projectId);
      if (project) {
        projects.push(project);
      }
    }

    return projects;
  }

  /**
   * Get project status
   */
  async getProjectStatus(projectId: string): Promise<ProjectStatus | null> {
    const project = await this.getProject(projectId);
    return project?.status || null;
  }

  /**
   * Get project health
   */
  async getProjectHealth(projectId: string): Promise<ProjectHealth | null> {
    const project = await this.getProject(projectId);
    return project?.health || null;
  }

  /**
   * Validate project
   */
  async validateProject(projectId: string): Promise<ProjectValidation | null> {
    const project = await this.getProject(projectId);
    return project?.validation || null;
  }

  /**
   * Update project
   */
  async updateProject(
    projectId: string, 
    updates: Partial<ProjectMetadata>,
    agent: string = 'system'
  ): Promise<ProjectOperationResult> {
    try {
      const operation: ProjectOperation = {
        type: 'update',
        projectId,
        data: updates,
        timestamp: new Date().toISOString(),
        agent
      };

      // Find and update project file
      const projectFilePath = await this.detector.getProjectFilePath(projectId);
      if (!projectFilePath) {
        throw new Error(`Project file not found: ${projectId}`);
      }

      const content = await fs.readFile(projectFilePath, 'utf-8');
      const updatedContent = this.updateProjectFile(content, updates);
      await fs.writeFile(projectFilePath, updatedContent, 'utf-8');

      // Clear cache for this project
      this.detector.clearCache();

      const result: ProjectOperationResult = {
        success: true,
        operation,
        result: { projectId, updates },
        timestamp: new Date().toISOString()
      };

      this.state.operations.push(result);
      return result;
    } catch (error) {
      const result: ProjectOperationResult = {
        success: false,
        operation: {
          type: 'update',
          projectId,
          data: updates,
          timestamp: new Date().toISOString(),
          agent
        },
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.state.operations.push(result);
      return result;
    }
  }

  /**
   * Create new project
   */
  async createProject(
    metadata: ProjectMetadata,
    context: ProjectContext,
    agent: string = 'system'
  ): Promise<ProjectOperationResult> {
    try {
      const operation: ProjectOperation = {
        type: 'create',
        projectId: metadata.projectId,
        data: { metadata, context },
        timestamp: new Date().toISOString(),
        agent
      };

      // Determine file path based on stage
      const fileName = this.generateProjectFileName(metadata);
      const filePath = path.join(this.config.activePath, fileName);

      // Create project file content
      const content = this.generateProjectFileContent(metadata, context);
      await fs.writeFile(filePath, content, 'utf-8');

      // Clear cache and rescan
      this.detector.clearCache();
      const detection = await this.detector.scanProjects();
      this.state.detection = detection;

      const result: ProjectOperationResult = {
        success: true,
        operation,
        result: { projectId: metadata.projectId, filePath },
        timestamp: new Date().toISOString()
      };

      this.state.operations.push(result);
      return result;
    } catch (error) {
      const result: ProjectOperationResult = {
        success: false,
        operation: {
          type: 'create',
          projectId: metadata.projectId,
          data: { metadata, context },
          timestamp: new Date().toISOString(),
          agent
        },
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.state.operations.push(result);
      return result;
    }
  }

  /**
   * Move project between stages
   */
  async moveProject(
    projectId: string,
    newStage: string,
    agent: string = 'system'
  ): Promise<ProjectOperationResult> {
    try {
      const operation: ProjectOperation = {
        type: 'move',
        projectId,
        data: { newStage },
        timestamp: new Date().toISOString(),
        agent
      };

      // Get current project
      const project = await this.getProject(projectId);
      if (!project) {
        throw new Error(`Project not found: ${projectId}`);
      }

      // Determine source and destination paths
      const sourcePath = await this.detector.getProjectFilePath(projectId);
      if (!sourcePath) {
        throw new Error(`Project file not found: ${projectId}`);
      }

      const fileName = this.generateProjectFileName(project.project);
      let destinationPath: string;

      if (newStage === 'completion') {
        destinationPath = path.join(this.config.completedPath, fileName);
      } else {
        destinationPath = path.join(this.config.activePath, fileName);
      }

      // Move file
      await fs.rename(sourcePath, destinationPath);

      // Update project metadata
      const updatedProject = { ...project.project, stage: newStage as any };
      await this.updateProject(projectId, updatedProject, agent);

      const result: ProjectOperationResult = {
        success: true,
        operation,
        result: { projectId, newStage, sourcePath, destinationPath },
        timestamp: new Date().toISOString()
      };

      this.state.operations.push(result);
      return result;
    } catch (error) {
      const result: ProjectOperationResult = {
        success: false,
        operation: {
          type: 'move',
          projectId,
          data: { newStage },
          timestamp: new Date().toISOString(),
          agent
        },
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.state.operations.push(result);
      return result;
    }
  }

  /**
   * Get system status
   */
  getSystemStatus(): ProjectSystemState {
    return this.state;
  }

  /**
   * Get system health
   */
  getSystemHealth(): { isHealthy: boolean; score: number; details: any } {
    const health = this.state.systemHealth;
    return {
      isHealthy: health.isHealthy,
      score: health.healthScore,
      details: {
        totalProjects: health.totalProjects,
        activeProjects: health.activeProjects,
        completedProjects: health.completedProjects,
        ideas: health.ideas,
        lastScan: health.lastScan
      }
    };
  }

  /**
   * Refresh project data
   */
  async refresh(): Promise<void> {
    try {
      this.detector.clearCache();
      const detection = await this.detector.scanProjects();
      this.state.detection = detection;
      await this.loadActiveProjects();
      this.updateSystemHealth();
    } catch (error) {
      console.error('Error refreshing project data:', error);
      throw error;
    }
  }

  /**
   * Search projects
   */
  async searchProjects(
    searchTerm: string,
    filters: any = {}
  ): Promise<any> {
    return await this.detector.searchProjects(searchTerm, filters);
  }

  // Private methods

  private initializeState(): ProjectSystemState {
    return {
      config: this.config,
      detection: {
        projects: [],
        activeProjects: [],
        completedProjects: [],
        ideas: [],
        totalCount: 0,
        lastScan: new Date().toISOString()
      },
      activeProjects: {},
      systemHealth: {
        isHealthy: false,
        lastScan: new Date().toISOString(),
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        ideas: 0,
        healthScore: 0
      },
      operations: [],
      events: []
    };
  }

  private async loadActiveProjects(): Promise<void> {
    const activeProjectIds = this.state.detection.activeProjects.map(p => p.projectId);
    
    for (const projectId of activeProjectIds) {
      try {
        const project = await this.detector.getProject(projectId);
        if (project) {
          this.state.activeProjects[projectId] = project;
        }
      } catch (error) {
        console.warn(`Failed to load project ${projectId}:`, error);
      }
    }
  }

  private updateSystemHealth(): void {
    const detection = this.state.detection;
    const totalProjects = detection.totalCount;
    const activeProjects = detection.activeProjects.length;
    const completedProjects = detection.completedProjects.length;
    const ideas = detection.ideas.length;

    // Calculate health score
    let healthScore = 100;
    
    // Deduct points for issues
    if (totalProjects === 0) healthScore -= 50;
    if (activeProjects === 0 && totalProjects > 0) healthScore -= 30;
    if (ideas.length > activeProjects * 2) healthScore -= 20;

    const isHealthy = healthScore >= 70;

    this.state.systemHealth = {
      isHealthy,
      lastScan: detection.lastScan,
      totalProjects,
      activeProjects,
      completedProjects,
      ideas,
      healthScore
    };
  }

  private generateProjectFileName(metadata: ProjectMetadata): string {
    const type = this.extractProjectType(metadata.projectId);
    return `${type}-${metadata.projectId}-${metadata.version}.md`;
  }

  private extractProjectType(projectId: string): string {
    const typeMatch = projectId.match(/^(foundation|feature|analysis|refactor|bugfix|documentation)-/);
    return typeMatch ? typeMatch[1] : 'feature';
  }

  private generateProjectFileContent(metadata: ProjectMetadata, context: ProjectContext): string {
    const yamlContent = yaml.dump({
      projectId: metadata.projectId,
      title: metadata.title,
      stage: metadata.stage,
      createdDate: metadata.createdDate,
      lastUpdated: metadata.lastUpdated,
      assignedAgents: metadata.assignedAgents || [],
      estimatedCompletion: metadata.estimatedCompletion,
      priority: metadata.priority,
      tags: metadata.tags || []
    });

    return `# ${metadata.title}

## Metadata

\`\`\`yaml
${yamlContent}
\`\`\`

## Human Context

### Problem Statement
${context.problemStatement}

### Business Value
${context.businessValue.map(value => `- ${value}`).join('\n')}

### Success Criteria
${context.successCriteria.map(criteria => `- [ ] ${criteria}`).join('\n')}

### Constraints
${context.constraints.map(constraint => `- ${constraint}`).join('\n')}

### Stakeholders
${context.stakeholders.map(stakeholder => `- ${stakeholder}`).join('\n')}

## AI Agent Context

### Technical Requirements
${context.technicalRequirements.map(req => `- [ ] ${req}`).join('\n')}

### Dependencies
${context.dependencies.map(dep => `- **${dep.name}** (type: ${dep.type})
  - Status: ${dep.status}
  - Description: ${dep.description}`).join('\n')}

### Acceptance Criteria
${context.acceptanceCriteria.map(criteria => `- [ ] ${criteria}`).join('\n')}

### Implementation Guidelines
${context.implementationGuidelines.map(guideline => `- ${guideline}`).join('\n')}

### File References
${context.fileReferences.map(ref => `- **File Path**: \`${ref}\``).join('\n')}

## Current Stage

### Stage: ${metadata.stage}
Currently in the ${metadata.stage} stage.

### Description
Project is in the ${metadata.stage} stage.

### Tasks
- **TASK-001**: Initial project setup
  - Status: pending
  - Assigned Agent: ${metadata.assignedAgents?.[0] || 'system'}
  - Estimated Hours: 1
  - Dependencies: []
  - Deliverables: []
  - Acceptance Criteria: []

### Deliverables
- [ ] Project document created
- [ ] Initial planning completed

## Progress Log

- **${metadata.createdDate}** - **${metadata.assignedAgents?.[0] || 'System'}**: Created initial project document
  - Stage: ${metadata.stage}
  - Files Changed: [\`/docs/projects/active/v1/${this.generateProjectFileName(metadata)}\`]

## Decisions

None yet.

## Blockers

None currently identified.

## Handoff Notes

<!-- No handoffs yet -->

---

## Implementation Design

### Architecture
- Project management system integration
- Document-driven development
- Version-controlled planning

### Implementation Phases

### Phase 1: Foundation
- Project setup and initialization
- Basic functionality implementation
- Integration with existing systems

## Success Metrics

### Quantitative Metrics
- **Project Setup**: 100% successful project creation
- **System Integration**: 100% successful integration
- **Performance**: <100ms response time for project operations

### Qualitative Metrics
- **Developer Experience**: Improved ease of use and functionality
- **System Reliability**: Stable, reliable operation
- **Documentation Alignment**: Better alignment between docs and implementation

## Next Steps

1. **Setup Phase**: Complete project initialization
2. **Implementation Phase**: Implement core functionality
3. **Integration Phase**: Integrate with development workflow
4. **Testing Phase**: Comprehensive testing and validation

## Notes

This project implements the basic project management functionality described in the documentation.

## Version Information

### Current Version
- **Version**: ${metadata.version}
- **Created**: ${metadata.createdDate}
- **Last Updated**: ${metadata.lastUpdated}
- **Migration Date**: ${metadata.createdDate}

### Version History
- **${metadata.version}**: Initial project creation
`;
  }

  private updateProjectFile(content: string, updates: Partial<ProjectMetadata>): string {
    // Update YAML frontmatter
    const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!yamlMatch) {
      return content;
    }

    const yamlContent = yamlMatch[1];
    const metadata = yaml.load(yamlContent) as any;
    
    // Apply updates
    Object.assign(metadata, updates);
    metadata.lastUpdated = new Date().toISOString().split('T')[0];

    // Regenerate YAML
    const newYamlContent = yaml.dump(metadata);
    const newContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${newYamlContent}---`);

    return newContent;
  }
}
