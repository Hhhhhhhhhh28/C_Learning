// AI智能辅助模块API
import service from '../utils/request'

/**
 * 获取学习路径推荐
 * @returns {Promise}
 */
export const apiGetLearningPaths = () => service.get('/api/ai/learning-paths')

/**
 * 获取学习路径详情
 * @param {number} pathId - 路径ID
 * @returns {Promise}
 */
export const apiGetLearningPathDetail = (pathId) => service.get(`/api/ai/learning-paths/${pathId}`)

/**
 * 开始学习路径
 * @param {number} pathId - 路径ID
 * @returns {Promise}
 */
export const apiStartLearningPath = (pathId) => service.post(`/api/ai/learning-paths/${pathId}/start`)

/**
 * 获取学习建议
 * @returns {Promise}
 */
export const apiGetSuggestions = () => service.get('/api/ai/suggestions')

/**
 * 标记建议为已读
 * @param {number} suggestionId - 建议ID
 * @returns {Promise}
 */
export const apiMarkSuggestionAsRead = (suggestionId) => service.put(`/api/ai/suggestions/${suggestionId}/read`)

/**
 * 获取难度调整记录
 * @returns {Promise}
 */
export const apiGetDifficultyAdjustments = () => service.get('/api/ai/difficulty-adjustments')

/**
 * AI 对话
 * @param {{ message: string, context?: object }} data
 * @returns {Promise}
 */
export const apiPostAIChat = data => service.post('/api/ai/chat', data)
