import express from 'express'
import { auth } from '../middleware/auth.js'
import { query } from '../db.js'
import { ok, fail } from '../utils/response.js'

const router = express.Router()

router.get('/allNotebook', auth, async (req, res) => {
  try {
    const notebooks = await query(
      `SELECT id, context, create_time AS createTime, is_star AS isStar, is_delete AS orDelete
       FROM notebooks
       WHERE student_id = ?
       ORDER BY create_time DESC`,
      [req.user.id],
    )
    const noteCountRows = await query(
      'SELECT COUNT(1) AS count FROM notebooks WHERE student_id = ?',
      [req.user.id],
    )
    const starCountRows = await query(
      'SELECT COUNT(1) AS count FROM notebooks WHERE student_id = ? AND is_star = 1 AND is_delete = 0',
      [req.user.id],
    )
    const deleteCountRows = await query(
      'SELECT COUNT(1) AS count FROM notebooks WHERE student_id = ? AND is_delete = 1',
      [req.user.id],
    )

    ok(res, {
      notebooks,
      noteCount: noteCountRows[0]?.count || 0,
      starCount: starCountRows[0]?.count || 0,
      deleteCount: deleteCountRows[0]?.count || 0,
    })
  } catch (error) {
    fail(res, error.message)
  }
})

router.get('/searchNotebook', auth, async (req, res) => {
  try {
    const keyword = req.query.keyword || ''
    const rows = await query(
      `SELECT id, context, create_time AS createTime, is_star AS isStar, is_delete AS orDelete
       FROM notebooks
       WHERE student_id = ? AND context LIKE ?
       ORDER BY create_time DESC`,
      [req.user.id, `%${keyword}%`],
    )
    ok(res, rows)
  } catch (error) {
    fail(res, error.message)
  }
})

router.post('/addNotebook', auth, async (req, res) => {
  try {
    const { context, isStar = 0 } = req.body || {}
    await query(
      'INSERT INTO notebooks (student_id, context, is_star, is_delete) VALUES (?, ?, ?, 0)',
      [req.user.id, context || '', isStar ? 1 : 0],
    )
    ok(res, true)
  } catch (error) {
    fail(res, error.message)
  }
})

router.put('/updateNotebook', auth, async (req, res) => {
  try {
    const { id, context, isStar, isDelete } = req.body || {}
    await query(
      `UPDATE notebooks
       SET context = COALESCE(?, context),
           is_star = COALESCE(?, is_star),
           is_delete = COALESCE(?, is_delete),
           update_time = NOW()
       WHERE id = ? AND student_id = ?`,
      [context ?? null, isStar ?? null, isDelete ?? null, id, req.user.id],
    )
    ok(res, true)
  } catch (error) {
    fail(res, error.message)
  }
})

router.post('/deleteNotebook', auth, async (req, res) => {
  try {
    const ids = Array.isArray(req.body) ? req.body : []
    if (!ids.length) {
      return ok(res, true)
    }
    const placeholders = ids.map(() => '?').join(',')
    await query(
      `DELETE FROM notebooks WHERE student_id = ? AND id IN (${placeholders})`,
      [req.user.id, ...ids],
    )
    ok(res, true)
  } catch (error) {
    fail(res, error.message)
  }
})

export default router
