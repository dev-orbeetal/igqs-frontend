"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

function acceptedFiles(files: File[], accept: string, multiple?: boolean) {
  const rules = accept.split(",").map((rule) => rule.trim().toLowerCase()).filter(Boolean);
  const matched = files.filter((file) => {
    if (rules.length === 0 || rules.includes("*") || rules.includes("*/*")) return true;
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    return rules.some((rule) => {
      if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
      if (rule.startsWith(".")) return name.endsWith(rule);
      return type === rule;
    });
  });
  return multiple ? matched : matched.slice(0, 1);
}

export function ImageFileInput({
  accept = "image/*",
  invalid,
  dataField,
  describedBy,
  multiple,
  disabled,
  filled,
  onChange,
  onFiles,
}: {
  accept?: string;
  invalid?: boolean;
  dataField?: string;
  describedBy?: string;
  multiple?: boolean;
  disabled?: boolean;
  filled?: boolean;
  onChange?: (file?: File) => void;
  onFiles?: (files: File[]) => void;
}) {
  const t = useTranslations("common");
  const [name, setName] = useState("");
  const [over, setOver] = useState(false);
  const isImage = accept.split(",")[0]?.trim().startsWith("image") ?? false;

  function apply(files: File[]) {
    const next = acceptedFiles(files, accept, multiple);
    if (next.length === 0) return;
    setName(next.length > 1 ? t("filesChosen", { count: next.length }) : next[0].name);
    onChange?.(next[0]);
    onFiles?.(next);
  }

  const hint = name || (isImage ? t(filled ? "replaceImage" : "dropImage") : t("noFileChosen"));

  return (
    <label
      data-field={dataField}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        if (disabled) return;
        apply(Array.from(event.dataTransfer.files));
      }}
      className={`mt-1.5 flex cursor-pointer gap-1 rounded-2xl border bg-white text-sm dark:bg-[#0d1f18] ${
        isImage
          ? "min-h-32 flex-col items-center justify-center border-dashed px-6 py-6 text-center"
          : "min-h-12 flex-row items-center px-4 py-3"
      } ${
        invalid
          ? "border-red-600 ring-1 ring-red-600"
          : over
            ? "border-igqs-gold bg-igqs-gold/15"
            : "border-igqs-border-strong dark:border-igqs-gold/70"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <span className="font-bold text-igqs-green dark:text-igqs-gold-soft">{over ? t("dropNow") : t("chooseFile")}</span>
      <span className="min-w-0 truncate text-igqs-muted">{hint}</span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        className="sr-only"
        onChange={(event) => {
          apply(Array.from(event.currentTarget.files ?? []));
          event.currentTarget.value = "";
        }}
      />
    </label>
  );
}
