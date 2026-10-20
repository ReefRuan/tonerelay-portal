import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { McpToolsOverview, toolOverviewByLanguage } from "./McpToolsOverview";

describe("inline MCP tool directory", () => {
  it("reuses all 58 approved tools in both languages without changing grouping", () => {
    const names = Object.values(toolOverviewByLanguage).map(overview => {
      expect(overview.count).toBe(58);
      expect(overview.groups.map(group => group.tools.length)).toEqual([32, 24, 2]);
      expect(overview.groups.map(group => group.number)).toEqual(["01", "02", "03"]);
      expect(overview.groups[0].tools[0].name).toBe("trlr_create_episode");
      expect(overview.groups[0].tools.slice(1, 5).map(tool => tool.name)).toEqual([
        "trlr_edit_episode", "trlr_color_patch_measure", "trlr_digital_color_references", "trlr_color_region_compare",
      ]);
      return overview.groups.flatMap(group => group.tools.map(tool => tool.name));
    });
    expect(names[0]).toEqual(names[1]);
    expect(toolOverviewByLanguage.en.groups[0].tools[0].description).toBe("Context & virtual copies");
  });

  it("renders a native open disclosure with text tools rather than a page or image", () => {
    const html = renderToStaticMarkup(<McpToolsOverview />);
    expect(html).toContain('<details class="workflow-tools-overview" open=""><summary');
    expect(html).toContain("MCP 工具一览");
    expect(html.match(/<code>trlr_/g)).toHaveLength(58);
    expect(html).not.toMatch(/<iframe|<img|href=|target=/);
    expect(html).toContain('aria-labelledby="mcp-tools-develop-title"');
    expect(html).toContain('<h3 id="mcp-tools-develop-title">修图参数、版本与回读</h3>');
    expect(html).not.toContain("按使用场景分为三组");
    expect(html).not.toContain("mcp-tools-intro");
    expect(html).not.toMatch(/旧版接口|兼容|Legacy|is-legacy|<small/);
  });
});
