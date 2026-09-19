"use client";

import { useEffect, useRef, useState } from "react";
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  useTracks,
  useLocalParticipant,
  useRoomContext,
  useDataChannel,
  RoomAudioRenderer,
  ControlBar,
  useParticipants,
  FocusLayout,
  CarouselLayout,
  useMediaDeviceSelect,
} from "@livekit/components-react";
import { Track, LocalVideoTrack, RoomEvent } from "livekit-client";
import { BackgroundBlur } from "@livekit/track-processors";
import { supabase } from "@/lib/supabaseClient";
import Whiteboard from "./Whiteboard";
import ReportModal from "./ReportModal";
import Splash from "./Splash";

export default function MeetingRoom({
  tokenData,
  displayName,
  slug,
}: {
  tokenData: any;
  displayName: string;
  slug: string;
}) {
  const [connected, setConnected] = useState(true);

  if (!connected) {
    return (
      <div className="home-wrap">
        <div className="brand-header">
          <img src="/kizora-icon.png" alt="Kizora" style={{ width: 48, height: 48 }} />
        </div>
        <h1>You left the meeting</h1>
        <a href="/">Return home</a>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video
      audio
      token={tokenData.token}
      serverUrl={tokenData.wsUrl}
      onDisconnected={() => setConnected(false)}
      data-lk-theme="default"
      style={{ height: "100vh" }}
    >
      <RoomAudioRenderer />
      <RoomInner isHost={tokenData.isHost} meetingTitle={tokenData.meetingTitle} slug={slug} />
    </LiveKitRoom>
  );
}

function RoomInner({ isHost, meetingTitle, slug }: { isHost: boolean; meetingTitle: string; slug: string }) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);

  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [blurOn, setBlurOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ from: string; body: string; ts: number }[]>([]);
  const [reactions, setReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [egressId, setEgressId] = useState<string | null>(null);
  const meetingIdRef = useRef<string>(room.name); // LiveKit room name == our meetings.id

  // Data channel for chat + reactions + raise-hand + host commands
  const { send } = useDataChannel((msg) => {
    const text = new TextDecoder().decode(msg.payload);
    try {
      const evt = JSON.parse(text);
      if (evt.type === "chat") {
        setMessages((m) => [...m, { from: evt.from, body: evt.body, ts: Date.now() }]);
      } else if (evt.type === "reaction") {
        const id = Date.now() + Math.random();
        setReactions((r) => [...r, { id, emoji: evt.emoji, x: Math.random() * 80 + 10 }]);
        setTimeout(() => setReactions((r) => r.filter((x) => x.id !== id)), 1600);
      } else if (evt.type === "mute-all" && !isHost) {
        localParticipant.setMicrophoneEnabled(false);
      } else if (evt.type === "force-mute" && evt.target === localParticipant.identity) {
        localParticipant.setMicrophoneEnabled(false);
      }
    } catch {}
  });

  function sendChat() {
    if (!chatInput.trim()) return;
    const evt = { type: "chat", from: displayNameOf(localParticipant), body: chatInput };
    send(new TextEncoder().encode(JSON.stringify(evt)), { reliable: true });
    setMessages((m) => [...m, { from: "You", body: chatInput, ts: Date.now() }]);
    supabase.from("chat_messages").insert({
      meeting_id: meetingIdRef.current,
      sender_name: displayNameOf(localParticipant),
      body: chatInput,
    });
    setChatInput("");
  }

  function sendReaction(emoji: string) {
    send(new TextEncoder().encode(JSON.stringify({ type: "reaction", emoji })), { reliable: true });
    const id = Date.now() + Math.random();
    setReactions((r) => [...r, { id, emoji, x: Math.random() * 80 + 10 }]);
    setTimeout(() => setReactions((r) => r.filter((x) => x.id !== id)), 1600);
  }

  function toggleRaiseHand() {
    setHandRaised((h) => !h);
    send(new TextEncoder().encode(JSON.stringify({ type: "reaction", emoji: handRaised ? "" : "✋" })), {
      reliable: true,
    });
  }

  async function toggleBlur() {
    const camTrack = localParticipant.getTrackPublication(Track.Source.Camera)?.track as LocalVideoTrack | undefined;
    if (!camTrack) return;
    if (!blurOn) {
      await camTrack.setProcessor(BackgroundBlur(15));
    } else {
      await camTrack.stopProcessor();
    }
    setBlurOn(!blurOn);
  }

  function muteAll() {
    send(new TextEncoder().encode(JSON.stringify({ type: "mute-all" })), { reliable: true });
  }

  function removeParticipant(identity: string) {
    // Requires roomAdmin grant (host token). Calls LiveKit server via our own API route in production;
    // for the client SDK, a host with roomAdmin can call room.disconnect on others only via server API.
    fetch("/api/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName: room.name, identity, action: "remove" }),
    });
  }

  async function toggleRecording() {
    if (!recording) {
      const res = await fetch("/api/recording", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: room.name, action: "start" }),
      });
      const json = await res.json();
      setEgressId(json.egressId);
      setRecording(true);
    } else {
      await fetch("/api/recording", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: room.name, action: "stop", egressId }),
      });
      setRecording(false);
    }
  }

  function endCallForAll() {
    if (isHost) {
      fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: room.name, action: "end" }),
      });
    }
    room.disconnect();
  }

  useEffect(() => {
    room.on(RoomEvent.Disconnected, () => {});
  }, [room]);

  const pinned = tracks.find((t) => t.participant.identity === pinnedId);

  return (
    <div className="meeting-shell">
      <div style={{ flex: 1, position: "relative" }}>
        {pinned ? (
          <FocusLayout trackRef={pinned} />
        ) : (
          <GridLayout tracks={tracks}>
            <ParticipantTile />
          </GridLayout>
        )}

        {reactions.map((r) => (
          <div key={r.id} className="reaction-pop" style={{ left: `${r.x}%` }}>
            {r.emoji}
          </div>
        ))}

        {whiteboardOpen && <Whiteboard onClose={() => setWhiteboardOpen(false)} />}
      </div>

      {chatOpen && (
        <div className="side-panel">
          <h3>Chat</h3>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {messages.map((m, i) => (
              <div className="chat-msg" key={i}>
                <b>{m.from}:</b> {m.body}
              </div>
            ))}
          </div>
          <input
            className="input"
            placeholder="Type a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
          />
        </div>
      )}

      {participantsOpen && (
        <div className="side-panel">
          <h3>Participants ({participants.length})</h3>
          {participants.map((p) => (
            <div key={p.identity} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span onClick={() => setPinnedId(p.identity)} style={{ cursor: "pointer" }}>
                📌 {p.name || p.identity}
              </span>
              {isHost && p.identity !== localParticipant.identity && (
                <button className="btn secondary" style={{ width: "auto", padding: "2px 8px" }} onClick={() => removeParticipant(p.identity)}>
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="toolbar">
        <button onClick={() => localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled)}>
          {localParticipant.isMicrophoneEnabled ? "🎤 Mute" : "🔇 Unmute"}
        </button>
        <button onClick={() => localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled)}>
          {localParticipant.isCameraEnabled ? "📷 Stop Video" : "📷 Start Video"}
        </button>
        <button onClick={() => localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled)}>
          🖥️ Share Screen
        </button>
        <button className={blurOn ? "active" : ""} onClick={toggleBlur}>
          🌫️ Blur
        </button>
        <button className={handRaised ? "active" : ""} onClick={toggleRaiseHand}>
          ✋ Raise Hand
        </button>
        <button onClick={() => sendReaction("👍")}>👍</button>
        <button onClick={() => sendReaction("😂")}>😂</button>
        <button onClick={() => sendReaction("🎉")}>🎉</button>
        <button className={chatOpen ? "active" : ""} onClick={() => { setChatOpen(!chatOpen); setParticipantsOpen(false); }}>
          💬 Chat
        </button>
        <button className={participantsOpen ? "active" : ""} onClick={() => { setParticipantsOpen(!participantsOpen); setChatOpen(false); }}>
          👥 Participants
        </button>
        <button className={whiteboardOpen ? "active" : ""} onClick={() => setWhiteboardOpen(!whiteboardOpen)}>
          🖊️ Whiteboard
        </button>
        {isHost && <button onClick={muteAll}>🔇 Mute All</button>}
        {isHost && (
          <button className={recording ? "danger" : ""} onClick={toggleRecording}>
            {recording ? "⏺️ Stop Recording" : "⏺️ Record"}
          </button>
        )}
        <button onClick={() => setReportOpen(true)}>⚠️ Report</button>
        <button onClick={() => document.documentElement.requestFullscreen()}>⛶ Fullscreen</button>
        <button className="danger" onClick={endCallForAll}>
          📞 {isHost ? "End Meeting" : "Leave"}
        </button>
      </div>

      {reportOpen && <ReportModal meetingId={meetingIdRef.current} onClose={() => setReportOpen(false)} />}
    </div>
  );
}

function displayNameOf(p: any) {
  return p.name || p.identity;
}
