import https from "node:https";
import { unstable_cache } from "next/cache";

const BACKEND_IP = process.env.BACKEND_IP ?? "84.247.174.208";
const BACKEND_HOST = process.env.BACKEND_HOST ?? "igqs.orbeetal.com";
const PUBLIC_ORIGIN = "https://igqsbd.com";

type BackendBody = { status: number; body: string };

function readBackend(path: string, redirectsLeft: number): Promise<BackendBody> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: BACKEND_IP,
        servername: BACKEND_HOST,
        method: "GET",
        path,
        headers: { host: BACKEND_HOST, accept: "application/json" },
        timeout: 15000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const status = res.statusCode ?? 502;
          const location = res.headers.location;
          const nextPath = Array.isArray(location) ? location[0] : location;
          if (
            redirectsLeft > 0 &&
            status >= 300 &&
            status < 400 &&
            nextPath?.startsWith("/")
          ) {
            resolve(readBackend(nextPath, redirectsLeft - 1));
            return;
          }
          const backendOrigin = `https://${BACKEND_HOST}`;
          const body = Buffer.concat(chunks)
            .toString("utf8")
            .replaceAll(backendOrigin, PUBLIC_ORIGIN)
            .replaceAll(`http://${BACKEND_HOST}`, PUBLIC_ORIGIN);
          resolve({ status, body });
        });
      },
    );
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("Backend timeout")));
    req.end();
  });
}

async function loadPublicApi(pathWithQuery: string) {
  const result = await readBackend(pathWithQuery, 1);
  if (result.status < 200 || result.status >= 300 || !result.body) return null;
  return result.body;
}

export const cachedPublicGet = unstable_cache(loadPublicApi, ["igqs-public-api"], {
  revalidate: 60,
});
