import { PageId, PageTitle, PageContent } from '../value-objects';

describe('PageId', () => {
  it('should create a valid PageId', () => {
    const id = PageId.create('page-123');
    expect(id.getValue()).toBe('page-123');
  });

  it('should throw error for empty id', () => {
    expect(() => PageId.create('')).toThrow('PageId cannot be empty');
  });

  it('should check equality correctly', () => {
    const id1 = PageId.create('page-123');
    const id2 = PageId.create('page-123');
    const id3 = PageId.create('page-456');

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});

describe('PageTitle', () => {
  it('should create a valid PageTitle', () => {
    const title = PageTitle.create('My Page');
    expect(title.getValue()).toBe('My Page');
  });

  it('should accept empty title', () => {
    const title = PageTitle.create('');
    expect(title.getValue()).toBe('');
  });

  it('should throw error for title exceeding 255 characters', () => {
    const longTitle = 'a'.repeat(256);
    expect(() => PageTitle.create(longTitle)).toThrow(
      'PageTitle cannot exceed 255 characters',
    );
  });

  it('should check equality correctly', () => {
    const title1 = PageTitle.create('Title');
    const title2 = PageTitle.create('Title');
    const title3 = PageTitle.create('Other');

    expect(title1.equals(title2)).toBe(true);
    expect(title1.equals(title3)).toBe(false);
  });
});

describe('PageContent', () => {
  it('should create a valid PageContent', () => {
    const content = PageContent.create('Hello World');
    expect(content.getValue()).toBe('Hello World');
  });

  it('should create empty PageContent', () => {
    const content = PageContent.empty();
    expect(content.isEmpty()).toBe(true);
  });

  it('should check if content is empty', () => {
    const emptyContent = PageContent.create('   ');
    const nonEmptyContent = PageContent.create('Hello');

    expect(emptyContent.isEmpty()).toBe(true);
    expect(nonEmptyContent.isEmpty()).toBe(false);
  });

  it('should check equality correctly', () => {
    const content1 = PageContent.create('Content');
    const content2 = PageContent.create('Content');
    const content3 = PageContent.create('Other');

    expect(content1.equals(content2)).toBe(true);
    expect(content1.equals(content3)).toBe(false);
  });
});
