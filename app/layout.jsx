import { ReduxProvider } from "@/redux/provider";
import './globals.css';
import PageLoader from "../components/PageLoader";
import { Geist, Geist_Mono, Sora, DM_Sans } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sora",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
});

export const metadata = {
  title: "Smart AI Based – Photo organizer & Auto Editing Platform",
  icons: { icon: "/assets/logo.png", apple: "/assets/logo.png" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} ${dmSans.variable} antialiased`}>
        <ReduxProvider>
          <PageLoader />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}