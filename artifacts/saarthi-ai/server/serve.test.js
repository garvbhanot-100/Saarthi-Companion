const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

const { createServer, RESPONSE_LANGUAGES } = require("./serve");
const requestToServer = global.fetch.bind(global);

let server;
let baseUrl;
let originalFetch;
let originalApiKey;

function geminiResponse(
  content = "Please verify current requirements with the official portal.",
  status = 200,
  errorMessage = "provider unavailable",
  metadata = {},
) {
  return new Response(
    JSON.stringify(
      status >= 400
        ? {
            error: {
              code: status,
              message: errorMessage,
              status: status === 503 ? "UNAVAILABLE" : "INVALID_ARGUMENT",
              ...(metadata.retryInfo
                ? {
                    details: [
                      {
                        "@type": "type.googleapis.com/google.rpc.RetryInfo",
                        retryDelay: metadata.retryInfo,
                      },
                    ],
                  }
                : {}),
            },
          }
        : {
            candidates: [
              {
                content: { parts: [{ text: content }] },
              },
            ],
          },
    ),
    {
      status,
      headers: {
        "content-type": "application/json",
        ...(metadata.retryAfter ? { "retry-after": metadata.retryAfter } : {}),
      },
    },
  );
}

function modelFromUrl(url) {
  const match = new URL(url).pathname.match(
    /\/models\/([^/:]+):generateContent$/,
  );
  assert.ok(match, `unexpected Gemini endpoint: ${url}`);
  return match[1];
}

async function post(body, raw = false) {
  return requestToServer(`${baseUrl}/api/assistant`, {
    method: "POST",
    headers: raw ? {} : { "content-type": "application/json" },
    body: raw ? body : JSON.stringify(body),
  });
}

before(async () => {
  originalFetch = global.fetch;
  originalApiKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-only-not-a-real-key";

  server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(() => {
  global.fetch = async () => geminiResponse();
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  global.fetch = originalFetch;
  if (originalApiKey === undefined) {
    delete process.env.GEMINI_API_KEY;
  } else {
    process.env.GEMINI_API_KEY = originalApiKey;
  }
});

test("serves an independent health response on /health and /healthz", async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    for (const route of ["/health", "/healthz"]) {
      const response = await requestToServer(`${baseUrl}${route}`);
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { status: "ok" });
    }
  } finally {
    process.env.GEMINI_API_KEY = apiKey;
  }
});

test("uses the selected language for an English question", async () => {
  let providerRequest;
  let providerModel;
  global.fetch = async (url, options) => {
    providerModel = modelFromUrl(url);
    providerRequest = JSON.parse(options.body);
    assert.ok(options.signal instanceof AbortSignal);
    return geminiResponse("தகவலை அதிகாரப்பூர்வ தளத்தில் சரிபார்க்கவும்.");
  };

  const response = await post({
    question: "What documents are needed for Aadhaar?",
    serviceContext: "Official URL: https://example.gov.in",
    language: "ta",
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    content: "தகவலை அதிகாரப்பூர்வ தளத்தில் சரிபார்க்கவும்.",
  });
  assert.match(
    providerRequest.systemInstruction.parts[0].text,
    /Respond in Tamil only, regardless of the language used in the\s+user's question or catalog content/,
  );
  assert.match(
    providerRequest.systemInstruction.parts[0].text,
    /selected response language is\s+authoritative for every explanation, step, caveat, and refusal/i,
  );
  assert.match(
    providerRequest.systemInstruction.parts[0].text,
    /cannot reliably confirm/i,
  );
  assert.match(
    providerRequest.systemInstruction.parts[0].text,
    /Only answer questions related to Indian government services/,
  );
  assert.match(
    providerRequest.systemInstruction.parts[0].text,
    /Official URL: https:\/\/example\.gov\.in/,
  );
  assert.equal(providerModel, "gemini-3.6-flash");
  assert.equal(
    providerRequest.contents[0].parts[0].text,
    "What documents are needed for Aadhaar?",
  );
});

test("maps every supported language code to the response-language instruction", async () => {
  const supportedLanguages = [
    "en",
    "as",
    "bn",
    "brx",
    "doi",
    "gu",
    "hi",
    "kn",
    "ks",
    "kok",
    "mai",
    "ml",
    "mni",
    "mr",
    "ne",
    "or",
    "pa",
    "sa",
    "sat",
    "sd",
    "ta",
    "te",
    "ur",
  ];
  assert.deepEqual(Object.keys(RESPONSE_LANGUAGES), supportedLanguages);

  let providerRequest;
  global.fetch = async (_url, options) => {
    providerRequest = JSON.parse(options.body);
    return geminiResponse();
  };

  for (const languageCode of supportedLanguages) {
    const response = await post({
      question: "How do I find an official service?",
      language: languageCode,
    });

    assert.equal(response.status, 200, `language code: ${languageCode}`);
    assert.ok(
      providerRequest.systemInstruction.parts[0].text.includes(
        `Respond in ${RESPONSE_LANGUAGES[languageCode]} only`,
      ),
      `missing response-language instruction for ${languageCode}`,
    );
  }
});

test("defaults a missing language to English for older clients", async () => {
  let providerRequest;
  global.fetch = async (_url, options) => {
    providerRequest = JSON.parse(options.body);
    return geminiResponse();
  };

  const response = await post({ question: "How do I apply?" });

  assert.equal(response.status, 200);
  assert.match(
    providerRequest.systemInstruction.parts[0].text,
    /Respond in English/,
  );
  assert.doesNotMatch(
    providerRequest.systemInstruction.parts[0].text,
    /undefined/,
  );
});

test("retries a temporary Gemini 503 and preserves a successful response", async () => {
  let attempts = 0;
  global.fetch = async () => {
    attempts += 1;
    return attempts === 1
      ? geminiResponse("", 503)
      : geminiResponse("Verify current details at the official portal.");
  };

  const response = await post({ question: "How do I apply?", language: "en" });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    content: "Verify current details at the official portal.",
  });
  assert.equal(attempts, 2);
});

test("sends a 504 directly to the fallback model without retrying the timed-out model", async () => {
  const requestedModels = [];
  const startedAt = Date.now();
  global.fetch = async (url) => {
    const model = modelFromUrl(url);
    requestedModels.push(model);
    return model === "gemini-3.6-flash"
      ? geminiResponse(
          "",
          504,
          "Deadline expired before operation could complete.",
        )
      : geminiResponse("Check the relevant official government portal.");
  };

  const response = await post({ question: "How do I check a service?" });

  assert.equal(response.status, 200);
  assert.deepEqual(requestedModels, [
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
  ]);
  assert.ok(Date.now() - startedAt < 2_000);
});

test("retries temporary 429, 500, and 502 provider responses", async () => {
  for (const status of [429, 500, 502]) {
    let attempts = 0;
    global.fetch = async () => {
      attempts += 1;
      return attempts === 1
        ? geminiResponse("", status, "temporary provider failure")
        : geminiResponse("Check the relevant official government portal.");
    };

    const response = await post({ question: "How do I check a service?" });

    assert.equal(response.status, 200, `provider status: ${status}`);
    assert.deepEqual(await response.json(), {
      content: "Check the relevant official government portal.",
    });
    assert.equal(attempts, 2, `attempt count for status: ${status}`);
  }
});

test("uses no more than one fallback retry when Gemini stays overloaded", async () => {
  const requestedModels = [];
  const requestSignals = [];
  global.fetch = async (url, options) => {
    const model = modelFromUrl(url);
    requestedModels.push(model);
    requestSignals.push(options.signal);
    return model === "gemini-3.6-flash"
      ? geminiResponse("", 503)
      : geminiResponse("Check the relevant official government portal.");
  };

  const response = await post({ question: "How do I check a service?" });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    content: "Check the relevant official government portal.",
  });
  assert.deepEqual(requestedModels, [
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
  ]);
  assert.ok(requestSignals.every((signal) => signal instanceof AbortSignal));
  assert.equal(new Set(requestSignals).size, requestSignals.length);
});

test("does not retry sooner than a long provider retry-after hint", async () => {
  const requestedModels = [];
  global.fetch = async (url) => {
    const model = modelFromUrl(url);
    requestedModels.push(model);
    return model === "gemini-3.6-flash"
      ? geminiResponse("", 503, "provider unavailable", {
          retryAfter: "30",
        })
      : geminiResponse("Use the official passport portal.");
  };

  const response = await post({ question: "Where do I apply for a passport?" });

  assert.equal(response.status, 503);
  assert.deepEqual((await response.json()).error, {
    code: "AI_TEMPORARILY_UNAVAILABLE",
    message: "The AI service is temporarily unavailable.",
    retryable: true,
  });
  assert.deepEqual(requestedModels, ["gemini-3.6-flash"]);
});

test("does not retry invalid credentials or exhausted quota", async () => {
  let attempts = 0;
  global.fetch = async () => {
    attempts += 1;
    return geminiResponse("", 403, "API key invalid or permission denied");
  };

  const invalidKey = await post({ question: "How do I apply?" });
  assert.equal(invalidKey.status, 503);
  assert.deepEqual((await invalidKey.json()).error, {
    code: "AI_CREDENTIALS_INVALID",
    message: "The AI service credentials or permissions are invalid.",
    retryable: false,
  });
  assert.equal(attempts, 1);

  attempts = 0;
  global.fetch = async () => {
    attempts += 1;
    return geminiResponse("", 429, "Quota exceeded for this project");
  };

  const quota = await post({ question: "How do I apply?" });
  assert.equal(quota.status, 503);
  assert.deepEqual((await quota.json()).error, {
    code: "AI_QUOTA_EXHAUSTED",
    message: "The AI service quota is unavailable.",
    retryable: false,
  });
  assert.equal(attempts, 1);
});

test("does not retry malformed provider requests or leak API keys in logs", async () => {
  let attempts = 0;
  global.fetch = async () => {
    attempts += 1;
    return geminiResponse("", 400, "Invalid request format");
  };

  const malformed = await post({ question: "How do I apply?" });
  assert.equal(malformed.status, 503);
  assert.deepEqual((await malformed.json()).error, {
    code: "AI_REQUEST_REJECTED",
    message: "The AI service rejected the request.",
    retryable: false,
  });
  assert.equal(attempts, 1);

  const originalKey = process.env.GEMINI_API_KEY;
  const originalConsoleError = console.error;
  const testKey = "AIzaSyTestFakeSecret01234567890123456789";
  let loggedOutput = "";
  process.env.GEMINI_API_KEY = testKey;
  console.error = (...args) => {
    loggedOutput += `${args.join(" ")}\n`;
  };
  global.fetch = async () =>
    geminiResponse("", 503, `Key ${testKey} rejected`, {
      retryAfter: "0",
      retryInfo: "0s",
    });

  try {
    const unavailable = await post({ question: "How do I apply?" });
    assert.equal(unavailable.status, 503);
    assert.deepEqual((await unavailable.json()).error, {
      code: "AI_TEMPORARILY_UNAVAILABLE",
      message: "The AI service is temporarily unavailable.",
      retryable: true,
    });
  } finally {
    process.env.GEMINI_API_KEY = originalKey;
    console.error = originalConsoleError;
  }

  assert.equal(loggedOutput.includes(testKey), false);
  assert.match(loggedOutput, /HTTP 503/);
  assert.match(loggedOutput, /retry-after=0/);
  assert.match(loggedOutput, /retry-info=0s/);
  assert.match(loggedOutput, /\[redacted\]/);
});

test("retries temporary network errors before returning a response", async () => {
  let attempts = 0;
  global.fetch = async () => {
    attempts += 1;
    if (attempts < 2) throw new TypeError("temporary network failure");
    return geminiResponse(
      "Use the official portal to verify the latest details.",
    );
  };

  const response = await post({ question: "How do I check a service?" });

  assert.equal(response.status, 200);
  assert.equal(attempts, 2);
});

test("aborts the provider request when the client disconnects", async () => {
  let markProviderStarted;
  const providerStarted = new Promise((resolve) => {
    markProviderStarted = resolve;
  });
  let providerSignal;
  global.fetch = async (_url, options) => {
    providerSignal = options.signal;
    markProviderStarted();
    return new Promise((_resolve, reject) => {
      providerSignal.addEventListener(
        "abort",
        () => reject(new DOMException("Request aborted", "AbortError")),
        { once: true },
      );
    });
  };

  const controller = new AbortController();
  const response = requestToServer(`${baseUrl}/api/assistant`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question: "How do I apply?" }),
    signal: controller.signal,
  });

  await providerStarted;
  const providerAbort = new Promise((resolve) => {
    if (providerSignal.aborted) {
      resolve();
      return;
    }
    providerSignal.addEventListener("abort", resolve, { once: true });
  });
  controller.abort();

  await assert.rejects(response);
  await Promise.race([
    providerAbort,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Provider request was not aborted")),
        1000,
      ),
    ),
  ]);
  assert.equal(providerSignal.aborted, true);
});

test("rejects malformed JSON and unsupported languages without calling Gemini", async () => {
  let providerCalled = false;
  global.fetch = async () => {
    providerCalled = true;
    return geminiResponse();
  };

  const malformed = await post("{", true);
  assert.equal(malformed.status, 400);
  assert.deepEqual((await malformed.json()).error, {
    code: "INVALID_JSON",
    message: "Invalid JSON request",
    retryable: false,
  });

  const unsupported = await post({
    question: "Question",
    language: "xx",
  });
  assert.equal(unsupported.status, 400);
  assert.deepEqual((await unsupported.json()).error, {
    code: "UNSUPPORTED_LANGUAGE",
    message: "Unsupported response language",
    retryable: false,
  });
  assert.equal(providerCalled, false);
});

test("rejects non-object bodies, invalid question types, and oversized input", async () => {
  const nonObject = await post(null);
  assert.equal(nonObject.status, 400);

  const invalidQuestion = await post({ question: 42 });
  assert.equal(invalidQuestion.status, 400);

  const longQuestion = await post({ question: "q".repeat(8001) });
  assert.equal(longQuestion.status, 413);

  const largeBody = await post({
    question: "q",
    serviceContext: "x".repeat(512 * 1024),
  });
  assert.equal(largeBody.status, 413);

  const largeContext = await post({
    question: "q",
    serviceContext: "x".repeat(128_001),
  });
  assert.equal(largeContext.status, 413);
});

test("returns an upstream error for Gemini failures, timeouts, and empty output", async () => {
  let attempts = 0;
  const startedAt = Date.now();
  global.fetch = async () => {
    attempts += 1;
    return geminiResponse("", 503);
  };
  const providerError = await post({ question: "Question", language: "en" });
  assert.equal(providerError.status, 503);
  assert.equal(attempts, 2);
  assert.deepEqual((await providerError.json()).error, {
    code: "AI_TEMPORARILY_UNAVAILABLE",
    message: "The AI service is temporarily unavailable.",
    retryable: true,
  });
  assert.ok(Date.now() - startedAt < 8_000);

  global.fetch = async () => {
    attempts += 1;
    throw new DOMException("The operation timed out", "TimeoutError");
  };
  const timeout = await post({ question: "Question", language: "en" });
  assert.equal(timeout.status, 503);
  assert.equal(attempts, 4);

  global.fetch = async () => geminiResponse("  ");
  const empty = await post({ question: "Question", language: "en" });
  assert.equal(empty.status, 503);
  assert.deepEqual((await empty.json()).error, {
    code: "AI_EMPTY_RESPONSE",
    message: "Gemini returned an empty response.",
    retryable: false,
  });
});
