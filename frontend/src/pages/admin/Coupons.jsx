import { useState, useEffect } from 'react';
import api from '../../services/api';
import CouponForm from '../../components/admin/CouponForm';
import CouponRow from '../../components/admin/CouponRow';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import MobileCard from '../../components/common/MobileCard';
import DetailModal, { DetailRow } from '../../components/common/DetailModal';
import { Tag, Calendar, Percent, Trash2, Plus, X } from 'lucide-react';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false); // NEW: Form modal state

  const fetchCoupons = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/coupons?page=${pageNum}&limit=10`);
      setCoupons(res.data.coupons || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons(page);
  }, [page]);

  const handleCreate = async (data) => {
    setLoading(true);
    try {
      await api.post('/coupons', data);
      fetchCoupons(page);
      setShowFormModal(false); // Close form modal after successful creation
    } catch (err) {
      console.error('Failed to create coupon:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (coupon) => {
    setCouponToDelete(coupon);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;
    setLoading(true);
    try {
      await api.delete(`/coupons/${couponToDelete._id}`);
      fetchCoupons(page);
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
      setCouponToDelete(null);
    }
  };

  const handleCardClick = (coupon) => {
    setSelectedCoupon(coupon);
    setShowDetailModal(true);
  };

  // Mobile card fields
  const mobileFields = [
    {
      label: 'Code',
      key: 'code',
      render: (coupon) => (
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-blue-600" />
          <span className="font-mono font-bold text-blue-600">{coupon.code}</span>
        </div>
      )
    },
    {
      label: 'Type',
      key: 'type',
      render: (coupon) => (
        <span className="capitalize text-sm">{coupon.type}</span>
      )
    },
    {
      label: 'Value',
      key: 'value',
      render: (coupon) => (
        <div className="flex items-center gap-1">
          {coupon.type === 'percentage' ? (
            <>
              <Percent size={14} className="text-green-600" />
              <span className="font-bold text-green-600">{coupon.value}%</span>
            </>
          ) : (
            <span className="font-bold text-green-600">${coupon.value}</span>
          )}
        </div>
      )
    },
    {
      label: 'Expires',
      key: 'expiresAt',
      render: (coupon) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-xs">
            {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'No expiry'}
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-4 sm:py-6 md:py-8 px-2 sm:px-4">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Coupons</h1>
            <p className="text-sm text-gray-600 mt-1">{coupons.length} total coupons</p>
          </div>
          
          {/* Add Coupon Button */}
          <button
            onClick={() => setShowFormModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 hover:shadow-md transition-all duration-200"
          >
            <Plus size={18} />
            Add Coupon
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Mobile View - Cards */}
            <div className="lg:hidden space-y-3">
              {coupons.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <Tag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 mb-4">No coupons found.</p>
                  <button
                    onClick={() => setShowFormModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600"
                  >
                    <Plus size={16} />
                    Create Your First Coupon
                  </button>
                </div>
              ) : (
                coupons.map((coupon) => (
                  <div key={coupon._id} className="relative">
                    <MobileCard
                      item={coupon}
                      fields={mobileFields}
                      onCardClick={handleCardClick}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(coupon);
                      }}
                      className="absolute top-3 right-3 p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="w-full table-auto border border-gray-200 min-w-[500px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 border text-sm font-semibold text-gray-600 text-left">Code</th>
                    <th className="p-3 border text-sm font-semibold text-gray-600 text-left">Type</th>
                    <th className="p-3 border text-sm font-semibold text-gray-600 text-left">Value</th>
                    <th className="p-3 border text-sm font-semibold text-gray-600 text-left">Expires</th>
                    <th className="p-3 border text-sm font-semibold text-gray-600 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center">
                        <Tag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 mb-4">No coupons found.</p>
                        <button
                          onClick={() => setShowFormModal(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600"
                        >
                          <Plus size={16} />
                          Create Your First Coupon
                        </button>
                      </td>
                    </tr>
                  )}
                  {coupons.map((coupon) => (
                    <CouponRow
                      key={coupon._id}
                      coupon={coupon}
                      onDelete={() => confirmDelete(coupon)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}

        {/* Add/Edit Coupon Form Modal */}
        {showFormModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={() => setShowFormModal(false)}
          >
            <div 
              className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 z-10">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Tag className="text-emerald-600" size={24} />
                  Add New Coupon
                </h2>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body - Coupon Form */}
              <div className="p-4 sm:p-6">
                <CouponForm onSubmit={handleCreate} loading={loading} />
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Delete Coupon"
        >
          <p>Are you sure you want to delete the coupon <strong>{couponToDelete?.code}</strong>?</p>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </Modal>

        {/* Detail Modal */}
        <DetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Coupon Details"
          actions={
            <>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  confirmDelete(selectedCoupon);
                  setShowDetailModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Coupon
              </button>
            </>
          }
        >
          {selectedCoupon && (
            <>
              <DetailRow 
                label="Coupon Code" 
                value={
                  <span className="font-mono text-lg font-bold text-blue-600">
                    {selectedCoupon.code}
                  </span>
                } 
              />
              <DetailRow 
                label="Discount Type" 
                value={
                  <span className="capitalize px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {selectedCoupon.type}
                  </span>
                } 
              />
              <DetailRow 
                label="Discount Value" 
                value={
                  <span className="text-lg font-bold text-green-600">
                    {selectedCoupon.type === 'percentage' 
                      ? `${selectedCoupon.value}%` 
                      : `$${selectedCoupon.value}`
                    }
                  </span>
                } 
              />
              {selectedCoupon.minPurchase && (
                <DetailRow 
                  label="Minimum Purchase" 
                  value={`$${selectedCoupon.minPurchase}`} 
                />
              )}
              {selectedCoupon.maxDiscount && selectedCoupon.type === 'percentage' && (
                <DetailRow 
                  label="Maximum Discount" 
                  value={`$${selectedCoupon.maxDiscount}`} 
                />
              )}
              <DetailRow 
                label="Usage Limit" 
                value={selectedCoupon.usageLimit || 'Unlimited'} 
              />
              <DetailRow 
                label="Times Used" 
                value={selectedCoupon.usedCount || 0} 
              />
              <DetailRow 
                label="Expiry Date" 
                value={
                  selectedCoupon.expiresAt 
                    ? new Date(selectedCoupon.expiresAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'No expiry date'
                } 
              />
              <DetailRow 
                label="Status" 
                value={
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedCoupon.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedCoupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                } 
              />
            </>
          )}
        </DetailModal>
      </div>
    </div>
  );
}