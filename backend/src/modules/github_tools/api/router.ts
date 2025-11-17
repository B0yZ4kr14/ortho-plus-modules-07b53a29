/**
 * GitHub Tools Module Router
 */

import { Router } from 'express';
import { GitHubToolsController } from './GitHubToolsController';

export function createGitHubToolsRouter(): Router {
  const router = Router();
  const controller = new GitHubToolsController();

  router.get('/repositories', (req, res) => controller.listRepositories(req, res));
  router.post('/repositories', (req, res) => controller.connectRepository(req, res));
  router.get('/repositories/:repoId/branches', (req, res) => controller.getBranches(req, res));
  router.get('/repositories/:repoId/pull-requests', (req, res) => controller.getPullRequests(req, res));
  router.get('/repositories/:repoId/workflows', (req, res) => controller.getWorkflows(req, res));

  return router;
}
