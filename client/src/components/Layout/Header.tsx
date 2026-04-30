import { Link, useLocation } from 'react-router-dom'

interface HeaderProps {
  isAuthRoute?: boolean
}

/**
 * 顶部导航栏组件
 * 负责展示品牌、当前主导航高亮与跨端入口
 */
const Header = ({ isAuthRoute = false }: HeaderProps) => {
  const location = useLocation()

  /** 桌面端主导航链接 */
  const navLinks = [
    { to: '/', label: '首页' },
    { to: '/dashboard', label: '仪表盘' },
    { to: '/create-story', label: '创建故事' },
    { to: '/stories', label: '故事库' },
    { to: '/community', label: '社区' },
  ]

  /**
   * 判断导航项是否处于当前激活状态
   */
  const isActiveLink = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <header
      className="sticky top-0 z-50 px-3 pt-3 sm:px-4"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="fairy-topbar">
        <Link className="flex shrink-0 items-center gap-3" to="/">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff1dc] text-lg shadow-sm">
            书
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-bold text-[#6d4c41]">小主人童话</span>
            <span className="block text-xs text-[#9f8b80]">专属睡前故事工坊</span>
          </span>
        </Link>

        {!isAuthRoute ? (
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`fairy-nav-link ${isActiveLink(link.to) ? 'fairy-nav-link-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : (
          <div className="hidden lg:block text-sm font-medium text-[#9f8b80]">安静开始今晚的故事旅程</div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthRoute ? (
            <Link className="btn-outline text-xs sm:text-sm !px-3 !py-2 sm:!px-4" to="/">
              返回首页
            </Link>
          ) : (
            <>
              <Link className="btn-secondary text-xs sm:text-sm !px-3 !py-2 sm:!px-4" to="/kids">
                儿童端
              </Link>
              <Link
                to="/profile"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4ebff] text-[#7b57c8] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <span className="text-sm font-semibold">我</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
