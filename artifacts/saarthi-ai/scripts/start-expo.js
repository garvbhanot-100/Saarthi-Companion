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
const connectionMode = env.REPLIT_EXPO_DEV_DOMAIN ? "--localhost" : "--lan";
const child = spawn(
  process.execPath,
  [expoCli, "start", connectionMode, "--port", env.PORT || "8081"],
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
