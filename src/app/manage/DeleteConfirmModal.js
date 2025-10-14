"use client";

import { useState } from "react";
import { X, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/util/supabase/supabaseClient";
import { formatISK } from "@/util/formatPrice";

export default function DeleteConfirmModal({ piece, onClose, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("alchemy_pieces")
        .delete()
        .eq("id", piece.id);

      if (deleteError) throw deleteError;

      // Success - pass the deleted piece ID for optimistic update
      onSuccess(piece.id);
    } catch (err) {
      console.error("Error deleting piece:", err);
      setError(err.message || "Failed to delete piece");
      setIsDeleting(false);
    }
    // Don't set isDeleting to false on success - let the modal close with loading state
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Delete Piece</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <p className="text-zinc-600 mb-4">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-zinc-900">{piece.name}</span>?
            This action cannot be undone.
          </p>

          {piece.images?.[0] && (
            <div className="w-full h-32 rounded-lg overflow-hidden bg-zinc-100 mb-4">
              <img
                src={piece.images[0]}
                alt={piece.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="bg-zinc-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Slug:</span>
              <span className="text-zinc-900 font-medium">{piece.slug}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Status:</span>
              <span
                className={`font-medium ${
                  piece.available ? "text-green-600" : "text-zinc-600"
                }`}
              >
                {piece.available ? "Available" : "Sold"}
              </span>
            </div>
            {piece.price && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Price:</span>
                <span className="text-zinc-900 font-medium">
                  {formatISK(piece.price)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
