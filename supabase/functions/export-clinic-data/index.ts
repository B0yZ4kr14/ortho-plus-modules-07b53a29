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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { format, clinic_id } = await req.json();

    if (!clinic_id) {
      return new Response(
        JSON.stringify({ error: 'clinic_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se usuário tem acesso à clínica
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile || profile.clinic_id !== clinic_id) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado a esta clínica' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exportar dados de todas as tabelas relevantes
    const tables = [
      'prontuarios',
      'historico_clinico',
      'pep_tratamentos',
      'pep_odontograma',
      'pep_anexos',
      'pep_assinaturas',
      'pep_evolucoes'
    ];

    const exportData: Record<string, any> = {
      exported_at: new Date().toISOString(),
      clinic_id: clinic_id,
      format: format,
      tables: {}
    };

    // Exportar cada tabela
    for (const table of tables) {
      try {
        let query = supabase.from(table).select('*');
        
        // Filtrar por clinic_id se a tabela tiver esse campo
        if (table === 'prontuarios') {
          query = query.eq('clinic_id', clinic_id);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error(`Erro ao exportar tabela ${table}:`, error);
          continue;
        }

        exportData.tables[table] = data || [];
      } catch (error) {
        console.error(`Erro ao processar tabela ${table}:`, error);
        exportData.tables[table] = [];
      }
    }

    let content: string;
    
    if (format === 'json') {
      content = JSON.stringify(exportData, null, 2);
    } else if (format === 'csv') {
      // Conversão simplificada para CSV (apenas primeira tabela como exemplo)
      const firstTable = Object.keys(exportData.tables)[0];
      const rows = exportData.tables[firstTable];
      
      if (rows.length === 0) {
        content = 'Nenhum dado encontrado';
      } else {
        const headers = Object.keys(rows[0]).join(',');
        const csvRows = rows.map((row: any) => 
          Object.values(row).map(v => 
            typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
          ).join(',')
        );
        content = [headers, ...csvRows].join('\n');
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Formato não suportado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Exportação concluída para clinic_id: ${clinic_id}, formato: ${format}`);

    return new Response(
      JSON.stringify({ content, size: content.length }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro na exportação:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
