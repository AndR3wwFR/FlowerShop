import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import CartSidebar from './CartSidebar';

const Header = ({ cartCount, onCartClick, showCart, setShowCart, cart, removeFromCart, updateQuantity, getTotalPrice, checkout }) => {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const getRoleName = (role) => {
    const roles = {
      'Customer': 'Покупатель',
      'Courier': 'Курьер',
      'Florist': 'Флорист',
      'Admin': 'Администратор'
    };
    return roles[role] || role;
  };

  const styles = {
    header: { background: '#ff69b4', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
    logo: { margin: 0, fontSize: '24px', cursor: 'pointer' },
    headerButtons: { display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' },
    button: { background: 'white', color: '#ff69b4', border: 'none', padding: '8px 20px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' },
    logoutButton: { background: '#ff4444', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '25px', cursor: 'pointer' },
    userName: { marginRight: '15px', fontSize: '14px' },
    userRole: { fontSize: '12px', opacity: 0.9, display: 'block' },
    cartCount: { background: '#ff4444', color: 'white', borderRadius: '50%', padding: '2px 8px', fontSize: '12px', marginLeft: '5px' }
  };

  return (
    <>
      <header style={styles.header}>
        <h1 style={styles.logo}>🌸 FlowerShop</h1>
        <div style={styles.headerButtons}>
          {user ? (
            <>
              <div>
                <span style={styles.userName}>👋 {user.fullName}</span>
                <span style={styles.userRole}>🎭 {getRoleName(user.role)}</span>
              </div>
              {user.role === 'Customer' && (
                <button onClick={onCartClick} style={styles.button}>
                  🛒 Корзина {cartCount > 0 && <span style={styles.cartCount}>{cartCount}</span>}
                </button>
              )}
              <button onClick={logout} style={styles.logoutButton}>Выйти</button>
            </>
          ) : (
            <button onClick={() => setShowAuthModal(true)} style={styles.button}>Вход / Регистрация</button>
          )}
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <CartSidebar 
        showCart={showCart} 
        setShowCart={setShowCart} 
        cart={cart} 
        removeFromCart={removeFromCart} 
        updateQuantity={updateQuantity} 
        getTotalPrice={getTotalPrice} 
        checkout={checkout} 
      />
    </>
  );
};

export default Header;