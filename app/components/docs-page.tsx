"use client";

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

interface SearchResult {
  sectionId: string;
  sectionTitle: string;
  excerpt: string;
}

// Proper markdown to HTML converter
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Escape HTML special chars first to prevent XSS
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Re-unescape for our markdown syntax
  html = html.replace(/&lt;br\/&gt;/g, "<br/>");

  // Code blocks (triple backticks) - must be before inline code
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  // Headings - must be before inline formatting
  html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>");

  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr/>");

  // Lists - handle - items
  const listRegex = /^((?:- .*(?:\n|$))+)/gm;
  html = html.replace(listRegex, (match) => {
    const items = match
      .split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .map((line) => {
        const content = line.replace(/^- /, "").trim();
        return `<li>${content}</li>`;
      })
      .join("");
    return `<ul>${items}</ul>`;
  });

  // Bold and italic (must be before inline code)
  html = html.replace(/\*\*\*([^\*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*([^\*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^\*]+)\*/g, "<em>$1</em>");
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  html = html.replace(/_([^_]+)_/g, "<em>$1</em>");

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Line breaks - convert consecutive newlines to paragraph breaks
  html = html.replace(/\n\n+/g, "</p><p>");

  // Single line breaks to br (except in code blocks)
  const parts = html.split(/<(pre|code)>/);
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // Not inside code block
      parts[i] = parts[i].replace(/\n/g, "<br/>");
    }
  }
  html = parts.join("<");

  // Wrap remaining text in paragraphs if not already wrapped
  const lines = html.split("\n");
  let inBlock = false;
  let result = [];

  for (const line of lines) {
    if (
      line.startsWith("<h") ||
      line.startsWith("<ul") ||
      line.startsWith("<ol") ||
      line.startsWith("<pre") ||
      line.startsWith("<hr") ||
      line.startsWith("<p") ||
      line.trim() === ""
    ) {
      result.push(line);
      inBlock = line.startsWith("<");
    } else if (line.trim()) {
      if (!inBlock && !line.startsWith("<p")) {
        result.push(`<p>${line}</p>`);
      } else {
        result.push(line);
      }
    }
  }

  html = result.join("\n");

  // Clean up empty tags
  html = html.replace(/<p><\/p>/g, "");
  html = html.replace(/<p>(<h[1-6])/g, "$1");
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, "$1");

  return html;
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

NextChat is an AI-powered chat application with advanced project management capabilities.

### Key Features
- **AI Chat Interface**: Modern chat interface with multiple AI model support
- **Project Management**: Integrated project tracking and management system
- **Plugin System**: Extensible plugin architecture for custom functionality
- **Cross-Platform**: Available on Web, Desktop, and Mobile platforms

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
The chat API handles all AI model interactions.

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
  status: 'active' | 'completed';
  priority: 'low' | 'medium' | 'high';
}
\`\`\`

## Configuration

### Environment Variables
- \`NEXT_PUBLIC_API_URL\`: API endpoint URL
- \`NEXT_PUBLIC_APP_NAME\`: Application name
- \`NEXT_PUBLIC_VERSION\`: Application version
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

### Project Components
- **ProjectList**: Displays project overview
- **ProjectCard**: Individual project display
- **ProjectForm**: Create/edit project form

## Component Usage

Components use CSS modules for styling and follow modern React patterns.
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

Plugins can extend chat, UI, and integrate with external services.

### Plugin Capabilities
- **Chat Extensions**: Add custom chat functionality
- **UI Components**: Create custom UI elements
- **API Integrations**: Connect to external services

## Creating a Plugin

Plugins are TypeScript classes implementing the Plugin interface.
        `,
        path: "/docs/plugins",
        icon: "🔌",
        relatedSections: ["components", "api"],
      },
    ];

    setDocSections(sections);
    setLoading(false);
  }, []);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    docSections.forEach((section) => {
      if (
        section.title.toLowerCase().includes(query) ||
        section.description.toLowerCase().includes(query) ||
        section.content.toLowerCase().includes(query)
      ) {
        const lines = section.content.split("\n");
        const matchedLine = lines.find((line) =>
          line.toLowerCase().includes(query),
        );
        const excerpt =
          matchedLine?.substring(0, 100).trim() || section.description;

        results.push({
          sectionId: section.id,
          sectionTitle: section.title,
          excerpt: excerpt,
        });
      }
    });

    setSearchResults(results);
    setShowSearch(results.length > 0);
  }, [searchQuery, docSections]);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setShowSearch(false);
    setSearchQuery("");
    navigate(`/docs/${sectionId}`);
  };

  const currentSection = docSections.find(
    (section) => section.id === activeSection,
  );

  // Group sections by category
  const groupedSections: { [key: string]: DocSection[] } = {};
  docSections.forEach((section) => {
    if (!groupedSections[section.category]) {
      groupedSections[section.category] = [];
    }
    groupedSections[section.category].push(section);
  });

  if (loading) {
    return (
      <div className={styles.docsPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.docsPage}>
      {/* Header */}
      <header className={styles.docsHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerBrand}>
            <span className={styles.headerIcon}>📚</span>
            <h1>Documentation</h1>
          </div>
          <div className={styles.searchWrapper}>
            <input
              type="search"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search documentation"
            />
            <span className={styles.searchIconSmall}>🔍</span>

            {showSearch && searchResults.length > 0 && (
              <div className={styles.searchDropdown}>
                {searchResults.slice(0, 5).map((result) => (
                  <button
                    key={result.sectionId}
                    className={styles.searchItem}
                    onClick={() => {
                      handleSectionChange(result.sectionId);
                      setSearchQuery("");
                    }}
                  >
                    <strong>{result.sectionTitle}</strong>
                    <span>{result.excerpt}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={styles.docsContainer}>
        {/* Sidebar Navigation */}
        <aside className={styles.docsSidebar}>
          <nav className={styles.sidebarNav}>
            {Object.entries(groupedSections).map(([category, sections]) => (
              <div key={category} className={styles.navSection}>
                <h3 className={styles.navCategory}>{category}</h3>
                <ul className={styles.navList}>
                  {sections.map((section) => (
                    <li key={section.id}>
                      <button
                        className={`${styles.navLink} ${
                          activeSection === section.id ? styles.active : ""
                        }`}
                        onClick={() => handleSectionChange(section.id)}
                        aria-current={
                          activeSection === section.id ? "page" : undefined
                        }
                      >
                        <span className={styles.navIcon}>{section.icon}</span>
                        <span className={styles.navLabel}>{section.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            <ProjectIntegration />
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.docsContent}>
          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <a href="/#/">Home</a>
            <span>/</span>
            <a href="/#/docs">Docs</a>
            {currentSection && (
              <>
                <span>/</span>
                <span>{currentSection.title}</span>
              </>
            )}
          </div>

          {/* Content Header */}
          {currentSection && (
            <div className={styles.contentTop}>
              <div className={styles.contentHeader}>
                <div className={styles.headerTitleSection}>
                  <span className={styles.contentIcon}>
                    {currentSection.icon}
                  </span>
                  <div>
                    <p className={styles.contentCategory}>
                      {currentSection.category}
                    </p>
                    <h1 className={styles.contentTitle}>
                      {currentSection.title}
                    </h1>
                  </div>
                </div>
                <p className={styles.contentDesc}>
                  {currentSection.description}
                </p>
              </div>
            </div>
          )}

          {/* Markdown Content */}
          {currentSection && (
            <div className={styles.contentBody}>
              <div
                className={styles.markdown}
                dangerouslySetInnerHTML={{
                  __html: markdownToHtml(currentSection.content),
                }}
              />
            </div>
          )}

          {/* Related Docs */}
          {currentSection?.relatedSections &&
            currentSection.relatedSections.length > 0 && (
              <div className={styles.relatedSection}>
                <h2>Related Topics</h2>
                <div className={styles.relatedGrid}>
                  {currentSection.relatedSections
                    .map((id) => docSections.find((s) => s.id === id))
                    .filter(Boolean)
                    .map((section) => (
                      <button
                        key={section!.id}
                        className={styles.relatedCard}
                        onClick={() => handleSectionChange(section!.id)}
                      >
                        <span className={styles.relatedCardIcon}>
                          {section!.icon}
                        </span>
                        <h4>{section!.title}</h4>
                        <p>{section!.description}</p>
                      </button>
                    ))}
                </div>
              </div>
            )}

          {/* Footer Nav */}
          <div className={styles.footerNav}>
            {docSections.length > 0 && (
              <>
                {activeSection !== docSections[0].id && (
                  <button
                    className={styles.navButton}
                    onClick={() => {
                      const idx = docSections.findIndex(
                        (s) => s.id === activeSection,
                      );
                      if (idx > 0) handleSectionChange(docSections[idx - 1].id);
                    }}
                  >
                    ← Previous
                  </button>
                )}
                {activeSection !== docSections[docSections.length - 1].id && (
                  <button
                    className={styles.navButton}
                    onClick={() => {
                      const idx = docSections.findIndex(
                        (s) => s.id === activeSection,
                      );
                      if (idx < docSections.length - 1)
                        handleSectionChange(docSections[idx + 1].id);
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
