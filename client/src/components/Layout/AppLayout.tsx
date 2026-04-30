import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import MobileNavigation from './MobileNavigation'

/**
 * 主布局组件
 * 负责承载全站绘本化背景、主内容容器与响应式导航
 */
const AppLayout = () => {
  const location = useLocation()
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className={`fairy-page flex min-h-screen flex-col ${isAuthRoute ? 'fairy-auth-shell' : ''}`}>
      <div className="fairy-bg">
        <div className="fairy-orb left-[-5rem] top-12 h-52 w-52 bg-[#ffe7c8]" />
        <div className="fairy-orb right-[-4rem] top-28 h-64 w-64 bg-[#eee0ff]" />
        <div className="fairy-orb bottom-16 left-1/3 h-44 w-44 bg-[#ffdfe9]" />
        <div className="fairy-cloud left-[10%] top-[20%] h-16 w-40" />
        <div className="fairy-cloud right-[12%] top-[38%] h-20 w-52" />
      </div>

      <Header isAuthRoute={isAuthRoute} />

      <main className={`relative z-10 flex-1 ${isAuthRoute ? 'pb-0' : 'pb-20 md:pb-0'}`}>
        <Outlet />
      </main>

      <div className="hidden md:block">
        <Footer isAuthRoute={isAuthRoute} />
      </div>

      <MobileNavigation isAuthRoute={isAuthRoute} />
    </div>
  )
}

export default AppLayout
