import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  const navItems = [
    { name: 'POSTGRES_R树', path: '/postgres-rtree' },
    { name: 'QGIS_四叉树', path: '/qgis-quadtree' },
    { name: 'GEOSERVER_四叉树', path: '/geoserver-quadtree' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* 左侧导航栏 */}
      <div style={{
        width: '240px',
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #334155'
      }}>
        <div style={{
          padding: '24px 20px',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          borderBottom: '1px solid #334155',
          letterSpacing: '0.05em'
        }}>
          空间算法-数据结构
        </div>

        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'block',
                padding: '12px 20px',
                color: isActive ? '#38bdf8' : '#cbd5e1',
                backgroundColor: isActive ? '#0f172a' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? '600' : '400',
                borderLeft: `4px solid ${isActive ? '#38bdf8' : 'transparent'}`,
                transition: 'all 0.2s ease-in-out'
              })}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* 底部上传按钮 */}
        <div style={{ padding: '20px', borderTop: '1px solid #334155' }}>
          <input 
            type="file" 
            id="excalidraw-file-input"
            accept=".excalidraw"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = async (event) => {
                try {
                  const content = event.target?.result as string;
                  const data = JSON.parse(content);
                  
                  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
                  const url = `${baseUrl}/get_geo_pg/excalidraw/upload`;
                  
                  // 提取当前路由名称作为分类（去掉开头的 /）
                  const currentType = window.location.hash.replace(/^#\//, '') || 'postgres-rtree';
                  
                  // 去掉后缀名作为 boardName
                  const boardName = file.name.replace(/\.excalidraw$/i, '');
                  
                  const payload = {
                    boardName: boardName,
                    dataStructuresType: currentType,
                    elements: JSON.stringify(data.elements || []),
                    appState: JSON.stringify(data.appState || {}),
                    files: JSON.stringify(data.files || {})
                  };

                  console.log(`正在上传文件 ${file.name}...`, payload);
                  
                  const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  });
                  
                  if (response.ok) {
                    const resJson = await response.json();
                    if (resJson.code === 200 || resJson.success || resJson.message === 'success' || resJson.data === true) {
                      alert(`文件 ${file.name} 上传成功！`);
                    } else {
                      alert(`上传失败: ${resJson.message || '未知错误'}`);
                    }
                  } else {
                    alert(`请求失败: ${response.status} ${response.statusText}`);
                  }
                } catch (error) {
                  console.error('文件读取或上传错误:', error);
                  alert('处理文件时出错，可能是文件格式不正确或网络问题。');
                } finally {
                  // 清空 input 的值，以便下次还能选中同一个文件
                  e.target.value = '';
                }
              };
              reader.readAsText(file);
            }}
          />
          <button
            onClick={() => {
              document.getElementById('excalidraw-file-input')?.click();
            }}
            style={{
              width: '100%',
              padding: '10px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            上传到数据库
          </button>
        </div>
      </div>

      {/* 右侧主内容区 */}
      <div style={{ flex: 1, backgroundColor: '#ffffff', position: 'relative' }}>
        <Outlet />
      </div>
    </div>
  )
}
