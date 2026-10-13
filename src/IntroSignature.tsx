// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import { useEffect, useRef } from "react";

const WIDTH = 104;
const HEIGHT = 46;
const BAYER_4 = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
];

/** Rasterize both signatures together so the dither is part of the glyphs. */
export function IntroSignature() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !context) return;

    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = "#fff";
    context.textBaseline = "top";
    context.font = 'bold 14px "SFMono-Regular", Menlo, monospace';
    context.fillText("@ReefRuan", 2, 1);
    context.font = 'bold 16px "PingFang SC", "Noto Sans CJK SC", sans-serif';
    context.fillText("深海鱼肉包", 2, 23);

    const pixels = context.getImageData(0, 0, WIDTH, HEIGHT);
    for (let y = 0; y < HEIGHT; y += 1) {
      for (let x = 0; x < WIDTH; x += 1) {
        const offset = (y * WIDTH + x) * 4;
        const coverage = pixels.data[offset + 3] / 255;
        const threshold = (BAYER_4[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
        if (coverage * 0.78 > threshold) {
          pixels.data[offset] = 145;
          pixels.data[offset + 1] = 189;
          pixels.data[offset + 2] = 231;
          pixels.data[offset + 3] = 255;
        } else {
          pixels.data[offset + 3] = 0;
        }
      }
    }
    context.putImageData(pixels, 0, 0);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="intro-signature"
      width={WIDTH}
      height={HEIGHT}
      aria-hidden="true"
    />
  );
}
