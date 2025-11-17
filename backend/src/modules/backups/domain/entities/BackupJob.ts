/**
 * BackupJob Entity
 * Representa um job de backup agendado ou manual
 */

export type BackupType = 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL';
export type BackupStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type BackupDestination = 'LOCAL' | 'S3' | 'GCS' | 'AZURE' | 'STORJ';

export interface BackupJobProps {
  id: string;
  clinicId: string;
  type: BackupType;
  destination: BackupDestination;
  status: BackupStatus;
  scheduledAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  sizeBytes: number | null;
  checksumMd5: string | null;
  checksumSha256: string | null;
  compressionRatio: number | null;
  errorMessage: string | null;
  retentionDays: number;
  isEncrypted: boolean;
  metadata: Record<string, any>;
}

export class BackupJob {
  constructor(private props: BackupJobProps) {}

  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get type(): BackupType {
    return this.props.type;
  }

  get status(): BackupStatus {
    return this.props.status;
  }

  get destination(): BackupDestination {
    return this.props.destination;
  }

  start(): void {
    if (this.props.status !== 'PENDING') {
      throw new Error('Backup já foi iniciado');
    }
    this.props.status = 'IN_PROGRESS';
    this.props.startedAt = new Date();
  }

  complete(sizeBytes: number, checksumMd5: string, checksumSha256: string): void {
    if (this.props.status !== 'IN_PROGRESS') {
      throw new Error('Backup não está em andamento');
    }
    this.props.status = 'COMPLETED';
    this.props.completedAt = new Date();
    this.props.sizeBytes = sizeBytes;
    this.props.checksumMd5 = checksumMd5;
    this.props.checksumSha256 = checksumSha256;

    if (this.props.startedAt) {
      const durationMs = this.props.completedAt.getTime() - this.props.startedAt.getTime();
      this.props.metadata.durationMs = durationMs;
    }
  }

  fail(errorMessage: string): void {
    this.props.status = 'FAILED';
    this.props.completedAt = new Date();
    this.props.errorMessage = errorMessage;
  }

  isExpired(): boolean {
    if (!this.props.completedAt) return false;
    const expirationDate = new Date(this.props.completedAt);
    expirationDate.setDate(expirationDate.getDate() + this.props.retentionDays);
    return new Date() > expirationDate;
  }

  getDurationMs(): number | null {
    if (!this.props.startedAt || !this.props.completedAt) return null;
    return this.props.completedAt.getTime() - this.props.startedAt.getTime();
  }

  toJSON(): BackupJobProps {
    return { ...this.props };
  }
}
