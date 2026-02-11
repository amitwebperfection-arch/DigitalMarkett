import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: JSON.parse(localStorage.getItem('cart')) || [],
  total: 0,
  coupon: null,
  isDrawerOpen: false, // 🔥 NEW
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const exists = state.items.find(
        item => item.id === action.payload.id
      );

      if (!exists) {
        state.items.push(action.payload);
        localStorage.setItem('cart', JSON.stringify(state.items));
      }

      // 🔥 ADD TO CART → OPEN DRAWER
      state.isDrawerOpen = true;
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        item => item.id !== action.payload
      );
      localStorage.setItem('cart', JSON.stringify(state.items));
    },

    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.coupon = null;
      localStorage.removeItem('cart');
    },

    calculateTotal: (state) => {
      state.total = state.items.reduce(
        (sum, item) => sum + (item.salePrice || item.price),
        0
      );
    },

    applyCoupon: (state, action) => {
      state.coupon = action.payload;
    },

    removeCoupon: (state) => {
      state.coupon = null;
    },

    // 🔥 DRAWER CONTROLS
    openDrawer: (state) => {
      console.log('DRAWER OPEN ACTION HIT');
      state.isDrawerOpen = true;
    },

    closeDrawer: (state) => {
      state.isDrawerOpen = false;
    },
  }
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  calculateTotal,
  applyCoupon,
  removeCoupon,
  openDrawer,
  closeDrawer,
} = cartSlice.actions;

export default cartSlice.reducer;
