import { useState, useEffect, useRef } from 'react';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}

type BlockType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'paragraph' | 'bulleted_list' | 'numbered_list' | 'todo';

interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean; // For todo items
}

interface Command {
  id: string;
  label: string;
  description: string;
  icon: string;
  blockType: BlockType;
  keywords: string[];
}

function markdownToBlocks(markdown: string): Block[] {
  if (!markdown.trim()) {
    return [{ id: generateId(), type: 'paragraph', content: '' }];
  }

  const lines = markdown.split('\n');
  const blocks: Block[] = [];
  let currentParagraph = '';

  for (const line of lines) {
    // Headings
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
      continue;
    }

    // Todo items (checked and unchecked)
    const todoMatch = line.match(/^-\s+\[([ x])\]\s+(.*)$/);
    if (todoMatch) {
      if (currentParagraph.trim()) {
        blocks.push({
          id: generateId(),
          type: 'paragraph',
          content: currentParagraph.trim()
        });
        currentParagraph = '';
      }

      blocks.push({
        id: generateId(),
        type: 'todo',
        content: todoMatch[2],
        checked: todoMatch[1] === 'x'
      });
      continue;
    }

    // Bulleted list
    const bulletMatch = line.match(/^-\s+(.*)$/);
    if (bulletMatch) {
      if (currentParagraph.trim()) {
        blocks.push({
          id: generateId(),
          type: 'paragraph',
          content: currentParagraph.trim()
        });
        currentParagraph = '';
      }

      blocks.push({
        id: generateId(),
        type: 'bulleted_list',
        content: bulletMatch[1]
      });
      continue;
    }

    // Numbered list
    const numberedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (numberedMatch) {
      if (currentParagraph.trim()) {
        blocks.push({
          id: generateId(),
          type: 'paragraph',
          content: currentParagraph.trim()
        });
        currentParagraph = '';
      }

      blocks.push({
        id: generateId(),
        type: 'numbered_list',
        content: numberedMatch[1]
      });
      continue;
    }

    // Empty line or paragraph continuation
    if (line.trim() === '') {
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
    switch (block.type) {
      case 'paragraph':
        return block.content;
      case 'bulleted_list':
        return `- ${block.content}`;
      case 'numbered_list':
        return `1. ${block.content}`;
      case 'todo':
        const checkbox = block.checked ? '[x]' : '[ ]';
        return `- ${checkbox} ${block.content}`;
      default:
        // Headings
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

const COMMANDS: Command[] = [
  {
    id: 'paragraph',
    label: 'Texte',
    description: 'Simple paragraphe de texte',
    icon: '📝',
    blockType: 'paragraph',
    keywords: ['text', 'texte', 'paragraph', 'paragraphe', 'p']
  },
  {
    id: 'h1',
    label: 'Titre 1',
    description: 'Titre principal',
    icon: '📌',
    blockType: 'h1',
    keywords: ['heading', 'titre', 'h1', 'title', 'header', 'grand']
  },
  {
    id: 'h2',
    label: 'Titre 2',
    description: 'Section importante',
    icon: '📍',
    blockType: 'h2',
    keywords: ['heading', 'titre', 'h2', 'section', 'moyen']
  },
  {
    id: 'h3',
    label: 'Titre 3',
    description: 'Sous-section',
    icon: '📎',
    blockType: 'h3',
    keywords: ['heading', 'titre', 'h3', 'subsection', 'petit']
  },
  {
    id: 'bulleted-list',
    label: 'Liste à puces',
    description: 'Liste avec des puces',
    icon: '•',
    blockType: 'bulleted_list',
    keywords: ['list', 'liste', 'bullet', 'puce', 'ul', 'unordered']
  },
  {
    id: 'numbered-list',
    label: 'Liste numérotée',
    description: 'Liste avec des numéros',
    icon: '1.',
    blockType: 'numbered_list',
    keywords: ['list', 'liste', 'number', 'numéro', 'ol', 'ordered', 'numbered']
  },
  {
    id: 'todo',
    label: 'Liste de tâches',
    description: 'Tâche avec checkbox',
    icon: '☑',
    blockType: 'todo',
    keywords: ['todo', 'task', 'tâche', 'checkbox', 'check', 'done']
  }
];


export function MarkdownEditor({ value, onChange, onBlur, placeholder = 'Start writing...' }: MarkdownEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(() => markdownToBlocks(value));
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isInternalUpdate = useRef(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandMenuBlockId, setCommandMenuBlockId] = useState<string | null>(null);
  const [commandFilter, setCommandFilter] = useState('');
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const commandMenuRef = useRef<HTMLDivElement>(null);

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

  const getFilteredCommands = (): Command[] => {
    if (!commandFilter) {
      return COMMANDS;
    }

    const lowerFilter = commandFilter.toLowerCase();
    return COMMANDS.filter(cmd =>
      cmd.label.toLowerCase().includes(lowerFilter) ||
      cmd.description.toLowerCase().includes(lowerFilter) ||
      cmd.keywords.some(kw => kw.toLowerCase().includes(lowerFilter))
    );
  };

  const selectCommand = (blockId: string, command: Command) => {
    const newBlocks = blocks.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          type: command.blockType,
          content: '',
          checked: command.blockType === 'todo' ? false : undefined
        };
      }
      return block;
    });

    setShowCommandMenu(false);
    setCommandMenuBlockId(null);
    notifyChange(newBlocks);

    // Focus the block after conversion
    setTimeout(() => {
      const blockEl = blockRefs.current.get(blockId);
      if (blockEl) {
        blockEl.focus();
      }
    }, 0);
  };

  const handleBlockInput = (blockId: string, e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const newContent = target.textContent || '';

    // Find current block
    const currentBlock = blocks.find(b => b.id === blockId);

    // Detect slash command
    if (newContent === '/' && currentBlock?.type === 'paragraph') {
      setShowCommandMenu(true);
      setCommandMenuBlockId(blockId);
      setCommandFilter('');
      setSelectedCommandIndex(0);
      return;
    }

    // Update command filter if menu is open
    if (showCommandMenu && commandMenuBlockId === blockId && newContent.startsWith('/')) {
      const filter = newContent.slice(1);
      setCommandFilter(filter);
      setSelectedCommandIndex(0);
      return;
    }

    // Close menu if content doesn't start with /
    if (showCommandMenu && commandMenuBlockId === blockId && !newContent.startsWith('/')) {
      setShowCommandMenu(false);
      setCommandMenuBlockId(null);
    }

    // Sauvegarder la position du curseur
    const selection = window.getSelection();
    let cursorPosition = 0;
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      cursorPosition = range.startOffset;
    }

    const newBlocks = blocks.map(block => {
      if (block.id === blockId) {
        // Headings
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

        // Todo list (checked or unchecked)
        const todoMatch = newContent.match(/^-\s+\[([ x])\]\s+(.*)$/);
        if (todoMatch) {
          const typeChanged = block.type !== 'todo';
          const adjustedPosition = Math.max(0, cursorPosition - 6); // "- [x] " or "- [ ] "

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
            type: 'todo' as BlockType,
            content: todoMatch[2],
            checked: todoMatch[1] === 'x'
          };
        }

        // Bulleted list
        const bulletMatch = newContent.match(/^-\s+(.*)$/);
        if (bulletMatch) {
          const typeChanged = block.type !== 'bulleted_list';
          const adjustedPosition = Math.max(0, cursorPosition - 2); // "- "

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
            type: 'bulleted_list' as BlockType,
            content: bulletMatch[1]
          };
        }

        // Numbered list
        const numberedMatch = newContent.match(/^\d+\.\s+(.*)$/);
        if (numberedMatch) {
          const typeChanged = block.type !== 'numbered_list';
          const prefixLength = newContent.indexOf('. ') + 2; // "1. " or "12. "
          const adjustedPosition = Math.max(0, cursorPosition - prefixLength);

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
            type: 'numbered_list' as BlockType,
            content: numberedMatch[1]
          };
        }

        return { ...block, content: newContent };
      }
      return block;
    });
    notifyChange(newBlocks);
  };

  const handleKeyDown = (blockId: string, e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle command menu navigation
    if (showCommandMenu && commandMenuBlockId === blockId) {
      const filteredCommands = getFilteredCommands();

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const selectedCommand = filteredCommands[selectedCommandIndex];
        if (selectedCommand) {
          selectCommand(blockId, selectedCommand);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommandMenu(false);
        setCommandMenuBlockId(null);
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      const blockIndex = blocks.findIndex(b => b.id === blockId);
      const currentBlock = blocks[blockIndex];

      // For list items (bulleted, numbered, todo)
      const isListType = currentBlock.type === 'bulleted_list' ||
        currentBlock.type === 'numbered_list' ||
        currentBlock.type === 'todo';

      let newBlock: Block;

      if (isListType) {
        // If current list item is empty, convert to paragraph (exit list mode)
        if (!currentBlock.content || currentBlock.content.trim() === '') {
          const newBlocks = blocks.map(b =>
            b.id === blockId ? { ...b, type: 'paragraph' as BlockType, checked: undefined } : b
          );
          notifyChange(newBlocks);

          // Keep focus on the converted block
          setTimeout(() => {
            const blockEl = blockRefs.current.get(blockId);
            if (blockEl) {
              blockEl.focus();
              const range = document.createRange();
              const sel = window.getSelection();
              range.setStart(blockEl, 0);
              range.collapse(true);
              sel?.removeAllRanges();
              sel?.addRange(range);
            }
          }, 0);
          return;
        }

        // Otherwise, create a new list item of the same type
        newBlock = {
          id: generateId(),
          type: currentBlock.type,
          content: '',
          checked: currentBlock.type === 'todo' ? false : undefined
        };
      } else {
        // For non-list blocks, create a paragraph
        newBlock = {
          id: generateId(),
          type: 'paragraph',
          content: ''
        };
      }

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
        const isFirst = index === 0;
        const isEmpty = block.content === '';
        const showPlaceholder = isFirst && isEmpty && placeholder;
        const isCommandMenuOpen = showCommandMenu && commandMenuBlockId === block.id;

        // Render todo items with checkbox
        if (block.type === 'todo') {
          return (
            <div
              key={block.id}
              className={`markdown-block todo ${showPlaceholder ? 'empty' : ''}`}
              data-placeholder={showPlaceholder ? placeholder : undefined}
            >
              <input
                type="checkbox"
                checked={block.checked || false}
                onChange={(e) => {
                  const newBlocks = blocks.map(b =>
                    b.id === block.id ? { ...b, checked: e.target.checked } : b
                  );
                  notifyChange(newBlocks);
                }}
                className="todo-checkbox"
              />
              <div
                ref={(el) => {
                  if (el) {
                    blockRefs.current.set(block.id, el);
                    if (el.textContent !== block.content) {
                      el.textContent = block.content;
                    }
                  } else {
                    blockRefs.current.delete(block.id);
                  }
                }}
                className="todo-content"
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => {
                  handleBlockInput(block.id, e);
                }}
                onKeyDown={(e) => handleKeyDown(block.id, e)}
                onBlur={handleBlockBlur}
                onPaste={handlePaste}
              />
            </div>
          );
        }

        // Render list items with bullets/numbers
        if (block.type === 'bulleted_list' || block.type === 'numbered_list') {
          const Tag = block.type === 'bulleted_list' ? 'div' : 'div';
          return (
            <Tag
              key={block.id}
              ref={(el) => {
                if (el) {
                  blockRefs.current.set(block.id, el);
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
        }

        // Render headings and paragraphs
        const Tag = block.type === 'paragraph' ? 'div' : block.type;
        return (
          <div key={block.id} style={{ position: 'relative' }}>
            <Tag
              ref={(el) => {
                if (el) {
                  blockRefs.current.set(block.id, el);
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

            {/* Command menu */}
            {isCommandMenuOpen && (
              <div ref={commandMenuRef} className="command-menu">
                {getFilteredCommands().map((command, cmdIndex) => (
                  <div
                    key={command.id}
                    className={`command-item ${cmdIndex === selectedCommandIndex ? 'selected' : ''}`}
                    onClick={() => selectCommand(block.id, command)}
                    onMouseEnter={() => setSelectedCommandIndex(cmdIndex)}
                  >
                    <span className="command-icon">{command.icon}</span>
                    <div className="command-text">
                      <div className="command-label">{command.label}</div>
                      <div className="command-description">{command.description}</div>
                    </div>
                  </div>
                ))}
                {getFilteredCommands().length === 0 && (
                  <div className="command-item empty">
                    Aucune commande trouvée
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
