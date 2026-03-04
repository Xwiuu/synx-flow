"use client";

import { FileText, Download, FileCheck, AlertCircle, FileDigit } from "lucide-react";

export default function ClientDocuments() {
    // 🔹 MOCK: Documentos do Cliente
    const documents = [
        { id: 1, name: "Contrato de Desenvolvimento.pdf", type: "Contrato", date: "10 Jan, 2026", status: "Assinado", size: "2.4 MB" },
        { id: 2, name: "Fatura #004 - Fase de Design.pdf", type: "Fatura", date: "15 Fev, 2026", status: "Pendente", size: "1.1 MB" },
        { id: 3, name: "Fatura #003 - Kickoff.pdf", type: "Fatura", date: "10 Jan, 2026", status: "Pago", size: "1.0 MB" },
        { id: 4, name: "Brandbook_TechCorp.pdf", type: "Entrega", date: "05 Mar, 2026", status: "Aprovado", size: "15.8 MB" }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative pb-10">

            {/* 🔹 EFEITO DE FUNDO PREMIUM */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* CABEÇALHO */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <FileText className="text-synx" size={28} /> Central de Documentos
                    </h1>
                    <p className="text-zinc-400 mt-1">Acesse seus contratos, faturas e arquivos finais do projeto.</p>
                </div>
            </div>

            {/* CARDS DE RESUMO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-glass-border">
                    <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Ação Necessária</p>
                        <h3 className="text-xl font-bold text-white mt-0.5">1 Fatura Pendente</h3>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-glass-border">
                    <div className="h-12 w-12 rounded-full bg-synx/10 flex items-center justify-center border border-synx/20 text-synx">
                        <FileCheck size={24} />
                    </div>
                    <div>
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Contratos Ativos</p>
                        <h3 className="text-xl font-bold text-white mt-0.5">1 Documento</h3>
                    </div>
                </div>
            </div>

            {/* LISTA DE DOCUMENTOS */}
            <div className="glass-panel rounded-3xl overflow-hidden border border-white/[0.05] relative z-10">
                <div className="p-6 border-b border-white/[0.05] bg-black/20">
                    <h2 className="text-lg font-bold text-white">Arquivos do Projeto</h2>
                </div>

                <div className="divide-y divide-white/[0.05]">
                    {documents.map((doc) => (
                        <div key={doc.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-[#09090b] border border-white/[0.05] flex items-center justify-center text-zinc-500 group-hover:text-synx transition-colors">
                                    <FileDigit size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm group-hover:text-synx transition-colors">{doc.name}</h4>
                                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                                        <span className="uppercase tracking-wider font-semibold text-zinc-400">{doc.type}</span>
                                        <span>•</span>
                                        <span>{doc.size}</span>
                                        <span>•</span>
                                        <span>{doc.date}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${doc.status === 'Pago' || doc.status === 'Aprovado' || doc.status === 'Assinado' ? 'bg-synx/10 text-synx border-synx/20' :
                                        'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
                                    }`}>
                                    {doc.status}
                                </span>

                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white hover:bg-synx hover:text-[#09090b] hover:border-synx transition-all text-sm font-bold shadow-sm">
                                    <Download size={16} /> Baixar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}