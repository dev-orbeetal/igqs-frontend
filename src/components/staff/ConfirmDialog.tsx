"use client";

import { useEffect, useRef } from "react";
import { btn } from "@/components/staff/buttons";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = "danger",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="w-[min(100%-2rem,28rem)] rounded-2xl border border-igqs-gold/30 bg-white p-6 text-igqs-ink backdrop:bg-black/40 dark:bg-[#0d1f18] dark:text-igqs-sand"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mt-2 text-sm text-igqs-muted">{message}</p>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          autoFocus
          className={btn.secondary}
          onClick={onCancel}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={tone === "danger" ? btn.danger : btn.primary}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
