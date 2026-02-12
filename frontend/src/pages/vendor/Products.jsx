import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { productService } from '../../services/product.service';
import Table from '../../components/common/Table';
import { Plus, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

// ✅ Simple Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
      >
        Previous
      </button>
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded border ${
            currentPage === page 
              ? 'bg-primary-600 text-white' 
              : 'hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
      >
        Next
      </button>
    </div>
  );
}

function VendorProducts() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-products', page],
    queryFn: () => productService.getVendorProducts({ page, limit: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries(['vendor-products']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  });

  // ✅ FIXED: Proper toggle mutation
  const toggleMutation = useMutation({
    mutationFn: productService.togglePublish,
    onSuccess: () => {
      toast.success('Publish status updated');
      queryClient.invalidateQueries(['vendor-products']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  // const handleDelete = (id) => {
  //   if (window.confirm('Are you sure you want to delete this product?')) {
  //     deleteMutation.mutate(id);
  //   }
  // };

const handleDelete = (id) => {
  toast(
    (t) => (
      <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
        <p className="mb-4 font-medium">Are you sure you want to delete this product?</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              deleteMutation.mutate(id);
              toast.dismiss(t.id);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: 'top-center', // start top-center
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      className: 'toast-center', // optional, for additional CSS
    }
  );
};


  const columns = [
    {
      key: 'thumbnail',
      label: 'Image',
      render: (row) => (
        <img
          src={row.thumbnail || '/placeholder.jpg'}
          alt={row.title}
          className="w-12 h-12 object-cover rounded"
        />
      ),
    },
    { key: 'title', label: 'Title' },
    {
      key: 'category',
      label: 'Category',
      render: (row) => row.category || 'Uncategorized',
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => `$${row.price}`,
    },
    {
      key: 'salePrice',
      label: 'Sale Price',
      render: (row) => row.salePrice ? `$${row.salePrice}` : '-',
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (row) => (row.featured ? 'Yes' : 'No'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-sm ${
            row.status === 'approved'
              ? 'bg-green-100 text-green-800'
              : row.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: 'downloads',
      label: 'Downloads',
      render: (row) => row.downloads || 0,
    },
    {
      key: 'published',
      label: 'Published',
      render: (row) => (
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={row.published || false}
            onChange={() => toggleMutation.mutate(row._id)}
            disabled={toggleMutation.isPending}
            className="sr-only peer"
          />
          <div className={`relative w-11 h-6 rounded-full transition-colors ${
            row.published ? 'bg-green-600' : 'bg-gray-300'
          }`}>
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              row.published ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </div>
        </label>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Link
            to={`/vendor/products/edit/${row._id}`}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-red-600 hover:text-red-800"
            disabled={deleteMutation.isPending}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container-custom py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Link
          to="/vendor/products/add"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      <div className="bg-white shadow rounded p-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="loader" />
          </div>
        ) : data?.products?.length > 0 ? (
          <>
            <Table columns={columns} data={data.products} />
            
            {/* Pagination */}
            {data?.pages > 1 && (
              <div className="mt-4 flex justify-end">
                <Pagination
                  currentPage={page}
                  totalPages={data.pages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 py-10">
            No products found. Add your first product.
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorProducts;