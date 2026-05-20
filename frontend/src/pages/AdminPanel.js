import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminPanel = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [reportType, setReportType] = useState('orders');
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: '', 
    description: '', 
    category: 'букеты', 
    stock: 10,
    imageUrl: '/images/default.jpg' 
  });
  const [newUser, setNewUser] = useState({ fullName: '', email: '', phone: '', password: '', role: 'Customer' });
  
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    phone: '',
    city: '',
    street: '',
    house: '',
    apartment: '',
    deliveryDate: '',
    deliveryTime: '',
    items: [{ productId: '', productName: '', quantity: 1, price: 0 }],
    comment: ''
  });

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
    loadAllOrders();
    loadAllProducts();
    loadAllUsers();
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

  const loadAllOrders = async () => {
    try {
      const response = await api.get('/orders');
      setAllOrders(response.data);
    } catch (error) { console.error(error); }
  };

  const loadAllProducts = async () => {
    try {
      const response = await api.get('/products');
      setAllProducts(response.data.products || response.data);
    } catch (error) { console.error(error); }
  };

  const loadAllUsers = async () => {
    try {
      const response = await api.get('/users');
      setAllUsers(response.data);
    } catch (error) { console.error(error); }
  };

  const getRoleName = (role) => {
    switch(role) {
      case 'Admin': return 'Администратор';
      case 'Florist': return 'Флорист';
      case 'Courier': return 'Курьер';
      default: return 'Покупатель';
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch(role) {
      case 'Admin': return { background: '#dc3545', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' };
      case 'Florist': return { background: '#28a745', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' };
      case 'Courier': return { background: '#17a2b8', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' };
      default: return { background: '#6c757d', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' };
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

  const getTotalPrice = () => {
    return newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    let formatted = value;
    if (value.length >= 1) formatted = `+7 ${value.slice(1, 4)}`;
    if (value.length >= 4) formatted = `+7 ${value.slice(1, 4)} ${value.slice(4, 7)}`;
    if (value.length >= 7) formatted = `+7 ${value.slice(1, 4)} ${value.slice(4, 7)}-${value.slice(7, 9)}`;
    if (value.length >= 9) formatted = `+7 ${value.slice(1, 4)} ${value.slice(4, 7)}-${value.slice(7, 9)}-${value.slice(9, 11)}`;
    setNewOrder({ ...newOrder, phone: formatted });
  };

  const addOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { productId: '', productName: '', quantity: 1, price: 0 }]
    });
  };

  const removeOrderItem = (index) => {
    const newItems = [...newOrder.items];
    newItems.splice(index, 1);
    setNewOrder({ ...newOrder, items: newItems });
  };

  const updateOrderItem = (index, field, value) => {
    const newItems = [...newOrder.items];
    newItems[index][field] = value;
    if (field === 'productId' && value) {
      const selectedProduct = allProducts.find(p => p.id === parseInt(value));
      if (selectedProduct) {
        newItems[index].productName = selectedProduct.name;
        newItems[index].price = selectedProduct.price;
      }
    }
    setNewOrder({ ...newOrder, items: newItems });
  };

  const createOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!newOrder.customerName) { alert('Введите имя клиента'); setLoading(false); return; }
    if (!newOrder.phone) { alert('Введите телефон'); setLoading(false); return; }
    if (!newOrder.city) { alert('Выберите город'); setLoading(false); return; }
    if (!newOrder.street) { alert('Введите улицу'); setLoading(false); return; }
    if (!newOrder.house) { alert('Введите номер дома'); setLoading(false); return; }
    
    const validItems = newOrder.items.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) { alert('Добавьте товары'); setLoading(false); return; }
    
    const fullAddress = `${newOrder.city}, ${newOrder.street}, д. ${newOrder.house}` + 
      (newOrder.apartment ? `, кв. ${newOrder.apartment}` : '');
    
    const orderData = {
      customerName: newOrder.customerName,
      phone: newOrder.phone,
      address: fullAddress,
      deliveryTime: newOrder.deliveryDate && newOrder.deliveryTime ? `${newOrder.deliveryDate} ${newOrder.deliveryTime}:00` : null,
      items: validItems.map(item => ({
        productId: parseInt(item.productId),
        productName: item.productName,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price)
      })),
      totalPrice: getTotalPrice(),
      comment: newOrder.comment
    };
    
    try {
      await api.post('/orders', orderData);
      alert('✅ Заказ создан!');
      setShowCreateOrder(false);
      setNewOrder({
        customerName: '', phone: '', city: '', street: '', house: '', apartment: '',
        deliveryDate: '', deliveryTime: '',
        items: [{ productId: '', productName: '', quantity: 1, price: 0 }], comment: ''
      });
      setSelectedDate(null);
      setSelectedTime(null);
      loadAllOrders();
    } catch (error) {
      alert('❌ Ошибка: ' + (error.response?.data?.message || 'Проверьте данные'));
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const statusNumber = parseInt(status);
      await api.patch(`/orders/${orderId}/status?status=${statusNumber}`);
      alert('✅ Статус обновлен');
      loadAllOrders();
    } catch (error) { alert('❌ Ошибка'); }
  };

  const deleteOrder = async (id) => {
    if (window.confirm('Удалить заказ?')) {
      try {
        await api.delete(`/orders/${id}`);
        alert('✅ Заказ удален');
        loadAllOrders();
      } catch (error) { alert('❌ Ошибка'); }
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = newProduct.imageUrl || '/images/default.jpg';
      
      const productData = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        description: newProduct.description || "",
        category: newProduct.category,
        stock: parseInt(newProduct.stock) || 10,
        imageUrl: imageUrl,
        rating: 0,
        isAvailable: true
      };
      
      console.log("Добавление товара:", productData);
      await api.post('/products', productData);
      await loadAllProducts();
      setNewProduct({ name: '', price: '', description: '', category: 'букеты', stock: 10, imageUrl: '/images/default.jpg' });
      setSelectedImage(null);
      setImagePreview(null);
      alert('✅ Товар добавлен');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('❌ Ошибка добавления: ' + (error.response?.data?.message || 'Проверьте данные'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    setLoading(true);
    try {
      const productData = {
        id: editingProduct.id,
        name: editingProduct.name,
        price: parseFloat(editingProduct.price),
        description: editingProduct.description || "",
        category: editingProduct.category,
        stock: parseInt(editingProduct.stock) || 10,
        imageUrl: editingProduct.imageUrl || '/images/default.jpg',
        rating: editingProduct.rating || 0,
        isAvailable: true
      };
      
      console.log("Обновление товара ID:", editingProduct.id);
      await api.put(`/products/${editingProduct.id}`, productData);
      await loadAllProducts();
      setEditingProduct(null);
      setSelectedImage(null);
      setImagePreview(null);
      alert('✅ Товар обновлен');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('❌ Ошибка обновления: ' + (error.response?.data?.message || 'Проверьте данные'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Удалить товар?')) {
      try {
        await api.delete(`/products/${id}`);
        await loadAllProducts();
        alert('✅ Товар удален');
      } catch (error) { 
        console.error('Ошибка:', error);
        alert('❌ Ошибка удаления'); 
      }
    }
  };

  const addUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', {
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone.replace(/\D/g, ''),
        password: newUser.password,
        role: newUser.role
      });
      await loadAllUsers();
      setNewUser({ fullName: '', email: '', phone: '', password: '', role: 'Customer' });
      alert('✅ Пользователь добавлен');
    } catch (error) { alert('❌ Ошибка'); }
  };

  const updateUser = async () => {
    try {
      await api.put(`/users/${editingUser.id}`, {
        fullName: editingUser.fullName,
        email: editingUser.email,
        phone: editingUser.phone?.replace(/\D/g, '') || '',
        role: editingUser.role,
        password: editingUser.password || ''
      });
      await loadAllUsers();
      setEditingUser(null);
      alert('✅ Пользователь обновлен');
    } catch (error) { alert('❌ Ошибка обновления'); }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Удалить пользователя?')) {
      try {
        await api.delete(`/users/${id}`);
        await loadAllUsers();
        alert('✅ Пользователь удален');
      } catch (error) { alert('❌ Ошибка'); }
    }
  };

  const generateReport = () => {
    if (reportType === 'orders') {
      const completedOrders = allOrders.filter(order => order.status === 4 || order.status === 'Completed');
      if (completedOrders.length === 0) {
        alert('📭 Нет выполненных заказов для формирования отчета');
        return;
      }
      const reportHtml = `
        <html>
        <head><title>Отчет по выполненным заказам</title><meta charset="utf-8">
        <style>
          body { font-family: Arial; margin: 40px; }
          h1 { color: #ff69b4; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #ff69b4; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          .footer { text-align: center; margin-top: 50px; color: #999; }
        </style>
        </head>
        <body>
          <h1>🌸 Отчет по выполненным заказам</h1>
          <p>Дата: ${new Date().toLocaleString()}</p>
          <p>Всего выполненных заказов: ${completedOrders.length}</p>
          <table>
            <thead>
              <tr><th>ID</th><th>Клиент</th><th>Телефон</th><th>Сумма</th><th>Дата</th></tr>
            </thead>
            <tbody>
              ${completedOrders.map(order => `<tr><td>${order.id}</td><td>${order.customerName}</td><td>${order.phone || '-'}</td><td>₽${order.totalPrice}</td><td>${new Date(order.createdAt).toLocaleDateString()}</td></tr>`).join('')}
            </tbody>
          </table>
          <div class="total">Общая сумма: ₽${completedOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)}</div>
          <div class="footer"><p>FlowerShop - Оттенки наших чувств</p></div>
        </body>
        </html>
      `;
      const win = window.open();
      win.document.write(reportHtml);
      win.document.close();
    } else if (reportType === 'products') {
      if (allProducts.length === 0) {
        alert('📭 Нет товаров для формирования отчета');
        return;
      }
      const reportHtml = `
        <html>
        <head><title>Отчет по товарам</title><meta charset="utf-8">
        <style>
          body { font-family: Arial; margin: 40px; }
          h1 { color: #ff69b4; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #ff69b4; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          .footer { text-align: center; margin-top: 50px; color: #999; }
        </style>
        </head>
        <body>
          <h1>🌸 Отчет по товарам</h1>
          <p>Дата: ${new Date().toLocaleString()}</p>
          <p>Всего товаров: ${allProducts.length}</p>
          <tr>
            <thead>
              <tr><th>ID</th><th>Название</th><th>Цена</th><th>Категория</th></tr>
            </thead>
            <tbody>
              ${allProducts.map(p => `<tr><td>${p.id}</td><td>${p.name}</td><td>₽${p.price}</td><td>${p.category || 'букеты'}</td></tr>`).join('')}
            </tbody>
          </table>
          <div class="total">Средняя цена: ₽${(allProducts.reduce((sum, p) => sum + (p.price || 0), 0) / allProducts.length).toFixed(2)}</div>
          <div class="footer"><p>FlowerShop - Оттенки наших чувств</p></div>
        </body>
        </html>
      `;
      const win = window.open();
      win.document.write(reportHtml);
      win.document.close();
    }
  };

  const styles = {
    container: { maxWidth: '1400px', margin: '0 auto', padding: '20px' },
    statCard: { background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer' },
    tabButton: { padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' },
    input: { padding: '10px', margin: '5px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: 'auto', minWidth: '150px' },
    select: { padding: '10px', margin: '5px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', background: 'white' },
    textarea: { padding: '10px', margin: '5px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '300px' },
    table: { width: '100%', background: 'white', borderRadius: '8px', overflow: 'hidden', borderCollapse: 'collapse' },
    th: { background: '#ff69b4', color: 'white', padding: '12px', textAlign: 'left' },
    td: { padding: '10px', borderBottom: '1px solid #eee' },
    primaryButton: { background: '#ff69b4', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' },
    successButton: { background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' },
    editButton: { background: '#ffc107', color: '#333', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
    deleteButton: { background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 },
    modal: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '25px', borderRadius: '12px', zIndex: 1000, width: '750px', maxWidth: '90%', maxHeight: '85vh', overflowY: 'auto' },
    selectedValue: { padding: '10px', background: '#f8f9fa', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', border: '1px solid #ddd', margin: '5px' },
    calendar: { background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginTop: '10px' },
    calendarDays: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', marginTop: '10px' },
    calendarDay: { padding: '10px', textAlign: 'center', borderRadius: '6px', cursor: 'pointer', border: '1px solid #eee' },
    timeSlotGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px' },
    timeSlot: { padding: '10px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', border: '1px solid #ddd' },
    inputRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' },
    halfInput: { flex: 1, minWidth: '150px' }
  };

  return (
    <div style={styles.container}>
      <h2>👑 Панель администратора</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={styles.statCard} onClick={() => { setActiveTab('orders'); setShowReport(false); }}>
          <h3>📦 Заказов</h3><h2>{allOrders.length}</h2>
        </div>
        <div style={styles.statCard} onClick={() => { setActiveTab('products'); setShowReport(false); }}>
          <h3>🌸 Товаров</h3><h2>{allProducts.length}</h2>
        </div>
        <div style={styles.statCard} onClick={() => { setActiveTab('users'); setShowReport(false); }}>
          <h3>👥 Пользователей</h3><h2>{allUsers.length}</h2>
        </div>
        <div style={styles.statCard} onClick={() => setShowReport(!showReport)}>
          <h3>📊 Отчеты</h3><h2>📄</h2>
        </div>
      </div>

      {showReport && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Генерация отчета</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={styles.select}>
              <option value="orders">📋 Отчет по заказам</option>
            </select>
            <button onClick={generateReport} style={styles.primaryButton}>📄 Сформировать отчет</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <button onClick={() => { setActiveTab('orders'); setShowReport(false); }} style={{ ...styles.tabButton, background: activeTab === 'orders' ? '#ff69b4' : 'white', color: activeTab === 'orders' ? 'white' : '#ff69b4' }}>📋 Заказы</button>
        <button onClick={() => { setActiveTab('products'); setShowReport(false); }} style={{ ...styles.tabButton, background: activeTab === 'products' ? '#ff69b4' : 'white', color: activeTab === 'products' ? 'white' : '#ff69b4' }}>🌸 Товары</button>
        <button onClick={() => { setActiveTab('users'); setShowReport(false); }} style={{ ...styles.tabButton, background: activeTab === 'users' ? '#ff69b4' : 'white', color: activeTab === 'users' ? 'white' : '#ff69b4' }}>👥 Пользователи</button>
      </div>

      {/* ЗАКАЗЫ */}
      {activeTab === 'orders' && (
        <div>
          <button onClick={() => setShowCreateOrder(true)} style={{ ...styles.successButton, marginBottom: '20px' }}>➕ Создать заказ</button>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th><th style={styles.th}>Клиент</th><th style={styles.th}>Телефон</th><th style={styles.th}>Адрес</th><th style={styles.th}>Сумма</th><th style={styles.th}>Статус</th><th style={styles.th}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map(order => (
                  <tr key={order.id}>
                    <td style={styles.td}>#{order.id}</td>
                    <td style={styles.td}>{order.customerName}</td>
                    <td style={styles.td}>{formatPhone(order.phone)}</td>
                    <td style={styles.td}>{order.address}</td>
                    <td style={styles.td}>₽{order.totalPrice}</td>
                    <td style={styles.td}>
                      <select onChange={(e) => updateOrderStatus(order.id, e.target.value)} value={order.status !== undefined ? order.status.toString() : "0"} style={styles.select}>
                        <option value="0">🆕 Новый</option>
                        <option value="1">🔧 Сборка</option>
                        <option value="2">✅ Готов</option>
                        <option value="3">🚚 Доставка</option>
                        <option value="4">🎉 Выполнен</option>
                        <option value="5">❌ Отменен</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => deleteOrder(order.id)} style={styles.deleteButton}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ТОВАРЫ */}
      {activeTab === 'products' && (
        <div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>{editingProduct ? '✏️ Редактировать товар' : '➕ Добавить товар'}</h3>
            <form onSubmit={editingProduct ? (e) => { e.preventDefault(); handleUpdateProduct(); } : handleAddProduct} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <input type="text" placeholder="Название" value={editingProduct ? editingProduct.name : newProduct.name} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} style={styles.input} required />
              <input type="number" placeholder="Цена" value={editingProduct ? editingProduct.price : newProduct.price} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, price: e.target.value}) : setNewProduct({...newProduct, price: e.target.value})} style={styles.input} required />
              <input type="text" placeholder="Описание" value={editingProduct ? editingProduct.description : newProduct.description} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})} style={styles.input} />
              <select value={editingProduct ? editingProduct.category : newProduct.category} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})} style={styles.select}>
                <option value="букеты">Букеты</option><option value="розы">Розы</option><option value="подарки">Подарки</option>
              </select>
              
              <div style={{ width: '100%', marginTop: '10px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>URL картинки:</label>
                <input type="text" placeholder="/images/nazvanie.jpg" value={editingProduct ? editingProduct.imageUrl : newProduct.imageUrl} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, imageUrl: e.target.value}) : setNewProduct({...newProduct, imageUrl: e.target.value})} style={styles.input} />
                <small style={{ color: '#666' }}>Пример: /images/rose.jpg (положите картинку в папку public/images/)</small>
              </div>
              
              {editingProduct?.imageUrl && (
                <div style={{ marginTop: '10px' }}>
                  <img src={editingProduct.imageUrl} alt={editingProduct.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
              )}
              
              <button type="submit" style={styles.primaryButton} disabled={loading}>{editingProduct ? 'Сохранить' : 'Добавить'}</button>
              {editingProduct && <button onClick={() => setEditingProduct(null)} style={styles.deleteButton}>Отмена</button>}
            </form>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr><th style={styles.th}>ID</th><th style={styles.th}>Название</th><th style={styles.th}>Цена</th><th style={styles.th}>Категория</th><th style={styles.th}>Действия</th></tr>
              </thead>
              <tbody>
                {allProducts.map(product => (
                  <tr key={product.id}>
                    <td style={styles.td}>{product.id}</td>
                    <td style={styles.td}>{product.name}</td>
                    <td style={styles.td}>₽{product.price}</td>
                    <td style={styles.td}>{product.category || 'букеты'}</td>
                    <td style={styles.td}>
                      <button onClick={() => setEditingProduct(product)} style={styles.editButton}>✏️</button>
                      <button onClick={() => handleDeleteProduct(product.id)} style={styles.deleteButton}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ПОЛЬЗОВАТЕЛИ */}
      {activeTab === 'users' && (
        <div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>{editingUser ? '✏️ Редактировать пользователя' : '➕ Добавить пользователя'}</h3>
            <form onSubmit={editingUser ? (e) => { e.preventDefault(); updateUser(); } : addUser} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="text" placeholder="Имя" value={editingUser ? editingUser.fullName : newUser.fullName} onChange={(e) => editingUser ? setEditingUser({...editingUser, fullName: e.target.value}) : setNewUser({...newUser, fullName: e.target.value})} style={styles.input} required />
              <input type="email" placeholder="Email" value={editingUser ? editingUser.email : newUser.email} onChange={(e) => editingUser ? setEditingUser({...editingUser, email: e.target.value}) : setNewUser({...newUser, email: e.target.value})} style={styles.input} required />
              <input type="tel" placeholder="Телефон" value={editingUser ? editingUser.phone : newUser.phone} onChange={(e) => editingUser ? setEditingUser({...editingUser, phone: e.target.value}) : setNewUser({...newUser, phone: e.target.value})} style={styles.input} />
              {!editingUser && <input type="password" placeholder="Пароль" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} style={styles.input} required />}
              <select value={editingUser ? editingUser.role : newUser.role} onChange={(e) => editingUser ? setEditingUser({...editingUser, role: e.target.value}) : setNewUser({...newUser, role: e.target.value})} style={styles.select}>
                <option value="Customer">Покупатель</option><option value="Courier">Курьер</option><option value="Florist">Флорист</option><option value="Admin">Администратор</option>
              </select>
              <button type="submit" style={styles.primaryButton}>{editingUser ? 'Сохранить' : 'Добавить'}</button>
              {editingUser && <button onClick={() => setEditingUser(null)} style={styles.deleteButton}>Отмена</button>}
            </form>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr><th style={styles.th}>ID</th><th style={styles.th}>Имя</th><th style={styles.th}>Email</th><th style={styles.th}>Телефон</th><th style={styles.th}>Роль</th><th style={styles.th}>Действия</th></tr>
              </thead>
              <tbody>
                {allUsers.map(user => (
                  <tr key={user.id}>
                    <td style={styles.td}>{user.id}</td>
                    <td style={styles.td}>{user.fullName}</td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>{formatPhone(user.phone)}</td>
                    <td style={styles.td}><span style={getRoleBadgeStyle(user.role)}>{getRoleName(user.role)}</span></td>
                    <td style={styles.td}>
                      <button onClick={() => setEditingUser(user)} style={styles.editButton}>✏️</button>
                      <button onClick={() => deleteUser(user.id)} style={styles.deleteButton}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО СОЗДАНИЯ ЗАКАЗА */}
      {showCreateOrder && (
        <>
          <div style={styles.modalOverlay} onClick={() => setShowCreateOrder(false)} />
          <div style={styles.modal}>
            <h3>➕ Создание заказа</h3>
            <form onSubmit={createOrder}>
              <input type="text" placeholder="Клиент *" value={newOrder.customerName} onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})} style={styles.input} required />
              <input type="tel" placeholder="Телефон *" value={newOrder.phone} onChange={handlePhoneChange} style={styles.input} required />
              <select value={newOrder.city} onChange={(e) => setNewOrder({...newOrder, city: e.target.value})} style={styles.select} required>
                <option value="">Город *</option>{cities.map(c => <option key={c}>{c}</option>)}
              </select>
              <div style={styles.inputRow}>
                <input type="text" placeholder="Улица *" value={newOrder.street} onChange={(e) => setNewOrder({...newOrder, street: e.target.value})} style={styles.halfInput} required />
                <input type="text" placeholder="Дом *" value={newOrder.house} onChange={(e) => setNewOrder({...newOrder, house: e.target.value})} style={styles.halfInput} required />
                <input type="text" placeholder="Квартира" value={newOrder.apartment} onChange={(e) => setNewOrder({...newOrder, apartment: e.target.value})} style={styles.halfInput} />
              </div>
              
              <div style={styles.selectedValue} onClick={() => setShowDatePicker(!showDatePicker)}>
                <span>📅 {selectedDate ? `${selectedDate.day} ${selectedDate.monthName}` : 'Дата доставки'}</span><span>▼</span>
              </div>
              {showDatePicker && (
                <div style={styles.calendar}>
                  <div style={styles.calendarDays}>
                    {availableDates.map((d, i) => (
                      <div key={i} style={{ ...styles.calendarDay, background: selectedDate?.dateStr === d.dateStr ? '#ff69b4' : 'white', color: selectedDate?.dateStr === d.dateStr ? 'white' : '#333', opacity: d.isAvailable ? 1 : 0.5, cursor: d.isAvailable ? 'pointer' : 'default' }} onClick={() => { if (d.isAvailable) { setSelectedDate(d); setNewOrder({...newOrder, deliveryDate: d.dateStr}); setShowDatePicker(false); } }}>
                        {d.day}<br/>{d.dayName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedDate && (
                <div style={styles.selectedValue} onClick={() => setShowTimePicker(!showTimePicker)}>
                  <span>⏰ {selectedTime ? selectedTime.label : 'Время доставки'}</span><span>▼</span>
                </div>
              )}
              {showTimePicker && (
                <div style={styles.calendar}>
                  <div style={styles.timeSlotGrid}>
                    {timeSlots.map((slot, i) => (
                      <div key={i} style={{ ...styles.timeSlot, background: selectedTime?.value === slot.value ? '#ff69b4' : 'white', color: selectedTime?.value === slot.value ? 'white' : '#333' }} onClick={() => { setSelectedTime(slot); setNewOrder({...newOrder, deliveryTime: slot.value}); setShowTimePicker(false); }}>
                        {slot.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <textarea placeholder="Комментарий" value={newOrder.comment} onChange={(e) => setNewOrder({...newOrder, comment: e.target.value})} style={styles.textarea} rows="2" />
              
              <h4>Товары в заказе:</h4>
              {newOrder.items.map((item, idx) => (
                <div key={idx} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0', borderRadius: '8px' }}>
                  <select value={item.productId} onChange={(e) => updateOrderItem(idx, 'productId', e.target.value)} style={styles.select} required>
                    <option value="">Выберите товар</option>
                    {allProducts.map(p => <option key={p.id} value={p.id}>{p.name} - ₽{p.price}</option>)}
                  </select>
                  <input type="number" placeholder="Кол-во" value={item.quantity} onChange={(e) => updateOrderItem(idx, 'quantity', e.target.value)} style={styles.input} min="1" required />
                  <button type="button" onClick={() => removeOrderItem(idx)} style={styles.deleteButton}>Удалить</button>
                </div>
              ))}
              <button type="button" onClick={addOrderItem} style={styles.primaryButton}>➕ Добавить товар</button>
              
              <div style={{ margin: '15px 0', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <strong>Общая стоимость: ₽{getTotalPrice()}</strong>
              </div>
              
              <button type="submit" style={styles.successButton} disabled={loading}>✅ {loading ? 'Создание...' : 'Создать заказ'}</button>
              <button type="button" onClick={() => setShowCreateOrder(false)} style={styles.deleteButton}>❌ Отмена</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;