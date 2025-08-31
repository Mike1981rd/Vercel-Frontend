import React from 'react';
import { Edit2, Trash2, Copy, CheckCircle, XCircle, Server, Globe, Mail, Shield, FileText } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { DnsRecord } from './DnsRecordModal';

interface DnsRecordsListProps {
  records: DnsRecord[];
  onEdit: (record: DnsRecord) => void;
  onDelete: (record: DnsRecord) => void;
  primaryColor: string;
}

const getRecordIcon = (type: string) => {
  switch (type) {
    case 'A':
    case 'AAAA':
      return Server;
    case 'CNAME':
      return Globe;
    case 'MX':
      return Mail;
    case 'CAA':
      return Shield;
    case 'TXT':
      return FileText;
    default:
      return Server;
  }
};

const getRecordTypeColor = (type: string) => {
  switch (type) {
    case 'A':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'AAAA':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
    case 'CNAME':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'MX':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
    case 'TXT':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'NS':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'CAA':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const formatTTL = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

export default function DnsRecordsList({ records, onEdit, onDelete, primaryColor }: DnsRecordsListProps) {
  const { t } = useI18n();
  const [copiedId, setCopiedId] = React.useState<number | null>(null);

  const handleCopyValue = async (record: DnsRecord) => {
    try {
      await navigator.clipboard.writeText(record.value);
      setCopiedId(record.id || 0);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (records.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-8 text-center">
        <Server className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          {t('domains.dns.noRecords', 'No hay registros DNS configurados')}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          {t('domains.dns.addFirstRecord', 'Agrega tu primer registro DNS para configurar tu dominio')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Desktop View */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('domains.dns.type', 'Tipo')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('domains.dns.host', 'Host')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('domains.dns.value', 'Valor')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                TTL
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('domains.dns.status', 'Estado')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('common.actions', 'Acciones')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {records.map((record) => {
              const Icon = getRecordIcon(record.type);
              return (
                <tr key={record.id || `${record.type}-${record.host}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${getRecordTypeColor(record.type)}`}>
                        {record.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {record.host}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 group">
                      <span className="text-sm text-gray-600 dark:text-gray-300 font-mono text-xs truncate max-w-xs">
                        {record.value}
                      </span>
                      <button
                        onClick={() => handleCopyValue(record)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title={t('common.copy', 'Copiar')}
                      >
                        {copiedId === record.id ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTTL(record.ttl)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {record.isActive ? (
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">{t('common.active', 'Activo')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400">
                        <XCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">{t('common.inactive', 'Inactivo')}</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(record)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title={t('common.edit', 'Editar')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(record)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title={t('common.delete', 'Eliminar')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {records.map((record) => {
          const Icon = getRecordIcon(record.type);
          return (
            <div
              key={record.id || `${record.type}-${record.host}`}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${getRecordTypeColor(record.type)}`}>
                    {record.type}
                  </span>
                  {record.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(record)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(record)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{t('domains.dns.host', 'Host')}:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{record.host}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">{t('domains.dns.value', 'Valor')}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-600 dark:text-gray-300 break-all">
                      {record.value}
                    </span>
                    <button
                      onClick={() => handleCopyValue(record)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                    >
                      {copiedId === record.id ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">TTL:</span>
                  <span className="text-gray-600 dark:text-gray-300">{formatTTL(record.ttl)}</span>
                </div>
                {record.priority && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('domains.dns.priority', 'Prioridad')}:</span>
                    <span className="text-gray-600 dark:text-gray-300">{record.priority}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}