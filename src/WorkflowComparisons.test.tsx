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

  it("shows conversational editing with real Lightroom and conversation screenshots", () => {
    const html = renderToStaticMarkup(<WorkflowComparisons />);
    const first = html.match(/workflow-figure "[\s\S]*?workflow-figure-batch/)?.[0];

    expect(first).toContain("experience/lr-compare.webp");
    expect(first).toContain("experience/conversation-retouch.webp");
    expect(first).toContain("Lightroom Classic · 修改前 / 修改后");
    expect(first).toContain("Agent 对话 · 说出目标，带回结果");
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

  it("keeps reference matching as copy while its real captures are pending", () => {
    const html = renderToStaticMarkup(<WorkflowComparisons />);
    const pending = html.match(/workflow-figure-computer[\s\S]*?workflow-source/)?.[0];

    expect(pending).toBeDefined();
    expect(pending).toContain("少截图，少来回找按钮。");
    expect(pending).toContain("模仿参考图调色时");
    expect(pending).toContain("参考图仿色");
    expect(pending).toContain("结果可回读");
    expect(pending).toContain("实录截图整理中");
    expect(pending).not.toContain("match-round-image");
    expect(pending).not.toContain("screen-loop");
    expect(pending).not.toContain("workflow-board");
  });
});
