"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../util/supabase/supabaseClient";
import ImageCropper from "../../create/ImageCropper";
import { getCroppedImg } from "../../create/cropImage";
import ColorThief from "color-thief-browser";
import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
} from "@/lib/cloudinary-upload";
import { cldUrlEnhanced, isCloudinaryId } from "@/lib/cloudinary";

export default function EditForm({ piece }) {
  const [form, setForm] = useState({
    title: piece.name || "",
    slug: piece.slug || "",
    description: piece.description || "",
    dimension: piece.dimensions || "",
    price: piece.price ? piece.price.toString() : "",
    year: piece.year
      ? piece.year.toString()
      : new Date().getFullYear().toString(),
    status: piece.status || "available",
    videoUrl: piece.video_url || "",
    mainImage: null,
    // Use public_ids if available, otherwise fall back to images URLs
    images: piece.images_public_ids
      ? piece.images_public_ids.slice(1)
      : piece.images
      ? piece.images.slice(1)
      : [], // exclude main image
  });
  const [mainImagePreview, setMainImagePreview] = useState(
    // Use public_id to generate URL if available, otherwise use existing URL
    piece.main_image_public_id
      ? cldUrlEnhanced({
          publicId: piece.main_image_public_id,
          width: 400,
          height: 400,
          quality: "auto:good",
          crop: "fill",
          aspectRatio: "1:1",
        })
      : piece.main_image || (piece.images && piece.images[0]) || null
  );
  const [galleryPreviews, setGalleryPreviews] = useState(() => {
    // Generate preview URLs from public_ids if available
    if (piece.images_public_ids && piece.images_public_ids.length > 1) {
      return piece.images_public_ids.slice(1).map((publicId) =>
        cldUrlEnhanced({
          publicId,
          width: 200,
          height: 200,
          quality: "auto:good",
          crop: "fill",
        })
      );
    }
    // Fall back to existing images URLs
    return piece.images ? piece.images.slice(1) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [palette, setPalette] = useState(piece.palette || []);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null);
  const [tempFileName, setTempFileName] = useState("");
  const router = useRouter();
  const galleryInputRef = useRef();

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

  function removeGalleryImage(idx) {
    setForm((f) => ({
      ...f,
      images: f.images.filter((_, i) => i !== idx),
    }));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

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

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      // Start with existing values
      let mainImagePublicId = piece.main_image_public_id || null;
      let mainImageUrl = piece.main_image;
      let imagesPublicIds = piece.images_public_ids || [];
      let imageUrls = piece.images || [];
      let paletteArr = palette;

      // If main image changed, upload new one to Cloudinary and extract palette
      if (form.mainImage) {
        paletteArr = await extractPalette(form.mainImage);
        setPalette(paletteArr);

        // Upload to Cloudinary
        mainImagePublicId = await uploadToCloudinary(
          form.mainImage,
          `fanaha/alchemy/${form.slug}`,
          { alwaysCompress: true }
        );

        // Generate optimized URL
        mainImageUrl = cldUrlEnhanced({
          publicId: mainImagePublicId,
          width: 800,
          height: 800,
          quality: "auto:good",
          crop: "fill",
          aspectRatio: "1:1",
        });
      }

      // Handle gallery images
      const newGalleryFiles = form.images.filter((img) => img instanceof File);
      const existingImageIds = form.images.filter(
        (img) => typeof img === "string"
      );

      // Upload new gallery images in parallel
      if (newGalleryFiles.length > 0) {
        const newPublicIds = await uploadMultipleToCloudinary(
          newGalleryFiles,
          `fanaha/alchemy/${form.slug}/gallery`,
          null,
          { alwaysCompress: true }
        );

        // Combine existing public_ids with new ones
        imagesPublicIds = [...existingImageIds, ...newPublicIds];

        // Generate URLs for all images (existing + new)
        imageUrls = imagesPublicIds.map((publicId) =>
          cldUrlEnhanced({
            publicId,
            width: 800,
            height: 800,
            quality: "auto:good",
            crop: "fill",
          })
        );
      } else {
        // No new images, but ensure existing ones are converted to URLs if they're public_ids
        imagesPublicIds = existingImageIds;
        imageUrls = existingImageIds.map((imgId) => {
          // If it's already a URL (contains http), use it; otherwise generate URL from public_id
          if (imgId.includes("http") || imgId.includes("supabase.co")) {
            return imgId;
          }
          return cldUrlEnhanced({
            publicId: imgId,
            width: 800,
            height: 800,
            quality: "auto:good",
            crop: "fill",
          });
        });
      }

      // Update DB with both public_ids (new) and URLs (backward compatibility)
      const updateData = {
        name: form.title,
        description: form.description,
        dimensions: form.dimension,
        price: form.price ? parseFloat(form.price) : null,
        year: form.year ? parseInt(form.year) : null,
        status: form.status,
        video_url: form.videoUrl || null,
        // New: Store Cloudinary public_ids
        main_image_public_id: mainImagePublicId,
        images_public_ids: imagesPublicIds.length > 0 ? imagesPublicIds : null,
        // Backward compatibility: Also store full URLs
        main_image: mainImageUrl,
        images: [mainImageUrl, ...imageUrls],
        palette: paletteArr,
      };

      const { error: dbError } = await supabase
        .from("fanaha_alchemy_pieces")
        .update(updateData)
        .eq("slug", piece.slug);
      if (dbError) throw dbError;
      setSuccess(true);
      setLoading(false);
      router.push(`/manage`);
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
        {/* Error/Success/Submit */}
        {error && (
          <div className="text-red-500 font-semibold text-center mt-2">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-500 font-semibold text-center mt-2">
            Art piece Updated!
          </div>
        )}
        <button
          type="submit"
          className="bg-gradient-to-br from-purple-700 to-violet-900 hover:from-purple-800 hover:to-violet-950 text-white font-bold py-4 px-16 rounded-full shadow-xl transition-all text-xl mt-4 tracking-wide focus:outline-none focus:ring-4 focus:ring-purple-300"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Art Piece"}
        </button>
      </form>
    </>
  );
}
