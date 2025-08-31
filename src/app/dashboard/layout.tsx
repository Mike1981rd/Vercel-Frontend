import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ToastProvider } from '@/contexts/ToastContext';
import ToastContainer from '@/components/ui/ToastContainer';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <DashboardLayout>
        {children}
        <ToastContainer />
      </DashboardLayout>
    </ToastProvider>
  );
}