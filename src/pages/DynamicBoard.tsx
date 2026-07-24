import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import type { NavItem } from '../components/Layout'

interface OutletContextType {
  navItems?: NavItem[];
}

export default function DynamicBoard() {
  // 动态画板列表
  const [boards, setBoards] = useState<any[]>([])
  // 当前选中的画板名
  const [activeFile, setActiveFile] = useState<string>('')
  // 画板初始数据
  const [initialData, setInitialData] = useState<any>(null)

  // 引用，用于保存最新的画板数据，避免每次改变都引起组件重绘
  const boardDataRef = useRef<any>(null)
  // 用于防重复提交的状态
  const [isUploading, setIsUploading] = useState<boolean>(false)
  // 记录画布是否有实际修改
  const [hasChanged, setHasChanged] = useState<boolean>(false)
  const isInitialLoadRef = useRef<boolean>(true)
  const prevElementsRef = useRef<any>(null)
  const prevBgColorRef = useRef<string>('')

  const location = useLocation()
  const navigate = useNavigate()
  const { navItems } = (useOutletContext<OutletContextType>() || {})

  // 动态获取当前路由对应的 dataStructuresType
  const getCurrentType = useCallback((): string => {
    const rawPath = location.pathname;
    const normalizedPath = rawPath.startsWith('/') ? rawPath : '/' + rawPath;

    if (navItems && navItems.length > 0) {
      const found = navItems.find((item) => {
        const itemPath = item.path.startsWith('/') ? item.path : '/' + item.path;
        return itemPath.toLowerCase() === normalizedPath.toLowerCase();
      });
      if (found && found.dataStructuresType) {
        return found.dataStructuresType;
      }
    }

    // 回退处理
    const cleanPath = normalizedPath.replace(/^\//, '').toLowerCase();
    return cleanPath || 'postgres-rtree';
  }, [location.pathname, navItems]);

  // 辅助函数：从数据库拉取当前分类的画板列表
  const fetchBoardList = useCallback(async (targetType: string, autoSelectBoardName?: string) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
    const listUrl = `${baseUrl}/get_geo_pg/excalidraw/listByType?type=${targetType}`

    try {
      const res = await fetch(listUrl);
      const resJson = await res.json();
      if (resJson.code === 200 && resJson.data && resJson.data.length > 0) {
        setBoards(resJson.data);
        if (autoSelectBoardName) {
          setActiveFile(autoSelectBoardName);
        } else {
          setActiveFile(resJson.data[0].boardName);
        }
      } else {
        setBoards([]);
        setActiveFile('default_blank_board');
      }
    } catch (err) {
      console.error('拉取画板列表失败?:', err);
      setBoards([]);
      setActiveFile('default_blank_board');
    }
  }, []);

  // 1. 初始化或路由/导航变化时，自动匹配分类 type 并拉取画板列表
  useEffect(() => {
    const currentType = getCurrentType();
    setActiveFile('');
    fetchBoardList(currentType);
  }, [getCurrentType, fetchBoardList]);

  // 2. 当选中的 activeFile 改变时，从数据库拉取具体画板的数据
  useEffect(() => {
    if (!activeFile) return;

    // 清空画布显示 Loading
    setInitialData(null)
    boardDataRef.current = null

    if (activeFile === 'default_blank_board') {
      const initial = {
        elements: [],
        files: {}
      };
      setInitialData(initial);
      boardDataRef.current = initial;
      isInitialLoadRef.current = true;
      setHasChanged(false);
      prevElementsRef.current = initial.elements;
      prevBgColorRef.current = '';
      return;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
    const url = `${baseUrl}/get_geo_pg/excalidraw/getByBoardName?boardName=${activeFile}`

    fetch(url)
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.code === 200 && resJson.data) {
          const dbData = resJson.data;
          // parse 还原对象
          const elements = dbData.elements ? JSON.parse(dbData.elements) : [];
          const files = dbData.files ? JSON.parse(dbData.files) : {};

          // 完全不传入后端的 appState，强制 Excalidraw 使用全新的默认视图状态
          const initial: any = { elements, files };
          setInitialData(initial);
          boardDataRef.current = initial;

          isInitialLoadRef.current = true;
          setHasChanged(false);
          prevElementsRef.current = elements;
          prevBgColorRef.current = '';
        } else {
          setInitialData({ elements: [], appState: {}, files: {} });
        }
      })
      .catch((err) => {
        console.error('从数据库拉取画板数据失败:', err);
        setInitialData({ elements: [], appState: {}, files: {} });
        isInitialLoadRef.current = true;
        setHasChanged(false);
      })
  }, [activeFile])

  // 新建画板
  const handleCreateNew = () => {
    setActiveFile('default_blank_board');
  };

  // 保存数据到服务器
  const handleSave = async () => {
    if (!boardDataRef.current) {
      alert('没有需要保存的数据');
      return;
    }

    let saveBoardName = activeFile;
    if (!saveBoardName || saveBoardName === 'default_blank_board') {
      const inputName = window.prompt('请输入画板名称：');
      if (!inputName || !inputName.trim()) {
        return;
      }
      saveBoardName = inputName.trim();
    }

    // 检查是否已以 admin 身份登录
    const token = sessionStorage.getItem('excalidraw_token');
    const role = sessionStorage.getItem('excalidraw_role');

    if (!token || (role && role !== 'admin')) {
      const goLogin = window.confirm('当前未检测到管理员登录状态，保存画板修改需要管理员权限。是否立即前往登录管理账号？');
      if (goLogin) {
        navigate('/login');
      }
      return;
    }

    setIsUploading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      // 根据动态匹配的 currentType 提交保存
      const currentType = getCurrentType();

      const payload = {
        boardName: saveBoardName,
        dataStructuresType: currentType,
        elements: JSON.stringify(boardDataRef.current.elements || []),
        appState: JSON.stringify(boardDataRef.current.appState || {}),
        files: JSON.stringify(boardDataRef.current.files || {})
      };

      const res = await fetch(`${baseUrl}/get_geo_pg/excalidraw/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resJson = await res.json();
      if (resJson.code === 200 || resJson.success || resJson.message === 'success' || resJson.data === true) {
        alert('保存成功');
        setHasChanged(false);
        // 刷新画板列表并自动选中当前画板
        fetchBoardList(currentType, saveBoardName);
      } else {
        alert(`保存失败: ${resJson.msg || resJson.message || '未知错误'}`);
      }
    } catch (err) {
      console.error('保存报错:', err);
      alert('保存出错，请检查网络');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* 动态顶部标签切换栏 */}
      <div style={{
        display: 'flex',
        padding: '12px 24px',
        background: '#f8f9fa',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 100,
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
          {boards.length > 0 ? (
            boards.map((board) => (
              <button
                key={board.id || board.boardName}
                onClick={() => setActiveFile(board.boardName)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: activeFile === board.boardName ? '#4f46e5' : '#e5e7eb',
                  color: activeFile === board.boardName ? '#ffffff' : '#374151',
                  fontWeight: activeFile === board.boardName ? 'bold' : 'normal',
                  transition: 'background-color 0.2s'
                }}
              >
                {board.boardName}
              </button>
            ))
          ) : (
            <div style={{ color: '#6b7280', fontSize: '0.9rem', padding: '8px 0' }}>
              当前分类 [{getCurrentType()}] 下暂无画板数据
            </div>
          )}

          {/* 新建画板按钮 */}
          <button
            onClick={handleCreateNew}
            style={{
              padding: '8px 14px',
              border: '1px dashed #4f46e5',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: activeFile === 'default_blank_board' ? '#e0e7ff' : 'transparent',
              color: '#4f46e5',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}
          >
            + 新建画板
          </button>
        </div>

        {/* 保存按钮 */}
        <div>
          <button
            onClick={handleSave}
            disabled={isUploading}
            style={{
              padding: '8px 24px',
              backgroundColor: isUploading ? '#9ca3af' : hasChanged ? '#10b981' : '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s ease-in-out',
              boxShadow: hasChanged ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none'
            }}
          >
            {isUploading ? '保存中...' : '保存修改'}
          </button>
        </div>
      </div>

      {/* 画布容器 */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {initialData ? (
            <Excalidraw
              key={activeFile}
              initialData={initialData}
              onChange={(elements, appState, files) => {
                boardDataRef.current = { elements, appState, files }

                if (isInitialLoadRef.current) {
                  isInitialLoadRef.current = false;
                  prevElementsRef.current = elements;
                  prevBgColorRef.current = appState.viewBackgroundColor;
                  return;
                }

                // 判断是否是真正的修改：元素发生变化，或者画布背景色发生变化
                if (
                  elements !== prevElementsRef.current ||
                  appState.viewBackgroundColor !== prevBgColorRef.current
                ) {
                  prevElementsRef.current = elements;
                  prevBgColorRef.current = appState.viewBackgroundColor;
                  if (!hasChanged) {
                    setHasChanged(true);
                  }
                }
              }}
            />
          ) : (
            <p style={{ marginTop: '2rem', textAlign: 'center' }}>从数据库加载数据中...</p>
          )}
        </div>
      </div>
    </div>
  )
}
