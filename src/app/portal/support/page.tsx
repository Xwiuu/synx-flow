"use client";

import { useState } from "react";
import { LifeBuoy, Send, MessageSquare, Clock, Phone } from "lucide-react";

export default function ClientSupport() {
    const [message, setMessage] = useState("");
    const [isSent, setIsSent] = useState(false);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Simula o envio
        setIsSent(true);
        setTimeout(() => {
            setMessage("");
            setIsSent(false);
        }, 3000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative pb-10">

            {/* 🔹 EFEITO DE FUNDO PREMIUM */}
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* CABEÇALHO */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <LifeBuoy className="text-synx" size={28} /> Suporte SYNX
                    </h1>
                    <p className="text-zinc-400 mt-1">Precisa de ajuda ou quer solicitar uma alteração? Fale com seu gerente.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">

                {/* LADO ESQUERDO: FORMULÁRIO DE TICKET/MENSAGEM */}
                <div className="lg:col-span-2">
                    <div className="glass-panel rounded-3xl p-8 border border-white/[0.05] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-synx/5 rounded-full blur-[80px] pointer-events-none"></div>

                        <h2 className="text-xl font-bold text-white mb-6">Abrir Chamado</h2>

                        <form onSubmit={handleSendMessage} className="space-y-5 relative z-10">
                            <div>
                                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2 pl-1">Assunto</label>
                                <select className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-synx/50 focus:ring-1 focus:ring-synx/50 transition-all font-medium appearance-none">
                                    <option value="duvida">Dúvida sobre o projeto</option>
                                    <option value="alteracao">Solicitar nova alteração (Escopo)</option>
                                    <option value="financeiro">Financeiro / Faturas</option>
                                    <option value="bug">Reportar um problema</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2 pl-1">Sua Mensagem</label>
                                <textarea
                                    required
                                    rows={6}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-synx/50 focus:ring-1 focus:ring-synx/50 transition-all placeholder:text-zinc-700 font-medium resize-none"
                                    placeholder="Descreva em detalhes o que você precisa..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSent}
                                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all w-full md:w-auto shadow-[0_0_20px_rgba(16,185,129,0.2)] ${isSent ? "bg-zinc-800 text-synx border border-synx/50" : "bg-synx hover:bg-synx-hover text-[#09090b]"
                                    }`}
                            >
                                {isSent ? "Mensagem Enviada!" : <><Send size={18} /> Enviar Solicitação</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* LADO DIREITO: INFOS DE CONTATO E SLA */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border border-white/[0.05]">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 mb-4">
                            <Clock size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Tempo de Resposta (SLA)</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Nossa equipe responde a chamados comerciais e dúvidas em até <strong className="text-white">4 horas úteis</strong>. Bugs críticos são priorizados imediatamente.
                        </p>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-white/[0.05]">
                        <div className="h-12 w-12 rounded-xl bg-synx/10 flex items-center justify-center border border-synx/20 text-synx mb-4">
                            <MessageSquare size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Atendimento Direto</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                            Seu gerente de contas é o <strong>Glaass</strong>. Para urgências, você pode acionar nosso canal direto via WhatsApp.
                        </p>
                        <button className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] text-white text-sm font-bold transition-all">
                            <Phone size={16} /> Chamar no WhatsApp
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}