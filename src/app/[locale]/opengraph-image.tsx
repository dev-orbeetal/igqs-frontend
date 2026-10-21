import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const alt = "Ideal Global Quranic School";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  // The share image uses the English name. The image renderer does not shape
  // Bengali vowels correctly, and a broken title is worse than a readable one.
  // Search titles stay in Bangla in the HTML.
  const t = await getTranslations({ locale: "en", namespace: "meta" });
  const [geist, logo] = await Promise.all([
    readFile(join(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf")),
    readFile(join(process.cwd(), "public/brand/igqs-logo-256.png")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0b241c",
          color: "#f6f1e7",
          padding: "72px 80px",
        }}
      >
        <img src={logoSrc} width={96} height={93} alt="" />
        <div
          style={{
            display: "flex",
            fontSize: 64,
            lineHeight: 1.15,
            marginTop: 36,
            maxWidth: 980,
          }}
        >
          {t("title")}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            lineHeight: 1.4,
            marginTop: 28,
            maxWidth: 920,
            color: "#e6d3a3",
          }}
        >
          {t("description")}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Geist", data: geist, weight: 400, style: "normal" }],
    },
  );
}
