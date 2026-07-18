/**
 * ScanBusinessCard blog renderer — Netlify Edge Function.
 *
 * Serves /blog and /blog/:slug as fully server-rendered HTML so search engines
 * and AI answer engines get real content with no JavaScript. This is the
 * equivalent of WiseFunnel's og-renderer service: it returns the pre-rendered
 * `body_html` written by the daily pipeline.
 *
 * Install:
 *   1. Copy this file to  netlify/edge-functions/blog.ts  in the
 *      scanbusinesscard repo.
 *   2. Add to netlify.toml:
 *        [[edge_functions]]
 *          path = "/blog"
 *          function = "blog"
 *        [[edge_functions]]
 *          path = "/blog/*"
 *          function = "blog"
 *   3. Set env vars in Netlify: SUPABASE_URL, SUPABASE_ANON_KEY
 *      (anon key is correct here — RLS exposes published posts only).
 */

const SUPABASE_URL =
  Deno.env.get("SUPABASE_URL") ?? "https://yvfutrzyckkeikwstovq.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SITE = "https://scanbusinesscard.com";

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

async function sb(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) return null;
  return await res.json();
}

const STYLES = `
:root{--ink:#111827;--muted:#6b7280;--line:#e5e7eb;--accent:#f97316;--bg:#fff}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
  font:16px/1.7 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.wrap{max-width:760px;margin:0 auto;padding:48px 20px 96px}
a{color:var(--accent)}
h1{font-size:2.25rem;line-height:1.2;letter-spacing:-.02em;margin:.2em 0 .3em}
h2{font-size:1.5rem;line-height:1.3;margin:2.2em 0 .6em;scroll-margin-top:80px}
h3{font-size:1.15rem;margin:1.6em 0 .4em}
.meta{color:var(--muted);font-size:.9rem;margin-bottom:2rem}
.dek{font-size:1.15rem;color:#374151;margin-bottom:1.5rem}
.tldr{background:#fff7ed;border:1px solid #fed7aa;border-left:4px solid var(--accent);
  border-radius:10px;padding:18px 20px;margin:0 0 2rem}
.tldr h2{margin:0 0 .5em;font-size:1rem;text-transform:uppercase;
  letter-spacing:.06em;color:#9a3412}
table{width:100%;border-collapse:collapse;margin:1.5rem 0}
th,td{border:1px solid var(--line);padding:10px 12px;text-align:left;font-size:.95rem}
th{background:#f9fafb}
blockquote{border-left:3px solid var(--line);margin:1.5rem 0;padding:.2rem 0 .2rem 1rem;color:#374151}
code{background:#f3f4f6;padding:2px 5px;border-radius:4px;font-size:.9em}
.cta{margin:3rem 0 0;padding:28px;border-radius:14px;background:#111827;color:#fff;text-align:center}
.cta a{display:inline-block;margin-top:12px;background:var(--accent);color:#fff;
  padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600}
.card{display:block;border:1px solid var(--line);border-radius:12px;padding:20px;
  margin-bottom:14px;text-decoration:none;color:inherit}
.card:hover{border-color:var(--accent)}
.card h2{margin:0 0 .3em;font-size:1.15rem}
.card p{margin:0;color:var(--muted);font-size:.95rem}
footer{margin-top:4rem;padding-top:1.5rem;border-top:1px solid var(--line);
  color:var(--muted);font-size:.875rem}
`;

function shell(opts: {
  title: string; desc: string; canonical: string; body: string;
  jsonld?: string; og?: string;
}) {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(opts.title)}</title>
<meta name="description" content="${esc(opts.desc)}">
<link rel="canonical" href="${esc(opts.canonical)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(opts.title)}">
<meta property="og:description" content="${esc(opts.desc)}">
<meta property="og:url" content="${esc(opts.canonical)}">
${opts.og ? `<meta property="og:image" content="${esc(opts.og)}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.png" type="image/png">
${opts.jsonld ? `<script type="application/ld+json">${opts.jsonld}</script>` : ""}
<style>${STYLES}</style></head>
<body><div class="wrap">${opts.body}
<footer><a href="/">ScanBusinessCard</a> &middot; <a href="/blog">Blog</a>
&middot; <a href="/pricing">Pricing</a></footer></div></body></html>`;
}

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const parts = url.pathname.replace(/\/+$/, "").split("/").filter(Boolean);

  // ---------- /blog/:slug ----------
  if (parts.length === 2 && parts[0] === "blog") {
    const slug = parts[1];
    const rows = await sb(
      `blog_posts?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=*&limit=1`,
    );
    const post = rows?.[0];
    if (!post) return new Response("Not found", { status: 404 });

    const canonical = post.canonical_url || `${SITE}/blog/${post.slug}`;
    const body = `
<nav class="meta"><a href="/blog">&larr; Blog</a></nav>
<h1>${esc(post.title)}</h1>
${post.excerpt ? `<p class="dek">${esc(post.excerpt)}</p>` : ""}
<p class="meta">By ${esc(post.author_name || "ScanBusinessCard")}${
      post.author_role ? `, ${esc(post.author_role)}` : ""
    }${post.published_at ? ` &middot; ${new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}` : ""}${
      post.read_time ? ` &middot; ${esc(post.read_time)}` : ""
    }</p>
${post.body_html || "<p>This post is being updated.</p>"}
<div class="cta"><strong>Scan 20+ business cards in one photo.</strong>
<div>Turn a stack of cards into CRM-ready leads before you leave the venue.</div>
<a href="/auth">Start free</a></div>`;

    return new Response(
      shell({
        title: post.seo_title || post.title,
        desc: post.seo_description || post.excerpt || "",
        canonical,
        og: post.og_image_url || post.cover_image_url,
        jsonld: post.schema_json || undefined,
        body,
      }),
      {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, max-age=0, s-maxage=600, stale-while-revalidate=86400",
          link: '</.well-known/api-catalog>; rel="api-catalog", </llms.txt>; rel="describedby"',
        },
      },
    );
  }

  // ---------- /blog index ----------
  if (parts.length === 1 && parts[0] === "blog") {
    const rows =
      (await sb(
        "blog_posts?status=eq.published&select=slug,title,excerpt,published_at,read_time&order=published_at.desc&limit=50",
      )) ?? [];

    const cards = rows.length
      ? rows
          .map(
            (p: Record<string, unknown>) => `<a class="card" href="/blog/${esc(p.slug)}">
<h2>${esc(p.title)}</h2><p>${esc(p.excerpt ?? "")}</p></a>`,
          )
          .join("\n")
      : "<p>No posts published yet.</p>";

    const itemList = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "ScanBusinessCard Blog",
      url: `${SITE}/blog`,
      blogPost: rows.map((p: Record<string, unknown>) => ({
        "@type": "BlogPosting",
        headline: p.title,
        url: `${SITE}/blog/${p.slug}`,
        datePublished: p.published_at,
      })),
    });

    return new Response(
      shell({
        title: "Blog | ScanBusinessCard",
        desc:
          "Guides on bulk business card scanning, trade show lead capture, and getting event leads into your CRM fast.",
        canonical: `${SITE}/blog`,
        jsonld: itemList,
        body: `<h1>Blog</h1><p class="dek">Bulk business card scanning, trade show lead capture, and post-event follow-up.</p>${cards}`,
      }),
      {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
        },
      },
    );
  }

  return new Response("Not found", { status: 404 });
}
