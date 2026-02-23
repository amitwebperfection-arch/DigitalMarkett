import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { productService } from '../../services/product.service';
import Table from '../../components/common/Table';
import { Plus, Trash2, Edit, X, DollarSign, Download, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

function ProductDetailModal({ product, onClose, onDelete, onToggle, toggleLoading }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Product Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Image */}
          <div className="flex justify-center">
            <img
              src={product.thumbnail || '/placeholder.jpg'}
              alt={product.title}
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>

          {/* Title */}
          <div>
            <label className="text-xs text-gray-500">Title</label>
            <p className="font-medium">{product.title}</p>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Category</label>
              <p className="text-sm">{product.category || 'Uncategorized'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Status</label>
              <div>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs ${
                    product.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : product.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {product.status}
                </span>
              </div>
            </div>
          </div>

          {/* Price & Sale Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Price</label>
              <p className="text-lg font-semibold text-green-600">${product.price}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Sale Price</label>
              <p className="text-lg font-semibold text-red-600">
                {product.salePrice ? `$${product.salePrice}` : '-'}
              </p>
            </div>
          </div>

          {/* Downloads & Featured */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Downloads</label>
              <p className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                {product.downloads || 0}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Featured</label>
              <p>{product.featured ? '⭐ Yes' : 'No'}</p>
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm font-medium">Published</span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={product.published || false}
                onChange={() => onToggle(product._id)}
                disabled={toggleLoading}
                className="sr-only peer"
              />
              <div className={`relative w-11 h-6 rounded-full transition-colors ${
                product.published ? 'bg-green-600' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  product.published ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link
              to={`/vendor/products/edit/${product._id}`}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={() => onDelete(product._id)}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onView, onDelete, onToggle, toggleLoading }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-3">
      <div className="flex gap-3">
        {/* Image */}
        <img
          src={product.thumbnail || '/placeholder.jpg'}
          alt={product.title}
          className="w-20 h-20 object-cover rounded flex-shrink-0"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm break-words">{product.title}</h3>
          <p className="text-xs text-gray-500">{product.category || 'Uncategorized'}</p>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="text-green-600 font-semibold text-sm">${product.price}</span>
            {product.salePrice && (
              <span className="text-red-600 font-semibold text-sm">${product.salePrice}</span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs ${
                product.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : product.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {product.status}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t">
        <button
          onClick={() => onView(product)}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          View Details
        </button>

        <div className="flex items-center gap-3">
          <Link
            to={`/vendor/products/edit/${product._id}`}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(product._id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  const maxVisible = typeof window !== 'undefined' && window.innerWidth < 768 ? 3 : 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-center">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 md:px-3 py-1 text-sm md:text-base rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
      >
        Prev
      </button>
      
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-2 md:px-3 py-1 text-sm md:text-base rounded border hover:bg-gray-100"
          >
            1
          </button>
          {startPage > 2 && <span className="px-1">...</span>}
        </>
      )}
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-2 md:px-3 py-1 text-sm md:text-base rounded border ${
            currentPage === page 
              ? 'bg-primary-600 text-white' 
              : 'hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-1">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-2 md:px-3 py-1 text-sm md:text-base rounded border hover:bg-gray-100"
          >
            {totalPages}
          </button>
        </>
      )}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 md:px-3 py-1 text-sm md:text-base rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
      >
        Next
      </button>
    </div>
  );
}

function VendorProducts() {
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
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
      setSelectedProduct(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  });

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

  const handleDelete = (id) => {
    toast(
      (t) => (
        <div className="bg-white p-4 md:p-6 rounded shadow-lg w-72 md:w-80 text-center">
          <p className="mb-3 md:mb-4 text-sm md:text-base font-medium">Are you sure you want to delete this product?</p>
          <div className="flex justify-center gap-3 md:gap-4">
            <button
              onClick={() => {
                deleteMutation.mutate(id);
                toast.dismiss(t.id);
              }}
              className="bg-red-600 text-white px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base rounded hover:bg-red-700"
            >
              Yes
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-300 text-gray-800 px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-center',
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
    { 
      key: 'title', 
      label: 'Title',
      render: (row) => (
        <span className="block max-w-[200px] break-words" title={row.title}>
          {row.title}
        </span>
      ),
    },
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
        <div className="flex items-center gap-2">
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
    <div className="py-4 md:py-8 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">My Products</h1>
        <Link
          to="/vendor/products/add"
          className="btn-primary flex items-center gap-2 text-sm md:text-base w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      <div className="bg-white shadow rounded p-2 md:p-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="loader" />
          </div>
        ) : data?.products?.length > 0 ? (
          <>
            {/* Mobile: Card View */}
            <div className="md:hidden space-y-3">
              {data.products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onView={setSelectedProduct}
                  onDelete={handleDelete}
                  onToggle={toggleMutation.mutate}
                  toggleLoading={toggleMutation.isPending}
                />
              ))}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden md:block">
              <Table columns={columns} data={data.products} />
            </div>
            
            {/* Pagination */}
            {data?.pages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={data.pages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 py-10 text-sm md:text-base">
            No products found. Add your first product.
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onDelete={handleDelete}
          onToggle={toggleMutation.mutate}
          toggleLoading={toggleMutation.isPending}
        />
      )}
    </div>
  );
}

export default VendorProducts;