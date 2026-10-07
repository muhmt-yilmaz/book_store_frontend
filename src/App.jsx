import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';


import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import BookCatalog from './pages/BookCatalog'; 
import BookManagement from './pages/BookManagement'; 
import BookAdd from './pages/BookAdd';
import Navbar from './components/Navbar';
import CartPage from './pages/CartPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import BookDetailPage from './pages/BookDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import CategoryManagement from './pages/CategoryManagement';
import PublisherManagement from './pages/PublisherManagement';
import CustomerProfile from './pages/CustomerProfile';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ForbiddenPage from './pages/ForbiddenPage';
import AuthorManagement from './pages/AuthorManagement';
import AuthorPage from './pages/AuthorPage';
import AuthorsListPage from './pages/AuthorsListPage';
import ManagerManagement from './pages/ManagerManagement';
import PrivateRoute from './components/common/PrivateRoute';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        toastOptions={{
          duration: 4000,
          style: {
            padding: '16px',
            borderRadius: '10px',
            background: '#fff',
            color: '#333',
          },
          
          
          success: { duration: 4000 },
          error: { duration: 7000 },
        }}
      />
      {}
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="flex-grow">
          <Routes>
        {}
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<BookCatalog />} /> 
        <Route path="/book/:id" element={<BookDetailPage />} /> {}
        <Route path="/authors" element={<AuthorsListPage />} /> {}
        <Route path="/author/:id" element={<AuthorPage />} /> {}
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {}
        <Route path="/my-orders" element={<PrivateRoute allowedRoles={['CUSTOMER']}><MyOrdersPage /></PrivateRoute>} />
        <Route path="/cart" element={<CartPage />} /> {}
        <Route path="/profile" element={<PrivateRoute allowedRoles={['CUSTOMER']}><CustomerProfile /></PrivateRoute>} />
        <Route path="/checkout" element={<PrivateRoute allowedRoles={['CUSTOMER', 'ADMIN', 'MANAGER']}><CheckoutPage /></PrivateRoute>} />

        {}
        <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/authors" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}><AuthorManagement /></PrivateRoute>} />
        <Route path="/admin/books" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}><BookManagement /></PrivateRoute>} />
        <Route path="/admin/add-book" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}><BookAdd /></PrivateRoute>} />
        <Route path="/admin/categories" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}><CategoryManagement /></PrivateRoute>} />
        <Route path="/admin/publishers" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}><PublisherManagement /></PrivateRoute>} />
        <Route path="/admin/orders" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}><AdminOrdersPage /></PrivateRoute>} />

        {}
        <Route path="/admin/managers" element={<PrivateRoute allowedRoles={['ADMIN']}><ManagerManagement /></PrivateRoute>} />

        {}
        <Route path="/403" element={<ForbiddenPage />} />
        
        {}
        <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;