import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pterodactyl Multi-Panel Dashboard",
  description: "Personal admin dashboard for multiple Pterodactyl panels"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
