// Runs the built API server (dist/index.mjs) and checks behaviour that does
// not need a database: routing, validation, error format, auth policy and
// rate limiting. DATABASE_URL points at a closed local port, so any request
// that reached the database would fail loudly instead of touching real data.
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";

const artifactDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const servers = [];

async function freePort() {
  const server = net.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  server.close();
  await once(server, "close");
  return port;
}

async function startServer(extraEnv = {}) {
  const port = await freePort();
  const child = spawn(
    process.execPath,
    [path.join(artifactDir, "dist", "index.mjs")],
    {
      cwd: artifactDir,
      env: {
        PATH: process.env.PATH,
        SystemRoot: process.env.SystemRoot,
        NODE_ENV: "production",
        LOG_LEVEL: "silent",
        PORT: String(port),
        DATABASE_URL: "postgresql://test:test@127.0.0.1:1/test",
        // Placeholders so the server's own .env file cannot fill these in.
        CLERK_SECRET_KEY: "",
        RAZORPAY_KEY_ID: "",
        RAZORPAY_KEY_SECRET: "",
        RAZORPAY_WEBHOOK_SECRET: "",
        ...extraEnv,
      },
      stdio: ["ignore", "ignore", "pipe"],
    },
  );
  servers.push(child);
  const baseUrl = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/healthz`);
      if (response.ok) return baseUrl;
    } catch {
      /* not listening yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("API server did not start");
}

function postJson(baseUrl, route, body, raw = false) {
  return fetch(`${baseUrl}${route}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: raw ? body : JSON.stringify(body),
  });
}

let plainServer;
let clerkServer;

before(async () => {
  execFileSync(process.execPath, ["build.mjs"], {
    cwd: artifactDir,
    stdio: "ignore",
  });
  [plainServer, clerkServer] = await Promise.all([
    startServer(),
    startServer({ CLERK_SECRET_KEY: "sk_test_placeholder_for_tests" }),
  ]);
});

after(() => {
  for (const child of servers) child.kill();
});

test("health check responds", async () => {
  const response = await fetch(`${plainServer}/api/healthz`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("unknown API routes return a JSON 404 instead of an admin 401", async () => {
  const response = await fetch(`${plainServer}/api/does-not-exist`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "NOT_FOUND" });
});

test("malformed JSON gets a JSON error without internals", async () => {
  const response = await postJson(
    plainServer,
    "/api/saarthi/login",
    "{bad",
    true,
  );
  assert.equal(response.status, 400);
  assert.match(response.headers.get("content-type") ?? "", /application\/json/);
  const text = await response.text();
  assert.deepEqual(JSON.parse(text), { error: "INVALID_BODY" });
  assert.doesNotMatch(text, /at .*\.(m?js|ts):\d+/);
});

test("sign-up rejects invalid profiles and short passwords before the database", async () => {
  for (const body of [
    {},
    { profile: { name: "A", email: "not-an-email" } },
    { profile: { name: "", email: "a@example.com" } },
    { profile: { name: { x: 1 }, email: "a@example.com" } },
    { profile: { name: "A", email: "a@example.com" }, password: "short" },
    { profile: { name: "A", email: "a@example.com" }, password: 12345678 },
  ]) {
    const response = await postJson(plainServer, "/api/saarthi/signup", body);
    assert.equal(response.status, 400, JSON.stringify(body));
    assert.deepEqual(await response.json(), { error: "INVALID_BODY" });
  }
});

test("login without string credentials is rejected before the database", async () => {
  const response = await postJson(plainServer, "/api/saarthi/login", {
    email: ["a@example.com"],
    password: { $ne: "" },
  });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "INVALID_CREDENTIALS" });
});

test("authenticated routes require a session", async () => {
  for (const [method, route] of [
    ["GET", "/api/saarthi/state"],
    ["PUT", "/api/saarthi/chats"],
    ["PUT", "/api/saarthi/saved"],
    ["POST", "/api/payments/razorpay/order"],
  ]) {
    const response = await fetch(`${plainServer}${route}`, {
      method,
      headers: { "content-type": "application/json" },
      body: method === "GET" ? undefined : "{}",
    });
    // No token: rejected without a session lookup.
    assert.equal(response.status, 401, route);
  }
});

test("admin routes require admin credentials", async () => {
  const response = await fetch(`${plainServer}/api/admin/users`);
  assert.equal(response.status, 401);
});

test("unverified password auth is disabled when Clerk is configured", async () => {
  const signup = await postJson(clerkServer, "/api/saarthi/signup", {
    profile: { name: "Someone", email: "someone@example.com" },
    password: "long-enough-password",
  });
  assert.equal(signup.status, 403);
  assert.deepEqual(await signup.json(), { error: "PASSWORD_AUTH_DISABLED" });

  const login = await postJson(clerkServer, "/api/saarthi/login", {
    email: "someone@example.com",
    password: "long-enough-password",
  });
  assert.equal(login.status, 403);
});

test("auth endpoints are rate limited per client", async () => {
  const statuses = [];
  for (let index = 0; index < 22; index += 1) {
    const response = await postJson(clerkServer, "/api/saarthi/login", {});
    statuses.push(response.status);
    await response.arrayBuffer();
  }
  // Earlier tests may already have used part of this window.
  assert.ok(statuses.includes(403));
  assert.equal(statuses.at(-1), 429);
});
