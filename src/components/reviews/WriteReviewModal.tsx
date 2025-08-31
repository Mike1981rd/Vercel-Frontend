'use client';

import React, { useState, useRef } from 'react';
import { Star, Heart, Smile, ThumbsUp, X, ImagePlus, Loader2, Check, AlertCircle } from 'lucide-react';
import { createReview, uploadReviewMedia } from '@/lib/api/reviews';
import type { ColorScheme } from '@/types/theme/colorSchemes';
import { toast } from 'react-hot-toast';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  roomId: number;
  ratingIcon: 'star' | 'heart' | 'smile' | 'like';
  ratingIconColor: string;
  colorScheme: ColorScheme | null;
}

export default function WriteReviewModal({
  isOpen,
  onClose,
  onSuccess,
  roomId,
  ratingIcon,
  ratingIconColor,
  colorScheme
}: WriteReviewModalProps) {
  // Form state
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [country, setCountry] = useState('');
  
  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  // Color scheme colors
  const bgColor = colorScheme?.background || '#FFFFFF';
  const textColor = colorScheme?.text || '#000000';
  const borderColor = colorScheme?.border || '#E5E7EB';
  const buttonBg = colorScheme?.solidButton || ratingIconColor;
  const buttonText = colorScheme?.solidButtonText || '#FFFFFF';
  const errorColor = '#EF4444';

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!comment.trim()) {
      newErrors.comment = 'Review comment is required';
    } else if (comment.length < 10) {
      newErrors.comment = 'Review must be at least 10 characters';
    } else if (comment.length > 5000) {
      newErrors.comment = 'Review must be less than 5000 characters';
    }

    if (rating < 1 || rating > 5) {
      newErrors.rating = 'Please select a rating';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'Please select a valid image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image must be less than 5MB' });
      return;
    }

    setSelectedImage(file);
    setErrors({ ...errors, image: '' });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Create the review
      const reviewData = {
        roomId,
        authorName: name.trim(),
        authorEmail: email.trim(),
        country: country.trim() || undefined,
        title: title.trim() || undefined,
        content: comment.trim(),
        rating,
        source: 'Website Form',
        originalLanguage: navigator.language || 'en',
      };

      const createdReview = await createReview(reviewData);

      // Upload image if selected
      if (selectedImage && createdReview.id) {
        try {
          await uploadReviewMedia(createdReview.id, selectedImage);
        } catch (imageError) {
          console.error('Failed to upload image:', imageError);
          // Don't fail the whole submission if image upload fails
        }
      }

      // Show success message
      setSubmitSuccess(true);
      toast.success('Thank you for your review! It will be published after approval.');

      // Wait a moment to show success state
      setTimeout(() => {
        // Reset form
        setRating(5);
        setName('');
        setEmail('');
        setTitle('');
        setComment('');
        setCountry('');
        removeImage();
        setSubmitSuccess(false);
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
        
        // Close modal
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting review:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to submit review. Please try again.'
      });
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rating Icon Component
  const RatingIcon = ({ filled, hovered }: { filled: boolean; hovered: boolean }) => {
    const iconProps = {
      className: "w-8 h-8 cursor-pointer transition-all",
      style: { 
        color: filled || hovered ? ratingIconColor : borderColor,
        fill: filled ? ratingIconColor : hovered ? `${ratingIconColor}50` : 'none'
      }
    };

    switch(ratingIcon) {
      case 'heart': return <Heart {...iconProps} />;
      case 'smile': return <Smile {...iconProps} />;
      case 'like': return <ThumbsUp {...iconProps} />;
      default: return <Star {...iconProps} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: bgColor }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6"
          style={{ borderBottom: `1px solid ${borderColor}` }}
        >
          <h2 className="text-2xl font-semibold" style={{ color: textColor }}>
            Write a Review
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-full transition hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: `${borderColor}20` }}
          >
            <X className="w-5 h-5" style={{ color: textColor }} />
          </button>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="p-4 m-6 rounded-lg flex items-center gap-3" 
               style={{ backgroundColor: '#10B98115', border: '1px solid #10B981' }}>
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-700">Your review has been submitted successfully!</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>
              Califica
            </label>
            <p className="text-xs mb-2" style={{ color: `${textColor}99` }}>
              Selecciona de 1 a 5 estrellas
            </p>
            <div className="flex gap-2 items-center p-3 rounded-lg border" role="radiogroup" aria-label="Calificación"
                 style={{ borderColor: borderColor }}>
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value} className="cursor-pointer select-none">
                  <input
                    type="radio"
                    name="rating"
                    value={value}
                    checked={rating === value}
                    onChange={() => {
                      setRating(value);
                      setErrors({ ...errors, rating: '' });
                    }}
                    disabled={isSubmitting}
                    className="sr-only"
                    aria-label={`${value} estrella${value > 1 ? 's' : ''}`}
                  />
                  <span className="inline-flex pointer-events-none">
                    <RatingIcon
                      filled={value <= rating}
                      hovered={false}
                    />
                  </span>
                </label>
              ))}
            </div>
            {errors.rating && (
              <p className="text-sm mt-1" style={{ color: errorColor }}>{errors.rating}</p>
            )}
          </div>

          {/* Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Your Name *
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors({ ...errors, name: '' });
                }}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{ 
                  backgroundColor: `${borderColor}20`,
                  border: `1px solid ${errors.name ? errorColor : borderColor}`,
                  color: textColor
                }}
              />
              {errors.name && (
                <p className="text-sm mt-1" style={{ color: errorColor }}>{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Your Email *
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: '' });
                }}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{ 
                  backgroundColor: `${borderColor}20`,
                  border: `1px solid ${errors.email ? errorColor : borderColor}`,
                  color: textColor
                }}
              />
              {errors.email && (
                <p className="text-sm mt-1" style={{ color: errorColor }}>{errors.email}</p>
              )}
            </div>
          </div>

          {/* Title and Country (Optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Review Title (Optional)
              </label>
              <input
                type="text"
                placeholder="Summary of your experience"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                maxLength={500}
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{ 
                  backgroundColor: `${borderColor}20`,
                  border: `1px solid ${borderColor}`,
                  color: textColor
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Country (Optional)
              </label>
              <input
                type="text"
                placeholder="US"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={isSubmitting}
                maxLength={2}
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{ 
                  backgroundColor: `${borderColor}20`,
                  border: `1px solid ${borderColor}`,
                  color: textColor
                }}
              />
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
              Your Review *
            </label>
            <textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setErrors({ ...errors, comment: '' });
              }}
              disabled={isSubmitting}
              rows={6}
              maxLength={5000}
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 resize-none disabled:opacity-50"
              style={{ 
                backgroundColor: `${borderColor}20`,
                border: `1px solid ${errors.comment ? errorColor : borderColor}`,
                color: textColor
              }}
            />
            <div className="flex justify-between mt-1">
              <div>
                {errors.comment && (
                  <p className="text-sm" style={{ color: errorColor }}>{errors.comment}</p>
                )}
              </div>
              <span className="text-xs" style={{ color: borderColor }}>
                {comment.length}/5000
              </span>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
              Add Photo (Optional)
            </label>
            
            {!imagePreview ? (
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition hover:opacity-80 disabled:opacity-50"
                style={{ 
                  backgroundColor: `${borderColor}20`,
                  border: `1px solid ${borderColor}`,
                  color: colorScheme?.link || textColor 
                }}
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-sm">Choose Photo</span>
              </button>
            ) : (
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Review" 
                  className="w-32 h-32 object-cover rounded-lg"
                  style={{ border: `1px solid ${borderColor}` }}
                />
                <button
                  onClick={removeImage}
                  disabled={isSubmitting}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {errors.image && (
              <p className="text-sm mt-1" style={{ color: errorColor }}>{errors.image}</p>
            )}
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-4 rounded-lg flex items-center gap-3" 
                 style={{ backgroundColor: '#EF444415', border: '1px solid #EF4444' }}>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{errors.submit}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3 font-medium rounded-lg transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ 
              backgroundColor: buttonBg,
              color: buttonText
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Review</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}