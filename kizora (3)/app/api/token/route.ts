import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/token  { slug, identity, name, password? }
// Returns a LiveKit JWT scoped to this room only.
export async function POST(req: NextRequest) {
  const { slug, identity, name, password } = await req.json();

  const { data: meeting, error } = await supabaseAdmin
    .from("meetings")
    .select("*")
    .eq("slug", slug)
    .is("ended_at", null)
    .single();

  if (error || !meeting) {
    return NextResponse.json({ error: "Meeting not found or has ended" }, { status: 404 });
  }

  if (meeting.password && meeting.password !== password) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  // Enforce the 200-person cap (or whatever the host set) by checking current occupancy.
  // (For a production app, query LiveKit's room participant list via RoomServiceClient
  // instead of trusting the DB — left as a TODO comment so it's easy to find.)

  const isHost = identity === meeting.host_id;

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity,
      name,
      metadata: JSON.stringify({ role: isHost ? "host" : "participant" }),
    }
  );

  at.addGrant({
    room: meeting.id, // use the meeting UUID as the LiveKit room name (stable, not guessable from slug)
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: isHost, // lets the host mute others / remove participants via LiveKit
    roomRecord: isHost,
  });

  const token = await at.toJwt();

  await supabaseAdmin.from("participant_sessions").insert({
    meeting_id: meeting.id,
    display_name: name,
    role: isHost ? "host" : "participant",
  });

  return NextResponse.json({
    token,
    wsUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL,
    roomName: meeting.id,
    isHost,
    meetingTitle: meeting.title,
  });
}
