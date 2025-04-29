import { StrictMode, createContext, useContext } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { UseAuth, UseProvider, PI, NewObject } from "./authContextTmp.jsx";
import { UseAuth1 } from "./authContextTmp.jsx";
import { App1 } from "./demoTmp.jsx";
import { App2 } from "./demoTmp2.jsx";
createRoot(document.getElementById("root")).render(
  <div>
    <BrowserRouter>
      <UseProvider value={456}>
        <App1 />
      </UseProvider>
      <App2 />
    </BrowserRouter>
    {NewObject.name}
  </div>
);
