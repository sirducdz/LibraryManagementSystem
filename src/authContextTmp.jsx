import { StrictMode, createContext, useContext } from "react";
import { BrowserRouter, Outlet } from "react-router-dom";

const AuthContext = createContext(null);
console.log("AuthContext out side", AuthContext);

export const UseProvider = ({ children, value }) => {
  console.log("AuthContext useProvider", AuthContext);
  return <AuthContext.Provider value={value}> {children}</AuthContext.Provider>;
};
export const UseAuth = () => {
  const context = useContext(AuthContext);
  console.log("AuthContext", AuthContext);
  // AuthContext.Provider.value = "123";
  console.log("context", context);
  // useprovider();
  // console.log("context", context);
  if (context === null) {
    // Lỗi này xảy ra nếu dùng useAuth() bên ngoài <AuthProvider>
    // throw new Error('useAuth must be used within an AuthProvider');
    console.log("useAuth must be used within an AuthProvider");
  } else {
    console.log("Yeah");
  }
  return context;
};
// console.log(useAuth);

export const UseAuth1 = () => {
  console.log("UseAuth1 called");

  return 1;
};
export const PI = 3.14159;

export const NewObject = { name: "123ABC" };
