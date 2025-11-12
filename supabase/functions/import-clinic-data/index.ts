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

    // Verificar se é ADMIN
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roles || roles.role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: 'Apenas administradores podem importar dados' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: importData, clinic_id } = await req.json();

    if (!importData || !clinic_id) {
      return new Response(
        JSON.stringify({ error: 'Dados de importação e clinic_id são obrigatórios' }),
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

    const results: Record<string, any> = {
      imported_at: new Date().toISOString(),
      tables: {}
    };

    // Importar dados para cada tabela
    if (importData.tables) {
      for (const [tableName, rows] of Object.entries(importData.tables)) {
        try {
          if (!Array.isArray(rows) || rows.length === 0) {
            results.tables[tableName] = { success: true, count: 0, message: 'Sem dados para importar' };
            continue;
          }

          // Validar e limpar dados antes de inserir
          const cleanedRows = (rows as any[]).map(row => {
            const cleaned = { ...row };
            // Garantir que clinic_id está correto
            if ('clinic_id' in cleaned) {
              cleaned.clinic_id = clinic_id;
            }
            // Garantir que created_by é o usuário atual
            if ('created_by' in cleaned) {
              cleaned.created_by = user.id;
            }
            return cleaned;
          });

          const { error } = await supabase
            .from(tableName)
            .insert(cleanedRows);

          if (error) {
            console.error(`Erro ao importar tabela ${tableName}:`, error);
            results.tables[tableName] = { 
              success: false, 
              error: error.message,
              count: 0
            };
          } else {
            results.tables[tableName] = { 
              success: true, 
              count: cleanedRows.length,
              message: `${cleanedRows.length} registro(s) importado(s)`
            };
          }
        } catch (error) {
          console.error(`Erro ao processar tabela ${tableName}:`, error);
          results.tables[tableName] = { 
            success: false, 
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            count: 0
          };
        }
      }
    }

    // Log de auditoria
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      clinic_id: clinic_id,
      action: 'DATA_IMPORT',
      details: { 
        tables_imported: Object.keys(results.tables),
        timestamp: new Date().toISOString()
      }
    });

    console.log(`Importação concluída para clinic_id: ${clinic_id}`);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na importação:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
