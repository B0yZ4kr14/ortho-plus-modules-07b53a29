/**
 * GitHubToolsController
 * API para integração com GitHub (repos, branches, PRs, workflows)
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { GitHubRepository } from '../domain/entities/GitHubRepository';

export class GitHubToolsController {
  async listRepositories(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      // Mock data
      const repos = [
        new GitHubRepository({
          id: crypto.randomUUID(),
          clinicId,
          repoName: 'ortho-plus-main',
          repoUrl: 'https://github.com/clinic/ortho-plus-main',
          defaultBranch: 'main',
          isPrivate: true,
          accessToken: 'encrypted_token',
          webhookSecret: 'encrypted_secret',
          lastSyncAt: new Date(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      res.json({
        repositories: repos.map(r => r.toJSON()),
      });
    } catch (error) {
      console.error('Error listing repositories:', error);
      res.status(500).json({ error: 'Erro ao listar repositórios' });
    }
  }

  async connectRepository(req: Request, res: Response): Promise<void> {
    try {
      const schema = z.object({
        repoName: z.string().min(1),
        repoUrl: z.string().url(),
        accessToken: z.string().min(10),
        defaultBranch: z.string().default('main'),
      });

      const data = schema.parse(req.body);
      const clinicId = req.user?.clinicId;

      if (!clinicId || req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      const repo = new GitHubRepository({
        id: crypto.randomUUID(),
        clinicId,
        repoName: data.repoName,
        repoUrl: data.repoUrl,
        defaultBranch: data.defaultBranch,
        isPrivate: true,
        accessToken: data.accessToken, // Em produção, criptografar
        webhookSecret: null,
        lastSyncAt: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.status(201).json({
        repository: repo.toJSON(),
        message: 'Repositório conectado com sucesso',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Dados inválidos', details: error.errors });
        return;
      }
      console.error('Error connecting repository:', error);
      res.status(500).json({ error: 'Erro ao conectar repositório' });
    }
  }

  async getBranches(req: Request, res: Response): Promise<void> {
    try {
      const { repoId } = req.params;
      const clinicId = req.user?.clinicId;

      if (!clinicId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      // Mock branches
      const branches = [
        { name: 'main', lastCommit: 'feat: add patient module', lastUpdated: new Date() },
        { name: 'develop', lastCommit: 'fix: resolve bug in billing', lastUpdated: new Date() },
        { name: 'feature/new-dashboard', lastCommit: 'wip: dashboard redesign', lastUpdated: new Date() },
      ];

      res.json({ repoId, branches });
    } catch (error) {
      console.error('Error getting branches:', error);
      res.status(500).json({ error: 'Erro ao obter branches' });
    }
  }

  async getPullRequests(req: Request, res: Response): Promise<void> {
    try {
      const { repoId } = req.params;
      const clinicId = req.user?.clinicId;

      if (!clinicId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      // Mock PRs
      const pullRequests = [
        {
          id: 123,
          title: 'Add backup module',
          state: 'OPEN',
          author: 'dev-team',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          mergedAt: null,
        },
        {
          id: 122,
          title: 'Fix crypto integration',
          state: 'MERGED',
          author: 'dev-team',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          mergedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      ];

      res.json({ repoId, pullRequests });
    } catch (error) {
      console.error('Error getting pull requests:', error);
      res.status(500).json({ error: 'Erro ao obter pull requests' });
    }
  }

  async getWorkflows(req: Request, res: Response): Promise<void> {
    try {
      const { repoId } = req.params;
      const clinicId = req.user?.clinicId;

      if (!clinicId) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      // Mock workflows
      const workflows = [
        {
          id: 1,
          name: 'CI/CD Pipeline',
          status: 'SUCCESS',
          lastRun: new Date(),
          duration: 180,
        },
        {
          id: 2,
          name: 'Deploy to Production',
          status: 'SUCCESS',
          lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
          duration: 300,
        },
      ];

      res.json({ repoId, workflows });
    } catch (error) {
      console.error('Error getting workflows:', error);
      res.status(500).json({ error: 'Erro ao obter workflows' });
    }
  }
}
