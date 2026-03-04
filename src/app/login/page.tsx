"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Terminal, Mail, Lock, ArrowRight, Zap, AlertTriangle } from "lucide-react";

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            // Acesso concedido, joga pro Dashboard
            router.push("/");
        } catch (err: any) {
            setError("Credenciais inválidas. Acesso negado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#020202] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-synx selection:text-black">

            {/* 🔹 NEON GLOW DE FUNDO */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-synx/10 rounded-full blur-[150px] pointer-events-none animate-pulse duration-1000" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-900/10 rounded-full blur-[120px] pointer-events-none" />

            {/* 🔹 O COFRE (CARD DE ACESSO STRICT) */}
            <div className="relative z-10 w-full max-w-[480px] bg-[#050505]/80 backdrop-blur-2xl border border-white/10 p-10 sm:p-14 rounded-[48px] shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-700">

                {/* LOGO E TÍTULO */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 text-synx mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-synx/10 flex items-center justify-center border border-synx/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <Terminal size={24} />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tighter italic">
                            SYNX<span className="text-synx">Flow</span>
                        </h1>
                    </div>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                        Acesso ao<br />
                        <span className="text-synx text-transparent bg-clip-text bg-gradient-to-r from-synx to-teal-400">
                            Núcleo.
                        </span>
                    </h2>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase mt-4 tracking-[0.2em]">
                        Insira suas credenciais de segurança
                    </p>
                </div>

                {/* ALERTA DE ERRO */}
                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-in fade-in">
                        <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-bold text-red-400 uppercase tracking-widest">{error}</p>
                    </div>
                )}

                {/* FORMULÁRIO STRICT DE LOGIN */}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2 group">
                        <label className="text-[9px] font-black text-zinc-600 uppercase ml-3 tracking-widest">System_ID (E-mail)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-synx transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                required
                                type="email"
                                placeholder="operador@synx.com"
                                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white focus:bg-white/[0.04] focus:border-synx/50 outline-none transition-all placeholder:text-zinc-700"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <label className="text-[9px] font-black text-zinc-600 uppercase ml-3 tracking-widest">Chave Criptográfica (Senha)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-synx transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                required
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white focus:bg-white/[0.04] focus:border-synx/50 outline-none transition-all placeholder:text-zinc-700"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-synx text-black py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:brightness-110 flex items-center justify-center gap-3 transition-all disabled:opacity-50 mt-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                    >
                        {loading ? <Zap size={18} className="animate-pulse" /> : <ArrowRight size={18} />}
                        {loading ? "Sincronizando..." : "Iniciar Conexão"}
                    </button>
                </form>

            </div>
        </div>
    );
}