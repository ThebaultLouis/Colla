/**
 * Page Cover Value Object
 * Image de couverture de la page (URL externe ou fichier uploadé)
 */

export interface ExternalCover {
  type: 'external';
  external: {
    url: string;
  };
}

export interface FileCover {
  type: 'file';
  file: {
    url: string;
    expiry_time?: string;
  };
}

export type PageCover = ExternalCover | FileCover;

export class Cover {
  private constructor(private readonly value: PageCover | null) { }

  static empty(): Cover {
    return new Cover(null);
  }

  static external(url: string): Cover {
    if (!url || url.trim().length === 0) {
      throw new Error('Cover URL cannot be empty');
    }
    return new Cover({ type: 'external', external: { url } });
  }

  static file(url: string, expiryTime?: string): Cover {
    if (!url || url.trim().length === 0) {
      throw new Error('Cover URL cannot be empty');
    }
    return new Cover({ type: 'file', file: { url, expiry_time: expiryTime } });
  }

  static reconstitute(data: PageCover | null): Cover {
    return new Cover(data);
  }

  getValue(): PageCover | null {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value === null;
  }

  toJSON(): PageCover | null {
    return this.value;
  }

  equals(other: Cover): boolean {
    if (this.value === null && other.value === null) {
      return true;
    }
    if (this.value === null || other.value === null) {
      return false;
    }
    return JSON.stringify(this.value) === JSON.stringify(other.value);
  }
}

// Export par défaut aussi pour faciliter les imports
export default Cover;