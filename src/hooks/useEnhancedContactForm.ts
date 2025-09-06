import { useCallback, useEffect, useRef, useState } from 'react';
import { useContactNotifications, ContactFormData } from '@/hooks/useContactNotifications';
import toast from 'react-hot-toast';

interface EnhanceOptions {
  onBeforeSubmit?: (data: ContactFormData) => void;
  onAfterSubmit?: (ok: boolean) => void;
}

export function useEnhancedContactForm() {
  const { submitContactForm } = useContactNotifications();
  const [enhancedFormsCount, setEnhancedFormsCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingFormId, setSubmittingFormId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] = useState<ContactFormData | null>(null);
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
      
      // Generate unique form ID if not present
      if (!form.id) {
        form.id = `contact-form-${Date.now()}`;
      }
      
      // Update submit button to show loading state
      const updateSubmitButton = (loading: boolean) => {
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]') as HTMLButtonElement;
        if (submitBtn) {
          if (loading) {
            submitBtn.disabled = true;
            const originalText = submitBtn.textContent || 'Submit';
            submitBtn.setAttribute('data-original-text', originalText);
            // Add spinning animation style if not present
            if (!document.getElementById('contact-form-spinner-style')) {
              const style = document.createElement('style');
              style.id = 'contact-form-spinner-style';
              style.textContent = `
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                .animate-spin {
                  animation: spin 1s linear infinite;
                }
              `;
              document.head.appendChild(style);
            }
            
            submitBtn.innerHTML = `
              <span style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <svg class="animate-spin" style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                </svg>
                Sending...
              </span>
            `;
          } else {
            submitBtn.disabled = false;
            const originalText = submitBtn.getAttribute('data-original-text') || 'Submit';
            submitBtn.textContent = originalText;
          }
        }
      };
      
      const handler = async (e: Event) => {
        try {
          e.preventDefault();
          
          const data = extractFormData(form);
          
          // Validation
          if (!data.name || !data.email || !data.message) {
            toast.error('Please fill in all required fields');
            return;
          }
          
          // Email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(data.email)) {
            toast.error('Please enter a valid email address');
            const emailInput = form.querySelector('[name="email"]') as HTMLInputElement;
            emailInput?.focus();
            return;
          }
          
          const cidStr = typeof window !== 'undefined' ? localStorage.getItem('companyId') : null;
          const companyId = cidStr ? parseInt(cidStr) : 1;
          
          options?.onBeforeSubmit?.(data);
          setIsSubmitting(true);
          setSubmittingFormId(form.id);
          updateSubmitButton(true);
          
          const ok = await submitContactForm(companyId, data);
          
          if (ok) {
            // Success handling
            setLastSubmittedData(data);
            setShowSuccessModal(true);
            form.reset();
            
            // Disable form for 5 seconds to prevent double submission
            const inputs = form.querySelectorAll('input, textarea, button');
            inputs.forEach(input => {
              (input as HTMLInputElement).disabled = true;
            });
            
            setTimeout(() => {
              inputs.forEach(input => {
                (input as HTMLInputElement).disabled = false;
              });
              updateSubmitButton(false);
            }, 5000);
          } else {
            toast.error('Failed to send message. Please try again.');
            updateSubmitButton(false);
          }
          
          options?.onAfterSubmit?.(ok);
        } catch (error) {
          console.error('Form submission error:', error);
          toast.error('An error occurred. Please try again.');
          updateSubmitButton(false);
        } finally {
          setIsSubmitting(false);
          setSubmittingFormId(null);
        }
      };
      
      form.addEventListener('submit', handler);
      enhanced.current.add(form);
      setEnhancedFormsCount((c) => c + 1);
    },
    [submitContactForm]
  );

  // Auto‑enhance forms with [data-contact-form] and observe future inserts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scan = () => {
      const forms = Array.from(document.querySelectorAll<HTMLFormElement>('form[data-contact-form]'));
      for (const f of forms) enhanceContactForm(f);
    };

    // Initial scan
    scan();

    // Observe DOM mutations to catch late‑loaded forms
    const observer = new MutationObserver(() => {
      scan();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Re‑scan on visibility change (SSR hydration/route swaps)
    const onVis = () => scan();
    document.addEventListener('visibilitychange', onVis);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [enhanceContactForm]);

  return {
    enhancedFormsCount,
    isSubmitting,
    submittingFormId,
    showSuccessModal,
    setShowSuccessModal,
    lastSubmittedData,
    enhanceContactForm,
  };
}
