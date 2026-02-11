import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
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
    }
  });

  // Unban user mutation
  const unbanMutation = useMutation({
    mutationFn: adminService.unbanUser,
    onSuccess: () => {
      toast.success('User unbanned successfully');
      queryClient.invalidateQueries(['admin-users']);
    }
  });

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

  return (
    <div className="container-custom py-8 space-y-6">
      <h1 className="text-3xl font-bold">Manage Users</h1>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users..."
        className="input w-full max-w-sm"
      />

      {/* Users Table */}
      <Table
        columns={columns}
        data={(data?.users || []).filter(u => u.role === 'user')}
        isLoading={isLoading}
      />

      {/* Pagination */}
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

export default AdminUsers;
