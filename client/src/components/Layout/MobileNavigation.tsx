import { Link, useLocation } from 'react-router-dom'

/**
 * 底部导航栏 - 移动端专用底部固定导航
 * 包含 5 个主要导航入口，支持当前路由高亮
 * 适配 iPhone 底部安全区域 (safe-area-inset-bottom)
 */
const MobileNavigation = () => {
  const location = useLocation()

  /** 移动端导航项配置 */
  const navItems = [
    { to: '/', label: '首页', icon: '🏠' },
    { to: '/dashboard', label: '仪表盘', icon: '📊' },
    { to: '/create-story', label: '创作', icon: '✏️' },
    { to: '/stories', label: '故事', icon: '📖' },
    { to: '/kids', label: '儿童', icon: '🧒' },
  ]

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-amber-200 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 transition-colors active:scale-90 ${
                isActive ? 'text-amber-600' : 'text-gray-500 hover:text-amber-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNavigation
