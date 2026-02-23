import React from 'react';
import { X } from 'lucide-react';

const DetailModal = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {children}
        </div>

        {/* Modal Footer - Actions */}
        {actions && (
          <div className="sticky bottom-0 bg-white flex justify-end gap-3 p-4 sm:p-6 border-t border-gray-200">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export const DetailRow = ({ label, value, className = '' }) => {
  return (
    <div className={`${className}`}>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
        {label}:
      </label>
      <div className="text-sm text-gray-900">{value}</div>
    </div>
  );
};

export default DetailModal;