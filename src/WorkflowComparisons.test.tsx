import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { WorkflowComparisons } from "./WorkflowComparisons";

describe("workflow examples", () => {
  it("uses the article introduction to explain conversational editing without an eyebrow", () => {
    const html = renderToStaticMarkup(<WorkflowComparisons />);
    const heading = html.match(/<header class="experience-section-heading">[\s\S]*?<\/header>/)?.[0];

    expect(heading).toContain("说出目标，看见结果。");
    expect(heading).toContain("像聊天一样告诉 Agent 想要的效果");
    expect(heading).toContain("不必自己逐项找滑块");
    expect(heading).toContain("Reef 精心蒸馏的风格与效果包");
    expect(heading).toContain("画廊会持续更新");
    expect(heading).not.toContain("交互示意");
  });

  it("lists typical-usage prompts right after the workflow introduction", () => {
    const html = renderToStaticMarkup(<WorkflowComparisons />);
    const gallery = html.indexOf("画廊会持续更新");
    const sceneEntries = html.indexOf("典型用法 · 可以这样对 Agent 说");
    const firstFigure = html.indexOf("workflow-figure ");

    expect(gallery).toBeGreaterThan(-1);
    expect(sceneEntries).toBeGreaterThan(gallery);
    expect(firstFigure).toBeGreaterThan(sceneEntries);
    expect(html).toContain("连接lr，我看看当前目录");
    expect(html).toContain("给这个lr目录的照片评分。模糊/意义不明的照片标排除");
    expect(html).toContain("使用这些参考图，对目录每一张图片调色，每一张图片都要选择合适的参考图");
    expect(html).toContain("继续修改，突出/调整风格/影调/还原肤色等，看看前后对比");
    expect(html).toContain("仿色与精调");
  });

  it("shows conversational editing with real Lightroom and conversation screenshots", () => {
    const html = renderToStaticMarkup(<WorkflowComparisons />);
    const first = html.match(/workflow-figure "[\s\S]*?workflow-figure-batch/)?.[0];

    expect(first).toContain("experience/lr-develop-sliders.webp");
    expect(first).toContain("experience/conversation-refine.webp");
    expect(first).toContain("Lightroom Classic · 逐项调整滑块");
    expect(first).toContain("Agent 对话 · 说出目标，接着说再改");
    expect(first).toContain("接着说");
    expect(first).toContain("放大看看局部细节。");
    expect(first).toContain("把这一版和调整前放在一起比较。");
    expect(first).toContain("背景再柔和一点。");
    expect(first).not.toContain("study-message");
  });

  it("shows batch work with real browsing and rating screenshots", () => {
    const html = renderToStaticMarkup(<WorkflowComparisons />);
    const batch = html.match(/workflow-figure-batch[\s\S]*?workflow-figure-computer/)?.[0];

    expect(batch).toBeDefined();
    expect(batch).toContain("experience/lr-loupe.webp");
    expect(batch).toContain("experience/conversation-rating.webp");
    expect(batch).toContain("Lightroom Classic · 逐张浏览");
    expect(batch).toContain("Agent 对话 · 整组评分，写回目录");
    expect(batch).not.toContain("batch-thumb");
  });

  it("shows reference matching with the real color-match conversation capture", () => {
    const html = renderToStaticMarkup(<WorkflowComparisons />);
    const computer = html.match(/workflow-figure-computer[\s\S]*?workflow-source/)?.[0];

    expect(computer).toBeDefined();
    expect(computer).toContain("少截图，少来回找按钮。");
    expect(computer).toContain("模仿参考图调色时");
    expect(computer).toContain("参考图仿色");
    expect(computer).toContain("结果可回读");
    expect(computer).toContain("experience/conversation-color-match.webp");
    expect(computer).toContain("Agent 对话 · 参考图仿色，逐张回读");
    expect(computer).toContain("workflow-board-solo");
    expect(computer).toContain("workflow-contrast");
    expect(computer).toContain("Agent 直接操作界面 · 反复看屏幕");
    expect(computer).toContain("截图 → 定位 → 点击 → 再截图");
    expect(computer).toContain("参考图 → 逐张匹配 → 渲染回读");
    expect(computer).not.toContain("实录截图整理中");
    expect(computer).not.toContain("match-round-image");
    expect(computer).not.toContain("screen-loop");
  });
});
