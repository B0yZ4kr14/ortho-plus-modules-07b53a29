/**
 * DateRange Value Object
 * Immutable date range with validation
 */
export class DateRange {
  private readonly startDate: Date;
  private readonly endDate: Date;

  private constructor(startDate: Date, endDate: Date) {
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
  }

  static create(startDate: Date, endDate: Date): DateRange {
    if (!startDate || !endDate) {
      throw new Error('Datas de início e fim são obrigatórias');
    }

    if (startDate > endDate) {
      throw new Error('Data de início não pode ser maior que data de fim');
    }

    return new DateRange(startDate, endDate);
  }

  static createFromDays(startDate: Date, days: number): DateRange {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    return new DateRange(startDate, endDate);
  }

  getStartDate(): Date {
    return new Date(this.startDate);
  }

  getEndDate(): Date {
    return new Date(this.endDate);
  }

  getDurationInDays(): number {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDurationInHours(): number {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  overlaps(other: DateRange): boolean {
    return (
      this.contains(other.startDate) ||
      this.contains(other.endDate) ||
      other.contains(this.startDate) ||
      other.contains(this.endDate)
    );
  }

  equals(other: DateRange): boolean {
    return (
      this.startDate.getTime() === other.startDate.getTime() &&
      this.endDate.getTime() === other.endDate.getTime()
    );
  }

  toString(): string {
    return `${this.startDate.toISOString()} - ${this.endDate.toISOString()}`;
  }
}
