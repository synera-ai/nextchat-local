import { PageConfig, PageSection, TabConfig, ValidationResult } from "./types";

/**
 * Validates that a page configuration is well-formed
 */
export function validatePageConfig(config: PageConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!config.id) {
    errors.push("PageConfig must have an id");
  }
  if (!config.title) {
    errors.push("PageConfig must have a title");
  }
  if (!config.tabs || config.tabs.length === 0) {
    errors.push("PageConfig must have at least one tab");
  }

  // Validate tabs
  if (config.tabs) {
    const tabIds = new Set<string>();
    config.tabs.forEach((tab, tabIndex) => {
      // Check for duplicate tab IDs
      if (tabIds.has(tab.id)) {
        errors.push(`Duplicate tab ID: "${tab.id}"`);
      }
      tabIds.add(tab.id);

      // Validate tab structure
      const tabErrors = validateTabConfig(tab);
      errors.push(...tabErrors.map((e) => `Tab ${tabIndex}: ${e}`));
    });
  }

  // Validate layout if provided
  if (config.layout && !["single", "multi"].includes(config.layout)) {
    errors.push(
      `Invalid layout: "${config.layout}". Must be "single" or "multi"`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates a tab configuration
 */
function validateTabConfig(tab: TabConfig): string[] {
  const errors: string[] = [];

  if (!tab.id) {
    errors.push("Tab must have an id");
  }
  if (!tab.label) {
    errors.push("Tab must have a label");
  }
  if (!tab.sections || tab.sections.length === 0) {
    errors.push("Tab must have at least one section");
  }

  // Validate sections
  if (tab.sections) {
    const sectionIds = new Set<string>();
    tab.sections.forEach((section, sectionIndex) => {
      const sectionErrors = validatePageSection(section);
      errors.push(...sectionErrors.map((e) => `Section ${sectionIndex}: ${e}`));

      if (sectionIds.has(section.id)) {
        errors.push(`Duplicate section ID: "${section.id}"`);
      }
      sectionIds.add(section.id);
    });
  }

  return errors;
}

/**
 * Validates a page section
 */
function validatePageSection(section: PageSection): string[] {
  const errors: string[] = [];

  if (!section.id) {
    errors.push("Section must have an id");
  }
  if (!section.label) {
    errors.push("Section must have a label");
  }
  if (!section.component) {
    errors.push("Section must have a component");
  }

  return errors;
}

/**
 * Safely validates a configuration and returns validation result
 */
export function safeValidatePageConfig(config: unknown): ValidationResult {
  try {
    if (!config || typeof config !== "object") {
      return {
        valid: false,
        errors: ["Configuration must be an object"],
        warnings: [],
      };
    }

    return validatePageConfig(config as PageConfig);
  } catch (error) {
    return {
      valid: false,
      errors: [
        `Validation error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ],
      warnings: [],
    };
  }
}
