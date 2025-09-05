import { useCallback, useEffect, useRef, useState } from 'react';
import { useContactNotifications, ContactFormData } from '@/hooks/useContactNotifications';

interface EnhanceOptions {
  onBeforeSubmit?: (data: ContactFormData) => void;
  onAfterSubmit?: (ok: boolean) => void;
}

export function useEnhancedContactForm() {
  const { submitContactForm } = useContactNotifications();
  const [enhancedFormsCount, setEnhancedFormsCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const enhanced = useRef<WeakSet<HTMLFormElement>>(new WeakSet());

  const extractFormData = (form: HTMLFormElement): ContactFormData => {
    const getVal = (names: string[]): string => {
      for (const n of names) {
        const el = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(
          `[name="${n}"]`
        );
        if (el && el.value) return el.value;
      }
      return '';
    };

    return {
      name: getVal(['name', 'fullName', 'nombre']),
      email: getVal(['email', 'correo']),
      phone: getVal(['phone', 'telefono', 'tel']),
      message: getVal(['message', 'mensaje', 'body']),
    };
  };

  const enhanceContactForm = useCallback(
    (form: HTMLFormElement, options?: EnhanceOptions) => {
      if (!form || enhanced.current.has(form)) return;
      const handler = async (e: Event) => {
        try {
          e.preventDefault();
          const cidStr = typeof window !== 'undefined' ? localStorage.getItem('companyId') : null;
          const companyId = cidStr ? parseInt(cidStr) : 0;
          const data = extractFormData(form);
          options?.onBeforeSubmit?.(data);
          setIsSubmitting(true);
          const ok = await submitContactForm(companyId, data);
          options?.onAfterSubmit?.(ok);
          if (ok) form.reset();
        } finally {
          setIsSubmitting(false);
        }
      };
      form.addEventListener('submit', handler);
      enhanced.current.add(form);
      setEnhancedFormsCount((c) => c + 1);
    },
    [submitContactForm]
  );

  // Optionally auto-enhance forms with [data-contact-form]
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const forms = Array.from(document.querySelectorAll<HTMLFormElement>('form[data-contact-form]'));
    for (const f of forms) enhanceContactForm(f);
  }, [enhanceContactForm]);

  return {
    enhancedFormsCount,
    isSubmitting,
    enhanceContactForm,
  };
}

