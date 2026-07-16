import { useState, useEffect } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'

export default function PostgresRTree() {
  const [activeFile, setActiveFile] = useState<string>('ya_river_page0.excalidraw')
  const [initialData, setInitialData] = useState<any>(null)

  useEffect(() => {
    // Clear initial data while loading to show loading text
    setInitialData(null)
    
    fetch(`excalidraw/${activeFile}`)
      .then((res) => res.json())
      .then((data) => {
        const initial: any = { elements: data.elements };
        if (data.appState) initial.appState = data.appState;
        if (data.files) initial.files = data.files;
        setInitialData(initial);
      })
      .catch((err) => console.error('Failed to load excalidraw file:', err))
  }, [activeFile])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* 顶部标签切换栏 */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        padding: '12px 24px', 
        background: '#f8f9fa', 
        borderBottom: '1px solid #e5e7eb',
        zIndex: 100,
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => setActiveFile('ya_river_page0.excalidraw')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            backgroundColor: activeFile === 'ya_river_page0.excalidraw' ? '#4f46e5' : '#e5e7eb',
            color: activeFile === 'ya_river_page0.excalidraw' ? '#ffffff' : '#374151',
            fontWeight: activeFile === 'ya_river_page0.excalidraw' ? 'bold' : 'normal',
            transition: 'background-color 0.2s'
          }}
        >
          Ya River Page 0
        </button>
        <button 
          onClick={() => setActiveFile('ya_river_page1.excalidraw')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            backgroundColor: activeFile === 'ya_river_page1.excalidraw' ? '#4f46e5' : '#e5e7eb',
            color: activeFile === 'ya_river_page1.excalidraw' ? '#ffffff' : '#374151',
            fontWeight: activeFile === 'ya_river_page1.excalidraw' ? 'bold' : 'normal',
            transition: 'background-color 0.2s'
          }}
        >
          Ya River Page 1
        </button>
      </div>

      {/* 画布容器 */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {initialData ? (
            <Excalidraw 
              key={activeFile} /* 强制 React 在文件切换时重新挂载画布 */
              initialData={initialData} 
              viewModeEnabled={true} 
              zenModeEnabled={true}
            />
          ) : (
            <p style={{ marginTop: '2rem', textAlign: 'center' }}>Loading Excalidraw...</p>
          )}
        </div>
      </div>
    </div>
  )
}
