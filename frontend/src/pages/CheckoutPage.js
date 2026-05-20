import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CheckoutPage = ({ cart, clearCart }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [deliveryForm, setDeliveryForm] = useState({
    customerName: user?.fullName || '',
    phone: user?.phone || '',
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
  const [loading, setLoading] = useState(false);

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
    if (cart.length === 0) {
      navigate('/');
    }
  }, []);

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

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+7`;
    if (digits.length <= 4) return `+7 ${digits.slice(1, 4)}`;
    if (digits.length <= 7) return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}`;
    if (digits.length <= 9) return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}`;
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setDeliveryForm({ ...deliveryForm, phone: formatted });
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const validateForm = () => {
    if (!deliveryForm.customerName) { alert('Введите имя получателя'); return false; }
    if (!deliveryForm.phone) { alert('Введите телефон'); return false; }
    if (!deliveryForm.city) { alert('Выберите город'); return false; }
    if (!deliveryForm.street) { alert('Введите улицу'); return false; }
    if (!deliveryForm.house) { alert('Введите номер дома'); return false; }
    if (!deliveryForm.deliveryDate) { alert('Выберите дату доставки'); return false; }
    if (!deliveryForm.deliveryTime) { alert('Выберите время доставки'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    const fullAddress = `${deliveryForm.city}, ${deliveryForm.street}, д. ${deliveryForm.house}` + 
      (deliveryForm.apartment ? `, кв. ${deliveryForm.apartment}` : '') +
      (deliveryForm.entrance ? `, подъезд ${deliveryForm.entrance}` : '') +
      (deliveryForm.floor ? `, этаж ${deliveryForm.floor}` : '') +
      (deliveryForm.intercom ? ` (домофон: ${deliveryForm.intercom})` : '');

    const deliveryDateTime = `${deliveryForm.deliveryDate} ${deliveryForm.deliveryTime}:00`;

    const orderData = {
      customerName: deliveryForm.customerName,
      phone: deliveryForm.phone,
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
    };

    try {
      await api.post('/orders', orderData);
      alert('✅ Заказ успешно оформлен!');
      clearCart();
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('❌ Ошибка оформления заказа');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'flex', gap: '30px', flexWrap: 'wrap' },
    formSection: { flex: 2, minWidth: '300px' },
    summarySection: { flex: 1, minWidth: '280px' },
    title: { color: '#ff69b4', fontSize: '28px', marginBottom: '20px' },
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', margin: '20px 0 15px 0', color: '#333', borderBottom: '2px solid #ff69b4', paddingBottom: '5px' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' },
    input: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
    inputRow: { display: 'flex', gap: '10px', marginBottom: '15px' },
    halfInput: { flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' },
    select: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', background: 'white' },
    textarea: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' },
    selectedValue: { padding: '12px', background: '#f8f9fa', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ddd', marginBottom: '15px' },
    calendar: { background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginTop: '10px', marginBottom: '15px' },
    calendarDays: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', marginTop: '10px' },
    calendarDay: { padding: '10px', textAlign: 'center', borderRadius: '6px', cursor: 'pointer', border: '1px solid #eee' },
    timeSlotGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px' },
    timeSlot: { padding: '10px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', border: '1px solid #ddd' },
    summaryCard: { background: '#f8f9fa', borderRadius: '12px', padding: '20px', position: 'sticky', top: '20px' },
    cartItem: { borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between' },
    totalPrice: { fontSize: '24px', color: '#ff69b4', fontWeight: 'bold', margin: '15px 0', textAlign: 'right' },
    submitButton: { background: '#28a745', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', cursor: 'pointer', width: '100%', fontSize: '18px', fontWeight: 'bold', marginTop: '20px' },
    backButton: { background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' },
    required: { color: 'red' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formSection}>
        <button onClick={() => navigate('/')} style={styles.backButton}>← Вернуться в каталог</button>
        <h1 style={styles.title}>🚚 Оформление заказа</h1>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.sectionTitle}>Информация о получателе</div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Имя <span style={styles.required}>*</span></label>
            <input 
              type="text" 
              value={deliveryForm.customerName} 
              onChange={(e) => setDeliveryForm({...deliveryForm, customerName: e.target.value})} 
              style={styles.input} 
              required 
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Телефон <span style={styles.required}>*</span></label>
            <input 
              type="tel" 
              placeholder="+7 XXX XXX-XX-XX" 
              value={deliveryForm.phone} 
              onChange={handlePhoneChange} 
              style={styles.input} 
              required 
            />
          </div>

          <div style={styles.sectionTitle}>Адрес доставки</div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Город <span style={styles.required}>*</span></label>
            <select value={deliveryForm.city} onChange={(e) => setDeliveryForm({...deliveryForm, city: e.target.value})} style={styles.select} required>
              <option value="">Выберите город</option>
              {cities.map(city => <option key={city}>{city}</option>)}
            </select>
          </div>
          
          <div style={styles.inputRow}>
            <div style={{ flex: 2 }}>
              <label style={styles.label}>Улица <span style={styles.required}>*</span></label>
              <input type="text" value={deliveryForm.street} onChange={(e) => setDeliveryForm({...deliveryForm, street: e.target.value})} style={styles.input} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Дом <span style={styles.required}>*</span></label>
              <input type="text" value={deliveryForm.house} onChange={(e) => setDeliveryForm({...deliveryForm, house: e.target.value})} style={styles.input} required />
            </div>
          </div>
          
          <div style={styles.inputRow}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Квартира</label>
              <input type="text" value={deliveryForm.apartment} onChange={(e) => setDeliveryForm({...deliveryForm, apartment: e.target.value})} style={styles.input} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Подъезд</label>
              <input type="text" value={deliveryForm.entrance} onChange={(e) => setDeliveryForm({...deliveryForm, entrance: e.target.value})} style={styles.input} />
            </div>
          </div>

          <div style={styles.sectionTitle}>Дата и время доставки</div>
          
          <div>
            <label style={styles.label}>Дата <span style={styles.required}>*</span></label>
            <div style={styles.selectedValue} onClick={() => setShowDatePicker(!showDatePicker)}>
              <span>📅 {selectedDate ? `${selectedDate.day} ${selectedDate.monthName} (${selectedDate.dayName})` : 'Выберите дату'}</span>
              <span>▼</span>
            </div>
            {showDatePicker && (
              <div style={styles.calendar}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Выберите дату доставки</span>
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
                      onClick={() => { 
                        if (date.isAvailable) { 
                          setSelectedDate(date); 
                          setDeliveryForm({...deliveryForm, deliveryDate: date.dateStr}); 
                          setShowDatePicker(false); 
                        } 
                      }}
                    >
                      {date.day}<br/>{date.dayName}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '15px' }}>
            <label style={styles.label}>Время <span style={styles.required}>*</span></label>
            {selectedDate && (
              <div style={styles.selectedValue} onClick={() => setShowTimePicker(!showTimePicker)}>
                <span>⏰ {selectedTime ? selectedTime.label : 'Выберите время'}</span>
                <span>▼</span>
              </div>
            )}
            {showTimePicker && (
              <div style={styles.calendar}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Выберите время доставки</span>
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
          </div>

          <div style={styles.sectionTitle}>Комментарий к заказу</div>
          <textarea 
            placeholder="Пожелания к букету, особые указания для курьера..." 
            value={deliveryForm.comment} 
            onChange={(e) => setDeliveryForm({...deliveryForm, comment: e.target.value})} 
            style={styles.textarea} 
            rows="3" 
          />

          <div style={{ margin: '20px 0', padding: '15px', background: '#fff3cd', borderRadius: '8px' }}>
            <p><strong>Сумма заказа:</strong> <span style={{ fontSize: '24px', color: '#ff69b4' }}>₽{getTotalPrice()}</span></p>
            <p><strong>Доставка:</strong> от 350₽ (рассчитывается при подтверждении)</p>
          </div>

          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Оформление...' : '✅ Подтвердить заказ'}
          </button>
        </form>
      </div>

      <div style={styles.summarySection}>
        <div style={styles.summaryCard}>
          <h3>🛒 Ваш заказ</h3>
          {cart.map(item => (
            <div key={item.productId} style={styles.cartItem}>
              <div>
                <strong>{item.productName}</strong>
                <div>{item.quantity} шт. × ₽{item.price}</div>
              </div>
              <div>₽{item.price * item.quantity}</div>
            </div>
          ))}
          <div style={styles.totalPrice}>
            Итого: ₽{getTotalPrice()}
          </div>
          <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
            <p><strong>Доставка:</strong> от 350₽</p>
            <p><strong>Оплата:</strong> картой или наличными</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;