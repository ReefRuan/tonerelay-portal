# ToneRelay 使用说明

## 工具介绍

### 扩展 Agent 操作 Lightroom 的能力。

ToneRelay 是连接 Agent 与 Lightroom Classic 的**本地 MCP 工具套件**。Agent 理解目标、决定下一步；ToneRelay **执行操作、回读真实渲染**，并提供图像预处理、测量与对比。

**Catalog 批量操作** · **真实原彩渲染回读** · **图像测量与对比** · **后台多方案试色**

## 说出目标，看见结果。

像聊天一样告诉 Agent 想要的效果；它借助 ToneRelay 调整 Lightroom、带回照片预览。你看图再说哪里要改，不必自己逐项找滑块。

你还可以在 ToneRelay 画廊挑选 Reef 精心蒸馏的风格与效果包，下载后交给 Agent 加载；画廊会持续更新。

<!-- comparison-content:start -->
```json
{
  "photoAlt": "人物站在薰衣草花田中，示意照片",
  "note": "图片和候选色彩不是 ToneRelay 实测结果；速度与 Token 收益尚未量化",
  "first": {
    "number": "01",
    "label": "对话修图",
    "title": "从想要的画面开始。",
    "description": "说出想要的效果，看看照片，再接着说哪里要改。",
    "beforeLabel": "手动操作",
    "beforeTitle": "逐项调整滑块",
    "beforeFooter": "调整 → 预览 → 再调整",
    "afterLabel": "Agent + ToneRelay",
    "afterTitle": "描述目标，继续对话",
    "afterFooter": "描述 → 执行 → 查看结果",
    "goal": "让人物肤色自然，保留花田的柔和气氛。",
    "reply": "已返回 Lightroom 渲染结果，请看是否符合预期。",
    "followups": [
      "放大看看人物脸部的细节。",
      "把这一版和调整前放在一起比较。",
      "这张图带了什么色彩配置？",
      "背景再柔和一点。"
    ],
    "takeaway": "每次调整都有可查看的实际结果，下一步仍由 Agent 和你决定。",
    "benefits": ["描述目标", "局部查看与对比", "继续细调"]
  },
  "batch": {
    "number": "02",
    "label": "批量操作",
    "title": "一组照片，也能用对话处理。",
    "description": "看图、挑片、整组调整、给单张照片试色，都能一句句交代。",
    "beforeLabel": "逐张查看",
    "beforeTitle": "打开、判断、再切换",
    "beforeFooter": "逐张打开 → 标记 → 反复比较",
    "afterLabel": "Agent + ToneRelay",
    "afterTitle": "从挑片到调整",
    "afterFooter": "看图 → 挑片 → 逐张调整 → 试色",
    "requests": [
      "先给我看看这一组照片。",
      "找出看起来模糊的照片，先给我确认。",
      "把选中的照片统一调暖一点，肤色保持自然。",
      "在选中的这张上，试几种色彩方向。"
    ],
    "selectionNote": "已整理待确认的照片",
    "groupNote": "这一组会逐张调整，完成后分别看效果",
    "versions": ["自然", "暖调", "低饱和"],
    "candidateNote": "同一张照片的候选示意 · 非实测渲染",
    "takeaway": "一组照片也可以分步处理，做完一件，再看结果继续说。",
    "benefits": ["批量看图", "找出模糊照片", "逐张调整", "多方案试色"]
  },
  "computer": {
    "number": "03",
    "label": "两种操作方式",
    "title": "少截图，少来回找按钮。",
    "description": "模仿参考图调色时，Agent 可以观察每轮 Lightroom 渲染，和参考图比较后再调整。",
    "beforeLabel": "Agent 直接操作界面",
    "beforeTitle": "反复看屏幕",
    "beforeFooter": "截图 → 定位 → 点击 → 再截图",
    "afterLabel": "Agent + ToneRelay",
    "afterTitle": "参考图仿色",
    "afterFooter": "参考图 → 首轮渲染 → 观察 → 再调整",
    "steps": ["截图观察", "定位控件", "调整滑块", "再次截图"],
    "request": "参考这张照片，给我的照片调出相近的色调。",
    "referenceLabel": "参考图",
    "sourceLabel": "我的照片",
    "rounds": [
      {
        "label": "首次预览",
        "observation": "先看渲染结果：整体偏暖，背景紫色比参考图更浓。下一轮收一点暖色和饱和度。"
      },
      {
        "label": "调整后预览",
        "observation": "再看一次：肤色更自然，背景也更接近参考图。你来决定是否保留。"
      }
    ],
    "takeaway": "每轮都看实际渲染，再对照参考图决定下一步；比反复截图找滑块更顺畅，也有助于节省时间与 Token。",
    "benefits": ["参考图仿色", "多轮观察", "结果可回读"]
  },
  "previewLabel": "渲染位置示意",
  "imageCredit": "展示照片：Lavender field / PxHere · CC0",
  "imageCreditUrl": "https://pxhere.com/en/photo/192059"
}
```
<!-- comparison-content:end -->
