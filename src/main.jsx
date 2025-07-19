import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App"; // No need to write ".jsx", Vite auto-resolves it

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
