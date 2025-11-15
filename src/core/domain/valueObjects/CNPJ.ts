/**
 * CNPJ Value Object
 * Brazilian company tax identification with validation and formatting
 */
export class CNPJ {
  private readonly value: string;

  private constructor(cnpj: string) {
    this.value = CNPJ.clean(cnpj);
  }

  static create(cnpj: string): CNPJ {
    if (!CNPJ.isValid(cnpj)) {
      throw new Error('CNPJ inválido');
    }
    return new CNPJ(cnpj);
  }

  static clean(cnpj: string): string {
    return cnpj.replace(/\D/g, '');
  }

  static isValid(cnpj: string): boolean {
    const cleaned = CNPJ.clean(cnpj);

    // Check length
    if (cleaned.length !== 14) {
      return false;
    }

    // Check known invalid CNPJs (all same digit)
    if (/^(\d)\1{13}$/.test(cleaned)) {
      return false;
    }

    // Validate first check digit
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cleaned.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (digit1 !== parseInt(cleaned.charAt(12))) {
      return false;
    }

    // Validate second check digit
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cleaned.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;

    if (digit2 !== parseInt(cleaned.charAt(13))) {
      return false;
    }

    return true;
  }

  getValue(): string {
    return this.value;
  }

  getFormatted(): string {
    return `${this.value.substring(0, 2)}.${this.value.substring(2, 5)}.${this.value.substring(5, 8)}/${this.value.substring(8, 12)}-${this.value.substring(12, 14)}`;
  }

  equals(other: CNPJ): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.getFormatted();
  }
}
