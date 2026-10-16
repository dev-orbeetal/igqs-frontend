import type { AdmissionFeeInfo, PaymentMethodInfo } from "@/lib/api";

export function PaymentInstructions({
  fee,
  methods,
  title,
  amountLabel,
  howTitle,
  steps,
  methodsTitle,
  notice,
}: {
  fee?: AdmissionFeeInfo | null;
  methods: PaymentMethodInfo[];
  title: string;
  amountLabel: string;
  howTitle: string;
  steps: string[];
  methodsTitle: string;
  notice: string;
}) {
  return (
    <section className="mb-10 space-y-8">
      {fee && (
        <div className="rounded-3xl bg-igqs-green px-6 py-8 text-center text-igqs-cream dark:bg-[#0b241c]">
          <p className="text-xs uppercase tracking-[0.28em] text-igqs-gold">{amountLabel}</p>
          <p className="mt-3 font-display text-4xl md:text-5xl">{fee.display}</p>
          <p className="mt-2 text-sm text-igqs-cream/75">{fee.label}</p>
        </div>
      )}

      <div>
        <h2 className="font-display text-3xl text-igqs-green dark:text-igqs-gold-soft">{howTitle}</h2>
        <ol className="mt-4 space-y-3">
          {steps.map((step, i) => (
            <li key={step} className="flex gap-3 rounded-2xl border border-igqs-gold/25 bg-white px-4 py-3 text-sm dark:bg-[#0d1f18]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-igqs-gold text-igqs-ink">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-igqs-muted">{notice}</p>
      </div>

      <div>
        <h2 className="font-display text-3xl text-igqs-green dark:text-igqs-gold-soft">{methodsTitle}</h2>
        <p className="mt-1 text-sm text-igqs-muted">{title}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {methods.map((method) => (
            <article
              key={method.code}
              className="rounded-3xl border border-igqs-gold/25 bg-white p-5 dark:bg-[#0d1f18]"
            >
              <h3 className="font-display text-2xl">{method.name}</h3>
              <div className="mt-3 grid gap-2">
                {(method.details ?? []).map((detail, index) => (
                  <p key={`${detail.label}-${index}`} className="text-sm leading-relaxed text-igqs-muted">
                    {detail.label ? <span className="text-igqs-gold">{detail.label}: </span> : null}
                    <span className="whitespace-pre-wrap">{detail.value}</span>
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
