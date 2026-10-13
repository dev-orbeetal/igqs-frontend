"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function ImageFileInput({
  accept = "image/*",
  invalid,
  dataField,
  multiple,
  disabled,
  onChange,
  onFiles,
}: {
  accept?: string;
  invalid?: boolean;
  dataField?: string;
  multiple?: boolean;
  disabled?: boolean;
  onChange?: (file?: File) => void;
  onFiles?: (files: File[]) => void;
}) {
  const t = useTranslations("common");
  const [name, setName] = useState("");

  return (
    <label
      data-field={dataField}
      className={`mt-1.5 flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm dark:bg-[#0d1f18] ${
        invalid ? "border-red-500 ring-1 ring-red-500" : "border-igqs-gold/30"
      }`}
    >
      <span className="font-bold">{t("chooseFile")}</span>
      <span className="min-w-0 truncate text-igqs-muted">{name || t("noFileChosen")}</span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          setName(files.length > 1 ? `${files.length}` : (files[0]?.name ?? ""));
          onChange?.(files[0]);
          onFiles?.(files);
        }}
      />
    </label>
  );
}
