// Provider principal
export { default as ContactNotificationProvider } from './ContactNotificationProvider';

// Componentes de notificaciones
export { default as ContactNotificationBadge } from './ContactNotificationBadge';
export { default as ContactNotificationPanel } from './ContactNotificationPanel';
export { default as ContactNotificationSettings } from './ContactNotificationSettings';

// Enhancer para formularios existentes
export { default as ContactFormEnhancer } from './ContactFormEnhancer';

// Hooks
export { useContactNotifications } from '@/hooks/useContactNotifications';
export { useEnhancedContactForm } from '@/hooks/useEnhancedContactForm';
export { useContactFormEnhancer } from '@/hooks/useContactFormEnhancer';

// Tipos: re-export omitted to avoid duplicate identifiers with component names
