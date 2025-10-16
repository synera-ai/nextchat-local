import { NextResponse } from 'next/server';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface ProjectData {
  id: string;
  title: string;
  stage: string;
  lastUpdated: string;
  status: string;
  priority: string;
  tags: string[];
}

export async function GET() {
  try {
    const projectsDir = join(process.cwd(), 'docs/projects/active');
    
    // Get all markdown files recursively
    const getAllMarkdownFiles = (dir: string): string[] => {
      const files: string[] = [];
      const items = readdirSync(dir);
      
      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...getAllMarkdownFiles(fullPath));
        } else if (item.endsWith('.md')) {
          files.push(fullPath);
        }
      }
      
      return files;
    };
    
    const projectFiles = getAllMarkdownFiles(projectsDir).slice(0, 10);
    const projects: ProjectData[] = [];

    for (const filePath of projectFiles) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        const stats = statSync(filePath);
            
            // Parse YAML frontmatter
            const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
            if (yamlMatch) {
              const yamlContent = yamlMatch[1];
              const titleMatch = yamlContent.match(/title:\s*["']?([^"'\n]+)["']?/);
              const stageMatch = yamlContent.match(/stage:\s*(\w+)/);
              const priorityMatch = yamlContent.match(/priority:\s*(\w+)/);
              const tagsMatch = yamlContent.match(/tags:\s*\[([^\]]+)\]/);
              
              const relativePath = filePath.replace(projectsDir + '/', '');
              const projectId = relativePath.replace('.md', '').replace(/\//g, '-');
              const title = titleMatch ? titleMatch[1].replace(/"/g, '') : projectId;
              const stage = stageMatch ? stageMatch[1] : 'unknown';
              const priority = priorityMatch ? priorityMatch[1] : 'medium';
              const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim().replace(/"/g, '')) : [];

              projects.push({
                id: projectId,
                title,
                stage,
                lastUpdated: stats.mtime.toISOString().split('T')[0],
                status: 'active',
                priority,
                tags,
              });
            }
          } catch (error) {
            console.error(`Error reading project file ${filePath}:`, error);
          }
        }

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to fetch project data:", error);
    
    // Fallback to mock data
    const mockData: ProjectData[] = [
      {
        id: "fumadocs-integration",
        title: "Fumadocs Documentation Integration",
        stage: "implementation",
        lastUpdated: "2025-01-16",
        status: "active",
        priority: "high",
        tags: ["feature", "documentation", "fumadocs"],
      },
    ];

    return NextResponse.json(mockData);
  }
}
