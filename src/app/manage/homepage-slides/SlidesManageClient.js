"use client";

import { useEffect, useState } from "react";
import { Trash2, X, Monitor, Smartphone, Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cldThumbnail } from "@/lib/cloudinary";

export default function SlidesManageClient() {
  const [slides, setSlides] = useState([]);
  const [files, setFiles] = useState([]);
  const [target, setTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // all, desktop, mobile
  const [slideToDelete, setSlideToDelete] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);

  async function load() {
    const res = await fetch("/api/slides");
    const json = await res.json();
    setSlides(json.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function resizeImage(file, maxWidth = 2560, quality = 0.92) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Resize if larger than maxWidth
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          // Use high-quality rendering
          const ctx = canvas.getContext("2d", {
            imageSmoothingEnabled: true,
            imageSmoothingQuality: "high",
          });
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG for better compression (unless original is PNG with transparency)
          const originalType = file.type;
          let outputType = "image/jpeg";
          let outputQuality = quality;

          // Only preserve PNG if it has transparency
          if (originalType === "image/png") {
            // Check if PNG has transparency by drawing to canvas and checking alpha
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const tempCtx = tempCanvas.getContext("2d");
            tempCtx.drawImage(img, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
            const hasTransparency = Array.from(imageData.data).some(
              (_, i) => i % 4 === 3 && imageData.data[i] < 255
            );

            if (hasTransparency) {
              outputType = "image/png";
              outputQuality = 1.0; // PNG doesn't use quality parameter
            }
          } else if (originalType === "image/webp") {
            outputType = "image/webp";
          }

          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, { type: outputType }));
            },
            outputType,
            outputQuality
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function uploadAll() {
    if (files.length === 0) return;
    if (!target) {
      alert("Please select a target device (Desktop or Mobile) before uploading");
      return;
    }
    setLoading(true);
    setUploadProgress({ current: 0, total: files.length, currentFile: "" });

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({
          current: i + 1,
          total: files.length,
          currentFile: file.name,
        });

        // Compress files larger than 8MB to ensure they stay under 10MB limit
        let fileToUpload = file;
        if (file.size > 8 * 1024 * 1024) {
          console.log(
            `Compressing ${file.name}: ${(file.size / 1024 / 1024).toFixed(
              1
            )}MB`
          );

          // First attempt: resize to 2560px max width with 92% quality
          fileToUpload = await resizeImage(file, 2560, 0.92);
          console.log(
            `After first compression: ${(
              fileToUpload.size /
              1024 /
              1024
            ).toFixed(1)}MB`
          );

          // If still too large, compress more aggressively
          if (fileToUpload.size > 9.5 * 1024 * 1024) {
            fileToUpload = await resizeImage(file, 1920, 0.85);
            console.log(
              `After second compression: ${(
                fileToUpload.size /
                1024 /
                1024
              ).toFixed(1)}MB`
            );

            // Final fallback for extremely large files
            if (fileToUpload.size > 9.8 * 1024 * 1024) {
              fileToUpload = await resizeImage(file, 1600, 0.8);
              console.log(
                `After final compression: ${(
                  fileToUpload.size /
                  1024 /
                  1024
                ).toFixed(1)}MB`
              );
            }
          }
        }

        // Upload using unsigned preset (same as rest of app)
        const uploadPreset =
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
          process.env.CLOUDINARY_UPLOAD_PRESET;

        if (!uploadPreset) {
          throw new Error("Cloudinary upload preset not configured");
        }

        const cloudName =
          process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dy8q4hf0k";

        const form = new FormData();
        form.append("file", fileToUpload);
        form.append("upload_preset", uploadPreset);
        form.append("folder", "fanaha/bg");

        // Upload directly to Cloudinary
        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: form,
          }
        );
        const cloudData = await cloudRes.json();

        // Check for Cloudinary errors
        if (cloudRes.status !== 200 || cloudData.error) {
          throw new Error(
            cloudData.error?.message ||
              `Cloudinary upload failed: ${cloudRes.status}`
          );
        }

        // 3) create Supabase row - auto-generate alt from filename
        const filename = file.name.replace(/\.[^/.]+$/, ""); // remove extension
        const autoAlt = `Artwork ${filename}`;

        // Get current max sort value and increment it
        const currentMax =
          slides.length > 0 ? Math.max(...slides.map((s) => s.sort || 0)) : 0;

        const body = {
          public_id: cloudData.public_id,
          alt: autoAlt,
          target,
          sort: currentMax + i + 1, // increment for each file
          active: true,
        };

        const supabaseRes = await fetch("/api/slides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!supabaseRes.ok) {
          const supabaseData = await supabaseRes.json();
          throw new Error(
            supabaseData.error || "Failed to create Supabase row"
          );
        }
      }

      setFiles([]);
      setTarget(null);
      await load();
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!slideToDelete) return;

    setLoading(true);
    try {
      // delete from Cloudinary first (optional but tidy)
      await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: slideToDelete.public_id }),
      });
      await fetch(`/api/slides/${slideToDelete.id}`, { method: "DELETE" });
      await load();
    } catch (error) {
      alert(`Delete failed: ${error.message}`);
    } finally {
      setLoading(false);
      setSlideToDelete(null);
    }
  }

  function handleDeleteClick(slide) {
    setSlideToDelete(slide);
  }

  function handleCancelDelete() {
    setSlideToDelete(null);
  }

  const filteredSlides =
    activeFilter === "all"
      ? slides
      : slides.filter((s) => s.target === activeFilter);

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center pt-4 sm:pt-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">
          Homepage Slides
        </h1>
        <p className="text-sm sm:text-base text-zinc-600">
          Manage background images for your homepage
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-gradient-to-br from-white to-zinc-50 rounded-2xl shadow-lg border border-zinc-200/50 p-6 sm:p-8 lg:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 mb-4 shadow-lg">
            <Upload className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2 tracking-tight">
            Upload Images
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base">
            Select your images and choose the target device
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8 max-w-2xl mx-auto">
          {/* File Input */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 mb-3">
              Select Images
            </label>
            <label className="group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 hover:border-zinc-400 hover:bg-zinc-50/50 bg-white/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                <Upload className="w-10 h-10 mb-3 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                <p className="mb-2 text-sm text-zinc-600 font-medium">
                  <span className="font-semibold text-zinc-900">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-zinc-500">
                  PNG, JPG, WEBP up to 10MB each
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="hidden"
              />
            </label>
            {files.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  {files.length} file{files.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            )}
          </div>

          {/* Target Selection */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 mb-3">
              Target Device <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTarget("desktop")}
                className={`group relative py-4 px-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
                  target === "desktop"
                    ? "bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border-zinc-900 shadow-lg scale-105"
                    : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400 hover:shadow-md"
                }`}
              >
                <div className={`p-3 rounded-lg ${
                  target === "desktop" ? "bg-white/10" : "bg-zinc-100"
                }`}>
                  <Monitor className={`w-6 h-6 ${
                    target === "desktop" ? "text-white" : "text-zinc-600"
                  }`} />
                </div>
                <span className="font-semibold text-sm">Desktop</span>
                {target === "desktop" && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
              <button
                onClick={() => setTarget("mobile")}
                className={`group relative py-4 px-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
                  target === "mobile"
                    ? "bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border-zinc-900 shadow-lg scale-105"
                    : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400 hover:shadow-md"
                }`}
              >
                <div className={`p-3 rounded-lg ${
                  target === "mobile" ? "bg-white/10" : "bg-zinc-100"
                }`}>
                  <Smartphone className={`w-6 h-6 ${
                    target === "mobile" ? "text-white" : "text-zinc-600"
                  }`} />
                </div>
                <span className="font-semibold text-sm">Mobile</span>
                {target === "mobile" && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
            {!target && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-amber-800 font-medium">
                  Please select a target device before uploading
                </p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={uploadAll}
            disabled={loading || files.length === 0 || !target}
            className={`w-full rounded-xl px-6 py-4 font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${
              loading || files.length === 0 || !target
                ? "bg-zinc-300 text-zinc-500 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-zinc-900 to-zinc-800 text-white hover:from-zinc-800 hover:to-zinc-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading {files.length} image{files.length !== 1 ? "s" : ""}...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>
                  Upload {files.length} Image{files.length !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-1.5 sm:gap-2 flex-wrap">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            activeFilter === "all"
              ? "bg-zinc-900 text-white"
              : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          All ({slides.length})
        </button>
        <button
          onClick={() => setActiveFilter("desktop")}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            activeFilter === "desktop"
              ? "bg-zinc-900 text-white"
              : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          Desktop ({slides.filter((s) => s.target === "desktop").length})
        </button>
        <button
          onClick={() => setActiveFilter("mobile")}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            activeFilter === "mobile"
              ? "bg-zinc-900 text-white"
              : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          Mobile ({slides.filter((s) => s.target === "mobile").length})
        </button>
      </div>

      {/* Slides Grid */}
      {filteredSlides.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-zinc-400 text-lg mb-2">No slides yet</div>
          <div className="text-zinc-500 text-sm">
            Upload images to get started
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredSlides.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <img
                src={cldThumbnail({ publicId: s.public_id })}
                alt={s.alt}
                className="w-full h-48 object-cover"
              />
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                      s.target === "desktop"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {s.target}
                  </span>
                  <button
                    onClick={() => handleDeleteClick(s)}
                    className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium px-1"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-zinc-600 truncate">
                  {s.alt}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress Modal */}
      <AnimatePresence>
        {uploadProgress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">
                  Uploading Images
                </h3>
                <p className="text-zinc-600">Processing your images...</p>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-zinc-600 mb-2">
                  <span>
                    {uploadProgress.current} of {uploadProgress.total}
                  </span>
                  <span>
                    {Math.round(
                      (uploadProgress.current / uploadProgress.total) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-zinc-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (uploadProgress.current / uploadProgress.total) * 100
                      }%`,
                    }}
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-2 truncate">
                  {uploadProgress.currentFile}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {slideToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={handleCancelDelete}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900">
                    Delete Slide
                  </h3>
                </div>
                <button
                  onClick={handleCancelDelete}
                  className="text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview */}
              <div className="mb-4 sm:mb-6 flex justify-center">
                <div className="relative w-full sm:w-64 h-36 sm:h-36 rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={`https://res.cloudinary.com/dy8q4hf0k/image/upload/c_fill,g_center,w_256,h_144,f_auto,q_auto/${slideToDelete.public_id}`}
                    alt="Slide to delete"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Message */}
              <p className="text-center text-sm sm:text-base text-zinc-600 mb-4 sm:mb-6">
                Are you sure you want to delete this slide? This action cannot
                be undone.
              </p>

              {/* Actions */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-zinc-300 text-sm sm:text-base text-zinc-700 font-medium hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-red-600 text-white text-sm sm:text-base font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
