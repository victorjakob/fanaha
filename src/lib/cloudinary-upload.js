/**
 * Cloudinary Upload Utilities
 * 
 * Handles uploading images to Cloudinary with automatic compression
 * and optimization before upload.
 * 
 * NOTE: This module uses browser-image-compression which only works in the browser.
 * Only import this in client components ("use client").
 */

import imageCompression from "browser-image-compression";

/**
 * Upload a single image to Cloudinary with compression
 * @param {File} file - The image file to upload
 * @param {string} folder - Cloudinary folder path (e.g., 'fanaha/alchemy')
 * @param {object} options - Additional options for compression and upload
 * @returns {Promise<string>} - Cloudinary public_id
 */
export async function uploadToCloudinary(
  file,
  folder = "fanaha",
  options = {}
) {
  // Check if we're in browser environment
  if (typeof window === "undefined") {
    throw new Error("uploadToCloudinary can only be used in browser/client environment");
  }

  // Ensure imageCompression is loaded
  if (!imageCompression) {
    imageCompression = require("browser-image-compression").default;
  }

  // Compress image before upload
  const compressionOptions = {
    maxSizeMB: 2, // Maximum file size in MB
    maxWidthOrHeight: 2000, // Maximum width or height
    useWebWorker: true, // Use web worker for better performance
    fileType: "image/jpeg", // Convert to JPEG for better compression
    ...options,
  };

  let fileToUpload = file;

  // Only compress if file is larger than 1MB or if explicitly requested
  if (file.size > 1024 * 1024 || options.alwaysCompress) {
    try {
      fileToUpload = await imageCompression(file, compressionOptions);
      console.log(
        `Compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`
      );
  } catch (error) {
      console.warn("Compression failed, using original file:", error);
      // Continue with original file if compression fails
  }
}

  // Get upload preset from environment
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
    process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!uploadPreset) {
    throw new Error(
      "Cloudinary upload preset not configured. Please set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET or CLOUDINARY_UPLOAD_PRESET in your environment variables."
    );
  }

    const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

  // Note: Transformation parameters are not allowed in unsigned uploads
  // Transformations are applied when generating URLs (in cldUrlEnhanced)

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured. Please set it in your environment variables."
    );
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { message: "Upload failed" },
    }));
    throw new Error(error.error?.message || "Upload failed");
    }

    const data = await response.json();
    return data.public_id; // Return public_id, not full URL
}

/**
 * Upload multiple images to Cloudinary in parallel
 * @param {File[]} files - Array of image files to upload
 * @param {string} folder - Cloudinary folder path
 * @param {Function} onProgress - Optional progress callback (progress: 0-1)
 * @param {object} options - Additional options
 * @returns {Promise<string[]>} - Array of Cloudinary public_ids
 */
export async function uploadMultipleToCloudinary(
  files,
  folder,
  onProgress,
  options = {}
) {
  const uploadPromises = files.map(async (file, index) => {
    try {
      const publicId = await uploadToCloudinary(file, folder, options);

      if (onProgress) {
        onProgress((index + 1) / files.length);
      }

      return publicId;
    } catch (error) {
      console.error(`Failed to upload file ${index + 1}:`, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
}

/**
 * Upload image with custom filename
 * @param {File} file - The image file
 * @param {string} folder - Cloudinary folder path
 * @param {string} publicId - Custom public_id (without folder)
 * @param {object} options - Additional options
 * @returns {Promise<string>} - Cloudinary public_id
 */
export async function uploadToCloudinaryWithId(
  file,
  folder,
  publicId,
  options = {}
) {
  // Check if we're in browser environment
  if (typeof window === "undefined") {
    throw new Error("uploadToCloudinaryWithId can only be used in browser/client environment");
  }

  // Ensure imageCompression is loaded
  if (!imageCompression) {
    imageCompression = require("browser-image-compression").default;
  }

  // Compress if needed
  const compressionOptions = {
    maxSizeMB: 2,
    maxWidthOrHeight: 2000,
    useWebWorker: true,
    fileType: "image/jpeg",
    ...options,
  };

  let fileToUpload = file;
  if (file.size > 1024 * 1024 || options.alwaysCompress) {
    try {
      fileToUpload = await imageCompression(file, compressionOptions);
    } catch (error) {
      console.warn("Compression failed, using original:", error);
    }
  }

  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
    process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!uploadPreset) {
    throw new Error("Cloudinary upload preset not configured");
    }

  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);
  formData.append("public_id", publicId);

  // Note: Transformation parameters are not allowed in unsigned uploads
  // Transformations are applied when generating URLs (in cldUrlEnhanced)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured. Please set it in your environment variables."
    );
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

    if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { message: "Upload failed" },
    }));
    throw new Error(error.error?.message || "Upload failed");
  }

  const data = await response.json();
  return data.public_id;
}
