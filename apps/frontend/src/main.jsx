import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './components/Notification'
import App from './App.jsx'
import ProgramDetail from './pages/ProgramDetail.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'
import Books from './pages/Books.jsx'
import BookDetail from './pages/BookDetail.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Information from './pages/Information.jsx'

import ScrollToTop from './components/ScrollToTop.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/program/:programId" element={<ProgramDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/books" element={<Books />} />
            <Route path="/book/:bookId" element={<BookDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/informasi" element={<Information />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
)
