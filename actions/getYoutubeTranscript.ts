"use server"
import { api } from "@/convex/_generated/api";
import { FeatureFlag, featureFlagEvents } from "@/features/flags";
import { getSchematicClient } from "@/lib/schematic";
import { currentUser } from "@clerk/nextjs/server";
import { getConvexClient } from "@/lib/convex";
import { Innertube } from "youtubei.js";




export interface TranscriptEntry {
    text: string;
    timestamp: string;
}



function formatTimestamp(start_ms: number):string {
    const minutes = Math.floor(start_ms / 60000);
    const seconds = Math.floor((start_ms % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2,"0")}`;
  }


async function fetchTranscript(videoId: string): Promise<TranscriptEntry[]> {
    try{
        const youtube = await Innertube.create({ lang: "en", location: "US", retrieve_player: false });
        const info = await youtube.getInfo(videoId);
        const transcriptData = await info.getTranscript();
        const transcript: TranscriptEntry[] =

        transcriptData.transcript.content?.body?.
        initial_segments.map((segment) => ({
            text: segment.snippet.text ?? "N/A",
            timestamp: formatTimestamp(Number(segment.start_ms)),

        })
        )  ?? [];


    return transcript
    } catch (error){
        console.error("Error fetching transcript:", error)
        throw error
    }
};

export async function getYoutubeTranscript(videoId: string) {
  const convex = getConvexClient();

  console.log(`🔹 Starting transcript retrieval for video ID: ${videoId}`);

  const user = await currentUser();

  console.log(`🔹 User authentication check: ${user?.id ? 'Successful' : 'Failed'}`);

  if (!user?.id) {
    console.log("❌ Error: User not found");
    throw new Error("User not found");
  }

  console.log(`📝 Checking database for existing transcript for video: ${videoId}`);

  const existingTranscript = await convex.query(
    api.transcript.getTranscriptByVideoId,
    { videoId, userId: user.id }
  );
  console.log("🔍 Retrieved existing transcript:", existingTranscript);

  if (existingTranscript) {
    console.log(`✅ Transcript found in database for video: ${videoId}`);
    console.log(`📄 Transcript length: ${existingTranscript.transcript.length} segments`);
    return {
      cache: "This video has already been transcribed - Accessing cached transcript instead of using a token",
      transcript: existingTranscript.transcript,
    };
  }

  console.log('🚀 No existing transcript found. Fetching new transcript from YouTube...');

  try {
    console.log(`📡 Calling YouTube API for video: ${videoId}`);
    const transcript = await fetchTranscript(videoId);
    console.log(`✅ Successfully retrieved transcript with ${transcript.length} segments`);

    console.log('📝 Storing transcript in database...');
    // Store transcript in database
    await convex.mutation(api.transcript.storeTranscript, {
      videoId,
      userId: user.id,
      transcript,
    });

    console.log('✔️ Transcript successfully stored in database');

    console.log('📊 Tracking transcription event with Schematic');
    await getSchematicClient().track({
      event: featureFlagEvents[FeatureFlag.TRANSCRIPTION].event,
      company: {
        id: user.id,
      },
      user: {
        id: user.id,
      },
    });

    console.log('🎯 Event tracking complete');

    return {
      transcript,
      cache: "This video was transcribed using a token, the transcript is now saved in the database",
    };

    } catch (error) {
      console.error("❌ Error fetching transcript:", error);
      console.log("⚠️ Returning empty transcript due to error");

      return {
        transcript: [],
        cache: "Error fetching transcript, please try again later",
      };
    }
}
