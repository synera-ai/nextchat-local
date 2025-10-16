#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = './content/docs';
const META_FILE = './content/docs/meta.json';

/**
 * Get all MDX files in a directory recursively
 */
function getMdxFiles(dir, basePath = '') {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = path.join(basePath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip certain directories
      if (['node_modules', '.git', '.next', 'dist', 'build', 'images'].includes(item)) {
        continue;
      }
      
      files.push(...getMdxFiles(fullPath, relativePath));
    } else if (stat.isFile() && item.endsWith('.mdx')) {
      const slug = relativePath.replace(/\.mdx$/, '');
      files.push(slug);
    }
  }
  
  return files;
}

/**
 * Organize files into a hierarchical structure
 */
function organizeFiles(files) {
  const structure = {
    title: "NextChat Documentation",
    pages: []
  };
  
  // Define the main sections and their organization
  const sections = {
    'foundation': {
      title: 'Foundation',
      files: files.filter(f => f.startsWith('foundation/') || f === 'foundation')
    },
    'developers': {
      title: 'Developers',
      files: files.filter(f => f.startsWith('developers/') || f === 'developers')
    },
    'human-developer': {
      title: 'Human Developer',
      files: files.filter(f => f.startsWith('human-developer/') || f === 'human-developer')
    },
    'ai-coder': {
      title: 'AI Coder',
      files: files.filter(f => f.startsWith('ai-coder/') || f === 'ai-coder')
    },
    'ai-developers': {
      title: 'AI Developers',
      files: files.filter(f => f.startsWith('ai-developers/') || f === 'ai-developers')
    },
    'reference': {
      title: 'Reference',
      files: files.filter(f => f.startsWith('reference/') || f === 'reference')
    },
    'projects': {
      title: 'Projects',
      files: files.filter(f => f.startsWith('projects/') || f === 'projects')
    },
    'projects-guide': {
      title: 'Projects Guide',
      files: files.filter(f => f.startsWith('projects-guide/') || f === 'projects-guide')
    },
    'deployment': {
      title: 'Deployment',
      files: files.filter(f => f.includes('bt-en') || f.includes('vercel-en') || f.includes('cloudflare-pages-en'))
    },
    'user-guides': {
      title: 'User Guides',
      files: files.filter(f => f.includes('user-manual-en') || f.includes('faq-en') || f.includes('mcp-en') || f.includes('synchronise-chat-logs-en'))
    },
    'system': {
      title: 'System',
      files: files.filter(f => f.includes('translation') || f.includes('documentation-maintenance-plan'))
    },
    'api': {
      title: 'API',
      files: files.filter(f => f.startsWith('api/') || f === 'api')
    },
    'architecture': {
      title: 'Architecture',
      files: files.filter(f => f.startsWith('architecture/') || f === 'architecture')
    },
    'components': {
      title: 'Components',
      files: files.filter(f => f.startsWith('components/') || f === 'components')
    },
    'interactive': {
      title: 'Interactive',
      files: files.filter(f => f.startsWith('interactive/') || f === 'interactive')
    }
  };
  
  // Add index page
  if (files.includes('index')) {
    structure.pages.push('index');
  }
  
  // Add each section
  for (const [sectionKey, section] of Object.entries(sections)) {
    if (section.files.length > 0) {
      const sectionPages = section.files
        .filter(f => f !== sectionKey) // Remove the section root if it exists
        .sort(); // Sort alphabetically
      
      if (sectionPages.length > 0) {
        structure.pages.push({
          title: section.title,
          pages: sectionPages
        });
      } else if (files.includes(sectionKey)) {
        // If no sub-pages but section root exists, add it directly
        structure.pages.push(sectionKey);
      }
    }
  }
  
  // Add any remaining files that don't fit into sections
  const categorizedFiles = new Set();
  Object.values(sections).forEach(section => {
    section.files.forEach(file => categorizedFiles.add(file));
  });
  
  const uncategorizedFiles = files.filter(f => !categorizedFiles.has(f) && f !== 'index');
  if (uncategorizedFiles.length > 0) {
    structure.pages.push({
      title: 'Other',
      pages: uncategorizedFiles.sort()
    });
  }
  
  return structure;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Generating navigation structure...\n');
  
  // Get all MDX files
  const files = getMdxFiles(CONTENT_DIR);
  console.log(`Found ${files.length} MDX files`);
  
  // Organize into structure
  const structure = organizeFiles(files);
  
  // Write to meta.json
  fs.writeFileSync(META_FILE, JSON.stringify(structure, null, 2), 'utf-8');
  
  console.log(`✅ Navigation structure written to ${META_FILE}`);
  console.log(`📊 Generated ${structure.pages.length} top-level sections`);
  
  // Print summary
  let totalPages = 0;
  structure.pages.forEach(page => {
    if (typeof page === 'string') {
      totalPages++;
    } else {
      totalPages += page.pages.length;
    }
  });
  
  console.log(`📄 Total pages: ${totalPages}`);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  getMdxFiles,
  organizeFiles,
};
