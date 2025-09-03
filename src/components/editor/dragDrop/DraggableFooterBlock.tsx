/**
 * @file DraggableFooterBlock.tsx
 * @max-lines 150
 * @current-lines 0
 * @architecture modular
 * @validates-rules ✅
 * 
 * Draggable wrapper for Footer child blocks
 * Provides drag & drop functionality for reordering footer blocks
 */

'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RenderArgs {
  setNodeRef: (node: HTMLElement | null) => void;
  attributes: any;
  listeners: any;
  isDragging: boolean;
  style: React.CSSProperties;
}

interface DraggableFooterBlockProps {
  blockId: string;
  children: React.ReactNode | ((args: RenderArgs) => React.ReactNode);
}

export function DraggableFooterBlock({ blockId, children }: DraggableFooterBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: blockId,
    data: {
      type: 'footer-block',
      id: blockId
    }
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  // If children is a function (render prop pattern)
  if (typeof children === 'function') {
    return (
      <>
        {children({
          setNodeRef,
          attributes,
          listeners,
          isDragging,
          style
        })}
      </>
    );
  }

  // If children is a regular React node
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}