import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    console.log("Starting backup integrity check for all clinics...");

    // Buscar backups recentes (últimas 24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentBackups, error: backupsError } = await supabaseClient
      .from("backup_history")
      .select("*, clinics(*)")
      .gte("created_at", yesterday)
      .eq("status", "success");

    if (backupsError) throw backupsError;

    console.log(`Found ${recentBackups?.length || 0} recent backups to check`);

    const corruptBackups = [];

    // Verificar integridade de cada backup
    for (const backup of recentBackups || []) {
      try {
        // Invocar função de validação
        const { data: validationResult } = await supabaseClient.functions.invoke(
          "validate-backup-integrity",
          { body: { backupId: backup.id } }
        );

        if (validationResult && !validationResult.isValid) {
          corruptBackups.push({
            backup,
            clinic: backup.clinics,
            validationResult,
          });

          console.log(`Corrupt backup detected: ${backup.id} for clinic ${backup.clinic_id}`);
        }
      } catch (error) {
        console.error(`Error validating backup ${backup.id}:`, error);
      }
    }

    // Enviar alertas por email para backups corrompidos
    for (const { backup, clinic, validationResult } of corruptBackups) {
      try {
        // Buscar email do admin da clínica
        const { data: profiles } = await supabaseClient
          .from("profiles")
          .select("*, user_roles(*)")
          .eq("clinic_id", clinic.id)
          .eq("user_roles.role", "ADMIN");

        if (!profiles || profiles.length === 0) continue;

        const adminEmail = profiles[0].email || "admin@clinic.com";

        await resend.emails.send({
          from: "Ortho+ Backups <backups@orthoplus.app>",
          to: [adminEmail],
          subject: "⚠️ ALERTA: Backup Corrompido Detectado",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
                  .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                  .alert-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 5px; }
                  .details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
                  .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
                  .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 style="margin: 0;">⚠️ Backup Corrompido Detectado</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Integridade Ortho+</p>
                  </div>
                  <div class="content">
                    <div class="alert-box">
                      <h3 style="margin-top: 0; color: #dc2626;">ATENÇÃO CRÍTICA</h3>
                      <p>Um backup da sua clínica foi identificado como corrompido e não deve ser usado para restauração.</p>
                    </div>

                    <div class="details">
                      <h3>Detalhes do Backup:</h3>
                      <div class="detail-row">
                        <span><strong>ID do Backup:</strong></span>
                        <span>${backup.id}</span>
                      </div>
                      <div class="detail-row">
                        <span><strong>Data de Criação:</strong></span>
                        <span>${new Date(backup.created_at).toLocaleString('pt-BR')}</span>
                      </div>
                      <div class="detail-row">
                        <span><strong>Tipo:</strong></span>
                        <span>${backup.backup_type}</span>
                      </div>
                      <div class="detail-row">
                        <span><strong>Tamanho:</strong></span>
                        <span>${(backup.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>

                    <div class="details">
                      <h3>Resultados da Validação:</h3>
                      <div class="detail-row">
                        <span><strong>Checksum MD5:</strong></span>
                        <span style="color: #dc2626;">❌ Falhou</span>
                      </div>
                      <div class="detail-row">
                        <span><strong>Checksum SHA256:</strong></span>
                        <span style="color: #dc2626;">❌ Falhou</span>
                      </div>
                    </div>

                    <h3>Recomendações:</h3>
                    <ul>
                      <li>Não utilize este backup para restauração</li>
                      <li>Execute um novo backup completo imediatamente</li>
                      <li>Verifique a integridade dos backups mais recentes</li>
                      <li>Entre em contato com o suporte se o problema persistir</li>
                    </ul>

                    <a href="${Deno.env.get("SUPABASE_URL")}/configuracoes" class="button">
                      Acessar Sistema de Backups
                    </a>

                    <p style="margin-top: 30px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                      Este é um alerta automático do sistema Ortho+. Para desativar alertas de integridade, acesse as configurações de backup.
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        console.log(`Corruption alert email sent to ${adminEmail}`);
      } catch (emailError) {
        console.error(`Error sending corruption alert email:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Integrity check completed. Found ${corruptBackups.length} corrupt backups.`,
        corruptBackups: corruptBackups.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-backup-integrity-alerts:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
