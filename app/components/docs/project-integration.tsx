"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface ProjectData {
  id: string;
  title: string;
  stage: string;
  lastUpdated: string;
  status: string;
}

export function ProjectIntegration() {
  const pathname = usePathname();
  const [projectData, setProjectData] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would integrate with your existing project management system
    // For now, we'll simulate the data
    const fetchProjectData = async () => {
      try {
        // In a real implementation, this would call your project management API
        // or read from the docs/projects directory
        const mockData: ProjectData[] = [
          {
            id: "fumadocs-integration",
            title: "Fumadocs Documentation Integration",
            stage: "implementation",
            lastUpdated: "2025-01-16",
            status: "active",
          },
        ];

        setProjectData(mockData);
      } catch (error) {
        console.error("Failed to fetch project data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [pathname]);

  if (loading) {
    return <div>Loading project data...</div>;
  }

  return (
    <div className="project-integration">
      <h3>Related Projects</h3>
      <div className="project-list">
        {projectData.map((project) => (
          <div key={project.id} className="project-item">
            <h4>{project.title}</h4>
            <div className="project-meta">
              <span className={`status status-${project.status}`}>
                {project.status}
              </span>
              <span className="stage">Stage: {project.stage}</span>
              <span className="updated">
                Updated: {new Date(project.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
