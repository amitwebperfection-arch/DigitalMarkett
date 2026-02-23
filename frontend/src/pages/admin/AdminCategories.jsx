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
  AlertCircle,
  Tag
} from 'lucide-react';
import { categoryService } from '../../services/category.service';
import MobileCard from '../../components/common/MobileCard';
import DetailModal, { DetailRow } from '../../components/common/DetailModal';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [parentsOnly, setParentsOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentCategory, setCurrentCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: null,
    published: true,
    parent: null
  });
  const [iconPreview, setIconPreview] = useState(null);
  const [errors, setErrors] = useState({});

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

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cat.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParentFilter = !parentsOnly || !cat.parent;
    return matchesSearch && matchesParentFilter;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCategories(filteredCategories.map(cat => cat._id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleTogglePublished = async (categoryId, currentStatus) => {
    try {
      const formData = new FormData();
      formData.append('published', (!currentStatus).toString());
      await categoryService.updateCategory(categoryId, formData);
      setCategories(prev => prev.map(cat => 
        cat._id === categoryId ? { ...cat, published: !currentStatus } : cat
      ));
    } catch (error) {
      console.error('❌ Error updating category:', error);
      alert('Failed to update category status');
    }
  };

  const handleCardClick = (category) => {
    setCurrentCategory(category);
    setShowDetailModal(true);
  };

  const openModal = (mode, category = null) => {
    setModalMode(mode);
    setCurrentCategory(category);
    
    if (mode === 'edit' && category) {
      setFormData({
        name: category.name,
        description: category.description,
        icon: null,
        published: category.published,
        parent: category.parent?._id || category.parent || null
      });
      setIconPreview(category.icon);
    } else if (mode === 'add') {
      setFormData({
        name: '',
        description: '',
        icon: null,
        published: true,
        parent: null
      });
      setIconPreview(null);
    }
    
    setErrors({});
    setShowModal(true);
    setShowDetailModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: null,
      published: true,
      parent: null
    });
    setIconPreview(null);
    setErrors({});
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('published', formData.published.toString());
      
      if (formData.parent) {
        formDataToSend.append('parent', formData.parent);
      } else {
        formDataToSend.append('parent', '');
      }
      
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

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoryService.deleteCategory(categoryId);
      setCategories(prev => prev.filter(cat => cat._id !== categoryId));
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
      setShowDetailModal(false);
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

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

  // Mobile card fields
  const mobileFields = [
    {
      label: 'Category',
      key: 'name',
      render: (cat) => (
        <div className="flex items-center gap-3">
          {cat.icon ? (
            <img 
              src={cat.icon} 
              alt={cat.name} 
              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
              <ImageIcon size={20} className="text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {cat.parent && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                  Sub
                </span>
              )}
              <span className="font-semibold text-gray-900">{cat.name}</span>
            </div>
            {cat.parent && (
              <p className="text-xs text-gray-500 mt-0.5">
                Parent: {cat.parent.name || 'Unknown'}
              </p>
            )}
          </div>
        </div>
      )
    },
    {
      label: 'Products',
      key: 'count',
      render: (cat) => (
        <span className="text-sm text-gray-600">
          {cat.count || 0} {cat.count === 1 ? 'product' : 'products'}
        </span>
      )
    },
    {
      label: 'Published',
      key: 'published',
      render: (cat) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          cat.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {cat.published ? 'Yes' : 'No'}
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-600 mt-1">{categories.length} total categories</p>
          </div>
          
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <button 
              onClick={handleBulkDelete}
              disabled={selectedCategories.length === 0}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={16} />
              Delete ({selectedCategories.length})
            </button>
            <button 
              onClick={() => openModal('add')}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-all"
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>
        </div>

        {errors.fetch && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            <AlertCircle size={18} />
            {errors.fetch}
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-5 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
            <div className="relative flex-1 max-w-full md:max-w-md">
              <Search size={18} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Category name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setParentsOnly(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
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
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Parents Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Mobile View - Cards */}
        <div className="lg:hidden space-y-3 mb-4">
          {loading ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No categories found</p>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category._id} className="relative">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectCategory(category._id);
                  }}
                  className="absolute top-3 left-3 z-10"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category._id)}
                    onChange={() => {}}
                    className="w-5 h-5 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <MobileCard
                  item={category}
                  fields={mobileFields}
                  onCardClick={handleCardClick}
                />
              </div>
            ))
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs">
                    <input
                      type="checkbox"
                      checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ICON</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">NAME</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">DESCRIPTION</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">PUBLISHED</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
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
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {category.parent && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                              Subcategory
                            </span>
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {category.name}
                          </span>
                        </div>
                        {category.parent && (
                          <p className="text-xs text-gray-500 mt-1">
                            Parent: {category.parent.name || 'Unknown'}
                          </p>
                        )}
                        {category.count !== undefined && (
                          <p className="text-xs text-gray-400 mt-1">
                            {category.count} {category.count === 1 ? 'product' : 'products'}
                          </p>
                        )}
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
                            onClick={() => handleCardClick(category)}
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

        {/* Detail Modal (View/Edit) */}
        <DetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Category Details"
          actions={
            <>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => openModal('edit', currentCategory)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium flex items-center gap-2"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(currentCategory._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </>
          }
        >
          {currentCategory && (
            <>
              <div className="mb-4">
                {currentCategory.icon && (
                  <img 
                    src={currentCategory.icon} 
                    alt={currentCategory.name} 
                    className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                  />
                )}
              </div>
              <DetailRow label="ID" value={currentCategory._id} />
              <DetailRow label="Name" value={currentCategory.name} />
              <DetailRow 
                label="Parent Category" 
                value={currentCategory.parent?.name || 'None (Top Level)'} 
              />
              <DetailRow label="Description" value={currentCategory.description} />
              <DetailRow 
                label="Published" 
                value={
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    currentCategory.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentCategory.published ? 'Yes' : 'No'}
                  </span>
                } 
              />
              <DetailRow 
                label="Product Count" 
                value={`${currentCategory.count || 0} ${currentCategory.count === 1 ? 'product' : 'products'}`} 
              />
            </>
          )}
        </DetailModal>

        {/* Add/Edit Form Modal */}
        {showModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={closeModal}
          >
            <div 
              className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {modalMode === 'add' ? 'Add New Category' : 'Edit Category'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                {errors.submit && (
                  <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                    <AlertCircle size={18} />
                    {errors.submit}
                  </div>
                )}

                <div className="space-y-4 sm:space-y-5">
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
                    <label htmlFor="parent" className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Category (Optional)
                    </label>
                    <select
                      id="parent"
                      value={formData.parent || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, parent: e.target.value || null }))}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">None (Top Level Category)</option>
                      {categories
                        .filter(cat => !cat.parent && cat._id !== currentCategory?._id)
                        .map(cat => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))
                      }
                    </select>
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
                            <span className="text-xs text-center px-2">Click to upload</span>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors.icon && (
                      <p className="mt-1.5 text-xs text-red-600">{errors.icon}</p>
                    )}
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

                <div className="flex justify-end gap-3 mt-6 sm:mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    {modalMode === 'add' ? 'Create Category' : 'Update Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;