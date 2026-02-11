import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function CouponForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    expiresAt: '',
    applicableProducts: [],
    applicableCategories: '',
  });

  // Products state for multi-select
  const [products, setProducts] = useState([]);

  // Fetch vendor products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/vendor/products'); // backend endpoint
        setProducts(res.data.products || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      // Convert comma-separated categories into array
      applicableCategories: form.applicableCategories
        ? form.applicableCategories.split(',').map(c => c.trim())
        : [],
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-md space-y-4">
      <div>
        <label className="block font-medium">Coupon Code</label>
        <input
          type="text"
          name="code"
          value={form.code}
          onChange={handleChange}
          className="input"
          required
        />
      </div>

      <div>
        <label className="block font-medium">Type</label>
        <select name="type" value={form.type} onChange={handleChange} className="input">
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed</option>
        </select>
      </div>

      <div>
        <label className="block font-medium">Value</label>
        <input
          type="number"
          name="value"
          value={form.value}
          onChange={handleChange}
          className="input"
          required
        />
      </div>

      <div>
        <label className="block font-medium">Minimum Purchase</label>
        <input
          type="number"
          name="minPurchase"
          value={form.minPurchase}
          onChange={handleChange}
          className="input"
        />
      </div>

      <div>
        <label className="block font-medium">Maximum Discount</label>
        <input
          type="number"
          name="maxDiscount"
          value={form.maxDiscount}
          onChange={handleChange}
          className="input"
        />
      </div>

      <div>
        <label className="block font-medium">Usage Limit</label>
        <input
          type="number"
          name="usageLimit"
          value={form.usageLimit}
          onChange={handleChange}
          className="input"
        />
      </div>

      <div>
        <label className="block font-medium">Expiry Date</label>
        <input
          type="date"
          name="expiresAt"
          value={form.expiresAt}
          onChange={handleChange}
          className="input"
          required
        />
      </div>

      <div>
        <label className="block font-medium">Applicable Products</label>
        <select
          name="applicableProducts"
          multiple
          value={form.applicableProducts}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
            setForm({ ...form, applicableProducts: selected });
          }}
          className="input"
        >
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium">Applicable Categories (comma-separated)</label>
        <input
          type="text"
          name="applicableCategories"
          value={form.applicableCategories}
          onChange={handleChange}
          className="input"
        />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Creating...' : 'Create Coupon'}
      </button>
    </form>
  );
}
