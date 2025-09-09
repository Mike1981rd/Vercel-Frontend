'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveTabs, Tab } from '@/components/responsive/ResponsiveTabs';
import { ResponsiveTable, TableColumn } from '@/components/responsive/ResponsiveTable';
import { MobileActionBar, ActionButton, useMobileActions } from '@/components/mobile/MobileActionBar';
import { useI18n } from '@/contexts/I18nContext';

// Sample data for the table
interface SampleUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Pending';
  joinDate: string;
  lastLogin: string;
}

const sampleUsers: SampleUser[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
    joinDate: '2024-01-15',
    lastLogin: '2024-08-08'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Editor',
    status: 'Active',
    joinDate: '2024-02-20',
    lastLogin: '2024-08-07'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Viewer',
    status: 'Inactive',
    joinDate: '2024-03-10',
    lastLogin: '2024-07-15'
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'Editor',
    status: 'Pending',
    joinDate: '2024-04-05',
    lastLogin: '2024-08-06'
  }
];

export default function DemoComponentsPage() {
  const { t } = useI18n();
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<SampleUser | null>(null);
  const hasFixedActionBar = true; // Flag to add padding when fixed action bar is present

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  // Tab configuration
  const tabs: Tab[] = [
    { id: 'overview', label: 'Overview', icon: '📊', badge: 5 },
    { id: 'users', label: 'Users', icon: '👥', badge: sampleUsers.length },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', badge: 12 },
    { id: 'disabled', label: 'Disabled Tab', icon: '🚫', disabled: true }
  ];

  // Table columns configuration
  const columns: TableColumn<SampleUser>[] = [
    { 
      key: 'name', 
      label: 'Name', 
      priority: 'high',
      render: (value, item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
            {value.charAt(0)}
          </div>
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    { 
      key: 'email', 
      label: 'Email', 
      priority: 'medium',
      mobileLabel: 'Email'
    },
    { 
      key: 'role', 
      label: 'Role', 
      priority: 'medium',
      render: (value) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          {value}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      priority: 'high',
      render: (value) => {
        const colors = {
          Active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          Inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
          Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[value as keyof typeof colors]}`}>
            {value}
          </span>
        );
      }
    },
    { 
      key: 'joinDate', 
      label: 'Join Date', 
      priority: 'low',
      hideOnMobile: true
    },
    { 
      key: 'lastLogin', 
      label: 'Last Login', 
      priority: 'low',
      hideOnMobile: true
    }
  ];

  // Action buttons configuration
  const initialActions: ActionButton[] = [
    { 
      id: 'save', 
      label: 'Save Changes', 
      variant: 'primary',
      onClick: () => {
        actionManager.setLoading('save', true);
        setTimeout(() => {
          actionManager.setLoading('save', false);
          alert('Changes saved!');
        }, 2000);
      }
    },
    { 
      id: 'cancel', 
      label: 'Cancel', 
      variant: 'secondary',
      onClick: () => alert('Cancelled!')
    }
  ];

  const actionManager = useMobileActions(initialActions);

  // Example with 3 buttons
  const threeActions: ActionButton[] = [
    { 
      id: 'primary', 
      label: 'Primary Action', 
      variant: 'primary',
      onClick: () => alert('Primary!')
    },
    { 
      id: 'secondary', 
      label: 'Secondary', 
      variant: 'secondary',
      onClick: () => alert('Secondary!')
    },
    { 
      id: 'danger', 
      label: 'Delete', 
      variant: 'danger',
      onClick: () => alert('Delete!')
    }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${hasFixedActionBar ? 'pb-24 md:pb-0' : ''}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Responsive Components Demo
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Demonstrating mobile-first responsive components
          </p>
        </div>
      </div>

      {/* Responsive Tabs Demo */}
      <div className="max-w-7xl mx-auto sm:px-6 sm:py-6">
        <div className="mb-6">
          <h2 className="px-4 sm:px-0 text-lg font-semibold text-gray-900 dark:text-white mb-4">
            1. ResponsiveTabs Component
          </h2>
          
          <ResponsiveTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            primaryColor={primaryColor}
          />
        </div>

        {/* Tab Content */}
        <div className="px-4 sm:px-0 py-6 bg-white dark:bg-gray-800 sm:rounded-lg sm:shadow">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Overview Content
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This tab demonstrates the responsive tabs component. On mobile, tabs are displayed as a vertical stack with the active tab highlighted. On desktop, they appear as traditional horizontal tabs.
              </p>
              
              {/* Metrics Grid Example */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mt-6">
                <div className="col-span-2 md:col-span-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">$12,345</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Revenue</div>
                </div>
                <div className="col-span-2 md:col-span-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">1,234</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active Users</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">98%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Satisfaction</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">24/7</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Support</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                ResponsiveTable Component
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This table automatically converts to stacked cards on mobile devices.
              </p>
              
              <ResponsiveTable
                data={sampleUsers}
                columns={columns}
                onRowClick={(user) => {
                  setSelectedUser(user);
                  alert(`Selected: ${user.name}`);
                }}
                primaryColor={primaryColor}
                emptyMessage="No users found"
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                MobileActionBar Examples
              </h3>
              
              {/* Form Example with w-11/12 pattern */}
              <div className="space-y-4 mb-8">
                <div className="w-11/12 md:w-full">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Full Name
                  </label>
                  <input 
                    type="text"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="w-11/12 md:w-full">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Email Address
                  </label>
                  <input 
                    type="email"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="w-11/12 md:w-full">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Message
                  </label>
                  <textarea 
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl"
                    rows={4}
                    placeholder="Enter your message"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Two Button Example (Save/Cancel)
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                  <MobileActionBar
                    actions={actionManager.actions}
                    primaryColor={primaryColor}
                    position="relative"
                    showOnDesktop={true}
                  />
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Three Button Example (Stacked on mobile)
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                  <MobileActionBar
                    actions={threeActions}
                    primaryColor={primaryColor}
                    position="relative"
                    showOnDesktop={true}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Mobile-First Patterns Applied
              </h3>
              
              {/* Avatar Section - Centered on Mobile */}
              <div className="md:hidden flex flex-col items-center py-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">JD</span>
                  </div>
                  <span className="absolute -bottom-1 -right-1 px-2.5 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
                    Active
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">John Doe</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customer ID #123456</p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">Pattern Applied</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Avatar is centered on mobile but left-aligned on desktop
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">Responsive Design</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        All components follow CLAUDE.md mobile patterns
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'disabled' && (
            <div>
              <p className="text-gray-500 dark:text-gray-400">
                This tab is disabled and should not be accessible.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Action Bar for Mobile Demo */}
      <MobileActionBar
        actions={[
          { 
            id: 'demo', 
            label: 'Fixed Mobile Action', 
            variant: 'primary',
            onClick: () => alert('This button is fixed at the bottom on mobile!')
          }
        ]}
        primaryColor={primaryColor}
        position="fixed"
      />
    </div>
  );
}