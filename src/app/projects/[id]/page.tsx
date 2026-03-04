"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Plus, MoreVertical, Calendar,
    MessageSquare, Paperclip, Clock, Activity, Users, CheckCircle2, X
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function KanbanBoard() {
    const params = useParams();
    const projectId = params?.id;

    const [project, setProject] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newTask, setNewTask] = useState({
        title: "", description: "", priority: "Média", status: "To Do"
    });

    const fetchData = async () => {
        if (!projectId) return;
        setIsLoading(true);

        const { data: projectData } = await supabase
            .from("projects")
            .select("*")
            .eq("id", projectId)
            .single();

        if (projectData) setProject(projectData);

        const { data: tasksData } = await supabase
            .from("tasks")
            .select("*")
            .eq("project_id", projectId)
            .order("created_at", { ascending: false });

        if (tasksData) setTasks(tasksData);

        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [projectId]);

    // 🔹 CRIAR TASK E ATUALIZAR PROGRESSO
    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;

        const taskToInsert = {
            project_id: projectId,
            title: newTask.title,
            description: newTask.description,
            priority: newTask.priority,
            status: newTask.status,
            client_visible: false
        };

        const { error } = await supabase.from("tasks").insert([taskToInsert]);

        if (error) {
            alert("Erro ao criar task: " + error.message);
            return;
        }

        // MATEMÁTICA DO PROGRESSO AO CRIAR TASK NOVA
        const totalTasks = tasks.length + 1;
        const doneTasks = tasks.filter(t => t.status === "Done").length + (newTask.status === "Done" ? 1 : 0);
        const newProgress = Math.round((doneTasks / totalTasks) * 100);

        // Salva o novo progresso no projeto
        await supabase.from("projects").update({ progress: newProgress }).eq("id", projectId);

        setNewTask({ title: "", description: "", priority: "Média", status: "To Do" });
        setIsModalOpen(false);
        fetchData();
    };

    // 🔹 MOVER TASK E RECALCULAR O PROGRESSO NA HORA
    const updateTaskStatus = async (taskId: number, newStatus: string) => {
        // 1. Atualiza a lista na tela imediatamente (Otimista)
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
        setTasks(updatedTasks);

        // 2. MATEMÁTICA DO PROGRESSO
        const totalTasks = updatedTasks.length;
        const doneTasks = updatedTasks.filter(t => t.status === "Done").length;
        const newProgress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

        // 3. Atualiza a barrinha do projeto na tela instantaneamente
        setProject((prev: any) => prev ? { ...prev, progress: newProgress } : prev);

        // 4. Salva a task movida e o novo progresso no Supabase
        await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
        await supabase.from("projects").update({ progress: newProgress }).eq("id", projectId);
    };

    const handleDragStart = (e: React.DragEvent, taskId: number) => {
        e.dataTransfer.setData("taskId", taskId.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        const taskId = parseInt(e.dataTransfer.getData("taskId"));
        if (taskId) {
            updateTaskStatus(taskId, newStatus);
        }
    };

    const columns = {
        "To Do": tasks.filter(t => t.status === "To Do"),
        "Doing": tasks.filter(t => t.status === "Doing"),
        "Done": tasks.filter(t => t.status === "Done")
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "Alta": return "text-red-400 bg-red-400/10 border-red-400/20";
            case "Média": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
            case "Baixa": return "text-synx bg-synx/10 border-synx/20";
            default: return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <p className="text-zinc-500 font-bold animate-pulse">Carregando quadro Kanban...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
                <h2 className="text-2xl font-bold text-white">Projeto não encontrado</h2>
                <Link href="/projects" className="text-synx hover:underline">Voltar para Central</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-6rem)]">

            {/* CABEÇALHO DO PROJETO COM A BARRINHA DE PROGRESSO */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <Link href="/projects" className="text-sm font-bold text-zinc-500 hover:text-white flex items-center gap-2 mb-2 transition-colors w-fit">
                        <ArrowLeft size={16} /> Voltar para Central
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold tracking-tight text-white">{project.name}</h1>
                        <span className="px-2.5 py-1 rounded-md bg-synx/10 text-synx border border-synx/20 text-xs font-bold uppercase tracking-wider">
                            {project.phase}
                        </span>
                    </div>
                    <p className="text-zinc-400 mt-1 flex items-center gap-2">
                        <Users size={14} /> Cliente: <strong className="text-white">{project.client}</strong>
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Progresso Global</p>
                        <div className="flex items-center gap-3">
                            <div className="h-1.5 w-32 bg-black/50 rounded-full overflow-hidden border border-white/[0.05]">
                                <div className="h-full bg-synx rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${project.progress}%` }}></div>
                            </div>
                            <p className="text-lg font-bold text-synx w-10">{project.progress}%</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-synx hover:bg-synx-hover text-[#09090b] font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={18} />
                        <span>Nova Task</span>
                    </button>
                </div>
            </div>

            {/* COLUNAS DO KANBAN */}
            <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-start snap-x">
                {Object.entries(columns).map(([columnName, columnTasks]) => (
                    <div
                        key={columnName}
                        className="min-w-[320px] w-[320px] bg-white/[0.02] border border-glass-border rounded-2xl flex flex-col h-full snap-center"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, columnName)}
                    >
                        <div className="p-4 border-b border-glass-border flex justify-between items-center bg-[#09090b]/50 rounded-t-2xl shrink-0">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                {columnName === "To Do" ? <Clock size={16} className="text-zinc-400" /> :
                                    columnName === "Doing" ? <Activity size={16} className="text-blue-400" /> :
                                        <CheckCircle2 size={16} className="text-synx" />}
                                {columnName}
                            </h3>
                            <span className="bg-white/[0.05] text-zinc-400 text-xs font-bold px-2.5 py-1 rounded-full border border-glass-border">
                                {columnTasks.length}
                            </span>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                            {columnTasks.map((task) => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    className="glass-panel p-4 rounded-xl border border-glass-border hover:border-synx/50 cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-all shadow-sm hover:shadow-[0_5px_15px_rgba(0,0,0,0.3)] bg-[#0e0e11]"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                        <button className="text-zinc-500 hover:text-white transition-colors"><MoreVertical size={16} /></button>
                                    </div>

                                    <h4 className="font-bold text-white mb-2 leading-snug">{task.title}</h4>
                                    {task.description && (
                                        <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">{task.description}</p>
                                    )}

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.05]">
                                        <div className="flex -space-x-2">
                                            <div className="h-6 w-6 rounded-full bg-synx/20 border-2 border-[#09090b] flex items-center justify-center text-[10px] font-bold text-synx">GL</div>
                                        </div>
                                        <div className="flex items-center gap-3 text-zinc-500">
                                            <div className="flex items-center gap-1 hover:text-zinc-300 transition-colors cursor-pointer"><MessageSquare size={14} /><span className="text-xs font-medium">0</span></div>
                                            <div className="flex items-center gap-1 hover:text-zinc-300 transition-colors cursor-pointer"><Paperclip size={14} /><span className="text-xs font-medium">0</span></div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {columnTasks.length === 0 && (
                                <div className="h-24 border-2 border-dashed border-glass-border rounded-xl flex items-center justify-center text-zinc-600 text-sm font-medium">
                                    Arraste cards para cá
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL DE NOVA TASK */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-[#0a0a0c]/90 rounded-3xl p-8 border border-white/[0.05] shadow-[0_0_80px_-20px_rgba(16,185,129,0.15)] relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <h2 className="text-xl font-bold text-white tracking-tight">Nova Task</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateTask} className="space-y-5 relative z-10">
                            <div>
                                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Título da Task</label>
                                <input required type="text" className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-synx/50 focus:ring-1 focus:ring-synx/50 transition-all font-medium" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Ex: Ajustar botão de compra" />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Descrição (Opcional)</label>
                                <textarea rows={3} className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-synx/50 focus:ring-1 focus:ring-synx/50 transition-all font-medium resize-none" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Detalhes do que precisa ser feito..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Prioridade</label>
                                    <select className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-synx/50 focus:ring-1 focus:ring-synx/50 transition-all font-medium appearance-none" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                                        <option value="Baixa">Baixa</option>
                                        <option value="Média">Média</option>
                                        <option value="Alta">Alta</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Coluna Inicial</label>
                                    <select className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-synx/50 focus:ring-1 focus:ring-synx/50 transition-all font-medium appearance-none" value={newTask.status} onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}>
                                        <option value="To Do">To Do</option>
                                        <option value="Doing">Doing</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full px-4 py-3.5 rounded-xl bg-synx hover:bg-synx-hover text-[#09090b] font-bold shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all">Salvar Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}