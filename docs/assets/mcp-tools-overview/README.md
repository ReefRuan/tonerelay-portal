# ToneRelay 工具介绍列表

## 当前审核稿：密集工具列表

当前使用 `tools-list.zh.html`、`tools-list.en.html` 和共用的 `tools-list.css`。中英文是两个独立页面，列表中**没有示意图或照片**；每一项直接显示真实 `trlr_*` 名称和简短用途。对应的 `tools-list.zh.two-column.jpg`、`tools-list.en.two-column.jpg` 是浏览器截图，供 README 展示。

已按下方公开 0.7.0 源码的实际 `tools/list` 输出逐项核对，共 52 个唯一工具，无遗漏或重复：

1. 修图参数、版本与回读：25 个，包含虚拟副本、编辑上下文、编辑版本预览、状态、当前显影参数、版本差异与参数重放、蒙版、XMP 读取/验证、预设、RGB / Lab / ΔE00。`trlr_create_episode` 紧接 01 标题，作为这一组第一项。
2. 批量操作、预览与导出：25 个，包含目录、标记、Catalog 缓存与文件预览、批量导入文件与目录、JPEG 导出、连接及运行配置。
3. 图片处理与数值化：2 个，分别是 `trlr_image_measure`、`trlr_image_compare`；区域裁切、直方图和明暗统计是工具的能力，不伪造为新的 tool 名称。

面向首次接触项目的用户，只展示当前注册的工具名称与用途，不展示内部迁移、兼容或版本历史标签，也不把部分工具变灰。页面不放分组说明小字。分类是展示用途，不声称等于源码模块结构。名单随本次公开源码快照核验，工具注册变化后需重新核对数量与名称。

已接入 Portal「试着这样说」之后、「02 批量操作」编号之前，按钮名为「MCP 工具一览」，单独居中。默认展开，点击可收起或再次展开两列文字列表，不打开独立页面。组件直接解析本目录已确认的中英文 HTML，复用工具名与文案，不维护第二份名单。HTML 继续用作本地审核稿与截图真源，不再单独发布网页路由。

01 组前五项优先展示显影与色彩：创建编辑上下文 → 显影参数与曲线 → RGB / Lab / ΔE00 色块测量 → 数字色值转换 → 区域色彩变化。随后列出上下文与当前参数读取、版本预览、差异与重放等工具。中英文工具名称及顺序完全一致。

Portal 的中英文 README 在「从一张照片，到一整组照片」下展示对应语言截图。本轮只更新 Portal；公开 MCP 仓库中的 README 与图片不随本次改动同步。

两列构图：左列为 01 修图组，右列上方 02 批量组、下方 03 图片组；窄屏纵向排列。两列独立按内容高度排布，工具行保持紧凑，不拉伸卡片或行距来补齐高度。02 的目录缓存预览和打标状态，与 01 的编辑版本预览及回读分开。

`tools-list.zh.md` 与 `tools-list.en.md` 是可直接粘贴到 GitHub 的原生文字表格，不依赖图片、脚本或网页样式。由对应 HTML 机械导出，不另行维护第二份工具名单。修改 HTML 后，在本目录运行 `node export-markdown.mjs` 重新生成。

## 文件与维护

- `tools-list.zh.html`、`tools-list.en.html`：中英文工具名与文案真源，可离线打开审核。
- `tools-list.css`：独立审核稿的排版；宽 1480 px，桌面两列，不拉伸行距。
- `tools-list.zh.two-column.jpg`、`tools-list.en.two-column.jpg`：对应 HTML 的浏览器截图。
- `tools-list.zh.md`、`tools-list.en.md`：GitHub 原生文字表格。
- `export-markdown.mjs`：从 HTML 重新导出 Markdown。
- `tools-snapshot.json`：本次公开 MCP 的版本、提交与实际工具名称集合，供自动测试核对；不作为第二份展示文案。

Portal 页内展开组件位于 `src/McpToolsOverview.tsx`，样式在 `src/mcp-tools-overview.css`。摆放顺序在 `src/WorkflowComparisons.tsx` 的 `<McpToolsOverview />` 调用处调整；不需要改变名单或截图。

## 公开源码核对

内容独立依据 [ToneRelay 公开 MCP 0.7.0 源码](https://github.com/ReefRuan/tonerelay-lightroom-mcp/tree/f17196210939a9638319e4c918dc1f750da6ef3d) 与用户本轮需求编写。核对提交为 `f17196210939a9638319e4c918dc1f750da6ef3d`，未摘抄私有 Runtime 设计资料。

2026-10-21 在该公开 checkout 离线调用 `McpServer(None).handle()` 的 `tools/list`，实际返回 52 个唯一名称；未初始化 Workbench、连接 Lightroom 或读取用户配置。公开的退役、导入与媒体协议测试共 25 项通过。展示名单不保留已退役的 Session 工具。

以下路径均相对上述公开仓库，不是相对本目录：

| 图中能力 | 公开工具 | 核对位置 |
| --- | --- | --- |
| 当前照片与目录、缓存预览 | `trlr_get_current_selection`、`trlr_list_photos`、`trlr_get_current_folder_previews`、`trlr_get_photo_preview` | `apps/workbench-mcp/workbench_mcp/server.py` |
| 星级、旗标、颜色标签 | `trlr_get_photo_marks`、`trlr_set_photo_marks`、`trlr_get_mark_operation`、`trlr_undo_photo_marks` | 同上；`apps/workbench/tests/test_photo_marks.py` |
| 虚拟副本、渲染与参数回读 | `trlr_create_episode`、`trlr_edit_episode`、`trlr_get_episode`、`trlr_episode_artifact` | 同上；`apps/workbench/workbench/studio/engine.py` |
| 当前显影参数、版本差异与参数重放 | `trlr_get_photo_settings`、`trlr_episode_diff`、`trlr_replay_episode` | `apps/workbench-mcp/workbench_mcp/server.py`；`apps/workbench-mcp/tests/test_retirement_protocol.py` |
| 批量导入文件与目录 | `trlr_import_photos` | `apps/workbench-mcp/workbench_mcp/server.py`；`apps/workbench-mcp/tests/test_import_protocol.py` |
| JPEG 与参数 XMP 导出 | `trlr_export_image`、`trlr_verify_episode_xmp`、`trlr_episode_artifact` | `apps/workbench-mcp/workbench_mcp/server.py` |
| 显影参数、曲线、HSL、色彩分级 | `trlr_edit_episode`、`trlr_parameter_reference` | 同上；`apps/workbench/workbench/studio/parameter_specs.py` |
| 主体、天空、背景蒙版 | `trlr_native_mask` | `apps/workbench-mcp/workbench_mcp/server.py` |
| RGB、Lab、ΔE00 | `trlr_color_patch_measure`、`trlr_color_region_compare` | 同上；`apps/workbench/workbench/color_patches.py` |
| ROI、并排对比、直方图、明暗统计、ICC | `trlr_image_compare`、`trlr_image_measure` | 同上；`apps/workbench/workbench/image_tools.py`；`apps/workbench-mcp/workbench_mcp/media_tools.py` |

表述边界：工具写入评分，不独立决定选片标准；当前选图指当前目标照片，不宣称返回多选集合；缓存缩略图不等同于新鲜、色彩已验证的渲染；原生蒙版限主体、天空与背景；裁切是用于观察和测量的 ROI；ΔE00 表示渲染颜色变化，不是精度认证；JPEG 是图像导出，XMP 是参数文件。没有宣称图片 embedding、专用模糊检测器或全部操作都不改变 Lightroom 可见界面。

当前显影读取与编辑版本快照分开：`trlr_get_photo_settings` 返回指定 Catalog 照片的实时参数及 XMP 序列化，不构成图像或原生预设导入验证；`trlr_episode_diff` 比较已保存版本的参数与回读，不进行图像评分；`trlr_replay_episode` 在新虚拟副本上重放参数并生成新版本，不等于恢复任意外部编辑。`trlr_import_photos` 默认原地导入，移动文件需另行明确授权；`trlr_upload_photo` 仍是临时传入路径，不替代持久导入。

独立的 `media_tools.py` 承载导出与确定性测量，并未新增一套工具名称。`trlr_export_image` 只按 `photo_uuid` 实时导出；`trlr_image_compare` 与 `trlr_color_region_compare` 只比较已发布的 Episode 渲染；`trlr_image_measure` 可读取 Catalog 照片、允许的文件或 Episode 渲染。以上均不再接受 Session 地址。

## README 嵌入

GitHub README 使用浏览器截图；点击可查看原尺寸。普通 README 不直接执行 HTML：

```markdown
![ToneRelay MCP 工具一览](docs/assets/mcp-tools-overview/tools-list.zh.two-column.jpg)
```

公开 MCP 仓库的对应文件是 `assets/readme/mcp-tools-list.zh.jpg`、`mcp-tools-list.en.jpg`，由该仓库的维护流程另行更新，本轮不修改。Portal 改动名单或顺序后，重新生成本目录 Markdown 与浏览器截图。截图未修改文字或另行生成图像内容。
