export default function CouponRow({ coupon, onDelete }) {
  return (
    <tr>
      <td className="border px-4 py-2">{coupon.code}</td>
      <td className="border px-4 py-2">{coupon.type}</td>
      <td className="border px-4 py-2">{coupon.value}</td>
      <td className="border px-4 py-2">{coupon.minPurchase || '-'}</td>
      <td className="border px-4 py-2">{coupon.maxDiscount || '-'}</td>
      <td className="border px-4 py-2">{coupon.usageLimit || '-'}</td>
      <td className="border px-4 py-2">{new Date(coupon.expiresAt).toLocaleDateString()}</td>
      <td className="border px-4 py-2">{coupon.isActive ? 'Active' : 'Inactive'}</td>
      <td className="border px-4 py-2">
        <button
          onClick={() => onDelete(coupon._id)}
          className="btn btn-red"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
