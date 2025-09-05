'use client';

import React, { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { CustomerDetailDto } from '@/types/customer';
import { customerAPI } from '@/lib/api/customers';
import { useRouter } from 'next/navigation';
import { CountryFlag, countries } from '@/components/ui/CountryFlag';
import { OverviewFormData } from '../CustomerDetail';

interface CustomerOverviewTabProps {
  customer: CustomerDetailDto | null;
  formData: OverviewFormData;
  onFormChange: (data: Partial<OverviewFormData>) => void;
  primaryColor: string;
  onRefresh: () => void;
  isNewCustomer?: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  onSave: () => Promise<void>;
}

export default function CustomerOverviewTab({ 
  customer, 
  formData,
  onFormChange,
  primaryColor, 
  onRefresh, 
  isNewCustomer = false,
  isEditing,
  setIsEditing,
  onSave
}: CustomerOverviewTabProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    onFormChange({ [field]: value });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert(t('customers.avatarTypeError', 'Please select a valid image file'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(t('customers.avatarSizeError', 'Image size must not exceed 5MB'));
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5266/api/upload/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      onFormChange({ avatarUrl: result.url });
      
      if (!isNewCustomer && customer?.id) {
        await customerAPI.updateAvatar(customer.id, { avatarUrl: result.url });
        onRefresh();
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert(t('customers.avatarUploadError', 'Error uploading avatar'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert(t('common.error', 'An error occurred while saving'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isNewCustomer) {
      router.push('/dashboard/clientes');
    } else {
      setIsEditing(false);
      // Reset form data to original customer data
      if (customer) {
        onFormChange({
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          username: customer.username || '',
          email: customer.email || '',
          phoneNumber: customer.phoneNumber || '',
          birthDate: customer.birthDate || '',
          gender: customer.gender || '',
          status: customer.status || 'Active',
          loyaltyTier: customer.loyaltyTier || 'Silver',
          preferredLanguage: customer.preferredLanguage || 'English',
          preferredCurrency: customer.preferredCurrency || 'USD',
          companyName: customer.companyName || '',
          taxId: customer.taxId || '',
          country: customer.country || '',
          avatarUrl: customer.avatarUrl || ''
        });
      }
    }
  };

  // Metrics data with better icons
  const metrics = [
    {
      label: t('customers.metrics.totalOrders', 'Orders'),
      value: customer?.totalOrders || 0,
      icon: '📦',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      trend: '+12%',
      trendUp: true
    },
    {
      label: t('customers.metrics.totalSpent', 'Spent'),
      value: `$${(customer?.totalSpent || 0).toLocaleString()}`,
      icon: '💰',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      trend: '+8%',
      trendUp: true
    },
    {
      label: t('customers.metrics.loyaltyPoints', 'Points'),
      value: customer?.loyaltyPoints || 0,
      icon: '⭐',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      trend: '+150',
      trendUp: true
    },
    {
      label: t('customers.metrics.averageOrder', 'Avg Order'),
      value: `$${(customer?.averageOrderValue || 0).toFixed(0)}`,
      icon: '📈',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      trend: '+5%',
      trendUp: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Premium': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Inactive': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      case 'Suspended': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-6">
      {/* Mobile-First Compact Header */}
      {!isNewCustomer && (
        <div className="md:hidden bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Customer ID #{customer?.customerId || '000000'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {customer ? new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
              </p>
            </div>
            <button 
              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg"
            >
              Delete Customer
            </button>
          </div>
        </div>
      )}


      {/* Metrics Cards - Responsive Grid for Mobile */}
      {!isNewCustomer && (
        <div className="px-4 py-4 md:p-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {/* Account Balance Card */}
            <div className="col-span-2 md:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${(customer?.accountBalance || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('customers.detail.creditLeft', 'Credit Left')}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Account balance for next purchase
              </p>
            </div>

            {/* Loyalty Program Card */}
            <div className="col-span-2 md:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  {formData.loyaltyTier}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {customer?.loyaltyPoints || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('customers.detail.points', 'points')}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                3000 points to next tier
              </p>
            </div>

            {/* Wishlist Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2.5 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {customer?.wishlistCount || 15}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('customers.detail.wishlist', 'Wishlist')}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                items in wishlist
              </p>
            </div>

            {/* Coupons Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {customer?.couponsCount || 21}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('customers.detail.coupons', 'Coupons')}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Coupons you win
              </p>
            </div>
          </div>
        </div>
      )}


      {/* Form Sections - Better Mobile Design */}
      <div className="px-4 md:px-6 space-y-4 pb-6">
        {/* Details Section - Mobile Optimized */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3.5 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {t('customers.detail.details', 'Details')}
            </h3>
          </div>

          <div className="p-4 space-y-4">
            {/* Avatar Upload for Edit Mode - Mobile Centered */}
            {isEditing && (
              <div className="md:hidden flex justify-center py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-lg">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                        <svg className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <label 
                    htmlFor="avatar-upload-mobile"
                    className="absolute -bottom-1 -right-1 p-2.5 rounded-full shadow-lg cursor-pointer hover:shadow-xl transition-all hover:scale-110"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </label>
                  <input
                    id="avatar-upload-mobile"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 rounded-full flex items-center justify-center">
                      <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24" style={{ color: primaryColor }}>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Desktop Avatar Upload - Keep existing */}
            {isEditing && (
              <div className="hidden md:flex justify-center py-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 shadow-2xl ring-4 ring-white dark:ring-gray-700 group-hover:ring-opacity-80 transition-all">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                        <svg className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <label 
                    htmlFor="avatar-upload-desktop"
                    className="absolute -bottom-2 -right-2 p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-xl cursor-pointer hover:shadow-2xl transition-all hover:scale-110 group-hover:rotate-12"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </label>
                  <input
                    id="avatar-upload-desktop"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 rounded-full flex items-center justify-center">
                      <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24" style={{ color: primaryColor }}>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="w-11/12 md:w-full">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('customers.fields.firstName', 'First Name')} <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    placeholder={t('customers.placeholders.firstName', 'Enter first name')}
                  />
                ) : (
                  <p className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-gray-900 dark:text-white">
                    {customer?.firstName || '-'}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="w-11/12 md:w-full">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('customers.fields.lastName', 'Last Name')} <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    placeholder={t('customers.placeholders.lastName', 'Enter last name')}
                  />
                ) : (
                  <p className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-gray-900 dark:text-white">
                    {customer?.lastName || '-'}
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="w-11/12 md:w-full">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('customers.fields.username', 'Username')} <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    placeholder={t('customers.placeholders.username', '@username')}
                  />
                ) : (
                  <p className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-gray-900 dark:text-white">
                    @{customer?.username || ''}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="w-11/12 md:w-full">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('customers.fields.gender', 'Gender')}
                </label>
                {isEditing ? (
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  >
                    <option value="">{t('common.select', 'Select')}</option>
                    <option value="Male">{t('customers.gender.male', 'Male')}</option>
                    <option value="Female">{t('customers.gender.female', 'Female')}</option>
                    <option value="Other">{t('customers.gender.other', 'Other')}</option>
                    <option value="PreferNotToSay">{t('customers.gender.preferNotToSay', 'Prefer not to say')}</option>
                  </select>
                ) : (
                  <p className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-gray-900 dark:text-white">
                    {customer?.gender ? t(`customers.gender.${customer.gender.toLowerCase()}`, customer.gender) : '-'}
                  </p>
                )}
              </div>

              {/* Birthday */}
              <div className="w-11/12 md:w-full">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('customers.fields.birthDate', 'Birth Date')}
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.birthDate?.split('T')[0] || ''}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  />
                ) : (
                  <p className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-gray-900 dark:text-white">
                    {customer?.birthDate ? new Date(customer.birthDate).toLocaleDateString() : '-'}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="w-11/12 md:w-full">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('customers.fields.status', 'Status')}
                </label>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  >
                    <option value="Active">{t('common.active', 'Active')}</option>
                    <option value="Inactive">{t('common.inactive', 'Inactive')}</option>
                    <option value="Pending">{t('common.pending', 'Pending')}</option>
                    <option value="Suspended">{t('common.suspended', 'Suspended')}</option>
                  </select>
                ) : (
                  <div className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer?.status || 'Active')}`}>
                      {t(`common.${customer?.status?.toLowerCase() || 'active'}`, customer?.status || 'Active')}
                    </span>
                  </div>
                )}
              </div>

              {/* Country */}
              <div className="w-11/12 md:w-full">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('customers.fields.country', 'Country')} <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <div className="relative">
                    <select
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all appearance-none"
                      style={{ '--tw-ring-color': primaryColor } as any}
                    >
                      <option value="">{t('customers.placeholders.selectCountry', 'Select a country')}</option>
                      {Object.entries(countries).map(([code, country]) => (
                        <option key={code} value={code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {/* Flag icon for selected country */}
                    {formData.country && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <CountryFlag countryCode={formData.country} className="w-5 h-4" />
                      </div>
                    )}
                    {/* Dropdown arrow */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    {customer?.country && countries[customer.country as keyof typeof countries] ? (
                      <>
                        <CountryFlag countryCode={customer.country} className="w-5 h-4" />
                        <span className="text-gray-900 dark:text-white">
                          {countries[customer.country as keyof typeof countries].name}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-900 dark:text-white">-</span>
                    )}
                  </div>
                )}
              </div>

              {/* Tax ID */}
              <div className="w-11/12 md:w-full">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('customers.fields.taxId', 'Tax ID')}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    placeholder={t('customers.placeholders.taxId', 'Enter tax ID')}
                  />
                ) : (
                  <p className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-gray-900 dark:text-white">
                    {customer?.taxId || '-'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white dark:bg-gray-800 rounded-l-2xl rounded-r-xl md:rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-50 dark:bg-green-900/20">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {t('customers.sections.contact', 'Contact Information')}
              </span>
            </div>
          </div>

          <div className="pl-3 pr-6 md:px-4 pb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="w-11/12 md:w-full md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('customers.fields.email', 'Email Address')} <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      placeholder={t('customers.placeholders.email', 'email@example.com')}
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-900 dark:text-white">{customer?.email || ''}</span>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="w-11/12 md:w-full md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('customers.fields.phone', 'Phone Number')}
                </label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      placeholder={t('customers.placeholders.phone', '+1 (555) 000-0000')}
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-900 dark:text-white">
                      {customer?.phoneNumber || t('common.notProvided', 'Not provided')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-gray-800 rounded-l-2xl rounded-r-xl md:rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {t('customers.sections.preferences', 'Preferences')}
              </span>
            </div>
          </div>

          <div className="pl-3 pr-6 md:px-4 pb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Loyalty Tier */}
              <div className="w-11/12 md:w-full">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('customers.fields.loyaltyTier', 'Loyalty Tier')}
                </label>
                {isEditing ? (
                  <select
                    value={formData.loyaltyTier}
                    onChange={(e) => handleInputChange('loyaltyTier', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  >
                    <option value="Bronze">{t('customers.loyalty.bronze', 'Bronze')}</option>
                    <option value="Silver">{t('customers.loyalty.silver', 'Silver')}</option>
                    <option value="Gold">{t('customers.loyalty.gold', 'Gold')}</option>
                    <option value="Platinum">{t('customers.loyalty.platinum', 'Platinum')}</option>
                  </select>
                ) : (
                  <p className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <span className="inline-flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {t(`customers.loyalty.${customer?.loyaltyTier?.toLowerCase() || 'silver'}`, customer?.loyaltyTier || 'Silver')}
                      </span>
                    </span>
                  </p>
                )}
              </div>

              {/* Language */}
              <div className="w-11/12 md:w-full">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('customers.fields.language', 'Preferred Language')}
                </label>
                {isEditing ? (
                  <select
                    value={formData.preferredLanguage}
                    onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  >
                    <option value="English">{t('languages.english', 'English')}</option>
                    <option value="Spanish">{t('languages.spanish', 'Español')}</option>
                    <option value="French">{t('languages.french', 'Français')}</option>
                    <option value="Portuguese">{t('languages.portuguese', 'Português')}</option>
                  </select>
                ) : (
                  <p className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-gray-900 dark:text-white">
                    {t(`languages.${customer?.preferredLanguage?.toLowerCase() || 'english'}`, customer?.preferredLanguage || 'English')}
                  </p>
                )}
              </div>

              {/* Currency */}
              <div className="w-11/12 md:w-full">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('customers.fields.preferredCurrency', 'Preferred Currency')}
                </label>
                {isEditing ? (
                  <select
                    value={formData.preferredCurrency}
                    onChange={(e) => handleInputChange('preferredCurrency', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="DOP">DOP (RD$)</option>
                  </select>
                ) : (
                  <p className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-gray-900 dark:text-white">
                    {customer?.preferredCurrency || 'USD'}
                  </p>
                )}
              </div>

              {/* Company */}
              <div className="w-11/12 md:w-full">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('customers.fields.companyName', 'Company Name')}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    placeholder={t('customers.placeholders.companyName', 'Company name')}
                  />
                ) : (
                  <p className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-gray-900 dark:text-white">
                    {customer?.companyName || '-'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Section - Only for existing customers */}
        {!isNewCustomer && customer?.orders && Array.isArray(customer.orders) && customer.orders.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-l-2xl rounded-r-xl md:rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="pl-3 pr-6 md:px-4 py-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {t('customers.recentOrders', 'Recent Orders')}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {customer.orders.length} {t('common.total', 'total')}
                </span>
              </div>
            </div>

            <div className="pl-3 pr-6 md:p-4 space-y-3">
              {customer.orders.slice(0, 3).map((order, index) => {
                // Handle both formats - the expected format and the potentially malformed format
                const orderId = order.id || (order as any).orderId || index;
                const orderNumber = order.orderNumber || (order as any).orderId || `ORD-${orderId}`;
                const orderDate = order.createdAt || (order as any).date || new Date().toISOString();
                const itemCount = order.itemCount || (order as any).items || 0;
                const total = order.total || 0;
                const status = order.status || 'Pending';
                
                return (
                  <div key={orderId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          #{orderNumber}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          status === 'Delivered' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : status === 'Processing'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {t(`orders.status.${status.toLowerCase()}`, status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(orderDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{itemCount} {t('common.items', 'items')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ${(typeof total === 'number' ? total : 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {customer.orders.length > 3 && (
                <button className="w-full py-2 text-sm font-medium text-center rounded-xl transition-colors"
                  style={{ color: primaryColor }}
                >
                  {t('customers.viewAllOrders', 'View All Orders')} →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}