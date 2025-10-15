// Project Management System Provider

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ProjectManager } from '../utils/project-manager';
import { ProjectValidator } from '../utils/project-validator';
import { 
  ProjectSystemConfig, 
  ProjectSystemState, 
  ProjectContextResult,
  ProjectStatus,
  ProjectHealth,
  ProjectValidation
} from '../types/project';

// Project System Context
interface ProjectSystemContextType {
  // System state
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  systemHealth: any;
  
  // Project operations
  getProject: (projectId: string) => Promise<ProjectContextResult | null>;
  getActiveProjects: () => Promise<ProjectContextResult[]>;
  getProjectStatus: (projectId: string) => Promise<ProjectStatus | null>;
  getProjectHealth: (projectId: string) => Promise<ProjectHealth | null>;
  validateProject: (projectId: string) => Promise<ProjectValidation | null>;
  searchProjects: (searchTerm: string, filters?: any) => Promise<any>;
  
  // Project management
  createProject: (metadata: any, context: any, agent?: string) => Promise<any>;
  updateProject: (projectId: string, updates: any, agent?: string) => Promise<any>;
  moveProject: (projectId: string, newStage: string, agent?: string) => Promise<any>;
  
  // System operations
  refresh: () => Promise<void>;
  getSystemStatus: () => ProjectSystemState;
  
  // Validation
  validateProjectMetadata: (metadata: any) => ProjectValidation;
  validateProjectContext: (context: any) => ProjectValidation;
  validateProjectFile: (content: string) => ProjectValidation;
}

const ProjectSystemContext = createContext<ProjectSystemContextType | null>(null);

// Project System Provider Props
interface ProjectSystemProviderProps {
  children: ReactNode;
  config?: Partial<ProjectSystemConfig>;
}

// Default configuration
const defaultConfig: ProjectSystemConfig = {
  projectsPath: '/docs/projects',
  activePath: '/docs/projects/active',
  completedPath: '/docs/projects/completed',
  ideasPath: '/docs/projects/ideas',
  templatesPath: '/docs/projects/templates',
  versionsPath: '/docs/projects/versions',
  schemaPath: '/docs/projects/.project-schema.json',
  autoValidation: true,
  autoCommit: false,
  statusReporting: true,
  healthMonitoring: true
};

// Project System Provider Component
export function ProjectSystemProvider({ children, config }: ProjectSystemProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  
  // Initialize managers
  const [projectManager] = useState(() => {
    const mergedConfig = { ...defaultConfig, ...config };
    return new ProjectManager(mergedConfig);
  });
  
  const [validator] = useState(() => new ProjectValidator());

  // Initialize the project system
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await projectManager.initialize();
        const health = projectManager.getSystemHealth();
        setSystemHealth(health);
        setIsInitialized(true);
        
        console.log('Project Management System initialized successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize project system';
        setError(errorMessage);
        console.error('Failed to initialize Project Management System:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSystem();
  }, [projectManager]);

  // Project operations
  const getProject = async (projectId: string): Promise<ProjectContextResult | null> => {
    try {
      return await projectManager.getProject(projectId);
    } catch (err) {
      console.error(`Error getting project ${projectId}:`, err);
      return null;
    }
  };

  const getActiveProjects = async (): Promise<ProjectContextResult[]> => {
    try {
      return await projectManager.getActiveProjects();
    } catch (err) {
      console.error('Error getting active projects:', err);
      return [];
    }
  };

  const getProjectStatus = async (projectId: string): Promise<ProjectStatus | null> => {
    try {
      return await projectManager.getProjectStatus(projectId);
    } catch (err) {
      console.error(`Error getting project status ${projectId}:`, err);
      return null;
    }
  };

  const getProjectHealth = async (projectId: string): Promise<ProjectHealth | null> => {
    try {
      return await projectManager.getProjectHealth(projectId);
    } catch (err) {
      console.error(`Error getting project health ${projectId}:`, err);
      return null;
    }
  };

  const validateProject = async (projectId: string): Promise<ProjectValidation | null> => {
    try {
      return await projectManager.validateProject(projectId);
    } catch (err) {
      console.error(`Error validating project ${projectId}:`, err);
      return null;
    }
  };

  const searchProjects = async (searchTerm: string, filters: any = {}): Promise<any> => {
    try {
      return await projectManager.searchProjects(searchTerm, filters);
    } catch (err) {
      console.error('Error searching projects:', err);
      return { projects: [], totalCount: 0, searchTerm, filters };
    }
  };

  // Project management operations
  const createProject = async (metadata: any, context: any, agent: string = 'system'): Promise<any> => {
    try {
      setIsLoading(true);
      const result = await projectManager.createProject(metadata, context, agent);
      
      // Refresh system health after creation
      const health = projectManager.getSystemHealth();
      setSystemHealth(health);
      
      return result;
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (projectId: string, updates: any, agent: string = 'system'): Promise<any> => {
    try {
      setIsLoading(true);
      const result = await projectManager.updateProject(projectId, updates, agent);
      
      // Refresh system health after update
      const health = projectManager.getSystemHealth();
      setSystemHealth(health);
      
      return result;
    } catch (err) {
      console.error(`Error updating project ${projectId}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const moveProject = async (projectId: string, newStage: string, agent: string = 'system'): Promise<any> => {
    try {
      setIsLoading(true);
      const result = await projectManager.moveProject(projectId, newStage, agent);
      
      // Refresh system health after move
      const health = projectManager.getSystemHealth();
      setSystemHealth(health);
      
      return result;
    } catch (err) {
      console.error(`Error moving project ${projectId}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // System operations
  const refresh = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await projectManager.refresh();
      const health = projectManager.getSystemHealth();
      setSystemHealth(health);
    } catch (err) {
      console.error('Error refreshing project system:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getSystemStatus = (): ProjectSystemState => {
    return projectManager.getSystemStatus();
  };

  // Validation operations
  const validateProjectMetadata = (metadata: any): ProjectValidation => {
    return validator.validateProjectMetadata(metadata);
  };

  const validateProjectContext = (context: any): ProjectValidation => {
    return validator.validateProjectContext(context);
  };

  const validateProjectFile = (content: string): ProjectValidation => {
    return validator.validateProjectFile(content);
  };

  // Context value
  const contextValue: ProjectSystemContextType = {
    // System state
    isInitialized,
    isLoading,
    error,
    systemHealth,
    
    // Project operations
    getProject,
    getActiveProjects,
    getProjectStatus,
    getProjectHealth,
    validateProject,
    searchProjects,
    
    // Project management
    createProject,
    updateProject,
    moveProject,
    
    // System operations
    refresh,
    getSystemStatus,
    
    // Validation
    validateProjectMetadata,
    validateProjectContext,
    validateProjectFile
  };

  return (
    <ProjectSystemContext.Provider value={contextValue}>
      {children}
    </ProjectSystemContext.Provider>
  );
}

// Hook to use the project system
export function useProjectSystem(): ProjectSystemContextType {
  const context = useContext(ProjectSystemContext);
  
  if (!context) {
    throw new Error('useProjectSystem must be used within a ProjectSystemProvider');
  }
  
  return context;
}

// Specific hooks for common operations
export function useProject(projectId: string) {
  const { getProject, getProjectStatus, getProjectHealth, validateProject } = useProjectSystem();
  const [project, setProject] = useState<ProjectContextResult | null>(null);
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [health, setHealth] = useState<ProjectHealth | null>(null);
  const [validation, setValidation] = useState<ProjectValidation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const [projectData, statusData, healthData, validationData] = await Promise.all([
          getProject(projectId),
          getProjectStatus(projectId),
          getProjectHealth(projectId),
          validateProject(projectId)
        ]);
        
        setProject(projectData);
        setStatus(statusData);
        setHealth(healthData);
        setValidation(validationData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId, getProject, getProjectStatus, getProjectHealth, validateProject]);

  return {
    project,
    status,
    health,
    validation,
    isLoading,
    error,
    refetch: () => {
      const loadProject = async () => {
        if (!projectId) return;
        
        try {
          setIsLoading(true);
          setError(null);
          
          const [projectData, statusData, healthData, validationData] = await Promise.all([
            getProject(projectId),
            getProjectStatus(projectId),
            getProjectHealth(projectId),
            validateProject(projectId)
          ]);
          
          setProject(projectData);
          setStatus(statusData);
          setHealth(healthData);
          setValidation(validationData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load project');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadProject();
    }
  };
}

export function useActiveProjects() {
  const { getActiveProjects } = useProjectSystem();
  const [projects, setProjects] = useState<ProjectContextResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActiveProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const activeProjects = await getActiveProjects();
        setProjects(activeProjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load active projects');
      } finally {
        setIsLoading(false);
      }
    };

    loadActiveProjects();
  }, [getActiveProjects]);

  return {
    projects,
    isLoading,
    error,
    refetch: async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const activeProjects = await getActiveProjects();
        setProjects(activeProjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load active projects');
      } finally {
        setIsLoading(false);
      }
    }
  };
}

export function useProjectSearch() {
  const { searchProjects } = useProjectSystem();
  const [results, setResults] = useState<any>({ projects: [], totalCount: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (searchTerm: string, filters: any = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const searchResults = await searchProjects(searchTerm, filters);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search projects');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    results,
    isLoading,
    error,
    search
  };
}

// Export default
export default ProjectSystemProvider;
