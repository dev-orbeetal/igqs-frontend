"use client";

import { useTranslations } from "next-intl";
import { ImageFileInput } from "@/components/ui/ImageFileInput";
import { controlClass, fieldClass, fieldErrorClass, type WizardForm } from "./fields";

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className={fieldErrorClass}>
      {message}
    </p>
  );
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
            aria-describedby={errors.student_name ? "error-student_name" : undefined}
            className={controlClass(Boolean(errors.student_name))}
            value={form.student_name ?? ""}
            onChange={(event) => onChange("student_name", event.target.value)}
            autoComplete="name"
          />
          <FieldError id="error-student_name" message={errors.student_name} />
        </label>
        <label className="text-sm">
          {t("studentNameBn")}
          <input
            data-field="student_name_bn"
            aria-invalid={Boolean(errors.student_name_bn)}
            aria-describedby={errors.student_name_bn ? "error-student_name_bn" : undefined}
            className={controlClass(Boolean(errors.student_name_bn))}
            value={form.student_name_bn ?? ""}
            onChange={(event) => onChange("student_name_bn", event.target.value)}
          />
          <FieldError id="error-student_name_bn" message={errors.student_name_bn} />
        </label>
        <label className="text-sm">
          {t("dob")}
          <input
            data-field="date_of_birth"
            aria-invalid={Boolean(errors.date_of_birth)}
            aria-describedby={errors.date_of_birth ? "error-date_of_birth" : undefined}
            type="date"
            className={controlClass(Boolean(errors.date_of_birth))}
            value={form.date_of_birth ?? ""}
            onChange={(event) => onChange("date_of_birth", event.target.value)}
          />
          <FieldError id="error-date_of_birth" message={errors.date_of_birth} />
        </label>
        <label className="text-sm">
          {t("gender")}
          <select
            data-field="gender"
            aria-invalid={Boolean(errors.gender)}
            aria-describedby={errors.gender ? "error-gender" : undefined}
            className={controlClass(Boolean(errors.gender))}
            value={form.gender ?? ""}
            onChange={(event) => onChange("gender", event.target.value)}
          >
            <option value="">{t("selectGender")}</option>
            <option value="male">{t("male")}</option>
            <option value="female">{t("female")}</option>
          </select>
          <FieldError id="error-gender" message={errors.gender} />
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
            aria-describedby={errors.student_address ? "error-student_address" : undefined}
            className={controlClass(Boolean(errors.student_address))}
            rows={3}
            value={form.student_address ?? ""}
            onChange={(event) => onChange("student_address", event.target.value)}
          />
          <FieldError id="error-student_address" message={errors.student_address} />
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
          <FieldError id="error-student_photo" message={errors.student_photo} />
        </label>
        <label className="text-sm">
          {t("birthCertificate")}
          <input
            data-field="birth_certificate"
            aria-invalid={Boolean(errors.birth_certificate)}
            aria-describedby={errors.birth_certificate ? "error-birth_certificate" : undefined}
            type="file"
            className={`${controlClass(Boolean(errors.birth_certificate))} min-h-12`}
            onChange={(event) => onBirth(event.target.files?.[0])}
          />
          <span className="mt-1 block text-xs text-igqs-muted">{t("fileHint")}</span>
          <FieldError id="error-birth_certificate" message={errors.birth_certificate} />
        </label>
      </section>

      <section className="grid gap-4">
        <h3 className="font-display text-xl">{t("guardianInfo")}</h3>
        <label className="text-sm">
          {t("fatherName")}
          <input
            data-field="father_name"
            aria-invalid={Boolean(errors.father_name)}
            aria-describedby={errors.father_name ? "error-father_name" : undefined}
            className={controlClass(Boolean(errors.father_name))}
            value={form.father_name ?? ""}
            onChange={(event) => onChange("father_name", event.target.value)}
          />
          <FieldError id="error-father_name" message={errors.father_name} />
        </label>
        <label className="text-sm">
          {t("motherName")}
          <input
            data-field="mother_name"
            aria-invalid={Boolean(errors.mother_name)}
            aria-describedby={errors.mother_name ? "error-mother_name" : undefined}
            className={controlClass(Boolean(errors.mother_name))}
            value={form.mother_name ?? ""}
            onChange={(event) => onChange("mother_name", event.target.value)}
          />
          <FieldError id="error-mother_name" message={errors.mother_name} />
        </label>
        <label className="text-sm">
          {t("guardianName")}
          <input
            data-field="guardian_name"
            aria-invalid={Boolean(errors.guardian_name)}
            aria-describedby={errors.guardian_name ? "error-guardian_name" : undefined}
            className={controlClass(Boolean(errors.guardian_name))}
            value={form.guardian_name ?? ""}
            onChange={(event) => onChange("guardian_name", event.target.value)}
          />
          <FieldError id="error-guardian_name" message={errors.guardian_name} />
        </label>
        <label className="text-sm">
          {t("fatherOccupation")}
          <input
            data-field="father_occupation"
            aria-invalid={Boolean(errors.father_occupation)}
            aria-describedby={errors.father_occupation ? "error-father_occupation" : undefined}
            className={controlClass(Boolean(errors.father_occupation))}
            value={form.father_occupation ?? ""}
            onChange={(event) => onChange("father_occupation", event.target.value)}
          />
          <FieldError id="error-father_occupation" message={errors.father_occupation} />
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
            aria-describedby={errors.mobile ? "error-mobile" : undefined}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            className={controlClass(Boolean(errors.mobile))}
            value={form.mobile ?? ""}
            onChange={(event) => onChange("mobile", event.target.value)}
          />
          <FieldError id="error-mobile" message={errors.mobile} />
        </label>
        <label className="text-sm">
          {t("email")}
          <input
            data-field="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "error-email" : undefined}
            type="email"
            autoComplete="email"
            className={controlClass(Boolean(errors.email))}
            value={form.email ?? ""}
            onChange={(event) => onChange("email", event.target.value)}
          />
          <FieldError id="error-email" message={errors.email} />
        </label>
        <label className="text-sm">
          {t("guardianAddress")}
          <textarea
            data-field="guardian_address"
            aria-invalid={Boolean(errors.guardian_address)}
            aria-describedby={errors.guardian_address ? "error-guardian_address" : undefined}
            className={controlClass(Boolean(errors.guardian_address))}
            rows={3}
            value={form.guardian_address ?? ""}
            onChange={(event) => onChange("guardian_address", event.target.value)}
          />
          <FieldError id="error-guardian_address" message={errors.guardian_address} />
        </label>
        <label className="text-sm">
          {t("emergency")}
          <input
            data-field="emergency_contact"
            aria-invalid={Boolean(errors.emergency_contact)}
            aria-describedby={errors.emergency_contact ? "error-emergency_contact" : undefined}
            className={controlClass(Boolean(errors.emergency_contact))}
            value={form.emergency_contact ?? ""}
            onChange={(event) => onChange("emergency_contact", event.target.value)}
          />
          <FieldError id="error-emergency_contact" message={errors.emergency_contact} />
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
