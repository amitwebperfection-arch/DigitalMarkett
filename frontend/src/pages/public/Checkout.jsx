import { useState, useEffect } from 'react';
import api from '../../services/api';
import { applyCoupon as applyCouponAction } from '../../features/cart/cart.slice';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { paymentService } from '../../services/payment.service';
import { clearCart } from '../../features/cart/cart.slice';
import toast from 'react-hot-toast';
import { CreditCard, Wallet, User, MapPin, Search } from 'lucide-react';
import { allCountries } from './countries';
import { useSettings, useFormatPrice } from '../../context/SettingsContext'; 

import {
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

function Checkout() {
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { paymentMethods, taxEnabled, taxRate } = useSettings();
  const formatPrice = useFormatPrice();

  const stripe = useStripe();
  const elements = useElements();

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCouponId, setAppliedCouponId] = useState(null);

  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (paymentMethods?.wallet?.enabled) {
      api.get('/wallet/transactions').then(res => {
        setWalletBalance(res.data.balance || 0);
      }).catch(() => {});
    }
  }, [paymentMethods?.wallet?.enabled]);

  const getDefaultPayment = () => {
    if (paymentMethods?.stripe?.enabled)   return 'stripe';
    if (paymentMethods?.razorpay?.enabled) return 'razorpay';
    if (paymentMethods?.wallet?.enabled)   return 'wallet';
    if (paymentMethods?.cod?.enabled)      return 'cod';
    return 'stripe';
  };
  const [paymentMethod, setPaymentMethod] = useState(getDefaultPayment);
  const [isProcessing, setIsProcessing] = useState(false);

  const [personalDetails, setPersonalDetails] = useState({
    firstName: '', lastName: '', email: '', phone: ''
  });

  const [shippingAddress, setShippingAddress] = useState({
    addressLine1: '', addressLine2: '',
    city: '', state: '', zipCode: '', country: ''
  });

  // Country search state
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState(allCountries);

  useEffect(() => {
    const countryList = allCountries.sort((a, b) => a.name.localeCompare(b.name));
    setCountries(countryList);
    setFilteredCountries(countryList);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.country-selector')) setShowCountryDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (countrySearch.trim() === '') {
      setFilteredCountries(countries);
    } else {
      setFilteredCountries(countries.filter(c =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase())
      ));
    }
  }, [countrySearch, countries]);

  const subtotal = items.reduce((sum, item) => sum + (item.salePrice || item.price), 0);
  const taxAmount = taxEnabled ? (subtotal * taxRate) / 100 : 0;
  const totalBeforeDiscount = subtotal + taxAmount;
  const finalTotal = totalBeforeDiscount - discount;

  const handlePersonalDetailsChange = (e) => {
    setPersonalDetails({ ...personalDetails, [e.target.name]: e.target.value });
  };

  const handleShippingAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleCountrySelect = (country) => {
    setShippingAddress({ ...shippingAddress, country: country.name });
    setCountrySearch(country.name);
    setShowCountryDropdown(false);
  };

  const handleApplyCoupon = async () => {
    try {
      const res = await api.post('/coupons/apply', {
        code: couponCode,
        cartTotal: subtotal,
        productIds: items.map(item => item._id || item.id),
      });
      setDiscount(res.data.discount);
      setAppliedCouponId(res.data.couponId);
      dispatch(applyCouponAction(res.data));
      toast.success(`Coupon applied! Discount: ${formatPrice(res.data.discount)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      setDiscount(0);
      setAppliedCouponId(null);
    }
  };

  const validateForm = () => {
    if (!personalDetails.firstName || !personalDetails.lastName) {
      toast.error('Please enter your full name'); return false;
    }
    if (!personalDetails.email) {
      toast.error('Please enter your email'); return false;
    }
    if (!personalDetails.phone) {
      toast.error('Please enter your phone number'); return false;
    }
    if (!shippingAddress.addressLine1) {
      toast.error('Please enter your address'); return false;
    }
    if (!shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      toast.error('Please complete your shipping address'); return false;
    }
    if (!shippingAddress.country) {
      toast.error('Please select your country'); return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    if (!validateForm()) return;
    if (paymentMethod === 'stripe' && (!stripe || !elements)) {
      toast.error('Stripe not loaded'); return;
    }
    if (paymentMethod === 'wallet' && walletBalance < finalTotal) {
      toast.error(`Insufficient wallet balance. Available: ${formatPrice(walletBalance)}`);
      setIsProcessing(false);
      return;
    }
    setIsProcessing(true);
    try {
      const orderResponse = await orderService.createOrder({
        items: items.map(item => ({ productId: item._id || item.id })),
        paymentMethod,
        total: finalTotal,
        couponCode: couponCode || null,
        couponId: appliedCouponId || null,
        personalDetails,
        shippingAddress
      });

      const orderId = orderResponse.order._id;

      if (paymentMethod === 'stripe') {
        const { clientSecret } = await paymentService.createPaymentIntent(orderId, 'stripe');
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: `${personalDetails.firstName} ${personalDetails.lastName}`,
              email: personalDetails.email,
              phone: personalDetails.phone,
              address: {
                line1: shippingAddress.addressLine1,
                line2: shippingAddress.addressLine2,
                city: shippingAddress.city,
                state: shippingAddress.state,
                postal_code: shippingAddress.zipCode,
                country: 'US'
              }
            }
          },
        });
        if (result.error) throw new Error(result.error.message);
      }

      if (paymentMethod === 'razorpay') {
        await paymentService.createPaymentIntent(orderId, 'razorpay');
      }
      if (paymentMethod === 'wallet') {
        await paymentService.createPaymentIntent(orderId, 'wallet');
      }

      toast.success('Order placed successfully!');
      dispatch(clearCart());
      navigate('/user/orders');
    } catch (error) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
      
        <div className="lg:col-span-2 space-y-6">

        
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold">Personal Details</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name <span className="text-red-500">*</span></label>
                <input type="text" name="firstName" value={personalDetails.firstName}
                  onChange={handlePersonalDetailsChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="John" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name <span className="text-red-500">*</span></label>
                <input type="text" name="lastName" value={personalDetails.lastName}
                  onChange={handlePersonalDetailsChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Doe" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={personalDetails.email}
                  onChange={handlePersonalDetailsChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="john@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone <span className="text-red-500">*</span></label>
                <input type="tel" name="phone" value={personalDetails.phone}
                  onChange={handlePersonalDetailsChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+1 (555) 000-0000" required />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold">Shipping Address</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Address Line 1 <span className="text-red-500">*</span></label>
                <input type="text" name="addressLine1" value={shippingAddress.addressLine1}
                  onChange={handleShippingAddressChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="123 Main Street" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address Line 2</label>
                <input type="text" name="addressLine2" value={shippingAddress.addressLine2}
                  onChange={handleShippingAddressChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Apartment, suite, etc. (optional)" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City <span className="text-red-500">*</span></label>
                  <input type="text" name="city" value={shippingAddress.city}
                    onChange={handleShippingAddressChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="New York" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State <span className="text-red-500">*</span></label>
                  <input type="text" name="state" value={shippingAddress.state}
                    onChange={handleShippingAddressChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="NY" required />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ZIP Code <span className="text-red-500">*</span></label>
                  <input type="text" name="zipCode" value={shippingAddress.zipCode}
                    onChange={handleShippingAddressChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="10001" required />
                </div>
                <div className="relative country-selector">
                  <label className="block text-sm font-medium mb-2">Country <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type="text" value={countrySearch}
                      onChange={(e) => { setCountrySearch(e.target.value); setShowCountryDropdown(true); }}
                      onFocus={() => setShowCountryDropdown(true)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                      placeholder="Search country..." required />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {showCountryDropdown && filteredCountries.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCountries.slice(0, 10).map((country) => (
                        <button key={country.code} type="button" onClick={() => handleCountrySelect(country)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 transition-colors">
                          <span className="text-xl">{country.flag}</span>
                          <span>{country.name}</span>
                        </button>
                      ))}
                      {filteredCountries.length > 10 && (
                        <div className="px-4 py-2 text-sm text-gray-500 border-t">
                          {filteredCountries.length - 10} more... keep typing
                        </div>
                      )}
                    </div>
                  )}
                  {showCountryDropdown && filteredCountries.length === 0 && countrySearch && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center text-gray-500">
                      No countries found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold">Payment Method</h2>
            </div>

            <div className="space-y-4">
    
              {paymentMethods?.stripe?.enabled && (
                <>
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                    <input type="radio" name="payment" value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary-600" />
                    <CreditCard className="w-5 h-5" />
                    <span>Credit / Debit Card (Stripe)</span>
                  </label>
                  {paymentMethod === 'stripe' && (
                    <div className="border rounded-lg p-4 ml-8">
                      <p className="font-medium mb-3">Card Details</p>
                      <CardElement options={{ style: { base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } } } }} />
                    </div>
                  )}
                </>
              )}

              {/* Razorpay */}
              {paymentMethods?.razorpay?.enabled && (
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input type="radio" name="payment" value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-primary-600" />
                  <span>Razorpay</span>
                </label>
              )}

              {/* wallet */}
              {paymentMethods?.wallet?.enabled && (
                <div>
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                    <input type="radio" name="payment" value="wallet"
                      checked={paymentMethod === 'wallet'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary-600" />
                    <Wallet className="w-5 h-5" />
                    <span>Wallet</span>
                    <span className="ml-auto text-sm font-medium text-green-600">
                      {formatPrice(walletBalance)}
                    </span>
                  </label>
          
                  {paymentMethod === 'wallet' && walletBalance < finalTotal && (
                    <p className="text-red-500 text-sm mt-1 ml-2">
                      ⚠️ Insufficient balance. Required: {formatPrice(finalTotal)}, Available: {formatPrice(walletBalance)}
                    </p>
                  )}
                </div>
              )}

              {/* COD */}
              {paymentMethods?.cod?.enabled && (
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input type="radio" name="payment" value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-primary-600" />
                  <span>Cash on Delivery</span>
                </label>
              )}

    
              {!paymentMethods?.stripe?.enabled &&
               !paymentMethods?.razorpay?.enabled &&
               !paymentMethods?.wallet?.enabled &&
               !paymentMethods?.cod?.enabled && (
                <p className="text-red-500 text-sm p-4 bg-red-50 rounded-lg">
                  No payment methods are currently available. Please contact support.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4 space-y-4">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item._id || item.id} className="flex justify-between text-sm border-b pb-2">
                  <span className="flex-1 truncate">{item.title}</span>
        
                  <span className="font-medium ml-2">{formatPrice(item.salePrice || item.price)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

        
              {taxEnabled && taxAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax ({taxRate}%)</span>
                  <span>+{formatPrice(taxAmount)}</span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-green-600 text-sm">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="border-t pt-4">
              <label className="block font-medium mb-2">Apply Coupon</label>
              <div className="flex gap-2">
                <input type="text" value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="COUPON CODE" />
                <button onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  disabled={!couponCode}>
                  Apply
                </button>
              </div>
              {discount > 0 && (
                <p className="text-green-600 mt-2 text-sm">✓ Coupon {couponCode} applied!</p>
              )}
            </div>

            <button onClick={handlePayment} disabled={isProcessing}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-semibold transition-colors">
              {isProcessing ? 'Processing...' : `Pay ${formatPrice(finalTotal)}`}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By placing your order, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;