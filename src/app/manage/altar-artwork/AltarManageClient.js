"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/util/supabase/supabaseClient";
import { Plus, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import Toast from "../Toast";
import ImageCropper from "@/app/alchemy/create/ImageCropper";
import { getCroppedImg } from "@/app/alchemy/create/cropImage";
import DeleteConfirmModal from "./DeleteConfirmModal";

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

      // Upload to storage
      const fileName = `altar-${Date.now()}-${croppedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("alchemy-images")
        .upload(`altar/${fileName}`, croppedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("alchemy-images")
        .getPublicUrl(`altar/${fileName}`);

      // Insert into database
      const { data: newArtwork, error: dbError } = await supabase
        .from("altar_artworks")
        .insert([{ image_url: urlData.publicUrl }])
        .select()
        .single();

      if (dbError) throw dbError;

      setArtworks([newArtwork, ...artworks]);
      setToast({ message: "Artwork added successfully!", type: "success" });

      // Clean up
      setShowCropper(false);
      setTempImageSrc(null);
      setTempFileName("");

      router.refresh();
    } catch (err) {
      console.error("Upload error:", err);
      setToast({ message: "Failed to upload artwork", type: "error" });
      // Clean up on error too
      setShowCropper(false);
      setTempImageSrc(null);
      setTempFileName("");
    } finally {
      setUploading(false);
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
      const { error } = await supabase
        .from("altar_artworks")
        .delete()
        .eq("id", artworkToDelete.id);

      if (error) throw error;

      setToast({ message: "Artwork deleted successfully!", type: "success" });
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
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
            {artworks.map((artwork) => (
              <div key={artwork.id} className="relative">
                <div className="aspect-square rounded-full overflow-hidden shadow-lg">
                  <Image
                    src={artwork.image_url}
                    alt="Altar artwork"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
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
