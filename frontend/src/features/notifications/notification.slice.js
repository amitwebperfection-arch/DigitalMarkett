import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notificationService';
import api from "../../services/api";


export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const data = await notificationService.getUnreadCount();
      return data.unreadCount;
    } catch {
      return rejectWithValue(0);
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async ({ page = 1, limit = 15 } = {}, { rejectWithValue }) => {
    try {
      return await notificationService.getNotifications(page, limit);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const markOneRead = createAsyncThunk(
  'notifications/markOne',
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const markAllRead = createAsyncThunk(
  'notifications/markAll',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    total: 0,
    pages: 1,
    currentPage: 1,
    loading: false,
    dropdownOpen: false,
  },
  reducers: {
    toggleDropdown: (state) => {
      state.dropdownOpen = !state.dropdownOpen;
    },
    closeDropdown: (state) => {
      state.dropdownOpen = false;
    },
    incrementUnread: (state) => {
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })

      .addCase(markOneRead.fulfilled, (state, action) => {
        const n = state.items.find((i) => i._id === action.payload);
        if (n && !n.isRead) {
          n.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      .addCase(markAllRead.fulfilled, (state) => {
        state.items.forEach((n) => (n.isRead = true));
        state.unreadCount = 0;
      });
  },
});

export const { toggleDropdown, closeDropdown, incrementUnread } = notificationSlice.actions;
export default notificationSlice.reducer;