import { proxyBackend } from "@/lib/backend-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(request: Request) {
  try {
    return await proxyBackend(request);
  } catch {
    return new Response("Backend media is unavailable.", { status: 502 });
  }
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
