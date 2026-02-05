"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/util/supabase/supabaseClient";
import { Save, Plus, Trash2, X, CheckCircle2 } from "lucide-react";
import Toast from "../Toast";
import { coerceFrenchText, NEEDS_TRANSLATION } from "@/lib/db-i18n";

export default function AboutManageClient({ content: initialContent }) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);

  // Form state
  const [title, setTitle] = useState(content.title);
  const [titleFr, setTitleFr] = useState(content.title_fr || "");
  const [subtitle, setSubtitle] = useState(content.subtitle || "");
  const [subtitleFr, setSubtitleFr] = useState(content.subtitle_fr || "");
  const [bioTitle, setBioTitle] = useState(content.bio_title);
  const [bioTitleFr, setBioTitleFr] = useState(content.bio_title_fr || "");
  const [bioParagraphs, setBioParagraphs] = useState(
    content.bio_paragraphs || []
  );
  const [bioParagraphsFr, setBioParagraphsFr] = useState(
    content.bio_paragraphs_fr || []
  );
  const [pillars, setPillars] = useState(content.pillars || []);
  const [pillarsFr, setPillarsFr] = useState(content.pillars_fr || []);
  const [milestones, setMilestones] = useState(content.milestones || []);
  const [milestonesFr, setMilestonesFr] = useState(content.milestones_fr || []);
  const [quote, setQuote] = useState(content.quote || "");
  const [quoteFr, setQuoteFr] = useState(content.quote_fr || "");
  const [quoteAuthor, setQuoteAuthor] = useState(
    content.quote_author || "— Fanaha"
  );
  const [quoteAuthorFr, setQuoteAuthorFr] = useState(
    content.quote_author_fr || ""
  );
  const [instagram, setInstagram] = useState(content.socials?.instagram || "");
  const [instagramEnabled, setInstagramEnabled] = useState(
    content.socials?.instagram_enabled ?? false
  );
  const [youtube, setYoutube] = useState(content.socials?.youtube || "");
  const [youtubeEnabled, setYoutubeEnabled] = useState(
    content.socials?.youtube_enabled ?? false
  );
  const [spotify, setSpotify] = useState(content.socials?.spotify || "");
  const [spotifyEnabled, setSpotifyEnabled] = useState(
    content.socials?.spotify_enabled ?? false
  );
  const [facebook, setFacebook] = useState(content.socials?.facebook || "");
  const [facebookEnabled, setFacebookEnabled] = useState(
    content.socials?.facebook_enabled ?? false
  );
  const [email, setEmail] = useState(content.socials?.email || "");
  const [emailEnabled, setEmailEnabled] = useState(
    content.socials?.email_enabled ?? false
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalizedBioFr =
        Array.isArray(bioParagraphsFr) && bioParagraphsFr.length > 0
          ? bioParagraphsFr.map((p) => coerceFrenchText(p))
          : [NEEDS_TRANSLATION];

      const normalizedPillarsFr =
        Array.isArray(pillarsFr) && pillarsFr.length > 0
          ? pillarsFr.map((p) => ({
              title: coerceFrenchText(p?.title),
              body: coerceFrenchText(p?.body),
            }))
          : [{ title: NEEDS_TRANSLATION, body: NEEDS_TRANSLATION }];

      const normalizedMilestonesFr =
        Array.isArray(milestonesFr) && milestonesFr.length > 0
          ? milestonesFr.map((m) => ({
              year: coerceFrenchText(m?.year),
              text: coerceFrenchText(m?.text),
            }))
          : [{ year: NEEDS_TRANSLATION, text: NEEDS_TRANSLATION }];

      const { error } = await supabase
        .from("fanaha_about_content")
        .update({
          title,
          title_fr: coerceFrenchText(titleFr),
          subtitle,
          subtitle_fr: coerceFrenchText(subtitleFr),
          bio_title: bioTitle,
          bio_title_fr: coerceFrenchText(bioTitleFr),
          bio_paragraphs: bioParagraphs,
          bio_paragraphs_fr: normalizedBioFr,
          pillars,
          pillars_fr: normalizedPillarsFr,
          milestones,
          milestones_fr: normalizedMilestonesFr,
          quote,
          quote_fr: coerceFrenchText(quoteFr),
          quote_author: quoteAuthor,
          quote_author_fr: coerceFrenchText(quoteAuthorFr),
          socials: {
            instagram,
            instagram_enabled: instagramEnabled,
            youtube,
            youtube_enabled: youtubeEnabled,
            spotify,
            spotify_enabled: spotifyEnabled,
            facebook,
            facebook_enabled: facebookEnabled,
            email,
            email_enabled: emailEnabled,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", content.id);

      if (error) throw error;

      setSaved(true);
      setToast({
        message: "About content saved successfully!",
        type: "success",
      });

      // Reset saved state after 3 seconds
      setTimeout(() => setSaved(false), 3000);

      router.refresh();
    } catch (err) {
      setToast({ message: "Failed to save content", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Bio paragraph helpers
  const addBioParagraph = () => {
    setBioParagraphs([...bioParagraphs, ""]);
    setBioParagraphsFr([...(bioParagraphsFr || []), ""]);
  };

  const updateBioParagraph = (index, value) => {
    const newParagraphs = [...bioParagraphs];
    newParagraphs[index] = value;
    setBioParagraphs(newParagraphs);
  };

  const updateBioParagraphFr = (index, value) => {
    const next = [...(bioParagraphsFr || [])];
    next[index] = value;
    setBioParagraphsFr(next);
  };

  const removeBioParagraph = (index) => {
    setBioParagraphs(bioParagraphs.filter((_, i) => i !== index));
    setBioParagraphsFr((bioParagraphsFr || []).filter((_, i) => i !== index));
  };

  // Pillar helpers
  const addPillar = () => {
    setPillars([...pillars, { title: "", body: "" }]);
    setPillarsFr([...(pillarsFr || []), { title: "", body: "" }]);
  };

  const updatePillar = (index, field, value) => {
    const newPillars = [...pillars];
    newPillars[index][field] = value;
    setPillars(newPillars);
  };

  const updatePillarFr = (index, field, value) => {
    const next = [...(pillarsFr || [])];
    next[index] = next[index] || { title: "", body: "" };
    next[index][field] = value;
    setPillarsFr(next);
  };

  const removePillar = (index) => {
    setPillars(pillars.filter((_, i) => i !== index));
    setPillarsFr((pillarsFr || []).filter((_, i) => i !== index));
  };

  // Milestone helpers
  const addMilestone = () => {
    setMilestones([...milestones, { year: "", text: "" }]);
    setMilestonesFr([...(milestonesFr || []), { year: "", text: "" }]);
  };

  const updateMilestone = (index, field, value) => {
    const newMilestones = [...milestones];
    newMilestones[index][field] = value;
    setMilestones(newMilestones);
  };

  const updateMilestoneFr = (index, field, value) => {
    const next = [...(milestonesFr || [])];
    next[index] = next[index] || { year: "", text: "" };
    next[index][field] = value;
    setMilestonesFr(next);
  };

  const removeMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
    setMilestonesFr((milestonesFr || []).filter((_, i) => i !== index));
  };

  return (
    <div
      className="max-w-5xl mx-auto pb-24"
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
              Page Title (EN)
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
              Page Title (FR)
            </label>
            <input
              type="text"
              value={titleFr}
              onChange={(e) => setTitleFr(e.target.value)}
              placeholder="[NEEDS_TRANSLATION]"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Subtitle (EN)
            </label>
            <textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Subtitle (FR)
            </label>
            <textarea
              value={subtitleFr}
              onChange={(e) => setSubtitleFr(e.target.value)}
              placeholder="[NEEDS_TRANSLATION]"
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
              Bio Section Title (EN)
            </label>
            <input
              type="text"
              value={bioTitle}
              onChange={(e) => setBioTitle(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Bio Section Title (FR)
            </label>
            <input
              type="text"
              value={bioTitleFr}
              onChange={(e) => setBioTitleFr(e.target.value)}
              placeholder="[NEEDS_TRANSLATION]"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <textarea
                      value={paragraph}
                      onChange={(e) =>
                        updateBioParagraph(index, e.target.value)
                      }
                      rows={4}
                      placeholder={`Paragraph ${index + 1} (EN)`}
                      className="w-full px-4 py-2 pr-10 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    />
                    <textarea
                      value={(bioParagraphsFr || [])[index] || ""}
                      onChange={(e) =>
                        updateBioParagraphFr(index, e.target.value)
                      }
                      rows={4}
                      placeholder={`Paragraph ${index + 1} (FR)`}
                      className="w-full px-4 py-2 pr-10 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    />
                  </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={pillar.title}
                      onChange={(e) =>
                        updatePillar(index, "title", e.target.value)
                      }
                      placeholder="Pillar Title (EN)"
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="text"
                      value={pillarsFr?.[index]?.title || ""}
                      onChange={(e) =>
                        updatePillarFr(index, "title", e.target.value)
                      }
                      placeholder="Pillar Title (FR)"
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <textarea
                      value={pillar.body}
                      onChange={(e) =>
                        updatePillar(index, "body", e.target.value)
                      }
                      placeholder="Pillar Description (EN)"
                      rows={3}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    />
                    <textarea
                      value={pillarsFr?.[index]?.body || ""}
                      onChange={(e) =>
                        updatePillarFr(index, "body", e.target.value)
                      }
                      placeholder="Pillar Description (FR)"
                      rows={3}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    />
                  </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={milestone.year}
                      onChange={(e) =>
                        updateMilestone(index, "year", e.target.value)
                      }
                      placeholder="Year/Period (EN)"
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="text"
                      value={milestonesFr?.[index]?.year || ""}
                      onChange={(e) =>
                        updateMilestoneFr(index, "year", e.target.value)
                      }
                      placeholder="Year/Period (FR)"
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <textarea
                      value={milestone.text}
                      onChange={(e) =>
                        updateMilestone(index, "text", e.target.value)
                      }
                      placeholder="Description (EN)"
                      rows={3}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    />
                    <textarea
                      value={milestonesFr?.[index]?.text || ""}
                      onChange={(e) =>
                        updateMilestoneFr(index, "text", e.target.value)
                      }
                      placeholder="Description (FR)"
                      rows={3}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    />
                  </div>
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
              Quote Text (EN)
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
              Quote Text (FR)
            </label>
            <textarea
              value={quoteFr}
              onChange={(e) => setQuoteFr(e.target.value)}
              placeholder="[NEEDS_TRANSLATION]"
              rows={3}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Quote Author (EN)
            </label>
            <input
              type="text"
              value={quoteAuthor}
              onChange={(e) => setQuoteAuthor(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Quote Author (FR)
            </label>
            <input
              type="text"
              value={quoteAuthorFr}
              onChange={(e) => setQuoteAuthorFr(e.target.value)}
              placeholder="[NEEDS_TRANSLATION]"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Social Links Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900">Social Links</h2>

          <div className="space-y-4">
            {/* Instagram */}
            <div className="p-4 bg-zinc-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="instagram-enabled"
                  checked={instagramEnabled}
                  onChange={(e) => setInstagramEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="instagram-enabled"
                  className="text-sm font-semibold text-zinc-900"
                >
                  Enable Instagram
                </label>
              </div>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                disabled={!instagramEnabled}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-zinc-100 disabled:text-zinc-400"
              />
            </div>

            {/* YouTube */}
            <div className="p-4 bg-zinc-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="youtube-enabled"
                  checked={youtubeEnabled}
                  onChange={(e) => setYoutubeEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="youtube-enabled"
                  className="text-sm font-semibold text-zinc-900"
                >
                  Enable YouTube
                </label>
              </div>
              <input
                type="text"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/..."
                disabled={!youtubeEnabled}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-zinc-100 disabled:text-zinc-400"
              />
            </div>

            {/* Spotify */}
            <div className="p-4 bg-zinc-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="spotify-enabled"
                  checked={spotifyEnabled}
                  onChange={(e) => setSpotifyEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="spotify-enabled"
                  className="text-sm font-semibold text-zinc-900"
                >
                  Enable Spotify
                </label>
              </div>
              <input
                type="text"
                value={spotify}
                onChange={(e) => setSpotify(e.target.value)}
                placeholder="https://spotify.com/..."
                disabled={!spotifyEnabled}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-zinc-100 disabled:text-zinc-400"
              />
            </div>

            {/* Facebook */}
            <div className="p-4 bg-zinc-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="facebook-enabled"
                  checked={facebookEnabled}
                  onChange={(e) => setFacebookEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="facebook-enabled"
                  className="text-sm font-semibold text-zinc-900"
                >
                  Enable Facebook
                </label>
              </div>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
                disabled={!facebookEnabled}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-zinc-100 disabled:text-zinc-400"
              />
            </div>

            {/* Email */}
            <div className="p-4 bg-zinc-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="email-enabled"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="email-enabled"
                  className="text-sm font-semibold text-zinc-900"
                >
                  Enable Email
                </label>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={!emailEnabled}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-zinc-100 disabled:text-zinc-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`
            group relative px-8 py-4 rounded-2xl shadow-2xl font-medium
            transition-all duration-300 ease-out
            flex items-center justify-center gap-2.5 min-w-[140px]
            ${
              saved
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-105 shadow-green-500/50"
                : saving
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-wait"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
            }
            disabled:opacity-70 disabled:cursor-not-allowed
            backdrop-blur-sm
          `}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Saving...</span>
            </>
          ) : saved ? (
            <>
              <div className="relative w-5 h-5 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold">Saved!</span>
            </>
          ) : (
            <>
              <span className="text-sm font-semibold">Save</span>
            </>
          )}

          {/* Success ripple effect */}
          {saved && (
            <>
              <div className="absolute inset-0 rounded-2xl bg-green-400/40 animate-ping opacity-75" />
              <div className="absolute -inset-1 rounded-2xl bg-green-500/20 blur-xl animate-pulse" />
            </>
          )}
        </button>
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
