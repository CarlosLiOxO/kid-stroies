import { useEffect, useState } from 'react'
import authService from '../services/authService'
import tokenService from '../services/tokenService'
import { useAuthStore } from '../stores/authStore'
import type { TokenRecord, User } from '../types'

/**
 * 个人中心页 - 用户个人信息管理
 * 展示最新账号信息和 Token 流水
 */
const ProfilePage = () => {
  const storedUser = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const [profile, setProfile] = useState<User | null>(storedUser)
  const [records, setRecords] = useState<TokenRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [purchaseAmount, setPurchaseAmount] = useState(50)

  useEffect(() => {
    /**
     * 拉取个人信息和 Token 流水
     */
    const loadProfile = async () => {
      setIsLoading(true)
      setError('')
      try {
        const [user, tokenRecords] = await Promise.all([authService.getProfile(), tokenService.getRecords()])
        setProfile(user)
        setRecords(tokenRecords.slice(0, 8))
        localStorage.setItem('user', JSON.stringify(user))
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取个人信息失败'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()
  }, [])

  return (
    <div className="page-container max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="page-title mb-2">个人中心</h1>
          <p className="text-amber-700">查看账号资料、剩余 Token 和最近的消费收益记录。</p>
        </div>
        <button className="btn-outline" onClick={logout} type="button">
          退出登录
        </button>
      </div>

      {error ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="story-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-200">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-purple-700">{profile?.name ?? '家长用户'}</h2>
              <p className="text-gray-500">{profile?.email ?? '暂无邮箱信息'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 border-t border-amber-100 pt-4 md:grid-cols-2">
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-sm text-gray-500">剩余代币</p>
              <p className="mt-2 text-3xl font-bold text-amber-500">{profile?.tokens ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-purple-50 p-4">
              <p className="text-sm text-gray-500">加入时间</p>
              <p className="mt-2 text-base font-semibold text-purple-700">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('zh-CN') : '未知'}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-100 p-4">
            <p className="mb-3 font-semibold text-amber-800">模拟充值 Token</p>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                className="input-field"
                min={10}
                onChange={(event) => setPurchaseAmount(Number(event.target.value))}
                type="number"
                value={purchaseAmount}
              />
              <button
                className="btn-primary"
                onClick={() => void handlePurchase(purchaseAmount, setProfile, setRecords, setError)}
                type="button"
              >
                立即充值
              </button>
            </div>
          </div>
        </section>

        <section className="story-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-purple-700">最近 Token 流水</h2>
            {isLoading ? <span className="text-sm text-gray-400">加载中...</span> : null}
          </div>
          {records.length === 0 ? (
            <div className="rounded-2xl bg-amber-50 p-6 text-sm text-gray-500">暂无 Token 记录。</div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <article className="flex items-center justify-between rounded-2xl border border-amber-100 p-4" key={record.id}>
                  <div>
                    <p className="font-medium text-amber-800">{record.description}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(record.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${record.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                  >
                    {record.amount >= 0 ? `+${record.amount}` : record.amount}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

/**
 * 处理 Token 模拟充值
 */
async function handlePurchase(
  amount: number,
  setProfile: React.Dispatch<React.SetStateAction<User | null>>,
  setRecords: React.Dispatch<React.SetStateAction<TokenRecord[]>>,
  setError: React.Dispatch<React.SetStateAction<string>>
): Promise<void> {
  try {
    setError('')
    await tokenService.purchase(amount)
    const [user, tokenRecords] = await Promise.all([authService.getProfile(), tokenService.getRecords()])
    setProfile(user)
    setRecords(tokenRecords.slice(0, 8))
    localStorage.setItem('user', JSON.stringify(user))
  } catch (err) {
    const message = err instanceof Error ? err.message : '充值失败'
    setError(message)
  }
}

export default ProfilePage
