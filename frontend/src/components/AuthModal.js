import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+7`;
    if (digits.length <= 4) return `+7 ${digits.slice(1, 4)}`;
    if (digits.length <= 7) return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}`;
    if (digits.length <= 9) return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}`;
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ fullName, email, phone, password });
      }
      onClose();
      setEmail('');
      setPassword('');
      setFullName('');
      setPhone('');
    } catch (error) {
      alert('Ошибка: ' + (error.response?.data?.message || 'Проверьте данные'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const styles = {
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
    modal: { background: 'white', borderRadius: '12px', padding: '30px', width: '400px', maxWidth: '90%' },
    input: { width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
    modalButton: { width: '100%', padding: '12px', background: '#ff69b4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', marginTop: '10px' },
    switchButton: { background: 'none', border: 'none', color: '#ff69b4', cursor: 'pointer', marginTop: '15px', fontSize: '14px' },
    tabButton: { flex: 1, padding: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ textAlign: 'center', color: '#ff69b4' }}>{isLogin ? 'Вход' : 'Регистрация'}</h2>
        
        <div style={{ display: 'flex', marginBottom: '20px' }}>
          <button onClick={() => setIsLogin(true)} style={{ ...styles.tabButton, borderBottom: isLogin ? '2px solid #ff69b4' : 'none', color: isLogin ? '#ff69b4' : '#999' }}>Вход</button>
          <button onClick={() => setIsLogin(false)} style={{ ...styles.tabButton, borderBottom: !isLogin ? '2px solid #ff69b4' : 'none', color: !isLogin ? '#ff69b4' : '#999' }}>Регистрация</button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && <input type="text" placeholder="Ваше имя" value={fullName} onChange={(e) => setFullName(e.target.value)} style={styles.input} required />}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
          {!isLogin && <input type="tel" placeholder="Телефон (+7 XXX XXX-XX-XX)" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} style={styles.input} required />}
          <input type="password" placeholder="Пароль (мин. 6 символов)" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
          <button type="submit" style={styles.modalButton} disabled={loading}>{loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}</button>
        </form>
        
        <button onClick={() => setIsLogin(!isLogin)} style={styles.switchButton}>
          {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </button>
        <button onClick={onClose} style={{ ...styles.switchButton, color: '#999', marginTop: '10px' }}>Закрыть</button>
      </div>
    </div>
  );
};

export default AuthModal;