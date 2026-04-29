import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import AppLayout from './components/Layout/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

/** 页面组件懒加载 import */
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ChildrenPage from './pages/ChildrenPage'
import CreateStoryPage from './pages/CreateStoryPage'
import StoriesPage from './pages/StoriesPage'
import CommunityPage from './pages/CommunityPage'
import ProfilePage from './pages/ProfilePage'
import KidsPage from './pages/KidsPage'
import KidsFavoritesPage from './pages/KidsFavoritesPage'
import StoryDetailPage from './pages/StoryDetailPage'

/**
 * 应用根组件
 * 配置 React Router 路由表，所有页面包裹在主布局中
 * 应用启动时从 localStorage 恢复登录会话
 */
function App() {
  /** 从 store 获取 restoreSession 方法 */
  const restoreSession = useAuthStore((state) => state.restoreSession)

  /**
   * 应用初始化：从 localStorage 恢复之前保存的登录状态
   * 避免用户刷新页面后需要重新登录
   */
  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  return (
    <BrowserRouter>
      <Routes>
        {/* 主布局路由：Header + 内容区 + Footer + 移动端导航 */}
        <Route element={<AppLayout />}>
          {/* 公开路由 - 无需登录即可访问 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/kids" element={<KidsPage />} />
          <Route path="/kids/favorites" element={<KidsFavoritesPage />} />

          {/* 受保护路由 - 需要登录才能访问 */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/children" element={<ChildrenPage />} />
            <Route path="/create-story" element={<CreateStoryPage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/stories/:id" element={<StoryDetailPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
