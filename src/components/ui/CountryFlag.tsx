import React from 'react';

interface CountryFlagProps {
  countryCode?: string;  // Accept country code like 'US', 'MX'
  code?: string;          // Accept flag code like 'us', 'mx' (for backward compatibility)
  className?: string;
}

export function CountryFlag({ countryCode, code, className = 'w-5 h-4' }: CountryFlagProps) {
  // Using flag-icons library format
  // Support both interfaces:
  // 1. countryCode: 'US' -> convert to 'us'
  // 2. code: 'us' -> use directly
  let flagCode: string;
  
  if (code) {
    // If code prop is provided (Store Details uses this)
    flagCode = code.toLowerCase();
  } else if (countryCode) {
    // If countryCode prop is provided (Locations uses this)
    // If it's already lowercase, use it. Otherwise convert
    flagCode = countryCode.toLowerCase();
  } else {
    // Default fallback
    flagCode = 'us';
  }
  
  return (
    <span className={`fi fi-${flagCode} ${className}`} />
  );
}

// Country data with proper codes for flags
export const countries = {
  // North America
  US: { name: 'United States', flag: 'us' },
  CA: { name: 'Canada', flag: 'ca' },
  MX: { name: 'Mexico', flag: 'mx' },
  
  // Caribbean
  DO: { name: 'Dominican Republic', flag: 'do' },
  PR: { name: 'Puerto Rico', flag: 'pr' },
  CU: { name: 'Cuba', flag: 'cu' },
  JM: { name: 'Jamaica', flag: 'jm' },
  HT: { name: 'Haiti', flag: 'ht' },
  TT: { name: 'Trinidad and Tobago', flag: 'tt' },
  BB: { name: 'Barbados', flag: 'bb' },
  
  // Central America
  GT: { name: 'Guatemala', flag: 'gt' },
  SV: { name: 'El Salvador', flag: 'sv' },
  HN: { name: 'Honduras', flag: 'hn' },
  NI: { name: 'Nicaragua', flag: 'ni' },
  CR: { name: 'Costa Rica', flag: 'cr' },
  PA: { name: 'Panama', flag: 'pa' },
  BZ: { name: 'Belize', flag: 'bz' },
  
  // South America
  AR: { name: 'Argentina', flag: 'ar' },
  BR: { name: 'Brazil', flag: 'br' },
  CL: { name: 'Chile', flag: 'cl' },
  CO: { name: 'Colombia', flag: 'co' },
  EC: { name: 'Ecuador', flag: 'ec' },
  PY: { name: 'Paraguay', flag: 'py' },
  PE: { name: 'Peru', flag: 'pe' },
  UY: { name: 'Uruguay', flag: 'uy' },
  VE: { name: 'Venezuela', flag: 've' },
  BO: { name: 'Bolivia', flag: 'bo' },
  GY: { name: 'Guyana', flag: 'gy' },
  SR: { name: 'Suriname', flag: 'sr' },
  GF: { name: 'French Guiana', flag: 'gf' },
  
  // Europe (for reference)
  ES: { name: 'Spain', flag: 'es' },
  FR: { name: 'France', flag: 'fr' },
  DE: { name: 'Germany', flag: 'de' },
  IT: { name: 'Italy', flag: 'it' },
  PT: { name: 'Portugal', flag: 'pt' },
  GB: { name: 'United Kingdom', flag: 'gb' },
};

export const currencies = {
  // North America
  USD: { code: 'USD', name: 'United States Dollar', symbol: '$', countries: ['US', 'PR'] },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', countries: ['CA'] },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: '$', countries: ['MX'] },
  
  // Caribbean
  DOP: { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', countries: ['DO'] },
  CUP: { code: 'CUP', name: 'Cuban Peso', symbol: '₱', countries: ['CU'] },
  JMD: { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', countries: ['JM'] },
  HTG: { code: 'HTG', name: 'Haitian Gourde', symbol: 'G', countries: ['HT'] },
  TTD: { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: 'TT$', countries: ['TT'] },
  BBD: { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$', countries: ['BB'] },
  
  // Central America
  GTQ: { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', countries: ['GT'] },
  HNL: { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', countries: ['HN'] },
  NIO: { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$', countries: ['NI'] },
  CRC: { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', countries: ['CR'] },
  PAB: { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', countries: ['PA'] },
  BZD: { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$', countries: ['BZ'] },
  
  // South America
  ARS: { code: 'ARS', name: 'Argentine Peso', symbol: '$', countries: ['AR'] },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', countries: ['BR'] },
  CLP: { code: 'CLP', name: 'Chilean Peso', symbol: '$', countries: ['CL'] },
  COP: { code: 'COP', name: 'Colombian Peso', symbol: '$', countries: ['CO'] },
  PEN: { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', countries: ['PE'] },
  UYU: { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', countries: ['UY'] },
  PYG: { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲', countries: ['PY'] },
  BOB: { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.', countries: ['BO'] },
  VES: { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.', countries: ['VE'] },
  GYD: { code: 'GYD', name: 'Guyanese Dollar', symbol: 'G$', countries: ['GY'] },
  SRD: { code: 'SRD', name: 'Surinamese Dollar', symbol: '$', countries: ['SR'] },
  
  // Europe
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', countries: ['ES', 'FR', 'DE', 'IT', 'PT'] },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', countries: ['GB'] },
};