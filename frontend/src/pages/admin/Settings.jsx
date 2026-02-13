import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function AdminSettings() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: adminService.getSettings
  });

  const [formData, setFormData] = useState({
    siteName: '',
    siteEmail: '',
    commissionRate: '',
    currency: 'USD',
    payoutThreshold: '',
    maintenanceMode: false
  });

  const updateMutation = useMutation({
    mutationFn: adminService.updateSettings,
    onSuccess: () => {
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    }
  });

useEffect(() => {
  if (settings) {
    setFormData({
      siteName: settings.siteName || '',
      siteEmail: settings.siteEmail || '',
      commissionRate: settings.commissionRate || '',
      currency: settings.currency || 'USD',
      payoutThreshold: settings.payoutThreshold || '',
      maintenanceMode: settings.maintenanceMode || false
    });
  }
}, [settings]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container-custom py-8 px-0 md:px-4 space-y-6">
      <h1 className="text-3xl font-bold">Site Settings</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        
        {/* Site Name */}
        <div>
          <label className="block font-medium mb-1">Site Name</label>
          <input
            type="text"
            name="siteName"
            value={formData.siteName}
            onChange={handleChange}
            className="input w-full"
            required
          />
        </div>

        {/* Site Email */}
        <div>
          <label className="block font-medium mb-1">Site Email</label>
          <input
            type="email"
            name="siteEmail"
            value={formData.siteEmail}
            onChange={handleChange}
            className="input w-full"
            required
          />
        </div>

        {/* Commission Rate */}
        <div>
          <label className="block font-medium mb-1">Commission Rate (%)</label>
          <input
            type="number"
            name="commissionRate"
            value={formData.commissionRate}
            onChange={handleChange}
            className="input w-full"
            step="0.01"
            min="0"
            max="100"
            required
          />
        </div>

        {/* Currency */}
        <div>
          <label className="block font-medium mb-1">Currency</label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="input w-full"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>

        {/* Payout Threshold */}
        <div>
          <label className="block font-medium mb-1">Minimum Payout Threshold ($)</label>
          <input
            type="number"
            name="payoutThreshold"
            value={formData.payoutThreshold}
            onChange={handleChange}
            className="input w-full"
            step="0.01"
            min="0"
            required
          />
        </div>

        {/* Maintenance Mode */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="maintenanceMode"
            checked={formData.maintenanceMode}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <label className="font-medium">Enable Maintenance Mode</label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

export default AdminSettings;