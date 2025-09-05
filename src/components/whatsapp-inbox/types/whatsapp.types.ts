/**
 * @file whatsapp.types.ts
 * @max-lines 300  
 * @current-lines 100
 * @architecture modular
 * @validates-rules ✅
 */

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document';
  mediaUrl?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppContact {
  id: string;
  phoneNumber: string;
  name?: string;
  profilePictureUrl?: string;
  lastMessageAt: string;
  unreadCount: number;
  companyId: string;
  isArchived: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppConversation {
  id: string;
  contactId: string;
  contact: WhatsAppContact;
  messages: WhatsAppMessage[];
  lastMessage?: WhatsAppMessage;
  unreadCount: number;
  isArchived: boolean;
  assignedTo?: string;
  status: 'open' | 'closed' | 'pending';
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// WhatsApp Provider Types
export type WhatsAppProvider = 'twilio' | 'greenapi';

export interface WhatsAppProviderInfo {
  name: WhatsAppProvider;
  displayName: string;
  description: string;
  pros: string[];
  cons: string[];
  requiredFields: string[];
  isAvailable: boolean;
}

export interface WhatsAppProviderStatus {
  provider: WhatsAppProvider;
  isActive: boolean;
  isConfigured: boolean;
  messagesThisMonth: number;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'testing';
  lastTestResult?: string;
  lastTestedAt?: string;
}

export interface WhatsAppConfig {
  id: string;
  companyId: string;
  provider?: WhatsAppProvider;
  // Twilio fields
  twilioAccountSid?: string;
  twilioAccountSidMask?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  // Green API fields
  greenApiInstanceId?: string;
  greenApiToken?: string;
  greenApiTokenMask?: string;
  // Common fields
  whatsAppPhoneNumber?: string;
  webhookUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  category: 'greeting' | 'support' | 'sales' | 'followup' | 'custom';
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuickReply {
  id: string;
  text: string;
  shortcut: string;
  category: string;
  companyId: string;
}

export interface WhatsAppStats {
  totalConversations: number;
  unreadConversations: number;
  messagesLastMonth: number;
  responseRate: number;
  averageResponseTime: number;
}

// Props interfaces
export interface WhatsAppInboxProps {
  companyId: string;
  className?: string;
}

export interface ConversationListProps {
  conversations: WhatsAppConversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onSearchConversations: (query: string) => void;
  loading?: boolean;
  searchQuery?: string;
  filter?: 'all' | 'unread' | 'archived';
  onFilterChange?: (filter: 'all' | 'unread' | 'archived') => void;
}

export interface ChatViewProps {
  conversation: WhatsAppConversation | null;
  messages: WhatsAppMessage[];
  onSendMessage: (message: string) => void;
  onMarkAsRead: (messageId: string) => void;
  loading?: boolean;
  sending?: boolean;
}

export interface MessageBubbleProps {
  message: WhatsAppMessage;
  showTimestamp?: boolean;
  showStatus?: boolean;
}

export interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  quickReplies?: QuickReply[];
}

export interface WhatsAppConfigProps {
  config?: WhatsAppConfig;
  onSave: (config: Partial<WhatsAppConfig>) => void;
  loading?: boolean;
}

export interface TemplateManagerProps {
  templates: MessageTemplate[];
  onCreateTemplate: (template: Omit<MessageTemplate, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTemplate: (id: string, template: Partial<MessageTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
  loading?: boolean;
}

// Provider component props
export interface WhatsAppProviderSelectorProps {
  selectedProvider: WhatsAppProvider;
  onProviderChange: (provider: WhatsAppProvider) => void;
  providers: WhatsAppProviderInfo[];
  disabled?: boolean;
  compact?: boolean;
}

export interface WhatsAppProviderConfigProps {
  provider: WhatsAppProvider;
  config: Partial<WhatsAppConfig>;
  onChange: (config: Partial<WhatsAppConfig>) => void;
  onTest: (testData: { phoneNumber: string }) => void;
  testResult?: { success: boolean; message: string };
  testing?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

export interface WhatsAppProviderComparisonProps {
  providers: WhatsAppProviderInfo[];
  selectedProvider: WhatsAppProvider;
  onSelectProvider: (provider: WhatsAppProvider) => void;
}

export interface WhatsAppStatusProps {
  status: WhatsAppProviderStatus;
  onRefresh: () => void;
  refreshing?: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Store types
export interface WhatsAppStore {
  // State
  conversations: WhatsAppConversation[];
  selectedConversationId: string | null;
  messages: Record<string, WhatsAppMessage[]>;
  config: WhatsAppConfig | null;
  templates: MessageTemplate[];
  quickReplies: QuickReply[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  
  // Actions
  setConversations: (conversations: WhatsAppConversation[]) => void;
  selectConversation: (conversationId: string | null) => void;
  addMessage: (message: WhatsAppMessage) => void;
  updateMessage: (messageId: string, updates: Partial<WhatsAppMessage>) => void;
  setMessages: (conversationId: string, messages: WhatsAppMessage[]) => void;
  setConfig: (config: WhatsAppConfig | null) => void;
  setTemplates: (templates: MessageTemplate[]) => void;
  setQuickReplies: (quickReplies: QuickReply[]) => void;
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  selectedConversation: WhatsAppConversation | null;
  selectedConversationMessages: WhatsAppMessage[];
  unreadCount: number;
}