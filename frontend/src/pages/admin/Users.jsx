import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MobileCard from '../../components/common/MobileCard';
import DetailModal, { DetailRow } from '../../components/common/DetailModal';
import toast from 'react-hot-toast';
import { User, Mail, Shield, Ban, CheckCircle } from 'lucide-react';

function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch users
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => adminService.getUsers({ page, limit: 10, search }),
    keepPreviousData: true
  });

  // Ban user mutation
  const banMutation = useMutation({
    mutationFn: adminService.banUser,
    onSuccess: () => {
      toast.success('User banned successfully');
      queryClient.invalidateQueries(['admin-users']);
      setShowModal(false);
    }
  });

  // Unban user mutation
  const unbanMutation = useMutation({
    mutationFn: adminService.unbanUser,
    onSuccess: () => {
      toast.success('User unbanned successfully');
      queryClient.invalidateQueries(['admin-users']);
      setShowModal(false);
    }
  });

  const handleCardClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Mobile card fields
  const mobileFields = [
    {
      label: 'Name',
      key: 'name',
      render: (user) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400" />
          <span className="font-medium">{user.name}</span>
        </div>
      )
    },
    {
      label: 'Email',
      key: 'email',
      render: (user) => (
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-gray-400" />
          <span className="text-xs">{user.email}</span>
        </div>
      )
    },
    {
      label: 'Role',
      key: 'role',
      render: (user) => (
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-gray-400" />
          <span className="capitalize text-sm">{user.role}</span>
        </div>
      )
    },
    {
      label: 'Status',
      key: 'isActive',
      render: (user) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          user.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.isActive ? 'Active' : 'Banned'}
        </span>
      )
    }
  ];

  // Table columns
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (row) => <span className="capitalize">{row.role}</span>
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <span className={row.isActive ? 'text-green-600' : 'text-red-600'}>
          {row.isActive ? 'Active' : 'Banned'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="space-x-2">
          {row.isActive ? (
            <button
              onClick={() => banMutation.mutate(row._id)}
              className="text-red-600 hover:underline text-sm"
            >
              Ban
            </button>
          ) : (
            <button
              onClick={() => unbanMutation.mutate(row._id)}
              className="text-green-600 hover:underline text-sm"
            >
              Unban
            </button>
          )}
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const usersList = (data?.users || []).filter(u => u.role === 'user');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-4 sm:py-6 md:py-8 px-2 sm:px-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-sm text-gray-600 mt-1">{usersList.length} total users</p>
        </div>

        {/* Search */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Mobile View - Cards */}
        <div className="lg:hidden space-y-3">
          {usersList.length > 0 ? (
            usersList.map((user) => (
              <MobileCard
                key={user._id}
                item={user}
                fields={mobileFields}
                onCardClick={handleCardClick}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden lg:block">
          <Table
            columns={columns}
            data={usersList}
            isLoading={isLoading}
          />
        </div>

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        )}

        {/* Detail Modal */}
        <DetailModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="User Details"
          actions={
            <>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
              {selectedUser?.isActive ? (
                <button
                  onClick={() => banMutation.mutate(selectedUser._id)}
                  disabled={banMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Ban size={16} />
                  {banMutation.isPending ? 'Banning...' : 'Ban User'}
                </button>
              ) : (
                <button
                  onClick={() => unbanMutation.mutate(selectedUser._id)}
                  disabled={unbanMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  {unbanMutation.isPending ? 'Unbanning...' : 'Unban User'}
                </button>
              )}
            </>
          }
        >
          {selectedUser && (
            <>
              <DetailRow 
                label="User ID" 
                value={selectedUser._id} 
              />
              <DetailRow 
                label="Name" 
                value={selectedUser.name} 
              />
              <DetailRow 
                label="Email" 
                value={
                  <a 
                    href={`mailto:${selectedUser.email}`} 
                    className="text-blue-600 hover:underline"
                  >
                    {selectedUser.email}
                  </a>
                } 
              />
              <DetailRow 
                label="Role" 
                value={
                  <span className="capitalize px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {selectedUser.role}
                  </span>
                } 
              />
              <DetailRow 
                label="Account Status" 
                value={
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedUser.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.isActive ? 'Active' : 'Banned'}
                  </span>
                } 
              />
              {selectedUser.createdAt && (
                <DetailRow 
                  label="Member Since" 
                  value={new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} 
                />
              )}
              {selectedUser.lastLogin && (
                <DetailRow 
                  label="Last Login" 
                  value={new Date(selectedUser.lastLogin).toLocaleString()} 
                />
              )}
            </>
          )}
        </DetailModal>
      </div>
    </div>
  );
}

export default AdminUsers;