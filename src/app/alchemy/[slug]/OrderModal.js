"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function OrderModal({ isOpen, onClose, artPieceName }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          artPieceName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send order request");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setForm({ name: "", email: "", message: "" });
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError("Failed to send order request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800 transition-colors duration-200"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Header */}
            <div className="pt-8 pb-6 px-8 text-center bg-gradient-to-br from-purple-50 to-violet-50">
              <h2 className="text-3xl font-light text-black mb-2 tracking-tight">
                {artPieceName}
              </h2>
              <p className="text-base text-black font-medium">Order Request</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pb-8">
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block pt-4 text-sm font-medium text-black mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-colors duration-200 text-zinc-800 placeholder-zinc-400"
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-black mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-colors duration-200 text-zinc-800 placeholder-zinc-400"
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-black mb-2"
                  >
                    Additional Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-colors duration-200 text-zinc-800 placeholder-zinc-400 resize-none"
                    placeholder="Tell us about your interest in this piece, any questions, or special requests..."
                    disabled={loading}
                  />
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="text-red-500 text-sm font-medium text-center">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="text-green-600 text-sm font-medium text-center">
                    Order request sent successfully!
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-medium py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Order Request"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
