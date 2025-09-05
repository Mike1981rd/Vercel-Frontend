'use client';

import React from 'react';
import { useEnhancedContactForm } from '@/hooks/useEnhancedContactForm';

interface ContactFormEnhancerProps {
  children: React.ReactNode;
  autoEnhance?: boolean;
  debug?: boolean;
}

/**
 * Componente wrapper que mejora formularios de contacto con notificaciones
 * sin modificar su código existente.
 * 
 * USO:
 * Envolver cualquier página o componente que contenga formularios de contacto:
 * 
 * <ContactFormEnhancer>
 *   <MyPageWithContactForms />
 * </ContactFormEnhancer>
 */
export default function ContactFormEnhancer({
  children,
  autoEnhance = true,
  debug = false
}: ContactFormEnhancerProps) {
  const { enhancedFormsCount, isSubmitting } = useEnhancedContactForm();

  if (debug) {
    console.log(`ContactFormEnhancer: ${enhancedFormsCount} forms enhanced, submitting: ${isSubmitting}`);
  }

  return (
    <>
      {children}
      {/* Invisible status indicator for debugging */}
      {debug && (
        <div 
          className="fixed bottom-4 right-4 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded shadow-lg border border-blue-200 dark:border-blue-700"
          style={{ zIndex: 9999 }}
        >
          <div>Enhanced forms: {enhancedFormsCount}</div>
          {isSubmitting && <div>Submitting...</div>}
        </div>
      )}
    </>
  );
}