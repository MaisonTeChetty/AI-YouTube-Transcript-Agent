import type OpenAI from "openai";

/** Generate PNG bytes for upload to Convex; GPT Image returns base64, not a URL. */
export async function generateThumbnailImage(openai: OpenAI, prompt: string): Promise<Blob> {
  const response = await openai.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-sunburst",
    prompt,
    n: 1,
    size: "1536x1024",
    quality: "medium",
    output_format: "png",
  });
  const encoded = response.data?.[0]?.b64_json;
  if (!encoded) throw new Error("Image generation returned no image data");
  const bytes = Uint8Array.from(Buffer.from(encoded, "base64"));
  if (bytes.length === 0) throw new Error("Image generation returned an empty image");
  return new Blob([bytes], { type: "image/png" });
}
