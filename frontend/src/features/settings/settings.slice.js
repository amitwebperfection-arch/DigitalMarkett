import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: localStorage.getItem('theme') || 'light',
  currency: 'USD'
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setCurrency: (state, action) => {
      state.currency = action.payload;
    }
  }
});

export const { setTheme, setCurrency } = settingsSlice.actions;
export default settingsSlice.reducer;