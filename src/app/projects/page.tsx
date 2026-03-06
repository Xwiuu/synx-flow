"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    Search, Plus, Clock, MoreVertical, Zap, Terminal, X, CheckCircle2, Circle,
    Trash2, AlertTriangle, ShieldCheck, UserCog, Activity, ChevronDown,
    AlignLeft, CheckSquare, Paperclip, UploadCloud, FileText, Image as ImageIcon,
    User, ArrowUpRight, Link, Wallet, Banknote, FileCheck, Landmark, Receipt,
    DollarSign, PlusCircle, Trash, Github
} from "lucide-react";

export default function ProjectsBoard() {
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // 🔹 ESTADOS DO NOVO ESCOPO (CRM)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [newProject, setNewProject] = useState({ name: "", client_id: "" });

    // 🔹 ESTADOS DO PAINEL LATERAL PREMIUM
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"tarefas" | "briefing" | "arquivos" | "financeiro" | "repositorio">("tarefas");
    const [tasks, setTasks] = useState<any[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [projectDescription, setProjectDescription] = useState("");
    const [isSavingDesc, setIsSavingDesc] = useState(false);

    // 🔹 ESTADOS DO MÓDULO FINANCEIRO
    const [financeData, setFinanceData] = useState({ total_value: 0, maintenance_value: 0, payment_model: '50/50' });
    const [installments, setInstallments] = useState<any[]>([]);
    const [financeDocs, setFinanceDocs] = useState<any[]>([]);
    const [isSavingFinance, setIsSavingFinance] = useState(false);
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);
    const [newCustomInstallment, setNewCustomInstallment] = useState({ description: "", amount: "" });
    const [isAddingCustomInstallment, setIsAddingCustomInstallment] = useState(false);

    const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);
    const [draggedOverPhase, setDraggedOverPhase] = useState<string | null>(null);

    const phases = ["Briefing", "Design", "Desenvolvimento", "QA / Performance", "Aguard. Cliente", "Travado", "Entregue"];

    // 🔹 INICIALIZAÇÃO E REALTIME
    useEffect(() => {
        fetchProjects();
        fetchUsersAsClients();

        const channel = supabase
            .channel('projects-live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchProjects())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_installments' }, () => { if (selectedProject) fetchFinanceData(selectedProject.id); })
            .subscribe();

        const handleClickOutside = () => setOpenStatusMenuId(null);
        document.addEventListener("click", handleClickOutside);

        return () => {
            supabase.removeChannel(channel);
            document.removeEventListener("click", handleClickOutside);
        };
    }, [selectedProject]);

    const fetchProjects = async () => {
        setIsLoading(true);
        const { data } = await supabase.from("projects").select("*").order("id", { ascending: false });
        if (data) setProjects(data);
        setIsLoading(false);
    };

    const fetchUsersAsClients = async () => {
        try {
            const { data, error } = await supabase.from("profiles").select("*").order("full_name", { ascending: true });
            if (error) throw error;
            if (data) {
                const onlyClients = data.filter(u => u.role && String(u.role).toLowerCase().includes('cliente'));
                setClients(onlyClients.length > 0 ? onlyClients : data);
            }
        } catch (err) { console.log("Aviso ao buscar clientes:", err); }
    };

    const fetchFinanceData = async (projectId: any) => {
        const { data: instData } = await supabase.from("finance_installments").select("*").eq("project_id", projectId).order("created_at", { ascending: true });
        const { data: fDocsData } = await supabase.from("finance_docs").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
        if (instData) setInstallments(instData);
        if (fDocsData) setFinanceDocs(fDocsData);
    };

    const logActivity = async (action: string, msg: string, projName: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        const op = session?.user?.user_metadata?.full_name?.split(" ")[0] || "Operador";
        await supabase.from("activity_logs").insert([{ operator_name: op, action_type: action, message: msg, project_name: projName }]);
    };

    const handleCopyTrackingLink = () => {
        if (!selectedProject || !selectedProject.tracking_code) return alert("Erro: Código de rastreio não encontrado.");
        const trackingUrl = `${window.location.origin}/tracking/${selectedProject.tracking_code}`;
        navigator.clipboard.writeText(trackingUrl);
        alert("LINK COPIADO! Envia agora para o teu cliente.");
    };

    // 🔹 AÇÕES DO PROJETO
    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;
            if (!userId) return alert("Sessão expirada!");
            if (!newProject.client_id) return alert("Selecione um cliente cadastrado.");

            const selectedClient = clients.find(c => String(c.id) === String(newProject.client_id));
            const clientName = selectedClient ? (selectedClient.full_name || selectedClient.name || "Desconhecido") : "Desconhecido";

            const { error } = await supabase.from("projects").insert([{ name: newProject.name, client_id: newProject.client_id, client: clientName, phase: "Briefing", user_id: userId }]).select();
            if (error) throw error;

            logActivity("CREATE", `instanciou a operação: ${newProject.name}`, "Sistema");
            setIsModalOpen(false);
            setNewProject({ name: "", client_id: "" });
            fetchProjects();
        } catch (err: any) { alert("Falha ao criar projeto: " + err.message); }
    };

    const handleChangeStatus = async (projectId: any, newStatus: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const projectToUpdate = projects.find(p => String(p.id) === String(projectId));
        setProjects((prev) => prev.map(p => String(p.id) === String(projectId) ? { ...p, status: newStatus } : p));
        setOpenStatusMenuId(null);
        await supabase.from("projects").update({ status: newStatus }).eq("id", projectId);
        logActivity("STATUS", `marcou status como "${newStatus}"`, projectToUpdate?.name || "");
    };

    const handleDeleteProject = async () => {
        if (!selectedProject) return;
        if (confirm(`ALERTA: Deseja apagar permanentemente a operação "${selectedProject.name}"? Esta ação não pode ser desfeita.`)) {
            try {
                await supabase.from("projects").delete().eq("id", selectedProject.id);
                setProjects((prev) => prev.filter(p => String(p.id) !== String(selectedProject.id)));
                logActivity("DELETE", `excluiu a operação`, selectedProject.name);
                setSelectedProject(null);
            } catch (err: any) { alert("Falha ao excluir operação: " + err.message); }
        }
    };

    const handleOpenProject = async (project: any) => {
        setSelectedProject(project);
        setProjectDescription(project.description || "");
        setFinanceData({ total_value: project.total_value || 0, maintenance_value: project.maintenance_value || 0, payment_model: project.payment_model || '50/50' });
        setActiveTab("tarefas");
        setIsLoadingTasks(true);

        const { data: tData } = await supabase.from("tasks").select("*").eq("project_id", project.id).order("created_at", { ascending: false });
        const { data: fData } = await supabase.from("attachments").select("*").eq("project_id", project.id).order("created_at", { ascending: false });

        if (tData) setTasks(tData);
        if (fData) setAttachments(fData);
        await fetchFinanceData(project.id);
        setIsLoadingTasks(false);
    };

    // 🔹 TAREFAS E ARQUIVOS
    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !selectedProject) return;
        const { data } = await supabase.from("tasks").insert([{ project_id: selectedProject.id, title: newTaskTitle, status: 'pending' }]).select();
        if (data) { setTasks([data[0], ...tasks]); logActivity("TASK", `injetou o protocolo "${newTaskTitle}"`, selectedProject.name); setNewTaskTitle(""); }
    };

    const toggleTaskStatus = async (task: any) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        setTasks((prev) => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
        await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
        logActivity("TASK", `${newStatus === 'completed' ? 'finalizou' : 'reabriu'} o protocolo "${task.title}"`, selectedProject.name);
    };

    const saveDescription = async () => {
        if (!selectedProject) return;
        setIsSavingDesc(true);
        try {
            await supabase.from("projects").update({ description: projectDescription }).eq("id", selectedProject.id);
            setProjects((prev) => prev.map(p => p.id === selectedProject.id ? { ...p, description: projectDescription } : p));
            logActivity("UPDATE", `atualizou protocolos de Data_Brief`, selectedProject.name);
        } catch (error: any) { alert("FALHA: " + error.message); } finally { setIsSavingDesc(false); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedProject) return;
        try {
            setIsLoadingTasks(true);
            const filePath = `${selectedProject.id}/${Math.random()}.${file.name.split('.').pop()}`;
            await supabase.storage.from('project-assets').upload(filePath, file);
            const { data: { publicUrl } } = supabase.storage.from('project-assets').getPublicUrl(filePath);
            const { data: newAttach } = await supabase.from("attachments").insert([{ project_id: selectedProject.id, file_name: file.name, file_url: publicUrl, file_type: file.type }]).select();
            if (newAttach) setAttachments([newAttach[0], ...attachments]);
            logActivity("FILE", `injetou o asset "${file.name}" no Vault`, selectedProject.name);
        } finally { setIsLoadingTasks(false); }
    };

    // 🔹 FINANCEIRO
    const saveFinanceSettings = async () => {
        if (!selectedProject) return;
        setIsSavingFinance(true);
        try {
            await supabase.from("projects").update({ total_value: financeData.total_value, maintenance_value: financeData.maintenance_value, payment_model: financeData.payment_model }).eq("id", selectedProject.id);
            setProjects((prev) => prev.map(p => p.id === selectedProject.id ? { ...p, ...financeData } : p));
            logActivity("FINANCE", `atualizou os parâmetros financeiros`, selectedProject.name);
            alert("Parâmetros financeiros gravados no cofre!");
        } catch (error: any) { alert("FALHA AO SALVAR PARÂMETROS: " + error.message); } finally { setIsSavingFinance(false); }
    };

    const generateInstallments = async () => {
        if (!selectedProject || financeData.total_value <= 0) return alert("Defina um valor total maior que zero primeiro.");
        if (financeData.payment_model === '50/50') {
            try {
                const half = financeData.total_value / 2;
                const newInstallments = [
                    { project_id: selectedProject.id, description: "Sinal (50%)", amount: half, status: 'pending' },
                    { project_id: selectedProject.id, description: "Entrega (50%)", amount: half, status: 'pending' }
                ];
                await supabase.from("finance_installments").insert(newInstallments);
                logActivity("FINANCE", `gerou a esteira de cobrança 50/50`, selectedProject.name);
                fetchFinanceData(selectedProject.id);
                alert("Faturas geradas com sucesso!");
            } catch (error: any) { alert("FALHA AO GERAR FATURAS: " + error.message); }
        }
    };

    const handleAddCustomInstallment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCustomInstallment.description || !newCustomInstallment.amount) return;
        try {
            await supabase.from("finance_installments").insert([{
                project_id: selectedProject.id,
                description: newCustomInstallment.description,
                amount: Number(newCustomInstallment.amount),
                status: 'pending'
            }]);
            logActivity("FINANCE", `injetou uma parcela customizada (${newCustomInstallment.description})`, selectedProject.name);
            fetchFinanceData(selectedProject.id);
            setNewCustomInstallment({ description: "", amount: "" });
            setIsAddingCustomInstallment(false);
        } catch (error: any) { alert("FALHA AO CRIAR PARCELA: " + error.message); }
    };

    const markInstallmentPaid = async (instId: any, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
            await supabase.from("finance_installments").update({ status: newStatus, paid_at: newStatus === 'paid' ? new Date().toISOString() : null }).eq("id", instId);
            logActivity("FINANCE", `marcou a parcela como ${newStatus === 'paid' ? 'PAGA' : 'PENDENTE'}`, selectedProject.name);
            fetchFinanceData(selectedProject.id);
        } catch (error: any) { alert("FALHA AO MARCAR PAGAMENTO: " + error.message); }
    };

    const handleDeleteInstallment = async (instId: any) => {
        if (confirm("Apagar esta fatura do sistema?")) {
            await supabase.from("finance_installments").delete().eq("id", instId);
            fetchFinanceData(selectedProject.id);
            logActivity("FINANCE", `excluiu uma fatura do sistema`, selectedProject.name);
        }
    };

    const handleFinanceDocUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
        const file = e.target.files?.[0];
        if (!file || !selectedProject) return;
        try {
            setIsUploadingDoc(true);
            const filePath = `finance/${selectedProject.id}/${Math.random()}.${file.name.split('.').pop()}`;
            await supabase.storage.from('project-assets').upload(filePath, file);
            const { data: { publicUrl } } = supabase.storage.from('project-assets').getPublicUrl(filePath);
            await supabase.from("finance_docs").insert([{ project_id: selectedProject.id, doc_type: docType, file_name: file.name, file_url: publicUrl }]);
            logActivity("FINANCE_DOC", `injetou um documento financeiro (${docType})`, selectedProject.name);
            fetchFinanceData(selectedProject.id);
        } catch (err: any) { alert("ERRO AO UPAR DOCUMENTO: " + err.message); } finally { setIsUploadingDoc(false); }
    };

    const handleDeleteFinanceDoc = async (docId: any) => {
        if (confirm("Apagar este documento permanentemente?")) {
            await supabase.from("finance_docs").delete().eq("id", docId);
            fetchFinanceData(selectedProject.id);
        }
    };

    // 🔹 DRAG & DROP COM GATILHO DE WEBHOOK (NOTIFICAÇÃO)
    const handleDragStart = (e: React.DragEvent, projectId: any) => { e.dataTransfer.setData("projectId", String(projectId)); };

    const handleDrop = async (e: React.DragEvent, newPhase: string) => {
        e.preventDefault();
        setDraggedOverPhase(null);

        const projectId = e.dataTransfer.getData("projectId");
        const projectToMove = projects.find(p => String(p.id) === projectId);

        if (projectToMove && projectToMove.phase !== newPhase) {
            const oldPhase = projectToMove.phase || "Briefing";

            // 1. ATUALIZA A TELA E O BANCO DE DADOS
            await supabase.from("projects").update({ phase: newPhase }).eq("id", projectId);
            logActivity("PHASE", `moveu para "${newPhase}"`, projectToMove.name);
            fetchProjects();

            // 2. BUSCA O EMAIL DO CLIENTE NA TABELA DE PERFIS
            let clientEmail = "sem-email@sistema.com";
            if (projectToMove.client_id) {
                const { data: clientData } = await supabase
                    .from("profiles")
                    .select("email")
                    .eq("id", projectToMove.client_id)
                    .single();
                if (clientData?.email) clientEmail = clientData.email;
            }

            // 3. DISPARA O MOTOR DE NOTIFICAÇÃO (WEBHOOK)
            try {
                const trackingUrl = `${window.location.origin}/tracking/${projectToMove.tracking_code}`;
                await fetch("/api/notify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        projectName: projectToMove.name,
                        clientName: projectToMove.client,
                        clientEmail: clientEmail,
                        oldPhase: oldPhase,
                        newPhase: newPhase,
                        trackingUrl: trackingUrl
                    })
                });
                console.log(`Gatilho de notificação disparado para a fase: ${newPhase}`);
            } catch (err) {
                console.error("Falha ao comunicar com o motor de notificações:", err);
            }
        }
    };

    const getPhaseColor = (phase: string) => {
        switch (phase) {
            case "Briefing": return "bg-yellow-500"; case "Design": return "bg-pink-500"; case "Desenvolvimento": return "bg-blue-500";
            case "QA / Performance": return "bg-purple-500"; case "Aguard. Cliente": return "bg-orange-500";
            case "Travado": return "bg-red-500"; case "Entregue": return "bg-synx"; default: return "bg-zinc-500";
        }
    };

    const renderStatusTag = (status: string) => {
        if (status === 'Travado') return <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max transition-colors"><AlertTriangle size={12} /> Operação Travada <ChevronDown size={10} className="ml-1 opacity-50" /></span>;
        if (status === 'QA') return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max transition-colors"><ShieldCheck size={12} /> Em Análise (QA) <ChevronDown size={10} className="ml-1 opacity-50" /></span>;
        if (status === 'Aguardando Cliente') return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max transition-colors"><UserCog size={12} /> Aguardando Cliente <ChevronDown size={10} className="ml-1 opacity-50" /></span>;
        if (status === 'Normal') return <span className="bg-synx/10 text-synx border border-synx/20 px-2 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max transition-colors"><Activity size={12} /> Operando Normal <ChevronDown size={10} className="ml-1 opacity-50" /></span>;
        return <span className="bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 px-2 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max transition-colors hover:bg-zinc-700/50"><Zap size={12} /> Status Pendente <ChevronDown size={10} className="ml-1 opacity-50" /></span>;
    };

    // 🔹 CÁLCULOS KPI
    const taskProgress = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0;
    const totalAmount = financeData.total_value > 0 ? financeData.total_value : installments.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const paidAmount = installments.filter(i => i.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const pendingAmount = installments.filter(i => i.status !== 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const financeProgress = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

    return (
        <div className="h-screen w-full flex flex-col bg-[#020202] text-white overflow-hidden p-6 lg:p-10">

            {/* 🔹 HEADER KANBAN */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 shrink-0">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-synx opacity-80"><Terminal size={14} /><span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em]">Operational_Board</span></div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Projetos <span className="text-synx text-transparent bg-clip-text bg-gradient-to-r from-synx to-teal-400">Vivos.</span></h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input type="text" placeholder="Filtrar rede..." className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold w-64 focus:border-synx/50 outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="bg-synx text-black px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <Plus size={18} /> Novo Escopo
                    </button>
                </div>
            </header>

            {/* 🔹 KANBAN COLUNAS */}
            <main className="flex-1 overflow-x-auto pb-6 custom-scrollbar">
                <div className="flex gap-8 h-full min-w-max px-2">
                    {phases.map((phase) => {
                        const phaseProjects = projects.filter(p => (p.phase === phase || (!p.phase && phase === "Briefing")) && (p.name?.toLowerCase().includes(searchTerm.toLowerCase())));
                        return (
                            <div key={phase} onDragOver={(e) => { e.preventDefault(); setDraggedOverPhase(phase); }} onDragLeave={() => setDraggedOverPhase(null)} onDrop={(e) => handleDrop(e, phase)}
                                className={`w-80 flex flex-col rounded-[32px] p-4 transition-all duration-300 ${draggedOverPhase === phase ? 'bg-synx/5 border border-synx/20 shadow-[0_0_40px_rgba(16,185,129,0.05)]' : 'bg-white/[0.02] border border-white/5'}`}>
                                <div className="flex items-center justify-between mb-6 px-2">
                                    <div className="flex items-center gap-3"><div className={`w-1.5 h-6 rounded-full ${getPhaseColor(phase)}`} /><h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">{phase}</h3></div>
                                    <span className="text-[10px] font-mono text-zinc-600 bg-white/5 px-2 py-0.5 rounded-lg">{phaseProjects.length}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                    {phaseProjects.map((project) => (
                                        <div key={project.id} draggable onDragStart={(e) => handleDragStart(e, project.id)} onClick={() => handleOpenProject(project)}
                                            className={`bg-white/[0.03] border p-6 rounded-[24px] hover:bg-white/[0.05] transition-all group cursor-grab active:cursor-grabbing relative ${project.status === 'Travado' ? 'border-red-500/30' : 'border-white/10 hover:border-synx/40'}`}>
                                            <div className="relative z-20 mb-3">
                                                <button onClick={(e) => { e.stopPropagation(); setOpenStatusMenuId(openStatusMenuId === project.id ? null : project.id); }} className="text-left hover:brightness-125 transition-all">{renderStatusTag(project.status)}</button>
                                                {openStatusMenuId === project.id && (
                                                    <div className="absolute left-0 top-8 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,1)] z-[100] overflow-hidden animate-in fade-in zoom-in-95">
                                                        <button onClick={(e) => handleChangeStatus(project.id, "Normal", e)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-synx hover:bg-white/5"><Activity size={12} /> Operando Normal</button>
                                                        <button onClick={(e) => handleChangeStatus(project.id, "QA", e)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-purple-400 hover:bg-white/5"><ShieldCheck size={12} /> Enviar para QA</button>
                                                        <button onClick={(e) => handleChangeStatus(project.id, "Aguardando Cliente", e)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-blue-400 hover:bg-white/5"><UserCog size={12} /> Aguardando Cliente</button>
                                                        <button onClick={(e) => handleChangeStatus(project.id, "Travado", e)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-white/5 border-t border-white/5"><AlertTriangle size={12} /> Marcar como Travado</button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div>
                                                    <h4 className="text-sm font-bold tracking-tight mb-1 group-hover:text-synx transition-colors">{project.name}</h4>
                                                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{project.client}</p>
                                                </div>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-2"><div className="h-full bg-synx transition-all duration-1000" style={{ width: `${project.progress || 0}%` }} /></div>
                                            <div className="flex justify-between text-[8px] font-black text-zinc-600 uppercase tracking-widest"><span>Efficiency</span><span>{project.progress || 0}%</span></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* 🔹 SIDEBAR PREMIUM (CENTRAL DE COMANDO) */}
            {selectedProject && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[200] animate-in fade-in" onClick={() => setSelectedProject(null)} />
                    <div className="fixed inset-y-4 right-4 w-full md:w-[900px] bg-[#050505] border border-white/10 z-[210] rounded-[48px] shadow-2xl flex flex-col animate-in slide-in-from-right duration-700 overflow-hidden">

                        <div className="p-12 pb-8 bg-gradient-to-br from-white/[0.03] to-transparent shrink-0">
                            <div className="flex justify-between items-start">
                                <div className="space-y-6">
                                    <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest bg-white/5 inline-block ${getPhaseColor(selectedProject.phase).replace('bg-', 'text-')} ${getPhaseColor(selectedProject.phase).replace('bg-', 'border-')}/30`}>{selectedProject.phase}</div>
                                    <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none text-white">{selectedProject.name}</h2>
                                    <div className="flex items-center gap-6">
                                        <p className="text-sm font-mono text-synx tracking-widest flex items-center gap-2"><User size={14} /> Cliente: <span className="text-white">{selectedProject.client}</span></p>
                                        <button onClick={handleCopyTrackingLink} className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-synx hover:border-synx/30 transition-all"><Link size={12} /> Copiar Link Cliente</button>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={handleDeleteProject} className="bg-white/5 hover:bg-red-500/20 hover:text-red-500 p-4 rounded-3xl transition-all border border-white/10 text-zinc-500 group relative" title="Excluir Projeto">
                                        <Trash2 size={24} />
                                    </button>
                                    <button onClick={() => setSelectedProject(null)} className="bg-white/5 hover:bg-synx hover:text-black p-4 rounded-3xl transition-all border border-white/10 text-white" title="Fechar Painel">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* TABS NAVEGAÇÃO (Sem a aba Equipe) */}
                            <div className="flex gap-10 mt-16 border-b border-white/5 overflow-x-auto custom-scrollbar pb-2">
                                {[
                                    { id: 'tarefas', label: 'Protocolos', icon: CheckSquare },
                                    { id: 'briefing', label: 'Data_Brief', icon: AlignLeft },
                                    { id: 'arquivos', label: 'Vault', icon: Paperclip },
                                    { id: 'financeiro', label: 'Caixa Forte', icon: Wallet },
                                    { id: 'repositorio', label: 'Código (Git)', icon: Github }
                                ].map((tab) => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`pb-4 flex items-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-synx' : 'text-zinc-600 hover:text-zinc-400'}`}>
                                        <tab.icon size={16} />{tab.label}{activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-synx shadow-[0_0_10px_#10b981]" />}</button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#050505]">

                            {/* 💰💰💰 TAB CAIXA FORTE 💰💰💰 */}
                            {activeTab === "financeiro" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

                                    {/* KPI DASHBOARD INTERNO (3 BLOCOS PREMIUM) */}
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] flex flex-col justify-center relative overflow-hidden group">
                                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/5 rounded-full blur-2xl" />
                                            <div className="w-10 h-10 rounded-xl bg-white/5 text-zinc-400 flex items-center justify-center border border-white/10 mb-4"><Landmark size={18} /></div>
                                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Valor do Contrato</p>
                                            <h4 className="text-2xl font-black italic text-white tracking-tighter truncate">
                                                R$ {Number(totalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </h4>
                                        </div>

                                        <div className="bg-gradient-to-br from-synx/10 to-transparent border border-synx/20 p-6 rounded-[32px] flex flex-col justify-center relative overflow-hidden">
                                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-synx/20 rounded-full blur-2xl" />
                                            <div className="w-10 h-10 rounded-xl bg-synx/20 text-synx flex items-center justify-center border border-synx/30 mb-4"><DollarSign size={18} /></div>
                                            <p className="text-[9px] font-black text-synx uppercase tracking-widest mb-1">Caixa Recebido</p>
                                            <h4 className="text-2xl font-black italic text-white tracking-tighter truncate">
                                                R$ {paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </h4>
                                        </div>

                                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] flex flex-col justify-center relative overflow-hidden">
                                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl" />
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 mb-4"><Clock size={18} /></div>
                                            <p className="text-[9px] font-black text-amber-500/70 uppercase tracking-widest mb-1">Saldo a Receber</p>
                                            <h4 className="text-2xl font-black italic text-white tracking-tighter truncate">
                                                R$ {pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </h4>
                                        </div>
                                    </div>

                                    {/* BARRA DE PROGRESSO GERAL */}
                                    <div className="bg-[#080808] border border-white/5 rounded-full p-2 flex items-center gap-4">
                                        <span className="text-[10px] font-black italic text-zinc-500 pl-4 w-12">{financeProgress}%</span>
                                        <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-synx to-teal-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: `${financeProgress}%` }} />
                                        </div>
                                        <span className="text-[9px] font-mono text-zinc-600 uppercase pr-4">Quitado</span>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-4">

                                        {/* COLUNA ESQUERDA: PARAMETRIZAÇÃO */}
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] flex items-center gap-2"><AlignLeft size={12} /> Parametrização</h3>
                                            <div className="space-y-6 bg-[#080808] border border-white/5 p-8 rounded-[32px]">
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-zinc-500 uppercase ml-2 tracking-widest">Valor Base do Contrato (R$)</label>
                                                    <input type="number" value={financeData.total_value} onChange={(e) => setFinanceData({ ...financeData, total_value: Number(e.target.value) })} className="w-full bg-black border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white focus:border-synx outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-zinc-500 uppercase ml-2 tracking-widest">MRR / Manutenção Mensal (R$)</label>
                                                    <input type="number" value={financeData.maintenance_value} onChange={(e) => setFinanceData({ ...financeData, maintenance_value: Number(e.target.value) })} className="w-full bg-black border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white focus:border-synx outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-zinc-500 uppercase ml-2 tracking-widest">Regra de Faturamento</label>
                                                    <select value={financeData.payment_model} onChange={(e) => setFinanceData({ ...financeData, payment_model: e.target.value })} className="w-full bg-black border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-zinc-300 focus:border-synx outline-none transition-all appearance-none">
                                                        <option value="50/50">50% Sinal / 50% Entrega</option>
                                                        <option value="custom">Manual (Criar parcelas abaixo)</option>
                                                    </select>
                                                </div>

                                                <div className="flex gap-2 mt-4">
                                                    <button onClick={saveFinanceSettings} disabled={isSavingFinance} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                                        {isSavingFinance ? "Salvando..." : "Salvar Setup"}
                                                    </button>
                                                    {financeData.payment_model === '50/50' && (
                                                        <button onClick={generateInstallments} className="flex-1 bg-synx/10 hover:bg-synx border border-synx/20 hover:border-synx text-synx hover:text-black py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                                            Gerar 50/50
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* COLUNA DIREITA: LIVRO CAIXA */}
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] flex items-center gap-2"><Banknote size={12} /> Livro Caixa (Faturas)</h3>
                                                <button onClick={() => setIsAddingCustomInstallment(!isAddingCustomInstallment)} className="text-synx bg-synx/10 hover:bg-synx hover:text-black p-2 rounded-lg transition-all border border-synx/20" title="Criar Fatura Manual">
                                                    <PlusCircle size={16} />
                                                </button>
                                            </div>

                                            {/* FORMULÁRIO RÁPIDO PARA FATURA MANUAL */}
                                            {isAddingCustomInstallment && (
                                                <form onSubmit={handleAddCustomInstallment} className="p-5 bg-synx/5 border border-synx/20 rounded-[24px] space-y-4 animate-in slide-in-from-top-2">
                                                    <input required type="text" placeholder="Descrição (Ex: Sinal, MRR Março)" className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:border-synx outline-none" value={newCustomInstallment.description} onChange={(e) => setNewCustomInstallment({ ...newCustomInstallment, description: e.target.value })} />
                                                    <div className="flex gap-2">
                                                        <input required type="number" placeholder="Valor (R$)" className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:border-synx outline-none" value={newCustomInstallment.amount} onChange={(e) => setNewCustomInstallment({ ...newCustomInstallment, amount: e.target.value })} />
                                                        <button type="submit" className="bg-synx text-black px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110">Injetar</button>
                                                    </div>
                                                </form>
                                            )}

                                            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                                {installments.length === 0 && <p className="text-[10px] font-mono text-zinc-600 border border-dashed border-white/10 p-8 rounded-[24px] text-center">Nenhuma fatura lançada nesta operação.</p>}

                                                {installments.map((inst) => (
                                                    <div key={inst.id} className={`p-4 rounded-[20px] border transition-all flex items-center justify-between group ${inst.status === 'paid' ? 'bg-gradient-to-r from-synx/10 to-transparent border-synx/30' : 'bg-[#080808] border-white/10 hover:border-white/30'}`}>
                                                        <div className="flex items-center gap-4">
                                                            <button onClick={() => markInstallmentPaid(inst.id, inst.status)} className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-lg ${inst.status === 'paid' ? 'bg-synx text-black shadow-synx/20' : 'bg-white/5 text-zinc-600 hover:bg-white/10 hover:text-white border border-white/5'}`}>
                                                                <CheckCircle2 size={16} />
                                                            </button>
                                                            <div>
                                                                <p className={`text-xs font-black uppercase tracking-wider ${inst.status === 'paid' ? 'text-synx' : 'text-white'}`}>{inst.description}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-[11px] font-mono text-zinc-400">R$ {Number(inst.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                                    {inst.status === 'paid' && <span className="bg-synx/20 text-synx text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Pago</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => handleDeleteInstallment(inst.id)} className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 bg-black rounded-lg border border-white/5 hover:border-red-500/30">
                                                            <Trash size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* COFRE BUROCRÁTICO (DOCUMENTOS) */}
                                    <div className="mt-8 border-t border-white/5 pt-10">
                                        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-6 flex items-center gap-2"><FileCheck size={12} /> Cofre de Documentos (Contratos & NFs)</h3>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                            <label className="col-span-2 border border-dashed border-white/10 hover:border-synx/50 transition-all rounded-[24px] p-6 flex items-center justify-center gap-4 bg-[#080808] cursor-pointer group">
                                                <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.csv" onChange={(e) => handleFinanceDocUpload(e, 'contract')} disabled={isUploadingDoc} />
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-synx/10 transition-colors"><FileCheck size={18} className="text-zinc-500 group-hover:text-synx" /></div>
                                                <div>
                                                    <p className="text-xs font-black text-white uppercase tracking-widest">Subir Contrato</p>
                                                    <p className="text-[8px] font-mono text-zinc-600 uppercase mt-0.5">PDF, IMG, CSV</p>
                                                </div>
                                            </label>

                                            <label className="col-span-2 border border-dashed border-white/10 hover:border-synx/50 transition-all rounded-[24px] p-6 flex items-center justify-center gap-4 bg-[#080808] cursor-pointer group">
                                                <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.csv" onChange={(e) => handleFinanceDocUpload(e, 'invoice')} disabled={isUploadingDoc} />
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-synx/10 transition-colors"><Receipt size={18} className="text-zinc-500 group-hover:text-synx" /></div>
                                                <div>
                                                    <p className="text-xs font-black text-white uppercase tracking-widest">Subir Nota (NF)</p>
                                                    <p className="text-[8px] font-mono text-zinc-600 uppercase mt-0.5">Comprovantes & Notas</p>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {financeDocs.length === 0 && <p className="col-span-2 text-[10px] font-mono text-zinc-700 uppercase tracking-widest text-center py-4">O cofre está vazio.</p>}
                                            {financeDocs.map((doc) => (
                                                <div key={doc.id} className="flex items-center gap-4 p-4 bg-[#080808] border border-white/5 rounded-2xl hover:border-white/20 transition-all group">
                                                    <a href={doc.file_url} target="_blank" rel="noreferrer" className="flex-1 flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400"><FileText size={16} /></div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="text-xs font-bold text-white truncate">{doc.file_name}</p>
                                                            <p className="text-[9px] font-mono text-synx uppercase mt-1">{doc.doc_type === 'contract' ? 'Contrato' : 'Nota Fiscal'}</p>
                                                        </div>
                                                        <ArrowUpRight size={16} className="text-zinc-600 group-hover:text-white" />
                                                    </a>
                                                    <button onClick={() => handleDeleteFinanceDoc(doc.id)} className="p-2 text-zinc-600 hover:text-red-500 bg-white/5 rounded-lg transition-colors"><Trash size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* 🔹 TAB REPOSITÓRIO (GIT) */}
                            {activeTab === "repositorio" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] flex items-center gap-2">
                                            <Github size={14} className="text-zinc-500" /> Integração de Código
                                        </h3>
                                        <button onClick={async () => {
                                            const input = document.getElementById("git-input") as HTMLInputElement;
                                            await supabase.from("projects").update({ repository_url: input.value }).eq("id", selectedProject.id);
                                            setProjects((prev) => prev.map(p => p.id === selectedProject.id ? { ...p, repository_url: input.value } : p));
                                            alert("Repositório salvo com sucesso!");
                                        }} className="bg-synx text-black px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                            Salvar Link
                                        </button>
                                    </div>

                                    <div className="bg-[#080808] border border-white/5 rounded-[32px] p-8">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase ml-2 tracking-widest block mb-4">Link do Repositório (GitHub / GitLab)</label>
                                        <input id="git-input" type="url" defaultValue={selectedProject.repository_url || ""} placeholder="https://github.com/seu-usuario/projeto..." className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-sm font-mono text-white focus:border-synx outline-none transition-all mb-6" />

                                        <a href={selectedProject.repository_url || "#"} target="_blank" rel="noreferrer" className={`flex items-center justify-center gap-3 w-full p-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedProject.repository_url ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' : 'bg-white/[0.02] text-zinc-600 border border-white/5 pointer-events-none'}`}>
                                            <Github size={16} /> Abrir Repositório
                                            <ArrowUpRight size={14} />
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* 🔹 TAREFAS */}
                            {activeTab === "tarefas" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="col-span-2 bg-white/[0.02] border border-white/5 p-8 rounded-[40px] flex items-center gap-8 group relative overflow-hidden">
                                            <div className="relative w-20 h-20 flex items-center justify-center">
                                                <svg className="w-full h-full -rotate-90"><circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" /><circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray={226.2} strokeDashoffset={226.2 - (226.2 * taskProgress) / 100} className="text-synx transition-all duration-1000" strokeLinecap="round" /></svg>
                                                <span className="absolute text-sm font-black italic">{taskProgress}%</span>
                                            </div>
                                            <div><h4 className="text-lg font-black uppercase italic text-white">Eficiência Operacional</h4><p className="text-[10px] font-mono text-zinc-500 uppercase mt-1 tracking-widest">{tasks.filter(t => t.status === 'completed').length} de {tasks.length} processos concluídos</p></div>
                                        </div>
                                        <div className="bg-synx/10 border border-synx/20 p-8 rounded-[40px] flex flex-col justify-center items-center text-center"><p className="text-[9px] font-black text-synx uppercase tracking-widest mb-2">Priority_Level</p><h5 className="text-2xl font-black text-white italic uppercase tracking-tighter">Alpha_01</h5></div>
                                    </div>

                                    <form onSubmit={handleAddTask} className="relative group">
                                        <div className="absolute inset-y-0 left-6 flex items-center text-synx group-focus-within:animate-pulse"><Plus size={20} /></div>
                                        <input type="text" placeholder="INJETAR NOVO PROTOCOLO..." className="w-full bg-white/[0.03] border border-white/10 rounded-[28px] pl-16 pr-8 py-6 text-xs font-mono font-bold tracking-[0.1em] text-white focus:outline-none focus:border-synx/50 transition-all placeholder:text-zinc-700" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
                                    </form>

                                    <div className="space-y-4">
                                        {tasks.map((task) => (
                                            <div key={task.id} onClick={() => toggleTaskStatus(task)} className={`flex items-center gap-6 p-6 rounded-[32px] border transition-all cursor-pointer group ${task.status === 'completed' ? 'opacity-40 border-white/5' : 'bg-white/[0.02] border-white/10 hover:border-synx/30'}`}>
                                                <div className={`w-8 h-8 rounded-2xl flex items-center justify-center border transition-all ${task.status === 'completed' ? 'bg-synx border-synx text-black' : 'border-zinc-800'}`}><CheckCircle2 size={16} /></div>
                                                <span className={`text-sm font-bold ${task.status === 'completed' ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{task.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 🔹 BRIEFING */}
                            {activeTab === "briefing" && (
                                <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="flex justify-between items-center"><div className="flex items-center gap-3"><AlignLeft className="text-synx" size={18} /><span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Encrypted_Notes</span></div><button onClick={saveDescription} disabled={isSavingDesc} className="bg-synx text-black px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.2)]">{isSavingDesc ? 'Sincronizando...' : 'Commit_Changes'}</button></div>
                                    <textarea className="flex-1 w-full bg-[#080808] border border-white/5 rounded-[40px] p-10 text-sm font-mono text-zinc-400 focus:outline-none focus:border-synx/30 transition-all resize-none leading-relaxed min-h-[400px]" placeholder="Inject technical requirements here..." value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} />
                                </div>
                            )}

                            {/* 🔹 ARQUIVOS */}
                            {activeTab === "arquivos" && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} disabled={isLoadingTasks} />
                                    <label htmlFor="file-upload" className="border-2 border-dashed border-white/5 hover:border-synx/30 transition-all rounded-[48px] p-20 flex flex-col items-center justify-center bg-white/[0.01] group cursor-pointer">
                                        <UploadCloud size={40} className={isLoadingTasks ? "text-synx animate-bounce" : "text-zinc-600 group-hover:text-synx"} />
                                        <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mt-4">{isLoadingTasks ? "Uploading..." : "Vault_Injection"}</h4>
                                    </label>
                                    <div className="grid grid-cols-1 gap-4">
                                        {attachments.map((file) => (
                                            <a key={file.id} href={file.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-[32px] hover:border-white/20 transition-all group">
                                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-synx border border-white/10">{file.file_type?.includes('image') ? <ImageIcon size={24} /> : <FileText size={24} />}</div>
                                                <div className="flex-1"><p className="text-sm font-black text-zinc-200">{file.file_name}</p><p className="text-[9px] font-mono text-zinc-600 mt-1 uppercase">Acessar Arquivo_Vault</p></div>
                                                <ArrowUpRight size={20} className="text-zinc-800 group-hover:text-synx transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </>
            )}

            {/* 🔹 MODAL NOVO ESCOPO */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-start mb-8 text-white">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Nova Operação</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-zinc-500 hover:text-white transition-colors" /></button>
                        </div>

                        <form onSubmit={handleCreateProject} className="space-y-6">
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-zinc-500 uppercase ml-2 tracking-widest">Nome do Projeto</label>
                                <input required type="text" placeholder="Ex: E-commerce Elite" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-synx outline-none transition-all" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-zinc-500 uppercase ml-2 tracking-widest">Selecione o Cliente</label>
                                <select required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-zinc-300 focus:border-synx outline-none transition-all appearance-none" value={newProject.client_id} onChange={(e) => setNewProject({ ...newProject, client_id: e.target.value })}>
                                    <option value="" disabled>Selecione um Cliente...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.full_name || c.name}</option>)}
                                </select>
                                <p className="text-[9px] font-mono text-zinc-600 mt-2 ml-2">Não encontrou? Cadastre na aba de "Usuários".</p>
                            </div>

                            <button type="submit" className="w-full bg-synx text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.2)] mt-4">Instanciar Projeto</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}