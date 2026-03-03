import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000 * 5, // 5 minutes cache before refetching
      retry: 1,                 // Only retry 1 time on failure
      refetchOnWindowFocus: false, // Don't refetch when switching browser tabs
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
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
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  </StrictMode>,
)
