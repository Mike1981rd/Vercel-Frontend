/**
 * @file index.ts
 * @max-lines 300
 * @current-lines 50
 * @architecture modular
 * @validates-rules ✅
 */

// Main component
export { default as WhatsAppInbox } from './WhatsAppInbox';

// Chat components
export { default as ConversationList } from './ConversationList';
export { default as ChatView } from './ChatView';
export { default as MessageBubble } from './MessageBubble';
export { default as MessageInput } from './MessageInput';

// Configuration and management components
export { default as WhatsAppConfig } from './WhatsAppConfig';
export { default as TemplateManager } from './TemplateManager';
export { default as QuickReplies } from './QuickReplies';
export { default as WhatsAppStats } from './WhatsAppStats';

// Hooks
export { useWhatsAppAPI } from './hooks/useWhatsAppAPI';
export { 
  useWhatsAppStore,
  useWhatsAppConversations,
  useSelectedConversation,
  useSelectedConversationMessages,
  useWhatsAppConfig,
  useWhatsAppTemplates,
  useWhatsAppQuickReplies,
  useWhatsAppLoading,
  useWhatsAppError,
  useWhatsAppUnreadCount,
} from './hooks/useWhatsAppStore';
export { useWhatsAppRealTime } from './hooks/useWhatsAppRealTime';

// Types
export type * from './types/whatsapp.types';