import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

export interface NavItem {
  id?: number;
  name: string;
  path: string;
  dataStructuresType: string;
  sortOrder?: number;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { name: 'POSTGRES_R树', path: '/postgres-rtree', dataStructuresType: 'postgres-rtree' },
  { name: 'QGIS_四叉树', path: '/qgis-quadtree', dataStructuresType: 'qgis-quadtree' },
  { name: 'GEOSERVER_四叉树', path: '/geoserver-quadtree', dataStructuresType: 'geoserver-quadtree' },
  { name: 'ESRI_KD树', path: '/esri-kdtree', dataStructuresType: 'esri-kdtree' },
];

export default function Layout() {
  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_NAV_ITEMS);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNavList = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${baseUrl}/get_geo_pg/excalidraw/nav/list`);
        const resJson = await res.json();
        if (resJson.code === 200 && resJson.data && resJson.data.length > 0) {
          setNavItems(resJson.data);
        }
      } catch (err) {
        console.error('获取动态导航数据失败，回退到默认导航:', err);
      }
    };

    fetchNavList();
  }, []);

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
        <div 
          onClick={() => navigate('/')}
          style={{
            padding: '24px 20px',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            borderBottom: '1px solid #334155',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            color: '#38bdf8'
          }}
        >
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

        {/* 底部管理后台入口 */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #334155' }}>
          <NavLink
            to="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: '#0f172a',
              transition: 'color 0.2s',
            }}
          >
            <span>⚙️</span> 管理后台
          </NavLink>
        </div>
      </div>

      {/* 右侧主内容区 */}
      <div style={{ flex: 1, backgroundColor: '#ffffff', position: 'relative' }}>
        <Outlet context={{ navItems }} />
      </div>
    </div>
  )
}
