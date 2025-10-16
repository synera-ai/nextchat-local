"use client";

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DocsNavigation } from "./docs/docs-navigation";
import { ProjectIntegration } from "./docs/project-integration";
import styles from "./docs-page.module.scss";

interface DocSection {
  id: string;
  title: string;
  description: string;
  content: string;
  path: string;
  icon: string;
}

export function DocsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [docSections, setDocSections] = useState<DocSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load documentation sections
    const sections: DocSection[] = [
      {
        id: "overview",
        title: "Overview",
        description: "NextChat documentation overview and getting started",
        content: `
# NextChat Documentation

Welcome to the NextChat documentation system. This comprehensive guide covers all aspects of the NextChat platform.

## Getting Started

NextChat is an AI-powered chat application with advanced project management capabilities. Here's what you need to know:

### Key Features
- **AI Chat Interface**: Modern chat interface with multiple AI model support
- **Project Management**: Integrated project tracking and management system
- **Plugin System**: Extensible plugin architecture for custom functionality
- **Cross-Platform**: Available on Web, Desktop, and Mobile platforms
- **Real-time Collaboration**: Multi-user collaboration features

### Quick Start
1. **Installation**: Clone the repository and run \`yarn install\`
2. **Configuration**: Set up your API keys in the settings
3. **First Chat**: Start chatting with your preferred AI model
4. **Projects**: Create and manage your first project

## Architecture

NextChat is built with modern web technologies:
- **Frontend**: React with TypeScript
- **Routing**: React Router with hash-based routing
- **State Management**: Zustand for application state
- **Styling**: SCSS with CSS modules
- **Build System**: Next.js with custom configuration

## Development

For developers looking to contribute or extend NextChat:

### Project Structure
\`\`\`
app/
├── components/          # React components
├── store/              # State management
├── utils/              # Utility functions
├── locales/            # Internationalization
├── icons/              # SVG icons
└── styles/             # Global styles
\`\`\`

### Key Components
- **Chat Interface**: Main chat functionality
- **Project System**: Project management components
- **Plugin System**: Plugin loading and execution
- **Settings**: Configuration management
        `,
        path: "/docs",
        icon: "📚"
      },
      {
        id: "api",
        title: "API Reference",
        description: "Complete API documentation for developers",
        content: `
# API Reference

This section covers the NextChat API and integration points.

## Core APIs

### Chat API
The chat API handles all AI model interactions:

\`\`\`typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}
\`\`\`

### Project API
Project management functionality:

\`\`\`typescript
interface Project {
  id: string;
  title: string;
  stage: 'planning' | 'implementation' | 'testing' | 'deployment';
  status: 'active' | 'completed' | 'paused';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}
\`\`\`

### Plugin API
Plugin system integration:

\`\`\`typescript
interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: string[];
}
\`\`\`

## Configuration

### Environment Variables
- \`NEXT_PUBLIC_API_URL\`: API endpoint URL
- \`NEXT_PUBLIC_APP_NAME\`: Application name
- \`NEXT_PUBLIC_VERSION\`: Application version

### Client Configuration
\`\`\`typescript
interface ClientConfig {
  apiUrl: string;
  appName: string;
  version: string;
  features: string[];
}
\`\`\`
        `,
        path: "/docs/api",
        icon: "🔧"
      },
      {
        id: "components",
        title: "Components",
        description: "UI component library and documentation",
        content: `
# Component Library

NextChat provides a comprehensive set of reusable UI components.

## Core Components

### Chat Components
- **ChatInterface**: Main chat container
- **MessageList**: Message display component
- **MessageInput**: Input field for new messages
- **TypingIndicator**: Shows when AI is responding

### Project Components
- **ProjectList**: Displays project overview
- **ProjectCard**: Individual project display
- **ProjectForm**: Create/edit project form
- **ProjectStatus**: Status indicators

### Navigation Components
- **Sidebar**: Main navigation sidebar
- **TopBar**: Application header
- **Breadcrumbs**: Navigation breadcrumbs
- **Tabs**: Tab navigation component

## Component Usage

### Basic Example
\`\`\`tsx
import { ProjectCard } from '@/components/project-card';

function ProjectList() {
  return (
    <div className="project-list">
      {projects.map(project => (
        <ProjectCard 
          key={project.id}
          project={project}
          onClick={() => handleProjectClick(project)}
        />
      ))}
    </div>
  );
}
\`\`\`

### Styling
Components use CSS modules for styling:

\`\`\`scss
.project-card {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
\`\`\`
        `,
        path: "/docs/components",
        icon: "🧩"
      },
      {
        id: "plugins",
        title: "Plugin System",
        description: "Plugin development and integration guide",
        content: `
# Plugin System

NextChat features a powerful plugin system for extending functionality.

## Plugin Architecture

### Plugin Structure
\`\`\`typescript
interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  capabilities: PluginCapability[];
  dependencies?: string[];
}
\`\`\`

### Plugin Capabilities
- **Chat Extensions**: Add custom chat functionality
- **UI Components**: Create custom UI elements
- **API Integrations**: Connect to external services
- **Data Processing**: Process and transform data
- **File Operations**: Handle file uploads and processing

## Creating a Plugin

### Basic Plugin Template
\`\`\`typescript
import { Plugin, PluginCapability } from '@/types/plugin';

export class MyPlugin implements Plugin {
  id = 'my-plugin';
  name = 'My Custom Plugin';
  version = '1.0.0';
  description = 'A custom plugin example';
  author = 'Your Name';
  
  capabilities: PluginCapability[] = [
    {
      type: 'chat-extension',
      name: 'custom-command',
      description: 'Adds a custom chat command'
    }
  ];
  
  async initialize() {
    // Plugin initialization logic
  }
  
  async execute(capability: string, params: any) {
    // Plugin execution logic
  }
}
\`\`\`

### Plugin Registration
\`\`\`typescript
import { PluginManager } from '@/core/plugin-manager';
import { MyPlugin } from './my-plugin';

const pluginManager = new PluginManager();
pluginManager.register(new MyPlugin());
\`\`\`

## Plugin Development

### Development Tools
- **Plugin Stub Generator**: Create plugin templates
- **Testing Framework**: Test plugin functionality
- **Debug Console**: Debug plugin execution
- **Documentation Generator**: Auto-generate plugin docs

### Best Practices
1. **Error Handling**: Always handle errors gracefully
2. **Performance**: Optimize for minimal impact
3. **Security**: Validate all inputs and outputs
4. **Documentation**: Provide clear usage examples
5. **Testing**: Write comprehensive tests
        `,
        path: "/docs/plugins",
        icon: "🔌"
      }
    ];

    setDocSections(sections);
    setLoading(false);
  }, []);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    navigate(`/docs/${sectionId}`);
  };

  const currentSection = docSections.find(section => section.id === activeSection);

  if (loading) {
    return (
      <div className={styles.docsPage}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.docsPage}>
      <div className={styles.docsContainer}>
        <aside className={styles.docsSidebar}>
          <DocsNavigation className={styles.docsNav} />
          
          <div className={styles.sectionNav}>
            <h3>Documentation Sections</h3>
            <nav>
              {docSections.map((section) => (
                <button
                  key={section.id}
                  className={`${styles.sectionButton} ${
                    activeSection === section.id ? styles.active : ""
                  }`}
                  onClick={() => handleSectionChange(section.id)}
                >
                  <span className={styles.sectionIcon}>{section.icon}</span>
                  <div className={styles.sectionInfo}>
                    <h4>{section.title}</h4>
                    <p>{section.description}</p>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className={styles.projectIntegration}>
            <ProjectIntegration />
          </div>
        </aside>

        <main className={styles.docsContent}>
          <div className={styles.contentHeader}>
            <h1>{currentSection?.title}</h1>
            <p>{currentSection?.description}</p>
          </div>
          
          <div className={styles.contentBody}>
            <div 
              className={styles.markdownContent}
              dangerouslySetInnerHTML={{
                __html: currentSection?.content
                  ?.replace(/\n/g, '<br>')
                  ?.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
                  ?.replace(/`([^`]+)`/g, '<code>$1</code>')
                  ?.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                  ?.replace(/\*([^*]+)\*/g, '<em>$1</em>')
                  ?.replace(/^# (.*$)/gm, '<h1>$1</h1>')
                  ?.replace(/^## (.*$)/gm, '<h2>$1</h2>')
                  ?.replace(/^### (.*$)/gm, '<h3>$1</h3>')
                  ?.replace(/^- (.*$)/gm, '<li>$1</li>')
                  ?.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>') || ''
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
