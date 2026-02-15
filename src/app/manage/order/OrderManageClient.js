"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/util/supabase/supabaseClient";
import { Loader2 } from "lucide-react";
import Toast from "../Toast";

export default function OrderManageClient({ initialNextOpening }) {
  const router = useRouter();
  const [nextOpening, setNextOpening] = useState(initialNextOpening || "");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setToast(null);

    try {
      const { error } = await supabase
        .from("fanaha_order_settings")
        .upsert(
          {
            key: "next_opening",
            value: nextOpening.trim() || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );

      if (error) throw error;

      setToast({ message: "Next opening date saved successfully!", type: "success" });
      router.refresh();
    } catch (err) {
      setToast({ message: "Failed to save. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="max-w-5xl mx-auto pb-24"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">
          Order Page Settings
        </h1>
        <p className="text-zinc-600">
          Set the next availability opening shown on the commission order page
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 sm:p-8 max-w-xl">
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Next opening date
        </label>
        <input
          type="date"
          value={nextOpening}
          onChange={(e) => setNextOpening(e.target.value)}
          className="w-full sm:w-auto min-w-[200px] px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <p className="mt-2 text-sm text-zinc-500">
          Leave empty to hide the availability block on the order page.
        </p>

        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>

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
