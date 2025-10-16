import { defineConfig } from 'fumadocs-core/config';

export default defineConfig({
  // Path to your content directory
  content: './content/docs',
  
  // Path to your meta.json file
  meta: './content/docs/meta.json',
  
  // Output directory for generated files
  outDir: './.fumadocs',
  
  // Base URL for your documentation
  baseUrl: '/docs',
  
  // Site configuration
  site: {
    name: 'NextChat Documentation',
    description: 'Comprehensive documentation for NextChat - AI-powered chat application with project management',
    url: 'http://localhost:3000',
  },
  
  // Theme configuration
  theme: {
    // Enable dark mode
    darkMode: true,
    
    // Custom CSS
    css: './app/styles/docs.css',
  },
  
  // Search configuration
  search: {
    // Enable search functionality
    enabled: true,
    
    // Search provider (can be 'fuse' or 'algolia')
    provider: 'fuse',
  },
  
  // Navigation configuration
  navigation: {
    // Enable breadcrumbs
    breadcrumbs: true,
    
    // Enable table of contents
    toc: true,
  },
  
  // MDX configuration
  mdx: {
    // Enable syntax highlighting
    syntaxHighlight: true,
    
    // Enable math support
    math: false,
    
    // Enable mermaid diagrams
    mermaid: false,
  },
});
