'use client';

import React, { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { CustomerDetailDto } from '@/types/customer';
import { SecurityFormData } from '../CustomerDetail';

interface CustomerSecurityTabProps {
  customer: CustomerDetailDto | null;
  formData: SecurityFormData;
  onFormChange: (data: Partial<SecurityFormData>) => void;
  primaryColor: string;
  onRefresh: () => void;
  isNewCustomer?: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

export default function CustomerSecurityTab({ 
  customer, 
  formData,
  onFormChange,
  primaryColor, 
  onRefresh, 
  isNewCustomer = false,
  isEditing,
  setIsEditing
}: CustomerSecurityTabProps) {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    setPasswordStrength(Math.min(strength, 5));
  };

  const handlePasswordChange = (value: string) => {
    onFormChange({ newPassword: value });
    calculatePasswordStrength(value);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return t('security.passwordStrength.veryWeak', 'Very Weak');
    if (passwordStrength === 1) return t('security.passwordStrength.weak', 'Weak');
    if (passwordStrength === 2) return t('security.passwordStrength.fair', 'Fair');
    if (passwordStrength === 3) return t('security.passwordStrength.good', 'Good');
    if (passwordStrength === 4) return t('security.passwordStrength.strong', 'Strong');
    return t('security.passwordStrength.veryStrong', 'Very Strong');
  };

  const handleSecurityQuestionChange = (index: number, field: 'question' | 'answer', value: string) => {
    const questions = [...formData.securityQuestions];
    questions[index] = { ...questions[index], [field]: value };
    onFormChange({ securityQuestions: questions });
  };

  const addSecurityQuestion = () => {
    onFormChange({ 
      securityQuestions: [...formData.securityQuestions, { question: '', answer: '' }] 
    });
  };

  const removeSecurityQuestion = (index: number) => {
    const questions = formData.securityQuestions.filter((_, i) => i !== index);
    onFormChange({ securityQuestions: questions });
  };
  
  const handleResetPassword = async () => {
    if (!confirm(t('security.confirmReset', 'Are you sure you want to reset this customer\'s password? A temporary password will be generated.'))) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5266/api/customers/${customer?.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          forcePasswordChange: true,
          sendEmail: false // Email service not implemented yet
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      const result = await response.json();
      
      // Create a modal-like div to show the password (copyable)
      const modalDiv = document.createElement('div');
      modalDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 10px 50px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 400px;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      
      modalDiv.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: #22c55e; font-size: 20px;">
          ✅ ${t('security.passwordReset', 'Password Reset Successful!')}
        </h3>
        <p style="margin: 10px 0; color: #333;">
          ${t('security.tempPassword', 'Temporary Password')}:
        </p>
        <div style="
          background: #f3f4f6; 
          padding: 15px; 
          border-radius: 5px; 
          margin: 10px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        ">
          <input 
            type="text" 
            value="${result.temporaryPassword}" 
            readonly 
            id="tempPasswordInput"
            style="
              flex: 1;
              background: transparent;
              border: none;
              font-family: monospace;
              font-size: 16px;
              font-weight: bold;
              color: #1f2937;
              outline: none;
            "
          />
          <button 
            onclick="
              const input = document.getElementById('tempPasswordInput');
              input.select();
              document.execCommand('copy');
              this.textContent = '✓ Copied!';
              this.style.background = '#22c55e';
              setTimeout(() => {
                this.textContent = '📋 Copy';
                this.style.background = '#3b82f6';
              }, 2000);
            "
            style="
              padding: 8px 16px;
              background: #3b82f6;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-weight: 500;
              transition: all 0.2s;
            "
            onmouseover="this.style.background='#2563eb'"
            onmouseout="this.style.background='#3b82f6'"
          >
            📋 Copy
          </button>
        </div>
        <p style="margin: 15px 0 20px 0; color: #666; font-size: 14px;">
          ⚠️ ${t('security.copyPassword', 'Please copy this password now. It will not be shown again.')}
        </p>
        <button 
          onclick="
            document.body.removeChild(this.parentElement.parentElement);
          "
          style="
            width: 100%;
            padding: 12px;
            background: #22c55e;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            font-size: 16px;
          "
          onmouseover="this.style.background='#16a34a'"
          onmouseout="this.style.background='#22c55e'"
        >
          Close
        </button>
      `;
      
      // Create overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
      `;
      overlay.appendChild(modalDiv);
      document.body.appendChild(overlay);
      
      // Auto-select the password for easy copying
      setTimeout(() => {
        const input = document.getElementById('tempPasswordInput') as HTMLInputElement;
        if (input) {
          input.select();
        }
      }, 100);
      
      // Refresh the customer data
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert(t('security.resetError', 'Error resetting password. Please try again.'));
    }
  };

  // Mock login history data - in production, this would come from the API
  const loginHistory = [
    { id: 1, date: '2024-03-20 14:30', ip: '192.168.1.100', location: 'Santo Domingo, DO', device: 'Chrome on Windows', status: 'Success' },
    { id: 2, date: '2024-03-19 09:15', ip: '192.168.1.100', location: 'Santo Domingo, DO', device: 'Safari on iPhone', status: 'Success' },
    { id: 3, date: '2024-03-18 18:45', ip: '201.229.45.67', location: 'Santiago, DO', device: 'Chrome on Android', status: 'Failed' },
    { id: 4, date: '2024-03-17 11:20', ip: '192.168.1.100', location: 'Santo Domingo, DO', device: 'Chrome on Windows', status: 'Success' },
  ];

  if (isNewCustomer) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p>{t('security.newCustomerMessage', 'Security settings will be available after customer creation')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-6">
      {/* Password Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {t('security.password', 'Password & Authentication')}
              </span>
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-medium transition-colors"
                  style={{ color: primaryColor }}
                >
                  {t('security.changePassword', 'Change Password')}
                </button>
              )}
              {/* Admin Reset Password Button - Always visible */}
              <button
                onClick={handleResetPassword}
                className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors"
                title={t('security.resetPasswordTooltip', 'Generate a temporary password for this customer')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {t('security.resetPassword', 'Reset Password')}
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {isEditing ? (
            <>
              <div className="w-11/12 md:w-full">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('security.currentPassword', 'Current Password')}
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
                    {t('security.forVerification', '(for verification)')}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => onFormChange({ currentPassword: e.target.value })}
                    className="w-full pr-10 px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    placeholder={t('security.enterCurrentPassword', 'Enter your current password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-11/12 md:w-full">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    {t('security.newPassword', 'New Password')} {isNewCustomer && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className="w-full pr-10 px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {formData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {t('security.strength', 'Strength')}:
                        </span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-11/12 md:w-full">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    {t('security.confirmPassword', 'Confirm Password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => onFormChange({ confirmPassword: e.target.value })}
                      className="w-full pr-10 px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                      {t('security.passwordsDoNotMatch', 'Passwords do not match')}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('security.passwordSecure', 'Password is set and secure')}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('security.passwordNote', 'Passwords are encrypted and cannot be displayed for security reasons')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-50 dark:bg-green-900/20">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {t('security.twoFactor', 'Two-Factor Authentication')}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formData.isTwoFactorEnabled ? t('security.2faEnabled', 'Enabled') : t('security.2faDisabled', 'Disabled')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('security.2faDescription', 'Add an extra layer of security to your account')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isTwoFactorEnabled}
                onChange={(e) => onFormChange({ isTwoFactorEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-opacity-30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600"
                style={{ 
                  backgroundColor: formData.isTwoFactorEnabled ? primaryColor : undefined,
                  '--tw-ring-color': primaryColor 
                } as any}
              />
            </label>
          </div>

          {formData.isTwoFactorEnabled && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                {t('security.2faInfo', 'Two-factor authentication is active. You will need to enter a verification code when logging in.')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Security Questions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {t('security.securityQuestions', 'Security Questions')}
              </span>
            </div>
            {isEditing && (
              <button
                onClick={addSecurityQuestion}
                className="text-sm font-medium transition-colors"
                style={{ color: primaryColor }}
              >
                {t('security.addQuestion', 'Add Question')}
              </button>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {formData.securityQuestions.length > 0 ? (
            formData.securityQuestions.map((q, index) => (
              <div key={index} className="space-y-2">
                {isEditing ? (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => handleSecurityQuestionChange(index, 'question', e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                        style={{ '--tw-ring-color': primaryColor } as any}
                        placeholder={t('security.questionPlaceholder', 'Enter security question')}
                      />
                      <button
                        onClick={() => removeSecurityQuestion(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={q.answer}
                      onChange={(e) => handleSecurityQuestionChange(index, 'answer', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      placeholder={t('security.answerPlaceholder', 'Enter answer')}
                    />
                  </>
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {q.question}
                    </p>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('security.answerSaved', 'Answer saved securely (hidden for security)')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('security.noQuestions', 'No security questions configured')}
            </p>
          )}
        </div>
      </div>

      {/* Session Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/20">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {t('security.sessionSettings', 'Session Settings')}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                {t('security.sessionTimeout', 'Session Timeout (minutes)')}
              </label>
              <select
                value={formData.sessionTimeout}
                onChange={(e) => onFormChange({ sessionTimeout: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                style={{ '--tw-ring-color': primaryColor } as any}
              >
                <option value="15">15 {t('common.minutes', 'minutes')}</option>
                <option value="30">30 {t('common.minutes', 'minutes')}</option>
                <option value="60">1 {t('common.hour', 'hour')}</option>
                <option value="120">2 {t('common.hours', 'hours')}</option>
                <option value="480">8 {t('common.hours', 'hours')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                {t('security.recoveryEmail', 'Recovery Email')}
              </label>
              <input
                type="email"
                value={formData.recoveryEmail}
                onChange={(e) => onFormChange({ recoveryEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                style={{ '--tw-ring-color': primaryColor } as any}
                placeholder={t('security.recoveryEmailPlaceholder', 'recovery@example.com')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {t('security.loginHistory', 'Recent Login Activity')}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            {loginHistory.map((login) => (
              <div key={login.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      login.status === 'Success' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {login.status}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {login.date}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {login.device}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {login.location} • IP: {login.ip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save/Cancel Buttons for Edit Mode */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden z-20">
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all active:scale-95"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              className="flex-1 px-4 py-3 text-white rounded-xl font-medium transition-all active:scale-95 shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {t('common.save', 'Save')}
            </button>
          </div>
        </div>
      )}

      {/* Desktop Actions */}
      {isEditing && (
        <div className="hidden md:flex justify-end gap-3 px-6 py-4">
          <button
            onClick={() => setIsEditing(false)}
            className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            className="px-6 py-2.5 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
            style={{ backgroundColor: primaryColor }}
          >
            {t('common.save', 'Save Changes')}
          </button>
        </div>
      )}
    </div>
  );
}