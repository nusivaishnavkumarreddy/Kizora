import "@livekit/components-styles";
import "./globals.css";

export const metadata = {
  title: "Kizora",
  description: "Your cozy corner for video calls",
  icons: {
    icon: "/kizora-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
