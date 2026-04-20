import { Routes, Route } from 'react-router-dom'
import Navbar            from './components/Navbar'
import HomePage          from './pages/HomePage'
import ServicesPage      from './pages/ServicesPage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import BookingPage       from './pages/BookingPage'
import CheckoutPage      from './pages/CheckoutPage'
import ConfirmationPage  from './pages/ConfirmationPage'
import MyBookingsPage    from './pages/MyBookingsPage'
import LoginPage         from './pages/LoginPage'
import AdminPage         from './pages/AdminPage'
import { AuthProvider } from './hooks/useAuth'
import AIChatBubble from './components/AIChatBubble'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <Routes>
          <Route path="/"                  element={<HomePage />} />
          <Route path="/services"          element={<ServicesPage />} />
          <Route path="/services/:id"      element={<ServiceDetailPage />} />
          <Route path="/book/:id"          element={<BookingPage />} />
          <Route path="/checkout"          element={<CheckoutPage />} />
          <Route path="/confirmation"      element={<ConfirmationPage />} />
          <Route path="/bookings"          element={<MyBookingsPage />} />
          <Route path="/login"             element={<LoginPage />} />
          <Route path="/admin"             element={<AdminPage />} />
        </Routes>
        <AIChatBubble />
      </div>
    </AuthProvider>
  )
}