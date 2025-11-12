import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se é ADMIN
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roles || roles.role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: 'Apenas administradores podem configurar backups automáticos' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { clinic_id, enabled, frequency } = await req.json();

    if (!clinic_id || enabled === undefined) {
      return new Response(
        JSON.stringify({ error: 'clinic_id e enabled são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Converter frequência para cron schedule
    const cronSchedules: Record<string, string> = {
      'hourly': '0 * * * *',    // A cada hora
      'daily': '0 2 * * *',      // Todo dia às 2h
      'weekly': '0 2 * * 0',     // Todo domingo às 2h
      'monthly': '0 2 1 * *'     // Todo dia 1 do mês às 2h
    };

    const schedule = cronSchedules[frequency] || cronSchedules['daily'];

    if (enabled) {
      // Habilitar extensões necessárias
      await supabase.rpc('enable_pg_cron');
      await supabase.rpc('enable_pg_net');

      // Criar ou atualizar job de backup automático
      const jobName = `auto-backup-clinic-${clinic_id}`;
      const functionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/manual-backup`;
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

      // Remover job existente se houver
      await supabase.rpc('unschedule_cron_job', { job_name: jobName });

      // Criar novo job
      const { error: cronError } = await supabase.rpc('schedule_cron_job', {
        job_name: jobName,
        schedule: schedule,
        command: `
          SELECT net.http_post(
            url:='${functionUrl}',
            headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${anonKey}"}'::jsonb,
            body:='{"clinic_id": "${clinic_id}"}'::jsonb
          ) as request_id;
        `
      });

      if (cronError) {
        console.error('Erro ao criar cron job:', cronError);
        return new Response(
          JSON.stringify({ error: 'Erro ao configurar backup automático' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Backup automático configurado para clinic_id: ${clinic_id}, frequência: ${frequency}`);
    } else {
      // Desabilitar backup automático
      const jobName = `auto-backup-clinic-${clinic_id}`;
      await supabase.rpc('unschedule_cron_job', { job_name: jobName });

      console.log(`Backup automático desabilitado para clinic_id: ${clinic_id}`);
    }

    // Log de auditoria
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      clinic_id: clinic_id,
      action: enabled ? 'AUTO_BACKUP_ENABLED' : 'AUTO_BACKUP_DISABLED',
      details: { frequency: frequency, schedule: schedule }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: enabled ? 'Backup automático configurado' : 'Backup automático desabilitado',
        schedule: enabled ? schedule : null
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao configurar backup automático:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
