'use client';

import React from 'react';
import { DragOverlay as DndDragOverlay } from '@dnd-kit/core';
import { Section } from '@/types/editor.types';

interface DragOverlayProps {
  activeSection: Section | null;
}

export function DragOverlay({ activeSection }: DragOverlayProps) {
  if (!activeSection) return null;

  return (
    <DndDragOverlay dropAnimation={{
      duration: 200,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }}>
      {/* Overlay mínimo y transparente - solo un indicador sutil */}
      <div 
        className="pointer-events-none"
        style={{
          opacity: 0.01, // Casi invisible, solo para mantener el drag activo
          width: '1px',
          height: '1px'
        }}
      />
    </DndDragOverlay>
  );
}