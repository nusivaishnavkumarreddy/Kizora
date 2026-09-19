export default function Splash({ text = "Warming up your cozy corner..." }: { text?: string }) {
  return (
    <div className="splash-wrap">
      <img src="/kizora-icon.png" alt="Kizora" />
      <h2>Kizora</h2>
      <p>{text}</p>
    </div>
  );
}
