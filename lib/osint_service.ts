import Parser from "rss-parser";
import type { MissingPerson } from "./types";

const rssParser = new Parser({ timeout: 8000 });

export interface NewsResult {
  title: string;
  url: string;
  summary: string;
  source: string;
  published_at: string | null;
  search_query: string;
}

export interface SocialResult {
  source: string;
  content: string;
  location: string | null;
  url: string | null;
  posted_at: string | null;
}

/**
 * Run multiple Google News RSS searches and dedupe by article URL.
 */
export async function searchNewsMulti(
  queries: string[],
  maxResults = 10
): Promise<NewsResult[]> {
  const uniqueQueries = [...new Set(queries.map((q) => q.trim()).filter(Boolean))];
  if (uniqueQueries.length === 0) return [];

  const batches = await Promise.all(
    uniqueQueries.map((q) => searchNewsQuery(q))
  );

  const seen = new Set<string>();
  const merged: NewsResult[] = [];
  for (const batch of batches) {
    for (const item of batch) {
      const key = item.url || item.title;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
      if (merged.length >= maxResults) return merged;
    }
  }
  return merged;
}

/** Single-query Google News RSS search (public feed, no API key). */
export async function searchNewsQuery(query: string): Promise<NewsResult[]> {
  const q = encodeURIComponent(query.trim());
  const feedUrl = `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const feed = await rssParser.parseURL(feedUrl);
    return (feed.items || []).slice(0, 6).map((item) => ({
      title: item.title || "Untitled",
      url: item.link || "",
      summary: stripHtml(item.contentSnippet || item.content || "").slice(
        0,
        400
      ),
      source: item.creator || extractSource(item.title || ""),
      published_at: item.pubDate || null,
      search_query: query,
    }));
  } catch (err) {
    console.error(`News search failed for "${query}":`, err);
    return [];
  }
}

/**
 * @deprecated Prefer searchNewsMulti with AI-generated queries.
 * Kept for backwards compatibility — single naive query.
 */
export async function searchNews(
  person: Pick<MissingPerson, "name" | "age" | "last_seen_location">
): Promise<NewsResult[]> {
  const terms = [person.name, person.last_seen_location, "missing"]
    .filter(Boolean)
    .join(" ");
  return searchNewsQuery(terms);
}

function extractSource(title: string): string {
  const parts = title.split(" - ");
  return parts.length > 1 ? parts[parts.length - 1] : "Google News";
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").trim();
}

/**
 * Social Search — SAMPLE DATA (not used in live OSINT scan).
 * Kept for reference / future swap-in with a licensed social-listening API.
 */
export async function searchSocial(
  person: Pick<MissingPerson, "name" | "last_seen_location">
): Promise<SocialResult[]> {
  const place = person.last_seen_location || "the local area";
  const templates: Array<Omit<SocialResult, "posted_at">> = [
    {
      source: "X (sample — not live)",
      content: `Does anyone recognize this person? Saw someone matching the description near ${place} earlier today. Hope they're safe.`,
      location: place,
      url: null,
    },
    {
      source: "Reddit (sample — not live)",
      content: `Local community thread: a few neighbors mentioned seeing someone who looked like the photo circulating for ${person.name} around the transit station.`,
      location: place,
      url: null,
    },
    {
      source: "Facebook Group (sample — not live)",
      content: `Shared in the community safety group — possible sighting reported by a shop owner near ${place}, but unconfirmed.`,
      location: place,
      url: null,
    },
  ];
  return templates.map((t, i) => ({
    ...t,
    posted_at: new Date(Date.now() - i * 3600_000 * 5).toISOString(),
  }));
}
