import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getLevelProgress } from "@/lib/rpg/engine";
import { GameHudProvider } from "@/lib/context/GameHudContext";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default async function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Calculate progress for HUD
  const progress = getLevelProgress(user.character?.totalXp || 0);
  const userWithProgress = {
    ...user,
    character: {
      ...user.character,
      progress,
    },
  };

  return (
    <GameHudProvider initialUser={userWithProgress}>
      <div className="min-h-screen bg-[#08090d] text-[#f3f4f6] flex flex-col">
        <AppNavbar
          user={userWithProgress}
          character={userWithProgress.character}
          streak={userWithProgress.streak}
        />

        <div className="flex-1 flex pb-16 md:pb-0">
          <AppSidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
            {children}
          </main>
        </div>

        <MobileNav />
      </div>
    </GameHudProvider>
  );
}
