# AI Coder Code Examples

## 🎯 Overview

This section provides comprehensive code examples specifically designed for AI coders working with document-driven architecture and project management systems. All examples follow best practices and are optimized for AI understanding and implementation.

## 🏗️ Architecture Examples

### 1. Document-Driven Project Management System

```typescript
// Project Management System Implementation
// File: app/core/project-management/ProjectManagementSystem.ts

/**
 * @projectId project-management-system
 * @title Project Management System
 * @description Core system for managing projects with document-driven architecture
 * @version 1.0.0
 * @stage implementation
 */
export class ProjectManagementSystem {
  private readonly projectRepository: ProjectRepository;
  private readonly documentGenerator: DocumentGenerator;
  private readonly progressTracker: ProgressTracker;
  private readonly validator: ProjectValidator;

  constructor(
    projectRepository: ProjectRepository,
    documentGenerator: DocumentGenerator,
    progressTracker: ProgressTracker,
    validator: ProjectValidator
  ) {
    this.projectRepository = projectRepository;
    this.documentGenerator = documentGenerator;
    this.progressTracker = progressTracker;
    this.validator = validator;
  }

  /**
   * Creates a new project with document-driven architecture
   */
  async createProject(spec: ProjectSpec): Promise<Project> {
    // 1. Validate project specification
    await this.validator.validateProjectSpec(spec);
    
    // 2. Generate project documentation
    const documentation = await this.documentGenerator.generateProjectDocs(spec);
    
    // 3. Create project with documentation
    const project = await this.projectRepository.create({
      ...spec,
      documentation,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // 4. Initialize progress tracking
    await this.progressTracker.initializeProject(project.id);
    
    // 5. Log project creation
    await this.logProjectCreation(project);
    
    return project;
  }

  /**
   * Updates project progress based on development activities
   */
  async updateProgress(
    projectId: ProjectId,
    activity: DevelopmentActivity
  ): Promise<ProgressUpdate> {
    // 1. Validate project exists
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }
    
    // 2. Update progress tracking
    const progressUpdate = await this.progressTracker.updateProgress(
      projectId,
      activity
    );
    
    // 3. Update project documentation
    await this.documentGenerator.updateProjectProgress(
      projectId,
      progressUpdate
    );
    
    // 4. Update project status if needed
    if (progressUpdate.statusChanged) {
      await this.updateProjectStatus(projectId, progressUpdate.newStatus);
    }
    
    return progressUpdate;
  }

  private async logProjectCreation(project: Project): Promise<void> {
    console.log(`Project created: ${project.id} - ${project.title}`);
  }

  private async updateProjectStatus(
    projectId: ProjectId,
    status: ProjectStatus
  ): Promise<void> {
    await this.projectRepository.update(projectId, { status });
  }
}

// Supporting interfaces and types
export interface ProjectSpec {
  readonly id: ProjectId;
  readonly title: string;
  readonly description: string;
  readonly priority: ProjectPriority;
  readonly tags: readonly string[];
  readonly metadata: ProjectMetadata;
}

export type ProjectId = string & { readonly __brand: 'ProjectId' };
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type ProjectStatus = 'planning' | 'active' | 'completed' | 'cancelled';

export interface Project extends ProjectSpec {
  readonly status: ProjectStatus;
  readonly documentation: ProjectDocumentation;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface DevelopmentActivity {
  readonly type: 'commit' | 'file_change' | 'task_completion' | 'milestone';
  readonly timestamp: Date;
  readonly data: Record<string, unknown>;
}
```

### 2. Document Generator Implementation

```typescript
// Document Generator for Project Management
// File: app/core/documentation/DocumentGenerator.ts

/**
 * @projectId document-generator
 * @title Document Generator
 * @description Generates and maintains project documentation automatically
 * @version 1.0.0
 * @stage implementation
 */
export class DocumentGenerator {
  private readonly templateEngine: TemplateEngine;
  private readonly fileSystem: FileSystem;
  private readonly gitIntegration: GitIntegration;

  constructor(
    templateEngine: TemplateEngine,
    fileSystem: FileSystem,
    gitIntegration: GitIntegration
  ) {
    this.templateEngine = templateEngine;
    this.fileSystem = fileSystem;
    this.gitIntegration = gitIntegration;
  }

  /**
   * Generates comprehensive project documentation
   */
  async generateProjectDocs(spec: ProjectSpec): Promise<ProjectDocumentation> {
    const documentation: ProjectDocumentation = {
      overview: await this.generateOverview(spec),
      architecture: await this.generateArchitecture(spec),
      implementation: await this.generateImplementation(spec),
      testing: await this.generateTesting(spec),
      deployment: await this.generateDeployment(spec),
      maintenance: await this.generateMaintenance(spec)
    };

    // Save documentation to file system
    await this.saveDocumentation(spec.id, documentation);
    
    return documentation;
  }

  /**
   * Updates project progress in documentation
   */
  async updateProjectProgress(
    projectId: ProjectId,
    progressUpdate: ProgressUpdate
  ): Promise<void> {
    const documentation = await this.loadDocumentation(projectId);
    
    // Update progress section
    documentation.progress = {
      ...documentation.progress,
      lastUpdate: new Date(),
      currentStatus: progressUpdate.newStatus,
      completedTasks: progressUpdate.completedTasks,
      remainingTasks: progressUpdate.remainingTasks,
      milestones: progressUpdate.milestones
    };

    // Update implementation section if needed
    if (progressUpdate.implementationChanges) {
      documentation.implementation = await this.updateImplementation(
        documentation.implementation,
        progressUpdate.implementationChanges
      );
    }

    // Save updated documentation
    await this.saveDocumentation(projectId, documentation);
  }

  private async generateOverview(spec: ProjectSpec): Promise<DocumentationSection> {
    return {
      title: 'Project Overview',
      content: await this.templateEngine.render('project-overview', {
        title: spec.title,
        description: spec.description,
        priority: spec.priority,
        tags: spec.tags,
        metadata: spec.metadata
      }),
      lastUpdated: new Date()
    };
  }

  private async generateArchitecture(spec: ProjectSpec): Promise<DocumentationSection> {
    return {
      title: 'Architecture',
      content: await this.templateEngine.render('project-architecture', {
        projectId: spec.id,
        requirements: spec.metadata.requirements || [],
        constraints: spec.metadata.constraints || []
      }),
      lastUpdated: new Date()
    };
  }

  private async saveDocumentation(
    projectId: ProjectId,
    documentation: ProjectDocumentation
  ): Promise<void> {
    const docPath = this.getDocumentationPath(projectId);
    await this.fileSystem.writeFile(docPath, JSON.stringify(documentation, null, 2));
  }

  private getDocumentationPath(projectId: ProjectId): string {
    return `/docs/projects/active/v1/${projectId}-v1.0.0.md`;
  }
}

export interface ProjectDocumentation {
  readonly overview: DocumentationSection;
  readonly architecture: DocumentationSection;
  readonly implementation: DocumentationSection;
  readonly testing: DocumentationSection;
  readonly deployment: DocumentationSection;
  readonly maintenance: DocumentationSection;
  readonly progress?: ProgressDocumentation;
}

export interface DocumentationSection {
  readonly title: string;
  readonly content: string;
  readonly lastUpdated: Date;
}
```

## 🔧 Implementation Examples

### 3. Progress Tracker Implementation

```typescript
// Progress Tracking System
// File: app/core/progress/ProgressTracker.ts

/**
 * @projectId progress-tracker
 * @title Progress Tracker
 * @description Tracks project progress based on development activities
 * @version 1.0.0
 * @stage implementation
 */
export class ProgressTracker {
  private readonly activityAnalyzer: ActivityAnalyzer;
  private readonly milestoneDetector: MilestoneDetector;
  private readonly statusCalculator: StatusCalculator;

  constructor(
    activityAnalyzer: ActivityAnalyzer,
    milestoneDetector: MilestoneDetector,
    statusCalculator: StatusCalculator
  ) {
    this.activityAnalyzer = activityAnalyzer;
    this.milestoneDetector = milestoneDetector;
    this.statusCalculator = statusCalculator;
  }

  /**
   * Initializes progress tracking for a new project
   */
  async initializeProject(projectId: ProjectId): Promise<void> {
    const initialProgress: ProjectProgress = {
      projectId,
      status: 'planning',
      completedTasks: 0,
      totalTasks: 0,
      milestones: [],
      lastActivity: new Date(),
      progressPercentage: 0
    };

    await this.saveProgress(projectId, initialProgress);
  }

  /**
   * Updates project progress based on development activity
   */
  async updateProgress(
    projectId: ProjectId,
    activity: DevelopmentActivity
  ): Promise<ProgressUpdate> {
    const currentProgress = await this.loadProgress(projectId);
    
    // Analyze the activity
    const analysis = await this.activityAnalyzer.analyze(activity);
    
    // Update progress based on analysis
    const updatedProgress = await this.calculateUpdatedProgress(
      currentProgress,
      analysis
    );
    
    // Check for milestone completion
    const milestoneUpdates = await this.milestoneDetector.checkMilestones(
      projectId,
      updatedProgress
    );
    
    // Calculate new status
    const newStatus = await this.statusCalculator.calculateStatus(
      updatedProgress,
      milestoneUpdates
    );
    
    // Create progress update
    const progressUpdate: ProgressUpdate = {
      projectId,
      previousStatus: currentProgress.status,
      newStatus,
      completedTasks: updatedProgress.completedTasks,
      remainingTasks: updatedProgress.totalTasks - updatedProgress.completedTasks,
      milestones: milestoneUpdates,
      statusChanged: newStatus !== currentProgress.status,
      timestamp: new Date()
    };
    
    // Save updated progress
    await this.saveProgress(projectId, updatedProgress);
    
    return progressUpdate;
  }

  private async calculateUpdatedProgress(
    current: ProjectProgress,
    analysis: ActivityAnalysis
  ): Promise<ProjectProgress> {
    return {
      ...current,
      completedTasks: current.completedTasks + analysis.completedTasks,
      totalTasks: Math.max(current.totalTasks, analysis.totalTasks),
      lastActivity: new Date(),
      progressPercentage: this.calculateProgressPercentage(
        current.completedTasks + analysis.completedTasks,
        Math.max(current.totalTasks, analysis.totalTasks)
      )
    };
  }

  private calculateProgressPercentage(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  private async saveProgress(projectId: ProjectId, progress: ProjectProgress): Promise<void> {
    // Implementation for saving progress
  }

  private async loadProgress(projectId: ProjectId): Promise<ProjectProgress> {
    // Implementation for loading progress
    throw new Error('Not implemented');
  }
}

export interface ProjectProgress {
  readonly projectId: ProjectId;
  readonly status: ProjectStatus;
  readonly completedTasks: number;
  readonly totalTasks: number;
  readonly milestones: Milestone[];
  readonly lastActivity: Date;
  readonly progressPercentage: number;
}

export interface ProgressUpdate {
  readonly projectId: ProjectId;
  readonly previousStatus: ProjectStatus;
  readonly newStatus: ProjectStatus;
  readonly completedTasks: number;
  readonly remainingTasks: number;
  readonly milestones: MilestoneUpdate[];
  readonly statusChanged: boolean;
  readonly timestamp: Date;
}
```

### 4. Project Validator Implementation

```typescript
// Project Validation System
// File: app/core/validation/ProjectValidator.ts

/**
 * @projectId project-validator
 * @title Project Validator
 * @description Validates project specifications and requirements
 * @version 1.0.0
 * @stage implementation
 */
export class ProjectValidator {
  private readonly schemaValidator: SchemaValidator;
  private readonly businessRuleValidator: BusinessRuleValidator;

  constructor(
    schemaValidator: SchemaValidator,
    businessRuleValidator: BusinessRuleValidator
  ) {
    this.schemaValidator = schemaValidator;
    this.businessRuleValidator = businessRuleValidator;
  }

  /**
   * Validates a project specification
   */
  async validateProjectSpec(spec: ProjectSpec): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Schema validation
    const schemaErrors = await this.schemaValidator.validate(spec);
    errors.push(...schemaErrors);

    // Business rule validation
    const businessErrors = await this.businessRuleValidator.validate(spec);
    errors.push(...businessErrors);

    // Custom validation rules
    const customErrors = await this.validateCustomRules(spec);
    errors.push(...customErrors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings: await this.generateWarnings(spec)
    };
  }

  /**
   * Validates project ID format and uniqueness
   */
  async validateProjectId(id: string): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Format validation
    if (!this.isValidProjectIdFormat(id)) {
      errors.push({
        field: 'id',
        message: 'Project ID must be lowercase with hyphens only',
        code: 'INVALID_FORMAT'
      });
    }

    // Uniqueness validation
    if (await this.isProjectIdExists(id)) {
      errors.push({
        field: 'id',
        message: 'Project ID already exists',
        code: 'DUPLICATE_ID'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  private async validateCustomRules(spec: ProjectSpec): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Title validation
    if (spec.title.length < 3) {
      errors.push({
        field: 'title',
        message: 'Title must be at least 3 characters long',
        code: 'TITLE_TOO_SHORT'
      });
    }

    if (spec.title.length > 200) {
      errors.push({
        field: 'title',
        message: 'Title must be less than 200 characters',
        code: 'TITLE_TOO_LONG'
      });
    }

    // Description validation
    if (spec.description.length < 10) {
      errors.push({
        field: 'description',
        message: 'Description must be at least 10 characters long',
        code: 'DESCRIPTION_TOO_SHORT'
      });
    }

    // Priority validation
    if (!['low', 'medium', 'high', 'critical'].includes(spec.priority)) {
      errors.push({
        field: 'priority',
        message: 'Priority must be one of: low, medium, high, critical',
        code: 'INVALID_PRIORITY'
      });
    }

    return errors;
  }

  private isValidProjectIdFormat(id: string): boolean {
    return /^[a-z0-9-]+$/.test(id) && id.length >= 3 && id.length <= 50;
  }

  private async isProjectIdExists(id: string): Promise<boolean> {
    // Implementation to check if project ID exists
    return false;
  }

  private async generateWarnings(spec: ProjectSpec): Promise<ValidationWarning[]> {
    const warnings: ValidationWarning[] = [];

    if (spec.tags.length === 0) {
      warnings.push({
        field: 'tags',
        message: 'Consider adding tags for better project organization',
        code: 'NO_TAGS'
      });
    }

    if (spec.priority === 'critical' && spec.tags.length < 3) {
      warnings.push({
        field: 'tags',
        message: 'Critical projects should have at least 3 tags',
        code: 'CRITICAL_PROJECT_TAGS'
      });
    }

    return warnings;
  }
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: ValidationError[];
  readonly warnings: ValidationWarning[];
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

export interface ValidationWarning {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}
```

## 🧪 Testing Examples

### 5. Comprehensive Test Suite

```typescript
// Test Suite for Project Management System
// File: test/core/project-management/ProjectManagementSystem.test.ts

/**
 * @projectId project-management-tests
 * @title Project Management System Tests
 * @description Comprehensive test suite for project management system
 * @version 1.0.0
 * @stage testing
 */
describe('ProjectManagementSystem', () => {
  let system: ProjectManagementSystem;
  let mockRepository: jest.Mocked<ProjectRepository>;
  let mockDocumentGenerator: jest.Mocked<DocumentGenerator>;
  let mockProgressTracker: jest.Mocked<ProgressTracker>;
  let mockValidator: jest.Mocked<ProjectValidator>;

  beforeEach(() => {
    // Create mocks
    mockRepository = createMockRepository();
    mockDocumentGenerator = createMockDocumentGenerator();
    mockProgressTracker = createMockProgressTracker();
    mockValidator = createMockValidator();

    // Create system instance
    system = new ProjectManagementSystem(
      mockRepository,
      mockDocumentGenerator,
      mockProgressTracker,
      mockValidator
    );
  });

  describe('createProject', () => {
    it('should create a project successfully with valid specification', async () => {
      // Arrange
      const spec: ProjectSpec = createValidProjectSpec();
      const expectedProject = createExpectedProject();
      const expectedDocumentation = createExpectedDocumentation();

      mockValidator.validateProjectSpec.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: []
      });
      mockDocumentGenerator.generateProjectDocs.mockResolvedValue(expectedDocumentation);
      mockRepository.create.mockResolvedValue(expectedProject);
      mockProgressTracker.initializeProject.mockResolvedValue();

      // Act
      const result = await system.createProject(spec);

      // Assert
      expect(result).toEqual(expectedProject);
      expect(mockValidator.validateProjectSpec).toHaveBeenCalledWith(spec);
      expect(mockDocumentGenerator.generateProjectDocs).toHaveBeenCalledWith(spec);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...spec,
        documentation: expectedDocumentation,
        status: 'active',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
      expect(mockProgressTracker.initializeProject).toHaveBeenCalledWith(spec.id);
    });

    it('should throw ValidationError for invalid specification', async () => {
      // Arrange
      const spec: ProjectSpec = createInvalidProjectSpec();
      const validationErrors = [
        { field: 'title', message: 'Title is required', code: 'REQUIRED_FIELD' }
      ];

      mockValidator.validateProjectSpec.mockResolvedValue({
        isValid: false,
        errors: validationErrors,
        warnings: []
      });

      // Act & Assert
      await expect(system.createProject(spec))
        .rejects
        .toThrow(ValidationError);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const spec: ProjectSpec = createValidProjectSpec();
      const repositoryError = new Error('Database connection failed');

      mockValidator.validateProjectSpec.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: []
      });
      mockDocumentGenerator.generateProjectDocs.mockResolvedValue(createExpectedDocumentation());
      mockRepository.create.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(system.createProject(spec))
        .rejects
        .toThrow('Failed to create project');
    });
  });

  describe('updateProgress', () => {
    it('should update project progress successfully', async () => {
      // Arrange
      const projectId = createProjectId('test-project');
      const activity: DevelopmentActivity = createDevelopmentActivity();
      const project = createExistingProject(projectId);
      const progressUpdate: ProgressUpdate = createProgressUpdate();

      mockRepository.findById.mockResolvedValue(project);
      mockProgressTracker.updateProgress.mockResolvedValue(progressUpdate);
      mockDocumentGenerator.updateProjectProgress.mockResolvedValue();

      // Act
      const result = await system.updateProgress(projectId, activity);

      // Assert
      expect(result).toEqual(progressUpdate);
      expect(mockRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockProgressTracker.updateProgress).toHaveBeenCalledWith(projectId, activity);
      expect(mockDocumentGenerator.updateProjectProgress).toHaveBeenCalledWith(
        projectId,
        progressUpdate
      );
    });

    it('should throw ProjectNotFoundError for non-existent project', async () => {
      // Arrange
      const projectId = createProjectId('non-existent');
      const activity: DevelopmentActivity = createDevelopmentActivity();

      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(system.updateProgress(projectId, activity))
        .rejects
        .toThrow(ProjectNotFoundError);
    });
  });
});

// Helper functions for test setup
function createMockRepository(): jest.Mocked<ProjectRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn()
  };
}

function createMockDocumentGenerator(): jest.Mocked<DocumentGenerator> {
  return {
    generateProjectDocs: jest.fn(),
    updateProjectProgress: jest.fn()
  };
}

function createMockProgressTracker(): jest.Mocked<ProgressTracker> {
  return {
    initializeProject: jest.fn(),
    updateProgress: jest.fn()
  };
}

function createMockValidator(): jest.Mocked<ProjectValidator> {
  return {
    validateProjectSpec: jest.fn(),
    validateProjectId: jest.fn()
  };
}

function createValidProjectSpec(): ProjectSpec {
  return {
    id: createProjectId('test-project'),
    title: 'Test Project',
    description: 'A test project for validation',
    priority: 'medium',
    tags: ['test', 'validation'],
    metadata: {
      category: 'testing',
      team: 'qa'
    }
  };
}

function createProjectId(id: string): ProjectId {
  return id as ProjectId;
}
```

## 🔒 Security Examples

### 6. Secure Project Management Implementation

```typescript
// Secure Project Management System
// File: app/core/security/SecureProjectManagement.ts

/**
 * @projectId secure-project-management
 * @title Secure Project Management
 * @description Secure implementation of project management with authentication and authorization
 * @version 1.0.0
 * @stage implementation
 */
export class SecureProjectManagement {
  private readonly projectService: ProjectManagementSystem;
  private readonly authService: AuthenticationService;
  private readonly permissionService: PermissionService;
  private readonly auditLogger: AuditLogger;

  constructor(
    projectService: ProjectManagementSystem,
    authService: AuthenticationService,
    permissionService: PermissionService,
    auditLogger: AuditLogger
  ) {
    this.projectService = projectService;
    this.authService = authService;
    this.permissionService = permissionService;
    this.auditLogger = auditLogger;
  }

  /**
   * Creates a project with proper security checks
   */
  async createProject(
    spec: ProjectSpec,
    user: AuthenticatedUser
  ): Promise<Project> {
    // 1. Authenticate user
    await this.authenticateUser(user);
    
    // 2. Check authorization
    await this.checkCreatePermission(user);
    
    // 3. Validate project specification
    await this.validateProjectSpec(spec, user);
    
    // 4. Create project
    const project = await this.projectService.createProject(spec);
    
    // 5. Set project ownership
    await this.setProjectOwnership(project.id, user.id);
    
    // 6. Log audit event
    await this.auditLogger.logEvent({
      type: 'project_created',
      userId: user.id,
      projectId: project.id,
      timestamp: new Date(),
      details: { title: project.title, priority: project.priority }
    });
    
    return project;
  }

  /**
   * Updates project with security validation
   */
  async updateProject(
    projectId: ProjectId,
    updates: ProjectUpdates,
    user: AuthenticatedUser
  ): Promise<Project> {
    // 1. Authenticate user
    await this.authenticateUser(user);
    
    // 2. Check project access
    await this.checkProjectAccess(projectId, user);
    
    // 3. Check update permission
    await this.checkUpdatePermission(projectId, user);
    
    // 4. Validate updates
    await this.validateProjectUpdates(updates, user);
    
    // 5. Update project
    const updatedProject = await this.projectService.updateProject(projectId, updates);
    
    // 6. Log audit event
    await this.auditLogger.logEvent({
      type: 'project_updated',
      userId: user.id,
      projectId,
      timestamp: new Date(),
      details: { updates }
    });
    
    return updatedProject;
  }

  private async authenticateUser(user: AuthenticatedUser): Promise<void> {
    if (!user.isAuthenticated) {
      throw new AuthenticationError('User not authenticated');
    }
    
    const isValid = await this.authService.validateToken(user.token);
    if (!isValid) {
      throw new AuthenticationError('Invalid authentication token');
    }
  }

  private async checkCreatePermission(user: AuthenticatedUser): Promise<void> {
    const hasPermission = await this.permissionService.hasPermission(
      user.id,
      'project:create'
    );
    
    if (!hasPermission) {
      throw new AuthorizationError('Insufficient permissions to create projects');
    }
  }

  private async checkProjectAccess(
    projectId: ProjectId,
    user: AuthenticatedUser
  ): Promise<void> {
    const project = await this.projectService.getProject(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }
    
    const hasAccess = await this.permissionService.hasProjectAccess(
      user.id,
      projectId
    );
    
    if (!hasAccess) {
      throw new AuthorizationError('No access to this project');
    }
  }

  private async validateProjectSpec(
    spec: ProjectSpec,
    user: AuthenticatedUser
  ): Promise<void> {
    // Validate project ID format
    if (!this.isValidProjectId(spec.id)) {
      throw new ValidationError('Invalid project ID format');
    }
    
    // Check for sensitive information in title/description
    if (this.containsSensitiveInfo(spec.title) || this.containsSensitiveInfo(spec.description)) {
      throw new ValidationError('Project specification contains sensitive information');
    }
    
    // Validate priority based on user role
    if (spec.priority === 'critical' && !await this.permissionService.hasPermission(user.id, 'project:create:critical')) {
      throw new AuthorizationError('Insufficient permissions to create critical projects');
    }
  }

  private isValidProjectId(id: string): boolean {
    return /^[a-z0-9-]+$/.test(id) && id.length >= 3 && id.length <= 50;
  }

  private containsSensitiveInfo(text: string): boolean {
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /key/i,
      /token/i,
      /credential/i
    ];
    
    return sensitivePatterns.some(pattern => pattern.test(text));
  }
}

export interface AuthenticatedUser {
  readonly id: string;
  readonly token: string;
  readonly isAuthenticated: boolean;
  readonly roles: string[];
}

export interface ProjectUpdates {
  readonly title?: string;
  readonly description?: string;
  readonly priority?: ProjectPriority;
  readonly tags?: string[];
  readonly metadata?: ProjectMetadata;
}
```

## 📊 Performance Examples

### 7. Optimized Project Management with Caching

```typescript
// Optimized Project Management with Caching
// File: app/core/performance/OptimizedProjectManagement.ts

/**
 * @projectId optimized-project-management
 * @title Optimized Project Management
 * @description High-performance project management with caching and optimization
 * @version 1.0.0
 * @stage implementation
 */
export class OptimizedProjectManagement {
  private readonly projectService: ProjectManagementSystem;
  private readonly cache: ProjectCache;
  private readonly batchProcessor: BatchProcessor;
  private readonly performanceMonitor: PerformanceMonitor;

  constructor(
    projectService: ProjectManagementSystem,
    cache: ProjectCache,
    batchProcessor: BatchProcessor,
    performanceMonitor: PerformanceMonitor
  ) {
    this.projectService = projectService;
    this.cache = cache;
    this.batchProcessor = batchProcessor;
    this.performanceMonitor = performanceMonitor;
  }

  /**
   * Gets project with caching optimization
   */
  async getProject(projectId: ProjectId): Promise<Project> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cached = await this.cache.get(projectId);
      if (cached && !this.isExpired(cached)) {
        await this.performanceMonitor.recordCacheHit(projectId);
        return cached.project;
      }
      
      // Load from service
      const project = await this.projectService.getProject(projectId);
      
      // Cache the result
      await this.cache.set(projectId, {
        project,
        timestamp: Date.now(),
        ttl: this.getCacheTTL(project)
      });
      
      await this.performanceMonitor.recordCacheMiss(projectId);
      return project;
      
    } finally {
      const duration = Date.now() - startTime;
      await this.performanceMonitor.recordOperation('getProject', duration);
    }
  }

  /**
   * Batch processes multiple projects
   */
  async batchProcessProjects(
    projectIds: ProjectId[],
    operation: ProjectOperation
  ): Promise<BatchResult[]> {
    const startTime = Date.now();
    
    try {
      // Process in optimized batches
      const results = await this.batchProcessor.process(
        projectIds,
        async (batch: ProjectId[]) => {
          return Promise.all(
            batch.map(id => this.processProject(id, operation))
          );
        },
        {
          batchSize: 10,
          delay: 100,
          retries: 3
        }
      );
      
      return results.flat();
      
    } finally {
      const duration = Date.now() - startTime;
      await this.performanceMonitor.recordOperation('batchProcessProjects', duration);
    }
  }

  /**
   * Optimized project search with indexing
   */
  async searchProjects(query: ProjectSearchQuery): Promise<ProjectSearchResult> {
    const startTime = Date.now();
    
    try {
      // Use cached search results if available
      const cacheKey = this.generateSearchCacheKey(query);
      const cached = await this.cache.get(cacheKey);
      
      if (cached && !this.isExpired(cached)) {
        return cached.result;
      }
      
      // Perform optimized search
      const result = await this.performOptimizedSearch(query);
      
      // Cache search results
      await this.cache.set(cacheKey, {
        result,
        timestamp: Date.now(),
        ttl: 5 * 60 * 1000 // 5 minutes
      });
      
      return result;
      
    } finally {
      const duration = Date.now() - startTime;
      await this.performanceMonitor.recordOperation('searchProjects', duration);
    }
  }

  private async processProject(
    projectId: ProjectId,
    operation: ProjectOperation
  ): Promise<BatchResult> {
    try {
      const result = await operation(projectId);
      return { projectId, success: true, result };
    } catch (error) {
      return { projectId, success: false, error: String(error) };
    }
  }

  private async performOptimizedSearch(query: ProjectSearchQuery): Promise<ProjectSearchResult> {
    // Implementation for optimized search
    return {
      projects: [],
      total: 0,
      page: query.page || 1,
      pageSize: query.pageSize || 20
    };
  }

  private generateSearchCacheKey(query: ProjectSearchQuery): string {
    return `search:${JSON.stringify(query)}`;
  }

  private getCacheTTL(project: Project): number {
    // Dynamic TTL based on project status
    switch (project.status) {
      case 'active':
        return 2 * 60 * 1000; // 2 minutes
      case 'completed':
        return 30 * 60 * 1000; // 30 minutes
      case 'planning':
        return 5 * 60 * 1000; // 5 minutes
      default:
        return 10 * 60 * 1000; // 10 minutes
    }
  }

  private isExpired(cached: CachedItem): boolean {
    return Date.now() - cached.timestamp > cached.ttl;
  }
}

export interface ProjectCache {
  get(key: string): Promise<CachedItem | null>;
  set(key: string, item: CachedItem): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface CachedItem {
  readonly project?: Project;
  readonly result?: any;
  readonly timestamp: number;
  readonly ttl: number;
}

export interface ProjectSearchQuery {
  readonly query?: string;
  readonly filters?: ProjectFilters;
  readonly sort?: ProjectSort;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface BatchResult {
  readonly projectId: ProjectId;
  readonly success: boolean;
  readonly result?: any;
  readonly error?: string;
}
```

## 📚 Related Documentation

- [Architecture Examples](../architecture/README.md)
- [Best Practices Examples](../best-practices/README.md)
- [Testing Examples](../testing/README.md)
- [Security Examples](../security/README.md)
- [Performance Examples](../performance/README.md)

## 🔗 External Resources

- [TypeScript Examples](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- [Node.js Examples](https://nodejs.org/en/docs/guides/)
- [React Examples](https://react.dev/learn)
- [Testing Examples](https://jestjs.io/docs/getting-started)

---

*This documentation is part of the NextChat AI Coder Documentation system and follows document-driven architecture principles.*
