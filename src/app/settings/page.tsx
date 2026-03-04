"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    Terminal, User, Shield, HardDrive, Bell, Key,
    LogOut, Save, Activity, Zap, CheckCircle2, AlertTriangle, ChevronDown
} from "lucide-react";

export default function Settings() {
    const [activeTab, setActiveTab] = useState<"perfil" | "seguranca" | "sistema">("perfil");
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [userData, setUserData] = useState({
        fullName: "",
        email: "",
        id: ""
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
            setUserData({
                fullName: session.user.user_metadata?.full_name || "",
                email: session.user.email || "",
                id: session.user.id
            });
        }
        setLoading(false);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: userData.fullName }
            });

            if (error) throw error;

            const op = userData.fullName.split(" ")[0];
            await supabase.from("activity_logs").insert([{
                operator_name: op,
                action_type: "SYSTEM",
                message: "atualizou os parâmetros de perfil",
                project_name: "Configurações"
            }]);

            alert("PARÂMETROS SINCRONIZADOS COM SUCESSO!");
        } catch (error: any) {
            alert("ERRO NA SINCRONIZAÇÃO: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetPassword = async () => {
        if (!userData.email) return;
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(userData.email);
            if (error) throw error;
            alert("Protocolo de redefinição enviado para o seu e-mail!");
        } catch (error: any) {
            alert("Erro: " + error.message);
        }
    };

    const handleLogout = async () => {
        if (confirm("Encerrar sessão no terminal?")) {
            await supabase.auth.signOut();
            window.location.href = "/";
        }
    };

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center h-[80vh] space-y-4">
            <div className="relative flex items-center justify-center">
                <div className="absolute w-16 h-16 border-t-2 border-synx rounded-full animate-spin" />
                <Zap size={24} className="text-synx animate-pulse" />
            </div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.5em] mt-4">Carregando_Preferências_Globais</p>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">

            {/* HEADER PRINCIPAL */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-synx opacity-70">
                        <Terminal size={14} />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em]">Intelligence_Center_v4</span>
                    </div>
                    <h1 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-[0.8]">
                        Parâmetros do <br /> <span className="text-synx text-transparent bg-clip-text bg-gradient-to-r from-synx to-teal-400">Núcleo.</span>
                    </h1>
                </div>
                <div className="bg-white/[0.02] border border-white/10 px-6 py-4 rounded-3xl backdrop-blur-xl flex items-center gap-4 hover:border-synx transition-all">
                    <div className="w-2 h-2 rounded-full bg-synx animate-pulse shadow-[0_0_10px_#10b981]" />
                    <div className="text-right">
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Status da Rede</p>
                        <p className="text-xs font-bold text-white uppercase tracking-tighter">Live_Sync_Ativo</p>
                    </div>
                </div>
            </header>

            {/* ÁREA ANALÍTICA DAS CONFIGS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

                {/* MENU LATERAL */}
                <div className="md:col-span-1 space-y-4">
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-4 mb-6">Queue_Manager</h3>
                    {[
                        { id: "perfil", label: "Perfil Operacional", icon: User },
                        { id: "seguranca", label: "Protocolos Gatekeeper", icon: Shield },
                        { id: "sistema", label: "Integrações APIs", icon: HardDrive }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-4 p-6 rounded-[32px] border transition-all ${activeTab === item.id
                                    ? "bg-gradient-to-br from-synx/20 to-synx/5 border-synx/30 text-synx shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                    : "bg-white/[0.02] border-white/5 text-zinc-500 hover:text-white hover:bg-white/[0.04]"
                                }`}
                        >
                            <item.icon size={18} />
                            <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                        </button>
                    ))}

                    <div className="pt-8 border-t border-white/5 mt-8">
                        <button onClick={handleLogout} className="w-full flex items-center gap-4 p-6 rounded-[32px] bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                            <LogOut size={18} /> Encerrar Conexão
                        </button>
                    </div>
                </div>

                {/* PAINEL CENTRAL FLUTUANTE */}
                <div className="md:col-span-3 bg-white/[0.01] border border-white/5 rounded-[40px] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-synx/5 rounded-full blur-[100px] pointer-events-none" />

                    {activeTab === "perfil" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl relative z-10">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Identidade_v3.0</h2>

                            <div className="flex items-center gap-8">
                                <div className="w-28 h-28 rounded-[40px] bg-gradient-to-br from-synx to-emerald-800 flex items-center justify-center text-black font-black text-4xl shadow-[0_0_30px_rgba(16,185,129,0.2)] border border-white/10 group relative cursor-pointer">
                                    {userData.fullName.charAt(0) || "U"}
                                    <div className="absolute inset-0 bg-black/60 rounded-[40px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] font-mono text-synx">MUDAR</div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">{userData.fullName || "Mestre Operador"}</h4>
                                    <p className="text-[10px] font-mono text-zinc-500 uppercase mt-1 tracking-widest">Codinome de Registro Global</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-3">Nome do Protocolo (Mestre)</label>
                                    <input
                                        type="text"
                                        value={userData.fullName}
                                        onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-synx outline-none transition-all placeholder:text-zinc-700"
                                    />
                                </div>
                                <div className="space-y-3 opacity-60">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-3">E-mail (System_ID)</label>
                                    <input type="email" value={userData.email} disabled className="w-full bg-white/[0.01] border border-white/5 rounded-2xl px-6 py-4 text-sm font-mono text-zinc-600" />
                                </div>
                                <button type="submit" disabled={isSaving} className="bg-synx text-black px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 flex items-center gap-3 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                    <Save size={18} /> {isSaving ? "Sincronizando..." : "Gravar Parâmetros"}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === "seguranca" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl relative z-10">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Chaves_e_Acesso</h2>

                            <div className="bg-[#080808] border border-white/5 p-8 rounded-[32px] flex items-center justify-between group hover:border-synx/30 transition-all">
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Chave Criptográfica (Senha)</h4>
                                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Definida na criação da conta do operador.</p>
                                </div>
                                <button onClick={handleResetPassword} className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-synx hover:text-synx transition-all flex items-center gap-2">
                                    <Key size={14} /> Redefinir
                                </button>
                            </div>

                            <div className="bg-[#080808] border border-red-500/20 p-8 rounded-[32px] flex items-start gap-6 border-dashed">
                                <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl shrink-0 mt-1"><AlertTriangle size={20} /></div>
                                <div>
                                    <h4 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2">Zona de Risco</h4>
                                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-relaxed">Encerrar a sua conta removerá permanentemente todos os seus dados e acesso aos projetos do sistema SYNX.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "sistema" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl relative z-10">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Integrações_Ativas</h2>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] flex items-center gap-6 group hover:border-synx/30 transition-all">
                                    <div className="w-14 h-14 rounded-2xl bg-synx/10 text-synx border border-synx/20 flex items-center justify-center animate-pulse"><Activity size={24} /></div>
                                    <div><h4 className="text-sm font-bold text-white uppercase tracking-wider">Supabase</h4><p className="text-[9px] font-mono text-zinc-600 uppercase">Core_Realtime_OK</p></div>
                                </div>
                                <div className="bg-white/[0.01] border border-white/5 p-8 rounded-[32px] flex items-center gap-6 opacity-40 group hover:opacity-100 hover:border-synx/30 transition-all">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 text-zinc-600 border border-white/10 flex items-center justify-center"><Bell size={24} /></div>
                                    <div><h4 className="text-sm font-bold text-white uppercase tracking-wider">Discord</h4><p className="text-[9px] font-mono text-zinc-600 uppercase">Webhook_Inativo</p></div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}