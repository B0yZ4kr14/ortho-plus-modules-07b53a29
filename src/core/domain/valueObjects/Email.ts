/**
 * Email Value Object
 * Immutable email with RFC 5322 validation
 */
export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email.toLowerCase().trim();
  }

  static create(email: string): Email {
    const cleanedEmail = email.trim();
    if (!Email.isValid(cleanedEmail)) {
      throw new Error("Email inválido");
    }
    return new Email(cleanedEmail);
  }

  static isValid(email: string): boolean {
    if (!email || email.trim().length === 0) {
      return false;
    }
    const cleaned = email.trim();

    // RFC 5322 simplified regex
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(cleaned)) {
      return false;
    }

    // Additional checks
    const [local, domain] = cleaned.split("@");

    if (!local || !domain) {
      return false;
    }

    if (local.length > 64 || domain.length > 255) {
      return false;
    }

    return true;
  }

  getValue(): string {
    return this.value;
  }

  getDomain(): string {
    return this.value.split("@")[1];
  }

  getLocalPart(): string {
    return this.value.split("@")[0];
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
