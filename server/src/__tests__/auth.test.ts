import { vi } from 'vitest'
import request from 'supertest'

vi.mock('../utils/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    tokenRecord: {
      create: vi.fn(),
    },
  },
  prisma: {},
}))

import app from '../index'

describe('认证接口参数校验', () => {
  it('注册缺少字段时返回 400', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: '',
      password: '',
      name: '',
    })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
  })

  it('登录缺少字段时返回 400', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: '',
      password: '',
    })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
  })
})
