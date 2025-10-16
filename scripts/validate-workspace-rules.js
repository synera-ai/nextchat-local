#!/usr/bin/env node

/**
 * Workspace Rules Validation Script
 * Validates compliance with unified project management system rules
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECTS_DIR = './docs/projects';
const ACTIVE_DIR = path.join(PROJECTS_DIR, 'active');
const COMPLETED_DIR = path.join(PROJECTS_DIR, 'completed');
const IDEAS_DIR = path.join(PROJECTS_DIR, 'ideas');

// Validation rules
const VALIDATION_RULES = {
  naming: {
    pattern: /^[a-z]+(-[a-z]+)*-v\d+\.\d+\.\d+\.md$/,
    description: 'Version-first naming convention: {type}-{name}-v{major}.{minor}.{patch}.md'
  },
  directory: {
    pattern: /^v[1-9]\d*$/,
    description: 'Version-organized directories: v1/, v2/, v3/, etc.'
  },
  metadata: {
    required: ['projectId', 'title', 'stage', 'createdDate', 'lastUpdated', 'assignedAgents', 'estimatedCompletion', 'priority', 'tags'],
    description: 'Complete metadata section with all required fields'
  }
};

// Validation results
let validationResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: []
};

/**
 * Validate file naming convention
 */
function validateNaming(filename) {
  const isValid = VALIDATION_RULES.naming.pattern.test(filename);
  if (!isValid) {
    validationResults.errors.push({
      type: 'naming',
      file: filename,
      message: `Invalid naming convention. Expected: ${VALIDATION_RULES.naming.description}`
    });
    validationResults.failed++;
  } else {
    validationResults.passed++;
  }
  return isValid;
}

/**
 * Validate directory structure
 */
function validateDirectory(dirname) {
  const isValid = VALIDATION_RULES.directory.pattern.test(dirname);
  if (!isValid && dirname !== 'templates' && dirname !== 'plans' && dirname !== 'versions') {
    validationResults.errors.push({
      type: 'directory',
      file: dirname,
      message: `Invalid directory structure. Expected: ${VALIDATION_RULES.directory.description}`
    });
    validationResults.failed++;
  } else {
    validationResults.passed++;
  }
  return isValid;
}

/**
 * Validate project metadata
 */
function validateMetadata(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const metadataMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
    
    if (!metadataMatch) {
      validationResults.errors.push({
        type: 'metadata',
        file: filePath,
        message: 'Missing metadata section'
      });
      validationResults.failed++;
      return false;
    }

    const metadata = metadataMatch[1];
    const missingFields = VALIDATION_RULES.metadata.required.filter(field => 
      !metadata.includes(field + ':')
    );

    if (missingFields.length > 0) {
      validationResults.errors.push({
        type: 'metadata',
        file: filePath,
        message: `Missing required metadata fields: ${missingFields.join(', ')}`
      });
      validationResults.failed++;
      return false;
    }

    validationResults.passed++;
    return true;
  } catch (error) {
    validationResults.errors.push({
      type: 'metadata',
      file: filePath,
      message: `Error reading file: ${error.message}`
    });
    validationResults.failed++;
    return false;
  }
}

/**
 * Validate relative paths in project files
 */
function validateRelativePaths(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const absolutePaths = content.match(/\/Users\/[^\/]+\/|C:\\Users\\[^\\]+\\/g);
    
    if (absolutePaths && absolutePaths.length > 0) {
      validationResults.errors.push({
        type: 'paths',
        file: filePath,
        message: `Found absolute paths: ${absolutePaths.join(', ')}`
      });
      validationResults.failed++;
      return false;
    }

    validationResults.passed++;
    return true;
  } catch (error) {
    validationResults.errors.push({
      type: 'paths',
      file: filePath,
      message: `Error reading file: ${error.message}`
    });
    validationResults.failed++;
    return false;
  }
}

/**
 * Recursively scan directory for project files
 */
function scanDirectory(dirPath, basePath = '') {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const relativePath = path.join(basePath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // Validate directory structure
      validateDirectory(item);
      scanDirectory(itemPath, relativePath);
    } else if (item.endsWith('.md')) {
      // Validate project files
      validateNaming(item);
      validateMetadata(itemPath);
      validateRelativePaths(itemPath);
    }
  }
}

/**
 * Main validation function
 */
function validateWorkspaceRules() {
  console.log('🔍 Validating Workspace Rules Compliance...\n');

  // Scan all project directories
  scanDirectory(ACTIVE_DIR, 'active');
  scanDirectory(COMPLETED_DIR, 'completed');
  scanDirectory(IDEAS_DIR, 'ideas');

  // Print results
  console.log('📊 Validation Results:');
  console.log(`✅ Passed: ${validationResults.passed}`);
  console.log(`❌ Failed: ${validationResults.failed}`);
  console.log(`⚠️  Warnings: ${validationResults.warnings}`);
  console.log(`📁 Total Files Checked: ${validationResults.passed + validationResults.failed}\n`);

  if (validationResults.errors.length > 0) {
    console.log('🚨 Validation Errors:');
    validationResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. [${error.type.toUpperCase()}] ${error.file}`);
      console.log(`   ${error.message}\n`);
    });
  }

  // Summary
  const totalChecks = validationResults.passed + validationResults.failed;
  const passRate = totalChecks > 0 ? (validationResults.passed / totalChecks * 100).toFixed(1) : 0;
  
  console.log(`📈 Overall Pass Rate: ${passRate}%`);
  
  if (validationResults.failed === 0) {
    console.log('🎉 All validations passed! Workspace rules are properly implemented.');
    process.exit(0);
  } else {
    console.log('⚠️  Some validations failed. Please review and fix the issues above.');
    process.exit(1);
  }
}

// Run validation
if (require.main === module) {
  validateWorkspaceRules();
}

module.exports = {
  validateWorkspaceRules,
  VALIDATION_RULES
};
