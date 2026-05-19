import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const FloristPanel = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const response = await api.get('/orders/for-assembly');
      setOrders(response.data);
    } catch (error) { console.error(error); }
  };

  const startAssembly = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/start-assembly`);
      alert('Сборка начата');
      loadOrders();
    } catch (error) { alert('Ошибка'); }
  };

  const markAsReady = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/ready`);
      alert('Заказ готов');
      loadOrders();
    } catch (error) { alert('Ошибка'); }
  };

  const styles = {
    orderCard: { background: 'white', borderRadius: '8px', padding: '15px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    primaryButton: { background: '#ff69b4', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' },
    successButton: { background: '#4caf50', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }
  };

  return (
    <div>
      <h2>🌸 Сборка заказов</h2>
      <div style={{ background: '#e8f5e9', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
        Флорист: {user?.fullName} | Заказов на сборку: {orders.length}
      </div>
      {orders.map(order => (
        <div key={order.id} style={styles.orderCard}>
          <h3>Заказ #{order.id}</h3>
          <p>Клиент: {order.customerName}</p>
          <p>Сумма: ₽{order.totalPrice}</p>
          <p>Состав: {order.items?.map(i => `${i.productName} x${i.quantity}`).join(', ')}</p>
          {order.status === 'New' && <button onClick={() => startAssembly(order.id)} style={styles.primaryButton}>Начать сборку</button>}
          {order.status === 'Assembling' && <button onClick={() => markAsReady(order.id)} style={styles.successButton}>Готов</button>}
        </div>
      ))}
    </div>
  );
};

export default FloristPanel;