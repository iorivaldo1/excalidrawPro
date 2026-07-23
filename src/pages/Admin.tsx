import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavItem {
  id?: number;
  name: string;
  path: string;
  dataStructuresType: string;
  sortOrder: number;
}

export default function Admin() {
  const [navList, setNavList] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 弹窗表单状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [formData, setFormData] = useState<NavItem>({
    name: '',
    path: '',
    dataStructuresType: '',
    sortOrder: 0,
  });

  const navigate = useNavigate();
  const userName = localStorage.getItem('excalidraw_user') || '管理员';

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('excalidraw_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // 拉取导航数据
  const fetchNavList = useCallback(async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/get_geo_pg/excalidraw/nav/list`);
      const json = await res.json();
      if (json.code === 200 && json.data) {
        setNavList(json.data);
      }
    } catch (err) {
      console.error('获取导航列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNavList();
  }, [fetchNavList]);

  // 处理退出登录
  const handleLogout = () => {
    localStorage.removeItem('excalidraw_token');
    localStorage.removeItem('excalidraw_user');
    navigate('/login');
  };

  // 打开新增弹窗
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      path: '/',
      dataStructuresType: '',
      sortOrder: (navList.length + 1) * 10,
    });
    setIsModalOpen(true);
  };

  // 打开编辑弹窗
  const handleOpenEditModal = (item: NavItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  // 提交表单 (新增或修改)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.path.trim() || !formData.dataStructuresType.trim()) {
      alert('请完整填写菜单名称、路由路径和数据结构分类标识！');
      return;
    }

    // 格式化 path (确保以 / 开头)
    let formattedPath = formData.path.trim();
    if (!formattedPath.startsWith('/')) {
      formattedPath = '/' + formattedPath;
    }

    const payload = {
      ...formData,
      path: formattedPath,
    };

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const isEdit = !!editingItem;
      const url = `${baseUrl}/get_geo_pg/excalidraw/nav/${isEdit ? 'update' : 'add'}`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();
      if (resJson.code === 200 || resJson.data === true) {
        alert(`${isEdit ? '修改' : '新增'}成功！`);
        setIsModalOpen(false);
        fetchNavList();
      } else {
        alert(`操作失败: ${resJson.msg || resJson.message || '系统错误'}`);
      }
    } catch (err) {
      console.error('保存报错:', err);
      alert('保存失败，请检查网络');
    }
  };

  // 删除导航
  const handleDelete = async (id?: number, name?: string) => {
    if (!id) return;
    if (!window.confirm(`确定要删除导航菜单 [${name}] 吗？`)) {
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/get_geo_pg/excalidraw/nav/delete/${id}`, {
        method: 'DELETE',
      });
      const resJson = await res.json();
      if (resJson.code === 200 || resJson.data === true) {
        alert('删除成功');
        fetchNavList();
      } else {
        alert(`删除失败: ${resJson.msg || resJson.message}`);
      }
    } catch (err) {
      console.error('删除报错:', err);
      alert('删除失败，请检查网络');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* 顶部 Header */}
      <header style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>
            Excalidraw 导航管理后台
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
            当前用户：<strong style={{ color: '#38bdf8' }}>{userName}</strong>
          </span>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#334155',
              color: '#f8fafc',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            返回主界面
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 'bold',
            }}
          >
            退出登录
          </button>
        </div>
      </header>

      {/* 主体内容 */}
      <main style={{ flex: 1, padding: '32px', maxWidth: '1200px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>左侧导航菜单配置</h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '4px' }}>
              在此添加或修改导航项，保存后前端将自动按顺序渲染左侧导航栏。
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.95rem',
              boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
            }}
          >
            + 新增导航菜单
          </button>
        </div>

        {/* 列表表格 */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>加载菜单数据中...</div>
          ) : navList.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>暂无导航菜单数据，请点击右上角新增</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '0.875rem' }}>
                  <th style={{ padding: '16px 20px' }}>ID</th>
                  <th style={{ padding: '16px 20px' }}>菜单名称</th>
                  <th style={{ padding: '16px 20px' }}>路由 Path</th>
                  <th style={{ padding: '16px 20px' }}>数据结构分类 (Type)</th>
                  <th style={{ padding: '16px 20px' }}>排序号</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {navList.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #334155', fontSize: '0.95rem' }}>
                    <td style={{ padding: '16px 20px', color: '#64748b' }}>{item.id}</td>
                    <td style={{ padding: '16px 20px', fontWeight: '600', color: '#f8fafc' }}>{item.name}</td>
                    <td style={{ padding: '16px 20px', color: '#38bdf8', fontFamily: 'monospace' }}>{item.path}</td>
                    <td style={{ padding: '16px 20px', color: '#a7f3d0', fontFamily: 'monospace' }}>{item.dataStructuresType}</td>
                    <td style={{ padding: '16px 20px', color: '#cbd5e1' }}>{item.sortOrder}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          marginRight: '8px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* 新增/编辑 模态框 */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '32px',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            border: '1px solid #334155',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#38bdf8', marginTop: 0, marginBottom: '20px' }}>
              {editingItem ? '编辑导航菜单' : '新增导航菜单'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  菜单名称 (例: POSTGRES_R树)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入菜单展示名称"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  路由 Path (例: /postgres-rtree)
                </label>
                <input
                  type="text"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  placeholder="请输入路由路径"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  数据结构分类标识 Type (例: postgres-rtree)
                </label>
                <input
                  type="text"
                  value={formData.dataStructuresType}
                  onChange={(e) => setFormData({ ...formData, dataStructuresType: e.target.value })}
                  placeholder="请输入数据保存时的 dataStructuresType"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  排序号 (数字越小越靠前)
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#334155',
                    color: '#f8fafc',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
