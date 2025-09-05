// types.ts - Rich Text Module Types
export type RichTextBlockType = 'icon' | 'subheading' | 'heading' | 'text' | 'buttons';

export interface RichTextIcon {
  id: string;
  type: 'icon';
  icon: string | null; // null = None, string = icon identifier
  customIcon?: string; // URL for custom icon
  size: number; // px
  visible?: boolean;
}

export interface RichTextSubheading {
  id: string;
  type: 'subheading';
  text: string;
  visible?: boolean;
}

export interface RichTextHeading {
  id: string;
  type: 'heading';
  text: string;
  size: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    link?: string;
  };
  visible?: boolean;
}

export interface RichTextText {
  id: string;
  type: 'text';
  columns: 1 | 2 | 3;
  columnContent: string[]; // Array of HTML content for each column
  bodySize: 'body1' | 'body2' | 'body3' | 'body4';
  visible?: boolean;
}

export interface RichTextButton {
  label: string;
  link: string;
  style: 'solid' | 'outline' | 'text';
}

export interface RichTextButtons {
  id: string;
  type: 'buttons';
  buttons: RichTextButton[]; // Max 2 buttons
  visible?: boolean;
}

export type RichTextBlock = 
  | RichTextIcon 
  | RichTextSubheading 
  | RichTextHeading 
  | RichTextText 
  | RichTextButtons;

export interface RichTextConfig {
  colorScheme: string;
  colorBackground: boolean;
  width: 'page' | 'full' | 'narrow';
  contentAlignment: 'left' | 'center' | 'right';
  paddingTop: number;
  paddingBottom: number;
  customCSS?: string;
  blocks: RichTextBlock[];
}

export const defaultRichTextConfig: RichTextConfig = {
  colorScheme: '1',
  colorBackground: false,
  width: 'page',
  contentAlignment: 'center',
  paddingTop: 64,
  paddingBottom: 64,
  customCSS: '',
  blocks: []
};

// Helper function to create default blocks
export const createDefaultBlocks = (): RichTextBlock[] => [
  {
    id: `icon-${Date.now()}`,
    type: 'icon',
    icon: 'settings',
    size: 48
  },
  {
    id: `subheading-${Date.now() + 1}`,
    type: 'subheading',
    text: 'RICH TEXT'
  },
  {
    id: `heading-${Date.now() + 2}`,
    type: 'heading',
    text: 'Tell about your brand',
    size: 'h5'
  },
  {
    id: `text-${Date.now() + 3}`,
    type: 'text',
    columns: 1,
    columnContent: [
      'Share information about your brand with your customers. Describe a product, make announcements or welcome customers to your store.'
    ],
    bodySize: 'body3'
  },
  {
    id: `buttons-${Date.now() + 4}`,
    type: 'buttons',
    buttons: [
      {
        label: 'Button label',
        link: '/pages/about',
        style: 'solid'
      }
    ]
  }
];