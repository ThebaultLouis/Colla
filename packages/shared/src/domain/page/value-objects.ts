/**
 * Value Objects - DDD
 * Les Value Objects sont immuables et définis par leurs attributs
 */

export class PageId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('PageId cannot be empty');
    }
  }

  static create(id: string): PageId {
    return new PageId(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PageId): boolean {
    return this.value === other.value;
  }
}

export class PageTitle {
  private constructor(private readonly value: string) {
    if (value.length > 255) {
      throw new Error('PageTitle cannot exceed 255 characters');
    }
  }

  static create(title: string): PageTitle {
    return new PageTitle(title);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PageTitle): boolean {
    return this.value === other.value;
  }
}

export class PageContent {
  private constructor(private readonly value: string) { }

  static create(content: string): PageContent {
    return new PageContent(content);
  }

  static empty(): PageContent {
    return new PageContent('');
  }

  getValue(): string {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value.trim().length === 0;
  }

  equals(other: PageContent): boolean {
    return this.value === other.value;
  }
}
