"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaInstagram, FaFacebookF, FaEnvelope } from "react-icons/fa";
import { Send, Loader2 } from "lucide-react";

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex flex-col items-center w-full min-h-screen pt-32 sm:pt-40 py-12 px-4 sm:px-8 overflow-hidden">
      {/* Background runes */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/runes-bg2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.08,
        }}
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-6 tracking-wider">
            Get in Touch
          </h1>
          <p className="text-base sm:text-lg text-zinc-700 max-w-xl mx-auto px-4 leading-loose tracking-wide">
            Have a question about my work, interested in a commission, or just
            want to connect? I&apos;d love to hear from you.
          </p>
        </motion.div>

        {/* Contact Form */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 sm:p-10 border border-zinc-200 mb-12"
        >
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-zinc-700 mb-2"
              >
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-zinc-700 mb-2"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all"
                placeholder="your@email.com"
              />
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-semibold text-zinc-700 mb-2"
              >
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all"
                placeholder="What's this about?"
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-semibold text-zinc-700 mb-2"
              >
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Tell me about your inquiry..."
              />
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
                ✅ Message sent successfully! I&apos;ll get back to you soon.
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                ❌ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-br from-purple-700 to-violet-900 hover:from-purple-800 hover:to-violet-950 text-white font-bold py-4 px-8 rounded-full shadow-xl transition-all text-lg tracking-wide focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* Social Media Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl mb-6 tracking-wide">
            Connect With Me
          </h2>
          <div className="flex gap-6 justify-center">
            <a
              href="https://www.instagram.com/fanaha"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:bg-white"
              aria-label="Instagram"
            >
              <FaInstagram className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
            </a>
            <a
              href="https://www.facebook.com/fanahacrea"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:bg-white"
              aria-label="Facebook"
            >
              <FaFacebookF className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
            </a>
            <a
              href="mailto:fanahacrea@gmail.com"
              className="p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:bg-white"
              aria-label="Email"
            >
              <FaEnvelope className="w-7 h-7 sm:w-8 sm:h-8 text-zinc-700" />
            </a>
          </div>
          <p className="mt-6 text-zinc-600">
            <a
              href="mailto:fanahacrea@gmail.com"
              className="hover:text-zinc-900 transition-colors"
            >
              fanahacrea@gmail.com
            </a>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
