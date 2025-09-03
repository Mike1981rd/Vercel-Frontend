'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { ShieldIcon, PlusIcon, UsersIcon, CopyIcon, Trash2Icon } from 'lucide-react';
import { api } from '@/lib/api';

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  isSystemRole: boolean;
  permissions?: string[];
  avatars: string[]; // Array de URLs de avatares reales
}

interface RolesTabProps {
  primaryColor: string;
}

export function RolesTab({ primaryColor }: RolesTabProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchInitiatedRef = useRef(false);

  useEffect(() => {
    if (fetchInitiatedRef.current) return;
    fetchInitiatedRef.current = true;
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data as Role[]);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role: Role) => {
    router.push(`/dashboard/roles-usuarios/roles/${role.id}/edit`);
  };

  const handleDuplicate = (role: Role) => {
    // Store role data in sessionStorage for duplication
    const duplicateData = {
      name: `${role.name} (Copy)`,
      description: role.description,
      permissions: role.permissions || []
    };
    sessionStorage.setItem('duplicateRole', JSON.stringify(duplicateData));
    router.push('/dashboard/roles-usuarios/roles/new');
  };

  const handleDelete = async (role: Role) => {
    // Don't allow deleting SuperAdmin role
    if (role.name === 'SuperAdmin') {
      alert(t('rolesUsers.cannotDeleteSuperAdmin', 'Cannot delete SuperAdmin role'));
      return;
    }

    // Confirm deletion
    if (!confirm(t('rolesUsers.confirmDelete', `Are you sure you want to delete the role "${role.name}"?`))) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5266/api/roles/${role.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Reload roles
        fetchRoles();
      } else {
        const error = await response.text();
        alert(t('rolesUsers.deleteError', `Error deleting role: ${error}`));
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      alert(t('rolesUsers.deleteError', 'Error deleting role'));
    }
  };

  const getRoleColor = (roleName: string) => {
    const colors: { [key: string]: string } = {
      'SuperAdmin': '#ef4444',
      'Administrator': '#f59e0b',
      'CompanyAdmin': '#8b5cf6',
      'Editor': '#06b6d4',
      'CompanyStaff': '#10b981',
      'Support': '#3b82f6',
      'Customer': '#6b7280',
      'User': '#22c55e',
      'Restricted': '#f87171'
    };
    return colors[roleName] || '#6b7280';
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  return (
    <div>
      {/* Description */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('rolesUsers.rolesDescription', 'A role provides access to predefined menus and features so that depending on assigned role an administrator can have access to what user needs.')}
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all duration-300"
          >
            {/* User Count and Avatars - At the top like design */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total {role.userCount || 0} users
              </span>
              {/* User Avatars Stack - Tamaño más grande */}
              <div className="flex -space-x-4">
                {role.avatars && role.avatars.length > 0 ? (
                  <>
                    {role.avatars.slice(0, 3).map((avatarUrl, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden shadow-lg"
                      >
                        <img
                          src={avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:5266${avatarUrl}`}
                          alt={`User ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-400 text-white text-base font-medium">U${index + 1}</div>`;
                            }
                          }}
                        />
                      </div>
                    ))}
                    {role.userCount > 3 && (
                      <div className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-lg">
                        <span className="text-base font-medium text-gray-600 dark:text-gray-400">
                          +{role.userCount - 3}
                        </span>
                      </div>
                    )}
                  </>
                ) : role.userCount > 0 ? (
                  // Si hay usuarios pero no avatares, mostrar placeholders
                  <>
                    {Array.from({ length: Math.min(role.userCount, 3) }).map((_, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-900 bg-gray-400 flex items-center justify-center shadow-lg text-white text-base font-medium"
                      >
                        U{index + 1}
                      </div>
                    ))}
                    {role.userCount > 3 && (
                      <div className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-lg">
                        <span className="text-base font-medium text-gray-600 dark:text-gray-400">
                          +{role.userCount - 3}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  // Si no hay usuarios
                  <div className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <UsersIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Role Name */}
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              {role.name}
            </h3>

            {/* Edit Role Link and Action Icons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleEdit(role)}
                className="text-sm hover:underline transition-colors flex items-center gap-1"
                style={{ color: primaryColor }}
              >
                {t('rolesUsers.editRole', 'Edit Role')}
              </button>
              
              <div className="flex items-center gap-1">
                {/* Copy Icon */}
                <button 
                  onClick={() => handleDuplicate(role)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={t('common.duplicate', 'Duplicate')}
                >
                  <CopyIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                </button>
                
                {/* Delete Icon - Hide for SuperAdmin */}
                {role.name !== 'SuperAdmin' && (
                  <button 
                    onClick={() => handleDelete(role)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title={t('common.delete', 'Delete')}
                  >
                    <Trash2Icon className="w-4 h-4 text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Role Card */}
        <div
          className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border-2 border-dashed p-5 transition-all cursor-pointer group hover:shadow-lg hover:-translate-y-1 duration-300"
          style={{ 
            borderColor: `${primaryColor}40`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${primaryColor}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${primaryColor}40`;
          }}
          onClick={() => router.push('/dashboard/roles-usuarios/roles/new')}
        >
          <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110 shadow-sm"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}10 100%)`,
                border: `1px solid ${primaryColor}30`
              }}
            >
              <PlusIcon className="w-7 h-7 transition-transform group-hover:rotate-90 duration-300" style={{ color: primaryColor }} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-base">
              {t('rolesUsers.addRole', 'Add Role')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center px-4">
              {t('rolesUsers.addRoleDescription', "Add new role, if it doesn't exist")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}