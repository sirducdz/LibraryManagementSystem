// src/contexts/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useCart } from "./CartContext";
import { useLogoutMutation } from "../features/auth/api/authApiSlice";
// --- Định nghĩa Actions cho Reducer ---
const ACTIONS = {
  INITIALIZE: "INITIALIZE", // Khởi tạo state từ localStorage
  LOGIN: "LOGIN", // Xử lý khi đăng nhập thành công
  LOGOUT: "LOGOUT", // Xử lý khi đăng xuất
  SET_LOADING: "SET_LOADING", // (Tùy chọn) Đặt trạng thái loading
};

// --- State khởi tạo ---
const initialState = {
  isAuthenticated: false, // Ban đầu chưa xác thực
  user: null, // Chưa có thông tin người dùng
  token: null, // Chưa có token
  isLoading: true, // Đang tải/kiểm tra trạng thái ban đầu
};

// --- Reducer để quản lý state ---
// Nhận state hiện tại và action, trả về state mới
const authReducer = (state, action) => {
  console.log("Auth Reducer Action:", action.type, action.payload); // Log để debug
  switch (action.type) {
    case ACTIONS.INITIALIZE:
    case ACTIONS.LOGIN:
      console.log("Initializing or Logging in...");
      return {
        ...state,
        isAuthenticated: !!action.payload.user && !!action.payload.token, // Chỉ true nếu có cả user và token
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false, // Kết thúc trạng thái tải
      };
    case ACTIONS.LOGOUT:
      console.log("Auth Reducer: Handling LOGOUT - Clearing storage...");
      // Xóa khỏi cả hai storage để đảm bảo sạch sẽ
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("userData");
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
  // useEffect để kiểm tra localStorage/sessionStorage khi component được mount lần đầu
  useEffect(() => {
    console.log("Auth Provider Mounted: Initializing from storage...");
    let foundToken = null;
    let foundUser = null;
    let source = null; // Để biết tìm thấy ở đâu (debug)

    try {
      // 1. Ưu tiên kiểm tra localStorage (cho Remember Me)
      const tokenLS = localStorage.getItem("accessToken");
      const userDataStringLS = localStorage.getItem("userData");

      if (tokenLS && userDataStringLS) {
        console.log("Found data in localStorage.");
        try {
          const userLS = JSON.parse(userDataStringLS);
          if (userLS) {
            // Chỉ kiểm tra token nếu parse user thành công
            try {
              const decodedToken = jwtDecode(tokenLS);
              const currentTime = Date.now() / 1000; // Thời gian hiện tại (giây)

              console.log(
                "Decoded LS Token Exp:",
                new Date(decodedToken.exp * 1000)
              ); // Log thời gian hết hạn
              console.log("Current Time:", new Date(currentTime * 1000));

              // Kiểm tra xem token có trường 'exp' và chưa hết hạn không
              if (decodedToken.exp && decodedToken.exp > currentTime) {
                // Token hợp lệ!
                foundToken = tokenLS;
                foundUser = userLS; // Đã parse ở trên
                source = "localStorage";
                console.log("Valid, non-expired token found in localStorage.");
              } else {
                console.log(
                  "Token from localStorage has expired or missing exp field."
                );
                // Token hết hạn hoặc không hợp lệ -> Xóa khỏi storage
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("userData");
              }
            } catch (decodeError) {
              console.error(
                "Failed to decode token from localStorage (invalid JWT?):",
                decodeError
              );
              // Token không hợp lệ -> Xóa khỏi storage
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("userData");
            }
          } else {
            console.warn(
              "Parsed user data from localStorage is invalid. Skipping token check."
            );
            // Nếu user data lỗi, cũng nên xóa token đi kèm
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userData");
          }
        } catch (parseError) {
          console.error(
            "Failed to parse user data from localStorage:",
            parseError
          );
          // Dữ liệu lỗi, nên xóa đi
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken"); // Xóa cả refresh nếu có
          localStorage.removeItem("userData");
        }
      } else {
        console.log("No complete session data found in localStorage.");
      }

      // 2. Nếu không tìm thấy trong localStorage, kiểm tra sessionStorage
      if (!foundToken) {
        const tokenSS = sessionStorage.getItem("accessToken");
        const userDataStringSS = sessionStorage.getItem("userData");

        if (tokenSS && userDataStringSS) {
          console.log("Found data in sessionStorage.");
          try {
            const userSS = JSON.parse(userDataStringSS);
            // --- !!! Thêm bước kiểm tra tính hợp lệ của token tương tự ở đây !!! ---
            // if (isTokenValid(tokenSS)) { // Hàm kiểm tra token giả định
            if (userSS) {
              foundToken = tokenSS;
              foundUser = userSS;
              source = "sessionStorage";
              console.log("Valid session initialized from sessionStorage.");
            } else {
              console.warn("Parsed user data from sessionStorage is invalid.");
            }
            // } else {
            //   console.log("Token from sessionStorage has expired or is invalid.");
            // }
          } catch (parseError) {
            console.error(
              "Failed to parse user data from sessionStorage:",
              parseError
            );
            // Dữ liệu lỗi, nên xóa đi
            sessionStorage.removeItem("accessToken");
            sessionStorage.removeItem("refreshToken");
            sessionStorage.removeItem("userData");
          }
        } else {
          console.log("No complete session data found in sessionStorage.");
        }
      }

      // 3. Dispatch action dựa trên kết quả tìm kiếm
      if (foundToken && foundUser) {
        // Tìm thấy phiên hợp lệ
        dispatch({
          type: ACTIONS.INITIALIZE,
          payload: { user: foundUser, token: foundToken }, // Truyền user và access token vào state
        });
      } else {
        // Không tìm thấy phiên hợp lệ nào
        console.log(
          "No valid session found. Dispatching LOGOUT to ensure clean state."
        );
        // Dispatch LOGOUT để đảm bảo state là logged out và isLoading = false
        // Reducer LOGOUT đã xử lý isLoading = false và xóa storage (dù có thể không cần thiết ở đây nữa)
        dispatch({ type: ACTIONS.LOGOUT });
      }
    } catch (error) {
      // Lỗi không mong muốn xảy ra trong quá trình kiểm tra storage
      console.error("Unexpected error initializing auth state:", error);
      // Đảm bảo trạng thái cuối cùng là logged out và không loading
      dispatch({ type: ACTIONS.LOGOUT });
    }
    // Lưu ý: Không cần finally để set isLoading = false vì các action
    // INITIALIZE và LOGOUT trong reducer đã đảm nhiệm việc này.
  }, []); // Mảng rỗng `[]` đảm bảo effect này chỉ chạy một lần duy nhất khi component mount

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
  const { clearCart } = useCart();
  const [logoutApiCall, { isLoading: isLoggingOutApi }] = useLogoutMutation();
  // Hàm xử lý đăng xuất
  // const logout = async () => {
  //   console.log("Dispatching LOGOUT action");
  //   clearCart(); // Xóa giỏ hàng khi đăng xuất
  //   try {
  //     console.log("AuthContext: Calling logout API endpoint...");
  //     await logoutApiCall().unwrap(); // Gọi API và chờ kết quả (unwrap để bắt lỗi)
  //     console.log("AuthContext: API logout call successful.");
  //   } catch (error) {
  //     // Ghi log lỗi gọi API nhưng vẫn tiếp tục logout phía client
  //     console.error("AuthContext: Logout API call failed:", error);
  //   } finally {
  //     // Luôn dispatch action LOGOUT của context để xóa state và storage client
  //     console.log(
  //       "AuthContext: Dispatching LOGOUT action to clear context state and storage."
  //     );
  //     dispatch({ type: ACTIONS.LOGOUT });
  //   }
  // };
  const logout = async () => { // Thêm async nếu muốn đợi API
    console.log("AuthContext: logout called");
    clearCart(); // Xóa giỏ hàng client

    // Gọi API logout backend (nếu có endpoint và muốn gọi)
    try {
        console.log("AuthContext: Calling logout API endpoint...");
        await logoutApiCall().unwrap(); // Gọi API và chờ kết quả (unwrap để bắt lỗi)
        console.log("AuthContext: API logout call successful.");
    } catch (error) {
        // Ghi log lỗi gọi API nhưng vẫn tiếp tục logout phía client
        console.error("AuthContext: Logout API call failed:", error);
    } finally {
         // Luôn dispatch action LOGOUT của context để xóa state và storage client
         console.log("AuthContext: Dispatching LOGOUT action to clear context state and storage.");
         dispatch({ type: ACTIONS.LOGOUT });
    }
    // Điều hướng có thể thực hiện ở component Header hoặc ở đây
    // navigate('/login');
};
  // --- Tạo giá trị Context ---
  // Sử dụng useMemo để tối ưu, tránh object value thay đổi mỗi lần re-render không cần thiết

  //   có thể mình sẽ kiểm tra ở đây bằng cách log
  const contextValue = useMemo(
    () => ({
      ...state, // Bao gồm: isAuthenticated, user, token, isLoading
      login, // Cung cấp hàm login
      logout, // Cung cấp hàm logout
    }),
    [state]
  ); // Chỉ tạo lại value object khi state thay đổi
  console.log("Auth Context Value:", contextValue); // Log để debug

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
export const UseAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    // Lỗi này xảy ra nếu dùng useAuth() bên ngoài <AuthProvider>
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
