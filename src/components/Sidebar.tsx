"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Folder, Users, Settings, LogOut, TerminalSquare, Wallet } from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Projetos", href: "/projects", icon: Folder },
        { name: "Usuários", href: "/users", icon: Users },
        { name: 'Financeiro', href: '/financeiro', icon: Wallet },
        { name: "Configurações", href: "/settings", icon: Settings }
    ];

    return (
        <aside className="w-72 h-full bg-[#050505] border-r border-white/5 flex flex-col shrink-0 z-50">
            <div className="p-10">
                <div className="flex items-center gap-3 mb-14">
                    <div className="w-10 h-10 rounded-2xl bg-synx/10 flex items-center justify-center text-synx border border-synx/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <TerminalSquare size={20} />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tighter italic">
                        SYNX<span className="text-synx">Flow</span>
                    </h1>
                </div>

                <nav className="space-y-3">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all
                  ${isActive
                                        ? "bg-white text-black shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
                                        : "text-zinc-500 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Icon size={18} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-10 border-t border-white/5">
                <button className="flex items-center gap-4 text-zinc-600 hover:text-red-500 transition-colors text-[11px] font-black uppercase tracking-widest">
                    <LogOut size={18} />
                    Sair do Sistema
                </button>
            </div>
        </aside>
    );
}