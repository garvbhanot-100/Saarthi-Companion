import assert from "node:assert/strict";
import http from "node:http";
import { after, before, test } from "node:test";
import express from "express";
import assistantRouter, {
  assistantJsonParser,
} from "../src/routes/assistant.ts";

let aiServer;
let apiServer;
let apiUrl;
let aiResponse;
let aiRequestBody;
let aiRequestCount = 0;
let originalAiUrl;

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.removeListener("error", reject);
      resolve(server.address().port);
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

async function post(body, raw = false) {
  return fetch(`${apiUrl}/api/assistant`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: raw ? body : JSON.stringify(body),
  });
}

before(async () => {
  originalAiUrl = process.env.SAARTHI_AI_URL;
  aiServer = http.createServer((req, res) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      aiRequestCount += 1;
      aiRequestBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.writeHead(aiResponse.status, {
        "content-type": "application/json",
      });
      res.end(JSON.stringify(aiResponse.body));
    });
  });

  const aiPort = await listen(aiServer);
  process.env.SAARTHI_AI_URL = `http://127.0.0.1:${aiPort}`;

  const app = express();
  app.use("/api/assistant", assistantJsonParser);
  app.use(express.json());
  app.use("/api", assistantRouter);
  apiServer = http.createServer(app);
  apiUrl = `http://127.0.0.1:${await listen(apiServer)}`;
});

after(async () => {
  await Promise.all([close(apiServer), close(aiServer)]);
  if (originalAiUrl === undefined) delete process.env.SAARTHI_AI_URL;
  else process.env.SAARTHI_AI_URL = originalAiUrl;
});

test("forwards a PAN question and returns the assistant content", async () => {
  aiResponse = {
    status: 200,
    body: { content: "Check the official PAN portal for current steps." },
  };
  const response = await post({
    question: "How do I apply for a PAN card?",
    serviceContext: "PAN services | https://www.incometax.gov.in/",
    language: "en",
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    content: "Check the official PAN portal for current steps.",
  });
  assert.deepEqual(aiRequestBody, {
    question: "How do I apply for a PAN card?",
    serviceContext: "PAN services | https://www.incometax.gov.in/",
    language: "en",
  });
});

test("forwards government scheme questions without changing the contract", async () => {
  aiResponse = {
    status: 200,
    body: { content: "Check the official scheme portal for eligibility." },
  };
  const response = await post({
    question: "Am I eligible for PM-KISAN?",
    language: "hi",
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    content: "Check the official scheme portal for eligibility.",
  });
  assert.deepEqual(aiRequestBody, {
    question: "Am I eligible for PM-KISAN?",
    language: "hi",
  });
});

test("rejects empty and malformed requests before calling the AI service", async () => {
  const initialCount = aiRequestCount;
  const empty = await post({ question: "  " });
  assert.equal(empty.status, 400);
  assert.equal((await empty.json()).error.code, "INVALID_QUESTION");

  const malformed = await post("{", true);
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).error.code, "INVALID_JSON");
  assert.equal(aiRequestCount, initialCount);
});

test("rejects oversized service context and request bodies", async () => {
  const initialCount = aiRequestCount;
  const oversizedContext = await post({
    question: "How do I apply?",
    serviceContext: "x".repeat(128_001),
  });
  assert.equal(oversizedContext.status, 413);
  assert.equal(
    (await oversizedContext.json()).error.code,
    "CONTEXT_TOO_LARGE",
  );

  const oversizedBody = await post({
    question: "How do I apply?",
    extra: "x".repeat(600_000),
  });
  assert.equal(oversizedBody.status, 413);
  assert.equal((await oversizedBody.json()).error.code, "REQUEST_TOO_LARGE");
  assert.equal(aiRequestCount, initialCount);
});

test("returns a clear configuration error when the AI URL is missing", async () => {
  const configuredUrl = process.env.SAARTHI_AI_URL;
  delete process.env.SAARTHI_AI_URL;
  try {
    const response = await post({ question: "How do I apply?" });
    assert.equal(response.status, 503);
    assert.deepEqual((await response.json()).error, {
      code: "AI_NOT_CONFIGURED",
      message: "The AI service is not configured.",
      retryable: false,
    });
  } finally {
    process.env.SAARTHI_AI_URL = configuredUrl;
  }
});

test("preserves safe Groq provider error status and fields", async () => {
  aiResponse = {
    status: 503,
    body: {
      error: {
        code: "AI_CREDENTIALS_INVALID",
        message: "The AI service credentials or permissions are invalid.",
        retryable: false,
      },
    },
  };
  const response = await post({ question: "How do I apply?" });

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), aiResponse.body);
});
