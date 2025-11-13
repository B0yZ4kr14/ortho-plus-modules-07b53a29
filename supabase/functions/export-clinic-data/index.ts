import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('export-clinic-data function started')

interface ExportOptions {
  includeModules: boolean
  includePatients: boolean
  includeHistory: boolean
  includeProntuarios: boolean
  includeAppointments: boolean
  includeFinanceiro: boolean
  format: 'json' | 'csv' | 'excel'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    if (!roles?.some((r) => r.role === 'ADMIN')) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single()

    if (!profile?.clinic_id) {
      return new Response(
        JSON.stringify({ error: 'Clinic not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const clinicId = profile.clinic_id
    const options: ExportOptions = await req.json()

    const exportData: any = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      clinicId: clinicId,
      data: {}
    }

    if (options.includeModules) {
      const { data: clinicModules } = await supabase
        .from('clinic_modules')
        .select('*, module_catalog(*)')
        .eq('clinic_id', clinicId)
      exportData.data.modules = clinicModules
    }

    if (options.includePatients) {
      const { data: patients } = await supabase
        .from('prontuarios')
        .select('id, patient_id, clinic_id, created_at, updated_at')
        .eq('clinic_id', clinicId)
      exportData.data.patients = patients
      exportData.data.patientCount = patients?.length || 0
    }

    if (options.includeHistory) {
      const { data: historico } = await supabase
        .from('historico_clinico')
        .select('*')
        .in('prontuario_id', 
          (await supabase
            .from('prontuarios')
            .select('id')
            .eq('clinic_id', clinicId)
          ).data?.map(p => p.id) || []
        )
      exportData.data.historicoClinico = historico
    }

    if (options.includeProntuarios) {
      const { data: prontuarios } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('clinic_id', clinicId)

      const { data: odontogramas } = await supabase
        .from('odontograma_teeth')
        .select('*')
        .in('prontuario_id', prontuarios?.map(p => p.id) || [])

      exportData.data.prontuarios = prontuarios
      exportData.data.odontogramas = odontogramas
    }

    if (options.includeAppointments) {
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('clinic_id', clinicId)
      exportData.data.appointments = appointments
    }

    if (options.includeFinanceiro) {
      const { data: contasReceber } = await supabase
        .from('contas_receber')
        .select('*')
        .eq('clinic_id', clinicId)

      const { data: contasPagar } = await supabase
        .from('contas_pagar')
        .select('*')
        .eq('clinic_id', clinicId)

      exportData.data.financeiro = { contasReceber, contasPagar }
    }

    await supabase.from('audit_logs').insert({
      clinic_id: clinicId,
      user_id: user.id,
      action: 'DATA_EXPORT',
      details: { options, recordsExported: {
        modules: exportData.data.modules?.length || 0,
        patients: exportData.data.patientCount || 0,
        historico: exportData.data.historicoClinico?.length || 0,
        prontuarios: exportData.data.prontuarios?.length || 0,
        appointments: exportData.data.appointments?.length || 0
      }}
    })

    return new Response(
      JSON.stringify(exportData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in export-clinic-data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
