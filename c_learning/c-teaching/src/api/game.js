// 游戏化学习模块API
import service from '../utils/request'

/**
 * 获取用户等级信息
 * @returns {Promise}
 */
export const apiGetLevels = () => service.get('/api/game/levels')

/**
 * 获取用户任务列表
 * @returns {Promise}
 */
export const apiGetTasks = () => service.get('/api/game/tasks')

/**
 * 完成任务
 * @param {number} taskId - 任务ID
 * @returns {Promise}
 */
export const apiCompleteTask = (taskId) => service.post(`/api/game/tasks/${taskId}/complete`)

/**
 * 获取用户积分历史
 * @returns {Promise}
 */
export const apiGetPoints = () => service.get('/api/game/points')

/**
 * 获取排行榜
 * @returns {Promise}
 */
export const apiGetLeaderboard = () => service.get('/api/game/leaderboard')