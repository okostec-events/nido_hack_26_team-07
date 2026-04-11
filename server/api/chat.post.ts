const ENV =
  typeof globalThis !== "undefined" &&
  "process" in globalThis &&
  typeof (globalThis as { process?: unknown }).process === "object"
    ? ((
        globalThis as {
          process?: { env?: Record<string, string | undefined> };
        }
      ).process?.env ?? {})
    : ({} as Record<string, string | undefined>);

const SYSTEM_PROMPT = `You are Brújula's immigration assistant — a practical guide for people moving to Chile.

You ONLY help with topics directly related to:
- Immigrating to Chile: visas, residency permits, citizenship, RUT/RUN, extranjería
- Chilean government paperwork and procedures (civil registry, Registro Civil, notaries)
- Finding housing and neighborhoods in Chile
- Healthcare in Chile: FONASA, Isapres, hospitals, pharmacies
- Banking, finances, and taxes in Chile
- Daily life in Chile: culture, transport, supermarkets, utilities, SIM cards
- Chilean Spanish and practical language tips
- Driving and transport: international license, Transantiago/Red Metropolitana

If someone asks about anything unrelated to moving to or living in Chile, reply that you can only assist with Chile immigration and relocation topics, and ask if there is something Chile-related you can help with instead.

Use web search to find current, accurate information. Keep answers concise and practical.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ messages: ChatMessage[] }>(event);

  if (!Array.isArray(body?.messages) || body.messages.length === 0) {
    throw createError({ statusCode: 400, message: "messages is required" });
  }

  const apiKey = ENV.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: "AI service not configured",
    });
  }

  // Keep last 20 messages; cap each to 4000 chars to avoid overflow
  const messages = body.messages.slice(-20).map((m) => ({
    role: m.role as "user" | "assistant",
    content: String(m.content).slice(0, 4000),
  }));

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "web-search-2025-03-05",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error("[chat] Anthropic error:", response.status, errText);
    throw createError({ statusCode: 502, message: "AI service unavailable" });
  }

  const payload = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const text = (payload.content ?? [])
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("\n")
    .trim();

  return {
    reply: text || "Sorry, I couldn't generate a response. Please try again.",
  };
});
