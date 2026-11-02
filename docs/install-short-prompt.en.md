# ToneRelay short installation and update prompt

Copy the text block into the current Agent. It locates the complete instructions rather than replacing the full installation prompt and FAQ. The two URLs are the primary and official fallback for the same MCP project, not two projects to install separately.

<!-- install-short-prompt:start -->
```text
Please install or update ToneRelay for Lightroom Classic in the current Agent client.
Target: v0.7.0; full commit: 84a6ff0aee3ec376541969f30612c803dcfd9e70. “Latest” means this target, not main.
Use either official repository:
https://github.com/ReefRuan/tonerelay-lightroom-mcp
https://gitee.com/ReefRuan/tonerelay-lightroom-mcp

Check the existing installation read-only first: install if absent; update an older installation to the target even if healthy; verify and reconnect an identical healthy version and commit without reinstalling. Do not silently downgrade a newer, development, or unverified build; report the difference. Only skip updating if I explicitly request client connection only or no upgrade.
Verify the target commit in the selected repository and read INSTALL-PROMPT.en.md, FAQ.en.md, and INSTALL.en.md at that commit completely. This request authorizes ordinary installation/update steps to the target; older bundled instructions about connection-only reuse do not cancel that authorization. Obtain complete source under the dedicated ToneRelay installation root when needed, and keep all components on the same commit. A lagging mirror must not change the target.
Preserve photos, Catalogs, data, effective configuration, access mode, bindings, other client entries, and locally modified Skills. Complete required authorization and real-client read-only acceptance; report running versions and anything unverified. Never replay a write with an unknown outcome.
```
<!-- install-short-prompt:end -->

The version and full commit are pinned in this prompt; use `main` only to browse the project. If a mirror lacks these files, do not claim it is synchronized: check the other official source, then report missing documents if neither is usable. Do not substitute unknown sources or repository-viewer HTML for complete instructions. Read-only inspection may continue if the target source is unavailable, but report the update as incomplete.

The full documents are maintained in Portal and copied into the MCP repository root as `INSTALL-PROMPT.md`, `INSTALL-PROMPT.en.md`, `FAQ.md`, and `FAQ.en.md`. The website's copy button still supplies the complete prompt and FAQ; repository READMEs use this short entry point. Verify content and source commits when updating copies. Do not copy private development material or move existing version tags.

## Maintaining the target version

The single target source is `docs/install-target.json`. Verify the public MCP version and full commit before editing it, then run `npm run sync:install-prompts` to synchronize both languages' full/short prompts and READMEs. Run `npm test` and `npm run build` to check consistency. Never use an unpublished development build as the public installation target. Synchronize the MCP repository's document copies separately through its public release process.
