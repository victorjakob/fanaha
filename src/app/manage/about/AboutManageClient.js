"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/util/supabase/supabaseClient";
import { Save, Plus, Trash2, X } from "lucide-react";
import Toast from "../Toast";

export default function AboutManageClient({ content: initialContent }) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Form state
  const [title, setTitle] = useState(content.title);
  const [subtitle, setSubtitle] = useState(content.subtitle || "");
  const [bioTitle, setBioTitle] = useState(content.bio_title);
  const [bioParagraphs, setBioParagraphs] = useState(
    content.bio_paragraphs || []
  );
  const [pillars, setPillars] = useState(content.pillars || []);
  const [milestones, setMilestones] = useState(content.milestones || []);
  const [quote, setQuote] = useState(content.quote || "");
  const [quoteAuthor, setQuoteAuthor] = useState(
    content.quote_author || "— Fanaha"
  );
  const [instagram, setInstagram] = useState(content.socials?.instagram || "");
  const [youtube, setYoutube] = useState(content.socials?.youtube || "");
  const [spotify, setSpotify] = useState(content.socials?.spotify || "");

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("about_content")
        .update({
          title,
          subtitle,
          bio_title: bioTitle,
          bio_paragraphs: bioParagraphs,
          pillars,
          milestones,
          quote,
          quote_author: quoteAuthor,
          socials: {
            instagram,
            youtube,
            spotify,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", content.id);

      if (error) throw error;

      setToast({
        message: "About content saved successfully!",
        type: "success",
      });
      router.refresh();
    } catch (err) {
      console.error("Save error:", err);
      setToast({ message: "Failed to save content", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Bio paragraph helpers
  const addBioParagraph = () => {
    setBioParagraphs([...bioParagraphs, ""]);
  };

  const updateBioParagraph = (index, value) => {
    const newParagraphs = [...bioParagraphs];
    newParagraphs[index] = value;
    setBioParagraphs(newParagraphs);
  };

  const removeBioParagraph = (index) => {
    setBioParagraphs(bioParagraphs.filter((_, i) => i !== index));
  };

  // Pillar helpers
  const addPillar = () => {
    setPillars([...pillars, { title: "", body: "" }]);
  };

  const updatePillar = (index, field, value) => {
    const newPillars = [...pillars];
    newPillars[index][field] = value;
    setPillars(newPillars);
  };

  const removePillar = (index) => {
    setPillars(pillars.filter((_, i) => i !== index));
  };

  // Milestone helpers
  const addMilestone = () => {
    setMilestones([...milestones, { year: "", text: "" }]);
  };

  const updateMilestone = (index, field, value) => {
    const newMilestones = [...milestones];
    newMilestones[index][field] = value;
    setMilestones(newMilestones);
  };

  const removeMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  return (
    <div
      className="max-w-5xl mx-auto"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">
          Manage About Page
        </h1>
        <p className="text-zinc-600">Edit all content for the About page</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6 space-y-8">
        {/* Header Section */}
        <div className="space-y-4 pb-6 border-b border-zinc-200">
          <h2 className="text-xl font-semibold text-zinc-900">Header</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Page Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Subtitle
            </label>
            <textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>

        {/* Bio Section */}
        <div className="space-y-4 pb-6 border-b border-zinc-200">
          <h2 className="text-xl font-semibold text-zinc-900">Biography</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Bio Section Title
            </label>
            <input
              type="text"
              value={bioTitle}
              onChange={(e) => setBioTitle(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-zinc-700">
                Bio Paragraphs
              </label>
              <button
                onClick={addBioParagraph}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Paragraph
              </button>
            </div>
            <div className="space-y-3">
              {bioParagraphs.map((paragraph, index) => (
                <div key={index} className="relative">
                  <textarea
                    value={paragraph}
                    onChange={(e) => updateBioParagraph(index, e.target.value)}
                    rows={3}
                    placeholder={`Paragraph ${index + 1}`}
                    className="w-full px-4 py-2 pr-10 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                  <button
                    onClick={() => removeBioParagraph(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pillars Section */}
        <div className="space-y-4 pb-6 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900">
              Pillars of Practice
            </h2>
            <button
              onClick={addPillar}
              className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Pillar
            </button>
          </div>

          <div className="space-y-4">
            {pillars.map((pillar, index) => (
              <div key={index} className="p-4 bg-zinc-50 rounded-lg relative">
                <button
                  onClick={() => removePillar(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="space-y-3 pr-8">
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={(e) =>
                      updatePillar(index, "title", e.target.value)
                    }
                    placeholder="Pillar Title"
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <textarea
                    value={pillar.body}
                    onChange={(e) =>
                      updatePillar(index, "body", e.target.value)
                    }
                    placeholder="Pillar Description"
                    rows={3}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones Section */}
        <div className="space-y-4 pb-6 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900">
              Path & Becoming (Timeline)
            </h2>
            <button
              onClick={addMilestone}
              className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Milestone
            </button>
          </div>

          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="p-4 bg-zinc-50 rounded-lg relative">
                <button
                  onClick={() => removeMilestone(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="space-y-3 pr-8">
                  <input
                    type="text"
                    value={milestone.year}
                    onChange={(e) =>
                      updateMilestone(index, "year", e.target.value)
                    }
                    placeholder="Year/Period"
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <textarea
                    value={milestone.text}
                    onChange={(e) =>
                      updateMilestone(index, "text", e.target.value)
                    }
                    placeholder="Description"
                    rows={3}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote Section */}
        <div className="space-y-4 pb-6 border-b border-zinc-200">
          <h2 className="text-xl font-semibold text-zinc-900">Quote</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Quote Text
            </label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Quote Author
            </label>
            <input
              type="text"
              value={quoteAuthor}
              onChange={(e) => setQuoteAuthor(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Social Links Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900">Social Links</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Instagram URL
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                YouTube URL
              </label>
              <input
                type="text"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Spotify URL
              </label>
              <input
                type="text"
                value={spotify}
                onChange={(e) => setSpotify(e.target.value)}
                placeholder="https://spotify.com/..."
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-zinc-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

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
