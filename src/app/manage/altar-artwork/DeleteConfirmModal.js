"use client";

import { Trash2, X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function DeleteConfirmModal({ artwork, onConfirm, onCancel }) {
  if (!artwork) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">
                Delete Artwork
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preview */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg">
              <Image
                src={artwork.image_url}
                alt="Artwork to delete"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Message */}
          <p className="text-center text-zinc-600 mb-6">
            Are you sure you want to delete this artwork? This action cannot be
            undone.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-lg border border-zinc-300 text-zinc-700 font-medium hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
