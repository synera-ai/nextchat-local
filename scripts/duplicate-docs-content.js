#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = './docs';
const TARGET_DIR = './content/docs';
const IMAGES_SOURCE_DIR = './docs/images';
const IMAGES_TARGET_DIR = './content/docs/images';

// File extensions to process
const MARKDOWN_EXTENSIONS = ['.md', '.mdx'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];

// Statistics
let stats = {
  markdownFiles: 0,
  imageFiles: 0,
  errors: 0,
  skipped: 0,
};

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Convert markdown to MDX with frontmatter
 */
function convertMarkdownToMDX(content, filePath) {
  // Extract title from filename or first heading
  const fileName = path.basename(filePath, path.extname(filePath));
  const title = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Check if content already has frontmatter
  if (content.startsWith('---')) {
    return content; // Already has frontmatter
  }
  
  // Extract first heading as title if available
  const headingMatch = content.match(/^#\s+(.+)$/m);
  const extractedTitle = headingMatch ? headingMatch[1] : title;
  
  // Create frontmatter
  const frontmatter = `---
title: "${extractedTitle}"
description: "${extractedTitle} - NextChat Documentation"
lastModified: "${new Date().toISOString()}"
---

`;
  
  return frontmatter + content;
}

/**
 * Update internal links in content
 */
function updateInternalLinks(content, sourcePath, targetPath) {
  // Convert relative links from docs/ to /docs/
  content = content.replace(/\]\(\.\/docs\//g, '](/docs/');
  content = content.replace(/\]\(docs\//g, '](/docs/');
  
  // Convert relative image links
  content = content.replace(/\]\(\.\/images\//g, '](/docs/images/');
  content = content.replace(/\]\(images\//g, '](/docs/images/');
  
  // Convert relative links to other docs
  content = content.replace(/\]\(\.\/([^)]+\.md)/g, '](/docs/$1');
  content = content.replace(/\]\(([^)]+\.md)/g, '](/docs/$1');
  
  return content;
}

/**
 * Process a single markdown file
 */
function processMarkdownFile(sourcePath, targetPath) {
  try {
    const content = fs.readFileSync(sourcePath, 'utf-8');
    const mdxContent = convertMarkdownToMDX(content, sourcePath);
    const updatedContent = updateInternalLinks(mdxContent, sourcePath, targetPath);
    
    // Ensure target directory exists
    ensureDir(path.dirname(targetPath));
    
    // Write the file
    fs.writeFileSync(targetPath, updatedContent, 'utf-8');
    
    console.log(`✓ Processed: ${sourcePath} → ${targetPath}`);
    stats.markdownFiles++;
    
  } catch (error) {
    console.error(`✗ Error processing ${sourcePath}:`, error.message);
    stats.errors++;
  }
}

/**
 * Copy an image file
 */
function copyImageFile(sourcePath, targetPath) {
  try {
    // Ensure target directory exists
    ensureDir(path.dirname(targetPath));
    
    // Copy the file
    fs.copyFileSync(sourcePath, targetPath);
    
    console.log(`✓ Copied image: ${sourcePath} → ${targetPath}`);
    stats.imageFiles++;
    
  } catch (error) {
    console.error(`✗ Error copying ${sourcePath}:`, error.message);
    stats.errors++;
  }
}

/**
 * Recursively process directory
 */
function processDirectory(sourceDir, targetDir, isImageDir = false) {
  if (!fs.existsSync(sourceDir)) {
    console.log(`Source directory does not exist: ${sourceDir}`);
    return;
  }
  
  const items = fs.readdirSync(sourceDir);
  
  for (const item of items) {
    const sourcePath = path.join(sourceDir, item);
    const targetPath = path.join(targetDir, item);
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      // Skip certain directories
      if (['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) {
        console.log(`⏭ Skipped directory: ${sourcePath}`);
        stats.skipped++;
        continue;
      }
      
      processDirectory(sourcePath, targetPath, isImageDir);
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      
      if (isImageDir && IMAGE_EXTENSIONS.includes(ext)) {
        copyImageFile(sourcePath, targetPath);
      } else if (!isImageDir && MARKDOWN_EXTENSIONS.includes(ext)) {
        // Convert .md to .mdx
        const mdxPath = targetPath.replace(/\.md$/, '.mdx');
        processMarkdownFile(sourcePath, mdxPath);
      } else if (!isImageDir) {
        // Copy other files as-is
        try {
          ensureDir(path.dirname(targetPath));
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`✓ Copied: ${sourcePath} → ${targetPath}`);
        } catch (error) {
          console.error(`✗ Error copying ${sourcePath}:`, error.message);
          stats.errors++;
        }
      }
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting documentation content duplication...\n');
  
  // Ensure target directories exist
  ensureDir(TARGET_DIR);
  ensureDir(IMAGES_TARGET_DIR);
  
  // Process markdown files
  console.log('📝 Processing markdown files...');
  processDirectory(SOURCE_DIR, TARGET_DIR, false);
  
  // Process image files
  console.log('\n🖼️ Processing image files...');
  processDirectory(IMAGES_SOURCE_DIR, IMAGES_TARGET_DIR, true);
  
  // Print statistics
  console.log('\n📊 Duplication Statistics:');
  console.log(`  Markdown files processed: ${stats.markdownFiles}`);
  console.log(`  Image files copied: ${stats.imageFiles}`);
  console.log(`  Errors: ${stats.errors}`);
  console.log(`  Skipped: ${stats.skipped}`);
  
  if (stats.errors > 0) {
    console.log('\n⚠️ Some files had errors during processing.');
    process.exit(1);
  } else {
    console.log('\n✅ Content duplication completed successfully!');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  processMarkdownFile,
  copyImageFile,
  processDirectory,
  convertMarkdownToMDX,
  updateInternalLinks,
};
