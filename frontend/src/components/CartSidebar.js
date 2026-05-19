import React from 'react';

const CartSidebar = ({ showCart, setShowCart, cart, removeFromCart, updateQuantity, getTotalPrice, checkout }) => {
  if (!showCart || cart.length === 0) return null;

  const styles = {
    cartSidebar: { position: 'fixed', right: '20px', top: '80px', width: '350px', background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 20px rgba(0,0,0,0.15)', zIndex: 1000, maxHeight: '500px', overflowY: 'auto' },
    cartItem: { borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    quantityInput: { width: '50px', padding: '5px', margin: '0 5px', borderRadius: '4px', border: '1px solid #ddd' },
    checkoutButton: { background: '#4caf50', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', width: '100%', marginTop: '15px' }
  };

  return (
    <div style={styles.cartSidebar}>
      <h3>🛒 Моя корзина</h3>
      {cart.map(item => (
        <div key={item.productId} style={styles.cartItem}>
          <div style={{ flex: 1 }}>
            <strong>{item.productName}</strong>
            <div>₽{item.price} × 
              <input type="number" min="1" value={item.quantity} onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))} style={styles.quantityInput} />
              = ₽{item.price * item.quantity}
            </div>
          </div>
          <button onClick={() => removeFromCart(item.productId)} style={{ color: 'red', cursor: 'pointer', background: 'none', border: 'none', fontSize: '20px' }}>×</button>
        </div>
      ))}
      <div style={{ fontSize: '20px', fontWeight: 'bold', margin: '10px 0' }}>Итого: ₽{getTotalPrice()}</div>
      <button onClick={checkout} style={styles.checkoutButton}>Оформить заказ</button>
      <button onClick={() => setShowCart(false)} style={{ ...styles.checkoutButton, background: '#999', marginTop: '10px' }}>Закрыть</button>
    </div>
  );
};

export default CartSidebar;