import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, clearCart } from '../../features/cart/cart.slice';
import { Trash2, ShoppingCart } from 'lucide-react';

function Cart() {
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const total = items.reduce((sum, item) => sum + (item.salePrice || item.price), 0);

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center space-y-4">
        <ShoppingCart className="mx-auto w-16 h-16 text-gray-400" />
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-gray-500">Add some products to get started</p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="container-custom py-12 space-y-8">
      <h1 className="text-3xl font-bold">Shopping Cart</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.thumbnail || '/placeholder.jpg'}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="text-gray-600">${item.salePrice || item.price}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="border p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-bold">Order Summary</h2>

          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-gray-700">
            <span>Items</span>
            <span>{items.length}</span>
          </div>

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Proceed to Checkout
          </button>

          <button
            onClick={() => dispatch(clearCart())}
            className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
