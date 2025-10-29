import { useState, useEffect, useRef } from 'react';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}

type BlockType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'paragraph';

interface Block {
  id: string;
  type: BlockType;
  content: string;
}

function markdownToBlocks(markdown: string): Block[] {
  if (!markdown.trim()) {
    return [{ id: generateId(), type: 'paragraph', content: '' }];
  }

  const lines = markdown.split('\n');
  const blocks: Block[] = [];
  let currentParagraph = '';

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      if (currentParagraph.trim()) {
        blocks.push({
          id: generateId(),
          type: 'paragraph',
          content: currentParagraph.trim()
        });
        currentParagraph = '';
      }

      const level = headingMatch[1].length;
      const content = headingMatch[2];
      blocks.push({
        id: generateId(),
        type: `h${level}` as BlockType,
        content: content
      });
    } else if (line.trim() === '') {
      if (currentParagraph.trim()) {
        blocks.push({
          id: generateId(),
          type: 'paragraph',
          content: currentParagraph.trim()
        });
        currentParagraph = '';
      }
    } else {
      if (currentParagraph) {
        currentParagraph += '\n' + line;
      } else {
        currentParagraph = line;
      }
    }
  }

  if (currentParagraph.trim()) {
    blocks.push({
      id: generateId(),
      type: 'paragraph',
      content: currentParagraph.trim()
    });
  }

  if (blocks.length === 0) {
    blocks.push({ id: generateId(), type: 'paragraph', content: '' });
  }

  return blocks;
}

function blocksToMarkdown(blocks: Block[]): string {
  return blocks.map(block => {
    if (block.type === 'paragraph') {
      return block.content;
    } else {
      const level = parseInt(block.type.replace('h', ''));
      const hashes = '#'.repeat(level);
      return `${hashes} ${block.content}`;
    }
  }).join('\n\n');
}

let idCounter = 0;
function generateId(): string {
  return `block-${Date.now()}-${idCounter++}`;
}

export function MarkdownEditor({ value, onChange, onBlur, placeholder = 'Start writing...' }: MarkdownEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(() => markdownToBlocks(value));
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (!isInternalUpdate.current) {
      const currentMarkdown = blocksToMarkdown(blocks);
      if (value !== currentMarkdown) {
        setBlocks(markdownToBlocks(value));
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const notifyChange = (newBlocks: Block[]) => {
    isInternalUpdate.current = true;
    setBlocks(newBlocks);
    const markdown = blocksToMarkdown(newBlocks);
    onChange(markdown);
  };

  const handleBlockInput = (blockId: string, e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const newContent = target.textContent || '';

    // Sauvegarder la position du curseur
    const selection = window.getSelection();
    let cursorPosition = 0;
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      cursorPosition = range.startOffset;
    }

    const newBlocks = blocks.map(block => {
      if (block.id === blockId) {
        const headingMatch = newContent.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const content = headingMatch[2];
          const newType = `h${level}` as BlockType;
          const typeChanged = block.type !== newType;

          // Ajuster la position du curseur si on a détecté un titre
          const hashesLength = headingMatch[1].length + 1; // +1 pour l'espace
          const adjustedPosition = Math.max(0, cursorPosition - hashesLength);

          // Si le type a changé, restaurer le focus et le curseur après le re-render
          if (typeChanged) {
            setTimeout(() => {
              const blockEl = blockRefs.current.get(blockId);
              if (blockEl) {
                blockEl.focus();
                const sel = window.getSelection();
                const range = document.createRange();
                const textNode = blockEl.firstChild;
                if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                  const pos = Math.min(adjustedPosition, textNode.textContent?.length || 0);
                  range.setStart(textNode, pos);
                  range.collapse(true);
                  sel?.removeAllRanges();
                  sel?.addRange(range);
                }
              }
            }, 0);
          }

          return {
            ...block,
            type: newType,
            content: content
          };
        }
        return { ...block, content: newContent };
      }
      return block;
    });
    notifyChange(newBlocks);
  };

  const handleKeyDown = (blockId: string, e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const blockIndex = blocks.findIndex(b => b.id === blockId);

      const newBlock: Block = {
        id: generateId(),
        type: 'paragraph',
        content: ''
      };

      const newBlocks = [
        ...blocks.slice(0, blockIndex + 1),
        newBlock,
        ...blocks.slice(blockIndex + 1)
      ];

      notifyChange(newBlocks);

      setTimeout(() => {
        const newBlockEl = blockRefs.current.get(newBlock.id);
        if (newBlockEl) {
          newBlockEl.focus();
          const range = document.createRange();
          const sel = window.getSelection();
          range.setStart(newBlockEl, 0);
          range.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }, 0);
    }

    if (e.key === 'Backspace') {
      const selection = window.getSelection();

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const cursorAtStart = range.startOffset === 0 && range.endOffset === 0;

        if (cursorAtStart) {
          e.preventDefault();

          const blockIndex = blocks.findIndex(b => b.id === blockId);
          const block = blocks[blockIndex];

          if (block.type !== 'paragraph' && block.content === '') {
            const newBlocks = blocks.map(b =>
              b.id === blockId ? { ...b, type: 'paragraph' as BlockType } : b
            );
            notifyChange(newBlocks);
          } else if (blockIndex > 0) {
            const previousBlock = blocks[blockIndex - 1];
            const newBlocks = blocks.filter(b => b.id !== blockId);
            newBlocks[blockIndex - 1] = {
              ...previousBlock,
              content: previousBlock.content + block.content
            };
            notifyChange(newBlocks);

            setTimeout(() => {
              const prevBlockEl = blockRefs.current.get(previousBlock.id);
              if (prevBlockEl) {
                prevBlockEl.focus();
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(prevBlockEl);
                range.collapse(false);
                sel?.removeAllRanges();
                sel?.addRange(range);
              }
            }, 0);
          }
        }
      }
    }
  };

  const handleBlockBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Mettre à jour le contenu des blocs sans perdre le curseur
  useEffect(() => {
    blocks.forEach(block => {
      const el = blockRefs.current.get(block.id);
      if (el && el.textContent !== block.content) {
        const isActive = document.activeElement === el;
        const selection = window.getSelection();
        let cursorPosition = 0;

        // Sauvegarder la position du curseur si l'élément est actif
        if (isActive && selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          cursorPosition = range.startOffset;
        }

        // Mettre à jour le contenu
        el.textContent = block.content;

        // Restaurer le curseur si l'élément était actif
        if (isActive && el.firstChild) {
          const range = document.createRange();
          const sel = window.getSelection();
          const textNode = el.firstChild;
          if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            const pos = Math.min(cursorPosition, textNode.textContent?.length || 0);
            range.setStart(textNode, pos);
            range.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        }
      }
    });
  }, [blocks]);

  return (
    <div className="markdown-editor notion-style">
      {blocks.map((block, index) => {
        const Tag = block.type === 'paragraph' ? 'div' : block.type;
        const isFirst = index === 0;
        const isEmpty = block.content === '';
        const showPlaceholder = isFirst && isEmpty && placeholder;

        return (
          <Tag
            key={block.id}
            ref={(el) => {
              if (el) {
                blockRefs.current.set(block.id, el);
                // Initialiser le contenu seulement si l'élément est nouveau
                if (el.textContent !== block.content) {
                  el.textContent = block.content;
                }
              } else {
                blockRefs.current.delete(block.id);
              }
            }}
            className={`markdown-block ${block.type} ${showPlaceholder ? 'empty' : ''}`}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => {
              handleBlockInput(block.id, e);
            }}
            onKeyDown={(e) => handleKeyDown(block.id, e)}
            onBlur={handleBlockBlur}
            onPaste={handlePaste}
            data-placeholder={showPlaceholder ? placeholder : undefined}
          />
        );
      })}
    </div>
  );
}
