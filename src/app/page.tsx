"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Terminal, Folder, AlertTriangle, ListTodo, CheckCircle2,
  Zap, Activity, Circle, TrendingUp, BarChart3, ArrowUpRight,
  MessageSquare, ArrowRightLeft, ShieldAlert, Calendar
} from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Operador");
  const [greeting, setGreeting] = useState("Bem-vindo");

  const [metrics, setMetrics] = useState({ active: 0, blocked: 0, pendingTasks: 0, completedTasks: 0 });
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  const [phaseStats, setPhaseStats] = useState({
    briefing: 0, design: 0, dev: 0, qa: 0, aguardando: 0, travado: 0, entregue: 0, total: 0
  });

  // 🔹 FUNÇÃO MESTRE DE BUSCA DE DADOS
  const fetchDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.user_metadata?.full_name) {
        setUserName(session.user.user_metadata.full_name.split(" ")[0]);
      }

      const { data: projects } = await supabase.from("projects").select("*").order("id", { ascending: false });
      const { data: tasks } = await supabase.from("tasks").select("*, projects(name)").order("created_at", { ascending: false });
      const { data: logs } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(6);

      const validProjects = projects || [];
      const validTasks = tasks || [];
      const validLogs = logs || [];

      // Cálculos de Métricas
      const active = validProjects.filter(p => p.phase !== 'Entregue').length;
      const blocked = validProjects.filter(p => p.status === 'Travado').length;
      const pendingT = validTasks.filter(t => t.status !== 'completed').length;
      const completedT = validTasks.filter(t => t.status === 'completed').length;

      setMetrics({ active, blocked, pendingTasks: pendingT, completedTasks: completedT });

      // Estatísticas da Esteira
      setPhaseStats({
        briefing: validProjects.filter(p => p.phase === 'Briefing' || !p.phase).length,
        design: validProjects.filter(p => p.phase === 'Design').length,
        dev: validProjects.filter(p => p.phase === 'Desenvolvimento').length,
        qa: validProjects.filter(p => p.phase === 'QA / Performance').length,
        aguardando: validProjects.filter(p => p.phase === 'Aguard. Cliente').length,
        travado: validProjects.filter(p => p.phase === 'Travado').length,
        entregue: validProjects.filter(p => p.phase === 'Entregue').length,
        total: validProjects.length > 0 ? validProjects.length : 1
      });

      // Projetos em Destaque (Com progresso real calculado na hora)
      const topProjects = validProjects.filter(p => p.phase !== 'Entregue').slice(0, 4).map(project => {
        const projectTasks = validTasks.filter(t => t.project_id === project.id);
        const doneTasks = projectTasks.filter(t => t.status === 'completed').length;
        const realProgress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0;
        return { ...project, realProgress };
      });

      setActiveProjects(topProjects);
      setActivityLogs(validLogs);
    } catch (error) {
      console.error("Erro na Matrix:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bom dia");
    else if (hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");

    fetchDashboardData();

    // 📡 INJEÇÃO REALTIME: O DASHBOARD AGORA É VIVO
    const dashboardChannel = supabase
      .channel('realtime-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchDashboardData())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, () => fetchDashboardData())
      .subscribe();

    return () => { supabase.removeChannel(dashboardChannel); };
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Agora";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center h-[80vh] space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-16 h-16 border-t-2 border-synx rounded-full animate-spin" />
        <Zap size={24} className="text-synx animate-pulse" />
      </div>
      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.5em] mt-4">Sincronizando_Fluxo_Realtime</p>
    </div>
  );

  return (
    <div className="max-w-[1500px] mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-700 pb-12">

      {/* 🟢 HEADER DE ELITE */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/10 pb-10 relative">
        <div className="absolute top-0 right-20 w-96 h-32 bg-synx/10 blur-[120px] pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-synx">
            <Terminal size={14} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em]">Intelligence_Center_v4</span>
          </div>
          <h1 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-[0.8]">
            Visão <br /> <span className="text-synx text-transparent bg-clip-text bg-gradient-to-r from-synx to-teal-400">Estratégica.</span>
          </h1>
          <p className="text-sm font-mono text-zinc-500 mt-4 uppercase tracking-widest">{greeting}, Mestre <span className="text-white font-bold">{userName}</span>.</p>
        </div>
        <div className="bg-white/[0.02] border border-white/10 px-6 py-4 rounded-3xl backdrop-blur-xl flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-synx animate-pulse" />
          <div className="text-right">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Status da Rede</p>
            <p className="text-xs font-bold text-white uppercase tracking-tighter">Live_Sync_Ativo</p>
          </div>
        </div>
      </header>

      {/* 🟢 KPI GRID COM SPARKLINES */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {[
          { label: "Operações Ativas", val: metrics.active, icon: Folder, color: "text-synx", path: "M0,100 Q25,80 50,90 T100,20" },
          { label: "Alertas / Travados", val: metrics.blocked, icon: AlertTriangle, color: "text-red-500", path: "M0,100 Q25,50 50,80 T100,40" },
          { label: "Protocolos em Fila", val: metrics.pendingTasks, icon: ListTodo, color: "text-blue-500", path: "M0,100 Q25,95 50,60 T100,70" },
          { label: "Ciclos Done", val: metrics.completedTasks, icon: CheckCircle2, color: "text-yellow-500", path: "M0,100 Q25,20 50,40 T100,10" },
        ].map((kpi, i) => (
          <div key={i} className="bg-[#050505] border border-white/10 p-8 rounded-[32px] relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="flex justify-between items-start mb-8 relative z-10">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{kpi.label}</span>
              <div className={`p-2 rounded-xl bg-white/5 ${kpi.color}`}><kpi.icon size={18} /></div>
            </div>
            <h3 className="text-6xl font-black text-white tracking-tighter italic relative z-10">{kpi.val}</h3>
            <svg className={`absolute bottom-0 left-0 w-full h-16 opacity-10 group-hover:opacity-30 transition-opacity ${kpi.color}`} preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d={`${kpi.path} L100,100 L0,100 Z`} fill="currentColor" />
            </svg>
          </div>
        ))}
      </section>

      {/* 🟢 ANALYTICS INFERIOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">

          {/* GRÁFICO DA ESTEIRA COMPLETO */}
          <div className="bg-[#030303] border border-white/10 p-10 rounded-[40px] relative overflow-hidden">
            <div className="flex items-center gap-3 mb-10">
              <BarChart3 size={20} className="text-synx" />
              <h2 className="text-xl font-black text-white uppercase tracking-wider italic">Fluxo de Produção Global</h2>
            </div>
            <div className="space-y-8">
              <div className="flex h-4 rounded-full overflow-hidden bg-white/5 border border-white/10 p-[2px]">
                <div style={{ width: `${(phaseStats.briefing / phaseStats.total) * 100}%` }} className="bg-yellow-500 rounded-full mr-0.5 transition-all duration-1000" />
                <div style={{ width: `${(phaseStats.design / phaseStats.total) * 100}%` }} className="bg-pink-500 rounded-full mr-0.5 transition-all duration-1000" />
                <div style={{ width: `${(phaseStats.dev / phaseStats.total) * 100}%` }} className="bg-blue-500 rounded-full mr-0.5 transition-all duration-1000" />
                <div style={{ width: `${(phaseStats.qa / phaseStats.total) * 100}%` }} className="bg-purple-500 rounded-full mr-0.5 transition-all duration-1000" />
                <div style={{ width: `${(phaseStats.aguardando / phaseStats.total) * 100}%` }} className="bg-orange-500 rounded-full mr-0.5 transition-all duration-1000" />
                <div style={{ width: `${(phaseStats.travado / phaseStats.total) * 100}%` }} className="bg-red-500 rounded-full mr-0.5 transition-all duration-1000" />
                <div style={{ width: `${(phaseStats.entregue / phaseStats.total) * 100}%` }} className="bg-synx rounded-full transition-all duration-1000" />
              </div>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-4 pt-4 border-t border-white/5">
                {[
                  { label: "Brief", val: phaseStats.briefing, c: "bg-yellow-500" },
                  { label: "Design", val: phaseStats.design, c: "bg-pink-500" },
                  { label: "Dev", val: phaseStats.dev, c: "bg-blue-500" },
                  { label: "QA", val: phaseStats.qa, c: "bg-purple-500" },
                  { label: "Wait", val: phaseStats.aguardando, c: "bg-orange-500" },
                  { label: "Lock", val: phaseStats.travado, c: "bg-red-500" },
                  { label: "Done", val: phaseStats.entregue, c: "bg-synx" },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${s.c}`} /><span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{s.label}</span></div>
                    <span className="text-sm font-bold text-white ml-3">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* OPERAÇÕES EM DESTAQUE */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-l-4 border-syny pl-6 py-2">
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Radar de Operações Alpha</h2>
              <button className="text-[10px] font-black text-synx hover:tracking-widest transition-all">QUADRO COMPLETO <ArrowUpRight size={14} className="inline ml-1" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeProjects.map((p) => (
                <div key={p.id} className="bg-gradient-to-br from-[#080808] to-[#030303] border border-white/10 p-8 rounded-[40px] hover:border-synx/30 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 text-synx/5 group-hover:text-synx/10 transition-colors"><Zap size={60} /></div>
                  <div className="relative z-10 flex flex-col justify-between h-full gap-10">
                    <div className="flex justify-between items-start">
                      <div><h4 className="text-xl font-black text-white uppercase italic tracking-tighter group-hover:text-synx transition-colors">{p.name}</h4><p className="text-[10px] font-mono text-zinc-600 uppercase mt-1">Ref_Client: {p.client}</p></div>
                      <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[9px] font-black text-zinc-400 uppercase tracking-widest">{p.phase || "Briefing"}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[9px] font-black uppercase text-zinc-600 tracking-widest"><span>Performance_Index</span><span className="text-white">{p.realProgress}%</span></div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                        <div className="h-full bg-gradient-to-r from-synx to-emerald-400 shadow-[0_0_15px_#10b981] rounded-full transition-all duration-1000" style={{ width: `${p.realProgress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TIMELINE DO FOFOQUEIRO (AUDIT LOGS) */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-l-4 border-white/10 pl-6 py-2">
            <Activity size={24} className="text-synx animate-pulse" />
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Live_Audit_Log</h2>
          </div>
          <div className="bg-[#050505] border border-white/5 rounded-[48px] p-8 space-y-10 relative shadow-2xl">
            <div className="absolute top-4 right-8"><span className="text-[8px] font-black bg-synx/10 text-synx px-2 py-1 rounded-full animate-pulse border border-synx/20">REALTIME</span></div>
            {activityLogs.map((log) => (
              <div key={log.id} className="flex gap-5 items-start group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${log.action_type === 'PHASE' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : log.action_type === 'STATUS' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-synx/10 border-synx/20 text-synx'}`}>
                  {log.action_type === 'PHASE' ? <ArrowRightLeft size={16} /> : log.action_type === 'STATUS' ? <ShieldAlert size={16} /> : <ListTodo size={16} />}
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-zinc-400 leading-snug group-hover:text-zinc-200 transition-colors">
                    <span className="text-white font-black">{log.operator_name}</span> {log.message}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-synx uppercase">_{log.project_name}</span>
                    <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-tighter">• {formatTimeAgo(log.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}