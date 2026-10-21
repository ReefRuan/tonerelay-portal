# ToneRelay short installation prompt

Copy the text block into the current Agent. It locates the complete instructions rather than replacing the full installation prompt and FAQ. The two URLs are the primary and official fallback for the same MCP project, not two projects to install separately.

```text
Please install or connect ToneRelay for Lightroom Classic in the current Agent client.
Use either official repository:
https://github.com/ReefRuan/tonerelay-lightroom-mcp
https://gitee.com/ReefRuan/tonerelay-lightroom-mcp

Check existing installations read-only first. If healthy and compatible, connect only this client; do not reinstall or incidentally upgrade shared components.
Read the selected repository, record its full commit, and read INSTALL-PROMPT.en.md, FAQ.en.md, and INSTALL.en.md in its root completely before following them. If source needs downloading, pin that commit and obtain the complete source under the dedicated ToneRelay installation directory; do not mix component versions.
Preserve photos, Catalogs, and other client configuration. Complete the required authorization and read-only acceptance checks in a real new client session; report anything that remains unverified.
```

Use `main` only to discover an available commit, not as the installation version. If a mirror lacks these files, do not claim it is synchronized: check the other official source, then report missing documents if neither is usable. Do not substitute unknown sources or repository-viewer HTML for complete instructions. A healthy existing installation may still be inspected read-only; do not reinstall it merely to obtain documentation.

The full documents are maintained in Portal and copied into the MCP repository root as `INSTALL-PROMPT.md`, `INSTALL-PROMPT.en.md`, `FAQ.md`, and `FAQ.en.md`. The website's copy button still supplies the complete prompt and FAQ; repository READMEs use this short entry point. Verify content and source commits when updating copies. Do not copy private development material or move existing version tags.
