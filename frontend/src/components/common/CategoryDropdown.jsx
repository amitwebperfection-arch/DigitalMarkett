import { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Search, X } from 'lucide-react';

function CategoryDropdown({ categories, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedParents, setExpandedParents] = useState(new Set());

  const parentCategories = categories.filter(cat => !cat.parent && cat.published);

  const selectedCategory = categories.find(cat => cat.slug === value);
  const selectedParent = selectedCategory?.parent 
    ? categories.find(cat => cat._id === selectedCategory.parent._id || cat._id === selectedCategory.parent)
    : null;

  const filterCategories = (parent, subcategories) => {
    if (!searchQuery) return subcategories;
    
    const query = searchQuery.toLowerCase();
    return subcategories.filter(sub => 
      sub.name.toLowerCase().includes(query) ||
      parent.name.toLowerCase().includes(query)
    );
  };

  const toggleParent = (parentId) => {
    setExpandedParents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) {
        newSet.delete(parentId);
      } else {
        newSet.add(parentId);
      }
      return newSet;
    });
  };

  const handleSelect = (slug) => {
    onChange({ target: { name: 'category', value: slug } });
    setIsOpen(false);
    setSearchQuery('');
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange({ target: { name: 'category', value: '' } });
  };

  const getDisplayText = () => {
    if (!selectedCategory) return 'Select a category';
    if (selectedParent) {
      return `${selectedParent.name} → ${selectedCategory.name}`;
    }
    return selectedCategory.name;
  };

  return (
    <div className="w-full">
      <label className="block font-medium mb-2 text-sm sm:text-base">
        Category <span className="text-red-500">*</span>
      </label>
      
      <div className="relative">
        {/* Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left bg-white border rounded-lg flex items-center justify-between transition-all text-sm sm:text-base ${
            isOpen 
              ? 'border-primary-500 ring-2 ring-primary-100' 
              : 'border-gray-300 hover:border-gray-400'
          } ${!value ? 'text-gray-500' : 'text-gray-900'}`}
        >
          <span className="truncate pr-2">{getDisplayText()}</span>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {value && (
              <X 
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hover:text-gray-600" 
                onClick={clearSelection}
              />
            )}
            <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`} />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Content */}
            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 sm:max-h-96 overflow-hidden">
              {/* Search Box */}
              <div className="p-2 sm:p-3 border-b border-gray-200 sticky top-0 bg-white">
                <div className="relative">
                  <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Categories List */}
              <div className="overflow-y-auto max-h-60 sm:max-h-80">
                {parentCategories.length === 0 ? (
                  <div className="p-3 sm:p-4 text-center text-gray-500 text-sm">
                    No categories available
                  </div>
                ) : (
                  parentCategories.map(parent => {
                    const subcategories = categories.filter(
                      sub =>
                        sub.parent &&
                        (sub.parent._id?.toString() === parent._id.toString() ||
                         sub.parent.toString() === parent._id.toString()) &&
                        sub.published
                    );

                    const filteredSubs = filterCategories(parent, subcategories);
                    const isExpanded = expandedParents.has(parent._id);
                    const hasSubcategories = subcategories.length > 0;

                    if (searchQuery && filteredSubs.length === 0 && 
                        !parent.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                      return null;
                    }

                    return (
                      <div key={parent._id} className="border-b border-gray-100 last:border-b-0">
                        {/* Parent Category */}
                        <div
                          className={`flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !hasSubcategories && value === parent.slug ? 'bg-primary-50' : ''
                          }`}
                          onClick={() => {
                            if (hasSubcategories) {
                              toggleParent(parent._id);
                            } else {
                              handleSelect(parent.slug);
                            }
                          }}
                        >
                          <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                            {hasSubcategories && (
                              <ChevronRight 
                                className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform flex-shrink-0 ${
                                  isExpanded ? 'transform rotate-90' : ''
                                }`}
                              />
                            )}
                            <span className={`font-medium text-sm sm:text-base truncate ${
                              !hasSubcategories && value === parent.slug 
                                ? 'text-primary-600' 
                                : 'text-gray-700'
                            }`}>
                              {parent.name}
                            </span>
                            {hasSubcategories && (
                              <span className="text-xs text-gray-400 flex-shrink-0">
                                ({subcategories.length})
                              </span>
                            )}
                          </div>
                          {!hasSubcategories && value === parent.slug && (
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
                          )}
                        </div>

                        {/* Subcategories */}
                        {hasSubcategories && isExpanded && (
                          <div className="bg-gray-50">
                            {filteredSubs.length === 0 ? (
                              <div className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-500 italic">
                                No matching subcategories
                              </div>
                            ) : (
                              filteredSubs.map(sub => (
                                <div
                                  key={sub._id}
                                  onClick={() => handleSelect(sub.slug)}
                                  className={`flex items-center justify-between px-3 sm:px-4 py-2 pl-6 sm:pl-10 cursor-pointer transition-colors ${
                                    value === sub.slug
                                      ? 'bg-primary-100 text-primary-700'
                                      : 'hover:bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  <span className={`text-xs sm:text-sm truncate ${
                                    value === sub.slug ? 'font-medium' : ''
                                  }`}>
                                    {sub.name}
                                  </span>
                                  {value === sub.slug && (
                                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600 flex-shrink-0 ml-2" />
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Selected Category Display */}
      {value && (
        <div className="mt-1 sm:mt-2 flex items-center gap-1 sm:gap-2 text-xs text-gray-600">
          <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
          <span className="truncate">
            Selected: <strong className="text-gray-900">{getDisplayText()}</strong>
          </span>
        </div>
      )}

      {!value && (
        <p className="text-xs text-red-500 mt-1">Please select a category</p>
      )}
    </div>
  );
}

export default CategoryDropdown;