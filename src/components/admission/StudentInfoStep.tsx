"use client";

import { useTranslations } from "next-intl";
import { ImageFileInput } from "@/components/ui/ImageFileInput";
import { controlClass, fieldClass, fieldErrorClass, type WizardForm } from "./fields";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={fieldErrorClass}>{message}</p>;
}

export function StudentInfoStep({
  form,
  errors,
  classLabel,
  filesReady,
  onChange,
  onPhoto,
  onBirth,
}: {
  form: WizardForm;
  errors: Record<string, string>;
  classLabel: string;
  filesReady: { photo: boolean; birth: boolean };
  onChange: (name: string, value: string) => void;
  onPhoto: (file?: File) => void;
  onBirth: (file?: File) => void;
}) {
  const t = useTranslations("admission");
  const tc = useTranslations("common");

  return (
    <div className="grid gap-8">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl">{t("studentInfo")}</h2>
        <p className="mt-2 text-sm text-igqs-muted">{t("classRangeHint")}</p>
      </div>

      <section className="grid gap-4">
        <h3 className="font-display text-xl">{t("stepStudent")}</h3>
        <label className="text-sm">
          {t("studentName")}
          <input
            data-field="student_name"
            aria-invalid={Boolean(errors.student_name)}
            className={controlClass(Boolean(errors.student_name))}
            value={form.student_name ?? ""}
            onChange={(event) => onChange("student_name", event.target.value)}
            autoComplete="name"
          />
          <FieldError message={errors.student_name} />
        </label>
        <label className="text-sm">
          {t("studentNameBn")}
          <input
            data-field="student_name_bn"
            aria-invalid={Boolean(errors.student_name_bn)}
            className={controlClass(Boolean(errors.student_name_bn))}
            value={form.student_name_bn ?? ""}
            onChange={(event) => onChange("student_name_bn", event.target.value)}
          />
          <FieldError message={errors.student_name_bn} />
        </label>
        <label className="text-sm">
          {t("dob")}
          <input
            data-field="date_of_birth"
            aria-invalid={Boolean(errors.date_of_birth)}
            type="date"
            className={controlClass(Boolean(errors.date_of_birth))}
            value={form.date_of_birth ?? ""}
            onChange={(event) => onChange("date_of_birth", event.target.value)}
          />
          <FieldError message={errors.date_of_birth} />
        </label>
        <label className="text-sm">
          {t("gender")}
          <select
            data-field="gender"
            aria-invalid={Boolean(errors.gender)}
            className={controlClass(Boolean(errors.gender))}
            value={form.gender ?? ""}
            onChange={(event) => onChange("gender", event.target.value)}
          >
            <option value="">{t("selectGender")}</option>
            <option value="male">{t("male")}</option>
            <option value="female">{t("female")}</option>
          </select>
          <FieldError message={errors.gender} />
        </label>
        <label className="text-sm">
          {t("applyingClass")}
          <input className={`${fieldClass} bg-igqs-sand/40 dark:bg-white/5`} value={classLabel} readOnly />
        </label>
        <label className="text-sm">
          {t("previousClass")} <span className="text-igqs-muted">({tc("optional")})</span>
          <input
            className={fieldClass}
            value={form.previous_class ?? ""}
            onChange={(event) => onChange("previous_class", event.target.value)}
          />
        </label>
        <label className="text-sm">
          {t("address")}
          <textarea
            data-field="student_address"
            aria-invalid={Boolean(errors.student_address)}
            className={controlClass(Boolean(errors.student_address))}
            rows={3}
            value={form.student_address ?? ""}
            onChange={(event) => onChange("student_address", event.target.value)}
          />
          <FieldError message={errors.student_address} />
        </label>
        <label className="text-sm">
          {t("photo")}
          <ImageFileInput
            dataField="student_photo"
            invalid={Boolean(errors.student_photo)}
            onChange={onPhoto}
          />
          <span className="mt-1 block text-xs text-igqs-muted">
            {filesReady.photo ? t("fileHint") : t("reattachFiles")}
          </span>
          <FieldError message={errors.student_photo} />
        </label>
        <label className="text-sm">
          {t("birthCertificate")}
          <input
            data-field="birth_certificate"
            aria-invalid={Boolean(errors.birth_certificate)}
            type="file"
            className={`${controlClass(Boolean(errors.birth_certificate))} min-h-12`}
            onChange={(event) => onBirth(event.target.files?.[0])}
          />
          <span className="mt-1 block text-xs text-igqs-muted">{t("fileHint")}</span>
          <FieldError message={errors.birth_certificate} />
        </label>
      </section>

      <section className="grid gap-4">
        <h3 className="font-display text-xl">{t("guardianInfo")}</h3>
        <label className="text-sm">
          {t("fatherName")}
          <input
            data-field="father_name"
            aria-invalid={Boolean(errors.father_name)}
            className={controlClass(Boolean(errors.father_name))}
            value={form.father_name ?? ""}
            onChange={(event) => onChange("father_name", event.target.value)}
          />
          <FieldError message={errors.father_name} />
        </label>
        <label className="text-sm">
          {t("motherName")}
          <input
            data-field="mother_name"
            aria-invalid={Boolean(errors.mother_name)}
            className={controlClass(Boolean(errors.mother_name))}
            value={form.mother_name ?? ""}
            onChange={(event) => onChange("mother_name", event.target.value)}
          />
          <FieldError message={errors.mother_name} />
        </label>
        <label className="text-sm">
          {t("guardianName")}
          <input
            data-field="guardian_name"
            aria-invalid={Boolean(errors.guardian_name)}
            className={controlClass(Boolean(errors.guardian_name))}
            value={form.guardian_name ?? ""}
            onChange={(event) => onChange("guardian_name", event.target.value)}
          />
          <FieldError message={errors.guardian_name} />
        </label>
        <label className="text-sm">
          {t("fatherOccupation")}
          <input
            data-field="father_occupation"
            aria-invalid={Boolean(errors.father_occupation)}
            className={controlClass(Boolean(errors.father_occupation))}
            value={form.father_occupation ?? ""}
            onChange={(event) => onChange("father_occupation", event.target.value)}
          />
          <FieldError message={errors.father_occupation} />
        </label>
        <label className="text-sm">
          {t("motherOccupation")} <span className="text-igqs-muted">({tc("optional")})</span>
          <input
            className={fieldClass}
            value={form.mother_occupation ?? ""}
            onChange={(event) => onChange("mother_occupation", event.target.value)}
          />
        </label>
        <label className="text-sm">
          {t("mobile")}
          <input
            data-field="mobile"
            aria-invalid={Boolean(errors.mobile)}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            className={controlClass(Boolean(errors.mobile))}
            value={form.mobile ?? ""}
            onChange={(event) => onChange("mobile", event.target.value)}
          />
          <FieldError message={errors.mobile} />
        </label>
        <label className="text-sm">
          {t("email")}
          <input
            data-field="email"
            aria-invalid={Boolean(errors.email)}
            type="email"
            autoComplete="email"
            className={controlClass(Boolean(errors.email))}
            value={form.email ?? ""}
            onChange={(event) => onChange("email", event.target.value)}
          />
          <FieldError message={errors.email} />
        </label>
        <label className="text-sm">
          {t("guardianAddress")}
          <textarea
            data-field="guardian_address"
            aria-invalid={Boolean(errors.guardian_address)}
            className={controlClass(Boolean(errors.guardian_address))}
            rows={3}
            value={form.guardian_address ?? ""}
            onChange={(event) => onChange("guardian_address", event.target.value)}
          />
          <FieldError message={errors.guardian_address} />
        </label>
        <label className="text-sm">
          {t("emergency")}
          <input
            data-field="emergency_contact"
            aria-invalid={Boolean(errors.emergency_contact)}
            className={controlClass(Boolean(errors.emergency_contact))}
            value={form.emergency_contact ?? ""}
            onChange={(event) => onChange("emergency_contact", event.target.value)}
          />
          <FieldError message={errors.emergency_contact} />
        </label>
      </section>

      <section className="grid gap-4">
        <h3 className="font-display text-xl">{t("moreInfo")}</h3>
        <label className="text-sm">
          {t("previousAcademic")} <span className="text-igqs-muted">({tc("optional")})</span>
          <textarea
            className={fieldClass}
            rows={3}
            value={form.previous_academic_info ?? ""}
            onChange={(event) => onChange("previous_academic_info", event.target.value)}
          />
        </label>
        <label className="text-sm">
          {t("special")} <span className="text-igqs-muted">({tc("optional")})</span>
          <textarea
            className={fieldClass}
            rows={3}
            value={form.special_requirements ?? ""}
            onChange={(event) => onChange("special_requirements", event.target.value)}
          />
        </label>
      </section>
    </div>
  );
}
