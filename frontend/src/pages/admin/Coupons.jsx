import { useState, useEffect } from 'react';
import api from '../../services/api';
import CouponForm from '../../components/admin/CouponForm';
import CouponRow from '../../components/admin/CouponRow';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);

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
      fetchCoupons(page); // refresh list
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
      fetchCoupons(page); // refresh list
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
      setCouponToDelete(null);
    }
  };

  return (
    <div className="container-custom py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Coupons</h1>

      <div className="mb-6">
        <CouponForm onSubmit={handleCreate} loading={loading} />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <table className="w-full table-auto border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Code</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Value</th>
              <th className="p-2 border">Expires</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center">
                  No coupons found.
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
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* React Modal for Delete Confirmation */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Delete Coupon"
      >
        <p>Are you sure you want to delete the coupon <strong>{couponToDelete?.code}</strong>?</p>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
