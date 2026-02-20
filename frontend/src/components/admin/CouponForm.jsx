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
    isActive: true,
    applicableProducts: [],
    applicableCategories: '',
    // ✅ Rules
    rules: {
      newUser: false,
      minOrders: '',
      minCartAmount: '',
      inactiveDays: '',
    }
  });

  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products?status=approved&limit=100')
      .then(res => setProducts(res.data.products || []))
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRuleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      value: Number(form.value),
      minPurchase: form.minPurchase ? Number(form.minPurchase) : 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      applicableCategories: form.applicableCategories
        ? form.applicableCategories.split(',').map(c => c.trim()).filter(Boolean)
        : [],
      rules: {
        newUser: form.rules.newUser,
        minOrders: form.rules.minOrders ? Number(form.rules.minOrders) : null,
        minCartAmount: form.rules.minCartAmount ? Number(form.rules.minCartAmount) : null,
        inactiveDays: form.rules.inactiveDays ? Number(form.rules.inactiveDays) : null,
      }
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Basic Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Coupon Code *</label>
          <input type="text" name="code" value={form.code}
            onChange={handleChange} className="input w-full uppercase"
            placeholder="WELCOME20" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type *</label>
          <select name="type" value={form.type} onChange={handleChange} className="input w-full">
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed ($)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Value * {form.type === 'percentage' ? '(%)' : '($)'}
          </label>
          <input type="number" name="value" value={form.value}
            onChange={handleChange} className="input w-full"
            placeholder={form.type === 'percentage' ? '20' : '150'} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Usage Limit</label>
          <input type="number" name="usageLimit" value={form.usageLimit}
            onChange={handleChange} className="input w-full"
            placeholder="100 (blank = unlimited)" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Min Purchase ($)</label>
          <input type="number" name="minPurchase" value={form.minPurchase}
            onChange={handleChange} className="input w-full" placeholder="499" />
        </div>
        {form.type === 'percentage' && (
          <div>
            <label className="block text-sm font-medium mb-1">Max Discount ($)</label>
            <input type="number" name="maxDiscount" value={form.maxDiscount}
              onChange={handleChange} className="input w-full" placeholder="200" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Expiry Date *</label>
          <input type="datetime-local" name="expiresAt" value={form.expiresAt}
            onChange={handleChange} className="input w-full" required />
        </div>
        <div className="flex items-center gap-2 mt-6">
          <input type="checkbox" name="isActive" id="isActive"
            checked={form.isActive} onChange={handleChange} className="w-4 h-4" />
          <label htmlFor="isActive" className="text-sm font-medium">Active</label>
        </div>
      </div>

      {/* Rules Section */}
      <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
        <h3 className="font-semibold text-gray-700">Eligibility Rules</h3>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="newUser" id="newUser"
            checked={form.rules.newUser} onChange={handleRuleChange} className="w-4 h-4" />
          <label htmlFor="newUser" className="text-sm">New Users Only (0 orders)</label>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Min Orders Required</label>
            <input type="number" name="minOrders" value={form.rules.minOrders}
              onChange={handleRuleChange} className="input w-full text-sm"
              placeholder="3" disabled={form.rules.newUser} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Min Cart Amount ($)</label>
            <input type="number" name="minCartAmount" value={form.rules.minCartAmount}
              onChange={handleRuleChange} className="input w-full text-sm" placeholder="999" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Inactive Days</label>
            <input type="number" name="inactiveDays" value={form.rules.inactiveDays}
              onChange={handleRuleChange} className="input w-full text-sm"
              placeholder="30" disabled={form.rules.newUser} />
          </div>
        </div>
      </div>

      {/* Products */}
{products.length > 0 && (
  <div>
    <label className="block text-sm font-medium mb-2">
      Applicable Products <span className="text-gray-400 font-normal">(optional)</span>
    </label>
    <div className="border rounded-lg max-h-40 overflow-y-auto divide-y">
      {products.map(p => (
        <label key={p._id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            value={p._id}
            checked={form.applicableProducts.includes(p._id)}
            onChange={(e) => {
              const id = e.target.value;
              setForm(prev => ({
                ...prev,
                applicableProducts: e.target.checked
                  ? [...prev.applicableProducts, id]
                  : prev.applicableProducts.filter(x => x !== id)
              }));
            }}
            className="w-4 h-4 accent-emerald-500"
          />
          <span className="text-sm text-gray-700">{p.title}</span>
        </label>
      ))}
    </div>
    {form.applicableProducts.length > 0 && (
      <p className="text-xs text-emerald-600 mt-1">
        {form.applicableProducts.length} product(s) selected
      </p>
    )}
  </div>
)}

      <button type="submit" disabled={loading}
        className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50">
        {loading ? 'Creating...' : 'Create Coupon'}
      </button>
    </form>
  );
}