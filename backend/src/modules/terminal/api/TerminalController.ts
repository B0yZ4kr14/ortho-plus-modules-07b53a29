/**
 * TerminalController
 * API para terminal web shell seguro
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { TerminalSession } from '../domain/entities/TerminalSession';

export class TerminalController {
  // Whitelist de comandos permitidos para segurança
  private static readonly ALLOWED_COMMANDS = [
    'ls', 'pwd', 'cat', 'grep', 'tail', 'head', 'wc', 'echo',
    'ps', 'top', 'df', 'du', 'free', 'uptime', 'whoami',
    'git', 'docker', 'npm', 'node', 'psql',
  ];

  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const clinicId = req.user?.clinicId;
      const role = req.user?.role;

      if (!userId || !clinicId || role !== 'ADMIN') {
        res.status(403).json({ error: 'Acesso negado - apenas administradores' });
        return;
      }

      const session = new TerminalSession({
        id: crypto.randomUUID(),
        userId,
        clinicId,
        status: 'ACTIVE',
        startedAt: new Date(),
        lastActivityAt: new Date(),
        terminatedAt: null,
        commandsExecuted: 0,
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });

      res.status(201).json({
        session: session.toJSON(),
        message: 'Sessão de terminal criada com sucesso',
      });
    } catch (error) {
      console.error('Error creating terminal session:', error);
      res.status(500).json({ error: 'Erro ao criar sessão de terminal' });
    }
  }

  async executeCommand(req: Request, res: Response): Promise<void> {
    try {
      const schema = z.object({
        sessionId: z.string().uuid(),
        command: z.string().min(1),
      });

      const { sessionId, command } = schema.parse(req.body);
      const userId = req.user?.id;
      const role = req.user?.role;

      if (!userId || role !== 'ADMIN') {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      // Validar comando contra whitelist
      const commandBase = command.split(' ')[0];
      if (!TerminalController.ALLOWED_COMMANDS.includes(commandBase)) {
        res.status(403).json({
          error: 'Comando não permitido',
          allowedCommands: TerminalController.ALLOWED_COMMANDS,
        });
        return;
      }

      // Mock execution - em produção, executar comando real com restrições
      const output = {
        command,
        stdout: `Mock output for: ${command}`,
        stderr: '',
        exitCode: 0,
        executedAt: new Date(),
      };

      res.json({
        sessionId,
        output,
        message: 'Comando executado com sucesso',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Dados inválidos', details: error.errors });
        return;
      }
      console.error('Error executing command:', error);
      res.status(500).json({ error: 'Erro ao executar comando' });
    }
  }

  async getCommandHistory(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id;

      if (!userId || req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      // Mock history
      const history = [
        { command: 'ls -la', executedAt: new Date(Date.now() - 5 * 60 * 1000), exitCode: 0 },
        { command: 'pwd', executedAt: new Date(Date.now() - 3 * 60 * 1000), exitCode: 0 },
        { command: 'git status', executedAt: new Date(Date.now() - 1 * 60 * 1000), exitCode: 0 },
      ];

      res.json({ sessionId, history });
    } catch (error) {
      console.error('Error getting command history:', error);
      res.status(500).json({ error: 'Erro ao obter histórico' });
    }
  }

  async terminateSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id;

      if (!userId || req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      res.json({
        sessionId,
        terminatedAt: new Date(),
        message: 'Sessão encerrada com sucesso',
      });
    } catch (error) {
      console.error('Error terminating session:', error);
      res.status(500).json({ error: 'Erro ao encerrar sessão' });
    }
  }
}
