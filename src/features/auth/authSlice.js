// src/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = { user: null, accessToken: null, refreshToken: null };

// Hàm tải trạng thái ban đầu (Ưu tiên localStorage)
const loadInitialState = () => {
    let user = null, accessToken = null, refreshToken = null, source = null;

    const storagesToCheck = [localStorage, sessionStorage]; // Ưu tiên localStorage

    for (const storage of storagesToCheck) {
         try {
             const token = storage.getItem('accessToken');
             const refresh = storage.getItem('refreshToken');
             const userString = storage.getItem('userData');
             if (token && refresh && userString) {
                 user = JSON.parse(userString);
                 accessToken = token;
                 refreshToken = refresh;
                 source = storage === localStorage ? 'localStorage' : 'sessionStorage';
                 console.log(`authSlice: Loaded initial state from ${source}`);
                 break; // Dừng lại ngay khi tìm thấy dữ liệu hợp lệ
             }
         } catch (error) {
             console.error(`authSlice: Error reading ${storage === localStorage ? 'localStorage' : 'sessionStorage'}`, error);
         }
    }

    if (user && accessToken && refreshToken) {
        return { user, accessToken, refreshToken };
    } else {
         console.log("authSlice: No valid session found in storage. Clearing.");
         localStorage.removeItem("accessToken"); // Xóa hết cho chắc
         localStorage.removeItem("refreshToken");
         localStorage.removeItem("userData");
         sessionStorage.removeItem("accessToken");
         sessionStorage.removeItem("refreshToken");
         sessionStorage.removeItem("userData");
         return initialState;
    }
};


const authSlice = createSlice({
    name: 'auth',
    initialState: loadInitialState(),
    reducers: {
        setCredentials: (state, action) => {
            console.log("hello world");
            
            // *** Nhận thêm rememberMe từ payload ***
            const { user, accessToken, refreshToken, rememberMe } = action.payload;
            state.user = user;
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;

            // *** Chọn storage dựa trên rememberMe ***
            const storageToUse = rememberMe ? localStorage : sessionStorage;
            const storageToRemove = rememberMe ? sessionStorage : localStorage;
            const storageName = rememberMe ? 'localStorage' : 'sessionStorage';

             // Xóa dữ liệu ở storage không được chọn để tránh trùng lặp
             try {
                 storageToRemove.removeItem('accessToken');
                 storageToRemove.removeItem('refreshToken');
                 storageToRemove.removeItem('userData');
             } catch (e) { console.error("Error clearing other storage", e); }

            // Lưu vào storage được chọn
            try {
                storageToUse.setItem('accessToken', accessToken);
                storageToUse.setItem('refreshToken', refreshToken);
                storageToUse.setItem('userData', JSON.stringify(user));
                console.log(`authSlice: Credentials set and saved to ${storageName}`);
            } catch (error) {
                console.error(`authSlice: Failed to save credentials to ${storageName}`, error);
            }
        },
        logOut: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            // Xóa khỏi cả hai storage khi logout
            try {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("userData");
                sessionStorage.removeItem("accessToken");
                sessionStorage.removeItem("refreshToken");
                sessionStorage.removeItem("userData");
                console.log("authSlice: Credentials logged out and storage cleared");
            } catch (error) {
                 console.error("authSlice: Failed to clear storage on logout", error);
            }
        },
    },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;

// Selectors (giữ nguyên)
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentAccessToken = (state) => state.auth.accessToken;
export const selectCurrentRefreshToken = (state) => state.auth.refreshToken;
export const selectIsAuthenticated = (state) => !!state.auth.accessToken;