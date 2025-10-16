export default async function Page({
  params,
}: {
  params: { slug?: string[] };
}) {
  const slug = params.slug?.join("/") || "index";

  // For now, let's use a simple approach and render the content directly
  // This will be replaced with proper Fumadocs integration once we get the API working

  if (slug === "index") {
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
              <a href="/docs/ai-coder">AI Coder Guide</a> - AI agent
              documentation
            </li>
            <li>
              <a href="/docs/reference">Reference</a> - API and component
              documentation
            </li>
            <li>
              <a href="/docs/projects">Projects</a> - Project management system
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

  // For other pages, show a placeholder for now
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Documentation Page: {slug}</h1>
      <p>
        This page is under construction. The content will be loaded from the
        Fumadocs system.
      </p>
      <a href="/docs" className="text-blue-600 hover:underline">
        ← Back to Documentation
      </a>
    </div>
  );
}
