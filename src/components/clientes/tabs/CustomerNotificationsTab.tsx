'use client';

import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { CustomerDetailDto } from '@/types/customer';
import { NotificationsFormData } from '../CustomerDetail';

interface CustomerNotificationsTabProps {
  customer: CustomerDetailDto | null;
  formData: NotificationsFormData;
  onFormChange: (data: Partial<NotificationsFormData>) => void;
  primaryColor: string;
  onRefresh: () => void;
  isNewCustomer?: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

export default function CustomerNotificationsTab({ 
  customer, 
  formData,
  onFormChange,
  primaryColor, 
  onRefresh, 
  isNewCustomer = false,
  isEditing,
  setIsEditing
}: CustomerNotificationsTabProps) {
  const { t } = useI18n();

  const handleEmailToggle = (type: string) => {
    onFormChange({
      emailNotifications: {
        ...formData.emailNotifications,
        [type]: !formData.emailNotifications[type as keyof typeof formData.emailNotifications]
      }
    });
  };

  const handleSmsToggle = (type: string) => {
    onFormChange({
      smsNotifications: {
        ...formData.smsNotifications,
        [type]: !formData.smsNotifications[type as keyof typeof formData.smsNotifications]
      }
    });
  };

  const handlePushToggle = (field: string) => {
    onFormChange({
      pushNotifications: {
        ...formData.pushNotifications,
        [field]: !formData.pushNotifications[field as keyof typeof formData.pushNotifications]
      }
    });
  };

  const handleScheduleChange = (field: string, value: string) => {
    onFormChange({
      notificationSchedule: {
        ...formData.notificationSchedule,
        [field]: value
      }
    });
  };

  const notificationTypes = [
    {
      key: 'orderUpdates',
      label: t('customers.notifications.orderUpdates', 'Order Updates'),
      description: t('customers.notifications.orderUpdatesDesc', 'Get notified about order status changes and shipping')
    },
    {
      key: 'promotions',
      label: t('customers.notifications.promotions', 'Promotions'),
      description: t('customers.notifications.promotionsDesc', 'Receive updates about special offers and discounts')
    },
    {
      key: 'newsletter',
      label: t('customers.notifications.newsletter', 'Newsletter'),
      description: t('customers.notifications.newsletterDesc', 'Weekly digest with tips and updates')
    },
    {
      key: 'productReviews',
      label: t('customers.notifications.productReviews', 'Product Reviews'),
      description: t('customers.notifications.productReviewsDesc', 'Get reminded to review your purchases')
    },
    {
      key: 'priceAlerts',
      label: t('customers.notifications.priceAlerts', 'Price Alerts'),
      description: t('customers.notifications.priceAlertsDesc', 'Notifications when prices drop on items you like')
    }
  ];

  const smsNotificationTypes = [
    {
      key: 'orderUpdates',
      label: t('customers.notifications.smsOrderUpdates', 'Order Updates'),
      description: t('customers.notifications.smsOrderUpdatesDesc', 'SMS updates for order status')
    },
    {
      key: 'deliveryAlerts',
      label: t('customers.notifications.deliveryAlerts', 'Delivery Alerts'),
      description: t('customers.notifications.deliveryAlertsDesc', 'SMS when packages are out for delivery')
    },
    {
      key: 'promotions',
      label: t('customers.notifications.smsPromotions', 'SMS Promotions'),
      description: t('customers.notifications.smsPromotionsDesc', 'Text messages with exclusive offers')
    }
  ];

  return (
    <div className="relative min-h-screen pb-20 md:pb-6">
      <div className="p-4 md:p-6">
        {/* Email Notification Settings */}
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('customers.notifications.emailPreferences', 'Email Preferences')}
          </h3>
          
          {/* Mobile: Vertical Layout */}
          <div className="md:hidden space-y-3">
            {notificationTypes.map((type) => (
              <div key={type.key} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-3">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {type.label}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {type.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEmailToggle(type.key)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors flex-shrink-0 ${
                      formData.emailNotifications[type.key as keyof typeof formData.emailNotifications]
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    style={{
                      backgroundColor: formData.emailNotifications[type.key as keyof typeof formData.emailNotifications] 
                        ? primaryColor 
                        : undefined
                    }}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        formData.emailNotifications[type.key as keyof typeof formData.emailNotifications]
                          ? 'translate-x-5'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
            {notificationTypes.map((type) => (
              <div key={type.key} className="flex items-start justify-between">
                <div className="flex-1 mr-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {type.label}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {type.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEmailToggle(type.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.emailNotifications[type.key as keyof typeof formData.emailNotifications]
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: formData.emailNotifications[type.key as keyof typeof formData.emailNotifications] 
                      ? primaryColor 
                      : undefined
                  }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.emailNotifications[type.key as keyof typeof formData.emailNotifications]
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SMS Notification Settings */}
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('customers.notifications.smsPreferences', 'SMS Preferences')}
          </h3>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 space-y-4">
            {smsNotificationTypes.map((type) => (
              <div key={type.key} className="flex items-start justify-between">
                <div className="flex-1 mr-3">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm md:text-base">
                    {type.label}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {type.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSmsToggle(type.key)}
                  className={`relative inline-flex h-5 w-10 md:h-6 md:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                    formData.smsNotifications[type.key as keyof typeof formData.smsNotifications]
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: formData.smsNotifications[type.key as keyof typeof formData.smsNotifications] 
                      ? primaryColor 
                      : undefined
                  }}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${
                      formData.smsNotifications[type.key as keyof typeof formData.smsNotifications]
                        ? 'translate-x-5 md:translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Push Notification Settings */}
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('customers.notifications.pushPreferences', 'Push Notifications')}
          </h3>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 mr-3">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm md:text-base">
                  {t('customers.notifications.pushEnabled', 'Enable Push Notifications')}
                </h4>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('customers.notifications.pushEnabledDesc', 'Receive notifications on your device')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handlePushToggle('enabled')}
                className={`relative inline-flex h-5 w-10 md:h-6 md:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                  formData.pushNotifications.enabled
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                style={{
                  backgroundColor: formData.pushNotifications.enabled 
                    ? primaryColor 
                    : undefined
                }}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${
                    formData.pushNotifications.enabled
                      ? 'translate-x-5 md:translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {formData.pushNotifications.enabled && (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-3">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm md:text-base">
                      {t('customers.notifications.pushSound', 'Sound')}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {t('customers.notifications.pushSoundDesc', 'Play sound with notifications')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePushToggle('sound')}
                    className={`relative inline-flex h-5 w-10 md:h-6 md:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                      formData.pushNotifications.sound
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    style={{
                      backgroundColor: formData.pushNotifications.sound 
                        ? primaryColor 
                        : undefined
                    }}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${
                        formData.pushNotifications.sound
                          ? 'translate-x-5 md:translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-3">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm md:text-base">
                      {t('customers.notifications.pushVibration', 'Vibration')}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {t('customers.notifications.pushVibrationDesc', 'Vibrate with notifications')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePushToggle('vibration')}
                    className={`relative inline-flex h-5 w-10 md:h-6 md:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                      formData.pushNotifications.vibration
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    style={{
                      backgroundColor: formData.pushNotifications.vibration 
                        ? primaryColor 
                        : undefined
                    }}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${
                        formData.pushNotifications.vibration
                          ? 'translate-x-5 md:translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notification Schedule */}
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('customers.notifications.schedule', 'Notification Schedule')}
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('customers.notifications.doNotDisturbStart', 'Do Not Disturb Start')}
                </label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  style={{ '--tw-ring-color': primaryColor } as any}
                  value={formData.notificationSchedule.doNotDisturbStart}
                  onChange={(e) => handleScheduleChange('doNotDisturbStart', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('customers.notifications.doNotDisturbEnd', 'Do Not Disturb End')}
                </label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  style={{ '--tw-ring-color': primaryColor } as any}
                  value={formData.notificationSchedule.doNotDisturbEnd}
                  onChange={(e) => handleScheduleChange('doNotDisturbEnd', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('customers.notifications.timezone', 'Timezone')}
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  style={{ '--tw-ring-color': primaryColor } as any}
                  value={formData.notificationSchedule.timezone}
                  onChange={(e) => handleScheduleChange('timezone', e.target.value)}
                >
                  <option value="America/Santo_Domingo">America/Santo Domingo</option>
                  <option value="America/New_York">America/New York</option>
                  <option value="America/Los_Angeles">America/Los Angeles</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                </select>
              </div>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
}