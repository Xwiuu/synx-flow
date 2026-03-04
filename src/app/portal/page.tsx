"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    LayoutDashboard, Clock, CheckCircle2,
    MessageSquare, FileText, Zap
} from "lucide-react";

export default function ClientPortal() {
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchClientProject() {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                // Busca o projeto vinculado ao cliente (usando o campo client ou e-mail)
                const { data } = await supabase
                    .from("projects")
                    .select("*")
                    .eq("client_email", session.user.email) // Precisamos dessa coluna no banco depois
                    .single();

                setProject(data);
            }
            setLoading(false);
        }
        fetchClientProject();
    }, []);

    if (loading) return <div className="p-20 text-zinc-500 animate-pulse text-center font-bold">Sincronizando com a SYNX...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">

            {/* HEADER PORTAL */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">
                        Seu <span className="text-synx">Projeto.</span>
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium">Acompanhe a evolução da sua entrega em tempo real.</p>
                </div>
                <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                    <Zap size={18} className="text-synx" fill="currentColor" />
                    <span className="text-sm font-bold text-white uppercase tracking-widest">Status: {project?.status || "Inativo"}</span>
                </div>
            </div>

            {/* CARD PRINCIPAL DE PROGRESSO */}
            <div className="glass-panel p-10 rounded-[40px] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                <div className="flex flex-col md:flex-row gap-12 items-center">

                    <div className="relative h-48 w-48 flex items-center justify-center">
                        <svg className="h-full w-full rotate-[-90deg]">
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                            <circle
                                cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                                strokeDasharray={552.92}
                                strokeDashoffset={552.92 - (552.92 * (project?.progress || 0)) / 100}
                                className="text-synx transition-all duration-1000 ease-out"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-5xl font-black text-white">{project?.progress || 0}%</span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Concluído</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">{project?.name || "Projeto em análise"}</h2>
                            <p className="text-zinc-400 mt-1 uppercase text-xs font-bold tracking-widest">Fase atual: {project?.phase || "Briefing"}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Previsão de Entrega</p>
                                <p className="text-white font-bold">{project?.days_left || 0} Dias restantes</p>
                            </div>
                            <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Atendimento</p>
                                <p className="text-synx font-bold">Suporte Ativo</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button className="flex flex-col items-center justify-center gap-4 p-8 glass-panel rounded-3xl border border-white/5 hover:border-synx/30 transition-all group">
                    <MessageSquare className="text-zinc-500 group-hover:text-synx transition-colors" size={32} />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Falar com Dev</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-4 p-8 glass-panel rounded-3xl border border-white/5 hover:border-synx/30 transition-all group">
                    <FileText className="text-zinc-500 group-hover:text-synx transition-colors" size={32} />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Documentação</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-4 p-8 glass-panel rounded-3xl border border-white/5 hover:border-synx/30 transition-all group">
                    <CheckCircle2 className="text-zinc-500 group-hover:text-synx transition-colors" size={32} />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Aprovar Etapa</span>
                </button>
            </div>

        </div>
    );
}