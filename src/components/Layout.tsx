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
      </div>

      {/* 右侧主内容区 */}
      <div style={{ flex: 1, backgroundColor: '#ffffff', position: 'relative' }}>
        <Outlet />
      </div>
    </div>
  )
}
