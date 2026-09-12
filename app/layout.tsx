import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/ThemeContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "LIFE RPG | Level Up Your Reality",
  description:
    "Transform daily habits, coding, study, and fitness into an epic RPG progression. Complete quests, earn XP, defeat boss quests, level up your attributes, and climb the leaderboard.",
  keywords: ["productivity", "gamification", "rpg", "habit tracker", "life rpg", "level up", "streaks"],
  authors: [{ name: "LIFE RPG Architects" }],
  openGraph: {
    title: "LIFE RPG | Turn Your Real Life Into a Game",
    description: "Level up your reality with non-linear XP progression, boss battles, and tangible rewards.",
    type: "website",
    locale: "en_US",
    siteName: "LIFE RPG",
  },
  twitter: {
    card: "summary_large_image",
    title: "LIFE RPG | Turn Your Real Life Into a Game",
    description: "Level up your reality with non-linear XP progression, boss battles, and tangible rewards.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} dark`}>
      <body className="min-h-screen bg-[#08090d] text-[#f3f4f6] antialiased selection:bg-cyan-500 selection:text-black">
        <ThemeProvider initialTheme="cyberpunk">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
