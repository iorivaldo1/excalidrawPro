import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'

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

  // 1. 初始化时，从数据库拉取当前路由类别下的所有画板
  useEffect(() => {
    // 提取当前路由名称作为分类（去掉开头的 /）
    const currentType = location.pathname.replace(/^\//, '') || 'postgres-rtree';
    const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
    const listUrl = `${baseUrl}/get_geo_pg/excalidraw/listByType?type=${currentType}`
    
    // 切换左侧导航栏时，先清空选中的文件，以确保画布刷新并重新拉取新分类的默认第一个文件
    setActiveFile('');

    fetch(listUrl)
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.code === 200 && resJson.data && resJson.data.length > 0) {
          setBoards(resJson.data);
          // 选中第一个
          setActiveFile(resJson.data[0].boardName);
        } else {
          setBoards([]);
          // 如果数据库里这个类别没有画板，给一个默认的空画板
          setActiveFile('default_blank_board');
        }
      })
      .catch((err) => {
        console.error('拉取画板列表失败:', err);
      });
  }, [location.pathname]); // 当路由变化时重新拉取

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
          
          // 完全不传入后端的 appState，强制 Excalidraw 使用全新的默认视图状态（这样工具栏一定会按默认展示）
          const initial: any = { elements, files };
          setInitialData(initial);
          boardDataRef.current = initial;
          
          isInitialLoadRef.current = true;
          setHasChanged(false);
          prevElementsRef.current = elements;
          // 由于去掉了 appState 的覆盖，这里记录一个默认空字符串，如果发生背景变色，后续也能被 onChange 捕获
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

  // 保存数据到服务器
  const handleSave = async () => {
    if (!activeFile || activeFile === 'default_blank_board') {
      alert('当前无法保存默认空画板，请先创建或选择有效画板');
      return;
    }

    if (!boardDataRef.current) {
      alert('没有需要保存的数据');
      return;
    }

    const pwd = window.prompt('请输入保存密码：');
    if (pwd !== 'aa00aa') {
      return;
    }

    setIsUploading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const currentType = location.pathname.replace(/^\//, '') || 'postgres-rtree';
      
      const payload = {
        boardName: activeFile,
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
      if (resJson.code === 200) {
        alert('保存成功');
        setHasChanged(false); // 保存成功后隐藏保存按钮
      } else {
        alert(`保存失败: ${resJson.msg || '未知错误'}`);
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
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          {boards.length > 0 ? (
            boards.map((board) => (
              <button 
                key={board.id}
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
              当前分类下暂无上传的画板数据
            </div>
          )}
        </div>

        {/* 保存按钮 */}
        {hasChanged && (
          <div>
            <button 
              onClick={handleSave}
              disabled={isUploading || activeFile === 'default_blank_board'}
              style={{
                padding: '8px 24px',
                backgroundColor: (isUploading || activeFile === 'default_blank_board') ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (isUploading || activeFile === 'default_blank_board') ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                transition: 'background-color 0.2s'
              }}
            >
              {isUploading ? '保存中...' : '保存修改'}
            </button>
          </div>
        )}
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
