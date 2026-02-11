import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/auth.slice';
import cartReducer from '../features/cart/cart.slice';
import settingsReducer from '../features/settings/settings.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    settings: settingsReducer
  }
});