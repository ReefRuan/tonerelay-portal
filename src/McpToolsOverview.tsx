// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import overviewChinese from "../docs/assets/mcp-tools-overview/tools-list.zh.html?raw";
import overviewEnglish from "../docs/assets/mcp-tools-overview/tools-list.en.html?raw";
import { useLanguage } from "./i18n";
import "./mcp-tools-overview.css";

type Tool = { name: string; description: string; legacy: boolean };
type ToolGroup = { id: string; number: string; title: string; tools: Tool[]; note?: string };

const plainText = (html: string) => html.replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (_, entity: string) => ({
  amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'",
})[entity] ?? entity);

// The approved HTML remains the single tool-name/copy source for the page,
// standalone review files, Markdown exports, and README screenshots.
function readOverview(html: string) {
  const groups: ToolGroup[] = Array.from(html.matchAll(/<section class="tool-group ([^"]+)"[\s\S]*?<\/section>/g), (match) => {
    const section = match[0];
    const title = section.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1];
    const number = section.match(/class="group-number">(\d+)</)?.[1];
    if (!title || !number) throw new Error("An MCP tool group is missing its heading");
    return {
      id: match[1], number, title: plainText(title),
      tools: Array.from(section.matchAll(/<li([^>]*)><code>(trlr_\w+)<\/code><span>([\s\S]*?)<\/span><\/li>/g), (tool) => ({
        name: tool[2], description: plainText(tool[3]), legacy: /class="legacy"/.test(tool[1]),
      })),
      note: section.match(/class="group-note">([^<]+)</)?.[1],
    };
  });
  const intro = html.match(/class="intro">([^<]+)</)?.[1];
  const count = groups.reduce((sum, group) => sum + group.tools.length, 0);
  const expectedCount = Number(html.match(/Lightroom Classic · (\d+) MCP tools/)?.[1]);
  if (!intro || groups.map(group => group.id).join() !== "develop,catalog,image" || count !== expectedCount
    || new Set(groups.flatMap(group => group.tools.map(tool => tool.name))).size !== count) {
    throw new Error("The approved MCP tool directory has incomplete or duplicate entries");
  }
  return { groups, intro: plainText(intro), count };
}

export const toolOverviewByLanguage = { zh: readOverview(overviewChinese), en: readOverview(overviewEnglish) };

function Group({ group }: { group: ToolGroup }) {
  const { t } = useLanguage();
  return <section className={`mcp-tools-group mcp-tools-${group.id}`} aria-labelledby={`mcp-tools-${group.id}-title`}>
    <header className="mcp-tools-group-heading">
      <div><span className="mcp-tools-number">{group.number}</span><h3 id={`mcp-tools-${group.id}-title`}>{group.title}</h3></div>
      <span className="mcp-tools-count">{group.tools.length} tools</span>
    </header>
    <ul className="mcp-tools-list">
      {group.tools.map(tool => <li key={tool.name} className={tool.legacy ? "is-legacy" : undefined}>
        <code>{tool.name}</code><span>{tool.description}{tool.legacy && <small>{t(" · 兼容", " · Legacy")}</small>}</span>
      </li>)}
    </ul>
    {group.note && <p className="mcp-tools-note">{plainText(group.note)}</p>}
  </section>;
}

export function McpToolsOverview() {
  const { language, t } = useLanguage();
  const overview = toolOverviewByLanguage[language];
  return <details className="workflow-tools-overview" open>
    <summary className="workflow-tools-toggle">
      {t("MCP 工具一览", "MCP tool directory")}
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m5 7.5 5 5 5-5" /></svg>
    </summary>
    <div className="mcp-tool-directory">
      <div className="mcp-tools-meta"><strong>TONERELAY</strong><span>Lightroom Classic · {overview.count} MCP tools</span></div>
      <p className="mcp-tools-intro">{overview.intro}</p>
      <div className="mcp-tools-layout">
        <Group group={overview.groups[0]} />
        <div className="mcp-tools-secondary"><Group group={overview.groups[1]} /><Group group={overview.groups[2]} /></div>
      </div>
    </div>
  </details>;
}
