import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./component/provider/Providers";

export const metadata: Metadata = {
  title: "PHN FMS",
  description: "Human Resource Forms Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Wrap everything with providers */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
