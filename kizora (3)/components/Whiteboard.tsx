"use client";

import { useEffect, useRef } from "react";
import { useDataChannel } from "@livekit/components-react";

// A minimal shared whiteboard: draws locally and broadcasts strokes to everyone
// else over the same LiveKit data channel used for chat/reactions.
export default function Whiteboard({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const { send } = useDataChannel((msg) => {
    try {
      const evt = JSON.parse(new TextDecoder().decode(msg.payload));
      if (evt.type === "draw") {
        drawLine(evt.x0, evt.y0, evt.x1, evt.y1, false);
      } else if (evt.type === "clear") {
        clearCanvas(false);
      }
    } catch {}
  });

  function drawLine(x0: number, y0: number, x1: number, y1: number, broadcast: boolean) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#5b6cff";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    if (broadcast) {
      send(new TextEncoder().encode(JSON.stringify({ type: "draw", x0, y0, x1, y1 })), { reliable: true });
    }
  }

  function clearCanvas(broadcast: boolean) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (broadcast) send(new TextEncoder().encode(JSON.stringify({ type: "clear" })), { reliable: true });
  }

  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", zIndex: 30 }}>
      <div style={{ position: "absolute", top: 8, right: 8, zIndex: 31 }}>
        <button className="btn secondary" style={{ width: "auto", marginRight: 8 }} onClick={() => clearCanvas(true)}>
          Clear
        </button>
        <button className="btn" style={{ width: "auto" }} onClick={onClose}>
          Close
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        style={{ width: "100%", height: "100%" }}
        onMouseDown={(e) => {
          drawing.current = true;
          last.current = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
        }}
        onMouseUp={() => (drawing.current = false)}
        onMouseLeave={() => (drawing.current = false)}
        onMouseMove={(e) => {
          if (!drawing.current || !last.current) return;
          const x1 = e.nativeEvent.offsetX;
          const y1 = e.nativeEvent.offsetY;
          drawLine(last.current.x, last.current.y, x1, y1, true);
          last.current = { x: x1, y: y1 };
        }}
      />
    </div>
  );
}
