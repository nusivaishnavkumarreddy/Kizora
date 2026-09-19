import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { customAlphabet } from "nanoid";

// Server-side Supabase client using the service role key (bypasses RLS for writes we control)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const genSlug = customAlphabet("abcdefghijkmnpqrstuvwxyz23456789", 10);

// POST /api/meetings  { hostId, title, customSlug?, password?, maxParticipants? }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { hostId, title, customSlug, password, maxParticipants, waitingRoom } = body;

  const slug = customSlug?.trim() || genSlug();

  const { data, error } = await supabaseAdmin
    .from("meetings")
    .insert({
      host_id: hostId,
      title: title || "Meeting",
      slug,
      password: password || null,
      max_participants: maxParticipants || 200,
      waiting_room: !!waitingRoom,
    })
    .select()
    .single();

  if (error) {
    // Most common cause: custom slug already taken (unique constraint)
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    meeting: data,
    joinUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/join/${slug}`,
  });
}
