'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

interface ContactNotificationProviderProps {
  children: React.ReactNode;
}

export default function ContactNotificationProvider({ children }: ContactNotificationProviderProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Default options for all toasts
          className: '',
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            padding: '16px',
            fontSize: '14px',
            maxWidth: '400px',
          },

          // Default options for specific types
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10B981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#EF4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#EF4444',
            },
          },
          loading: {
            duration: Infinity,
            style: {
              background: '#3B82F6',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#3B82F6',
            },
          },
        }}
      />
    </>
  );
}