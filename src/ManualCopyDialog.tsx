import { useEffect, useRef } from "react";
import { useLanguage } from "./i18n";

export function ManualCopyDialog({ value, onClose }: { value: string; onClose: () => void }) {
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    inputRef.current?.focus();
    inputRef.current?.select();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  return (
    <dialog ref={dialogRef} className="agent-dialog manual-copy-dialog" aria-labelledby="manual-copy-title" onCancel={onClose}>
      <div className="agent-dialog-topline"><strong id="manual-copy-title">{t("请手动复制", "Please copy manually")}</strong><button onClick={onClose} aria-label={t("关闭手动复制", "Close manual copy dialog")}>{t("关闭", "Close")}</button></div>
      <p>{t("自动复制失败。选中以下内容，使用系统复制命令。", "Automatic copying failed. Select the text below and use your system's copy command.")}</p>
      <textarea ref={inputRef} aria-label={t("待复制内容", "Text to copy")} readOnly value={value} onFocus={(event) => event.currentTarget.select()} />
    </dialog>
  );
}
