'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type RenderArgs = {
  setNodeRef: (el: HTMLElement | null) => void;
  attributes: any;
  listeners: any;
  isDragging: boolean;
  isOver: boolean;
  style: React.CSSProperties;
};

interface DraggableAnnouncementItemProps {
  itemId: string; // Unique ID (e.g., ann:<sectionId>:<announcementId>)
  children: React.ReactNode | ((args: RenderArgs) => React.ReactNode);
}

export function DraggableAnnouncementItem({ itemId, children }: DraggableAnnouncementItemProps) {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
    attributes,
    listeners,
    isOver,
  } = useSortable({ id: itemId, data: { kind: 'announcement-item' } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    opacity: isDragging ? 0.9 : 1,
  };

  if (typeof children === 'function') {
    return (
      <>{(children as (args: RenderArgs) => React.ReactNode)({ setNodeRef, attributes, listeners, isDragging, isOver, style })}</>
    );
  }

  // Fallback: attach listeners to the whole row
  return (
    <div ref={setNodeRef} style={style} className={`relative ${isDragging ? 'z-40' : ''}`} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
