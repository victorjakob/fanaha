"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload, ChevronUp, ChevronDown } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import Toast from "../Toast";
import ImageCropper from "@/app/alchemy/create/ImageCropper";
import { getCroppedImg } from "@/app/alchemy/create/cropImage";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { supabase } from "@/util/supabase/supabaseClient";

export default function AltarManageClient({ initialArtworks, section }) {
  const router = useRouter();
  const [artworks, setArtworks] = useState(initialArtworks);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null);
  const [tempFileName, setTempFileName] = useState("");
  const [artworkToDelete, setArtworkToDelete] = useState(null);
  const [reordering, setReordering] = useState(false);

  const updateDisplayOrder = async (orderedArtworks) => {
    const updates = orderedArtworks.map((artwork, index) =>
      supabase
        .from("fanaha_altar_artworks")
        .update({ display_order: index + 1 })
        .eq("id", artwork.id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((result) => result.error);
    if (hasError) {
      throw new Error("Failed to update order");
    }
  };

  const moveArtwork = async (index, direction) => {
    if (reordering) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= artworks.length) return;

    const reordered = [...artworks];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    setArtworks(reordered);
    setReordering(true);
    try {
      await updateDisplayOrder(reordered);
      setToast({ message: "Order updated successfully!", type: "success" });
      router.refresh();
    } catch (err) {
      setToast({ message: "Failed to update order", type: "error" });
      router.refresh();
    } finally {
      setReordering(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setTempImageSrc(reader.result);
      setTempFileName(file.name);
      setShowCropper(true);
    });
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedAreaPixels) => {
    // Prevent double-clicks
    if (uploading) return;

    setUploading(true);
    try {
      // Get cropped image as File
      const croppedFile = await getCroppedImg(
        tempImageSrc,
        croppedAreaPixels,
        tempFileName
      );

      // Upload to Cloudinary
      const { uploadToCloudinary } = await import("@/lib/cloudinary-upload");
      const { cldUrlEnhanced } = await import("@/lib/cloudinary");
      
      const publicId = await uploadToCloudinary(
        croppedFile,
        "fanaha/altar",
        { alwaysCompress: true }
      );

      // Generate optimized URL for backward compatibility
      const imageUrl = cldUrlEnhanced({
        publicId,
        width: 800,
        height: 800,
        quality: "auto:good",
        crop: "fill",
      });

      // Move existing artworks down so the new one appears first
      if (artworks.length > 0) {
        setReordering(true);
        const shifted = artworks.map((art) => ({
          ...art,
          display_order: (art.display_order || 0) + 1,
        }));
        await updateDisplayOrder(shifted);
        setArtworks(shifted);
      }

      // Insert into database via API route (uses server-side Supabase with service role key)
      const response = await fetch("/api/altar-artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_public_id: publicId,
          image_url: imageUrl, // backward compatibility
          display_order: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save artwork");
      }

      const { data: newArtwork } = await response.json();

      if (!newArtwork) {
        throw new Error("Insert succeeded but no data returned");
      }

      setArtworks([newArtwork, ...artworks]);
      setToast({ message: "Artwork added successfully!", type: "success" });

      // Clean up
      setShowCropper(false);
      setTempImageSrc(null);
      setTempFileName("");

      router.refresh();
    } catch (err) {
      setToast({ 
        message: err.message || "Failed to upload artwork", 
        type: "error" 
      });
      // Clean up on error too
      setShowCropper(false);
      setTempImageSrc(null);
      setTempFileName("");
    } finally {
      setUploading(false);
      setReordering(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImageSrc(null);
    setTempFileName("");
  };

  const handleDeleteClick = (artwork) => {
    setArtworkToDelete(artwork);
  };

  const handleDeleteConfirm = async () => {
    if (!artworkToDelete) return;

    setDeleting(artworkToDelete.id);

    // Optimistically update UI
    const previousArtworks = [...artworks];
    setArtworks(artworks.filter((a) => a.id !== artworkToDelete.id));

    // Close modal
    setArtworkToDelete(null);

    try {
      const response = await fetch(`/api/altar-artworks/${artworkToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete artwork");
      }

      setToast({ message: "Artwork deleted successfully!", type: "success" });
      router.refresh();
    } catch (err) {
      // Revert on error
      setArtworks(previousArtworks);
      setToast({ message: "Failed to delete artwork", type: "error" });
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteCancel = () => {
    setArtworkToDelete(null);
  };

  return (
    <div
      className="max-w-7xl mx-auto"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          {section?.title || "Manage Altar Artworks"}
        </h2>
        {section?.description && (
          <p className="text-zinc-600">{section.description}</p>
        )}
      </div>

      {/* Upload Button */}
      <div className="mb-6">
        <label className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? (
            <>
              <Upload className="w-5 h-5 animate-pulse" />
              Uploading...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add Artwork
            </>
          )}
        </label>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && tempImageSrc && (
        <ImageCropper
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* Results count */}
      <div className="mb-4 text-sm text-zinc-600">
        {artworks.length} artwork{artworks.length !== 1 ? "s" : ""}
      </div>

      {/* Grid */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {artworks.length === 0 ? (
          <div className="text-center text-zinc-500 py-12">
            No artworks yet. Click &quot;Add Artwork&quot; to upload images.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {artworks.map((artwork, index) => (
              <div key={artwork.id} className="relative">
                <div className="aspect-square rounded-full overflow-hidden">
                  <OptimizedImage
                    publicId={artwork.image_public_id || artwork.image_url}
                    alt="Altar artwork"
                    width={300}
                    height={300}
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover w-full h-full"
                    aspectRatio="1:1"
                    crop="fill"
                  />
                </div>
                {/* Delete button - always visible */}
                <button
                  onClick={() => handleDeleteClick(artwork)}
                  disabled={deleting === artwork.id}
                  className="absolute -top-2 -right-2 bg-white text-red-400 p-2 rounded-full shadow-md border-1 border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50 z-10"
                  aria-label="Delete artwork"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Order controls */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 rounded-full shadow-sm border border-zinc-200 px-2 py-1">
                  <button
                    onClick={() => moveArtwork(index, -1)}
                    disabled={index === 0 || reordering}
                    className="p-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Move up"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-zinc-500 min-w-[1.25rem] text-center">
                    {index + 1}
                  </span>
                  <button
                    onClick={() => moveArtwork(index, 1)}
                    disabled={index === artworks.length - 1 || reordering}
                    className="p-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Move down"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        artwork={artworkToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
