const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

const {
  createServer,
  RESPONSE_LANGUAGES,
  selectServiceContext,
} = require("./serve");
const requestToServer = global.fetch.bind(global);

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

let server;
let baseUrl;
let originalFetch;
let originalApiKey;
let originalModel;

function groqResponse(
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
              message: errorMessage,
              type: metadata.type || "server_error",
              ...(metadata.code ? { code: metadata.code } : {}),
            },
          }
        : {
            id: "chatcmpl-test",
            object: "chat.completion",
            model: "openai/gpt-oss-20b",
            choices: [
              {
                index: 0,
                message: { role: "assistant", content },
                finish_reason: "stop",
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

function systemPrompt(providerRequest) {
  assert.equal(providerRequest.messages[0].role, "system");
  return providerRequest.messages[0].content;
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
  originalApiKey = process.env.GROQ_API_KEY;
  originalModel = process.env.GROQ_MODEL;
  process.env.GROQ_API_KEY = "test-only-not-a-real-key";
  process.env.GROQ_MODEL = "openai/gpt-oss-20b";

  server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(() => {
  global.fetch = async () => groqResponse();
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  global.fetch = originalFetch;
  for (const [name, value] of [
    ["GROQ_API_KEY", originalApiKey],
    ["GROQ_MODEL", originalModel],
  ]) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

test("serves an independent health response on /health and /healthz", async () => {
  const apiKey = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;
  try {
    for (const route of ["/health", "/healthz"]) {
      const response = await requestToServer(`${baseUrl}${route}`);
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { status: "ok" });
    }
  } finally {
    process.env.GROQ_API_KEY = apiKey;
  }
});

test("sends a Groq chat completion with the selected language", async () => {
  let providerUrl;
  let providerOptions;
  let providerRequest;
  global.fetch = async (url, options) => {
    providerUrl = url;
    providerOptions = options;
    providerRequest = JSON.parse(options.body);
    assert.ok(options.signal instanceof AbortSignal);
    return groqResponse("தகவலை அதிகாரப்பூர்வ தளத்தில் சரிபார்க்கவும்.");
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
  assert.equal(providerUrl, GROQ_URL);
  assert.equal(providerOptions.method, "POST");
  assert.equal(
    providerOptions.headers.authorization,
    "Bearer test-only-not-a-real-key",
  );
  assert.equal(providerRequest.model, "openai/gpt-oss-20b");
  assert.equal(providerRequest.stream, false);
  assert.equal(providerRequest.reasoning_effort, "low");
  assert.ok(providerRequest.max_completion_tokens > 0);

  const prompt = systemPrompt(providerRequest);
  assert.match(
    prompt,
    /Respond in Tamil only, regardless of the language used in the\s+user's question or catalog content/,
  );
  assert.match(
    prompt,
    /selected response language is\s+authoritative for every explanation, step, caveat, and refusal/i,
  );
  assert.match(prompt, /cannot\s+reliably\s+confirm/i);
  assert.match(prompt, /clarifying\s+question/i);
  assert.match(prompt, /Never\s+invent\s+scheme\s+names/);
  assert.match(prompt, /Do not use Markdown/);
  assert.match(prompt, /Only answer questions related to Indian government services/);
  assert.match(prompt, /Official URL: https:\/\/example\.gov\.in/);
  assert.deepEqual(providerRequest.messages[1], {
    role: "user",
    content: "What documents are needed for Aadhaar?",
  });
});

test("reads the model from GROQ_MODEL", async () => {
  let providerRequest;
  global.fetch = async (_url, options) => {
    providerRequest = JSON.parse(options.body);
    return groqResponse();
  };

  process.env.GROQ_MODEL = "openai/gpt-oss-120b";
  try {
    const response = await post({ question: "How do I apply?" });
    assert.equal(response.status, 200);
    assert.equal(providerRequest.model, "openai/gpt-oss-120b");
  } finally {
    process.env.GROQ_MODEL = "openai/gpt-oss-20b";
  }
});

test("rejects a malformed GROQ_MODEL without calling Groq", async () => {
  let providerCalled = false;
  global.fetch = async () => {
    providerCalled = true;
    return groqResponse();
  };

  process.env.GROQ_MODEL = "openai/gpt-oss-20b;";
  try {
    const response = await post({ question: "How do I apply?" });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error.code, "AI_NOT_CONFIGURED");
    assert.equal(providerCalled, false);
  } finally {
    process.env.GROQ_MODEL = "openai/gpt-oss-20b";
  }
});

test("returns AI_NOT_CONFIGURED when GROQ_API_KEY is missing", async () => {
  let providerCalled = false;
  global.fetch = async () => {
    providerCalled = true;
    return groqResponse();
  };

  const apiKey = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;
  try {
    const response = await post({ question: "How do I apply?" });
    assert.equal(response.status, 503);
    assert.deepEqual((await response.json()).error, {
      code: "AI_NOT_CONFIGURED",
      message: "The AI service is not configured.",
      retryable: false,
    });
    assert.equal(providerCalled, false);
  } finally {
    process.env.GROQ_API_KEY = apiKey;
  }
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
    return groqResponse();
  };

  for (const languageCode of supportedLanguages) {
    const response = await post({
      question: "How do I find an official service?",
      language: languageCode,
    });

    assert.equal(response.status, 200, `language code: ${languageCode}`);
    assert.ok(
      systemPrompt(providerRequest).includes(
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
    return groqResponse();
  };

  const response = await post({ question: "How do I apply?" });

  assert.equal(response.status, 200);
  assert.match(systemPrompt(providerRequest), /Respond in English/);
  assert.doesNotMatch(systemPrompt(providerRequest), /undefined/);
});

test("keeps large catalogs within Groq token limits using relevant rows", async () => {
  const filler = Array.from(
    { length: 125 },
    (_, index) =>
      `Filler service ${index} | Other | ${"Unrelated description. ".repeat(12)}| https://filler${index}.gov.in/ | Anyone. | Varies.`,
  );
  const passportRow =
    "Passport Seva | Travel | Apply for or renew an Indian passport. | https://www.passportindia.gov.in/ | Indian citizens. | Proof of address and date of birth.";
  const serviceContext = [...filler.slice(0, 60), passportRow, ...filler.slice(60)].join("\n");
  assert.ok(serviceContext.length > 40_000);

  const matched = selectServiceContext("How do I renew my passport?", serviceContext);
  assert.ok(matched.matched.includes(passportRow));
  assert.ok(matched.matched.length + matched.index.length <= 8_000);

  const unmatched = selectServiceContext("पासपोर्ट कैसे बनवाएं?", serviceContext);
  assert.equal(unmatched.matched, "");
  assert.match(unmatched.index, /Passport Seva \| Travel \| https:\/\/www\.passportindia\.gov\.in\//);
  assert.ok(unmatched.index.length <= 8_000);

  let providerRequest;
  global.fetch = async (_url, options) => {
    providerRequest = JSON.parse(options.body);
    return groqResponse("Use the official passport portal.");
  };
  const response = await post({
    question: "How do I renew my passport?",
    serviceContext,
  });
  assert.equal(response.status, 200);
  assert.ok(systemPrompt(providerRequest).includes(passportRow));
  assert.ok(systemPrompt(providerRequest).length < 14_000);
});

test("strips hidden reasoning tags from the answer", async () => {
  global.fetch = async () =>
    groqResponse("<think>internal notes</think>\nVisit the official portal.");

  const response = await post({ question: "How do I apply?" });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    content: "Visit the official portal.",
  });
});

test("retries temporary 429, 500, 502, and 503 provider responses", async () => {
  for (const status of [429, 500, 502, 503]) {
    let attempts = 0;
    global.fetch = async () => {
      attempts += 1;
      return attempts === 1
        ? groqResponse("", status, "temporary provider failure", {
            retryAfter: "0",
          })
        : groqResponse("Check the relevant official government portal.");
    };

    const response = await post({ question: "How do I check a service?" });

    assert.equal(response.status, 200, `provider status: ${status}`);
    assert.deepEqual(await response.json(), {
      content: "Check the relevant official government portal.",
    });
    assert.equal(attempts, 2, `attempt count for status: ${status}`);
  }
});

test("does not retry sooner than a long provider retry-after hint", async () => {
  let attempts = 0;
  global.fetch = async () => {
    attempts += 1;
    return groqResponse("", 429, "Rate limit reached for model on tokens per minute (TPM)", {
      retryAfter: "30",
      code: "rate_limit_exceeded",
      type: "tokens",
    });
  };

  const response = await post({ question: "Where do I apply for a passport?" });

  assert.equal(response.status, 429);
  assert.deepEqual((await response.json()).error, {
    code: "AI_RATE_LIMITED",
    message: "The AI service is rate limited.",
    retryable: true,
  });
  assert.equal(attempts, 1);
});

test("does not retry invalid credentials, daily quota, or missing models", async () => {
  let attempts = 0;
  global.fetch = async () => {
    attempts += 1;
    return groqResponse("", 401, "Invalid API Key", {
      code: "invalid_api_key",
      type: "invalid_request_error",
    });
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
    return groqResponse("", 429, "Rate limit reached on tokens per day (TPD)", {
      retryAfter: "0",
      code: "rate_limit_exceeded",
    });
  };

  const quota = await post({ question: "How do I apply?" });
  assert.equal(quota.status, 503);
  assert.deepEqual((await quota.json()).error, {
    code: "AI_QUOTA_EXHAUSTED",
    message: "The AI service quota is unavailable.",
    retryable: false,
  });
  assert.equal(attempts, 1);

  attempts = 0;
  global.fetch = async () => {
    attempts += 1;
    return groqResponse("", 404, "The model does not exist", {
      code: "model_not_found",
    });
  };

  const missingModel = await post({ question: "How do I apply?" });
  assert.equal(missingModel.status, 503);
  assert.deepEqual((await missingModel.json()).error, {
    code: "AI_NOT_CONFIGURED",
    message: "The configured AI model is unavailable.",
    retryable: false,
  });
  assert.equal(attempts, 1);
});

test("does not retry rejected or oversized provider requests", async () => {
  let attempts = 0;
  global.fetch = async () => {
    attempts += 1;
    return groqResponse("", 400, "Invalid request format");
  };

  const malformed = await post({ question: "How do I apply?" });
  assert.equal(malformed.status, 503);
  assert.deepEqual((await malformed.json()).error, {
    code: "AI_REQUEST_REJECTED",
    message: "The AI service rejected the request.",
    retryable: false,
  });
  assert.equal(attempts, 1);

  attempts = 0;
  global.fetch = async () => {
    attempts += 1;
    return groqResponse("", 413, "Request too large for model", {
      code: "rate_limit_exceeded",
      type: "tokens",
    });
  };

  const tooLarge = await post({ question: "How do I apply?" });
  assert.equal(tooLarge.status, 503);
  assert.deepEqual((await tooLarge.json()).error, {
    code: "AI_REQUEST_TOO_LARGE",
    message: "The request is too large for the AI service.",
    retryable: false,
  });
  assert.equal(attempts, 1);
});

test("never leaks the API key in logs or responses", async () => {
  const originalKey = process.env.GROQ_API_KEY;
  const originalConsoleError = console.error;
  const testKey = "gsk_TestFakeSecret0123456789012345678901234567";
  let loggedOutput = "";
  process.env.GROQ_API_KEY = testKey;
  console.error = (...args) => {
    loggedOutput += `${args.join(" ")}\n`;
  };
  global.fetch = async () =>
    groqResponse("", 503, `Key ${testKey} rejected`, { retryAfter: "0" });

  let body;
  try {
    const unavailable = await post({ question: "How do I apply?" });
    assert.equal(unavailable.status, 503);
    body = await unavailable.text();
    assert.deepEqual(JSON.parse(body).error, {
      code: "AI_TEMPORARILY_UNAVAILABLE",
      message: "The AI service is temporarily unavailable.",
      retryable: true,
    });
  } finally {
    process.env.GROQ_API_KEY = originalKey;
    console.error = originalConsoleError;
  }

  assert.equal(loggedOutput.includes(testKey), false);
  assert.equal(body.includes(testKey), false);
  assert.match(loggedOutput, /HTTP 503/);
  assert.match(loggedOutput, /retry-after=0/);
  assert.match(loggedOutput, /\[redacted\]/);
});

test("retries temporary network errors before returning a response", async () => {
  let attempts = 0;
  global.fetch = async () => {
    attempts += 1;
    if (attempts < 2) throw new TypeError("fetch failed");
    return groqResponse("Use the official portal to verify the latest details.");
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

test("rejects malformed JSON and unsupported languages without calling Groq", async () => {
  let providerCalled = false;
  global.fetch = async () => {
    providerCalled = true;
    return groqResponse();
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

test("returns an upstream error for Groq failures, timeouts, and empty output", async () => {
  let attempts = 0;
  const startedAt = Date.now();
  global.fetch = async () => {
    attempts += 1;
    return groqResponse("", 503);
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

  attempts = 0;
  global.fetch = async () => {
    attempts += 1;
    throw new DOMException("The operation timed out", "TimeoutError");
  };
  const timeout = await post({ question: "Question", language: "en" });
  assert.equal(timeout.status, 503);
  assert.deepEqual((await timeout.json()).error, {
    code: "AI_TIMEOUT",
    message: "The AI service did not respond in time.",
    retryable: true,
  });
  assert.equal(attempts, 1);

  global.fetch = async () => groqResponse("  ");
  const empty = await post({ question: "Question", language: "en" });
  assert.equal(empty.status, 503);
  assert.deepEqual((await empty.json()).error, {
    code: "AI_EMPTY_RESPONSE",
    message: "The AI service returned an empty response.",
    retryable: false,
  });
});
