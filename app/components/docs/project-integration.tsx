"use client";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface ProjectData {
  id: string;
  title: string;
  stage: string;
  lastUpdated: string;
  status: string;
  priority: string;
  tags: string[];
}

export function ProjectIntegration() {
  const location = useLocation();
  const pathname = location.pathname;
  const [projectData, setProjectData] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch project data');
        }
        const projects = await response.json();
        setProjectData(projects);
      } catch (error) {
        console.error("Failed to fetch project data:", error);
        // Fallback to mock data if API fails
        setProjectData([
          {
            id: "fumadocs-integration",
            title: "Fumadocs Documentation Integration",
            stage: "implementation",
            lastUpdated: "2025-01-16",
            status: "active",
            priority: "high",
            tags: ["feature", "documentation", "fumadocs"],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [pathname]);

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-900 mb-3">Active Projects</h3>
      <div className="space-y-3">
        {projectData.slice(0, 5).map((project) => (
          <div key={project.id} className="p-3 bg-white border border-blue-100 rounded-lg hover:shadow-sm transition-shadow">
            <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{project.title}</h4>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                project.priority === 'high' ? 'bg-red-100 text-red-800' :
                project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {project.priority}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {project.stage}
              </span>
              <span className="text-gray-600 text-xs">
                Updated: {new Date(project.lastUpdated).toLocaleDateString()}
              </span>
            </div>
            {project.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {project.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                    +{project.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 text-sm text-blue-700">
        <a href="/docs/projects" className="hover:underline font-medium">
          View all {projectData.length} projects →
        </a>
      </div>
    </div>
  );
}
