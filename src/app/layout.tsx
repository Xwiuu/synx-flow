"use client";

import { Sidebar } from "@/components/Sidebar";
import "./globals.css";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 🔹 A MÁGICA AQUI: Esconde a Sidebar no Login E no Portal do Cliente
  const isPublicPage = pathname === "/login" || pathname.startsWith("/tracking");

  return (
    <html lang="pt-br">
      <body className="bg-[#020202] text-white antialiased font-sans">

        {isPublicPage ? (
          <main className="w-screen h-screen overflow-x-hidden overflow-y-auto bg-[#020202] custom-scrollbar">
            {children}
          </main>
        ) : (
          <div className="flex h-screen w-screen overflow-hidden">
            <Sidebar />

            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-[#020202] relative custom-scrollbar">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(16,185,129,0.05)_0%,_transparent_50%)] pointer-events-none" />
              <div className="relative z-10 p-8 lg:p-12">
                {children}
              </div>
            </main>
          </div>
        )}

      </body>
    </html>
  );
}