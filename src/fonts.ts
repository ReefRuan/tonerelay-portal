// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Registers the subset "霞鹜文楷" (LXGW WenKai) web font.
 *
 * The font lives in `public/fonts/` and is referenced through `BASE_URL` so the
 * URL stays correct when the site is served from a sub-path (`base: "./"`).
 * LXGW WenKai is licensed under the SIL Open Font License 1.1 — see
 * `public/fonts/OFL-LXGW-WenKai.txt`.
 */

export const HAND_FONT_FAMILY = "LXGW WenKai Web";

const STYLE_ELEMENT_ID = "lxgw-wenkai-web-font";

/** Injects the `@font-face` rule once, on the client. */
export function installWebFont(): void {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;

  const url = `${import.meta.env.BASE_URL}fonts/lxgw-wenkai-subset.woff2`;
  const style = document.createElement("style");
  style.id = STYLE_ELEMENT_ID;
  style.textContent = [
    "@font-face{",
    `font-family:"${HAND_FONT_FAMILY}";`,
    `src:url("${url}") format("woff2");`,
    "font-style:normal;",
    "font-weight:400;",
    "font-display:swap;",
    "}",
  ].join("");
  document.head.appendChild(style);
}
