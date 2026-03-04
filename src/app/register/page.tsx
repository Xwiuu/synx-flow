"use client";

import Link from "next/link";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

export default function Register() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090b] overflow-hidden animate-in fade-in duration-700">

            {/* Efeitos de Luz no Fundo */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-synx/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative w-full max-w-md p-8 sm:p-10 glass-panel rounded-3xl border border-glass-border shadow-2xl">

                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-white mt-2">
                        Criar conta
                    </h1>
                    <p className="text-sm text-zinc-400 mt-2 text-center">
                        Junte-se à SYNX e gerencie seus projetos.
                    </p>
                </div>

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">Nome Completo</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-zinc-500" />
                            </div>
                            <input type="text" placeholder="Seu nome" className="w-full bg-[#09090b]/50 border border-glass-border rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-synx focus:ring-1 focus:ring-synx transition-all" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">E-mail</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-zinc-500" />
                            </div>
                            <input type="email" placeholder="nome@synx.com" className="w-full bg-[#09090b]/50 border border-glass-border rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-synx focus:ring-1 focus:ring-synx transition-all" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">Senha</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-zinc-500" />
                            </div>
                            <input type="password" placeholder="••••••••" className="w-full bg-[#09090b]/50 border border-glass-border rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-synx focus:ring-1 focus:ring-synx transition-all" />
                        </div>
                    </div>

                    <button type="button" className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-zinc-200 text-[#09090b] font-bold transition-all group">
                        <span>Criar Conta</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-zinc-500">
                    Já possui acesso?{" "}
                    <Link href="/login" className="font-medium text-white hover:text-synx transition-colors">
                        Fazer login
                    </Link>
                </p>
            </div>
        </div>
    );
}