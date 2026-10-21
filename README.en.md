<p align="center">
  <a href="https://reefruan.github.io/tonerelay-portal/?lang=en#experience"><img src="public/brand/tonerelay-icon.svg" width="80" height="80" alt="ToneRelay S-curve icon" /></a>
</p>

# ToneRelay Portal — Lightroom MCP Style and Effects Gallery

[中文](README.md) | [English](README.en.md)

A place to explore reference photos, color-grading styles, and conversational editing for photography and **Adobe Lightroom Classic**. Find the colors and lighting you like, then bring that direction into a conversation with your Agent.

ToneRelay connects AI agents to Lightroom Classic through the Model Context Protocol (MCP), for conversational AI photo editing, reference-based color grading, and photography workflows. This repository is its website and style gallery—not the MCP runtime.

[Open the gallery](https://reefruan.github.io/tonerelay-portal/?lang=en#gallery) · [Explore photo editing](https://reefruan.github.io/tonerelay-portal/?lang=en#experience) · [Install and use](https://reefruan.github.io/tonerelay-portal/?lang=en#experience) · [Star the MCP repository](https://github.com/ReefRuan/tonerelay-lightroom-mcp) · [Bilibili homepage](https://space.bilibili.com/2869626) · [Contact the author](https://reefruan.github.io/tonerelay-portal/contact.html?lang=en)

<p align="center">
  <a href="https://reefruan.github.io/tonerelay-portal/?lang=en#experience"><img src="docs/assets/readme-portal-dialogue.en.jpg" width="900" alt="ToneRelay Portal experience page: conversational editing and actual Lightroom results" /></a>
</p>

<sub>An actual screenshot of the experience page. Its Lightroom and Agent conversation images come from real editing workflows. See “Image sources and licensing” below for sources and licenses.</sub>

## Find the colors you like, then start editing

**[Recommended: explore the style and effects gallery first →](https://reefruan.github.io/tonerelay-portal/?lang=en#gallery)** Reference photos make colors and lighting easier to judge than names alone. Click the preview, find a direction you like, and bring it into your editing conversation.

<a href="https://reefruan.github.io/tonerelay-portal/?lang=en#gallery"><img src="docs/assets/readme-gallery-preview.png" width="360" alt="Click to explore photography references in the ToneRelay style and effects gallery" /></a>

Browse six film-style packs in the [online gallery](https://reefruan.github.io/tonerelay-portal/?lang=en#gallery): FUJICOLOR C200, NATURA 1600, PRO 160NS, PRO 400H, PROVIA 100F, and SUPERIA X-TRA 400.

Open a card to explore reference photos, color relationships, suitable scenes, and sources. Download a pack you like, then share its notes and reference images with your Agent. No login or backend setup is required.

<p align="center">
  <a href="docs/assets/readme-style-detail.png"><img src="docs/assets/readme-style-detail.png" width="760" alt="C200 style-pack details: ten reference photos, style notes, and a download link; click to enlarge" /></a>
</p>

Style packs contain Markdown notes and reference images. They are **not Lightroom presets**, and downloading one does not install MCP. Automatic installation by pack ID is not currently promised. See [Style and effects packs](style-packs/README.md) for the full catalog, ZIP files, and individual image credits.

The gallery also offers two effects packs explicitly labeled as candidates: [Adaptive Skin-Tone Protection E01](https://reefruan.github.io/tonerelay-portal/?lang=en&preset=skin-tone-adaptive-fidelity#gallery) and [Luminous Mist Portrait E02](https://reefruan.github.io/tonerelay-portal/?lang=en&preset=luminous-mist-portrait#gallery). Their paired Lightroom results have not yet been validated. E02 distributes only text and links to photos on their original sites; it does not include third-party photo files.

## See the result, then discuss the next adjustment

Once ToneRelay is connected, your Agent can read the current photo and folder previews, adjust Develop settings, retrieve Lightroom’s actual rendered result, and keep refining it based on your feedback. Reference-based color matching, subject masks, and batch star-rating organization are also available; specific capabilities depend on the installed version.

<p align="center">
  <a href="https://reefruan.github.io/tonerelay-portal/?lang=en#experience"><img src="docs/assets/readme-portal-experience.png" width="900" alt="ToneRelay conversational editing page: Lightroom workflows and actual results in Agent conversations" /></a>
</p>

> “Use this image as a color reference and make a first pass.”
>
> “Lift the shadows a little more, keep skin tones from going yellow, and show me a before-and-after comparison.”

<p align="center">
  <a href="https://reefruan.github.io/tonerelay-portal/?lang=en#experience"><img src="docs/assets/readme-dialogue-workflow.png" width="900" alt="The current ToneRelay website’s multi-turn editing showcase: Lightroom, a first result, and revisions after feedback" /></a>
</p>

<sub>The image above comes from Portal’s conversational editing showcase. Its Lightroom and Agent conversation images come from the author’s earlier real workflow; the editing was not rerun for this documentation update. [More real workflow images and image sources](public/experience/SOURCES.md). The Agent determines the editing direction, while ToneRelay executes changes and retrieves results. Not every photo can achieve the same result in one step.</sub>

## From one photo to a whole set

52 MCP tools cover Develop and color controls, edit-version readback, batch Catalog operations, previews, and export. This directory matches the public 0.7.0 source, including batch import, full Develop settings readback, version comparison, and historical-parameter replay. Available tools depend on the installed version.

[![ToneRelay MCP tool directory: Develop settings and readback, batch operations and export, image measurement and comparison](docs/assets/mcp-tools-overview/tools-list.en.two-column.jpg)](docs/assets/mcp-tools-overview/tools-list.en.two-column.jpg)

## Get started

1. [Browse the gallery](https://reefruan.github.io/tonerelay-portal/?lang=en#gallery), or start with the [conversational editing introduction](https://reefruan.github.io/tonerelay-portal/?lang=en#experience).
2. Copy the complete installation prompt from [Install and use](https://reefruan.github.io/tonerelay-portal/?lang=en#experience), or use the [short entry point at the end of this README](#copy-the-installation-prompt). For step-by-step technical instructions, see the MCP repository’s [installation guide](https://github.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/INSTALL.en.md). Your Agent will first check for an existing local installation, then verify the official source, access permissions, a pinned version, and the installation instructions.
3. After installation is working and verified, open Lightroom Classic and the target Catalog, then begin with “Show me the current photo.” For help, see Portal’s [FAQ](docs/faq.en.md); for removal, see the [uninstallation prompt](docs/uninstall-prompt.en.md).

MCP is public and currently offered as a source preview installable from a pinned source version, not a claim that stable installers have been released or all platforms have passed acceptance checks. Follow the [MCP repository’s installation guide](https://github.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/INSTALL.en.md), and pin downloads to a full commit; for a tag, also verify the full commit it resolves to. Do not treat the changing `main` branch as a version number. Copying a prompt from the website does not mean installation is complete. If a healthy local installation already exists, follow the prompt to verify and reuse it. Portal’s installation prompt, FAQ, and uninstallation instructions remain in their original locations, without migration or directory restructuring.

The official source pairs have separate roles: [GitHub MCP source primary](https://github.com/ReefRuan/tonerelay-lightroom-mcp) / [Gitee MCP source fallback](https://gitee.com/ReefRuan/tonerelay-lightroom-mcp), and [GitHub Portal documentation primary](https://github.com/ReefRuan/tonerelay-portal) / [Gitee Portal documentation fallback](https://gitee.com/ReefRuan/tonerelay-portal). If GitHub is unreachable, verify and use a pinned full commit from Gitee. Mirrors may lag; do not mix components from different versions. Portal does not contain the MCP installation source, and a source fallback does not replace pip dependency sources; see the [complete installation prompt](docs/install-prompt.en.md) for verification and dependency-network rules.

## Portal and Runtime responsibilities

| Repository | Purpose |
| --- | --- |
| **This repository: [tonerelay-portal](https://github.com/ReefRuan/tonerelay-portal)** | Product introduction, photography style gallery, style and candidate effects packs, installation prompt and FAQ, and the MCP installation entry point |
| **[tonerelay-lightroom-mcp](https://github.com/ReefRuan/tonerelay-lightroom-mcp)** | The local MCP Runtime, Lightroom plugin, and integration components that connect an Agent with Lightroom Classic; the [installation guide](https://github.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/INSTALL.en.md), [usage guide](https://github.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/USAGE.en.md), and Star entry point are all here |

The website’s [Install and use entry point](https://reefruan.github.io/tonerelay-portal/?lang=en#experience) shares a page with the editing showcase. Standalone introduction pages and [sitemap.xml](https://reefruan.github.io/tonerelay-portal/sitemap.xml) support sharing and search-engine access; they are not a separate installation workflow. Indexing, rankings, and recommendations are determined by each platform.

## Local preview

```bash
pnpm install
pnpm dev
```

The interactive gallery can be previewed directly. Standalone introduction pages are generated during the build. To view the complete site, run `pnpm build`, then `pnpm preview`.

Website code lives in `src/` and `public/`; style and effects packs live in `style-packs/`. The installation prompt, FAQ, and uninstallation prompt remain in this repository’s `docs/` for reading and copying through the website. [Install and use](https://reefruan.github.io/tonerelay-portal/?lang=en#experience) is the visual entry point; detailed steps remain in [INSTALL.en.md in the MCP repository](https://github.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/INSTALL.en.md).

## Image sources and licensing

The new screenshots on this page were captured from the Portal website and show its layout, with possible resizing. Third-party photos within the screenshots retain their individual original licenses; taking a screenshot does not make them the project author’s works. Credits for the cover photos visible in the gallery overview and the C200 reference photos are listed below. For other photos in the packs, see each [style-pack `package.json`](style-packs/packages/) and the website’s per-image source links. Sources for actual editing and conversation screenshots are recorded in the [workflow screenshot log](public/experience/SOURCES.md).

<details>
<summary>Gallery overview and C200 detail screenshots: photographers, original images, and licenses</summary>

Five cover photos in the overview:

| Style pack | Photographer / original image | License |
| --- | --- | --- |
| C200 | [Chipmunk LIN — 離鄉 / FUJIFILM C200](https://www.flickr.com/photos/130477966@N06/48806348736) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| NATURA 1600 | [Gemini st. — nightwalk](https://www.flickr.com/photos/79635710@N05/9758617445) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| PRO 160NS | [doca doca — 150315B7528PN160NS](https://www.flickr.com/photos/19924293@N08/16203711663/) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| PRO 400H | [Ustynskyi — Lisa](https://www.flickr.com/photos/99473925@N07/13223092445) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| PROVIA 100F | [Un ragazzo chiamato Bi — 3 colors and the moon](https://www.flickr.com/photos/57688343@N00/18029320402) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |

Ten reference photos in the C200 details (in the order of the [pack’s source records](style-packs/packages/fuji-film-c200/package.json)):

| No. | Photographer / original image | License |
| --- | --- | --- |
| 01 | [Chipmunk LIN — 離鄉 / FUJIFILM C200](https://www.flickr.com/photos/130477966@N06/48806348736) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| 02 | [Chipmunk LIN — 公園的小柴柴 / FUJIFILM C200](https://www.flickr.com/photos/130477966@N06/48805907483) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| 03 | [Sudipta Arka Das — ...](https://www.flickr.com/photos/34804966@N03/8044297521) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |
| 04 | [Dane Van — Edit -1-5](https://www.flickr.com/photos/11028609@N05/40348704133) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| 05 | [Toffee Maky — Jug and Glass](https://www.flickr.com/photos/86543134@N03/13442559963) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |
| 06 | [Chi Bellami — Postbox Trio](https://www.flickr.com/photos/46644449@N02/8128629297) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |
| 07 | [brenkee — Planned Nature](https://www.flickr.com/photos/55128416@N05/13088517763) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| 08 | [Dane Van — Edit -1-9](https://www.flickr.com/photos/11028609@N05/39899830840) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| 09 | [+AARON++ — 中央体育场 / 南京](https://www.flickr.com/photos/50704193@N07/8284339196) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |
| 10 | [Chi Bellami — RNLI Bembridge Lifeboat Station, Isle of Wight](https://www.flickr.com/photos/46644449@N02/46786107765) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |

Screenshots do not change the licenses of these photos. When redistributing images, retain their authors, sources, licenses, and notices of changes, and follow any applicable share-alike requirements.

</details>

Author and maintainer: [Reef Ruan (@ReefRuan)](https://github.com/ReefRuan) · [Bilibili](https://space.bilibili.com/2869626). If you enjoy conversational photo editing, please [Star the Lightroom MCP repository](https://github.com/ReefRuan/tonerelay-lightroom-mcp). Copyright (C) 2026 Reef Ruan.

The author’s code and text are licensed under [GNU AGPL-3.0-only](LICENSE); see [license scope](LICENSE-SCOPE.md) for coverage and third-party material exceptions. Photographic works belong to their respective original authors; the repository-level AGPL does not replace their original licenses. ToneRelay is an independent project, not an official Adobe product.

## Copy the installation prompt

Use the copy button in the top-right corner of the code block on GitHub, then paste it into your current Agent. This is a short entry point, not a second copy of the complete workflow. The full [installation prompt](docs/install-prompt.en.md) remains at its original path in this repository, alongside the MCP repository’s [INSTALL.en.md](https://github.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/INSTALL.en.md).

[Open Install and use →](https://reefruan.github.io/tonerelay-portal/?lang=en#experience) · [Open the full installation prompt →](docs/install-prompt.en.md) · [Gitee prompt fallback →](https://gitee.com/ReefRuan/tonerelay-portal/blob/main/docs/install-prompt.en.md)

```text
Please enable ToneRelay for Lightroom Classic in the current Agent client.
First read the full installation prompt: https://github.com/ReefRuan/tonerelay-portal/blob/main/docs/install-prompt.en.md
Documentation fallback: https://gitee.com/ReefRuan/tonerelay-portal/blob/main/docs/install-prompt.en.md
Follow its verification, authorization, and acceptance workflow; this short entry point is not the complete installation specification.

Identify the operating system, client, and existing installation. Prefer read-only verification of its source, pinned version, Runtime, Bridge, Lightroom plug-in, and Catalog authorization. If a healthy compatible installation exists, connect only the current client; do not incidentally reinstall or upgrade shared components.
Only when a download, repair, or explicitly authorized upgrade is needed, use the public source primary https://github.com/ReefRuan/tonerelay-lightroom-mcp or official source fallback https://gitee.com/ReefRuan/tonerelay-lightroom-mcp. Verify identity, public access, and a full commit (also verify a tag's resolved full commit), then read that version's INSTALL.en.md. This is a source preview, not a stable-installer or all-platform acceptance claim. Live GitHub access is not required when the mirror version and integrity can be verified. Report the selected source, full commit, and evidence; do not mix versions or assume main or the mirror is the latest. If verification fails, stop the installation-download branch and report it; documentation reading or verification and reuse of a healthy local installation can continue, without internal or third-party sources.
Using the current platform's and client's official entry points, complete the necessary Lightroom plug-in, MCP, and startup Skill connection where supported. Preserve other client configuration, photos, Catalogs, presets, and personal data. Obtain the authorization required by the full prompt before changing shared components, Catalog binding, or mode; do not make silent changes.
For passwords, login, or steps requiring the user's own confirmation, explain the minimum action and save progress. After setup, verify tool discovery, health, and current-photo readback in a real new client session using read-only operations. If you cannot create or observe that session, mark verification as pending and provide a handoff; do not declare success or modify photos or Catalog contents for acceptance.
```

<a href="https://reefruan.github.io/tonerelay-portal/?lang=en#experience"><kbd>Open Install &amp; use →</kbd></a> · [Read the full installation prompt →](docs/install-prompt.en.md)
