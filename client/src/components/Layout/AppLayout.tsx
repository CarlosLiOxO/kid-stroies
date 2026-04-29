import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import MobileNavigation from './MobileNavigation'

/**
 * 主布局组件
 * 包含 Header、内容区（Outlet）、Footer、移动端底部导航
 * 使用童话主题风格（温馨暖色调）
 */
const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      {/* 顶部导航栏 */}
      <Header />

      {/* 主内容区域 */}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* 桌面端页脚 */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* 移动端底部导航 */}
      <MobileNavigation />
    </div>
  )
}

export default AppLayout
