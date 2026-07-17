import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import DynamicBoard from './pages/DynamicBoard'
import './App.css'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* 默认重定向到 POSTGRES_R树 */}
          <Route index element={<Navigate to="/postgres-rtree" replace />} />
          
          {/* 子路由 */}
          <Route path="postgres-rtree" element={<DynamicBoard />} />
          <Route path="qgis-quadtree" element={<DynamicBoard />} />
          <Route path="geoserver-quadtree" element={<DynamicBoard />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
