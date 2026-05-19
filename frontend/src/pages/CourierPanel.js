import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CustomerPanel = ({ products = [], addToCart, cart = [] }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  
  const [deliveryForm, setDeliveryForm] = useState({
    city: '',
    street: '',
    house: '',
    apartment: '',
    entrance: '',
    floor: '',
    intercom: '',
    deliveryDate: '',
    deliveryTime: '',
    comment: ''
  });

  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const cities = ['Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск', 'Казань', 'Нижний Новгород', 'Другой'];

  const timeSlots = [
    { value: '09:00', label: '09:00 - 10:00' },
    { value: '10:00', label: '10:00 - 11:00' },
    { value: '11:00', label: '11:00 - 12:00' },
    { value: '12:00', label: '12:00 - 13:00' },
    { value: '13:00', label: '13:00 - 14:00' },
    { value: '14:00', label: '14:00 - 15:00' },
    { value: '15:00', label: '15:00 - 16:00' },
    { value: '16:00', label: '16:00 - 17:00' },
    { value: '17:00', label: '17:00 - 18:00' },
    { value: '18:00', label: '18:00 - 19:00' },
    { value: '19:00', label: '19:00 - 20:00' },
    { value: '20:00', label: '20:00 - 21:00' }
  ];

  useEffect(() => {
    generateAvailableDates();
  }, []);

  useEffect(() => {
    if (activeTab === 'myOrders') loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      const response = await api.get('/orders/my');
      setOrders(response.data);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      dates.push({
        date: date,
        dateStr: date.toISOString().split('T')[0],
        day: date.getDate(),
        monthName: date.toLocaleString('ru', { month: 'long' }),
        dayName: date.toLocaleString('ru', { weekday: 'short' }),
        isAvailable: date.getDay() !== 0
      });
    }
    setAvailableDates(dates);
  };

  const handleDateSelect = (date) => {
    if (date.isAvailable) {
      setSelectedDate(date);
      setDeliveryForm({ ...deliveryForm, deliveryDate: date.dateStr });
      setShowDatePicker(false);
      setSelectedTime(null);
      setDeliveryForm({ ...deliveryForm, deliveryTime: '' });
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

  const validateForm = () => {
    if (!deliveryForm.city) { alert('Выберите город'); return false; }
    if (!deliveryForm.street) { alert('Введите улицу'); return false; }
    if (!deliveryForm.house) { alert('Введите номер дома'); return false; }
    if (!deliveryForm.deliveryDate) { alert('Выберите дату доставки'); return false; }
    if (!deliveryForm.deliveryTime) { alert('Выберите время доставки'); return false; }
    return true;
  };

  const checkout = async () => {
    if (!cart || cart.length === 0) {
      alert('Корзина пуста');
      return;
    }
    
    if (!validateForm()) return;

    const fullAddress = `${deliveryForm.city}, ${deliveryForm.street}, д. ${deliveryForm.house}` + 
      (deliveryForm.apartment ? `, кв. ${deliveryForm.apartment}` : '') +
      (deliveryForm.entrance ? `, подъезд ${deliveryForm.entrance}` : '') +
      (deliveryForm.floor ? `, этаж ${deliveryForm.floor}` : '') +
      (deliveryForm.intercom ? ` (домофон: ${deliveryForm.intercom})` : '');

    const deliveryDateTime = `${deliveryForm.deliveryDate} ${deliveryForm.deliveryTime}:00`;

    try {
      await api.post('/orders', {
        customerName: user.fullName,
        phone: user.phone,
        address: fullAddress,
        deliveryTime: deliveryDateTime,
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: getTotalPrice(),
        comment: deliveryForm.comment
      });
      alert('✅ Заказ успешно оформлен!');
      setShowCheckoutModal(false);
      setShowCartModal(false);
      setDeliveryForm({
        city: '', street: '', house: '', apartment: '', entrance: '', floor: '', intercom: '',
        deliveryDate: '', deliveryTime: '', comment: ''
      });
      setSelectedDate(null);
      setSelectedTime(null);
      window.location.reload();
    } catch (error) {
      alert('❌ Ошибка оформления заказа');
    }
  };

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
    header: { marginBottom: '30px' },
    title: { color: '#ff69b4', fontSize: '28px', marginBottom: '20px' },
    tabs: { display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '10px' },
    tab: { padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', borderRadius: '8px' },
    productsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    productCard: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    productName: { fontSize: '18px', margin: '0 0 10px 0' },
    productDesc: { color: '#666', fontSize: '14px', margin: '10px 0' },
    price: { fontSize: '24px', color: '#ff69b4', fontWeight: 'bold', margin: '10px 0' },
    addButton: { background: '#ff69b4', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', width: '100%' },
    orderCard: { background: 'white', borderRadius: '8px', padding: '15px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 },
    modal: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', borderRadius: '12px', padding: '25px', width: '90%', maxWidth: '550px', maxHeight: '85vh', overflowY: 'auto', zIndex: 1000 },
    modalLarge: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', borderRadius: '12px', padding: '25px', width: '90%', maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto', zIndex: 1000 },
    input: { width: '100%', padding: '10px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
    inputRow: { display: 'flex', gap: '10px', margin: '8px 0' },
    halfInput: { flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' },
    select: { width: '100%', padding: '10px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' },
    textarea: { width: '100%', padding: '10px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', resize: 'vertical' },
    primaryButton: { background: '#ff69b4', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold' },
    successButton: { background: '#28a745', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold' },
    cancelButton: { background: '#6c757d', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', marginTop: '10px', width: '100%' },
    cartItem: { borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    cartTotal: { fontSize: '20px', fontWeight: 'bold', margin: '15px 0', textAlign: 'right', color: '#ff69b4' },
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', margin: '15px 0 10px 0', color: '#333', borderBottom: '2px solid #ff69b4', paddingBottom: '5px' },
    calendar: { background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginTop: '10px' },
    calendarDays: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', marginTop: '10px' },
    calendarDay: { padding: '10px', textAlign: 'center', borderRadius: '6px', cursor: 'pointer', border: '1px solid #eee' },
    timeSlotGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px' },
    timeSlot: { padding: '10px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', border: '1px solid #ddd' },
    selectedValue: { padding: '10px', background: '#f8f9fa', borderRadius: '8px', marginTop: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' },
    cartButton: { background: '#ff69b4', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', marginLeft: '15px' }
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
            <button onClick={() => setShowCartModal(true)} style={styles.cartButton}>
              🛒 Корзина ({getCartCount()}) - ₽{getTotalPrice()}
            </button>
          )}
        </div>
      </div>

      {/* Каталог товаров */}
      {activeTab === 'products' && (
        <div style={styles.productsGrid}>
          {products && products.length > 0 ? (
            products.map(product => (
              <div key={product.id} style={styles.productCard}>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productDesc}>{product.description || 'Красивый букет из свежих цветов'}</p>
                <div style={styles.price}>₽{product.price}</div>
                <button onClick={() => addToCart(product)} style={styles.addButton}>🛒 В корзину</button>
              </div>
            ))
          ) : (
            <p>Загрузка товаров...</p>
          )}
        </div>
      )}

      {/* Мои заказы */}
      {activeTab === 'myOrders' && (
        <div>
          <h2>Мои заказы</h2>
          {orders.length === 0 ? (
            <p>У вас пока нет заказов</p>
          ) : (
            orders.map(order => (
              <div key={order.id} style={styles.orderCard}>
                <h3>Заказ #{order.id}</h3>
                <p>Статус: <strong>{order.status}</strong></p>
                <p>Сумма: ₽{order.totalPrice}</p>
                <p>Дата: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Адрес: {order.address}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Модальное окно корзины */}
      {showCartModal && cart && cart.length > 0 && (
        <>
          <div style={styles.modalOverlay} onClick={() => setShowCartModal(false)} />
          <div style={styles.modalLarge}>
            <h2>🛒 Корзина</h2>
            {cart.map(item => (
              <div key={item.productId} style={styles.cartItem}>
                <div>
                  <strong>{item.productName}</strong>
                  <div>{item.quantity} шт. × ₽{item.price} = ₽{item.price * item.quantity}</div>
                </div>
              </div>
            ))}
            <div style={styles.cartTotal}>Итого: ₽{getTotalPrice()}</div>
            <button onClick={() => { setShowCartModal(false); setShowCheckoutModal(true); }} style={styles.primaryButton}>
              🚚 Оформить заказ
            </button>
            <button onClick={() => setShowCartModal(false)} style={styles.cancelButton}>Закрыть</button>
          </div>
        </>
      )}

      {/* Модальное окно оформления заказа */}
      {showCheckoutModal && cart && cart.length > 0 && (
        <>
          <div style={styles.modalOverlay} onClick={() => setShowCheckoutModal(false)} />
          <div style={styles.modal}>
            <h2 style={{ color: '#ff69b4', textAlign: 'center' }}>🚚 Оформление заказа</h2>
            
            <div style={styles.sectionTitle}>Адрес доставки</div>
            <select value={deliveryForm.city} onChange={(e) => setDeliveryForm({...deliveryForm, city: e.target.value})} style={styles.select}>
              <option value="">Выберите город *</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
            
            <div style={styles.inputRow}>
              <input type="text" placeholder="Улица *" value={deliveryForm.street} onChange={(e) => setDeliveryForm({...deliveryForm, street: e.target.value})} style={styles.halfInput} />
              <input type="text" placeholder="Дом *" value={deliveryForm.house} onChange={(e) => setDeliveryForm({...deliveryForm, house: e.target.value})} style={{...styles.halfInput, width: '80px'}} />
            </div>
            
            <div style={styles.inputRow}>
              <input type="text" placeholder="Квартира" value={deliveryForm.apartment} onChange={(e) => setDeliveryForm({...deliveryForm, apartment: e.target.value})} style={styles.halfInput} />
              <input type="text" placeholder="Подъезд" value={deliveryForm.entrance} onChange={(e) => setDeliveryForm({...deliveryForm, entrance: e.target.value})} style={styles.halfInput} />
            </div>

            <div style={styles.sectionTitle}>Дата доставки</div>
            <div style={styles.selectedValue} onClick={() => setShowDatePicker(!showDatePicker)}>
              <span>📅 {selectedDate ? `${selectedDate.day} ${selectedDate.monthName} (${selectedDate.dayName})` : 'Выберите дату *'}</span>
              <span>▼</span>
            </div>
            
            {showDatePicker && (
              <div style={styles.calendar}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Выберите дату</span>
                  <button onClick={() => setShowDatePicker(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
                </div>
                <div style={styles.calendarDays}>
                  {availableDates.map((date, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        ...styles.calendarDay, 
                        background: selectedDate?.dateStr === date.dateStr ? '#ff69b4' : 'white', 
                        color: selectedDate?.dateStr === date.dateStr ? 'white' : '#333', 
                        opacity: date.isAvailable ? 1 : 0.5,
                        cursor: date.isAvailable ? 'pointer' : 'not-allowed'
                      }} 
                      onClick={() => date.isAvailable && handleDateSelect(date)}
                    >
                      {date.day}<br/>{date.dayName}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.sectionTitle}>Время доставки</div>
            {selectedDate && (
              <div style={styles.selectedValue} onClick={() => setShowTimePicker(!showTimePicker)}>
                <span>⏰ {selectedTime ? selectedTime.label : 'Выберите время *'}</span>
                <span>▼</span>
              </div>
            )}
            
            {showTimePicker && (
              <div style={styles.calendar}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Выберите время</span>
                  <button onClick={() => setShowTimePicker(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
                </div>
                <div style={styles.timeSlotGrid}>
                  {timeSlots.map((slot, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        ...styles.timeSlot, 
                        background: selectedTime?.value === slot.value ? '#ff69b4' : 'white', 
                        color: selectedTime?.value === slot.value ? 'white' : '#333' 
                      }} 
                      onClick={() => { 
                        setSelectedTime(slot); 
                        setDeliveryForm({...deliveryForm, deliveryTime: slot.value}); 
                        setShowTimePicker(false); 
                      }}
                    >
                      {slot.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.sectionTitle}>Комментарий</div>
            <textarea placeholder="Пожелания к букету, особые указания..." value={deliveryForm.comment} onChange={(e) => setDeliveryForm({...deliveryForm, comment: e.target.value})} style={styles.textarea} rows="2" />

            <div style={{ margin: '20px 0', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <p><strong>Получатель:</strong> {user?.fullName}</p>
              <p><strong>Телефон:</strong> {user?.phone}</p>
              <p><strong>Сумма заказа:</strong> <span style={{ fontSize: '24px', color: '#ff69b4' }}>₽{getTotalPrice()}</span></p>
            </div>

            <button onClick={checkout} style={styles.successButton}>✅ Подтвердить заказ</button>
            <button onClick={() => setShowCheckoutModal(false)} style={styles.cancelButton}>❌ Отмена</button>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerPanel;