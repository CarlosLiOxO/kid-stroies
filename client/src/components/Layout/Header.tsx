import { Link } from 'react-router-dom'

/**
 * 顶部导航栏组件
 * 移动端自动隐藏导航链接，仅保留品牌标识
 */
const Header = () => {
  /** 桌面端主导航链接 */
  const navLinks = [
    { to: '/', label: '首页' },
    { to: '/dashboard', label: '仪表盘' },
    { to: '/create-story', label: '创建故事' },
    { to: '/stories', label: '故事库' },
    { to: '/community', label: '社区' },
  ]

  return (
    <header
      className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-50"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span className="text-xl sm:text-2xl">📚</span>
          <span className="text-base sm:text-xl font-bold text-amber-700 hidden xs:inline">
            童话故事
          </span>
        </Link>

        {/* 桌面端导航 */}
        <nav className="hidden lg:flex items-center gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-gray-600 hover:text-amber-600 font-medium transition-colors text-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 操作区 */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/kids" className="btn-secondary text-xs sm:text-sm !py-1.5 !px-3 sm:!py-1.5 sm:!px-4">
            儿童端
          </Link>
          <Link
            to="/profile"
            className="w-8 h-8 sm:w-9 sm:h-9 bg-purple-200 rounded-full flex items-center justify-center hover:bg-purple-300 transition-colors shrink-0"
          >
            <span className="text-sm">👤</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
