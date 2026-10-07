/** Copy only reports success when the browser confirms it. */
export async function copyText(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
    const input = document.createElement("textarea");
    input.value = value;
    input.style.position = "fixed";
    input.style.opacity = "0";
    const previous = document.activeElement as HTMLElement | null;
    try {
      document.body.appendChild(input);
      input.select();
      if (!document.execCommand("copy")) throw new Error("Copy was rejected");
    } finally {
      input.remove();
      previous?.focus();
    }
  }
}
