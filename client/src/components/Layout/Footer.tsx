import { Link } from 'react-router-dom'

/**
 * 页脚组件
 * 显示版权信息、快速链接等
 */
const Footer = () => {
  return (
    <footer className="bg-white border-t border-amber-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* 品牌信息 */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📚</span>
              <span className="text-lg font-bold text-amber-700">童话故事</span>
            </Link>
            <p className="text-sm text-gray-500">
              用 AI 为每个孩子创造独一无二的童话故事
            </p>
          </div>

          {/* 快速链接 */}
          <div>
            <h4 className="font-semibold text-purple-700 mb-3">快速链接</h4>
            <ul className="space-y-2">
              <li><Link to="/create-story" className="text-sm text-gray-600 hover:text-amber-600">创建故事</Link></li>
              <li><Link to="/stories" className="text-sm text-gray-600 hover:text-amber-600">故事库</Link></li>
              <li><Link to="/community" className="text-sm text-gray-600 hover:text-amber-600">社区</Link></li>
            </ul>
          </div>

          {/* 家长工具 */}
          <div>
            <h4 className="font-semibold text-purple-700 mb-3">家长工具</h4>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="text-sm text-gray-600 hover:text-amber-600">仪表盘</Link></li>
              <li><Link to="/children" className="text-sm text-gray-600 hover:text-amber-600">孩子管理</Link></li>
              <li><Link to="/profile" className="text-sm text-gray-600 hover:text-amber-600">个人中心</Link></li>
            </ul>
          </div>

          {/* 儿童入口 */}
          <div>
            <h4 className="font-semibold text-purple-700 mb-3">儿童入口</h4>
            <ul className="space-y-2">
              <li><Link to="/kids" className="text-sm text-gray-600 hover:text-amber-600">儿童端</Link></li>
            </ul>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="border-t border-amber-100 mt-6 pt-4 text-center">
          <p className="text-sm text-gray-400">
            &copy; 2026 童话故事平台. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
