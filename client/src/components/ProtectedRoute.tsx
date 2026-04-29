import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

/**
 * 路由守卫组件 - 保护需要登录才能访问的路由
 * 检查用户是否持有有效 token，未登录则重定向到 /login
 * 已登录则通过 Outlet 渲染子路由组件
 */
const ProtectedRoute = () => {
  /** 从认证 store 获取当前 token */
  const token = useAuthStore((state) => state.token)

  // 未登录：重定向到登录页
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // 已登录：渲染子路由
  return <Outlet />
}

export default ProtectedRoute
