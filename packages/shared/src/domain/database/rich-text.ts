/**
 * Rich Text Value Objects - Notion API compatible
 * https://developers.notion.com/reference/rich-text
 */

export type ColorType =
  | 'default'
  | 'gray'
  | 'brown'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'gray_background'
  | 'brown_background'
  | 'orange_background'
  | 'yellow_background'
  | 'green_background'
  | 'blue_background'
  | 'purple_background'
  | 'pink_background'
  | 'red_background';

export interface Annotations {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: ColorType;
}

export interface TextContent {
  content: string;
  link: { url: string } | null;
}

export interface RichTextText {
  type: 'text';
  text: TextContent;
  annotations: Annotations;
  plain_text: string;
  href: string | null;
}

export interface RichTextMention {
  type: 'mention';
  mention: any; // Simplified for now
  annotations: Annotations;
  plain_text: string;
  href: string | null;
}

export interface RichTextEquation {
  type: 'equation';
  equation: {
    expression: string;
  };
  annotations: Annotations;
  plain_text: string;
  href: string | null;
}

export type RichTextData = RichTextText | RichTextMention | RichTextEquation;

export class RichText {
  private constructor(private readonly value: RichTextData) { }

  static text(content: string, link: string | null = null, annotations?: Partial<Annotations>): RichText {
    const defaultAnnotations: Annotations = {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: 'default',
      ...annotations,
    };

    return new RichText({
      type: 'text',
      text: {
        content,
        link: link ? { url: link } : null,
      },
      annotations: defaultAnnotations,
      plain_text: content,
      href: link,
    });
  }

  static equation(expression: string, annotations?: Partial<Annotations>): RichText {
    const defaultAnnotations: Annotations = {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: 'default',
      ...annotations,
    };

    return new RichText({
      type: 'equation',
      equation: { expression },
      annotations: defaultAnnotations,
      plain_text: expression,
      href: null,
    });
  }

  static reconstitute(data: RichTextData): RichText {
    return new RichText(data);
  }

  static fromPlainText(text: string): RichText[] {
    if (!text || text.length === 0) {
      return [];
    }
    return [RichText.text(text)];
  }

  static toPlainText(richTexts: RichText[]): string {
    return richTexts.map((rt) => rt.getPlainText()).join('');
  }

  getValue(): RichTextData {
    return this.value;
  }

  getPlainText(): string {
    return this.value.plain_text;
  }

  getType(): 'text' | 'mention' | 'equation' {
    return this.value.type;
  }

  getAnnotations(): Annotations {
    return this.value.annotations;
  }

  isBold(): boolean {
    return this.value.annotations.bold;
  }

  isItalic(): boolean {
    return this.value.annotations.italic;
  }

  isCode(): boolean {
    return this.value.annotations.code;
  }

  getColor(): ColorType {
    return this.value.annotations.color;
  }

  toJSON(): RichTextData {
    return this.value;
  }

  equals(other: RichText): boolean {
    return JSON.stringify(this.value) === JSON.stringify(other.value);
  }
}

export default RichText;
