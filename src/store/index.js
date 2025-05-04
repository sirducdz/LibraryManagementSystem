// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// Import API slice của auth
import { authApiSlice } from "../features/auth/api/authApiSlice";
import authReducer from "../features/auth/authSlice";
import { bookApiSlice } from "../features/books/api/bookApiSlice";
// Import các reducer khác (ví dụ: authSlice để lưu token/user state)
// import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    // Thêm reducer của authApiSlice
    [authApiSlice.reducerPath]: authApiSlice.reducer,
    auth: authReducer,
    [bookApiSlice.reducerPath]: bookApiSlice.reducer,
    // Thêm reducer của authSlice (nếu có)
    // auth: authReducer,
    // ... các reducer khác
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApiSlice.middleware, // Thêm middleware của authApiSlice
      // ... các middleware khác nếu có
      bookApiSlice.middleware 
    ),
});

setupListeners(store.dispatch);
