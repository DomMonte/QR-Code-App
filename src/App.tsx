import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import Album from './pages/Album';
import Admin from './pages/Admin';
import Home from './pages/Home';
import PaymentSuccess from './pages/PaymentSuccess';
import AuthGuard from './components/AuthGuard';
import { Toaster } from './components/ui/toaster';
import IndexPage from './pages/Index';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <BrowserRouter>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<IndexPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/album/:albumId" element={<Album />} />
          <Route
            path="/admin"
            element={
              <AuthGuard allowedRoles={['global_admin', 'standard_admin']}>
                <Admin />
              </AuthGuard>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;