"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { supabase } from "../../../util/supabase/supabaseClient";
import ImageCropper from "./ImageCropper";
import { getCroppedImg } from "./cropImage";
import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
} from "@/lib/cloudinary-upload";
import { cldUrlEnhanced } from "@/lib/cloudinary";
import { coerceFrenchText } from "@/lib/db-i18n";

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD") // Normalize to decomposed form
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics/accents
    .replace(/ð/g, "d") // Icelandic eth
    .replace(/þ/g, "th") // Icelandic thorn
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Generate a unique slug by checking for duplicates and appending random string if needed
async function generateUniqueSlug(baseSlug, supabase) {
  let slug = baseSlug;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    // Check if slug exists
    const { data: existing } = await supabase
      .from("fanaha_alchemy_pieces")
      .select("id")
      .eq("slug", slug)
      .single();

    // If slug doesn't exist, it's unique!
    if (!existing) {
      return slug;
    }

    // Slug exists, append random string
    const randomStr = Math.random().toString(36).substring(2, 8); // 6 char random string
    slug = `${baseSlug}-${randomStr}`;
    attempts++;
  }

  // Fallback: use timestamp if we've tried too many times
  return `${baseSlug}-${Date.now().toString(36)}`;
}

function sanitizeFilename(filename) {
  return filename
    .normalize("NFD")
    .replace(/[^\w.]+/g, "-") // Replace non-word chars (except dot) with -
    .replace(/\u0300-\u036f/g, "") // Remove accents
    .replace(/-+/g, "-") // Collapse multiple dashes
    .replace(/^-+|-+$/g, "") // Trim dashes
    .toLowerCase();
}

export default function CreateAlchemyArtPieceForm() {
  const [form, setForm] = useState({
    title: "",
    titleFr: "",
    slug: "",
    description: "",
    descriptionFr: "",
    dimension: "",
    price: "",
    priceEur: "",
    year: new Date().getFullYear().toString(),
    status: "available",
    videoUrl: "",
    mainImage: null,
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [palette, setPalette] = useState([]);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null);
  const [tempFileName, setTempFileName] = useState("");
  const router = useRouter();
  const galleryInputRef = useRef();
  const mainImageRef = useRef();

  const makeId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  function handleChange(e) {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      if (name === "mainImage") {
        const file = files[0];
        if (file) {
          setTempImageSrc(URL.createObjectURL(file));
          setTempFileName(file.name);
          setShowCropper(true);
        }
      } else if (name === "images") {
        const newFiles = Array.from(files);
        setGalleryItems((prev) => [
          ...prev,
          ...newFiles.map((file) => ({
            id: makeId(),
            file,
            previewUrl: URL.createObjectURL(file),
          })),
        ]);
      }
    } else if (name === "title") {
      setForm((f) => {
        const newSlug = !slugManuallyEdited ? slugify(value) : f.slug;
        return { ...f, title: value, slug: newSlug };
      });
    } else if (name === "slug") {
      setForm((f) => ({ ...f, slug: slugify(value) }));
      setSlugManuallyEdited(true);
    } else if (name === "price" || name === "priceEur") {
      // Only allow numbers and decimal points
      const cleanValue = value.replace(/[^0-9.]/g, "");
      setForm((f) => ({ ...f, [name]: cleanValue }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  async function handleCropComplete(croppedAreaPixels) {
    try {
      const croppedImage = await getCroppedImg(
        tempImageSrc,
        croppedAreaPixels,
        tempFileName
      );
      setForm((f) => ({ ...f, mainImage: croppedImage }));
      setMainImagePreview(URL.createObjectURL(croppedImage));
      setShowCropper(false);
      setTempImageSrc(null);
    } catch (e) {
      setError("Failed to crop image");
    }
  }

  function handleCropCancel() {
    setShowCropper(false);
    setTempImageSrc(null);
    setTempFileName("");
  }

  function removeMainImage() {
    setForm((f) => ({ ...f, mainImage: null }));
    setMainImagePreview(null);
  }

  function removeGalleryImage(idx) {
    setGalleryItems((prev) => {
      const next = [...prev];
      const removed = next[idx];
      if (removed?.previewUrl?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(removed.previewUrl);
        } catch {}
      }
      next.splice(idx, 1);
      return next;
    });
  }

  function moveGalleryItemByDelta(idx, delta) {
    const nextIdx = idx + delta;
    if (nextIdx < 0 || nextIdx >= galleryItems.length) return;
    setGalleryItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(idx, 1);
      next.splice(nextIdx, 0, moved);
      return next;
    });
  }

  // Legacy Supabase upload (kept for backward compatibility if needed)
  async function uploadImage(file, path) {
    const { data, error } = await supabase.storage
      .from("alchemy-images")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    // Get public URL
    const { data: urlData } = supabase.storage
      .from("alchemy-images")
      .getPublicUrl(path);
    return urlData.publicUrl;
  }

  async function extractPalette(file) {
    const { default: ColorThief } = await import("color-thief-browser");
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      const url = URL.createObjectURL(file);
      img.onload = () => {
        try {
          const colorThief = new ColorThief();
          const colors = colorThief.getPalette(img, 5);
          const paletteArr = colors.map((c) => `rgb(${c[0]},${c[1]},${c[2]})`);
          resolve(paletteArr);
        } catch (err) {
          resolve([]);
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve([]);
      };
      img.src = url;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      if (!form.mainImage) throw new Error("Main image is required");

      // Ensure slug is unique
      const uniqueSlug = await generateUniqueSlug(form.slug, supabase);
      if (uniqueSlug !== form.slug) {
        setForm((f) => ({ ...f, slug: uniqueSlug }));
      }

      // Extract palette from main image
      const paletteArr = await extractPalette(form.mainImage);
      setPalette(paletteArr);

      // Use the unique slug for uploads
      const finalSlug = uniqueSlug;

      // Upload main image to Cloudinary
      const mainImagePublicId = await uploadToCloudinary(
        form.mainImage,
        `fanaha/alchemy/${finalSlug}`,
        { alwaysCompress: true }
      );

      // Upload gallery images in parallel (much faster!)
      const galleryPublicIds =
        galleryItems.length > 0
          ? await uploadMultipleToCloudinary(
              galleryItems.map((i) => i.file),
              `fanaha/alchemy/${finalSlug}/gallery`,
              undefined,
              { alwaysCompress: true }
            )
          : [];

      // Combine main image with gallery images
      const allPublicIds = [mainImagePublicId, ...galleryPublicIds];

      // Generate full URLs for backward compatibility (existing code expects URLs)
      const mainImageUrl = cldUrlEnhanced({
        publicId: mainImagePublicId,
        width: 800,
        height: 800,
        quality: "auto:good",
        crop: "fill",
        aspectRatio: "1:1",
      });

      const imageUrls = allPublicIds.map((publicId) =>
        cldUrlEnhanced({
          publicId,
          width: 800,
          height: 800,
          quality: "auto:good",
          crop: "fill",
        })
      );

      // Get section_id for alchemical-art-pieces section
      const { data: section } = await supabase
        .from("fanaha_sections")
        .select("id")
        .eq("slug", "alchemical-art-pieces")
        .single();

      // Place new piece first within its status by shifting existing items down.
      // This keeps `/alchemy` and `/manage/alchemical-art-pieces` ordering predictable.
      const statusForOrder = form.status || "available";
      if (section?.id) {
        const { data: siblings, error: siblingsError } = await supabase
          .from("fanaha_alchemy_pieces")
          .select("id, display_order")
          .eq("section_id", section.id)
          .eq("status", statusForOrder)
          .order("display_order", { ascending: true });

        if (siblingsError) throw siblingsError;

        if (siblings && siblings.length > 0) {
          const updates = siblings.map((p) =>
            supabase
              .from("fanaha_alchemy_pieces")
              .update({ display_order: (p.display_order || 0) + 1 })
              .eq("id", p.id)
          );
          const results = await Promise.all(updates);
          const hasError = results.some((r) => r.error);
          if (hasError) {
            throw new Error("Failed to update ordering for existing pieces");
          }
        }
      }

      // Insert into DB with both public_ids (new) and URLs (backward compatibility)
      const { error: dbError } = await supabase
        .from("fanaha_alchemy_pieces")
        .insert([
          {
            slug: finalSlug,
            name: form.title,
            name_fr: coerceFrenchText(form.titleFr),
            description: form.description,
            description_fr: coerceFrenchText(form.descriptionFr),
            dimensions: form.dimension,
            price: form.price ? parseFloat(form.price) : null,
            price_eur: form.priceEur ? parseFloat(form.priceEur) : null,
            year: form.year ? parseInt(form.year) : null,
            status: statusForOrder,
            video_url: form.videoUrl || null,
            section_id: section?.id || null, // Link to section for manage page
            display_order: 0,
            // New: Store Cloudinary public_ids
            main_image_public_id: mainImagePublicId,
            images_public_ids: allPublicIds,
            // Backward compatibility: Also store full URLs (existing code uses these)
            main_image: mainImageUrl,
            images: imageUrls,
            palette: paletteArr,
          },
        ]);

      if (dbError) throw dbError;
      setSuccess(true);
      setLoading(false);
      router.push(`/manage/alchemical-art-pieces`);
    } catch (err) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  }

  return (
    <>
      {showCropper && tempImageSrc && (
        <ImageCropper
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      <form
        className="w-full max-w-xl mx-auto bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 flex flex-col gap-10 items-center border border-zinc-200"
        onSubmit={handleSubmit}
      >
        {/* Main Image Upload & Preview */}
        <div className="w-full flex flex-col items-center gap-3">
          <label className="text-lg font-semibold text-zinc-700">
            Main Image
          </label>
          <div className="flex flex-col items-center gap-2">
            {mainImagePreview ? (
              <div className="relative flex flex-col items-center">
                <Image
                  src={mainImagePreview}
                  alt="Main Preview"
                  width={192}
                  height={192}
                  className="w-48 h-48 object-cover rounded-full shadow-xl border-4 border-purple-400 mb-2 bg-white"
                  style={{ background: "#f6f6fa" }}
                  unoptimized
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-white/80 text-zinc-700 hover:bg-red-500 hover:text-white rounded-full p-1 shadow-md"
                  onClick={removeMainImage}
                  tabIndex={0}
                  aria-label="Remove main image"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="w-48 h-48 flex items-center justify-center rounded-full border-2 border-dashed border-purple-300 bg-zinc-100 text-zinc-400 cursor-pointer hover:border-purple-500 hover:text-purple-500 transition-all shadow-inner">
                <input
                  type="file"
                  name="mainImage"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                  required
                  disabled={loading}
                />
                <span className="text-center text-base font-medium">
                  Click to upload
                  <br />
                  circular PNG
                </span>
              </label>
            )}
          </div>
        </div>
        <div className="w-full flex flex-col gap-8 divide-y divide-zinc-200">
          {/* Title */}
          <div className="flex flex-col items-center gap-2 pb-8">
            <label
              className="text-lg font-semibold text-zinc-700"
              htmlFor="title"
            >
              Title (EN)
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full text-center rounded-xl px-4 py-3 bg-zinc-100 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-xl font-normal shadow-sm"
              required
              disabled={loading}
            />

            <label
              className="text-lg font-semibold text-zinc-700"
              htmlFor="titleFr"
            >
              Title (FR)
            </label>
            <input
              id="titleFr"
              type="text"
              name="titleFr"
              value={form.titleFr}
              onChange={handleChange}
              placeholder="[NEEDS_TRANSLATION]"
              className="w-full text-center rounded-xl px-4 py-3 bg-zinc-100 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-xl font-normal shadow-sm"
              disabled={loading}
            />
          </div>
          {/* Description */}
          <div className="flex flex-col items-center gap-2 pt-8 pb-8">
            <label className="text-lg font-semibold text-zinc-700">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-xl px-4 py-3 bg-zinc-100 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-base text-left shadow-sm resize-y"
              rows={5}
              placeholder="Enter description... (Press Enter for new lines)"
              disabled={loading}
            />

            <label className="text-lg font-semibold text-zinc-700">
              Description (FR)
            </label>
            <textarea
              name="descriptionFr"
              value={form.descriptionFr}
              onChange={handleChange}
              className="w-full rounded-xl px-4 py-3 bg-zinc-100 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-base text-left shadow-sm resize-y"
              rows={5}
              placeholder="[NEEDS_TRANSLATION]"
              disabled={loading}
            />
          </div>
          {/* Dimension */}
          <div className="flex flex-col items-center gap-2 pt-8 pb-8">
            <label className="text-lg font-semibold text-zinc-700">
              Dimensions
            </label>
            <input
              type="text"
              name="dimension"
              value={form.dimension}
              onChange={handleChange}
              className="w-full rounded-xl px-4 py-3 bg-zinc-100 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-base text-center shadow-sm font-normal"
              disabled={loading}
            />
          </div>
          {/* Price */}
          <div className="flex flex-col items-center gap-2 pt-8 pb-8">
            <label className="text-lg font-semibold text-zinc-700">
              Price (ISK)
            </label>
            <input
              type="text"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="0"
              className="w-full rounded-xl px-4 py-3 bg-zinc-100 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-base text-center shadow-sm font-normal"
              disabled={loading}
            />

            <label className="text-lg font-semibold text-zinc-700">
              Price (EUR)
            </label>
            <input
              type="text"
              name="priceEur"
              value={form.priceEur}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full rounded-xl px-4 py-3 bg-zinc-100 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-base text-center shadow-sm font-normal"
              disabled={loading}
            />
          </div>
          {/* Year */}
          <div className="flex flex-col items-center gap-2 pt-8 pb-8">
            <label className="text-lg font-semibold text-zinc-700">
              Year Created
            </label>
            <input
              type="number"
              name="year"
              value={form.year}
              onChange={handleChange}
              placeholder={new Date().getFullYear().toString()}
              min="1900"
              max="2100"
              className="w-full rounded-xl px-4 py-3 bg-zinc-100 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-base text-center shadow-sm font-normal"
              disabled={loading}
            />
          </div>
          {/* Instagram Video URL */}
          <div className="flex flex-col items-center gap-2 pt-8 pb-8">
            <label className="text-lg font-semibold text-zinc-700">
              Instagram Video/Reel URL
            </label>
            <input
              type="url"
              name="videoUrl"
              value={form.videoUrl}
              onChange={handleChange}
              placeholder="https://www.instagram.com/p/..."
              className="w-full rounded-xl px-4 py-3 bg-zinc-100 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-base text-center shadow-sm font-normal"
              disabled={loading}
            />
            <p className="text-sm text-zinc-500">
              Optional: Add Instagram post or reel URL
            </p>
          </div>
          {/* Available Status */}
          <div className="flex flex-col items-center gap-2 pt-8 pb-8">
            <label className="text-lg font-semibold text-zinc-700">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-48 rounded-xl px-4 py-2 bg-zinc-100 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-base text-center shadow-sm font-normal"
              disabled={loading}
            >
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="commission">Commission</option>
            </select>
          </div>
          {/* Gallery Images Upload & Preview */}
          <div className="flex flex-col items-center gap-2 pt-8">
            <label className="text-lg font-semibold text-zinc-700">
              Gallery Images
            </label>
            <div className="w-full flex flex-col items-center gap-3">
              <input
                id="alchemy-gallery-images"
                ref={galleryInputRef}
                type="file"
                name="images"
                accept="image/*"
                multiple
                onChange={handleChange}
                className="hidden"
                disabled={loading}
              />
              <label
                htmlFor="alchemy-gallery-images"
                className={`pointer-events-auto inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium tracking-wide border shadow-sm transition-all ${
                  loading
                    ? "opacity-60 cursor-not-allowed bg-white/70 border-zinc-200 text-zinc-400"
                    : "cursor-pointer bg-white/85 border-zinc-300 text-zinc-700 hover:bg-white hover:border-purple-300 hover:shadow-md"
                }`}
              >
                Add gallery images
              </label>
              <p className="text-xs text-zinc-500">
                {galleryItems.length > 0
                  ? `${galleryItems.length} image${
                      galleryItems.length === 1 ? "" : "s"
                    } selected`
                  : "PNG, JPG, WEBP"}
              </p>
            </div>
            {galleryItems.length > 1 && (
              <p className="text-sm text-zinc-500 text-center">
                Use the arrows under each image to reorder.
              </p>
            )}
            {galleryItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2 justify-items-center">
                {galleryItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="group flex flex-col items-center"
                    aria-label={`Gallery image ${idx + 1}`}
                  >
                    <div className="relative">
                      <Image
                        src={item.previewUrl}
                        alt={`Gallery Preview ${idx + 1}`}
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded-xl border-2 border-zinc-200 shadow-md bg-zinc-50"
                        unoptimized
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-white/90 text-zinc-700 hover:bg-red-500 hover:text-white rounded-full p-1.5 shadow-md opacity-90 group-hover:opacity-100"
                        onClick={() => removeGalleryImage(idx)}
                        tabIndex={0}
                        aria-label={`Remove gallery image ${idx + 1}`}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Reorder controls (below image, mobile-friendly) */}
                    <div className="mt-2 w-24">
                      <div className="w-full h-10 rounded-full bg-white/90 border border-zinc-200 shadow-sm overflow-hidden flex items-center">
                        <button
                          type="button"
                          onClick={() => moveGalleryItemByDelta(idx, -1)}
                          disabled={loading || idx === 0}
                          className="w-10 h-10 flex items-center justify-center text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200 transition disabled:opacity-30 disabled:hover:bg-transparent"
                          aria-label={`Move image ${idx + 1} earlier`}
                          title="Move earlier"
                        >
                          <Minus className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                        <div className="flex-1 h-10 flex items-center justify-center text-sm font-semibold tracking-wide text-zinc-500 select-none">
                          {idx + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => moveGalleryItemByDelta(idx, +1)}
                          disabled={loading || idx === galleryItems.length - 1}
                          className="w-10 h-10 flex items-center justify-center text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200 transition disabled:opacity-30 disabled:hover:bg-transparent"
                          aria-label={`Move image ${idx + 1} later`}
                          title="Move later"
                        >
                          <Plus className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Slug (hidden, but show URL preview) */}
        <div className="w-full flex flex-col items-center gap-1 mt-2">
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            className="hidden"
            required
          />
          <span className="text-xs text-zinc-400">
            URL: /alchemy/{form.slug || "your-slug"}
          </span>
        </div>
        {/* Error/Success/Submit */}
        {error && (
          <div className="text-red-500 font-semibold text-center mt-2">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-500 font-semibold text-center mt-2">
            Art piece Added!
          </div>
        )}
        <button
          type="submit"
          className="bg-gradient-to-br from-purple-700 to-violet-900 hover:from-purple-800 hover:to-violet-950 text-white font-bold py-4 px-16 rounded-full shadow-xl transition-all text-xl mt-4 tracking-wide focus:outline-none focus:ring-4 focus:ring-purple-300"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Art Piece"}
        </button>
      </form>
    </>
  );
}
