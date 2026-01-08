/**
 * Image Helper Utilities
 * 
 * Common utilities for image handling, validation, and processing
 */

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {object} options - Validation options
 * @returns {object} - { valid: boolean, error?: string }
 */
export function validateImageFile(file, options = {}) {
  const {
    maxSizeMB = 10,
    allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxWidth = null,
    maxHeight = null,
  } = options;

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  // Check file size
  const fileSizeMB = file.size / 1024 / 1024;
  if (fileSizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Get image dimensions from file
 * @param {File} file - Image file
 * @returns {Promise<{width: number, height: number}>}
 */
export function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Create a preview URL from file
 * @param {File} file - Image file
 * @returns {string} - Object URL (remember to revoke it later!)
 */
export function createPreviewUrl(file) {
  return URL.createObjectURL(file);
}

/**
 * Revoke preview URL to free memory
 * @param {string} url - Object URL to revoke
 */
export function revokePreviewUrl(url) {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Generate a unique filename
 * @param {string} originalName - Original filename
 * @param {string} prefix - Optional prefix
 * @returns {string} - Unique filename
 */
export function generateUniqueFilename(originalName, prefix = "") {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  const name = originalName.replace(/\.[^/.]+$/, "");
  const sanitizedName = name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  
  return `${prefix}${prefix ? "-" : ""}${sanitizedName}-${timestamp}-${random}.${extension}`;
}

/**
 * Check if image needs compression
 * @param {File} file - Image file
 * @param {number} thresholdMB - Size threshold in MB
 * @returns {boolean}
 */
export function needsCompression(file, thresholdMB = 1) {
  return file.size / 1024 / 1024 > thresholdMB;
}
