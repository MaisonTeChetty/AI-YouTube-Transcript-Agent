import { SchematicClient } from "@schematichq/schematic-typescript-node";

let client: SchematicClient | undefined;

export function getSchematicClient() {
  if (!process.env.SCHEMATIC_API_KEY) {
    throw new Error("SCHEMATIC_API_KEY is not set");
  }
  return client ??= new SchematicClient({
    apiKey: process.env.SCHEMATIC_API_KEY,
    cacheProviders: { flagChecks: [] },
  });
}
