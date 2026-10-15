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

  it("shows reference matching as two observe-and-adjust rounds", () => {
    const html = renderToStaticMarkup(<WorkflowComparisons />);
    const matching = html.match(/workflow-figure-computer[\s\S]*?workflow-source/)?.[0];

    expect(matching).toContain("参考这张照片，给我的照片调出相近的色调。");
    expect(matching).toContain("参考图");
    expect(matching).toContain("我的照片");
    expect(matching).toContain("首次预览");
    expect(matching).toContain("调整后预览");
    expect(matching).toContain("参考图仿色");
    expect(matching?.match(/class="study-message study-message-agent match-round/g)).toHaveLength(2);
    expect(matching?.match(/class="match-round-image"/g)).toHaveLength(2);
  });
});
