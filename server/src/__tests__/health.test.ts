import { vi } from 'vitest'
import request from 'supertest'

vi.mock('../utils/prisma', () => ({
  default: {},
  prisma: {},
}))

import app from '../index'

describe('健康检查接口', () => {
  it('返回服务运行状态', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe('服务器运行正常')
    expect(response.body.timestamp).toBeTypeOf('string')
  })
})
