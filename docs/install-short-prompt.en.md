# ToneRelay short installation and update prompt

Copy the text block into the current Agent. It locates the complete instructions rather than replacing the full installation prompt and FAQ. The two URLs are the primary and official fallback for the same MCP project, not two projects to install separately.

<!-- install-short-prompt:start -->
```text
Please install or update ToneRelay for Lightroom Classic in the current Agent client.
Target: the latest code on the official public MCP main branch at execution time. Resolve and record its full 40-character commit once, then keep this installation on that commit even if main advances. A version/commit I explicitly request takes precedence.
Official primary source and fallback:
https://github.com/ReefRuan/tonerelay-lightroom-mcp
https://gitee.com/ReefRuan/tonerelay-lightroom-mcp

Check the existing installation read-only first: install if absent; update an older installation to the target even if healthy; verify and reconnect an identical healthy version and commit without reinstalling. Do not silently downgrade a newer, development, or unverified build; report the difference. Only skip updating if I explicitly request client connection only or no upgrade.
Verify public repository identity, resolve main through the official API or Git, and read INSTALL-PROMPT.en.md, FAQ.en.md, and INSTALL.en.md at the resolved commit completely. The resolved commit overrides older targets in bundled prompts. This request authorizes ordinary installation/update steps. Obtain complete source under the dedicated ToneRelay installation root and keep all components on that commit. After resolving GitHub main, a mirror must provide the same commit; if only Gitee is reachable initially, resolve its main and report that GitHub's latest state could not be verified.
Preserve photos, Catalogs, data, effective configuration, access mode, bindings, other client entries, and locally modified Skills. Complete required authorization and real-client read-only acceptance; report running versions and anything unverified. Never replay a write with an unknown outcome.
```
<!-- install-short-prompt:end -->

Resolve the latest full commit on official main at each execution and freeze it for that installation. If a mirror lacks these files, do not claim it is synchronized: check the other official source, then report missing documents if neither is usable. Do not substitute unknown sources or repository-viewer HTML for complete instructions. Read-only inspection may continue if the target source is unavailable, but report the update as incomplete.

The full documents are maintained in Portal and copied into the MCP repository root as `INSTALL-PROMPT.md`, `INSTALL-PROMPT.en.md`, `FAQ.md`, and `FAQ.en.md`. The website's copy button still supplies the complete prompt and FAQ; repository READMEs use this short entry point. Verify content and source commits when updating copies. Do not copy private development material or move existing version tags.

## Maintaining the update source policy

The source policy lives in `docs/install-target.json`: resolve the official MCP main branch at execution time. Code updates require no prompt or version-number edits. After changing the policy or copy, run `npm run sync:install-prompts`, `npm test`, and `npm run build`. Synchronize the public MCP documentation copies separately.
