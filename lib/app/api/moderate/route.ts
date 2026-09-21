import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";
import { createClient } from "@supabase/supabase-js";

const roomService = new RoomServiceClient(
  process.env.LIVEKIT_HOST!, // e.g. https://your-project.livekit.cloud or your Render URL
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/moderate { roomName, action: 'remove' | 'end' | 'mute', identity? }
// NOTE: in production, verify the caller is actually the host (e.g. by checking
// their LiveKit token claims or a Supabase session) before running any of this.
export async function POST(req: NextRequest) {
  const { roomName, action, identity } = await req.json();

  if (action === "remove" && identity) {
    await roomService.removeParticipant(roomName, identity);
  }

  if (action === "mute" && identity) {
    await roomService.mutePublishedTrack(roomName, identity, "", true);
  }

  if (action === "end") {
    await roomService.deleteRoom(roomName); // disconnects everyone
    await supabaseAdmin.from("meetings").update({ ended_at: new Date().toISOString() }).eq("id", roomName);
  }

  return NextResponse.json({ ok: true });
}
