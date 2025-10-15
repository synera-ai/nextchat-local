// Project Status Component

'use client';

import React from 'react';
import { useProjectSystem, useActiveProjects } from '../core/providers/project-provider';
import { ProjectContextResult } from '../core/types/project';

interface ProjectStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function ProjectStatus({ className = '', showDetails = false }: ProjectStatusProps) {
  const { isInitialized, isLoading, error, systemHealth } = useProjectSystem();
  const { projects, isLoading: projectsLoading } = useActiveProjects();

  if (!isInitialized) {
    return (
      <div className={`project-status ${className}`}>
        <div className="status-item">
          <span className="status-label">Project System:</span>
          <span className="status-value loading">Initializing...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`project-status ${className}`}>
        <div className="status-item error">
          <span className="status-label">Project System:</span>
          <span className="status-value error">Error: {error}</span>
        </div>
      </div>
    );
  }

  const healthScore = systemHealth?.score || 0;
  const healthColor = healthScore >= 80 ? 'green' : healthScore >= 60 ? 'yellow' : 'red';

  return (
    <div className={`project-status ${className}`}>
      <div className="status-item">
        <span className="status-label">Project System:</span>
        <span className={`status-value ${healthColor}`}>
          {isLoading ? 'Loading...' : 'Active'}
        </span>
      </div>
      
      <div className="status-item">
        <span className="status-label">Health Score:</span>
        <span className={`status-value ${healthColor}`}>
          {healthScore}/100
        </span>
      </div>
      
      <div className="status-item">
        <span className="status-label">Active Projects:</span>
        <span className="status-value">
          {projectsLoading ? 'Loading...' : projects.length}
        </span>
      </div>

      {showDetails && systemHealth && (
        <div className="status-details">
          <div className="status-item">
            <span className="status-label">Total Projects:</span>
            <span className="status-value">{systemHealth.details?.totalProjects || 0}</span>
          </div>
          
          <div className="status-item">
            <span className="status-label">Completed:</span>
            <span className="status-value">{systemHealth.details?.completedProjects || 0}</span>
          </div>
          
          <div className="status-item">
            <span className="status-label">Ideas:</span>
            <span className="status-value">{systemHealth.details?.ideas || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: ProjectContextResult;
  className?: string;
}

export function ProjectCard({ project, className = '' }: ProjectCardProps) {
  const { project: metadata, status, health, validation } = project;
  
  const healthScore = health?.score || 0;
  const healthColor = healthScore >= 80 ? 'green' : healthScore >= 60 ? 'yellow' : 'red';
  
  const isValid = validation?.isValid ?? true;
  const errorCount = validation?.errors?.length || 0;
  const warningCount = validation?.warnings?.length || 0;

  return (
    <div className={`project-card ${className}`}>
      <div className="project-header">
        <h3 className="project-title">{metadata.title}</h3>
        <div className="project-badges">
          <span className={`badge priority-${metadata.priority}`}>
            {metadata.priority}
          </span>
          <span className={`badge stage-${metadata.stage}`}>
            {metadata.stage}
          </span>
          <span className={`badge health-${healthColor}`}>
            {healthScore}/100
          </span>
        </div>
      </div>
      
      <div className="project-meta">
        <div className="meta-item">
          <span className="meta-label">Version:</span>
          <span className="meta-value">{metadata.version}</span>
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Last Updated:</span>
          <span className="meta-value">{metadata.lastUpdated}</span>
        </div>
        
        {metadata.assignedAgents && metadata.assignedAgents.length > 0 && (
          <div className="meta-item">
            <span className="meta-label">Agents:</span>
            <span className="meta-value">{metadata.assignedAgents.join(', ')}</span>
          </div>
        )}
      </div>

      {status && (
        <div className="project-progress">
          <div className="progress-item">
            <span className="progress-label">Tasks:</span>
            <span className="progress-value">
              {status.tasksCompleted}/{status.totalTasks}
            </span>
          </div>
          
          <div className="progress-item">
            <span className="progress-label">Blockers:</span>
            <span className={`progress-value ${status.activeBlockers > 0 ? 'warning' : 'success'}`}>
              {status.activeBlockers}
            </span>
          </div>
          
          <div className="progress-item">
            <span className="progress-label">Next:</span>
            <span className="progress-value">{status.nextAction}</span>
          </div>
        </div>
      )}

      {validation && !isValid && (
        <div className="project-validation">
          {errorCount > 0 && (
            <div className="validation-errors">
              <span className="validation-label">Errors:</span>
              <span className="validation-count error">{errorCount}</span>
            </div>
          )}
          
          {warningCount > 0 && (
            <div className="validation-warnings">
              <span className="validation-label">Warnings:</span>
              <span className="validation-count warning">{warningCount}</span>
            </div>
          )}
        </div>
      )}

      {metadata.tags && metadata.tags.length > 0 && (
        <div className="project-tags">
          {metadata.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

interface ProjectListProps {
  className?: string;
  showDetails?: boolean;
}

export function ProjectList({ className = '', showDetails = false }: ProjectListProps) {
  const { projects, isLoading, error } = useActiveProjects();

  if (isLoading) {
    return (
      <div className={`project-list ${className}`}>
        <div className="loading">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`project-list ${className}`}>
        <div className="error">Error loading projects: {error}</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className={`project-list ${className}`}>
        <div className="empty">No active projects found</div>
      </div>
    );
  }

  return (
    <div className={`project-list ${className}`}>
      <div className="project-list-header">
        <h2>Active Projects ({projects.length})</h2>
      </div>
      
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard
            key={project.project.projectId}
            project={project}
            className={showDetails ? 'detailed' : ''}
          />
        ))}
      </div>
    </div>
  );
}

// Export default
export default ProjectStatus;
