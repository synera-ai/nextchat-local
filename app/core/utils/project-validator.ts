// Project Validation System

import { 
  ProjectMetadata, 
  ProjectContext, 
  ProjectValidation, 
  ValidationError, 
  ValidationWarning, 
  ValidationSuggestion,
  ProjectStage,
  ProjectPriority,
  ProjectType
} from '../types/project';

export class ProjectValidator {
  private schema: any;

  constructor() {
    this.schema = this.loadSchema();
  }

  /**
   * Validate project metadata
   */
  validateProjectMetadata(metadata: ProjectMetadata): ProjectValidation {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Required fields validation
    if (!metadata.projectId) {
      errors.push({
        field: 'projectId',
        message: 'Project ID is required',
        severity: 'error'
      });
    } else {
      // Validate project ID format
      if (!this.isValidProjectId(metadata.projectId)) {
        errors.push({
          field: 'projectId',
          message: 'Project ID must follow kebab-case format (e.g., "feature-user-auth")',
          severity: 'error'
        });
      }
    }

    if (!metadata.title) {
      errors.push({
        field: 'title',
        message: 'Project title is required',
        severity: 'error'
      });
    } else if (metadata.title.length < 5) {
      errors.push({
        field: 'title',
        message: 'Project title must be at least 5 characters long',
        severity: 'error'
      });
    }

    if (!metadata.stage) {
      errors.push({
        field: 'stage',
        message: 'Project stage is required',
        severity: 'error'
      });
    } else if (!this.isValidStage(metadata.stage)) {
      errors.push({
        field: 'stage',
        message: `Invalid project stage: ${metadata.stage}. Must be one of: idea, plan, design, implementation, testing, review, deployment, completion`,
        severity: 'error'
      });
    }

    if (!metadata.createdDate) {
      errors.push({
        field: 'createdDate',
        message: 'Created date is required',
        severity: 'error'
      });
    } else if (!this.isValidDate(metadata.createdDate)) {
      errors.push({
        field: 'createdDate',
        message: 'Created date must be in YYYY-MM-DD format',
        severity: 'error'
      });
    }

    if (!metadata.lastUpdated) {
      errors.push({
        field: 'lastUpdated',
        message: 'Last updated date is required',
        severity: 'error'
      });
    } else if (!this.isValidDate(metadata.lastUpdated)) {
      errors.push({
        field: 'lastUpdated',
        message: 'Last updated date must be in YYYY-MM-DD format',
        severity: 'error'
      });
    }

    if (!metadata.priority) {
      errors.push({
        field: 'priority',
        message: 'Project priority is required',
        severity: 'error'
      });
    } else if (!this.isValidPriority(metadata.priority)) {
      errors.push({
        field: 'priority',
        message: `Invalid priority: ${metadata.priority}. Must be one of: low, medium, high, critical`,
        severity: 'error'
      });
    }

    if (!metadata.tags || metadata.tags.length === 0) {
      warnings.push({
        field: 'tags',
        message: 'No tags specified',
        suggestion: 'Consider adding relevant tags for better project organization'
      });
    }

    if (!metadata.version) {
      errors.push({
        field: 'version',
        message: 'Project version is required',
        severity: 'error'
      });
    } else if (!this.isValidVersion(metadata.version)) {
      errors.push({
        field: 'version',
        message: 'Version must follow semantic versioning (e.g., v1.0.0)',
        severity: 'error'
      });
    }

    // Date consistency validation
    if (metadata.createdDate && metadata.lastUpdated) {
      const created = new Date(metadata.createdDate);
      const updated = new Date(metadata.lastUpdated);
      
      if (updated < created) {
        errors.push({
          field: 'lastUpdated',
          message: 'Last updated date cannot be before created date',
          severity: 'error'
        });
      }
    }

    // Estimated completion validation
    if (metadata.estimatedCompletion) {
      if (!this.isValidDate(metadata.estimatedCompletion)) {
        errors.push({
          field: 'estimatedCompletion',
          message: 'Estimated completion date must be in YYYY-MM-DD format',
          severity: 'error'
        });
      } else {
        const estimated = new Date(metadata.estimatedCompletion);
        const now = new Date();
        
        if (estimated < now) {
          warnings.push({
            field: 'estimatedCompletion',
            message: 'Estimated completion date is in the past',
            suggestion: 'Update estimated completion date to a future date'
          });
        }
      }
    }

    // Project type validation
    const projectType = this.extractProjectType(metadata.projectId);
    if (projectType && !this.isValidProjectType(projectType)) {
      errors.push({
        field: 'projectId',
        message: `Invalid project type: ${projectType}. Must be one of: foundation, feature, analysis, refactor, bugfix, documentation`,
        severity: 'error'
      });
    }

    // Suggestions for improvement
    if (metadata.stage === 'plan' && !metadata.assignedAgents?.length) {
      suggestions.push({
        field: 'assignedAgents',
        message: 'Consider assigning agents to the project',
        impact: 'medium'
      });
    }

    if (metadata.priority === 'critical' && metadata.stage === 'idea') {
      suggestions.push({
        field: 'stage',
        message: 'Critical projects should move beyond idea stage quickly',
        impact: 'high'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate project context
   */
  validateProjectContext(context: ProjectContext): ProjectValidation {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Problem statement validation
    if (!context.problemStatement || context.problemStatement.trim().length === 0) {
      errors.push({
        field: 'problemStatement',
        message: 'Problem statement is required',
        severity: 'error'
      });
    } else if (context.problemStatement.length < 50) {
      warnings.push({
        field: 'problemStatement',
        message: 'Problem statement is quite short',
        suggestion: 'Consider providing more detail about the problem being solved'
      });
    }

    // Business value validation
    if (!context.businessValue || context.businessValue.length === 0) {
      warnings.push({
        field: 'businessValue',
        message: 'No business value specified',
        suggestion: 'Consider adding business value statements to justify the project'
      });
    }

    // Success criteria validation
    if (!context.successCriteria || context.successCriteria.length === 0) {
      errors.push({
        field: 'successCriteria',
        message: 'Success criteria are required',
        severity: 'error'
      });
    } else if (context.successCriteria.length < 3) {
      warnings.push({
        field: 'successCriteria',
        message: 'Few success criteria specified',
        suggestion: 'Consider adding more specific success criteria'
      });
    }

    // Technical requirements validation
    if (!context.technicalRequirements || context.technicalRequirements.length === 0) {
      warnings.push({
        field: 'technicalRequirements',
        message: 'No technical requirements specified',
        suggestion: 'Consider adding technical requirements for implementation'
      });
    }

    // Dependencies validation
    if (context.dependencies && context.dependencies.length > 0) {
      const blockedDependencies = context.dependencies.filter(dep => dep.status === 'blocked');
      if (blockedDependencies.length > 0) {
        warnings.push({
          field: 'dependencies',
          message: `${blockedDependencies.length} blocked dependencies found`,
          suggestion: 'Address blocked dependencies before proceeding'
        });
      }
    }

    // Acceptance criteria validation
    if (!context.acceptanceCriteria || context.acceptanceCriteria.length === 0) {
      warnings.push({
        field: 'acceptanceCriteria',
        message: 'No acceptance criteria specified',
        suggestion: 'Consider adding acceptance criteria for validation'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate complete project
   */
  validateProject(metadata: ProjectMetadata, context: ProjectContext): ProjectValidation {
    const metadataValidation = this.validateProjectMetadata(metadata);
    const contextValidation = this.validateProjectContext(context);

    return {
      isValid: metadataValidation.isValid && contextValidation.isValid,
      errors: [...metadataValidation.errors, ...contextValidation.errors],
      warnings: [...metadataValidation.warnings, ...contextValidation.warnings],
      suggestions: [...metadataValidation.suggestions, ...contextValidation.suggestions]
    };
  }

  /**
   * Validate project file content
   */
  validateProjectFile(content: string): ProjectValidation {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    try {
      // Check for YAML frontmatter
      const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!yamlMatch) {
        errors.push({
          field: 'frontmatter',
          message: 'YAML frontmatter is required',
          severity: 'error'
        });
        return { isValid: false, errors, warnings, suggestions };
      }

      // Check for required sections
      const requiredSections = [
        'Human Context',
        'AI Agent Context',
        'Current Stage',
        'Progress Log'
      ];

      for (const section of requiredSections) {
        if (!content.includes(`## ${section}`)) {
          errors.push({
            field: 'sections',
            message: `Required section "${section}" is missing`,
            severity: 'error'
          });
        }
      }

      // Check for metadata section
      if (!content.includes('## Metadata')) {
        errors.push({
          field: 'metadata',
          message: 'Metadata section is required',
          severity: 'error'
        });
      }

      // Check for proper markdown structure
      if (!content.startsWith('#')) {
        errors.push({
          field: 'structure',
          message: 'Project file must start with a title (H1)',
          severity: 'error'
        });
      }

      // Check for version information
      if (!content.includes('## Version Information')) {
        suggestions.push({
          field: 'version',
          message: 'Consider adding version information section',
          impact: 'low'
        });
      }

    } catch (error) {
      errors.push({
        field: 'parsing',
        message: `Error parsing project file: ${error.message}`,
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  // Private helper methods

  private loadSchema(): any {
    // Load JSON schema for validation
    // This would typically load from a file or be defined inline
    return {
      type: 'object',
      required: ['projectId', 'title', 'stage', 'createdDate', 'lastUpdated', 'priority', 'version'],
      properties: {
        projectId: { type: 'string', pattern: '^[a-z0-9-]+$' },
        title: { type: 'string', minLength: 5 },
        stage: { type: 'string', enum: ['idea', 'plan', 'design', 'implementation', 'testing', 'review', 'deployment', 'completion'] },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
        version: { type: 'string', pattern: '^v\\d+\\.\\d+\\.\\d+$' }
      }
    };
  }

  private isValidProjectId(projectId: string): boolean {
    // Must be kebab-case: lowercase letters, numbers, and hyphens only
    return /^[a-z0-9-]+$/.test(projectId) && !projectId.startsWith('-') && !projectId.endsWith('-');
  }

  private isValidStage(stage: string): boolean {
    const validStages: ProjectStage[] = ['idea', 'plan', 'design', 'implementation', 'testing', 'review', 'deployment', 'completion'];
    return validStages.includes(stage as ProjectStage);
  }

  private isValidPriority(priority: string): boolean {
    const validPriorities: ProjectPriority[] = ['low', 'medium', 'high', 'critical'];
    return validPriorities.includes(priority as ProjectPriority);
  }

  private isValidProjectType(type: string): boolean {
    const validTypes: ProjectType[] = ['foundation', 'feature', 'analysis', 'refactor', 'bugfix', 'documentation'];
    return validTypes.includes(type as ProjectType);
  }

  private isValidVersion(version: string): boolean {
    // Must follow semantic versioning: v1.0.0
    return /^v\d+\.\d+\.\d+$/.test(version);
  }

  private isValidDate(date: string): boolean {
    // Must be in YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return false;
    }
    
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }

  private extractProjectType(projectId: string): string | null {
    const typeMatch = projectId.match(/^(foundation|feature|analysis|refactor|bugfix|documentation)-/);
    return typeMatch ? typeMatch[1] : null;
  }
}
