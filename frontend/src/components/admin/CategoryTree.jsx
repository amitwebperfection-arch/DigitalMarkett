import React from 'react';
import { Link } from 'react-router-dom';

const CategoryTree = ({ categories }) => {
  const parentCategories = categories.filter(cat => !cat.parent);

  return (
    <div className="space-y-4">
      {parentCategories.map(parent => {
        const subcategories = categories.filter(cat => cat.parent === parent._id);
        
        return (
          <div key={parent._id} className="border rounded-lg p-4">
            <Link 
              to={`/category/${parent.slug}`}
              className="flex items-center gap-3 font-medium text-lg hover:text-primary-600"
            >
              <img src={parent.icon} alt={parent.name} className="w-8 h-8 rounded" />
              {parent.name}
              {parent.count > 0 && (
                <span className="text-sm text-gray-500">({parent.count})</span>
              )}
            </Link>
            
            {subcategories.length > 0 && (
              <div className="mt-3 ml-11 space-y-2">
                {subcategories.map(sub => (
                  <Link
                    key={sub._id}
                    to={`/category/${sub.slug}`}
                    className="block text-sm text-gray-600 hover:text-primary-600"
                  >
                    └─ {sub.name}
                    {sub.count > 0 && (
                      <span className="text-gray-400 ml-1">({sub.count})</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryTree;