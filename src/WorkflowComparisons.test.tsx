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

  it("shows local inspection and before-after comparison as separate requests", () => {
    const html = renderToStaticMarkup(<WorkflowComparisons />);
    const conversation = html.match(/workflow-figure ".*?workflow-figure-batch/s)?.[0];

    expect(conversation?.match(/class="study-message study-message-user/g)).toHaveLength(5);
    expect(conversation).toContain("放大看看人物脸部的细节。");
    expect(conversation).toContain("把这一版和调整前放在一起比较。");
    expect(conversation).toContain("这张图带了什么色彩配置？");
    expect(conversation).toContain("背景再柔和一点。");
  });

  it("shows batch requests as four separate chat bubbles", () => {
    const html = renderToStaticMarkup(<WorkflowComparisons />);
    const batch = html.match(/workflow-figure-batch[\s\S]*?workflow-figure-computer/)?.[0];

    expect(batch).toBeDefined();
    expect(batch?.match(/class="study-message study-message-user"/g)).toHaveLength(4);
    expect(batch).toContain("先给我看看这一组照片。");
    expect(batch).toContain("找出看起来模糊的照片");
    expect(batch).toContain("把选中的照片统一调暖一点");
    expect(batch).toContain("在选中的这张上，试几种色彩方向。");
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
