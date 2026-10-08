# ToneRelay 使用说明

ToneRelay 通过本地 Runtime 和 Lightroom Classic 插件执行支持的操作。Agent 解释目标、决定参数并判断图像结果。画廊用于浏览风格方向，当前没有公开模板下载或按编号安装入口。

## 交互示意

<!-- comparison-content:start -->
```json
{
  "eyebrow": "交互示意",
  "title": "从目标到结果。",
  "intro": "同一个目标，两种操作过程。示意照片不代表实测修图结果。",
  "goal": "让人物肤色自然，保留花田的柔和气氛。",
  "photoAlt": "人物站在薰衣草花田中",
  "note": "交互示意 · 展示照片不是 ToneRelay 实测结果",
  "first": {
    "number": "01",
    "label": "操作过程",
    "title": "描述目标，查看结果。",
    "description": "手动调整时逐项选择参数；使用 Agent 时先表达目标，再查看结果并继续调整。",
    "beforeLabel": "Lightroom",
    "beforeTitle": "逐项调整参数",
    "beforeFooter": "调整 → 预览 → 继续调整",
    "afterLabel": "Agent + ToneRelay",
    "afterTitle": "从画面目标开始",
    "afterFooter": "描述 → 查看 → 继续调整",
    "reply": "查看 Lightroom 渲染结果后继续决定。",
    "followup": "背景再柔和一点。",
    "takeaway": "根据照片判断是否继续调整。",
    "benefits": [
      "表达目标",
      "查看实际结果",
      "保留最终选择"
    ]
  },
  "second": {
    "number": "02",
    "label": "Agent 操作方式",
    "title": "通过工具提交明确操作。",
    "description": "界面操作需要观察控件；ToneRelay 提交已支持的操作并回读执行状态。",
    "beforeLabel": "Agent + 界面",
    "beforeTitle": "观察和操作控件",
    "beforeFooter": "截图 → 定位 → 操作 → 检查",
    "afterLabel": "Agent + ToneRelay",
    "afterTitle": "提交与回读",
    "afterFooter": "提交 → 渲染 → 回读",
    "steps": [
      "观察界面",
      "定位控件",
      "调整参数",
      "再次检查"
    ],
    "request": "比较几个明确的色彩方向。",
    "versions": [
      "自然",
      "暖调",
      "低饱和"
    ],
    "status": "候选示意 · 实际能力以安装版本为准",
    "takeaway": "通过执行状态和照片结果继续调整。",
    "benefits": [
      "工具提交",
      "状态回读",
      "结果比较"
    ]
  },
  "previewLabel": "结果预览示意",
  "catalogLabel": "色彩方向示意",
  "imageCredit": "展示照片：Lavender field / PxHere · CC0",
  "imageCreditUrl": "https://pxhere.com/en/photo/192059"
}
```
<!-- comparison-content:end -->
