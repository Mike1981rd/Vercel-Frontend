// ContactFormModal.tsx - Modern contact form success modal
import React, { useEffect } from 'react';
import { CheckCircle, X, MessageCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData?: {
    name?: string;
    email?: string;
  };
  theme?: {
    primaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
  };
}

export default function ContactFormModal({ 
  isOpen, 
  onClose, 
  formData = {},
  theme = {}
}: ContactFormModalProps) {
  const {
    primaryColor = '#000000', // Changed to black as default
    textColor = '#000000',
    backgroundColor = '#ffffff'
  } = theme;

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Auto close after 10 seconds if user doesn't interact
      const timer = setTimeout(() => {
        onClose();
      }, 10000);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-success-title"
      >
        <div 
          className={cn(
            "relative w-full max-w-lg",
            "bg-white rounded-2xl shadow-2xl",
            "animate-modalSlideIn"
          )}
          style={{ backgroundColor }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Success Icon with Animation */}
            <div className="relative inline-block">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center animate-scaleIn"
                style={{ backgroundColor: `${primaryColor}10` }}
              >
                <CheckCircle 
                  className="w-12 h-12 animate-checkmark" 
                  style={{ color: primaryColor }}
                />
              </div>
              
              {/* Subtle decoration */}
              <div className="absolute -bottom-2 -right-2">
                <MessageCircle 
                  className="w-6 h-6 text-gray-400 animate-bounce"
                  style={{ animationDelay: '0.5s' }}
                />
              </div>
            </div>

            {/* Title */}
            <h2 
              id="contact-success-title"
              className="text-2xl font-bold mt-6 mb-2"
              style={{ color: textColor }}
            >
              Message Sent Successfully!
            </h2>

            {/* Personalized Message */}
            {formData.name && (
              <p 
                className="text-lg mb-2"
                style={{ color: `${textColor}CC` }}
              >
                Thank you, <span className="font-semibold">{formData.name}</span>
              </p>
            )}

            {/* Success Message */}
            <p 
              className="text-gray-600 mb-4"
              style={{ color: `${textColor}99` }}
            >
              We've received your message and will get back to you soon.
            </p>
            
            {/* Response Time Info */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-6"
              style={{ backgroundColor: `${primaryColor}08` }}
            >
              <Clock className="w-4 h-4" style={{ color: primaryColor }} />
              <span 
                className="text-sm"
                style={{ color: `${textColor}AA` }}
              >
                Typical response time: 24-48 hours
              </span>
            </div>

            {/* Confirmation Email Notice */}
            {formData.email && (
              <p 
                className="text-sm text-gray-500 mb-6"
                style={{ color: `${textColor}77` }}
              >
                A confirmation has been sent to <br />
                <span className="font-medium" style={{ color: primaryColor }}>
                  {formData.email}
                </span>
              </p>
            )}

            {/* Action Button */}
            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90 hover:scale-105 text-base"
                style={{ backgroundColor: primaryColor }}
              >
                Continue Browsing
              </button>
            </div>
          </div>

          {/* Bottom decoration */}
          <div 
            className="h-1 rounded-b-2xl"
            style={{ 
              background: `linear-gradient(90deg, ${primaryColor}20 0%, ${primaryColor}10 50%, ${primaryColor}20 100%)` 
            }}
          />
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes checkmark {
          0% {
            stroke-dashoffset: 100;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-modalSlideIn {
          animation: modalSlideIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }

        .animate-checkmark {
          animation: checkmark 0.6s ease-out 0.3s both;
          stroke-dasharray: 100;
        }

        .animate-bounce {
          animation: bounce 2s infinite;
        }
      `}</style>
    </>
  );
}