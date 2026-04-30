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
  const [isPurchasing, setIsPurchasing] = useState(false)

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
    <div className="fairy-shell fairy-stack max-w-5xl">
      <section className="fairy-hero space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <span className="fairy-kicker">账户与资产小屋</span>
            <h1 className="fairy-title text-3xl md:text-4xl">个人中心</h1>
            <p className="fairy-subtitle max-w-2xl">查看账号资料、剩余 Token 和最近的消费收益记录。</p>
          </div>
          <button className="btn-outline" onClick={logout} type="button">
            退出登录
          </button>
        </div>
      </section>

      {error ? <div className="fairy-message-error">{error}</div> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="fairy-panel space-y-5 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f4ebff] text-2xl text-[#7b57c8]">
              👤
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#6d4c41]">{profile?.name ?? '家长用户'}</h2>
              <p className="text-sm text-[#8f7d72]">{profile?.email ?? '暂无邮箱信息'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="fairy-surface-muted">
              <p className="text-sm text-[#8f7d72]">剩余代币</p>
              <p className="mt-2 text-3xl font-bold text-[#6d4c41]">{profile?.tokens ?? 0}</p>
            </div>
            <div className="fairy-surface-muted">
              <p className="text-sm text-[#8f7d72]">加入时间</p>
              <p className="mt-2 text-base font-semibold text-[#7b57c8]">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('zh-CN') : '未知'}
              </p>
            </div>
          </div>

          <div className="fairy-surface-muted space-y-3">
            <div>
              <p className="font-semibold text-[#6d4c41]">模拟充值 Token</p>
              <p className="mt-1 text-sm text-[#7d6d64]">先用一小笔充值验证你的账户与故事消费链路是否正常。</p>
            </div>
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
                disabled={isPurchasing}
                onClick={() =>
                  void handlePurchase(
                    purchaseAmount,
                    setProfile,
                    setRecords,
                    setError,
                    setIsPurchasing
                  )
                }
                type="button"
              >
                {isPurchasing ? '充值中...' : '立即充值'}
              </button>
            </div>
          </div>
        </section>

        <section className="fairy-panel p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="fairy-section-title">最近 Token 流水</h2>
              <p className="fairy-subtitle mt-2">像账本一样查看最近的收益、消费和充值记录。</p>
            </div>
            {isLoading ? <span className="text-sm text-[#9a887d]">加载中...</span> : null}
          </div>
          {records.length === 0 ? (
            <div className="fairy-empty">暂无 Token 记录。</div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <article className="fairy-ledger-row" key={record.id}>
                  <div>
                    <p className="font-medium text-[#6d4c41]">{record.description}</p>
                    <p className="mt-1 text-xs text-[#8f7d72]">
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
  setError: React.Dispatch<React.SetStateAction<string>>,
  setIsPurchasing: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> {
  try {
    setIsPurchasing(true)
    setError('')
    await tokenService.purchase(amount)
    const [user, tokenRecords] = await Promise.all([authService.getProfile(), tokenService.getRecords()])
    setProfile(user)
    setRecords(tokenRecords.slice(0, 8))
    localStorage.setItem('user', JSON.stringify(user))
  } catch (err) {
    const message = err instanceof Error ? err.message : '充值失败'
    setError(message)
  } finally {
    setIsPurchasing(false)
  }
}

export default ProfilePage
