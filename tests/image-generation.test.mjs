import assert from "node:assert/strict";
import test from "node:test";
import { generateThumbnailImage } from "../lib/imageGeneration.ts";

test("returns decoded PNG bytes ready for storage upload", async () => {
  const png = Buffer.from("89504e470d0a1a0a", "hex");
  const client = { images: { generate: async () => ({ data: [{ b64_json: png.toString("base64") }] }) } };
  const image = await generateThumbnailImage(client, "A video thumbnail");
  assert.equal(image.type, "image/png");
  assert.deepEqual(Buffer.from(await image.arrayBuffer()), png);
});

test("does not upload an empty response", async () => {
  const client = { images: { generate: async () => ({ data: [] }) } };
  await assert.rejects(generateThumbnailImage(client, "A thumbnail"), /no image data/);
});

test("propagates API failures instead of treating them as generated images", async () => {
  const failure = new Error("API key is invalid");
  const client = { images: { generate: async () => { throw failure; } } };
  await assert.rejects(generateThumbnailImage(client, "A thumbnail"), failure);
});
