import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { operatorType, companyName, name, email, password, role, createProjectFlow, project } = body;

        // 1. INVOCANDO O CLIENTE MESTRE (Bypass de Segurança)
        // Usamos a service_role_key para não afetar a sessão de quem está logado no navegador
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 2. CRIA O USUÁRIO NO SUPABASE AUTH
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Já confirma o e-mail automaticamente
            user_metadata: {
                full_name: name,
                operator_type: operatorType,
                company_name: companyName
            }
        });

        if (authError) throw authError;

        const userId = authData.user.id;

        // 3. ATUALIZA A HIERARQUIA (Role)
        // O seu trigger no SQL cria o perfil como 'client' por padrão. Se for admin, a gente atualiza.
        if (role === 'admin') {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({ role: 'admin' })
                .eq('id', userId);

            if (profileError) throw profileError;
        }

        // 4. FLUXO DE ONBOARDING: CRIA O PROJETO (Se ativado)
        if (createProjectFlow && project?.name) {
            const clientName = operatorType === 'PJ' ? companyName : name;

            const { error: projectError } = await supabaseAdmin
                .from('projects')
                .insert([{
                    name: project.name,
                    client: clientName,
                    client_email: email,
                    phase: project.phase,
                    status: 'Novo',
                    progress: 0,
                    days_left: 30 // Padrão de 30 dias para início
                }]);

            if (projectError) throw projectError;
        }

        // Deu tudo certo! Retorna sucesso pro Front-end.
        return NextResponse.json({ success: true, message: "Operador e Onboarding concluídos!" });

    } catch (error: any) {
        console.error("Erro na API de Usuários:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}