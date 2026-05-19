import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import CustomerPanel from './pages/CustomerPanel';
import CourierPanel from './pages/CourierPanel';
import FloristPanel from './pages/FloristPanel';
import AdminPanel from './pages/AdminPanel';
import CheckoutPage from './pages/CheckoutPage';
import api from './services/api';
import './App.css';

function AppContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    loadProducts();
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.products || response.data || []);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const addToCart = (product) => {
    if (!user) {
      alert('Войдите в систему');
      return;
    }
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      existing.quantity++;
      setCart([...cart]);
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price
      }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    const item = cart.find(i => i.productId === productId);
    if (item && quantity > 0) {
      item.quantity = quantity;
      setCart([...cart]);
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const renderPanel = () => {
    if (!user) {
      return <CustomerPanel products={products} addToCart={addToCart} cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} />;
    }
    switch (user.role) {
      case 'Admin': return <AdminPanel />;
      case 'Florist': return <FloristPanel />;
      case 'Courier': return <CourierPanel />;
      default: return <CustomerPanel products={products} addToCart={addToCart} cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} />;
    }
  };

  return (
    <div className="App">
      <Header
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        onCartClick={() => setShowCart(!showCart)}
        showCart={showCart}
        setShowCart={setShowCart}
        cart={cart}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        getTotalPrice={() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0)}
        checkout={() => navigate('/checkout')}
      />
      <Routes>
        <Route path="/" element={renderPanel()} />
        <Route path="/checkout" element={<CheckoutPage cart={cart} clearCart={clearCart} />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;