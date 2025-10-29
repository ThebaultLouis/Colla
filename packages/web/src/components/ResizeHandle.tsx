import { useState, useRef, useEffect } from 'react';
import './ResizeHandle.css';

interface ResizeHandleProps {
  propertyId: string;
  onResize: (propertyId: string, width: number) => void;
}

export function ResizeHandle({ propertyId, onResize }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    startXRef.current = e.clientX;

    // Get current width from the th element
    const th = (e.currentTarget as HTMLElement).closest('th');
    if (th) {
      startWidthRef.current = th.offsetWidth;
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      const newWidth = Math.max(100, Math.min(500, startWidthRef.current + delta));
      onResize(propertyId, newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, propertyId, onResize]);

  return (
    <div
      className={`resize-handle ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
    />
  );
}
