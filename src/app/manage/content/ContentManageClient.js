"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Save, X } from "lucide-react";
import { coerceFrenchText } from "@/lib/db-i18n";

export default function ContentManageClient({ sections: initialSections }) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const handleEdit = (section) => {
    setEditingId(section.id);
    setEditForm({
      title: section.title,
      description: section.description,
      title_fr: section.title_fr || "",
      description_fr: section.description_fr || "",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (sectionId) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          title_fr: coerceFrenchText(editForm.title_fr),
          description_fr: coerceFrenchText(editForm.description_fr),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save changes");
      }

      const { data: updatedSection } = await response.json();

      setSections(
        sections.map((s) => (s.id === sectionId ? updatedSection : s))
      );
      setEditingId(null);
      setEditForm({});
      router.refresh();
    } catch (err) {
      alert(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="py-8 px-4 sm:px-6 lg:px-8"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            Content Management
          </h1>
          <p className="text-zinc-600">
            Manage titles and descriptions for all sections
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden"
            >
              {editingId === section.id ? (
                // Edit Mode
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Section Title (EN)
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Description (EN)
                    </label>
                    <textarea
                      value={editForm.description || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Section Title (FR)
                    </label>
                    <input
                      type="text"
                      value={editForm.title_fr || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title_fr: e.target.value })
                      }
                      placeholder="[NEEDS_TRANSLATION]"
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Description (FR)
                    </label>
                    <textarea
                      value={editForm.description_fr || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description_fr: e.target.value,
                        })
                      }
                      placeholder="[NEEDS_TRANSLATION]"
                      rows={4}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleSave(section.id)}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-zinc-900">
                          {section.title}
                        </h2>
                      </div>
                      <p className="text-sm text-zinc-500 mb-2">
                        Slug: /{section.slug}
                      </p>
                      {section.description && (
                        <p className="text-zinc-700 leading-relaxed">
                          {section.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(section)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
