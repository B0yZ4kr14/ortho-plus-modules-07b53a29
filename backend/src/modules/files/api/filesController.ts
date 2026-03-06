import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

const prisma = new PrismaClient();

interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  folderId?: string;
}

interface DropboxConfig {
  accessToken: string;
  folder?: string;
}

export class FilesController {
  // Generic file upload handle mapped downstream
  async uploadFile(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<any> {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      // Multer handled it:
      const uploadedInfo = {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`, // Adjust for static serving
        mimetype: req.file.mimetype,
        size: req.file.size,
      };

      res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        data: uploadedInfo,
      });
    } catch (error) {
      console.error("[FilesController] uploadFile error:", error);
      res.status(500).json({ error: "File upload failed" });
    }
  }

  // Edge Function: upload-to-cloud
  async uploadBackupToCloud(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<any> {
    try {
      const { backupId, provider, config } = req.body;

      if (!backupId || !provider || !config) {
        return res.status(400).json({
          error: "Missing required fields: backupId, provider, config",
        });
      }

      // Get backup data
      const backup = await prisma.backup_history.findUnique({
        where: { id: backupId },
      });

      if (!backup) {
        return res.status(404).json({ error: "Backup not found" });
      }

      // Original logic extracted metadata. In Express we do the same
      const dataToUpload = JSON.stringify(backup.metadata);
      const fileName = `orthoplus_backup_${backup.clinic_id}_${new Date().toISOString().replace(/:/g, "-")}.json`;

      let uploadUrl: string;

      switch (provider) {
        case "s3":
          uploadUrl = await this.uploadToS3(
            dataToUpload,
            fileName,
            config as S3Config,
          );
          break;
        case "google_drive":
          uploadUrl = await this.uploadToGoogleDrive(
            dataToUpload,
            fileName,
            config as GoogleDriveConfig,
          );
          break;
        case "dropbox":
          uploadUrl = await this.uploadToDropbox(
            dataToUpload,
            fileName,
            config as DropboxConfig,
          );
          break;
        default:
          return res.status(400).json({ error: "Unsupported provider" });
      }

      // Update backup record with cloud URL
      await prisma.backup_history.update({
        where: { id: backupId },
        data: {
          file_path: uploadUrl,
          metadata: {
            ...(typeof backup.metadata === "object" && backup.metadata !== null
              ? backup.metadata
              : {}),
            cloudProvider: provider,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      return res.status(200).json({
        success: true,
        uploadUrl,
        provider,
      });
    } catch (error) {
      console.error("[FilesController] uploadBackupToCloud error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  private async uploadToS3(
    data: string,
    fileName: string,
    config: S3Config,
  ): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const date = new Date().toISOString().split("T")[0].replace(/-/g, "");

    const url = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${fileName}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-amz-date": date,
      },
      body: dataBuffer as any, // Note: node fetch takes buffer or string
    });

    if (!response.ok) {
      throw new Error(`S3 upload failed: ${response.statusText}`);
    }

    return url;
  }

  private async uploadToGoogleDrive(
    data: string,
    fileName: string,
    config: GoogleDriveConfig,
  ): Promise<string> {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: config.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to refresh Google Drive token");
    }

    const { access_token } = (await tokenResponse.json()) as any;

    const metadata = {
      name: fileName,
      parents: config.folderId ? [config.folderId] : [],
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" }),
    );
    form.append("file", new Blob([data], { type: "application/json" }));

    const uploadResponse = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        body: form as any,
      },
    );

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload to Google Drive");
    }

    const result = (await uploadResponse.json()) as any;
    return `https://drive.google.com/file/d/${result.id}/view`;
  }

  private async uploadToDropbox(
    data: string,
    fileName: string,
    config: DropboxConfig,
  ): Promise<string> {
    const path = config.folder
      ? `/${config.folder}/${fileName}`
      : `/${fileName}`;

    const response = await fetch(
      "https://content.dropboxapi.com/2/files/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Dropbox-API-Arg": JSON.stringify({
            path,
            mode: "add",
            autorename: true,
            mute: false,
          }),
          "Content-Type": "application/octet-stream",
        },
        body: data,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to upload to Dropbox");
    }

    const result = (await response.json()) as any;
    return result.path_display;
  }
}
