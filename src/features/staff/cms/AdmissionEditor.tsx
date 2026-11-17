"use client";

import { useTranslations } from "next-intl";
import { admissionInfoFields, defaultFeeFields } from "@/lib/cms/fields";
import { SectionNav } from "./CmsFields";
import { Card } from "./CmsChrome";
import { type AdmissionPanel } from "./panels";
import { CollectionBlock } from "./CollectionBlock";
import { PaymentMethodsEditor } from "./PaymentMethodsEditor";
import { SingletonBlock } from "./SingletonBlock";

export function AdmissionEditor({ panel }: { panel?: AdmissionPanel }) {
  const t = useTranslations("cms");
  const current = panel ?? "info";
  const sections = [
    { id: "admission-info", label: t("admissionInfo"), href: "/content/admission" },
    { id: "default-fee", label: t("defaultFee"), href: "/content/admission/fees" },
    { id: "payments", label: t("payments"), href: "/content/admission/payments" },
  ];
  return (
    <div>
      <SectionNav sections={sections} />
      <div className="space-y-6">
        {current === "info" && (
          <Card id="admission-info" title={t("admissionInfo")}>
            <SingletonBlock path="/api/staff/site/" fields={admissionInfoFields} />
          </Card>
        )}
        {current === "fees" && (
          <Card id="default-fee" title={t("defaultFee")}>
            <p className="-mt-2 mb-4 text-sm text-igqs-muted">{t("defaultFeeHint")}</p>
            <CollectionBlock
              path="/api/staff/fees/"
              fields={defaultFeeFields}
              titleField="label_en"
              defaults={{ currency: "BDT", is_active: true }}
            />
          </Card>
        )}
        {current === "payments" && (
          <Card id="payments" title={t("payments")}>
            <PaymentMethodsEditor />
          </Card>
        )}
      </div>
    </div>
  );
}
