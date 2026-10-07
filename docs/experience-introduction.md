# ToneRelay 使用说明

ToneRelay 通过本地 Runtime 和 Lightroom Classic 插件执行支持的操作。Agent 解释目标、决定参数并判断图像结果。画廊用于浏览风格方向，当前没有公开模板下载或按编号安装入口。

## 常见问题

### 如何描述目标？

可以使用日常语言，如“保留暖色，让人物肤色自然”。先查看结果，再决定下一步。

### 工具会自动决定哪张最好吗？

图像测量和对比提供事实与差异，最终选择由你和 Agent 判断。

### 现在可以公开一键安装吗？

当前尚未验证可供公众访问的固定官方发行物。安装提示词先核对来源、权限和版本；没有可验证来源时保留未就绪状态。本机开发源码需要你明确指定并授权。

### 画廊中的模板可以下载吗？

当前没有公开下载或按编号安装入口。展示编号不能当作已发布的预设包。

### 安装为什么还需要真人授权？

普通安装步骤应沿用授权连续完成；登录、系统密码或工具要求本人确认时，Agent 会说明具体动作、原因和最小操作，并保存断点。

### 怎样验证安装和卸载？

逐层核对实际组件，并在真实新客户端会话检查工具发现和只读连接。无法创建或观察新会话时提供可复制请求并标记待验证。

### 卸载后会重装吗？

只要求卸载时不重装。明确要求干净重装后，在同一任务完成卸载、新会话检查、安装和另一个新会话验证。

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
