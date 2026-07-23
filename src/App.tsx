import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import DynamicBoard from './pages/DynamicBoard'
import Login from './pages/Login'
import Admin from './pages/Admin'
import './App.css'

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* 独立页面 */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />

        {/* 主界面布局框架 */}
        <Route path="/" element={<Layout />}>
          {/* 默认重定向到第一个菜单 */}
          <Route index element={<Navigate to="/postgres-rtree" replace />} />
          
          {/* 通配子路由：匹配所有动态添加的导航菜单 Path */}
          <Route path="*" element={<DynamicBoard />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
