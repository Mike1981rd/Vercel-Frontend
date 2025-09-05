// Types for the Website Builder Editor

export interface Section {
  id: string;
  type: SectionType;
  name: string;
  visible: boolean;
  settings: Record<string, any>;
  sortOrder: number;
}

export enum SectionType {
  // Header Group
  ANNOUNCEMENT_BAR = 'announcement_bar',
  HEADER = 'header',
  IMAGE_BANNER = 'image_banner',
  
  // Aside Group
  CART_DRAWER = 'cart_drawer',
  SEARCH_DRAWER = 'search_drawer',
  
  // Template Sections
  SLIDESHOW = 'slideshow',
  MULTICOLUMNS = 'multicolumns',
  COLLAGE = 'collage',
  IMAGE_WITH_TEXT = 'image_with_text',
  GALLERY = 'gallery',
  CONTACT_FORM = 'contact_form',
  NEWSLETTER = 'newsletter',
  FEATURED_PRODUCT = 'featured_product',
  FEATURED_COLLECTION = 'featured_collection',
  TESTIMONIALS = 'testimonials',
  FAQ = 'faq',
  VIDEOS = 'videos',
  RICH_TEXT = 'rich_text',
  
  // Footer Group
  FOOTER = 'footer',
  
  // Product Page Specific
  PRODUCT_INFORMATION = 'product_information'
}

export interface SectionGroup {
  id: string;
  name: string;
  sections: Section[];
  isCollapsed: boolean;
  canAddSections: boolean;
}

export interface EditorState {
  selectedPageId: string | null;
  selectedPageType: PageType | null;
  sections: {
    headerGroup: Section[];
    asideGroup: Section[];
    template: Section[];
    footerGroup: Section[];
  };
  selectedSectionId: string | null;
  isConfigPanelOpen: boolean;
  hoveredSectionId: string | null;
  isDirty: boolean;
  isSaving: boolean;
}

export enum PageType {
  HOME = 'home',
  PRODUCT = 'product',
  CART = 'cart',
  CHECKOUT = 'checkout',
  COLLECTION = 'collection',
  ALL_COLLECTIONS = 'all_collections',
  ALL_PRODUCTS = 'all_products',
  CUSTOM = 'custom'
}

export interface Page {
  id: string;
  name: string;
  type: PageType;
  slug: string;
  isActive: boolean;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface SectionConfig {
  type: SectionType;
  name: string;
  description: string;
  icon: string;
  category: 'header' | 'aside' | 'template' | 'footer';
  defaultSettings: Record<string, any>;
}

export const SECTION_CONFIGS: Record<SectionType, SectionConfig> = {
  [SectionType.ANNOUNCEMENT_BAR]: {
    type: SectionType.ANNOUNCEMENT_BAR,
    name: 'Announcement bar',
    description: 'Display important messages at the top',
    icon: 'megaphone',
    category: 'header',
    defaultSettings: {
      text: 'Welcome to our store!',
      backgroundColor: '#000000',
      textColor: '#ffffff'
    }
  },
  [SectionType.HEADER]: {
    type: SectionType.HEADER,
    name: 'Header',
    description: 'Main navigation header',
    icon: 'layout-navbar',
    category: 'header',
    defaultSettings: {
      logo: null,
      menuItems: []
    }
  },
  [SectionType.IMAGE_BANNER]: {
    type: SectionType.IMAGE_BANNER,
    name: 'Image banner',
    description: 'Hero banner with text overlay',
    icon: 'image',
    category: 'header',
    defaultSettings: {
      image: null,
      title: '',
      subtitle: '',
      buttonText: '',
      buttonUrl: ''
    }
  },
  [SectionType.CART_DRAWER]: {
    type: SectionType.CART_DRAWER,
    name: 'Cart drawer',
    description: 'Shopping cart side panel',
    icon: 'shopping-cart',
    category: 'aside',
    defaultSettings: {
      position: 'right'
    }
  },
  [SectionType.SEARCH_DRAWER]: {
    type: SectionType.SEARCH_DRAWER,
    name: 'Search drawer',
    description: 'Search functionality panel',
    icon: 'search',
    category: 'aside',
    defaultSettings: {
      position: 'right'
    }
  },
  [SectionType.SLIDESHOW]: {
    type: SectionType.SLIDESHOW,
    name: 'Slideshow',
    description: 'Image carousel with text',
    icon: 'images',
    category: 'template',
    defaultSettings: {
      slides: [],
      autoplay: true,
      duration: 5000
    }
  },
  [SectionType.MULTICOLUMNS]: {
    type: SectionType.MULTICOLUMNS,
    name: 'Multicolumns',
    description: 'Multiple columns with icons',
    icon: 'columns-3',
    category: 'template',
    defaultSettings: {
      enabled: true,
      colorScheme: '1',
      width: 'large',
      desktopLayout: 'grid',
      mobileLayout: '1column',
      heading: 'Multicolumn',
      body: '',
      headingSize: 1.0,
      bodySize: 1.0,
      contentAlignment: 'left',
      columnsHeadingSize: 1.0,
      columnsBodySize: 1.0,
      desktopCardsPerRow: 3,
      desktopSpaceBetweenCards: 24,
      desktopSpacing: 24,
      mobileSpaceBetweenCards: 16,
      mobileSpacing: 24,
      colorColumns: false,
      showArrowsOnHover: false,
      buttonLabel: '',
      buttonLink: '',
      buttonStyle: 'solid',
      autoplay: 'none',
      autoplaySpeed: 3000,
      addSidePaddings: false,
      topPadding: 0,
      bottomPadding: 0,
      containerHeight: 0,
      customCSS: '',
      items: [
        {
          id: `item_${Date.now()}`,
          type: 'icon',
          visible: true,
          icon: 'star',
          iconSize: 64,
          heading: 'Icon column',
          body: 'Pair text with an icon to focus on your chosen product, collection or piece of news.',
          linkLabel: '',
          link: ''
        },
        {
          id: `item_${Date.now() + 1}`,
          type: 'icon',
          visible: true,
          icon: 'truck',
          iconSize: 64,
          heading: 'Icon column',
          body: 'Pair text with an icon to focus on your chosen product, collection or piece of news.',
          linkLabel: '',
          link: ''
        },
        {
          id: `item_${Date.now() + 2}`,
          type: 'icon',
          visible: true,
          icon: 'gift',
          iconSize: 64,
          heading: 'Icon column',
          body: 'Pair text with an icon to focus on your chosen product, collection or piece of news.',
          linkLabel: '',
          link: ''
        }
      ]
    }
  },
  [SectionType.COLLAGE]: {
    type: SectionType.COLLAGE,
    name: 'Collage',
    description: 'Grid of images',
    icon: 'layout-grid',
    category: 'template',
    defaultSettings: {
      images: [],
      layout: 'grid'
    }
  },
  [SectionType.IMAGE_WITH_TEXT]: {
    type: SectionType.IMAGE_WITH_TEXT,
    name: 'Image with text',
    description: 'Image alongside text content',
    icon: 'layout',
    category: 'template',
    defaultSettings: {
      enabled: true,
      colorScheme: '1',
      width: 'medium',
      contentLayout: 'left',
      imageLayout: 'grid',
      imageRatio: 1,
      rotateImages: false,
      icon: '',
      subheading: '',
      heading: 'Image with text',
      body: 'Pair text with an image to focus on your chosen product, collection, or blog post.',
      headingSize: 36,
      bodySize: 16,
      contentAlignment: 'left',
      desktopWidth: 400,
      firstButtonLabel: '',
      firstButtonLink: '',
      firstButtonStyle: 'solid',
      secondButtonLabel: '',
      secondButtonLink: '',
      secondButtonStyle: 'outline',
      addSidePaddings: true,
      topPadding: 40,
      bottomPadding: 40,
      items: []
    }
  },
  [SectionType.GALLERY]: {
    type: SectionType.GALLERY,
    name: 'Gallery',
    description: 'Photo gallery grid',
    icon: 'gallery-horizontal',
    category: 'template',
    defaultSettings: {
      images: [],
      columns: 3
    }
  },
  [SectionType.CONTACT_FORM]: {
    type: SectionType.CONTACT_FORM,
    name: 'Contact form',
    description: 'Contact form with fields',
    icon: 'mail',
    category: 'template',
    defaultSettings: {
      title: 'Contact Us',
      fields: []
    }
  },
  [SectionType.NEWSLETTER]: {
    type: SectionType.NEWSLETTER,
    name: 'Newsletter',
    description: 'Email subscription form',
    icon: 'newspaper',
    category: 'template',
    defaultSettings: {
      title: 'Subscribe to our newsletter',
      subtitle: ''
    }
  },
  [SectionType.FEATURED_PRODUCT]: {
    type: SectionType.FEATURED_PRODUCT,
    name: 'Featured product',
    description: 'Highlight a single product',
    icon: 'star',
    category: 'template',
    defaultSettings: {
      productId: null
    }
  },
  [SectionType.FEATURED_COLLECTION]: {
    type: SectionType.FEATURED_COLLECTION,
    name: 'Featured collection',
    description: 'Display a product collection',
    icon: 'folder-open',
    category: 'template',
    defaultSettings: {
      collectionId: null,
      limit: 4
    }
  },
  [SectionType.RICH_TEXT]: {
    type: SectionType.RICH_TEXT,
    name: 'Rich text',
    description: 'Add formatted text with headings, paragraphs and buttons',
    icon: 'type',
    category: 'template',
    defaultSettings: {} // Will be populated in the store
  },
  [SectionType.TESTIMONIALS]: {
    type: SectionType.TESTIMONIALS,
    name: 'Testimonials',
    description: 'Customer reviews and testimonials',
    icon: 'message-circle',
    category: 'template',
    defaultSettings: {
      enabled: true,
      colorScheme: '1',
      colorBackground: false,
      colorTestimonials: false,
      width: 'page',
      desktopLayout: 'bottom-carousel',
      mobileLayout: 'slideshow',
      desktopCardsPerRow: 2,
      desktopSpaceBetweenCards: 16,
      desktopContentAlignment: 'left',
      mobileContentAlignment: 'left',
      showRating: true,
      ratingStarsColor: '#FAA613',
      subheading: 'TESTIMONIALS',
      heading: 'Customer stories',
      headingSize: 'heading_3',
      body: 'Show customer reviews: tweets, blog posts, or interviews. Invite customers to share their impressions of your products.',
      bodySize: 'body_3',
      overlayOpacity: 20,
      imageSize: 100,
      autoplay: 'none',
      autoplayMode: 'none',
      autoplaySpeed: 3,
      addSidePaddings: true,
      topPadding: 96,
      bottomPadding: 30,
      items: []
    }
  },
  [SectionType.FAQ]: {
    type: SectionType.FAQ,
    name: 'FAQ',
    description: 'Frequently asked questions',
    icon: 'help-circle',
    category: 'template',
    defaultSettings: {
      enabled: true,
      colorScheme: '1',
      colorBackground: false,
      colorTabs: 'categories',
      width: 'page',
      layout: 'tabs_bottom',
      expandFirstTab: false,
      heading: 'Preguntas Frecuentes',
      body: '',
      headingSize: 'heading_3',
      bodySize: 'body_3',
      headingWeight: 'bold',
      bodyWeight: 'normal',
      collapserStyle: 'plus_minus',
      addSidePaddings: false,
      topPadding: 96,
      bottomPadding: 96,
      items: []
    }
  },
  [SectionType.VIDEOS]: {
    type: SectionType.VIDEOS,
    name: 'Videos',
    description: 'Embed videos',
    icon: 'video',
    category: 'template',
    defaultSettings: {
      videoUrl: ''
    }
  },
  [SectionType.RICH_TEXT]: {
    type: SectionType.RICH_TEXT,
    name: 'Rich text',
    description: 'Formatted text content',
    icon: 'text',
    category: 'template',
    defaultSettings: {
      content: ''
    }
  },
  [SectionType.FOOTER]: {
    type: SectionType.FOOTER,
    name: 'Footer',
    description: 'Site footer',
    icon: 'layout-navbar-collapse',
    category: 'footer',
    defaultSettings: {
      columns: [],
      copyright: ''
    }
  },
  [SectionType.PRODUCT_INFORMATION]: {
    type: SectionType.PRODUCT_INFORMATION,
    name: 'Product information',
    description: 'Product details and buy button',
    icon: 'package',
    category: 'template',
    defaultSettings: {
      showPrice: true,
      showDescription: true,
      showVariants: true
    }
  },
  ['room_gallery' as any]: {
    type: 'room_gallery' as any,
    name: 'Room Gallery',
    description: 'Airbnb-style photo gallery',
    icon: 'images',
    category: 'template',
    defaultSettings: {
      enabled: true,
      roomId: undefined,
      images: [
        "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/f2563160-2ae7-4e77-ba23-ddc37eb69a16.jpeg?w=1200",
        "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/bd736170-1ade-409f-85f9-a83e607efa66.jpeg?w=800",
        "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/76e5f102-3099-42f5-997e-3fb1bb9c2c6e.jpeg?w=800",
        "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/889862f5-5804-4b68-ab1e-1edf2586105f.jpeg?w=800",
        "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/5d9241e9-ab07-444d-b476-f509f74a3df8.jpeg?w=800"
      ],
      layoutStyle: 'airbnb',
      cornerRadius: 'medium',
      showAllPhotosButton: true,
      autoFetch: true
    }
  },
  ['room_title_host' as any]: {
    type: 'room_title_host' as any,
    name: 'Room Title & Host',
    description: 'Room title, location and host info',
    icon: 'home',
    category: 'template',
    defaultSettings: {
      enabled: true,
      title: 'Beautiful Room in City Center',
      location: 'San Francisco, California',
      guests: 4,
      bedrooms: 2,
      beds: 2,
      baths: 1,
      rating: 4.92,
      reviewCount: 124,
      hostName: 'John',
      hostImage: 'https://a0.muscache.com/defaults/user_pic-64x64.png?v=3',
      hostVerified: true,
      hostSuperhost: true,
      hostYears: 5,
      showShareSave: true
    }
  },
  ['room_highlights' as any]: {
    type: 'room_highlights' as any,
    name: 'Room Highlights',
    description: 'Key features and highlights',
    icon: 'sparkles',
    category: 'template',
    defaultSettings: {
      enabled: true,
      highlights: [
        {
          id: '1',
          icon: 'Sparkles',
          title: 'Dedicated workspace',
          description: 'A room with wifi that\'s well-suited for working.'
        },
        {
          id: '2', 
          icon: 'MapPin',
          title: 'Great location',
          description: '95% of recent guests gave the location a 5-star rating.'
        },
        {
          id: '3',
          icon: 'Calendar',
          title: 'Free cancellation before Feb 14',
          description: 'Get a full refund if you change your mind.'
        }
      ]
    }
  },
  ['room_description' as any]: {
    type: 'room_description' as any,
    name: 'Room Description',
    description: 'Detailed room description',
    icon: 'file-text',
    category: 'template',
    defaultSettings: {
      enabled: true,
      description: 'This stylish apartment is perfect for your stay...',
      showMore: true,
      maxLines: 3
    }
  },
  ['room_amenities' as any]: {
    type: 'room_amenities' as any,
    name: 'Room Amenities',
    description: 'What this place offers',
    icon: 'list-checks',
    category: 'template',
    defaultSettings: {
      enabled: true,
      title: 'What this place offers',
      amenities: [
        { id: '1', icon: 'Wifi', name: 'Wifi', available: true },
        { id: '2', icon: 'Tv', name: 'TV', available: true },
        { id: '3', icon: 'Utensils', name: 'Kitchen', available: true },
        { id: '4', icon: 'Car', name: 'Free parking', available: true },
        { id: '5', icon: 'Wind', name: 'Air conditioning', available: true }
      ],
      columns: 2,
      showUnavailable: true
    }
  },
  ['room_sleeping' as any]: {
    type: 'room_sleeping' as any,
    name: 'Room Sleeping',
    description: 'Where you\'ll sleep',
    icon: 'bed',
    category: 'template',
    defaultSettings: {
      enabled: true,
      title: 'Where you\'ll sleep',
      areas: [
        {
          id: '1',
          icon: 'Bed',
          title: 'Bedroom 1',
          description: '1 queen bed'
        },
        {
          id: '2',
          icon: 'Bed',
          title: 'Bedroom 2', 
          description: '2 single beds'
        }
      ]
    }
  },
  ['room_reviews' as any]: {
    type: 'room_reviews' as any,
    name: 'Room Reviews',
    description: 'Guest reviews and ratings',
    icon: 'star',
    category: 'template',
    defaultSettings: {
      enabled: true,
      title: 'Guest reviews',
      averageRating: 4.92,
      totalReviews: 124,
      reviews: [
        {
          id: '1',
          author: 'Sarah',
          avatar: '',
          date: 'December 2023',
          rating: 5,
          comment: 'Great place to stay! The location was perfect and the host was very responsive.'
        },
        {
          id: '2',
          author: 'John',
          avatar: '',
          date: 'November 2023',
          rating: 5,
          comment: 'Beautiful apartment with all the amenities needed. Would definitely stay again!'
        },
        {
          id: '3',
          author: 'Maria',
          avatar: '',
          date: 'October 2023',
          rating: 4,
          comment: 'Nice and clean place. Very comfortable beds and great neighborhood.'
        },
        {
          id: '4',
          author: 'David',
          avatar: '',
          date: 'September 2023',
          rating: 5,
          comment: 'Exceeded our expectations! The photos don\'t do it justice.'
        }
      ],
      showAllButton: true
    }
  },
  ['room_map' as any]: {
    type: 'room_map' as any,
    name: 'Room Map',
    description: 'Location and map',
    icon: 'map-pin',
    category: 'template',
    defaultSettings: {
      enabled: true,
      title: 'Where you\'ll be',
      address: '123 Main Street, San Francisco, CA 94102',
      neighborhood: 'Downtown',
      city: 'San Francisco, California',
      description: 'Great location with easy access to public transportation.',
      mapImage: '',
      showExactLocation: false
    }
  },
  ['room_calendar' as any]: {
    type: 'room_calendar' as any,
    name: 'Room Calendar',
    description: 'Availability calendar and pricing',
    icon: 'calendar',
    category: 'template',
    defaultSettings: {
      enabled: true,
      title: 'Select check-in date',
      subtitle: 'Add your travel dates for exact pricing',
      minimumNights: 2,
      blockedDates: [],
      pricePerNight: 125,
      cleaningFee: 45,
      serviceFee: 28,
      showPricing: true
    }
  },
  ['room_host_card' as any]: {
    type: 'room_host_card' as any,
    name: 'Room Host Card',
    description: 'Detailed host information',
    icon: 'user-circle',
    category: 'template',
    defaultSettings: {
      enabled: true,
      title: 'Meet your Host',
      hostName: 'Sarah',
      hostImage: '',
      hostSince: '2018',
      reviewCount: 256,
      rating: 4.95,
      responseRate: 100,
      responseTime: 'within an hour',
      isSuperhost: true,
      isVerified: true,
      bio: 'Hi! I\'m Sarah, and I love hosting guests from around the world.',
      languages: ['English', 'Spanish', 'French'],
      work: 'Interior Designer',
      location: 'San Francisco, California'
    }
  },
  ['room_things' as any]: {
    type: 'room_things' as any,
    name: 'Room Things to Know',
    description: 'House rules and policies',
    icon: 'info',
    category: 'template',
    defaultSettings: {
      enabled: true,
      title: 'Things to know',
      houseRules: [],
      safetyProperty: [],
      cancellationPolicy: [],
      showMoreButton: true,
      colorScheme: '1'
    }
  }
};