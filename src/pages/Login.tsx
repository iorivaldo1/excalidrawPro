import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim() || !password.trim()) {
      setErrorMsg('请输入用户名和密码');
      return;
    }

    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/get_geo_pg/excalidraw/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const result = await response.json();
      if (result.code === 200 && result.data && result.data.token) {
        localStorage.setItem('excalidraw_token', result.data.token);
        localStorage.setItem('excalidraw_user', result.data.userName || username);
        localStorage.setItem('excalidraw_role', result.data.role || 'admin');
        navigate('/admin');
      } else {
        setErrorMsg(result.msg || result.message || '用户名或密码错误');
      }
    } catch (err) {
      console.error('登录请求失败:', err);
      setErrorMsg('网络连接错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#0f172a',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#f8fafc',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        border: '1px solid #334155',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#38bdf8', marginBottom: '8px' }}>
            管理后台登录
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            Excalidraw 空间算法导航管理系统
          </p>
        </div>

        {errorMsg && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#f87171',
            fontSize: '0.875rem',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '8px' }}>
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入管理员账号"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '8px' }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '12px 20px',
              backgroundColor: loading ? '#0284c7' : '#0ea5e9',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'wait' : 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.3)',
            }}
          >
            {loading ? '正在登录...' : '登 录'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textDecoration: 'underline',
            }}
          >
            ← 返回主页
          </button>
        </div>
      </div>
    </div>
  );
}
