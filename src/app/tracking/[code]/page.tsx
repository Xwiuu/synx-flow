"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    Terminal, CheckCircle2, Circle, Lock, Zap, FileText, Image as ImageIcon,
    Download, Activity, Wallet, Banknote, Clock, AlertTriangle, FileCheck, Receipt
} from "lucide-react";

export default function ClientTrackingPortal() {
    const params = useParams();
    const trackingCode = params.code;

    const [project, setProject] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [installments, setInstallments] = useState<any[]>([]);
    const [financeDocs, setFinanceDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const phases = ["Briefing", "Design", "Desenvolvimento", "QA / Performance", "Aguard. Cliente", "Entregue"];

    useEffect(() => {
        if (trackingCode) fetchClientData();
    }, [trackingCode]);

    const fetchClientData = async () => {
        setLoading(true);
        try {
            // 1. Busca o projeto pelo código secreto
            const { data: projData, error } = await supabase
                .from("projects")
                .select("*")
                .eq("tracking_code", trackingCode)
                .single();

            if (error || !projData) throw new Error("Operação não encontrada ou link inválido.");
            setProject(projData);

            // 2. Busca o progresso (tarefas)
            const { data: taskData } = await supabase.from("tasks").select("*").eq("project_id", projData.id);
            if (taskData) setTasks(taskData);

            // 3. Busca os arquivos do Vault normal (Design, Assets)
            const { data: attachData } = await supabase.from("attachments").select("*").eq("project_id", projData.id);
            if (attachData) setAttachments(attachData);

            // 4. Busca as Faturas (Financeiro)
            const { data: instData } = await supabase.from("finance_installments").select("*").eq("project_id", projData.id).order("created_at", { ascending: true });
            if (instData) setInstallments(instData);

            // 5. Busca os Contratos e Notas Fiscais
            const { data: fDocsData } = await supabase.from("finance_docs").select("*").eq("project_id", projData.id).order("created_at", { ascending: false });
            if (fDocsData) setFinanceDocs(fDocsData);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-screen w-full bg-[#020202] flex flex-col items-center justify-center space-y-4">
            <div className="relative flex items-center justify-center">
                <div className="absolute w-16 h-16 border-t-2 border-synx rounded-full animate-spin" />
                <Zap size={24} className="text-synx animate-pulse" />
            </div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.5em] mt-4">Estabelecendo Conexão Segura</p>
        </div>
    );

    if (!project) return (
        <div className="h-screen w-full bg-[#020202] flex flex-col items-center justify-center text-center px-6">
            <Lock size={48} className="text-zinc-800 mb-6" />
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Acesso Negado</h1>
            <p className="text-xs font-mono text-zinc-500 mt-2 uppercase tracking-widest">Link de rastreamento inválido ou expirado.</p>
        </div>
    );

    // 🔹 CÁLCULOS
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    const currentPhaseIndex = phases.findIndex(p => p.includes(project.phase?.split(" ")[0] || "Briefing"));

    const totalAmount = project.total_value > 0 ? project.total_value : installments.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const paidAmount = installments.filter(i => i.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const financeProgress = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

    return (
        <div className="min-h-screen w-full bg-[#020202] text-white selection:bg-synx selection:text-black pb-20">

            {/* 🔹 BACKGROUND FX */}
            <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-synx/5 to-transparent pointer-events-none" />
            <div className="fixed top-[-20%] left-[20%] w-[600px] h-[600px] bg-synx/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-[1200px] mx-auto pt-12 px-6 relative z-10">

                {/* HEADER BRANDING */}
                <header className="flex items-center justify-between mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-synx/10 flex items-center justify-center border border-synx/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <Terminal size={18} className="text-synx" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-white tracking-tighter italic leading-none">SYNX<span className="text-synx">Flow</span></h1>
                            <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Client_Tracking_Portal</p>
                        </div>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                        <Activity size={12} className="text-synx animate-pulse" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Live Sync</span>
                    </div>
                </header>

                {/* IDENTIFICAÇÃO DO PROJETO */}
                <div className="mb-16 animate-in fade-in zoom-in-95 duration-700 delay-100">
                    <p className="text-[10px] font-black text-synx uppercase tracking-[0.3em] mb-4">Operação Ativa</p>
                    <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none mb-6">
                        {project.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-6">
                        <p className="text-sm font-mono text-zinc-400 uppercase tracking-widest">
                            Entidade: <span className="text-white font-bold">{project.client}</span>
                        </p>
                        <div className="h-4 w-[1px] bg-white/20 hidden md:block" />
                        <p className="text-sm font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            Status: <span className="px-3 py-1 bg-white/10 text-white rounded-md text-[10px] font-black">{project.status || 'Normal'}</span>
                        </p>
                    </div>
                </div>

                {/* 🔹 ESTEIRA DE PRODUÇÃO (STEPPER) */}
                <div className="bg-[#050505] border border-white/10 p-8 md:p-12 rounded-[40px] mb-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-10">Faseamento do Projeto</h3>

                    <div className="relative flex justify-between">
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2 rounded-full" />
                        <div
                            className="absolute top-1/2 left-0 h-[2px] bg-synx -translate-y-1/2 rounded-full shadow-[0_0_10px_#10b981] transition-all duration-1000"
                            style={{ width: `${Math.max(0, (currentPhaseIndex / (phases.length - 1)) * 100)}%` }}
                        />

                        {phases.map((phase, idx) => {
                            const isActive = idx === currentPhaseIndex;
                            const isPast = idx < currentPhaseIndex;

                            return (
                                <div key={phase} className="relative z-10 flex flex-col items-center gap-4 group">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${isActive ? 'bg-synx border-synx text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-125' :
                                            isPast ? 'bg-[#050505] border-synx text-synx' : 'bg-[#050505] border-white/10 text-zinc-700'
                                        }`}>
                                        {isPast ? <CheckCircle2 size={14} /> : isActive ? <Zap size={14} className="animate-pulse" /> : <Circle size={10} />}
                                    </div>
                                    <span className={`absolute -bottom-8 w-max text-center text-[9px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-synx' : isPast ? 'text-zinc-400' : 'text-zinc-700'
                                        }`}>
                                        {phase}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 🔹 GRIDS DE INFORMAÇÃO: ENGENHARIA E FINANCEIRO */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">

                    {/* PROGRESSO TÉCNICO */}
                    <div className="bg-[#050505] border border-white/10 p-10 rounded-[40px] relative overflow-hidden group hover:border-white/20 transition-all">
                        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-8">Progresso de Engenharia</h3>
                        <div className="flex items-end gap-4 mb-6">
                            <span className="text-7xl font-black italic tracking-tighter text-white leading-none">{progressPercent}%</span>
                            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Concluído</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                            <div
                                className="h-full bg-gradient-to-r from-synx to-teal-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-6">
                            {completedTasks} de {tasks.length} processos internos finalizados.
                        </p>
                    </div>

                    {/* PROGRESSO FINANCEIRO */}
                    <div className="bg-[#050505] border border-white/10 p-10 rounded-[40px] relative overflow-hidden group hover:border-white/20 transition-all">
                        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                            <Wallet size={14} className="text-synx" /> Situação Financeira
                        </h3>
                        <div className="flex items-end gap-4 mb-6">
                            <span className="text-7xl font-black italic tracking-tighter text-white leading-none">{financeProgress}%</span>
                            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Quitado</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                            <div
                                className="h-full bg-gradient-to-r from-synx to-teal-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                style={{ width: `${financeProgress}%` }}
                            />
                        </div>
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-6">
                            Total do Contrato: R$ {Number(totalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>

                    {/* EXTRATO (FATURAS) */}
                    <div className="bg-[#050505] border border-white/10 p-10 rounded-[40px]">
                        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                            <Banknote size={14} className="text-zinc-500" /> Extrato de Faturas
                        </h3>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {installments.length === 0 ? (
                                <div className="py-10 text-center border border-dashed border-white/5 rounded-3xl">
                                    <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Nenhuma fatura lançada.</p>
                                </div>
                            ) : (
                                installments.map((inst) => (
                                    <div key={inst.id} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${inst.status === 'paid' ? 'bg-synx/10 border-synx/30 text-synx' : inst.status === 'overdue' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-white/5 border-white/10 text-zinc-500'}`}>
                                                {inst.status === 'paid' ? <CheckCircle2 size={14} /> : inst.status === 'overdue' ? <AlertTriangle size={14} /> : <Clock size={14} />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white uppercase">{inst.description}</p>
                                                <p className="text-[10px] font-mono text-zinc-400 mt-1">R$ {Number(inst.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${inst.status === 'paid' ? 'bg-synx/20 text-synx border-synx/20' : inst.status === 'overdue' ? 'bg-red-500/20 text-red-500 border-red-500/20' : 'bg-white/10 text-zinc-400 border-white/5'}`}>
                                            {inst.status === 'paid' ? 'PAGO' : inst.status === 'overdue' ? 'ATRASADO' : 'PENDENTE'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* COFRE DO CLIENTE (DOCUMENTOS E ASSETS) */}
                    <div className="bg-[#050505] border border-white/10 p-10 rounded-[40px] flex flex-col gap-8">

                        {/* DOCUMENTOS FINANCEIROS */}
                        <div>
                            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <FileCheck size={14} className="text-zinc-500" /> Documentos Oficiais
                            </h3>
                            <div className="space-y-3">
                                {financeDocs.length === 0 ? (
                                    <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest p-4 border border-dashed border-white/5 rounded-2xl text-center">Nenhum documento anexado.</p>
                                ) : (
                                    financeDocs.map((doc) => (
                                        <a key={doc.id} href={doc.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-synx/30 transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-synx transition-colors">
                                                {doc.doc_type === 'contract' ? <FileText size={16} /> : <Receipt size={16} />}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-xs font-bold text-white truncate">{doc.file_name}</p>
                                                <p className="text-[9px] font-mono text-synx uppercase mt-1">{doc.doc_type === 'contract' ? 'Contrato' : 'Nota Fiscal'}</p>
                                            </div>
                                            <Download size={16} className="text-zinc-600 group-hover:text-synx transition-colors" />
                                        </a>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* ASSETS E ENTREGÁVEIS */}
                        <div>
                            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <Lock size={14} className="text-zinc-500" /> Arquivos Entregáveis
                            </h3>
                            <div className="space-y-3">
                                {attachments.length === 0 ? (
                                    <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest p-4 border border-dashed border-white/5 rounded-2xl text-center">Nenhum asset liberado.</p>
                                ) : (
                                    attachments.map((file) => (
                                        <a key={file.id} href={file.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-synx/30 transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-synx transition-colors">
                                                {file.file_type?.includes('image') ? <ImageIcon size={16} /> : <FileText size={16} />}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-xs font-bold text-white truncate">{file.file_name}</p>
                                            </div>
                                            <Download size={16} className="text-zinc-600 group-hover:text-synx transition-colors" />
                                        </a>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}