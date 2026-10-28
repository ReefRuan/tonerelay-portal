// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import { fileURLToPath } from "node:url";
import { syncInstallPrompts } from "./install-prompts.mjs";

await syncInstallPrompts(fileURLToPath(new URL("../", import.meta.url)), { check: process.argv.includes("--check") });
