// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import promptDocument from "../docs/experience-card-prompts.md?raw";
import promptDocumentEnglish from "../docs/experience-card-prompts.en.md?raw";
import type { Language } from "./i18n";

export const cardPromptIds = ["01", "02", "03-A", "03-B"] as const;
export type CardPromptId = (typeof cardPromptIds)[number];

function readCardPrompts(markdown: string): Record<CardPromptId, string> {
  const sections = markdown.split(/^## /m).slice(1);
  const parsed = new Map<string, string>();
  for (const section of sections) {
    const lineBreak = section.indexOf("\n");
    if (lineBreak < 0) continue;
    const id = section.slice(0, lineBreak).trim().split(/\s+/)[0];
    parsed.set(id, section.slice(lineBreak + 1).trim());
  }
  for (const id of cardPromptIds) {
    if (!parsed.get(id)) throw new Error(`Missing ${id} in experience-card-prompts.md`);
  }
  return Object.fromEntries(cardPromptIds.map((id) => [id, parsed.get(id)!])) as Record<CardPromptId, string>;
}

export const cardPrompts = readCardPrompts(promptDocument);
const englishCardPrompts = readCardPrompts(promptDocumentEnglish);

export function getCardPrompts(language: Language): Record<CardPromptId, string> {
  return language === "en" ? englishCardPrompts : cardPrompts;
}
