import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, RefreshCw, Ban, AlertTriangle } from 'lucide-react';

export type DomainStatus = 'pending' | 'active' | 'inactive' | 'suspended' | 'expired' | 'transferring' | 'failed';

interface DomainStatusBadgeProps {
  status: DomainStatus;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pendiente',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-800 dark:text-yellow-400',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    icon: Clock,
  },
  active: {
    label: 'Activo',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-800 dark:text-green-400',
    borderColor: 'border-green-300 dark:border-green-700',
    icon: CheckCircle,
  },
  inactive: {
    label: 'Inactivo',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    textColor: 'text-gray-800 dark:text-gray-400',
    borderColor: 'border-gray-300 dark:border-gray-700',
    icon: XCircle,
  },
  suspended: {
    label: 'Suspendido',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-800 dark:text-orange-400',
    borderColor: 'border-orange-300 dark:border-orange-700',
    icon: Ban,
  },
  expired: {
    label: 'Expirado',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-800 dark:text-red-400',
    borderColor: 'border-red-300 dark:border-red-700',
    icon: AlertCircle,
  },
  transferring: {
    label: 'Transfiriendo',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-800 dark:text-blue-400',
    borderColor: 'border-blue-300 dark:border-blue-700',
    icon: RefreshCw,
  },
  failed: {
    label: 'Fallido',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-800 dark:text-red-400',
    borderColor: 'border-red-300 dark:border-red-700',
    icon: AlertTriangle,
  },
};

export default function DomainStatusBadge({ status, className = '' }: DomainStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border
        ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}