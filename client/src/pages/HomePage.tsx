import { Link } from 'react-router-dom'

/**
 * 首页 - 应用入口页面
 * 展示平台简介、特色功能入口
 */
const HomePage = () => {
  const quickActions = [
    {
      title: '创建故事',
      description: '根据孩子的特点，生成专属童话',
      to: '/create-story',
    },
    {
      title: '故事库',
      description: '浏览和收藏精彩的童话故事',
      to: '/stories',
    },
    {
      title: '社区分享',
      description: '与其他家长分享育儿故事',
      to: '/community',
    },
  ]

  return (
    <div className="page-container text-center">
      <h1 className="page-title">欢迎来到童话故事平台</h1>
      <p className="text-xl text-amber-700 mb-8">为孩子创造独一无二的童话故事</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {quickActions.map((action) => (
          <Link
            className="story-card block p-6 transition-transform duration-200 hover:-translate-y-1 hover:text-inherit focus:outline-none focus:ring-2 focus:ring-amber-300"
            key={action.to}
            to={action.to}
          >
            <h3 className="text-lg font-bold text-purple-700 mb-2">{action.title}</h3>
            <p className="text-gray-600">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default HomePage
