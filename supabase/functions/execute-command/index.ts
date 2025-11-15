import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('execute-command function started')

// Whitelist de comandos seguros
const ALLOWED_COMMANDS = [
  'ls', 'pwd', 'whoami', 'date', 'uptime', 'df', 'free', 'top',
  'ps', 'echo', 'cat', 'head', 'tail', 'grep', 'wc', 'hostname',
  'git status', 'git log', 'git branch', 'npm --version', 'node --version'
]

function isCommandAllowed(command: string): boolean {
  const baseCommand = command.trim().split(' ')[0]
  return ALLOWED_COMMANDS.some(allowed => 
    command.startsWith(allowed) || baseCommand === allowed.split(' ')[0]
  )
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

    const { command } = await req.json()

    if (!command || typeof command !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid command' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar whitelist
    if (!isCommandAllowed(command)) {
      await supabase.from('terminal_command_history').insert({
        clinic_id: profile.clinic_id,
        user_id: user.id,
        command,
        output: 'Command not allowed',
        exit_code: 1,
        was_successful: false
      })

      return new Response(
        JSON.stringify({ 
          error: 'Command not allowed',
          output: `Error: "${command}" is not in the whitelist of allowed commands`,
          exitCode: 1
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const startTime = Date.now()
    
    // Executar comando de forma segura
    let output = ''
    let exitCode = 0
    
    try {
      // Simular execução (em produção, usar Deno.run com timeout e sanitização)
      // Por segurança, apenas retornar mensagens simuladas
      output = `[DEMO MODE] Command "${command}" would be executed here.\n\nIn production, this would use:\n- Deno.Command with timeout\n- Sandboxed execution\n- Resource limits\n\nAllowed commands: ${ALLOWED_COMMANDS.join(', ')}`
      exitCode = 0
    } catch (error) {
      output = error instanceof Error ? error.message : String(error)
      exitCode = 1
    }

    const duration = Date.now() - startTime

    // Salvar no histórico
    await supabase.from('terminal_command_history').insert({
      clinic_id: profile.clinic_id,
      user_id: user.id,
      command,
      output,
      exit_code: exitCode,
      duration_ms: duration,
      was_successful: exitCode === 0
    })

    // Log de auditoria
    await supabase.from('audit_logs').insert({
      clinic_id: profile.clinic_id,
      user_id: user.id,
      action: 'TERMINAL_COMMAND_EXECUTED',
      details: {
        command,
        exitCode,
        duration
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        output,
        exitCode,
        duration
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in execute-command:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
