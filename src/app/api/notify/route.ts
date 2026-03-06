import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { projectName, clientName, clientEmail, oldPhase, newPhase, trackingUrl } = body;

        if (!clientEmail || clientEmail === "sem-email@sistema.com") {
            return NextResponse.json({ success: false, message: "Cliente sem e-mail cadastrado." });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 💎 DESIGN ULTRA PREMIUM (ESTILO APPLE / VERCEL / LINEAR)
        const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Atualização SYNX</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 60px 20px;">
        <tr>
          <td align="center">
            
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #0A0A0A; border: 1px solid #1E1E1E; border-radius: 12px;">
              
              <tr>
                <td style="padding: 40px 40px 20px 40px;">
                  <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #FFFFFF;">
                    SYNX<span style="color: #10B981;">.</span>
                  </span>
                </td>
              </tr>

              <tr>
                <td style="padding: 0 40px 40px 40px;">
                  <h1 style="font-size: 24px; font-weight: 600; color: #EDEDED; margin: 0 0 16px 0; letter-spacing: -0.5px;">
                    Atualização de Status
                  </h1>
                  <p style="font-size: 15px; color: #A1A1AA; line-height: 24px; margin: 0 0 32px 0;">
                    Olá ${clientName}, a operação <strong>${projectName}</strong> avançou para uma nova etapa em nossa esteira de engenharia.
                  </p>
                  
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #111111; border-radius: 8px; margin-bottom: 36px;">
                    <tr>
                      <td style="padding: 20px 24px; border-left: 3px solid #10B981; border-radius: 8px;">
                        <p style="font-size: 11px; color: #71717A; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Status Atual</p>
                        <p style="font-size: 18px; font-weight: 600; color: #FFFFFF; margin: 0; letter-spacing: -0.3px;">${newPhase}</p>
                      </td>
                    </tr>
                  </table>

                  <table border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="border-radius: 6px; background-color: #FFFFFF;">
                        <a href="${trackingUrl}" target="_blank" style="font-size: 14px; font-weight: 600; color: #000000; text-decoration: none; padding: 14px 28px; border-radius: 6px; border: 1px solid #FFFFFF; display: inline-block;">
                          Acessar Portal do Cliente &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>

              <tr>
                <td style="padding: 24px 40px; background-color: #050505; border-top: 1px solid #1E1E1E; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
                  <p style="font-size: 12px; color: #52525B; margin: 0; line-height: 18px;">
                    Este é um aviso automático gerado pela infraestrutura SYNX.<br>
                    Para dúvidas, responda a este e-mail.
                  </p>
                </td>
              </tr>

            </table>
            
          </td>
        </tr>
      </table>

    </body>
    </html>
    `;

        const mailOptions = {
            from: `"SYNX Operations" <${process.env.EMAIL_USER}>`,
            to: clientEmail,
            subject: `Atualização: ${projectName} mudou para ${newPhase}`,
            html: htmlTemplate,
        };

        await transporter.sendMail(mailOptions);

        console.log(`✅ E-MAIL ENVIADO COM SUCESSO PARA: ${clientEmail}`);

        return NextResponse.json({ success: true, message: "Email enviado com sucesso!" });

    } catch (error: any) {
        console.error("❌ ERRO AO ENVIAR EMAIL:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}