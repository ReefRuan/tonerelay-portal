import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { deferBootStylesheets, renderBootInstallFallback } from "./src/bootFallback.ts";

export default defineConfig({
  base: "./",
  plugins: [react(), {
    name: "inline-boot-installation-context",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        if (!html.includes("<!-- boot-install-context -->")) return html;
        const zh = readFileSync(new URL("./docs/install-short-prompt.md", import.meta.url), "utf8");
        const en = readFileSync(new URL("./docs/install-short-prompt.en.md", import.meta.url), "utf8");
        return html.replace("<!-- boot-install-context -->", renderBootInstallFallback(zh, en));
      },
    },
  }, {
    name: "nonblocking-boot-stylesheets",
    transformIndexHtml: { order: "post", handler: deferBootStylesheets },
  }],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        contact: fileURLToPath(new URL("./contact.html", import.meta.url)),
      },
    },
  },
  server: {
    port: 5173,
  },
});
