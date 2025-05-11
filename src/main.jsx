/********************************************************
 * Main Application Entry Point
 * Sets up routing for the ZOG Store application
 ********************************************************/
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/user/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import GameDetails from "./pages/user/GameDetails";
import CartPage from "./pages/user/CartPage";
import OrdersPage from "./pages/user/OrdersPage";
import AdminPage from "./pages/admin/AdminPage";
import OrderManagement from "./pages/admin/OrderManagement";
import GameManagement from "./pages/admin/GameManagement";
import InventoryManagement from "./pages/admin/InventoryManagement";
import UserManagement from "./pages/admin/UserManagement";
import "./index.css";

// Render the application with routing
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* User Routes */}
        <Route path="/game/:gameId" element={<GameDetails />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/orders" element={<OrdersPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/games" element={<GameManagement />} />
        <Route path="/admin/inventory" element={<InventoryManagement />} />
        <Route path="/admin/orders" element={<OrderManagement />} />
      </Routes>
    </Router>
  </React.StrictMode>,
);
