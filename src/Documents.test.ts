import { describe, expect, it } from "vitest";
import { INSTALL_PROMPT, UNINSTALL_PROMPT, INSTALL_PROMPT_DOCUMENT } from "./Documents";
describe("installation document payloads", () => {
  it("copies only the installation section for installation", () => {
    expect(INSTALL_PROMPT_DOCUMENT).toContain(INSTALL_PROMPT);
    expect(INSTALL_PROMPT).not.toContain("## 卸载或干净重装准备");
    expect(INSTALL_PROMPT).not.toContain(UNINSTALL_PROMPT);
  });
  it("keeps uninstallation separate from installation", () => {
    expect(INSTALL_PROMPT_DOCUMENT).toContain(UNINSTALL_PROMPT);
    expect(UNINSTALL_PROMPT).not.toContain(INSTALL_PROMPT);
    expect(UNINSTALL_PROMPT).not.toContain("## 常见问题");
  });
});
