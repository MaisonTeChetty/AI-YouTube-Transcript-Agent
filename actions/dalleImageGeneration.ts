"use server"

import { api } from "@/convex/_generated/api";
import { FeatureFlag, featureFlagEvents } from "@/features/flags";
import { getConvexClient } from "@/lib/convex";
import { getSchematicClient } from "@/lib/schematic";
import { currentUser } from "@clerk/nextjs/server";
import {OpenAI} from "openai"

import { generateThumbnailImage } from "@/lib/imageGeneration";

export const dalleImageGeneration = async (prompt: string, videoId: string) => {
  const user = await currentUser();
  const convexClient = getConvexClient();

  if (!user?.id) {
    throw new Error("User not found");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  if (!prompt) {
    throw new Error("Failed to generate image prompt");
  }

  console.log("🛠️ Generating image with prompt:", prompt);

  const image = await generateThumbnailImage(openai, prompt);

// Step 1: Get a short-lived upload URL for Convex
    console.log("📡 Getting upload URL...");
    const postUrl = await convexClient.mutation(api.images.generateUploadUrl);
    console.log("✅ Got upload URL");

// Step 3: Upload the image to the convex storage bucket
    console.log("📤 Uploading image to storage...");
    const result = await fetch(postUrl, {
    method: "POST",
    headers: { "Content-Type": image!.type },
    body: image,
    });

    if (!result.ok) throw new Error("Failed to upload the generated image");
    const { storageId } = await result.json();
    console.log("✅ Uploaded image to storage with ID:", storageId);

// Step 4: Save the newly allocated storage id to the database
    console.log("💾 Saving image reference to database...");
    await convexClient.mutation(api.images.storeImage, {
    storageId: storageId,
    videoId,
    userId: user.id,
    });
    console.log("✅ Saved image reference to database");

    //get server image url
    const dbImageUrl = await convexClient.query(api.images.getImage,{
        videoId,
        userId: user.id
    })

    // Track the image generation event
        await getSchematicClient().track({
            event: featureFlagEvents[FeatureFlag.IMAGE_GENERATION].event,
            company: {
            id: user.id,
            },
            user: {
            id: user.id,
            },
        });

        return {
            imageUrl: dbImageUrl,
        };



};
