/**
 * Path utility functions for consistent relative path handling
 * Ensures all file references use relative paths from project root
 */

/**
 * Get relative path from project root
 * @param filePath - The file path to convert to relative
 * @returns Relative path from project root
 */
export function getRelativePath(filePath: string): string {
  // Remove absolute path prefix if present
  const projectRoot = process.cwd();
  if (filePath.startsWith(projectRoot)) {
    return filePath.replace(projectRoot, ".").replace(/\\/g, "/");
  }

  // If already relative, ensure it starts with ./
  if (!filePath.startsWith("/") && !filePath.startsWith("./")) {
    return `./${filePath}`;
  }

  return filePath;
}

/**
 * Get relative path for documentation files
 * @param filePath - The file path to convert
 * @returns Relative path for documentation
 */
export function getDocRelativePath(filePath: string): string {
  const relativePath = getRelativePath(filePath);

  // Ensure docs paths are relative to project root
  if (relativePath.startsWith("./docs/")) {
    return relativePath;
  }

  if (relativePath.startsWith("docs/")) {
    return `./${relativePath}`;
  }

  return relativePath;
}

/**
 * Get relative path for project files
 * @param filePath - The file path to convert
 * @returns Relative path for project files
 */
export function getProjectRelativePath(filePath: string): string {
  const relativePath = getRelativePath(filePath);

  // Ensure project paths are relative to project root
  if (relativePath.startsWith("./docs/projects/")) {
    return relativePath;
  }

  if (relativePath.startsWith("docs/projects/")) {
    return `./${relativePath}`;
  }

  return relativePath;
}

/**
 * Validate that a path is relative
 * @param filePath - The file path to validate
 * @returns True if path is relative, false otherwise
 */
export function isRelativePath(filePath: string): boolean {
  // Check for absolute paths (starting with / or drive letter)
  if (filePath.startsWith("/") || /^[A-Za-z]:/.test(filePath)) {
    return false;
  }

  // Check for user home directory references
  if (filePath.includes("/Users/") || filePath.includes("~/")) {
    return false;
  }

  return true;
}

/**
 * Convert absolute path to relative path
 * @param absolutePath - The absolute path to convert
 * @param basePath - The base path to make relative to (defaults to project root)
 * @returns Relative path
 */
export function toRelativePath(
  absolutePath: string,
  basePath: string = process.cwd(),
): string {
  if (isRelativePath(absolutePath)) {
    return absolutePath;
  }

  // Remove base path prefix
  if (absolutePath.startsWith(basePath)) {
    const relative = absolutePath.replace(basePath, "").replace(/^\/+/, "");
    return relative ? `./${relative}` : "./";
  }

  // If path doesn't start with base path, return as-is with ./ prefix
  return `./${absolutePath}`;
}

/**
 * Get project root relative path
 * @param filePath - The file path
 * @returns Path relative to project root
 */
export function getProjectRootRelativePath(filePath: string): string {
  // Remove any absolute path components
  let cleanPath = filePath;

  // Remove common absolute path patterns
  cleanPath = cleanPath.replace(/^\/Users\/[^\/]+\/nextchat-[^\/]+\//, "./");
  cleanPath = cleanPath.replace(/^\/Users\/[^\/]+\/nextchat-local\//, "./");
  cleanPath = cleanPath.replace(/^\/Users\/[^\/]+\/nextchat-clean\//, "./");

  // Ensure it starts with ./
  if (!cleanPath.startsWith("./") && !cleanPath.startsWith("/")) {
    cleanPath = `./${cleanPath}`;
  }

  return cleanPath;
}
