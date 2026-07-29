import { defineConfig } from "drizzle-kit";
import path from "path";

const dbPath = path.resolve(__dirname, "..", "..", "sustainpro.db");

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: dbPath,
  },
});
