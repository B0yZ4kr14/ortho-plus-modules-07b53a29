/**
 * DatabaseHealth Entity
 * Representa a saúde geral do banco de dados
 */

export interface DatabaseHealthProps {
  id: string;
  clinicId: string;
  connectionPoolSize: number;
  activeConnections: number;
  idleConnections: number;
  slowQueriesCount: number;
  averageQueryTime: number;
  diskUsagePercent: number;
  lastVacuum: Date | null;
  lastAnalyze: Date | null;
  timestamp: Date;
}

export class DatabaseHealth {
  constructor(private props: DatabaseHealthProps) {}

  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get connectionPoolSize(): number {
    return this.props.connectionPoolSize;
  }

  get activeConnections(): number {
    return this.props.activeConnections;
  }

  get slowQueriesCount(): number {
    return this.props.slowQueriesCount;
  }

  get diskUsagePercent(): number {
    return this.props.diskUsagePercent;
  }

  isHealthy(): boolean {
    return (
      this.props.diskUsagePercent < 80 &&
      this.props.activeConnections < this.props.connectionPoolSize * 0.8 &&
      this.props.slowQueriesCount < 10
    );
  }

  needsMaintenance(): boolean {
    const now = new Date();
    const lastVacuum = this.props.lastVacuum?.getTime() || 0;
    const lastAnalyze = this.props.lastAnalyze?.getTime() || 0;
    const dayInMs = 24 * 60 * 60 * 1000;

    return (
      now.getTime() - lastVacuum > 7 * dayInMs ||
      now.getTime() - lastAnalyze > 7 * dayInMs
    );
  }

  toJSON(): DatabaseHealthProps {
    return { ...this.props };
  }
}
