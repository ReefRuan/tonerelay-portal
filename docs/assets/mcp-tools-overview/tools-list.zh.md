# MCP 工具一览

<!-- Generated from tools-list.zh.html; edit that HTML, then run export-markdown.mjs. -->

## 修图参数、版本与回读 · 25

| Tool | 用途 |
| --- | --- |
| `trlr_create_episode` | 编辑上下文与虚拟副本 |
| `trlr_edit_episode` | 显影参数与曲线 |
| `trlr_color_patch_measure` | 色块 RGB / Lab / ΔE00 |
| `trlr_digital_color_references` | 数字色值转换 |
| `trlr_color_region_compare` | 区域色彩变化 |
| `trlr_list_episodes` | 列出编辑上下文 |
| `trlr_get_episode` | 版本、回读与状态 |
| `trlr_get_photo_settings` | 当前显影参数与 XMP |
| `trlr_episode_artifact` | 编辑版本预览与 XMP |
| `trlr_episode_diff` | 版本参数与回读差异 |
| `trlr_replay_episode` | 重放参数为新版本 |
| `trlr_stop_episode` | 停止后续渲染 |
| `trlr_restore_episode` | 恢复已保存版本 |
| `trlr_message_episode` | 保存对话与标签 |
| `trlr_parameter_reference` | 参数名称与范围 |
| `trlr_capabilities` | 参数能力与限制 |
| `trlr_render_parameter_variants` | 多参数值候选渲染 |
| `trlr_list_parameter_variant_results` | 查询候选渲染记录 |
| `trlr_native_mask` | 主体、天空、背景蒙版 |
| `trlr_apply_mask` | 原片 XMP 蒙版路径 |
| `trlr_update_xmp_sidecar` | 原片 Sidecar 操作 |
| `trlr_verify_episode_xmp` | XMP 回放验证 |
| `trlr_list_develop_presets` | 列出显影预设 |
| `trlr_get_develop_preset` | 读取预设参数 |
| `trlr_compare_develop_presets` | 比较预设参数 |

## 批量操作、预览与导出 · 25

| Tool | 用途 |
| --- | --- |
| `trlr_get_current_selection` | 当前照片与文件夹 |
| `trlr_list_photos` | 目录筛选与分页 |
| `trlr_studio_photos` | 照片与插件能力 |
| `trlr_get_photo_marks` | 读取星级与标记 |
| `trlr_set_photo_marks` | 批量写入星级与标记 |
| `trlr_get_mark_operation` | 回读标记操作 |
| `trlr_undo_photo_marks` | 撤销本次标记 |
| `trlr_get_current_folder_previews` | 当前文件夹预览 |
| `trlr_get_photo_preview` | 读取缓存预览 |
| `trlr_folder_roots` | 可访问文件根目录 |
| `trlr_folder_scan` | 扫描图片文件 |
| `trlr_folder_preview` | 文件图片预览 |
| `trlr_import_photos` | 批量导入文件与目录 |
| `trlr_upload_photo` | 图片传入 Lightroom |
| `trlr_export_image` | JPEG 导出 |
| `trlr_health` | 连接与目录授权 |
| `trlr_list_catalogs` | 发现 Lightroom 目录 |
| `trlr_confirm_catalog` | 绑定当前目录 |
| `trlr_switch_catalog` | 切换目录 |
| `trlr_refresh_mcp` | 刷新 MCP 运行版本 |
| `trlr_get_runtime_config` | 运行设置与帮助 |
| `trlr_get_presentation_config` | 读取预览尺寸设置 |
| `trlr_set_presentation_config` | 调整预览尺寸设置 |
| `trlr_list_issues` | 读取问题记录 |
| `trlr_report_issue` | 记录工具链问题 |

## 图片处理与数值化 · 2

| Tool | 用途 |
| --- | --- |
| `trlr_image_measure` | 直方图、亮度、分布 |
| `trlr_image_compare` | 局部裁切与渲染对比 |

选片与审美由你和 Agent 决定，工具负责执行与回读。缓存预览用于浏览；最终效果查看 Lightroom 实际渲染。

Reef Ruan · ToneRelay
