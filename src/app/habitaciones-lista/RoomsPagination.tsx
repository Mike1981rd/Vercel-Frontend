import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RoomsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  colorScheme?: any;
}

export default function RoomsPagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  colorScheme 
}: RoomsPaginationProps) {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum number of page buttons to show
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const borderColor = colorScheme?.background?.border || '#e5e5e5';
  const textColor = colorScheme?.text?.text || '#171717';
  const mutedTextColor = colorScheme?.text?.muted || '#737373';
  const primaryColor = colorScheme?.buttons?.solidBackground || '#3b82f6';
  const primaryTextColor = colorScheme?.buttons?.solidText || '#ffffff';

  return (
    <div className="mt-8 flex items-center justify-center">
      <nav className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`
            flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg
            ${currentPage === 1 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'hover:bg-gray-100'
            }
          `}
          style={{ color: currentPage === 1 ? mutedTextColor : textColor }}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Anterior
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-2">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-sm" style={{ color: mutedTextColor }}>
                  ...
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`
                    min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg
                    transition-colors duration-200
                    ${currentPage === page
                      ? 'text-white'
                      : 'hover:bg-gray-100'
                    }
                  `}
                  style={{
                    backgroundColor: currentPage === page ? primaryColor : 'transparent',
                    color: currentPage === page ? primaryTextColor : textColor
                  }}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`
            flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg
            ${currentPage === totalPages 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'hover:bg-gray-100'
            }
          `}
          style={{ color: currentPage === totalPages ? mutedTextColor : textColor }}
        >
          Siguiente
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </nav>
    </div>
  );
}