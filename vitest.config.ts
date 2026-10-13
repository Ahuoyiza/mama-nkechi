import { fileURLToPath } from "node:url";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    // "server-only" throws outside the Next.js server; in tests it's a no-op.
    alias: { "server-only": fileURLToPath(new URL("./lib/test/empty.ts", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["lib/**/__tests__/**/*.test.ts"],
  },
});
