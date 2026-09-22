# ToneRelay Portal「立即体验」页面设计提示词

状态：设计基线，供当前 Portal 页面实现和后续视觉迭代使用。

## 1. 页面目标

这是一个视觉优先的产品落地页，不是长篇博客。

页面需要在很短时间内完成三件事：

1. 让已经有 Agent 的用户直接复制安装提示词。
2. 让没有 Agent 的用户知道 Agent 是什么，并能先安装 WorkBuddy。
3. 用图解说明 ToneRelay 为什么比「只给模型一张图、让它猜参数」更可靠。

首屏不承担完整教育任务。主要转化动作是「复制安装提示词」，次要动作是「去 GitHub 点 Star」。

## 2. 事实来源与表达边界

页面产品口径来自 Studio 现有文章：

- `docs/publishing/blog/posts/timeout-is-not-failure/index.md`
- `docs/publishing/blog/posts/measure-images-for-language-model-editing/index.md`

必须遵守以下边界：

- 可以说多个 Agent 能并行观察、测量、规划。
- 必须说明 Lightroom 写操作经持久队列串行执行；不能宣称 Lightroom SDK 并行写入。
- 可以说参数候选可作为后台任务生成，并由 Agent 查询状态。
- 可以说结构化 Measure 结果减少反复把整张图放入上下文，并让报告大小与计算量更稳定。
- 不写未经测量的节省百分比、绝对耗时或性能倍数。
- 「真实预览」指基于 Lightroom 渲染结果进行观察和比较，而不是只看参数名称想象效果。
- Measure 是传感器和结构化证据，不是审美模型。
- 当前安装资料未正式发布时，提示词应明确安全停止，不能编造安装命令。

## 3. 信息架构

### 3.1 Agent 支持条（页面顶部，约 20vh）

正常内容宽度，视觉存在感克制，高度不超过桌面视口的约 20%。

内容：

- 标题：`把 ToneRelay 交给你正在使用的 Agent`
- 支持对象：Codex、WorkBuddy、OpenClaw，以及「其他 MCP Agent」
- 每个对象使用图标/字标卡片。第一版可以用品牌缩写占位，发布前再替换为授权的官方图标。
- 右侧提供文字按钮：`这是什么？`

点击「这是什么？」打开无 Agent 说明弹窗，不跳离当前页面。

弹窗内容：

- 标题：`还没有 Agent？先装一个。`
- 简短解释：Agent 能阅读安装文档、调用本机工具并验证结果；它不是普通聊天框。
- 三步：安装 WorkBuddy → 登录并选择/配置模型 → 回到本页复制 ToneRelay 安装提示词。
- 主按钮：`下载 WorkBuddy`
- 官方入口：`https://www.workbuddy.cn/work/`
- 辅助链接：WorkBuddy 模型配置文档、MCP 文档。

弹窗必须支持关闭按钮、点击遮罩关闭、Esc 关闭、焦点可见、`role="dialog"` 与 `aria-modal="true"`。

### 3.2 主行动区

紧接 Agent 支持条，保持非常清楚：

- 主按钮：`复制安装提示词`
- 次按钮：`去 GitHub 点 Star`
- GitHub 目标：`https://github.com/ReefRuan/tonerelay-lightroom-mcp`
- 一行低调状态说明：当前为分发流程预览；若正式安装文档尚未发布，Agent 会安全停止。

### 3.3 功能图解

采用四张视觉卡片，图片面积大于文字面积。每张只保留标题、1 句解释和 1 条边界说明。

1. **看见真实预览**
   - 说明：让 Agent 观察 Lightroom 实际渲染结果，再继续判断。
   - 边界：预览是证据，不用参数名代替画面。
   - 占位图：`feature-real-preview.webp`，建议 4:3。

2. **多 Agent，单执行队列**
   - 说明：多个 Agent 可以同时分析，Lightroom 写操作按顺序安全落地。
   - 边界：并行的是观察与规划，不是 Lightroom 副作用。
   - 占位图：`feature-agent-queue.webp`，建议 4:3。

3. **候选方案放到后台跑**
   - 说明：参数变体先进入后台任务，Agent 查询状态后再比较结果。
   - 边界：页面不要假装所有 Lightroom 命令同时执行。
   - 占位图：`feature-background-variants.webp`，建议 4:3。

4. **少占上下文，少走回头路**
   - 说明：Measure 把像素变成标量、分布、8×8 矩阵和局部采样，让上下文更稳定，并减少不必要的 Lightroom 往返。
   - 边界：直接说明 token / 时间效率来自少重复传图、少无效尝试，但不承诺未经实测的节省比例。
   - 占位图：`feature-measure-json.webp`，建议 4:3。

### 3.4 使用 / 不使用 ToneRelay 对比

这是页面最重要的横向图解之一。

- 左侧：`不使用`——参考图、参数猜测、窗口操作与结果验证混在一起，容易丢失上下文。
- 右侧：`使用 ToneRelay`——风格上下文 → 明确参数 → 持久队列 → Lightroom 预览 → Measure / Compare → 再决策。
- 两侧各有 16:10 占位图：`compare-without.webp`、`compare-with.webp`。
- 文案不要把对比写成贬低用户，只解释流程差异。

### 3.5 设计理念、开源承诺与使用场景

三列短卡片，避免长段落。

设计理念：

- 先看证据，再改参数。
- 把审美判断和确定性执行分开。
- 用户选择风格；Runtime 不暗中推荐。
- 原片优先，编辑落在 Lightroom 虚拟副本。

开源承诺：

- 源码、安装文档与分发协议公开可审查。
- 官方 Git 仓库与允许的镜像是权威分发入口。
- 模板按需下载，不把整座模板仓库塞进 Runtime 安装包。
- 不写尚未确定的许可证承诺；不把「开源」延伸成未实现的服务保证。

使用场景：

- 对照参考风格编辑单张照片。
- 批量生成候选并比较。
- 多个 Agent 共用一个 Lightroom 实例。
- 长时间后台实验与恢复。
- 用结构化报告复盘一次调色。

### 3.6 完整安装提示词

页面靠后放完整、可复制的等宽文本框。它是给 Agent 读的，因此应保留准确的仓库、顺序、成功条件和安全停止条件，不压缩成营销语言。

### 3.7 FAQ

FAQ 是页面最后一个主体区块，同时面向人和 Agent。回答应包含可执行判断，不使用含糊的「重试看看」。至少覆盖：

- 会安装什么。
- 为什么博客只放稳定提示词。
- 安装成功的判定。
- GitHub 访问不稳定时如何使用官方镜像。
- 模板是否让 Runtime 发行包变大。
- 模板与 Lightroom 预设的区别。
- 照片和 Catalog 是否上传。
- 安装失败时应保留哪些证据。

## 4. 页面视觉规则

- 延续 Portal 当前的纸张、网格、蓝色标记与编辑部风格。
- 主体以图解为主；避免重新做成长文档页。
- 标题短、说明最多两行、小字负责边界。
- 所有图片暂时以明确命名的占位框展示，框中写出未来素材意图和建议比例。
- Agent 支持条紧凑，不抢走主行动区注意力。
- 主 CTA 在桌面和移动端都应在首屏附近出现。
- 移动端将四张功能卡片改为单列，对比区上下排列，按钮保持易点击。
- 遵守 `prefers-reduced-motion`，不依赖动画传递关键信息。

## 5. 占位素材清单

| 文件名 | 比例 | 内容方向 |
| --- | --- | --- |
| `agent-codex.svg` | 1:1 | Codex 官方标记（发布前核权） |
| `agent-workbuddy.svg` | 1:1 | WorkBuddy 官方标记（发布前核权） |
| `agent-openclaw.svg` | 1:1 | OpenClaw 官方标记（发布前核权） |
| `agent-mcp-generic.svg` | 1:1 | 通用 MCP Agent |
| `feature-real-preview.webp` | 4:3 | 原图、Lightroom 渲染、回读证据 |
| `feature-agent-queue.webp` | 4:3 | 多生产者、单执行者队列 |
| `feature-background-variants.webp` | 4:3 | 后台候选任务与状态查询 |
| `feature-measure-json.webp` | 4:3 | 图像到结构化 Measure 报告 |
| `compare-without.webp` | 16:10 | 上下文和操作混杂的旧流程 |
| `compare-with.webp` | 16:10 | 闭环、可恢复、可验证的新流程 |

## 6. 验收标准

- `#experience` 打开新页面；`#about`、`#help` 继续兼容跳转到该页。
- 首部 Agent 支持区桌面高度不超过约 20vh，且包含 Codex、WorkBuddy、OpenClaw、其他 MCP Agent。
- 「这是什么？」能打开无 Agent 弹窗；WorkBuddy 只链接官方中国站。
- 两个首要按钮可用：复制提示词、打开 GitHub。
- 页面明确呈现真实预览、安全并行、后台处理、上下文/时间效率四项能力。
- 页面明确写出 Lightroom 写操作串行，不制造并发误解。
- 使用/不使用对比、设计理念、开源承诺、使用场景、完整提示词、FAQ 全部存在。
- 桌面与移动端没有横向溢出，键盘可操作，构建与测试通过。

## 7. 可直接交给页面开发 Agent 的提示词

```text
请在 tonerelay-portal 中重做「立即体验」页面，并严格以
docs/experience-page-design-prompt.md 为产品和内容基线。

保留当前画廊和 #experience / #about / #help 的路由兼容，不改动无关页面。
页面应视觉优先、少文字，延续当前纸张网格与蓝色编辑部风格。

按以下顺序实现：
1. 不超过约 20vh 的 Agent 支持条：Codex、WorkBuddy、OpenClaw、其他 MCP Agent；图标暂用可替换占位。
2. 「这是什么？」无障碍弹窗：向没有 Agent 的用户解释 Agent，并引导到 WorkBuddy 官方中国站下载、选择模型、回到本页复制提示词。
3. 首要 CTA：复制安装提示词；次要 CTA：去 Runtime GitHub 点 Star。
4. 四张图解卡：真实预览、多 Agent 单执行队列、后台候选、Measure 结构化证据。
5. 「不使用 / 使用 ToneRelay」流程对比图。
6. 设计理念、开源承诺和使用场景。
7. 完整安装提示词文本框。
8. 面向用户和 Agent 的 FAQ。

所有未来图片使用有名称、比例和内容说明的占位框。不要虚构性能数字；必须写清：
多个 Agent 可以并行观察和规划，但 Lightroom 写操作经持久队列串行执行。

实现后运行测试和生产构建，并用真实浏览器检查桌面、移动端、弹窗和复制按钮。
```
