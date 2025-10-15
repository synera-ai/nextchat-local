// Projects Page Component

'use client';

import React from 'react';
import { ProjectStatus, ProjectList } from './project-status';
import { useProjectSystem } from '../core/providers/project-provider';
import styles from './projects-page.module.scss';

export function ProjectsPage() {
  const { isInitialized, isLoading, error, systemHealth } = useProjectSystem();

  if (!isInitialized) {
    return (
      <div className={styles.projectsPage}>
        <div className={styles.loading}>
          <h1>Projects</h1>
          <p>Initializing project management system...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.projectsPage}>
        <div className={styles.error}>
          <h1>Projects</h1>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.projectsPage}>
      <div className={styles.header}>
        <h1>Project Management</h1>
        <p>Manage and track your development projects</p>
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.section}>
            <h2>System Status</h2>
            <ProjectStatus showDetails={true} />
          </div>
        </div>

        <div className={styles.main}>
          <div className={styles.section}>
            <h2>Active Projects</h2>
            <ProjectList showDetails={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectsPage;
