# Lightroom MCP：用对话选片和修图

## ToneRelay 是什么

ToneRelay 是连接 Agent 与 Adobe Lightroom Classic 的本地 MCP 工具套件。你说出选片或修图目标，Agent 决定如何调整；ToneRelay 通过 Lightroom 插件执行操作，带回实际参数和渲染预览，也提供图像测量与对比工具。

MCP 是 Agent 调用外部工具的连接方式。装好 ToneRelay 后，Agent 就能通过这些工具读取照片、调整参数、查看结果，减少对着 Lightroom 界面找按钮和拖滑块的步骤。Lightroom Classic 需要保持运行，但不必一直放在前台。

## 怎么用

1. 在 Agent 客户端中接入 ToneRelay，打开 Lightroom Classic 和要使用的目录。
2. 让 Agent 看看当前选中的照片，或先浏览整个目录。
3. 描述想要的效果，查看 Lightroom 实际渲染的预览。
4. 接着说哪里要改，也可以要求放大细节或对比不同版本。

例如：“参考这张照片的颜色调整当前照片，先给我看一版。”看过结果后，再说：“暗部再亮一点，肤色别偏黄，给我看前后对比。”

## 可以做哪些事

- **浏览和选片**：读取当前选片、目录缩略图和照片预览，让 Agent 逐张看图。
- **调整画面与局部**：使用显影参数和主体蒙版调整照片，在虚拟副本上查看效果。
- **批量整理**：按你给出的标准设置星级、旗标或颜色标签，结果写回 Lightroom 目录。
- **多方案试色**：提交多组明确参数，在后台逐个渲染，再比较结果。
- **测量与对比**：查看亮度、色彩等数值，比较调整前后或不同候选版本。

工具负责执行和回读，Agent 结合照片与用户反馈判断下一步。你也可以从画廊下载 Reef 制作的风格与效果包，把说明和参考图交给 Agent 使用。

## 开始使用

主安装指南位于 [Lightroom MCP 仓库](https://github.com/ReefRuan/tonerelay-lightroom-mcp)：从 [INSTALL.md](https://github.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/INSTALL.md) 开始，修图用法见 [USAGE.md](https://github.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/USAGE.md)。也可以把 Portal 保留的 [安装提示词](https://github.com/ReefRuan/tonerelay-portal/blob/main/docs/install-prompt.md) 复制给正在使用的 Agent；它会先检查本机已有组件，已有健康安装时只接入新客户端，需要下载时核对官方来源并固定版本。源码预览不代表已发布稳定安装包或完成全平台验收。

首次连接时，确认要使用的 Lightroom 目录。显影调整使用虚拟副本；星级、旗标等整理操作会写入目录。

接入与排障见 Portal 的 [常见问题](https://github.com/ReefRuan/tonerelay-portal/blob/main/docs/faq.md)，卸载见[卸载提示词](https://github.com/ReefRuan/tonerelay-portal/blob/main/docs/uninstall-prompt.md)。这些文档保留在 Portal 原路径。想了解工具细节，可以阅读 [MCP 工具说明](https://github.com/ReefRuan/tonerelay-portal/blob/main/docs/mcp-tools-overview.md)。

喜欢这个工作流，欢迎给 [MCP 仓库点 Star](https://github.com/ReefRuan/tonerelay-lightroom-mcp)。继续浏览 [Portal 风格与效果画廊](https://reefruan.github.io/tonerelay-portal/)，或关注作者的 [Bilibili 主页](https://space.bilibili.com/2869626)。
