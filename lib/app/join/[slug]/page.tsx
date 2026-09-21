"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import MeetingRoom from "@/components/MeetingRoom";
import Splash from "@/components/Splash";

export default function JoinPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [tokenData, setTokenData] = useState<any>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function join() {
    if (!name.trim()) return setError("Enter your name");
    setBusy(true);
    setError("");
    const identity = `${name}-${Math.random().toString(36).slice(2, 8)}`;
    const res = await fetch("/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, identity, name, password }),
    });
    const json = await res.json();
    setBusy(false);
    if (json.error) {
      setError(json.error);
      return;
    }
    setTokenData(json);
  }

  if (busy) {
    return <Splash />;
  }

  if (tokenData) {
    return <MeetingRoom tokenData={tokenData} displayName={name} slug={slug} />;
  }

  return (
    <div className="home-wrap">
      <div className="brand-header">
        <img src="/kizora-icon.png" alt="Kizora" style={{ width: 48, height: 48 }} />
      </div>
      <h1>Join meeting</h1>
      <p>Meeting link: <code>{slug}</code></p>

      <label>Your name</label>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} />

      <label>Password (if required)</label>
      <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      {error && <p style={{ color: "#e5484d" }}>{error}</p>}

      <button className="btn" disabled={busy} onClick={join}>
        {busy ? "Joining..." : "Join now"}
      </button>
    </div>
  );
}
