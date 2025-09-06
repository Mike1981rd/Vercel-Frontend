// SubscriptionModal.tsx - Modern subscription success modal
import React, { useEffect } from 'react';
import { CheckCircle, X, Mail, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  theme?: {
    primaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
  };
}

export default function SubscriptionModal({ 
  isOpen, 
  onClose, 
  email,
  theme = {}
}: SubscriptionModalProps) {
  const {
    primaryColor = '#22c55e',
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
        aria-labelledby="subscription-success-title"
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
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <CheckCircle 
                  className="w-12 h-12 animate-checkmark" 
                  style={{ color: primaryColor }}
                />
              </div>
              
              {/* Confetti effect (CSS only) */}
              <div className="absolute inset-0 pointer-events-none">
                <span className="confetti confetti-1">🎉</span>
                <span className="confetti confetti-2">✨</span>
                <span className="confetti confetti-3">🎊</span>
              </div>
            </div>

            {/* Title */}
            <h2 
              id="subscription-success-title"
              className="text-2xl font-bold mt-6 mb-2"
              style={{ color: textColor }}
            >
              Welcome to Our Community! 🎉
            </h2>

            {/* Success Message */}
            <p 
              className="text-gray-600 mb-2"
              style={{ color: `${textColor}99` }}
            >
              You've successfully subscribed with
            </p>
            
            {/* Email Display */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-6"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              <Mail className="w-4 h-4" style={{ color: primaryColor }} />
              <span 
                className="font-medium text-sm"
                style={{ color: primaryColor }}
              >
                {email}
              </span>
            </div>

            {/* Info Message */}
            <p 
              className="text-sm text-gray-500 mb-6"
              style={{ color: `${textColor}77` }}
            >
              Check your inbox for a confirmation email. 
              You'll start receiving our newsletter with the latest updates and exclusive offers!
            </p>

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
            className="h-2 rounded-b-2xl"
            style={{ 
              background: `linear-gradient(90deg, ${primaryColor}40 0%, ${primaryColor}20 50%, ${primaryColor}40 100%)` 
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

        @keyframes confettiFall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100px) rotate(720deg);
            opacity: 0;
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

        .confetti {
          position: absolute;
          font-size: 20px;
          animation: confettiFall 1.5s ease-out forwards;
        }

        .confetti-1 {
          top: -10px;
          left: 20%;
          animation-delay: 0.2s;
        }

        .confetti-2 {
          top: -10px;
          left: 50%;
          animation-delay: 0.4s;
        }

        .confetti-3 {
          top: -10px;
          left: 80%;
          animation-delay: 0.6s;
        }
      `}</style>
    </>
  );
}