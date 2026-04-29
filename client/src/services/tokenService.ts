import api from './api'
import type { ApiResponse, TokenRecord, TokenSummary } from '../types'

/**
 * Token 服务 - 查询余额、流水与模拟充值
 */
const tokenService = {
  /**
   * 获取 Token 概览
   */
  async getSummary(): Promise<TokenSummary> {
    const response = await api.get<ApiResponse<TokenSummary>>('/tokens/summary')
    return response.data.data
  },

  /**
   * 获取全部 Token 流水
   */
  async getRecords(): Promise<TokenRecord[]> {
    const response = await api.get<ApiResponse<TokenRecord[]>>('/tokens/records')
    return response.data.data
  },

  /**
   * 模拟充值 Token
   * @param amount - 充值数量
   */
  async purchase(amount: number): Promise<number> {
    const response = await api.post<ApiResponse<{ balance: number }>>('/tokens/purchase', { amount })
    return response.data.data.balance
  },
}

export default tokenService
