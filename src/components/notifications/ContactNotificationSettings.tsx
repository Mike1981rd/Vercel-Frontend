'use client';

import React, { useState, useEffect } from 'react';
import { Save, Mail, Bell, Volume2, Settings, RefreshCw } from 'lucide-react';
import { useContactNotifications } from '@/hooks/useContactNotifications';

interface ContactNotificationSettingsProps {
  companyId?: number;
  className?: string;
  onSave?: () => void;
}

export default function ContactNotificationSettings({
  companyId,
  className = '',
  onSave
}: ContactNotificationSettingsProps) {
  const { settings, updateSettings, loadSettings } = useContactNotifications();
  const [currentCompanyId, setCurrentCompanyId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Formulario local
  const [formData, setFormData] = useState({
    emailNotificationsEnabled: true,
    toastNotificationsEnabled: true,
    dashboardNotificationsEnabled: true,
    playSoundOnNewMessage: false,
    notificationEmailAddress: '',
    emailSubjectTemplate: 'New Contact Message from {name}',
    toastSuccessMessage: 'Message sent successfully!',
    toastErrorMessage: 'Error sending message. Please try again.'
  });

  // Helper para resolver companyId desde prop, localStorage o token
  const resolveCompanyId = (): number => {
    if (companyId) return companyId;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('companyId');
      if (stored && !Number.isNaN(parseInt(stored))) return parseInt(stored);
      // Intentar desde el token JWT
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const cid = parseInt(payload.companyId || payload.CompanyId || payload.company_id || '');
          if (!Number.isNaN(cid) && cid > 0) return cid;
        }
      } catch {}
    }
    return 1; // fallback single-tenant
  };

  // Inicializar companyId y cargar settings explícitamente
  useEffect(() => {
    const cid = resolveCompanyId();
    setCurrentCompanyId(cid);
    loadSettings(cid).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar datos del settings cuando esté disponible
  useEffect(() => {
    if (settings) {
      setFormData({
        emailNotificationsEnabled: settings.emailNotificationsEnabled,
        toastNotificationsEnabled: settings.toastNotificationsEnabled,
        dashboardNotificationsEnabled: settings.dashboardNotificationsEnabled,
        playSoundOnNewMessage: settings.playSoundOnNewMessage,
        notificationEmailAddress: settings.notificationEmailAddress,
        emailSubjectTemplate: settings.emailSubjectTemplate,
        toastSuccessMessage: settings.toastSuccessMessage,
        toastErrorMessage: settings.toastErrorMessage
      });
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cid = currentCompanyId || resolveCompanyId();

    setIsSaving(true);
    
    try {
      await updateSettings(cid, formData);
      onSave?.();
    } catch (error) {
      console.error('Error saving notification settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const testNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Could not play test sound:', error);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contact Notification Settings
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure how you receive notifications for new contact messages
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notification Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Notification Types
            </h4>
            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-start gap-3">
                <div className="flex items-center h-5">
                  <input
                    id="emailNotificationsEnabled"
                    name="emailNotificationsEnabled"
                    type="checkbox"
                    checked={formData.emailNotificationsEnabled}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="emailNotificationsEnabled" className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                    <Mail className="w-4 h-4" />
                    Email notifications
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Send email alerts when new contact messages are received
                  </p>
                </div>
              </div>

              {/* Toast Notifications */}
              <div className="flex items-start gap-3">
                <div className="flex items-center h-5">
                  <input
                    id="toastNotificationsEnabled"
                    name="toastNotificationsEnabled"
                    type="checkbox"
                    checked={formData.toastNotificationsEnabled}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="toastNotificationsEnabled" className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                    <Bell className="w-4 h-4" />
                    Toast notifications
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Show success/error messages when forms are submitted
                  </p>
                </div>
              </div>

              {/* Dashboard Notifications */}
              <div className="flex items-start gap-3">
                <div className="flex items-center h-5">
                  <input
                    id="dashboardNotificationsEnabled"
                    name="dashboardNotificationsEnabled"
                    type="checkbox"
                    checked={formData.dashboardNotificationsEnabled}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="dashboardNotificationsEnabled" className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                    <Bell className="w-4 h-4" />
                    Dashboard notifications
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Show notification badge and panel in dashboard
                  </p>
                </div>
              </div>

              {/* Sound Notifications */}
              <div className="flex items-start gap-3">
                <div className="flex items-center h-5">
                  <input
                    id="playSoundOnNewMessage"
                    name="playSoundOnNewMessage"
                    type="checkbox"
                    checked={formData.playSoundOnNewMessage}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <label htmlFor="playSoundOnNewMessage" className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                      <Volume2 className="w-4 h-4" />
                      Sound notifications
                    </label>
                    <button
                      type="button"
                      onClick={testNotificationSound}
                      className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      Test
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Play sound when new contact messages are received
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          {formData.emailNotificationsEnabled && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Email Settings
              </h4>
              <div className="space-y-4">
                <div>
                  <label htmlFor="notificationEmailAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notification email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="notificationEmailAddress"
                    name="notificationEmailAddress"
                    value={formData.notificationEmailAddress}
                    onChange={handleInputChange}
                    required={formData.emailNotificationsEnabled}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="admin@example.com"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email address where notifications will be sent
                  </p>
                </div>

                <div>
                  <label htmlFor="emailSubjectTemplate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email subject template
                  </label>
                  <input
                    type="text"
                    id="emailSubjectTemplate"
                    name="emailSubjectTemplate"
                    value={formData.emailSubjectTemplate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="New Contact Message from {name}"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use {'{name}'} as placeholder for the sender's name
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Toast Messages */}
          {formData.toastNotificationsEnabled && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Toast Messages
              </h4>
              <div className="space-y-4">
                <div>
                  <label htmlFor="toastSuccessMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Success message
                  </label>
                  <input
                    type="text"
                    id="toastSuccessMessage"
                    name="toastSuccessMessage"
                    value={formData.toastSuccessMessage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Message sent successfully!"
                  />
                </div>

                <div>
                  <label htmlFor="toastErrorMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Error message
                  </label>
                  <input
                    type="text"
                    id="toastErrorMessage"
                    name="toastErrorMessage"
                    value={formData.toastErrorMessage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Error sending message. Please try again."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={isSaving}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
