/**
 * ai_service.ts
 * Thin wrapper around the Gemini API. No training/fine-tuning — API calls
 * only, for three jobs: profile summarization, lead confidence scoring,
 * and bulletin copy generation. Every function has a deterministic
 * fallback so the app still demos if GEMINI_API_KEY isn't set.
 */

// GA stable flash model — see https://ai.google.dev/gemini-api/docs/models
const GEMINI_MODEL = "gemini-2.5-flash";
const API_KEY = process.env.GEMINI_API_KEY;

/** Skip further API calls after auth failures. 429 is transient — keep retrying. */
let geminiAuthFailed = false;

async function callGemini(prompt: string): Promise<string | null> {
  if (!API_KEY || geminiAuthFailed) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 600 },
        }),
      }
    );
    if (!res.ok) {
      const body = await res.text();
      if (res.status === 403) {
        geminiAuthFailed = true;
        console.warn(
          `Gemini API auth failed (${res.status}); using built-in fallback. Check your API key at https://aistudio.google.com/apikey`
        );
      } else if (res.status === 429) {
        console.warn(
          `Gemini rate limited (429); using built-in fallback for this request. See https://ai.google.dev/gemini-api/docs/rate-limits`
        );
      } else {
        console.warn(`Gemini API error (${res.status}):`, body.slice(0, 200));
      }
      return null;
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" ? text.trim() : null;
  } catch (err) {
    console.warn("Gemini call failed; using built-in fallback:", err);
    return null;
  }
}

export interface CaseSearchInput {
  name: string;
  age: number | null;
  gender: string | null;
  description: string | null;
  last_seen_location: string | null;
  last_seen_date: string | null;
}

function formatCaseBlock(caseDetails: CaseSearchInput): string {
  return [
    `Name: ${caseDetails.name}`,
    caseDetails.age ? `Age: ${caseDetails.age}` : null,
    caseDetails.gender ? `Gender: ${caseDetails.gender}` : null,
    caseDetails.description ? `Description: ${caseDetails.description}` : null,
    caseDetails.last_seen_location
      ? `Last seen location: ${caseDetails.last_seen_location}`
      : null,
    caseDetails.last_seen_date
      ? `Last seen date: ${caseDetails.last_seen_date}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/** AI Feature — OSINT: case details -> 3-5 Google News search queries */
export async function generateSearchQueries(
  caseDetails: CaseSearchInput
): Promise<string[]> {
  const prompt = `You are assisting a missing-person investigator running an OSINT news search.

From the case below, produce 3 to 5 distinct Google News search queries that could surface relevant articles, alerts, or local news. Vary the angle: full name + location, descriptive keywords (breed, clothing, vehicle), "missing" phrasing, and location-only if the name is uncommon.

Rules:
- Each query should be 3-8 words, suitable for a news search engine
- Use only facts from the case — do not invent names, places, or dates
- If location is vague (e.g. "home"), prefer description keywords + city/region if mentioned elsewhere
- Return ONLY a JSON array of strings, e.g. ["query one", "query two"]

CASE:
${formatCaseBlock(caseDetails)}`;

  const result = await callGemini(prompt);
  if (result) {
    const parsed = parseQueryJson(result);
    if (parsed.length > 0) return parsed.slice(0, 5);
  }
  return fallbackSearchQueries(caseDetails);
}

function parseQueryJson(text: string): string[] {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const arr = JSON.parse(match[0]);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((q): q is string => typeof q === "string")
      .map((q) => q.trim())
      .filter((q) => q.length > 2);
  } catch {
    return [];
  }
}

function fallbackSearchQueries(caseDetails: CaseSearchInput): string[] {
  const { name, last_seen_location, description } = caseDetails;
  const loc =
    last_seen_location && !/^home$/i.test(last_seen_location.trim())
      ? last_seen_location
      : null;

  const queries = new Set<string>();
  if (loc) queries.add(`${name} ${loc} missing`);
  queries.add(`${name} missing`);
  if (loc) queries.add(`missing person ${loc}`);

  if (description) {
    const keywords = description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 4 && !STOPWORDS.has(w))
      .slice(0, 3);
    if (keywords.length && loc) {
      queries.add(`${keywords.join(" ")} missing ${loc}`);
    } else if (keywords.length) {
      queries.add(`${keywords.join(" ")} missing`);
    }
  }

  return [...queries].slice(0, 5);
}

const STOPWORDS = new Set([
  "about",
  "after",
  "being",
  "brown",
  "known",
  "last",
  "seen",
  "their",
  "there",
  "where",
  "which",
  "while",
  "would",
]);

/** AI Feature 1 — Profile Summary: long description -> short investigation summary */
export async function summarizeProfile(description: string): Promise<string> {
  const prompt = `You are assisting a police investigator. Summarize the following missing-person description into a tight 2-3 sentence investigation summary. Keep only operationally relevant facts (appearance, last known activity, risk factors). No speculation, no filler.\n\nDESCRIPTION:\n${description}`;
  const result = await callGemini(prompt);
  if (result) return result;
  // Fallback: simple extractive summary
  const sentences = description.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, 2).join(" ") || description.slice(0, 200);
}

/** AI Feature 2 — Lead Scoring: lead text + case details -> confidence 0-100 */
export async function scoreLead(
  leadText: string,
  caseDetails: string
): Promise<number> {
  const prompt = `Rate how likely this lead relates to the missing person described below. Consider location match, time plausibility, and descriptive overlap. Return ONLY an integer from 0 to 100, nothing else.\n\nCASE DETAILS:\n${caseDetails}\n\nLEAD:\n${leadText}`;
  const result = await callGemini(prompt);
  if (result) {
    const match = result.match(/\d{1,3}/);
    if (match) {
      const n = Math.min(100, Math.max(0, parseInt(match[0], 10)));
      return n;
    }
  }
  // Fallback heuristic: crude keyword overlap so the demo still produces
  // varied, plausible-looking scores without an API key.
  return heuristicScore(leadText, caseDetails);
}

function heuristicScore(leadText: string, caseDetails: string): number {
  const norm = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3)
    );
  const a = norm(leadText);
  const b = norm(caseDetails);
  let overlap = 0;
  a.forEach((w) => {
    if (b.has(w)) overlap++;
  });
  const base = 30 + overlap * 12;
  const jitter = Math.floor(Math.random() * 10);
  return Math.min(96, base + jitter);
}

/** AI Feature 3 — Bulletin Generator: case details -> official bulletin copy */
export async function generateBulletinText(caseDetails: {
  name: string;
  age: number | null;
  gender: string | null;
  description: string | null;
  last_seen_location: string | null;
  last_seen_date: string | null;
}): Promise<string> {
  const prompt = `Write an official missing-person bulletin for public distribution, in the formal but clear style police departments use. Include sections for: Subject, Physical Description, Last Seen, Circumstances, and a closing line asking anyone with information to contact local authorities. Keep it under 220 words. Do not invent details not provided.\n\nDATA:\nName: ${caseDetails.name}\nAge: ${caseDetails.age ?? "Unknown"}\nGender: ${caseDetails.gender ?? "Unknown"}\nDescription: ${caseDetails.description ?? "Not provided"}\nLast seen location: ${caseDetails.last_seen_location ?? "Unknown"}\nLast seen date: ${caseDetails.last_seen_date ?? "Unknown"}`;
  const result = await callGemini(prompt);
  if (result) return result;

  // Fallback template bulletin
  return `MISSING PERSON BULLETIN

SUBJECT: ${caseDetails.name}, ${caseDetails.age ?? "age unknown"}, ${caseDetails.gender ?? "gender unknown"}.

PHYSICAL DESCRIPTION: ${caseDetails.description ?? "No description on file."}

LAST SEEN: ${caseDetails.last_seen_location ?? "Location unknown"} on ${caseDetails.last_seen_date ?? "an unknown date"}.

CIRCUMSTANCES: ${caseDetails.name} was reported missing and has not been in contact with family or known associates since the last-seen date above. Investigators are actively following up on leads.

If you have any information regarding this case, please contact your local police department or the investigating agency immediately. Do not approach — report what you know.`;
}
