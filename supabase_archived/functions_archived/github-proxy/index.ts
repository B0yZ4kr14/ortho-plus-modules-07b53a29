import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('github-proxy function started')

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

    // Verificar se é ADMIN
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

    const { action } = await req.json()

    // Retornar dados mock de GitHub (em produção, integrar com GitHub API)
    const mockData = {
      commits: [
        {
          sha: 'a1b2c3d',
          message: 'feat: Implement enterprise admin panel',
          author: 'Dev Team',
          date: '2025-01-15T10:30:00Z',
          branch: 'main'
        },
        {
          sha: 'e4f5g6h',
          message: 'fix: Resolve backup scheduling issue',
          author: 'Dev Team',
          date: '2025-01-15T09:15:00Z',
          branch: 'main'
        },
        {
          sha: 'i7j8k9l',
          message: 'refactor: Optimize database queries',
          author: 'Dev Team',
          date: '2025-01-14T16:45:00Z',
          branch: 'develop'
        }
      ],
      branches: [
        { name: 'main', protected: true, last_commit: '2025-01-15T10:30:00Z' },
        { name: 'develop', protected: false, last_commit: '2025-01-15T08:20:00Z' },
        { name: 'feature/crypto-payments', protected: false, last_commit: '2025-01-14T14:10:00Z' }
      ],
      pull_requests: [
        {
          number: 42,
          title: 'Add real-time crypto rates',
          state: 'open',
          author: 'dev1',
          created_at: '2025-01-14T10:00:00Z',
          base: 'main',
          head: 'feature/crypto-payments'
        }
      ],
      workflows: [
        {
          name: 'CI/CD Pipeline',
          status: 'success',
          last_run: '2025-01-15T10:35:00Z',
          duration: '3m 24s'
        },
        {
          name: 'Deploy to Production',
          status: 'success',
          last_run: '2025-01-15T10:40:00Z',
          duration: '5m 12s'
        }
      ]
    }

    // Log do evento
    await supabase.from('github_events').insert({
      clinic_id: profile.clinic_id,
      event_type: action || 'VIEW',
      event_data: mockData,
      triggered_by: user.id
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: mockData,
        repository: 'ortho-plus/main',
        last_updated: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in github-proxy:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
