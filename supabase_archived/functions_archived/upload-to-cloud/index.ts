import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('upload-to-cloud function started')

interface S3Config {
  accessKeyId: string
  secretAccessKey: string
  region: string
  bucket: string
}

interface GoogleDriveConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
  folderId?: string
}

interface DropboxConfig {
  accessToken: string
  folder?: string
}

async function uploadToS3(data: string, fileName: string, config: S3Config): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const timestamp = Date.now().toString()
  
  // Simplified S3 signature (in production, use AWS SDK)
  const url = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${fileName}`
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-amz-date': date,
    },
    body: dataBuffer
  })
  
  if (!response.ok) {
    throw new Error(`S3 upload failed: ${response.statusText}`)
  }
  
  return url
}

async function uploadToGoogleDrive(data: string, fileName: string, config: GoogleDriveConfig): Promise<string> {
  // Get access token using refresh token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: 'refresh_token'
    })
  })
  
  if (!tokenResponse.ok) {
    throw new Error('Failed to refresh Google Drive token')
  }
  
  const { access_token } = await tokenResponse.json()
  
  // Upload file
  const metadata = {
    name: fileName,
    parents: config.folderId ? [config.folderId] : []
  }
  
  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', new Blob([data], { type: 'application/json' }))
  
  const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`
    },
    body: form
  })
  
  if (!uploadResponse.ok) {
    throw new Error('Failed to upload to Google Drive')
  }
  
  const result = await uploadResponse.json()
  return `https://drive.google.com/file/d/${result.id}/view`
}

async function uploadToDropbox(data: string, fileName: string, config: DropboxConfig): Promise<string> {
  const path = config.folder ? `/${config.folder}/${fileName}` : `/${fileName}`
  
  const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Dropbox-API-Arg': JSON.stringify({
        path,
        mode: 'add',
        autorename: true,
        mute: false
      }),
      'Content-Type': 'application/octet-stream'
    },
    body: data
  })
  
  if (!response.ok) {
    throw new Error('Failed to upload to Dropbox')
  }
  
  const result = await response.json()
  return result.path_display
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { backupId, provider, config } = await req.json()

    // Get backup data
    const { data: backup, error: backupError } = await supabase
      .from('backup_history')
      .select('*, metadata')
      .eq('id', backupId)
      .single()

    if (backupError || !backup) {
      return new Response(
        JSON.stringify({ error: 'Backup not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For this example, we'll use the metadata as the data to upload
    const dataToUpload = JSON.stringify(backup.metadata)
    const fileName = `orthoplus_backup_${backup.clinic_id}_${new Date().toISOString()}.json`

    let uploadUrl: string

    switch (provider) {
      case 's3':
        uploadUrl = await uploadToS3(dataToUpload, fileName, config as S3Config)
        break
      case 'google_drive':
        uploadUrl = await uploadToGoogleDrive(dataToUpload, fileName, config as GoogleDriveConfig)
        break
      case 'dropbox':
        uploadUrl = await uploadToDropbox(dataToUpload, fileName, config as DropboxConfig)
        break
      default:
        throw new Error('Unsupported provider')
    }

    // Update backup record with cloud URL
    await supabase
      .from('backup_history')
      .update({
        file_path: uploadUrl,
        metadata: {
          ...backup.metadata,
          cloudProvider: provider,
          uploadedAt: new Date().toISOString()
        }
      })
      .eq('id', backupId)

    return new Response(
      JSON.stringify({
        success: true,
        uploadUrl,
        provider
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in upload-to-cloud:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})