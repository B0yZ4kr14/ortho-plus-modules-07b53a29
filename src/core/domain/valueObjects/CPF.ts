/**
 * CPF Value Object
 * Brazilian tax identification with validation and formatting
 */
export class CPF {
  private readonly value: string;

  private constructor(cpf: string) {
    this.value = CPF.clean(cpf);
  }

  static create(cpf: string): CPF {
    if (!CPF.isValid(cpf)) {
      throw new Error('CPF inválido');
    }
    return new CPF(cpf);
  }

  static clean(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  static isValid(cpf: string): boolean {
    const cleaned = CPF.clean(cpf);

    // Check length
    if (cleaned.length !== 11) {
      return false;
    }

    // Check known invalid CPFs (all same digit)
    if (/^(\d)\1{10}$/.test(cleaned)) {
      return false;
    }

    // Validate check digits
    let sum = 0;
    let remainder;

    // First check digit
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }
    if (remainder !== parseInt(cleaned.substring(9, 10))) {
      return false;
    }

    // Second check digit
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }
    if (remainder !== parseInt(cleaned.substring(10, 11))) {
      return false;
    }

    return true;
  }

  getValue(): string {
    return this.value;
  }

  getFormatted(): string {
    return `${this.value.substring(0, 3)}.${this.value.substring(3, 6)}.${this.value.substring(6, 9)}-${this.value.substring(9, 11)}`;
  }

  equals(other: CPF): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.getFormatted();
  }
}
