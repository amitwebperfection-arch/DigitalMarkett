import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/auth.service';
import { updateUser } from '../../features/auth/auth.slice';
import toast from 'react-hot-toast';

function UserProfile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const updateMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      dispatch(updateUser(data.user));
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordSection(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Password change failed');
    }
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  return (
    <div className="container-custom py-8 px-0 md:px-4">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="max-w-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input w-full"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="input w-full bg-gray-100 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block mb-2 font-medium">Role</label>
            <input
              type="text"
              value={user?.role}
              disabled
              className="input w-full bg-gray-100 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      <div className="max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Password</h2>
          {!showPasswordSection && (
            <button
              onClick={() => setShowPasswordSection(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Change Password
            </button>
          )}
        </div>

        {showPasswordSection && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg">
            <div>
              <label className="block mb-2 font-medium">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="input w-full"
                placeholder="Enter current password"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="input w-full"
                placeholder="Enter new password (min 6 characters)"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="input w-full"
                placeholder="Confirm new password"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordSection(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                className="btn-secondary flex-1"
                disabled={changePasswordMutation.isPending}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default UserProfile;