/**
 * 首页 - 应用入口页面
 * 展示平台简介、特色功能入口
 */
const HomePage = () => {
  return (
    <div className="page-container text-center">
      <h1 className="page-title">欢迎来到童话故事平台</h1>
      <p className="text-xl text-amber-700 mb-8">为孩子创造独一无二的童话故事</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="story-card p-6">
          <h3 className="text-lg font-bold text-purple-700 mb-2">创建故事</h3>
          <p className="text-gray-600">根据孩子的特点，生成专属童话</p>
        </div>
        <div className="story-card p-6">
          <h3 className="text-lg font-bold text-purple-700 mb-2">故事库</h3>
          <p className="text-gray-600">浏览和收藏精彩的童话故事</p>
        </div>
        <div className="story-card p-6">
          <h3 className="text-lg font-bold text-purple-700 mb-2">社区分享</h3>
          <p className="text-gray-600">与其他家长分享育儿故事</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
