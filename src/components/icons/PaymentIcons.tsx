/**
 * Payment provider icons as SVG components
 */

export const VisaIcon = () => (
  <svg viewBox="0 0 48 32" className="h-full w-auto">
    <rect width="48" height="32" rx="4" fill="#1A1F71"/>
    <path d="M19.5 19.5L21.5 12.5H23.5L21.5 19.5H19.5Z" fill="white"/>
    <path d="M28 12.5L26.5 17L25 12.5H23L25.5 19.5H27.5L30 12.5H28Z" fill="white"/>
    <path d="M16 12.5H14L11.5 19.5H13.5L14 18H16L16.5 19.5H18.5L16 12.5ZM14.5 16.5L15 14L15.5 16.5H14.5Z" fill="white"/>
    <path d="M31 17C31 18.5 32 19.5 33.5 19.5C34.5 19.5 35 19 35 19V17.5C35 17.5 34.5 18 33.5 18C32.5 18 32.5 17 32.5 16C32.5 15 32.5 14 33.5 14C34.5 14 35 14.5 35 14.5V13C35 13 34.5 12.5 33.5 12.5C32 12.5 31 13.5 31 15V17Z" fill="white"/>
  </svg>
);

export const MastercardIcon = () => (
  <svg viewBox="0 0 48 32" className="h-full w-auto">
    <rect width="48" height="32" rx="4" fill="#EB001B"/>
    <rect x="24" width="24" height="32" rx="4" fill="#F79E1B"/>
    <rect x="18" width="12" height="32" fill="#FF5F00"/>
  </svg>
);

export const AmexIcon = () => (
  <svg viewBox="0 0 48 32" className="h-full w-auto">
    <rect width="48" height="32" rx="4" fill="#006FCF"/>
    <path d="M10 16L12 12H14L15 14L16 12H18L20 16H18L17.5 15L17 16H15L14.5 15L14 16H12L13 14L12 12H10V16Z" fill="white"/>
    <path d="M20 16V12H24V13H22V13.5H24V14.5H22V15H24V16H20Z" fill="white"/>
    <path d="M25 12L26 14L27 12H29L27 16H25L23 12H25Z" fill="white"/>
    <path d="M30 16L29 14L28 16H26L28 12H30L32 16H30Z" fill="white"/>
  </svg>
);

export const DiscoverIcon = () => (
  <svg viewBox="0 0 48 32" className="h-full w-auto">
    <rect width="48" height="32" rx="4" fill="#FF6000"/>
    <circle cx="36" cy="16" r="8" fill="#FFB700"/>
  </svg>
);

export const ApplePayIcon = () => (
  <svg viewBox="0 0 48 32" className="h-full w-auto">
    <rect width="48" height="32" rx="4" fill="black"/>
    <path d="M15.5 13C15.5 12 16 11 17 11C18 11 18.5 12 18.5 13C18.5 14 18 15 17 15C16 15 15.5 14 15.5 13Z" fill="white"/>
    <path d="M14 17C14 16 14.5 15 15.5 15C16.5 15 17 16 17 17V19C17 20 16.5 21 15.5 21C14.5 21 14 20 14 19V17Z" fill="white"/>
    <text x="20" y="19" fill="white" fontSize="8" fontFamily="system-ui">Pay</text>
  </svg>
);

export const GooglePayIcon = () => (
  <svg viewBox="0 0 48 32" className="h-full w-auto">
    <rect width="48" height="32" rx="4" fill="white"/>
    <path d="M20 12V20H18V16H16C15 16 14 15 14 14C14 13 15 12 16 12H20ZM18 14H16V14.5H18V14Z" fill="#4285F4"/>
    <path d="M24 16C24 14 25 12 27 12V14C26 14 26 15 26 16C26 17 26 18 27 18V20C25 20 24 18 24 16Z" fill="#EA4335"/>
    <path d="M30 20L28 16L30 12H32L30.5 16L32 20H30Z" fill="#34A853"/>
  </svg>
);

export const AmazonPayIcon = () => (
  <svg viewBox="0 0 48 32" className="h-full w-auto">
    <rect width="48" height="32" rx="4" fill="#232F3E"/>
    <path d="M24 12C20 12 16 14 16 16C16 18 20 20 24 20C28 20 32 18 32 16C32 14 28 12 24 12Z" fill="#FF9900"/>
    <path d="M26 18C26 19 25 20 24 20C23 20 22 19 22 18L26 18Z" fill="#FF9900"/>
  </svg>
);

export const DinersIcon = () => (
  <svg viewBox="0 0 48 32" className="h-full w-auto">
    <rect width="48" height="32" rx="4" fill="#0079BE"/>
    <circle cx="24" cy="16" r="7" fill="white"/>
    <circle cx="24" cy="16" r="5" fill="#0079BE"/>
  </svg>
);