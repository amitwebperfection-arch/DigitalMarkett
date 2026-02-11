import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vendorService } from '../../services/vendor.service';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Star } from 'lucide-react';
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

  return (
    <div className="container-custom py-8 space-y-6">
      <h1 className="text-3xl font-bold">Product Reviews</h1>

      {/* Summary Card */}
      <div className="bg-white p-6 rounded shadow">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">Average Rating</div>
            <div className="text-3xl font-bold text-yellow-500 flex items-center justify-center">
              <Star className="w-6 h-6 fill-current mr-1" />
              {data?.averageRating?.toFixed(1) || '0.0'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Total Reviews</div>
            <div className="text-3xl font-bold">{data?.totalReviews || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">5-Star Reviews</div>
            <div className="text-3xl font-bold text-green-600">{data?.fiveStarCount || 0}</div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {data?.reviews?.length > 0 ? (
          data.reviews.map((review) => (
            <div key={review._id} className="bg-white p-6 rounded shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{review.product?.title}</h3>
                  <p className="text-sm text-gray-600">
                    by {review.user?.name} • {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))
        ) : (
          <div className="bg-white p-6 rounded shadow text-center text-gray-500">
            No reviews yet
          </div>
        )}
      </div>

      {data?.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={data.totalPages}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
}

export default VendorReviews;