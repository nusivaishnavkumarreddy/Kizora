import { NextRequest, NextResponse } from "next/server";
import { EgressClient, EncodedFileType, S3Upload } from "livekit-server-sdk";
import { createClient } from "@supabase/supabase-js";

const egressClient = new EgressClient(
  process.env.LIVEKIT_HOST!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/recording { roomName, action: 'start' | 'stop', egressId? }
// Records full room composite (video + audio) to S3-compatible storage.
// Supabase Storage buckets expose an S3-compatible endpoint you can point this at,
// or use a real AWS S3 / Cloudflare R2 bucket — see the setup guide.
export async function POST(req: NextRequest) {
  const { roomName, action, egressId } = await req.json();

  if (action === "start") {
    const fileOutput = {
      fileType: EncodedFileType.MP4,
      filepath: `recordings/${roomName}/{time}.mp4`,
      output: {
        case: "s3" as const,
        value: new S3Upload({
          bucket: process.env.RECORDING_BUCKET!,
          region: process.env.RECORDING_REGION!,
          accessKey: process.env.RECORDING_ACCESS_KEY!,
          secret: process.env.RECORDING_SECRET_KEY!,
          endpoint: process.env.RECORDING_ENDPOINT, // set this for Supabase Storage / R2
        }),
      },
    };

    const info = await egressClient.startRoomCompositeEgress(roomName, { file: fileOutput as any }, {
      layout: "grid",
    });

    await supabaseAdmin.from("recordings").insert({
      meeting_id: roomName,
      file_url: `${process.env.RECORDING_PUBLIC_BASE_URL}/recordings/${roomName}/`,
    });

    return NextResponse.json({ egressId: info.egressId });
  }

  if (action === "stop" && egressId) {
    await egressClient.stopEgress(egressId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
