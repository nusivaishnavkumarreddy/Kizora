"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const [title, setTitle] = useState("My Meeting");
  const [customSlug, setCustomSlug] = useState("");
  const [password, setPassword] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(200);
  const [joinSlug, setJoinSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [joinUrl, setJoinUrl] = useState("");

  async function createMeeting() {
    setBusy(true);
    // Anonymous host for demo purposes — swap in real Supabase Auth for production.
    const { data: userData } = await supabase.auth.getUser();
    let hostId = userData?.user?.id;

    if (!hostId) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        alert("Auth error: " + error.message);
        setBusy(false);
        return;
      }
      hostId = data.user?.id;
    }

    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostId, title, customSlug, password, maxParticipants }),
    });
    const json = await res.json();
    setBusy(false);

    if (json.error) {
      alert(json.error.includes("duplicate") ? "That link is taken — try another." : json.error);
      return;
    }
    setJoinUrl(json.joinUrl);
    router.push(`/join/${json.meeting.slug}`);
  }

  return (
    <div className="home-wrap">
      <div className="brand-header">
        <img src="/kizora-icon.png" alt="Kizora" />
        <h1>Kizora</h1>
        <p>Your cozy corner for video calls</p>
      </div>

      <label>Meeting title</label>
      <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />

      <label>Custom link (optional) — kizora.com/join/<b>your-name</b></label>
      <input
        className="input"
        placeholder="e.g. acme-standup"
        value={customSlug}
        onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
      />

      <label>Password (optional)</label>
      <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <label>Max participants</label>
      <input
        className="input"
        type="number"
        max={200}
        value={maxParticipants}
        onChange={(e) => setMaxParticipants(Number(e.target.value))}
      />

      <button className="btn" disabled={busy} onClick={createMeeting}>
        {busy ? "Creating..." : "Start Meeting"}
      </button>

      <div style={{ marginTop: 24 }}>
        <label>Have a link or code? Join a meeting</label>
        <div className="row">
          <input className="input" placeholder="meeting-slug" value={joinSlug} onChange={(e) => setJoinSlug(e.target.value)} />
          <button className="btn secondary" onClick={() => router.push(`/join/${joinSlug}`)}>
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
