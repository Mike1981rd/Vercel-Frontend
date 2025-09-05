import { useEnhancedContactForm } from '@/hooks/useEnhancedContactForm';

// Thin wrapper to provide a stable named hook used by some components/docs
export function useContactFormEnhancer() {
  const { enhanceContactForm, enhancedFormsCount, isSubmitting } = useEnhancedContactForm();
  return { enhanceContactForm, enhancedFormsCount, isSubmitting };
}

