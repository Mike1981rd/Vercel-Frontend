'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';
import { apiClient } from '@/lib/api/client';
import Toggle from '@/components/ui/Toggle';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Globe,
  FileText,
  Camera,
  Clock,
  Upload,
  X
} from 'lucide-react';

interface CreateHostDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  dateOfBirth: string;
  languages: string[];
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isIdentityVerified: boolean;
  responseTimeMinutes: number;
  profilePicture?: string;
  isSuperhost?: boolean;
  isActive?: boolean;
}

export default function CreateHostPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<CreateHostDto>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    dateOfBirth: '',
    languages: [],
    isPhoneVerified: false,
    isEmailVerified: false,
    isIdentityVerified: false,
    responseTimeMinutes: 60,
    profilePicture: '',
    isSuperhost: false,
    isActive: true
  });

  const [languageInput, setLanguageInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Get primary color from settings
  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, profilePicture: t('common.invalidFileType', 'Invalid file type. Please upload an image.') });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, profilePicture: t('common.fileTooLarge', 'File is too large. Maximum size is 5MB.') });
      return;
    }

    setImageFile(file);
    setUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/mediaupload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setFormData(prev => ({ ...prev, profilePicture: response.data.url }));
      setErrors(prev => ({ ...prev, profilePicture: '' }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors({ ...errors, profilePicture: t('common.uploadFailed', 'Failed to upload image') });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, profilePicture: '' }));
    setImageFile(null);
    // Reset file input
    const fileInput = document.getElementById('profile-picture-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const addLanguage = () => {
    if (languageInput.trim() && !formData.languages.includes(languageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, languageInput.trim()]
      }));
      setLanguageInput('');
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('common.required', 'Required');
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('common.required', 'Required');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('common.required', 'Required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('common.invalidEmail', 'Invalid email');
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = t('common.required', 'Required');
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
      // Convert dateOfBirth to ISO 8601 format with time component
      const submitData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? `${formData.dateOfBirth}T00:00:00Z` : ''
      };
      
      await apiClient.post('/hosts', submitData);
      router.push('/dashboard/hosts');
    } catch (error: any) {
      console.error('Error creating host:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen">
      {/* Breadcrumbs - Desktop */}
      <nav className="hidden sm:flex mb-4 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('navigation.dashboard', 'Dashboard')}
            </Link>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li>
            <Link href="/dashboard/hosts" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('navigation.hosts', 'Hosts')}
            </Link>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li className="text-gray-700 font-medium dark:text-gray-300">
            {t('hosts.newHost', 'New Host')}
          </li>
        </ol>
      </nav>

      {/* Mobile Title - Centered */}
      <div className="sm:hidden mb-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('hosts.newHost', 'New Host')}
        </h1>
      </div>

      {/* Mobile Back Button */}
      <div className="sm:hidden mb-4">
        <Link
          href="/dashboard/hosts"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back', 'Back')}
        </Link>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        {/* Header - Hidden on mobile since we have the centered title */}
        <div className="hidden sm:block p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {t('hosts.newHost', 'New Host')}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('hosts.newHostDescription', 'Add a new host to your platform')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information Section */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('hosts.sections.personal', 'Personal Information')}
              </h3>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('hosts.fields.firstName', 'First Name')} *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('hosts.fields.lastName', 'Last Name')} *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('hosts.fields.email', 'Email')} *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('hosts.fields.phone', 'Phone')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('hosts.fields.dateOfBirth', 'Date of Birth')} *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border ${
                    errors.dateOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
              </div>
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Response Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('hosts.fields.responseTime', 'Response Time')} ({t('common.minutes', 'minutes')})
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  name="responseTimeMinutes"
                  value={formData.responseTimeMinutes}
                  onChange={handleChange}
                  min="1"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
              </div>
            </div>

            {/* Profile Picture */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('hosts.fields.profilePicture', 'Profile Picture')}
              </label>
              
              {!formData.profilePicture ? (
                <div className="mt-1">
                  <label htmlFor="profile-picture-input" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {uploadingImage ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white"></div>
                            {t('common.uploading', 'Uploading...')}
                          </span>
                        ) : (
                          <>
                            <span className="font-medium" style={{ color: primaryColor }}>
                              {t('common.uploadFile', 'Upload a file')}
                            </span>
                            {' '}{t('common.orDragDrop', 'or drag and drop')}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        PNG, JPG, GIF, WEBP {t('common.upTo', 'up to')} 5MB
                      </p>
                    </div>
                  </label>
                  <input
                    id="profile-picture-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-4">
                  <img 
                    src={formData.profilePicture} 
                    alt="Profile preview" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {imageFile?.name || t('hosts.profileUploaded', 'Profile picture uploaded')}
                    </p>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="mt-2 text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      {t('common.remove', 'Remove')}
                    </button>
                  </div>
                  <label htmlFor="profile-picture-input" className="cursor-pointer">
                    <button
                      type="button"
                      onClick={() => document.getElementById('profile-picture-input')?.click()}
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {t('common.change', 'Change')}
                    </button>
                  </label>
                  <input
                    id="profile-picture-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </div>
              )}
              
              {errors.profilePicture && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.profilePicture}</p>
              )}
            </div>

            {/* Bio */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('hosts.fields.bio', 'Biography')}
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
              </div>
            </div>

            {/* Languages */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('hosts.fields.languages', 'Languages')}
              </label>
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    placeholder={t('hosts.addLanguage', 'Add a language')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  />
                </div>
                <button
                  type="button"
                  onClick={addLanguage}
                  className="px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: primaryColor }}
                >
                  {t('common.add', 'Add')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((language) => (
                  <span
                    key={language}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    {language}
                    <button
                      type="button"
                      onClick={() => removeLanguage(language)}
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Verification Section */}
            <div className="lg:col-span-2 mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('hosts.sections.verification', 'Verification')}
              </h3>
              <div className="space-y-4">
                <Toggle
                  checked={formData.isPhoneVerified}
                  onChange={(checked) => setFormData(prev => ({ ...prev, isPhoneVerified: checked }))}
                  label={t('hosts.fields.phoneVerified', 'Phone Verified')}
                  description={t('hosts.phoneVerifiedDesc', 'Phone number has been verified')}
                />
                <Toggle
                  checked={formData.isEmailVerified}
                  onChange={(checked) => setFormData(prev => ({ ...prev, isEmailVerified: checked }))}
                  label={t('hosts.fields.emailVerified', 'Email Verified')}
                  description={t('hosts.emailVerifiedDesc', 'Email address has been verified')}
                />
                <Toggle
                  checked={formData.isIdentityVerified}
                  onChange={(checked) => setFormData(prev => ({ ...prev, isIdentityVerified: checked }))}
                  label={t('hosts.fields.identityVerified', 'Identity Verified')}
                  description={t('hosts.identityVerifiedDesc', 'Government ID has been verified')}
                />
              </div>
            </div>

            {/* Status Section */}
            <div className="lg:col-span-2 mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('hosts.sections.status', 'Status')}
              </h3>
              <div className="space-y-4">
                <Toggle
                  checked={formData.isSuperhost || false}
                  onChange={(checked) => setFormData(prev => ({ ...prev, isSuperhost: checked }))}
                  label={t('hosts.fields.isSuperhost', 'Superhost')}
                  description={t('hosts.superhostDescription', 'Special badge for exceptional hosts')}
                />
                <Toggle
                  checked={formData.isActive || false}
                  onChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  label={t('hosts.fields.isActive', 'Active')}
                  description={t('hosts.activeDescription', 'Host is available for bookings')}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="lg:col-span-2 flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/dashboard/hosts"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('common.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t('common.save', 'Save')}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}