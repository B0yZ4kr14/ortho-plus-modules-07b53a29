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
    // Esta função é executada via cron, então usa service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Iniciando limpeza agendada de backups...');

    // Buscar todas as clínicas com auto-cleanup habilitado
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('id, name, backup_retention_days, auto_cleanup_enabled')
      .eq('auto_cleanup_enabled', true);

    if (clinicsError) {
      console.error('Erro ao buscar clínicas:', clinicsError);
      throw clinicsError;
    }

    if (!clinics || clinics.length === 0) {
      console.log('Nenhuma clínica com auto-cleanup habilitado');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhuma clínica com auto-cleanup habilitado',
          processed: 0 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    // Executar limpeza para cada clínica
    for (const clinic of clinics) {
      try {
        console.log(`Processando clínica: ${clinic.name} (${clinic.id})`);

        const { data, error } = await supabase
          .rpc('cleanup_old_backups', { p_clinic_id: clinic.id });

        if (error) {
          console.error(`Erro ao limpar backups da clínica ${clinic.id}:`, error);
          results.push({
            clinic_id: clinic.id,
            clinic_name: clinic.name,
            success: false,
            error: error.message
          });
          continue;
        }

        const result = data?.[0] || { deleted_count: 0, freed_bytes: 0 };

        results.push({
          clinic_id: clinic.id,
          clinic_name: clinic.name,
          success: true,
          deleted_count: result.deleted_count,
          freed_bytes: result.freed_bytes
        });

        console.log(`Clínica ${clinic.name}: ${result.deleted_count} backups removidos, ${(result.freed_bytes / (1024 * 1024)).toFixed(2)} MB liberados`);

      } catch (error) {
        console.error(`Erro ao processar clínica ${clinic.id}:`, error);
        results.push({
          clinic_id: clinic.id,
          clinic_name: clinic.name,
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    const totalDeleted = results.reduce((sum, r) => sum + (r.deleted_count || 0), 0);
    const totalFreed = results.reduce((sum, r) => sum + (r.freed_bytes || 0), 0);

    console.log(`Limpeza agendada concluída: ${results.length} clínicas processadas, ${totalDeleted} backups removidos, ${(totalFreed / (1024 * 1024)).toFixed(2)} MB liberados`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        total_deleted: totalDeleted,
        total_freed_bytes: totalFreed,
        results: results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na limpeza agendada:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
