import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { WorkflowComparisons } from "./WorkflowComparisons";
import { cardPrompts } from "./cardPrompts";

describe("workflow examples", () => {
  it("keeps gallery information under the section heading and explains editing only in the first card", () => {
    const html = renderToStaticMarkup(<WorkflowComparisons />);
    const heading = html.match(/<header class="experience-section-heading">[\s\S]*?<\/header>/)?.[0];

    expect(heading).toContain("说出目标，看见结果。");
    expect(heading).not.toContain("告诉 Agent 你想要什么效果");
    expect(heading).not.toContain("不必自己逐项找滑块");
    expect(heading).toContain("Reef 制作的风格与效果包");
    expect(heading).toContain("画廊会持续更新");
    expect(heading).not.toContain("交互示意");
    expect(html.match(/告诉 Agent 你想要什么效果/g)).toHaveLength(1);
    expect(html).not.toContain("说出想要的效果，看看照片，再接着说哪里要改。");
  });

  it("shows a real example before the typical-usage prompts", () => {
    const html = renderToStaticMarkup(<WorkflowComparisons />);
    const gallery = html.indexOf("画廊会持续更新");
    const sceneEntries = html.indexOf("试着这样说");
    const firstFigure = html.indexOf("workflow-figure ");

    expect(gallery).toBeGreaterThan(-1);
    expect(firstFigure).toBeGreaterThan(gallery);
    expect(sceneEntries).toBeGreaterThan(firstFigure);
    expect(html).toContain("查看当前 Lightroom 目录信息和我当前选择的照片");
    expect(html).not.toContain("连接完成后，看看当前目录里有哪些照片");
    expect(html).not.toContain("看看当前 Lightroom 目录里有哪些照片。");
    expect(html).not.toContain('<span class="scene-desc"></span>');
    expect(html).toContain("请逐张看这组照片，按清晰度和内容打星");
    expect(html).toContain("参考这些照片的颜色，给这组照片逐张调色");
    expect(html).toContain("暗部有点重，提亮一点，肤色别偏黄");
    expect(html).toContain("仿色与精调");
  });

  it("shows conversational editing with real Lightroom and conversation screenshots", () => {
    const html = renderToStaticMarkup(<WorkflowComparisons />);
    const first = html.match(/workflow-figure "[\s\S]*?workflow-figure-batch/)?.[0];

    expect(first).toContain("experience/lr-develop-mountain.webp");
    expect(first).toContain("experience/lr-develop-masks.webp");
    expect(first).toContain("experience/lr-develop-landscape.webp");
    expect(first).toContain("experience/conversation-refine-tight.webp");
    expect(first).toContain("Lightroom Classic · 逐项调整滑块");
    expect(first).toContain("看过第一版，接着说哪里要改");
    expect(first).not.toContain("study-message");
  });

  it("offers compact copy controls with separate prompts for the two tasks in card 03", () => {
    const html = renderToStaticMarkup(<WorkflowComparisons onCopyPrompt={async () => true} />);
    expect(html.match(/class="workflow-prompt-trigger"/g)).toHaveLength(3);
    expect(html).toContain("复制对话修图提问");
    expect(html).toContain("复制批量选片提问");
    expect(html).toContain("<summary class=\"workflow-prompt-trigger\">复制提问</summary>");
    expect(html).toMatch(/<div class="workflow-description-row"><p>告诉 Agent 你想要什么效果。它借助 ToneRelay 调整 Lightroom，再把照片带回来。你看图再说哪里要改，不必自己逐项找滑块。<\/p><button class="workflow-prompt-trigger"/);
    expect(html).not.toContain("workflow-caption-top");
    expect(html).toContain("主体蒙版细调");
    expect(html).toContain("参考图调色");
    expect(cardPrompts["01"]).toContain("我看图后");
    expect(cardPrompts["02"]).toContain("不要覆盖已有标记");
    expect(cardPrompts["03-A"]).toContain("主体蒙版");
    expect(cardPrompts["03-B"]).toContain("不要把一套参数直接套给所有照片");
    for (const prompt of Object.values(cardPrompts)) {
      expect(prompt.startsWith("请") || prompt.startsWith("我会")).toBe(true);
      expect(prompt).not.toContain("## ");
    }
  });

  it("shows batch work with real browsing and rating screenshots", () => {
    const html = renderToStaticMarkup(<WorkflowComparisons />);
    const batch = html.match(/workflow-figure-batch[\s\S]*?workflow-figure-computer/)?.[0];

    expect(batch).toBeDefined();
    expect(batch).toContain("experience/lr-library-grid.webp");
    expect(batch).toContain("experience/lr-library-compare.webp");
    expect(batch).toContain("experience/lr-library-loupe.webp");
    expect(batch).toContain("experience/conversation-rating-tight.webp");
    expect(batch).toContain("Lightroom Classic · 逐张浏览");
    expect(batch).toContain("Agent 逐张评分，标记写回 Lightroom");
    expect(batch).toContain("读取 Lightroom 快速预览，缓存可用时复用");
    expect(batch).toContain("Agent 可导出 JPEG 并放进对话");
    expect(batch).not.toContain("batch-thumb");
  });

  it("places the expanded in-page MCP tool directory before the batch chapter", () => {
    const html = renderToStaticMarkup(<WorkflowComparisons onCopyPrompt={async () => true} />);
    const batch = html.match(/workflow-figure-batch[\s\S]*?workflow-figure-computer/)?.[0];

    expect(html.match(/class="workflow-tools-overview"/g)).toHaveLength(1);
    expect(html).toContain('<details class="workflow-tools-overview" open=""><summary class="workflow-tools-toggle">MCP 工具一览');
    const overview = html.indexOf('class="workflow-tools-overview"');
    expect(overview).toBeGreaterThan(html.indexOf('class="workflow-scene-entries"'));
    expect(overview).toBeLessThan(html.indexOf('workflow-figure-batch'));
    expect(batch).not.toContain("workflow-tools-overview");
    expect(batch).not.toContain("tools-list.zh.html");
    expect(batch).not.toContain("<iframe");
    expect(batch).toContain("复制批量选片提问");
  });

  it("shows mask repair and reference matching with real captures", () => {
    const html = renderToStaticMarkup(<WorkflowComparisons />);
    const computer = html.match(/workflow-figure-computer[\s\S]*?workflow-source/)?.[0];

    expect(computer).toBeDefined();
    expect(computer).toContain("从局部蒙版，到整组调色。");
    expect(computer).toContain("调色滑块和主体蒙版");
    expect(computer).toContain("主体蒙版");
    expect(computer).toContain("experience/conversation-mask.webp");
    expect(computer).toContain("全局与主体蒙版调整，前后对比");
    expect(computer).toContain("全局参数与主体蒙版配合，查看前后对比");
    expect(computer).toContain("参考图仿色");
    expect(computer).toContain("还可以接着说");
    expect(computer).toContain("experience/conversation-color-match.webp");
    expect(computer).toContain("参考图调色，逐张查看结果");
    expect(computer).toContain("按光线选参考，实际渲染预览带回对话");
    expect(computer).not.toContain("workflow-board-solo");
    expect(computer).not.toContain("workflow-contrast");
    expect(computer).not.toContain("实录截图整理中");
    expect(computer).not.toContain("match-round-image");
    expect(computer).not.toContain("screen-loop");
  });
});
