import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { McpToolsOverview, toolOverviewByLanguage } from "./McpToolsOverview";
import toolSnapshot from "../docs/assets/mcp-tools-overview/tools-snapshot.json";

describe("inline MCP tool directory", () => {
  it("matches the published 0.7.0 registry in both languages without changing grouping", () => {
    expect(toolSnapshot.version).toBe("0.7.0");
    expect(toolSnapshot.commit).toMatch(/^[a-f0-9]{40}$/);
    expect(new Set(toolSnapshot.tools).size).toBe(52);
    const names = Object.values(toolOverviewByLanguage).map(overview => {
      expect(overview.count).toBe(toolSnapshot.tools.length);
      expect(overview.groups.map(group => group.tools.length)).toEqual([25, 25, 2]);
      expect(overview.groups.map(group => group.number)).toEqual(["01", "02", "03"]);
      expect(overview.groups[0].tools[0].name).toBe("trlr_create_episode");
      expect(overview.groups[0].tools.slice(1, 5).map(tool => tool.name)).toEqual([
        "trlr_edit_episode", "trlr_color_patch_measure", "trlr_digital_color_references", "trlr_color_region_compare",
      ]);
      const toolNames = overview.groups.flatMap(group => group.tools.map(tool => tool.name));
      expect(new Set(toolNames).size).toBe(toolNames.length);
      expect([...toolNames].sort()).toEqual([...toolSnapshot.tools].sort());
      return toolNames;
    });
    expect(names[0]).toEqual(names[1]);
    expect(toolOverviewByLanguage.en.groups[0].tools[0].description).toBe("Context & virtual copies");
  });

  it("places current observation and replay tools in Develop and local imports in Catalog", () => {
    for (const overview of Object.values(toolOverviewByLanguage)) {
      const develop = overview.groups[0].tools.map(tool => tool.name);
      const catalog = overview.groups[1].tools.map(tool => tool.name);
      expect(develop).toEqual(expect.arrayContaining([
        "trlr_get_photo_settings", "trlr_episode_diff", "trlr_replay_episode",
      ]));
      expect(catalog).toContain("trlr_import_photos");
    }
  });

  it("renders a native open disclosure with text tools rather than a page or image", () => {
    const html = renderToStaticMarkup(<McpToolsOverview />);
    expect(html).toContain('<details class="workflow-tools-overview" open=""><summary');
    expect(html).toContain("MCP 工具一览");
    expect(html.match(/<code>trlr_/g)).toHaveLength(toolSnapshot.tools.length);
    expect(html).not.toMatch(/<iframe|<img|href=|target=/);
    expect(html).toContain('aria-labelledby="mcp-tools-develop-title"');
    expect(html).toContain('<h3 id="mcp-tools-develop-title">修图参数、版本与回读</h3>');
    expect(html).not.toContain("按使用场景分为三组");
    expect(html).not.toContain("mcp-tools-intro");
    expect(html).not.toContain("mcp-tools-note");
    expect(html).not.toContain("XMP 原片写入需明确授权");
    expect(html).not.toMatch(/旧版接口|兼容|Legacy|is-legacy|<small/);
    for (const retired of [
      "trlr_create_session", "trlr_get_session", "trlr_apply_settings", "trlr_get_preview",
      "trlr_get_xmp", "trlr_reset", "trlr_get_full_settings", "trlr_round_diff",
      "trlr_replay_round", "trlr_export_session_context",
    ]) {
      expect(html).not.toContain(`<code>${retired}</code>`);
    }
  });

  it("keeps both language directories free of the removed group disclaimer", () => {
    for (const overview of Object.values(toolOverviewByLanguage)) {
      expect(overview.groups.every(group => group.note === undefined)).toBe(true);
    }
  });
});
