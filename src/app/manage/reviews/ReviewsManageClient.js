"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/util/supabase/supabaseClient";
import { Plus, Trash2, X, Edit2, ChevronUp, ChevronDown, AlertTriangle, Upload, GripVertical } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import Toast from "../Toast";

export default function ReviewsManageClient({ initialReviews }) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageDraggedIndex, setImageDraggedIndex] = useState(null);
  const [imageDragOverIndex, setImageDragOverIndex] = useState(null);

  // Form state
  const [clientName, setClientName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);

  const resetForm = () => {
    setClientName("");
    setReviewText("");
    setDisplayOrder(0);
    setUploadedImages([]);
    setEditingReview(null);
  };

  const handleCreate = () => {
    resetForm();
    setDisplayOrder(0);
    setShowModal(true);
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setClientName(review.client_name);
    setReviewText(review.review_text);
    setDisplayOrder(review.display_order || 0);
    setUploadedImages(review.images_public_ids || review.images || []);
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const { uploadMultipleToCloudinary } = await import("@/lib/cloudinary-upload");
      const publicIds = await uploadMultipleToCloudinary(
        files,
        "fanaha/reviews",
        undefined,
        { alwaysCompress: true }
      );
      setUploadedImages([...uploadedImages, ...publicIds]);
    } catch (err) {
      setToast({ message: "Failed to upload images", type: "error" });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setUploadedImages(
      uploadedImages.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleImageDragStart = (e, index) => {
    setImageDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    const img = new Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleImageDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setImageDragOverIndex(index);
  };

  const handleImageDragLeave = () => {
    setImageDragOverIndex(null);
  };

  const handleImageDrop = (e, dropIndex) => {
    e.preventDefault();

    if (imageDraggedIndex === null || imageDraggedIndex === dropIndex) {
      setImageDraggedIndex(null);
      setImageDragOverIndex(null);
      return;
    }

    const newImages = [...uploadedImages];
    const draggedImage = newImages[imageDraggedIndex];
    newImages.splice(imageDraggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    setUploadedImages(newImages);
    setImageDraggedIndex(null);
    setImageDragOverIndex(null);
  };

  const handleImageDragEnd = () => {
    setImageDraggedIndex(null);
    setImageDragOverIndex(null);
  };

  const handleSave = async () => {
    if (!clientName.trim()) {
      setToast({ message: "Client name is required", type: "error" });
      return;
    }

    if (!reviewText.trim()) {
      setToast({ message: "Review text is required", type: "error" });
      return;
    }

    setSaving(true);
    try {
      const { cldUrlEnhanced } = await import("@/lib/cloudinary");
      const imageUrls = uploadedImages.map((img) => {
        if (img.includes("http") || img.includes("supabase.co")) {
          return img;
        }
        return cldUrlEnhanced({
          publicId: img,
          width: 800,
          height: 800,
          quality: "auto:good",
          crop: "fill",
        });
      });

      const reviewData = {
        client_name: clientName.trim(),
        review_text: reviewText.trim(),
        display_order: editingReview ? displayOrder || 0 : 0,
        images_public_ids: uploadedImages,
        images: imageUrls,
        updated_at: new Date().toISOString(),
      };

      if (editingReview) {
        // Update existing review
        const { data, error } = await supabase
          .from("fanaha_reviews")
          .update(reviewData)
          .eq("id", editingReview.id)
          .select()
          .single();

        if (error) throw error;

        setReviews(reviews.map((r) => (r.id === editingReview.id ? data : r)));
        setToast({ message: "Review updated successfully!", type: "success" });
      } else {
        const updatedExisting = reviews.map((review) => ({
          ...review,
          display_order: (review.display_order || 0) + 1,
        }));

        if (updatedExisting.length > 0) {
          const updates = updatedExisting.map((review) =>
            supabase
              .from("fanaha_reviews")
              .update({ display_order: review.display_order })
              .eq("id", review.id)
          );
          const updateResults = await Promise.all(updates);
          const updateError = updateResults.find((result) => result.error)?.error;
          if (updateError) throw updateError;
        }

        // Create new review
        const { data, error } = await supabase
          .from("fanaha_reviews")
          .insert(reviewData)
          .select()
          .single();

        if (error) throw error;

        setReviews([data, ...updatedExisting]);
        setToast({ message: "Review created successfully!", type: "success" });
      }

      setShowModal(false);
      resetForm();
      router.refresh();
    } catch (err) {
      setToast({ message: "Failed to save review", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (review) => {
    setSelectedReview(review);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReview) return;

    setDeleting(selectedReview.id);
    try {
      const { error } = await supabase
        .from("fanaha_reviews")
        .delete()
        .eq("id", selectedReview.id);

      if (error) throw error;

      setReviews(reviews.filter((r) => r.id !== selectedReview.id));
      setToast({ message: "Review deleted successfully!", type: "success" });
      setIsDeleteModalOpen(false);
      setSelectedReview(null);
      router.refresh();
    } catch (err) {
      setToast({ message: "Failed to delete review", type: "error" });
    } finally {
      setDeleting(null);
    }
  };

  const handleMoveReview = async (reviewId, direction) => {
    const currentIndex = reviews.findIndex((r) => r.id === reviewId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= reviews.length) return;

    setReordering(true);
    try {
      // Swap display_order values
      const currentReview = reviews[currentIndex];
      const targetReview = reviews[newIndex];

      const currentOrder = currentReview.display_order || 0;
      const targetOrder = targetReview.display_order || 0;

      // Update both reviews
      await Promise.all([
        supabase
          .from("fanaha_reviews")
          .update({ display_order: targetOrder })
          .eq("id", currentReview.id),
        supabase
          .from("fanaha_reviews")
          .update({ display_order: currentOrder })
          .eq("id", targetReview.id),
      ]);

      // Update local state
      const newReviews = [...reviews];
      [newReviews[currentIndex], newReviews[newIndex]] = [
        newReviews[newIndex],
        newReviews[currentIndex],
      ];
      setReviews(newReviews);
      router.refresh();
    } catch (err) {
      setToast({ message: "Failed to reorder review", type: "error" });
    } finally {
      setReordering(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setReordering(true);
    try {
      const newReviews = [...reviews];
      const draggedReview = newReviews[draggedIndex];

      // Remove from old position
      newReviews.splice(draggedIndex, 1);
      // Insert at new position
      newReviews.splice(dropIndex, 0, draggedReview);

      // Update display_order for all affected reviews
      const updates = newReviews.map((review, index) =>
        supabase
          .from("fanaha_reviews")
          .update({ display_order: index })
          .eq("id", review.id)
      );

      await Promise.all(updates);
      setReviews(newReviews);
      router.refresh();
    } catch (err) {
      setToast({ message: "Failed to reorder review", type: "error" });
    } finally {
      setDraggedIndex(null);
      setDragOverIndex(null);
      setReordering(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div
      className="max-w-5xl mx-auto pb-24"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">
          Manage Testimonials
        </h1>
        <p className="text-zinc-600">
          Add, edit, and manage client reviews and feedback
        </p>
      </div>

      {/* Create Button */}
      <div className="mb-6">
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Review
        </button>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200">
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            No reviews yet. Click &quot;Add Review&quot; to create one.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {reviews.map((review, index) => (
              <div
                key={review.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  p-6 hover:bg-zinc-50 transition-colors
                  ${draggedIndex === index ? "opacity-50 scale-95" : ""}
                  ${dragOverIndex === index ? "ring-2 ring-blue-500" : ""}
                  ${reordering ? "cursor-wait" : "cursor-move"}
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <GripVertical
                        className={`w-5 h-5 text-zinc-400 ${
                          reordering ? "cursor-wait" : "cursor-move"
                        }`}
                      />
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          onClick={() => handleMoveReview(review.id, "up")}
                          disabled={index === 0 || reordering}
                          className="p-0.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                          aria-label="Move up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-semibold text-zinc-500 min-w-[1.5rem] text-center">
                          {index + 1}
                        </span>
                        <button
                          onClick={() => handleMoveReview(review.id, "down")}
                          disabled={index === reviews.length - 1 || reordering}
                          className="p-0.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                          aria-label="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="text-lg font-semibold text-zinc-900">
                        {review.client_name}
                      </h3>
                    </div>
                    <p className="text-zinc-700 text-sm line-clamp-2">
                      {review.review_text}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(review)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(review)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900">
                {editingReview ? "Edit Review" : "Add Review"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Review Text *
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Enter review text"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-zinc-700">
                    Review Images (optional)
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {uploadingImages ? "Uploading..." : "Upload Images"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImages}
                    />
                  </label>
                </div>
                <p className="text-xs text-zinc-500 mb-3">
                  Upload one or more images. Drag to reorder.
                </p>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {uploadedImages.map((img, index) => (
                      <div
                        key={`${img}-${index}`}
                        draggable
                        onDragStart={(e) => handleImageDragStart(e, index)}
                        onDragOver={(e) => handleImageDragOver(e, index)}
                        onDragLeave={handleImageDragLeave}
                        onDrop={(e) => handleImageDrop(e, index)}
                        onDragEnd={handleImageDragEnd}
                        className={`
                          relative group rounded-lg overflow-hidden border border-zinc-200 bg-white
                          ${imageDraggedIndex === index ? "opacity-50 scale-95" : ""}
                          ${imageDragOverIndex === index ? "ring-2 ring-blue-500" : ""}
                        `}
                      >
                        <div className="relative aspect-[4/3]">
                          <OptimizedImage
                            publicId={img}
                            src={img}
                            alt={`Review image ${index + 1}`}
                            width={800}
                            height={600}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-zinc-700 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : editingReview ? "Update" : "Create"}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">Delete Review</h3>
              </div>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedReview(null);
                }}
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-zinc-600 mb-6">
              Are you sure you want to delete the review from{" "}
              <span className="font-semibold text-zinc-900">
                {selectedReview.client_name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedReview(null);
                }}
                disabled={deleting === selectedReview.id}
                className="flex-1 px-4 py-3 rounded-lg border border-zinc-300 text-zinc-700 font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting === selectedReview.id}
                className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting === selectedReview.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
