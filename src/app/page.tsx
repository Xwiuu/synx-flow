"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Activity, Landmark, Wallet, TrendingUp, AlertTriangle,
  Terminal, CheckSquare, Clock, Zap, ArrowUpRight, FolderGit2
} from "lucide-react";

export default function CEODashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalCaixa: 0,
    mrr: 0,
    activeProjects: 0,
    pendingTasks: 0,
  });
  const [overdueInstallments, setOverdueInstallments] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [activeProjectsList, setActiveProjectsList] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();

    // Olho de Sauron: Atualiza o painel do CEO em tempo real se qualquer coisa mudar no banco
    const channel = supabase
      .channel('ceo-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_installments' }, () => fetchDashboardData())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, () => fetchDashboardData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    // 1. Puxa Projetos Ativos (Tudo que não for 'Entregue' ou 'Travado')
    const { data: projects } = await supabase.from("projects").select("*").not("phase", "eq", "Entregue");
    const mrrTotal = projects?.reduce((acc, curr) => acc + Number(curr.maintenance_value || 0), 0) || 0;

    // 2. Puxa Faturas
    const { data: installments } = await supabase.from("finance_installments").select("*, projects(name)");
    const caixaTotal = installments?.filter(i => i.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
    const atrasadas = installments?.filter(i => i.status === 'overdue') || [];

    // 3. Puxa Tarefas Pendentes
    const { data: tasks } = await supabase.from("tasks").select("id").eq("status", "pending");

    // 4. Puxa o Log do Fofoqueiro (Últimas 8 atividades)
    const { data: logs } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(8);

    setMetrics({
      totalCaixa: caixaTotal,
      mrr: mrrTotal,
      activeProjects: projects?.length || 0,
      pendingTasks: tasks?.length || 0,
    });
    setActiveProjectsList(projects?.slice(0, 5) || []);
    setOverdueInstallments(atrasadas);
    setRecentLogs(logs || []);

    setLoading(false);
  };

  if (loading) return (
    <div className="h-full w-full flex items-center justify-center">
      <Zap size={32} className="text-synx animate-pulse" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">

      {/* 🔹 HEADER DO CEO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-synx opacity-80">
            <Terminal size={14} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em]">Central_Command_Unit</span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
            Bunker do <span className="text-synx text-transparent bg-clip-text bg-gradient-to-r from-synx to-teal-400">CEO.</span>
          </h1>
        </div>
      </header>

      {/* 🔹 MÉTRICAS DE ALTA DENSIDADE (OS 4 PILARES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Caixa Forte */}
        <div className="bg-gradient-to-br from-synx/10 to-transparent border border-synx/20 p-8 rounded-[32px] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-synx/10 rounded-full blur-2xl group-hover:bg-synx/20 transition-all" />
          <div className="w-12 h-12 rounded-2xl bg-synx/20 text-synx flex items-center justify-center border border-synx/30 mb-6"><Landmark size={20} /></div>
          <p className="text-[10px] font-black text-synx uppercase tracking-widest mb-1">Caixa Acumulado</p>
          <h4 className="text-4xl font-black italic text-white tracking-tighter truncate">
            R$ {metrics.totalCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h4>
        </div>

        {/* MRR Mensal */}
        <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] hover:border-white/10 transition-all relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-white/5 text-zinc-400 flex items-center justify-center border border-white/10 mb-6"><TrendingUp size={20} /></div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">MRR (Recorrência)</p>
          <h4 className="text-4xl font-black italic text-white tracking-tighter truncate">
            R$ {metrics.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h4>
        </div>

        {/* Projetos Ativos */}
        <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] hover:border-white/10 transition-all relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-white/5 text-zinc-400 flex items-center justify-center border border-white/10 mb-6"><FolderGit2 size={20} /></div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Operações Ativas</p>
          <h4 className="text-4xl font-black italic text-white tracking-tighter truncate">{metrics.activeProjects} Naves</h4>
        </div>

        {/* Tarefas Pendentes */}
        <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] hover:border-white/10 transition-all relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-white/5 text-zinc-400 flex items-center justify-center border border-white/10 mb-6"><CheckSquare size={20} /></div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Protocolos Pendentes</p>
          <h4 className="text-4xl font-black italic text-white tracking-tighter truncate">{metrics.pendingTasks} Ações</h4>
        </div>
      </div>

      {/* 🔹 GRID SECUNDÁRIO (RADAR, PROJETOS E LOGS) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* COLUNA ESQUERDA: Radar de Inadimplência & Projetos Rápidos */}
        <div className="xl:col-span-2 space-y-8">

          {/* RADAR DE INADIMPLÊNCIA */}
          <div className="bg-[#050505] border border-red-500/10 p-8 rounded-[40px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] flex items-center gap-2"><AlertTriangle size={14} /> Radar de Inadimplência</h3>
              <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[9px] font-black">{overdueInstallments.length} Atrasos</span>
            </div>
            <div className="space-y-3">
              {overdueInstallments.length === 0 ? (
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest p-6 border border-dashed border-white/5 rounded-2xl text-center">Nenhum atraso. Cliente feliz, bolso cheio.</p>
              ) : (
                overdueInstallments.map((inst) => (
                  <div key={inst.id} className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{inst.projects?.name}</span>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase mt-1">{inst.description}</span>
                    </div>
                    <span className="text-sm font-black text-red-500">R$ {Number(inst.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* VISÃO RÁPIDA: PROJETOS ATIVOS */}
          <div className="bg-[#050505] border border-white/5 p-8 rounded-[40px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-2"><Activity size={14} /> Operações em Andamento</h3>
              <a href="/projects" className="text-[9px] font-black text-synx hover:underline uppercase tracking-widest">Ver Kanban</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProjectsList.length === 0 ? (
                <p className="col-span-2 text-[10px] font-mono text-zinc-600 p-6 text-center">Nenhuma operação rodando.</p>
              ) : (
                activeProjectsList.map((proj) => (
                  <a key={proj.id} href="/projects" className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-synx/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-synx transition-colors">{proj.name}</h4>
                        <p className="text-[9px] font-mono text-zinc-500 uppercase mt-1">{proj.client}</p>
                      </div>
                      <span className="bg-white/5 text-zinc-400 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest">{proj.phase}</span>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: Audit Log (Fofoqueiro) */}
        <div className="bg-[#050505] border border-white/5 p-8 rounded-[40px] flex flex-col h-full">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-2"><Clock size={14} /> Audit Log (Live)</h3>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
            {recentLogs.length === 0 ? (
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest text-center mt-10">O sistema está silencioso.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-[-24px] last:before:bottom-0 before:w-[2px] before:bg-white/5">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#0a0a0a] border-2 border-white/10 flex items-center justify-center z-10">
                    <div className="w-2 h-2 rounded-full bg-synx animate-pulse" />
                  </div>
                  <div className="bg-white/[0.01] p-4 rounded-2xl border border-white/5 group hover:bg-white/[0.03] transition-all">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-white">{log.operator_name}</span>
                      <span className="text-[9px] font-mono text-zinc-500">{new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] font-medium text-zinc-400">{log.message}</p>
                    <p className="text-[9px] font-black text-synx uppercase tracking-widest mt-2 bg-synx/10 w-max px-2 py-0.5 rounded">{log.project_name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}