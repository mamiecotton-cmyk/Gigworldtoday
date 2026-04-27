// Simple perceptual hash (pHash) — 8x8 grayscale, returns 64-char binary string.
// Compares average luminance of each pixel against the 64-pixel mean.

export async function computePHash(file: File): Promise<string> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, 32, 32);
  const data = ctx.getImageData(0, 0, 32, 32).data;

  // Convert to grayscale, downsample to 8x8 by averaging 4x4 blocks
  const gray = new Array(64).fill(0);
  for (let by = 0; by < 8; by++) {
    for (let bx = 0; bx < 8; bx++) {
      let sum = 0;
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          const px = (by * 4 + y) * 32 + (bx * 4 + x);
          const i = px * 4;
          sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
      }
      gray[by * 8 + bx] = sum / 16;
    }
  }

  const avg = gray.reduce((a, b) => a + b, 0) / 64;
  return gray.map((v) => (v >= avg ? "1" : "0")).join("");
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}