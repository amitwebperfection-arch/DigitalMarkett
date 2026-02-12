import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import toast from 'react-hot-toast';
import { Upload, X, Plus, Trash2 } from 'lucide-react';

function AddProduct() {
  const navigate = useNavigate();

  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [productFiles, setProductFiles] = useState([]);

  // ✅ Fetch categories
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: '',
    salePrice: '',
    category: '',
    tags: '',
    demoUrl: '',
    documentation: '',
    version: '1.0.0',
    requirements: '',
    compatibleWith: '',
    featured: false
  });

  // Changelog state
  const [changelog, setChangelog] = useState([
    { version: '1.0.0', date: new Date().toISOString().split('T')[0], changes: ['Initial release'] }
  ]);

  const createMutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: (response) => {
      toast.success('Product created successfully!');
      navigate('/vendor/products');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create product');
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // ✅ FIXED: Thumbnail handling with proper validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setThumbnail(file);
      
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setThumbnail(null);
    setPreview(null);
  };

  // Additional images handling
  const handleAdditionalImages = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB`);
        return false;
      }
      return true;
    });

    setAdditionalImages(prev => [...prev, ...validFiles]);
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ FIXED: Better file type validation
  const handleProductFiles = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const allowedTypes = [
        'application/zip',
        'application/x-zip-compressed',
        'application/pdf',
        'application/x-rar-compressed',
        'application/octet-stream'
      ];
      
      const allowedExtensions = ['.zip', '.pdf', '.rar'];
      const hasValidExtension = allowedExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );

      if (!allowedTypes.includes(file.type) && !hasValidExtension) {
        toast.error(`${file.name} is not a valid file type (ZIP, PDF, RAR only)`);
        return false;
      }
      
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error(`${file.name} exceeds 100MB limit`);
        return false;
      }
      
      return true;
    });
    
    setProductFiles(prev => [...prev, ...validFiles]);
  };

  const removeProductFile = (index) => {
    setProductFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Changelog handling
  const addChangelogEntry = () => {
    setChangelog(prev => [...prev, { 
      version: '', 
      date: new Date().toISOString().split('T')[0], 
      changes: [''] 
    }]);
  };

  const removeChangelogEntry = (index) => {
    setChangelog(prev => prev.filter((_, i) => i !== index));
  };

  const updateChangelogEntry = (index, field, value) => {
    setChangelog(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    ));
  };

  const addChangelogChange = (entryIndex) => {
    setChangelog(prev => prev.map((entry, i) => 
      i === entryIndex 
        ? { ...entry, changes: [...entry.changes, ''] }
        : entry
    ));
  };

  const updateChangelogChange = (entryIndex, changeIndex, value) => {
    setChangelog(prev => prev.map((entry, i) => 
      i === entryIndex 
        ? { 
            ...entry, 
            changes: entry.changes.map((change, j) => 
              j === changeIndex ? value : change
            )
          }
        : entry
    ));
  };

  const removeChangelogChange = (entryIndex, changeIndex) => {
    setChangelog(prev => prev.map((entry, i) => 
      i === entryIndex 
        ? { ...entry, changes: entry.changes.filter((_, j) => j !== changeIndex) }
        : entry
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.description || !formData.price) {
      toast.error('Please fill required fields');
      return;
    }

    if (!thumbnail) {
      toast.error('Please upload a product thumbnail');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    // ✅ CRITICAL FIX: Create FormData with thumbnail FIRST
    const data = new FormData();

    // ✅ Append thumbnail FIRST with explicit filename
    data.append('thumbnail', thumbnail, thumbnail.name);

    // Additional Images
    additionalImages.forEach((img, index) => {
      data.append('images', img, img.name);
    });

    // Product Files
    productFiles.forEach((file, index) => {
      data.append('files', file, file.name);
    });

    // Basic fields
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('shortDescription', formData.shortDescription);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('version', formData.version);
    data.append('featured', formData.featured);

    // Optional fields
    if (formData.salePrice) data.append('salePrice', formData.salePrice);
    if (formData.demoUrl) data.append('demoUrl', formData.demoUrl);
    if (formData.documentation) data.append('documentation', formData.documentation);
    if (formData.requirements) data.append('requirements', formData.requirements);

    // Tags
    if (formData.tags) {
      formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
        .forEach(tag => data.append('tags', tag));
    }

    // Compatible With
    if (formData.compatibleWith) {
      formData.compatibleWith
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
        .forEach(item => data.append('compatibleWith', item));
    }

    createMutation.mutate(data);
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add New Product</h1>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow">
          
          {/* ========== THUMBNAIL ========== */}
          <div>
            <label className="block font-medium mb-2">Product Thumbnail *</label>
            {preview ? (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-300">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition">
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-gray-500">Click to upload thumbnail</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          {/* ========== ADDITIONAL IMAGES ========== */}
          <div>
            <label className="block font-medium mb-2">Additional Images (Gallery)</label>
            <div className="flex flex-wrap gap-4 mb-4">
              {additionalImages.map((img, idx) => (
                <div key={idx} className="relative w-32 h-32">
                  <img 
                    src={URL.createObjectURL(img)} 
                    alt={`Preview ${idx}`} 
                    className="w-full h-full object-cover rounded border-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeAdditionalImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImages}
                className="hidden"
              />
            </label>
          </div>

          {/* ========== BASIC INFO ========== */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block font-medium mb-2">Product Title *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter product title"
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Short Description</label>
              <input
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="A brief one-line description"
                className="input w-full"
                maxLength={300}
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Full Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed product description"
                className="input w-full h-40"
                required
              />
            </div>
          </div>

          {/* ========== PRICING ========== */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-2">Regular Price ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className="input w-full"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Sale Price ($)</label>
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                placeholder="0.00"
                className="input w-full"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* ========== CATEGORY & VERSION ========== */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input w-full"
                required
              >
                <option value="">Select a category</option>
                {categoryLoading ? (
                  <option disabled>Loading categories...</option>
                ) : (
                  categoryData?.categories
                    ?.filter(cat => cat.published) // ✅ Only show published categories
                    ?.map((cat) => (
                      <option key={cat._id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))
                )}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-2">Version</label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleChange}
                className="input w-full"
                placeholder="1.0.0"
              />
            </div>
          </div>

          {/* ========== TAGS & COMPATIBLE WITH ========== */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-2">Tags (comma separated)</label>
              <input
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="wordpress, theme, responsive"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Compatible With (comma separated)</label>
              <input
                name="compatibleWith"
                value={formData.compatibleWith}
                onChange={handleChange}
                placeholder="WordPress 6.0, WooCommerce 8.0"
                className="input w-full"
              />
            </div>
          </div>

          {/* ========== URLS ========== */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-2">Demo URL</label>
              <input
                type="url"
                name="demoUrl"
                value={formData.demoUrl}
                onChange={handleChange}
                placeholder="https://demo.example.com"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Documentation URL</label>
              <input
                type="url"
                name="documentation"
                value={formData.documentation}
                onChange={handleChange}
                placeholder="https://docs.example.com"
                className="input w-full"
              />
            </div>
          </div>

          {/* ========== REQUIREMENTS ========== */}
          <div>
            <label className="block font-medium mb-2">Requirements</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="System requirements, dependencies, etc."
              className="input w-full h-24"
            />
          </div>

          {/* ========== PRODUCT FILES ========== */}
          <div>
            <label className="block font-medium mb-2">Product Files (ZIP, PDF, RAR)</label>
            <div className="space-y-2 mb-4">
              {productFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProductFile(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Files
              <input
                type="file"
                multiple
                accept=".zip,.pdf,.rar,application/zip,application/pdf,application/x-rar-compressed"
                onChange={handleProductFiles}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">Accepted: ZIP, PDF, RAR (Max 100MB per file)</p>
          </div>

          {/* ========== CHANGELOG ========== */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block font-medium">Changelog</label>
              <button
                type="button"
                onClick={addChangelogEntry}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Version
              </button>
            </div>
            
            <div className="space-y-4">
              {changelog.map((entry, entryIdx) => (
                <div key={entryIdx} className="border p-4 rounded-lg">
                  <div className="flex gap-4 mb-3">
                    <input
                      type="text"
                      placeholder="Version (e.g., 1.0.1)"
                      value={entry.version}
                      onChange={(e) => updateChangelogEntry(entryIdx, 'version', e.target.value)}
                      className="input flex-1"
                    />
                    <input
                      type="date"
                      value={entry.date}
                      onChange={(e) => updateChangelogEntry(entryIdx, 'date', e.target.value)}
                      className="input"
                    />
                    <button
                      type="button"
                      onClick={() => removeChangelogEntry(entryIdx)}
                      className="text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {entry.changes.map((change, changeIdx) => (
                      <div key={changeIdx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Change description"
                          value={change}
                          onChange={(e) => updateChangelogChange(entryIdx, changeIdx, e.target.value)}
                          className="input flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeChangelogChange(entryIdx, changeIdx)}
                          className="text-red-500"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addChangelogChange(entryIdx)}
                      className="text-primary-600 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Change
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========== FEATURED ========== */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="font-medium">Mark as Featured</label>
          </div>

          {/* ========== SUBMIT ========== */}
          <div className="flex space-x-4 pt-4 border-t">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/vendor/products')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;