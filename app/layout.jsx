import './globals.css';
import { Geist, Geist_Mono } from "next/font/google";
import ClientProviders from "@/components/ClientProviders"; // new component

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "MediCore Hospital – Emphasizes core medical services",
  icons: { icon: "/assets/logo.png", apple: "/assets/logo.png" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
