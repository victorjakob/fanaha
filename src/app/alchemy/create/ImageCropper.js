"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Slider } from "./Slider";

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropCompleteCallback = useCallback(
    (croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      await onCropComplete(croppedAreaPixels);
    } catch (error) {
      console.error("Crop error:", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-black/50 flex justify-between items-center">
        <h3 className="text-white text-lg font-semibold">
          Adjust Image Position
        </h3>
        <button
          onClick={onCancel}
          className="text-white hover:text-red-400 text-2xl px-2"
          type="button"
        >
          ✕
        </button>
      </div>

      {/* Cropper Area */}
      <div className="flex-1 relative">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteCallback}
          onZoomChange={onZoomChange}
        />
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/50 space-y-4">
        {/* Zoom Slider */}
        <div className="space-y-2">
          <label className="text-white text-sm font-medium block">Zoom</label>
          <Slider value={zoom} min={1} max={5} step={0.01} onChange={setZoom} />
        </div>

        {/* Instructions */}
        <p className="text-zinc-400 text-sm text-center">
          Drag to reposition • Pinch or use slider to zoom
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-3 px-6 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleComplete}
            disabled={isProcessing}
            className="flex-1 py-3 px-6 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Apply"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
