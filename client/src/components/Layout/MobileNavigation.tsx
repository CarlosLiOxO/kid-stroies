import { Link, useLocation } from 'react-router-dom'

interface MobileNavigationProps {
  isAuthRoute?: boolean
}

/**
 * 底部导航栏 - 移动端专用底部固定导航
 * 使用绘本化胶囊高亮展示当前主入口
 */
const MobileNavigation = ({ isAuthRoute = false }: MobileNavigationProps) => {
  const location = useLocation()

  /** 移动端导航项配置 */
  const navItems = [
    { to: '/', label: '首页', icon: '🏠' },
    { to: '/dashboard', label: '仪表盘', icon: '📊' },
    { to: '/create-story', label: '创作', icon: '✏️' },
    { to: '/stories', label: '故事', icon: '📖' },
    { to: '/kids', label: '儿童', icon: '🧒' },
  ]

  if (isAuthRoute) {
    return null
  }

  return (
    <nav
      className="fairy-mobile-nav"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`fairy-mobile-nav-item ${
                isActive ? 'fairy-mobile-nav-item-active' : 'hover:bg-white/70'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNavigation
