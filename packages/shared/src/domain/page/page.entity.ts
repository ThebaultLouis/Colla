import { PageId, PageTitle, PageContent } from './value-objects';

/**
 * Page Entity - DDD
 * Une entité est définie par son identité qui persiste dans le temps
 */
export class Page {
  private constructor(
    private readonly id: PageId,
    private title: PageTitle,
    private content: PageContent,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) { }

  static create(id: PageId, title: PageTitle, content?: PageContent): Page {
    const now = new Date();
    return new Page(
      id,
      title,
      content || PageContent.empty(),
      now,
      now,
    );
  }

  static reconstitute(
    id: PageId,
    title: PageTitle,
    content: PageContent,
    createdAt: Date,
    updatedAt: Date,
  ): Page {
    return new Page(id, title, content, createdAt, updatedAt);
  }

  // Getters
  getId(): PageId {
    return this.id;
  }

  getTitle(): PageTitle {
    return this.title;
  }

  getContent(): PageContent {
    return this.content;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business methods
  updateTitle(newTitle: PageTitle): void {
    if (this.title.equals(newTitle)) {
      return;
    }
    this.title = newTitle;
    this.touch();
  }

  updateContent(newContent: PageContent): void {
    if (this.content.equals(newContent)) {
      return;
    }
    this.content = newContent;
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  // Pour la sérialisation
  toJSON() {
    return {
      id: this.id.getValue(),
      title: this.title.getValue(),
      content: this.content.getValue(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
