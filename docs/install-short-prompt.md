# ToneRelay 安装与更新短提示词

复制下面代码块的内容，发给当前 Agent。它只负责找到完整说明，不替代完整安装提示词与 FAQ。两个链接是同一 MCP 项目的主源和官方备用，不是两个要分别安装的项目。

<!-- install-short-prompt:start -->
```text
请在当前 Agent 客户端安装或更新 ToneRelay for Lightroom Classic。
目标：v0.7.0；完整 commit：3be21794d37f02a1005941b46c18cea89acd8da9。“最新”仅指此目标，不是 main。
官方仓库，二选一：
https://github.com/ReefRuan/tonerelay-lightroom-mcp
https://gitee.com/ReefRuan/tonerelay-lightroom-mcp

先只读检查：未安装则安装；已有较旧版本即使健康也更新到目标；版本与 commit 均相同且健康时只核验并接入，不重复安装。较新版本、开发版或来源不明时先报告差异，不静默降级。只有我明确要求“只接入客户端”或“不升级”时才跳过更新。
核验所选仓库的目标 commit，完整阅读该提交根目录的 INSTALL-PROMPT.md、FAQ.md 和 INSTALL.md。本次已授权更新到目标版本所需的普通步骤；旧随仓库说明中的“仅接入时复用”不能取消这次更新授权。需要下载时，将完整源码放入 ToneRelay 专用安装根目录，组件统一到同一 commit；镜像滞后不能改变目标。
保留照片、Catalog、数据、有效配置、访问模式、绑定、其他客户端条目和用户修改过的 Skill。完成必要授权及真实客户端的只读验收，报告实际运行版本与未验证项；不重放结果未知的写入。
```
<!-- install-short-prompt:end -->

目标版本和完整 commit 随本提示词固定，`main` 仅用于查看项目。若镜像没有这些文件，不声称它已同步；先检查另一官方源，仍不可用时报告缺失，不把陌生来源或目录浏览网页当作完整说明。无法取得目标源码时可以继续只读检查，但必须报告更新未完成。

完整文档在 Portal 维护，随 MCP 源码提供同步副本：

| Portal 维护路径 | MCP 仓库根目录 |
| --- | --- |
| `docs/install-prompt.md` | `INSTALL-PROMPT.md` |
| `docs/install-prompt.en.md` | `INSTALL-PROMPT.en.md` |
| `docs/faq.md` | `FAQ.md` |
| `docs/faq.en.md` | `FAQ.en.md` |

网页复制按钮仍提供完整提示词及 FAQ；仓库 README 提供本页短入口。更新副本时逐文件核对内容与来源提交，不复制内部开发资料，也不改动已有版本标签。

## 维护目标版本

目标版本唯一来源是 `docs/install-target.json`。先核验公开 MCP 仓库的版本和完整 commit，再修改该文件并运行 `npm run sync:install-prompts`，同步中英文长短提示词与 README；`npm test` 和 `npm run build` 检查一致性。不要把尚未公开的恢复构建填为公开安装目标。MCP 仓库的文档副本按其公开发布流程另行同步。
