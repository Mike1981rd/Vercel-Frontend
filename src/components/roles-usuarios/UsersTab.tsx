'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { 
  SearchIcon, 
  FilterIcon, 
  DownloadIcon, 
  PlusIcon, 
  CopyIcon, 
  EyeIcon, 
  MoreVerticalIcon,
  EditIcon,
  TrashIcon,
  UserPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react';
import { API_URL } from '@/lib/constants';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  companyId?: number;
  isActive: boolean;
  emailConfirmed: boolean;
  lastLoginAt?: string;
  createdAt: string;
  roles: Role[];
  plan?: string;
  avatarUrl?: string;
}

interface Role {
  id: number;
  name: string;
}

interface UsersTabProps {
  primaryColor: string;
}

export function UsersTab({ primaryColor }: UsersTabProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('active'); // Default to active
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Error fetching users:', response.status);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    router.push(`/dashboard/roles-usuarios/users/${user.id}/edit`);
  };

  const handleView = (user: User) => {
    router.push(`/dashboard/roles-usuarios/users/${user.id}/edit`);
  };

  const handleDelete = async (userId: number) => {
    if (!confirm(t('rolesUsers.confirmDeleteUser', 'Are you sure you want to deactivate this user?'))) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchUsers();
        // If we're showing active users and just deactivated one, the list will auto-update
        // due to the filter logic
      } else {
        alert(t('rolesUsers.deleteUserError', 'Error deactivating user'));
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert(t('rolesUsers.deleteUserError', 'Error deactivating user'));
    }
  };


  const getRoleColor = (roleName: string) => {
    const colors: { [key: string]: string } = {
      'Maintainer': '#10b981',
      'Subscriber': '#8b5cf6',
      'Editor': '#06b6d4',
      'Admin': '#ef4444',
      'Author': '#f59e0b',
      'SuperAdmin': '#ef4444',
      'CompanyAdmin': '#8b5cf6',
      'CompanyStaff': '#10b981',
      'Customer': '#6b7280'
    };
    return colors[roleName] || '#6b7280';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#10b981' : '#6b7280';
  };

  const getPlanBadgeColor = (plan: string) => {
    const colors: { [key: string]: string } = {
      'Enterprise': '#8b5cf6',
      'Basic': '#6b7280',
      'Team': '#3b82f6',
      'Company': '#f59e0b'
    };
    return colors[plan] || '#6b7280';
  };

  // Filter users based on search, role and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || user.roles.some(r => r.name === selectedRole);
    const matchesStatus = selectedStatus === '' || 
                          (selectedStatus === 'active' && user.isActive) ||
                          (selectedStatus === 'inactive' && !user.isActive) ||
                          (selectedStatus === 'pending' && !user.emailConfirmed);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(u => u.id));
    }
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleExportFormat = (format: 'excel' | 'pdf' | 'csv') => {
    setShowExportModal(false);
    
    switch(format) {
      case 'excel':
        exportToExcel();
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'csv':
        exportToCSV();
        break;
    }
  };

  const exportToCSV = () => {
    // Prepare CSV data
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Created At'];
    const csvData = filteredUsers.map(user => [
      user.id,
      user.fullName,
      user.email,
      user.phoneNumber || '',
      user.roles.map(r => r.name).join(', '),
      user.isActive ? 'Active' : 'Inactive',
      new Date(user.createdAt).toLocaleDateString()
    ]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    csvData.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    // Create HTML table for Excel
    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    html += '<head><meta charset="utf-8"><title>Users Export</title></head>';
    html += '<body><table border="1">';
    
    // Headers
    html += '<tr style="background-color:#f0f0f0;font-weight:bold;">';
    html += '<th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Created At</th>';
    html += '</tr>';
    
    // Data rows
    filteredUsers.forEach(user => {
      html += '<tr>';
      html += `<td>${user.id}</td>`;
      html += `<td>${user.fullName}</td>`;
      html += `<td>${user.email}</td>`;
      html += `<td>${user.phoneNumber || ''}</td>`;
      html += `<td>${user.roles.map(r => r.name).join(', ')}</td>`;
      html += `<td style="color:${user.isActive ? 'green' : 'red'}">${user.isActive ? 'Active' : 'Inactive'}</td>`;
      html += `<td>${new Date(user.createdAt).toLocaleDateString()}</td>`;
      html += '</tr>';
    });
    
    html += '</table></body></html>';
    
    // Download as Excel
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // Create a printable HTML document
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(t('rolesUsers.popupBlocked', 'Please allow popups to export PDF'));
      return;
    }
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Users Report</title>
        <style>
          body { font-family: Arial, sans-serif; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f0f0f0; padding: 10px; text-align: left; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          .active { color: green; }
          .inactive { color: red; }
          @media print {
            body { margin: 0; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        <h1>Users Report - ${new Date().toLocaleDateString()}</h1>
        <p>Total Users: ${filteredUsers.length}</p>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    filteredUsers.forEach(user => {
      html += `
        <tr>
          <td>${user.id}</td>
          <td>${user.fullName}</td>
          <td>${user.email}</td>
          <td>${user.phoneNumber || '-'}</td>
          <td>${user.roles.map(r => r.name).join(', ')}</td>
          <td class="${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</td>
          <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      // Note: User can save as PDF from print dialog
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const paidUsers = users.filter(u => u.plan && u.plan !== 'Basic').length;
  const pendingUsers = users.filter(u => !u.emailConfirmed).length;

  // Get sessions count (mock data for now)
  const sessionsCount = 21459;
  const sessionsChange = 29;

  return (
    <div>
      {/* Header with Actions - Desktop Only */}
      <div className="hidden sm:flex justify-end items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>{t('common.export', 'Export')}</span>
          </button>
          <button
            onClick={() => router.push('/dashboard/roles-usuarios/users/new')}
            className="px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            <UserPlusIcon className="w-4 h-4" />
            <span>{t('rolesUsers.addUser', 'Add User')}</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Sessions Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {t('rolesUsers.sessions', 'Sessions')}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sessionsCount.toLocaleString()}
                </h3>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  +{sessionsChange}%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {t('rolesUsers.lastWeek', 'Last week analytics')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Paid Users Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {t('rolesUsers.paidUsers', 'Paid Users')}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {paidUsers.toLocaleString()}
                </h3>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  +18%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {t('rolesUsers.lastWeek', 'Last week analytics')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Users Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {t('rolesUsers.activeUsers', 'Active Users')}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeUsers.toLocaleString()}
                </h3>
                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                  -14%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {t('rolesUsers.lastWeek', 'Last week analytics')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Users Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {t('rolesUsers.pendingUsers', 'Pending Users')}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingUsers.toLocaleString()}
                </h3>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  +42%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {t('rolesUsers.lastWeek', 'Last week analytics')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel - Mobile Optimized */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {t('rolesUsers.filters', 'Filters')}
        </h3>
        
        <div className="space-y-3">
          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': primaryColor } as any}
            >
              <option value="">{t('rolesUsers.selectRole', 'Select Role')}</option>
              <option value="SuperAdmin">SuperAdmin</option>
              <option value="CompanyAdmin">CompanyAdmin</option>
              <option value="CompanyStaff">CompanyStaff</option>
              <option value="Customer">Customer</option>
            </select>

            {/* Plan Filter */}
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': primaryColor } as any}
            >
              <option value="">{t('rolesUsers.selectPlan', 'Select Plan')}</option>
              <option value="Basic">Basic</option>
              <option value="Team">Team</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Company">Company</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': primaryColor } as any}
            >
              <option value="">{t('rolesUsers.allStatus', 'All Status')}</option>
              <option value="active">{t('common.active', 'Active')}</option>
              <option value="inactive">{t('common.inactive', 'Inactive')}</option>
              <option value="pending">{t('common.pending', 'Pending')}</option>
            </select>
          </div>

          {/* Items per page and Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Items per page */}
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': primaryColor } as any}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>

            {/* Search with Button */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={t('common.searchUser', 'Search User')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 placeholder-gray-400 dark:placeholder-gray-500"
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
              </div>
              <button
                className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                <SearchIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.search', 'Search')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users List - Mobile Cards / Desktop Table */}
      {/* Mobile Cards View */}
      <div className="sm:hidden space-y-3 mb-6">
        {paginatedUsers.map((user) => (
          <div key={user.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              {user.avatarUrl ? (
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img 
                    src={user.avatarUrl} 
                    alt={user.fullName} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                            ${user.firstName.charAt(0)}${user.lastName.charAt(0)}
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
              )}
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  
                  {/* Direct Edit Button - Mobile */}
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    title={t('common.edit', 'Edit')}
                  >
                    <EditIcon className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                
                {/* Role Badge */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <span
                      key={role.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getRoleColor(role.name)}20`,
                        color: getRoleColor(role.name)
                      }}
                    >
                      {role.name}
                    </span>
                  ))}
                </div>
                
                {/* Additional Info */}
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>{user.plan || 'Basic'}</span>
                  <span>•</span>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 dark:border-gray-600"
                  style={{ accentColor: primaryColor }}
                />
              </th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {t('rolesUsers.user', 'User')}
              </th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {t('rolesUsers.email', 'Email')}
              </th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {t('rolesUsers.role', 'Role')}
              </th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {t('rolesUsers.plan', 'Plan')}
              </th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {t('rolesUsers.status', 'Status')}
              </th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {t('rolesUsers.actions', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="rounded border-gray-300 dark:border-gray-600"
                    style={{ accentColor: primaryColor }}
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img 
                          src={user.avatarUrl} 
                          alt={user.fullName} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const parent = e.currentTarget.parentElement?.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                                  ${user.firstName.charAt(0)}${user.lastName.charAt(0)}
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        @{user.email.split('@')[0]}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </p>
                </td>
                <td className="p-3">
                  {user.roles.map((role) => (
                    <span
                      key={role.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getRoleColor(role.name)}20`,
                        color: getRoleColor(role.name)
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getRoleColor(role.name) }} />
                      {role.name}
                    </span>
                  ))}
                </td>
                <td className="p-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.plan || 'Basic'}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className="inline-flex px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: user.isActive ? '#10b98120' : '#6b728020',
                      color: user.isActive ? '#10b981' : '#6b7280'
                    }}
                  >
                    {user.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(user.email)}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      title={t('common.copy', 'Copy')}
                    >
                      <CopyIcon className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      title={t('common.edit', 'Edit')}
                    >
                      <EditIcon className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col items-center gap-4">
        {/* Mobile Pagination */}
        <div className="sm:hidden flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          
          {[...Array(Math.min(3, totalPages))].map((_, i) => {
            const pageNum = currentPage > 2 ? currentPage - 1 + i : i + 1;
            if (pageNum > totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === pageNum
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                style={{
                  backgroundColor: currentPage === pageNum ? primaryColor : 'transparent'
                }}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Desktop Pagination */}
        <div className="hidden sm:flex sm:flex-row items-center justify-between w-full">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('common.showing', 'Showing')} {(currentPage - 1) * itemsPerPage + 1} {t('common.to', 'to')} {Math.min(currentPage * itemsPerPage, filteredUsers.length)} {t('common.of', 'of')} {filteredUsers.length} {t('common.entries', 'entries')}
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === pageNum
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  style={{
                    backgroundColor: currentPage === pageNum ? primaryColor : 'transparent'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button - Mobile Only */}
      <button
        onClick={() => router.push('/dashboard/roles-usuarios/users/new')}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all transform hover:scale-110"
        aria-label={t('rolesUsers.newUser', 'New User')}
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90%] shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('rolesUsers.exportData', 'Export Data')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t('rolesUsers.selectFormat', 'Select the format you want to export the user data')}
            </p>
            
            <div className="space-y-3">
              {/* Excel Option */}
              <button
                onClick={() => handleExportFormat('excel')}
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.8,20H14L12,13.2L10,20H8.2L6.6,11H8.4L9.2,17.7L11.2,11H12.8L14.8,17.7L15.6,11H17.4L15.8,20M13,9V3.5L18.5,9H13Z"/>
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Excel</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">.xls format</p>
                </div>
              </button>

              {/* PDF Option */}
              <button
                onClick={() => handleExportFormat('pdf')}
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M9.5,11.5C9.5,12.3 8.8,13 8,13H7V15H5.5V9H8C8.8,9 9.5,9.7 9.5,10.5V11.5M14.5,13.5C14.5,14.3 13.8,15 13,15H10.5V9H13C13.8,9 14.5,9.7 14.5,10.5V13.5M18.5,10.5H17V15H15.5V10.5H14V9H18.5V10.5M7,10.5V11.5H8V10.5H7M12,10.5V13.5H13V10.5H12Z"/>
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">PDF</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Print-ready format</p>
                </div>
              </button>

              {/* CSV Option */}
              <button
                onClick={() => handleExportFormat('csv')}
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19L12,15H13L15,19H14L13.5,18H11.5L11,19H10M12,17H13L12.5,16L12,17M8,13H10V15H11V17H10V19H8V17H7V15H8V13M8,15V17H10V15H8Z"/>
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">CSV</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Comma-separated values</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowExportModal(false)}
              className="mt-6 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('common.cancel', 'Cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
