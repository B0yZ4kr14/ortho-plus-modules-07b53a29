/**
 * Phone Value Object
 * Brazilian phone number with validation and formatting
 * Supports both landline (10 digits) and mobile (11 digits)
 */
export class Phone {
  private readonly value: string;

  private constructor(phone: string) {
    this.value = Phone.clean(phone);
  }

  static create(phone: string): Phone {
    if (!Phone.isValid(phone)) {
      throw new Error('Telefone inválido');
    }
    return new Phone(phone);
  }

  static clean(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  static isValid(phone: string): boolean {
    const cleaned = Phone.clean(phone);

    // Brazilian phone: 10 digits (landline) or 11 digits (mobile)
    if (cleaned.length !== 10 && cleaned.length !== 11) {
      return false;
    }

    // DDD (area code) must be between 11 and 99
    const ddd = parseInt(cleaned.substring(0, 2));
    if (ddd < 11 || ddd > 99) {
      return false;
    }

    // Mobile numbers start with 9
    if (cleaned.length === 11) {
      const firstDigit = cleaned.charAt(2);
      if (firstDigit !== '9') {
        return false;
      }
    }

    // Cannot be all same digit
    if (/^(\d)\1+$/.test(cleaned)) {
      return false;
    }

    return true;
  }

  getValue(): string {
    return this.value;
  }

  getFormatted(): string {
    if (this.value.length === 11) {
      // Mobile: (11) 99999-9999
      return `(${this.value.substring(0, 2)}) ${this.value.substring(2, 7)}-${this.value.substring(7, 11)}`;
    } else {
      // Landline: (11) 9999-9999
      return `(${this.value.substring(0, 2)}) ${this.value.substring(2, 6)}-${this.value.substring(6, 10)}`;
    }
  }

  getInternational(): string {
    return `+55${this.value}`;
  }

  getDDD(): string {
    return this.value.substring(0, 2);
  }

  isMobile(): boolean {
    return this.value.length === 11;
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.getFormatted();
  }
}
