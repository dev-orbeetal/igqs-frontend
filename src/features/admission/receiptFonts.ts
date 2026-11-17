import { Inter, Noto_Sans_Bengali, Noto_Sans_Mono, Noto_Serif } from "next/font/google";

/**
 * Faces for the admission receipt, matching the PDF the backend generates:
 * Inter for English, Noto Sans Bengali for Bangla (the browser shapes it,
 * so conjuncts and vowel signs join), Noto Serif for the title and footer
 * line, Noto Sans Mono for the transaction ID. Self-hosted by next/font, so
 * they are already loaded when the guardian prints.
 */
export const receiptSans = Inter({ subsets: ["latin"], variable: "--font-receipt-sans", display: "swap" });
export const receiptBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-receipt-bn",
  display: "swap",
});
export const receiptSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-receipt-serif",
  display: "swap",
});
export const receiptMono = Noto_Sans_Mono({ subsets: ["latin"], variable: "--font-receipt-mono", display: "swap" });

export const receiptFontVariables = [receiptSans, receiptBengali, receiptSerif, receiptMono]
  .map((font) => font.variable)
  .join(" ");
