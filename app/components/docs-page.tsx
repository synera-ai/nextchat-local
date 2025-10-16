"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  category: string;
  relatedSections?: string[];
}

interface TableOfContentsItem {
  level: number;
  title: string;
  id: string;
}

interface SearchResult {
  sectionId: string;
  sectionTitle: string;
  excerpt: string;
  relevance: number;
}

export function DocsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [docSections, setDocSections] = useState<DocSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>(
    [],
  );

  // Load documentation sections
  useEffect(() => {
    const sections: DocSection[] = [
      {
        id: "overview",
        title: "Overview",
        category: "Getting Started",
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
        icon: "📚",
        relatedSections: ["api", "components"],
      },
      {
        id: "api",
        title: "API Reference",
        category: "Development",
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
        icon: "🔧",
        relatedSections: ["overview", "components"],
      },
      {
        id: "components",
        title: "Components",
        category: "Development",
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
        icon: "🧩",
        relatedSections: ["plugins", "api"],
      },
      {
        id: "plugins",
        title: "Plugin System",
        category: "Development",
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
        icon: "🔌",
        relatedSections: ["components", "api"],
      },
    ];

    setDocSections(sections);
    setLoading(false);
  }, []);

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    docSections.forEach((section) => {
      const contentLower = section.content.toLowerCase();
      const titleMatch = section.title.toLowerCase().includes(query);
      const contentMatches = (contentLower.match(new RegExp(query, "g")) || [])
        .length;

      if (titleMatch || contentMatches > 0) {
        const relevance = titleMatch ? 10 : contentMatches;
        const lines = section.content.split("\n");
        const matchedLine = lines.find((line) =>
          line.toLowerCase().includes(query),
        );
        const excerpt = matchedLine?.substring(0, 100) || section.description;

        results.push({
          sectionId: section.id,
          sectionTitle: section.title,
          excerpt: excerpt,
          relevance: relevance,
        });
      }
    });

    setSearchResults(results.sort((a, b) => b.relevance - a.relevance));
  }, [searchQuery, docSections]);

  // Generate table of contents from markdown
  useEffect(() => {
    const currentSection = docSections.find(
      (section) => section.id === activeSection,
    );
    if (!currentSection) return;

    const headings: TableOfContentsItem[] = [];
    const lines = currentSection.content.split("\n");

    lines.forEach((line, index) => {
      const match = line.match(/^(#+)\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const title = match[2];
        headings.push({
          level,
          title,
          id: `heading-${index}`,
        });
      }
    });

    setTableOfContents(headings);
  }, [activeSection, docSections]);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setShowSearch(false);
    setSearchQuery("");
    navigate(`/docs/${sectionId}`);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  const currentSection = docSections.find(
    (section) => section.id === activeSection,
  );
  const relatedSections =
    currentSection?.relatedSections
      ?.map((id) => docSections.find((section) => section.id === id))
      .filter(Boolean) || [];

  const groupedSections = useMemo(() => {
    const grouped: { [key: string]: DocSection[] } = {};
    docSections.forEach((section) => {
      if (!grouped[section.category]) {
        grouped[section.category] = [];
      }
      grouped[section.category].push(section);
    });
    return grouped;
  }, [docSections]);

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
        {/* Sidebar */}
        <aside
          className={`${styles.docsSidebar} ${
            sidebarOpen ? "" : styles.sidebarCollapsed
          }`}
        >
          <div className={styles.sidebarHeader}>
            <button
              className={styles.sidebarToggle}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
          </div>

          <DocsNavigation className={styles.docsNav} />

          {/* Categorized Navigation */}
          <div className={styles.sectionNav}>
            <h3>Sections</h3>
            {Object.entries(groupedSections).map(([category, sections]) => (
              <div key={category} className={styles.categoryGroup}>
                <h4 className={styles.categoryTitle}>{category}</h4>
                <nav>
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      className={`${styles.sectionButton} ${
                        activeSection === section.id ? styles.active : ""
                      }`}
                      onClick={() => handleSectionChange(section.id)}
                      aria-current={
                        activeSection === section.id ? "page" : undefined
                      }
                    >
                      <span className={styles.sectionIcon} aria-hidden="true">
                        {section.icon}
                      </span>
                      <div className={styles.sectionInfo}>
                        <h5>{section.title}</h5>
                        <p>{section.description}</p>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          <div className={styles.projectIntegration}>
            <ProjectIntegration />
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.docsContent}>
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <div className={styles.searchBox}>
              <input
                type="search"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearch(e.target.value.length > 0);
                }}
                className={styles.searchInput}
                aria-label="Search documentation"
              />
              <span className={styles.searchIcon} aria-hidden="true">
                🔍
              </span>
            </div>

            {/* Search Results */}
            {showSearch && searchResults.length > 0 && (
              <div className={styles.searchResults}>
                <div className={styles.searchResultsHeader}>
                  <h4>Search Results ({searchResults.length})</h4>
                </div>
                {searchResults.map((result) => (
                  <button
                    key={result.sectionId}
                    className={styles.searchResultItem}
                    onClick={() => {
                      handleSectionChange(result.sectionId);
                      setShowSearch(false);
                    }}
                  >
                    <h5>{result.sectionTitle}</h5>
                    <p>{result.excerpt}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Breadcrumb Navigation */}
          <div className={styles.breadcrumb}>
            <a href="/#/" aria-label="Home">
              Home
            </a>
            <span>/</span>
            <a href="/#/docs">Documentation</a>
            <span>/</span>
            <span aria-current="page">{currentSection?.title}</span>
          </div>

          {/* Content Header */}
          <div className={styles.contentHeader}>
            <div className={styles.headerTitle}>
              <span className={styles.headerIcon} aria-hidden="true">
                {currentSection?.icon}
              </span>
              <div>
                <p className={styles.breadcrumbText}>
                  {currentSection?.category}
                </p>
                <h1>{currentSection?.title}</h1>
              </div>
            </div>
            <p className={styles.headerDescription}>
              {currentSection?.description}
            </p>
          </div>

          <div className={styles.contentWrapper}>
            {/* Table of Contents (Desktop) */}
            {tableOfContents.length > 0 && (
              <aside className={styles.tableOfContents}>
                <h4>On this page</h4>
                <nav aria-label="Document outline">
                  <ul>
                    {tableOfContents.map((item) => (
                      <li
                        key={item.id}
                        style={{ marginLeft: `${(item.level - 1) * 1}rem` }}
                      >
                        <a href={`#${item.id}`}>{item.title}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}

            {/* Main Content Body */}
            <div className={styles.contentBody}>
              <div
                className={styles.markdownContent}
                dangerouslySetInnerHTML={{
                  __html:
                    currentSection?.content
                      ?.replace(/\n/g, "<br>")
                      ?.replace(
                        /```([^`]+)```/g,
                        (match, code) =>
                          `<div class="${styles.codeBlock}"><button class="${
                            styles.copyButton
                          }" onclick="navigator.clipboard.writeText(\`${code
                            .trim()
                            .replace(
                              /\`/g,
                              "\\`",
                            )}\`)">Copy</button><pre><code>${code}</code></pre></div>`,
                      )
                      ?.replace(/`([^`]+)`/g, "<code>$1</code>")
                      ?.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
                      ?.replace(/\*([^*]+)\*/g, "<em>$1</em>")
                      ?.replace(/^# (.*$)/gm, "<h1>$1</h1>")
                      ?.replace(/^## (.*$)/gm, "<h2>$1</h2>")
                      ?.replace(/^### (.*$)/gm, "<h3>$1</h3>")
                      ?.replace(/^- (.*$)/gm, "<li>$1</li>")
                      ?.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>") || "",
                }}
              />

              {/* Related Documents */}
              {relatedSections.length > 0 && (
                <div className={styles.relatedDocs}>
                  <h3>Related Documentation</h3>
                  <div className={styles.relatedDocsGrid}>
                    {relatedSections.map((section) => (
                      <button
                        key={section.id}
                        className={styles.relatedDocCard}
                        onClick={() => handleSectionChange(section.id)}
                      >
                        <span className={styles.relatedDocIcon}>
                          {section.icon}
                        </span>
                        <h4>{section.title}</h4>
                        <p>{section.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className={styles.footerNavigation}>
            {docSections.length > 0 && (
              <>
                {activeSection !== docSections[0].id && (
                  <button
                    className={styles.footerNav}
                    onClick={() => {
                      const currentIndex = docSections.findIndex(
                        (s) => s.id === activeSection,
                      );
                      if (currentIndex > 0) {
                        handleSectionChange(docSections[currentIndex - 1].id);
                      }
                    }}
                  >
                    ← Previous
                  </button>
                )}
                {activeSection !== docSections[docSections.length - 1].id && (
                  <button
                    className={styles.footerNav}
                    onClick={() => {
                      const currentIndex = docSections.findIndex(
                        (s) => s.id === activeSection,
                      );
                      if (currentIndex < docSections.length - 1) {
                        handleSectionChange(docSections[currentIndex + 1].id);
                      }
                    }}
                  >
                    Next →
                  </button>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
