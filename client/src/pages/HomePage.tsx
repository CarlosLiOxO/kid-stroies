import { Link } from 'react-router-dom'

/**
 * 首页组件
 * 以绘本化首屏承载品牌表达与核心入口
 */
const HomePage = () => {
  const quickActions = [
    {
      title: '创建故事',
      description: '根据孩子的特点，生成专属童话',
      to: '/create-story',
      detail: '把今天的小情绪编成今晚的睡前故事',
      accent: 'fairy-chip-lilac',
      icon: '✨',
    },
    {
      title: '故事库',
      description: '浏览和收藏精彩的童话故事',
      to: '/stories',
      detail: '像翻阅绘本书架一样管理每一次创作',
      accent: 'fairy-chip-warm',
      icon: '📚',
    },
    {
      title: '社区分享',
      description: '与其他家长分享育儿故事',
      to: '/community',
      detail: '逛逛其他家长的灵感，带回喜欢的故事',
      accent: 'fairy-chip-rose',
      icon: '🌟',
    },
  ]

  const highlights = [
    '结合孩子画像和成长主题生成专属故事',
    '支持插画风格、教育目标与社区分享',
    '适合手机端随时创作和翻阅',
  ]

  return (
    <div className="fairy-shell fairy-stack">
      <section className="fairy-hero grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <span className="fairy-kicker">轻童话绘本风</span>
          <div className="space-y-4">
            <h1 className="fairy-title">把今天的小情绪，编成今晚的睡前童话</h1>
            <p className="fairy-subtitle max-w-2xl">
              结合孩子画像、故事风格和柔和插画，让每一个夜晚都能拥有一篇真正属于孩子的成长故事。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-primary" to="/create-story">
              开始编故事
            </Link>
            <Link className="btn-outline" to="/stories">
              浏览故事库
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div className="fairy-surface-muted text-sm leading-6 text-[#7d6d64]" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="fairy-panel relative overflow-hidden p-6">
          <div className="absolute right-4 top-4">
            <span className="fairy-chip-warm">睡前灵感站</span>
          </div>
          <div className="grid min-h-[20rem] gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] bg-[#fff4e7] p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#b7773a]">今晚适合</p>
              <h2 className="mt-2 text-2xl font-bold text-[#6d4c41]">勇敢刷牙的小月亮</h2>
              <p className="mt-3 text-sm leading-6 text-[#7d6d64]">
                用温暖冒险和小成就感，帮助孩子把生活练习变成愿意再次尝试的故事。
              </p>
            </div>
            <div className="rounded-[28px] bg-[#f4ebff] p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#7b57c8]">插画氛围</p>
              <div className="mt-4 flex h-full items-center justify-center rounded-[24px] bg-white/60 text-7xl">
                🌙
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="fairy-section-title">今晚想从哪里开始</h2>
          <p className="fairy-subtitle">把常用入口做成像绘本目录一样清晰，方便你快速进入今天的故事旅程。</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              className="fairy-book-card block p-6 hover:text-inherit focus:outline-none focus:ring-2 focus:ring-[#d9c3ff]"
              key={action.to}
              to={action.to}
            >
              <div className="flex items-start justify-between gap-4">
                <span className={`${action.accent} h-12 w-12 justify-center text-lg`}>{action.icon}</span>
                <span className="text-sm text-[#b68a63]">进入</span>
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#6d4c41]">{action.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#7d6d64]">{action.description}</p>
              <p className="mt-4 text-sm leading-6 text-[#9b867a]">{action.detail}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="fairy-panel p-6 sm:p-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="fairy-kicker">专属陪伴</p>
            <h2 className="mt-3 text-2xl font-bold text-[#6d4c41]">把功能变成一场晚安仪式</h2>
          </div>
          <div className="text-sm leading-7 text-[#7d6d64]">
            从生成故事、管理故事到探索社区灵感，每一个步骤都围绕“更轻松地陪伴孩子成长”来设计。
          </div>
          <div className="text-sm leading-7 text-[#7d6d64]">
            保留熟悉的操作路径，同时用更柔和的背景、卡片和动效，把产品氛围统一成一座温暖的绘本小馆。
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
