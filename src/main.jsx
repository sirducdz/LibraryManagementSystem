// import { StrictMode, createContext, useContext } from "react";
// import { createRoot } from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import "./index.css";
// import App from "./App.jsx";
// import { UseAuth, UseProvider, PI, NewObject } from "./authContextTmp.jsx";
// import { UseAuth1 } from "./authContextTmp.jsx";
// import { App1 } from "./demoTmp.jsx";
// import { App2 } from "./demoTmp2.jsx";
// createRoot(document.getElementById("root")).render(
//   <div>
//     <BrowserRouter>
//       <UseProvider value={456}>
//         <App1 />
//       </UseProvider>
//       <App2 />
//     </BrowserRouter>
//     {NewObject.name}
//   </div>
// );

import React from "react";
import { createRoot } from "react-dom/client";
import AppRoutes from "./routes/index";
import { BrowserRouter } from "react-router-dom";
// 2. Import CSS Global và CSS Ant Design
import "./index.css"; // Chứa Tailwind directives và/hoặc style global khác
// 3. Import Provider toàn cục (Quan trọng!)
import { AuthProvider } from "./contexts/AuthContext";
// import { AnotherProvider } from './contexts/AnotherContext'; // Ví dụ nếu có provider khác
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./store";
import { CartProvider } from "./contexts/CartContext";
import { App } from "antd";
import { GoogleOAuthProvider } from "@react-oauth/google";
// 4. Lấy phần tử DOM gốc từ index.html
const rootElement = document.getElementById("root");

// 5. Tạo root và render ứng dụng
// Kiểm tra xem rootElement có tồn tại không trước khi render
if (rootElement) {
  createRoot(rootElement).render(
    <GoogleOAuthProvider clientId="632098216791-g9uultf9h5c6770nl05kq7bp8cee39va.apps.googleusercontent.com">
      {/* // 6. Bọc ứng dụng bằng StrictMode (khuyến nghị cho dev) */}
      <ReduxProvider store={store}>
        {/* ReduxProvider nếu có store Redux */}
        <BrowserRouter>
          {/* 7. Bọc ứng dụng bằng các Provider toàn cục */}
          {/* AuthProvider cần bao ngoài App để toàn bộ App truy cập được context */}
          <App>
            <CartProvider>
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            </CartProvider>
          </App>
        </BrowserRouter>
      </ReduxProvider>
    </GoogleOAuthProvider>
  );
} else {
  console.error(
    "Failed to find the root element. Ensure your index.html has a div with id='root'."
  );
}
