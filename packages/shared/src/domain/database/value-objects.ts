/**
 * Database Value Objects - DDD
 */

export class DatabaseId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('DatabaseId cannot be empty');
    }
  }

  static create(id: string): DatabaseId {
    return new DatabaseId(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: DatabaseId): boolean {
    return this.value === other.value;
  }
}

export class DatabaseName {
  private constructor(private readonly value: string) {
    if (value.length > 255) {
      throw new Error('DatabaseName cannot exceed 255 characters');
    }
  }

  static create(name: string): DatabaseName {
    return new DatabaseName(name);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: DatabaseName): boolean {
    return this.value === other.value;
  }
}

export class DatabaseDescription {
  private constructor(private readonly value: string) { }

  static create(description: string): DatabaseDescription {
    return new DatabaseDescription(description);
  }

  static empty(): DatabaseDescription {
    return new DatabaseDescription('');
  }

  getValue(): string {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value.trim().length === 0;
  }

  equals(other: DatabaseDescription): boolean {
    return this.value === other.value;
  }
}
