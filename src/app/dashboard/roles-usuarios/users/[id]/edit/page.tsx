'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { getApiEndpoint } from '@/lib/api-url';
import { 
  UserIcon, 
  ArrowLeftIcon, 
  SaveIcon,
  XIcon,
  CheckIcon,
  MailIcon,
  PhoneIcon,
  LockIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeOffIcon,
  CalendarIcon,
  ClockIcon,
  CameraIcon,
  UploadIcon
} from 'lucide-react';

interface Role {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
  emailConfirmed: boolean;
  lastLoginAt?: string;
  createdAt: string;
  roles: Role[];
  avatarUrl?: string;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { t } = useI18n();
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    isActive: true,
    roleIds: [] as number[]
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
    fetchUser();
    fetchRoles();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiEndpoint(`/users/${userId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setFormData({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber || '',
          password: '',
          confirmPassword: '',
          isActive: data.isActive,
          roleIds: data.roles?.map((r: Role) => r.id) || []
        });
        if (data.avatarUrl) {
          console.log('User avatar URL:', data.avatarUrl);
          setAvatarPreview(data.avatarUrl);
        }
      } else {
        console.error('Error fetching user:', response.status);
        alert(t('rolesUsers.userNotFound', 'User not found'));
        router.push('/dashboard/roles-usuarios?tab=users');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      alert(t('rolesUsers.loadError', 'Error loading user'));
      router.push('/dashboard/roles-usuarios?tab=users');
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiEndpoint('/roles'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllRoles(data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = t('validation.required', 'This field is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.invalidEmail', 'Invalid email address');
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('validation.required', 'This field is required');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('validation.required', 'This field is required');
    }

    if (changePassword) {
      if (!formData.password) {
        newErrors.password = t('validation.required', 'This field is required');
      } else if (formData.password.length < 6) {
        newErrors.password = t('validation.passwordMin', 'Password must be at least 6 characters');
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('validation.passwordMismatch', 'Passwords do not match');
      }
    }

    if (formData.roleIds.length === 0) {
      newErrors.roleIds = t('validation.selectRole', 'Please select at least one role');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // First upload avatar if provided
      let avatarUrl = user?.avatarUrl;
      if (avatarFile) {
        const uploadData = new FormData();
        uploadData.append('file', avatarFile);
        
        const uploadResponse = await fetch(getApiEndpoint('/upload/avatar'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadData
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          avatarUrl = uploadResult.url;
        }
      } else if (!avatarPreview && user?.avatarUrl) {
        // Avatar was removed
        avatarUrl = undefined;
      }
      
      const payload: any = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber || null,
        isActive: formData.isActive,
        roleIds: formData.roleIds,
        avatarUrl: avatarUrl
      };

      if (changePassword && formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(getApiEndpoint(`/users/${userId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        router.push('/dashboard/roles-usuarios?tab=users&success=updated');
      } else {
        const error = await response.text();
        console.error('Error updating user:', error);
        alert(t('rolesUsers.updateUserError', 'Error updating user'));
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert(t('rolesUsers.updateUserError', 'Error updating user'));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId]
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(t('rolesUsers.imageSizeError', 'Image must be less than 5MB'));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert(t('rolesUsers.imageTypeError', 'Please select a valid image file'));
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = primaryColor;
    e.target.style.boxShadow = `0 0 0 3px ${primaryColor}33`;
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>, hasError: boolean) => {
    e.target.style.borderColor = hasError ? '#fca5a5' : '#d1d5db';
    e.target.style.boxShadow = '';
  };

  const getRoleColor = (roleName: string) => {
    const colors: { [key: string]: string } = {
      'SuperAdmin': '#ef4444',
      'CompanyAdmin': '#8b5cf6',
      'CompanyStaff': '#10b981',
      'Customer': '#6b7280',
      'Administrator': '#f59e0b',
      'Editor': '#06b6d4',
      'Support': '#3b82f6',
    };
    return colors[roleName] || '#6b7280';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('common.never', 'Never');
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loadingUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/roles-usuarios?tab=users')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}10 100%)`,
                    border: `1px solid ${primaryColor}30`
                  }}
                >
                  <UserIcon className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('rolesUsers.editUser', 'Edit User')}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('rolesUsers.updateUserDetails', 'Update user details and permissions')}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard/roles-usuarios?tab=users')}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <XIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.cancel', 'Cancel')}</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="hidden sm:inline">{t('common.saving', 'Saving...')}</span>
                  </>
                ) : (
                  <>
                    <SaveIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('common.update', 'Update User')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <UserIcon className="w-5 h-5" style={{ color: primaryColor }} />
                {t('rolesUsers.personalInformation', 'Personal Information')}
              </h2>

              {/* Avatar Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Failed to load avatar:', avatarPreview);
                          setAvatarPreview('');
                        }}
                      />
                    ) : (
                      <UserIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <CameraIcon className="w-4 h-4 text-white" />
                  </label>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {t('rolesUsers.profilePicture', 'Profile Picture')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {t('rolesUsers.imageRequirements', 'JPG, PNG or GIF. Max size 5MB')}
                  </p>
                  <div className="flex gap-2">
                    <label
                      htmlFor="avatar-upload"
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-1"
                    >
                      <UploadIcon className="w-3 h-3" />
                      {t('common.upload', 'Upload')}
                    </label>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {t('common.remove', 'Remove')}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('rolesUsers.firstName', 'First Name')} *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    onFocus={handleInputFocus}
                    onBlur={(e) => handleInputBlur(e, !!errors.firstName)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-all ${
                      errors.firstName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder={t('rolesUsers.firstNamePlaceholder', 'Enter first name')}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('rolesUsers.lastName', 'Last Name')} *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    onFocus={handleInputFocus}
                    onBlur={(e) => handleInputBlur(e, !!errors.lastName)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-all ${
                      errors.lastName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder={t('rolesUsers.lastNamePlaceholder', 'Enter last name')}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('rolesUsers.email', 'Email')} *
                  </label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={handleInputFocus}
                      onBlur={(e) => handleInputBlur(e, !!errors.email)}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-all ${
                        errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder={t('rolesUsers.emailPlaceholder', 'user@example.com')}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('rolesUsers.phone', 'Phone')}
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      onFocus={handleInputFocus}
                      onBlur={(e) => handleInputBlur(e, false)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-all"
                      placeholder={t('rolesUsers.phonePlaceholder', '+1 (555) 123-4567')}
                    />
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <CalendarIcon className="w-3 h-3" />
                    {t('rolesUsers.createdAt', 'Created')}
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <ClockIcon className="w-3 h-3" />
                    {t('rolesUsers.lastLogin', 'Last Login')}
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(user.lastLoginAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <LockIcon className="w-5 h-5" style={{ color: primaryColor }} />
                  {t('rolesUsers.changePassword', 'Change Password')}
                </h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={changePassword}
                    onChange={(e) => setChangePassword(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('rolesUsers.enablePasswordChange', 'Change password')}
                  </span>
                </label>
              </div>

              {changePassword && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('rolesUsers.newPassword', 'New Password')} *
                      </label>
                      <div className="relative">
                        <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          onFocus={handleInputFocus}
                          onBlur={(e) => handleInputBlur(e, !!errors.password)}
                          className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-all ${
                            errors.password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder={t('rolesUsers.passwordPlaceholder', 'Min. 6 characters')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('rolesUsers.confirmPassword', 'Confirm Password')} *
                      </label>
                      <div className="relative">
                        <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          onFocus={handleInputFocus}
                          onBlur={(e) => handleInputBlur(e, !!errors.confirmPassword)}
                          className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-all ${
                            errors.confirmPassword ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder={t('rolesUsers.confirmPasswordPlaceholder', 'Repeat password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showConfirmPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">
                      {t('rolesUsers.passwordRequirements', 'Password Requirements')}:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckIcon className={`w-3 h-3 ${formData.password.length >= 6 ? 'text-green-600' : ''}`} />
                        {t('rolesUsers.minCharacters', 'At least 6 characters')}
                      </li>
                    </ul>
                  </div>
                </>
              )}

              {!changePassword && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <LockIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">
                    {t('rolesUsers.passwordNotChanged', 'Password will not be changed')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Roles and Status */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('rolesUsers.accountStatus', 'Account Status')}
              </h2>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {t('common.active', 'Active')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('rolesUsers.activeDescription', 'User can access the system')}
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={formData.isActive}
                    onChange={() => setFormData({ ...formData, isActive: true })}
                    className="text-primary-600"
                    style={{ accentColor: primaryColor }}
                  />
                </label>

                <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${!formData.isActive ? 'bg-red-500' : 'bg-gray-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {t('common.inactive', 'Inactive')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('rolesUsers.inactiveDescription', 'User cannot access the system')}
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={!formData.isActive}
                    onChange={() => setFormData({ ...formData, isActive: false })}
                    className="text-primary-600"
                    style={{ accentColor: primaryColor }}
                  />
                </label>
              </div>

              {/* Email Confirmation Status */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('rolesUsers.emailStatus', 'Email Status')}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.emailConfirmed 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {user.emailConfirmed 
                      ? t('rolesUsers.confirmed', 'Confirmed')
                      : t('rolesUsers.pending', 'Pending')}
                  </span>
                </div>
              </div>
            </div>

            {/* Roles Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5" style={{ color: primaryColor }} />
                {t('rolesUsers.assignRoles', 'Assign Roles')} *
              </h2>

              {errors.roleIds && (
                <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.roleIds}</p>
                </div>
              )}

              {loadingRoles ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: primaryColor }}></div>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
                  {allRoles.map((role) => (
                    <label
                      key={role.id}
                      className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <div className="relative mt-0.5">
                        <input
                          type="checkbox"
                          checked={formData.roleIds.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                            formData.roleIds.includes(role.id)
                              ? 'border-transparent'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          style={{
                            backgroundColor: formData.roleIds.includes(role.id) ? getRoleColor(role.name) : 'transparent'
                          }}
                        >
                          {formData.roleIds.includes(role.id) && (
                            <CheckIcon className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {role.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {role.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
