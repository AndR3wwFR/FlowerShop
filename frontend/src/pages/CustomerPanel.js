import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CustomerPanel = ({ products = [], addToCart, cart = [], removeFromCart, updateQuantity }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const loadOrders = async () => {
    try {
      const response = await api.get('/orders/my');
      setOrders(response.data);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const getTotalPrice = () => {
    if (!cart || cart.length === 0) return 0;
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    if (!cart || cart.length === 0) return 0;
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    setShowCart(false);
    navigate('/checkout');
  };

  useEffect(() => {
    if (activeTab === 'myOrders') loadOrders();
  }, [activeTab]);

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
    header: { marginBottom: '30px' },
    title: { color: '#ff69b4', fontSize: '28px', marginBottom: '20px' },
    tabs: { display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '10px', flexWrap: 'wrap' },
    tab: { padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', borderRadius: '8px' },
    productsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    productCard: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', transition: 'transform 0.2s' },
    productImage: { width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px', backgroundColor: '#f5f5f5' },
    productName: { fontSize: '18px', margin: '0 0 10px 0' },
    productDesc: { color: '#666', fontSize: '14px', margin: '10px 0' },
    price: { fontSize: '24px', color: '#ff69b4', fontWeight: 'bold', margin: '10px 0' },
    addButton: { background: '#ff69b4', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', width: '100%' },
    orderCard: { background: 'white', borderRadius: '8px', padding: '15px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    cartButton: { background: '#ff69b4', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', marginLeft: '15px' },
    cartSidebar: { position: 'fixed', right: '20px', top: '80px', width: '350px', background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 20px rgba(0,0,0,0.15)', zIndex: 1000, maxHeight: '500px', overflowY: 'auto' },
    cartItem: { borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    quantityInput: { width: '50px', padding: '5px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ddd' },
    checkoutButton: { background: '#28a745', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', width: '100%', marginTop: '15px', fontSize: '16px' },
    closeButton: { background: '#6c757d', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', width: '100%', marginTop: '10px' },
    cartTotal: { fontSize: '18px', fontWeight: 'bold', margin: '10px 0', textAlign: 'right' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🌸 FlowerShop</h1>
        <div style={styles.tabs}>
          <button onClick={() => setActiveTab('products')} style={{ ...styles.tab, background: activeTab === 'products' ? '#ff69b4' : 'white', color: activeTab === 'products' ? 'white' : '#333' }}>
            🛍️ Каталог
          </button>
          <button onClick={() => setActiveTab('myOrders')} style={{ ...styles.tab, background: activeTab === 'myOrders' ? '#ff69b4' : 'white', color: activeTab === 'myOrders' ? 'white' : '#333' }}>
            📦 Мои заказы
          </button>
          {cart && cart.length > 0 && (
            <button onClick={() => setShowCart(!showCart)} style={styles.cartButton}>
              🛒 Корзина ({getCartCount()}) - ₽{getTotalPrice()}
            </button>
          )}
        </div>
      </div>

      {activeTab === 'products' && (
        <div style={styles.productsGrid}>
          {products && products.length > 0 ? (
            products.map(product => (
              <div key={product.id} style={styles.productCard}>
                <img 
                  src={product.imageUrl || '/images/default.jpg'} 
                  alt={product.name} 
                  style={styles.productImage}
                  onError={(e) => {
                    e.target.src = '/images/default.jpg';
                  }}
                />
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productDesc}>{product.description || 'Красивый букет'}</p>
                <div style={styles.price}>₽{product.price}</div>
                <button onClick={() => addToCart(product)} style={styles.addButton}>🛒 В корзину</button>
              </div>
            ))
          ) : (
            <p>Загрузка товаров...</p>
          )}
        </div>
      )}

      {activeTab === 'myOrders' && (
        <div>
          <h2>Мои заказы</h2>
          {orders.length === 0 ? <p>У вас пока нет заказов</p> : orders.map(order => (
            <div key={order.id} style={styles.orderCard}>
              <h3>Заказ #{order.id}</h3>
              <p>Статус: <strong>{order.status}</strong></p>
              <p>Сумма: ₽{order.totalPrice}</p>
              <p>Дата: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Адрес: {order.address}</p>
            </div>
          ))}
        </div>
      )}

      {/* Корзина - боковая панель */}
      {showCart && cart.length > 0 && (
        <div style={styles.cartSidebar}>
          <h3>🛒 Моя корзина</h3>
          {cart.map(item => (
            <div key={item.productId} style={styles.cartItem}>
              <div>
                <strong>{item.productName}</strong>
                <div>
                  ₽{item.price} × 
                  <input type="number" min="1" value={item.quantity} onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))} style={styles.quantityInput} />
                  = ₽{item.price * item.quantity}
                </div>
              </div>
              <button onClick={() => removeFromCart(item.productId)} style={{ color: 'red', cursor: 'pointer', background: 'none', border: 'none', fontSize: '20px' }}>×</button>
            </div>
          ))}
          <div style={styles.cartTotal}>Итого: ₽{getTotalPrice()}</div>
          <button onClick={handleCheckout} style={styles.checkoutButton}>🚚 Оформить заказ</button>
          <button onClick={() => setShowCart(false)} style={styles.closeButton}>Закрыть</button>
        </div>
      )}
    </div>
  );
};

export default CustomerPanel;