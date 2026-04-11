import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LoadingProvider } from './context/LoadingContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import AddProduct from './pages/AddProduct'
import BulkUpload from './pages/BulkUpload'
import Orders from './pages/Orders'
import OffersManagement from './pages/OffersManagement'
import ComboOffersManagement from './pages/ComboOffersManagement'
import HeroSlides from './pages/HeroSlides'
import StoreSettings from './pages/StoreSettings'
import Categories from './pages/Categories'
import CloudinaryUploader from './pages/CloudinaryUploader'

export default function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<AddProduct />} />
              <Route path="products/bulk-upload" element={<BulkUpload />} />
              <Route path="orders" element={<Orders />} />
              <Route path="offers" element={<OffersManagement />} />
              <Route path="combo-offers" element={<ComboOffersManagement />} />
              <Route path="combo-offers/add" element={<ComboOffersManagement />} />
              <Route path="combo-offers/edit/:id" element={<ComboOffersManagement />} />
              <Route path="hero-slides" element={<HeroSlides />} />
              <Route path="categories" element={<Categories />} />
              <Route path="settings" element={<StoreSettings />} />
              <Route path="cloudinary-upload" element={<CloudinaryUploader />} />
            </Route>
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </BrowserRouter>
      </LoadingProvider>
    </AuthProvider>
  )
}
