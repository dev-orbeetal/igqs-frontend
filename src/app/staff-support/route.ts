import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Keeps the real webmail URL (an internal VPS IP:port) out of the client
// bundle — it's read server-side only and never shipped to the browser.
export function GET() {
  const url = process.env.STAFF_WEBMAIL_URL;
  if (!url) {
    return new Response("Staff webmail is not configured.", { status: 404 });
  }
  return NextResponse.redirect(url, { status: 307 });
}
