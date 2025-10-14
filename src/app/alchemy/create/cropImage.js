/**
 * Creates a cropped circular image from the source image and crop area
 * @param {string} imageSrc - The source image URL
 * @param {object} pixelCrop - The crop area in pixels
 * @param {string} fileName - The original file name
 * @returns {Promise<File>} - The cropped circular image as a File object with transparent background
 */
export async function getCroppedImg(
  imageSrc,
  pixelCrop,
  fileName = "cropped.png"
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Set canvas size to the crop dimensions (square)
  const size = Math.min(pixelCrop.width, pixelCrop.height);
  canvas.width = size;
  canvas.height = size;

  // Create circular clipping path
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Draw the cropped image within the circular clip
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        const file = new File(
          [blob],
          fileName.replace(/\.(jpg|jpeg)$/i, ".png"),
          { type: "image/png" }
        );
        resolve(file);
      },
      "image/png",
      1.0
    );
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}
