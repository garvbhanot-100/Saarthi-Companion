import { services } from "@/data/services";
import type { LanguageCode } from "@/context/LanguagesContext";
import Constants from "expo-constants";

export interface AssistantReply {
  content: string;
  sources: { label: string; url: string }[];
}

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];
const API_URL = (
  configuredApiUrl || `http://${expoHost || "localhost"}:3000`
).replace(/\/+$/, "");

const toSource = (service: any) => ({
  label: service.source,
  url: service.officialUrl,
});

export async function getAssistantReply(
  question: string,
  language: LanguageCode,
): Promise<AssistantReply> {
  const serviceContext = services
    .map((service) =>
      [
        service.name,
        service.category,
        service.description,
        service.officialUrl,
        service.eligibility,
        service.documents,
      ]
        .map((field) => field.replace(/\s+/g, " ").replaceAll("|", "/").trim())
        .join(" | "),
    )
    .join("\n");

  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35_000);
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

  // Find services related to the user's question
  const q = question.toLowerCase();

  const matchedServices = services.filter((service) => {
    const text = `
        ${service.name}
        ${service.category}
        ${service.description}
      `.toLowerCase();

    return (
      text.includes(q) ||
      q.split(" ").some((word) => {
        if (word.length < 4) return false;
        return text.includes(word);
      })
    );
  });

  return {
    content: data.content,
    sources: matchedServices.slice(0, 3).map(toSource),
  };
}
