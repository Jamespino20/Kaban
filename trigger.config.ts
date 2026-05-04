import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_gwzybmksjlgviuzkjtss",
  runtime: "node",
  logLevel: "info",
  // The max compute duration for your tasks in seconds.
  // 3600 seconds = 1 hour
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./src/trigger"],
});
