import { logger } from "@/infrastructure/logger";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class UsuariosController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;

      const profiles = await (prisma as any).profiles.findMany({
        where: { clinic_id: user.clinicId },
      });

      const authUsers = await (prisma as any)
        .$queryRaw`SELECT id, email, last_sign_in_at FROM auth.users`;

      const usersWithEmail = profiles.map((p: any) => {
        const authUser = (authUsers as any[]).find((u: any) => u.id === p.id);
        return {
          id: p.id,
          email: authUser?.email || "N/A",
          full_name: p.full_name,
          app_role: p.app_role || "MEMBER",
          clinic_id: p.clinic_id,
          avatar_url: p.avatar_url,
          is_active: p.is_active ?? true,
          last_sign_in_at: authUser?.last_sign_in_at,
          created_at: p.created_at,
        };
      });

      res.json(usersWithEmail);
    } catch (error: any) {
      logger.error("Error listing users", { error });
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { email, password, full_name, app_role, is_active } = req.body;

      const hashedPassword = await bcrypt.hash(
        password || `temp${Date.now()}`,
        10,
      );

      const userResult = await (prisma as any).$queryRaw`
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (gen_random_uuid(), ${email}, ${hashedPassword}, NOW(), NOW(), NOW())
        RETURNING id, email
      `;

      const newUserId = (userResult as any[])[0].id;

      await (prisma as any).profiles.create({
        data: {
          id: newUserId,
          clinic_id: user.clinicId,
          full_name,
          app_role,
          is_active,
        },
      });

      res.status(201).json({ id: newUserId });
    } catch (error: any) {
      logger.error("Error creating user", { error });
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { full_name, app_role, is_active, password } = req.body;

      await (prisma as any).profiles.update({
        where: { id },
        data: {
          ...(full_name !== undefined && { full_name }),
          ...(app_role !== undefined && { app_role }),
          ...(is_active !== undefined && { is_active }),
        },
      });

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await (prisma as any).$executeRaw`
          UPDATE auth.users SET encrypted_password = ${hashedPassword}, updated_at = NOW() WHERE id = ${id}::uuid
        `;
      }

      res.json({ success: true });
    } catch (error: any) {
      logger.error("Error updating user", { error });
      res.status(400).json({ error: error.message });
    }
  }

  async toggleActive(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      await (prisma as any).profiles.update({
        where: { id },
        data: { is_active },
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await (prisma as any).profiles.delete({ where: { id } });
      await (prisma as any)
        .$executeRaw`DELETE FROM auth.users WHERE id = ${id}::uuid`;

      res.json({ success: true });
    } catch (error: any) {
      logger.error("Error deleting user", { error });
      res.status(400).json({ error: error.message });
    }
  }

  // Perfil próprio
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { full_name, avatar_url } = req.body;

      await (prisma as any).profiles.update({
        where: { id: user.id },
        data: {
          ...(full_name !== undefined && { full_name }),
          ...(avatar_url !== undefined && { avatar_url }),
        },
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
