// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import type { Preset } from "./catalog";
import type { Language } from "./i18n";

type PresetTranslation = Pick<Preset, "name" | "description" | "note"> &
  Partial<Pick<Preset, "adjustmentHints" | "packageContents" | "downloadLabel">> & {
    photoLabels?: string[];
    photoCreditText?: string[];
    sourceLabels?: string[];
    cover?: {
      title: string;
      subtitle: string;
      status: string;
      colors: [string, string, string];
    };
  };

const translations: Record<string, PresetTranslation> = {
  "fuji-film-c200": {
    name: "C200",
    description:
      "Fresh color-negative relationships for everyday people, travel, and stories about places.",
    note:
      "For everyday portraits, travel, and documenting your surroundings: approachable, fresh colors with a lived-in feel.",
  },
  "fuji-film-natura-1600": {
    name: "NATURA 1600",
    description:
      "Preserve the scene's relationships in limited available light, mixed color temperatures, or a wide brightness range.",
    note:
      "For available light, night streets, and mixed lighting. Retain the weight of environmental shadows and local colors.",
  },
  "fuji-film-pro-160ns": {
    name: "PRO 160NS",
    description:
      "A color-negative direction that prioritizes a readable subject, highlight headroom, and color relationships within the scene.",
    note:
      "For portraits and high-contrast scenes. Protect detail in skin tones, white materials, and dark subjects.",
  },
  "fuji-film-pro-400h": {
    name: "PRO 400H",
    description:
      "Soft, continuous tones give people, white materials, and cool-colored surroundings their own space.",
    note:
      "For portraits, weddings, and gentle environments. Keep tonal continuity without tinting every scene the same color.",
  },
  "fuji-film-provia-100f": {
    name: "PROVIA 100F",
    description:
      "Place exposure carefully so warm colors, cool colors, and neutral objects remain distinct within the scene.",
    note:
      "For landscapes and city scenes with defined lighting. Keep colors clear and distinct without chasing excessive saturation.",
  },
  "fuji-film-superia-xtra-400": {
    name: "SUPERIA X-TRA 400",
    description:
      "An everyday color-negative feel that preserves different on-location lighting in street, travel, and family photographs.",
    note:
      "For street, travel, and family records. Preserve differences between scenes with a natural, everyday feel.",
  },
  "skin-tone-adaptive-fidelity": {
    name: "Adaptive Skin-Tone Protection",
    description:
      "When a person has an overall color cast but the background should stay unchanged, first verify a native subject mask on a separate working copy, then make small local corrections. Use a digital sampling board from the same image to check skin, clothing, mask edges, and background while respecting the scene's lighting and existing style.",
    note:
      "Public candidate. Native subject creation and parameter readback have been recorded for one photo, but the current MCP has no general-purpose tool for creating a separate working copy; stop this workflow if no copy is available. A subject is not a skin selection: coverage and edges still need visual review. Color-chart photos show only the physical charts' appearance. Multiple skin tones, charts photographed in the same scene, and paired Lightroom results have not been verified; do not claim a tested improvement in color accuracy.",
    adjustmentHints: [
      "Check the subject mask first; keep skin natural and the background mostly unchanged",
      "Keep the current style and correct only the color discontinuity between face and neck",
      "If the subject includes clothing, do not apply a skin-color adjustment to the whole person",
      "Check color accuracy against a chart photographed in the same scene",
    ],
    packageContents:
      "Includes native subject-mask instructions, sources and photo credits, and two licensed photographs showing physical color charts. The chart photos do not provide standard color values.",
    downloadLabel: "Download complete effect pack ZIP",
    cover: {
      title: "Adaptive Skin",
      subtitle: "ADAPTIVE SKIN FIDELITY",
      status: "PUBLIC CANDIDATE",
      colors: ["#202c38", "#506d78", "#b4a79a"],
    },
  },
  "luminous-mist-portrait": {
    name: "Luminous Mist Portrait",
    description:
      "Shape a soft glow and atmosphere from light sources already in the photo, while preserving subject clarity, natural skin tones, and background depth. Use it on its own or combine it with a style pack.",
    note:
      "Public links-only candidate. Read or download the complete prompt and view six tutorial photos through direct links to their original sites; neither the package nor this website hosts those photos. Paired Lightroom results have not been verified. Black Mist, Gold Mist, and White Mist are optional visual directions only; no same-scene comparison with physical filters has been made.",
    adjustmentHints: [
      "Make the highlights glow more",
      "Add more mist while keeping the person clear",
      "More Black Mist character",
      "More Gold Mist character",
      "More White Mist character",
      "More of a woodland atmosphere",
      "Keep skin natural and the background mostly unchanged",
    ],
    photoLabels: [
      "01 · Highlight-glow result",
      "02 · The same image before editing",
      "03 · Soft-focus portrait",
      "04 · Close portrait from the same tutorial",
      "05 · Warm woodland-light result",
      "06 · The same image before editing",
    ],
    photoCreditText: [
      "PHLEARN; photo credited to A.C. / Hannah Popowski, individual image attribution pending verification",
      "PHLEARN; photo credited to A.C. / Hannah Popowski, individual image attribution pending verification",
      "Fengniao / Sina; photographer pending verification",
      "Fengniao / Sina; photographer pending verification",
      "PHLEARN; photo by Luca Storelli",
      "PHLEARN; photo by Luca Storelli",
    ],
    sourceLabels: [
      "PHLEARN: portrait highlight glow, before and after (Photoshop)",
      "Fengniao / Sina: vintage soft-focus portraits",
      "PHLEARN: masked lighting for woodland portraits, before and after (Lightroom)",
    ],
    packageContents:
      "Includes the effect prompt, a source index, and original-site links to six tutorial photos. The ZIP contains no photo files.",
    downloadLabel: "Download text-and-links ZIP",
    cover: {
      title: "Luminous Mist",
      subtitle: "LUMINOUS MIST PORTRAIT",
      status: "LINKS-ONLY CANDIDATE",
      colors: ["#222932", "#6d756f", "#d2bc9a"],
    },
  },
};

const englishEffectCover = (
  title: string,
  subtitle: string,
  status: string,
  colors: [string, string, string],
) => {
  const [dark, middle, light] = colors;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1100">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${dark}"/><stop offset=".6" stop-color="${middle}"/><stop offset="1" stop-color="${light}"/></linearGradient></defs>
    <rect width="900" height="1100" fill="url(#g)"/>
    <path d="M90 250h720M90 520h720M90 790h720" stroke="white" stroke-opacity=".28" stroke-width="2"/>
    <circle cx="450" cy="520" r="230" fill="none" stroke="white" stroke-opacity=".58" stroke-width="3"/>
    <circle cx="450" cy="520" r="135" fill="none" stroke="white" stroke-opacity=".32" stroke-width="3"/>
    <circle cx="450" cy="520" r="9" fill="white"/>
    <text x="90" y="105" fill="white" font-family="sans-serif" font-size="24" letter-spacing="7">EFFECT PACK · ${status}</text>
    <text x="90" y="940" fill="white" font-family="serif" font-size="64">${title}</text>
    <text x="90" y="994" fill="white" fill-opacity=".75" font-family="monospace" font-size="20" letter-spacing="5">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export function localizePreset(preset: Preset, language: Language): Preset {
  const translation = translations[preset.id];
  if (language !== "en" || !translation) return preset;

  const { photoLabels, photoCreditText, sourceLabels, cover, ...text } = translation;
  const link = new URL(preset.link);
  link.searchParams.set("lang", "en");

  return {
    ...preset,
    ...text,
    link: link.toString(),
    ...(cover
      ? { image: englishEffectCover(cover.title, cover.subtitle, cover.status, cover.colors) }
      : {}),
    ...(preset.photoLinks
      ? {
          photoLinks: preset.photoLinks.map((photo, index) => ({
            ...photo,
            label: photoLabels?.[index] ?? photo.label,
            credit: photoCreditText?.[index] ?? photo.credit,
          })),
        }
      : {}),
    ...(preset.sourceLinks
      ? {
          sourceLinks: preset.sourceLinks.map((source, index) => ({
            ...source,
            label: sourceLabels?.[index] ?? source.label,
          })),
        }
      : {}),
  };
}

const categoryLabels: Record<string, string> = {
  全部: "All",
  胶片: "Film",
  模拟: "Simulation",
  黑白: "Black & White",
  效果: "Effects",
};

export function categoryLabel(category: string, language: Language): string {
  return language === "en" ? categoryLabels[category] ?? category : category;
}
