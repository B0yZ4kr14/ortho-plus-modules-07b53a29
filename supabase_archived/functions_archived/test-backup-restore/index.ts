import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestResult {
  success: boolean;
  backupId: string;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  errors: string[];
  duration: number;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's clinic_id
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('clinic_id, app_role')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return new Response(JSON.stringify({ error: 'Clinic not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Only admins can run restore tests
    if (profile.app_role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { backupId, testEnvironment = 'sandbox' } = await req.json();

    if (!backupId) {
      return new Response(JSON.stringify({ error: 'Backup ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const startTime = Date.now();
    const errors: string[] = [];
    let testsRun = 0;
    let testsPassed = 0;

    console.log(`[TestBackupRestore] Starting restore test for backup ${backupId} in ${testEnvironment}`);

    // 1. Fetch backup from history
    testsRun++;
    const { data: backup, error: fetchError } = await supabaseClient
      .from('backup_history')
      .select('*')
      .eq('id', backupId)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (fetchError || !backup) {
      errors.push(`Failed to fetch backup: ${fetchError?.message || 'Not found'}`);
      console.error('[TestBackupRestore] Fetch error:', fetchError);
    } else {
      testsPassed++;
      console.log('[TestBackupRestore] Backup fetched successfully');
    }

    if (!backup) {
      const duration = Date.now() - startTime;
      return new Response(JSON.stringify({
        success: false,
        backupId,
        testsRun,
        testsPassed,
        testsFailed: testsRun - testsPassed,
        errors,
        duration,
        timestamp: new Date().toISOString(),
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Validate backup integrity (checksums)
    testsRun++;
    try {
      const { data: integrityData, error: integrityError } = await supabaseClient.functions.invoke(
        'validate-backup-integrity',
        { body: { backupId } }
      );

      if (integrityError) {
        errors.push(`Integrity validation failed: ${integrityError.message}`);
        console.error('[TestBackupRestore] Integrity error:', integrityError);
      } else if (!integrityData?.isValid) {
        errors.push('Backup integrity check failed: Checksums do not match');
        console.error('[TestBackupRestore] Checksums mismatch');
      } else {
        testsPassed++;
        console.log('[TestBackupRestore] Integrity validation passed');
      }
    } catch (error: any) {
      errors.push(`Integrity validation exception: ${error.message}`);
      console.error('[TestBackupRestore] Integrity exception:', error);
    }

    // 3. Parse backup data structure
    testsRun++;
    let backupData: any = null;
    try {
      if (backup.file_path && backup.file_path.startsWith('{')) {
        backupData = JSON.parse(backup.file_path);
      } else {
        // Se file_path não for JSON, tentar buscar do storage ou metadata
        if (backup.metadata && typeof backup.metadata === 'object' && 'data' in backup.metadata) {
          backupData = backup.metadata.data;
        }
      }

      if (!backupData) {
        errors.push('Failed to parse backup data structure');
        console.error('[TestBackupRestore] No backup data found');
      } else {
        testsPassed++;
        console.log('[TestBackupRestore] Backup data parsed successfully');
      }
    } catch (error: any) {
      errors.push(`Failed to parse backup: ${error.message}`);
      console.error('[TestBackupRestore] Parse error:', error);
    }

    // 4. Validate data schema (check required fields)
    if (backupData) {
      testsRun++;
      try {
        const requiredFields = ['version', 'exportedAt', 'data'];
        const missingFields = requiredFields.filter(field => !(field in backupData));
        
        if (missingFields.length > 0) {
          errors.push(`Missing required fields: ${missingFields.join(', ')}`);
          console.error('[TestBackupRestore] Missing fields:', missingFields);
        } else {
          testsPassed++;
          console.log('[TestBackupRestore] Schema validation passed');
        }
      } catch (error: any) {
        errors.push(`Schema validation error: ${error.message}`);
        console.error('[TestBackupRestore] Schema error:', error);
      }

      // 5. Validate data counts
      testsRun++;
      try {
        const data = backupData.data || {};
        const dataCounts = {
          patients: data.patients?.length || 0,
          prontuarios: data.prontuarios?.length || 0,
          appointments: data.appointments?.length || 0,
          transactions: data.transactions?.length || 0,
        };

        console.log('[TestBackupRestore] Data counts:', dataCounts);
        
        // Backup deve ter pelo menos algum dado
        const totalRecords = Object.values(dataCounts).reduce((sum: number, count) => sum + count, 0);
        if (totalRecords === 0) {
          errors.push('Backup contains no data records');
          console.warn('[TestBackupRestore] Empty backup');
        } else {
          testsPassed++;
          console.log(`[TestBackupRestore] Found ${totalRecords} total records`);
        }
      } catch (error: any) {
        errors.push(`Data count validation error: ${error.message}`);
        console.error('[TestBackupRestore] Count error:', error);
      }

      // 6. Simulate restore (dry run - não aplica mudanças reais)
      testsRun++;
      try {
        // Verificar se conseguimos processar os dados de restore sem erros
        const data = backupData.data || {};
        
        // Validar estrutura de cada tipo de dado
        const dataTypes = ['patients', 'prontuarios', 'appointments', 'transactions', 'modules'];
        let validationErrors = 0;

        for (const type of dataTypes) {
          if (data[type] && !Array.isArray(data[type])) {
            validationErrors++;
            errors.push(`Invalid data type for ${type}: expected array`);
            console.error(`[TestBackupRestore] Invalid type for ${type}`);
          }
        }

        if (validationErrors === 0) {
          testsPassed++;
          console.log('[TestBackupRestore] Dry run validation passed');
        }
      } catch (error: any) {
        errors.push(`Restore simulation error: ${error.message}`);
        console.error('[TestBackupRestore] Simulation error:', error);
      }
    }

    const duration = Date.now() - startTime;
    const testsFailed = testsRun - testsPassed;
    const success = testsFailed === 0;

    const testResult: TestResult = {
      success,
      backupId,
      testsRun,
      testsPassed,
      testsFailed,
      errors,
      duration,
      timestamp: new Date().toISOString(),
    };

    console.log('[TestBackupRestore] Test completed:', testResult);

    // 7. Log test result to audit
    await supabaseClient.from('audit_logs').insert({
      clinic_id: profile.clinic_id,
      user_id: user.id,
      action: success ? 'BACKUP_RESTORE_TEST_SUCCESS' : 'BACKUP_RESTORE_TEST_FAILED',
      details: {
        backupId,
        testsRun,
        testsPassed,
        testsFailed,
        duration,
        errors,
      },
    });

    // 8. Send notification if test failed
    if (!success) {
      await supabaseClient.from('notifications').insert({
        clinic_id: profile.clinic_id,
        user_id: user.id,
        tipo: 'SISTEMA',
        titulo: '⚠️ Teste de Restauração de Backup Falhou',
        mensagem: `O teste automático de restauração do backup ${backupId} falhou com ${testsFailed} erro(s). Verifique a integridade dos seus backups.`,
        link_acao: `/configuracoes/backups-agendados`,
      });

      console.warn('[TestBackupRestore] Test failed, notification sent');
    }

    return new Response(JSON.stringify(testResult), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[TestBackupRestore] Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});