// Temporary mock implementation until we get the proper Fumadocs source working
import React from 'react';

// Mock page data structure
interface MockPage {
  slugs: string[];
  data: {
    title: string;
    description: string;
    body: React.ComponentType;
    toc?: any[];
    full?: boolean;
    lastModified?: string;
  };
}

// Mock pages data
const mockPages: MockPage[] = [
  {
    slugs: ['index'],
    data: {
      title: 'NextChat Documentation',
      description: 'Comprehensive documentation for NextChat - AI-powered chat application with project management',
      body: () => React.createElement('div', null,
        React.createElement('h1', null, 'Welcome to NextChat Documentation'),
        React.createElement('p', null, 'This is the main documentation hub powered by Fumadocs.'),
        React.createElement('h2', null, 'Getting Started'),
        React.createElement('p', null, 'To get started with NextChat, please refer to the following sections:'),
        React.createElement('ul', null,
          React.createElement('li', null, React.createElement('a', { href: '/docs/foundation' }, 'Foundation'), ' - Core concepts and architecture'),
          React.createElement('li', null, React.createElement('a', { href: '/docs/developers' }, 'Developer Guide'), ' - Development setup and guidelines'),
          React.createElement('li', null, React.createElement('a', { href: '/docs/ai-coder' }, 'AI Coder Guide'), ' - AI agent documentation'),
          React.createElement('li', null, React.createElement('a', { href: '/docs/reference' }, 'Reference'), ' - API and component documentation'),
          React.createElement('li', null, React.createElement('a', { href: '/docs/projects' }, 'Projects'), ' - Project management system')
        )
      ),
      toc: [],
      full: false,
      lastModified: new Date().toISOString(),
    },
  },
  {
    slugs: ['foundation', 'getting-started'],
    data: {
      title: 'Getting Started',
      description: 'Quick start guide for NextChat',
      body: () => React.createElement('div', null,
        React.createElement('h1', null, 'Getting Started'),
        React.createElement('p', null, 'Welcome to NextChat! This guide will help you get up and running quickly.'),
        React.createElement('h2', null, 'Installation'),
        React.createElement('p', null, 'To install NextChat:'),
        React.createElement('ol', null,
          React.createElement('li', null, 'Clone the repository'),
          React.createElement('li', null, 'Install dependencies with ', React.createElement('code', null, 'yarn install')),
          React.createElement('li', null, 'Start the development server with ', React.createElement('code', null, 'yarn dev'))
        )
      ),
      toc: [],
      full: false,
      lastModified: new Date().toISOString(),
    },
  },
];

// Mock functions
export function getPage(slugs: string[]): MockPage | undefined {
  return mockPages.find(page => 
    JSON.stringify(page.slugs) === JSON.stringify(slugs)
  );
}

export function getPages(): MockPage[] {
  return mockPages;
}

export const pageTree = {
  name: 'NextChat Documentation',
  url: '/docs',
  type: 'folder' as const,
  children: [
    {
      name: 'Foundation',
      url: '/docs/foundation',
      type: 'folder' as const,
      children: [
        {
          name: 'Getting Started',
          url: '/docs/foundation/getting-started',
          type: 'page' as const,
        },
      ],
    },
  ],
};
