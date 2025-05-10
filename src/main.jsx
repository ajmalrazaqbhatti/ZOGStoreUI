import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/user/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import GameDetails from './pages/user/GameDetails'
import CartPage from './pages/user/CartPage'
import OrdersPage from './pages/user/OrdersPage'
import AdminPage from './pages/admin/AdminPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/game/:gameId" element={<GameDetails />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  </React.StrictMode>
)
