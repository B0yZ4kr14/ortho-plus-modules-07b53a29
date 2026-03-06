/**
 * Headers CORS padronizados para todas as Edge Functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-id',
  'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
};

export const handleCorsPreflightRequest = (): Response => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};
