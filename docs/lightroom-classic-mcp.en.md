# Lightroom MCP: Select and Edit Photos Through Conversation

[Chinese](https://github.com/ReefRuan/tonerelay-portal/blob/main/docs/lightroom-classic-mcp.md) | [English](https://github.com/ReefRuan/tonerelay-portal/blob/main/docs/lightroom-classic-mcp.en.md)

## What is ToneRelay?

ToneRelay is a local MCP toolkit that connects an Agent to Adobe Lightroom Classic. You describe your photo-selection or editing goal, and the Agent decides how to adjust the image. ToneRelay executes operations through a Lightroom plug-in, returns actual parameter values and rendered previews, and also provides image measurement and comparison tools.

MCP is a way for Agents to call external tools. After ToneRelay is installed, an Agent can use these tools to read photos, adjust parameters, and inspect results, reducing the steps spent finding buttons and dragging sliders in Lightroom. Lightroom Classic must remain running, but does not need to stay in the foreground.

## How to use it

1. Connect ToneRelay in your Agent client, then open Lightroom Classic and the Catalog you want to use.
2. Ask the Agent to inspect the currently selected photo, or browse the entire folder first.
3. Describe the result you want and inspect the preview actually rendered by Lightroom.
4. Say what needs changing next. You can also ask to zoom in on details or compare different versions.

For example: “Use this reference photo's colors to adjust the current photo, and show me a first version.” After viewing the result, continue: “Brighten the shadows a little more, keep the skin from looking yellow, and show me a before-and-after comparison.”

## What can it do?

- **Browse and select photos**: read the current selection, folder thumbnails, and photo previews so the Agent can inspect images individually.
- **Adjust the image and local areas**: use Develop parameters and subject masks to adjust photos and inspect results on virtual copies.
- **Organize in batches**: set star ratings, flags, or color labels according to your criteria, writing the results back to the Lightroom Catalog.
- **Try multiple color treatments**: submit multiple explicit parameter sets, render them one by one in the background, then compare results.
- **Measure and compare**: inspect values such as brightness and color, and compare before-and-after adjustments or different candidates.

The tools execute operations and read results back; the Agent uses the photos and your feedback to decide the next step. You can also download style and effect packs made by Reef from the gallery and give their instructions and reference images to the Agent.

## Get started

Open [Install & use](https://reefruan.github.io/tonerelay-portal/?lang=en#experience) to see real examples, then copy the complete installation prompt and FAQ to your Agent. You can also read and copy the [installation prompt](https://github.com/ReefRuan/tonerelay-portal/blob/main/docs/install-prompt.en.md) directly from its original location on GitHub. The Agent first checks existing local components, connects only the new client when a healthy installation already exists, and verifies the official source and pins the version when a download is needed. Follow [INSTALL.en.md in the MCP repository](https://github.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/INSTALL.en.md) for installation steps and requirements; see [USAGE.en.md](https://github.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/USAGE.en.md) for editing workflows. A source preview does not mean that a stable installer has been released or that all platforms have passed acceptance checks.

On first connection, confirm which Lightroom Catalog to use. Develop adjustments use virtual copies; organizational actions such as ratings and flags write to the Catalog.

For connection and troubleshooting, see Portal's [FAQ](https://github.com/ReefRuan/tonerelay-portal/blob/main/docs/faq.en.md); for removal, see the [uninstallation prompt](https://github.com/ReefRuan/tonerelay-portal/blob/main/docs/uninstall-prompt.en.md). These documents remain at their original location in Portal. For tool details, read the [MCP tool overview (Chinese)](https://github.com/ReefRuan/tonerelay-portal/blob/main/docs/mcp-tools-overview.md).

If you like this workflow, [Star the MCP repository](https://github.com/ReefRuan/tonerelay-lightroom-mcp). Continue browsing the [Portal style and effect gallery](https://reefruan.github.io/tonerelay-portal/?lang=en#gallery), or follow the author's [Bilibili profile](https://space.bilibili.com/2869626).

## Next: install ToneRelay

[Open Install & use](https://reefruan.github.io/tonerelay-portal/?lang=en#experience) · [Read and copy the installation prompt on GitHub](https://github.com/ReefRuan/tonerelay-portal/blob/main/docs/install-prompt.en.md)

Send the prompt to your Agent so it can verify the version, permissions, and existing installation before proceeding. Copying the prompt does not complete installation.
