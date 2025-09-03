'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { XIcon, ShieldIcon } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  isSystemRole: boolean;
  permissions?: string[];
}

interface Permission {
  id: number;
  resource: string;
  action: string;
  description: string;
}

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  primaryColor: string;
}

export function RoleModal({ isOpen, onClose, role, primaryColor }: RoleModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as number[]
  });
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
    fetchPermissions();
  }, [role]);

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5266/api/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllPermissions(data);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = t('validation.required', 'This field is required');
    }

    if (!formData.description.trim()) {
      newErrors.description = t('validation.required', 'This field is required');
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
      const url = role
        ? `http://localhost:5266/api/roles/${role.id}`
        : 'http://localhost:5266/api/roles';
      
      const method = role ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onClose();
      } else {
        const error = await response.text();
        console.error('Error saving role:', error);
        alert(t('rolesUsers.saveError', 'Error saving role'));
      }
    } catch (error) {
      console.error('Error saving role:', error);
      alert(t('rolesUsers.saveError', 'Error saving role'));
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const groupPermissionsByResource = () => {
    const grouped: { [key: string]: Permission[] } = {};
    allPermissions.forEach(permission => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
      grouped[permission.resource].push(permission);
    });
    return grouped;
  };

  if (!isOpen) return null;

  const groupedPermissions = groupPermissionsByResource();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <ShieldIcon className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {role ? t('rolesUsers.editRole', 'Edit Role') : t('rolesUsers.addRole', 'Add Role')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Role Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rolesUsers.roleName', 'Role Name')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                  errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                style={{ '--tw-ring-color': primaryColor } as any}
                placeholder={t('rolesUsers.roleNamePlaceholder', 'Enter role name')}
                disabled={role?.isSystemRole}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rolesUsers.roleDescription', 'Description')} *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                  errors.description ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                style={{ '--tw-ring-color': primaryColor } as any}
                placeholder={t('rolesUsers.roleDescriptionPlaceholder', 'Enter role description')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                {t('rolesUsers.permissions', 'Permissions')}
              </label>
              
              <div className="space-y-4 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                  <div key={resource}>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 capitalize">
                      {resource}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {permissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="rounded border-gray-300 dark:border-gray-600"
                            style={{ accentColor: primaryColor }}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {permission.action}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-white rounded-lg disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('common.saving', 'Saving...')}
                  </span>
                ) : (
                  t('common.save', 'Save')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}