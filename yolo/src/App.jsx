import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { UserAuthProvider } from './context/UserAuthContext'
import MainLayout from './layouts/MainLayout'

// Lazy load all page components for code splitting
const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const Offers = lazy(() => import('./pages/Offers'))
const ComboOffers = lazy(() => import('./pages/ComboOffers'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Cart = lazy(() => import('./pages/Cart'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const Profile = lazy(() => import('./pages/Profile'))
const Checkout = lazy(() => import('./pages/Checkout'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const Customize = lazy(() => import('./pages/Customize'))
const SupabaseTodos = lazy(() => import('./pages/SupabaseTodos'))

// Loading fallback component
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '50vh' 
  }}>
    <div className="yolo-spinner" />
  </div>
)

function App() {
  return (
    <UserAuthProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="products" element={<Products />} />
                  <Route path="products/:id" element={<ProductDetails />} />
                  <Route path="offers" element={<Offers />} />
                  <Route path="combo-offers" element={<ComboOffers />} />
                  <Route path="combo-offers/:comboId" element={<ComboOffers />} />
                  <Route path="about" element={<About />} />
                  <Route path="customize" element={<Customize />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />
                  <Route path="verify-email" element={<VerifyEmail />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="my-orders" element={<MyOrders />} />
                  <Route path="supabase-todos" element={<SupabaseTodos />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </UserAuthProvider>
  )
}

export default App
