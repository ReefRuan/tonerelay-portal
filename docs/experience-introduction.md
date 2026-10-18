# ToneRelay 使用说明

## 工具介绍

### 扩展 Agent 操作 Lightroom 的能力。

ToneRelay 是连接 Agent 与 Lightroom Classic 的**本地 MCP 工具套件**。Agent 理解目标、决定下一步；ToneRelay **执行操作、回读真实渲染**，并提供批量执行、图像预处理、测量与对比、后台多方案试色。

**相比 computer use 直接操作界面** · **省去截图、视觉定位和逐步确认** · **直接操作 Catalog、内存回读** · **更快、更省 Token**

## 说出目标，看见结果。

像聊天一样告诉 Agent 想要的效果；它借助 ToneRelay 调整 Lightroom、带回照片预览。你看图再说哪里要改，不必自己逐项找滑块。

你还可以在 ToneRelay 画廊挑选 Reef 精心蒸馏的风格与效果包，下载后交给 Agent 加载；画廊会持续更新。

<!-- comparison-content:start -->
```json
{
  "note": "三组均为实际工作流截图，照片来自作者的 Lightroom 目录。速度与 Token 收益尚未量化。",
  "sceneEntries": [
    {
      "no": "01",
      "name": "看目录",
      "desc": "一句话连接 LR，总览当前目录与选片",
      "prompts": ["连接lr，我看看当前目录"]
    },
    {
      "no": "02",
      "name": "评分排废片",
      "desc": "整组逐张评分、打星标旗，结果写回目录",
      "prompts": ["给这个lr目录的照片评分。模糊/意义不明的照片标排除"]
    },
    {
      "no": "03",
      "name": "仿色与精调",
      "desc": "甩参考图逐张仿色，接着说「再突出光斑」",
      "prompts": [
        "使用这些参考图，对目录每一张图片调色，每一张图片都要选择合适的参考图",
        "继续修改，突出/调整风格/影调/还原肤色等，看看前后对比"
      ]
    }
  ],
  "shots": {
    "sliders": {
      "alt": "Lightroom Classic 修改照片模块：右侧参数面板布满滑块，一个大光标停在曝光度滑块上",
      "caption": "Lightroom Classic · 逐项调整滑块"
    },
    "refine": {
      "alt": "Agent 对话截图：说出修图目标并拿到第一版结果后，接着说「感觉暗部太黑了，提亮，注意色调」，Agent 再带回调整后的版本",
      "caption": "Agent 对话 · 说出目标，接着说再改"
    },
    "loupe": {
      "alt": "Lightroom Classic 放大视图与底部胶片网格，逐张浏览照片",
      "caption": "Lightroom Classic · 逐张浏览"
    },
    "rating": {
      "alt": "Agent 对话截图：对整组照片逐张评分，返回星级分布并写回目录",
      "caption": "Agent 对话 · 整组评分，写回目录"
    },
    "color": {
      "alt": "Agent 对话截图：用户给出 9 张参考图与修图目标，Agent 按每张照片的光线分别选择参考图，完成 14 张浓郁风格修图并逐张带回渲染预览",
      "caption": "Agent 对话 · 参考图仿色，逐张回读"
    },
    "mask": {
      "alt": "Agent 对话截图：用户说「这张图曝光不对，蒙版恢复人物曝光和整体曝光」，Agent 返回整体曝光 +0.35 EV、高光 −55、阴影 +30 与人物蒙版提亮，并给出原图与曝光修正版的并排对比",
      "caption": "Agent 对话 · 曝光不对，蒙版自己建"
    }
  },
  "first": {
    "number": "01",
    "label": "对话修图",
    "title": "从想要的画面开始。",
    "description": "说出想要的效果，看看照片，再接着说哪里要改。",
    "beforeLabel": "手动操作",
    "beforeTitle": "逐项调整，反复预览",
    "beforeFooter": "调整 → 预览 → 再调整",
    "afterLabel": "Agent + ToneRelay",
    "afterTitle": "描述目标，Agent 帮你后台处理",
    "afterFooter": "找出合适参考图，修改当前图片",
    "followups": [
      "放大看看局部细节。",
      "把这一版和调整前放在一起比较。",
      "背景再柔和一点。"
    ],
    "takeaway": "每次调整都有可查看的实际结果，下一步仍由 Agent 和你决定。",
    "benefits": ["描述目标", "局部查看与对比", "继续细调"]
  },
  "batch": {
    "number": "02",
    "label": "批量操作",
    "title": "一组照片，也能用对话处理。",
    "description": "看图、挑片、逐张评分，都能一句句交代。",
    "beforeLabel": "逐张查看",
    "beforeTitle": "打开、判断、再切换",
    "beforeFooter": "逐张打开 → 标记 → 反复比较",
    "afterLabel": "Agent + ToneRelay",
    "afterTitle": "看图、评分、写回目录",
    "afterFooter": "给这个lr目录的照片评分。模糊/意义不明的照片标排除",
    "takeaway": "一组照片也可以分步处理：先看，再评分，结果写回 Lightroom 再接着说。",
    "benefits": ["批量看图", "按意义评分", "写回目录"]
  },
  "computer": {
    "number": "03",
    "label": "两类活",
    "title": "后台做完，你只看结果。",
    "description": "曝光不对、参考图仿色，这两类活它都能自己拆开做：先改，再回读，确认了才存。",
    "beforeLabel": "人物蒙版",
    "beforeTitle": "曝光不对，一句话修回来",
    "beforeFooter": "这张图曝光不对，蒙版恢复人物曝光和整体曝光",
    "afterLabel": "参考图仿色",
    "afterTitle": "9 张参考图，逐张挑",
    "afterFooter": "使用这些参考图，考虑光影，进行浓郁风格修图",
    "takeaway": "两段都是实录：一句话，一个完整结果——参数、蒙版、虚拟副本都留在 Lightroom 里。",
    "benefits": ["人物蒙版", "参考图仿色", "结果可回读"]
  }
}
```
<!-- comparison-content:end -->
