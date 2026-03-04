"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Search, Shield, User, Plus, MoreVertical, Terminal, X, Zap, Building2, UserCircle, Dices, FolderPlus } from "lucide-react";

export default function UsersHub() {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // 🔹 CONTROLES DO NOVO ONBOARDING
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // Trava o botão durante o envio
    const [operatorType, setOperatorType] = useState<"PF" | "PJ">("PJ");
    const [createProjectFlow, setCreateProjectFlow] = useState(false);

    const [newUser, setNewUser] = useState({
        name: "", companyName: "", email: "", password: "", role: "client"
    });
    const [newProject, setNewProject] = useState({
        name: "", phase: "Briefing"
    });

    const fetchProfiles = async () => {
        setIsLoading(true);
        const { data } = await supabase.from("profiles").select("*").order("role", { ascending: true });
        if (data) setProfiles(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    // 🔹 GERADOR DE SENHA TEMPORÁRIA SEGURO
    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
        let pass = "";
        for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
        setNewUser({ ...newUser, password: pass });
    };

    // 🔹 INTEGRAÇÃO COM A API MÁGICA
    const handleCreateOperator = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    operatorType,
                    companyName: newUser.companyName,
                    name: newUser.name,
                    email: newUser.email,
                    password: newUser.password,
                    role: newUser.role,
                    createProjectFlow,
                    project: newProject
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro desconhecido ao criar operador.");
            }

            // Sucesso total!
            alert("ACESSOS GERADOS COM SUCESSO!");

            // Limpa os campos e fecha o modal
            setNewUser({ name: "", companyName: "", email: "", password: "", role: "client" });
            setNewProject({ name: "", phase: "Briefing" });
            setCreateProjectFlow(false);
            setIsModalOpen(false);

            // Atualiza a lista da tela
            fetchProfiles();

        } catch (error: any) {
            alert(`FALHA NA INTEGRAÇÃO: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredProfiles = profiles.filter(p =>
        (p.full_name && p.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-10">

            {/* 🔹 HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
                <div>
                    <div className="flex items-center gap-2 text-synx mb-4">
                        <Terminal size={14} />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em]">Módulo de Acesso</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Operadores da <br /> <span className="text-synx">Rede.</span>
                    </h1>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-black hover:bg-synx font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                >
                    <Plus size={16} />
                    <span>Novo Operador</span>
                </button>
            </div>

            {/* 🔹 BUSCA */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-synx text-zinc-400"><Search size={18} /></div>
                <input type="text" placeholder="BUSCAR POR NOME OU E-MAIL..." className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-4 py-5 text-xs font-mono font-bold tracking-[0.2em] text-white focus:outline-none focus:border-synx focus:bg-white/[0.06] transition-all placeholder:text-zinc-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            {/* 🔹 GRID DE USUÁRIOS E ESTADO VAZIO */}
            {isLoading ? (
                <div className="p-20 flex justify-center border border-white/10 rounded-[32px] bg-white/[0.02]"><p className="text-xs font-mono text-zinc-400 uppercase tracking-widest animate-pulse">Buscando registros na rede...</p></div>
            ) : filteredProfiles.length === 0 ? (
                <div className="p-24 flex flex-col items-center justify-center border border-dashed border-white/20 rounded-[32px] bg-white/[0.01]">
                    <Shield size={48} className="text-zinc-700 mb-6" />
                    <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-2">Rede Vazia</h3>
                    <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest text-center max-w-sm">Nenhum operador encontrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProfiles.map((profile) => (
                        <div key={profile.id} className="bg-[#080808] border border-white/10 p-6 rounded-[24px] hover:border-synx/40 transition-all group relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-synx/10 rounded-full blur-[50px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`h-12 w-12 rounded-xl border flex items-center justify-center font-black text-lg ${profile.role === 'admin' ? 'bg-synx/10 border-synx/30 text-synx' : 'bg-white/5 border-white/20 text-white'}`}>
                                        {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : <User size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{profile.full_name}</h3>
                                        <p className="text-[10px] font-mono text-zinc-400 mt-1">{profile.email}</p>
                                    </div>
                                </div>
                                <button className="text-zinc-500 hover:text-white transition-colors"><MoreVertical size={16} /></button>
                            </div>
                            <div className="flex items-center justify-between pt-6 border-t border-white/10 relative z-10">
                                <div className="flex items-center gap-2">
                                    {profile.role === 'admin' ? <><Shield size={14} className="text-synx" /><span className="text-[10px] font-black text-synx uppercase tracking-[0.2em]">Administrador</span></> : <><User size={14} className="text-zinc-400" /><span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Cliente</span></>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 🔹 MODAL DE ONBOARDING INTELIGENTE */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-xl bg-[#050505] rounded-[32px] border border-white/10 shadow-[0_0_80px_-20px_rgba(16,185,129,0.2)] flex flex-col max-h-[90vh]">

                        <div className="flex justify-between items-start p-8 border-b border-white/5 shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Novo <span className="text-synx">Operador</span></h2>
                                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mt-2">Fluxo de integração de conta</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-600 hover:text-white transition-colors"><X size={24} /></button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <form id="onboarding-form" onSubmit={handleCreateOperator} className="space-y-8">

                                {/* 1. TIPO DE OPERADOR */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block">1. Natureza do Contrato</label>
                                    <div className="grid grid-cols-2 gap-4 bg-white/[0.02] p-2 rounded-2xl border border-white/5">
                                        <button type="button" onClick={() => setOperatorType("PJ")} className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${operatorType === "PJ" ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}><Building2 size={16} /> Pessoa Jurídica</button>
                                        <button type="button" onClick={() => setOperatorType("PF")} className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${operatorType === "PF" ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}><UserCircle size={16} /> Pessoa Física</button>
                                    </div>
                                </div>

                                {/* 2. DADOS DE IDENTIFICAÇÃO E NÍVEL DE ACESSO */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block">2. Dados de Acesso</label>

                                    {operatorType === "PJ" && (
                                        <input required type="text" placeholder="RAZÃO SOCIAL DA EMPRESA" className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-5 py-4 text-xs font-mono font-bold tracking-widest text-white focus:border-synx transition-all placeholder:text-zinc-600" value={newUser.companyName} onChange={(e) => setNewUser({ ...newUser, companyName: e.target.value })} />
                                    )}

                                    <input required type="text" placeholder={operatorType === "PJ" ? "NOME DO REPRESENTANTE" : "NOME COMPLETO"} className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-5 py-4 text-xs font-mono font-bold tracking-widest text-white focus:border-synx transition-all placeholder:text-zinc-600" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />

                                    <input required type="email" placeholder="E-MAIL PARA LOGIN" className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-5 py-4 text-xs font-mono font-bold tracking-widest text-white focus:border-synx transition-all placeholder:text-zinc-600" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />

                                    {/* Nível de Acesso */}
                                    <select className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-5 py-4 text-xs font-mono font-bold tracking-widest text-white focus:border-synx transition-all appearance-none" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                                        <option value="client">NÍVEL: CLIENTE (PORTAL)</option>
                                        <option value="admin">NÍVEL: ADMINISTRADOR (FULL ACCESS)</option>
                                    </select>

                                    {/* SENHA TEMPORÁRIA COM GERADOR */}
                                    <div className="flex gap-2">
                                        <input required type="text" placeholder="SENHA TEMPORÁRIA" className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-5 py-4 text-xs font-mono font-bold tracking-widest text-white focus:border-synx transition-all placeholder:text-zinc-600" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                                        <button type="button" onClick={generatePassword} className="px-5 bg-white/[0.05] border border-white/10 rounded-xl text-synx hover:bg-synx/10 hover:border-synx/30 transition-all flex items-center justify-center group" title="Gerar Senha Aleatória">
                                            <Dices size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* 3. VÍNCULO DE PROJETO (ONBOARDING) */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xs font-black text-white uppercase tracking-widest">Integração de Projeto</h4>
                                            <p className="text-[10px] font-mono text-zinc-500 uppercase mt-1">Iniciar painel do cliente automaticamente?</p>
                                        </div>
                                        <button type="button" onClick={() => setCreateProjectFlow(!createProjectFlow)} className={`w-12 h-6 rounded-full transition-colors relative ${createProjectFlow ? 'bg-synx' : 'bg-zinc-800'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${createProjectFlow ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    {createProjectFlow && (
                                        <div className="p-5 bg-synx/5 border border-synx/20 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FolderPlus size={16} className="text-synx" />
                                                <span className="text-[10px] font-black text-synx uppercase tracking-[0.2em]">Escopo Inicial</span>
                                            </div>
                                            <input required={createProjectFlow} type="text" placeholder="NOME DO PROJETO (EX: APP VENDAS)" className="w-full bg-black/50 border border-synx/20 rounded-xl px-4 py-3 text-xs font-mono font-bold tracking-widest text-white focus:border-synx transition-all placeholder:text-zinc-600" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
                                            <select className="w-full bg-black/50 border border-synx/20 rounded-xl px-4 py-3 text-xs font-mono font-bold tracking-widest text-white focus:border-synx transition-all appearance-none" value={newProject.phase} onChange={(e) => setNewProject({ ...newProject, phase: e.target.value })}>
                                                <option value="Briefing">FASE: BRIEFING / REUNIÃO INICIAL</option>
                                                <option value="Design">FASE: UI/UX DESIGN</option>
                                                <option value="Desenvolvimento">FASE: DESENVOLVIMENTO ATIVO</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="p-8 border-t border-white/5 shrink-0 bg-[#020202]">
                            <button
                                form="onboarding-form"
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-white text-black py-5 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-synx transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Zap size={14} />
                                {isSubmitting ? "PROCESSANDO INTEGRAÇÃO..." : "Registrar Acesso e Onboarding"}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}