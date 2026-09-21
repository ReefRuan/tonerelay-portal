# ToneRelay Portal

ToneRelay Portal 是 ToneRelay 风格模板的浏览、筛选、下载和安装入口。

## 仓库职责

- 从 `tonerelay-style-packs` 读取公开的风格包目录。
- 展示封面、参考图、风格说明、版本和兼容性。
- 下载或安装用户明确选择的风格包。
- 为 Codex 和 ToneRelay Runtime 提供一致的包标识。

本仓库不保存完整风格包，不实现 Lightroom 操作，也不承载 MCP Server。

## 数据流

```text
tonerelay-style-packs
        │ catalog + package assets
        ▼
ToneRelay Portal
        │ selected package
        ▼
Local Context Store
        │ style context
        ▼
ToneRelay for Lightroom
```

## 当前状态

仓库已完成初始化。前端框架、部署方式和安装协议将在包合同确定后实现。

