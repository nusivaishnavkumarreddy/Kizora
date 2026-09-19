"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ReportModal({ meetingId, onClose }: { meetingId: string; onClose: () => void }) {
  const [type, setType] = useState<"abuse" | "problem">("problem");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);

  async function submit() {
    await supabase.from("reports").insert({ meeting_id: meetingId, type, details });
    setSent(true);
    setTimeout(onClose, 1200);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="home-wrap" style={{ margin: 0 }}>
        {sent ? (
          <p>Thanks — your report was submitted.</p>
        ) : (
          <>
            <h3>Report an issue</h3>
            <div className="row">
              <button className={`btn ${type === "problem" ? "" : "secondary"}`} onClick={() => setType("problem")}>
                Technical problem
              </button>
              <button className={`btn ${type === "abuse" ? "" : "secondary"}`} onClick={() => setType("abuse")}>
                Report abuse
              </button>
            </div>
            <textarea
              className="input"
              rows={4}
              placeholder="Describe what happened..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
            <div className="row">
              <button className="btn secondary" onClick={onClose}>Cancel</button>
              <button className="btn" onClick={submit}>Submit</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
