/**
 * Page Generator
 * Generates page templates with all required patterns
 */

export interface PageGeneratorOptions {
  name: string;
  type: 'list' | 'detail' | 'dashboard' | 'form';
  components: string[];
  responsive: boolean;
  includeTranslations?: boolean;
  includeTypes?: boolean;
}

export function generatePageTemplate(options: PageGeneratorOptions): string {
  const { name, type, components, responsive } = options;
  const pascalName = toPascalCase(name);
  const hasTable = components.includes('table');
  const hasTabs = components.includes('tabs');
  const hasForm = components.includes('form');
  const hasMetrics = components.includes('metrics');
  const hasActions = components.includes('actions');
  const hasSearch = components.includes('search');

  let template = `'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';`;

  // Add component imports based on what's needed
  if (responsive && hasTabs) {
    template += `
import { ResponsiveTabs, Tab } from '@/components/responsive/ResponsiveTabs';`;
  }

  if (responsive && hasTable) {
    template += `
import { ResponsiveTable, TableColumn } from '@/components/responsive/ResponsiveTable';`;
  }

  if (responsive && hasActions) {
    template += `
import { MobileActionBar, ActionButton, useMobileActions } from '@/components/mobile/MobileActionBar';`;
  }

  // Add type definitions if needed
  if (hasTable) {
    template += `

interface ${pascalName}Item {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}`;
  }

  template += `

export default function ${pascalName}Page() {
  const { t } = useI18n();
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [loading, setLoading] = useState(false);`;

  if (hasTabs) {
    template += `
  const [activeTab, setActiveTab] = useState('overview');`;
  }

  if (hasTable) {
    template += `
  const [data, setData] = useState<${pascalName}Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<${pascalName}Item | null>(null);`;
  }

  if (hasSearch) {
    template += `
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});`;
  }

  template += `

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);`;

  if (hasTable) {
    template += `

  useEffect(() => {
    // Fetch data from API
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const response = await fetch('/api/${name}');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };`;
  }

  // Add tab configuration if needed
  if (hasTabs) {
    template += `

  const tabs: Tab[] = [
    { id: 'overview', label: t('${name}.tabs.overview', 'Overview'), icon: '📊' },
    { id: 'details', label: t('${name}.tabs.details', 'Details'), icon: '📝' },
    { id: 'settings', label: t('${name}.tabs.settings', 'Settings'), icon: '⚙️' },
  ];`;
  }

  // Add table columns if needed
  if (hasTable) {
    template += `

  const columns: TableColumn<${pascalName}Item>[] = [
    { 
      key: 'name', 
      label: t('${name}.columns.name', 'Name'),
      priority: 'high'
    },
    { 
      key: 'status', 
      label: t('${name}.columns.status', 'Status'),
      priority: 'high',
      render: (value) => (
        <span className={\`px-2 py-1 text-xs font-medium rounded-full 
          \${value === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            value === 'inactive' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' :
            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}\`}>
          {t(\`${name}.status.\${value}\`, value)}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      label: t('${name}.columns.created', 'Created'),
      priority: 'low',
      hideOnMobile: true
    }
  ];`;
  }

  // Add action buttons if needed
  if (hasActions) {
    template += `

  const actions: ActionButton[] = [
    { 
      id: 'create', 
      label: t('${name}.actions.create', 'Create New'),
      variant: 'primary',
      onClick: () => {
        // Handle create action
        console.log('Create new ${name}');
      }
    }${hasTable ? `,
    { 
      id: 'export', 
      label: t('${name}.actions.export', 'Export'),
      variant: 'secondary',
      onClick: () => {
        // Handle export action
        console.log('Export ${name}');
      }
    }` : ''}
  ];`;
  }

  // Start the render section
  template += `

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900${hasActions && responsive ? ' pb-24 md:pb-0' : ''}">
      {/* Breadcrumbs - Desktop */}
      <nav className="hidden sm:flex mb-4 px-6 pt-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('navigation.dashboard', 'Dashboard')}
            </Link>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li className="text-gray-700 font-medium dark:text-gray-300">
            {t('${name}.title', '${pascalName}')}
          </li>
        </ol>
      </nav>

      {/* Mobile Title */}
      <div className="sm:hidden px-4 pt-4 mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('${name}.title', '${pascalName}')}
        </h1>
      </div>`;

  // Add main content based on type
  if (type === 'dashboard' && hasMetrics) {
    template += `

      {/* Metrics Grid */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('${name}.metrics.total', 'Total')}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('${name}.metrics.active', 'Active')}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('${name}.metrics.pending', 'Pending')}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">0%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('${name}.metrics.growth', 'Growth')}
            </div>
          </div>
        </div>
      </div>`;
  }

  // Add search bar if needed
  if (hasSearch) {
    template += `

      {/* Search and Filters */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('${name}.search.placeholder', 'Search...')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-opacity-30"
            style={{ '--tw-ring-color': primaryColor } as any}
          />
        </div>
      </div>`;
  }

  // Add tabs if needed
  if (hasTabs && responsive) {
    template += `

      {/* Responsive Tabs */}
      <div className="px-0 sm:px-6">
        <ResponsiveTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          primaryColor={primaryColor}
        />
      </div>`;
  }

  // Main content area
  template += `

      {/* Main Content */}
      <div className="px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">`;

  if (hasTabs) {
    template += `
          {activeTab === 'overview' && (
            <div>`;
  }

  if (hasTable && responsive) {
    template += `
              <ResponsiveTable
                data={data}
                columns={columns}
                onRowClick={(item) => setSelectedItem(item)}
                primaryColor={primaryColor}
                loading={loading}
                emptyMessage={t('${name}.empty', 'No ${name} found')}
              />`;
  } else if (hasForm) {
    template += `
              {/* Form Fields */}
              <div className="space-y-4">
                <div className="w-11/12 md:w-full">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    {t('${name}.fields.name', 'Name')}
                  </label>
                  <input 
                    type="text"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 
                             border border-gray-200 dark:border-gray-600 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-opacity-30"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  />
                </div>
                
                <div className="w-11/12 md:w-full">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    {t('${name}.fields.description', 'Description')}
                  </label>
                  <textarea 
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700/50 
                             border border-gray-200 dark:border-gray-600 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-opacity-30"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    rows={4}
                  />
                </div>
              </div>`;
  } else {
    template += `
              <p className="text-gray-600 dark:text-gray-400">
                {t('${name}.description', 'Manage your ${name} here')}
              </p>`;
  }

  if (hasTabs) {
    template += `
            </div>
          )}

          {activeTab === 'details' && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                {t('${name}.tabs.details.description', 'Details content here')}
              </p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                {t('${name}.tabs.settings.description', 'Settings content here')}
              </p>
            </div>
          )}`;
  }

  template += `
        </div>
      </div>`;

  // Add mobile action bar if needed
  if (hasActions && responsive) {
    template += `

      {/* Mobile Action Bar */}
      <MobileActionBar
        actions={actions}
        primaryColor={primaryColor}
        position="fixed"
      />`;
  }

  template += `
    </div>
  );
}`;

  return template;
}

/**
 * Generates component template
 */
export function generateComponentTemplate(name: string, type: 'tab' | 'modal' | 'form'): string {
  const pascalName = toPascalCase(name);
  
  let template = `'use client';

import React from 'react';
import { useI18n } from '@/contexts/I18nContext';

interface ${pascalName}Props {
  data?: any;
  primaryColor: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

export function ${pascalName}({ data, primaryColor, onSave, onCancel }: ${pascalName}Props) {
  const { t } = useI18n();
  const [formData, setFormData] = React.useState(data || {});
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave?.(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {t('${name}.title', '${pascalName}')}
      </h3>
      
      {/* Component content here */}
      <div className="space-y-4">
        {/* Add your fields */}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}
        >
          {loading ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
        >
          {t('common.cancel', 'Cancel')}
        </button>
      </div>
    </div>
  );
}`;

  return template;
}

/**
 * Generates translation files
 */
export function generateTranslations(name: string, language: 'en' | 'es'): object {
  const translations = {
    en: {
      title: toPascalCase(name),
      description: `Manage your ${name}`,
      empty: `No ${name} found`,
      search: {
        placeholder: `Search ${name}...`
      },
      tabs: {
        overview: 'Overview',
        details: 'Details',
        settings: 'Settings'
      },
      columns: {
        name: 'Name',
        status: 'Status',
        created: 'Created',
        updated: 'Updated'
      },
      status: {
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending'
      },
      actions: {
        create: 'Create New',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save Changes',
        cancel: 'Cancel',
        export: 'Export'
      },
      metrics: {
        total: 'Total',
        active: 'Active',
        pending: 'Pending',
        growth: 'Growth'
      },
      fields: {
        name: 'Name',
        description: 'Description',
        email: 'Email',
        phone: 'Phone'
      }
    },
    es: {
      title: toPascalCase(name),
      description: `Gestionar ${name}`,
      empty: `No se encontraron ${name}`,
      search: {
        placeholder: `Buscar ${name}...`
      },
      tabs: {
        overview: 'Vista General',
        details: 'Detalles',
        settings: 'Configuración'
      },
      columns: {
        name: 'Nombre',
        status: 'Estado',
        created: 'Creado',
        updated: 'Actualizado'
      },
      status: {
        active: 'Activo',
        inactive: 'Inactivo',
        pending: 'Pendiente'
      },
      actions: {
        create: 'Crear Nuevo',
        edit: 'Editar',
        delete: 'Eliminar',
        save: 'Guardar Cambios',
        cancel: 'Cancelar',
        export: 'Exportar'
      },
      metrics: {
        total: 'Total',
        active: 'Activo',
        pending: 'Pendiente',
        growth: 'Crecimiento'
      },
      fields: {
        name: 'Nombre',
        description: 'Descripción',
        email: 'Correo',
        phone: 'Teléfono'
      }
    }
  };

  return { [name]: translations[language] };
}

/**
 * Helper function to convert string to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Generates TypeScript interface
 */
export function generateTypeDefinition(name: string, fields: Array<{ name: string; type: string; optional?: boolean }>): string {
  const pascalName = toPascalCase(name);
  
  let template = `export interface ${pascalName} {\n`;
  
  fields.forEach(field => {
    template += `  ${field.name}${field.optional ? '?' : ''}: ${field.type};\n`;
  });
  
  template += `}\n\n`;
  template += `export interface ${pascalName}Response {\n`;
  template += `  data: ${pascalName}[];\n`;
  template += `  total: number;\n`;
  template += `  page: number;\n`;
  template += `  pageSize: number;\n`;
  template += `}\n\n`;
  template += `export interface Create${pascalName}Dto extends Omit<${pascalName}, 'id' | 'createdAt' | 'updatedAt'> {}\n`;
  template += `export interface Update${pascalName}Dto extends Partial<Create${pascalName}Dto> {}\n`;
  
  return template;
}