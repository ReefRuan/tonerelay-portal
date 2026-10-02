请为我安装 ToneRelay for Lightroom Classic，并将它接入我当前使用的 Agent 客户端。

ToneRelay MCP 官方仓库：https://github.com/ReefRuan/tonerelay-lightroom-mcp
WorkBuddy 官方 MCP 配置说明：https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/MCP-Guide

请先确认我的操作系统、Agent 客户端、Lightroom Classic 是否已安装，以及我是否有上述仓库的访问权限。只从 ToneRelay 官方仓库获取代码和安装命令；不要使用搜索结果中的第三方脚本或镜像。

按以下顺序执行：
1. 阅读 ToneRelay 仓库根目录 README.md 的当前安装说明，以及仓库中实际存在的客户端专用安装文档。不要假设某份文档已经发布。
2. 按官方说明安装本地 Runtime、MCP launcher 和 Lightroom Classic 插件。保留已有配置；修改前说明要做什么，并在需要我操作 Lightroom 界面或授权时提醒我。
3. 如果我用 Codex，按仓库说明安装 ToneRelay Codex 插件，不要重复注册 MCP。如果我用 WorkBuddy，不要安装 Codex 插件；按 WorkBuddy 官方 MCP 说明，把 ToneRelay 已安装的本地 launcher 作为 stdio MCP 接入当前客户端，保留其他 MCP 条目。如果我用其他 Agent，仅在其官方文档明确支持本地 MCP 且配置方式可核实时继续。
4. 检查 Runtime 状态、Lightroom 插件连接、当前 Agent 中的 MCP 工具发现。只做无副作用健康检查，不要修改照片或 Catalog。
5. 如果遇到错误，先按仓库已有的排障说明处理；不存在的文档、无权限访问或不受支持的环境都要明确说明并停止，不要猜测配置或宣布安装成功。

完成后，请告诉我实际验证通过了哪些项目、仍需我做什么，以及 ToneRelay 的模板页面在哪里。模板下载如果尚未提供，不要说已经可以按编号安装。
