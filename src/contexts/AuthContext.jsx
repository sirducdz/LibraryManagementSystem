// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';

// --- Định nghĩa Actions cho Reducer ---
const ACTIONS = {
  INITIALIZE: 'INITIALIZE', // Khởi tạo state từ localStorage
  LOGIN: 'LOGIN',         // Xử lý khi đăng nhập thành công
  LOGOUT: 'LOGOUT',        // Xử lý khi đăng xuất
  SET_LOADING: 'SET_LOADING', // (Tùy chọn) Đặt trạng thái loading
};

// --- State khởi tạo ---
const initialState = {
  isAuthenticated: false, // Ban đầu chưa xác thực
  user: null,             // Chưa có thông tin người dùng
  token: null,            // Chưa có token
  isLoading: true,        // Đang tải/kiểm tra trạng thái ban đầu
};


// --- Reducer để quản lý state ---
// Nhận state hiện tại và action, trả về state mới
const authReducer = (state, action) => {
  console.log("Auth Reducer Action:", action.type, action.payload); // Log để debug
  switch (action.type) {
    case ACTIONS.INITIALIZE:
    case ACTIONS.LOGIN:
      // Lưu ý: Trong thực tế, bạn nên kiểm tra token có hợp lệ không trước khi đặt isAuthenticated = true
      localStorage.setItem('authToken', action.payload.token || ''); // Lưu token vào LS
      localStorage.setItem('userData', JSON.stringify(action.payload.user || null)); // Lưu user vào LS
      return {
        ...state,
        isAuthenticated: !!action.payload.user && !!action.payload.token, // Chỉ true nếu có cả user và token
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false, // Kết thúc trạng thái tải
      };
    case ACTIONS.LOGOUT:
      localStorage.removeItem('authToken'); // Xóa token khỏi LS
      localStorage.removeItem('userData');  // Xóa user khỏi LS
      return {
        ...initialState, // Trở về trạng thái ban đầu
        isLoading: false, // Đã xử lý xong, không còn loading
      };
    // Case SET_LOADING nếu bạn muốn quản lý loading phức tạp hơn
    // case ACTIONS.SET_LOADING:
    //   return { ...state, isLoading: action.payload };
    default:
      // Nếu không khớp action nào, trả về state hiện tại
      // Có thể throw lỗi ở đây để đảm bảo action type luôn đúng
      console.warn("Unknown action type in authReducer:", action.type);
      return state;
  }
};

// --- Tạo Context ---
// Giá trị khởi tạo của Context không quá quan trọng vì Provider sẽ cung cấp giá trị thực
const AuthContext = createContext(null);

// --- Component Provider ---
// Component này sẽ bao bọc ứng dụng hoặc phần cần truy cập state auth
export const AuthProvider = ({ children }) => {
  // Sử dụng useReducer để quản lý state phức tạp
  const [state, dispatch] = useReducer(authReducer, initialState);

  // useEffect để kiểm tra localStorage khi component được mount lần đầu
  useEffect(() => {
    console.log("Auth Provider Mounted: Initializing...");
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUserDataString = localStorage.getItem('userData');
      let storedUser = null;

      if (storedUserDataString) {
        storedUser = JSON.parse(storedUserDataString);
      }

      // TODO: Quan trọng - Nên thêm bước kiểm tra tính hợp lệ của token ở đây
      // Ví dụ: giải mã JWT và kiểm tra hạn sử dụng (nếu là JWT)
      // Nếu token không hợp lệ, nên xóa khỏi localStorage và dispatch LOGOUT

      if (storedToken && storedUser) {
        // Nếu có token và user data trong localStorage -> Khởi tạo state là đã đăng nhập
        console.log("Found token and user data in localStorage. Initializing as logged in.");
        dispatch({
          type: ACTIONS.INITIALIZE,
          payload: { user: storedUser, token: storedToken },
        });
      } else {
        // Nếu không có -> Khởi tạo state là chưa đăng nhập
        console.log("No valid token/user data found. Initializing as logged out.");
        // Dispatch logout để đảm bảo state sạch và isLoading = false
        dispatch({ type: ACTIONS.LOGOUT });
      }
    } catch (error) {
      // Xử lý lỗi nếu JSON.parse thất bại hoặc có lỗi khác
      console.error("Error initializing auth state:", error);
      // Đảm bảo trạng thái cuối cùng là đã logout và không loading
      dispatch({ type: ACTIONS.LOGOUT });
    }
  }, []); // Mảng rỗng đảm bảo effect chỉ chạy 1 lần khi mount

  // --- Các hàm actions để component khác gọi ---

  // Hàm xử lý đăng nhập
  const login = (userData, token) => {
    // userData nên là object chứa thông tin user, bao gồm cả role
    // token là chuỗi token nhận từ API
    console.log("Dispatching LOGIN action");
    dispatch({
      type: ACTIONS.LOGIN,
      payload: { user: userData, token: token },
    });
  };

  // Hàm xử lý đăng xuất
  const logout = () => {
    console.log("Dispatching LOGOUT action");
    // TODO: Có thể gọi API để hủy token phía server ở đây nếu cần
    dispatch({ type: ACTIONS.LOGOUT });
    // Có thể thêm logic điều hướng về trang login ở đây nếu muốn
    // navigate('/login');
  };

  // --- Tạo giá trị Context ---
  // Sử dụng useMemo để tối ưu, tránh object value thay đổi mỗi lần re-render không cần thiết

//   có thể mình sẽ kiểm tra ở đây bằng cách log
  const contextValue = useMemo(() => ({
    ...state, // Bao gồm: isAuthenticated, user, token, isLoading
    login,    // Cung cấp hàm login
    logout,   // Cung cấp hàm logout
  }), [state]); // Chỉ tạo lại value object khi state thay đổi

  // --- Render Provider ---
  // Chỉ render children khi không còn ở trạng thái loading ban đầu
  // Hoặc bạn có thể hiển thị một Spinner/Loading component tại đây
  return (
    <AuthContext.Provider value={contextValue}>
      {!state.isLoading ? children : null /* Hoặc <LoadingSpinner /> */}
    </AuthContext.Provider>
  );
};

// --- Custom Hook để sử dụng Context ---
// Giúp việc sử dụng context trong các component khác gọn gàng hơn
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    // Lỗi này xảy ra nếu dùng useAuth() bên ngoài <AuthProvider>
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};