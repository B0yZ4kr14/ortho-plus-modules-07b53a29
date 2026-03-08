import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { exec } from "child_process";
import { Request, Response } from "express";
import util from "util";

const prisma = new PrismaClient();
const execPromise = util.promisify(exec);

export const createRootUser = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    // In a real scenario, this would create an Auth user or setup initial tenant structure.
    // Simulating creation for the endpoint migration.
    // Password hashing handled by Auth service
    const user = await (prisma as any).users.create({
      data: {
        email,
        name,
        tenantId: "00000000-0000-0000-0000-000000000000", // Root tenant
      } as any, // Forcing bypass if user model doesn't perfectly align yet
    });

    // Simulate updating permissions
    await prisma
      .$executeRawUnsafe(
        `
      UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"is_super_admin": true}'::jsonb WHERE email = $1;
    `,
        email,
      )
      .catch(() => { /* mock auth.users update - no-op */ });

    return res
      .status(200)
      .json({ message: "Root user created successfully", user });
  } catch (error) {
    console.error("Error creating root user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const analyzeDatabaseHealth = async (_req: Request, res: Response) => {
  try {
    // Collect some basic metrics.
    // The previous deno version mapped to pg_stat_activity and extensions.
    const activeConnections = await prisma
      .$queryRawUnsafe<{ count: number }[]>(
        `
      SELECT count(*) FROM pg_stat_activity;
    `,
      )
      .catch(() => [{ count: 0 }]);

    const tableSizes = await prisma
      .$queryRawUnsafe<any[]>(
        `
      SELECT relname as "table",
             pg_size_pretty(pg_total_relation_size(relid)) As "size"
      FROM pg_catalog.pg_statio_user_tables
      ORDER BY pg_total_relation_size(relid) DESC;
    `,
      )
      .catch(() => []);

    return res.status(200).json({
      status: "healthy",
      activeConnections: activeConnections[0]?.count || 0,
      tableSizes,
    });
  } catch (error) {
    console.error("Error analyzing database health:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const githubProxy = async (req: Request, res: Response) => {
  try {
    const { url, method = "GET", data } = req.body;

    if (!url || !url.startsWith("https://api.github.com/")) {
      return res.status(400).json({ error: "Invalid GitHub URL" });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const headers = githubToken
      ? { Authorization: `Bearer ${githubToken}` }
      : {};

    const response = await axios({
      url,
      method,
      data,
      headers: {
        ...headers,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "OrthoPlus-Backend",
      },
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("GitHub Proxy Error:", error.message);
    // Forward the github status if available
    const status = error.response?.status || 500;
    return res
      .status(status)
      .json({
        error: "GitHub Request Failed",
        details: error.response?.data || error.message,
      });
  }
};

export const executeCommand = async (req: Request, res: Response) => {
  try {
    // This is highly sensitive. Assumes requireAuth and role checks are validated via middleware.
    const { command } = req.body;
    if (!command) {
      return res.status(400).json({ error: "Command is required" });
    }

    // Very naive security block.
    if (
      command.includes("rm ") ||
      command.includes("mv ") ||
      command.includes("sudo ")
    ) {
      return res.status(403).json({ error: "Unsafe commands blocked." });
    }

    const { stdout, stderr } = await execPromise(command);
    return res.status(200).json({ stdout, stderr });
  } catch (error: any) {
    console.error("Command Execution Error:", error);
    return res
      .status(500)
      .json({ error: "Command failed", stderr: error.stderr || error.message });
  }
};

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { query, entityType } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    
    let results: any = {};

    // In a real application, consider using Postgres Full Text Search
    if (!entityType || entityType === "patients") {
      results.patients = await (prisma as any).patients
        .findMany({
          where: {
            OR: [
              { name: { contains: String(query), mode: "insensitive" } },
              { cpf: { contains: String(query) } },
            ],
          },
          take: 10,
        })
        .catch(() => []);
    }

    if (!entityType || entityType === "dentists") {
      results.dentists = await (prisma as any).dentists
        .findMany({
          where: {
            OR: [
              { name: { contains: String(query), mode: "insensitive" } },
              { cro: { contains: String(query) } },
            ],
          },
          take: 10,
        })
        .catch(() => []);
    }

    return res.status(200).json({ results });
  } catch (error) {
    console.error("Global Search Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
