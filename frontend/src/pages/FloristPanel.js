import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const FloristPanel = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await api.get('/orders/for-assembly');
      console.log('Заказы:', response.data);
      setOrders(response.data);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const startAssembly = async (orderId) => {
    setLoading(true);
    try {
      await api.put(`/orders/${orderId}/start-assembly`);
      alert('✅ Сборка начата!');
      await loadOrders();
    } catch (error) {
      console.error('Ошибка:', error);
      alert('❌ Ошибка при начале сборки');
    } finally {
      setLoading(false);
    }
  };

  const markAsReady = async (orderId) => {
    setLoading(true);
    try {
      await api.put(`/orders/${orderId}/ready`);
      alert('✅ Заказ готов к выдаче!');
      await loadOrders();
    } catch (error) {
      console.error('Ошибка:', error);
      alert('❌ Ошибка при отметке готовности');
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return '-';
    const digits = phone.toString().replace(/\D/g, '');
    if (digits.length === 11) {
      return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
    }
    return phone;
  };

  // Функция для отображения статуса на русском
  const getStatusText = (status) => {
    if (status === 0 || status === 'New') return { text: '🆕 Новый', color: '#ff9800', action: 'start' };
    if (status === 1 || status === 'Assembling') return { text: '🔧 В сборке', color: '#2196f3', action: 'ready' };
    if (status === 2 || status === 'Ready') return { text: '✅ Готов', color: '#4caf50', action: null };
    return { text: 'Неизвестно', color: '#999', action: null };
  };

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
    title: { color: '#ff69b4', fontSize: '28px', marginBottom: '20px' },
    stats: { background: '#e8f5e9', padding: '15px 20px', borderRadius: '12px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between' },
    ordersGrid: { display: 'grid', gap: '20px' },
    orderCard: { background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' },
    orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #f0f0f0' },
    orderId: { fontSize: '18px', fontWeight: 'bold', color: '#ff69b4' },
    statusBadge: { display: 'inline-block', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' },
    orderInfo: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' },
    infoLabel: { fontSize: '12px', color: '#999', textTransform: 'uppercase' },
    infoValue: { fontSize: '16px', fontWeight: '500', color: '#333' },
    itemsList: { background: '#f8f9fa', borderRadius: '12px', padding: '15px', margin: '15px 0' },
    itemRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' },
    buttonGroup: { display: 'flex', gap: '10px', marginTop: '15px' },
    primaryButton: { background: '#ff9800', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
    successButton: { background: '#4caf50', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
    detailsButton: { background: '#2196f3', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 },
    modal: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', borderRadius: '16px', padding: '25px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto', zIndex: 1001 },
    closeButton: { background: '#999', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginTop: '15px', width: '100%' }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🌸 Сборка заказов</h1>

      <div style={styles.stats}>
        <span>👩‍🌾 Флорист: {user?.fullName}</span>
        <span>📦 Заказов: {orders.length}</span>
      </div>

      <div style={styles.ordersGrid}>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '16px' }}>
            <p>✨ Нет заказов на сборку</p>
          </div>
        ) : (
          orders.map(order => {
            const statusInfo = getStatusText(order.status);
            return (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <span style={styles.orderId}>Заказ #{order.id}</span>
                  <span style={{ ...styles.statusBadge, background: statusInfo.color + '20', color: statusInfo.color }}>
                    {statusInfo.text}
                  </span>
                </div>

                <div style={styles.orderInfo}>
                  <div>
                    <div style={styles.infoLabel}>👤 КЛИЕНТ</div>
                    <div style={styles.infoValue}>{order.customerName}</div>
                  </div>
                  <div>
                    <div style={styles.infoLabel}>📞 ТЕЛЕФОН</div>
                    <div style={styles.infoValue}>{formatPhone(order.phone)}</div>
                  </div>
                  <div>
                    <div style={styles.infoLabel}>💰 СУММА</div>
                    <div style={styles.infoValue}>₽{order.totalPrice}</div>
                  </div>
                </div>

                <div style={styles.itemsList}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>🌸 СОСТАВ БУКЕТА:</div>
                  {order.items?.map((item, idx) => (
                    <div key={idx} style={styles.itemRow}>
                      <span>{item.productName}</span>
                      <span>{item.quantity} шт.</span>
                    </div>
                  ))}
                </div>

                <div style={styles.buttonGroup}>
                  <button onClick={() => { setSelectedOrder(order); setShowDetails(true); }} style={styles.detailsButton}>
                    📋 Подробнее
                  </button>
                  
                  {/* Кнопка для статуса "Новый" (0 или 'New') */}
                  {(order.status === 0 || order.status === 'New') && (
                    <button onClick={() => startAssembly(order.id)} disabled={loading} style={styles.primaryButton}>
                      {loading ? 'Загрузка...' : '🔧 Начать сборку'}
                    </button>
                  )}
                  
                  {/* Кнопка для статуса "В сборке" (1 или 'Assembling') */}
                  {(order.status === 1 || order.status === 'Assembling') && (
                    <button onClick={() => markAsReady(order.id)} disabled={loading} style={styles.successButton}>
                      {loading ? 'Загрузка...' : '✅ Готов к выдаче'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showDetails && selectedOrder && (
        <div style={styles.modalOverlay} onClick={() => setShowDetails(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#ff69b4', marginBottom: '20px' }}>📋 Детали заказа #{selectedOrder.id}</h3>
            <p><strong>👤 Клиент:</strong> {selectedOrder.customerName}</p>
            <p><strong>📞 Телефон:</strong> {formatPhone(selectedOrder.phone)}</p>
            <p><strong>📍 Адрес:</strong> {selectedOrder.address}</p>
            <p><strong>💰 Сумма:</strong> ₽{selectedOrder.totalPrice}</p>
            <p><strong>📅 Создан:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
            <h4>🌸 Состав:</h4>
            {selectedOrder.items?.map((item, idx) => (
              <div key={idx} style={styles.itemRow}>
                <span>{item.productName}</span>
                <span>{item.quantity} шт.</span>
              </div>
            ))}
            <button onClick={() => setShowDetails(false)} style={styles.closeButton}>Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloristPanel;