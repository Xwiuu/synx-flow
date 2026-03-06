"use client";

import { Sidebar } from "@/components/Sidebar";
import "./globals.css";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Zap } from "lucide-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Estados do Gatekeeper
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Define quais rotas não precisam de senha
  const isPublicPage = pathname === "/login" || pathname.startsWith("/tracking");

  useEffect(() => {
    // 🔹 FUNÇÃO DO GUARDA: Checar o Crachá
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session && !isPublicPage) {
        // Sem crachá e tentando entrar em área restrita = Rua.
        router.push("/login");
      } else if (session && pathname === "/login") {
        // Com crachá tentando ir pro login = Volta pro trabalho.
        router.push("/");
      } else {
        // Tudo certo, libera a catraca.
        setIsAuthorized(true);
      }
      setIsChecking(false);
    };

    checkAuth();

    // 🔹 FICA DE OLHO: Se o cara deslogar em outra aba, expulsa ele aqui também em tempo real
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && !isPublicPage) {
        router.push("/login");
      } else if (event === 'SIGNED_IN' && pathname === "/login") {
        router.push("/");
      }
    });

    return () => { authListener.subscription.unsubscribe(); };
  }, [pathname, isPublicPage, router]);

  // 🔹 TELA DE SCANNER (Enquanto o guarda checa o crachá, não mostra NADA do sistema)
  if (isChecking) {
    return (
      <html lang="pt-br">
        <body className="bg-[#020202] text-white flex items-center justify-center h-screen">
          <Zap size={32} className="text-synx animate-pulse" />
        </body>
      </html>
    );
  }

  return (
    <html lang="pt-br">
      <body className="bg-[#020202] text-white antialiased font-sans">

        {isPublicPage ? (
          <main className="w-screen h-screen overflow-x-hidden overflow-y-auto bg-[#020202] custom-scrollbar">
            {children}
          </main>
        ) : (
          isAuthorized && (
            <div className="flex h-screen w-screen overflow-hidden">
              <Sidebar />

              <main className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-[#020202] relative custom-scrollbar">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(16,185,129,0.05)_0%,_transparent_50%)] pointer-events-none" />
                <div className="relative z-10 p-8 lg:p-12">
                  {children}
                </div>
              </main>
            </div>
          )
        )}

      </body>
    </html>
  );
}