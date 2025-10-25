import { Page } from '../page.entity';
import { PageId, PageTitle, PageContent } from '../value-objects';

describe('Page Entity', () => {
  describe('create', () => {
    it('should create a new page with required fields', () => {
      const id = PageId.create('page-1');
      const title = PageTitle.create('My First Page');

      const page = Page.create(id, title);

      expect(page.getId()).toBe(id);
      expect(page.getTitle()).toBe(title);
      expect(page.getContent().isEmpty()).toBe(true);
      expect(page.getCreatedAt()).toBeInstanceOf(Date);
      expect(page.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should create a new page with content', () => {
      const id = PageId.create('page-1');
      const title = PageTitle.create('My First Page');
      const content = PageContent.create('Hello World');

      const page = Page.create(id, title, content);

      expect(page.getContent()).toBe(content);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute a page from persistence', () => {
      const id = PageId.create('page-1');
      const title = PageTitle.create('Existing Page');
      const content = PageContent.create('Existing content');
      const createdAt = new Date('2025-01-01');
      const updatedAt = new Date('2025-01-02');

      const page = Page.reconstitute(id, title, content, createdAt, updatedAt);

      expect(page.getId().getValue()).toBe('page-1');
      expect(page.getCreatedAt()).toEqual(createdAt);
      expect(page.getUpdatedAt()).toEqual(updatedAt);
    });
  });

  describe('updateTitle', () => {
    it('should update title and updatedAt timestamp', () => {
      const page = Page.create(PageId.create('page-1'), PageTitle.create('Old Title'));
      const oldUpdatedAt = page.getUpdatedAt();

      // Wait a bit to ensure timestamp changes
      const newTitle = PageTitle.create('New Title');
      page.updateTitle(newTitle);

      expect(page.getTitle()).toBe(newTitle);
      expect(page.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('should not update timestamp if title is the same', () => {
      const title = PageTitle.create('Same Title');
      const page = Page.create(PageId.create('page-1'), title);
      const oldUpdatedAt = page.getUpdatedAt();

      page.updateTitle(PageTitle.create('Same Title'));

      expect(page.getUpdatedAt()).toEqual(oldUpdatedAt);
    });
  });

  describe('updateContent', () => {
    it('should update content and updatedAt timestamp', () => {
      const page = Page.create(
        PageId.create('page-1'),
        PageTitle.create('Title'),
        PageContent.create('Old content'),
      );
      const oldUpdatedAt = page.getUpdatedAt();

      const newContent = PageContent.create('New content');
      page.updateContent(newContent);

      expect(page.getContent()).toBe(newContent);
      expect(page.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('should not update timestamp if content is the same', () => {
      const content = PageContent.create('Same content');
      const page = Page.create(PageId.create('page-1'), PageTitle.create('Title'), content);
      const oldUpdatedAt = page.getUpdatedAt();

      page.updateContent(PageContent.create('Same content'));

      expect(page.getUpdatedAt()).toEqual(oldUpdatedAt);
    });
  });

  describe('toJSON', () => {
    it('should serialize page to JSON', () => {
      const page = Page.create(
        PageId.create('page-1'),
        PageTitle.create('Test Page'),
        PageContent.create('Test content'),
      );

      const json = page.toJSON();

      expect(json).toEqual({
        id: 'page-1',
        title: 'Test Page',
        content: 'Test content',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });
});
