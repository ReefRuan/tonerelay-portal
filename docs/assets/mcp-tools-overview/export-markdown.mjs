// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only
import { readFile, writeFile } from "node:fs/promises";

const decode = (value) => value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
for (const language of ["zh", "en"]) {
  const html = await readFile(new URL(`tools-list.${language}.html`, import.meta.url), "utf8");
  const title = html.match(/<h1>([^<]+)<\/h1>/)?.[1];
  const sections = [...html.matchAll(/<section class="tool-group [\s\S]*?<\/section>/g)].map(([section]) => section);
  if (!title || sections.length !== 3) throw new Error(`Invalid ${language} tool directory`);
  const lines = [`# ${decode(title)}`, "", `<!-- Generated from tools-list.${language}.html; edit that HTML, then run export-markdown.mjs. -->`, ""];
  const allNames = [];
  for (const section of sections) {
    const heading = section.match(/<h2[^>]*>([^<]+)<\/h2>/)?.[1];
    const rows = [...section.matchAll(/<li[^>]*><code>(trlr_\w+)<\/code><span>([^<]+)<\/span><\/li>/g)];
    if (!heading || !rows.length) throw new Error(`Invalid ${language} tool group`);
    lines.push(`## ${decode(heading)} · ${rows.length}`, "", language === "zh" ? "| Tool | 用途 |" : "| Tool | Purpose |", "| --- | --- |");
    for (const [, name, label] of rows) {
      allNames.push(name);
      lines.push(`| \`${name}\` | ${decode(label)} |`);
    }
    const note = section.match(/<p class="group-note">([^<]+)<\/p>/)?.[1];
    lines.push("", ...(note ? [decode(note), ""] : []));
  }
  if (new Set(allNames).size !== allNames.length) throw new Error(`Duplicate tools in ${language}`);
  const footer = html.match(/<footer class="footer"><p>([^<]+)<\/p>/)?.[1];
  if (footer) lines.push(decode(footer), "");
  lines.push("Reef Ruan · ToneRelay", "");
  await writeFile(new URL(`tools-list.${language}.md`, import.meta.url), lines.join("\n"));
  process.stdout.write(`${language}: exported ${allNames.length} tool names to Markdown\n`);
}
