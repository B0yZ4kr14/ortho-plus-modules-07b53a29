import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, teleconsultaId, channelName, uid } = await req.json();

    const AGORA_APP_ID = Deno.env.get('AGORA_APP_ID') || 'demo-app-id';
    const AGORA_CUSTOMER_ID = Deno.env.get('AGORA_CUSTOMER_ID');
    const AGORA_CUSTOMER_SECRET = Deno.env.get('AGORA_CUSTOMER_SECRET');

    console.log('Agora Recording request:', { action, teleconsultaId, channelName });

    if (action === 'start') {
      // Start Cloud Recording
      if (!AGORA_CUSTOMER_ID || !AGORA_CUSTOMER_SECRET) {
        console.log('Agora credentials not configured, simulating recording start');
        
        // Simulate recording start
        const mockResourceId = `resource-${Date.now()}`;
        const mockSid = `sid-${Date.now()}`;

        // Update teleconsulta with recording info
        const { error: updateError } = await supabase
          .from('teleconsultas')
          .update({ 
            recording_resource_id: mockResourceId,
            recording_sid: mockSid,
            recording_started_at: new Date().toISOString(),
          })
          .eq('id', teleconsultaId);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({
            success: true,
            resourceId: mockResourceId,
            sid: mockSid,
            message: 'Recording started (simulated)',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Real Agora.io Cloud Recording API calls
      // Step 1: Acquire resource
      const acquireUrl = `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/acquire`;
      const acquireResponse = await fetch(acquireUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${AGORA_CUSTOMER_ID}:${AGORA_CUSTOMER_SECRET}`)}`,
        },
        body: JSON.stringify({
          cname: channelName,
          uid: uid.toString(),
          clientRequest: {
            resourceExpiredHour: 24,
          },
        }),
      });

      if (!acquireResponse.ok) {
        throw new Error(`Failed to acquire resource: ${await acquireResponse.text()}`);
      }

      const acquireData = await acquireResponse.json();
      const resourceId = acquireData.resourceId;

      // Step 2: Start recording
      const startUrl = `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/mode/mix/start`;
      const startResponse = await fetch(startUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${AGORA_CUSTOMER_ID}:${AGORA_CUSTOMER_SECRET}`)}`,
        },
        body: JSON.stringify({
          cname: channelName,
          uid: uid.toString(),
          clientRequest: {
            recordingConfig: {
              maxIdleTime: 30,
              streamTypes: 2, // Audio + Video
              channelType: 0, // Communication profile
              videoStreamType: 0, // High stream
              subscribeAudioUids: ['#allstream#'],
              subscribeVideoUids: ['#allstream#'],
            },
            storageConfig: {
              vendor: 1, // Agora S3
              region: 0,
              bucket: 'agora-recording',
              accessKey: AGORA_CUSTOMER_ID,
              secretKey: AGORA_CUSTOMER_SECRET,
              fileNamePrefix: [`teleconsulta-${teleconsultaId}`],
            },
          },
        }),
      });

      if (!startResponse.ok) {
        throw new Error(`Failed to start recording: ${await startResponse.text()}`);
      }

      const startData = await startResponse.json();
      const sid = startData.sid;

      // Update teleconsulta with recording info
      const { error: updateError } = await supabase
        .from('teleconsultas')
        .update({ 
          recording_resource_id: resourceId,
          recording_sid: sid,
          recording_started_at: new Date().toISOString(),
        })
        .eq('id', teleconsultaId);

      if (updateError) throw updateError;

      console.log('Recording started successfully:', { resourceId, sid });

      return new Response(
        JSON.stringify({
          success: true,
          resourceId,
          sid,
          message: 'Recording started successfully',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } else if (action === 'stop') {
      // Stop Cloud Recording
      const { data: teleconsulta, error: fetchError } = await supabase
        .from('teleconsultas')
        .select('recording_resource_id, recording_sid')
        .eq('id', teleconsultaId)
        .single();

      if (fetchError) throw fetchError;

      const resourceId = teleconsulta.recording_resource_id;
      const sid = teleconsulta.recording_sid;

      if (!resourceId || !sid) {
        throw new Error('Recording not found for this teleconsulta');
      }

      if (!AGORA_CUSTOMER_ID || !AGORA_CUSTOMER_SECRET) {
        console.log('Agora credentials not configured, simulating recording stop');
        
        // Update teleconsulta
        const { error: updateError } = await supabase
          .from('teleconsultas')
          .update({ 
            recording_stopped_at: new Date().toISOString(),
          })
          .eq('id', teleconsultaId);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Recording stopped (simulated)',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Real Agora.io Cloud Recording stop
      const stopUrl = `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`;
      const stopResponse = await fetch(stopUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${AGORA_CUSTOMER_ID}:${AGORA_CUSTOMER_SECRET}`)}`,
        },
        body: JSON.stringify({
          cname: channelName,
          uid: uid.toString(),
          clientRequest: {},
        }),
      });

      if (!stopResponse.ok) {
        throw new Error(`Failed to stop recording: ${await stopResponse.text()}`);
      }

      const stopData = await stopResponse.json();

      // Update teleconsulta
      const { error: updateError } = await supabase
        .from('teleconsultas')
        .update({ 
          recording_stopped_at: new Date().toISOString(),
          recording_file_list: stopData.serverResponse?.fileList || [],
        })
        .eq('id', teleconsultaId);

      if (updateError) throw updateError;

      console.log('Recording stopped successfully');

      return new Response(
        JSON.stringify({
          success: true,
          fileList: stopData.serverResponse?.fileList || [],
          message: 'Recording stopped successfully',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    throw new Error('Invalid action. Use "start" or "stop"');

  } catch (error) {
    console.error('Error in agora-recording:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
