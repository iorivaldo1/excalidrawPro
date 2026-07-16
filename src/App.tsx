import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import PostgresRTree from './pages/PostgresRTree'
import QgisQuadTree from './pages/QgisQuadTree'
import GeoserverQuadTree from './pages/GeoserverQuadTree'
import './App.css'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* 默认重定向到 POSTGRES_R树 */}
          <Route index element={<Navigate to="/postgres-rtree" replace />} />
          
          {/* 子路由 */}
          <Route path="postgres-rtree" element={<PostgresRTree />} />
          <Route path="qgis-quadtree" element={<QgisQuadTree />} />
          <Route path="geoserver-quadtree" element={<GeoserverQuadTree />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
