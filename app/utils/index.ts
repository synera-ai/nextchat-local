// Main utilities barrel export - organized by domain

// DOM utilities
export * from "./dom";

// Clipboard and file operations
export * from "./clipboard";

// Device and platform detection
export * from "./device";

// Text formatting and content processing
export * from "./format";

// Network and API utilities
export * from "./network";

// Storage and persistence utilities
export * from "./storage";

// Re-export commonly used utilities for backward compatibility
export { useWindowSize, useMobileScreen, MOBILE_MAX_WIDTH } from "./device";
export { copyToClipboard, downloadAs, readFromFile } from "./clipboard";
export { autoGrowTextArea, getCSSVar, selectOrCopy } from "./dom";
export {
  trimTopic,
  getMessageTextContent,
  getMessageTextContentWithoutThinking,
  getMessageImages,
  semverCompare,
} from "./format";
export {
  fetch,
  adapter,
  getTimeoutMSByModel,
  getModelSizes,
  supportsCustomSize,
  showPlugins,
  isVisionModel,
  isDalle3,
} from "./network";
export { safeLocalStorage, getOperationId, clientUpdate } from "./storage";
