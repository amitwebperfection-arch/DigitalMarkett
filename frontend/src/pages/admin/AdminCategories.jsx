import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  Eye,
  Plus,
  X,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { categoryService } from '../../services/category.service';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [parentsOnly, setParentsOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [currentCategory, setCurrentCategory] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: null,
    published: true
  });
  const [iconPreview, setIconPreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      setCategories(response.categories || []);
    } catch (error) {
      setErrors({ fetch: 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cat.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParentFilter = !parentsOnly || !cat.parent;
    return matchesSearch && matchesParentFilter;
  });

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCategories(filteredCategories.map(cat => cat._id));
    } else {
      setSelectedCategories([]);
    }
  };

  // Handle individual select
  const handleSelectCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Toggle published status
  const handleTogglePublished = async (categoryId, currentStatus) => {
    try {
      
      // Create FormData for the update
      const formData = new FormData();
      formData.append('published', (!currentStatus).toString());
      
      await categoryService.updateCategory(categoryId, formData);
      
      // Update local state
      setCategories(prev => prev.map(cat => 
        cat._id === categoryId ? { ...cat, published: !currentStatus } : cat
      ));
    } catch (error) {
      console.error('❌ Error updating category:', error);
      alert('Failed to update category status');
    }
  };

  // Open modal
  const openModal = (mode, category = null) => {
    setModalMode(mode);
    setCurrentCategory(category);
    
    if (mode === 'edit' && category) {
      setFormData({
        name: category.name,
        description: category.description,
        icon: null,
        published: category.published
      });
      setIconPreview(category.icon);
    } else if (mode === 'add') {
      setFormData({
        name: '',
        description: '',
        icon: null,
        published: true
      });
      setIconPreview(null);
    }
    
    setErrors({});
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: null,
      published: true
    });
    setIconPreview(null);
    setErrors({});
  };

  // Handle icon upload
  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, icon: 'Icon must be less than 2MB' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, icon: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setErrors(prev => ({ ...prev, icon: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (modalMode === 'add' && !formData.icon) {
      newErrors.icon = 'Icon is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('published', formData.published.toString());
      
      if (formData.icon) {
        formDataToSend.append('icon', formData.icon);
      }

      if (modalMode === 'add') {
        await categoryService.createCategory(formDataToSend);
      } else {
        await categoryService.updateCategory(currentCategory._id, formDataToSend);
      }

      fetchCategories();
      closeModal();
    } catch (error) {
      console.error('❌ Error saving category:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to save category' });
    }
  };

  // Handle delete
  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoryService.deleteCategory(categoryId);
      
      setCategories(prev => prev.filter(cat => cat._id !== categoryId));
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) {
      alert('Please select categories to delete');
      return;
    }
    
    if (!window.confirm(`Delete ${selectedCategories.length} selected categories?`)) return;

    try {
      await categoryService.bulkDeleteCategories(selectedCategories);
      
      fetchCategories();
      setSelectedCategories([]);
      
    } catch (error) {
      console.error('❌ Error bulk deleting:', error);
      alert(error.response?.data?.message || 'Failed to delete categories');
    }
  };

  // Export categories
  const handleExport = () => {
    const dataStr = JSON.stringify(categories, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `categories-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Category</h1>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200"
            >
              <Download size={16} />
              Export
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200">
              <Upload size={16} />
              Import
            </button>
            <button 
              onClick={handleBulkDelete}
              disabled={selectedCategories.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-orange-400 rounded-lg hover:bg-orange-500 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit2 size={16} />
              Bulk Action
            </button>
            <button 
              onClick={handleBulkDelete}
              disabled={selectedCategories.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={16} />
              Delete
            </button>
            <button 
              onClick={() => openModal('add')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 hover:shadow-md transition-all duration-200"
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>
        </div>

        {/* Error Display */}
        {errors.fetch && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            <AlertCircle size={18} />
            {errors.fetch}
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Category name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors">
                Filter
              </button>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setParentsOnly(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={parentsOnly}
                    onChange={(e) => setParentsOnly(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                </div>
                <span className="text-sm font-medium text-gray-700">Parents Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ICON</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">NAME</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DESCRIPTION</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PUBLISHED</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category._id)}
                          onChange={() => handleSelectCategory(category._id)}
                          className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                        />
                      </td>
                      <td className="px-4 py-4 text-sm font-mono text-gray-600">
                        {category.id || category._id.slice(-4).toUpperCase()}
                      </td>
                      <td className="px-4 py-4">
                        {category.icon ? (
                          <img 
                            src={category.icon} 
                            alt={category.name} 
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ImageIcon size={20} className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {category.description}
                      </td>
                      <td className="px-4 py-4">
                        <label className="relative inline-block w-11 h-6 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={category.published}
                            onChange={() => handleTogglePublished(category._id, category.published)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </label>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal('view', category)}
                            className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openModal('edit', category)}
                            className="p-2 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={closeModal}
          >
            <div 
              className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'add' && 'Add New Category'}
                  {modalMode === 'edit' && 'Edit Category'}
                  {modalMode === 'view' && 'View Category'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              {modalMode === 'view' ? (
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">ID:</label>
                    <p className="text-sm text-gray-900">{currentCategory?.id || currentCategory?._id}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Icon:</label>
                    {currentCategory?.icon && (
                      <img 
                        src={currentCategory.icon} 
                        alt={currentCategory.name} 
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Name:</label>
                    <p className="text-sm text-gray-900">{currentCategory?.name}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Description:</label>
                    <p className="text-sm text-gray-900">{currentCategory?.description}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Published:</label>
                    <p className="text-sm text-gray-900">{currentCategory?.published ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6">
                  {errors.submit && (
                    <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                      <AlertCircle size={18} />
                      {errors.submit}
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.name 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-emerald-500 focus:border-transparent'
                        }`}
                        placeholder="e.g., Fruits & Vegetable"
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                          errors.description 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-emerald-500 focus:border-transparent'
                        }`}
                        placeholder="Brief description of the category"
                        rows="3"
                      />
                      {errors.description && (
                        <p className="mt-1.5 text-xs text-red-600">{errors.description}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
                        Category Icon {modalMode === 'add' && '*'}
                      </label>
                      <div className="mt-2">
                        <input
                          type="file"
                          id="icon"
                          accept="image/*"
                          onChange={handleIconChange}
                          className="hidden"
                        />
                        <label 
                          htmlFor="icon" 
                          className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                        >
                          {iconPreview ? (
                            <img 
                              src={iconPreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                              <ImageIcon size={32} />
                              <span className="text-xs text-center px-2">Click to upload icon</span>
                            </div>
                          )}
                        </label>
                      </div>
                      {errors.icon && (
                        <p className="mt-1.5 text-xs text-red-600">{errors.icon}</p>
                      )}
                      <p className="mt-1.5 text-xs text-gray-500">
                        Recommended: 128x128px, PNG or JPG, max 2MB
                      </p>
                    </div>

                    <div>
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.published}
                          onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                          className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Published</span>
                      </label>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      {modalMode === 'add' ? 'Create Category' : 'Update Category'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default AdminCategories;