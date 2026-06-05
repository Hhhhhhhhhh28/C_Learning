import express from 'express'
import { query } from '../db.js'
import { auth } from '../middleware/auth.js'
import { ok, fail } from '../utils/response.js'
import { sendAIChat } from '../services/aiService.js'

const router = express.Router()

router.post('/chat', auth, async (req, res) => {
  try {
    const { message, context = {} } = req.body || {}

    if (!message || typeof message !== 'string' || !message.trim()) {
      return fail(res, '消息不能为空', 40000)
    }

    const result = await sendAIChat({
      message: message.trim(),
      context,
    })
    const reply = typeof result === 'string' ? result : result.reply

    ok(res, {
      success: true,
      reply,
      notice: typeof result === 'string' ? '' : result.notice,
      model: typeof result === 'string' ? undefined : result.model,
    })
  } catch (error) {
    console.error('AI chat route failed:', error.message)
    fail(res, error.message || 'AI服务暂时不可用')
  }
})

// 获取学习路径推荐
router.get('/learning-paths', auth, async (req, res) => {
  try {
    const rows = await query(
      `SELECT lp.id, lp.path_name, lp.description, lp.difficulty, lp.recommended_for, 
              slp.progress, slp.status
       FROM learning_paths lp
       LEFT JOIN student_learning_paths slp ON lp.id = slp.path_id AND slp.student_id = ?
       ORDER BY lp.difficulty`,
      [req.user.id]
    )
    ok(res, rows)
  } catch (error) {
    fail(res, error.message)
  }
})

// 获取学习路径详情
router.get('/learning-paths/:id', auth, async (req, res) => {
  try {
    const pathId = req.params.id
    
    // 获取路径信息
    const path = await query('SELECT * FROM learning_paths WHERE id = ? LIMIT 1', [pathId])
    if (!path.length) {
      return fail(res, '学习路径不存在', 40000)
    }
    
    // 获取路径包含的知识点
    const knowledgePoints = await query(
      `SELECT kp.id, kp.know_name, kp.description, kp.difficulty, 
              sp.status as study_status
       FROM path_knowledge_points pkp
       JOIN knowledge_points kp ON pkp.knowledge_point_id = kp.id
       LEFT JOIN student_knowledge_progress sp ON kp.id = sp.knowledge_point_id AND sp.student_id = ?
       WHERE pkp.path_id = ?
       ORDER BY pkp.order_number`,
      [req.user.id, pathId]
    )
    
    // 获取用户学习进度
    const progress = await query(
      `SELECT progress, status FROM student_learning_paths WHERE student_id = ? AND path_id = ? LIMIT 1`,
      [req.user.id, pathId]
    )
    
    ok(res, {
      path: path[0],
      knowledgePoints,
      progress: progress.length ? progress[0] : { progress: 0, status: 0 }
    })
  } catch (error) {
    fail(res, error.message)
  }
})

// 开始学习路径
router.post('/learning-paths/:id/start', auth, async (req, res) => {
  try {
    const pathId = req.params.id
    
    // 检查路径是否存在
    const path = await query('SELECT * FROM learning_paths WHERE id = ? LIMIT 1', [pathId])
    if (!path.length) {
      return fail(res, '学习路径不存在', 40000)
    }
    
    // 检查是否已开始
    const existingPath = await query(
      'SELECT * FROM student_learning_paths WHERE student_id = ? AND path_id = ? LIMIT 1',
      [req.user.id, pathId]
    )
    
    if (existingPath.length) {
      return fail(res, '已开始此学习路径', 40000)
    }
    
    // 创建学习路径记录
    await query(
      'INSERT INTO student_learning_paths (student_id, path_id, progress, status) VALUES (?, ?, 0, 0)',
      [req.user.id, pathId]
    )
    
    ok(res, { status: 'started' })
  } catch (error) {
    fail(res, error.message)
  }
})

// 获取学习建议
router.get('/suggestions', auth, async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, knowledge_point_id, suggestion, type, is_read, created_at
       FROM learning_suggestions
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    )
    ok(res, rows)
  } catch (error) {
    fail(res, error.message)
  }
})

// 标记建议为已读
router.put('/suggestions/:id/read', auth, async (req, res) => {
  try {
    const suggestionId = req.params.id
    
    const result = await query(
      'UPDATE learning_suggestions SET is_read = 1 WHERE id = ? AND student_id = ?',
      [suggestionId, req.user.id]
    )
    
    if (result.affectedRows === 0) {
      return fail(res, '建议不存在', 40000)
    }
    
    ok(res, { status: 'read' })
  } catch (error) {
    fail(res, error.message)
  }
})

// 获取难度调整记录
router.get('/difficulty-adjustments', auth, async (req, res) => {
  try {
    const rows = await query(
      `SELECT da.id, da.knowledge_point_id, kp.know_name, 
              da.old_difficulty, da.new_difficulty, da.reason, da.created_at
       FROM difficulty_adjustments da
       JOIN knowledge_points kp ON da.knowledge_point_id = kp.id
       WHERE da.student_id = ?
       ORDER BY da.created_at DESC`,
      [req.user.id]
    )
    ok(res, rows)
  } catch (error) {
    fail(res, error.message)
  }
})

export default router
