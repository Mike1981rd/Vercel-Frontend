export interface ContactFormConfig {
  enabled?: boolean;
  
  // Color scheme
  colorScheme?: string;
  
  // Card style
  cardStyle?: 'none' | 'elevated' | 'glass' | 'gradient' | 'neumorphic';
  cardPadding?: number; // Padding inside the card
  
  // Width
  width?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
  
  // Content
  heading?: string;
  body?: string; // Rich text content
  headingSize?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  bodySize?: 'body1' | 'body2' | 'body3' | 'body4' | 'body5';
  contentAlignment?: 'left' | 'center';
  
  // Form configuration
  inputStyle?: 'solid' | 'outline';
  showPhoneInput?: boolean;
  showRecaptcha?: boolean;
  
  // Paddings
  addSidePaddings?: boolean;
  topPadding?: number;
  bottomPadding?: number;
  mobileTopPadding?: number;
  mobileBottomPadding?: number;
  
  // Custom CSS
  customCss?: string;
  
  // Form labels (fixed fields)
  nameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  messageLabel?: string;
  buttonText?: string;
}

export function getDefaultContactFormConfig(): ContactFormConfig {
  return {
    enabled: true,
    colorScheme: '3',
    cardStyle: 'none',
    cardPadding: 32,
    width: 'extra-small',
    
    // Content
    heading: 'Contact us',
    body: 'We are here to answer all your questions.',
    headingSize: 'h5',
    bodySize: 'body3',
    contentAlignment: 'left',
    
    // Form
    inputStyle: 'solid',
    showPhoneInput: false,
    showRecaptcha: false,
    
    // Paddings
    addSidePaddings: true,
    topPadding: 96,
    bottomPadding: 96,
    mobileTopPadding: 20,
    mobileBottomPadding: 20,
    
    // Custom CSS
    customCss: '',
    
    // Labels
    nameLabel: 'Name',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    messageLabel: 'Message',
    buttonText: 'SEND'
  };
}