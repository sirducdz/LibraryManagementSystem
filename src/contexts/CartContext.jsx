// src/contexts/CartContext.jsx
import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useEffect,
} from "react"; // <-- Thêm useEffect
import { App } from "antd";
// --- Định nghĩa Actions cho Reducer ---
const ACTIONS = {
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  CLEAR_CART: "CLEAR_CART",
  // LOAD_CART: 'LOAD_CART', // Có thể thêm action này nếu muốn load phức tạp hơn
};

// --- Hàm helper để tải giỏ hàng từ localStorage một cách an toàn ---
const loadInitialCart = () => {
  try {
    // Lấy dữ liệu từ localStorage với key là 'cartItems'
    const storedCart = localStorage.getItem("cartItems");
    // Nếu có dữ liệu và không phải null/undefined
    if (storedCart) {
      // Parse dữ liệu JSON thành mảng JavaScript
      const parsedCart = JSON.parse(storedCart);
      // Kiểm tra xem có đúng là mảng không
      if (Array.isArray(parsedCart)) {
        console.log("Loaded cart from localStorage:", parsedCart);
        return parsedCart; // Trả về mảng đã parse
      }
    }
  } catch (error) {
    // Nếu có lỗi trong quá trình parse JSON hoặc lỗi khác
    console.error("Failed to load cart from localStorage:", error);
  }
  // Trả về mảng rỗng nếu không có dữ liệu hoặc có lỗi
  console.log("No valid cart found in localStorage, initializing empty cart.");
  return [];
};

// --- State khởi tạo ---
// *** Khởi tạo state bằng cách gọi hàm loadInitialCart ***
const initialState = {
  cartItems: loadInitialCart(), // <-- Sử dụng hàm để tải state ban đầu
};

// --- Reducer để quản lý state giỏ hàng ---
const cartReducer = (state, action) => {
  console.log("Cart Reducer Action:", action.type, "Payload:", action.payload); // Debug
  switch (action.type) {
    case ACTIONS.ADD_ITEM: {
      const newItem = action.payload;
      const existingItem = state.cartItems.find(
        (item) => item.id === newItem.id
      );
      if (existingItem) {
        return state;
      }
      if (state.cartItems.length >= 5) {
        return state;
      }
      console.log("Adding item to cart:", newItem.id);
      // *** Trả về state mới, useEffect sẽ xử lý việc lưu vào localStorage ***
      return {
        ...state,
        cartItems: [...state.cartItems, newItem],
      };
    }
    case ACTIONS.REMOVE_ITEM: {
      const itemIdToRemove = action.payload;
      console.log("Removing item from cart:", itemIdToRemove);
      const updatedCartItems = state.cartItems.filter(
        (item) => item.id !== itemIdToRemove
      );
      // *** Trả về state mới, useEffect sẽ xử lý việc lưu vào localStorage ***
      return {
        ...state,
        cartItems: updatedCartItems,
      };
    }
    case ACTIONS.CLEAR_CART: {
      console.log("Clearing cart.");
      // message.success("Borrowing cart cleared."); // <-- Đã dịch (Tùy chọn, vì đã clear ở AuthContext?)
      // *** Trả về state mới, useEffect sẽ xử lý việc lưu vào localStorage ***
      return {
        ...state,
        cartItems: [],
      };
    }
    default:
      console.warn("Unknown action type in cartReducer:", action.type);
      return state;
  }
};

// --- Tạo Context ---
const CartContext = createContext(null);

// --- Component Provider ---
export const CartProvider = ({ children }) => {
  // *** State được khởi tạo với dữ liệu từ localStorage (thông qua initialState) ***
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { message: messageApi } = App.useApp();
  // *** useEffect để LƯU state vào localStorage BẤT CỨ KHI NÀO state.cartItems thay đổi ***
  useEffect(() => {
    try {
      console.log("Saving cartItems to localStorage:", state.cartItems);
      // Chuyển mảng cartItems thành chuỗi JSON và lưu vào localStorage
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
    // Dependency array là [state.cartItems], nghĩa là effect này sẽ chạy lại
    // mỗi khi tham chiếu của mảng state.cartItems thay đổi (thêm, xóa, clear)
  }, [state.cartItems]);

  // --- Các hàm Actions (memoized với useCallback) ---
  const addToCart = useCallback(
    (book) => {
      if (!book || typeof book.id === "undefined") {
        console.error("Attempted to add invalid book item to cart:", book);
        messageApi.error("Cannot add invalid book to cart."); // Sử dụng messageApi
        return;
      }

      // *** Thực hiện kiểm tra TRƯỚC KHI dispatch ***
      const existingItem = state.cartItems.find((item) => item.id === book.id);
      if (existingItem) {
        console.log("Item already in cart:", book.id);
        messageApi.warning(
          `Book "${book.title}" is already in the borrowing cart.`
        ); // Sử dụng messageApi
        return; // Không dispatch
      }

      if (state.cartItems.length >= 5) {
        console.log("Cart limit reached.");
        messageApi.error(
          "You can only add a maximum of 5 books to the borrowing cart!"
        ); // Sử dụng messageApi
        return; // Không dispatch
      }

      // Nếu mọi thứ ổn, thì mới dispatch
      console.log("Dispatching ADD_ITEM:", book.id);
      dispatch({ type: ACTIONS.ADD_ITEM, payload: book });
      // Hiển thị thông báo thành công SAU KHI chắc chắn sẽ dispatch
      messageApi.success(`Added "${book.title}" to the borrowing cart.`); // Sử dụng messageApi
    },
    [state.cartItems, messageApi]
  );

  const removeFromCart = useCallback(
    (bookId) => {
      // Tìm sách bị xóa để hiển thị tên (tùy chọn)
      const itemToRemove = state.cartItems.find((item) => item.id === bookId);
      dispatch({ type: ACTIONS.REMOVE_ITEM, payload: bookId });
      // Hiển thị thông báo sau khi dispatch
      if (itemToRemove) {
        messageApi.info(
          `Removed "${itemToRemove.title}" from the borrowing cart.`
        ); // Sử dụng messageApi
      } else {
        messageApi.info(`Book removed from the borrowing cart.`); // Thông báo chung
      }
    },
    [state.cartItems, messageApi]
  ); // <-- Thêm messageApi và state.cartItems

    const clearCart = useCallback(() => {
      // Chỉ dispatch nếu giỏ hàng không rỗng (tùy chọn)
      // if (state.cartItems.length > 0) {
          dispatch({ type: ACTIONS.CLEAR_CART });
      // }
    }, []); // <-- Thêm messageApi và state.cartItems.length

  
  // --- Hàm tiện ích (memoized với useCallback) ---
  const isInCart = useCallback(
    (bookId) => {
      return state.cartItems.some((item) => item.id === bookId);
    },
    [state.cartItems]
  );

  // --- Tạo giá trị Context (memoized với useMemo) ---
  const contextValue = useMemo(
    () => ({
      cartItems: state.cartItems,
      cartItemCount: state.cartItems.length,
      addToCart,
      removeFromCart,
      clearCart,
      isInCart,
    }),
    [state.cartItems, addToCart, removeFromCart, clearCart, isInCart]
  );

  console.log("Cart Context Value (re-render):", contextValue.cartItemCount); // Debug

  // --- Render Provider ---
  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

// --- Custom Hook để sử dụng Context ---
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === null) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
