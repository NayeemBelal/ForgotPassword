import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App"; // existing reset-password page
import ForgotPassword from "./ForgotPassword";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} /> {/* reset page */}
      <Route path="/forgot" element={<ForgotPassword />} />
    </Routes>
  </BrowserRouter>
);
