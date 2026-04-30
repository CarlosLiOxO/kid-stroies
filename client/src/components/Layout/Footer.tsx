import { Link } from 'react-router-dom'

interface FooterProps {
  isAuthRoute?: boolean
}

/**
 * 页脚组件
 * 展示品牌说明与家长端常用入口
 */
const Footer = ({ isAuthRoute = false }: FooterProps) => {
  if (isAuthRoute) {
    return (
      <footer className="fairy-footer mt-auto">
        <div className="mx-auto max-w-4xl px-4 py-6 text-center">
          <p className="fairy-auth-footer">让陪伴变成每晚的故事仪式，从这一次轻轻开始。</p>
        </div>
      </footer>
    )
  }

  return (
    <footer className="fairy-footer mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link className="mb-3 flex items-center gap-3" to="/">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff1dc] text-lg shadow-sm">
                书
              </span>
              <span>
                <span className="block text-lg font-bold text-[#6d4c41]">小主人童话</span>
                <span className="block text-xs text-[#a08c82]">让陪伴变成每晚的故事仪式</span>
              </span>
            </Link>
            <p className="text-sm leading-6 text-[#7f6e63]">用 AI 为每个孩子编织独一无二的睡前故事与温柔插画。</p>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-[#7b57c8]">快速链接</h4>
            <ul className="space-y-2">
              <li><Link className="text-sm text-[#7f6e63] transition-colors hover:text-[#b7773a]" to="/create-story">创建故事</Link></li>
              <li><Link className="text-sm text-[#7f6e63] transition-colors hover:text-[#b7773a]" to="/stories">故事库</Link></li>
              <li><Link className="text-sm text-[#7f6e63] transition-colors hover:text-[#b7773a]" to="/community">社区</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-[#7b57c8]">家长工具</h4>
            <ul className="space-y-2">
              <li><Link className="text-sm text-[#7f6e63] transition-colors hover:text-[#b7773a]" to="/dashboard">仪表盘</Link></li>
              <li><Link className="text-sm text-[#7f6e63] transition-colors hover:text-[#b7773a]" to="/children">孩子管理</Link></li>
              <li><Link className="text-sm text-[#7f6e63] transition-colors hover:text-[#b7773a]" to="/profile">个人中心</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-[#7b57c8]">儿童入口</h4>
            <ul className="space-y-2">
              <li><Link className="text-sm text-[#7f6e63] transition-colors hover:text-[#b7773a]" to="/kids">儿童端</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-white/80 pt-4 text-center">
          <p className="text-sm text-[#ab998e]">&copy; 2026 小主人童话. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
