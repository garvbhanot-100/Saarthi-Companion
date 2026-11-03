const { spawn } = require("node:child_process");
const path = require("node:path");

const env = { ...process.env };
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
}
const expoArgs = extraArgs.filter((arg) => !connectionModes.includes(arg));
// expo-dev-client is installed, so Expo would otherwise print a QR code that
// only a development build can open. Default to Expo Go unless asked otherwise.
const targetsDevClient = expoArgs.includes("--dev-client");
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
