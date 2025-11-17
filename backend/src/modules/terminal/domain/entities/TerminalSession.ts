/**
 * TerminalSession Entity
 * Representa uma sessão de terminal web shell
 */

export type SessionStatus = 'ACTIVE' | 'IDLE' | 'TERMINATED';

export interface TerminalSessionProps {
  id: string;
  userId: string;
  clinicId: string;
  status: SessionStatus;
  startedAt: Date;
  lastActivityAt: Date;
  terminatedAt: Date | null;
  commandsExecuted: number;
  ipAddress: string;
  userAgent: string;
}

export class TerminalSession {
  private static readonly IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos

  constructor(private props: TerminalSessionProps) {}

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get status(): SessionStatus {
    return this.props.status;
  }

  get commandsExecuted(): number {
    return this.props.commandsExecuted;
  }

  updateActivity(): void {
    this.props.lastActivityAt = new Date();
    if (this.props.status === 'IDLE') {
      this.props.status = 'ACTIVE';
    }
  }

  incrementCommandCount(): void {
    this.props.commandsExecuted += 1;
    this.updateActivity();
  }

  terminate(): void {
    this.props.status = 'TERMINATED';
    this.props.terminatedAt = new Date();
  }

  isIdle(): boolean {
    const idleThreshold = new Date(Date.now() - TerminalSession.IDLE_TIMEOUT_MS);
    return this.props.lastActivityAt < idleThreshold && this.props.status !== 'TERMINATED';
  }

  checkAndUpdateIdleStatus(): void {
    if (this.isIdle() && this.props.status === 'ACTIVE') {
      this.props.status = 'IDLE';
    }
  }

  getDurationMs(): number {
    const endTime = this.props.terminatedAt || new Date();
    return endTime.getTime() - this.props.startedAt.getTime();
  }

  toJSON(): TerminalSessionProps {
    return { ...this.props };
  }
}
