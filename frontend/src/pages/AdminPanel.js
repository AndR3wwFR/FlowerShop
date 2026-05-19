import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminPanel = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [adminTab, setAdminTab] = useState('orders');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [reportType, setReportType] = useState('orders');
  const [showReport, setShowReport] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', category: 'букеты' });
  const [newUser, setNewUser] = useState({ fullName: '', email: '', phone: '', password: '', role: 'Customer' });
  
  // Форма для создания заказа
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    phone: '',
    address: '',
    deliveryTime: '',
    items: [{ productId: '', productName: '', quantity: 1, price: 0 }],
    totalPrice: 0,
    comment: ''
  });

  useEffect(() => {
    loadAllOrders();
    loadAllProducts();
    loadAllUsers();
  }, []);

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
    } catch (error) { console.error('Ошибка загрузки пользователей:', error); }
  };

  // ============ УПРАВЛЕНИЕ ЗАКАЗАМИ ============
  
  // Создание нового заказа
  const createOrder = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!newOrder.customerName || !newOrder.phone || !newOrder.address) {
      alert('Заполните обязательные поля: Клиент, Телефон, Адрес');
      return;
    }
    
    if (!newOrder.items || newOrder.items.length === 0 || !newOrder.items[0].productId) {
      alert('Добавьте хотя бы один товар в заказ');
      return;
    }
    
    // Рассчитываем общую сумму
    const totalPrice = newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
      const orderData = {
        customerName: newOrder.customerName,
        phone: newOrder.phone,
        address: newOrder.address,
        deliveryTime: newOrder.deliveryTime,
        items: newOrder.items.map(item => ({
          productId: parseInt(item.productId),
          productName: item.productName,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price)
        })),
        totalPrice: totalPrice,
        comment: newOrder.comment,
        status: 'New'
      };
      
      await api.post('/orders', orderData);
      alert('✅ Заказ успешно создан!');
      setShowCreateOrder(false);
      setNewOrder({
        customerName: '',
        phone: '',
        address: '',
        deliveryTime: '',
        items: [{ productId: '', productName: '', quantity: 1, price: 0 }],
        totalPrice: 0,
        comment: ''
      });
      loadAllOrders();
    } catch (error) {
      console.error(error);
      alert('❌ Ошибка создания заказа: ' + (error.response?.data?.message || 'Проверьте данные'));
    }
  };

  // Добавить товар в заказ (при создании)
  const addOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { productId: '', productName: '', quantity: 1, price: 0 }]
    });
  };

  // Удалить товар из заказа (при создании)
  const removeOrderItem = (index) => {
    const newItems = [...newOrder.items];
    newItems.splice(index, 1);
    setNewOrder({ ...newOrder, items: newItems });
  };

  // Обновить товар в заказе
  const updateOrderItem = (index, field, value) => {
    const newItems = [...newOrder.items];
    newItems[index][field] = value;
    
    // Если выбран товар из списка, подставляем его цену и название
    if (field === 'productId' && value) {
      const selectedProduct = allProducts.find(p => p.id === parseInt(value));
      if (selectedProduct) {
        newItems[index].productName = selectedProduct.name;
        newItems[index].price = selectedProduct.price;
      }
    }
    
    setNewOrder({ ...newOrder, items: newItems });
  };

  // Обновить статус заказа
  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status?status=${status}`);
      alert('✅ Статус обновлен');
      loadAllOrders();
    } catch (error) { alert('❌ Ошибка'); }
  };

  // Полное редактирование заказа
  const updateOrder = async () => {
    try {
      const totalPrice = editingOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const orderData = {
        ...editingOrder,
        totalPrice: totalPrice
      };
      await api.put(`/orders/${editingOrder.id}`, orderData);
      await loadAllOrders();
      setEditingOrder(null);
      alert('✅ Заказ обновлен');
    } catch (error) { alert('❌ Ошибка обновления'); }
  };

  // Удалить заказ
  const deleteOrder = async (id) => {
    if (window.confirm('Удалить заказ? Это действие нельзя отменить.')) {
      try {
        await api.delete(`/orders/${id}`);
        await loadAllOrders();
        alert('✅ Заказ удален');
      } catch (error) { alert('❌ Ошибка удаления'); }
    }
  };

  // Редактирование товара в заказе (в модальном окне)
  const editOrderItem = (index, field, value) => {
    const newItems = [...editingOrder.items];
    newItems[index][field] = value;
    if (field === 'quantity') {
      newItems[index][field] = parseInt(value) || 0;
    }
    if (field === 'price') {
      newItems[index][field] = parseFloat(value) || 0;
    }
    setEditingOrder({ ...editingOrder, items: newItems });
  };

  const addEditOrderItem = () => {
    setEditingOrder({
      ...editingOrder,
      items: [...editingOrder.items, { productId: 0, productName: '', quantity: 1, price: 0 }]
    });
  };

  const removeEditOrderItem = (index) => {
    const newItems = [...editingOrder.items];
    newItems.splice(index, 1);
    setEditingOrder({ ...editingOrder, items: newItems });
  };

  // ============ УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ============
  const addUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', {
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone.replace(/\D/g, ''),
        password: newUser.password,
        role: newUser.role
      });
      await loadAllUsers();
      setNewUser({ fullName: '', email: '', phone: '', password: '', role: 'Customer' });
      alert('✅ Пользователь добавлен');
    } catch (error) {
      alert('❌ Ошибка добавления: ' + (error.response?.data?.message || 'Проверьте данные'));
    }
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
    } catch (error) {
      alert('❌ Ошибка обновления');
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Удалить пользователя? Это действие нельзя отменить.')) {
      try {
        await api.delete(`/users/${id}`);
        await loadAllUsers();
        alert('✅ Пользователь удален');
      } catch (error) {
        alert('❌ Ошибка удаления: ' + (error.response?.data?.message || 'Попробуйте позже'));
      }
    }
  };

  // ============ УПРАВЛЕНИЕ ТОВАРАМИ ============
  const addProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', newProduct);
      await loadAllProducts();
      setNewProduct({ name: '', price: '', description: '', category: 'букеты' });
      alert('✅ Товар добавлен');
    } catch (error) { alert('❌ Ошибка добавления'); }
  };

  const updateProduct = async () => {
    try {
      await api.put(`/products/${editingProduct.id}`, editingProduct);
      await loadAllProducts();
      setEditingProduct(null);
      alert('✅ Товар обновлен');
    } catch (error) { alert('❌ Ошибка обновления'); }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Удалить товар?')) {
      try {
        await api.delete(`/products/${id}`);
        await loadAllProducts();
        alert('✅ Товар удален');
      } catch (error) { alert('❌ Ошибка удаления'); }
    }
  };

  // ============ ОТЧЕТЫ ============
  const generateReport = () => {
    let reportData = [];
    let reportTitle = '';
    
    switch(reportType) {
      case 'orders': 
        reportData = allOrders; 
        reportTitle = 'Отчет по заказам'; 
        break;
      case 'products': 
        reportData = allProducts; 
        reportTitle = 'Отчет по товарам'; 
        break;
      case 'users': 
        reportData = allUsers; 
        reportTitle = 'Отчет по пользователям'; 
        break;
      default: return;
    }
    
    const reportHtml = `
      <html>
      <head>
        <title>${reportTitle}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #ff69b4; text-align: center; }
          h2 { color: #333; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #ff69b4; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          .footer { text-align: center; margin-top: 50px; color: #666; font-size: 12px; }
          .total { font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>🌸 ${reportTitle}</h1>
        <p>Дата: ${new Date().toLocaleString()}</p>
        <p>Всего записей: ${reportData.length}</p>
        
        <h2>Детали</h2>
        <table>
          <thead>
            <tr>
              ${reportType === 'orders' ? '<th>ID</th><th>Клиент</th><th>Сумма</th><th>Статус</th><th>Дата</th>' : ''}
              ${reportType === 'products' ? '<th>ID</th><th>Название</th><th>Цена</th><th>Категория</th>' : ''}
              ${reportType === 'users' ? '<th>ID</th><th>Имя</th><th>Email</th><th>Телефон</th><th>Роль</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${reportData.map(item => {
              if (reportType === 'orders') {
                return `<tr>
                  <td>${item.id}</td>
                  <td>${item.customerName}</td>
                  <td>₽${item.totalPrice}</td>
                  <td>${item.status}</td>
                  <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>`;
              }
              if (reportType === 'products') {
                return `<tr>
                  <td>${item.id}</td>
                  <td>${item.name}</td>
                  <td>₽${item.price}</td>
                  <td>${item.category || 'букеты'}</td>
                </tr>`;
              }
              if (reportType === 'users') {
                return `<tr>
                  <td>${item.id}</td>
                  <td>${item.fullName}</td>
                  <td>${item.email}</td>
                  <td>${item.phone}</td>
                  <td>${item.role}</td>
                </tr>`;
              }
              return '';
            }).join('')}
          </tbody>
        <table>
        
        <div class="footer">
          <p>FlowerShop - Оттенки наших чувств</p>
        </div>
      </body>
      </html>
    `;
    
    const win = window.open();
    win.document.write(reportHtml);
    win.document.close();
  };

  const styles = {
    statCard: { 
      background: 'white', 
      padding: '20px', 
      borderRadius: '12px', 
      textAlign: 'center', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
      cursor: 'pointer' 
    },
    tabButton: { 
      padding: '10px 20px', 
      border: 'none', 
      borderRadius: '8px', 
      cursor: 'pointer', 
      fontWeight: 'bold' 
    },
    input: { 
      padding: '8px 12px', 
      margin: '5px', 
      border: '1px solid #ddd', 
      borderRadius: '6px', 
      fontSize: '14px' 
    },
    textarea: {
      padding: '8px 12px',
      margin: '5px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '14px',
      width: '100%'
    },
    select: {
      padding: '8px 12px',
      margin: '5px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '14px'
    },
    table: { 
      width: '100%', 
      background: 'white', 
      borderRadius: '8px', 
      overflow: 'hidden', 
      borderCollapse: 'collapse' 
    },
    th: { 
      background: '#ff69b4', 
      color: 'white', 
      padding: '12px', 
      textAlign: 'left' 
    },
    td: { 
      padding: '10px', 
      borderBottom: '1px solid #eee' 
    },
    primaryButton: { 
      background: '#ff69b4', 
      color: 'white', 
      border: 'none', 
      padding: '8px 16px', 
      borderRadius: '6px', 
      cursor: 'pointer', 
      margin: '5px' 
    },
    successButton: {
      background: '#28a745',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      margin: '5px'
    },
    editButton: { 
      background: '#ffc107', 
      color: '#333', 
      border: 'none', 
      padding: '5px 10px', 
      borderRadius: '4px', 
      cursor: 'pointer', 
      marginRight: '5px' 
    },
    deleteButton: { 
      background: '#dc3545', 
      color: 'white', 
      border: 'none', 
      padding: '5px 10px', 
      borderRadius: '4px', 
      cursor: 'pointer' 
    },
    modal: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      zIndex: 1000,
      width: '700px',
      maxWidth: '90%',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    modalSmall: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      zIndex: 1000,
      width: '500px',
      maxWidth: '90%',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 999
    },
    roleBadge: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold'
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch(role) {
      case 'Admin': return { background: '#dc3545', color: 'white' };
      case 'Florist': return { background: '#28a745', color: 'white' };
      case 'Courier': return { background: '#17a2b8', color: 'white' };
      default: return { background: '#6c757d', color: 'white' };
    }
  };

  const getRoleName = (role) => {
    switch(role) {
      case 'Admin': return 'Администратор';
      case 'Florist': return 'Флорист';
      case 'Courier': return 'Курьер';
      default: return 'Покупатель';
    }
  };

  const getStatusName = (status) => {
    switch(status) {
      case 'New': return '🆕 Новый';
      case 'Assembling': return '🔧 Сборка';
      case 'Ready': return '✅ Готов';
      case 'Delivering': return '🚚 Доставка';
      case 'Completed': return '🎉 Выполнен';
      case 'Cancelled': return '❌ Отменен';
      default: return status;
    }
  };

  return (
    <div>
      <h2>👑 Панель администратора</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={styles.statCard} onClick={() => { setAdminTab('orders'); setShowReport(false); }}>
          <h3>📦 Заказов</h3>
          <h2>{allOrders.length}</h2>
        </div>
        <div style={styles.statCard} onClick={() => { setAdminTab('products'); setShowReport(false); }}>
          <h3>🌸 Товаров</h3>
          <h2>{allProducts.length}</h2>
        </div>
        <div style={styles.statCard} onClick={() => { setAdminTab('users'); setShowReport(false); }}>
          <h3>👥 Пользователей</h3>
          <h2>{allUsers.length}</h2>
        </div>
        <div style={styles.statCard} onClick={() => setShowReport(!showReport)}>
          <h3>📊 Отчеты</h3>
          <h2>📄</h2>
        </div>
      </div>

      {showReport && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Генерация отчета</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={styles.select}>
              <option value="orders">Отчет по заказам</option>
              <option value="products">Отчет по товарам</option>
              <option value="users">Отчет по пользователям</option>
            </select>
            <button onClick={generateReport} style={styles.primaryButton}>📄 Сформировать отчет</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => { setAdminTab('orders'); setShowReport(false); }} style={{ ...styles.tabButton, background: adminTab === 'orders' ? '#ff69b4' : 'white', color: adminTab === 'orders' ? 'white' : '#ff69b4' }}>
          📋 Заказы
        </button>
        <button onClick={() => { setAdminTab('products'); setShowReport(false); }} style={{ ...styles.tabButton, background: adminTab === 'products' ? '#ff69b4' : 'white', color: adminTab === 'products' ? 'white' : '#ff69b4' }}>
          🌸 Товары
        </button>
        <button onClick={() => { setAdminTab('users'); setShowReport(false); }} style={{ ...styles.tabButton, background: adminTab === 'users' ? '#ff69b4' : 'white', color: adminTab === 'users' ? 'white' : '#ff69b4' }}>
          👥 Пользователи
        </button>
      </div>

      {/* ============ ЗАКАЗЫ ============ */}
      {adminTab === 'orders' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={() => setShowCreateOrder(true)} style={styles.successButton}>
              ➕ Создать новый заказ
            </button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Клиент</th>
                  <th style={styles.th}>Телефон</th>
                  <th style={styles.th}>Адрес</th>
                  <th style={styles.th}>Сумма</th>
                  <th style={styles.th}>Статус</th>
                  <th style={styles.th}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                      📭 Нет заказов. Нажмите "Создать новый заказ"
                    </td>
                  </tr>
                ) : (
                  allOrders.map(order => (
                    <tr key={order.id}>
                      <td style={styles.td}>#{order.id}</td>
                      <td style={styles.td}>{order.customerName}</td>
                      <td style={styles.td}>{order.phone}</td>
                      <td style={styles.td}>{order.address}</td>
                      <td style={styles.td}>₽{order.totalPrice}</td>
                      <td style={styles.td}>
                        <select 
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)} 
                          defaultValue={order.status} 
                          style={styles.select}
                        >
                          <option value="New">🆕 Новый</option>
                          <option value="Assembling">🔧 Сборка</option>
                          <option value="Ready">✅ Готов</option>
                          <option value="Delivering">🚚 Доставка</option>
                          <option value="Completed">🎉 Выполнен</option>
                          <option value="Cancelled">❌ Отменен</option>
                        </select>
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => setEditingOrder(order)} style={styles.editButton}>✏️</button>
                        <button onClick={() => deleteOrder(order.id)} style={styles.deleteButton}>🗑️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============ ТОВАРЫ ============ */}
      {adminTab === 'products' && (
        <div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>{editingProduct ? '✏️ Редактировать товар' : '➕ Добавить товар'}</h3>
            <form onSubmit={editingProduct ? (e) => { e.preventDefault(); updateProduct(); } : addProduct} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="text" placeholder="Название" value={editingProduct ? editingProduct.name : newProduct.name} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} style={styles.input} required />
              <input type="number" placeholder="Цена" value={editingProduct ? editingProduct.price : newProduct.price} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, price: e.target.value}) : setNewProduct({...newProduct, price: e.target.value})} style={styles.input} required />
              <input type="text" placeholder="Описание" value={editingProduct ? editingProduct.description : newProduct.description} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})} style={styles.input} />
              <select value={editingProduct ? editingProduct.category : newProduct.category} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})} style={styles.select}>
                <option value="букеты">Букеты</option>
                <option value="розы">Розы</option>
                <option value="подарки">Подарки</option>
              </select>
              <button type="submit" style={styles.primaryButton}>{editingProduct ? '💾 Сохранить' : '➕ Добавить'}</button>
              {editingProduct && <button onClick={() => setEditingProduct(null)} style={styles.deleteButton}>❌ Отмена</button>}
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
                      <button onClick={() => deleteProduct(product.id)} style={styles.deleteButton}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============ ПОЛЬЗОВАТЕЛИ ============ */}
      {adminTab === 'users' && (
        <div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>{editingUser ? '✏️ Редактировать пользователя' : '➕ Добавить пользователя'}</h3>
            <form onSubmit={editingUser ? (e) => { e.preventDefault(); updateUser(); } : addUser} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="text" placeholder="Имя *" value={editingUser ? editingUser.fullName : newUser.fullName} onChange={(e) => editingUser ? setEditingUser({...editingUser, fullName: e.target.value}) : setNewUser({...newUser, fullName: e.target.value})} style={styles.input} required />
              <input type="email" placeholder="Email *" value={editingUser ? editingUser.email : newUser.email} onChange={(e) => editingUser ? setEditingUser({...editingUser, email: e.target.value}) : setNewUser({...newUser, email: e.target.value})} style={styles.input} required />
              <input type="tel" placeholder="Телефон" value={editingUser ? editingUser.phone : newUser.phone} onChange={(e) => editingUser ? setEditingUser({...editingUser, phone: e.target.value}) : setNewUser({...newUser, phone: e.target.value})} style={styles.input} />
              {!editingUser && <input type="password" placeholder="Пароль *" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} style={styles.input} required />}
              {editingUser && <input type="password" placeholder="Новый пароль (оставьте пустым)" value={editingUser.password || ''} onChange={(e) => setEditingUser({...editingUser, password: e.target.value})} style={styles.input} />}
              <select value={editingUser ? editingUser.role : newUser.role} onChange={(e) => editingUser ? setEditingUser({...editingUser, role: e.target.value}) : setNewUser({...newUser, role: e.target.value})} style={styles.select}>
                <option value="Customer">Покупатель</option>
                <option value="Courier">Курьер</option>
                <option value="Florist">Флорист</option>
                <option value="Admin">Администратор</option>
              </select>
              <button type="submit" style={styles.primaryButton}>{editingUser ? '💾 Сохранить' : '➕ Добавить'}</button>
              {editingUser && <button onClick={() => setEditingUser(null)} style={styles.deleteButton}>❌ Отмена</button>}
            </form>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Имя</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Телефон</th>
                  <th style={styles.th}>Роль</th>
                  <th style={styles.th}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(user => (
                  <tr key={user.id}>
                    <td style={styles.td}>{user.id}</td>
                    <td style={styles.td}><strong>{user.fullName}</strong></td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>{user.phone || '-'}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.roleBadge, ...getRoleBadgeStyle(user.role) }}>
                        {getRoleName(user.role)}
                      </span>
                    </td>
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

      {/* ============ МОДАЛЬНОЕ ОКНО СОЗДАНИЯ ЗАКАЗА ============ */}
      {showCreateOrder && (
        <>
          <div style={styles.modalOverlay} onClick={() => setShowCreateOrder(false)} />
          <div style={styles.modal}>
            <h3>➕ Создание нового заказа</h3>
            <form onSubmit={createOrder}>
              <div>
                <label>Клиент *:</label>
                <input type="text" value={newOrder.customerName} onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})} style={styles.input} required />
              </div>
              <div>
                <label>Телефон *:</label>
                <input type="text" value={newOrder.phone} onChange={(e) => setNewOrder({...newOrder, phone: e.target.value})} style={styles.input} required />
              </div>
              <div>
                <label>Адрес *:</label>
                <input type="text" value={newOrder.address} onChange={(e) => setNewOrder({...newOrder, address: e.target.value})} style={styles.input} required />
              </div>
              <div>
                <label>Время доставки:</label>
                <input type="text" placeholder="2024-05-20 15:00" value={newOrder.deliveryTime} onChange={(e) => setNewOrder({...newOrder, deliveryTime: e.target.value})} style={styles.input} />
              </div>
              <div>
                <label>Комментарий:</label>
                <textarea value={newOrder.comment} onChange={(e) => setNewOrder({...newOrder, comment: e.target.value})} style={styles.textarea} rows="2" />
              </div>
              
              <h4>Товары в заказе:</h4>
              {newOrder.items.map((item, index) => (
                <div key={index} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0', borderRadius: '8px' }}>
                  <select 
                    value={item.productId} 
                    onChange={(e) => updateOrderItem(index, 'productId', e.target.value)} 
                    style={styles.select} 
                    required
                  >
                    <option value="">Выберите товар</option>
                    {allProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ₽{p.price}</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    placeholder="Кол-во" 
                    value={item.quantity} 
                    onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)} 
                    style={styles.input} 
                    min="1" 
                    required 
                  />
                  <button type="button" onClick={() => removeOrderItem(index)} style={styles.deleteButton}>Удалить</button>
                </div>
              ))}
              
              <button type="button" onClick={addOrderItem} style={styles.primaryButton}>➕ Добавить товар</button>
              
              <div style={{ marginTop: '20px' }}>
                <button type="submit" style={styles.successButton}>✅ Создать заказ</button>
                <button type="button" onClick={() => setShowCreateOrder(false)} style={styles.deleteButton}>❌ Отмена</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ============ МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ЗАКАЗА ============ */}
      {editingOrder && (
        <>
          <div style={styles.modalOverlay} onClick={() => setEditingOrder(null)} />
          <div style={styles.modal}>
            <h3>✏️ Редактирование заказа #{editingOrder.id}</h3>
            <form onSubmit={(e) => { e.preventDefault(); updateOrder(); }}>
              <div>
                <label>Клиент:</label>
                <input type="text" value={editingOrder.customerName} onChange={(e) => setEditingOrder({...editingOrder, customerName: e.target.value})} style={styles.input} required />
              </div>
              <div>
                <label>Телефон:</label>
                <input type="text" value={editingOrder.phone} onChange={(e) => setEditingOrder({...editingOrder, phone: e.target.value})} style={styles.input} required />
              </div>
              <div>
                <label>Адрес:</label>
                <input type="text" value={editingOrder.address} onChange={(e) => setEditingOrder({...editingOrder, address: e.target.value})} style={styles.input} required />
              </div>
              <div>
                <label>Время доставки:</label>
                <input type="text" value={editingOrder.deliveryTime} onChange={(e) => setEditingOrder({...editingOrder, deliveryTime: e.target.value})} style={styles.input} />
              </div>
              <div>
                <label>Статус:</label>
                <select value={editingOrder.status} onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value})} style={styles.select}>
                  <option value="New">🆕 Новый</option>
                  <option value="Assembling">🔧 Сборка</option>
                  <option value="Ready">✅ Готов</option>
                  <option value="Delivering">🚚 Доставка</option>
                  <option value="Completed">🎉 Выполнен</option>
                  <option value="Cancelled">❌ Отменен</option>
                </select>
              </div>
              <div>
                <label>Комментарий:</label>
                <textarea value={editingOrder.comment || ''} onChange={(e) => setEditingOrder({...editingOrder, comment: e.target.value})} style={styles.textarea} rows="2" />
              </div>
              
              <h4>Товары в заказе:</h4>
              {editingOrder.items?.map((item, index) => (
                <div key={index} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0', borderRadius: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Название товара" 
                    value={item.productName} 
                    onChange={(e) => editOrderItem(index, 'productName', e.target.value)} 
                    style={styles.input} 
                    required 
                  />
                  <input 
                    type="number" 
                    placeholder="Кол-во" 
                    value={item.quantity} 
                    onChange={(e) => editOrderItem(index, 'quantity', e.target.value)} 
                    style={styles.input} 
                    min="1" 
                    required 
                  />
                  <input 
                    type="number" 
                    placeholder="Цена" 
                    value={item.price} 
                    onChange={(e) => editOrderItem(index, 'price', e.target.value)} 
                    style={styles.input} 
                    required 
                  />
                  <button type="button" onClick={() => removeEditOrderItem(index)} style={styles.deleteButton}>Удалить</button>
                </div>
              ))}
              
              <button type="button" onClick={addEditOrderItem} style={styles.primaryButton}>➕ Добавить товар</button>
              
              <div style={{ marginTop: '20px' }}>
                <button type="submit" style={styles.successButton}>💾 Сохранить изменения</button>
                <button type="button" onClick={() => setEditingOrder(null)} style={styles.deleteButton}>❌ Отмена</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;