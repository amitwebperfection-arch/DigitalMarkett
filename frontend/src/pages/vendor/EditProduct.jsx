import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import toast from 'react-hot-toast';
import { Upload, X, Plus, Trash2 } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CategoryDropdown from '../../components/common/CategoryDropdown';

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [productFiles, setProductFiles] = useState([]);

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

  const [changelog, setChangelog] = useState([
    { version: '1.0.0', date: new Date().toISOString().split('T')[0], changes: ['Initial release'] }
  ]);

  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productService.getVendorProduct(id);
      return response.product;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (productData) {
      setFormData({
        title: productData.title || '',
        description: productData.description || '',
        shortDescription: productData.shortDescription || '',
        price: productData.price || '',
        salePrice: productData.salePrice || '',
        category: productData.category || '',
        tags: productData.tags?.join(', ') || '',
        demoUrl: productData.demoUrl || '',
        documentation: productData.documentation || '',
        version: productData.version || '1.0.0',
        requirements: productData.requirements || '',
        compatibleWith: productData.compatibleWith?.join(', ') || '',
        featured: productData.featured || false
      });

      if (productData.thumbnail) {
        setPreview(productData.thumbnail);
      }

      if (productData.changelog && productData.changelog.length > 0) {
        setChangelog(productData.changelog);
      }
    }
  }, [productData]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: () => {
      toast.success('Product updated successfully!');
      navigate('/vendor/products');
    },
    onError: (error) => {
      console.error('❌ Error:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

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
    setPreview(productData?.thumbnail || null);
  };

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
      
      if (file.size > 100 * 1024 * 1024) {
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

    if (!formData.title || !formData.description || !formData.price) {
      toast.error('Please fill required fields');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    const data = new FormData();

    if (thumbnail) {
      data.append('thumbnail', thumbnail, thumbnail.name);
    }

    if (additionalImages.length > 0) {
      additionalImages.forEach((img) => {
        data.append('images', img, img.name);
      });
    }

    if (productFiles.length > 0) {
      productFiles.forEach((file) => {
        data.append('files', file, file.name);
      });
    }

    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('shortDescription', formData.shortDescription);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('version', formData.version);
    data.append('featured', formData.featured);

    if (formData.salePrice) data.append('salePrice', formData.salePrice);
    if (formData.demoUrl) data.append('demoUrl', formData.demoUrl);
    if (formData.documentation) data.append('documentation', formData.documentation);
    if (formData.requirements) data.append('requirements', formData.requirements);

    if (formData.tags) {
      formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
        .forEach(tag => data.append('tags', tag));
    }

    if (formData.compatibleWith) {
      formData.compatibleWith
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
        .forEach(item => data.append('compatibleWith', item));
    }

    data.append('changelog', JSON.stringify(changelog));

    updateMutation.mutate({ id, data });
  };

  if (isLoadingProduct) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="py-4 px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">Product not found</p>
          <button onClick={() => navigate('/vendor/products')} className="btn-primary">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 px-2 sm:py-4 sm:px-4 md:py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6">Edit Product</h1>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8 bg-white p-3 sm:p-4 md:p-8 rounded-lg shadow">
          
          {/* THUMBNAIL */}
          <div>
            <label className="block font-medium mb-2 text-sm sm:text-base">Product Thumbnail *</label>
            {preview ? (
              <div className="relative w-full h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden border-2 border-gray-300">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 sm:p-2 rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                {thumbnail && (
                  <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    New thumbnail
                  </span>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 sm:h-56 md:h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition">
                <Upload className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400 mb-2" />
                <span className="text-gray-500 text-sm sm:text-base">Click to upload</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {thumbnail ? 'New thumbnail will replace current' : 'Leave empty to keep existing'}
            </p>
          </div>

          {/* EXISTING IMAGES INFO */}
          {productData?.images?.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded text-sm">
              <p className="text-blue-800">
                <strong>Current Gallery:</strong> {productData.images.length} image(s) saved. 
                New images will be added.
              </p>
            </div>
          )}

          {/* ADDITIONAL IMAGES */}
          <div>
            <label className="block font-medium mb-2 text-sm sm:text-base">Add Gallery Images</label>
            
            {additionalImages.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">New Images (will be added)</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                  {additionalImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square">
                      <img 
                        src={URL.createObjectURL(img)} 
                        alt={`Preview ${idx}`} 
                        className="w-full h-full object-cover rounded border-2 border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 sm:p-1 rounded-full"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 text-sm sm:text-base">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
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

          {/* EXISTING FILES INFO */}
          {productData?.files?.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Current Files:</strong>
              </p>
              <div className="space-y-1 text-xs sm:text-sm">
                {productData.files.map((file, idx) => (
                  <div key={idx} className="text-blue-700 truncate">
                    • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-600 mt-2">New files will be added.</p>
            </div>
          )}

          {/* PRODUCT FILES */}
          <div>
            <label className="block font-medium mb-2 text-sm sm:text-base">Add Product Files</label>
            
            {productFiles.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">New Files (will be added)</p>
                <div className="space-y-2">
                  {productFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-blue-50 p-2 sm:p-3 rounded border border-blue-200 text-sm">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate block">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProductFile(idx)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 text-sm sm:text-base">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              Add Files
              <input
                type="file"
                multiple
                accept=".zip,.pdf,.rar"
                onChange={handleProductFiles}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">ZIP, PDF, RAR (Max 100MB)</p>
          </div>

          {/* BASIC INFO */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block font-medium mb-2 text-sm sm:text-base">Product Title *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter product title"
                className="input w-full text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-2 text-sm sm:text-base">Short Description</label>
              <input
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="Brief description"
                className="input w-full text-sm sm:text-base"
                maxLength={300}
              />
            </div>

            <div>
              <label className="block font-medium mb-2 text-sm sm:text-base">Full Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed description"
                className="input w-full h-32 sm:h-36 md:h-40 text-sm sm:text-base"
                required
              />
            </div>
          </div>

          {/* PRICING */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block font-medium mb-2 text-sm sm:text-base">Regular Price ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className="input w-full text-sm sm:text-base"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2 text-sm sm:text-base">Sale Price ($)</label>
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                placeholder="0.00"
                className="input w-full text-sm sm:text-base"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* CATEGORY & VERSION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <CategoryDropdown
              categories={categoryData?.categories || []}
              value={formData.category}
              onChange={handleChange}
            />
            
            <div>
              <label className="block font-medium mb-2 text-sm sm:text-base">Version</label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleChange}
                className="input w-full text-sm sm:text-base"
                placeholder="1.0.0"
              />
            </div>
          </div>

          {/* TAGS & COMPATIBLE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block font-medium mb-2 text-sm sm:text-base">Tags</label>
              <input
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="wordpress, theme"
                className="input w-full text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block font-medium mb-2 text-sm sm:text-base">Compatible With</label>
              <input
                name="compatibleWith"
                value={formData.compatibleWith}
                onChange={handleChange}
                placeholder="WordPress 6.0"
                className="input w-full text-sm sm:text-base"
              />
            </div>
          </div>

          {/* URLS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block font-medium mb-2 text-sm sm:text-base">Demo URL</label>
              <input
                type="url"
                name="demoUrl"
                value={formData.demoUrl}
                onChange={handleChange}
                placeholder="https://demo.com"
                className="input w-full text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block font-medium mb-2 text-sm sm:text-base">Documentation URL</label>
              <input
                type="url"
                name="documentation"
                value={formData.documentation}
                onChange={handleChange}
                placeholder="https://docs.com"
                className="input w-full text-sm sm:text-base"
              />
            </div>
          </div>

          {/* REQUIREMENTS */}
          <div>
            <label className="block font-medium mb-2 text-sm sm:text-base">Requirements</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="System requirements"
              className="input w-full h-20 sm:h-24 text-sm sm:text-base"
            />
          </div>

          {/* CHANGELOG */}
          <div>
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <label className="block font-medium text-sm sm:text-base">Changelog</label>
              <button
                type="button"
                onClick={addChangelogEntry}
                className="btn-secondary text-xs sm:text-sm flex items-center gap-1"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                Add Version
              </button>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              {changelog.map((entry, entryIdx) => (
                <div key={entryIdx} className="border p-3 sm:p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3">
                    <input
                      type="text"
                      placeholder="Version"
                      value={entry.version}
                      onChange={(e) => updateChangelogEntry(entryIdx, 'version', e.target.value)}
                      className="input flex-1 text-sm sm:text-base"
                    />
                    <input
                      type="date"
                      value={entry.date}
                      onChange={(e) => updateChangelogEntry(entryIdx, 'date', e.target.value)}
                      className="input text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => removeChangelogEntry(entryIdx)}
                      className="text-red-500 self-center sm:self-auto"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {entry.changes.map((change, changeIdx) => (
                      <div key={changeIdx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Change"
                          value={change}
                          onChange={(e) => updateChangelogChange(entryIdx, changeIdx, e.target.value)}
                          className="input flex-1 text-sm sm:text-base"
                        />
                        <button
                          type="button"
                          onClick={() => removeChangelogChange(entryIdx, changeIdx)}
                          className="text-red-500"
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addChangelogChange(entryIdx)}
                      className="text-primary-600 text-xs sm:text-sm flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      Add Change
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FEATURED */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="font-medium text-sm sm:text-base">Mark as Featured</label>
          </div>

          {/* SUBMIT */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
            <button
              type="submit"
              className="btn-primary flex-1 text-sm sm:text-base"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/vendor/products')}
              className="btn-secondary text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;