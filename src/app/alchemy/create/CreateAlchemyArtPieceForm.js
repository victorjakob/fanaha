"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../util/supabase/supabaseClient";
import ColorThief from "color-thief-browser";
import ImageCropper from "./ImageCropper";
import { getCroppedImg } from "./cropImage";
import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
} from "@/lib/cloudinary-upload";
import { cldUrlEnhanced } from "@/lib/cloudinary";

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
    slug: "",
    description: "",
    dimension: "",
    price: "",
    year: new Date().getFullYear().toString(),
    status: "available",
    videoUrl: "",
    mainImage: null,
    images: [],
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
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
        setForm((f) => ({ ...f, images: [...f.images, ...newFiles] }));
        setGalleryPreviews((prev) => [
          ...prev,
          ...newFiles.map((file) => URL.createObjectURL(file)),
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
    } else if (name === "price") {
      // Only allow numbers and decimal points
      const cleanValue = value.replace(/[^0-9.]/g, "");
      setForm((f) => ({ ...f, price: cleanValue }));
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
      console.error(e);
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
    setForm((f) => ({
      ...f,
      images: f.images.filter((_, i) => i !== idx),
    }));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
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
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      const url = URL.createObjectURL(file);
      img.onload = () => {
        try {
          const colorThief = new ColorThief();
          const colors = colorThief.getPalette(img, 5);
          const paletteArr = colors.map((c) => `rgb(${c[0]},${c[1]},${c[2]})`);
          console.log("Extracted palette:", paletteArr);
          resolve(paletteArr);
        } catch (err) {
          console.error("Palette extraction error:", err);
          resolve([]);
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      img.onerror = (e) => {
        console.error("Image load error:", e);
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
        // Update form with unique slug
        setForm((f) => ({ ...f, slug: uniqueSlug }));
        console.log(`Slug updated to: ${uniqueSlug} (original was taken)`);
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
        form.images.length > 0
          ? await uploadMultipleToCloudinary(
              form.images,
              `fanaha/alchemy/${finalSlug}/gallery`,
              (progress) => {
                // Optional: Update progress indicator
                console.log(`Upload progress: ${Math.round(progress * 100)}%`);
              },
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

      // Insert into DB with both public_ids (new) and URLs (backward compatibility)
      const { error: dbError } = await supabase
        .from("fanaha_alchemy_pieces")
        .insert([
          {
            slug: finalSlug,
            name: form.title,
            description: form.description,
            dimensions: form.dimension,
            price: form.price ? parseFloat(form.price) : null,
            year: form.year ? parseInt(form.year) : null,
            status: form.status,
            video_url: form.videoUrl || null,
            section_id: section?.id || null, // Link to section for manage page
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
      console.error("Upload error:", err);
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
                <img
                  src={mainImagePreview}
                  alt="Main Preview"
                  className="w-48 h-48 object-cover rounded-full shadow-xl border-4 border-purple-400 mb-2 bg-white"
                  style={{ background: "#f6f6fa" }}
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
              Title
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
            <input
              ref={galleryInputRef}
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={handleChange}
              className="w-full text-zinc-700"
              disabled={loading}
            />
            {galleryPreviews.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {galleryPreviews.map((src, idx) => (
                  <div key={src} className="relative group">
                    <img
                      src={src}
                      alt={`Gallery Preview ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded-xl border-2 border-zinc-200 shadow-md bg-zinc-50"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-white/80 text-zinc-700 hover:bg-red-500 hover:text-white rounded-full p-1 shadow-md opacity-80 group-hover:opacity-100"
                      onClick={() => removeGalleryImage(idx)}
                      tabIndex={0}
                      aria-label={`Remove gallery image ${idx + 1}`}
                    >
                      ✕
                    </button>
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
