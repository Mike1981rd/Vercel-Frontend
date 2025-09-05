export interface CustomerDto {
  id: number;
  customerId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: string;
  avatarUrl?: string;
  status: string;
  accountBalance: number;
  loyaltyPoints: number;
  loyaltyTier: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue?: number;
  preferredLanguage?: string;
  preferredCurrency?: string;
  preferredContactMethod?: string;
  isTwoFactorEnabled: boolean;
  lastActivityAt?: string;
  lastPasswordChangeAt?: string;
  createdAt: string;
  companyName?: string;
  taxId?: string;
}

export interface CustomerDetailDto extends CustomerDto {
  // Additional properties not in base CustomerDto
  country?: string;
  avatar?: string;
  fullName?: string;
  wishlistCount?: number;
  couponsCount?: number;
  addresses?: CustomerAddressDto[];
  paymentMethods?: CustomerPaymentMethodDto[];
  notificationPreferences?: any;
  devices?: CustomerDeviceDto[];
  wishlistItems?: CustomerWishlistItemDto[];
  coupons?: CustomerCouponDto[];
  orders?: CustomerOrderDto[];
  recoveryEmail?: string;
  securityQuestions?: any[];
  sessionTimeout?: number;
  billingEmail?: string;
  autoCharge?: boolean;
  paperlessBilling?: boolean;
  // Billing address properties
  billingAddress?: string;
  billingApartment?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
  billingPostalCode?: string;
}

export interface CustomerAddressDto {
  id: number;
  type: string;
  label: string;
  street: string;
  apartment?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt: string;
  fullAddress?: string;
  // Alternative property names for compatibility
  addressLine1?: string;
  addressLine2?: string;
}

export interface CustomerPaymentMethodDto {
  id: number;
  cardType: string;
  cardholderName: string;
  lastFourDigits: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

export interface CustomerDeviceDto {
  id: number;
  deviceName: string;
  deviceType: string;
  platform: string;
  browser: string;
  ipAddress?: string;
  lastUsedAt: string;
  isTrusted: boolean;
}

export interface CustomerWishlistItemDto {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  productPrice: number;
  addedAt: string;
}

export interface CustomerCouponDto {
  id: number;
  code: string;
  description: string;
  discountAmount: number;
  discountType: string;
  validUntil: string;
  isActive: boolean;
}

export interface CustomerOrderDto {
  id: number;
  orderNumber: string;
  createdAt: string;
  itemCount: number;
  total: number;
  status: string;
}