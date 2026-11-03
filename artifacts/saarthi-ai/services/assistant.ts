import { services, type OfficialLinkType, type ServiceRecord } from "@/data/services";
import type { LanguageCode } from "@/context/LanguagesContext";
import Constants from "expo-constants";

export interface AssistantSource {
  label: string;
  url: string;
  type?: OfficialLinkType;
}

export interface AssistantReply {
  content: string;
  sources: AssistantSource[];
}

export type ContentSegment =
  | { kind: "text"; text: string }
  | { kind: "link"; text: string; url: string }
  | { kind: "unverified-link"; text: string };

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];
const API_URL = (
  configuredApiUrl || `http://${expoHost || "localhost"}:3000`
).replace(/\/+$/, "");

// Absolute http(s) URL with a plain hostname: no credentials, whitespace,
// quotes or angle brackets. Checked without `URL`, whose React Native
// implementation does not expose every component.
const SAFE_HTTP_URL =
  /^https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}(?::\d{1,5})?(?:[/?#][^\s<>"'`\\]*)?$/i;

export function isSafeHttpUrl(url: unknown): url is string {
  return typeof url === "string" && url.length <= 2048 && SAFE_HTTP_URL.test(url);
}

// Comparison key only: ignores scheme, "www.", host case and trailing slashes.
// Links are always opened with the catalog's exact URL, never this key.
const normalizeUrl = (url: string) =>
  url
    .trim()
    .replace(/^https?:\/\/(?:www\.)?([^/?#]+)/i, (_, host: string) => `//${host.toLowerCase()}`)
    .replace(/\/+$/, "");

const serviceByUrl = new Map<string, ServiceRecord>();
for (const service of services) {
  if (isSafeHttpUrl(service.officialUrl)) {
    serviceByUrl.set(normalizeUrl(service.officialUrl), service);
  }
}

// Returns the catalog's own copy of a URL, or undefined when the URL is not
// one of Saarthi's recorded official links.
export function findVerifiedUrl(url: string): string | undefined {
  if (!isSafeHttpUrl(url)) return undefined;
  return serviceByUrl.get(normalizeUrl(url))?.officialUrl;
}

const URL_IN_TEXT = /\b(?:https?:\/\/|www\.)[^\s<>"'`]+/gi;

// Splits assistant text so recorded official URLs can be shown as links and
// any other URL the model wrote is visibly withheld instead of opened.
export function splitContentLinks(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let last = 0;
  for (const match of content.matchAll(URL_IN_TEXT)) {
    let raw = match[0];
    const trailing = raw.match(/[).,;:!?*_\]]+$/)?.[0] ?? "";
    raw = raw.slice(0, raw.length - trailing.length);
    const start = match.index ?? 0;
    if (start > last) {
      segments.push({ kind: "text", text: content.slice(last, start) });
    }
    const candidate = /^www\./i.test(raw) ? `https://${raw}` : raw;
    const verified = findVerifiedUrl(candidate);
    segments.push(
      verified
        ? { kind: "link", text: raw, url: verified }
        : { kind: "unverified-link", text: raw },
    );
    last = start + raw.length;
  }
  if (last < content.length) {
    segments.push({ kind: "text", text: content.slice(last) });
  }
  return segments;
}

const toSource = (service: ServiceRecord): AssistantSource => ({
  label: service.source,
  url: service.officialUrl,
  type: service.linkType ?? "website",
});

// Re-reads a stored source from the current catalog, so chats saved before a
// link was corrected never open the outdated URL.
export function findOfficialSource(url: string): AssistantSource | undefined {
  if (!isSafeHttpUrl(url)) return undefined;
  const service = serviceByUrl.get(normalizeUrl(url));
  return service ? toSource(service) : undefined;
}

const STOP_WORDS = new Set(
  (
    "about after also and any apply applying application are can could does " +
    "document documents for from get government have how india indian into " +
    "know mantri need needed official online pradhan please scheme schemes " +
    "service services tell that the their there this under want what when " +
    "where which who why will with yojana your"
  ).split(" "),
);

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word))
    .map((word) => (word.length > 4 ? word.replace(/s$/, "") : word));

const serviceKeywords = services.map((service) => ({
  service,
  strong: new Set(
    tokenize(`${service.id.replaceAll("-", " ")} ${service.name} ${service.source}`),
  ),
  weak: new Set(tokenize(`${service.category} ${service.description}`)),
}));

function scoreServices(question: string) {
  const words = new Set(tokenize(question));
  return serviceKeywords.map(({ service, strong, weak }) => {
    let score = 0;
    for (const word of words) {
      if (strong.has(word)) score += 3;
      else if (weak.has(word)) score += 1;
    }
    return { service, score };
  });
}

// The backend rejects a serviceContext over 128,000 characters; stay under it.
const MAX_SERVICE_CONTEXT_CHARS = 120_000;

const toContextRow = (fields: string[]) =>
  fields
    .map((field) => field.replace(/\s+/g, " ").replaceAll("|", "/").trim())
    .join(" | ");

const fullContextRow = (service: ServiceRecord) =>
  toContextRow([
    service.name,
    service.category,
    service.description,
    service.officialUrl,
    service.eligibility,
    service.documents,
  ]);

// Sends the whole catalog while it fits. Otherwise the services matching the
// question keep their full rows and the rest are sent as name, category and
// URL only, in the same column positions the backend reads.
function buildServiceContext(question: string): string {
  const fullRows = services.map(fullContextRow);
  const fullContext = fullRows.join("\n");
  if (fullContext.length <= MAX_SERVICE_CONTEXT_CHARS) return fullContext;

  const compactRows = services.map((service) =>
    toContextRow([service.name, service.category, "", service.officialUrl]),
  );
  let length = compactRows.join("\n").length;
  const expanded = new Set<number>();
  const relevant = scoreServices(question)
    .map(({ score }, index) => ({ score, index }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  for (const { index } of relevant) {
    const extra = fullRows[index].length - compactRows[index].length;
    if (length + extra > MAX_SERVICE_CONTEXT_CHARS) break;
    expanded.add(index);
    length += extra;
  }

  return services
    .map((_, index) =>
      expanded.has(index) ? fullRows[index] : compactRows[index],
    )
    .join("\n");
}

// Official links for a reply: catalog URLs the reply itself cites come first,
// then services whose name, id, or domain best match the question.
function findSources(question: string, content: string): AssistantSource[] {
  const cited: ServiceRecord[] = [];
  for (const segment of splitContentLinks(content)) {
    if (segment.kind !== "link") continue;
    const service = serviceByUrl.get(normalizeUrl(segment.url));
    if (service && !cited.includes(service)) cited.push(service);
  }

  const scored = scoreServices(question);
  // A named scheme ("Suraksha Bima") outranks schemes sharing a generic word
  // ("Bima"); a generic question still lists every matching scheme.
  const best = Math.max(0, ...scored.map(({ score }) => score));
  const matched = scored
    .filter(({ score }) => score >= 2 && score > best / 2)
    .sort((a, b) => b.score - a.score)
    .map(({ service }) => service);

  return [...new Set([...cited, ...matched])].slice(0, 3).map(toSource);
}

export async function getAssistantReply(
  question: string,
  language: LanguageCode,
): Promise<AssistantReply> {
  const serviceContext = buildServiceContext(question);

  let response: Response;
  const controller = new AbortController();
  // Generous enough to cover a cold start of the hosted backend.
  const timeout = setTimeout(() => controller.abort(), 75_000);
  try {
    response = await fetch(`${API_URL}/api/assistant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        serviceContext,
        language,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("Assistant request timed out.");
    }
    throw new Error("Could not reach the assistant service.");
  } finally {
    clearTimeout(timeout);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("The assistant service returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error("The assistant service could not complete the request.");
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !("content" in data) ||
    typeof data.content !== "string" ||
    !data.content.trim()
  ) {
    throw new Error("The assistant service returned an empty response.");
  }

  return {
    content: data.content,
    sources: findSources(question, data.content),
  };
}
