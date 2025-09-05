'use client';

import { useCallback, useEffect, useState } from 'react';

interface DecodedToken {
  nameid?: string;
  email?: string;
  name?: string;
  companyId?: string;
  role?: string | string[];
  permissions?: string | string[];
  exp?: number;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setPermissions([]);
          setRoles([]);
          setLoading(false);
          return;
        }

        // Decode JWT token
        const payload = JSON.parse(atob(token.split('.')[1])) as DecodedToken;
        
        // Extract roles
        let userRoles: string[] = [];
        if (Array.isArray(payload.role)) {
          userRoles = payload.role;
        } else if (typeof payload.role === 'string') {
          userRoles = [payload.role];
        }
        
        // Extract permissions
        let userPermissions: string[] = [];
        if (Array.isArray(payload.permissions)) {
          userPermissions = payload.permissions;
        } else if (typeof payload.permissions === 'string') {
          userPermissions = [payload.permissions];
        }
        
        setRoles(userRoles);
        setPermissions(userPermissions);
      } catch (error) {
        console.error('Error loading permissions:', error);
        setPermissions([]);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    // SuperAdmin has all permissions
    if (roles.includes('SuperAdmin')) return true;
    
    // Check if user has the specific permission
    return permissions.includes(permission);
  }, [permissions, roles]);

  const hasAnyPermission = useCallback((permissionList: string[]): boolean => {
    // SuperAdmin has all permissions
    if (roles.includes('SuperAdmin')) return true;
    
    // Check if user has any of the permissions
    return permissionList.some(permission => permissions.includes(permission));
  }, [permissions, roles]);

  const hasAllPermissions = useCallback((permissionList: string[]): boolean => {
    // SuperAdmin has all permissions
    if (roles.includes('SuperAdmin')) return true;
    
    // Check if user has all of the permissions
    return permissionList.every(permission => permissions.includes(permission));
  }, [permissions, roles]);

  const hasRole = useCallback((role: string): boolean => {
    return roles.includes(role);
  }, [roles]);

  const canRead = useCallback((resource: string): boolean => {
    return hasPermission(`${resource}.read`) || hasPermission(`${resource}.view`);
  }, [hasPermission]);

  const canCreate = useCallback((resource: string): boolean => {
    return hasPermission(`${resource}.create`);
  }, [hasPermission]);

  const canUpdate = useCallback((resource: string): boolean => {
    return hasPermission(`${resource}.update`);
  }, [hasPermission]);

  const canDelete = useCallback((resource: string): boolean => {
    return hasPermission(`${resource}.delete`);
  }, [hasPermission]);

  const isSuperAdmin = useCallback((): boolean => {
    return roles.includes('SuperAdmin');
  }, [roles]);

  return {
    permissions,
    roles,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    isSuperAdmin
  };
}