'use client'

import React, { useState, useEffect } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { 
  EnvelopeIcon, 
  DevicePhoneMobileIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  TruckIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface NotificationSetting {
  id: number
  notificationType: string
  category: string
  displayName: string
  emailEnabled: boolean
  appEnabled: boolean
}

interface NotificationCategory {
  name: string
  key: string
  icon: React.ReactNode
  description: string
  color: string
}

export function NotificationsTab() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<NotificationSetting[]>([])
  const [primaryColor, setPrimaryColor] = useState('#22c55e')
  const [hasChanges, setHasChanges] = useState(false)
  const [originalSettings, setOriginalSettings] = useState<NotificationSetting[]>([])
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['customer', 'orders', 'shipping'])

  // Categories definition with better icons and colors
  const categories: NotificationCategory[] = [
    {
      name: t('notifications.categories.customer', 'Customer'),
      key: 'customer',
      icon: <UserGroupIcon className="w-5 h-5" />,
      description: t('notifications.categories.customer.description', 'Customer activity notifications'),
      color: '#3B82F6' // Blue
    },
    {
      name: t('notifications.categories.orders', 'Orders'),
      key: 'orders',
      icon: <ShoppingBagIcon className="w-5 h-5" />,
      description: t('notifications.categories.orders.description', 'Order event notifications'),
      color: '#8B5CF6' // Purple
    },
    {
      name: t('notifications.categories.shipping', 'Shipping'),
      key: 'shipping',
      icon: <TruckIcon className="w-5 h-5" />,
      description: t('notifications.categories.shipping.description', 'Shipping update notifications'),
      color: '#F59E0B' // Amber
    }
  ]

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings')
    if (settings) {
      const parsed = JSON.parse(settings)
      setPrimaryColor(parsed.primaryColor || '#22c55e')
    }
    fetchNotificationSettings()
  }, [])

  // Detect changes
  useEffect(() => {
    const hasModifications = JSON.stringify(settings) !== JSON.stringify(originalSettings)
    setHasChanges(hasModifications)
  }, [settings, originalSettings])

  const fetchNotificationSettings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5266/api/NotificationSettings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setOriginalSettings(data)
      } else {
        console.error('Failed to fetch notification settings:', response.status)
        toast.error(t('notifications.error.fetch', 'Failed to load notification settings'))
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error)
      toast.error(t('notifications.error.fetch', 'Failed to load notification settings'))
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (notificationType: string, field: 'email' | 'app') => {
    setSettings(prev => prev.map(setting => {
      if (setting.notificationType === notificationType) {
        return {
          ...setting,
          emailEnabled: field === 'email' ? !setting.emailEnabled : setting.emailEnabled,
          appEnabled: field === 'app' ? !setting.appEnabled : setting.appEnabled
        }
      }
      return setting
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      
      // Prepare bulk update data
      const bulkUpdate = {
        settings: settings.map(s => ({
          notificationType: s.notificationType,
          emailEnabled: s.emailEnabled,
          appEnabled: s.appEnabled
        }))
      }

      const response = await fetch('http://localhost:5266/api/NotificationSettings/bulk-update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bulkUpdate)
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
        setOriginalSettings(updatedSettings)
        toast.success(t('notifications.success.save', 'Notification settings saved successfully'))
      } else {
        throw new Error('Failed to save notification settings')
      }
    } catch (error) {
      console.error('Error saving notification settings:', error)
      toast.error(t('notifications.error.save', 'Failed to save notification settings'))
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    setSettings(originalSettings)
    toast.success(t('notifications.changes.discarded', 'Changes discarded'))
  }

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryKey) 
        ? prev.filter(k => k !== categoryKey)
        : [...prev, categoryKey]
    )
  }

  const getSettingsByCategory = (category: string) => {
    return settings.filter(s => s.category === category)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header Section - Mobile Optimized */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
          {t('notifications.title', 'Notification Settings')}
        </h2>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">
          {t('notifications.description', 'Configure how you receive notifications')}
        </p>
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden lg:block space-y-6">
        {categories.map((category) => {
          const categorySettings = getSettingsByCategory(category.key)
          
          return (
            <div key={category.key} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Category Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {React.cloneElement(category.icon as React.ReactElement, {
                      style: { color: category.color }
                    })}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Settings Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('notifications.table.type', 'Type')}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-2">
                          <EnvelopeIcon className="w-4 h-4" />
                          <span>{t('notifications.table.email', 'Email')}</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-2">
                          <DevicePhoneMobileIcon className="w-4 h-4" />
                          <span>{t('notifications.table.app', 'App')}</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {categorySettings.map((setting) => (
                      <tr key={setting.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {t(`notifications.types.${setting.notificationType}`, setting.displayName)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <label className="relative inline-block w-11 h-6 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={setting.emailEnabled}
                              onChange={() => handleToggle(setting.notificationType, 'email')}
                              className="sr-only peer"
                            />
                            <div 
                              className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-600 peer-checked:bg-green-500 transition-colors"
                              style={{
                                backgroundColor: setting.emailEnabled ? primaryColor : '#d1d5db'
                              }}
                            ></div>
                            <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"></div>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <label className="relative inline-block w-11 h-6 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={setting.appEnabled}
                              onChange={() => handleToggle(setting.notificationType, 'app')}
                              className="sr-only peer"
                            />
                            <div 
                              className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-600 peer-checked:bg-green-500 transition-colors"
                              style={{
                                backgroundColor: setting.appEnabled ? primaryColor : '#d1d5db'
                              }}
                            ></div>
                            <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"></div>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile View - Accordion Style */}
      <div className="lg:hidden space-y-3">
        {categories.map((category) => {
          const categorySettings = getSettingsByCategory(category.key)
          const isExpanded = expandedCategories.includes(category.key)
          
          return (
            <div key={category.key} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Category Header - Clickable on Mobile */}
              <button
                onClick={() => toggleCategory(category.key)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    {React.cloneElement(category.icon as React.ReactElement, {
                      className: "w-5 h-5",
                      style: { color: category.color }
                    })}
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {categorySettings.filter(s => s.emailEnabled || s.appEnabled).length} {t('notifications.active', 'active')}
                    </p>
                  </div>
                </div>
                <ChevronDownIcon 
                  className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Settings List - Expandable */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  {categorySettings.map((setting, index) => (
                    <div 
                      key={setting.id} 
                      className={`px-3 py-4 ${index !== categorySettings.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                    >
                      {/* Setting Name */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t(`notifications.types.${setting.notificationType}`, setting.displayName)}
                        </p>
                      </div>

                      {/* Toggle Switches - Mobile Optimized */}
                      <div className="space-y-3">
                        {/* Email Toggle Option */}
                        <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-3">
                          <div className="flex items-center gap-2 flex-1">
                            <EnvelopeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t('notifications.table.email', 'Email')}
                            </span>
                          </div>
                          <button
                            onClick={() => handleToggle(setting.notificationType, 'email')}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                            style={{ 
                              backgroundColor: setting.emailEnabled ? primaryColor : '#9ca3af',
                              marginRight: '60%'
                            }}
                          >
                            <span 
                              className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200"
                              style={{
                                transform: setting.emailEnabled ? 'translateX(24px)' : 'translateX(4px)'
                              }}
                            />
                          </button>
                        </div>

                        {/* App Toggle Option */}
                        <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-3">
                          <div className="flex items-center gap-2 flex-1">
                            <DevicePhoneMobileIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t('notifications.table.app', 'App')}
                            </span>
                          </div>
                          <button
                            onClick={() => handleToggle(setting.notificationType, 'app')}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                            style={{ 
                              backgroundColor: setting.appEnabled ? primaryColor : '#9ca3af',
                              marginRight: '60%'
                            }}
                          >
                            <span 
                              className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200"
                              style={{
                                transform: setting.appEnabled ? 'translateX(24px)' : 'translateX(4px)'
                              }}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Action Buttons - Mobile Optimized */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 items-center sm:justify-end" style={{ marginRight: '30%' }}>
        <button
          onClick={handleDiscard}
          disabled={!hasChanges || saving}
          className="w-3/4 sm:w-auto px-4 sm:px-6 py-3 sm:py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('common.discard', 'Discard')}
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="w-3/4 sm:w-auto px-4 sm:px-6 py-3 sm:py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          style={{
            backgroundColor: hasChanges ? primaryColor : '#9ca3af'
          }}
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('common.saving', 'Saving...')}
            </>
          ) : (
            t('common.saveChanges', 'Save Changes')
          )}
        </button>
      </div>
    </div>
  )
}