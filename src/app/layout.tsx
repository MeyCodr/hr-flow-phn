import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { Providers } from "./component/provider/Providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

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
      <body className={`${poppins.variable} antialiased`}>
        {/* Wrap everything with providers */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
