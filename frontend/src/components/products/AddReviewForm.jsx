import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import toast from 'react-hot-toast';

function AddReviewForm({ productId }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const mutation = useMutation({
    mutationFn: (data) =>
      productService.addReview({ productId, ...data, rating }),
    onSuccess: () => {
      toast.success('✅ Review submitted successfully!');
      reset();
      setRating(0);
      setHoveredRating(0);
      queryClient.invalidateQueries(['product']);
      queryClient.invalidateQueries(['product-reviews']);
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Failed to submit review';
      toast.error(`❌ ${message}`);
    },
  });

  const onSubmit = (data) => {
    if (rating === 0) {
      toast.error('⭐ Please select a rating');
      return;
    }
    mutation.mutate(data);
  };

  const ratingLabels = {
    1: { text: 'Poor', color: 'text-red-600', emoji: '😞' },
    2: { text: 'Fair', color: 'text-orange-600', emoji: '😕' },
    3: { text: 'Good', color: 'text-yellow-600', emoji: '😊' },
    4: { text: 'Very Good', color: 'text-lime-600', emoji: '😃' },
    5: { text: 'Excellent', color: 'text-green-600', emoji: '🤩' },
  };

  const currentRating = hoveredRating || rating;
  const ratingInfo = currentRating > 0 ? ratingLabels[currentRating] : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
        {mutation.isPending && (
          <div className="flex items-center gap-2 text-primary-600 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting...</span>
          </div>
        )}
      </div>

      {/* Rating Stars with Animation */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Your Rating <span className="text-red-500">*</span>
        </label>
        
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-all duration-200 hover:scale-125 focus:outline-none focus:scale-125"
              >
                <Star
                  className={`w-10 h-10 cursor-pointer transition-all ${
                    star <= currentRating
                      ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                      : 'text-gray-300 hover:text-yellow-200'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating Label */}
          {ratingInfo && (
            <div className={`flex items-center gap-2 font-semibold ${ratingInfo.color} animate-fade-in`}>
              <span className="text-2xl">{ratingInfo.emoji}</span>
              <span className="text-lg">{ratingInfo.text}</span>
            </div>
          )}
        </div>

        {rating === 0 && (
          <p className="text-xs text-gray-500 italic">Click on the stars to rate</p>
        )}
      </div>

      {/* Title Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Review Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register('title', {
            required: 'Title is required',
            minLength: { value: 3, message: 'Title must be at least 3 characters' },
            maxLength: { value: 100, message: 'Title must be less than 100 characters' }
          })}
          placeholder="Sum up your experience in one line"
          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition ${
            errors.title ? 'border-red-300' : 'border-gray-200'
          }`}
          disabled={mutation.isPending}
        />
        {errors.title && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <span className="text-lg">⚠️</span>
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Comment Textarea */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('comment', {
            required: 'Review is required',
            minLength: { value: 10, message: 'Review must be at least 10 characters' },
            maxLength: { value: 1000, message: 'Review must be less than 1000 characters' }
          })}
          placeholder="Share your thoughts about this product... What did you like or dislike?"
          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition resize-none ${
            errors.comment ? 'border-red-300' : 'border-gray-200'
          }`}
          rows={5}
          disabled={mutation.isPending}
        />
        {errors.comment && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <span className="text-lg">⚠️</span>
            {errors.comment.message}
          </p>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 text-sm mb-2">📝 Review Guidelines</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Be honest and specific about your experience</li>
          <li>• Focus on the product's features and quality</li>
          <li>• Avoid offensive or inappropriate language</li>
        </ul>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={mutation.isPending || rating === 0}
        className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-bold text-base shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2 group"
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Submitting Review...</span>
          </>
        ) : (
          <>
            <Star className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Submit Review</span>
          </>
        )}
      </button>
    </form>
  );
}

export default AddReviewForm;