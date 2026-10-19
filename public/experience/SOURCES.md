# 立即体验页工作流截图

这些截图来自作者本机的 ToneRelay 实际工作流（Lightroom Classic + Agent 对话），照片来自作者的 Lightroom 目录，非库存图片。截图从 4K 录屏中裁剪出有效区域，缩放后以 WebP 用于网页展示；页面上的说明文字与截图内容一致。

| 文件 | 尺寸 | 内容 | 来源 |
| --- | --- | --- | --- |
| `lr-develop-sliders.webp` | 1800×1149 | Lightroom Classic 修改照片模块：右侧参数面板布满滑块，大光标停在曝光度滑块上 | 作者实测截图 |
| `conversation-refine.webp` | 1400×1405 | 对话精修：第一版结果 → 接着说「感觉暗部太黑了」→ 第二版 | 作者实测截图 |
| `lr-loupe.webp` | 1500×1285 | Lightroom Classic 放大视图与胶片网格 | 作者实测截图 |
| `conversation-rating.webp` | 1500×1020 | 批量评分：星级分布与写回记录 | 作者实测截图 |
| `conversation-color-match.webp` | 989×1194 | 参考图仿色：9 张参考图逐张匹配，14 张浓郁风格结果回读 | 作者实测截图 |
| `conversation-mask.webp` | 1346×1307 | 人物蒙版：一句「曝光不对，蒙版恢复人物曝光和整体曝光」→ 整体曝光 +0.35 EV / 高光 −55 / 阴影 +30 + 人物蒙版提亮 → 原图与曝光修正版并排 → 参数回读确认 | 作者实测截图 |

## 2026-10-18 重裁：去掉对话界面外壳

三张 `conversation-*.webp` 只保留对话内容，裁掉了这些界面元素，避免在页面上和卡片本身的标题重复：

| 文件 | 裁掉的区域 | 保留 |
| --- | --- | --- |
| `conversation-refine.webp` | 左侧会话列表竖栏（x 0–100）、顶部窗口标题条（y 0–56）、底部输入框（y 1445 之后） | 参考图行 → 提问 → 用时 → v1 → 参数 → 反馈 → v2 → 参数 |
| `conversation-rating.webp` | 底部输入框（y 1004 之后） | 上一轮追问 → 打分请求 → 两次用时 → 星级分布表 → 5★ 名单 → 冲突说明 → 操作 ID |
| `conversation-color-match.webp` | 底部输入框（y 1178 之后） | 两张结果 → 9 张参考图 → 提问 → 完成说明 → 逐张匹配结果 |
| `conversation-mask.webp` | 顶部「今天 22:00」、中间「用时 37 分钟 54 秒」整段、底部输入框 | 文件名 → 原片缩略图 → 提问 → 完成说明 → 原图/曝光修正版对比 → 参数 |

每张底部补 16px 白，避免最后一行贴边。页面侧同步调整：双栏对比改成 `0.78fr / 1.22fr`（左窄右宽）；第 03 组由单人卡改回**竖向堆叠**（蒙版在上、仿色在下），图片接近整栏宽度。「用时」那一行是直接跳过不裁（切掉 y 640–785 的一段），不是涂白；源图 `footage/MDimage/image-20261018043804315.png`。

## 2026-10-19 新素材与大图展示

以下文件来自作者提供的 `素材.zip`。Lightroom 图保留完整画面与操作面板，缩到 2200px 宽；对话图只裁掉窗口边框、侧栏、输入框和外围空白，没有重绘文字或照片。统一以 WebP quality 86 编码，8 张新增图合计约 1.3 MB。旧文件保留，便于核对来源。

| 当前页面文件 | 尺寸 | 压缩包内原文件 | 处理 |
| --- | --- | --- | --- |
| `lr-develop-mountain.webp` | 2200×1201 | `image-20261019220744886.png` | 完整山景与显影面板，等比缩小 |
| `lr-develop-masks.webp` | 2200×1201 | `image-20261019221042073.png` | 完整山景与蒙版面板，等比缩小 |
| `lr-develop-landscape.webp` | 2200×1201 | `image-20261019220828610.png` | 完整草地风景与显影面板，等比缩小 |
| `conversation-refine-tight.webp` | 1312×1690 | `image-20261018162942924.png` | 从原图 `(114, 160)` 裁出 1312×1690；保留参考图、两轮提问与两版结果；底部被输入框遮挡的参数残行不展示 |
| `lr-library-grid.webp` | 2200×1201 | `image-20261019221606671.png` | 完整目录网格，等比缩小 |
| `lr-library-compare.webp` | 2200×1201 | `image-20261019221705853.png` | 完整双图比较界面，等比缩小 |
| `lr-library-loupe.webp` | 2200×1238 | `Adobe Lightroom Classic (2)_2026.10.16-03.46.png` | 完整放大视图与胶片栏，等比缩小 |
| `conversation-rating-tight.webp` | 1570×1770 | `image-20261019222344125.png` | 保留顶部到 y=1770 的评分对话，裁掉底部输入框 |

页面前两组各使用三张 Lightroom 截图和一张对应对话图。第 03 组继续使用已处理时间信息的 `conversation-mask.webp` 和原有 `conversation-color-match.webp`；本次压缩包中的原始蒙版图包含时间信息，没有替换上去。所有展示图都提供原尺寸 WebP 的大图链接。

## README 展示图：透明圆角与画廊入口

2026-10-20 从当前 Portal 页面重新截图，供 Portal 与 MCP 仓库的中英文 README 使用。截图使用浏览器原生 PNG 输出：保留透明圆角、去掉截图范围以外的背景和多余外框，并轻化页面展示卡片的边框。没有重绘照片、改变调色结果或改写对话，也没有重新执行 Lightroom 工作流。

| 展示图 | 页面内容与来源 |
| --- | --- |
| `readme-dialogue-workflow.png` / MCP `dialogue-workflow.png` | 第 01 组对比板；原有三张 Lightroom 截图与 `conversation-refine-tight.webp` |
| MCP `batch-workflow.png` | 第 02 组对比板；原有 Lightroom 目录、比较、放大截图与 `conversation-rating-tight.webp` |
| MCP `subject-mask.png` | 第 03 组主体蒙版面板，原有 `conversation-mask.webp` |
| MCP `reference-color.png` | 第 03 组参考图调色面板，原有 `conversation-color-match.webp` |
| `readme-portal-experience.png` | 当前工具介绍区，文字与页面一致 |
| `readme-portal-overview.png` | 当前画廊前五张风格卡片；仅展示部分卡片，不代表完整目录 |
| `readme-gallery-preview.png` / MCP `gallery-preview.png` | 同五张卡片的紧凑预览，用于点击进入画廊 |
| `readme-style-detail.png` | C200 详情中的十张参考照片，保留逐图作者及许可标注 |

Portal 文件位于 [`docs/assets/`](../../docs/assets/)，MCP 文件位于[公开 MCP 仓库的 `assets/readme/`](https://github.com/ReefRuan/tonerelay-lightroom-mcp/tree/main/assets/readme)。截图中使用的摄影作品仍适用各自的原许可；画廊封面与 C200 详情的完整署名见 [Portal README](../../README.md#图片来源与许可) 和各风格包的来源记录。透明圆角与展示缩放不改变素材权利，也不构成速度或 Token 用量对照测试。
