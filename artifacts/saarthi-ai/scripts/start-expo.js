const { spawn } = require("node:child_process");
const os = require("node:os");
const path = require("node:path");

const env = { ...process.env };
// Expo CLI can crash during version checks with:
// "TypeError: Body is unusable: Body has already been read"
// Skip that network doctor step so Metro can start reliably.
if (env.EXPO_NO_DEPENDENCY_VALIDATION == null) {
  env.EXPO_NO_DEPENDENCY_VALIDATION = "1";
}
// Large Windows monorepos often fail Metro's native watcher startup.
if (env.CHOKIDAR_USEPOLLING == null) {
  env.CHOKIDAR_USEPOLLING = "1";
}
// With expo-dev-client installed, Expo may show http://LAN:port/_expo/loading — scanning
// that URL with the phone camera opens the browser instead of Expo Go.
if (env.EXPO_NO_REDIRECT_PAGE == null) {
  env.EXPO_NO_REDIRECT_PAGE = "1";
}
if (env.BROWSER == null) {
  env.BROWSER = "none";
}
if (env.CI === "true" || env.CI === "1") {
  delete env.CI;
}

function getLanIpv4() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}
if (env.REPLIT_EXPO_DEV_DOMAIN) {
  env.EXPO_PACKAGER_PROXY_URL = `https://${env.REPLIT_EXPO_DEV_DOMAIN}`;
  env.EXPO_PUBLIC_DOMAIN = env.REPLIT_DEV_DOMAIN;
  env.EXPO_PUBLIC_REPL_ID = env.REPL_ID;
  env.REACT_NATIVE_PACKAGER_HOSTNAME = env.REPLIT_DEV_DOMAIN;
}

const expoCli = require.resolve("expo/bin/cli");
const extraArgs = process.argv.slice(2);
const connectionModes = ["--lan", "--localhost", "--tunnel"];
const requestedConnectionModes = extraArgs.filter((arg) =>
  connectionModes.includes(arg),
);
if (requestedConnectionModes.length > 1) {
  console.error(
    `Choose only one Expo connection mode: ${connectionModes.join(", ")}`,
  );
  process.exit(1);
}
const connectionMode =
  requestedConnectionModes[0] ||
  (env.REPLIT_EXPO_DEV_DOMAIN ? "--localhost" : "--lan");
if (connectionMode === "--lan" && requestedConnectionModes.length === 1) {
  delete env.EXPO_PACKAGER_PROXY_URL;
  delete env.REACT_NATIVE_PACKAGER_HOSTNAME;
} else if (connectionMode === "--lan" && env.REACT_NATIVE_PACKAGER_HOSTNAME == null) {
  const lanIp = getLanIpv4();
  if (lanIp) {
    env.REACT_NATIVE_PACKAGER_HOSTNAME = lanIp;
  }
}

const API_PORT = (env.SAARTHI_API_PORT || "5000").trim();
if (!env.EXPO_PUBLIC_API_URL?.trim()) {
  const lanIp = getLanIpv4();
  const host = lanIp || "127.0.0.1";
  env.EXPO_PUBLIC_API_URL = `http://${host}:${API_PORT}`;
  console.log(
    `API: ${env.EXPO_PUBLIC_API_URL} (override with EXPO_PUBLIC_API_URL in artifacts/saarthi-ai/.env)`,
  );
}
// The Ask Assistant tab calls the AI backend (server/serve.js) directly. The
// app defaults to the deployed Render service (services/assistant.ts); set
// EXPO_PUBLIC_AI_URL (e.g. http://<LAN-IP>:3000 after `pnpm serve`) to test a
// local copy instead.
console.log(
  `AI assistant: ${env.EXPO_PUBLIC_AI_URL?.trim() || "deployed Render service (default)"} (override with EXPO_PUBLIC_AI_URL)`,
);
const expoArgs = extraArgs.filter((arg) => !connectionModes.includes(arg));
// expo-dev-client is installed, so Expo would otherwise print a QR code that
// only a development build can open. Default to Expo Go unless asked otherwise.
const targetsDevClient = expoArgs.includes("--dev-client");
if (!targetsDevClient) {
  console.log(
    "\nExpo Go: QR ko phone ke Camera se mat scan karo.\n" +
      "Expo Go app kholo → Scan QR code → terminal wala QR scan karo (exp://).\n" +
      "Dev build chahiye ho to: pnpm start:dev-client\n",
  );
}
const child = spawn(
  process.execPath,
  [
    expoCli,
    "start",
    connectionMode,
    "--port",
    env.PORT || "8081",
    ...(targetsDevClient ? [] : ["--go"]),
    ...expoArgs,
  ],
  {
    cwd: path.resolve(__dirname, ".."),
    env,
    stdio: "inherit",
  },
);

child.on("error", (error) => {
  console.error("Could not start Expo:", error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
