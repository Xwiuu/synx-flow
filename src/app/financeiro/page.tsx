"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    Wallet, Landmark, TrendingUp, AlertTriangle,
    ArrowUpRight, CheckCircle2, Clock, Activity, Banknote
} from "lucide-react";

export default function GlobalFinance() {
    const [loading, setLoading] = useState(true);
    const [installments, setInstallments] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        fetchGlobalFinance();

        // Fica de olho se algum pagamento cair em tempo real
        const channel = supabase
            .channel('global-finance')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_installments' }, () => fetchGlobalFinance())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchGlobalFinance = async () => {
        setLoading(true);

        // Puxa todos os projetos para somar o MRR
        const { data: projData } = await supabase.from("projects").select("id, name, client, maintenance_value");
        if (projData) setProjects(projData);

        // Puxa TODAS as faturas com os dados do projeto atrelado
        const { data: instData } = await supabase
            .from("finance_installments")
            .select("*, projects(name, client)")
            .order("created_at", { ascending: false });

        if (instData) setInstallments(instData);
        setLoading(false);
    };

    // 🔹 CÁLCULOS DOS KPIs (INTELIGÊNCIA DE NEGÓCIO)
    const totalCaixa = installments.filter(i => i.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalReceber = installments.filter(i => i.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalAtrasado = installments.filter(i => i.status === 'overdue').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalMRR = projects.reduce((acc, curr) => acc + Number(curr.maintenance_value || 0), 0);

    // 🔹 FILTROS PARA AS LISTAS
    const pendingOrOverdue = installments.filter(i => i.status !== 'paid').sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const recentPayments = installments.filter(i => i.status === 'paid').slice(0, 10); // Últimos 10 recebimentos

    if (loading) return (
        <div className="h-screen w-full bg-[#020202] flex flex-col items-center justify-center space-y-4">
            <div className="relative flex items-center justify-center">
                <div className="absolute w-16 h-16 border-t-2 border-synx rounded-full animate-spin" />
                <Activity size={24} className="text-synx animate-pulse" />
            </div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.5em] mt-4">Calculando_Caixa_Global</p>
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-[#020202] text-white overflow-y-auto custom-scrollbar pb-20">

            {/* 🔹 HEADER */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-synx opacity-80">
                        <Landmark size={14} />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em]">Financial_Intelligence</span>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                        Caixa <span className="text-synx text-transparent bg-clip-text bg-gradient-to-r from-synx to-teal-400">Forte.</span>
                    </h1>
                </div>
            </header>

            {/* 🔹 KPIs (MÉTRICAS DE CEO) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {/* CAIXA ATUAL */}
                <div className="bg-gradient-to-br from-synx/10 to-transparent border border-synx/20 p-8 rounded-[32px] relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-synx/10 rounded-full blur-2xl group-hover:bg-synx/20 transition-all" />
                    <div className="w-12 h-12 rounded-2xl bg-synx/20 text-synx flex items-center justify-center border border-synx/30 mb-6"><Wallet size={20} /></div>
                    <p className="text-[10px] font-black text-synx uppercase tracking-widest mb-1">Caixa (Recebido)</p>
                    <h4 className="text-4xl font-black italic text-white tracking-tighter truncate">
                        R$ {totalCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h4>
                </div>

                {/* MRR (RECEITA RECORRENTE) */}
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] hover:border-white/10 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 text-zinc-400 flex items-center justify-center border border-white/10 mb-6"><TrendingUp size={20} /></div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">MRR (Manutenção Mensal)</p>
                    <h4 className="text-4xl font-black italic text-white tracking-tighter truncate">
                        R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h4>
                </div>

                {/* A RECEBER */}
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] hover:border-white/10 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 text-zinc-400 flex items-center justify-center border border-white/10 mb-6"><Clock size={20} /></div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">A Receber (Pendente)</p>
                    <h4 className="text-4xl font-black italic text-white tracking-tighter truncate">
                        R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h4>
                </div>

                {/* INADIMPLÊNCIA / ATRASADO */}
                <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-[32px] hover:border-red-500/20 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 mb-6"><AlertTriangle size={20} /></div>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Inadimplência (Atrasado)</p>
                    <h4 className="text-4xl font-black italic text-white tracking-tighter truncate">
                        R$ {totalAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h4>
                </div>
            </div>

            {/* 🔹 LISTAS DE PAGAMENTOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* COLUNA 1: RADAR DE COBRANÇAS (PENDENTES) */}
                <div className="bg-[#050505] border border-white/5 rounded-[40px] p-8 md:p-10">
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-8">Radar de Cobranças (Pendentes)</h3>

                    <div className="space-y-4">
                        {pendingOrOverdue.length === 0 ? (
                            <div className="py-12 text-center border border-dashed border-white/5 rounded-[32px]">
                                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Nenhuma fatura pendente. Caixa em dia.</p>
                            </div>
                        ) : (
                            pendingOrOverdue.map((inst) => (
                                <div key={inst.id} className={`p-5 rounded-[24px] border flex items-center justify-between group ${inst.status === 'overdue' ? 'bg-red-500/5 border-red-500/20' : 'bg-white/[0.02] border-white/5 hover:border-white/20 transition-all'}`}>
                                    <div>
                                        <h5 className={`text-sm font-black uppercase tracking-wider ${inst.status === 'overdue' ? 'text-red-500' : 'text-white'}`}>
                                            R$ {Number(inst.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </h5>
                                        <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">
                                            {inst.projects?.name} • {inst.description}
                                        </p>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${inst.status === 'overdue' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-white/5 text-zinc-400 border-white/10'}`}>
                                        {inst.status === 'overdue' ? 'Atrasado' : 'Aguardando'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* COLUNA 2: HISTÓRICO DE ENTRADAS (PAGOS) */}
                <div className="bg-[#050505] border border-white/5 rounded-[40px] p-8 md:p-10">
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-8">Histórico de Recebimentos</h3>

                    <div className="space-y-4">
                        {recentPayments.length === 0 ? (
                            <div className="py-12 text-center border border-dashed border-white/5 rounded-[32px]">
                                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Nenhuma entrada registrada ainda.</p>
                            </div>
                        ) : (
                            recentPayments.map((inst) => (
                                <div key={inst.id} className="p-5 rounded-[24px] bg-white/[0.01] border border-white/5 flex items-center justify-between group hover:bg-white/[0.03] transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-synx/10 text-synx flex items-center justify-center border border-synx/20">
                                            <ArrowUpRight size={16} />
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-black text-white uppercase tracking-wider">
                                                R$ {Number(inst.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </h5>
                                            <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">
                                                {inst.projects?.name} • {inst.description}
                                            </p>
                                        </div>
                                    </div>
                                    <CheckCircle2 size={18} className="text-synx opacity-50 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}