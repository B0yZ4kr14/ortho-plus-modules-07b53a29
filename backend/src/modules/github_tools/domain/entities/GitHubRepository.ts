/**
 * GitHubRepository Entity
 * Representa um repositório GitHub integrado
 */

export interface GitHubRepositoryProps {
  id: string;
  clinicId: string;
  repoName: string;
  repoUrl: string;
  defaultBranch: string;
  isPrivate: boolean;
  accessToken: string; // Deve ser criptografado
  webhookSecret: string | null;
  lastSyncAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class GitHubRepository {
  constructor(private props: GitHubRepositoryProps) {}

  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get repoName(): string {
    return this.props.repoName;
  }

  get repoUrl(): string {
    return this.props.repoUrl;
  }

  get defaultBranch(): string {
    return this.props.defaultBranch;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  updateSync(): void {
    this.props.lastSyncAt = new Date();
    this.props.updatedAt = new Date();
  }

  setWebhookSecret(secret: string): void {
    this.props.webhookSecret = secret;
    this.props.updatedAt = new Date();
  }

  toJSON(): Omit<GitHubRepositoryProps, 'accessToken' | 'webhookSecret'> {
    const { accessToken, webhookSecret, ...rest } = this.props;
    return rest;
  }
}
