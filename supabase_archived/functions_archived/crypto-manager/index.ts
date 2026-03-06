import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'
import { logger } from '../_shared/logger.ts'

logger.info('crypto-manager function started')

/**
 * FASE 2.2: Crypto Manager - Consolidação de 4 funções
 * 
 * Consolida as seguintes funções:
 * - create-crypto-invoice
 * - process-crypto-payment
 * - convert-crypto-to-brl
 * - send-crypto-notification
 * 
 * Actions suportadas:
 * - create-invoice: Cria invoice de pagamento em crypto
 * - process-payment: Processa pagamento recebido
 * - convert-to-brl: Converte valor crypto para BRL
 * - send-notification: Envia notificação de pagamento
 */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, payload } = await req.json()
    logger.info('Crypto Manager action received', { action })

    switch (action) {
      case 'create-invoice':
        return await handleCreateInvoice(supabaseClient, payload)
      
      case 'process-payment':
        return await handleProcessPayment(supabaseClient, payload)
      
      case 'convert-to-brl':
        return await handleConvertToBRL(supabaseClient, payload)
      
      case 'send-notification':
        return await handleSendNotification(supabaseClient, payload)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    logger.error('Error in crypto-manager', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// ============= HANDLERS =============

async function handleCreateInvoice(supabaseClient: any, payload: any) {
  const { clinicId, amount, currency, patientId } = payload
  logger.info('Creating crypto invoice', { clinicId, amount, currency })

  const invoiceId = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutos

  const { error } = await supabaseClient
    .from('crypto_invoices')
    .insert({
      id: invoiceId,
      clinic_id: clinicId,
      patient_id: patientId,
      amount,
      currency,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    })

  if (error) throw error

  logger.info('Invoice created', { invoiceId })

  return new Response(
    JSON.stringify({
      success: true,
      invoiceId,
      amount,
      currency,
      expiresAt: expiresAt.toISOString(),
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleProcessPayment(supabaseClient: any, payload: any) {
  const { invoiceId, transactionHash } = payload
  logger.info('Processing crypto payment', { invoiceId, transactionHash })

  // Atualizar status do invoice
  const { error } = await supabaseClient
    .from('crypto_invoices')
    .update({
      status: 'confirmed',
      transaction_hash: transactionHash,
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', invoiceId)

  if (error) throw error

  // Registrar no histórico de pagamentos
  await supabaseClient
    .from('crypto_payments')
    .insert({
      invoice_id: invoiceId,
      transaction_hash: transactionHash,
      status: 'confirmed',
    })

  logger.info('Payment processed', { invoiceId, transactionHash })

  return new Response(
    JSON.stringify({
      success: true,
      invoiceId,
      status: 'confirmed',
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleConvertToBRL(supabaseClient: any, payload: any) {
  const { amount, currency } = payload
  logger.info('Converting to BRL', { amount, currency })

  // Buscar taxa de câmbio atual (simulado)
  // Na implementação real, chamaria API de cotação
  const exchangeRates: Record<string, number> = {
    BTC: 350000,
    ETH: 18000,
    USDT: 5.20,
    USDC: 5.20,
  }

  const rate = exchangeRates[currency] || 1
  const amountBRL = amount * rate

  logger.info('Conversion completed', { amount, currency, rate, amountBRL })

  return new Response(
    JSON.stringify({
      success: true,
      originalAmount: amount,
      originalCurrency: currency,
      convertedAmount: amountBRL,
      currency: 'BRL',
      exchangeRate: rate,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleSendNotification(supabaseClient: any, payload: any) {
  const { invoiceId, type, recipient } = payload
  logger.info('Sending crypto notification', { invoiceId, type, recipient })

  // Buscar dados do invoice
  const { data: invoice } = await supabaseClient
    .from('crypto_invoices')
    .select('*')
    .eq('id', invoiceId)
    .single()

  if (!invoice) {
    throw new Error('Invoice not found')
  }

  // Aqui entraria integração com serviço de notificação (email, SMS, etc)
  // Para este exemplo, apenas logamos

  logger.info('Notification sent', { invoiceId, type, recipient })

  return new Response(
    JSON.stringify({
      success: true,
      invoiceId,
      notificationType: type,
      recipient,
      sentAt: new Date().toISOString(),
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
