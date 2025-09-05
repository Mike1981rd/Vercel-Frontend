'use client';

import { Fragment, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface OffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  width?: string;
}

export default function Offcanvas({ 
  isOpen, 
  onClose, 
  title, 
  children,
  position = 'right',
  width = '600px'
}: OffcanvasProps) {
  
  // Prevenir scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Add a slight delay for mobile performance
      const timer = setTimeout(() => {
        document.body.classList.add('offcanvas-open');
      }, 10);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('offcanvas-open');
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('offcanvas-open');
    };
  }, [isOpen]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <div className="relative z-50">
        {/* Overlay with backdrop blur */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-all"
            onClick={onClose}
          />
        </Transition.Child>

        {/* Panel */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute inset-y-0 ${position === 'right' ? 'right-0' : 'left-0'} flex max-w-full pointer-events-auto`}>
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-300"
              enterFrom={position === 'right' ? 'translate-x-full' : '-translate-x-full'}
              enterTo="translate-x-0"
              leave="transform transition ease-in duration-200"
              leaveFrom="translate-x-0"
              leaveTo={position === 'right' ? 'translate-x-full' : '-translate-x-full'}
            >
              <div className="w-screen sm:max-w-[600px]" style={{ maxWidth: width }}>
                <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-2xl">
                  {/* Header con color primario y animación */}
                  <div className="bg-primary-600 px-4 sm:px-6 py-4 relative overflow-hidden">
                    {/* Subtle gradient overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    <div className="flex items-center justify-between relative">
                      <h2 className="text-base sm:text-lg font-semibold text-white animate-fadeIn">
                        {title}
                      </h2>
                      <button
                        type="button"
                        className="text-white hover:text-gray-200 transition-all duration-200 hover:scale-110 active:scale-95"
                        onClick={onClose}
                      >
                        <span className="sr-only">Cerrar</span>
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  {/* Content with fade-in animation */}
                  <Transition.Child
                    as={Fragment}
                    enter="transition-opacity duration-300 delay-150"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 offcanvas-content">
                      {children}
                    </div>
                  </Transition.Child>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </div>
    </Transition.Root>
  );
}