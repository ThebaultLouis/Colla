/**
 * User Value Object
 * Représente un utilisateur Notion dans created_by et last_edited_by
 */

export interface UserData {
  object: 'user';
  id: string;
}

export class User {
  private constructor(private readonly value: UserData | null) { }

  static empty(): User {
    return new User(null);
  }

  static create(id: string): User {
    if (!id || id.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }
    return new User({ object: 'user', id });
  }

  static reconstitute(data: UserData | null): User {
    return new User(data);
  }

  getValue(): UserData | null {
    return this.value;
  }

  getId(): string | null {
    return this.value?.id ?? null;
  }

  isEmpty(): boolean {
    return this.value === null;
  }

  toJSON(): UserData | null {
    return this.value;
  }

  equals(other: User): boolean {
    if (this.value === null && other.value === null) {
      return true;
    }
    if (this.value === null || other.value === null) {
      return false;
    }
    return this.value.id === other.value.id;
  }
}

export default User;
