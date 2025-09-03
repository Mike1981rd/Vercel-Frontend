import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Dashboard Icon
export const DashboardIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
  </svg>
);

// Company Icon
export const CompanyIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

// Users Icon
export const UsersIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

// Roles Icon
export const RolesIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
  </svg>
);

// Clients Icon
export const ClientsIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
  </svg>
);

// Rooms Icon
export const RoomsIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

// Reservations Icon
export const ReservationsIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

// Products Icon
export const ProductsIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM13 13a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);

// Collections Icon
export const CollectionsIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
  </svg>
);

// Pages Icon
export const PagesIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

// Website Icon
export const WebsiteIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
    <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v-1z" />
  </svg>
);

// Payment Icon
export const PaymentIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);

// Domains Icon
export const DomainsIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
  </svg>
);

// Reviews Icon
export const ReviewsIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// Star Icon
export const StarIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

// Export Icon
export const ExportIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

// Trending Up Icon
export const TrendingUpIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
  </svg>
);

// Trending Down Icon
export const TrendingDownIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
  </svg>
);

// Policies Icon
export const PoliciesIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M10 2L3 7v6c0 5.55 3.84 9.74 9 9.74s9-4.19 9-9.74V7l-7-5z" clipRule="evenodd" />
  </svg>
);

// Menu Toggle Icon
export const MenuToggleIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

// Translation Icon
export const TranslationIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
  </svg>
);

// Theme Icon
export const ThemeIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
  </svg>
);

// Notification Icon
export const NotificationIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
  </svg>
);

// Settings Icon
export const SettingsIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

// ChevronRight Icon for collapsed sidebar
export const ChevronRightIcon = ({ className, size = 16 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);

// ChevronLeft Icon for expanded sidebar
export const ChevronLeftIcon = ({ className, size = 16 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

// ChevronDown Icon for collapsible menus
export const ChevronDownIcon = ({ className, size = 16 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

// WhatsApp Icon
export const WhatsAppIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M17.472 9.887c0 3.872-3.135 7.008-7.008 7.008a6.967 6.967 0 01-3.36-.855L2 17.5l1.49-4.967a6.967 6.967 0 01-.962-3.54c0-3.873 3.135-7.009 7.008-7.009 3.872 0 7.936 3.136 7.936 7.903zM10.536 2.984c-3.323 0-6.008 2.685-6.008 6.009 0 1.31.423 2.523 1.141 3.51l-.747 2.491 2.571-.73a5.977 5.977 0 003.043.831c3.323 0 6.008-2.685 6.008-6.008 0-3.324-2.794-6.103-6.008-6.103zm3.618 7.65c-.045-.075-.165-.12-.345-.21-.18-.09-1.065-.525-1.23-.585-.165-.06-.285-.09-.405.09-.12.18-.465.585-.57.705-.105.12-.21.135-.39.045-.18-.09-.76-.28-1.447-.892-.535-.477-.896-1.066-1.001-1.246-.105-.18-.011-.278.079-.368.081-.081.18-.21.27-.315.09-.105.12-.18.18-.3.06-.12.03-.225-.015-.315-.045-.09-.405-.975-.555-1.335-.146-.351-.295-.303-.405-.309-.105-.005-.225-.006-.345-.006s-.315.045-.48.225c-.165.18-.63.615-.63 1.5s.645 1.74.735 1.86c.09.12 1.27 1.935 3.075 2.715.429.185.764.296.025.495.407.166.777.143 1.07.087.326-.063 1.065-.435 1.215-.855.15-.42.15-.78.105-.855z" clipRule="evenodd" />
  </svg>
);

// Orders Icon
export const OrdersIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
  </svg>
);

// Subscribers Icon
export const SubscribersIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
);

// Navigation Icon
export const NavigationIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

// Availability Icon
export const AvailabilityIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z" clipRule="evenodd" />
    <rect x="6" y="10" width="2" height="2" rx="0.5" />
    <rect x="9" y="10" width="2" height="2" rx="0.5" />
    <rect x="12" y="10" width="2" height="2" rx="0.5" />
    <rect x="6" y="13" width="2" height="2" rx="0.5" />
    <rect x="9" y="13" width="2" height="2" rx="0.5" />
    <rect x="12" y="13" width="2" height="2" rx="0.5" />
  </svg>
);

// Editor Icon
export const EditorIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
  </svg>
);

// X Icon (Close)
export const XIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

// Arrow Left Icon
export const ArrowLeftIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

// Search Icon
export const SearchIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);

// Edit Icon
export const EditIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

// Check Icon
export const CheckIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

// Eye Icon
export const EyeIcon = ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20" className={className}>
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);