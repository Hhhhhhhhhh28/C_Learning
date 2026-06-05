import express from 'express'
import { query } from '../db.js'
import { auth } from '../middleware/auth.js'
import { ok, fail } from '../utils/response.js'

const router = express.Router()

const getLevelInfo = totalPoints => {
  if (totalPoints >= 600) {
    return { currentLevel: '专家级', nextLevel: null, nextLevelPoints: 600, progress: 100, pointsToNext: 0 }
  }
  if (totalPoints >= 300) {
    return {
      currentLevel: '进阶级',
      nextLevel: '专家级',
      nextLevelPoints: 600,
      progress: Math.round(((totalPoints - 300) / 300) * 100),
      pointsToNext: 600 - totalPoints,
    }
  }
  if (totalPoints >= 100) {
    return {
      currentLevel: '基础级',
      nextLevel: '进阶级',
      nextLevelPoints: 300,
      progress: Math.round(((totalPoints - 100) / 200) * 100),
      pointsToNext: 300 - totalPoints,
    }
  }
  return {
    currentLevel: '入门级',
    nextLevel: '基础级',
    nextLevelPoints: 100,
    progress: totalPoints,
    pointsToNext: 100 - totalPoints,
  }
}

const getStudentTotalPoints = async studentId => {
  const rows = await query(
    'SELECT COALESCE(SUM(points), 0) AS total_points FROM student_points WHERE student_id = ?',
    [studentId]
  )
  return Number(rows[0]?.total_points || 0)
}

// 获取用户等级信息
router.get('/levels', auth, async (req, res) => {
  try {
    const totalPoints = await getStudentTotalPoints(req.user.id)
    const rows = await query(
      `SELECT l.id, l.level_name, l.level_number, l.required_points, l.required_tasks, l.description,
              sl.status, sl.completed_at
       FROM levels l
       LEFT JOIN student_levels sl ON l.id = sl.level_id AND sl.student_id = ?
       ORDER BY l.level_number`,
      [req.user.id]
    )
    ok(
      res,
      rows.map(row => ({
        ...row,
        status: totalPoints >= row.required_points ? 1 : 0,
        total_points: totalPoints,
      }))
    )
  } catch (error) {
    fail(res, error.message)
  }
})

// 获取用户任务列表
router.get('/tasks', auth, async (req, res) => {
  try {
    const rows = await query(
      `SELECT t.id, t.task_name, t.task_type, t.points_reward, t.description, t.expires_at, 
              st.status, st.completed_at
       FROM tasks t
       LEFT JOIN student_tasks st ON t.id = st.task_id AND st.student_id = ?
       WHERE t.is_active = 1 AND (t.expires_at IS NULL OR t.expires_at > NOW())
       ORDER BY t.task_type, t.created_at`,
      [req.user.id]
    )
    ok(res, rows)
  } catch (error) {
    fail(res, error.message)
  }
})

// 完成任务
router.post('/tasks/:id/complete', auth, async (req, res) => {
  try {
    const taskId = req.params.id
    
    // 检查任务是否存在
    const task = await query('SELECT * FROM tasks WHERE id = ? LIMIT 1', [taskId])
    if (!task.length) {
      return fail(res, '任务不存在', 40000)
    }
    
    // 检查任务是否已完成
    const existingTask = await query(
      'SELECT * FROM student_tasks WHERE student_id = ? AND task_id = ? LIMIT 1',
      [req.user.id, taskId]
    )
    
    if (existingTask.length && existingTask[0].status === 1) {
      return fail(res, '任务已完成', 40000)
    }
    
    // 更新或创建任务状态
    if (existingTask.length) {
      await query(
        'UPDATE student_tasks SET status = 1, completed_at = NOW() WHERE id = ?',
        [existingTask[0].id]
      )
    } else {
      await query(
        'INSERT INTO student_tasks (student_id, task_id, status, completed_at) VALUES (?, ?, 1, NOW())',
        [req.user.id, taskId]
      )
    }

    // 增加积分
    await query(
      'INSERT INTO student_points (student_id, points, source, source_id) VALUES (?, ?, ?, ?)',
      [req.user.id, task[0].points_reward, 'task', taskId]
    )

    ok(res, { points: task[0].points_reward })
  } catch (error) {
    fail(res, error.message)
  }
})

// 获取用户积分历史
router.get('/points', auth, async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, points, source, source_id, created_at
       FROM student_points
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    )

    // 计算总积分
    const totalPoints = rows.reduce((sum, item) => sum + item.points, 0)
    const todayRows = await query(
      `SELECT COALESCE(SUM(points), 0) AS points
       FROM student_points
       WHERE student_id = ? AND DATE(created_at) = CURDATE()`,
      [req.user.id]
    )
    const weekRows = await query(
      `SELECT COALESCE(SUM(points), 0) AS points
       FROM student_points
       WHERE student_id = ? AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)`,
      [req.user.id]
    )
    const levelInfo = getLevelInfo(totalPoints)

    ok(res, {
      points: rows,
      totalPoints,
      todayPoints: Number(todayRows[0]?.points || 0),
      weekPoints: Number(weekRows[0]?.points || 0),
      ...levelInfo,
    })
  } catch (error) {
    fail(res, error.message)
  }
})

// 获取排行榜
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const rows = await query(
      `SELECT s.id, s.student_id, s.name, s.class_name,
              COALESCE(SUM(sp.points), 0) as total_points
       FROM students s
       LEFT JOIN student_points sp ON s.id = sp.student_id
       GROUP BY s.id
       ORDER BY total_points DESC
       LIMIT 10`,
      []
    )
    ok(
      res,
      rows.map(row => ({
        ...row,
        total_points: Number(row.total_points || 0),
        level: getLevelInfo(Number(row.total_points || 0)).currentLevel,
        isCurrent: row.id === req.user.id,
      }))
    )
  } catch (error) {
    fail(res, error.message)
  }
})

export default router
