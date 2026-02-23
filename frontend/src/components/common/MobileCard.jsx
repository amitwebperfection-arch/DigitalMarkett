import React from 'react';

/**
 * MobileCard - Reusable card component for mobile view
 * Displays data in a card format and opens a modal on click
 */
const MobileCard = ({ item, fields, onCardClick, statusConfig }) => {
  return (
    <div
      onClick={() => onCardClick(item)}
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
    >
      {fields.map((field, index) => (
        <div key={index} className={`${index > 0 ? 'mt-3' : ''}`}>
          {field.render ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase">
                {field.label}:
              </span>
              <div className="ml-2">{field.render(item)}</div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase">
                {field.label}:
              </span>
              <span className="ml-2 text-sm text-gray-900">
                {item[field.key] || 'N/A'}
              </span>
            </div>
          )}
        </div>
      ))}
      
      {/* Visual indicator to show it's tappable */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center text-xs text-gray-400">
        <span>Tap for details</span>
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default MobileCard;