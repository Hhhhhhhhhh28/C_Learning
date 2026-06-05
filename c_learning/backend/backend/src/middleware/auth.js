import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { fail } from '../utils/response.js'

export const auth = (req, res, next) => {
  const token = req.headers.token || req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return fail(res, '未登录或登录已过期', 40100)
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret)
    req.user = payload
    next()
  } catch (_error) {
    return fail(res, '登录状态已失效，请重新登录', 40100)
  }
}
