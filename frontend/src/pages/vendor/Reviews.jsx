import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vendorService } from '../../services/vendor.service';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Star, TrendingUp, MessageSquare, Award, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

function VendorReviews() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-reviews', page],
    queryFn: () => vendorService.getReviews({ page, limit: 10 }),
    keepPreviousData: true
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: data?.reviews?.filter(r => r.rating === stars).length || 0,
    percentage: data?.totalReviews > 0 
      ? ((data?.reviews?.filter(r => r.rating === stars).length || 0) / data?.totalReviews) * 100 
      : 0
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container-custom space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Reviews</h1>
            <p className="text-gray-600 mt-1">See what customers are saying about your products</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-semibold shadow-lg">
            <Award className="w-5 h-5" />
            {data?.averageRating?.toFixed(1) || '0.0'} Average
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Average Rating Card */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {data?.averageRating?.toFixed(1) || '0.0'}
              </p>
              <p className="text-xs text-gray-500">out of 5.0</p>
            </div>
          </div>

          {/* Total Reviews Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-4xl font-bold text-blue-900">
                {data?.totalReviews || 0}
              </p>
              <p className="text-xs text-gray-500">all time</p>
            </div>
          </div>

          {/* 5-Star Reviews Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">5-Star Reviews</p>
              <p className="text-4xl font-bold text-green-900">
                {data?.fiveStarCount || 0}
              </p>
              <p className="text-xs text-gray-500">
                {data?.totalReviews > 0 
                  ? `${Math.round((data?.fiveStarCount / data?.totalReviews) * 100)}% of total` 
                  : '0% of total'}
              </p>
            </div>
          </div>

          {/* Recent Reviews Card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-4xl font-bold text-purple-900">
                {data?.reviews?.filter(r => {
                  const reviewDate = new Date(r.createdAt);
                  const now = new Date();
                  return reviewDate.getMonth() === now.getMonth() && 
                         reviewDate.getFullYear() === now.getFullYear();
                }).length || 0}
              </p>
              <p className="text-xs text-gray-500">new reviews</p>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        {data?.totalReviews > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Rating Distribution
            </h2>
            <div className="space-y-3">
              {ratingDistribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium text-gray-700">{stars}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-16 text-right">
                    {count} ({Math.round(percentage)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-600" />
              Customer Feedback
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {data?.reviews?.length > 0 ? (
              data.reviews.map((review, idx) => (
                <div 
                  key={review._id} 
                  className="p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-colors"
                >
                  {/* Review Header */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      {/* Product Title */}
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {review.product?.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                {review.user?.name?.charAt(0).toUpperCase() || 'A'}
                              </div>
                              <span className="font-medium">{review.user?.name || 'Anonymous'}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span>{format(new Date(review.createdAt), 'MMM dd, yyyy')}</span>
                            {review.isVerifiedPurchase && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                  <CheckCircle className="w-3 h-3" />
                                  Verified Purchase
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 bg-gradient-to-br from-yellow-50 to-orange-50 px-4 py-2 rounded-xl border border-yellow-200 shadow-sm">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-gray-900">{review.rating}.0</span>
                    </div>
                  </div>

                  {/* Review Title */}
                  {review.title && (
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {review.title}
                    </h4>
                  )}

                  {/* Review Comment */}
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500">
                  Your customers haven't left any reviews yet. Keep up the great work!
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {data?.totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={page}
                totalPages={data.totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VendorReviews;