export default async function Page({
  params,
}: {
  params: { slug?: string[] };
}) {
  const slug = params.slug?.join("/") || "index";

  // Handle root docs path
  if (!params.slug || params.slug.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">NextChat Documentation</h1>
        <div className="prose max-w-none">
          <p>
            Welcome to the NextChat documentation. This is the main
            documentation hub.
          </p>
          <h2>Getting Started</h2>
          <p>
            To get started with NextChat, please refer to the following
            sections:
          </p>
          <ul>
            <li>
              <a href="/docs/foundation">Foundation</a> - Core concepts and
              architecture
            </li>
            <li>
              <a href="/docs/developers">Developer Guide</a> - Development setup
              and guidelines
            </li>
            <li>
              <a href="/docs/api">API Reference</a> - API documentation
            </li>
          </ul>

          <h2>Features</h2>
          <ul>
            <li>Modern chat interface with AI integration</li>
            <li>Cross-platform support (Web, Desktop, Mobile)</li>
            <li>Plugin system for extensibility</li>
            <li>Real-time collaboration</li>
            <li>Advanced project management</li>
          </ul>

          <h2>Quick Start</h2>
          <p>To get started with NextChat:</p>
          <ol>
            <li>Clone the repository</li>
            <li>
              Install dependencies with <code>yarn install</code>
            </li>
            <li>
              Start the development server with <code>yarn dev</code>
            </li>
            <li>
              Open your browser to <code>http://localhost:3000</code>
            </li>
          </ol>
        </div>
      </div>
    );
  }

  // Handle specific documentation pages
  const pageContent = getPageContent(slug);

  if (!pageContent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Page not found</h1>
        <p>The requested documentation page could not be found.</p>
        <a href="/docs" className="text-blue-600 hover:underline">
          ← Back to Documentation
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="prose max-w-none">
        <h1>{pageContent.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: pageContent.content }} />
      </article>
    </div>
  );
}

function getPageContent(slug: string) {
  const pages: Record<string, { title: string; content: string }> = {
    foundation: {
      title: "Foundation",
      content: `
        <h2>Architecture Overview</h2>
        <p>NextChat is built on a modern, scalable architecture that supports multiple platforms and use cases.</p>
        
        <h3>Core Components</h3>
        <ul>
          <li><strong>Frontend</strong>: Next.js 14 with App Router</li>
          <li><strong>Backend</strong>: Node.js with TypeScript</li>
          <li><strong>Database</strong>: Flexible storage options</li>
          <li><strong>AI Integration</strong>: Multiple AI provider support</li>
        </ul>
        
        <h3>Design Principles</h3>
        <ul>
          <li>Modular and extensible</li>
          <li>Performance-first</li>
          <li>Developer-friendly</li>
          <li>Cross-platform compatibility</li>
        </ul>
      `,
    },
    developers: {
      title: "Developer Guide",
      content: `
        <h2>Development Setup</h2>
        <p>This guide will help you set up your development environment for NextChat.</p>
        
        <h3>Prerequisites</h3>
        <ul>
          <li>Node.js 18+</li>
          <li>Yarn package manager</li>
          <li>Git</li>
        </ul>
        
        <h3>Installation</h3>
        <pre><code>git clone https://github.com/your-org/nextchat.git
cd nextchat
yarn install
yarn dev</code></pre>
        
        <h3>Project Structure</h3>
        <ul>
          <li><code>app/</code> - Next.js app directory</li>
          <li><code>components/</code> - React components</li>
          <li><code>lib/</code> - Utility functions</li>
          <li><code>docs/</code> - Documentation</li>
        </ul>
      `,
    },
    api: {
      title: "API Reference",
      content: `
        <h2>API Endpoints</h2>
        <p>NextChat provides a comprehensive API for integration and customization.</p>
        
        <h3>Authentication</h3>
        <p>All API requests require authentication via API key or session token.</p>
        
        <h3>Chat API</h3>
        <ul>
          <li><code>POST /api/chat</code> - Send a message</li>
          <li><code>GET /api/chat/history</code> - Get chat history</li>
          <li><code>DELETE /api/chat/:id</code> - Delete a message</li>
        </ul>
        
        <h3>Project Management API</h3>
        <ul>
          <li><code>GET /api/projects</code> - List projects</li>
          <li><code>POST /api/projects</code> - Create project</li>
          <li><code>PUT /api/projects/:id</code> - Update project</li>
        </ul>
      `,
    },
  };

  return pages[slug] || null;
}
