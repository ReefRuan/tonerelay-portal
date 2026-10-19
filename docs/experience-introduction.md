# ToneRelay 使用说明

## 工具介绍

### 扩展 Agent 操作 Lightroom 的能力

ToneRelay 是连接 Agent 和 Lightroom Classic 的**本地 MCP 工具**。Agent 理解你的要求、决定怎么调；ToneRelay 通过 Lightroom 插件执行，并带回调整后的照片。

**50+ MCP 工具** · **批量操作** · **主体蒙版** · **XMP 显影参数透传与回读** · **真实渲染预览** · **图像测量与对比**

相比让 Agent 对着 Lightroom 截图找按钮，ToneRelay 少走反复截图、找控件和逐项点击的步骤，还能读回实际调整与渲染图。

## 说出目标，看见结果。

画廊里还有 Reef 制作的风格与效果包。挑一个下载，把说明和参考图交给 Agent 使用；画廊会持续更新。

<!-- comparison-content:start -->
```json
{
  "note": "图片来自作者的实际操作记录；尚未进行速度或 Token 的对照测试。",
  "sceneEntries": [
    {
      "no": "01",
      "name": "看目录",
      "desc": "连接完成后，看看当前目录里有哪些照片",
      "prompts": ["看看当前 Lightroom 目录里有哪些照片。"]
    },
    {
      "no": "02",
      "name": "选片与标记",
      "desc": "让 Agent 逐张看图，按你的标准打星或标旗",
      "prompts": ["请逐张看这组照片，按清晰度和内容打星；明显模糊的先标为排除。"]
    },
    {
      "no": "03",
      "name": "仿色与精调",
      "desc": "给 Agent 几张参考图，逐张试色；看过结果还能继续细调",
      "prompts": [
        "参考这些照片的颜色，给这组照片逐张调色；每张选最合适的参考。",
        "暗部有点重，提亮一点，肤色别偏黄。再给我看前后对比。"
      ]
    }
  ],
  "shots": {
    "sliders": {
      "alt": "Lightroom Classic 显影界面中的山景照片与右侧调色滑块",
      "caption": "Lightroom Classic · 逐项调整滑块"
    },
    "masks": {
      "alt": "Lightroom Classic 中的山景照片与蒙版调整面板",
      "caption": "切换蒙版，调整局部"
    },
    "landscape": {
      "alt": "Lightroom Classic 中的草地风景照片与显影参数面板",
      "caption": "换一张照片，继续调整"
    },
    "refine": {
      "alt": "Agent 对话截图：用户看过第一版后要求提亮过黑的暗部并留意色调，Agent 带回第二版结果",
      "caption": "看过第一版，接着说哪里要改"
    },
    "loupe": {
      "alt": "Lightroom Classic 放大视图与底部胶片网格，逐张浏览照片",
      "caption": "Lightroom Classic · 逐张浏览"
    },
    "grid": {
      "alt": "Lightroom Classic 目录网格中同一组人像照片的缩略图",
      "caption": "查看整组照片"
    },
    "compare": {
      "alt": "Lightroom Classic 比较视图中并排显示两张人像照片",
      "caption": "并排比较，决定保留哪张"
    },
    "rating": {
      "alt": "Agent 对话截图：对整组照片逐张评分，返回星级分布并写回目录",
      "caption": "Agent 逐张评分，标记写回 Lightroom"
    },
    "color": {
      "alt": "Agent 对话截图：用户给出 9 张参考图与修图目标，Agent 按每张照片的光线分别选择参考图，完成 14 张浓郁风格修图并逐张带回渲染预览",
      "caption": "参考图调色，逐张查看结果"
    },
    "mask": {
      "alt": "Agent 对话截图：用户要求分别调整人物与整体画面，Agent 使用全局参数和主体蒙版，返回原图与虚拟副本对比及实际参数回读",
      "caption": "全局与主体蒙版调整，前后对比"
    }
  },
  "first": {
    "number": "01",
    "label": "对话修图",
    "title": "从想要的画面开始。",
    "description": "告诉 Agent 你想要什么效果。它借助 ToneRelay 调整 Lightroom，再把照片带回来。你看图再说哪里要改，不必自己逐项找滑块。",
    "beforeLabel": "手动操作",
    "beforeTitle": "逐项调整，反复预览",
    "beforeFooter": "调整 → 预览 → 再调整",
    "afterLabel": "Agent + ToneRelay",
    "afterTitle": "说出目标，看过结果再改",
    "afterFooter": "找出合适参考图，修改当前图片",
    "takeaway": "每轮都能看调整后的照片；看过以后，再告诉 Agent 下一步怎么改。",
    "benefits": ["描述目标", "局部查看与对比", "继续细调"]
  },
  "batch": {
    "number": "02",
    "label": "批量操作",
    "title": "一组照片，也能用对话处理。",
    "description": "让 Agent 逐张看图，再按你的标准打星或标旗。",
    "beforeLabel": "逐张查看",
    "beforeTitle": "打开、判断、再切换",
    "beforeFooter": "逐张打开 → 标记 → 反复比较",
    "afterLabel": "Agent + ToneRelay",
    "afterTitle": "逐张看图，标记留在 Lightroom",
    "afterFooter": "读取 Lightroom 快速预览，缓存可用时复用",
    "takeaway": "需要大图时，Agent 可导出 JPEG 并放进对话；评分与标旗写回 Lightroom。",
    "benefits": ["逐张看图", "按你的标准标记", "写回 Lightroom"]
  },
  "computer": {
    "number": "03",
    "label": "实际例子",
    "title": "从局部蒙版，到整组调色。",
    "description": "Agent 可以借助 ToneRelay 使用 Lightroom 的调色滑块和主体蒙版，分别调整整体与人物。看过渲染预览，你还能继续说哪个细节要改；给它参考图，也能逐张为一组照片调色。",
    "beforeLabel": "主体蒙版",
    "beforeTitle": "人物与整体，分别调整",
    "beforeFooter": "全局参数与主体蒙版配合，查看前后对比",
    "afterLabel": "参考图仿色",
    "afterTitle": "9 张参考图，按画面分别挑",
    "afterFooter": "按光线选参考，实际渲染预览带回对话",
    "takeaway": "这两段来自实际操作。调整保存在 Lightroom 虚拟副本中；看过预览，你还可以继续指出细节。",
    "benefits": ["全局与蒙版配合", "逐张参考图调色", "对话继续细调"],
    "followups": ["人物亮度可以了，整体高光再收一点。"]
  }
}
```
<!-- comparison-content:end -->
