# ToneRelay 短安装提示词

复制下面代码块的内容，发给当前 Agent。它只负责找到完整说明，不替代完整安装提示词与 FAQ。两个链接是同一 MCP 项目的主源和官方备用，不是两个要分别安装的项目。

```text
请在当前 Agent 客户端安装或接入 ToneRelay for Lightroom Classic。
官方仓库，二选一：
https://github.com/ReefRuan/tonerelay-lightroom-mcp
https://gitee.com/ReefRuan/tonerelay-lightroom-mcp

先只读检查已有安装；健康兼容时只接入当前客户端，不重装或顺便升级。
读取所选仓库，记录完整 commit，完整阅读根目录的 INSTALL-PROMPT.md、FAQ.md 和 INSTALL.md，再按要求执行。需要下载源码时，固定该 commit，将完整源码放入 ToneRelay 专用安装目录；不混用不同版本的组件。
保留照片、Catalog 和其他客户端配置；完成必要授权及真实新会话的只读验收，未验证项如实报告。
```

`main` 只用于发现可用提交，不是安装版本。若镜像没有这些文件，不声称它已同步；先检查另一官方源，仍不可用时报告缺失，不把陌生来源或目录浏览网页当作完整说明。已有健康安装仍可只读检查；不要为了取得说明重装它。

完整文档在 Portal 维护，随 MCP 源码提供同步副本：

| Portal 维护路径 | MCP 仓库根目录 |
| --- | --- |
| `docs/install-prompt.md` | `INSTALL-PROMPT.md` |
| `docs/install-prompt.en.md` | `INSTALL-PROMPT.en.md` |
| `docs/faq.md` | `FAQ.md` |
| `docs/faq.en.md` | `FAQ.en.md` |

网页复制按钮仍提供完整提示词及 FAQ；仓库 README 提供本页短入口。更新副本时逐文件核对内容与来源提交，不复制内部开发资料，也不改动已有版本标签。
