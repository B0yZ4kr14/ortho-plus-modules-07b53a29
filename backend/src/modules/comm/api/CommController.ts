import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class CommController {
  /**
   * Port of generate-video-token Edge Function
   */
  async generateVideoToken(req: Request, res: Response) {
    try {
      const { teleconsultaId } = req.body;

      if (!teleconsultaId) {
        return res.status(400).json({ error: "teleconsultaId is required" });
      }

      // Get teleconsulta details
      // Note: Assuming 'teleconsultas' model exists in Prisma schema.
      // If not fully typed, we use type assertions where necessary.
      const teleconsultaInfo = await (prisma as any).teleconsultas.findUnique({
        where: { id: teleconsultaId },
      });

      if (!teleconsultaInfo) {
        return res.status(404).json({ error: "Teleconsulta not found" });
      }

      const AGORA_APP_ID = process.env.AGORA_APP_ID || "demo-app-id";
      const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

      const channelName = `teleconsulta-${teleconsultaId}`;
      const uid = Math.floor(Math.random() * 100000);
      const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour

      let token: string;

      if (AGORA_APP_CERTIFICATE) {
        // In production, use Agora RTC SDK to generate real token
        // For now, mock token
        token = `mock-token-${Date.now()}`;
      } else {
        // Development mode - no certificate needed
        token = `dev-token-${Date.now()}`;
      }

      const backendUrl = process.env.BACKEND_URL || "http://localhost:3000"; // Should ideally be frontend URL or similar depending on original "supabaseUrl" usage
      const salaUrl = `${backendUrl}/teleconsulta/sala/${teleconsultaId}`;

      // Update teleconsulta with link_sala
      await (prisma as any).teleconsultas.update({
        where: { id: teleconsultaId },
        data: { link_sala: salaUrl },
      });

      // Log audit
      // Note: Assuming 'audit_logs' model exists
      await (prisma as any).audit_logs.create({
        data: {
          user_id: teleconsultaInfo.dentist_id,
          clinic_id: teleconsultaInfo.clinic_id,
          action: "TELECONSULTA_STARTED",
          details: {
            teleconsulta_id: teleconsultaId,
            channel_name: channelName,
          },
        },
      });

      return res.json({
        success: true,
        token,
        appId: AGORA_APP_ID,
        channelName,
        uid,
        salaUrl,
        expirationTime,
      });
    } catch (error: any) {
      console.error("Error generating video token:", error);
      return res.status(500).json({ error: error.message || "Unknown error" });
    }
  }

  /**
   * Port of agora-recording Edge Function
   */
  async agoraRecording(req: Request, res: Response) {
    try {
      const { action, teleconsultaId, channelName, uid } = req.body;

      const AGORA_APP_ID = process.env.AGORA_APP_ID || "demo-app-id";
      const AGORA_CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID;
      const AGORA_CUSTOMER_SECRET = process.env.AGORA_CUSTOMER_SECRET;

      console.log("Agora Recording request:", {
        action,
        teleconsultaId,
        channelName,
      });

      if (action === "start") {
        // Start Cloud Recording
        if (!AGORA_CUSTOMER_ID || !AGORA_CUSTOMER_SECRET) {
          console.log(
            "Agora credentials not configured, simulating recording start",
          );

          // Simulate recording start
          const mockResourceId = `resource-${Date.now()}`;
          const mockSid = `sid-${Date.now()}`;

          // Update teleconsulta with recording info
          await (prisma as any).teleconsultas.update({
            where: { id: teleconsultaId },
            data: {
              recording_resource_id: mockResourceId,
              recording_sid: mockSid,
              recording_started_at: new Date(),
            },
          });

          return res.json({
            success: true,
            resourceId: mockResourceId,
            sid: mockSid,
            message: "Recording started (simulated)",
          });
        }

        // Real Agora API implementation omitted for brevity, keeping the stub and fetch logic structure
        try {
          // Step 1: Acquire resource
          const acquireUrl = `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/acquire`;
          const acquireResponse = await fetch(acquireUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${Buffer.from(`${AGORA_CUSTOMER_ID}:${AGORA_CUSTOMER_SECRET}`).toString("base64")}`,
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
            throw new Error(
              `Failed to acquire resource: ${await acquireResponse.text()}`,
            );
          }

          const acquireData = (await acquireResponse.json()) as any;
          const resourceId = acquireData.resourceId;

          // Step 2: Start recording
          const startUrl = `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/mode/mix/start`;
          const startResponse = await fetch(startUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${Buffer.from(`${AGORA_CUSTOMER_ID}:${AGORA_CUSTOMER_SECRET}`).toString("base64")}`,
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
                  subscribeAudioUids: ["#allstream#"],
                  subscribeVideoUids: ["#allstream#"],
                },
                storageConfig: {
                  vendor: 1, // Agora S3
                  region: 0,
                  bucket: "agora-recording",
                  accessKey: AGORA_CUSTOMER_ID,
                  secretKey: AGORA_CUSTOMER_SECRET,
                  fileNamePrefix: [`teleconsulta-${teleconsultaId}`],
                },
              },
            }),
          });

          if (!startResponse.ok) {
            throw new Error(
              `Failed to start recording: ${await startResponse.text()}`,
            );
          }

          const startData = (await startResponse.json()) as any;
          const sid = startData.sid;

          // Update teleconsulta with recording info
          await (prisma as any).teleconsultas.update({
            where: { id: teleconsultaId },
            data: {
              recording_resource_id: resourceId,
              recording_sid: sid,
              recording_started_at: new Date(),
            },
          });

          console.log("Recording started successfully:", { resourceId, sid });

          return res.json({
            success: true,
            resourceId,
            sid,
            message: "Recording started successfully",
          });
        } catch (apiError: any) {
          throw new Error("API call error: " + apiError.message);
        }
      } else if (action === "stop") {
        // Stop Cloud Recording
        const teleconsulta = await (prisma as any).teleconsultas.findUnique({
          where: { id: teleconsultaId },
          select: { recording_resource_id: true, recording_sid: true },
        });

        if (!teleconsulta) {
          return res.status(404).json({ error: "Teleconsulta not found" });
        }

        const resourceId = teleconsulta.recording_resource_id;
        const sid = teleconsulta.recording_sid;

        if (!resourceId || !sid) {
          return res
            .status(400)
            .json({ error: "Recording not found for this teleconsulta" });
        }

        if (!AGORA_CUSTOMER_ID || !AGORA_CUSTOMER_SECRET) {
          console.log(
            "Agora credentials not configured, simulating recording stop",
          );

          await (prisma as any).teleconsultas.update({
            where: { id: teleconsultaId },
            data: {
              recording_stopped_at: new Date(),
            },
          });

          return res.json({
            success: true,
            message: "Recording stopped (simulated)",
          });
        }

        // Real Agora.io Cloud Recording stop
        const stopUrl = `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`;
        const stopResponse = await fetch(stopUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(`${AGORA_CUSTOMER_ID}:${AGORA_CUSTOMER_SECRET}`).toString("base64")}`,
          },
          body: JSON.stringify({
            cname: channelName,
            uid: uid.toString(),
            clientRequest: {},
          }),
        });

        if (!stopResponse.ok) {
          throw new Error(
            `Failed to stop recording: ${await stopResponse.text()}`,
          );
        }

        const stopData = (await stopResponse.json()) as any;

        await (prisma as any).teleconsultas.update({
          where: { id: teleconsultaId },
          data: {
            recording_stopped_at: new Date(),
            recording_file_list: stopData.serverResponse?.fileList || [],
          },
        });

        console.log("Recording stopped successfully");

        return res.json({
          success: true,
          fileList: stopData.serverResponse?.fileList || [],
          message: "Recording stopped successfully",
        });
      }

      return res
        .status(400)
        .json({ error: 'Invalid action. Use "start" or "stop"' });
    } catch (error: any) {
      console.error("Error in agoraRecording:", error);
      return res.status(500).json({ error: error.message || "Unknown error" });
    }
  }
}
