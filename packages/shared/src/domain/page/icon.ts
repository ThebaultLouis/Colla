/**
 * Page Icon Value Object
 * Peut être soit un emoji, soit un fichier (URL externe ou upload)
 */

export type IconType = 'emoji' | 'external' | 'file';

export interface EmojiIcon {
  type: 'emoji';
  emoji: string; // ex: "🎨"
}

export interface ExternalFileIcon {
  type: 'external';
  external: {
    url: string;
  };
}

export interface FileIcon {
  type: 'file';
  file: {
    url: string;
    expiry_time?: string;
  };
}

export type PageIcon = EmojiIcon | ExternalFileIcon | FileIcon;

export class Icon {
  private constructor(private readonly value: PageIcon | null) { }

  static empty(): Icon {
    return new Icon(null);
  }

  static emoji(emoji: string): Icon {
    if (!emoji || emoji.trim().length === 0) {
      throw new Error('Emoji cannot be empty');
    }
    return new Icon({ type: 'emoji', emoji });
  }

  static externalFile(url: string): Icon {
    if (!url || url.trim().length === 0) {
      throw new Error('Icon URL cannot be empty');
    }
    return new Icon({ type: 'external', external: { url } });
  }

  static file(url: string, expiryTime?: string): Icon {
    if (!url || url.trim().length === 0) {
      throw new Error('Icon URL cannot be empty');
    }
    return new Icon({ type: 'file', file: { url, expiry_time: expiryTime } });
  }

  static reconstitute(data: PageIcon | null): Icon {
    return new Icon(data);
  }

  getValue(): PageIcon | null {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value === null;
  }

  toJSON(): PageIcon | null {
    return this.value;
  }

  equals(other: Icon): boolean {
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
export default Icon;