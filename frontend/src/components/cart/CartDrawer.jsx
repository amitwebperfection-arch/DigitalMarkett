import { useDispatch, useSelector } from 'react-redux';
import { X, Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { closeDrawer, removeFromCart } from '../../features/cart/cart.slice';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const { items, isDrawerOpen } = useSelector(state => state.cart);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.salePrice || item.price),
    0
  );

  return (
    <>
      {/* Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[9998]"
          onClick={() => dispatch(closeDrawer())}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[420px] bg-white z-[9999]
        transform transition-transform duration-300 ease-in-out
        ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <ShoppingCart className="w-5 h-5" />
            Shopping Cart
          </div>
          <button
            onClick={() => dispatch(closeDrawer())}
            className="text-gray-500 hover:text-gray-800"
          >
            <X />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 && (
            <p className="text-center text-gray-500 mt-20">
              Your cart is empty
            </p>
          )}

          {items.map(item => (
            <div
              key={item.id}
              className="flex items-start gap-4 border-b pb-4"
            >
              {/* Image */}
              <img
                src={item.thumbnail || '/placeholder.jpg'}
                alt={item.title}
                className="w-16 h-16 rounded-lg object-cover border"
              />

              {/* Info */}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 text-sm">
                  {item.title}
                </h4>

                <p className="text-xs text-gray-500">
                  Item Price ${item.salePrice || item.price}
                </p>

                <p className="font-bold text-emerald-600 mt-1">
                  ${(item.salePrice || item.price).toFixed(2)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => dispatch(removeFromCart(item.id))}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>

                {/* Quantity UI (static for now) */}
                <div className="flex items-center border rounded-full px-2 py-1 gap-2">
                  <Minus size={14} />
                  <span className="text-sm font-medium">1</span>
                  <Plus size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 bg-white">
          <div className="flex justify-between font-semibold text-lg">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Shipping and taxes calculated at checkout.
          </p>

          <div className="flex gap-3 mt-4">
            <Link
              to="/cart"
              onClick={() => dispatch(closeDrawer())}
              className="flex-1 text-center border rounded-xl py-3 font-semibold hover:bg-gray-100"
            >
              View Cart
            </Link>

            <Link
              to="/checkout"
              onClick={() => dispatch(closeDrawer())}
              className="flex-1 text-center bg-emerald-500 text-white rounded-xl py-3 font-semibold hover:bg-emerald-600"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
