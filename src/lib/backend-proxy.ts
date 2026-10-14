import type { IncomingHttpHeaders } from "node:http";
import https from "node:https";
import { NextResponse } from "next/server";

const BACKEND_IP = process.env.BACKEND_IP ?? "84.247.174.208";
const BACKEND_HOST = process.env.BACKEND_HOST ?? "igqs.orbeetal.com";

const DROPPED_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "accept-encoding",
]);

type BackendResult = {
  status: number;
  headers: IncomingHttpHeaders;
  body: Buffer;
};

function requestBackend(
  method: string,
  path: string,
  headers: Record<string, string>,
  body?: Buffer,
): Promise<BackendResult> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: BACKEND_IP,
        servername: BACKEND_HOST,
        method,
        path,
        headers: { ...headers, host: BACKEND_HOST },
        timeout: 15000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 502,
            headers: res.headers,
            body: Buffer.concat(chunks),
          }),
        );
      },
    );
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("Backend timeout")));
    if (body && body.length > 0) req.write(body);
    req.end();
  });
}

function headerValue(value: string | string[] | undefined) {
  if (!value) return "";
  return Array.isArray(value) ? value.join(", ") : value;
}

function headerEntries(headers: IncomingHttpHeaders) {
  return Object.entries(headers).filter(
    (entry): entry is [string, string | string[]] => entry[1] != null,
  );
}

export async function proxyBackend(request: Request) {
  const incoming = new URL(request.url);
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (!DROPPED_HEADERS.has(key.toLowerCase())) headers[key] = value;
  });

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? Buffer.from(await request.arrayBuffer()) : undefined;

  let path = `${incoming.pathname}${incoming.search}`;
  let result = await requestBackend(request.method, path, headers, body);
  const location = headerValue(result.headers.location);
  if (result.status >= 300 && result.status < 400 && location.startsWith("/")) {
    path = location;
    result = await requestBackend(request.method, path, headers, body);
  }

  const origin = incoming.origin;
  const backendOrigin = `https://${BACKEND_HOST}`;
  const outHeaders = new Headers();
  for (const [key, value] of headerEntries(result.headers)) {
    if (DROPPED_HEADERS.has(key.toLowerCase())) continue;
    outHeaders.set(key, headerValue(value).replaceAll(backendOrigin, origin));
  }

  const type = outHeaders.get("content-type") ?? "";
  const payload =
    type.includes("json") || type.startsWith("text/")
      ? result.body.toString("utf8").replaceAll(backendOrigin, origin)
      : new Uint8Array(result.body);

  return new NextResponse(payload, { status: result.status, headers: outHeaders });
}
