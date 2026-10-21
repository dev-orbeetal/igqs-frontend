/**
 * Checks the local (or SEO_BASE_URL) site for the technical SEO foundations.
 * Usage: npm run seo:check
 */
const base = (process.env.SEO_BASE_URL || "http://127.0.0.1:3355").replace(/\/$/, "");
const origin = (process.env.NEXT_PUBLIC_SITE_URL || "https://igqsbd.com").replace(/\/$/, "");

const failures = [];

function fail(message) {
  failures.push(message);
  console.error(`FAIL  ${message}`);
}

function pass(message) {
  console.log(`ok    ${message}`);
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`, "i"));
  return match?.[1] ?? "";
}

async function load(path, redirect = "follow") {
  const response = await fetch(`${base}${path}`, { redirect });
  const text = await response.text();
  return { response, text };
}

function canonicalPath(html) {
  const tag = html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i)?.[0] ?? "";
  const href = attr(tag, "href");
  if (!href) return null;
  try {
    return new URL(href);
  } catch {
    return null;
  }
}

async function main() {
  const home = await load("/");
  if (home.response.status !== 200) fail(`homepage status ${home.response.status}`);
  else pass("homepage returns 200");

  const title = home.text.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
  if (!title) fail("homepage is missing a title");
  else pass(`homepage title: ${title}`);

  const description =
    home.text.match(/<meta[^>]*name=["']description["'][^>]*>/i)?.[0] ?? "";
  if (!attr(description, "content")) fail("homepage is missing a meta description");
  else pass("homepage has a meta description");

  const canonical = canonicalPath(home.text);
  if (!canonical || canonical.origin !== origin || (canonical.pathname !== "/" && canonical.pathname !== "")) {
    fail(`homepage canonical is ${canonical?.href ?? "missing"} (expected ${origin}/)`);
  } else pass(`homepage canonical: ${canonical.href}`);

  if (/<meta[^>]*name=["']robots["'][^>]*noindex/i.test(home.text)) {
    fail("homepage is noindex");
  } else pass("homepage is indexable");

  const h1s = home.text.match(/<h1[\s>]/gi) ?? [];
  if (h1s.length !== 1) fail(`homepage has ${h1s.length} h1 elements`);
  else pass("homepage has one h1");

  if (!home.text.includes("EducationalOrganization")) {
    fail("homepage is missing EducationalOrganization structured data");
  } else pass("homepage has EducationalOrganization structured data");

  const robots = await load("/robots.txt");
  if (robots.response.status !== 200) fail(`robots.txt status ${robots.response.status}`);
  else if (!/allow:\s*\//i.test(robots.text) || !robots.text.includes(`${origin}/sitemap.xml`)) {
    fail("robots.txt does not allow / and point at the sitemap");
  } else pass("robots.txt allows / and lists the sitemap");

  const sitemap = await load("/sitemap.xml");
  if (sitemap.response.status !== 200) fail(`sitemap status ${sitemap.response.status}`);
  else {
    const locs = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    const required = [`${origin}/`, `${origin}/admission`];
    const forbidden = [`${origin}/login`, `${origin}/admission/receipt`];
    for (const url of required) {
      if (!locs.includes(url)) fail(`sitemap is missing ${url}`);
      else pass(`sitemap contains ${url}`);
    }
    for (const url of forbidden) {
      if (locs.includes(url)) fail(`sitemap includes ${url}`);
      else pass(`sitemap omits ${url}`);
    }
  }

  const missing = await load("/this-page-does-not-exist", "manual");
  if (missing.response.status !== 404) fail(`missing page status ${missing.response.status}`);
  else pass("missing page returns 404");

  for (const path of ["/login", "/admission/receipt"]) {
    const page = await load(path);
    if (!/noindex/i.test(page.text)) fail(`${path} is missing noindex`);
    else pass(`${path} is noindex`);
  }

  const about = await load("/about");
  const aboutCanonical = canonicalPath(about.text);
  if (aboutCanonical?.pathname !== "/about") {
    fail(`about canonical is ${aboutCanonical?.href ?? "missing"}`);
  } else pass("about canonical is /about");
  if ((about.text.match(/<h1[\s>]/gi) ?? []).length !== 1) fail("about page does not have one h1");
  else pass("about page has one h1");
  if (!about.text.includes("BreadcrumbList")) fail("about page is missing BreadcrumbList");
  else pass("about page has a breadcrumb");

  if (failures.length) {
    console.error(`\n${failures.length} check(s) failed`);
    process.exit(1);
  }
  console.log("\nSEO checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
